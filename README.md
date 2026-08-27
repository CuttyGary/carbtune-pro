
CarbTune Pro
============

CarbTune Pro is a local-first guided diagnostic application exclusively for carbureted applications. Its scope includes carburetors and the fuel-delivery, ignition, airflow, valvetrain, and mechanical systems that affect carburetor tuning.

Modern EFI-era engine architectures remain in the engine catalog so CarbTune can support carbureted LS, Coyote, Hemi, and other swaps. CarbTune does not provide injector, ECU, or EFI calibration workflows. A future separate InjectiTune Pro may reuse shared architecture, but it is not part of this application.

Build 41 uses the guided workflow:

`Identify → Test → Enter Result → Interpret → Correct → Verify → Continue`

The application is served directly from `index.html` and stores job data in the browser's `localStorage`.

Permanent responsive-design requirement
---------------------------------------

Every CarbTune feature must intentionally support phones, tablets, and desktops across iOS, Android, and Windows. Phone layouts remain touch-first and compact. Tablet layouts must use the available width for task/result columns and denser choice grids instead of presenting a narrow centered phone canvas. Desktop layouts use the same workflow with additional horizontal space. Changes must avoid horizontal overflow, preserve 44px touch targets, respect safe-area insets, and pass the responsive viewport matrix in the browser test suite.

Validation
----------

Start a static server in the repository, then run:

```powershell
$env:CARBTUNE_URL='http://127.0.0.1:4173'
$env:CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
node .\tests\validate-workflow.cjs
```

The test uses Playwright and covers the carbureted product boundary, retained modern engine architectures, guided demo, fuel-pressure correction/retest, overrides, all guidance levels, job persistence, migration, duplicate handling, deletion, and a phone/tablet/desktop responsive matrix.
