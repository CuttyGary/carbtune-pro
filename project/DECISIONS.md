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

**Status:** RESEARCH APPROVED; INTEGRATION NOT APPROVED
**Decision:** Evaluate VCdb/ACES as primary backbone, CLASSIC.COM as historical supplement, and vPIC/FuelEconomy.gov/EPA as verification/enrichment. No commercial integration proceeds without coverage, provenance, license, persistent-registry, and software-provider reuse review.

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
**Decision:** FuelEconomy.gov remains the unchanged sourced seed. Auto Care VCdb/ACES, CLASSIC.COM, NHTSA/vPIC, EPA historical sources, and SEMA Data are evaluation candidates only; no license, access, coverage, or integration right is implied.
