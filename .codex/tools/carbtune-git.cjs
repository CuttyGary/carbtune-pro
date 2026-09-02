#!/usr/bin/env node
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');
const expectedRemote = 'https://github.com/CuttyGary/carbtune-pro.git';

function fail(message) {
  process.stderr.write(`CarbTune Git wrapper blocked: ${message}\n`);
  process.exit(2);
}

function git(args, capture = false) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: capture ? 'utf8' : undefined,
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      windowsHide: true
    });
  } catch (error) {
    if (capture && error.stderr) process.stderr.write(error.stderr);
    process.exit(Number.isInteger(error.status) ? error.status : 1);
  }
}

function captured(args) {
  return String(git(args, true)).trim();
}

function verifyRepository() {
  const gitEntry = path.join(repoRoot, '.git');
  if (!fs.existsSync(gitEntry)) fail('the wrapper is not inside a Git checkout');
  const topLevel = path.resolve(captured(['rev-parse', '--show-toplevel']));
  if (topLevel.toLowerCase() !== repoRoot.toLowerCase()) {
    fail(`repository root mismatch (${topLevel})`);
  }
  const remote = captured(['remote', 'get-url', 'origin']);
  if (remote !== expectedRemote) fail(`unexpected origin remote (${remote})`);
}

function repositoryPath(input) {
  if (!input || input.includes('\0')) fail('invalid empty or NUL-containing path');
  if (input.startsWith('-')) fail(`path cannot begin with an option (${input})`);
  const resolved = path.resolve(repoRoot, input);
  const relative = path.relative(repoRoot, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    fail(`path escapes the CarbTune repository (${input})`);
  }
  return relative || '.';
}

verifyRepository();

const [operation, ...args] = process.argv.slice(2);
switch (operation) {
  case 'status':
    if (args.length) fail('status accepts no additional arguments');
    git(['status', '--short', '--branch']);
    break;
  case 'diff':
    if (args.length > 1 || (args.length === 1 && args[0] !== '--cached')) {
      fail('diff accepts only the optional --cached argument');
    }
    git(['diff', ...(args.length ? ['--cached'] : [])]);
    break;
  case 'log': {
    if (args.length > 1 || (args[0] && !/^\d+$/.test(args[0]))) {
      fail('log accepts only an optional positive count');
    }
    const count = args[0] ? Number(args[0]) : 10;
    if (count < 1 || count > 100) fail('log count must be between 1 and 100');
    git(['log', `-${count}`, '--oneline', '--decorate']);
    break;
  }
  case 'add':
    if (!args.length) fail('add requires one or more repository-relative paths');
    git(['add', '--', ...args.map(repositoryPath)]);
    break;
  case 'commit': {
    if (args.length !== 1) fail('commit requires exactly one message argument');
    const message = args[0].trim();
    if (!message || message.length > 200 || /[\r\n]/.test(message)) {
      fail('commit message must be one line between 1 and 200 characters');
    }
    git(['commit', '-m', message]);
    break;
  }
  case 'fetch':
    if (args.length) fail('fetch accepts no additional arguments');
    git(['fetch', 'origin']);
    break;
  case 'pull':
    if (args.length) fail('pull accepts no additional arguments');
    git(['pull', '--ff-only', 'origin', 'main']);
    break;
  case 'push':
    if (args.length) fail('push accepts no additional arguments');
    if (captured(['branch', '--show-current']) !== 'main') {
      fail('push is allowed only from the main branch');
    }
    git(['push', 'origin', 'main']);
    break;
  default:
    fail('operation must be status, diff, log, add, commit, fetch, pull, or push');
}
