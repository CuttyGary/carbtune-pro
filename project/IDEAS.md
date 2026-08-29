# CarbTune Pro Ideas Backlog

Ideas are not approved implementation work.

## Knowledge Harvester

A controlled ingestion service that registers permitted sources, extracts facts with exact source locations, normalizes identity/units, detects duplicates/conflicts, routes review, and publishes versioned knowledge releases. It must never bypass access controls or silently convert retailer claims into manufacturer facts.

## Vehicle Registry service

A normalized registry with canonical application identity plus source-evidence records. It should support aliases, conflicts, retrieval history, license constraints, and verification states without manufacturing missing trim data.

## PostgreSQL job/evidence store

Move beyond browser-only storage through a versioned service while retaining an explicit import/synchronization path for existing `localStorage` jobs. Use migrations, backups, audit logs, and rollback.

## Dedicated development and staging

Use a dedicated development machine/server, Docker, isolated development/staging services, CI validation, and deployment promotion gates.

## Technician override ledger

Treat overrides as first-class evidence: warning, measured value, reason, technician identity, timestamp, result, and whether later evidence validated or contradicted the override.

## Outcome learning

Aggregate only provenance-bearing learning records that distinguish Configuration, Baseline, Problem, Change, After Measurement, Result, Evidence, and Confidence. Preserve positive, negative, mixed, and no-change results so failed approaches teach the system.

## Sensor/device capability registry

Represent installed/available diagnostic devices such as widebands, vacuum gauges, fuel-pressure gauges, timing lights, and dynos. Gate measurement requirements on actual capability rather than assumptions.
