# CarbTune Durable Task System

`tasks/current.json` contains the one active task or `null`. Finished records move to `tasks/completed/<task-id>.json`; work that cannot proceed moves to `tasks/blocked/<task-id>.json`. Git history is the audit trail for transitions.

## Schema

Each task is a JSON object with these fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `schemaVersion` | integer | Task schema version, currently `1` |
| `id` | string | Stable ID such as `CT-0053` |
| `title` | string | Short assignment title |
| `status` | enum | `PLANNED`, `IN_PROGRESS`, `BLOCKED`, `READY_FOR_CHATGPT_REVIEW`, `ACCEPTED`, or `FAILED` |
| `createdDate` | `YYYY-MM-DD` | Date the durable task was opened |
| `scope` | string | Assignment boundary |
| `objectives` | string array | Required outcomes |
| `constraints` | string array | Safety, compatibility, and non-goals |
| `acceptanceTests` | object array | IDs and expected results, with honest status/evidence |
| `implementationNotes` | string array | Important implementation facts and rationale |
| `validation` | object | Command, status, exit code, date, and summary |
| `filesChanged` | string array | Tracked files added or changed |
| `commitSha` | string or `null` | Verified implementation SHA |
| `deploymentStatus` | string | Verified state or `NOT_APPLICABLE`/`NOT_VERIFIED` |
| `blockers` | string array | Current blockers; empty means none known |
| `reviewStatus` | string | ChatGPT/product-owner review state |

Optional completion metadata may include `completedDate` and `handoffCommitSha`. Unknown facts use `null`, `UNKNOWN`, or `NOT_VERIFIED`; they are never guessed. A task can request `READY_FOR_CHATGPT_REVIEW` only after required validation passes. `ACCEPTED` is reserved for the reviewer/product owner.

## Operating flow

1. Seed the assignment in `current.json` as `PLANNED`, then transition it to `IN_PROGRESS` when work begins.
2. Update acceptance evidence and validation from actual commands, not expected outcomes.
3. Move an irrecoverably blocked task to `blocked/` with its blocker and status `BLOCKED`.
4. After implementation validation and commit, move completed work to `completed/` as `READY_FOR_CHATGPT_REVIEW`; set `current.json` to `null`.
5. A later review may change the completed record to `ACCEPTED` or return a new narrowly scoped task.

Use `npm run project:status` for a read-only summary. It does not treat a task status as proof that validation or deployment occurred.
