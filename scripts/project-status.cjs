const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));
const shouldFetch = args.has('--fetch');
const shouldValidate = args.has('--validate');

function command(executable, commandArgs, options = {}) {
  const result = spawnSync(executable, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : 'pipe',
    env: process.env
  });
  return {
    ok: !result.error && result.status === 0,
    status: result.status,
    output: `${result.stdout || ''}${result.stderr || ''}`.trim(),
    error: result.error ? result.error.message : null
  };
}

function git(...commandArgs) {
  return command('git', commandArgs);
}

function value(result, fallback = 'UNKNOWN') {
  return result.ok && result.output ? result.output : fallback;
}

function readTask() {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'tasks', 'current.json'), 'utf8'));
  } catch {
    return null;
  }
}

let fetchResult = null;
if (shouldFetch) fetchResult = git('fetch', 'origin', '--prune');

const branch = git('branch', '--show-current');
const head = git('rev-parse', 'HEAD');
const subject = git('log', '-1', '--format=%s');
const status = git('status', '--porcelain');
const localMain = git('rev-parse', 'main');
const originMain = git('rev-parse', 'origin/main');

let sync = 'UNKNOWN / NOT VERIFIED';
if ((!shouldFetch || fetchResult?.ok) && localMain.ok && originMain.ok) {
  sync = localMain.output === originMain.output ? 'SYNCED' : 'DIVERGED';
}

let validation = { status: 'NOT RUN', exitCode: null };
if (shouldValidate) {
  const result = command(process.execPath, [path.join(root, 'scripts', 'validate.cjs')], { inherit: true });
  validation = { status: result.ok ? 'PASSED' : 'FAILED', exitCode: result.status };
}

const task = readTask();
const taskStatus = task?.status || 'NO CURRENT TASK';
const readiness = taskStatus === 'READY_FOR_CHATGPT_REVIEW' && validation.status === 'PASSED'
  ? 'READY_FOR_CHATGPT_REVIEW (VALIDATED THIS RUN)'
  : 'NOT VERIFIED';

const report = {
  branch: value(branch),
  head: `${value(head)}${subject.ok ? ` ${subject.output}` : ''}`,
  workingTree: status.ok ? (status.output ? 'DIRTY' : 'CLEAN') : 'UNKNOWN',
  originFetch: shouldFetch ? (fetchResult?.ok ? 'PASSED' : 'FAILED') : 'NOT RUN',
  originSync: sync,
  validation,
  taskId: task?.id || null,
  taskStatus,
  reviewStatus: task?.reviewStatus || 'UNKNOWN',
  readiness
};

console.log('\nCarbTune Project Status');
for (const [key, reportValue] of Object.entries(report)) {
  console.log(`${key}: ${typeof reportValue === 'object' ? JSON.stringify(reportValue) : reportValue}`);
}

if (shouldFetch && !fetchResult?.ok) {
  console.error(`Fetch detail: ${fetchResult?.output || fetchResult?.error || 'UNKNOWN'}`);
}

if (validation.status === 'FAILED') process.exitCode = validation.exitCode || 1;
