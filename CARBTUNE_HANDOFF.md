# CarbTune Pro Permanent Handoff

Status: READY_FOR_CHATGPT_REVIEW

## Assignment

Replace the invalid global vehicle selector with a relational Year -> Make -> Model -> Submodel/Trim cascade, prove unrelated data cannot leak between applications, deploy it for manual acceptance, then research a sustainable approximately 1960-present supply without implementing another dataset. This report separates the implemented correction from the research-only follow-up.

## What changed

### Implemented correction

- Removed the hand-maintained `VEHICLE_CATALOG`, global `COMMON_SUBMODELS`, and Build 51 `B51_SUBMODELS` fallbacks.
- Added one relational collection whose rows contain `year`, `make`, `model`, `submodel`, `trim`, `source`, and `verificationStatus`.
- Derived Year from all rows; Make from selected Year; Model from Year + Make; Submodel/Trim from Year + Make + Model.
- Changing Year clears Make/Model/Submodel; changing Make clears Model/Submodel; changing Model clears Submodel.
- Retained only `Unknown / Not Listed` and `Other / Custom` as escape values that never imply compatibility.
- Applied the same relational source/reset rules to the guided selector and New Job modal.
- Added a reproducible generator with source URL, retrieval date, row count, and SHA-256 provenance.
- Added data/browser negative regressions and positive multi-manufacturer/decade checks.

### Research-only follow-up

- Inspected marketplaces, parts retailers, federal data, industry standards, and commercial providers.
- Recommended a multi-source normalized CarbTune Vehicle Registry.
- Did not replace, extend, or modify the FuelEconomy.gov catalog during research.

## Root cause

The old selector combined unrelated structures: a generated year range, a make-to-model vocabulary without year applicability, global `COMMON_SUBMODELS` containing Mustang trims, and a partial `B51_SUBMODELS` map with generic fallbacks. Year did not constrain Make, Year + Make did not constrain Model, and trim was not keyed by exact Year + Make + Model. This allowed 1980 -> Hyundai -> Elantra and Mustang trims under Camaro. Filtering could not make independent arrays relational; the source structure had to change.

## Exact implemented source

- U.S. DOE/EPA FuelEconomy.gov: <https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip>
- Retrieved: 2026-08-29.
- Source rows: 50,242.
- SHA-256: `cb6304e8970fabc4ae144ee91210953729ab3bae1ff0290f986c31501bf2c7a7`.
- `year` and `make` remain source values.
- `baseModel` becomes CarbTune `model` when present; otherwise source `model` is used.
- When source `model` differs from `baseModel`, the full source model becomes `submodel`.
- `trim` stays null because the source has no trustworthy canonical trim column.
- Duplicates are removed by Year + Make + Model + Submodel.

No marketplace, retailer, NHTSA, commercial, or invented records were ingested.

## Application count and coverage

| Measure | Value |
| --- | ---: |
| Relational application records | 26,366 |
| Years | 1984-2027; 44 distinct |
| Case-insensitive makes | 145 |
| Case-insensitive Make + Model identities | 1,559 |
| Records with derived submodel | 20,187 |
| Records with submodel or trim | 76.56% |
| Records with neither | 6,179 |
| Records with native trim | 0 |

A case-sensitive recount finds 146 make strings and 1,569 Make + Model strings because the source includes casing variants such as `MINI` and `Mini`. PowerShell uniqueness metadata is case-insensitive while JavaScript `Set` is case-sensitive. This is a future ingestion-normalization gap, not a reason for UI blacklists.

The data is a valid relational 1984-present baseline but does not meet the desired approximately 1960-present coverage.

## Remaining selector fallback

- `Unknown / Not Listed` and `Other / Custom` are the only escape paths.
- With no trustworthy exact submodel/trim rows, those are the only Submodel/Trim choices.
- Selecting an upstream escape value returns no rows and manufactures no compatibility.
- No global make/model/submodel/trim vocabulary remains in the cascade.
- Separate installed-engine/component catalogs remain global by design and do not populate the vehicle cascade.

## Research findings

### Marketplaces and retailer selectors

| Source | Findings | CarbTune use |
| --- | --- | --- |
| Classics on Autotrader | Public selector initially exposes 1885-2027 and about 497 makes. Its Vue application receives substantial taxonomy in the server response and loads assets from `static.cdn.autotraderspecialty.com`. No documented public taxonomy API or disclosed third-party provider was found. Choices are marketplace-driven and sparse: Hyundai -> Elantra exposed only 1992, 1994, and 1998-2001 during inspection. Chevrolet also showed suspicious unrelated model labels. The likely source is proprietary Autotrader Specialty/Cox taxonomy. Autotrader's agreement restricts commercial storage/reuse without permission. | Manual cross-check or negotiated license only. Do not scrape or treat the initial range as complete coverage. |
| Autotrader | Regular marketplace directs pre-1981 vehicles to Classics. It exposes inventory-derived Make/Model/Trim and listing specifications, but no public US taxonomy API was identified. | Cross-check or licensed use only. |
| Cars.com | Inventory-derived Year/Make/Model/Trim facets and listing specifications. No public registry API was identified; terms prohibit automated collection and redistribution. | Cross-check only absent a license. |
| CarSoup | Dealer-inventory Year/Make/Model and listing trim/engine fields. Historical coverage depends on inventory; no documented taxonomy API/provider was identified. | Cross-check only. |
| RockAuto | Broad historical parts applications with Year/Make/Model/engine relationships, but exact lower-year coverage, public API access, and provider were not confirmed. | High-value fitment cross-check; pursue a commercial relationship instead of scraping. |
| Summit Racing and JEGS | Broad classic-to-modern fitment. SEMA documentation identifies them in manufacturer/reseller workflows, indicating material use of ACES/SEMA supplier data plus retailer normalization. Storefront selectors are not public licensed APIs. | License upstream ACES/VCdb/SEMA data instead of storefront ingestion. |

References: [Classics on Autotrader](https://classics.autotrader.com/), [Autotrader advanced search](https://www.autotrader.com/cars-for-sale/advanced-search), [Autotrader Visitor Agreement](https://www.autotrader.com/legal/visitor-agreement), [Cars.com terms](https://www.cars.com/about/terms/), [SEMA retailer information](https://www.semadata.org/node/501), and [SEMA reseller scorecards](https://www.semadata.org/news/wed-2022-01-26-0006/find-out-what-data-your-customers-need-reseller-scorecards).

### Public authoritative sources

| Source | Coverage/content | CarbTune use |
| --- | --- | --- |
| NHTSA/vPIC | Principally 1981-present. Public API/downloads provide authoritative manufacturer/VIN information. Make/model/body/series/trim and engine attributes may exist for an exact VIN, but vPIC cannot enumerate a complete retail trim catalog. | Verification/enrichment for 1981-present, not the sole registry. |
| NHTSA recalls | Hierarchical model-year/make/model can corroborate older applications, but only vehicles represented in safety records appear. | Historical cross-check; absence proves nothing. |
| FuelEconomy.gov | 1984-present passenger/light-truck model variants with engine, transmission, drive, and fuel information; no dependable canonical trim taxonomy. | Legitimate direct ingestion; current baseline. |
| EPA Automotive Trends | US light-duty model/technology coverage from 1975 onward; analytical rather than retail-trim oriented. | Authoritative corroboration, especially 1975-1983. |
| Historical DOT Automobile Characteristics | Sample years 1955, 1960, 1965, 1968, and 1970-1974; old research artifact, not a maintained feed. | Gap research/cross-check only. |

References: [vPIC](https://vpic.nhtsa.dot.gov/), [vPIC API](https://vpic.nhtsa.dot.gov/api/), [vPIC downloads](https://vpic.nhtsa.dot.gov/Downloads), [NHTSA datasets/APIs](https://www.nhtsa.gov/nhtsa-datasets-and-apis), [FuelEconomy.gov API](https://www.fueleconomy.gov/feg/ws/index.shtml), [FuelEconomy.gov downloads](https://www.fueleconomy.gov/feg/download.shtml), [EPA Automotive Trends](https://catalog.data.gov/dataset/the-epa-automotive-trends-report-greenhouse-gas-emissions-fuel-economy-and-technology-1975), and [historical DOT data](https://rosap.ntl.bts.gov/view/dot/6231/dot_6231_DS1.pdf).

### Industry and commercial sources

| Source | Findings | CarbTune use |
| --- | --- | --- |
| Auto Care VCdb / ACES | Strongest normalized industry candidate. VCdb documents 175,500+ applications and 2.4M+ configurations with Year/Make/Model/Submodel, region, engine, and configuration IDs. Subscription downloads/JSON API exist. Exact earliest year is not clearly public; customer-facing caching/derivatives require the correct license. | Preferred backbone candidate, subject to 1960-present sample and software-provider license review. |
| SEMA Data | Manufacturer product applications tied to VCdb IDs, including YMM/Submodel, region, displacement, and fitment. Subscription/token and manufacturer permissions required. | Future parts/application layer, not necessarily master taxonomy. |
| CLASSIC.COM | Licensed collector hierarchy with Make -> Model -> Generation -> Variant -> Trim, year ranges, body, engine/powertrain, and stable IDs. | Strongest historical specialty supplement; request coverage and registry rights. |
| CarAPI.app | Claims US 1900-2027, YMM/Submodel from 1900+, detailed trims/specifications mainly from 1990+, and 75,000+ trims. Commercial API/feed; provenance is insufficiently public and terms restrict bulk redistribution/competing databases. | Possible low-cost pilot only with written provenance and registry permission. |
| J.D. Power ChromeData | Rich commercial style/specification data; documented Simple Model Walk begins in 1992. | Modern enrichment, not a 1960-present backbone. |
| DataOne and MOTOR | Commercial VIN, trim, specification, and identification products. Historical scope, price, and registry rights require proposals. | Vendor comparison; not yet proven for historical need. |
| VehDB and Auto.dev | Structured commercial vehicle/listing APIs, but provenance, historical completeness, and registry rights were not strong enough for a backbone recommendation. | Evaluation only. |

References: [Auto Care VCdb](https://www.autocare.org/data-and-information/data-standards/databases/vehicle-configuration-database-vcdb), [Auto Care subscriptions](https://www.autocare.org/data-standards/subscriptions), [SEMA Data API](https://apps.semadata.org/sdapi/v2), [CLASSIC.COM overview](https://support.classic.com/classic.com-api), [CLASSIC.COM documentation](https://www.classic.com/insights/classic-com-third-party-api-documentation/), [CarAPI feed](https://carapi.app/features/vehicle-csv-download/), [CarAPI terms](https://carapi.app/terms-of-use/), [J.D. Power](https://www.jdpower.com/business/features-price-specs), and [DataOne](https://www.dataonesoftware.com/solutions).

## Required normalized registry direction

Future sources must feed one normalized registry with source evidence stored separately:

```text
vehicle_application
  id, year, make, model, submodel, trim, body, chassis, platform

vehicle_application_source
  applicationId, source, sourceRecordId, retrievedAt,
  sourcePayloadHash, verificationStatus
```

- `VERIFIED`: exact application supported by an authoritative/licensed record or multiple independent credible sources.
- `CONDITIONAL`: only a range, marketplace occurrence, or incomplete relationship is established.
- `CONFLICT`: credible sources disagree.
- `UNVERIFIED`: imported record awaits corroboration.
- `UNKNOWN`: user escape path, never compatibility evidence.

Missing trim/submodel data must remain missing. Marketplace occurrence alone must not establish factory applicability.

## Tests performed and results

### Re-run during handoff preparation

- `tests/vehicle-applications.test.mjs`: **PASS** — 26,366 relational records; required fields/source; 1980 Hyundai/Elantra impossible; Camaro excludes forbidden Mustang trims; Mustang trims excluded from non-Mustang rows; positive Chevrolet, Ford, Hyundai, Dodge, and Toyota applications across 1985-2025.
- `tests/build51.test.mjs`: **PASS** — two embedded scripts parsed and structural assertions passed.
- Live deployment fetch: **PASS** — <https://cuttygary.github.io/carbtune-pro/> and its vehicle asset returned HTTP 200; the live page contains relational selector code and the asset reports 26,366 records.
- GitHub remote check: **PASS** — public `main` resolved to `2cae1dce868183304aa85af1c9dc3d6651a21db3`.
- `tests/vehicle-cascade.browser.cjs`: **FAIL** before assertions completed — direct `page.evaluate` setup reported `ReferenceError: b51 is not defined`.
- `tests/validate-workflow.cjs`: **FAIL** at its current start-state expectation — `demo starts at Build Review`.

The browser failures are documented, not repaired, because the handoff assignment prohibits functionality changes. The committed tests show intended assertions, but no durable original test log exists in Git. Manual acceptance remains required, and the browser harness/start-state mismatch must be diagnosed before the complete suite is called green.

## Known limitations and gaps

- Coverage stops at 1984, short of approximately 1960-present.
- FuelEconomy.gov is an emissions/fuel-economy test dataset, not a complete factory trim/classic taxonomy.
- No native `trim` is populated; derived `submodel` may encode drivetrain, body, or test configuration rather than retail trim.
- 6,179 rows have neither submodel nor trim and expose only escape choices.
- Source casing aliases create case-sensitive duplicates not reflected in case-insensitive metadata.
- Rows lack body, chassis, platform, source record ID, per-row retrieved-at, and multi-source evidence relationships.
- `VERIFIED_SOURCE_RECORD` means the row came from the cited source, not that CarbTune independently verified every application or interpretation.
- vPIC is not comprehensive before 1981; FuelEconomy.gov starts in 1984.
- Marketplace/retailer selectors are incomplete and generally unsuitable for unlicensed ingestion.
- VCdb, CLASSIC.COM, and other commercial candidates need coverage and reuse rights confirmed contractually.
- The two browser-test failures remain unresolved.
- Manual acceptance remains the release gate.

## Files changed by the relational implementation

- `data/vehicle-applications.js` — generated catalog and provenance.
- `index.html` — removed global vehicle fallbacks; added relational filtering/resets to both selectors.
- `scripts/generate-vehicle-applications.ps1` — reproducible normalization/generation.
- `tests/build51.test.mjs` — structural coverage.
- `tests/validate-workflow.cjs` — affected workflow assertions/setup.
- `tests/vehicle-applications.test.mjs` — relational negative/positive tests.
- `tests/vehicle-cascade.browser.cjs` — guided/modal browser regressions.

The data-supply research changed no repository files.

## Commit SHA

- Relational implementation: `2cae1dce868183304aa85af1c9dc3d6651a21db3` — `Replace vehicle cascade with relational applications`.
- Data-supply research: N/A; research only.

## Deployment status

- Branch: `main`.
- Remote: `https://github.com/CuttyGary/carbtune-pro.git`.
- `origin/main` and GitHub public `main` resolved to `2cae1dce868183304aa85af1c9dc3d6651a21db3` during this audit.
- GitHub Pages is reachable at <https://cuttygary.github.io/carbtune-pro/>.
- The deployed page/data asset return HTTP 200 and the asset contains the 26,366-record catalog.
- Automated publication is complete; manual acceptance is not complete.

## Recommended next step

Do not manually extend the catalog and do not redesign the dropdown again.

1. Diagnose the two browser-harness failures without changing vehicle data, then restore a green browser baseline.
2. Request an Auto Care VCdb sample/coverage report and software-provider license terms; audit 1960-present, classic domestic/import applications, engines, and submodels.
3. Request a CLASSIC.COM historical-taxonomy evaluation/license proposal in parallel.
4. Use CarAPI only as a trial after written provenance and persistent-registry permission.
5. Add a source-evidence layer so a licensed backbone can coexist with vPIC, FuelEconomy.gov, EPA, and historical corroboration while preserving conflicts/provenance.
6. Replace or supplement FuelEconomy.gov only after source selection, license review, normalization, coverage audit, regression plan, and approval.

STOP: Await ChatGPT/user review and approval before another vehicle dataset or further CarbTune development.
