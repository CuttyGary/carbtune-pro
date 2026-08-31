import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const requiredDocuments = [
  'project/PRODUCT_SPEC.md',
  'project/DECISIONS.md',
  'project/ROADMAP.md',
  'project/BUGS.md',
  'project/IDEAS.md',
  'project/ACCEPTANCE_TESTS.md',
  'project/CONTROLLER_SPEC.md',
  'docs/development.md',
  'tasks/README.md'
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
assert.match(acceptance, /CARB-004[\s\S]*AUTOMATED[\s\S]*validate-workflow\.cjs/i, 'CARB-004 must retain real browser automation evidence');
const bugs = read('project/BUGS.md');
assert.match(bugs, /B-0052-03[\s\S]*RESOLVED_IN_CT-0054/i);
for (const id of [
  'VEHICLE-001', 'VEHICLE-002', 'VEHICLE-003', 'VEHICLE-004',
  'VEHICLE-005', 'VEHICLE-006', 'VEHICLE-007', 'WORKFLOW-001',
  'CARB-001', 'DIAG-001', 'DATA-001', 'DATA-002'
]) assert.match(acceptance, new RegExp(id), `${id} must remain in the permanent catalog`);

const roadmap = read('project/ROADMAP.md');
for (const phrase of [
  'PostgreSQL', 'CarbTune application services/API', 'Knowledge Harvester',
  'Auto Care VCdb / ACES', 'CLASSIC.COM', 'NHTSA/vPIC', 'FuelEconomy.gov',
  'EPA historical sources', 'SEMA Data', 'Physical compatibility', 'performance suitability'
]) assert.match(roadmap, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

const currentTask = JSON.parse(read('tasks/current.json'));
const completedFoundation = JSON.parse(read('tasks/completed/CT-0053.json'));
const allowedTaskStatuses = ['PLANNED', 'IN_PROGRESS', 'BLOCKED', 'READY_FOR_CHATGPT_REVIEW', 'ACCEPTED', 'FAILED'];
assert.equal(completedFoundation.schemaVersion, 1);
assert.equal(completedFoundation.id, 'CT-0053');
assert.ok(allowedTaskStatuses.includes(completedFoundation.status));
const recordedTask = currentTask || completedFoundation;
assert.equal(recordedTask.schemaVersion, 1);
assert.ok(/^CT-\d{4}$/.test(recordedTask.id));
assert.ok(allowedTaskStatuses.includes(recordedTask.status));
for (const field of [
  'title', 'createdDate', 'scope', 'objectives', 'constraints', 'acceptanceTests',
  'implementationNotes', 'validation', 'filesChanged', 'commitSha',
  'deploymentStatus', 'blockers', 'reviewStatus'
]) assert.ok(Object.hasOwn(recordedTask, field), `CT-0053 task must include ${field}`);

const gitignore = read('.gitignore');
assert.match(gitignore, /^node_modules\/$/m);
const workflow = read('.github/workflows/validate.yml');
assert.match(workflow, /node-version:\s*24/);
assert.match(workflow, /npm run validate/);

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
assert.equal(packageJson.scripts['project:status'], 'node scripts/project-status.cjs');

const statusTool = spawnSync(process.execPath, [path.join(root, 'scripts/project-status.cjs')], {
  cwd: root,
  encoding: 'utf8'
});
assert.equal(statusTool.status, 0, statusTool.stderr);
assert.match(statusTool.stdout, /taskId: (CT-\d{4}|null)/);
assert.match(statusTool.stdout, /validation: \{"status":"NOT RUN","exitCode":null\}/);
assert.match(statusTool.stdout, /readiness: NOT VERIFIED/);

console.log('Project-control checks passed (durable controls/tasks, truthful automation, policies, acceptance catalog, and unchanged vehicle baseline).');
