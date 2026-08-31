Task: CT-0053
Status: READY_FOR_CHATGPT_REVIEW

# CarbTune Handoff — CT-0053

## Assignment and result

CT-0053 established the Project Control + Automation Foundation. The repository is now the durable source of truth for product rules, decisions, roadmap, bugs, ideas, acceptance cases, active/completed/blocked tasks, validation, and cross-agent handoff. No CarbTune application feature or UI behavior was redesigned.

- Baseline SHA: `5259194dc5c97926a9fcb5e409be113239ada4f2`
- Implementation SHA: `e9f4282f653d8aa3999afadd577f6d28b359193d`
- Final documentation/handoff SHA: not representable inside the commit that creates this report; verify the commit containing this file with `git log -1 --format=%H -- CARBTUNE_HANDOFF.md`. It is reported externally after push.

## What was implemented

- Improved the six permanent `project/` controls and preserved established product rules: carbureted shop scope, conditional AFR, chassis/build separation, separate manufacturer/CarbTune/technician facts, Measure -> Interpret -> Correct/Test -> Retest -> Compare -> Decide -> Log, Beginner/Seasoned/Pro levels, audited override direction, relational vehicles, research-first data construction, explicit provenance/confidence, compatibility versus suitability, and measured outcome learning.
- Added exact durable acceptance IDs `VEHICLE-001` through `VEHICLE-007`, `WORKFLOW-001`, `CARB-001`, `DIAG-001`, `DATA-001`, and `DATA-002`, retaining honest automated/planned/blocked states.
- Added the simple versioned task system under `tasks/`, seeded CT-0053, and finalized it at `tasks/completed/CT-0053.json`; `tasks/current.json` is now `null`.
- Added `docs/development.md` for the verified dedicated Windows baseline: Node.js 24 LTS family, npm/npx, Git, Git Credential Manager, Playwright/Chromium, CuttyGary authentication, installation, validation, and security rules. No secrets are stored.
- Added repository `.gitignore` coverage for `node_modules/`, ordinary validation output, editor files, logs, and local environment files without broadly ignoring source.
- Kept `npm run validate` as the single canonical command and added explicit stage names while preserving all tests and genuine exit behavior.
- Updated GitHub Actions to Node 24, `npm install`, Playwright Chromium with Linux dependencies, and the same `npm run validate` command.
- Added `npm run project:status` (`scripts/project-status.cjs`) to report branch, HEAD, working tree, optional fresh origin sync, optional actual validation, current task/review status, and honest unknown/not-verified states. It cannot claim review readiness without validation in the same run.
- Added `project/CONTROLLER_SPEC.md` for a future localhost-only `CARBTUNE CONTROL` dashboard driven by durable task/Git/test evidence.
- Documented the incremental architecture path: dedicated machine -> validation -> project control -> PostgreSQL -> services/API -> Knowledge Harvester -> dev/staging -> secure production.
- Documented Knowledge Harvester shared collector infrastructure, required evidence states, provenance fields, component relationship graph, and compatibility/suitability separation.
- Documented source candidates without claiming access or licensing: Auto Care VCdb/ACES, CLASSIC.COM, NHTSA/vPIC, FuelEconomy.gov, EPA historical sources, and SEMA Data.

## Deliberately not implemented

- No application UI/product functionality change.
- No broad backend rewrite, PostgreSQL database, API/service, Knowledge Harvester implementation, Controller UI, dev/staging service, or public exposure of the development machine.
- No component catalog expansion or giant automotive database.
- No commercial source access/license claim and no restricted marketplace scraping.
- No customer, VIN, shop-sensitive, authentication, token, password, or cookie data.
- No implementation of planned `CARB-004` audited Override & Continue behavior or Novice vocabulary migration; those remain separately scoped future work.

## Files added/changed

Implementation commit:

- `.github/workflows/validate.yml`
- `.gitignore`
- `README.md`
- `docs/architecture.md`
- `docs/development.md`
- `docs/knowledge-ingestion.md`
- `package.json`
- `project/ACCEPTANCE_TESTS.md`
- `project/BUGS.md`
- `project/CONTROLLER_SPEC.md`
- `project/DECISIONS.md`
- `project/IDEAS.md`
- `project/PRODUCT_SPEC.md`
- `project/ROADMAP.md`
- `scripts/project-status.cjs`
- `scripts/validate.cjs`
- `tasks/README.md`
- `tasks/blocked/.gitkeep`
- `tasks/completed/.gitkeep`
- `tasks/current.json`
- `tests/project-control.test.mjs`

Final handoff commit:

- `CARBTUNE_HANDOFF.md`
- `tasks/current.json`
- `tasks/completed/CT-0053.json`

`index.html`, `data/knowledge-base.js`, and `data/vehicle-applications.js` were unchanged.

## Validation commands and exact results

Baseline at `5259194dc5c97926a9fcb5e409be113239ada4f2`:

```shell
git fetch origin --prune
npm run validate
```

Result: PASS — local `main` matched `origin/main`; all 5 test programs passed; workflow suite passed 92 assertions.

Post-change canonical validation was run twice:

```shell
npm run validate
npm run validate
```

Both results: PASS — 5 of 5 test programs each time.

1. JavaScript / syntax integrity — PASS; 2 inline scripts parsed/executed.
2. Vehicle registry and provenance integrity — PASS; 26,366 relational application records and source/data invariants passed.
3. Project control and data-policy integrity — PASS; durable documents/tasks, exact acceptance IDs, truthful automation, Node 24 CI, ignore rules, policies, and unchanged vehicle baseline passed.
4. Relational vehicle cascade browser regressions — PASS; guided/modal selectors and required clearing/isolation/escape-path cases passed.
5. Workflow, persistence, provenance, and UI smoke regressions — PASS; 92 assertions covering initialization, carbureted boundary, evidence separation, conditional AFR, workflow/Tune Log/retests, jobs/duplicates/deletion, legacy localStorage migration, console cleanliness, and responsive layouts.

Additional checks:

- `node tests/project-control.test.mjs` — PASS after the second canonical run and before implementation commit.
- `npm run project:status` — PASS; correctly reported dirty working tree, validation `NOT RUN`, task `IN_PROGRESS`, and readiness `NOT VERIFIED`.
- `npm run project:status -- --fetch` — PASS; fetch succeeded and sync reported `SYNCED` without inventing validation readiness.
- `git diff --check` / staged diff check — PASS after correcting new-file EOF formatting.
- `git diff --exit-code -- data/vehicle-applications.js index.html data/knowledge-base.js` — PASS; no data or application-code change.
- Credential-like pattern scan of CT-0053 files — no matches.

## Acceptance-test results

- `VEHICLE-001` through `VEHICLE-006` — AUTOMATED/PASS through existing vehicle tests.
- `VEHICLE-007` — remains `BLOCKED_BY_DATA`; no 1982 Oldsmobile record was fabricated.
- `WORKFLOW-001`, `CARB-001`, `DIAG-001`, `DATA-001`, and `DATA-002` — AUTOMATED/PASS.
- `CARB-004` — remains PLANNED; CT-0053 did not falsely mark active warning override auditing complete.
- CT-0053 control and validation acceptance — PASS.

## GitHub sync, CI, and deployment

- Implementation push: VERIFIED. After fetch, local `main` and `origin/main` both resolved to `e9f4282f653d8aa3999afadd577f6d28b359193d`.
- GitHub Actions `Validate CarbTune` run `33351587159`: VERIFIED SUCCESS for the implementation SHA.
- GitHub Pages run `33351586536`: VERIFIED SUCCESS for the implementation SHA.
- Final handoff push/sync: verified after creating this report and reported externally; the implementation cannot truthfully pre-state the future commit SHA.

## Vehicle data and source status

- `data/vehicle-applications.js` remains unchanged: 26,366 FuelEconomy.gov relational records, normalized coverage beginning in 1984.
- Classic-era coverage remains insufficient; required 1982 Oldsmobile Cutlass/Cutlass Supreme acceptance is blocked.
- Candidate sources are research directions only. No commercial coverage, license, persistent-registry right, or software-provider reuse right was claimed or acquired.

## Known gaps

- `B-0052-03` / `CARB-004`: active Build 51 audited Override & Continue remains open.
- `B-0052-04`: backward-compatible Novice -> Beginner/Seasoned/Pro vocabulary migration remains open.
- `B-0052-05`: FuelEconomy source identity/casing normalization remains future ingestion work.
- `B-0052-06` / `VEHICLE-007`: pre-1984 vehicle coverage remains blocked by approved data.
- Project status is currently an on-demand read-only collector; persistent signed validation history and the Controller UI are future work.
- PostgreSQL, application services/API, Knowledge Harvester, dev/staging, and secure production architecture remain documented roadmaps, not implementations.

## Decisions for ChatGPT/product-owner review

1. Accept or revise the durable roles and repository-source-of-truth decisions (`D-011` through `D-013`).
2. Accept the task schema/status lifecycle and completed-task placement.
3. Confirm Node 24 LTS as the supported local/CI family.
4. Confirm the future Controller remains read-only/local-first before adding reviewed actions.
5. Choose whether the next scoped assignment addresses audited Override & Continue or vehicle-source licensing/coverage due diligence.

## Recommended CT-0054

Prefer one narrowly scoped task after ChatGPT review: implement and regression-test audited Override & Continue behavior (`B-0052-03` / `CARB-004`). If product review prioritizes historical coverage instead, CT-0054 should be source licensing/coverage due diligence only—not source integration or manual record construction. Do not combine either choice with a broad backend rewrite.
