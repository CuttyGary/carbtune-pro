# CarbTune Codex hooks

These repository-local hooks provide conservative supervision for the GitHub task handoff workflow. They inspect task metadata only and never execute task contents or edit repository files.

- `SessionStart` runs on `startup` and `resume`. It reports up to five direct `tasks/*.md` or `tasks/*.json` entries with status `READY_FOR_CODEX` or `CHANGES_REQUESTED` as concise developer context. Missing, malformed, oversized, or unreadable files are ignored safely.
- `Stop` requests one continuation only when exactly one task has status `CODEX_WORKING`. It emits an empty success object for all ambiguous or terminal states and whenever Codex sets `stop_hook_active`, preventing a continuation loop.

Run the dependency-free checks with:

```text
node .codex/hooks/validate-hooks.cjs
```

## One-time trust review

Codex deliberately skips new or changed project hooks until the exact definitions are reviewed. After pulling this commit, open this repository in Codex, type `/hooks`, select the two hooks from `.codex/hooks.json`, review their commands, and choose **Trust** for each. Do not use the hook-trust bypass flag. A later change to a hook definition changes its hash and requires another review.

Hooks run only during an existing Codex lifecycle event. They cannot wake an idle or closed Codex session without a user/session event.
