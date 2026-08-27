const { chromium } = require('playwright');

const baseURL = process.env.CARBTUNE_URL || 'http://127.0.0.1:4173';
const results = [];
const assert = (condition, name, detail = '') => {
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ''}`);
  results.push(`PASS ${name}`);
};

async function baselineToFuel(page) {
  await page.locator('[data-guided-next]').click();
  const values = [['temp', '185'], ['rpm', '780'], ['vac', '16']];
  for (const [key, value] of values) {
    const input = page.locator(`[data-guided-value="${key}"]`);
    await input.fill(value);
    await input.dispatchEvent('change');
    await page.locator('[data-baseline-next]').click();
  }
  assert(await page.locator('[data-guided-value="fp"]').isVisible(), 'guided baseline reaches fuel pressure');
}

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.locator('.screen.active').getAttribute('data-screen') === 'guided', 'guided workflow is primary');
    assert(await page.locator('meta[name="application-domain"]').getAttribute('content') === 'carbureted', 'application metadata declares carbureted domain');
    assert((await page.locator('#productScopeBadge').innerText()).includes('Carbureted'), 'product scope is visible');
    const productState = await page.evaluate(() => JSON.parse(localStorage.getItem('carbtune.clean.v40')));
    assert(productState.productId === 'carbtune-pro' && productState.applicationType === 'carbureted', 'jobs persist CarbTune product boundary');
    const visibleWorkflow = await page.locator('body').innerText();
    assert(!/(injector pulse|fuel table|spark table|ecu calibration|pcm calibration|maf calibration)/i.test(visibleWorkflow), 'EFI calibration workflows are absent');
    assert((await page.locator('#guidedCard').innerText()).includes('What is the vehicle doing?'), 'demo resumes at complaint');
    assert((await page.locator('#guidedProgress').innerText()).includes('BUILD'), 'persistent progress is visible');

    await baselineToFuel(page);
    await page.locator('[data-guided-value="fp"]').fill('8.5');
    await page.locator('[data-guided-value="fp"]').dispatchEvent('change');
    assert((await page.locator('.result-state').innerText()).includes('HIGH'), '8.5 PSI interprets immediately as high');
    assert(await page.locator('[data-correct-now="fp"]').isVisible(), 'high pressure offers Correct Now');
    assert(await page.locator('[data-override-test="fp"]').isVisible(), 'high pressure offers Override & Continue');

    for (const level of ['Beginner', 'Novice', 'Seasoned', 'Pro']) {
      await page.locator('#guidanceLevel').selectOption(level);
      if (level === 'Pro') {
        assert((await page.locator('#guidedCard').innerText()).includes('QUICK BASELINE'), 'Pro receives compact Quick Baseline');
        await page.locator('[data-toggle-quick]').click();
      }
      assert(await page.locator('[data-override-test="fp"]').isVisible(), `${level} can override`);
    }

    await page.locator('[data-correct-now="fp"]').click();
    await page.locator('[data-correction="regulator"]').click();
    assert((await page.locator('#guidedCard').innerText()).includes('Adjustable Fuel Pressure Regulator'), 'regulator added to Required Actions & Parts');
    assert((await page.locator('#guidedCard').innerText()).toLowerCase().includes('customer approval'), 'part receives customer approval status');
    await page.locator('[data-action-status$="|Completed"]').click();
    assert((await page.locator('#guidedCard h2').innerText()).includes('Recheck fuel pressure'), 'installed part resumes at verification');
    await page.locator('[data-recheck-fp]').fill('6.2');
    await page.locator('[data-recheck-fp]').dispatchEvent('change');
    assert((await page.locator('.result-state').innerText()).includes('PASS'), '6.2 PSI passes recheck');
    await page.locator('[data-verify-pass]').click();
    assert((await page.locator('#guidedCard h2').innerText()).includes('Diagnostic direction'), 'verified fuel pressure continues diagnosis');

    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('carbtune.clean.v40')));
    saved.workflow.phase = 'baseline';
    saved.workflow.baselineIndex = 3;
    saved.workflow.recheckFp = null;
    saved.workflow.correction = null;
    saved.workflow.warnings = [];
    saved.workflow.overrides = [];
    saved.requiredActions = [];
    saved.baseline.fp = 8.5;
    await page.evaluate(value => localStorage.setItem('carbtune.clean.v40', JSON.stringify(value)), saved);
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-override-test="fp"]').click();
    const overridden = await page.evaluate(() => JSON.parse(localStorage.getItem('carbtune.clean.v40')));
    assert(overridden.workflow.warnings.some(x => x.includes('8.5 PSI')), 'override stores unresolved warning automatically');

    await page.reload({ waitUntil: 'networkidle' });
    assert((await page.locator('#resumeBlocker').innerText()).includes('Paused at'), 'resume location persists exactly');

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
    await page.locator('#newJobNo').fill('TEST-NEW-001');
    await page.locator('#newVehicleYear').selectOption('1968');
    await page.locator('#newVehicleMake').selectOption('Chevrolet');
    await page.locator('#newVehicleModel').selectOption('Camaro');
    await page.locator('#newVehicleSubmodel').selectOption('Base');
    await page.locator('#newEngineManufacturer').selectOption('GM / Chevrolet');
    await page.locator('#newEngineSize').selectOption('5.7L / 350 CID');
    await page.locator('#newEngineFamily').selectOption('Small Block Chevrolet');
    await page.locator('#newEngineVariant').selectOption('350 Gen I');
    await page.locator('[data-action="create-job"]').click();
    assert((await page.locator('#duplicateStatus').innerText()).includes('requires the installed carburetor'), 'New Job rejects missing carburetor');
    await page.locator('#newCarb').fill('Holley 4150');
    await page.locator('[data-action="create-job"]').click();
    await page.locator('[data-nav="history"]').click();
    assert(await page.locator('.job-row').count() === beforeJobs + 1, 'New Job creates a persisted job');

    await page.locator('.screen.active [data-action="new-job"]').click();
    await page.locator('#newJobNo').fill('TEST-NEW-001');
    await page.locator('#newVehicleYear').selectOption('1968');
    await page.locator('#newVehicleMake').selectOption('Chevrolet');
    await page.locator('#newVehicleModel').selectOption('Camaro');
    await page.locator('#newVehicleSubmodel').selectOption('Base');
    await page.locator('#newEngineManufacturer').selectOption('GM / Chevrolet');
    await page.locator('#newEngineSize').selectOption('5.7L / 350 CID');
    await page.locator('#newEngineFamily').selectOption('Small Block Chevrolet');
    await page.locator('#newEngineVariant').selectOption('350 Gen I');
    await page.locator('#newCarb').fill('Holley 4150');
    await page.locator('[data-action="create-job"]').click();
    assert((await page.locator('#duplicateStatus').innerText()).includes('Creation paused'), 'duplicate detection blocks accidental duplicate creation');
    await page.locator('[data-action="close-job-modal"]').click();

    await page.locator('.job-row').filter({ hasText: 'TEST-NEW-001' }).locator('[data-delete-job]').click();
    assert(await page.locator('#deleteJobModal').getAttribute('aria-hidden') === 'false', 'Delete Job requires confirmation');
    await page.locator('[data-action="confirm-delete-job"]').click();
    assert(await page.locator('.job-row').count() === beforeJobs, 'Delete Job removes selected job');

    assert(errors.length === 0, 'browser console has no errors', errors.join(' | '));
    await context.close();

    const migrateContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const migratePage = await migrateContext.newPage();
    migratePage.setDefaultTimeout(7000);
    await migratePage.addInitScript(() => {
      localStorage.setItem('carbtune.clean.v31', JSON.stringify({ id: 'legacy', vehicle: { vehicleName: 'Legacy Vehicle', jobNo: 'OLD-1' }, baseline: { fp: 6.1 } }));
    });
    await migratePage.goto(baseURL, { waitUntil: 'networkidle' });
    const migration = await migratePage.evaluate(() => ({ current: JSON.parse(localStorage.getItem('carbtune.clean.v40')), width: document.querySelector('#guidedCard').getBoundingClientRect().width }));
    assert(migration.current.vehicle.vehicleName === 'Legacy Vehicle', 'v31 active job migrates to v40');
    assert(migration.current.baseline.fp === 6.1, 'migration preserves baseline data');
    assert(migration.current.productId === 'carbtune-pro' && migration.current.applicationType === 'carbureted', 'migration applies CarbTune product boundary');

    migration.current.vehicle.carb = 'Holley 4150';
    migration.current.workflow.phase = 'baseline';
    migration.current.workflow.baselineIndex = 3;
    await migratePage.evaluate(value => localStorage.setItem('carbtune.clean.v40', JSON.stringify(value)), migration.current);
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
      if (type === 'phone') {
        assert(metrics.taskDisplay !== 'grid', `${name} uses focused single-column task flow`);
      } else {
        assert(metrics.taskDisplay === 'grid' && metrics.taskColumns.split(' ').length === 2, `${name} uses task/result columns`, metrics.taskColumns);
      }
      if (type === 'tablet') {
        assert(metrics.cardWidth / metrics.viewportWidth >= 0.86, `${name} uses available tablet width`, `${metrics.cardWidth}/${metrics.viewportWidth}`);
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
