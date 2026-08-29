const { chromium } = require('playwright');
const fs = require('node:fs');

const baseURL = process.env.CARBTUNE_URL || 'http://127.0.0.1:4173';
const forbidden = ['GT Premium', 'Mach 1', 'Boss 302', 'Shelby GT350', 'Shelby GT500'];
const screenshot = process.env.CARBTUNE_SCREENSHOT || 'tests/vehicle-cascade.png';

async function options(page, selector) {
  return page.locator(selector).locator('option').allTextContents();
}
async function select(page, selector, value) {
  await page.locator(selector).selectOption(value);
}
function excludesForbidden(items) {
  return forbidden.every(value => !items.includes(value));
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    const readiness = await page.evaluate(() => ({
      build51: document.querySelector('header')?.innerText.includes('Build 51'),
      b51: typeof b51,
      relationalSelector: typeof vehicleApplicationRows,
      state: typeof state,
      renderGuided: typeof renderGuided
    }));
    if (!readiness.build51 || readiness.b51 !== 'function' || readiness.relationalSelector !== 'function' || readiness.state !== 'object' || readiness.renderGuided !== 'function') {
      throw new Error(`Current CarbTune application did not initialize: ${JSON.stringify(readiness)}; errors=${errors.join(' | ')}; url=${page.url()}`);
    }
    await page.evaluate(() => {
      state.workflow.phase = 'vehicle';
      state.workflow.showOverview = false;
      state.workflow.b51 = state.workflow.b51 || {};
      state.workflow.b51.showJobs = false;
      state.results.completed = false;
      renderGuided();
    });

    const year = '[data-b51-vehicle="year"]';
    const make = '[data-b51-vehicle="make"]';
    const model = '[data-b51-vehicle="model"]';
    const trim = '[data-b51-vehicle="submodel"]';
    if (!await page.locator(year).count()) throw new Error(`Vehicle step unavailable; active screen=${await page.locator('.screen.active').getAttribute('data-screen')}; errors=${errors.join(' | ')}`);
    if ((await options(page, year)).includes('1980')) throw new Error('Guided selector exposes unsupported 1980 catalog year');
    await select(page, year, '1985');
    await select(page, make, 'Chevrolet');
    await select(page, model, 'Camaro');
    const guidedTrims = await options(page, trim);
    if (!excludesForbidden(guidedTrims)) throw new Error('Guided Camaro selector contains Mustang trim');
    if (guidedTrims.join('|') !== 'Unknown / Not Listed|Other / Custom') throw new Error(`Guided zero-data fallback is not exact: ${guidedTrims.join(', ')}`);
    await select(page, trim, 'Unknown / Not Listed');
    await select(page, year, '2005');
    if (await page.locator(make).inputValue() || await page.locator(model).inputValue() || await page.locator(trim).inputValue()) throw new Error('Guided upstream change did not clear downstream selections');
    await select(page, make, 'Hyundai');
    await select(page, model, 'Elantra');
    await select(page, trim, 'Unknown / Not Listed');
    await select(page, make, 'Chevrolet');
    if (await page.locator(model).inputValue() || await page.locator(trim).inputValue()) throw new Error('Guided Make change did not clear Model/Submodel');
    const guidedChevroletModels = await page.locator(model).locator('option').evaluateAll(items => items.map(item => item.value).filter(value => value && value !== 'Unknown / Not Listed' && value !== 'Other / Custom'));
    if (guidedChevroletModels.length < 2) throw new Error('Guided selector lacks two relational 2005 Chevrolet models for reset testing');
    await select(page, model, guidedChevroletModels[0]);
    await select(page, trim, 'Unknown / Not Listed');
    await select(page, model, guidedChevroletModels[1]);
    if (await page.locator(trim).inputValue()) throw new Error('Guided Model change did not clear Submodel');
    await select(page, year, 'Unknown / Not Listed');
    if ((await options(page, make)).join('|') !== 'Select make|Unknown / Not Listed|Other / Custom') throw new Error('Guided Unknown year manufactured catalog Make evidence');
    await select(page, make, 'Other / Custom');
    if ((await options(page, model)).join('|') !== 'Select model|Unknown / Not Listed|Other / Custom') throw new Error('Guided Other make manufactured catalog Model evidence');

    await page.evaluate(() => openNewJob());
    if ((await options(page, '#newVehicleYear')).includes('1980')) throw new Error('Modal selector exposes unsupported 1980 catalog year');
    await select(page, '#newVehicleYear', '1985');
    if (!(await options(page, '#newVehicleMake')).includes('Chevrolet')) throw new Error(`Modal year change did not derive 1985 makes: ${(await options(page, '#newVehicleMake')).join(', ')}`);
    await select(page, '#newVehicleMake', 'Chevrolet');
    await select(page, '#newVehicleModel', 'Camaro');
    const modalTrims = await options(page, '#newVehicleSubmodel');
    if (!excludesForbidden(modalTrims)) throw new Error('Modal Camaro selector contains Mustang trim');
    if (modalTrims.join('|') !== 'Unknown / Not Listed|Other / Custom') throw new Error(`Modal zero-data fallback is not exact: ${modalTrims.join(', ')}`);
    await select(page, '#newVehicleSubmodel', 'Unknown / Not Listed');
    await select(page, '#newVehicleYear', '2005');
    if (await page.locator('#newVehicleMake').inputValue() || await page.locator('#newVehicleModel').inputValue() || await page.locator('#newVehicleSubmodel').inputValue()) throw new Error('Modal upstream change did not clear downstream selections');
    await select(page, '#newVehicleMake', 'Hyundai');
    await select(page, '#newVehicleModel', 'Elantra');
    await select(page, '#newVehicleSubmodel', 'Unknown / Not Listed');
    await select(page, '#newVehicleMake', 'Chevrolet');
    if (await page.locator('#newVehicleModel').inputValue() || await page.locator('#newVehicleSubmodel').inputValue()) throw new Error('Modal Make change did not clear Model/Submodel');
    const modalChevroletModels = await page.locator('#newVehicleModel option').evaluateAll(items => items.map(item => item.value).filter(value => value && value !== 'Unknown / Not Listed' && value !== 'Other / Custom'));
    if (modalChevroletModels.length < 2) throw new Error('Modal selector lacks two relational 2005 Chevrolet models for reset testing');
    await select(page, '#newVehicleModel', modalChevroletModels[0]);
    await select(page, '#newVehicleSubmodel', 'Unknown / Not Listed');
    await select(page, '#newVehicleModel', modalChevroletModels[1]);
    if (await page.locator('#newVehicleSubmodel').inputValue()) throw new Error('Modal Model change did not clear Submodel');

    await page.screenshot({ path: screenshot, fullPage: true });
    if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
    if (!fs.existsSync(screenshot)) throw new Error('Verification screenshot was not created');
    console.log('Vehicle cascade browser checks passed for guided and modal selectors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
