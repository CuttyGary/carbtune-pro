# CT-0061 review corrections — implementation report

Scope: CT61-R1 and CT61-R2 from `docs/CT-0061-review.md`. Original review notes remain unchanged. This report requests review of the fixes; it does not self-accept CT-0061.

## Safety evidence

The most recent observed fuel leak remains an unresolved hazard across all configuration revisions until a new inspection supplies both its method/areas checked and the repair or factual correction. A clearance observation references the hazard ID. Both observations remain append-only with actor, time, configuration fingerprint and dependency revision.

Live readings require a current clearance inspection. Missing inspection, legacy inspection without the new method metadata, or stale clearance blocks both visible controls and the recording handler. An unrelated configuration edit cannot clear a known leak; a resolved leak followed by a configuration edit requires reinspection. Stack and reports retain the unresolved concern. A fresh inspection also requires new live readings, rather than silently reusing measurements from a previous safety context.

## Test recipes

Existing `BASELINE_TESTS` procedures in `index.html` supply the scope of the structured condition recipes. Common facts capture thermal/running state, stationary transmission state, accessory load, choke/fast-idle state and instrument suitability/check. Each measurement requires its applicable location; initial timing additionally records vacuum-advance state and AFR records warmed/calibrated sensor and exhaust validity. No new numerical target, manufacturer claim or catalog record was introduced.

Readings retain a versioned snapshot of their condition facts, freeform instrument/context notes and safety inspection ID. Missing or incompatible conditions preserve the observation with explicit validity issues but do not satisfy the gate. A newer invalid result supersedes an older valid result for current verification. Zero RPM cannot verify a running-idle test. Numerical abnormality remains separate from recipe validity: valid abnormal fuel pressure still completes factual requirements.

Pre-revision evidence remains readable and unchanged. Missing structured recipe metadata is not invented; the affected measurement requires fresh evidence. Legacy job/storage schemas and immutable configuration snapshots remain unchanged.

## Validation on 2026-10-27

- Full `node scripts/validate.cjs`: PASS, all seven canonical programs.
- Default redesign browser suite: 108 assertions (previously 78), zero unexpected browser errors.
- Legacy workflow browser suite: 165 assertions; relational vehicle cascade also passed.
- JavaScript integrity, vehicle registry/provenance (35,036 combined records), project controls, migration/history/service contracts: PASS.
- `node --check ui/redesign.js`, `node --check tests/redesign.browser.cjs`, and `git diff --check`: PASS.
- Every destination checked at 1440, 820 and 390 px without horizontal page overflow. Generated desktop and phone Baseline screenshots inspected.

Regressions exercise missing safety clearance in controls and handler; unrelated/relevant configuration changes, reversal and reload with an unresolved hazard; rejected empty inspection and missing repair evidence; append-only resolution links; report concern visibility; original cold/engine-off reproduction; missing/unsuitable instruments; invalid source/location, advance and wideband facts; later invalid measurements superseding valid ones; legacy observations without invented metadata; valid abnormal completion and persistence; architecture alternatives for absent choke/vacuum advance; and retained duplicate/delete/return-visit/history behavior.

## Limits and review gate

This remains the CT-0061 workflow foundation. Recipes validate explicit technician facts; freeform notes are retained as notes, not interpreted into verified setup. The application cannot independently verify instrument calibration or physical vehicle conditions. Safety coverage remains the representative fuel-leak condition. Full graph reasoning, learned zones, fine-grained dependencies and successful finalization remain outside these corrections. Human shop acceptance is pending.

Implementation is on `design/knowledge-graph-v1` only. No main merge or deployment is authorized or performed. Exact implementation SHA is recorded in the separate handoff commit. Next action: review the correction evidence against R1/R2 and decide CT-0061 acceptance; issue CT-0062 only after acceptance.
