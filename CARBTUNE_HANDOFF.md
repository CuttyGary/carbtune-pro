Task: CT-0061
Status: READY_FOR_CHATGPT_REVIEW

# CarbTune Handoff — Redesign shell and workflow foundation

## Result and review scope

CT-0061 is implemented on `design/knowledge-graph-v1` as the first reviewable redesign milestone. The default entry opens the approved dark application shell, contextual vehicle/RO strip, left workspace navigation and warm light work sheet. The primary workflow now has distinct Customer/RO, Vehicle/Drivetrain, Modifications, As-Found Configuration, Baseline Verification, Dynamic Stack, Overview and Report destinations.

- Starting design HEAD: `4c1c54fae254208cffaefcee39c1397b901f4f60`.
- Authoritative resumed assignment: `origin/main` at `b15923a`.
- Acknowledgement commit: `5b1df13`.
- Implementation commit: `b9e3702ad6ea9b9f061ac23966eee4e19a156153`.
- Required design inputs: `docs/CARBTUNE_BLUEPRINT.md`, `docs/CARBTUNE_KNOWLEDGE_GRAPH.md`, `docs/CARBTUNE_IMPLEMENTATION_CONTRACT.md`.
- Main was not merged with application changes. No production deployment is authorized by this task.

## What changed and why

The former primary UI coupled page navigation with completion and exposed manual warning overrides. The new workflow separates navigation from evidence completion: technicians can inspect any workspace without declaring a system passed or a job complete.

- Added isolated visual tokens and responsive layout in `ui/redesign.css`.
- Added a workflow adapter in `ui/redesign.js` that reuses existing job, vehicle, component, compatibility, deletion, numbering and storage services.
- Page 1 records customer/visit/RO facts and document references. Document ingestion is explicitly unavailable.
- Page 2 reuses the exact relational chassis selectors and independent installed-engine selectors, with drivetrain/load fields.
- Page 3 provides eight progressive domains. Unreviewed sections are never silently treated as verified stock. Component categories retain independent compatibility filtering and repeated custom-entry open/close behavior.
- Page 4 derives manual-choke and vacuum-secondary questions from the selected verified carburetor record. Missing manufacturer stock calibration remains unknown.
- Page 5 records observations with actual conditions, technician, time, provenance and replacement reason. Valid abnormal readings satisfy factual completion without an override; missing and implausible readings do not. Invalid drafts remain visible for correction.
- The representative Stack responds to missing evidence, observed fuel leaks and abnormal fuel pressure, and presents Objective → Evidence → Action → Verification → Outcome. Safety action takes precedence over other evidence collection.
- Overview and Report use stored facts and disclose unresolved evidence. Printing is available. Finalization cannot declare success while verified terminal-outcome processing is not implemented.
- Completed visits are read-only in the new factual forms. Active/history Delete Job retains the existing confirmation and cleanup service.
- Existing sample data is explicitly labeled as a demonstration.

## Storage and history preservation

Existing localStorage keys and CT-0059/CT-0060 contract schemas are unchanged. An optional additive `redesign` object stores page location, visit fields, as-found settings, drafts, append-only observations and audit history. Initial legacy baseline readings are retained separately as historical evidence.

Each new observation carries a configuration fingerprint and monotonic dependency revision. Changing configuration makes prior dependent evidence stale without deleting it. Returning to an earlier configuration cannot revive invalidated observations. Existing CT-0059 validation records are also invalidated when configuration or new evidence changes.

Return visits use the CT-0060 Vehicle Record and immutable snapshot service. They receive a new sequential RO and fresh observation set. New freeform as-found settings remain job-scoped; automatic carry-forward of those additional notes is not implemented.

## Sources and data integrity

No vehicle/component catalog records or numerical specifications were added. Existing DOE/EPA and NHTSA relational data remains unchanged: 35,036 combined application records covering 1955–2027, as verified by the existing registry suite. No new claim of catalog completeness was made.

Component architecture comes from the existing provenance-bearing component catalog. Baseline starting windows reuse existing CarbTune definitions and are labeled inference, not manufacturer specifications or verified installed-combination targets. Technician notes and measurements retain separate provenance. No source research was required for this UI/workflow milestone.

## Validation evidence

- `node scripts/validate.cjs`: PASS, all 7 canonical programs.
- JavaScript integrity: PASS, 2 inline scripts and the new external redesign module checked.
- Registry/provenance and project controls: PASS.
- Versioned service contracts: PASS, including migration/idempotence, returning jobs, immutable snapshots, relationships and validation truth.
- Legacy vehicle cascade browser suite: PASS.
- Legacy workflow/browser suite: PASS, 165 assertions.
- Redesigned default-entry browser suite: PASS, final 78 assertions. The final safety-action precedence correction was followed by a successful focused rerun and syntax checks.
- New tests cover all eight destinations; actual vehicle/technician context; conditional component questions; per-category filters; repeated custom-entry toggling; no click-through evidence override; plausible abnormal completion; invalid-entry retention; append-only corrections; stale-evidence non-revival; persistence; completed-job read-only forms; return visits; snapshot preservation; sequential numbers across deletion; duplicate warning; confirmed deletion and Jobs/Home return.
- Responsive assertions: every destination at 1440px, 820px and 390px has no horizontal page overflow.
- Desktop and iPhone screenshots were directly inspected, including the Stack. Low-contrast deletion styling was corrected.
- Browser errors: zero unexpected console/page errors in the tested flows.
- `node --check` for the new module, browser test and runner, plus `git diff --check`: PASS.
- The CLI named by the browser skill was unavailable; the repository's installed Playwright browser provided automated coverage and screenshot inspection.

The runner explicitly tests `?workflow=legacy` for the retained reference workflow and separately tests the redesigned default URL. Old workflow assertions are not being presented as proof of redesigned behavior.

## Known limits

- Full graph traversal, anti-loop/freeze/learned-zone reasoning, automatic calibration prescriptions and successful terminal-outcome/finalization processing are not implemented in this milestone.
- Configuration invalidation conservatively affects the baseline set; fine-grained node dependency selection remains future work.
- Fuel-leak handling is one representative safety condition, not an exhaustive mechanical/safety rule engine.
- Document upload/extraction is not connected; only explicit references/transcriptions are recorded.
- The catalog lacks exact stock carburetor calibration for the supported records; the UI says so.
- localStorage remains the single-device authority. No backend, PostgreSQL, authentication or synchronization was introduced.
- Human technician acceptance is pending; automated checks do not establish manual product acceptance.

## Files changed

- `index.html`
- `ui/redesign.js`
- `ui/redesign.css`
- `scripts/validate.cjs`
- `tests/build51.test.mjs`
- `tests/project-control.test.mjs` (recognizes task statuses required by the assignment protocol)
- `tests/redesign.browser.cjs`
- `docs/CT-0061-implementation.md`
- `project/ACCEPTANCE_TESTS.md`
- `tasks/current.json`
- `CARBTUNE_HANDOFF.md`

## Delivery and next action

Latest assignment pickup check: 2026-09-11 20:23:32 UTC. A protected fetch found no new commits or review assignment: `origin/main` remained at `b15923a8fa37e39daaeba9e4eab2abf87d500e82`, and the design branch remained at review handoff `24c0fb6a641e20ed0dfe01ba09309d1207da6e97`. Both task inventories were inspected. Main's `READY_FOR_CODEX` record is the already-implemented request; it is not a new change request. CT-0061 remains `READY_FOR_CHATGPT_REVIEW`. This pickup changes only this handoff audit note; application code and deployment are unchanged. Existing implementation test evidence above is retained, not claimed as a new full test run. The prior local preview's availability was not rechecked during this pickup.

Implementation commit `b9e3702ad6ea9b9f061ac23966eee4e19a156153` was pushed and verified on `origin/design/knowledge-graph-v1`. `origin/main` remains `b15923a8fa37e39daaeba9e4eab2abf87d500e82`. This handoff is a separate documentation commit following the implementation.

Production deployment: NOT APPLICABLE for this branch-only review assignment. The existing validation workflow triggers pushes to main or pull requests; no design-branch CI execution is claimed. A local review preview is running at `http://127.0.0.1:4173`, bound only to this machine, and an app browser panel was requested. It is not a production deployment and uses its own browser-origin storage.

ChatGPT should review the design branch and the explicit milestone limits, then request manual desktop/iPhone acceptance. Do not merge to main or begin another feature without a subsequent assignment.
