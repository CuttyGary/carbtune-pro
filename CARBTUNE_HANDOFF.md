Task: Vehicle hierarchy acceptance correction
Status: READY_FOR_CHATGPT_REVIEW

# CarbTune Handoff — Historical Relational Vehicle Cascade

## Assignment and result

Fixed and acceptance-tested only the Vehicle/Chassis relational selector. No Build Selection component logic, Build Intelligence, Baseline, Diagnosis, Results, graphs, reports, or Knowledge Base component records were changed.

- Starting synchronized SHA: `2e0ed14a342dda2c9b29ba9d6a3a236fd1d2cfb2`
- Implementation SHA: `c38120eab9082c4cb99c7225a4784db10c8df0e6`
- Deployment: VERIFIED 2026-09-01 — `origin/main` reached `d168f413b1ca6c9cc864e042624f8c06655edc3f`; GitHub Pages returned HTTP 200 for the updated index, unified catalog query, and historical dataset, including the expected 1983 records.

## Root cause

The strict cascade introduced earlier was behaving as written, but its only packaged application source was the U.S. DOE/EPA FuelEconomy.gov registry, whose normalized coverage begins in 1984. The UI still presented static earlier years before runtime initialization. Therefore 1983 was selectable without any underlying rows and correctly collapsed to only the two escape paths. This was a combined data-boundary and UI-source-of-truth defect, not a normalization mismatch at the 1983 query.

## Data and query architecture

- Preserved `data/vehicle-applications.js` unchanged: 26,366 DOE/EPA records, 1984–2027, 145 source make strings, and 20,187 rows with source-provided submodel/trim data.
- Added a generated NHTSA ODI layer: 8,672 unique `RCLTYPECD=V` vehicle-recall Year/Make/Model relationships, 1955–1983, 312 source make strings. It uses both official pre-2010 and post-2010 recall archives so later recalls involving older model years are retained.
- Added seven exact attributed supplements for required 1982 Oldsmobile and 1982/2002 Pontiac Firebird classifications using NHTSA vPIC and period manufacturer brochures.
- The unified query de-duplicates and normalizes case, spacing, punctuation, and display casing without using semantic aliases or widening a relationship.
- Combined query coverage: 35,036 de-duplicated application rows, 73 record-backed years (1955–2027), 415 normalized make identities, 4,086 make/model identities, and 20,189 rows with submodel/trim evidence.
- 1983 contains 114 recorded makes, including Chevrolet, Dodge, Ford, Honda, Oldsmobile, Pontiac, and Toyota.
- The registry is explicitly broad, not comprehensive.

## Missing submodel handling

NHTSA recall applications do not provide dependable submodel/trim data. For an exact Year + Make + Model without sourced variant rows, the final selector exposes only `Unknown / Not Listed` and `Other / Custom`. It never borrows global or same-manufacturer trims. DOE/EPA submodel values remain preferred and unchanged for 1984+ applications.

## Files changed

- `data/vehicle-historical-applications.js`
- `data/vehicle-catalog.js`
- `scripts/generate-historical-vehicle-applications.ps1`
- `index.html`
- `tests/vehicle-applications.test.mjs`
- `tests/vehicle-cascade.browser.cjs`
- `tests/build51.test.mjs`
- `docs/knowledge-ingestion.md`
- `project/ACCEPTANCE_TESTS.md`
- `project/BUGS.md`
- `project/DECISIONS.md`
- `project/ROADMAP.md`

## Source and provenance

- U.S. DOE/EPA FuelEconomy.gov `vehicles.csv.zip`; existing source snapshot retrieved 2026-08-29 and existing SHA-256 retained unchanged.
- NHTSA ODI `FLAT_RCL_PRE_2010.zip` and `FLAT_RCL_POST_2010.zip`; source archive snapshot retrieved 2026-08-28. Only vehicle application rows where `RCLTYPECD=V` are admitted.
- NHTSA vPIC exact 1982 Oldsmobile year/make/model results.
- Period 1982 and 2002 Pontiac Firebird manufacturer brochures for the exact Firebird submodel overlays.

## Validation

- Historical generator PowerShell syntax: PASS.
- JavaScript syntax and embedded `index.html` scripts: PASS.
- `tests/vehicle-applications.test.mjs`: PASS — multi-decade positive and negative relationships, 1983 makes/models, source boundaries, normalization, exact Firebird/Trans Am variants, Honda Type R, Toyota truck/SUV, missing trims, and escape-path integrity.
- `tests/vehicle-cascade.browser.cjs`: PASS — active workflow and New Job modal both prove the 1983 Oldsmobile cascade, downstream resets, exact missing-trim fallback, and no cross-record bleed.
- `npm run validate` equivalent through the repository Node runtime: PASS — 5 of 5 programs and all 152 workflow assertions.
- Full workflow regressions confirm localStorage migration, chassis/installed-engine separation, duplicate safeguards, Delete Job confirmation/removal, component provenance, and no browser console errors.
- `git diff --check`: PASS.

## Limitations and manual acceptance gate

NHTSA recall application data is legitimate relational evidence but is not a comprehensive production catalog, and its absence does not prove a vehicle was never produced. The source includes multiple vehicle types and does not provide historical trim completeness. No missing application is invented. Manual acceptance should retest 1983 Oldsmobile plus unrelated manufacturers and years before any further feature work begins.

## Recommended next step

Stop for the product owner's manual Vehicle/Chassis acceptance test. Do not begin another feature or expansion.
