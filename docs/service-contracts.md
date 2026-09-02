# CarbTune service and validation contracts v1

CT-0059 adds an adapter boundary around the working local-first application. It does not add a backend or change the technician workflow. The executable contract is `data/service-contracts.js`; `contractVersion` is `1.0.0`, while each persisted schema has its own integer `schemaVersion`.

## Validation-result contract

`carbtune.validation-result` version 1 stores:

- stable `id` and `validationType`;
- `result`: `PASS`, `FAIL`, `WARNING`, `NOT_RUN`, or `UNKNOWN`;
- `lifecycle`: `CURRENT`, `SUPERSEDED`, `STALE`, `INVALIDATED`, or `UNKNOWN`;
- ISO `observedAt` timestamp;
- `source.origin`, with optional actor and method;
- related job, chassis, installed-engine, vehicle, or component identity in `subject`;
- a deterministic `subjectFingerprint` used to reject results from a changed identity;
- zero or more typed evidence/reference objects;
- optional status detail, supersession reference, and invalidation timestamp/reason.

A green/current result is permitted only when all of these are true: result is `PASS`; lifecycle is `CURRENT`; ID, timestamp, and known origin exist; the stored subject fingerprint matches the current job subject; and no supersession or invalidation exists. Missing or malformed data normalizes to `UNKNOWN`. A newer current result of the same type and subject supersedes the older record. Related identity changes make an otherwise-current record `STALE` on normalization. Explicit changes can invalidate current records.

Legacy verification sessions are retained as evidence but import with lifecycle `UNKNOWN`; an old positive string is never promoted to current proof. New road-test/dyno results produce both the existing workflow session and a linked structured validation result.

## Service boundary v1

The additive `carbtune.service-boundary` snapshot keeps these independently addressable domains:

| Domain | Boundary |
| --- | --- |
| Job | identity, timestamps, active/completed state |
| Vehicle/Chassis | year, make, model, submodel, VIN, chassis evidence |
| Installed Engine | manufacturer, size, family, variant, origin, swap flag |
| Components | category-to-component selections and evidence |
| Baseline measurements | measured values and future typed measurement rows |
| Diagnostic findings | structured tests, findings, interpretations, evidence refs |
| Recommended corrections | rationale, state, evidence refs |
| Performed corrections | performed change, timestamp, technician evidence |
| Retest/verification results | workflow sessions linked to validation-result IDs |
| Technician evidence/media | media type, URI/reference, capture origin/time, integrity hash |

Vehicle/Chassis and Installed Engine are intentionally separate objects. The adapter snapshot is a transfer contract, not a second persistence store and not a mock service.

## Safe localStorage-to-PostgreSQL migration path

1. Keep v31/v40 reads and current local saves operational. Normalize every loaded job through the v1 adapter; never mutate the only stored copy during an import attempt.
2. Add database tables and migrations in a future authorized task for jobs plus domain rows keyed by stable IDs. Store contract/schema versions, source timestamps, evidence references, validation lifecycle transitions, and an immutable import audit record.
3. Build an idempotent import service that accepts the v1 snapshot, validates it, writes in one transaction, and returns a server ID plus content hash. Duplicate `(local job ID, source version, content hash)` imports must be no-ops.
4. Run shadow import in development/staging. Compare counts and representative jobs, including legacy jobs, engine swaps, unknown/custom chassis, negative results, superseded results, and deletions. Keep localStorage authoritative during this phase.
5. Add an explicit technician-visible synchronization state only after service acceptance. Do not infer success from a request. Record pending, succeeded, failed, conflict, and retry states independently.
6. Switch reads by capability behind a reversible flag after backup/restore, rollback, authorization, observability, and migration acceptance pass. Retain a read-only local export/recovery path until the product owner approves retirement.

PostgreSQL is not deployed by CT-0059. Authentication, tenancy, deletion/retention policy, media storage, conflict resolution, and production operations remain future product/security decisions.
