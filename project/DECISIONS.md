# CarbTune Pro Decision Log

## D-001 — Carbureted product boundary

**Status:** ACCEPTED
**Decision:** CarbTune Pro covers carburetors and supporting fuel, ignition, airflow, valvetrain, drivetrain, and mechanical systems. EFI calibration is excluded; carbureted modern engine swaps remain supported.

## D-002 — Chassis and installed build are separate

**Status:** ACCEPTED
**Decision:** Vehicle/chassis identity and installed engine/build identity are independent persisted domains.

## D-003 — Evidence classes remain distinct

**Status:** ACCEPTED
**Decision:** Manufacturer facts, authoritative facts, CarbTune calculations/inferences, technician observations, and actual successful settings retain separate labels, provenance, and confidence.

## D-004 — Relational vehicle selector

**Status:** ACCEPTED
**Decision:** Year, Make, Model, and Submodel/Trim must be derived from matching application records. Global fallback vocabularies are prohibited. Unknown/Other are non-evidentiary escape paths.

## D-005 — Current vehicle baseline

**Status:** ACCEPTED WITH LIMITATION
**Decision:** The committed FuelEconomy.gov registry is a legitimate relational 1984-present baseline. It is not adequate classic-era coverage and will not be manually padded.

## D-006 — Vehicle source strategy

**Status:** PUBLIC HISTORICAL SUPPLEMENT APPROVED; COMMERCIAL INTEGRATION NOT APPROVED
**Decision:** Preserve FuelEconomy.gov as the preferred 1984+ source and use official NHTSA ODI vehicle-recall applications as a provenance-bearing pre-1984 supplement. Exact vPIC or period-manufacturer supplements must retain attribution. Continue evaluating VCdb/ACES and CLASSIC.COM; no commercial integration proceeds without coverage, provenance, license, persistent-registry, and software-provider reuse review.

## D-007 — Conditional wideband

**Status:** ACCEPTED
**Decision:** AFR is not required unless an actual wideband/sensor device is recorded as present.

## D-008 — Guided method and technician authority

**Status:** ACCEPTED
**Decision:** The product follows Measure -> Interpret -> Correct/Test -> Retest -> Compare -> Decide -> Log, with Beginner, Seasoned, and Pro guidance. Warnings normally permit an audited Override & Continue path.

## D-009 — Incremental architecture evolution

**Status:** ACCEPTED
**Decision:** Preserve behavior and saved data, but allow explicitly assigned incremental evolution toward Docker, PostgreSQL, services, CI, Knowledge Harvester, and development/staging environments. Avoid full rewrites.

## D-010 — Research before large automotive data construction

**Status:** ACCEPTED
**Decision:** Research authoritative/open data, documented APIs, standards, reusable structured sources, and licensable commercial data before manually building mature automotive databases. Never bypass access controls or invent missing data.

## D-011 — Repository is the durable source of truth

**Status:** ACCEPTED
**Decision:** Product rules live in `project/`, assignments and evidence live in `tasks/`, executable contracts live in tests, and the current cross-agent report lives in `CARBTUNE_HANDOFF.md`. Conversation history may explain intent but cannot silently replace these records.

## D-012 — Development roles

**Status:** ACCEPTED
**Decision:** Garrett is product owner/shop expert; ChatGPT owns architecture, requirements, research direction, and acceptance review; Codex owns assigned implementation, testing, documentation, commit, and push. `ACCEPTED` remains a reviewer/product-owner transition, not an automatic implementation claim.

## D-013 — Honest automation state

**Status:** ACCEPTED
**Decision:** Validation, GitHub synchronization, review, and deployment are independent facts. Automation reports `UNKNOWN` or `NOT VERIFIED` when it cannot obtain evidence and never derives deployment success or review readiness from a task title.

## D-014 — Knowledge evidence states

**Status:** ACCEPTED AS ARCHITECTURE DIRECTION
**Decision:** Future sourced knowledge supports `VERIFIED`, `CONDITIONAL`, `INFERRED`, `CONFLICT`, `UNVERIFIED`, and `UNKNOWN`. Physical compatibility and performance suitability remain separate relationship judgments.

## D-015 — CT-0053 source candidates are research only

**Status:** ACCEPTED WITH LIMITATION
**Decision:** FuelEconomy.gov remains the unchanged sourced seed. Official NHTSA ODI vehicle-recall applications are approved only as the bounded pre-1984 supplement implemented by the vehicle-hierarchy correction, with source limitations disclosed. Auto Care VCdb/ACES, CLASSIC.COM, other EPA historical sources, and SEMA Data remain evaluation candidates; no commercial license, access, coverage, or integration right is implied.

## D-016 — Advisory overrides are first-class evidence

**Status:** ACCEPTED / IMPLEMENTED_IN_CT-0054
**Decision:** A plausible measurement outside the current working expectation is an advisory, not a silent pass or automatic hard stop. Explicit Override & Continue preserves the original value and records warning identity/text, expected range, recommendation, technician intent/reason, guidance, timestamp, job/workflow/measurement identity, and continuation. The same event appears in Tune Log history. It never changes the measurement, specification, recommendation, or CarbTune's warning position.

## D-017 — Hard stops use plausibility, not ordinary tuning disagreement

**Status:** ACCEPTED / IMPLEMENTED_IN_CT-0054
**Decision:** Technically implausible entries that indicate data, gauge, or test-setup error are non-overridable and explain why. Ordinary safe advisory deviations remain overridable for Beginner, Seasoned, Pro, and legacy-compatible Novice guidance. Hard stops must not be expanded merely to avoid technician authority.

## D-018 — Closed-loop diagnostic evidence

**Status:** ACCEPTED / IMPLEMENTED_IN_CT-0055
**Decision:** Tests, structured results, interpretations, corrections, retests, and terminal outcomes are separate durable evidence. A completed branch is not immediately recommended again without a recorded correction/retest need or a material-evidence reopen reason. Free text is supplemental, not the normal diagnostic engine.

## D-019 — Honest custom identity and catalog identification

**Status:** ACCEPTED / IMPLEMENTED_IN_CT-0055
**Decision:** Technician-entered chassis/component identity is useful but remains unverified. Recognizing a cataloged carburetor is separate from proving compatibility. Missing sourced trim does not invalidate a sourced Year + Make + Model application.

## D-020 — Structured validation truth

**Status:** ACCEPTED / IMPLEMENTED_IN_CT-0059
**Decision:** Validation result and lifecycle are separate persisted facts. Only an explicit current `PASS` with a timestamp, known origin, matching subject fingerprint, and no supersession/invalidation can drive verified state. Legacy, missing, changed-subject, stale, superseded, invalidated, and unknown records cannot produce current green status.

## D-021 — Additive versioned service boundary

**Status:** ACCEPTED / IMPLEMENTED_IN_CT-0059
**Decision:** Versioned Job and domain transfer contracts wrap the existing local-first application. Vehicle/Chassis and Installed Engine are independent boundaries. PostgreSQL migration will use an idempotent, audited, reversible import path; CT-0059 does not deploy or simulate a backend.

## D-022 — Durable shop vehicle and immutable visit configuration

**Status:** ACCEPTED / IMPLEMENTED_IN_CT-0060
**Decision:** A persistent Vehicle Record is separate from its jobs. Each visit links to an immutable configuration snapshot; a return visit carries the latest known configuration into a new snapshot without rewriting prior jobs. Migration may join records by an existing relationship or supplied matching VIN, but it must not infer that no-VIN jobs describe the same physical vehicle. Vehicle archive is non-destructive. Technician attribution may be explicit local identity or `UNKNOWN`; authentication is future work.
