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

## Source policy

- Respect copyright, robots rules, access restrictions, contracts, and source terms.
- Prefer manufacturer manuals, catalogs, technical bulletins, and official application guides.
- Retailer/distributor data can help discovery but must not silently become a manufacturer claim.
- Real-world observations remain observations until corroborated.
- Never fabricate missing fields or infer compatibility solely to make a record appear complete.
- Retain source dates because application and lifecycle information changes.

## Quality gates

- Schema validation and unit validation.
- Canonical manufacturer/part identity resolution.
- Evidence-type and verification-status required for every asserted fact.
- Automated conflict flags plus human review for safety-relevant claims.
- Diffable knowledge releases, rollback, and audit history.
- Tests proving the app renders unknown, unverified, conditional, and conflicted data honestly.
