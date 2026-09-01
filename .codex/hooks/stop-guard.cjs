#!/usr/bin/env node
'use strict';

const { findRepository, readHookInput, scanTasks } = require('./task-state.cjs');

const input = readHookInput();
if (input.stop_hook_active === true) {
  process.stdout.write('{}');
  process.exit(0);
}

const repository = findRepository(input.cwd || process.cwd());
const working = scanTasks(repository).filter((task) => task.status === 'CODEX_WORKING');

// Exactly one CODEX_WORKING task is strong evidence. Zero or multiple tasks are
// ambiguous, so the safe behavior is to permit stopping.
if (working.length !== 1) {
  process.stdout.write('{}');
  process.exit(0);
}

const task = working[0];
process.stdout.write(JSON.stringify({
  decision: 'block',
  reason: `Continue the active ChatGPT assignment in ${task.file} (${task.status}). Complete its required validation, reporting, handoff, and status transition before stopping. This guard will not request another continuation when stop_hook_active is true.`
}));
