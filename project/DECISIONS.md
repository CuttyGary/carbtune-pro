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
