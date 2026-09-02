# CarbTune Build Intelligence Architecture

## Product boundary

CarbTune Pro models carbureted vehicles and the fuel-delivery, ignition, airflow, valvetrain, drivetrain, and mechanical systems that affect carburetor behavior. Modern engine architectures remain valid when converted to carburetion. EFI calibration belongs to a separate future product.

## Job model

Each persisted job contains independent domains:

- `vehicle`: chassis identity and the installed engine identity.
- `build`: complete-combination facts, unknowns, selected components, and intended use.
- `baseline`: measured pre-change values.
- `tuneLog`: append-only changes, reverts, before/after evidence, and classified outcomes.
- `retests`: measurements invalidated by later changes.
- `verificationSessions`: road-test or dyno observations and outcomes.
- `diagnostic`: ranked-cause history so an ineffective correction is not blindly repeated.
- `requiredActions`: job-level repairs and supporting parts, without inventory or ordering behavior.
- `workflow`: the exact guided phase/substep for autosave and resume.
- `validationResults`: versioned result and lifecycle records that independently prove whether evidence is current.

Older v31/v40 jobs are normalized into this shape. Unknown fields are added without deleting the original data.

The executable v1 adapter and future service boundaries are documented in `docs/service-contracts.md`. They are additive to the current persistence model; Vehicle/Chassis and Installed Engine remain independent transfer objects.

## Knowledge and provenance

`data/knowledge-base.js` is a data-only seed and schema contract. Application behavior consumes it but does not own its evidence. The legacy intake/exhaust catalogs are normalized into the same runtime registry during the staged migration.

Every technical assertion can carry one of these evidence types:

- Manufacturer Verified Fact
- Authoritative Technical Fact
- CarbTune Calculation
- CarbTune Inference
- Real-World Observation
- Unverified Information

Missing evidence remains unknown. Compatibility and suitability are classifications with supporting reasons, not decorative percentages.

Future service evolution must preserve the distinction among manufacturer specification, CarbTune calculation/recommendation, and actual successful technician setting. Measured learning outcomes may add evidence but never rewrite the manufacturer fact they were compared against.

## Relationship-aware compatibility

Compatibility rules accept category-specific dimensions such as engine family, variant, heads, intake pattern, valvetrain, chassis, transmission, and other components. A relationship is `DIRECT_FIT`, `FITS_WITH_MODIFICATION`, `CONDITIONAL`, `INCOMPATIBLE`, or `UNVERIFIED`. The UI hides known incompatible options by default and allows an expert to show all.

## Invalidation and learning

Tune Log entries declare what changed. Dependency rules mark affected measurements for retest. Reverting a failed change appends a new record rather than erasing history. Verification observations classify outcomes as positive, negative, mixed, no measurable change, or not yet verified.

## Responsive contract

The same job model and workflow support phones, tablets, and desktops. Phones use one focused column. Tablets and desktops use available space for task/result columns, overview grids, and comparison tables. All primary controls retain touch-sized targets and safe-area support.

## Incremental platform direction

The frontend is not permanently restricted to a single-page or dependency-free architecture. Evolution proceeds incrementally from the dedicated development machine, automated validation, and structured project control toward PostgreSQL, versioned CarbTune services/API, the controlled Knowledge Harvester, isolated development/staging, and eventual secure production hosting. Every boundary must preserve saved-job migration, validation coverage, rollback, and evidence semantics; CT-0053 performs no backend rewrite.
