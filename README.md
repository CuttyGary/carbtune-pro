
CarbTune Pro
============

CarbTune Pro is a local-first guided diagnostic application. Build 40 introduces the guided workflow:

`Identify → Test → Enter Result → Interpret → Correct → Verify → Continue`

The application is served directly from `index.html` and stores job data in the browser's `localStorage`.

Validation
----------

Start a static server in the repository, then run:

```powershell
$env:CARBTUNE_URL='http://127.0.0.1:4173'
$env:CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
node .\tests\validate-workflow.cjs
```

The test uses Playwright and covers the guided demo, fuel-pressure correction/retest, overrides, all guidance levels, job persistence, migration, duplicate handling, deletion, and responsive layout.
