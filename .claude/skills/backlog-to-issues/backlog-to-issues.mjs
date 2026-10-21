#!/usr/bin/env node
// Turn docs/product/mvp-backlog.md (format: docs/product/ba-brief.md §9, parser rules: format.md)
// into GitHub labels, milestones, issues, sub-issue links and blocked-by links with the gh CLI.
//   node backlog-to-issues.mjs [backlog.md] [--apply] [--milestone M0,M1] [--repo owner/name]
//                              [--project <number>]
// Dry run by default. Idempotent and resumable: an issue whose title starts with the same [ID] is
// not re-created, and a re-run adds any missing sub-issue link, blocked-by link, Project item or
// empty Project field. Existing titles and bodies are never edited, nothing is closed or deleted.
// Extras (issue types, Project fields) are skipped with a reason when unsupported.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// ba-brief §7
export const MILESTONES = {
  M0: {
    title: 'M0 Design',
    description:
      'Penpot tokens, components, every MVP screen and flow are designed and handed off.',
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
// gh. execFileSync with argument arrays: no shell, so titles and bodies are never parsed as shell
// syntax. GitHub's secondary limits allow ~80 content-creating requests per minute and 500 per
// hour (web UI actions count too), so writes are paced: at least WRITE_DELAY_MS apart, and a
// pause before HOURLY_WRITES in a rolling hour. The hour's write times are kept in a temp file so
// back-to-back runs share the budget. Rate-limited calls are retried with retry-after /
// x-ratelimit-reset, or 60 s doubling. BACKLOG_* env vars only exist so tests can shrink waits.

const WRITE_DELAY_MS = Number(process.env.BACKLOG_WRITE_DELAY_MS ?? 1000);
const RETRY_MIN_MS = Number(process.env.BACKLOG_RETRY_MIN_MS ?? 60_000);
const RETRIES = Number(process.env.BACKLOG_RETRIES ?? 5);
const HOURLY_WRITES = Number(process.env.BACKLOG_HOURLY_WRITES ?? 450);
const WINDOW_MS = Number(process.env.BACKLOG_WINDOW_MS ?? 3_600_000);
const WRITE_LOG =
  process.env.BACKLOG_WRITE_LOG ?? join(tmpdir(), 'backlog-to-issues-write-times.json');
const GH_CALL_MS = 700; // rough duration of one gh call, used for estimates only

const RATE_LIMITED =
  /secondary rate limit|abuse detection|submitted too quickly|HTTP 429|rate limit exceeded/i;
const NOT_SUPPORTED = /HTTP 404|HTTP 410|Not Found/i;
// Network failures before the request reached GitHub: safe to retry, even for writes.
const NETWORK_BEFORE_SEND =
  /TLS handshake timeout|dial tcp|connection refused|no such host|network is unreachable|i\/o timeout/i;
// Failures that may hit after GitHub processed the request: retried for reads only. For writes the
// run stops instead; a re-run matches existing issues by [ID], so nothing is created twice.
const NETWORK_ANY =
  /TLS handshake timeout|dial tcp|connection refused|no such host|network is unreachable|i\/o timeout|connection reset|unexpected EOF|timeout awaiting response headers|HTTP 50[234]/i;
const NETWORK_RETRY_MS = Number(process.env.BACKLOG_NETWORK_RETRY_MS ?? 5_000);

class GhError extends Error {}
class RateLimited extends Error {}

const sleep = (ms) => ms > 0 && Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const clock = (ms) =>
  new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const seconds = (ms) => `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;

export function formatDuration(ms) {
  if (ms <= 0) return 'no time';
  const min = Math.ceil(ms / 60_000);
  const h = Math.floor(min / 60);
  return `~${h ? `${h} h${min % 60 ? ` ${min % 60} min` : ''}` : `${Math.max(1, min)} min`}`;
}

let writeTimes = (() => {
  try {
    const times = JSON.parse(readFileSync(WRITE_LOG, 'utf8'));
    return Array.isArray(times) ? times.filter(Number.isFinite).sort((a, b) => a - b) : [];
  } catch {
    return [];
  }
})();
let lastWrite = 0;

function writesInWindow() {
  const since = Date.now() - WINDOW_MS;
  writeTimes = writeTimes.filter((t) => t > since);
  return writeTimes.length;
}

function paceWrite() {
  sleep(lastWrite + WRITE_DELAY_MS - Date.now());
  if (writesInWindow() >= HOURLY_WRITES) {
    const resumeAt = writeTimes[writeTimes.length - HOURLY_WRITES] + WINDOW_MS;
    console.log(
      `  … paused: ${writeTimes.length} writes in the last hour (this script pauses at ${HOURLY_WRITES}; GitHub allows 500). Resuming at ${clock(resumeAt)}. Ctrl-C is safe: a re-run resumes.`,
    );
    sleep(resumeAt - Date.now() + 100);
    writesInWindow();
  }
}

function recordWrite() {
  lastWrite = Date.now();
  writeTimes.push(lastWrite);
  try {
    writeFileSync(WRITE_LOG, JSON.stringify(writeTimes));
  } catch {
    // only affects pacing across runs
  }
}

/** `gh api --include` output → status, lower-cased headers and body. */
function splitIncluded(out) {
  const m = out.match(/^HTTP\/\S+\s+(\d{3})[^\n]*\n([\s\S]*?)(?:\r?\n\r?\n|\r?\n?$)([\s\S]*)$/);
  if (!m) return { headers: {}, body: out };
  const headers = {};
  for (const line of m[2].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) headers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  return { status: Number(m[1]), headers, body: m[3].trim() };
}

function retryDelay(headers, attempt) {
  const retryAfter = Number(headers['retry-after']);
  if (retryAfter >= 0 && headers['retry-after'] !== undefined) return retryAfter * 1000 + 100;
  const reset = Number(headers['x-ratelimit-reset']);
  if (headers['x-ratelimit-remaining'] === '0' && reset > 0)
    return Math.max(0, reset * 1000 - Date.now()) + 1000;
  return RETRY_MIN_MS * 2 ** (attempt - 1);
}

function call(argv, { input, write = false } = {}) {
  for (let attempt = 1; ; attempt++) {
    if (write) paceWrite();
    try {
      return execFileSync('gh', argv, {
        encoding: 'utf8',
        input,
        stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
        maxBuffer: 64 * 1024 * 1024,
      }).trim();
    } catch (err) {
      if (err.code === 'ENOENT') throw new GhError('gh CLI not found');
      const stderr = err.stderr?.toString() ?? '';
      const { headers } = splitIncluded(err.stdout?.toString() ?? '');
      const message = (stderr || err.message).trim().split('\n')[0];
      const limited = RATE_LIMITED.test(stderr) || headers['x-ratelimit-remaining'] === '0';
      const network = !limited && (write ? NETWORK_BEFORE_SEND : NETWORK_ANY).test(stderr);
      if (network && attempt <= RETRIES) {
        const wait = NETWORK_RETRY_MS * 2 ** (attempt - 1);
        console.log(
          `  … network error (${message}); waiting ${seconds(wait)} before retry ${attempt}/${RETRIES}`,
        );
        sleep(wait);
        continue;
      }
      if (!limited) throw new GhError(message);
      if (attempt > RETRIES)
        throw new RateLimited(`GitHub kept rate-limiting after ${RETRIES} retries (${message})`);
      const wait = retryDelay(headers, attempt);
      console.log(
        `  … rate limited (${message}); waiting ${seconds(wait)} before retry ${attempt}/${RETRIES}`,
      );
      sleep(wait);
    } finally {
      if (write) recordWrite();
    }
  }
}

const read = (argv) => call(argv);
const readLines = (argv) => read(argv).split('\n').filter(Boolean);
const readList = (path, jq) => readLines(['api', '--paginate', path, '--jq', jq]);

/** REST write; returns the parsed response body. */
function write(method, path, body) {
  const out = call(['api', '--include', '-X', method, path, '--input', '-'], {
    input: JSON.stringify(body),
    write: true,
  });
  const text = splitIncluded(out).body;
  return text ? JSON.parse(text) : null;
}
const writeGh = (argv) => call(argv, { write: true });

/** GhError → { ok: false, error }. Rate-limit give-ups propagate and stop the run. */
function attempt(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    if (err instanceof GhError) return { ok: false, error: err.message };
    throw err;
  }
}

// ---------------------------------------------------------------------------------------------
// Reading what already exists

function readGitHub(opts, issueTypesNeeded) {
  const repo =
    opts.repo ?? read(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
  const owner = repo.split('/')[0];
  const state = {
    repo,
    owner,
    issues: new Map(), // backlog ID → { number, id, title, body, url }
    milestones: new Map(), // M1 → milestone number
    labels: new Set(),
    issueTypes: null, // Set of available type names, or null when skipped
    depsSupported: true,
    project: null,
    skipped: [],
  };

  for (const line of readList(
    `repos/${repo}/issues?state=all&per_page=100`,
    '.[] | select(.pull_request == null) | {number, id, title, body, url: .html_url} | tojson',
  )) {
    const it = JSON.parse(line);
    const id = it.title.match(/^\[([^\]]+)\]/)?.[1];
    if (id && !state.issues.has(id)) state.issues.set(id, it);
  }
  const milestones = readList(
    `repos/${repo}/milestones?state=all&per_page=100`,
    '.[] | {number, title} | tojson',
  ).map((l) => JSON.parse(l));
  for (const [id, def] of Object.entries(MILESTONES)) {
    const found =
      milestones.find((m) => m.title === def.title) ??
      milestones.find((m) => new RegExp(`^${id}\\b`).test(m.title));
    if (found) state.milestones.set(id, found.number);
  }
  readList(`repos/${repo}/labels?per_page=100`, '.[].name').forEach((l) => state.labels.add(l));

  // Issue types exist only for organization-owned repos.
  const ownerType = read(['api', `repos/${repo}`, '--jq', '.owner.type']);
  if (ownerType !== 'Organization') {
    state.skipped.push(
      `Issue types: ${owner} is a ${ownerType.toLowerCase()} account; GitHub issue types are only available to organizations (the type: labels still work)`,
    );
  } else {
    const res = attempt(() => readLines(['api', `orgs/${owner}/issue-types`, '--jq', '.[].name']));
    if (!res.ok) {
      state.skipped.push(`Issue types: could not read ${owner}'s issue types (${res.error})`);
    } else {
      state.issueTypes = new Set(res.value);
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
  const view = attempt(() =>
    read(['project', 'view', number, '--owner', owner, '--format', 'json']),
  );
  if (!view.ok) {
    skipped.push(
      `Project #${number}: could not open it for ${owner} (${view.error}). It needs the "project" scope: gh auth refresh -s project`,
    );
    return null;
  }
  const fields = JSON.parse(
    read(['project', 'field-list', number, '--owner', owner, '--format', 'json', '--limit', '100']),
  ).fields;
  const items = JSON.parse(
    read(['project', 'item-list', number, '--owner', owner, '--format', 'json', '--limit', '5000']),
  ).items;
  const project = {
    number,
    id: JSON.parse(view.value).id,
    title: JSON.parse(view.value).title,
    fields: new Map(),
    items: new Map(items.filter((it) => it.content?.url).map((it) => [it.content.url, it])),
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

/** gh item-list puts field values on the item under the field's name, in varying case. */
function itemValue(item, name) {
  const key = Object.keys(item).find((k) => k.toLowerCase() === name.toLowerCase());
  const value = key === undefined ? undefined : item[key];
  return value === null || value === undefined || value === '' ? null : value;
}

// ---------------------------------------------------------------------------------------------
// Planning: which issues, links and Project changes this run needs. Used by the dry run and by
// --apply, so the dry run shows exactly what a run would repair.

function plan(issues, selection, state) {
  const byId = new Map(issues.map((i) => [i.id, i]));
  const selected = issues.filter((i) => !selection || selection.has(i.milestone));
  const selectedIds = new Set(selected.map((i) => i.id));
  const onGitHub = (id) => Boolean(state?.issues.has(id));
  const willExist = (id) => onGitHub(id) || selectedIds.has(id);
  const later = [];
  const missingNote = (id) => `waits for [${id}] (${byId.get(id).milestone}, not imported yet)`;

  // A link is handled when either end is selected, so importing the later milestone links back.
  const parentLinks = [];
  const blockLinks = [];
  for (const issue of issues) {
    if (issue.parent && byId.has(issue.parent)) {
      const ends = [issue.id, issue.parent];
      if (ends.some((id) => selectedIds.has(id))) {
        const absent = ends.find((id) => !willExist(id));
        if (absent) later.push(`[${issue.id}] → parent [${issue.parent}]: ${missingNote(absent)}`);
        else parentLinks.push({ child: issue.id, parent: issue.parent, present: false });
      }
    }
    for (const ref of issue.blockedBy) {
      if (/^#\d+$/.test(ref)) {
        if (selectedIds.has(issue.id))
          blockLinks.push({ blocked: issue.id, blocker: ref, present: false });
        continue;
      }
      if (!byId.has(ref) || ![issue.id, ref].some((id) => selectedIds.has(id))) continue;
      const absent = [issue.id, ref].find((id) => !willExist(id));
      if (absent) later.push(`[${issue.id}] blocked by [${ref}]: ${missingNote(absent)}`);
      else blockLinks.push({ blocked: issue.id, blocker: ref, present: false });
    }
  }

  // Links between issues that both exist may already be there: read them (reads are cheap).
  if (state) {
    const num = (ref) =>
      ref.startsWith('#') ? Number(ref.slice(1)) : state.issues.get(ref)?.number;
    const children = new Map();
    const blockers = new Map();
    const toCheck =
      parentLinks.filter((l) => onGitHub(l.child) && onGitHub(l.parent)).length +
      blockLinks.filter((l) => onGitHub(l.blocked)).length;
    if (toCheck) console.log(`(checking ${toCheck} links between existing issues…)`);
    for (const link of parentLinks) {
      if (!onGitHub(link.child) || !onGitHub(link.parent)) continue;
      const parent = num(link.parent);
      if (!children.has(parent))
        children.set(
          parent,
          new Set(
            readList(
              `repos/${state.repo}/issues/${parent}/sub_issues?per_page=100`,
              '.[].number',
            ).map(Number),
          ),
        );
      link.present = children.get(parent).has(num(link.child));
    }
    for (const link of blockLinks) {
      if (!onGitHub(link.blocked) || num(link.blocker) === undefined) continue;
      const blocked = num(link.blocked);
      if (state.depsSupported && !blockers.has(blocked)) {
        const res = attempt(() =>
          readList(
            `repos/${state.repo}/issues/${blocked}/dependencies/blocked_by?per_page=100`,
            '.[].number',
          ),
        );
        if (!res.ok && !NOT_SUPPORTED.test(res.error)) throw new GhError(res.error);
        if (res.ok) blockers.set(blocked, new Set(res.value.map(Number)));
        else state.depsSupported = false;
      }
      // Without the dependencies API, an earlier run wrote "Blocked by #n" into the body.
      link.present = state.depsSupported
        ? blockers.get(blocked).has(num(link.blocker))
        : new RegExp(`^Blocked by #${num(link.blocker)}\\s*$`, 'm').test(
            state.issues.get(link.blocked).body ?? '',
          );
    }
  }

  // Project: add missing items, fill empty fields. Without a readable project, assume all.
  const project = state?.project;
  let projectAdds = 0;
  let fieldSets = 0;
  for (const issue of selected) {
    const values = projectValues(issue);
    const item = project && project.items.get(state.issues.get(issue.id)?.url);
    if (!item) projectAdds++;
    for (const name of PROJECT_FIELDS) {
      if (!values[name]) continue;
      if (
        project &&
        (!project.fields.has(name) || !optionFor(project.fields.get(name), values[name]))
      )
        continue;
      if (!item || !itemValue(item, name)) fieldSets++;
    }
  }

  return { selected, selectedIds, parentLinks, blockLinks, later, projectAdds, fieldSets };
}

function optionFor(field, value) {
  if (!field.options) return { text: value };
  return field.options.find((o) => o.name.toLowerCase() === String(value).toLowerCase()) ?? null;
}

/**
 * Rough wall time for n writes: each write takes about WRITE_DELAY_MS + GH_CALL_MS, and after each
 * HOURLY_WRITES batch the next one starts when the rolling hour frees up (counted as a full hour).
 */
function estimateDuration(writes) {
  const perWrite = WRITE_DELAY_MS + GH_CALL_MS;
  const firstBatch = Math.max(0, HOURLY_WRITES - writesInWindow());
  if (writes <= firstBatch) return writes * perWrite;
  const pauses = Math.ceil((writes - firstBatch) / HOURLY_WRITES);
  const lastBatch = writes - firstBatch - (pauses - 1) * HOURLY_WRITES;
  return pauses * WINDOW_MS + lastBatch * perWrite;
}

// ---------------------------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { file: 'docs/product/mvp-backlog.md', apply: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--apply') opts.apply = true;
    else if (a === '--repo') opts.repo = argv[++i];
    else if (a === '--project') opts.project = argv[++i];
    else if (a === '--milestone') opts.milestone = argv[++i];
    else if (a.startsWith('--')) usage(`unknown option ${a}`);
    else opts.file = a;
  }
  if ('repo' in opts && !/^[\w.-]+\/[\w.-]+$/.test(opts.repo ?? ''))
    usage('--repo needs owner/name');
  if ('project' in opts && !/^\d+$/.test(opts.project ?? ''))
    usage('--project needs a project number (the N in github.com/users/<you>/projects/N)');
  if ('milestone' in opts) {
    const ids = (opts.milestone ?? '')
      .split(',')
      .map((m) => m.trim().toUpperCase())
      .filter(Boolean);
    const unknown = ids.filter((m) => !MILESTONES[m]);
    if (!ids.length || unknown.length)
      usage(
        `--milestone needs a comma list of ${Object.keys(MILESTONES).join(', ')}${unknown.length ? ` (unknown: ${unknown.join(', ')})` : ''}`,
      );
    opts.selection = new Set(ids);
  }
  return opts;
}

function usage(message) {
  console.error(
    `${message}\nUsage: node backlog-to-issues.mjs [backlog.md] [--apply] [--milestone M0,M1] [--repo owner/name] [--project <number>]`,
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

const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { issues, warnings } = parseBacklog(readFileSync(opts.file, 'utf8'));
  const typesNeeded = [...new Set(issues.map((i) => TYPES[i.type]?.issueType).filter(Boolean))];

  let state = null;
  let offline = '';
  if (!attempt(() => read(['--version'])).ok) {
    offline = 'gh CLI not found';
  } else {
    try {
      state = readGitHub(opts, typesNeeded);
    } catch (err) {
      offline = `could not read the GitHub repo (${err.message.trim().split('\n')[0]})`;
    }
  }
  const existing = state?.issues ?? new Map();

  console.log(
    `${opts.apply ? 'APPLY' : 'DRY RUN'}: ${opts.file} → ${state ? state.repo : `(no repo: ${offline}; assuming nothing exists on GitHub yet)`}\n`,
  );
  if (warnings.length) {
    console.log(`Warnings (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  ! ${w}`));
    console.log('');
  }
  const p = plan(issues, opts.selection, state);
  const { selected } = p;

  const labelNames = Object.keys(LABELS);
  const newLabels = labelNames.filter((l) => !state?.labels.has(l));
  console.log(
    `Labels (${labelNames.length}): ${newLabels.length} to create, ${labelNames.length - newLabels.length} exist`,
  );
  console.log(`  ${labelNames.map((l) => `${newLabels.includes(l) ? '+' : '='}${l}`).join('  ')}`);
  const newMilestones = Object.keys(MILESTONES).filter((id) => !state?.milestones.has(id));
  console.log(`Milestones (${Object.keys(MILESTONES).length}):`);
  for (const [id, def] of Object.entries(MILESTONES)) {
    const number = state?.milestones.get(id);
    console.log(
      `  ${number ? `= #${number}`.padEnd(6) : '+'.padEnd(6)} ${def.title}: ${def.description}`,
    );
  }

  const types = Object.keys(TYPES)
    .map((t) => `${selected.filter((i) => i.type === t).length} ${t}`)
    .join(', ');
  const toCreate = selected.filter((i) => !existing.has(i.id));
  const scope = opts.selection
    ? `${selected.length} of ${issues.length} in ${[...opts.selection].join(', ')}`
    : `${issues.length}`;
  console.log(
    `Issues (${scope}: ${types}): ${toCreate.length} to create, ${selected.length - toCreate.length} exist`,
  );
  printTree(selected, (i, depth) => {
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

  const missingParents = p.parentLinks.filter((l) => !l.present).length;
  const missingBlocks = p.blockLinks.filter((l) => !l.present);
  console.log(
    `Sub-issue links: ${missingParents} to add, ${p.parentLinks.length - missingParents} already linked`,
  );
  console.log(
    `Blocked-by links: ${missingBlocks.length} to add, ${p.blockLinks.length - missingBlocks.length} already linked${state && !state.depsSupported ? ` (no dependencies API: ${missingBlocks.filter((l) => !existing.has(l.blocked)).length} go into new issues as "Blocked by #n" lines, ${missingBlocks.filter((l) => existing.has(l.blocked)).length} on existing issues can't be added because their bodies are never edited)` : ''}`,
  );
  if (p.later.length) {
    console.log(
      `Not linked yet (${p.later.length}): the other side is outside --milestone; a later import links it`,
    );
    p.later.forEach((l) => console.log(`  ~ ${l}`));
  }

  console.log('Extras:');
  if (state) {
    if (state.issueTypes)
      console.log(
        `  - Issue types: will set ${typesNeeded.filter((t) => state.issueTypes.has(t)).join(', ') || 'none'}`,
      );
    if (state.project)
      console.log(
        `  - Project #${state.project.number} "${state.project.title}": ${count(p.projectAdds, 'item')} to add, ${count(p.fieldSets, 'empty field')} to set (${[...state.project.fields.keys()].join(', ') || 'no fields'})`,
      );
    state.skipped.forEach((s) => console.log(`  - skipped: ${s}`));
  } else {
    console.log(`  - Issue types and Project fields: not checked (${offline})`);
  }
  if (!opts.project)
    console.log(
      '  - Project: not requested. Recommended: turn on the Project\'s "Auto-add to project" and "Item added → Backlog" workflows instead (SKILL.md)',
    );

  const blockWrites =
    state && !state.depsSupported
      ? new Set(missingBlocks.filter((l) => !existing.has(l.blocked)).map((l) => l.blocked)).size
      : missingBlocks.length;
  const baseWrites =
    newLabels.length + newMilestones.length + toCreate.length + missingParents + blockWrites;
  const projectWrites = p.projectAdds + p.fieldSets;
  const used = writesInWindow();
  console.log(
    `Writes (estimate): ${baseWrites} without --project (${formatDuration(estimateDuration(baseWrites))}) · ${baseWrites + projectWrites} with --project (${formatDuration(estimateDuration(baseWrites + projectWrites))})${state?.project || !opts.project ? '' : ', Project not readable so assuming every item and field'}`,
  );
  console.log(
    `  paced ≥ ${seconds(WRITE_DELAY_MS)} apart, pausing at ${HOURLY_WRITES} writes per rolling hour (${used} used in the last hour by earlier runs of this script; web UI actions also count against GitHub's 500/hour)`,
  );

  if (!opts.apply) {
    console.log(
      `\nNothing was created.${warnings.length ? ' Fix the warnings, then' : ''} Re-run with --apply to create the items marked "+" and add the missing links.`,
    );
    return;
  }
  if (warnings.length) {
    console.error('\nRefusing to apply: fix the warnings above in the backlog first.');
    process.exit(1);
  }
  if (!state) {
    console.error(
      `\n${offline}. Install gh from https://cli.github.com, run gh auth login, and push the repo to GitHub first.`,
    );
    process.exit(1);
  }
  apply(p, state);
}

function apply(p, state) {
  const { repo } = state;
  const numbers = new Map(state.issues); // ID → { number, id, url }
  const created = new Map(); // ID → { number, id, url, body }
  const done = { issues: 0, parents: 0, blocks: 0, items: 0, fields: 0 };
  const problems = [];
  let stopped = null;
  let typesOn = Boolean(state.issueTypes);

  console.log('');
  try {
    for (const name of Object.keys(LABELS)) {
      if (state.labels.has(name)) continue;
      const [color, description] = LABELS[name];
      write('POST', `repos/${repo}/labels`, { name, color, description });
      console.log(`label   + ${name}`);
    }
    for (const [id, def] of Object.entries(MILESTONES)) {
      if (state.milestones.has(id)) continue;
      state.milestones.set(id, write('POST', `repos/${repo}/milestones`, def).number);
      console.log(`milestone + ${def.title}`);
    }

    // 1. Issues, in file order.
    for (const issue of p.selected) {
      if (numbers.has(issue.id)) continue;
      const payload = {
        title: `[${issue.id}] ${issue.title}`,
        body: issue.body,
        labels: issue.labels,
        milestone: state.milestones.get(issue.milestone),
      };
      const issueType = TYPES[issue.type].issueType;
      if (typesOn && state.issueTypes.has(issueType)) payload.type = issueType;
      let res = attempt(() => write('POST', `repos/${repo}/issues`, payload));
      if (!res.ok && payload.type) {
        typesOn = false;
        state.skipped.push(
          `Issue types: GitHub rejected type "${payload.type}" (${res.error}); created the rest without types`,
        );
        delete payload.type;
        res = attempt(() => write('POST', `repos/${repo}/issues`, payload));
      }
      if (!res.ok) throw new GhError(`creating [${issue.id}] failed (${res.error})`);
      const entry = {
        number: res.value.number,
        id: res.value.id,
        url: res.value.html_url,
        body: issue.body,
      };
      numbers.set(issue.id, entry);
      created.set(issue.id, entry);
      done.issues++;
      console.log(
        `issue   + #${entry.number} ${payload.title}${payload.type ? ` (${payload.type})` : ''}`,
      );
    }

    // 2. Sub-issue links that are missing (new issues, or gaps left by an earlier run).
    for (const link of p.parentLinks) {
      if (link.present) continue;
      const child = numbers.get(link.child);
      const parent = numbers.get(link.parent);
      const res = attempt(() =>
        write('POST', `repos/${repo}/issues/${parent.number}/sub_issues`, {
          sub_issue_id: child.id,
        }),
      );
      if (res.ok) {
        done.parents++;
        console.log(`sub-issue  #${child.number} → parent #${parent.number}`);
      } else
        problems.push(
          `sub-issue #${child.number} → #${parent.number} failed (${res.error}); add it in the GitHub UI`,
        );
    }

    // 3. Blocked-by links, after all issues exist so forward references resolve.
    const fallback = new Map(); // new issue ID → ["Blocked by #n"]
    let skippedExisting = 0;
    for (const link of p.blockLinks) {
      if (link.present) continue;
      const blocked = numbers.get(link.blocked);
      let blocker = numbers.get(link.blocker);
      if (!blocker && link.blocker.startsWith('#')) {
        const res = attempt(() =>
          read([
            'api',
            `repos/${repo}/issues/${link.blocker.slice(1)}`,
            '--jq',
            '{number, id} | tojson',
          ]),
        );
        blocker = res.ok ? JSON.parse(res.value) : null;
      }
      if (!blocker) {
        problems.push(`#${blocked.number} blocked by ${link.blocker}: not found on GitHub`);
        continue;
      }
      if (state.depsSupported) {
        const res = attempt(() =>
          write('POST', `repos/${repo}/issues/${blocked.number}/dependencies/blocked_by`, {
            issue_id: blocker.id,
          }),
        );
        if (res.ok) {
          done.blocks++;
          console.log(`blocked-by #${blocked.number} ← #${blocker.number}`);
          continue;
        }
        if (!NOT_SUPPORTED.test(res.error)) {
          problems.push(`#${blocked.number} blocked by #${blocker.number} failed (${res.error})`);
          continue;
        }
        state.depsSupported = false;
        state.skipped.push(
          `Issue dependencies API not available (${res.error}); wrote "Blocked by #n" lines into the new issues instead`,
        );
      }
      if (!created.has(link.blocked)) {
        skippedExisting++;
        continue;
      }
      if (!fallback.has(link.blocked)) fallback.set(link.blocked, []);
      fallback.get(link.blocked).push(`Blocked by #${blocker.number}`);
    }
    if (skippedExisting)
      state.skipped.push(
        `${count(skippedExisting, 'blocked-by link')} for issues from earlier runs: no dependencies API, and existing issue bodies are never edited`,
      );
    for (const [id, lines] of fallback) {
      const blocked = created.get(id);
      // Editing is fine here: this issue was created a moment ago by this run.
      const res = attempt(() =>
        write('PATCH', `repos/${repo}/issues/${blocked.number}`, {
          body: `${blocked.body}\n\n${lines.join('\n')}`,
        }),
      );
      if (res.ok) {
        done.blocks += lines.length;
        console.log(`blocked-by #${blocked.number}: ${lines.join(', ')} (in body)`);
      } else
        problems.push(`#${blocked.number}: could not add "${lines.join(', ')}" (${res.error})`);
    }

    // 4. Project: add missing items and fill empty fields. Fields that already have a value are
    // never changed, so moves on the board survive a re-run.
    const project = state.project;
    if (project) {
      const optionMisses = new Set();
      for (const issue of p.selected) {
        const entry = numbers.get(issue.id);
        let item = project.items.get(entry.url);
        if (!item) {
          const add = attempt(() =>
            writeGh([
              'project',
              'item-add',
              project.number,
              '--owner',
              state.owner,
              '--url',
              entry.url,
              '--format',
              'json',
            ]),
          );
          if (!add.ok) {
            problems.push(`project: adding #${entry.number} failed (${add.error})`);
            continue;
          }
          item = { id: JSON.parse(add.value).id };
          project.items.set(entry.url, item);
          done.items++;
          console.log(`project + #${entry.number}`);
        }
        const values = projectValues(issue);
        for (const [name, field] of project.fields) {
          const value = values[name];
          if (!value || itemValue(item, name)) continue;
          const option = optionFor(field, value);
          if (!option) {
            optionMisses.add(`Project field ${name}: no option "${value}"`);
            continue;
          }
          const argv = [
            'project',
            'item-edit',
            '--id',
            item.id,
            '--project-id',
            project.id,
            '--field-id',
            field.id,
          ];
          if (option.text) argv.push('--text', option.text);
          else argv.push('--single-select-option-id', option.id);
          const res = attempt(() => writeGh(argv));
          if (res.ok) {
            done.fields++;
            item[name] = value;
          } else
            problems.push(`project: setting ${name} on #${entry.number} failed (${res.error})`);
        }
      }
      optionMisses.forEach((s) => state.skipped.push(s));
    }
  } catch (err) {
    if (!(err instanceof GhError || err instanceof RateLimited)) throw err;
    stopped = err.message;
  }

  console.log(
    `\n${stopped ? 'Stopped early' : 'Done'}: ${count(done.issues, 'issue')} created, ${count(done.parents, 'sub-issue link')} and ${count(done.blocks, 'blocked-by link')} added${state.project ? `, ${count(done.items, 'Project item')} added, ${count(done.fields, 'Project field')} set` : ''}.`,
  );
  if (p.later.length)
    console.log(
      `Not linked yet: ${p.later.length} links wait for a milestone that isn't imported (listed above).`,
    );
  if (state.skipped.length) {
    console.log('Skipped:');
    state.skipped.forEach((s) => console.log(`  - ${s}`));
  }
  if (problems.length || stopped) {
    if (problems.length) console.error('Problems:');
    problems.forEach((pr) => console.error(`  ! ${pr}`));
    if (stopped)
      console.error(
        `Stopped: ${stopped}.\nRe-run the same command to resume: existing issues are skipped, and missing links, Project items and fields are added.`,
      );
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
