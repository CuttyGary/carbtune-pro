# Future CarbTune Research and Knowledge Ingestion Pipeline

This document defines a future controlled pipeline. It does not authorize uncontrolled scraping.

## Pipeline

`SOURCE → EXTRACT → NORMALIZE → DEDUPLICATE → CROSS-REFERENCE → CONFLICT DETECTION → VERIFICATION → KNOWLEDGE BASE`

1. **Source** — register the publisher, document URL or identifier, access method, licensing/terms constraints, publication date, retrieval date, and allowed use. Manufacturer documentation is preferred.
2. **Extract** — capture only permitted facts with precise source locations. Preserve the original unit and wording in the evidence record.
3. **Normalize** — map identity, units, categories, applications, and part-number formats without discarding the source value.
4. **Deduplicate** — resolve aliases, alternate part numbers, supersessions, and retailer copies to a canonical component record.
5. **Cross-reference** — connect evidence from manufacturers, authoritative technical references, and legitimate observations.
6. **Conflict detection** — retain conflicting claims, flag the affected fields, and prevent an unsupported value from becoming verified.
7. **Verification** — require a reviewer or policy-controlled verification step. Record who/what verified the claim and when.
8. **Knowledge base** — publish versioned, provenance-bearing records separately from application code.

Collectors are component-specific but share the pipeline infrastructure. A carburetor collector, ignition collector, or vehicle collector may use source-specific extraction logic; none may bypass the common provenance, identity, deduplication, conflict, verification, and publication gates.

## Evidence record contract

Every important sourced record should be capable of retaining:

- source name and stable location/identifier;
- source type (manufacturer, government, industry standard, licensed catalog, technical reference, or observation);
- source record ID where the source supplies one;
- retrieval date and relevant publication/effective date;
- original assertion and units plus normalized value/units;
- confidence and verification status;
- license, reuse, attribution, and persistence constraints;
- conflicting assertions and their independent evidence.

Supported verification statuses are `VERIFIED`, `CONDITIONAL`, `INFERRED`, `CONFLICT`, `UNVERIFIED`, and `UNKNOWN`. Extraction alone never produces `VERIFIED`. Missing evidence remains `UNKNOWN`; a calculated relationship must remain `INFERRED` or `CONDITIONAL` until the applicable verification policy is satisfied.

## Relationship model

The future graph supports:

`Vehicle -> Engine -> Heads -> Cam/Valvetrain -> Intake -> Carburetor -> Fuel Pump -> Regulator -> Ignition -> Exhaust -> Transmission -> Converter -> Differential -> Tire`

Each edge separates physical compatibility (whether parts can connect and under what modifications) from performance suitability (whether the combination serves the intended use and operating range). A compatible part may be unsuitable; a desirable part may be physically incompatible. Neither classification may be inferred from the other or from an `Unknown / Other` escape choice.

## Source policy

- Respect copyright, robots rules, access restrictions, contracts, and source terms.
- Prefer manufacturer manuals, catalogs, technical bulletins, and official application guides.
- Retailer/distributor data can help discovery but must not silently become a manufacturer claim.
- Real-world observations remain observations until corroborated.
- Never fabricate missing fields or infer compatibility solely to make a record appear complete.
- Retain source dates because application and lifecycle information changes.

The vehicle registry preserves FuelEconomy.gov as its unchanged 1984+ seed and uses a separate official NHTSA ODI vehicle-recall application layer for bounded pre-1984 Year/Make/Model coverage. NHTSA rows do not supply trim data and the merged registry is not comprehensive. Auto Care VCdb/ACES, CLASSIC.COM, other EPA historical sources, and SEMA Data remain research candidates unless a later task records approved evidence and reuse terms; listing a candidate does not claim access, coverage, license, or reuse rights.

## Quality gates

- Schema validation and unit validation.
- Canonical manufacturer/part identity resolution.
- Evidence-type and verification-status required for every asserted fact.
- Automated conflict flags plus human review for safety-relevant claims.
- Diffable knowledge releases, rollback, and audit history.
- Tests proving the app renders unknown, unverified, conditional, and conflicted data honestly.
