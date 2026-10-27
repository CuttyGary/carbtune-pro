Task: CT-0061
Status: READY_FOR_CHATGPT_REVIEW

# CarbTune Handoff — safety and baseline-evidence corrections

Completed: 2026-10-27. Branch: design/knowledge-graph-v1.
Scope: resolve CT61-R1 and CT61-R2 from docs/CT-0061-review.md. Original reviewer notes and decision are preserved in that file and tasks/current.json.reviewerReview. This delivery requests review and does not self-accept the milestone.

## Result

CT61-R1: unresolved observed fuel leaks persist independently of configuration freshness. Live measurement controls and the recording handler require a current clearance inspection. Clearing an earlier leak requires method/areas checked and repair or factual correction evidence, appended with a reference to the hazard ID. Configuration edits, reversal and reload cannot clear an unresolved concern. Stack and reports reflect the safety requirement.

CT61-R2: each measurement captures versioned factual test setup plus notes and its safety inspection ID. Missing/incompatible setup stays in append-only history with validity issues and does not count toward baseline completion. A later invalid result supersedes earlier valid evidence. Valid abnormal measurements still satisfy factual completion. Legacy evidence receives no invented recipe facts and must be remeasured to become current.

Source/rationale: the existing BASELINE_TESTS procedures in index.html and the three approved design/contract documents. No manufacturer specifications, numerical targets, catalog entries or source claims added. See docs/CT-0061-corrections.md for architecture and limitations.

## Exact implementation

Starting revision HEAD: c3c9547c95c0350a7ce15452efe1dd4c7a09b9bf.
Acknowledgement: 7d05c5a (CODEX_WORKING, UTC start recorded in task).
Original redesign implementation: b9e3702ad6ea9b9f061ac23966eee4e19a156153.
Correction implementation: ae78d07ee682635362c3560aa01855ece01d88d1.
This report is a separate handoff commit after the validated implementation commit.

## Fresh validation

Full node scripts/validate.cjs: PASS, all seven canonical programs on 2026-10-27.
- JavaScript integrity: PASS, two inline scripts and redesign module.
- Vehicle registry/provenance: PASS, 35,036 combined records, unchanged.
- Project controls and service-contract/migration/history/validation truth checks: PASS.
- Vehicle cascade browser suite: PASS.
- Legacy workflow browser suite: PASS, 165 assertions.
- Default redesign browser suite: PASS, 108 assertions (30 added), zero unexpected console/page errors.
- node --check ui/redesign.js, node --check tests/redesign.browser.cjs, git diff --check: PASS.
- All eight destinations avoid horizontal overflow at 1440, 820 and 390 px. Desktop and phone Baseline screenshots directly inspected.

Regressions cover the original two reproductions, handler enforcement, hazard persistence/resolution audit links, invalid recipe variants, valid abnormal completion, supersession, legacy evidence preservation, reload, read-only history, return visits, duplicate RO checks and confirmed deletion. Bundled Playwright with installed Chrome used; no dependency or lockfile changes.

## Storage, limitations and review gate

Additive observation metadata only; saved job/storage schemas and historical snapshots are unchanged. Prior evidence without recipe metadata remains historical and unverified. A new safety inspection conservatively requires fresh live readings. Technician facts are the evidence source; freeform notes are not parsed into verified setup. No independent physical instrument/vehicle verification is claimed.

Fuel leaks remain the representative safety condition. Full graph traversal, fine-grained dependency selection, learned zones, freeze/anti-loop reasoning and successful terminal/finalization handling remain outside CT-0061. Human technician acceptance remains pending.

Files changed: ui/redesign.js, tests/redesign.browser.cjs, docs/CT-0061-corrections.md, project/ACCEPTANCE_TESTS.md, tasks/current.json, CARBTUNE_HANDOFF.md.
Deployment: NOT APPLICABLE. No main merge or deployment performed. Production main verified at b15923a8fa37e39daaeba9e4eab2abf87d500e82 before work. Protected design-branch push/remote verification follows this handoff commit.
Next action: reviewer checks R1/R2 evidence and decides CT-0061 acceptance. Prepare executable CT-0062 diagnostic reasoning/dynamic tuning intelligence assignment only after acceptance. Do not start another unassigned feature or merge/deploy.
