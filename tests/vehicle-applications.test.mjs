import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const context = { window: {} };
for (const file of [
  '../data/vehicle-applications.js',
  '../data/vehicle-historical-applications.js',
  '../data/vehicle-catalog.js'
]) {
  vm.runInNewContext(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), context, { filename: file });
}

const current = context.window.CARB_TUNE_VEHICLE_APPLICATIONS;
const historical = context.window.CARB_TUNE_HISTORICAL_VEHICLE_APPLICATIONS;
const catalog = context.window.CARB_TUNE_VEHICLES;
const values = (field, selection = {}) => catalog.values(field, selection);
const listed = (items, expected) => items.some(item => catalog.sameValue(item, expected));
const assertApplication = (year, make, model) => {
  assert.ok(listed(values('make', { year }), make), `${year} must list ${make}`);
  assert.ok(listed(values('model', { year, make }), model), `${year} ${make} must list ${model}`);
};
const assertNoModel = (year, make, model) => {
  assert.ok(!listed(values('model', { year, make }), model), `${model} must not leak into ${year} ${make}`);
};

// Every packaged source remains internally auditable and source-labelled.
assert.equal(current.applications.length, current.coverage.applicationRecordCount);
assert.equal(historical.applications.length, historical.coverage.applicationRecordCount);
assert.ok(current.applications.every(row => row.source === 'U.S. DOE/EPA FuelEconomy.gov'));
assert.ok(current.applications.every(row => row.verificationStatus === 'VERIFIED_SOURCE_RECORD'));
assert.ok(historical.applications.every(row => row.source === 'NHTSA ODI vehicle recall application records'));
assert.ok(historical.applications.every(row => row.verificationStatus === 'SOURCE_RECORDED_APPLICATION'));
assert.equal(current.coverage.minimumYear, 1984);
assert.equal(historical.coverage.maximumYear, 1983);

// Only record-backed catalog years are emitted; 1983 must contain real makes.
const years = values('year');
assert.equal(years.length, catalog.coverage.yearCount);
assert.equal(years[0], catalog.coverage.minimumYear);
assert.equal(years.at(-1), catalog.coverage.maximumYear);
assert.ok(years.includes(1983));
assert.equal(values('make', { year: 1899 }).length, 0);
for (const make of ['Chevrolet', 'Dodge', 'Ford', 'Honda', 'Oldsmobile', 'Pontiac', 'Toyota']) {
  assert.ok(listed(values('make', { year: 1983 }), make), `1983 must list ${make}`);
}
assert.ok(values('make', { year: 1983 }).length >= 100);

// Positive relationships span the requested decades and manufacturer groups.
for (const expected of [
  [1970, 'Dodge', 'Challenger'],
  [1978, 'Toyota', 'Corolla'],
  [1979, 'Ford', 'Mustang'],
  [1979, 'Honda', 'Civic'],
  [1982, 'Oldsmobile', 'Cutlass Supreme'],
  [1983, 'Oldsmobile', 'Cutlass'],
  [1983, 'Pontiac', 'Firebird'],
  [1983, 'Toyota', 'Camry'],
  [1995, 'Ford', 'Mustang'],
  [1995, 'Chevrolet', 'Camaro'],
  [2005, 'Toyota', 'Tacoma'],
  [2005, 'Honda', 'Civic'],
  [2015, 'Dodge', 'Challenger'],
  [2015, 'Ford', 'Mustang'],
  [2024, 'Toyota', '4Runner'],
  [2024, 'Ford', 'Mustang']
]) assertApplication(...expected);

// Source-backed series/submodel values remain attached to one exact application.
const firebird1982 = values('submodelTrim', { year: 1982, make: 'Pontiac', model: 'Firebird' });
assert.ok(listed(firebird1982, 'Trans Am'));
assert.ok(!listed(values('submodelTrim', { year: 1982, make: 'Pontiac', model: 'Grand Prix' }), 'Trans Am'));
assert.ok(!listed(values('submodelTrim', { year: 1982, make: 'Ford', model: 'Mustang' }), 'Trans Am'));
assert.ok(listed(values('submodelTrim', { year: 2018, make: 'Honda', model: 'Civic' }), 'Civic 5Dr - Type R'));

// Negative relationships prove there is no make-wide or global model fallback.
assertNoModel(1983, 'Oldsmobile', 'Mustang');
assertNoModel(1983, 'Oldsmobile', 'Firebird');
assertNoModel(1983, 'Oldsmobile', 'Oldsmobile');
assertNoModel(1983, 'Ford', 'Cutlass');
assertNoModel(1983, 'Toyota', 'Civic');
assertNoModel(1983, 'Honda', 'Camry');
assertNoModel(1983, 'Dodge', 'Challenger');
assertNoModel(1995, 'Ford', 'Camaro');
assertNoModel(2005, 'Toyota', 'Mustang');
assertNoModel(2015, 'Dodge', 'Corvette');
assertNoModel(2024, 'Honda', '4Runner');

// Matching tolerates harmless formatting differences without widening scope.
assert.ok(listed(values('model', { year: '1983', make: ' oldsmobile ' }), 'CUTLASS'));
assert.ok(listed(values('model', { year: 2024, make: 'ford' }), 'Mustang'));

// Escape paths are UI choices, never catalog evidence or fabricated trims.
for (const field of ['year', 'make', 'model', 'submodel', 'trim']) {
  assert.ok(!catalog.applications.some(row => catalog.escapeOptions.some(option => catalog.sameValue(row[field], option))));
}
assert.equal(values('submodelTrim', { year: 1983, make: 'Oldsmobile', model: 'Cutlass' }).length, 0);
assert.equal(catalog.options('submodelTrim', { year: 1983, make: 'Oldsmobile', model: 'Cutlass' }).join('|'), catalog.escapeOptions.join('|'));
assert.equal(catalog.options('model', { year: 1983, make: 'Not A Make' }).join('|'), catalog.escapeOptions.join('|'));

// Reported combined coverage matches the de-duplicated query registry.
assert.equal(catalog.applications.length, catalog.coverage.applicationRecordCount);
assert.equal(new Set(catalog.applications.map(row => row.year)).size, catalog.coverage.yearCount);
assert.equal(catalog.comprehensive, false);
assert.match(catalog.limitation, /not comprehensive/i);

console.log(`Vehicle application checks passed (${catalog.coverage.applicationRecordCount} combined relational records; ${catalog.coverage.minimumYear}-${catalog.coverage.maximumYear}).`);
