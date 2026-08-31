# CarbTune Pro Roadmap

Roadmap items are direction, not automatic authorization. Every implementation requires a scoped task, preserved behavior, regression protection, and truthful acceptance evidence.

## Foundation completed through CT-0053

- Dedicated Windows development machine with Node.js 24 LTS, npm, Git/Git Credential Manager, Playwright, Chromium, and authenticated GitHub fetch.
- One canonical `npm run validate` command with owned ephemeral server, static/data/project-control checks, relational selector browser tests, workflow/persistence checks, and responsive smoke coverage.
- GitHub Actions running the same canonical validation path.
- Durable product decisions, roadmap, bugs, ideas, acceptance catalog, task schema, completion handoff discipline, and truthful local status collector.
- Current FuelEconomy.gov relational snapshot preserved unchanged.

## Next stabilization candidates — assignment required

- Implement and validate audited warning Override & Continue behavior consistently in active Build 51 (`B-0052-03` / `CARB-004`).
- Normalize guidance naming toward Beginner / Seasoned / Pro with a backward-compatible Novice migration (`B-0052-04`).
- Complete human acceptance review of project controls and the relational selector without weakening automated tests.
- Define structured validation-result persistence for the future Controller; do not display stale or invented green state.

## Incremental platform evolution

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

The committed U.S. DOE/EPA FuelEconomy.gov application registry is the current sourced seed. Its normalized coverage begins in 1984, so it cannot satisfy CarbTune's classic-vehicle requirement or `VEHICLE-007`.

| Candidate | Intended evaluation | Current authorization |
| --- | --- | --- |
| Auto Care VCdb / ACES | Preferred normalized application backbone candidate | Coverage, provenance, license, persistent-registry, and software-provider reuse evaluation pending |
| CLASSIC.COM | Historical specialty/taxonomy candidate | Evaluation and license pending |
| NHTSA/vPIC | Authoritative VIN/application verification and enrichment, primarily 1981+ | Public API/data terms and field fitness must be reviewed per integration |
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
