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
| VEHICLE-007 | 1982 Oldsmobile Cutlass/Cutlass Supreme and ordinary 1983 manufacturers are available only through provenance-bearing relational records. | AUTOMATED | `tests/vehicle-applications.test.mjs`, `tests/vehicle-cascade.browser.cjs`; the unchanged 1984+ FuelEconomy.gov seed is augmented by official NHTSA historical applications and exact attributed supplements. |
| VEHICLE-008 | Guided and New Job selectors use the same relational application source; no global fallback vehicle vocabularies are allowed. | AUTOMATED | `tests/vehicle-cascade.browser.cjs` |

## Workflow, carburetion, and persistence

| ID | Acceptance requirement | Status | Automated evidence |
| --- | --- | --- | --- |
| WORKFLOW-001 | Existing saved jobs and `localStorage` remain compatible after application upgrades. | AUTOMATED | `tests/validate-workflow.cjs` legacy migration and persistence assertions |
| CARB-001 | A carbureted vehicle baseline must not require AFR when no actual AFR/wideband sensor is installed. | AUTOMATED | `tests/validate-workflow.cjs` |
| CARB-002 | Explicitly enabling an available wideband adds AFR to the baseline evidence set; removing it removes the requirement. | AUTOMATED | `tests/validate-workflow.cjs` |
| CARB-003 | Manufacturer baseline, CarbTune recommendation, and successful technician setting remain separately labeled. | AUTOMATED | `tests/validate-workflow.cjs`, structural checks |
| CARB-004 | Appropriate advisory warnings provide deliberate Override & Continue; preserve abnormal value, warning/expected/recommended context, intent, optional reason, guidance, timestamp, job/workflow identity, continuation, persistence, and Tune Log history. Technically implausible hard stops remain explicitly non-overridable. | AUTOMATED | `tests/validate-workflow.cjs` exercises actual browser behavior for Beginner, Seasoned, Pro, compatible Novice, save/reload, in-range values, and hard stops. Resolved in CT-0054. |
| DIAG-001 | Diagnostic work follows Measure -> Interpret -> Correct/Test -> Retest -> Compare -> Decide -> Log. | AUTOMATED | Sequential workflow and Tune Log/retest assertions in `tests/validate-workflow.cjs` |

## CT-0055 live field-test acceptance

All automated evidence below is exercised through the real page in `tests/validate-workflow.cjs`; vehicle relational invariants also run in both vehicle suites.

| ID | Acceptance requirement | Status |
| --- | --- | --- |
| CT55-001 | New-job chassis data carries forward without duplicate required entry. | AUTOMATED |
| CT55-002 | Missing sourced submodel does not block continuation. | AUTOMATED |
| CT55-003 | Unknown/custom submodel does not establish compatibility. | AUTOMATED |
| CT55-004 | Pre-1984 custom chassis remains technician-entered/unverified. | AUTOMATED |
| CT55-005 | Mobile Create New Job action remains reachable. | AUTOMATED |
| CT55-006 | Operating Context responds to touch. | AUTOMATED |
| CT55-007 | Operating Context selected state is visible. | AUTOMATED |
| CT55-008 | Operating Context survives save/reload as structured evidence. | AUTOMATED |
| CT55-009 | Carb type-ahead filters while typing. | AUTOMATED |
| CT55-010 | Carb search is case-insensitive. | AUTOMATED |
| CT55-011 | Carb search normalizes punctuation/spacing. | AUTOMATED |
| CT55-012 | Known carb selection preserves canonical identity. | AUTOMATED |
| CT55-013 | Unknown carb does not fabricate a known record. | AUTOMATED |
| CT55-014 | Identification and verified compatibility remain distinct. | AUTOMATED |
| CT55-015 | Tested workflow has no visible mojibake. | AUTOMATED |
| CT55-016 | Completed diagnostic test stores a structured result. | AUTOMATED |
| CT55-017 | Completed test is not immediately recommended without justified reopen/retest. | AUTOMATED |
| CT55-018 | Accelerator-pump result changes diagnostic state. | AUTOMATED |
| CT55-019 | Normal pump-shot evidence can rule out that branch. | AUTOMATED |
| CT55-020 | Abnormal pump-shot evidence produces a correction path. | AUTOMATED |
| CT55-021 | Correction leads to a specific retest. | AUTOMATED |
| CT55-022 | Retest preserves before/after evidence. | AUTOMATED |
| CT55-023 | Prescribed correction does not require free-text “what changed.” | AUTOMATED |
| CT55-024 | Free-text custom action remains available. | AUTOMATED |
| CT55-025 | Overridden warning renders as an open concern, not blocker. | AUTOMATED |
| CT55-026 | Hard stops remain blockers. | AUTOMATED |
| CT55-027 | Structured symptoms persist. | AUTOMATED |
| CT55-028 | Other technician observation persists. | AUTOMATED |
| CT55-029 | Confirmed run-on/dieseling becomes structured evidence. | AUTOMATED |
| CT55-030 | Diagnostic workflow has explicit terminal states. | AUTOMATED |
| CT55-031 | Beginner guidance explains procedure. | AUTOMATED |
| CT55-032 | Seasoned guidance remains concise. | AUTOMATED |
| CT55-033 | Pro guidance remains compact. | AUTOMATED |
| CT55-034 | Legacy Novice jobs migrate compatibly. | AUTOMATED |
| CT55-035 | CT-0054 override audits remain compatible. | AUTOMATED |
| CT55-036 | AFR remains conditional on actual wideband availability. | AUTOMATED |
| CT55-037 | Vehicle registry relational protections remain green. | AUTOMATED |
| CT55-038 | Prior tests remain green except transparently replaced behavior. | AUTOMATED |

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
