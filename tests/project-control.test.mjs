import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const requiredDocuments = [
  'project/PRODUCT_SPEC.md',
  'project/DECISIONS.md',
  'project/ROADMAP.md',
  'project/BUGS.md',
  'project/IDEAS.md',
  'project/ACCEPTANCE_TESTS.md'
];

for (const document of requiredDocuments) {
  const content = read(document);
  assert.ok(content.length >= 900, `${document} must be a meaningful seeded control document`);
  assert.doesNotMatch(content, /TODO: fill|placeholder content/i, `${document} must not be an empty template`);
}

const productSpec = read('project/PRODUCT_SPEC.md');
assert.match(productSpec, /professional shop software/i);
assert.match(productSpec, /Measure[\s\S]*Interpret[\s\S]*Correct\s*\/\s*Test[\s\S]*Retest[\s\S]*Compare[\s\S]*Decide[\s\S]*Log/i);
assert.match(productSpec, /Beginner[\s\S]*Seasoned[\s\S]*Pro/i);
assert.match(productSpec, /chassis[\s\S]*installed engine/i);
assert.match(productSpec, /manufacturer baseline[\s\S]*CarbTune[\s\S]*technician/i);
assert.match(productSpec, /Override & Continue/i);
assert.match(productSpec, /wideband[\s\S]*present/i);
assert.match(productSpec, /provenance/i);

const acceptance = read('project/ACCEPTANCE_TESTS.md');
for (const phrase of [
  '1980 Hyundai', 'Elantra', 'Camaro', 'Mustang',
  'Changing Year', 'Changing Make', 'Changing Model',
  'Unknown / Not Listed', 'Other / Custom', 'localStorage',
  '1982 Oldsmobile', 'Cutlass Supreme', 'BLOCKED_BY_DATA',
  'AFR', 'wideband'
]) assert.match(acceptance, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

const agents = read('AGENTS.md');
assert.match(agents, /may evolve incrementally toward proper database and service architecture/i);
assert.match(agents, /Avoid reckless full rewrites/i);
assert.match(agents, /Research Before Large Data Construction/i);
for (const phrase of ['authoritative public datasets', 'documented APIs', 'automotive industry standards', 'licensable commercial datasets', 'CAPTCHA', 'paywalls', 'access controls']) {
  assert.match(agents, new RegExp(phrase, 'i'));
}

const vehicleSource = read('data/vehicle-applications.js');
const context = { window: {} };
vm.runInNewContext(vehicleSource, context, { filename: 'vehicle-applications.js' });
const catalog = context.window.CARB_TUNE_VEHICLE_APPLICATIONS;
assert.equal(catalog.coverage.applicationRecordCount, 26366, 'CT-0052 must not expand or replace the vehicle registry');
assert.equal(catalog.coverage.minimumYear, 1984, 'FuelEconomy.gov baseline must remain 1984-present');
assert.ok(!catalog.applications.some(record => record.year === 1982), '1982 Oldsmobile coverage remains blocked rather than fabricated');
assert.ok(catalog.applications.every(record => record.source === 'U.S. DOE/EPA FuelEconomy.gov'));

const packageJson = JSON.parse(read('package.json'));
assert.equal(packageJson.scripts.validate, 'node scripts/validate.cjs');

console.log('Project-control checks passed (seeded controls, policies, acceptance catalog, and unchanged vehicle baseline).');
