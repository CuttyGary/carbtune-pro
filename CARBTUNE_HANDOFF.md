Task: CT-0059
Status: READY_FOR_CHATGPT_REVIEW

# CarbTune Handoff — Stabilization, validation truth, and service boundaries

## Result

CT-0059 is implemented without a frontend rewrite or backend deployment. The existing technician workflow and localStorage keys remain operational. A versioned adapter now persists validation truth and defines future service boundaries while preventing old, changed, superseded, invalidated, missing, or unknown evidence from driving current verified state.

- Starting SHA: `dd63b46e50d3e221ec10e6957140e5c4347aa46c`
- In-progress acknowledgement: `769f926`
- Implementation SHA: `aa35ce0256cb0085045851bb8d08ae858460186b`
- CI/deployment: pending push and GitHub Actions observation at this handoff-writing stage.

## What changed

- Added `carbtune.validation-result` schema version 1 with explicit type, result, lifecycle, timestamp, source, related subject, deterministic subject fingerprint, evidence references, supersession, and invalidation fields.
- Only a current `PASS` with known origin, valid timestamp, matching current subject, and no supersession/invalidation can render as current verified state.
- Legacy verification outcomes remain preserved evidence with `UNKNOWN` lifecycle. New road-test/dyno sessions receive linked structured records. Related tune/component changes invalidate current records; changed chassis/engine identity fails the fingerprint check and normalizes to `STALE`.
- Added `carbtune.service-boundary` v1 for Job, Vehicle/Chassis, Installed Engine, Components, Baseline measurements, Diagnostic findings, Recommended corrections, Performed corrections, Retest/verification results, and Technician evidence/media references.
- Added a documented idempotent, audited, reversible localStorage-to-PostgreSQL migration sequence. No database, mock backend, or service deployment was created.
- Expanded relational selector coverage for historical applications, downstream resets, missing trims, escape paths, and explicit 1983 Oldsmobile chassis vs Ford engine-swap separation.

## Validation evidence

- `npm run validate`: PASS, 6 programs.
- Vehicle provenance: PASS, 35,036 combined relational records, 1955-2027.
- Versioned contract suite: PASS for current proof, legacy unknown, supersession, staleness, invalidation, required domains, and chassis/engine separation.
- Vehicle cascade browser suite: PASS for guided and modal selectors.
- Workflow/persistence/browser suite: PASS, 158 assertions, including persisted validation evidence, legacy migration, no stale green, responsive layouts, and no browser-console errors.
- `git diff --check`: PASS.

## Known limitations / future decisions

- Human field acceptance of the relational selector remains required; no manual result was fabricated.
- PostgreSQL deployment, API implementation, authentication/tenancy, retention/deletion policy, media storage, synchronization conflicts, backup/restore, and production operations remain future scoped work.
- The v1 service snapshot is a transfer boundary, not a second persistence store. localStorage remains authoritative in this batch.
- CT-0058 permission policy and protected Git wrapper are unchanged.

## Files changed

- `data/service-contracts.js`
- `docs/architecture.md`
- `docs/service-contracts.md`
- `index.html`
- `project/ACCEPTANCE_TESTS.md`
- `project/DECISIONS.md`
- `project/ROADMAP.md`
- `scripts/validate.cjs`
- `tasks/current.json`
- `tasks/completed/CT-0059.json`
- `tests/service-contracts.test.mjs`
- `tests/validate-workflow.cjs`
- `tests/vehicle-cascade.browser.cjs`
- `CARBTUNE_HANDOFF.md`

## Review gate

ChatGPT should review CT-0059 against the structured validation truth and incremental architecture requirements. Do not begin CT-0060 or another feature automatically.
