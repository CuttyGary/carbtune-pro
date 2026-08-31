Task: CT-0055
Status: READY_FOR_CHATGPT_REVIEW

# CarbTune Handoff — CT-0055 Product-Owner Field Test Repair

## Commits and deployment

- Baseline SHA: `6afc4298cc619f32821ae50b16563b6b503754cc`
- Implementation SHA: `5ca9207a8ae8620435d2695f867f41521a57569e`
- Final handoff SHA: not representable inside its own commit; verify with `git log -1 --format=%H -- CARBTUNE_HANDOFF.md` after push.
- GitHub Actions: run `33390665449`, success for the implementation SHA.
- GitHub Pages: run `33390663646`, success for the implementation SHA.

## Field-test defects resolved

- New Job now carries chassis and installed-engine identity into Build without forcing chassis re-entry. A concise vehicle summary remains editable.
- Sourced Year + Make + Model records can continue when the source supplies no useful trim. Unknown/custom trim remains non-evidentiary.
- Custom / Not Listed chassis entry supports pre-1984 work while explicitly labeling the identity technician-entered/unverified and never creating compatibility.
- The mobile modal uses a safe-area-aware sticky action footer; the iPhone-sized browser test proves Create New Job remains reachable with no horizontal overflow.
- Operating Context now handles actual touch, renders `aria-pressed`/selected state, persists through reload, and remains structured verification evidence.
- Carburetor New Job entry is case-insensitive and punctuation/spacing-normalized. `BR-67255`, `br67255`, and equivalent forms find the same record; selection preserves canonical `BR-67255`. Identification and compatibility remain separate messages. Unknown text stays unverified.
- The visible engine-catalog bullet mojibake is repaired and the workflow source is regression-scanned for similar corruption.
- An overridden CT-0054 advisory renders as an `OPEN CONCERN` with original evidence; hard stops and incomplete required actions remain blockers.
- Current guidance vocabulary is Beginner / Seasoned / Pro. Legacy saved `Novice` deterministically loads as Beginner while historical override audit values remain `Novice`.
- Other observation text persists. Common run-on/dieseling aliases suggest the structured `Engine run-on / dieseling after key-off` symptom and require technician confirmation.

## Diagnostic state and behavior

The saved job now normalizes a durable `diagnostic.tests` collection and terminal outcome. Supported diagnostic states are:

`NOT_TESTED`, `TEST_RECOMMENDED`, `TEST_PERFORMED`, `RESULT_RECORDED`, `INTERPRETED`, `RULED_OUT`, `SUSPECT`, `CORRECTION_RECOMMENDED`, `CORRECTION_PERFORMED`, `RETEST_REQUIRED`, `RETESTED`, `VERIFIED`, and `UNRESOLVED`.

Tests and corrections are different evidence kinds. The accelerator-pump path asks for one of five structured discharge observations instead of asking what the technician did. Immediate/strong evidence rules out that branch where justified; delayed, weak/intermittent, or no discharge makes pump delivery suspect and recommends correcting linkage clearance/actuation without inventing an adjustment dimension. Confirming that prescribed correction requires the same specific pump-shot retest and stores the prior result with the retest for before/after comparison. A completed/rule-out branch is not immediately recommended again.

The numeric fuel-delivery path explicitly requests idle PSI and 2500 RPM PSI, stores both values and their delta, and does not fabricate a manufacturer specification. Technician notes and Other / Custom action remain available but are supplemental.

Terminal outcomes are `VERIFIED_REPAIR`, `NO_FAULT_FOUND`, `UNRESOLVED`, and `ADDITIONAL_REPAIR_REQUIRED`. Final results retain complaint, baseline, structured tests/results, corrections, retests, before/after evidence, open concerns, overrides, and notes.

Beginner pump guidance explains engine-off visibility, air-cleaner removal as required, primary nozzle observation, manual linkage movement, immediate onset, strength, continuity, and delay. Seasoned is shorter; Pro is compact. The existing `ONE NEXT ACTION • confidence`, What we observed, What it means, and Why this vehicle card pattern is preserved.

## Tests and exact results

`tests/validate-workflow.cjs` increased from 126 to 152 browser assertions. New coverage includes all CT55-001 through CT55-038 field-test IDs: chassis carry-forward, absent trim, custom historical chassis, sticky mobile action, real touch/context persistence, carb normalization/canonical identity, identification-vs-compatibility, mojibake, structured pump and fuel-pressure evidence, no immediate repeated test, correction/retest comparison, terminal state, open concern vs hard stop, symptoms/Other/run-on, guidance levels/migration, CT-0054 audit integrity, optional AFR, and existing relational safeguards.

Baseline:

```text
npm run validate
PASS — 5 of 5 programs; 126 workflow assertions.
```

Two consecutive final runs:

```text
npm run validate
npm run validate
PASS / PASS — each run passed 5 of 5 programs and 152 workflow assertions.
```

Both runs passed JavaScript syntax (2 inline scripts), 26,366 relational vehicle records, project control/data policy, relational browser cascades, and workflow/persistence/provenance/responsive browser tests. Desktop and phone/tablet matrices had no horizontal overflow and preserved touch targets. Browser console errors: none. Credential scan: no matches. `git diff --check`: pass.

## Data and backward compatibility

`data/vehicle-applications.js` and `data/knowledge-base.js` are unchanged. No pre-1984 application, fabricated trim, fabricated component, or false compatibility was added. `VEHICLE-007` remains `BLOCKED_BY_DATA` pending an approved historical source.

Older jobs without diagnostic tests receive migration-safe defaults. Existing localStorage, legacy change/verification history, chassis/build separation, duplicate prevention, confirmed deletion, CT-0054 override evidence, component provenance, conditional AFR, and relational cascades remain passing.

## Known gaps and recommended CT-0056

- CT-0055 provides deterministic structured diagnostic branches, not a general knowledge-learning service. PostgreSQL, Knowledge Harvester, general NLP, and expanded manufacturer rule sets remain out of scope.
- Custom chassis identity enables work but provides no sourced compatibility. Historical source acquisition remains separate.
- Additional component-specific structured test/correction definitions should be added incrementally only with verified rules and browser evidence.

Recommended CT-0056: after ChatGPT/product-owner accepts CT-0055, expand the closed-loop definition catalog to the next highest-value verified diagnostic branches and add explicit reopen-reason UI for materially new evidence. Do not begin that work from this handoff.
