#!/usr/bin/env node
// GitHub board helper for /work-on (see SKILL.md next to this file). Uses the gh CLI only.
//   node board.mjs next                                  next Ready story or spike, and its tasks
//   node board.mjs show <ID|number>                      one issue with its sub-issues and blockers
//   node board.mjs status <ID|number> "<Status>" [--assign-me]   move one Project card
//   node board.mjs close-done-parents [--apply]          close stories/epics whose children are closed
// <ID> is the [E3-S2] title prefix (brackets optional); <number> is an issue number (57 or #57).
// Reads owner, repo and projectNumber from .claude/github.json (BOARD_CONFIG overrides the path).
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CONFIG_PATH =
  process.env.BOARD_CONFIG ?? fileURLToPath(new URL('../../github.json', import.meta.url));
const WRITE_DELAY_MS = Number(process.env.BOARD_WRITE_DELAY_MS ?? 1000);
const RETRY_BASE_MS = Number(process.env.BOARD_RETRY_BASE_MS ?? 15000);
const RETRIES = 4;

const ID = /^(?:E\d+(?:-S\d+(?:-T\d+)?)?|SP-\d+)$/;
const ID_PREFIX = /^\[([^\]]+)\]\s*/;
const RATE_LIMITED =
  /secondary rate limit|abuse detection|submitted too quickly|HTTP 429|API rate limit exceeded/i;
const NOT_SUPPORTED = /HTTP 404|HTTP 410|Not Found/i;
const SCOPE_ERROR = /scope|INSUFFICIENT_SCOPES|read:project/i;

const HOW_TO_CONFIGURE = `Fill in .claude/github.json once the GitHub repo and Project exist, then commit it:
  { "owner": "<user or org>", "repo": "<repo name>", "projectNumber": <N> }
  - owner and repo: from the repo URL github.com/<owner>/<repo>
  - projectNumber: the N in github.com/users/<owner>/projects/N (or orgs/<owner>/projects/N)`;

class Fail extends Error {}
class GhError extends Error {}
const fail = (message) => {
  throw new Fail(message);
};

// ---------------------------------------------------------------------------------------------
// gh. execFileSync with argument arrays: no shell, so titles and bodies are never parsed as shell
// syntax. Every call retries with backoff on GitHub's secondary rate limits.

const sleep = (ms) => ms > 0 && Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function gh(argv) {
  for (let attempt = 0; ; attempt++) {
    try {
      return execFileSync('gh', argv, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 64 * 1024 * 1024,
      }).trim();
    } catch (err) {
      if (err.code === 'ENOENT')
        fail(
          'The GitHub CLI (gh) is not installed. Install it from https://cli.github.com (macOS .pkg, or `brew install gh`), then run `gh auth login`.',
        );
      const message = (err.stderr?.toString() || err.message).trim();
      if (RATE_LIMITED.test(message) && attempt < RETRIES) {
        const wait = RETRY_BASE_MS * 2 ** attempt;
        console.error(`GitHub rate limit hit; retrying in ${Math.round(wait / 1000)} s…`);
        sleep(wait);
        continue;
      }
      throw new GhError(message.split('\n').slice(0, 3).join(' '));
    }
  }
}

let lastWrite = 0;
function ghWrite(argv) {
  sleep(lastWrite + WRITE_DELAY_MS - Date.now());
  try {
    return gh(argv);
  } finally {
    lastWrite = Date.now();
  }
}

/** All pages of a REST list endpoint as one array. */
function apiList(path) {
  let out;
  try {
    out = gh(['api', '--paginate', '--slurp', path]);
  } catch (err) {
    if (err instanceof GhError && /unknown flag: --slurp/.test(err.message))
      fail('Your gh is too old for this script (needs --slurp). Run `brew upgrade gh`.');
    throw err;
  }
  return JSON.parse(out || '[]').flat();
}

function checkGh({ needProject }) {
  let status;
  try {
    status = gh(['auth', 'status']);
  } catch (err) {
    if (err instanceof GhError)
      fail(
        `gh is not logged in (${err.message}). Run \`gh auth login\`, then \`gh auth refresh -s project\`.`,
      );
    throw err;
  }
  // "Token scopes: 'gist', 'read:org', 'repo'". Tokens that list no scopes (fine-grained, GH_TOKEN)
  // are checked by the first project call instead.
  const scopes = status.match(/Token scopes:\s*(.*)/)?.[1] ?? '';
  if (needProject && /'/.test(scopes) && !/'project'/.test(scopes))
    fail(
      `Your gh token lacks the "project" scope (has ${scopes}). Run \`gh auth refresh -s project\`.`,
    );
}

function loadConfig({ needProject }) {
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    fail(`Can't read ${CONFIG_PATH} (${err.message}).\n${HOW_TO_CONFIGURE}`);
  }
  const missing = [];
  if (!/^[\w.-]+$/.test(cfg.owner ?? '')) missing.push('owner');
  if (!/^[\w.-]+$/.test(cfg.repo ?? '')) missing.push('repo');
  if (needProject && !(Number.isInteger(cfg.projectNumber) && cfg.projectNumber > 0))
    missing.push('projectNumber');
  if (missing.length)
    fail(
      `.claude/github.json is not filled in (missing: ${missing.join(', ')}).\n${HOW_TO_CONFIGURE}`,
    );
  return {
    owner: cfg.owner,
    slug: `${cfg.owner}/${cfg.repo}`,
    projectNumber: cfg.projectNumber ? String(cfg.projectNumber) : null,
  };
}

// ---------------------------------------------------------------------------------------------
// Board model: the repo's issues (one paginated call) plus, when needed, the Project's fields and
// items. Sub-issues and blockers are fetched per issue, only for the issues being looked at.

function kindOf(id, labels) {
  if (id && /^SP-/.test(id)) return 'spike';
  if (id && /-T\d+$/.test(id)) return 'task';
  if (id && /-S\d+$/.test(id)) return 'story';
  if (id) return 'epic';
  return labels.find((l) => l.startsWith('type:'))?.slice(5) ?? 'issue';
}

function toIssue(raw) {
  const id = raw.title.match(ID_PREFIX)?.[1];
  const labels = (raw.labels ?? []).map((l) => (typeof l === 'string' ? l : l.name));
  const validId = id && ID.test(id) ? id : null;
  return {
    number: raw.number,
    id: validId,
    title: validId ? raw.title.replace(ID_PREFIX, '') : raw.title,
    state: raw.state?.toLowerCase(),
    body: raw.body ?? '',
    labels,
    milestone: raw.milestone?.title ?? null,
    assignees: (raw.assignees ?? []).map((a) => a.login),
    url: raw.html_url,
    subSummary: raw.sub_issues_summary ?? null,
    kind: kindOf(validId, labels),
  };
}

function loadBoard(cfg, { needProject }) {
  const issues = apiList(`repos/${cfg.slug}/issues?state=all&per_page=100`)
    .filter((raw) => !raw.pull_request)
    .map(toIssue);
  const board = {
    cfg,
    issues,
    byNumber: new Map(issues.map((i) => [i.number, i])),
    byId: new Map(),
    project: needProject ? loadProject(cfg) : null,
    notes: [],
    depsApi: true,
    subsApi: true,
    blockerCache: new Map(),
  };
  for (const issue of [...issues].sort((a, b) => a.number - b.number))
    if (issue.id && !board.byId.has(issue.id)) board.byId.set(issue.id, issue);
  return board;
}

function loadProject(cfg) {
  const read = (argv) => {
    try {
      return JSON.parse(gh(argv));
    } catch (err) {
      if (err instanceof GhError && SCOPE_ERROR.test(err.message))
        fail(`gh can't read the Project (${err.message}). Run \`gh auth refresh -s project\`.`);
      if (err instanceof GhError)
        fail(
          `Can't open project #${cfg.projectNumber} of ${cfg.owner} (${err.message}). Check projectNumber in .claude/github.json.`,
        );
      throw err;
    }
  };
  const common = [cfg.projectNumber, '--owner', cfg.owner, '--format', 'json'];
  const view = read(['project', 'view', ...common]);
  const fields = read(['project', 'field-list', ...common, '--limit', '100']).fields ?? [];
  const items = read(['project', 'item-list', ...common, '--limit', '5000']).items ?? [];
  const statusField = fields.find((f) => f.name.toLowerCase() === 'status');
  if (!statusField?.options)
    fail(
      `Project #${cfg.projectNumber} has no single-select "Status" field (ba-brief §8: Backlog → Ready → In progress → In review → Done).`,
    );

  const itemsByNumber = new Map();
  const slug = cfg.slug.toLowerCase();
  for (const item of items) {
    const c = item.content ?? {};
    if (!c.number || (c.type && c.type !== 'Issue')) continue;
    const repo = c.repository?.toLowerCase();
    const sameRepo = repo
      ? repo === slug || repo.endsWith(`/${slug}`)
      : (c.url ?? '').toLowerCase().includes(`/${slug}/issues/`);
    if (sameRepo) itemsByNumber.set(c.number, item);
  }
  return { id: view.id, title: view.title, number: cfg.projectNumber, statusField, itemsByNumber };
}

/** A Project field value from `gh project item-list` (keys are lower-cased field names). */
function fieldValue(item, name) {
  if (!item) return null;
  const key = Object.keys(item).find((k) => k.toLowerCase() === name.toLowerCase());
  const value = key ? item[key] : null;
  return typeof value === 'object' && value !== null ? (value.name ?? value.title ?? null) : value;
}

const itemOf = (board, issue) => board.project?.itemsByNumber.get(issue.number);
const statusOf = (board, issue) =>
  board.project
    ? itemOf(board, issue)
      ? (fieldValue(itemOf(board, issue), 'Status') ?? 'no Status')
      : 'not on the board'
    : null;
const priorityOf = (board, issue) =>
  fieldValue(itemOf(board, issue), 'Priority')?.toUpperCase() ??
  issue.labels
    .find((l) => l.startsWith('priority:'))
    ?.slice(9)
    .toUpperCase() ??
  null;
const sizeOf = (board, issue) => fieldValue(itemOf(board, issue), 'Size');
const milestoneOf = (issue) => issue.milestone?.match(/^M\d+/)?.[0] ?? null;
const rank = (value, re, missing) => Number(value?.match(re)?.[1] ?? missing);

const byIdOrder = (a, b) =>
  a.id && b.id
    ? a.id.localeCompare(b.id, 'en', { numeric: true }) || a.number - b.number
    : a.id
      ? -1
      : b.id
        ? 1
        : a.number - b.number;

const label = (issue) => `#${issue.number}${issue.id ? ` [${issue.id}]` : ''} ${issue.title}`;

function findIssue(board, ref) {
  const raw = String(ref ?? '').trim();
  const number = raw.match(/^#?(\d+)$/)?.[1];
  const issue = number
    ? board.byNumber.get(Number(number))
    : board.byId.get(raw.replace(/^\[|\]$/g, '').toUpperCase());
  if (!issue)
    fail(`No issue ${raw} in ${board.cfg.slug}. Use an ID like E3-S2 or an issue number.`);
  return issue;
}

/** Issues that block this one, from the issue-dependencies API, else "Blocked by" body lines. */
function blockersOf(board, issue) {
  if (board.blockerCache.has(issue.number)) return board.blockerCache.get(issue.number);
  let blockers = null;
  if (board.depsApi) {
    try {
      blockers = apiList(
        `repos/${board.cfg.slug}/issues/${issue.number}/dependencies/blocked_by?per_page=100`,
      ).map((raw) => {
        const known = board.byNumber.get(raw.number);
        const sameRepo = !raw.html_url || raw.html_url.includes(`/${board.cfg.slug}/issues/`);
        if (sameRepo && known) return known;
        const other = toIssue(raw);
        return { ...other, title: `${other.title} (${raw.html_url})` };
      });
    } catch (err) {
      if (!(err instanceof GhError) || !NOT_SUPPORTED.test(err.message)) throw err;
      board.depsApi = false;
      board.notes.push(
        `Issue dependencies API not available (${err.message}); read "Blocked by" lines in issue bodies instead.`,
      );
    }
  }
  if (!blockers) {
    const refs = new Set();
    for (const line of issue.body.split(/\r?\n/)) {
      const m = line.match(/^\s*(?:[-*]\s*)?\**Blocked by\**:?\s*(.*)$/i);
      if (!m) continue;
      for (const ref of m[1].matchAll(/#(\d+)|\b(E\d+(?:-S\d+(?:-T\d+)?)?|SP-\d+)\b/g))
        refs.add(ref[1] ? board.byNumber.get(Number(ref[1])) : board.byId.get(ref[2]));
    }
    refs.delete(undefined);
    refs.delete(issue);
    blockers = [...refs];
  }
  board.blockerCache.set(issue.number, blockers);
  return blockers;
}

const openBlockers = (board, issue) => blockersOf(board, issue).filter((b) => b.state === 'open');

/** Sub-issues, from the sub-issues API, else by ID shape (E3-S2-T* under E3-S2, E3-S* under E3). */
function childrenOf(board, issue) {
  if (board.subsApi) {
    try {
      return apiList(`repos/${board.cfg.slug}/issues/${issue.number}/sub_issues?per_page=100`)
        .map((raw) => board.byNumber.get(raw.number) ?? toIssue(raw))
        .sort(byIdOrder);
    } catch (err) {
      if (!(err instanceof GhError) || !NOT_SUPPORTED.test(err.message)) throw err;
      board.subsApi = false;
      board.notes.push(
        `Sub-issues API not available (${err.message}); matched children by ID instead.`,
      );
    }
  }
  if (!issue.id) return [];
  const childId = new RegExp(`^${issue.id}-[ST]\\d+$`);
  return board.issues.filter((i) => i.id && childId.test(i.id)).sort(byIdOrder);
}

/** Tasks in ID order, moved after any sibling that blocks them. */
function workOrder(board, tasks) {
  const siblings = new Set(tasks.map((t) => t.number));
  const remaining = [...tasks].sort(byIdOrder);
  const placed = new Set();
  const order = [];
  let cycle = false;
  while (remaining.length) {
    let next = remaining.findIndex((t) =>
      blockersOf(board, t).every(
        (b) => b.state !== 'open' || !siblings.has(b.number) || placed.has(b.number),
      ),
    );
    if (next === -1) {
      cycle = true;
      next = 0;
    }
    const [task] = remaining.splice(next, 1);
    placed.add(task.number);
    order.push(task);
  }
  if (cycle) board.notes.push('The tasks block each other in a cycle; fix the blocked-by links.');
  return order;
}

function slugify(title) {
  return (
    title
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .split('-')
      .slice(0, 6)
      .join('-') || 'work'
  );
}

// ---------------------------------------------------------------------------------------------
// Output

function printTasks(board, story) {
  const tasks = childrenOf(board, story);
  if (!tasks.length) {
    console.log(
      story.kind === 'spike'
        ? 'Spike: no tasks (see the spike flow in SKILL.md).'
        : 'No sub-issues.',
    );
    return;
  }
  const siblings = new Set(tasks.map((t) => t.number));
  const ordered = story.kind === 'story' ? workOrder(board, tasks) : tasks;
  console.log(story.kind === 'story' ? 'Tasks in work order:' : 'Sub-issues:');
  ordered.forEach((task, i) => {
    const details = [
      task.labels.find((l) => l.startsWith('area:')) ?? 'no area',
      sizeOf(board, task) ?? null,
      statusOf(board, task),
      task.state === 'closed' ? 'closed' : null,
    ].filter(Boolean);
    const blockers = openBlockers(board, task).map(
      (b) =>
        `#${b.number}${b.id ? ` [${b.id}]` : ''}${siblings.has(b.number) ? '' : ' (outside this story)'}`,
    );
    if (blockers.length) details.push(`blocked by ${blockers.join(', ')}`);
    console.log(`  ${i + 1}. ${label(task)}\n       ${details.join(' · ')}`);
  });
}

function describe(board, issue) {
  const blockers = blockersOf(board, issue);
  const lines = [
    `${label(issue)} (${issue.kind}, ${issue.state})`,
    issue.url,
    [
      board.project ? `Status: ${statusOf(board, issue)}` : null,
      `Milestone: ${issue.milestone ?? '—'}`,
      `Priority: ${priorityOf(board, issue) ?? '—'}`,
      sizeOf(board, issue) ? `Size: ${sizeOf(board, issue)}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    `Labels: ${issue.labels.join(', ') || '—'} · Assignees: ${issue.assignees.join(', ') || '—'}`,
    `Blocked by: ${blockers.map((b) => `${label(b)} (${b.state})`).join('; ') || 'nothing'}`,
  ];
  if (issue.kind === 'story' || issue.kind === 'spike')
    lines.push(`Suggested branch: feat/${issue.number}-${slugify(issue.title)}`);
  console.log(lines.join('\n'));
}

function section(body, heading) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${heading}\\s*$`, 'i').test(l));
  if (start === -1) return null;
  const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join('\n')
    .trim();
}

function printNotes(board) {
  board.notes.forEach((n) => console.log(`Note: ${n}`));
}

// ---------------------------------------------------------------------------------------------
// Commands

function cmdNext(cfg) {
  const board = loadBoard(cfg, { needProject: true });
  const workable = board.issues.filter(
    (i) => i.state === 'open' && (i.kind === 'story' || i.kind === 'spike'),
  );
  const inProgress = workable.filter((i) => /^in (progress|review)$/i.test(statusOf(board, i)));
  const ready = workable
    .filter((i) => statusOf(board, i).toLowerCase() === 'ready')
    .sort(
      (a, b) =>
        rank(milestoneOf(a), /^M(\d+)/, 99) - rank(milestoneOf(b), /^M(\d+)/, 99) ||
        rank(priorityOf(board, a), /^P(\d)/, 9) - rank(priorityOf(board, b), /^P(\d)/, 9) ||
        byIdOrder(a, b),
    );
  if (inProgress.length) {
    console.log('Already in progress or in review (resume with /work-on <ID>):');
    inProgress.forEach((i) => console.log(`  ${label(i)} · ${statusOf(board, i)}`));
    console.log('');
  }

  const skipped = [];
  let chosen = null;
  for (const candidate of ready) {
    const blockers = openBlockers(board, candidate);
    if (!blockers.length) {
      chosen = candidate;
      break;
    }
    skipped.push({ candidate, blockers });
  }
  skipped.forEach(({ candidate, blockers }) =>
    console.log(`Skipped ${label(candidate)}: blocked by ${blockers.map(label).join('; ')} (open)`),
  );
  if (!chosen) {
    console.log(
      ready.length
        ? `\nNothing to pick: ${ready.length === 1 ? 'the only Ready story/spike is' : `all ${ready.length} Ready stories/spikes are`} blocked by open issues.`
        : '\nNothing to pick: no open story or spike has Status "Ready". Move the next ones Backlog → Ready on the board.',
    );
    printNotes(board);
    return;
  }

  const meta = [milestoneOf(chosen) ?? 'no milestone', priorityOf(board, chosen) ?? 'no priority'];
  console.log(`${skipped.length ? '\n' : ''}Next: ${label(chosen)}`);
  console.log(
    `Why: Ready, ${meta.join(', ')}, not blocked; first by milestone → priority → ID among ${ready.length} Ready ${ready.length === 1 ? 'story/spike' : 'stories/spikes'}${skipped.length ? ` (${skipped.length} blocked one${skipped.length === 1 ? '' : 's'} skipped)` : ''}.\n`,
  );
  describe(board, chosen);
  console.log('');
  printTasks(board, chosen);
  printNotes(board);
}

function cmdShow(cfg, ref) {
  if (!ref) usage('show needs an issue ID or number');
  const board = loadBoard(cfg, { needProject: true });
  const issue = findIssue(board, ref);
  describe(board, issue);
  if (issue.kind !== 'task') {
    console.log('');
    printTasks(board, issue);
  }
  console.log(
    `\n--- ${issue.id ?? `#${issue.number}`} body ---\n${issue.body.trim() || '(empty)'}`,
  );
  if (issue.kind === 'task') {
    const parent = issue.id && board.byId.get(issue.id.replace(/-T\d+$/, ''));
    const criteria = parent && section(parent.body, 'Acceptance criteria');
    if (parent)
      console.log(
        `\n--- Parent story ${label(parent)}: acceptance criteria ---\n${criteria || '(none in the story body)'}`,
      );
  }
  printNotes(board);
}

function cmdStatus(cfg, ref, wanted, assignMe) {
  if (!ref || !wanted) usage('status needs an issue and a Status, e.g. status E3-S2 "In progress"');
  const board = loadBoard(cfg, { needProject: true });
  const issue = findIssue(board, ref);
  const { statusField, id: projectId } = board.project;
  const option = statusField.options.find(
    (o) => o.name.toLowerCase() === wanted.trim().toLowerCase(),
  );
  if (!option)
    fail(
      `Project #${cfg.projectNumber} has no Status "${wanted}". Options: ${statusField.options.map((o) => o.name).join(', ')}.`,
    );
  const item = itemOf(board, issue);
  if (!item)
    fail(
      `${label(issue)} is not on project #${cfg.projectNumber}. Add it on the board (or \`gh project item-add ${cfg.projectNumber} --owner ${cfg.owner} --url ${issue.url}\`) and retry.`,
    );

  const before = fieldValue(item, 'Status') ?? 'no Status';
  if (before === option.name) {
    console.log(`${label(issue)}: already ${option.name}`);
  } else {
    ghWrite([
      'project',
      'item-edit',
      '--id',
      item.id,
      '--project-id',
      projectId,
      '--field-id',
      statusField.id,
      '--single-select-option-id',
      option.id,
    ]);
    console.log(`${label(issue)}: ${before} → ${option.name}`);
  }
  if (assignMe) {
    ghWrite(['issue', 'edit', String(issue.number), '--repo', cfg.slug, '--add-assignee', '@me']);
    console.log(`${label(issue)}: assigned to you`);
  }
}

function cmdCloseDoneParents(cfg, apply) {
  const board = loadBoard(cfg, { needProject: false });
  const open = board.issues.filter((i) => i.state === 'open').sort(byIdOrder);
  const done = [];
  for (const story of open.filter((i) => i.kind === 'story')) {
    const summary = story.subSummary;
    if (summary && (summary.total === 0 || summary.completed < summary.total)) continue;
    const tasks = childrenOf(board, story);
    if (tasks.length && tasks.every((t) => t.state === 'closed'))
      done.push({ issue: story, why: `all ${tasks.length} sub-issues closed` });
  }
  const closing = new Set(done.map((d) => d.issue.number));
  for (const epic of open.filter((i) => i.kind === 'epic')) {
    const children = childrenOf(board, epic);
    if (children.length && children.every((c) => c.state === 'closed' || closing.has(c.number)))
      done.push({
        issue: epic,
        why: `all ${children.length} sub-issues closed${children.some((c) => closing.has(c.number)) ? ' (counting the stories above)' : ''}`,
      });
  }

  if (!done.length) {
    console.log('Nothing to close: no open story or epic has all its sub-issues closed.');
    printNotes(board);
    return;
  }
  console.log(
    `${apply ? 'Closing' : 'Would close'} ${done.length} parent issue${done.length === 1 ? '' : 's'}:`,
  );
  done.forEach((d) => console.log(`  ${label(d.issue)} (${d.issue.kind}): ${d.why}`));
  printNotes(board);
  if (!apply) {
    console.log('\nDry run: nothing was closed. Re-run with --apply to close them.');
    return;
  }
  const problems = [];
  for (const { issue } of done) {
    try {
      ghWrite([
        'issue',
        'close',
        String(issue.number),
        '--repo',
        cfg.slug,
        '--reason',
        'completed',
        '--comment',
        'Closed by /work-on: all sub-issues are closed.',
      ]);
      console.log(`closed ${label(issue)}`);
    } catch (err) {
      if (!(err instanceof GhError)) throw err;
      problems.push(`${label(issue)}: ${err.message}`);
    }
  }
  if (problems.length) fail(`Some issues could not be closed:\n  ${problems.join('\n  ')}`);
}

function usage(message) {
  console.error(`${message}
Usage: node .claude/skills/work-on/board.mjs <command>
  next                                   next Ready story or spike and its tasks in work order
  show <ID|number>                       an issue, its sub-issues, blockers and body
  status <ID|number> "<Status>" [--assign-me]   move a card (Backlog, Ready, In progress, In review, Done)
  close-done-parents [--apply]           stories/epics whose sub-issues are all closed (dry run by default)`);
  process.exit(2);
}

function main(argv) {
  const [command, ...rest] = argv;
  const flags = new Set(rest.filter((a) => a.startsWith('--')));
  const args = rest.filter((a) => !a.startsWith('--'));
  const known = { next: [], show: [], status: ['--assign-me'], 'close-done-parents': ['--apply'] };
  if (!(command in known)) usage(command ? `Unknown command "${command}"` : 'Missing command');
  for (const flag of flags) if (!known[command].includes(flag)) usage(`Unknown option ${flag}`);

  const needProject = command !== 'close-done-parents';
  checkGh({ needProject });
  const cfg = loadConfig({ needProject });
  if (command === 'next') cmdNext(cfg);
  else if (command === 'show') cmdShow(cfg, args[0]);
  else if (command === 'status') cmdStatus(cfg, args[0], args[1], flags.has('--assign-me'));
  else cmdCloseDoneParents(cfg, flags.has('--apply'));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    if (!(err instanceof Fail || err instanceof GhError)) throw err;
    console.error(err instanceof GhError ? `gh failed: ${err.message}` : err.message);
    process.exit(1);
  }
}
