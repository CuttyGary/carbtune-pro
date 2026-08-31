# CarbTune Pro Bug Register

## B-0052-01 — Browser cascade harness can target a stale server

**Status:** RESOLVED_IN_CT-0052
**Impact:** The harness could report `b51 is not defined` when port 4173 belonged to a stale or incorrect server, before proving the current Build 51 application was loaded.
**Resolution:** The canonical validation runner owns an ephemeral server/port, passes that URL to browser tests, and browser readiness is asserted before internal setup.

## B-0052-02 — Workflow test expects superseded Build Review copy

**Status:** RESOLVED_IN_CT-0052
**Impact:** Validation stopped at `demo starts at Build Review` even though Build 51 correctly renders the Build Intelligence phase with new evidence/confidence copy.
**Resolution:** Assert current phase identity, current heading, eight-stage progress, and explicit evidence/confidence semantics.

## B-0052-03 — Active Build 51 warning override audit is incomplete

**Status:** RESOLVED_IN_CT-0054
**Impact:** Older workflow code contains Override & Continue history, but the active Build 51 measurement path does not consistently expose and audit warning overrides. Experienced technicians may be trapped or override evidence may be lost.
**Required result:** Safe warnings offer explicit Override & Continue with value, reason, technician intent, timestamp, and retained audit history. Safety-critical non-overridable conditions explain why.
**Resolution:** Active Build 51 now classifies plausible out-of-working-range measurements as advisory warnings and technically implausible values as hard stops. Safe overrides require an explicit button, preserve the entered value, store a structured `workflow.overrideAudit` record, create a Tune Log evidence entry, survive reload, and retain guidance/job/workflow/measurement context. Browser acceptance in `tests/validate-workflow.cjs` exercises Beginner, Seasoned, Pro, and compatible Novice paths, in-range behavior, persistence/history, and hard-stop exclusion.

## B-0052-04 — Guidance vocabulary includes Novice

**Status:** OPEN_COMPATIBILITY_MIGRATION
**Impact:** Current persisted/UI values include Beginner, Novice, Seasoned, and Pro, while product direction is Beginner, Seasoned, and Pro.
**Required result:** Define a backward-compatible migration before removing or remapping Novice.

## B-0052-05 — Vehicle source casing aliases

**Status:** OPEN_DATA_NORMALIZATION
**Impact:** FuelEconomy.gov includes aliases such as `MINI` and `Mini`; case-insensitive metadata and case-sensitive UI identity counts differ.
**Constraint:** Fix in a future normalized registry ingestion layer, not with selector blacklists.

## B-0052-06 — Classic-era registry gap

**Status:** BLOCKED_BY_DATA
**Impact:** The current registry begins in 1984. Required cases such as 1982 Oldsmobile Cutlass/Cutlass Supreme cannot be catalog-selected.
**Constraint:** Do not fabricate records. Resolve only through approved, licensed/provenance-bearing source integration.

## CT-0053 infrastructure review

No application defect was opened during the CT-0053 baseline. The pre-change canonical suite passed. Infrastructure gaps addressed by CT-0053 are tracked through task `CT-0053`, not mislabeled as product bugs: repository-level `node_modules/` ignore, dedicated-machine documentation, durable task records, Node 24 CI alignment, and truthful status collection.

## CT-0054 regression review

No unrelated product regression was found. Existing saved-job normalization treats absent `workflow.overrideAudit` as an empty array, preserving legacy and Novice data. Vehicle data, component knowledge, duplicate/delete safeguards, conditional AFR behavior, and all CT-0053 regression coverage remain unchanged and passing.
