const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseURL = process.env.CARBTUNE_URL || 'http://127.0.0.1:4173';
const storageKey = 'carbtune.clean.v40';
const results = [];

function assert(condition, name, detail = '') {
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ''}`);
  results.push(`PASS ${name}`);
}

async function stored(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
}

async function changeValue(page, selector, value) {
  const input = page.locator(selector);
  await input.fill(value);
  await input.dispatchEvent('change');
}

async function setStored(page, mutate) {
  const state = await stored(page);
  mutate(state);
  await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: storageKey, state });
  await page.reload({ waitUntil: 'networkidle' });
}

async function recordTune(page, values) {
  await page.locator('#tuneParameter').fill(values.parameter);
  await page.locator('#tuneBefore').fill(values.before || '');
  await page.locator('#tuneAfter').fill(values.after);
  await page.locator('#tuneReason').fill(values.reason || 'Controlled one-variable test');
  await page.locator('#tuneExpected').fill(values.expected || 'Measured improvement');
  await page.locator('#tuneNotes').fill(values.notes || '');
  await page.locator('[data-record-tune]').click();
}

async function saveVerification(page, { mode = 'ROAD_TEST', symptom = 'no-symptoms', outcome = 'POSITIVE', notes = '' }) {
  await page.locator(`[data-verification-mode="${mode}"]`).click();
  await page.locator(`[data-verification-symptom="${symptom}"]`).click();
  await page.locator(`[data-verification-outcome="${outcome}"]`).click();
  if (notes) await changeValue(page, '[data-verification-notes]', notes);
  await page.locator('[data-save-verification]').click();
}

async function fillStructuredVehicle(page, jobNo) {
  await page.locator('#newJobNo').fill(jobNo);
  await page.locator('#newVehicleYear').selectOption('1968');
  await page.locator('#newVehicleMake').selectOption('Chevrolet');
  await page.locator('#newVehicleModel').selectOption('Camaro');
  await page.locator('#newVehicleSubmodel').selectOption('Base');
  await page.locator('#newEngineManufacturer').selectOption('GM / Chevrolet');
  await page.locator('#newEngineSize').selectOption('5.7L / 350 CID');
  await page.locator('#newEngineFamily').selectOption('Small Block Chevrolet');
  await page.locator('#newEngineVariant').selectOption('350 Gen I');
}

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.setDefaultTimeout(9000);
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));

    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    assert(await page.locator('.screen.active').getAttribute('data-screen') === 'guided', 'continuous guided workflow is primary');
    assert((await page.locator('header').innerText()).includes('Build 50'), 'Build 50 version is visible');
    assert(await page.locator('meta[name="application-domain"]').getAttribute('content') === 'carbureted', 'application metadata declares carbureted domain');
    assert((await page.locator('#productScopeBadge').innerText()).includes('Carbureted'), 'carbureted product scope is visible');
    const productState = await stored(page);
    assert(productState.productId === 'carbtune-pro' && productState.applicationType === 'carbureted', 'jobs persist the CarbTune product boundary');
    const visibleWorkflow = await page.locator('.screen.active').innerText();
    assert(!/(injector pulse|fuel table|spark table|ecu calibration|pcm calibration|maf calibration)/i.test(visibleWorkflow), 'EFI calibration workflows are absent');
    assert((await page.locator('#guidedCard').innerText()).includes('What should this combination do?'), 'demo starts at Build Review');
    assert(await page.locator('#guidedProgress button').count() === 8, 'linear workflow exposes eight major stages');
    assert((await page.locator('#workflowPosition').innerText()) === 'STEP 3 OF 8', 'workflow position is explicit');
    assert(!(await page.locator('#guidedCard').innerText()).includes('%'), 'Build Review uses honest counts instead of decorative percentages');
    assert((await page.locator('#guidedCard').innerText()).includes('UNKNOWN'), 'Build Review distinguishes unknown evidence');

    await page.locator('[data-jump-phase="build"]').click();
    assert((await page.locator('#guidedCard h2').innerText()).includes('actually installed'), 'completed Build stage can be reopened');
    await changeValue(page, '[data-vehicle-field="engineLabel"]', 'Carbureted test engine');
    await page.locator('[data-guided-next]').click();
    await page.locator('[data-guided-back]').click();
    assert(await page.locator('[data-vehicle-field="engineLabel"]').inputValue() === 'Carbureted test engine', 'Back and Continue preserve build data');

    await setStored(page, state => {
      state.workflow.phase = 'build';
      state.workflow.buildIndex = 4;
      state.workflow.showOverview = false;
    });
    await page.locator('[data-component-category="carburetor"]').click();
    await page.locator('[data-component-search]').fill('BR-67255');
    assert((await page.locator('.component-results').innerText()).includes('BR-67255'), 'component selector searches model and part number');
    assert((await page.locator('.component-results').innerText()).includes('UNVERIFIED'), 'component evidence status is visible');
    await page.locator('[data-custom-component="carburetor"]').click();
    assert(await page.locator('#customComponentName').isVisible(), 'custom component workflow opens inline');
    await page.locator('#customComponentName').fill('Custom 950 CFM carburetor');
    await page.locator('#customComponentPart').fill('SHOP-950');
    await page.locator('[data-save-custom-component]').click();
    const customState = await stored(page);
    assert(customState.build.customComponents.length === 1, 'custom component persists with the build');
    assert(customState.build.customComponents[0].verificationStatus === 'UNVERIFIED', 'custom component never receives invented verification');
    assert((await page.locator('#guidedCard').innerText()).includes('LIVE BUILD IMPACT'), 'component selection updates live build impact');

    for (let i = 0; i < 4; i += 1) await page.locator('[data-guided-next]').click();
    assert((await page.locator('#guidedCard h2').innerText()).includes('What should this combination do?'), 'Build flows into Build Review');
    const reviewText = await page.locator('#guidedCard').innerText();
    assert(reviewText.includes('known build facts') && reviewText.includes('unknown'), 'Build Review summarizes known and unknown facts');
    assert(reviewText.includes('Factory / OEM range: Unknown'), 'Build Review keeps unsupported factory ranges unknown');
    assert(/suitability/i.test(reviewText) && reviewText.includes('UNKNOWN'), 'Build Review separates compatibility from suitability');

    await page.locator('[data-guided-next]').click();
    const baselineContext = await page.locator('.measurement-context').innerText();
    assert(/Manufacturer requirement/i.test(baselineContext), 'baseline keeps manufacturer requirement visible');
    assert(/Expected for this build/i.test(baselineContext), 'baseline keeps build expectation visible');
    assert(/CarbTune starting target/i.test(baselineContext), 'baseline labels CarbTune starting targets');
    assert(/Your reading/i.test(baselineContext), 'baseline shows the technician reading in context');
    assert(await page.locator('[data-guide-help="why"]').isVisible(), 'contextual beginner guidance remains available');

    for (const [key, value] of [['temp', '185'], ['rpm', '780'], ['vac', '16']]) {
      await changeValue(page, `[data-guided-value="${key}"]`, value);
      await page.locator('[data-baseline-next]').click();
    }
    await changeValue(page, '[data-guided-value="fp"]', '8.5');
    assert((await page.locator('.result-state').innerText()).includes('HIGH'), '8.5 PSI is interpreted immediately as high');
    assert(await page.locator('[data-correct-now="fp"]').isVisible(), 'abnormal measurement offers Correct Now');
    assert(await page.locator('[data-override-test="fp"]').isVisible(), 'technician override remains available');
    await page.locator('[data-correct-now="fp"]').click();
    assert((await page.locator('#guidedCard').innerText()).includes('above the CarbTune starting window'), 'Guided Tuning explains the measured abnormality honestly');
    await page.locator('[data-correction="regulator"]').click();
    assert((await page.locator('#guidedCard').innerText()).includes('Adjustable Fuel Pressure Regulator'), 'correction creates a Required Action / Part');
    assert((await page.locator('#guidedCard').innerText()).toLowerCase().includes('customer approval'), 'part status requires customer approval');

    await recordTune(page, { parameter: 'Fuel pressure', before: '8.5 PSI', after: '6.2 PSI', reason: 'Measured above starting window', expected: 'Stable inlet pressure' });
    let tuneState = await stored(page);
    assert(tuneState.tuneLog.length === 1, 'Tune Log records the first change');
    assert(['fp', 'float', 'boost', 'afr'].every(key => tuneState.retests[key]?.status === 'RETEST_REQUIRED'), 'fuel-pressure change invalidates dependent measurements');
    assert(await page.locator('[data-retest-measurement="fp"]').isVisible(), 'retest dependency links back to the affected measurement');
    await page.locator('[data-retest-measurement="fp"]').click();
    await changeValue(page, '[data-guided-value="fp"]', '6.2');
    await page.locator('[data-baseline-next]').click();
    assert((await page.locator('#guidedCard h2').innerText()).includes('Change one thing'), 'single retest returns to Guided Tuning');
    tuneState = await stored(page);
    assert(tuneState.baseline.fp === 6.2 && !tuneState.retests.fp, 'retest updates evidence and clears only that dependency');

    await page.reload({ waitUntil: 'networkidle' });
    assert((await page.locator('#guidedCard .tune-log').innerText()).includes('Fuel pressure'), 'Tune Log survives reload');
    await page.locator('#guidedCard [data-revert-tune]').first().click();
    tuneState = await stored(page);
    assert(tuneState.tuneLog.length === 2 && tuneState.tuneLog[0].reverted, 'revert preserves the failed approach and creates a new entry');
    await recordTune(page, { parameter: 'Fuel pressure', before: '8.5 PSI', after: '6.2 PSI', reason: 'Reapply after verified gauge reading', expected: 'Stable pressure' });

    await page.locator('[data-go-verification]').click();
    assert(await page.locator('[data-verification-mode="ROAD_TEST"]').isVisible() && await page.locator('[data-verification-mode="DYNO"]').isVisible(), 'verification supports Road Test and Dyno modes');
    assert((await page.locator('.safety-note').innerText()).includes('safe, legal environment'), 'verification includes safety guidance');
    await saveVerification(page, { mode: 'DYNO', symptom: 'bog', outcome: 'NO_MEASURABLE_CHANGE', notes: 'Bog remained under controlled load.' });
    assert((await page.locator('#guidedCard h2').innerText()).includes('What should be tested next?'), 'verification feeds Symptom Diagnosis');
    const firstCause = await page.locator('[data-diagnostic-cause]').first().getAttribute('data-diagnostic-cause');
    assert(Boolean(firstCause), 'diagnosis ranks a plausible next cause from symptoms and evidence');
    await page.locator('[data-diagnostic-cause]').first().click();
    await recordTune(page, { parameter: 'Accelerator pump test', before: 'Existing setting', after: 'Controlled test setting', reason: 'Test ranked cause', expected: 'Reduce bog' });
    await page.locator('[data-go-verification]').click();
    await saveVerification(page, { mode: 'ROAD_TEST', symptom: 'bog', outcome: 'NO_MEASURABLE_CHANGE', notes: 'No measurable benefit.' });
    const rerankedCause = await page.locator('[data-diagnostic-cause]').first().getAttribute('data-diagnostic-cause');
    assert(rerankedCause !== firstCause, 'no-benefit test is not repeated as the top recommendation');
    const diagnosticState = await stored(page);
    assert(diagnosticState.diagnostic.history.some(item => item.causeId === firstCause && item.outcome === 'NO_MEASURABLE_CHANGE'), 'diagnostic history preserves failed tests');

    await page.locator('[data-diagnostic-cause]').first().click();
    await recordTune(page, { parameter: 'Ignition timing test', before: 'Unknown', after: 'Verified reference setting', reason: 'Test next ranked cause', expected: 'Remove bog' });
    await page.locator('[data-go-verification]').click();
    await saveVerification(page, { mode: 'ROAD_TEST', symptom: 'no-symptoms', outcome: 'POSITIVE', notes: 'Runs cleanly in the tested range.' });
    assert((await page.locator('#guidedCard').innerText()).includes('RUNS WELL'), 'no-symptom verification passes the diagnostic loop');
    await page.locator('[data-show-results]').click();
    const resultsText = await page.locator('#guidedCard').innerText();
    assert(resultsText.includes('The story of this tune'), 'workflow ends in Final Results');
    const normalizedResults = resultsText.toLowerCase();
    assert(['factory / oem', 'expected for build', 'starting target', 'baseline', 'final'].every(label => normalizedResults.includes(label)), 'results tell the complete comparison story');
    assert(resultsText.includes('Fuel pressure') && resultsText.includes('6.2'), 'final story uses the retested fuel-pressure evidence');
    assert(!resultsText.includes('weighted relevance'), 'results contain no fabricated relevance score');

    await page.locator('[data-job-overview]').click();
    assert((await page.locator('#guidedCard').innerText()).includes('JOB OVERVIEW'), 'Job Overview summarizes the full job');
    assert(await page.locator('.overview-item').count() === 8, 'Job Overview provides direct access to every major stage');
    await page.locator('[data-close-overview]').click();
    await page.locator('#guidedCard [data-go="report"]').click();
    assert((await page.locator('#reportBuildSummary').innerText()).includes('Carbureted test engine'), 'final report includes build summary');
    assert((await page.locator('#reportTuneHistory').innerText()).includes('Ignition timing test'), 'final report includes Tune Log history');
    assert((await page.locator('#reportVerification').innerText()).includes('POSITIVE'), 'final report includes verification outcome');
    assert((await page.locator('#reportComparison').innerText()).toLowerCase().includes('factory / oem'), 'final report includes before/after evidence');

    await page.locator('[data-nav="history"]').click();
    const beforeJobs = await page.locator('.job-row').count();
    await page.locator('.screen.active [data-action="new-job"]').click();
    assert(await page.locator('#jobModal').getAttribute('aria-hidden') === 'false', 'New Job opens structured intake');
    const engineManufacturers = await page.locator('#newEngineManufacturer option').allTextContents();
    assert(engineManufacturers.includes('GM / Chevrolet') && engineManufacturers.includes('Ford') && engineManufacturers.includes('Mopar / Chrysler'), 'modern engine manufacturers remain available');
    await page.locator('#newEngineManufacturer').selectOption('GM / Chevrolet');
    await page.locator('#newEngineSize').selectOption('5.7L / 346 CID');
    assert((await page.locator('#newEngineFamily option').allTextContents()).includes('LS Gen III / IV'), 'carbureted LS architecture remains available');
    await page.locator('#newEngineManufacturer').selectOption('Ford');
    await page.locator('#newEngineSize').selectOption('5.0L / 302 CID');
    assert((await page.locator('#newEngineFamily option').allTextContents()).includes('Coyote'), 'carbureted Coyote architecture remains available');
    await page.locator('#newEngineManufacturer').selectOption('Mopar / Chrysler');
    await page.locator('#newEngineSize').selectOption('5.7L / 345 CID');
    assert((await page.locator('#newEngineFamily option').allTextContents()).includes('Gen III Hemi'), 'carbureted Hemi architecture remains available');

    await fillStructuredVehicle(page, 'BUILD50-UNKNOWN-CARB');
    await page.locator('[data-action="create-job"]').click();
    await page.locator('[data-nav="history"]').click();
    assert(await page.locator('.job-row').count() === beforeJobs + 1, 'New Job accepts an unknown carburetor');
    assert((await page.locator('.job-row').filter({ hasText: 'BUILD50-UNKNOWN-CARB' }).innerText()).includes('Unknown carburetor'), 'unknown carburetor remains explicit in persisted history');

    await page.locator('.screen.active [data-action="new-job"]').click();
    await fillStructuredVehicle(page, 'BUILD50-UNKNOWN-CARB');
    await page.locator('[data-action="create-job"]').click();
    assert((await page.locator('#duplicateStatus').innerText()).includes('Creation paused'), 'duplicate detection blocks accidental duplicates');
    await page.locator('[data-action="close-job-modal"]').click();
    await page.locator('.job-row').filter({ hasText: 'BUILD50-UNKNOWN-CARB' }).locator('[data-delete-job]').click();
    assert(await page.locator('#deleteJobModal').getAttribute('aria-hidden') === 'false', 'Delete Job requires confirmation');
    await page.locator('[data-action="confirm-delete-job"]').click();
    assert(await page.locator('.job-row').count() === beforeJobs, 'Delete Job removes only the selected job');

    assert(errors.length === 0, 'browser console has no errors', errors.join(' | '));
    await context.close();

    const migrateContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const migratePage = await migrateContext.newPage();
    migratePage.setDefaultTimeout(9000);
    await migratePage.addInitScript(() => {
      localStorage.setItem('carbtune.clean.v31', JSON.stringify({
        id: 'legacy',
        vehicle: { vehicleName: 'Legacy Vehicle', jobNo: 'OLD-1', carb: 'Holley 4150' },
        baseline: { fp: 6.1 },
        change: { system: 'Fuel pressure', exact: 'Adjusted regulator', reason: 'High reading', expectation: 'Stable pressure' },
        verification: { result: 'Better', afterFp: 6.1 }
      }));
    });
    await migratePage.goto(baseURL, { waitUntil: 'networkidle' });
    const migration = await migratePage.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
    assert(migration.vehicle.vehicleName === 'Legacy Vehicle' && migration.baseline.fp === 6.1, 'legacy active job migration preserves vehicle and measurements');
    assert(migration.productId === 'carbtune-pro' && migration.applicationType === 'carbureted', 'migration applies the CarbTune product boundary');
    assert(migration.tuneLog.length === 1 && migration.tuneLog[0].outcome === 'POSITIVE', 'legacy correction and verification migrate into Tune Log');

    migration.screen = 'guided';
    migration.lastWork = 'guided';
    migration.workflow.phase = 'baseline';
    migration.workflow.baselineIndex = 3;
    migration.workflow.showOverview = false;
    await migratePage.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: storageKey, state: migration });
    await migratePage.reload({ waitUntil: 'networkidle' });

    const viewports = [
      ['iOS phone', 375, 667, 'phone'],
      ['Android phone', 412, 915, 'phone'],
      ['iPad Mini', 768, 1024, 'tablet'],
      ['Android tablet', 800, 1280, 'tablet'],
      ['iPad Pro', 1024, 1366, 'tablet'],
      ['Windows tablet', 1280, 800, 'tablet'],
      ['Windows desktop', 1440, 900, 'desktop']
    ];
    const shotDir = process.env.CARBTUNE_SCREENSHOT_DIR;
    if (shotDir) fs.mkdirSync(shotDir, { recursive: true });
    for (const [name, width, height, type] of viewports) {
      await migratePage.setViewportSize({ width, height });
      const metrics = await migratePage.evaluate(() => {
        const card = document.querySelector('#guidedCard').getBoundingClientRect();
        const task = document.querySelector('.guided-task-grid');
        const visibleControls = [...document.querySelectorAll('#guidedCard button:not([disabled]), #guidedCard select, #guidedCard input')].filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          cardWidth: card.width,
          viewportWidth: document.documentElement.clientWidth,
          taskDisplay: getComputedStyle(task).display,
          taskColumns: getComputedStyle(task).gridTemplateColumns,
          minControlHeight: Math.min(...visibleControls.map(el => el.getBoundingClientRect().height))
        };
      });
      assert(metrics.overflow <= 1, `${name} has no horizontal overflow`, JSON.stringify(metrics));
      assert(metrics.minControlHeight >= 43.5, `${name} preserves touch targets`, JSON.stringify(metrics));
      if (type === 'phone') assert(metrics.taskDisplay !== 'grid', `${name} uses focused single-column task flow`);
      else assert(metrics.taskDisplay === 'grid' && metrics.taskColumns.split(' ').length === 2, `${name} uses task/result columns`, metrics.taskColumns);
      if (type === 'tablet') assert(metrics.cardWidth / metrics.viewportWidth >= 0.86, `${name} uses available tablet width`, `${metrics.cardWidth}/${metrics.viewportWidth}`);
      if (shotDir && ['iOS phone', 'iPad Mini', 'Windows desktop'].includes(name)) {
        await migratePage.screenshot({ path: path.join(shotDir, `${name.toLowerCase().replaceAll(' ', '-')}.png`), fullPage: true });
      }
    }
    await migrateContext.close();
  } finally {
    await browser.close();
  }

  console.log(results.join('\n'));
  console.log(`PASS TOTAL ${results.length}`);
}

run().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
