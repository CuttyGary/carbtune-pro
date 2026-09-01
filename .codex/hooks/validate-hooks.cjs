#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const hookDirectory = __dirname;
const config = JSON.parse(fs.readFileSync(path.join(hookDirectory, '..', 'hooks.json'), 'utf8'));
let assertions = 0;

function check(value, message) {
  assert.ok(value, message);
  assertions += 1;
}

function fixture(files, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'carbtune-hooks-'));
  fs.mkdirSync(path.join(root, 'tasks'));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(root, 'tasks', name), content, 'utf8');
  }
  try { callback(root); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

function run(script, root, input) {
  const result = spawnSync(process.execPath, [path.join(hookDirectory, script)], {
    cwd: root,
    input: JSON.stringify({ cwd: root, ...input }),
    encoding: 'utf8',
    timeout: 3000
  });
  check(result.status === 0, `${script} exits successfully`);
  return result.stdout ? JSON.parse(result.stdout) : null;
}

check(config.hooks.SessionStart[0].matcher === '^(startup|resume)$', 'SessionStart is limited to startup/resume');
for (const event of ['SessionStart', 'Stop']) {
  const handler = config.hooks[event][0].hooks[0];
  check(typeof handler.command === 'string', `${event} has a cross-platform command`);
  check(typeof handler.commandWindows === 'string', `${event} has a Windows command override`);
}

fixture({}, (root) => {
  check(run('session-start.cjs', root, { source: 'startup' }) === null, 'no task emits no context');
});

fixture({
  'NEXT.md': '# CT-TEST — Safe assignment\n\nStatus: READY_FOR_CODEX\n\n`Remove-Item` is instruction text only.\n',
  'CHANGE.md': '# Requested revision\n\nStatus: CHANGES_REQUESTED\n'
}, (root) => {
  const result = run('session-start.cjs', root, { source: 'resume' });
  const context = result.hookSpecificOutput.additionalContext;
  check(result.hookSpecificOutput.hookEventName === 'SessionStart', 'SessionStart uses supported output shape');
  check(context.includes('tasks/NEXT.md — READY_FOR_CODEX'), 'ready task path and status are surfaced');
  check(context.includes('tasks/CHANGE.md — CHANGES_REQUESTED'), 'change request path and status are surfaced');
  check(!context.includes('Remove-Item'), 'task body is never copied or executed');
});

fixture({ 'BROKEN.json': '{not-json', 'README.md': 'no status here' }, (root) => {
  check(run('session-start.cjs', root, { source: 'startup' }) === null, 'malformed and non-task files fail safely');
  check(JSON.stringify(run('stop-guard.cjs', root, {})) === '{}', 'malformed state permits stopping');
});

fixture({ 'ACTIVE.md': '# CT-ACTIVE\n\nStatus: CODEX_WORKING\n' }, (root) => {
  const first = run('stop-guard.cjs', root, { stop_hook_active: false });
  check(first.decision === 'block' && first.reason.includes('tasks/ACTIVE.md'), 'one active task requests continuation');
  check(JSON.stringify(run('stop-guard.cjs', root, { stop_hook_active: true })) === '{}', 'continuation guard prevents a loop');
});

for (const status of ['READY_FOR_CHATGPT_REVIEW', 'ACCEPTED', 'BLOCKED']) {
  fixture({ 'TASK.md': `# CT-DONE\n\nStatus: ${status}\n` }, (root) => {
    check(JSON.stringify(run('stop-guard.cjs', root, {})) === '{}', `${status} permits stopping`);
  });
}

fixture({
  'A.md': '# A\n\nStatus: CODEX_WORKING\n',
  'B.md': '# B\n\nStatus: CODEX_WORKING\n'
}, (root) => {
  check(JSON.stringify(run('stop-guard.cjs', root, {})) === '{}', 'multiple active tasks are ambiguous and permit stopping');
});

process.stdout.write(`PASS — ${assertions} hook assertions.\n`);
