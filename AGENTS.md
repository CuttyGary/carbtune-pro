# CarbTune Pro Development Rules

These instructions apply to the entire repository.

## Preserve Existing Behavior

- Do not remove, disable, or substantially change a working feature unless the user explicitly requests it.
- Prefer focused, backward-compatible changes over broad rewrites.
- Preserve working behavior and saved-data compatibility, but CarbTune may evolve incrementally toward proper database and service architecture when explicitly assigned. Avoid reckless full rewrites.
- Preserve the duplicate-safe job system, including duplicate detection, merge handling, job identity, and safeguards against accidental duplicate records.
- Preserve the existing **Delete Job** behavior, including its confirmation and active/history job handling. Do not weaken its safeguards.

## Data and Domain Model

- Preserve compatibility with existing `localStorage` job data wherever reasonably possible.
- When changing stored data, normalize or migrate older records safely. Use defaults for new fields and avoid making existing saved jobs unreadable.
- Keep vehicle chassis identity independent from the installed engine identity. Engine-swap vehicles must retain both the chassis/application data and the installed engine/family data without one overwriting the other.
- Keep manufacturer-verified specifications clearly separate from CarbTune-generated tuning inference, recommendations, or interpretation.
- Prefer verified manufacturer or component data when available. Retain source attribution and verification metadata, and label manual or inferred data honestly.

## Research Before Large Data Construction

- Before manually constructing a large automotive taxonomy, catalog, compatibility, fitment, or specification database, research mature automotive systems and authoritative sources first.
- Evaluate authoritative public datasets, documented APIs, automotive industry standards, legitimately reusable structured data, and licensable commercial datasets.
- Prefer suitable existing structured sources over manually recreating mature automotive datasets.
- Preserve source, provenance, retrieval information, verification status, licensing/reuse restrictions, and conflicting evidence.
- Never invent missing data or bypass authentication, CAPTCHA, paywalls, or access controls.

## Validation and Git Workflow

- Validate all JavaScript before every push. At minimum, perform a syntax check on the JavaScript embedded in `index.html`; also exercise affected behavior when practical.
- Validate the complete change before committing or pushing. Review the diff and confirm that unrelated features and saved-job compatibility remain intact.
- Commit and push only after validation succeeds.
- Do not push a knowingly broken or partially validated change to `main`.
- If validation cannot be completed, report the blocker instead of committing or pushing.

### Protected unattended Git path

- In Codex sessions, use direct Git commands for read-only operations. For Git metadata writes and network synchronization, run the protected repository wrapper from the repository root: `node .codex/tools/carbtune-git.cjs <operation>`.
- Supported wrapper operations are `status`, `diff [--cached]`, `log [count]`, `add <repository-relative paths...>`, `commit "one-line message"`, `fetch`, `pull`, and `push`. The wrapper pins the CarbTune origin/main workflow and rejects destructive options, path escapes, unrelated remotes, and unsupported operations.
- Do not bypass the wrapper with full-access flags or broaden its project-local execpolicy rule. See `docs/codex-permissions.md` for the exact boundary and installed-platform limitation.

## ChatGPT Assignment Pickup Protocol

- GitHub is the communication bus between ChatGPT and Codex. Do not require the user to copy full assignments between them when the assignment already exists in the repository.
- At the beginning of every Codex work session or whenever the user says to check for ChatGPT work, pull/fetch the latest `main` and inspect `tasks/` for ChatGPT-authored assignments with an actionable status.
- Treat `Status: READY_FOR_CODEX` or `Status: CHANGES_REQUESTED` as authorization to execute that task, subject to the scope and safeguards written in the task.
- Before changing application code, update the task to `Status: CODEX_WORKING`, record the starting HEAD SHA and UTC start timestamp, commit/push that acknowledgement when practical, then perform the work.
- If the task conflicts with `AGENTS.md`, `CARBTUNE_HANDOFF.md`, an explicit product-owner decision, or another active task, stop and record `Status: BLOCKED` with the conflict rather than guessing.
- When implementation and required validation are complete, update the task to `Status: READY_FOR_CHATGPT_REVIEW` and include implementation commit SHA(s), files changed, tests/results, known limitations, deployment state, and any decision ChatGPT must review.
- Do not begin a different unassigned CarbTune task after completing an assignment. Stop at the review gate unless the active assignment explicitly authorizes continuation.
- `Status: ACCEPTED` means ChatGPT has accepted the task. `Status: CHANGES_REQUESTED` means Codex should read the latest review notes and continue the same task rather than creating a new interpretation of it.
- Never overwrite ChatGPT review notes or product-owner decisions. Append or update only the Codex-owned status/report portions unless the assignment explicitly instructs otherwise.

## Permanent ChatGPT <-> Codex Handoff

- `CARBTUNE_HANDOFF.md` is the canonical handoff between ChatGPT, Codex, and the user. Read it before every assignment so prior implementation state, tests, limitations, deployment, and next action are not lost.
- At completion of every task, replace its active report with a complete, self-contained report for that task. This applies to implementation, documentation, research, diagnosis, and no-change work.
- Use `Status: READY_FOR_CHATGPT_REVIEW` only when the requested work and validation are complete and ready for review. Otherwise record the blocker accurately.
- Include, where applicable: assignment/scope, what changed, root cause/rationale, exact sources/provenance, record and coverage counts, research, tests with exact results, limitations/gaps, files changed, implementation commit SHA, deployment status, and recommended next step.
- Distinguish verified facts from inference. Never invent counts, tests, provenance, SHAs, or deployment success. Mark unavailable/inapplicable fields explicitly.
- For code/data work, create and validate the implementation commit first. Then put that exact SHA in `CARBTUNE_HANDOFF.md` in a separate handoff documentation commit; a commit cannot truthfully contain its own SHA. Push both commits.
- For research/no-change tasks, record `N/A` for implementation/deployment fields and still commit/push the handoff update unless the user explicitly prohibits repository changes.
- Before the final push, review the handoff diff against actual repository/validation state. After pushing, verify the expected remote branch and mark deployment verified, pending, failed, or not applicable.
- Never change CarbTune functionality merely to make the report look complete. Record pre-existing failures and manual-acceptance gates honestly.
