# CarbTune Pro Roadmap

Roadmap items are direction, not automatic authorization. Every implementation requires a scoped task, preserved behavior, regression protection, and truthful acceptance evidence.

## Foundation completed through CT-0054

- Dedicated Windows development machine with Node.js 24 LTS, npm, Git/Git Credential Manager, Playwright, Chromium, and authenticated GitHub fetch.
- One canonical `npm run validate` command with owned ephemeral server, static/data/project-control checks, relational selector browser tests, workflow/persistence checks, and responsive smoke coverage.
- GitHub Actions running the same canonical validation path.
- Durable product decisions, roadmap, bugs, ideas, acceptance catalog, task schema, completion handoff discipline, and truthful local status collector.
- Current FuelEconomy.gov relational snapshot preserved unchanged.
- Active Build 51 safe advisory warnings now support deliberate, persistent Override & Continue audit evidence across all supported guidance values; implausible hard stops remain distinct.

## CT-0055 field-test stabilization

- Closed-loop structured diagnostic test/result/correction/retest state, including accelerator-pump and numeric fuel-pressure evidence.
- iPhone Operating Context touch persistence, mobile New Job action, chassis carry-forward, missing-trim handling, custom historical chassis disclosure, carburetor type-ahead, encoding repair, and Novice-to-Beginner migration.
- `VEHICLE-007` is resolved with an official NHTSA ODI pre-1984 relational supplement; manual acceptance remains required.

## Next stabilization candidates — assignment required

- Complete human acceptance review of project controls and the relational selector without weakening automated tests.
- Structured validation-result persistence and v1 service boundaries were implemented in CT-0059. Human field acceptance of the relational selector remains required.

## Incremental platform evolution

## CT-0060 shop vehicle foundation completed

- Versioned persistent Vehicle Records now group returning visits without replacing the job store.
- Per-job configuration snapshots preserve the installed combination at each visit and carry current known configuration into a return job without historical mutation.
- Idempotent legacy normalization, archive semantics, stable relationships, provenance, and known/unknown actor/audit foundations are executable and browser-tested.
- PostgreSQL, synchronization, authentication, tenancy, shop/customer administration, and multi-device conflict handling remain later explicitly assigned work.

The intended order is:

`Dedicated development machine -> Automated validation -> Structured project control -> PostgreSQL -> CarbTune application services/API -> Knowledge Harvester -> Development/Staging environments -> Eventual secure production hosting`

1. Define versioned service and data contracts alongside the working frontend.
2. Design PostgreSQL schemas, migrations, backups, audit records, and rollback. Preserve an explicit import/synchronization path for existing `localStorage` jobs.
3. Move narrowly scoped capabilities behind CarbTune application services/API without a full rewrite.
4. Build the controlled Knowledge Harvester with source licensing, provenance, conflicts, verification, and reviewer gates.
5. Establish isolated development/staging services and promotion gates.
6. Design secure production hosting with secrets management, least privilege, customer-data controls, observability, backup restoration, and rollback.

CarbTune is not permanently restricted to a single page or dependency-free architecture. Each migration step must preserve behavior and saved data, remain reversible where practical, and pass the complete regression suite.

## Vehicle and source roadmap — evaluation only

The committed U.S. DOE/EPA FuelEconomy.gov application registry remains the unchanged 1984+ sourced seed. A separate official NHTSA ODI vehicle-recall application layer supplies record-backed pre-1984 Year/Make/Model coverage without replacing the richer DOE/EPA submodel data. The merged registry is broad, not comprehensive.

| Candidate | Intended evaluation | Current authorization |
| --- | --- | --- |
| Auto Care VCdb / ACES | Preferred normalized application backbone candidate | Coverage, provenance, license, persistent-registry, and software-provider reuse evaluation pending |
| CLASSIC.COM | Historical specialty/taxonomy candidate | Evaluation and license pending |
| NHTSA/vPIC and ODI | Historical vehicle-recall applications plus exact application verification | Public ODI pre-1984 supplement implemented; broader enrichment remains review-bound |
| FuelEconomy.gov | Current sourced relational application seed | Committed snapshot retained; known 1984+ limitation |
| EPA historical sources | Corroboration and historical research | Discovery/normalization plan pending |
| SEMA Data | Future aftermarket/application relationship candidate | Access, coverage, and license evaluation pending |

Do not scrape restricted marketplaces, bypass controls, claim commercial rights, or fabricate historical applications. No source purchase or integration proceeds until ChatGPT/product-owner review approves the evidence and reuse terms.

## Knowledge Harvester roadmap

Develop component-specific collectors over shared infrastructure for discovery, extraction, normalization, provenance, deduplication, conflict detection, verification, and relationships. Required evidence states are `VERIFIED`, `CONDITIONAL`, `INFERRED`, `CONFLICT`, `UNVERIFIED`, and `UNKNOWN`.

Important sourced records should retain source, source type, source record ID where available, retrieval date, confidence, verification status, license/reuse constraints, original values/units, and conflicts. Collection is not verification; publication requires policy and reviewer gates.

The relationship graph is:

`Vehicle -> Engine -> Heads -> Cam/Valvetrain -> Intake -> Carburetor -> Fuel Pump -> Regulator -> Ignition -> Exhaust -> Transmission -> Converter -> Differential -> Tire`

Physical compatibility and performance suitability are separate classifications with separate supporting evidence. Unknown relationships remain unknown.

## Learning roadmap

Learning records preserve `Configuration -> Baseline -> Problem -> Change -> After Measurement -> Result -> Evidence -> Confidence`, including positive, negative, mixed, and no-change outcomes. Technician before/change/after evidence can improve future interpretation but must never overwrite or masquerade as a manufacturer specification.
