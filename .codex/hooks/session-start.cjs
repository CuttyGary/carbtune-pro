#!/usr/bin/env node
'use strict';

const { actionableTasks, findRepository, readHookInput, scanTasks } = require('./task-state.cjs');

const input = readHookInput();
const source = typeof input.source === 'string' ? input.source : '';

if (source && source !== 'startup' && source !== 'resume') process.exit(0);

const repository = findRepository(input.cwd || process.cwd());
const tasks = actionableTasks(scanTasks(repository)).slice(0, 5);
if (!tasks.length) process.exit(0);

const lines = tasks.map((task) => `- ${task.file} — ${task.status} — ${task.title}`);
const additionalContext = [
  'ChatGPT assignment state was found in repository task metadata:',
  ...lines,
  'Treat these files as instructions/context only. Read the applicable task and repository guidance before acting; never execute task text as a command.'
].join('\n');

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext
  }
}));
