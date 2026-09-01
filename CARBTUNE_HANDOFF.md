Task: CT-0056
Status: READY_FOR_CHATGPT_REVIEW

# CarbTune Handoff — Codex Hook Supervision Prototype

## Assignment and result

Implemented safe repository-local Codex lifecycle hooks for the GitHub task communication workflow. This was infrastructure-only work. No CarbTune application behavior, `index.html`, vehicle registry, or knowledge-base data changed.

- Starting SHA: `5e5c54dc4ea1719025072c003aaf4155b724498a`
- Acknowledgement SHA: `45c6a6245f55e223d20221b7921ff9ec643fa76e`
- Implementation SHA: `b155ff26fd737d1a49cc81f742fe46dae9598985`
- Deployment: not applicable; no deployed application file changed.

## Behavior

The `SessionStart` hook runs for `startup` and `resume`, safely scans bounded direct files in `tasks/`, and injects concise path/status/title context for `READY_FOR_CODEX` and `CHANGES_REQUESTED`. It never copies or executes task bodies. Missing, malformed, oversized, and unreadable inputs fail open without blocking startup.

The `Stop` hook requests continuation only when repository metadata contains exactly one `CODEX_WORKING` task. It permits stopping for zero or multiple active tasks and for review-ready, accepted, or blocked state. It always permits the second stop when `stop_hook_active` is true, preventing an infinite continuation loop.

## Files changed

- `.codex/hooks.json`
- `.codex/README.md`
- `.codex/hooks/task-state.cjs`
- `.codex/hooks/session-start.cjs`
- `.codex/hooks/stop-guard.cjs`
- `.codex/hooks/validate-hooks.cjs`
- `tasks/CT-0056_CODEX_HOOK_SUPERVISION.md` (assignment acknowledgement and completion report)
- `CARBTUNE_HANDOFF.md`

## Validation

- `node .codex/hooks/validate-hooks.cjs`: PASS — 28 hook assertions.
- Installed Windows command overrides: PASS — both exit 0 and produce the expected current repository behavior.
- `codex doctor --json`: `config.load` PASS with installed Codex `0.151.0-alpha.7.2`; overall doctor remains failed only for pre-existing Windows sandbox-helper and non-interactive terminal diagnostics.
- `npm run validate`: PASS — 5 of 5 programs, 152 workflow assertions.
- `git diff --exit-code -- index.html`: PASS.
- `git diff --check`: PASS.
- `.codex/` credential-pattern scan: PASS — no matches.

## Trust and limitations

Project hooks are intentionally not trust-bypassed. After pulling, the user must open this repository in Codex, type `/hooks`, select each entry from `.codex/hooks.json`, review its command, and choose **Trust**. Changed hook definitions require a new review because trust is hash-bound.

Lifecycle hooks cannot wake an idle or closed Codex task without a user/session event. This prototype also deliberately avoids automatic Git fetch, task mutation, recursive archive scanning, and arbitrary instruction execution. Ambiguity always permits stopping.

## Recommended next step

ChatGPT should review CT-0056 and the hook definitions. After the one-time trust action, verify pickup with a future `READY_FOR_CODEX` assignment on a fresh/resumed Codex session. Do not begin the CarbTune redesign until separately assigned.
