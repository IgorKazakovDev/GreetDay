#!/usr/bin/env node
// Turn docs/product/mvp-backlog.md (format: docs/product/ba-brief.md §9, parser rules: format.md)
// into GitHub labels, milestones, issues, sub-issue links and blocked-by links with the gh CLI.
//   node backlog-to-issues.mjs [backlog.md] [--apply] [--repo owner/name] [--project <number>]
// Dry run by default. Idempotent: an issue whose title starts with the same [ID] is skipped, and
// existing issues are never edited, closed or deleted. Extras (issue types, Project fields) are
// skipped with a reason when the repo or token doesn't support them.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// ba-brief §7
export const MILESTONES = {
  M0: {
    title: 'M0 Design',
    description: 'Penpot tokens, components, every MVP screen and flow are designed and handed off.',
  },
  M1: { title: 'M1 Foundations', description: 'User can sign in and sees the empty tabbed app.' },
  M2: {
    title: 'M2 Core loop',
    description: 'User can add friends, see upcoming birthdays and send a greeting via Telegram.',
  },
  M3: {
    title: 'M3 Complete MVP',
    description: 'History, reminders, settings and account deletion work.',
  },
  M4: {
    title: 'M4 Release',
    description: 'App is deployed and installable through TestFlight / Play internal testing.',
  },
  M5: {
    title: 'M5 Public release',
    description: 'App is live on the App Store and Google Play.',
  },
};

// ba-brief §8: name → [color, description]
export const LABELS = {
  'type:epic': ['5319e7', 'Epic: groups stories'],
  'type:story': ['1d76db', 'User story (issue type: Feature)'],
  'type:task': ['0052cc', 'Technical task in one area, size M or smaller'],
  'type:spike': ['fbca04', 'Time-boxed investigation that ends in a written decision'],
  'area:mobile': ['0e8a16', 'apps/mobile'],
  'area:backend': ['0e8a16', 'apps/api'],
  'area:shared': ['0e8a16', 'libs/contracts, libs/domain'],
  'area:db': ['0e8a16', 'libs/db: schema, migrations, seed'],
  'area:infra': ['0e8a16', 'CI, Docker, hosting, release builds'],
  'area:design': ['0e8a16', 'Penpot, design tokens, shared components'],
  'priority:p0': ['b60205', 'MVP blocker'],
  'priority:p1': ['d93f0b', 'MVP should-have'],
  'priority:p2': ['fef2c0', 'Nice to have, can slip'],
};

const TYPES = {
  epic: { idPattern: /^E\d+$/, issueType: 'Epic', idHint: 'E<n>' },
  story: { idPattern: /^E\d+-S\d+$/, issueType: 'Feature', idHint: 'E<n>-S<m>' },
  task: { idPattern: /^E\d+-S\d+-T\d+$/, issueType: 'Task', idHint: 'E<n>-S<m>-T<k>' },
  spike: { idPattern: /^SP-\d+$/, issueType: 'Spike', idHint: 'SP-<n>' },
};
const ID = /^(?:E\d+(?:-S\d+(?:-T\d+)?)?|SP-\d+)$/;
const META_KEYS = {
  type: 'type',
  parent: 'parent',
  labels: 'labels',
  milestone: 'milestone',
  size: 'size',
  'blocked by': 'blockedBy',
};
const SIZES = ['XS', 'S', 'M', 'L'];
// Document-level sections around the issues (§9 items 1, 3–5). They end the issue above them;
// any other `##` heading inside an issue is part of its body (the §8 templates use `##`).
const DOC_SECTION =
  /^##\s+(?:\d+[.)]?\s*)?(?:summary|issues|(?:suggested\s+)?(?:dependency|build)\s+order|traceability|open\s+questions|already\s+in\s+place)\b/i;
const EMPTY_VALUE = /^(?:—|–|-|none|n\/a)?$/i;

const cleanValue = (v) => v.replace(/\s*\([^)]*\)\s*$/, '').trim(); // drop "(…)" comments
const list = (v) =>
  EMPTY_VALUE.test(cleanValue(v))
    ? []
    : cleanValue(v)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

export function parseBacklog(markdown) {
  const warnings = [];
  const issues = [];
  const lines = markdown.split(/\r?\n/);
  let current = null;
  let fence = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const n = i + 1;
    const fenceMark = line.match(/^\s*(```|~~~)/)?.[1];
    if (fenceMark) {
      if (!fence) fence = fenceMark;
      else if (fence === fenceMark) fence = null;
      if (current) addBodyLine(current, line);
      continue;
    }
    if (!fence && /^#{1,3}\s/.test(line)) {
      const bracketed = line.match(/^###\s+\[([^\]]*)\]\s*(.*?)\s*$/);
      if (bracketed) {
        const [, id, title] = bracketed;
        if (!ID.test(id)) {
          warnings.push(
            `line ${n}: "[${id}]" is not a valid ID (E<n>, E<n>-S<m>, E<n>-S<m>-T<k>, SP-<n>); section skipped`,
          );
          current = null;
          continue;
        }
        current = { id, title, line: n, meta: {}, body: [], inMeta: true };
        issues.push(current);
        continue;
      }
      if (/^###\s+(?:E\d+|SP-?\d+)\b/i.test(line)) {
        warnings.push(
          `line ${n}: looks like an issue but the ID isn't in [brackets]; section skipped`,
        );
        current = null;
        continue;
      }
      if (/^###\s/.test(line)) {
        if (current) {
          warnings.push(
            `line ${n}: "###" heading inside [${current.id}]; issue sections use "##" headings and "####" for anything deeper`,
          );
          addBodyLine(current, line);
        }
        continue;
      }
      if (/^#\s/.test(line) || DOC_SECTION.test(line)) {
        current = null;
        continue;
      }
      // other "##" headings: part of the current issue's body (or ignored outside issues)
    }
    if (!current) continue;
    if (current.inMeta && !fence) {
      if (line.trim() === '') continue;
      const bullet = line.match(/^[-*]\s+([A-Za-z][A-Za-z ]*?)\s*:\s*(.*)$/);
      const key = bullet && META_KEYS[bullet[1].toLowerCase()];
      if (key) {
        if (key in current.meta)
          warnings.push(`line ${n}: [${current.id}] has "${bullet[1]}" twice`);
        current.meta[key] = bullet[2];
        continue;
      }
      if (bullet) {
        warnings.push(
          `line ${n}: [${current.id}] unknown metadata "${bullet[1]}" (expected ${Object.keys(META_KEYS).join(', ')}); treated as body`,
        );
      }
      current.inMeta = false;
    }
    addBodyLine(current, line);
  }

  const byId = new Map();
  for (const issue of issues) {
    if (byId.has(issue.id))
      warnings.push(
        `line ${issue.line}: duplicate ID [${issue.id}] (first at line ${byId.get(issue.id).line})`,
      );
    else byId.set(issue.id, issue);
  }
  const result = issues.map((raw) => normalize(raw, byId, warnings));
  const lineOf = (w) => Number(w.match(/^line (\d+)/)[1]);
  warnings.sort((a, b) => lineOf(a) - lineOf(b));
  return { issues: result, warnings };
}

function addBodyLine(issue, line) {
  issue.inMeta = false;
  issue.body.push(line);
}

function normalize(raw, byId, warnings) {
  const at = `line ${raw.line}: [${raw.id}]`;
  const warn = (msg) => warnings.push(`${at} ${msg}`);
  const m = raw.meta;
  const issue = {
    id: raw.id,
    title: raw.title,
    line: raw.line,
    type: (m.type ?? '').trim().toLowerCase(),
    parent: m.parent === undefined ? null : (list(m.parent)[0] ?? null),
    labels: list(m.labels ?? ''),
    milestone: cleanValue(m.milestone ?? '').match(/^M\d+\b/)?.[0] ?? null,
    size: m.size === undefined || EMPTY_VALUE.test(cleanValue(m.size)) ? null : cleanValue(m.size),
    blockedBy: list(m.blockedBy ?? ''),
    body: raw.body.join('\n').trim(),
  };

  if (!issue.title) warn('has no title');
  if (!issue.body) warn('has an empty body (use the §8 template)');

  const type = TYPES[issue.type];
  if (!m.type) warn('is missing "- Type:"');
  else if (!type) warn(`has unknown Type "${m.type}" (epic, story, task, spike)`);
  else if (!type.idPattern.test(issue.id))
    warn(`is Type ${issue.type} but its ID doesn't look like ${type.idHint}`);

  if (!m.labels) warn('is missing "- Labels:"');
  for (const label of issue.labels)
    if (!LABELS[label])
      warn(`has unknown label "${label}"${label === 'area:api' ? ' (use area:backend)' : ''}`);
  const typeLabels = issue.labels.filter((l) => l.startsWith('type:'));
  if (type && (typeLabels.length !== 1 || typeLabels[0] !== `type:${issue.type}`))
    warn(`needs exactly one type label, type:${issue.type}`);
  if (issue.labels.filter((l) => l.startsWith('priority:')).length !== 1)
    warn('needs exactly one priority:p0|p1|p2 label');
  const areas = issue.labels.filter((l) => l.startsWith('area:')).length;
  if (issue.type === 'task' && areas !== 1) warn('is a task, so it needs exactly one area: label');
  else if (areas === 0) warn('needs at least one area: label');

  if (!m.milestone) warn('is missing "- Milestone:"');
  else if (!MILESTONES[issue.milestone])
    warn(`has unknown Milestone "${m.milestone}" (${Object.keys(MILESTONES).join(', ')})`);

  if (issue.type === 'task' || issue.type === 'spike') {
    if (!issue.size) warn(`is a ${issue.type}, so it needs Size XS, S or M`);
    else if (!['XS', 'S', 'M'].includes(issue.size))
      warn(`has Size "${issue.size}"; ${issue.type}s must be XS, S or M (split anything larger)`);
  } else if (issue.size && !SIZES.includes(issue.size)) {
    warn(`has Size "${issue.size}" (XS, S, M, L or —)`);
  }

  const expectedParent =
    issue.type === 'story'
      ? issue.id.replace(/-S\d+$/, '')
      : issue.type === 'task'
        ? issue.id.replace(/-T\d+$/, '')
        : null;
  if (issue.type === 'epic' && issue.parent) warn('is an epic and cannot have a Parent');
  if (expectedParent && issue.parent !== expectedParent)
    warn(`needs "- Parent: ${expectedParent}"${issue.parent ? ` (found ${issue.parent})` : ''}`);
  if (issue.parent && !byId.has(issue.parent))
    warn(`has Parent ${issue.parent}, which is not in the backlog`);
  if (issue.type === 'spike' && issue.parent && byId.has(issue.parent)) {
    const parentType = byId.get(issue.parent).meta.type?.trim().toLowerCase();
    if (parentType !== 'epic' && parentType !== 'story')
      warn('is a spike; its Parent must be an epic or a story');
  }

  for (const ref of issue.blockedBy) {
    if (ref === issue.id) warn('is blocked by itself');
    else if (!/^#\d+$/.test(ref) && !byId.has(ref))
      warn(`is blocked by "${ref}", which is not an ID in the backlog (or an existing #number)`);
  }
  return issue;
}

// ---------------------------------------------------------------------------------------------
// gh helpers. execFileSync with argument arrays: no shell, so titles and bodies are never parsed
// as shell syntax.

function gh(argv, input) {
  return execFileSync('gh', argv, {
    encoding: 'utf8',
    input,
    stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
  }).trim();
}

function tryGh(argv, input) {
  try {
    return { ok: true, out: gh(argv, input) };
  } catch (err) {
    const message = (err.stderr?.toString() || err.message).trim().split('\n')[0];
    return { ok: false, error: message };
  }
}

const jsonLines = (argv) =>
  gh(argv)
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));

function api(method, path, body) {
  const res = tryGh(['api', '-X', method, path, '--input', '-'], JSON.stringify(body));
  return res.ok ? { ok: true, data: res.out ? JSON.parse(res.out) : null } : res;
}

const notSupported = (error) => /HTTP 404|HTTP 410|Not Found/i.test(error);

function readGitHub(opts, issueTypesNeeded) {
  const repo =
    opts.repo ?? gh(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
  const owner = repo.split('/')[0];
  const state = {
    repo,
    owner,
    issues: new Map(), // backlog ID → { number, id, url }
    milestones: new Map(), // M1 → milestone number
    labels: new Set(),
    issueTypes: null, // Set of available type names, or null when skipped
    project: null,
    skipped: [],
  };

  for (const it of jsonLines([
    'api',
    '--paginate',
    `repos/${repo}/issues?state=all&per_page=100`,
    '--jq',
    '.[] | select(.pull_request == null) | {number, id, title, url: .html_url} | tojson',
  ])) {
    const id = it.title.match(/^\[([^\]]+)\]/)?.[1];
    if (id && !state.issues.has(id)) state.issues.set(id, it);
  }
  const milestones = jsonLines([
    'api',
    '--paginate',
    `repos/${repo}/milestones?state=all&per_page=100`,
    '--jq',
    '.[] | {number, title} | tojson',
  ]);
  for (const [id, def] of Object.entries(MILESTONES)) {
    const found =
      milestones.find((m) => m.title === def.title) ??
      milestones.find((m) => new RegExp(`^${id}\\b`).test(m.title));
    if (found) state.milestones.set(id, found.number);
  }
  gh(['api', '--paginate', `repos/${repo}/labels?per_page=100`, '--jq', '.[].name'])
    .split('\n')
    .filter(Boolean)
    .forEach((l) => state.labels.add(l));

  // Issue types exist only for organization-owned repos.
  const ownerType = gh(['api', `repos/${repo}`, '--jq', '.owner.type']);
  if (ownerType !== 'Organization') {
    state.skipped.push(
      `Issue types: ${owner} is a ${ownerType.toLowerCase()} account; GitHub issue types are only available to organizations (the type: labels still work)`,
    );
  } else {
    const res = tryGh(['api', `orgs/${owner}/issue-types`, '--jq', '.[].name']);
    if (!res.ok) {
      state.skipped.push(`Issue types: could not read ${owner}'s issue types (${res.error})`);
    } else {
      state.issueTypes = new Set(res.out.split('\n').filter(Boolean));
      const missing = issueTypesNeeded.filter((t) => !state.issueTypes.has(t));
      if (missing.length)
        state.skipped.push(
          `Issue types: ${owner} has no ${missing.join(', ')} type; those issues get only their type: label (add the type in the org settings before applying)`,
        );
    }
  }

  if (opts.project) state.project = readProject(opts.project, owner, state.skipped);
  return state;
}

const PROJECT_FIELDS = ['Status', 'Priority', 'Size', 'Area'];

function readProject(number, owner, skipped) {
  const view = tryGh(['project', 'view', number, '--owner', owner, '--format', 'json']);
  if (!view.ok) {
    skipped.push(
      `Project #${number}: could not open it for ${owner} (${view.error}). It needs the "project" scope: gh auth refresh -s project`,
    );
    return null;
  }
  const fields = JSON.parse(
    gh(['project', 'field-list', number, '--owner', owner, '--format', 'json', '--limit', '100']),
  ).fields;
  const items = JSON.parse(
    gh(['project', 'item-list', number, '--owner', owner, '--format', 'json', '--limit', '5000']),
  ).items;
  const project = {
    number,
    id: JSON.parse(view.out).id,
    title: JSON.parse(view.out).title,
    fields: new Map(),
    items: new Set(items.map((it) => it.content?.url).filter(Boolean)),
  };
  for (const name of PROJECT_FIELDS) {
    const field = fields.find((f) => f.name.toLowerCase() === name.toLowerCase());
    if (!field) skipped.push(`Project field ${name}: project #${number} has no such field`);
    else if (field.options || field.type === 'ProjectV2Field') project.fields.set(name, field);
    else
      skipped.push(
        `Project field ${name}: type ${field.type} is not supported (single select or text only)`,
      );
  }
  return project;
}

function projectValues(issue) {
  const priority = issue.labels.find((l) => l.startsWith('priority:'));
  const area = issue.labels.find((l) => l.startsWith('area:'));
  return {
    Status: 'Backlog',
    Priority: priority?.slice('priority:'.length).toUpperCase(),
    Size: issue.size ?? undefined,
    Area: area?.slice('area:'.length),
  };
}

// ---------------------------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { file: 'docs/product/mvp-backlog.md', apply: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--apply') opts.apply = true;
    else if (a === '--repo') opts.repo = argv[++i];
    else if (a === '--project') opts.project = argv[++i];
    else if (a.startsWith('--')) usage(`unknown option ${a}`);
    else opts.file = a;
  }
  if ('repo' in opts && !/^[\w.-]+\/[\w.-]+$/.test(opts.repo ?? ''))
    usage('--repo needs owner/name');
  if ('project' in opts && !/^\d+$/.test(opts.project ?? ''))
    usage('--project needs a project number (the N in github.com/users/<you>/projects/N)');
  return opts;
}

function usage(message) {
  console.error(
    `${message}\nUsage: node backlog-to-issues.mjs [backlog.md] [--apply] [--repo owner/name] [--project <number>]`,
  );
  process.exit(2);
}

function printTree(issues, describe) {
  const byId = new Map(issues.map((i) => [i.id, i]));
  const children = new Map();
  const roots = [];
  for (const issue of issues) {
    if (issue.parent && byId.has(issue.parent) && issue.parent !== issue.id) {
      if (!children.has(issue.parent)) children.set(issue.parent, []);
      children.get(issue.parent).push(issue);
    } else roots.push(issue);
  }
  const seen = new Set();
  const walk = (issue, depth) => {
    if (seen.has(issue.id)) return;
    seen.add(issue.id);
    console.log(describe(issue, depth));
    for (const child of children.get(issue.id) ?? []) walk(child, depth + 1);
  };
  roots.forEach((r) => walk(r, 0));
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const backlog = parseBacklog(readFileSync(opts.file, 'utf8'));
  const { issues, warnings } = backlog;
  const typesNeeded = [...new Set(issues.map((i) => TYPES[i.type]?.issueType).filter(Boolean))];

  let state = null;
  let offline = '';
  if (!tryGh(['--version']).ok) {
    offline = 'gh CLI not found';
  } else {
    try {
      state = readGitHub(opts, typesNeeded);
    } catch (err) {
      offline = `could not read the GitHub repo (${(err.stderr?.toString() || err.message).trim().split('\n')[0]})`;
    }
  }
  const existing = state?.issues ?? new Map();
  const isNew = (i) => !existing.has(i.id);

  console.log(
    `${opts.apply ? 'APPLY' : 'DRY RUN'}: ${opts.file} → ${state ? state.repo : `(no repo: ${offline}; assuming nothing exists on GitHub yet)`}\n`,
  );
  if (warnings.length) {
    console.log(`Warnings (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  ! ${w}`));
    console.log('');
  }

  const labelNames = Object.keys(LABELS);
  const newLabels = labelNames.filter((l) => !state?.labels.has(l));
  console.log(
    `Labels (${labelNames.length}): ${newLabels.length} to create, ${labelNames.length - newLabels.length} exist`,
  );
  console.log(`  ${labelNames.map((l) => `${newLabels.includes(l) ? '+' : '='}${l}`).join('  ')}`);
  console.log(`Milestones (${Object.keys(MILESTONES).length}):`);
  for (const [id, def] of Object.entries(MILESTONES)) {
    const number = state?.milestones.get(id);
    console.log(
      `  ${number ? `= #${number}`.padEnd(6) : '+'.padEnd(6)} ${def.title}: ${def.description}`,
    );
  }

  const counts = Object.keys(TYPES)
    .map((t) => `${issues.filter((i) => i.type === t).length} ${t}`)
    .join(', ');
  const toCreate = issues.filter(isNew);
  console.log(
    `Issues (${issues.length}: ${counts}): ${toCreate.length} to create, ${issues.length - toCreate.length} exist`,
  );
  printTree(issues, (i, depth) => {
    const mark = existing.has(i.id) ? `= #${existing.get(i.id).number}` : '+';
    const indent = '  '.repeat(depth);
    const details = [
      i.type || '?',
      i.parent ? `parent ${i.parent}` : 'top level',
      i.milestone ?? 'no milestone',
      i.labels.filter((l) => !l.startsWith('type:')).join(', ') || 'no labels',
      `size ${i.size ?? '—'}`,
    ];
    if (i.blockedBy.length) details.push(`blocked by ${i.blockedBy.join(', ')}`);
    return `  ${mark.padEnd(6)} ${indent}[${i.id}] ${i.title}\n         ${indent}${details.join(' · ')}`;
  });

  const subIssueLinks = toCreate.filter((i) => i.parent).length;
  const blockerLinks = toCreate.reduce((n, i) => n + i.blockedBy.length, 0);
  console.log(
    `Links for new issues: ${subIssueLinks} sub-issue (Parent), ${blockerLinks} blocked-by (added after all issues exist)`,
  );
  console.log('Extras:');
  if (state) {
    if (state.issueTypes)
      console.log(
        `  - Issue types: will set ${typesNeeded.filter((t) => state.issueTypes.has(t)).join(', ') || 'none'}`,
      );
    if (state.project)
      console.log(
        `  - Project #${state.project.number} "${state.project.title}": will add ${issues.filter((i) => !existing.get(i.id) || !state.project.items.has(existing.get(i.id).url)).length} issues and set ${[...state.project.fields.keys()].join(', ') || 'no fields'}`,
      );
    else if (!opts.project) console.log('  - Project: not requested (pass --project <number>)');
    state.skipped.forEach((s) => console.log(`  - skipped: ${s}`));
  } else {
    console.log(`  - Issue types and Project fields: not checked (${offline})`);
  }
  console.log(
    '  - Blocked by: GitHub issue dependencies API; if the repo lacks it, a "Blocked by #n" line is appended to the new issue instead',
  );

  if (!opts.apply) {
    console.log(
      `\nNothing was created.${warnings.length ? ' Fix the warnings, then' : ''} Re-run with --apply to create the items marked "+".`,
    );
    return;
  }
  if (warnings.length) {
    console.error('\nRefusing to apply: fix the warnings above in the backlog first.');
    process.exit(1);
  }
  if (!state) {
    console.error(
      `\n${offline}. Install gh (brew install gh), run gh auth login, and push the repo to GitHub first.`,
    );
    process.exit(1);
  }
  apply(issues, state);
}

function apply(issues, state) {
  const { repo } = state;
  const problems = [];
  const numbers = new Map(state.issues); // ID → { number, id, url }
  const created = new Map(); // ID → { number, id, url, body }
  let typesOn = Boolean(state.issueTypes);

  console.log('');
  for (const name of Object.keys(LABELS)) {
    if (state.labels.has(name)) continue;
    const [color, description] = LABELS[name];
    gh(['label', 'create', name, '--repo', repo, '--color', color, '--description', description]);
    console.log(`label   + ${name}`);
  }
  for (const [id, def] of Object.entries(MILESTONES)) {
    if (state.milestones.has(id)) continue;
    const res = api('POST', `repos/${repo}/milestones`, def);
    if (!res.ok) throw new Error(`creating milestone ${def.title}: ${res.error}`);
    state.milestones.set(id, res.data.number);
    console.log(`milestone + ${def.title}`);
  }

  // Pass 1: create the issues. On a failure, still link what was created, then stop.
  let fatal = null;
  for (const issue of issues) {
    if (numbers.has(issue.id)) continue;
    const payload = {
      title: `[${issue.id}] ${issue.title}`,
      body: issue.body,
      labels: issue.labels,
      milestone: state.milestones.get(issue.milestone),
    };
    const issueType = TYPES[issue.type].issueType;
    if (typesOn && state.issueTypes.has(issueType)) payload.type = issueType;
    let res = api('POST', `repos/${repo}/issues`, payload);
    if (!res.ok && payload.type) {
      typesOn = false;
      state.skipped.push(
        `Issue types: GitHub rejected type "${payload.type}" (${res.error}); created the rest without types`,
      );
      delete payload.type;
      res = api('POST', `repos/${repo}/issues`, payload);
    }
    if (!res.ok) {
      fatal = `creating [${issue.id}]: ${res.error}`;
      break;
    }
    const entry = {
      number: res.data.number,
      id: res.data.id,
      url: res.data.html_url,
      body: issue.body,
    };
    numbers.set(issue.id, entry);
    created.set(issue.id, entry);
    console.log(
      `issue   + #${entry.number} ${payload.title}${payload.type ? ` (${payload.type})` : ''}`,
    );
  }

  // Pass 2: sub-issue links, only for issues created in this run (existing ones were linked when
  // they were created).
  for (const issue of issues) {
    const child = created.get(issue.id);
    if (!child || !issue.parent) continue;
    const parent = numbers.get(issue.parent);
    const res = api('POST', `repos/${repo}/issues/${parent.number}/sub_issues`, {
      sub_issue_id: child.id,
    });
    if (res.ok) console.log(`sub-issue  #${child.number} → parent #${parent.number}`);
    else
      problems.push(
        `sub-issue #${child.number} → #${parent.number} failed (${res.error}); add it in the GitHub UI`,
      );
  }

  // Pass 3: blocked-by, after all issues exist so forward references resolve.
  let depsSupported = true;
  for (const issue of issues) {
    const blocked = created.get(issue.id);
    if (!blocked || !issue.blockedBy.length) continue;
    const fallback = [];
    for (const ref of issue.blockedBy) {
      let blocker = numbers.get(ref);
      if (!blocker && /^#\d+$/.test(ref)) {
        const res = tryGh([
          'api',
          `repos/${repo}/issues/${ref.slice(1)}`,
          '--jq',
          '{number, id} | tojson',
        ]);
        blocker = res.ok ? JSON.parse(res.out) : null;
      }
      if (!blocker) {
        problems.push(`#${blocked.number} blocked by ${ref}: not found on GitHub`);
        continue;
      }
      if (depsSupported) {
        const res = api('POST', `repos/${repo}/issues/${blocked.number}/dependencies/blocked_by`, {
          issue_id: blocker.id,
        });
        if (res.ok) {
          console.log(`blocked-by #${blocked.number} ← #${blocker.number}`);
          continue;
        }
        if (!notSupported(res.error)) {
          problems.push(`#${blocked.number} blocked by #${blocker.number} failed (${res.error})`);
          continue;
        }
        depsSupported = false;
        state.skipped.push(
          `Issue dependencies API not available (${res.error}); wrote "Blocked by #n" lines into the new issues instead`,
        );
      }
      fallback.push(`Blocked by #${blocker.number}`);
    }
    if (fallback.length) {
      // Editing is fine here: this issue was created a moment ago by this run.
      const res = api('PATCH', `repos/${repo}/issues/${blocked.number}`, {
        body: `${blocked.body}\n\n${fallback.join('\n')}`,
      });
      if (res.ok) console.log(`blocked-by #${blocked.number}: ${fallback.join(', ')} (in body)`);
      else
        problems.push(`#${blocked.number}: could not add "${fallback.join(', ')}" (${res.error})`);
    }
  }

  // Pass 4: GitHub Project items. Adds issues that aren't in the project yet and sets their fields
  // once; items already in the project are left alone so manual changes (Status…) survive.
  const project = state.project;
  if (project) {
    const optionMisses = new Set();
    for (const issue of issues) {
      const entry = numbers.get(issue.id);
      if (!entry || project.items.has(entry.url)) continue;
      const add = tryGh([
        'project',
        'item-add',
        project.number,
        '--owner',
        state.owner,
        '--url',
        entry.url,
        '--format',
        'json',
      ]);
      if (!add.ok) {
        problems.push(`project: adding #${entry.number} failed (${add.error})`);
        continue;
      }
      const itemId = JSON.parse(add.out).id;
      const values = projectValues(issue);
      for (const [name, field] of project.fields) {
        const value = values[name];
        if (!value) continue;
        const argv = [
          'project',
          'item-edit',
          '--id',
          itemId,
          '--project-id',
          project.id,
          '--field-id',
          field.id,
        ];
        if (field.options) {
          const option = field.options.find((o) => o.name.toLowerCase() === value.toLowerCase());
          if (!option) {
            optionMisses.add(`Project field ${name}: no option "${value}"`);
            continue;
          }
          argv.push('--single-select-option-id', option.id);
        } else argv.push('--text', value);
        const res = tryGh(argv);
        if (!res.ok)
          problems.push(`project: setting ${name} on #${entry.number} failed (${res.error})`);
      }
      console.log(`project + #${entry.number}`);
    }
    optionMisses.forEach((s) => state.skipped.push(s));
  }

  console.log(`\nCreated ${created.size} issues.`);
  if (state.skipped.length) {
    console.log('Skipped:');
    state.skipped.forEach((s) => console.log(`  - ${s}`));
  }
  if (problems.length || fatal) {
    console.error('Problems:');
    problems.forEach((p) => console.error(`  ! ${p}`));
    if (fatal)
      console.error(`  ! stopped while ${fatal}. Re-run to continue; created issues are skipped.`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
