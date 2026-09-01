# CT-0056 — Codex Hook Supervision Prototype

Status: READY_FOR_CHATGPT_REVIEW
Owner: ChatGPT
Priority: HIGH

## Codex Work State

- Starting HEAD SHA: `5e5c54dc4ea1719025072c003aaf4155b724498a`
- UTC start timestamp: `2026-09-01T03:04:24Z`

## Goal

Build and validate a safe repository-local Codex hook prototype that reduces the user's need to manually shuttle instructions between ChatGPT and Codex.

This is infrastructure work only. DO NOT modify CarbTune application behavior or `index.html`.

## Required reading

Before work, pull latest `main` and read completely:
- `AGENTS.md`
- `CARBTUNE_HANDOFF.md`
- this task

Follow the ChatGPT Assignment Pickup Protocol in `AGENTS.md`.

## Requirements

Create a project-local `.codex/` hook implementation using the currently installed Codex hook behavior. Prefer simple, auditable scripts with no third-party dependencies.

### 1. SessionStart assignment loader

On `startup` or `resume`, safely inspect the repository's `tasks/` directory and surface concise additional context for any ChatGPT task whose status is `READY_FOR_CODEX` or `CHANGES_REQUESTED`.

The hook must:
- never edit application files;
- never automatically execute arbitrary text as shell commands;
- treat task files as instructions/context only;
- clearly identify task path and status;
- keep injected context concise;
- fail safely if Git/network is unavailable;
- not block normal Codex startup when no task exists.

If useful, the script may perform a safe `git fetch` or report that local state may be stale, but do not introduce destructive Git behavior or silently discard local work.

### 2. Stop completion guard

Prototype a Stop hook that checks the active ChatGPT task state before allowing Codex to finish.

It should request continuation only when there is strong repository evidence that the currently active task is still `CODEX_WORKING` and required completion/reporting steps remain unfinished.

It MUST avoid infinite continuation loops. Use `stop_hook_active` and/or another explicit guard. If state is ambiguous, allow Codex to stop rather than trapping the user.

Do not fabricate task completion. Do not change task status merely to satisfy the hook.

### 3. Windows compatibility

This machine is Windows. Use supported Windows commands/interpreter paths. If cross-platform command configuration is useful, include both `command` and `commandWindows` appropriately.

### 4. Trust/review

Project-local hooks require trust review. Do not bypass hook trust. Document exactly what the user will need to click/type once to trust the hooks after they are pushed.

### 5. Validation

Validate without changing application code:
- hook configuration parses/loads;
- SessionStart with no actionable task behaves safely;
- SessionStart with this actionable task surfaces the expected task context;
- Stop hook does not loop indefinitely;
- Stop hook permits stopping when task state is review-ready/accepted/blocked or ambiguous;
- scripts handle malformed/missing task files safely;
- no application files changed.

If the installed Codex version behaves differently from the supplied documentation, follow actual supported behavior and document the difference. Do not force an unsupported design.

## Deliverables

Expected scope is limited to infrastructure/docs such as:
- `.codex/hooks.json`
- `.codex/hooks/*.py` or similarly minimal scripts
- this task status/report
- `CARBTUNE_HANDOFF.md` as required by repository rules

Do not touch application functionality.

## Completion report

When complete, set this task to `Status: READY_FOR_CHATGPT_REVIEW` and record:
- starting HEAD SHA;
- implementation commit SHA(s);
- exact files changed;
- exact validation commands and results;
- how SessionStart behaves;
- how Stop behaves and how loop prevention works;
- trust/review steps the user must perform;
- limitations, especially whether an idle Codex session can be awakened without a user turn;
- confirmation that no CarbTune application code changed.

Then update `CARBTUNE_HANDOFF.md` per `AGENTS.md`, push all required commits, and STOP for ChatGPT review. Do not begin the CarbTune redesign.

## Codex Completion Report

- Starting HEAD SHA: `5e5c54dc4ea1719025072c003aaf4155b724498a`
- Acknowledgement commit: `45c6a6245f55e223d20221b7921ff9ec643fa76e`
- Implementation commit: `b155ff26fd737d1a49cc81f742fe46dae9598985`
- Deployment: not applicable; this task adds local Codex infrastructure and does not change the deployed application.

### Files changed

- `.codex/hooks.json`
- `.codex/README.md`
- `.codex/hooks/task-state.cjs`
- `.codex/hooks/session-start.cjs`
- `.codex/hooks/stop-guard.cjs`
- `.codex/hooks/validate-hooks.cjs`
- `tasks/CT-0056_CODEX_HOOK_SUPERVISION.md` (status/report only)
- `CARBTUNE_HANDOFF.md` (canonical handoff only)

No CarbTune application code, `index.html`, or vehicle/knowledge data file changed.

### Implemented behavior

`SessionStart` matches only `startup` and `resume`. It scans direct Markdown/JSON task files using bounded, dependency-free reads and reports at most five `READY_FOR_CODEX` or `CHANGES_REQUESTED` entries. Injected context contains task path, status, and title plus a safety reminder; task bodies are neither copied nor executed. Missing, malformed, oversized, or unreadable files produce no blocking output.

`Stop` requests continuation only when exactly one task is `CODEX_WORKING`. Zero or multiple active tasks are treated as ambiguous and permit stopping. Review-ready, accepted, and blocked states permit stopping. When `stop_hook_active` is true, it always returns `{}`, so a continuation cannot recursively trap the user.

### Exact validation

- `node .codex/hooks/validate-hooks.cjs` — PASS, 28 hook assertions.
- Direct installed-Windows command overrides for both scripts — PASS (exit 0; expected current-task Stop decision).
- `codex doctor --json` — `config.load: ok`; Codex `0.151.0-alpha.7.2` and stable `hooks` feature detected. Overall doctor status remains fail because of pre-existing Windows sandbox-helper and non-interactive `TERM=dumb` diagnostics, unrelated to hook parsing.
- `npm run validate` — PASS, 5 of 5 programs and 152 workflow assertions.
- `git diff --exit-code -- index.html` — PASS.
- `git diff --check` — PASS.
- Credential-pattern scan of `.codex/` — PASS, no matches.

### One-time trust action

After pulling these commits, open this repository in Codex, type `/hooks`, select each hook sourced from `.codex/hooks.json`, review its command, and choose **Trust**. Do not use `--dangerously-bypass-hook-trust`. Codex records trust against the hook-definition hash, so changed definitions require review again.

### Limitations

Hooks react only to Codex lifecycle events. They cannot wake an idle or closed Codex session without a user/session event. The prototype intentionally does not fetch GitHub automatically, recurse into task archive directories, choose between multiple `CODEX_WORKING` tasks, mutate task state, or execute task contents.
