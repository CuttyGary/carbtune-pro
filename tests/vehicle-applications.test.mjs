import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../data/vehicle-applications.js', import.meta.url), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context, { filename: 'vehicle-applications.js' });
const catalog = context.window.CARB_TUNE_VEHICLE_APPLICATIONS;
const applications = catalog.applications;
const values = (field, selection = {}) => [...new Set(applications
  .filter(row => Object.entries(selection).every(([key, value]) => String(row[key]) === String(value)))
  .flatMap(row => field === 'submodelTrim' ? [row.submodel, row.trim] : [row[field]])
  .filter(Boolean))];

assert.equal(applications.length, catalog.coverage.applicationRecordCount);
assert.ok(applications.every(row => row.year && row.make && row.model));
assert.ok(applications.every(row => row.source === 'U.S. DOE/EPA FuelEconomy.gov'));
assert.ok(applications.every(row => row.verificationStatus === 'VERIFIED_SOURCE_RECORD'));

// Negative regressions: impossible or unrelated paths must not be constructible.
assert.deepEqual(values('make', { year: 1980 }), []);
assert.deepEqual(values('model', { year: 1980, make: 'Hyundai' }), []);
assert.ok(!values('model', { year: 1980, make: 'Hyundai' }).includes('Elantra'));
const forbiddenMustangTrims = ['GT Premium', 'Mach 1', 'Boss 302', 'Shelby GT350', 'Shelby GT500'];
const camaro1980 = values('submodelTrim', { year: 1980, make: 'Chevrolet', model: 'Camaro' });
assert.ok(forbiddenMustangTrims.every(trim => !camaro1980.includes(trim)));
for (const row of applications.filter(row => !(row.make === 'Ford' && row.model === 'Mustang'))) {
  assert.ok(!forbiddenMustangTrims.includes(row.submodel));
  assert.ok(!forbiddenMustangTrims.includes(row.trim));
}

// Positive coverage across multiple manufacturers and decades.
for (const expected of [
  { year: 1985, make: 'Chevrolet', model: 'Camaro' },
  { year: 1995, make: 'Ford', model: 'Mustang' },
  { year: 2005, make: 'Hyundai', model: 'Elantra' },
  { year: 2015, make: 'Dodge', model: 'Challenger' },
  { year: 2025, make: 'Toyota', model: 'Camry' },
]) assert.ok(applications.some(row => Object.entries(expected).every(([key, value]) => row[key] === value)), JSON.stringify(expected));

assert.ok(values('make', { year: 1985 }).includes('Chevrolet'));
assert.ok(values('model', { year: 1985, make: 'Chevrolet' }).includes('Camaro'));
assert.ok(values('submodelTrim', { year: 2015, make: 'Dodge', model: 'Challenger' }).length > 0);

// Escape paths are UI choices, never catalog evidence.
assert.ok(!applications.some(row => ['Unknown / Not Listed', 'Other / Custom'].includes(row.year)));
assert.ok(!applications.some(row => ['Unknown / Not Listed', 'Other / Custom'].includes(row.make)));
assert.ok(!applications.some(row => ['Unknown / Not Listed', 'Other / Custom'].includes(row.model)));
assert.ok(!applications.some(row => ['Unknown / Not Listed', 'Other / Custom'].includes(row.submodel)));
assert.ok(!applications.some(row => ['Unknown / Not Listed', 'Other / Custom'].includes(row.trim)));

console.log(`Vehicle application checks passed (${applications.length} relational records).`);
