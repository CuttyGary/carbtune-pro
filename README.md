
CarbTune Pro
============

CarbTune Pro is a local-first guided diagnostic application exclusively for carbureted applications. Its scope includes carburetors and the fuel-delivery, ignition, airflow, valvetrain, and mechanical systems that affect carburetor tuning.

Modern EFI-era engine architectures remain in the engine catalog so CarbTune can support carbureted LS, Coyote, Hemi, and other swaps. CarbTune does not provide injector, ECU, or EFI calibration workflows. A future separate InjectiTune Pro may reuse shared architecture, but it is not part of this application.

Build 51 uses a continuous job workflow:

`Vehicle → Build → Build Review → Baseline → Guided Tuning → Road Test / Dyno → Symptom Diagnosis → Retune / Retest → Final Results`

The build record is the foundation of every recommendation. Component records keep fitment, technical facts, tuning interpretation, lifecycle, verification status, and source evidence separate. Unknown values are valid and remain visibly unknown rather than being guessed. Custom components are supported and remain unverified until evidence is reviewed.

Changes are preserved in a persistent Tune Log with before/after values, reason, expected result, affected measurements, symptoms, notes, outcome, and revert history. Any change that affects prior evidence marks the dependent measurements for retest. Road-test and dyno outcomes feed the symptom-diagnosis loop and the final before/after story.

The application is served directly from `index.html` and stores job data in the browser's `localStorage`.

Architecture and research controls
----------------------------------

- `data/knowledge-base.js` contains the data-only component schema contract and reviewed seed records.
- `docs/architecture.md` defines product boundaries, job domains, compatibility relationships, invalidation, and responsive requirements.
- `docs/knowledge-ingestion.md` defines the controlled future research pipeline and its source, licensing, conflict, and verification safeguards. It does not enable uncontrolled scraping.

Permanent responsive-design requirement
---------------------------------------

Every CarbTune feature must intentionally support phones, tablets, and desktops across iOS, Android, and Windows. Phone layouts remain touch-first and compact. Tablet layouts must use the available width for task/result columns and denser choice grids instead of presenting a narrow centered phone canvas. Desktop layouts use the same workflow with additional horizontal space. Changes must avoid horizontal overflow, preserve 44px touch targets, respect safe-area insets, and pass the responsive viewport matrix in the browser test suite.

Validation
----------

Install the pinned development dependency once, then run the complete validation suite:

```powershell
npm install
npm run validate
```

`npm run validate` starts its own ephemeral local server, runs the static JavaScript and project-control checks, then runs both Playwright browser programs. It exits nonzero on a genuine failure and does not trust an unrelated process on a fixed port.

The suite covers the carbureted product boundary, retained modern engine architectures, relational vehicle selection, complete sequential workflow, editable completed steps, unknown values, component search/custom records, Build Intelligence, measurement context, Tune Log/retest dependencies, road/dyno verification, results, job persistence and migration, duplicate handling, deletion, and a phone/tablet/desktop responsive matrix. GitHub Actions runs the same command on pushes to `main` and on pull requests.
