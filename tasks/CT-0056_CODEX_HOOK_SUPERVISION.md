# CT-0056 — Codex Hook Supervision Prototype

Status: READY_FOR_CODEX
Owner: ChatGPT
Priority: HIGH

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
