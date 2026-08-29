# CarbTune Pro Permanent Acceptance Test Catalog

Status values: `AUTOMATED`, `MANUAL`, `BLOCKED_BY_DATA`, or `PLANNED`.

## Vehicle cascade

| ID | Acceptance requirement | Status | Automated evidence |
| --- | --- | --- | --- |
| VEH-001 | 1980 Hyundai -> Elantra cannot be constructed from catalog selections. | AUTOMATED | `tests/vehicle-applications.test.mjs`, `tests/vehicle-cascade.browser.cjs` |
| VEH-002 | Camaro cannot receive Mustang-only trims; those trims cannot appear on non-Mustang applications. | AUTOMATED | Both vehicle tests |
| VEH-003 | Changing Year clears Make, Model, and Submodel. | AUTOMATED | `tests/vehicle-cascade.browser.cjs` |
| VEH-004 | Changing Make clears Model and Submodel. | AUTOMATED | `tests/vehicle-cascade.browser.cjs` |
| VEH-005 | Changing Model clears Submodel. | AUTOMATED | `tests/vehicle-cascade.browser.cjs` |
| VEH-006 | `Unknown / Not Listed` and `Other / Custom` paths create no catalog compatibility evidence. | AUTOMATED | Both vehicle tests |
| VEH-007 | Existing saved-job/`localStorage` compatibility remains intact. | AUTOMATED | `tests/validate-workflow.cjs` |
| VEH-008 | Guided and New Job selectors use the same relational source. | AUTOMATED | `tests/vehicle-cascade.browser.cjs` |

## Historical coverage

| ID | Acceptance requirement | Status | Evidence/blocker |
| --- | --- | --- | --- |
| HIST-001 | 1982 Oldsmobile Cutlass/Cutlass Supreme is selectable from a provenance-bearing registry record. | BLOCKED_BY_DATA | Current FuelEconomy.gov data starts in 1984. `tests/project-control.test.mjs` proves 1982 remains absent and this test remains blocked. Never fabricate a record to turn this green. |

## Carburetor and measurement behavior

| ID | Acceptance requirement | Status | Automated evidence |
| --- | --- | --- | --- |
| CARB-001 | A carburetor-only baseline does not require AFR when no wideband/sensor device is present. | AUTOMATED | `tests/validate-workflow.cjs` |
| CARB-002 | Explicitly enabling an available wideband adds AFR to the baseline evidence set. | AUTOMATED | `tests/validate-workflow.cjs` |
| CARB-003 | Manufacturer baseline, CarbTune recommendation, and technician result remain separately labeled. | AUTOMATED | `tests/validate-workflow.cjs`, structural tests |
| CARB-004 | Warning Override & Continue retains audit history. | PLANNED | Open bug B-0052-03; do not mark accepted until active Build 51 behavior is implemented and tested. |

## Product and persistence

| ID | Acceptance requirement | Status | Automated evidence |
| --- | --- | --- | --- |
| PROD-001 | Product remains carbureted and contains no EFI calibration workflow. | AUTOMATED | `tests/validate-workflow.cjs` |
| PROD-002 | Chassis and installed engine/build identity persist separately. | AUTOMATED | `tests/validate-workflow.cjs` |
| PROD-003 | Missing facts remain explicitly unknown/unverified. | AUTOMATED | Workflow and structural tests |
| PROD-004 | Beginner, Seasoned, and Pro guidance choices remain available. | AUTOMATED | `tests/validate-workflow.cjs` |
| PROD-005 | Phone/tablet/desktop layouts avoid horizontal overflow, retain touch targets, and tablets use width intelligently. | AUTOMATED | `tests/validate-workflow.cjs` |
| PROD-006 | Duplicate prevention and confirmed Delete Job safeguards remain intact. | AUTOMATED | `tests/validate-workflow.cjs` |

## Validation policy

The canonical command is:

```shell
npm run validate
```

It must exit nonzero for syntax, data, project-control, browser, persistence, or responsive failures. Manual acceptance and `BLOCKED_BY_DATA` items are reported honestly and are never converted to false automated passes.
