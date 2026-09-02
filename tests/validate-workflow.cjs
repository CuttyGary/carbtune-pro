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
  const visibleSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(!/[âÃÂ�]/.test(visibleSource), 'visible application source contains no mojibake');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
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

    await setStored(page, state => {
      state.guidance = 'Beginner';
      state.baseline = { ...state.baseline, temp: 185, rpm: 780, vac: 16, fp: 8.5, initial: 12, float: 'Correct' };
      state.workflow.phase = 'baseline';
      state.workflow.baselineIndex = 3;
      state.workflow.overrideAudit = [];
      state.workflow.overrides = [];
      state.workflow.warnings = [];
      state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false, hasWideband: false, retestQueue: null };
      state.tuneLog = [];
    });
    const beginnerWarning = page.locator('[data-advisory-warning="baseline.fp.high"]');
    assert(await beginnerWarning.isVisible(), 'advisory abnormal value produces a visible warning');
    assert(await page.locator('[data-guided-value="fp"]').inputValue() === '8.5', 'advisory warning preserves the original entered value');
    const beginnerText = await beginnerWarning.innerText();
    assert(/Why it matters/i.test(beginnerText) && /Expected \/ recommended/i.test(beginnerText) && /Recommended correction \/ recheck/i.test(beginnerText), 'Beginner explains abnormality, impact, expected range, and correction');
    assert(/does not make the value normal|does not.*agree/i.test(beginnerText), 'Beginner explains what overriding means');
    assert(await beginnerWarning.locator('[data-correct-recheck="fp"]').isVisible(), 'advisory offers Correct / Recheck');
    assert(await beginnerWarning.locator('[data-b51-override="fp"]').isVisible(), 'advisory visibly offers Override & Continue');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'advisory warning has no phone horizontal overflow');
    const warningTargets = await beginnerWarning.locator('button').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().height));
    assert(warningTargets.every(height => height >= 44), 'advisory actions preserve phone touch targets');
    let overrideState = await stored(page);
    assert(overrideState.workflow.overrideAudit.length === 0, 'continuing requires explicit technician override action');
    await beginnerWarning.locator('[data-override-reason="fp"]').fill('Known gauge offset; proceeding to compare regulator response');
    await beginnerWarning.locator('[data-b51-override="fp"]').click();
    overrideState = await stored(page);
    const beginnerAudit = overrideState.workflow.overrideAudit[0];
    assert(beginnerAudit?.type === 'WARNING_OVERRIDE' && beginnerAudit.warningId === 'baseline.fp.high', 'override creates an audit record with warning identity and context');
    assert(beginnerAudit.originalValue === 8.5 && overrideState.baseline.fp === 8.5, 'audit retains original abnormal value without normalizing it');
    assert(beginnerAudit.technicianIntent === 'OVERRIDE_AND_CONTINUE' && /Known gauge offset/.test(beginnerAudit.technicianReason), 'audit retains explicit technician intent and supplied reason');
    assert(!Number.isNaN(Date.parse(beginnerAudit.timestamp)), 'override audit retains a valid timestamp');
    assert(beginnerAudit.jobId === overrideState.id && beginnerAudit.workflowPhase === 'baseline' && beginnerAudit.measurementId === 'fp', 'override audit is associated with the correct job, workflow, and measurement');
    assert(beginnerAudit.guidanceLevel === 'Beginner' && beginnerAudit.continuation.action === 'CONTINUED_AFTER_WARNING' && beginnerAudit.continuation.nextMeasurementId === 'initial', 'override audit records guidance and resulting workflow continuation');
    assert(overrideState.tuneLog.some(entry => entry.id === beginnerAudit.id && entry.outcome === 'WARNING_OVERRIDDEN'), 'override is added to Tune Log evidence');

    await page.reload({ waitUntil: 'networkidle' });
    const reloadedOverride = await stored(page);
    assert(reloadedOverride.workflow.overrideAudit.some(entry => entry.id === beginnerAudit.id), 'override audit survives save and reload');
    await page.evaluate(() => { state.workflow.phase = 'results'; state.results.completed = false; save(); renderGuided(); });
    const auditHistory = page.locator(`#guidedCard [data-override-audit="${beginnerAudit.id}"]`);
    assert(await auditHistory.isVisible() && /Original measured value:\s*8\.5 PSI/i.test(await auditHistory.innerText()) && /Override & Continue/i.test(await auditHistory.innerText()), 'override remains visible with original value in Tune Log audit history');

    await setStored(page, state => {
      state.guidance = 'Beginner';
      state.baseline = { ...state.baseline, temp: 185, rpm: 780, vac: 16, fp: 6.2, initial: 12, float: 'Correct' };
      state.workflow.phase = 'baseline';
      state.workflow.baselineIndex = 3;
      state.workflow.overrideAudit = [];
      state.workflow.overrides = [];
      state.workflow.warnings = [];
      state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false, hasWideband: false, retestQueue: null };
      state.tuneLog = [];
    });
    assert(await page.locator('[data-advisory-warning]').count() === 0 && await page.locator('[data-b51-override]').count() === 0, 'in-range value creates no warning or override path');
    await page.locator('[data-baseline-next]').click();
    assert((await stored(page)).workflow.overrideAudit.length === 0, 'in-range value creates no override record');

    await setStored(page, state => {
      state.guidance = 'Beginner';
      state.baseline.fp = 31;
      state.workflow.phase = 'baseline';
      state.workflow.baselineIndex = 3;
      state.workflow.overrideAudit = [];
      state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false, hasWideband: false, retestQueue: null };
    });
    const hardStop = page.locator('[data-hard-stop="fp"]');
    assert(await hardStop.isVisible() && /Cannot continue|hard stop/i.test(await hardStop.innerText()), 'genuine implausible condition explains the non-overridable hard stop');
    assert(await page.locator('[data-guided-value="fp"]').inputValue() === '31' && await page.locator('[data-b51-override="fp"]').count() === 0 && await page.locator('[data-baseline-next]').isDisabled(), 'hard-stop value remains visible and cannot use advisory override');

    for (const guidance of ['Seasoned', 'Pro']) {
      await setStored(page, state => {
        state.guidance = guidance;
        state.baseline = { ...state.baseline, temp: 185, rpm: 780, vac: 16, fp: 8.5, initial: 12, float: 'Correct' };
        state.workflow.phase = 'baseline';
        state.workflow.baselineIndex = 0;
        state.workflow.overrideAudit = [];
        state.workflow.overrides = [];
        state.workflow.warnings = [];
        state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false, hasWideband: false, retestQueue: null };
        state.tuneLog = [];
      });
      const warning = page.locator('[data-advisory-warning="baseline.fp.high"]');
      assert(await warning.isVisible() && await warning.locator('[data-b51-override="fp"]').isVisible(), `${guidance} guidance permits safe explicit override`);
      assert(await page.locator('[data-baseline-complete]').isDisabled(), `${guidance} cannot silently continue before explicit override`);
      await warning.locator('[data-b51-override="fp"]').click();
      const guidanceState = await stored(page);
      assert(guidanceState.workflow.overrideAudit.length === 1 && guidanceState.workflow.overrideAudit[0].guidanceLevel === guidance && guidanceState.baseline.fp === 8.5, `${guidance} override is audited and preserves the entered value`);
      assert(!(await page.locator('[data-baseline-complete]').isDisabled()), `${guidance} can continue promptly after the advisory is audited`);
    }

    await setStored(page, state => {
      state.guidance = 'Novice';
      state.workflow.phase = 'baseline';
      state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false };
      state.workflow.overrideAudit = [{ id: 'legacy-audit', guidanceLevel: 'Novice', measurementName: 'Manifold Vacuum', originalValue: 11, unit: 'inHg', warning: 'Low manifold vacuum', at: new Date().toISOString() }];
    });
    const legacyGuidance = await stored(page);
    assert(legacyGuidance.guidance === 'Beginner' && await page.locator('#guidanceLevel').inputValue() === 'Beginner', 'legacy Novice saved job migrates deterministically to Beginner');
    assert(legacyGuidance.workflow.overrideAudit[0].guidanceLevel === 'Novice', 'legacy CT-0054 audit guidance remains historical Novice evidence');
    assert((await page.locator('#resumeBlocker').innerText()).includes('OPEN CONCERN') && !(await page.locator('#resumeBlocker').innerText()).includes('CURRENT BLOCKER'), 'overridden warning is an open concern rather than an active blocker');

    await setStored(page, state => {
      state.guidance = 'Beginner';
      state.baseline = { ...state.baseline, temp: 185, rpm: 780, vac: 16, fp: 6.2, initial: 12, total: 34, float: 'Correct' };
      state.workflow.phase = 'baseline';
      state.workflow.baselineIndex = 0;
      state.workflow.overrideAudit = [];
      state.workflow.overrides = [];
      state.workflow.warnings = [];
      state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false, hasWideband: false, retestQueue: null };
      state.tuneLog = [];
    });
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
    assert((await page.locator('#guidedCard').innerText()).includes('Compare IDLE FUEL PRESSURE to FUEL PRESSURE AT 2500 RPM'), 'diagnosis names the structured fuel-pressure comparison explicitly');
    await page.locator('[data-start-action]').click();
    await page.locator('[data-diagnostic-number="idle"]').fill('8.5');
    await page.locator('[data-diagnostic-number="rpm2500"]').fill('7.0');
    await page.locator('[data-save-numeric-result]').click();
    let tuneState = await stored(page);
    assert(tuneState.diagnostic.tests.at(-1).results.at(-1).delta === -1.5, 'numeric fuel-pressure test stores and interprets both specific values');
    await setStored(page, state => {
      state.tuneLog = [{ id: 'legacy-controlled-correction', at: new Date().toISOString(), parameter: 'Fuel pressure', before: '8.5 PSI', after: '6.2 PSI', outcome: 'NOT_YET_VERIFIED', measurementsBefore: { ...state.baseline }, measurementsAfter: {}, symptomsBefore: ['flooding'], symptomsAfter: [] }];
      state.results.lastTuneId = 'legacy-controlled-correction';
      state.retests = { fp: { status: 'RETEST_REQUIRED' }, float: { status: 'RETEST_REQUIRED' }, boost: { status: 'RETEST_REQUIRED' } };
      state.workflow.b51 = { ...(state.workflow.b51 || {}), retestQueue: ['fp', 'float', 'boost'], action: { id: 'fuel-pressure-compare', system: 'Fuel pressure', observe: '8.5 PSI', action: 'Compare fuel pressure', retest: ['fp', 'float', 'boost'], tuneEntryId: 'legacy-controlled-correction' } };
      state.workflow.phase = 'baseline';
      state.workflow.baselineIndex = 0;
    });
    tuneState = await stored(page);
    assert(tuneState.tuneLog.length === 1, 'Tune Log retains controlled correction evidence');
    assert(['fp', 'float', 'boost'].every(key => tuneState.retests[key]?.status === 'RETEST_REQUIRED'), 'correction retains relevant retest dependencies');

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
    const structuredValidation = verifiedState.validationResults.at(-1);
    assert(structuredValidation.schema === 'carbtune.validation-result' && structuredValidation.schemaVersion === 1, 'verification persists the versioned validation-result contract');
    assert(structuredValidation.validationType === 'TECHNICIAN_RETEST' && structuredValidation.result === 'PASS' && structuredValidation.lifecycle === 'CURRENT', 'current technician retest persists explicit result and lifecycle');
    assert(structuredValidation.observedAt && structuredValidation.source.origin === 'CARBTUNE_TECHNICIAN_WORKFLOW' && structuredValidation.evidence[0].reference === verifiedState.verificationSessions.at(-1).id, 'validation result preserves timestamp, origin, and evidence reference');
    const staleCannotPass = await page.evaluate(() => {
      const changed = JSON.parse(JSON.stringify(state));
      changed.vehicle.model = 'Different chassis';
      window.CARB_TUNE_CONTRACTS.normalizeJob(changed);
      const record = changed.validationResults.at(-1);
      return { lifecycle: record.lifecycle, verified: window.CARB_TUNE_CONTRACTS.isCurrentVerified(record, window.CARB_TUNE_CONTRACTS.subjectForJob(changed)) };
    });
    assert(staleCannotPass.lifecycle === 'STALE' && staleCannotPass.verified === false, 'changed chassis makes prior validation stale and unable to masquerade as verified');
    const resultsText = await page.locator('#guidedCard').innerText();
    assert(resultsText.includes('Before vs final vs expected'), 'workflow ends with measured comparison results');
    assert(resultsText.includes('Fuel Pressure') && resultsText.includes('6.2'), 'final results use retested fuel-pressure evidence');
    assert(resultsText.includes('Recommendations are CarbTune inference'), 'results preserve recommendation provenance');
    assert(!resultsText.includes('weighted relevance'), 'results contain no fabricated relevance score');

    await page.locator('[data-save-exit]').click();
    assert((await page.locator('#guidedCard').innerText()).includes('VEHICLES / JOBS'), 'Save & Exit opens the current shop vehicle and jobs home');
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

    await page.locator('#newCarb').fill('br67255');
    assert(await page.locator('#newCarbSuggestions [data-new-carb-id]').count() === 1, 'carb type-ahead filters while typing and ignores case/punctuation');
    await page.locator('#newCarbSuggestions [data-new-carb-id]').click();
    assert(await page.locator('#newCarb').inputValue() === 'BR-67255', 'known carb selection preserves canonical part number');
    assert(/IDENTIFICATION: Recognized BR-67255/.test(await page.locator('#newCarbEvidence').innerText()) && /COMPATIBILITY: unresolved/.test(await page.locator('#newCarbEvidence').innerText()), 'carb identification remains separate from compatibility');
    await page.locator('#newCarb').fill('not-a-catalog-part');
    assert(await page.locator('#newCarbSuggestions [data-new-carb-id]').count() === 0 && /unverified/i.test(await page.locator('#newCarbEvidence').innerText()), 'unknown carb does not fabricate a known record');
    await page.locator('#newCarb').fill('');

    await fillStructuredVehicle(page, 'CT0052-UNKNOWN-CARB');
    await page.locator('[data-action="create-job"]').click();
    let jobRecords = await page.evaluate(() => JSON.parse(localStorage.getItem('carbtune.jobs.v40') || '[]'));
    assert(jobRecords.length === beforeJobs + 1, 'New Job accepts an unknown carburetor');
    assert(jobRecords.some(job => job.vehicle.jobNo === 'CT0052-UNKNOWN-CARB' && job.vehicle.carb === 'Unknown carburetor'), 'unknown carburetor remains explicit in persisted history');
    const carried = await stored(page);
    assert(carried.workflow.phase === 'build' && carried.workflow.completed.includes('vehicle') && carried.vehicle.year === '1985', 'new-job chassis data carries forward without duplicate required entry');
    let firstVisitSnapshot = JSON.stringify(jobRecords.find(job => job.id === carried.id));
    let fleetRecords = await page.evaluate(() => JSON.parse(localStorage.getItem('carbtune.vehicles.v1') || '[]'));
    const persistedVehicle = fleetRecords.find(vehicle => vehicle.id === carried.vehicleRecordId);
    assert(persistedVehicle && persistedVehicle.jobIds.includes(carried.id) && persistedVehicle.configurationSnapshots.some(snapshot => snapshot.jobId === carried.id), 'new job persists a stable Vehicle Record relationship and configuration snapshot');

    await page.locator('[data-save-exit]').click();
    firstVisitSnapshot = await page.evaluate(id => JSON.stringify(JSON.parse(localStorage.getItem('carbtune.jobs.v40') || '[]').find(job => job.id === id)), carried.id);
    const returningCard = page.locator('#guidedCard .component-result').filter({ hasText: 'CT0052-UNKNOWN-CARB' }).first();
    assert((await returningCard.innerText()).includes('Current configuration:'), 'Jobs home presents returning vehicles and current configuration in technician language');
    await returningCard.locator('[data-new-job-vehicle]').click();
    const returnVisit = await stored(page);
    jobRecords = await page.evaluate(() => JSON.parse(localStorage.getItem('carbtune.jobs.v40') || '[]'));
    assert(jobRecords.length === beforeJobs + 2 && returnVisit.vehicleRecordId === carried.vehicleRecordId, 'one persistent vehicle supports a second job without duplication');
    assert(returnVisit.workflow.phase === 'review' && returnVisit.workflow.completed.includes('build') && returnVisit.vehicle.engineManufacturer === carried.vehicle.engineManufacturer, 'starting from a returning vehicle carries known configuration and skips duplicate identification');
    assert(JSON.stringify(jobRecords.find(job => job.id === carried.id)) === firstVisitSnapshot, 'starting a return visit does not mutate the historical job');
    fleetRecords = await page.evaluate(() => JSON.parse(localStorage.getItem('carbtune.vehicles.v1') || '[]'));
    const reloadedVehicle = fleetRecords.find(vehicle => vehicle.id === carried.vehicleRecordId);
    assert(reloadedVehicle.jobIds.length === 2 && reloadedVehicle.configurationSnapshots.length === 2 && reloadedVehicle.configurationSnapshots[0].jobId === carried.id, 'vehicle/job relationships and historical configuration snapshots survive persistence');
    const returnVisitId = returnVisit.id;
    await page.reload({ waitUntil: 'networkidle' });
    assert((await stored(page)).vehicleRecordId === carried.vehicleRecordId, 'stable vehicle relationship survives reload');
    await page.locator('[data-save-exit]').click();
    await page.locator(`#guidedCard [data-delete-job="${returnVisitId}"]`).click();
    await page.locator('[data-action="confirm-delete-job"]').click();

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

    await setStored(page, state => {
      state.vehicle = { ...state.vehicle, year: '1984', make: 'Oldsmobile', model: 'Cutlass / Cutlass Supreme', submodel: '', vehicleName: '1984 Oldsmobile Cutlass / Cutlass Supreme', chassisEvidence: 'SOURCED' };
      state.workflow.phase = 'vehicle';
      state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false };
    });
    await page.locator('[data-b51-next="vehicle"]').click();
    assert((await stored(page)).workflow.phase === 'build', 'missing sourced submodel does not block continuation');

    await page.locator('[data-save-exit]').click();
    await page.locator('#guidedCard [data-action="new-job"]').click();
    const actionRect = await page.locator('[data-action="create-job"]').boundingBox();
    assert(actionRect && actionRect.y + actionRect.height <= 844, 'mobile Create New Job primary action remains reachable');
    await page.locator('[data-custom-chassis]').click();
    await page.locator('#newVehicleCustomYear').fill('1968');
    await page.locator('#newVehicleCustomMake').fill('Plymouth');
    await page.locator('#newVehicleCustomModel').fill('Barracuda');
    const customDraft = await page.evaluate(() => jobDraft());
    assert(customDraft.year === '1968' && customDraft.chassisEvidence === 'TECHNICIAN_ENTERED_UNVERIFIED', 'pre-1984 custom chassis is technician-entered and explicitly unverified');
    await page.locator('[data-action="close-job-modal"]').click();

    await setStored(page, state => {
      state.workflow.phase = 'verify';
      state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false, verificationDraft: { mode: 'ROAD_TEST', symptoms: [], contexts: [], notes: '', measurements: {} } };
    });
    await page.locator('[data-b51-context="tip-in"]').tap();
    assert(await page.locator('[data-b51-context="tip-in"]').getAttribute('aria-pressed') === 'true', 'Operating Context responds to touch with visible selected state');
    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.locator('[data-b51-context="tip-in"]').getAttribute('aria-pressed') === 'true' && (await stored(page)).workflow.b51.verificationDraft.contexts.includes('tip-in'), 'Operating Context survives save and reload as structured evidence');

    await page.locator('[data-verification-symptom="other"]').click();
    await page.locator('[data-other-observation]').fill('Run on when key off');
    assert((await stored(page)).diagnostic.otherObservation === 'Run on when key off', 'Other technician observation persists');
    await page.locator('[data-confirm-symptom="run-on"]').click();
    assert((await stored(page)).complaints.includes('run-on'), 'run-on alias requires confirmation and becomes structured evidence');
    await page.reload({ waitUntil: 'networkidle' });
    assert((await stored(page)).complaints.includes('run-on'), 'structured symptoms persist through reload');

    for (const [guidance, phrase] of [['Seasoned', 'Observe the primary discharge'], ['Pro', 'note onset and continuity']]) {
      await setStored(page, state => {
        state.guidance = guidance;
        state.complaints = ['tipin'];
        state.workflow.phase = 'diagnose';
        state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false, action: null };
        state.diagnostic.tests = [];
      });
      assert((await page.locator('#guidedCard').textContent()).includes(phrase), `${guidance} accelerator-pump guidance remains concise`);
    }

    await setStored(page, state => {
      state.guidance = 'Beginner';
      state.complaints = ['tipin'];
      state.workflow.phase = 'diagnose';
      state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false, action: null };
      state.diagnostic.tests = [];
    });
    await page.locator('[data-start-action="accelerator-pump-shot"]').click();
    await page.locator('[data-diagnostic-result="IMMEDIATE_STRONG"]').click();
    assert((await stored(page)).diagnostic.tests[0].state === 'RULED_OUT', 'normal pump-shot result rules out the supported branch');
    assert(await page.locator('[data-custom-action]').isVisible(), 'free-text custom action remains available');
    await page.locator('[data-diagnostic-next]').first().click();
    assert(await page.locator('[data-start-action="accelerator-pump-shot"]').count() === 0, 'completed test is not immediately recommended again');

    await setStored(page, state => {
      state.complaints = ['tipin', 'bog'];
      state.workflow.phase = 'diagnose';
      state.workflow.b51 = { ...(state.workflow.b51 || {}), showJobs: false, action: null };
      state.diagnostic.tests = [];
      state.diagnostic.terminalState = null;
    });
    assert(/Check accelerator-pump discharge/.test(await page.locator('#guidedCard').innerText()), 'symptoms recommend an explicit accelerator-pump test');
    assert(/Engine OFF/.test(await page.locator('#guidedCard').innerText()), 'Beginner guidance explains the accelerator-pump procedure');
    await page.locator('[data-start-action="accelerator-pump-shot"]').click();
    await page.locator('[data-diagnostic-result="NO_DISCHARGE"]').click();
    let diagnostic = (await stored(page)).diagnostic.tests[0];
    assert(diagnostic.results[0].structured && diagnostic.state === 'CORRECTION_RECOMMENDED', 'abnormal pump-shot structured result changes state and produces a correction path');
    assert(await page.locator('[data-actual-change]').count() === 0, 'prescribed correction does not ask technician to invent what changed');
    await page.locator('[data-perform-correction]').click();
    assert((await stored(page)).diagnostic.tests[0].state === 'RETEST_REQUIRED', 'correction leads to a specific retest');
    await page.locator('[data-diagnostic-result="IMMEDIATE_STRONG"]').click();
    diagnostic = (await stored(page)).diagnostic.tests[0];
    assert(diagnostic.state === 'VERIFIED' && diagnostic.results[1].before === 'NO_DISCHARGE', 'retest preserves before/after evidence and verifies improvement');
    await page.locator('[data-diagnostic-next]').click();
    assert((await stored(page)).diagnostic.terminalState === 'VERIFIED_REPAIR', 'diagnostic workflow reaches a real terminal state');

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
    assert(migration.contract.schema === 'carbtune.job' && migration.contract.schemaVersion === 1 && Array.isArray(migration.validationResults), 'legacy saved job receives the additive versioned contract without losing old fields');
    assert(!migration.validationResults.some(result => result.lifecycle === 'CURRENT' && result.result === 'PASS'), 'legacy data without structured validation never receives invented current green status');

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
