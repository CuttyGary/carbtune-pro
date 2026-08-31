# CarbTune Pro Permanent Acceptance Test Catalog

This catalog is durable product evidence, not a release checklist that is reset per task. Status values are `AUTOMATED`, `MANUAL`, `BLOCKED_BY_DATA`, or `PLANNED`. Automated evidence must name a test that genuinely exercises the requirement.

## Vehicle cascade

| ID | Acceptance requirement | Status | Automated evidence |
| --- | --- | --- | --- |
| VEHICLE-001 | 1980 Hyundai must not offer or construct Elantra from catalog selections. | AUTOMATED | `tests/vehicle-applications.test.mjs`, `tests/vehicle-cascade.browser.cjs` |
| VEHICLE-002 | A Chevrolet Camaro must not receive Ford Mustang trims/submodels. | AUTOMATED | Both vehicle tests |
| VEHICLE-003 | Changing Year clears dependent Make, Model, and Submodel selections. | AUTOMATED | `tests/vehicle-cascade.browser.cjs` |
| VEHICLE-004 | Changing Make clears Model and Submodel. | AUTOMATED | `tests/vehicle-cascade.browser.cjs` |
| VEHICLE-005 | Changing Model clears Submodel. | AUTOMATED | `tests/vehicle-cascade.browser.cjs` |
| VEHICLE-006 | `Unknown / Not Listed` and `Other / Custom` do not establish component or vehicle compatibility. | AUTOMATED | Both vehicle tests and workflow custom-component checks |
| VEHICLE-007 | 1982 Oldsmobile Cutlass/Cutlass Supreme remains unavailable until an approved provenance-bearing historical source provides coverage. | BLOCKED_BY_DATA | Current normalized FuelEconomy.gov data begins in 1984. `tests/project-control.test.mjs` proves 1982 remains absent. Never fabricate a record merely to satisfy this test. |
| VEHICLE-008 | Guided and New Job selectors use the same relational application source; no global fallback vehicle vocabularies are allowed. | AUTOMATED | `tests/vehicle-cascade.browser.cjs` |

## Workflow, carburetion, and persistence

| ID | Acceptance requirement | Status | Automated evidence |
| --- | --- | --- | --- |
| WORKFLOW-001 | Existing saved jobs and `localStorage` remain compatible after application upgrades. | AUTOMATED | `tests/validate-workflow.cjs` legacy migration and persistence assertions |
| CARB-001 | A carbureted vehicle baseline must not require AFR when no actual AFR/wideband sensor is installed. | AUTOMATED | `tests/validate-workflow.cjs` |
| CARB-002 | Explicitly enabling an available wideband adds AFR to the baseline evidence set; removing it removes the requirement. | AUTOMATED | `tests/validate-workflow.cjs` |
| CARB-003 | Manufacturer baseline, CarbTune recommendation, and successful technician setting remain separately labeled. | AUTOMATED | `tests/validate-workflow.cjs`, structural checks |
| CARB-004 | Appropriate warnings provide Override & Continue with value, reason, technician intent, timestamp, and retained audit history. | PLANNED | Open bug `B-0052-03`; do not mark accepted until active Build 51 behavior and tests exist. |
| DIAG-001 | Diagnostic work follows Measure -> Interpret -> Correct/Test -> Retest -> Compare -> Decide -> Log. | AUTOMATED | Sequential workflow and Tune Log/retest assertions in `tests/validate-workflow.cjs` |

## Data, provenance, and product boundaries

| ID | Acceptance requirement | Status | Automated evidence |
| --- | --- | --- | --- |
| DATA-001 | Missing source data remains missing rather than being invented. | AUTOMATED | Vehicle registry invariants, unknown/custom paths, and project-control checks |
| DATA-002 | Manufacturer specification, CarbTune calculated recommendation, and actual successful technician setting remain distinguishable. | AUTOMATED | Workflow evidence/provenance assertions |
| DATA-003 | Physical compatibility and performance suitability are separate decisions with their own evidence. | AUTOMATED | Build Intelligence workflow assertions |
| DATA-004 | Important sourced records can retain source, source type, source record ID when available, retrieval date, confidence, and verification status. | PLANNED | Knowledge schema/harvester roadmap; full registry enforcement awaits service work |
| PROD-001 | Product remains carbureted and contains no EFI calibration workflow. | AUTOMATED | `tests/validate-workflow.cjs` |
| PROD-002 | Chassis/original vehicle identity and installed engine/build identity persist separately. | AUTOMATED | `tests/validate-workflow.cjs` |
| PROD-003 | Beginner, Seasoned, and Pro guidance choices remain available. | AUTOMATED | `tests/validate-workflow.cjs` |
| PROD-004 | Duplicate prevention and confirmed Delete Job safeguards remain intact. | AUTOMATED | `tests/validate-workflow.cjs` |
| PROD-005 | Phone/tablet/desktop layouts avoid horizontal overflow, retain touch targets, and tablets use width intentionally. | AUTOMATED | Responsive matrix in `tests/validate-workflow.cjs` |

## Validation policy

The canonical command is:

```shell
npm run validate
```

It must exit `0` only when every configured stage succeeds and nonzero when syntax, registry, project-control, browser, persistence, provenance, or responsive checks fail. The runner reports each test program before executing it so the failing stage is visible. Manual, planned, and `BLOCKED_BY_DATA` items are reported honestly and are never converted into fake automated passes.
