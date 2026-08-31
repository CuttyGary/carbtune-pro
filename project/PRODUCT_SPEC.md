# CarbTune Pro Product Specification

## Product

CarbTune Pro is professional shop software for carbureted and performance vehicles. It helps a technician establish a measured baseline, interpret evidence, make one controlled correction/test, retest, compare results, decide what the evidence supports, and preserve an auditable job history.

CarbTune supports carbureted modern engine swaps, including LS, Coyote, Hemi, and similar architectures. It does not provide injector, ECU, PCM, MAF, fuel-table, or spark-table calibration workflows; those belong to a future separate InjectiTune product.

## Core workflow

`Measure -> Interpret -> Correct/Test -> Retest -> Compare -> Decide -> Log`

Tests and corrections are distinct records. A prescribed test collects a structured result; interpretation changes diagnostic state; supported faults may produce a prescribed correction and a specific retest with before/after evidence. Completed tests are not immediately recommended again unless a correction requires retest or materially new evidence records why the branch reopened. Diagnostic sessions terminate as `VERIFIED_REPAIR`, `NO_FAULT_FOUND`, `UNRESOLVED`, or `ADDITIONAL_REPAIR_REQUIRED`.

The workflow is offered at Beginner, Seasoned, and Pro guidance levels. Existing Novice data/UI compatibility may remain during migration, but the product direction is the three named levels above.

## Required domain separation

- Vehicle/Chassis identity is separate from Installed Engine/Build identity. A swap changes the installed build, not the chassis record.
- Manufacturer baseline/specification, CarbTune calculated recommendation/inference, and an actual successful technician setting are different concepts and must never be merged or mislabeled.
- Missing technical facts remain unknown. CarbTune must not manufacture precision, fitment, compatibility, or confidence evidence.
- Evidence, provenance, retrieval date, verification status, confidence, licensing restrictions, and conflicts remain explicit.
- Warnings must provide an explicit `Override & Continue` path for an experienced technician when safe to do so, with reason, value, timestamp, and audit history. A safety-critical hard stop must explain why override is unavailable.

## Carbureted measurement rules

- AFR/wideband data is optional unless an actual sensor/device is explicitly recorded as present and available.
- A carburetor-only baseline must remain completable without AFR.
- Wideband readings are evidence, not a replacement for fuel pressure, ignition, vacuum, mechanical condition, or test context.

## Vehicle registry rules

- The selector is relational: each next choice is derived only from application records matching every prior choice.
- Never restore global fallback Make, Model, Submodel, or Trim vocabularies.
- `Unknown / Not Listed` and `Other / Custom` are escape paths, never compatibility evidence.
- A sourced Year + Make + Model record remains usable when its source genuinely supplies no trim. A technician-entered Custom / Not Listed chassis is explicitly unverified and cannot establish component compatibility.
- Current FuelEconomy.gov data is a legitimate relational 1984-present baseline but is insufficient for desired classic-era coverage.
- Auto Care VCdb/ACES is the primary backbone candidate; CLASSIC.COM is the historical-supplement candidate; NHTSA/vPIC, FuelEconomy.gov, EPA, and other authoritative sources are verification/enrichment candidates.
- No commercial source is approved until coverage, provenance, licensing, persistent-registry rights, and software-provider reuse rights are verified.

## Saved data and learning model

Existing `localStorage` jobs must remain readable through incremental migration. Long term, CarbTune must represent:

`Vehicle/Chassis -> Installed Engine/Build -> Components -> Baseline -> Diagnosis -> Change -> Retest -> Result/Evidence`

Learning records must distinguish Configuration, Baseline, Problem, Change, After Measurement, Result, Evidence, and Confidence. Outcomes include positive, negative, mixed, and no measurable change. Failed tests and reversions remain in history.

CarbTune may learn from measured before/change/after outcomes, but a learned observation never overwrites a manufacturer specification. Aggregated knowledge retains its source population, test context, confidence, conflicts, and applicability boundaries.

## Project ownership and durable control

- Garrett is the product owner and shop-domain expert.
- ChatGPT owns product architecture, requirements clarification, research direction, and acceptance review.
- Codex implements approved assignments, validates them, updates durable documentation/task records, and commits/pushes verified work.
- The repository is the durable source of truth. `project/`, `tasks/`, tests, Git history, and `CARBTUNE_HANDOFF.md` supersede assumptions based only on conversation memory.

## Architecture direction

The current frontend is a pilot. CarbTune may evolve incrementally toward structured services and database components when assigned, while preserving working behavior and saved-data compatibility. The intended sequence is dedicated development machine -> automated validation -> structured project control -> PostgreSQL -> CarbTune application services/API -> Knowledge Harvester -> development/staging environments -> eventual secure production hosting. This is a direction, not authorization for a broad rewrite.

CarbTune has no permanent single-page or dependency-free restriction. New boundaries may be introduced incrementally when justified, migration-safe, and regression protected. Production hosting must use explicit security, backup, observability, and rollback designs and must not expose the dedicated development computer.

## Device contract

Phones, tablets, and desktops across iOS, Android, and Windows are intentional targets. Tablets must use available width rather than displaying a narrow centered phone canvas. Primary controls remain touch-sized and layouts avoid horizontal overflow.
