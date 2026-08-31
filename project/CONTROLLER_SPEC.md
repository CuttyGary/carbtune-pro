# CarbTune Controller Design Specification

## Purpose

CarbTune Controller is a future local-only project-health dashboard for Garrett, the product owner and shop expert. It will translate durable repository facts into an understandable control surface without requiring terminal or Git knowledge. CT-0053 defines this design only; it does not create or expose a network service.

## Initial dashboard

The home view should read `CARBTUNE CONTROL` and show approximately:

| Field | Durable source |
| --- | --- |
| Current Build | product/build metadata or a versioned build record |
| Current Task | `tasks/current.json` |
| Codex Status | current task status plus verified process state when available |
| Validation Status | latest locally executed or CI validation record, including command, time, and exit code |
| GitHub Sync | local and `origin/main` SHAs from a fresh fetch when available |
| ChatGPT Review Status | task `reviewStatus` |
| Latest Commit | Git HEAD SHA and subject |

Navigation should expose Ideas, Bugs, Decisions, Tests, Builds, and Research. These views read the corresponding project documents and future structured records; they must not maintain a separate hand-edited truth.

## Truth and status rules

- Repository files and Git state are authoritative. Conversation history is not a data source.
- `READY_FOR_CHATGPT_REVIEW` may be displayed only when the task requests that status and required validation has actually passed.
- A stale remote-tracking ref is not proof of GitHub synchronization. The UI must distinguish `SYNCED`, `DIVERGED`, and `UNKNOWN / NOT VERIFIED`.
- Deployment state is shown only from a verified deployment provider or CI result. Missing access produces `UNKNOWN`, never an inferred success.
- Validation records include command, start/end time, exit code, stage results, HEAD SHA, and whether the working tree was dirty.
- Blocked data acceptance cases remain blocked and visible; the controller never converts them into cosmetic passes.

## Future data flow

The first implementation can call a local process that reads `tasks/`, `project/`, Git, and validation output. A later service may normalize those facts into a local read model. Writes should occur through reviewed task/document workflows, preserve audit history, validate schemas, and never silently rewrite product decisions.

The dashboard should bind only to localhost by default. It must not store GitHub credentials, customer/VIN data, browser authentication state, or production secrets. Any future remote access requires an explicit security design and is outside CT-0053.

## Delivery stages

1. Read-only command output from `scripts/project-status.cjs`.
2. Local read-only dashboard consuming repository/task/test facts.
3. Explicit reviewed actions for task transitions and validation runs.
4. Optional CI/deployment integrations with authenticated, least-privilege providers.

Each stage must preserve honest unknown states, regression protection, and the separation between product facts, implementation activity, review, and deployment.
