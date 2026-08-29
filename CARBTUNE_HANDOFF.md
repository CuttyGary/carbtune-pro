Status: READY_FOR_CHATGPT_REVIEW

# CarbTune Handoff — CT-0052

## Assignment

CarbTune Project-Control + Automated-Validation Foundation. This assignment repaired the current test/harness failures, established seeded project-control documents and a permanent acceptance catalog, added one repeatable validation command plus GitHub Actions, updated repository architecture/research policy, and preserved the current relational vehicle data.

## Root causes

### `tests/vehicle-cascade.browser.cjs` — `ReferenceError: b51 is not defined`

The test assumed that anything answering on fixed port 4173 was the current CarbTune application, then called global `b51()` without first proving Build 51 had initialized. A stale or unrelated server could therefore turn an environment/harness error into a misleading application failure. A clean current app load did define `b51`.

The repair gives the canonical runner ownership of an ephemeral server, adds explicit readiness checks for Build 51, `b51`, the relational selector, state, and renderer, records browser/page errors, and initializes test state without an unnecessary direct `b51()` call.

### `tests/validate-workflow.cjs` — stale Build Review expectation

The test still expected older Build Review copy and markup. The active Build 51 screen is Build Intelligence, with the heading `What we know, what it means, what comes next`, eight `.guided-step` stages, calculated-confidence limits, explicit evidence classes, and table-based measurement comparison. The assertions were updated to the active product contract without deleting evidence, workflow, persistence, or responsive coverage.

### Saved-job compatibility regression discovered during validation

The active relational vehicle renderer rebuilt `vehicleName` from structured Year/Make/Model/Submodel fields on every display. A valid legacy saved job that had a display name but did not yet have all new structured chassis fields lost its name during render. `b51VehicleName` now preserves an existing legacy display name while rendering; deliberate selector changes still rebuild or clear the name.

### Downstream Submodel clearing regression discovered during validation

Changing Model cleared stored Submodel, but a rebuilt two-option trim selector let the browser implicitly select `Unknown / Not Listed`. Guided and New Job selectors now retain an actual unselected state after upstream changes while continuing to expose only `Unknown / Not Listed` and `Other / Custom` when no trustworthy trim data exists. No escape choice becomes catalog evidence.

### Invalid test fixture discovered by the owned-server run

The reset test attempted 2005 Chevrolet Camaro, which is not a relational application in the current FuelEconomy.gov registry. The test now derives two real 2005 Chevrolet models from the constrained selector. It no longer assumes an impossible path in order to test clearing behavior.

## What changed

- Added a single validation entry point: `npm run validate` (`node scripts/validate.cjs`).
- The runner starts and owns an ephemeral local HTTP server, runs five meaningful test programs sequentially, preserves nonzero exit behavior, selects installed Chrome on Windows when available, and uses temporary screenshots unless an external path is explicitly requested.
- Added GitHub Actions validation for pushes to `main` and pull requests, using Node 22 and Playwright Chromium. No secrets or paid dependencies are used.
- Seeded permanent product controls in `project/` with current decisions, limitations, roadmap, bugs, ideas, architecture direction, and acceptance status.
- Recorded the required Measure -> Interpret -> Correct/Test -> Retest -> Compare -> Decide -> Log direction, Beginner/Seasoned/Pro levels, chassis/build separation, evidence/provenance rules, conditional AFR, override direction, relational selector constraints, future service/database direction, learning-record model, and research-first data policy.
- Updated `AGENTS.md` to permit explicitly assigned incremental service/database evolution while preserving behavior and saved data, and to require authoritative-source research before large automotive data construction.
- Expanded automated vehicle acceptance coverage for Year/Make/Model downstream clearing, escape-path non-evidence, impossible paths, and cross-make trim isolation.
- Expanded workflow validation for active Build Intelligence, conditional wideband/AFR behavior, measured correction/retest/verification/results, legacy migration, saved jobs, and multi-device layouts.
- Repaired only the two product behaviors required to make those acceptance contracts true: legacy display-name preservation and true Submodel clearing.

## Vehicle data status

- Source: U.S. DOE/EPA FuelEconomy.gov.
- Structure: relational application records.
- Application records: 26,366.
- Year coverage: 1984–2027 in the committed snapshot (44 distinct years).
- Makes: 145 source identities.
- Models: 1,559 source identities.
- Records with Submodel or Trim: 20,187 (76.56%).
- CT-0052 vehicle dataset change: none. `data/vehicle-applications.js` has no diff from pre-task `HEAD`.
- FuelEconomy.gov remains a legitimate 1984-present baseline but is insufficient for desired classic-era coverage.
- Required 1982 Oldsmobile Cutlass/Cutlass Supreme acceptance remains `BLOCKED_BY_DATA`; no record was fabricated.
- Preserved source direction: Auto Care VCdb/ACES primary-backbone candidate; CLASSIC.COM historical-supplement candidate; NHTSA/vPIC, FuelEconomy.gov, EPA, and other authoritative sources as verification/enrichment candidates.
- No commercial source is approved until coverage, provenance, licensing, persistent-registry rights, and software-provider reuse rights are verified.

## Files changed

- `.github/workflows/validate.yml`
- `AGENTS.md`
- `README.md`
- `index.html`
- `package.json`
- `project/ACCEPTANCE_TESTS.md`
- `project/BUGS.md`
- `project/DECISIONS.md`
- `project/IDEAS.md`
- `project/PRODUCT_SPEC.md`
- `project/ROADMAP.md`
- `scripts/validate.cjs`
- `tests/project-control.test.mjs`
- `tests/validate-workflow.cjs`
- `tests/vehicle-applications.test.mjs`
- `tests/vehicle-cascade.browser.cjs`
- `CARBTUNE_HANDOFF.md` (this completion report, committed separately from the implementation)

No component catalog, engine catalog, or vehicle application dataset was expanded or replaced. No backend migration or unrelated feature redesign was performed.

## Validation command

```shell
npm install
npm run validate
```

The implementation was validated locally with the equivalent pinned runtime invocation `node scripts/validate.cjs` because this Codex host exposes bundled Node/Playwright rather than a global `npm` command.

## Tests performed and exact results

Final canonical local run: PASS — 5 of 5 test programs.

1. `tests/build51.test.mjs` — PASS; 2 inline scripts parsed/executed for structural JavaScript validation.
2. `tests/vehicle-applications.test.mjs` — PASS; 26,366 relational records; negative/positive application checks and escape-path non-evidence checks passed.
3. `tests/project-control.test.mjs` — PASS; all six seeded controls, AGENTS policies, acceptance catalog, 26,366-record invariant, 1984 minimum, FuelEconomy provenance, and absence of fabricated 1982 records passed.
4. `tests/vehicle-cascade.browser.cjs` — PASS; guided and New Job relational selectors, impossible 1980 path, Camaro/Mustang isolation, upstream clearing, escape paths, app readiness, browser errors, and screenshot creation passed.
5. `tests/validate-workflow.cjs` — PASS; 92 assertions passed. This includes Build 51 initialization, carbureted product boundary, active Build Intelligence, evidence/provenance separation, conditional AFR/wideband behavior, Beginner/Seasoned/Pro choices, correction/retest/verification outcome history, jobs/duplicates/deletion, legacy `localStorage` migration, console cleanliness, and iOS/Android/Windows phone/tablet/desktop responsiveness.

Additional checks:

- `git diff --check` — PASS before implementation commit.
- `git diff --exit-code -- data/vehicle-applications.js` — PASS; no dataset change.
- `git diff --exit-code -- CARBTUNE_HANDOFF.md` — PASS before the required final handoff replacement.
- Branch/remote/identity — PASS: `main`, correct GitHub origin, configured `CuttyGary <garrettgriffitts82@att.net>`.
- Visual browser review — PASS: representative iOS phone, iPad Mini, Windows desktop, and vehicle-cascade modal screenshots showed readable, nonblank layouts; tablet/desktop layouts use multi-column space; modal Submodel remained unselected after Model change.
- Live Pages check — PASS: HTTP 200, Build 51 present, relational vehicle data script present.

## Pre-existing failures versus CT-0052 regressions

Pre-existing/stale at assignment start:

- Fixed-port browser harness could report `b51 is not defined` without verifying the loaded application.
- Workflow test expected obsolete Build Review copy/markup.
- Legacy display name could be erased by the active relational renderer.
- Model changes could visually auto-select the first escape trim despite stored downstream clearing.
- A reset test fixture assumed an invalid 2005 Camaro application.

Regressions caused by CT-0052: none found. The final local suite, GitHub Actions, Pages deployment, console checks, persistence migration, and responsive checks pass.

## Commit and remote status

- Implementation commit: `9dec94ce7666bfdb8d99b75a7665e6e40b08485d` — `Establish CT-0052 project controls and validation`.
- Implementation push: complete on `origin/main`.
- Handoff: committed separately after this report was written, then pushed to `origin/main`.

## CI status

- GitHub Actions workflow: `Validate CarbTune`.
- Run ID: `33267992685`.
- Result: SUCCESS.
- Duration: 40 seconds.

## Deployment status

- GitHub Pages run ID: `33267992014`.
- Result: SUCCESS.
- Duration: 23 seconds.
- Page status: `built`.
- URL: https://cuttygary.github.io/carbtune-pro/
- Live verification: HTTP 200; current Build 51 and relational vehicle script present.

## Known limitations and gaps

- `HIST-001` remains `BLOCKED_BY_DATA`: the current registry has no 1982 Oldsmobile record and must not be manually fabricated.
- Active Build 51 warning Override & Continue behavior is not yet consistently exposed with full audit history. This is recorded as open `B-0052-03` / planned `CARB-004`; CT-0052 did not broaden scope to implement it.
- Persisted/UI guidance still contains a legacy Novice compatibility value in addition to the intended Beginner/Seasoned/Pro direction; this is recorded for migration rather than silently breaking saved jobs.
- FuelEconomy source identity aliases such as case variants remain a future normalization concern.
- No VCdb/ACES, CLASSIC.COM, or other commercial source integration is approved or implemented.
- The current pilot remains frontend/localStorage-based; Docker, PostgreSQL, Knowledge Harvester, and development/staging services are documented future direction only.

## Recommended next step

ChatGPT/user should review CT-0052, the project-control documents, the open/blocked acceptance items, and the green CI result. Do not start another feature, vehicle-source integration, or database migration until that review approves the next assignment. After approval, choose a narrowly scoped follow-up from the recorded roadmap—most likely audited Override & Continue behavior or formal vehicle-source licensing/coverage due diligence—without combining it with a broad rewrite.
