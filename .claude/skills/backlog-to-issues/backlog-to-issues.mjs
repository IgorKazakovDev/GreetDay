#!/usr/bin/env node
// Parse docs/product/mvp-backlog.md (see format.md) and create GitHub labels, milestones,
// epic issues and story sub-issues with the gh CLI.
//   node backlog-to-issues.mjs [backlog.md] [--apply] [--repo owner/name]
// Dry run by default. Idempotent: skips issues whose title starts with the same [ID].
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const repoArg = args.includes('--repo') ? args[args.indexOf('--repo') + 1] : undefined;
const file =
  args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--repo') ??
  'docs/product/mvp-backlog.md';

const LABEL_COLORS = { 'type:': '1d76db', 'area:': '0e8a16', 'priority:': 'b60205' };

export function parseBacklog(markdown) {
  const warnings = [];
  const milestones = [];
  const ids = new Set();
  let milestone = null;
  let epic = null;
  let current = null; // item collecting body lines
  let ignoring = false;

  const lines = markdown.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const idMatch = heading[2].match(/^([A-Za-z][\w.-]*):\s+(.+)$/);
      if (level === 2) {
        epic = null;
        current = null;
        if (!idMatch) {
          milestone = null;
          ignoring = true;
          continue;
        }
        ignoring = false;
        milestone = {
          id: idMatch[1],
          title: `${idMatch[1]}: ${idMatch[2].trim()}`,
          description: [],
          epics: [],
        };
        milestones.push(milestone);
        current = milestone;
        continue;
      }
      if (ignoring) continue;
      if (!idMatch) {
        warnings.push(`line ${i + 1}: heading without "ID: title" → treated as body text`);
        current?.body?.push(line);
        continue;
      }
      const [, id, title] = idMatch;
      if (ids.has(id)) warnings.push(`line ${i + 1}: duplicate ID ${id}`);
      ids.add(id);
      const labelsLine = lines[i + 1]?.match(/^Labels:\s*(.*)$/i);
      const labels = labelsLine
        ? labelsLine[1]
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean)
        : [];
      if (labelsLine) i++;
      if (level === 3) {
        if (!milestone) {
          warnings.push(`line ${i + 1}: epic ${id} is not under a milestone`);
          continue;
        }
        epic = { id, title: title.trim(), labels, body: [], stories: [] };
        milestone.epics.push(epic);
        current = epic;
      } else {
        if (!epic) {
          warnings.push(`line ${i + 1}: story ${id} is not under an epic`);
          continue;
        }
        if (!id.startsWith(`${epic.id}.`))
          warnings.push(`line ${i + 1}: story ${id} doesn't start with its epic ID ${epic.id}.`);
        current = { id, title: title.trim(), labels, body: [] };
        epic.stories.push(current);
      }
      continue;
    }
    if (ignoring || !current) continue;
    (current.body ?? current.description).push(line);
  }

  const trim = (arr) => arr.join('\n').trim();
  for (const m of milestones) {
    m.description = trim(m.description);
    for (const e of m.epics) {
      e.body = trim(e.body);
      for (const s of e.stories) s.body = trim(s.body);
    }
  }
  return { milestones, warnings };
}

function gh(argv, input) {
  return execFileSync('gh', argv, {
    encoding: 'utf8',
    input,
    stdio: [input ? 'pipe' : 'ignore', 'pipe', 'inherit'],
  }).trim();
}

function plan(backlog) {
  const labels = new Set();
  const issues = [];
  for (const m of backlog.milestones) {
    for (const e of m.epics) {
      e.labels.forEach((l) => labels.add(l));
      issues.push({
        kind: 'epic',
        id: e.id,
        title: `[${e.id}] ${e.title}`,
        labels: e.labels,
        milestone: m.title,
        body: e.body,
      });
      for (const s of e.stories) {
        s.labels.forEach((l) => labels.add(l));
        issues.push({
          kind: 'story',
          id: s.id,
          parent: e.id,
          title: `[${s.id}] ${s.title}`,
          labels: s.labels,
          milestone: m.title,
          body: s.body,
        });
      }
    }
  }
  return {
    labels: [...labels].sort(),
    milestones: backlog.milestones.map((m) => ({ title: m.title, description: m.description })),
    issues,
  };
}

function main() {
  const backlog = parseBacklog(readFileSync(file, 'utf8'));
  const p = plan(backlog);

  let repo = repoArg;
  let existingIssues = new Map();
  let existingMilestones = new Set();
  const ghAvailable = (() => {
    try {
      execFileSync('gh', ['--version'], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  })();
  if (ghAvailable) {
    try {
      repo ??= gh(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
      const list = JSON.parse(
        gh([
          'issue',
          'list',
          '--repo',
          repo,
          '--state',
          'all',
          '--limit',
          '1000',
          '--json',
          'number,title',
        ]),
      );
      for (const it of list) {
        const m = it.title.match(/^\[([^\]]+)\]/);
        if (m) existingIssues.set(m[1], it.number);
      }
      const ms = JSON.parse(gh(['api', `repos/${repo}/milestones?state=all&per_page=100`]));
      existingMilestones = new Set(ms.map((m) => m.title));
    } catch (err) {
      if (apply) throw err;
      console.warn('(could not read existing issues from GitHub; dry run assumes nothing exists)');
    }
  } else if (apply) {
    console.error('gh CLI not found. Install it and run `gh auth login` first.');
    process.exit(1);
  }

  console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${file}${repo ? ` → ${repo}` : ''}\n`);
  if (backlog.warnings.length) {
    console.log('Warnings:');
    backlog.warnings.forEach((w) => console.log(`  ! ${w}`));
    console.log('');
  }
  console.log(`Labels (${p.labels.length}, upserted): ${p.labels.join(', ') || '-'}`);
  console.log(`Milestones (${p.milestones.length}):`);
  for (const m of p.milestones)
    console.log(`  ${existingMilestones.has(m.title) ? '= exists ' : '+ create '} ${m.title}`);
  const toCreate = p.issues.filter((i) => !existingIssues.has(i.id));
  console.log(
    `Issues: ${p.issues.length} total, ${toCreate.length} to create, ${p.issues.length - toCreate.length} already exist`,
  );
  for (const i of p.issues) {
    const mark = existingIssues.has(i.id) ? `= #${existingIssues.get(i.id)}` : '+';
    console.log(
      `  ${mark.padEnd(6)} ${i.kind === 'story' ? '   ↳ ' : ''}${i.title}  [${i.labels.join(', ')}]  (${i.milestone})`,
    );
  }

  if (!apply) {
    console.log('\nNothing was created. Re-run with --apply to create the items marked "+".');
    return;
  }
  if (backlog.warnings.length) {
    console.error('\nFix the warnings above before applying.');
    process.exit(1);
  }

  for (const label of p.labels) {
    const color =
      Object.entries(LABEL_COLORS).find(([prefix]) => label.startsWith(prefix))?.[1] ?? 'ededed';
    gh(['label', 'create', label, '--repo', repo, '--color', color, '--force']);
  }
  for (const m of p.milestones) {
    if (existingMilestones.has(m.title)) continue;
    gh([
      'api',
      '-X',
      'POST',
      `repos/${repo}/milestones`,
      '-f',
      `title=${m.title}`,
      '-f',
      `description=${m.description}`,
    ]);
  }
  const numbers = new Map(existingIssues);
  for (const i of p.issues) {
    if (existingIssues.has(i.id)) continue;
    const argv = [
      'issue',
      'create',
      '--repo',
      repo,
      '--title',
      i.title,
      '--body-file',
      '-',
      '--milestone',
      i.milestone,
    ];
    i.labels.forEach((l) => argv.push('--label', l));
    const url = gh(argv, i.body || '_No description._');
    const number = Number(url.split('/').pop());
    numbers.set(i.id, number);
    console.log(`created #${number} ${i.title}`);
    if (i.kind === 'story') {
      const parent = numbers.get(i.parent);
      const subIssueId = gh(['api', `repos/${repo}/issues/${number}`, '--jq', '.id']);
      gh([
        'api',
        '-X',
        'POST',
        `repos/${repo}/issues/${parent}/sub_issues`,
        '-F',
        `sub_issue_id=${subIssueId}`,
      ]);
    }
  }
  console.log('\nDone.');
}

main();
