Task: CT-0060
Status: READY_FOR_CHATGPT_REVIEW

# CarbTune Handoff — Shop-grade vehicle, job history, and configuration foundation

## Result

CT-0060 is implemented on the latest post-CT-0059 `main` without PostgreSQL, a fake backend, authentication, or a frontend rewrite. CarbTune now persists versioned Vehicle Records separately from jobs, groups returning visits when identity evidence supports it, retains immutable per-job configuration snapshots, and offers a fast returning-vehicle/new-job workflow.

- Starting SHA: `434223fff7a489d1f0e060cdc7ff8626de9a05e1`
- In-progress acknowledgement: `1b11af0`
- Implementation SHA: `2cb90855e5465acf37b19a2425fe3c5c80bd1764`
- Handoff SHA: `dd9c271e40a20fa29de373284b79255eb3dbafd4`
- CI: `Validate CarbTune` run `33682568897` completed successfully.
- Deployment: Pages run `33682567918` completed successfully.

## What changed

- Added `carbtune.vehicle-record`, `carbtune.vehicle-configuration-snapshot`, `carbtune.actor-reference`, and `carbtune.audit-event` schemas at v1 under contract envelope `2.0.0`; the CT-0059 job/validation schemas remain compatible.
- Vehicle Records retain stable ID/revision, independent chassis and installed engine, optional VIN/customer reference/notes, provenance, timestamps, archive state, job relationships, snapshots, current-configuration pointer, and audit events.
- Odometer values are appendable job observations with timestamp/source/actor, never a silently overwritten vehicle value.
- Legacy localStorage jobs derive Vehicle Records idempotently. Existing links or supplied matching VIN can group visits; otherwise each no-VIN legacy job remains separate rather than guessing physical identity.
- Starting a return visit deep-clones the current known configuration into a new job and snapshot. Historical jobs/snapshots remain unchanged. Vehicle archive preserves jobs; confirmed Delete Job remains job-scoped and repairs vehicle relationships.
- Jobs/Home now shows returning vehicles, useful job history, current configuration, and `New Job for Vehicle` in technician language. New visits skip repeated vehicle/build entry where known.
- Actor/audit foundations accept explicit local technician or `UNKNOWN`; no authenticated-user claim is made.

## Validation evidence

- `npm run validate`: PASS, all 6 canonical programs.
- Vehicle registry/provenance: PASS, 35,036 combined relational records, 1955–2027.
- Service-contract tests: PASS for migration/idempotence, one vehicle/multiple jobs, immutable snapshots, chassis/engine separation, unknowns, job odometer observations, archive, stable IDs/relationships, and known/unknown attribution.
- Vehicle/Chassis browser regressions: PASS for guided and modal selectors.
- Workflow/persistence/browser suite: PASS, 165 assertions, including return-visit UX, unchanged old job, snapshot/relation reload, legacy compatibility, duplicate/delete safeguards, CT-0059 stale/current validation rules, responsive layouts, and zero browser-console errors.
- `node --check data/service-contracts.js` and `git diff --check`: PASS.

## Known limitations

- localStorage remains authoritative and single-device. PostgreSQL, APIs, synchronization/conflict handling, tenancy, authentication, permissions, backups, and production data operations are future work.
- Migration links no-VIN jobs only when a relationship already exists. CarbTune intentionally does not guess that similar chassis descriptions identify the same physical vehicle.
- Archive behavior is implemented and contract-tested but no additional archive administration UI was added; this keeps the technician workflow focused.
- Customer/reference, vehicle notes, tires, and some component domains are contract-ready where current UI data exists; CT-0060 does not add administrative intake fields merely to populate them.
- Human field acceptance of the relational selector remains outstanding from prior work; no manual result was fabricated.

## CT-0058 approval anomaly

- Exact operation: `node .codex/tools/carbtune-git.cjs pull` in the repository root.
- Request/failure: restricted sandbox denied `.git/FETCH_HEAD`; the same protected wrapper command required explicit narrow escalation.
- Expected coverage: yes, CT-0058 and `docs/codex-permissions.md` explicitly describe protected wrapper pull as the unattended path.
- Appropriate correction: investigate the project-local execpolicy/wrapper elevation match for fresh cloned workspaces. Any correction should remain repository-scoped; no machine-wide weakening is appropriate.
- Fresh-clone identity gap: wrapper commit initially failed because the clone had no author identity. The established repository identity was passed only to the wrapper process; no global/local Git config or broader permission was added.

## Exact files changed

- `data/service-contracts.js`
- `docs/architecture.md`
- `docs/service-contracts.md`
- `index.html`
- `project/ACCEPTANCE_TESTS.md`
- `project/DECISIONS.md`
- `project/ROADMAP.md`
- `tasks/current.json`
- `tasks/completed/CT-0060.json`
- `tests/service-contracts.test.mjs`
- `tests/validate-workflow.cjs`
- `CARBTUNE_HANDOFF.md`

## Review gate

ChatGPT should review CT-0060 against the persistent Vehicle Record, immutable configuration history, migration, validation-lifecycle, and technician-workflow requirements. Do not begin CT-0061 automatically.
