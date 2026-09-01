'use strict';

const fs = require('node:fs');
const path = require('node:path');

const MAX_TASK_BYTES = 256 * 1024;
const ACTIONABLE = new Set(['READY_FOR_CODEX', 'CHANGES_REQUESTED']);

function readHookInput() {
  try {
    const text = fs.readFileSync(0, 'utf8').trim();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function findRepository(start) {
  let current = path.resolve(start || process.cwd());
  while (true) {
    if (fs.existsSync(path.join(current, 'tasks'))) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function markdownTask(file, text) {
  const status = text.match(/^\s*Status:\s*([A-Z][A-Z0-9_]*)\s*$/mi)?.[1]?.toUpperCase();
  if (!status) return null;
  const heading = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return { file, status, title: heading || path.basename(file, path.extname(file)) };
}

function jsonTasks(file, text) {
  try {
    const parsed = JSON.parse(text);
    const values = Array.isArray(parsed) ? parsed : Array.isArray(parsed.tasks) ? parsed.tasks : [parsed];
    return values.flatMap((item) => {
      if (!item || typeof item !== 'object' || typeof item.status !== 'string') return [];
      const status = item.status.trim().toUpperCase();
      if (!/^[A-Z][A-Z0-9_]*$/.test(status)) return [];
      return [{
        file,
        status,
        title: String(item.id || item.task || item.title || path.basename(file, '.json')).trim()
      }];
    });
  } catch {
    return [];
  }
}

function scanTasks(repository) {
  if (!repository) return [];
  const directory = path.join(repository, 'tasks');
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const tasks = [];
  for (const entry of entries) {
    if (!entry.isFile() || !/\.(md|json)$/i.test(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    try {
      if (fs.statSync(absolute).size > MAX_TASK_BYTES) continue;
      const text = fs.readFileSync(absolute, 'utf8');
      const relative = path.relative(repository, absolute).replaceAll('\\', '/');
      if (/\.json$/i.test(entry.name)) tasks.push(...jsonTasks(relative, text));
      else {
        const task = markdownTask(relative, text);
        if (task) tasks.push(task);
      }
    } catch {
      // An unreadable or concurrently changed task is ambiguous, so ignore it.
    }
  }
  return tasks;
}

function actionableTasks(tasks) {
  return tasks.filter((task) => ACTIONABLE.has(task.status));
}

module.exports = { actionableTasks, findRepository, readHookInput, scanTasks };
