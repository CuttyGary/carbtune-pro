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
  await page.locator('#newVehicleYear').selectOption('1985');
  await page.locator('#newVehicleMake').selectOption('Chevrolet');
  await page.locator('#newVehicleModel').selectOption('Camaro');
  await page.locator('#newVehicleSubmodel').selectOption('Unknown / Not Listed');
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

    const readiness = await page.evaluate(() => ({
      build51: document.querySelector('header')?.innerText.includes('Build 51'),
      b51: typeof b51,
      state: typeof state,
      renderGuided: typeof renderGuided
    }));
    assert(readiness.build51 && readiness.b51 === 'function' && readiness.state === 'object' && readiness.renderGuided === 'function', 'current Build 51 application initializes', JSON.stringify(readiness));

    assert(await page.locator('.screen.active').getAttribute('data-screen') === 'guided', 'continuous guided workflow is primary');
    assert((await page.locator('header').innerText()).includes('Build 51'), 'Build 51 version is visible');
    assert(await page.locator('meta[name="application-domain"]').getAttribute('content') === 'carbureted', 'application metadata declares carbureted domain');
    assert((await page.locator('#productScopeBadge').innerText()).includes('Carbureted'), 'carbureted product scope is visible');
    const productState = await stored(page);
    assert(productState.productId === 'carbtune-pro' && productState.applicationType === 'carbureted', 'jobs persist the CarbTune product boundary');
    const visibleWorkflow = await page.locator('.screen.active').innerText();
    assert(!/(injector pulse|fuel table|spark table|ecu calibration|pcm calibration|maf calibration)/i.test(visibleWorkflow), 'EFI calibration workflows are absent');
    const initialReview = await page.locator('#guidedCard').innerText();
    assert(initialReview.includes('What we know, what it means, what comes next'), 'demo starts at current Build Intelligence review');
    assert(await page.locator('#guidedProgress .guided-step').count() === 8, 'linear workflow exposes eight major stages');
    assert((await page.locator('#workflowPosition').innerText()) === 'STEP 3 OF 8', 'workflow position is explicit');
    assert(initialReview.includes('CONFIDENCE') && /\d+%/.test(initialReview) && initialReview.includes('Limited by'), 'Build Intelligence labels calculated confidence and its evidence limit');
    assert(/unknown|insufficient information/i.test(initialReview), 'Build Intelligence distinguishes missing evidence');

    await page.locator('[data-job-overview]').click();
    await page.locator('[data-jump-phase="build"]').click();
    assert((await page.locator('#guidedCard h2').innerText()).includes('different from stock'), 'completed Build stage can be reopened');
    const chassisBeforeEngineEdit = (await stored(page)).vehicle.vehicleName;
    await page.locator('[data-internal-status="Stock internally"]').click();
    await page.locator('[data-b51-next="build"]').click();
    await page.locator('[data-guided-back]').click();
    const persistedBuild = await stored(page);
    assert(persistedBuild.build.internalStatus === 'Stock internally', 'Back and Continue preserve build data');
    assert(persistedBuild.vehicle.vehicleName === chassisBeforeEngineEdit && persistedBuild.vehicle.engineLabel.includes('L31 Vortec'), 'chassis and installed engine identities remain separate');

    await setStored(page, state => {
      state.workflow.phase = 'build';
      state.workflow.showOverview = false;
      state.workflow.b51 = {
        ...(state.workflow.b51 || {}),
        showJobs: false,
        componentFilters: { carburetor: false },
        componentQueries: {}
      };
      state.build.modifiedSystems = ['carburetor'];
    });
    await page.locator('[data-component-search="carburetor"]').fill('BR-67255');
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
    assert(/unverified|insufficient information/i.test(await page.locator('#guidedCard').innerText()), 'custom component remains visibly unverified');

    await page.locator('[data-b51-next="build"]').click();
    assert((await page.locator('#guidedCard h2').innerText()).includes('What we know, what it means, what comes next'), 'Build flows into current Build Intelligence review');
    const reviewText = await page.locator('#guidedCard').innerText();
    assert(reviewText.includes('supported facts') && /unknown|insufficient/i.test(reviewText), 'Build Intelligence summarizes supported and missing facts');
    assert(reviewText.includes('VERIFIED MANUFACTURER FACTS'), 'manufacturer facts retain their own evidence class');
    assert(reviewText.includes('CARBTUNE INFERENCE / ESTIMATE'), 'CarbTune inference remains separate from manufacturer facts');
    assert(/suitability/i.test(reviewText) && /INSUFFICIENT INFORMATION|UNKNOWN/i.test(reviewText), 'Build Intelligence separates compatibility from suitability');

    await page.locator('[data-b51-next="review"]').click();
    const baselineContext = await page.locator('.measurement-table').innerText();
    assert(/Measured/i.test(baselineContext), 'baseline labels the technician measurement');
    assert(/Expected for build/i.test(baselineContext), 'baseline labels the build-specific expectation');
    assert(/Difference/i.test(baselineContext), 'baseline shows the comparison delta');
    assert(/Meaning/i.test(baselineContext), 'baseline explains the comparison');
    const baselineCardText = await page.locator('.measurement-table').locator('xpath=..').innerText();
    assert(/not a manufacturer specification/i.test(baselineCardText), 'baseline keeps recommendation provenance explicit');
    assert(await page.locator('[data-wideband]').isVisible() && !(await page.locator('[data-wideband]').isChecked()), 'carburetor baseline starts without assuming a wideband');
    assert(await page.locator('[data-guided-value="afr"]').count() === 0, 'carburetor-only baseline does not require AFR');
    const guidanceOptions = await page.locator('#guidanceLevel option').allTextContents();
    assert(['Beginner', 'Seasoned', 'Pro'].every(level => guidanceOptions.includes(level)), 'Beginner, Seasoned, and Pro guidance levels are available');
    await changeValue(page, '[data-guided-value="temp"]', '400');
    assert(await page.locator('.validation-message').isVisible(), 'implausible measurement is rejected with an explicit validation message');
    await changeValue(page, '[data-guided-value="temp"]', '185');
    assert(await page.locator('.validation-message').count() === 0, 'plausible measurement clears validation');
    await page.locator('#guidanceLevel').selectOption('Seasoned');
    assert(await page.locator('[data-quick-value="afr"]').count() === 0, 'grouped carburetor baseline still excludes AFR without a device');
    await page.locator('[data-wideband]').check();
    assert(await page.locator('[data-quick-value="afr"]').count() === 1, 'explicit wideband availability adds AFR evidence');
    await page.locator('[data-wideband]').uncheck();
    assert(await page.locator('[data-quick-value="afr"]').count() === 0, 'removing wideband availability removes AFR from the required evidence set');

    await setStored(page, state => {
      state.guidance = 'Beginner';
      state.baseline = { ...state.baseline, temp: 185, rpm: 780, vac: 16, fp: 8.5, initial: 12, total: 34 };
      state.complaints = ['flooding'];
      state.workflow.phase = 'diagnose';
      state.workflow.baselineIndex = 0;
      state.workflow.completed = [...new Set([...(state.workflow.completed || []), 'review', 'baseline'])];
      state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false, hasWideband: false, action: null };
      state.retests = {};
      state.snapshots = [{ id: 'initial', type: 'INITIAL_BASELINE', label: 'Initial baseline', at: new Date().toISOString(), measurements: { ...state.baseline }, estimated: false }];
    });
    assert((await page.locator('#guidedCard').innerText()).includes('Verify regulator output'), 'diagnosis interprets measured high fuel pressure before calibration changes');
    await page.locator('[data-start-action]').click();
    await page.locator('[data-action-finding="FAULT_FOUND"]').click();
    await changeValue(page, '[data-actual-change]', 'Adjusted regulator to 6.2 PSI');
    await page.locator('[data-action-retest]').click();
    let tuneState = await stored(page);
    assert(tuneState.tuneLog.length === 1, 'Tune Log records the controlled correction');
    assert(['fp', 'float', 'boost'].every(key => tuneState.retests[key]?.status === 'RETEST_REQUIRED'), 'correction creates relevant retest dependencies');

    await changeValue(page, '[data-guided-value="fp"]', '6.2');
    await page.locator('[data-baseline-next]').click();
    await page.locator('[data-guided-value="float"]').selectOption('Correct');
    await page.locator('[data-baseline-next]').click();
    assert(await page.locator('[data-guided-value="boost"]').count() === 0, 'retest UI does not manufacture an unsupported boost measurement field');
    tuneState = await stored(page);
    assert(tuneState.baseline.fp === 6.2 && Object.keys(tuneState.retests).length === 0, 'retest updates evidence and clears completed dependencies', JSON.stringify({ fp: tuneState.baseline.fp, retests: tuneState.retests, phase: tuneState.workflow.phase }));

    assert(await page.locator('[data-verification-mode="ROAD_TEST"]').isVisible() && await page.locator('[data-verification-mode="DYNO"]').isVisible(), 'verification supports Road Test and Dyno modes');
    assert((await page.locator('.safety-note').innerText()).includes('safe, legal environment'), 'verification includes safety guidance');
    await page.locator('[data-verification-mode="DYNO"]').click();
    await page.locator('[data-b51-context="heavy-accel"]').click();
    await page.locator('[data-verification-symptom="no-symptoms"]').click();
    await changeValue(page, '[data-verification-notes]', 'Runs cleanly after the measured correction.');
    await page.locator('[data-save-verification]').click();
    const verifiedState = await stored(page);
    assert(verifiedState.verificationSessions.at(-1).outcome === 'POSITIVE', 'before/after evidence classifies a positive outcome');
    assert(verifiedState.tuneLog.at(-1).outcome === 'POSITIVE', 'successful technician result is attached to the Tune Log without becoming a manufacturer claim');
    const resultsText = await page.locator('#guidedCard').innerText();
    assert(resultsText.includes('Before vs final vs expected'), 'workflow ends with measured comparison results');
    assert(resultsText.includes('Fuel Pressure') && resultsText.includes('6.2'), 'final results use retested fuel-pressure evidence');
    assert(resultsText.includes('Recommendations are CarbTune inference'), 'results preserve recommendation provenance');
    assert(!resultsText.includes('weighted relevance'), 'results contain no fabricated relevance score');

    await page.locator('[data-save-exit]').click();
    assert((await page.locator('#guidedCard').innerText()).includes('JOBS / HOME'), 'Save & Exit opens the current jobs home');
    const beforeJobs = await page.evaluate(() => JSON.parse(localStorage.getItem('carbtune.jobs.v40') || '[]').length);
    await page.locator('#guidedCard [data-action="new-job"]').click();
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

    await fillStructuredVehicle(page, 'CT0052-UNKNOWN-CARB');
    await page.locator('[data-action="create-job"]').click();
    let jobRecords = await page.evaluate(() => JSON.parse(localStorage.getItem('carbtune.jobs.v40') || '[]'));
    assert(jobRecords.length === beforeJobs + 1, 'New Job accepts an unknown carburetor');
    assert(jobRecords.some(job => job.vehicle.jobNo === 'CT0052-UNKNOWN-CARB' && job.vehicle.carb === 'Unknown carburetor'), 'unknown carburetor remains explicit in persisted history');

    await page.locator('[data-save-exit]').click();
    await page.locator('#guidedCard [data-action="new-job"]').click();
    await fillStructuredVehicle(page, 'CT0052-UNKNOWN-CARB');
    await page.locator('[data-action="create-job"]').click();
    assert(/creation paused/i.test(await page.locator('#duplicateStatus').innerText()), 'duplicate detection blocks accidental duplicates');
    await page.locator('[data-action="close-job-modal"]').click();
    await page.locator('#guidedCard .component-result').filter({ hasText: 'CT0052-UNKNOWN-CARB' }).locator('[data-delete-job]').click();
    assert(await page.locator('#deleteJobModal').getAttribute('aria-hidden') === 'false', 'Delete Job requires confirmation');
    await page.locator('[data-action="confirm-delete-job"]').click();
    jobRecords = await page.evaluate(() => JSON.parse(localStorage.getItem('carbtune.jobs.v40') || '[]'));
    assert(jobRecords.length === beforeJobs && !jobRecords.some(job => job.vehicle.jobNo === 'CT0052-UNKNOWN-CARB'), 'Delete Job removes only the selected job');

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
    assert(migration.vehicle.vehicleName === 'Legacy Vehicle' && migration.baseline.fp === 6.1, 'legacy active job migration preserves vehicle and measurements', JSON.stringify({ vehicle: migration.vehicle, baseline: migration.baseline }));
    assert(migration.productId === 'carbtune-pro' && migration.applicationType === 'carbureted', 'migration applies the CarbTune product boundary');
    assert(migration.tuneLog.length === 1 && migration.tuneLog[0].outcome === 'POSITIVE', 'legacy correction and verification migrate into Tune Log');

    migration.screen = 'guided';
    migration.lastWork = 'guided';
    migration.vehicle = {
      ...migration.vehicle,
      year: '1985',
      make: 'Chevrolet',
      model: 'Camaro',
      submodel: 'Unknown / Not Listed',
      vehicleName: '1985 Chevrolet Camaro Unknown / Not Listed'
    };
    migration.workflow.phase = 'vehicle';
    migration.workflow.baselineIndex = 0;
    migration.workflow.showOverview = false;
    migration.workflow.b51 = { ...(migration.workflow.b51 || {}), showJobs: false };
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
        const layout = document.querySelector('#guidedCard .build-fields');
        const visibleControls = [...document.querySelectorAll('#guidedCard button:not([disabled]), #guidedCard select, #guidedCard input')].filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          cardWidth: card.width,
          viewportWidth: document.documentElement.clientWidth,
          layoutDisplay: getComputedStyle(layout).display,
          layoutColumns: getComputedStyle(layout).gridTemplateColumns,
          minControlHeight: Math.min(...visibleControls.map(el => el.getBoundingClientRect().height))
        };
      });
      assert(metrics.overflow <= 1, `${name} has no horizontal overflow`, JSON.stringify(metrics));
      assert(metrics.minControlHeight >= 43.5, `${name} preserves touch targets`, JSON.stringify(metrics));
      if (type === 'phone') assert(metrics.layoutDisplay === 'grid' && metrics.layoutColumns.split(' ').length === 1, `${name} uses focused single-column fields`, metrics.layoutColumns);
      else assert(metrics.layoutDisplay === 'grid' && metrics.layoutColumns.split(' ').length >= 2, `${name} uses multi-column task space`, metrics.layoutColumns);
      if (type === 'tablet') assert(metrics.cardWidth >= Math.min(metrics.viewportWidth * 0.86, 1000), `${name} uses available tablet width`, `${metrics.cardWidth}/${metrics.viewportWidth}`);
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
