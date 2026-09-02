import assert from 'node:assert/strict';
import contracts from '../data/service-contracts.js';

const legacy = {
  id: 'job-legacy', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  vehicle: { year: '1968', make: 'Chevrolet', model: 'Camaro', submodel: 'Unknown / Not Listed', chassisEvidence: 'TECHNICIAN_ENTERED_UNVERIFIED', engineManufacturer: 'Ford', engineSize: '5.0L', engineFamily: 'Windsor', engineVariant: '302', engineOrigin: 'Engine swap', engineSwap: true },
  verificationSessions: [{ id: 'old-pass', at: '2026-01-02T00:00:00Z', mode: 'ROAD_TEST', outcome: 'POSITIVE' }]
};
contracts.normalizeJob(legacy);
assert.equal(legacy.contract.schemaVersion, 1);
assert.equal(legacy.validationResults.length, 1);
assert.equal(legacy.validationResults[0].result, 'PASS');
assert.equal(legacy.validationResults[0].lifecycle, 'UNKNOWN');
assert.equal(contracts.isCurrentVerified(legacy.validationResults[0], contracts.subjectForJob(legacy)), false, 'legacy green must not be invented');

const first = contracts.appendValidationResult(legacy, {
  id: 'validation-1', validationType: 'TECHNICIAN_RETEST', result: 'PASS', lifecycle: 'CURRENT',
  observedAt: '2026-02-01T12:00:00Z', source: { origin: 'CARBTUNE_TECHNICIAN_WORKFLOW', actor: 'technician', method: 'DYNO' },
  evidence: [{ type: 'DYNO_RUN', reference: 'run-1' }]
});
assert.equal(contracts.isCurrentVerified(first, contracts.subjectForJob(legacy)), true);
for (const field of ['schema', 'schemaVersion', 'id', 'validationType', 'result', 'lifecycle', 'observedAt', 'source', 'subject', 'subjectFingerprint', 'evidence']) assert.ok(field in first, `missing ${field}`);

contracts.appendValidationResult(legacy, {
  id: 'validation-2', validationType: 'TECHNICIAN_RETEST', result: 'FAIL', lifecycle: 'CURRENT',
  observedAt: '2026-02-02T12:00:00Z', source: { origin: 'CARBTUNE_TECHNICIAN_WORKFLOW', method: 'ROAD_TEST' }, evidence: []
});
const superseded = legacy.validationResults.find(item => item.id === first.id);
assert.equal(superseded.lifecycle, 'SUPERSEDED');
assert.equal(superseded.supersededBy, 'validation-2');
assert.equal(contracts.isCurrentVerified(superseded, contracts.subjectForJob(legacy)), false);

const passing = contracts.appendValidationResult(legacy, {
  id: 'validation-3', validationType: 'CHASSIS_IDENTITY', result: 'PASS', lifecycle: 'CURRENT',
  observedAt: '2026-02-03T12:00:00Z', source: { origin: 'SOURCE_REGISTRY', method: 'RELATIONAL_SELECTOR' }, evidence: [{ type: 'SOURCE_RECORD', reference: 'application-1' }]
});
legacy.vehicle.model = 'Chevelle';
contracts.normalizeJob(legacy);
const stale = legacy.validationResults.find(item => item.id === passing.id);
assert.equal(stale.lifecycle, 'STALE');
assert.equal(contracts.isCurrentVerified(stale, contracts.subjectForJob(legacy)), false);

contracts.appendValidationResult(legacy, {
  id: 'validation-4', validationType: 'COMPONENT_FITMENT', result: 'PASS', lifecycle: 'CURRENT',
  observedAt: '2026-02-04T10:00:00Z', source: { origin: 'MANUFACTURER_DOCUMENT', method: 'PART_NUMBER_LOOKUP' }, evidence: []
});
contracts.invalidateValidationResults(legacy, 'Installed component changed.', '2026-02-04T12:00:00Z');
assert.equal(legacy.validationResults.find(item => item.id === 'validation-4').lifecycle, 'INVALIDATED');

const snapshot = contracts.serviceBoundarySnapshot(legacy);
assert.equal(snapshot.schemaVersion, 1);
assert.equal(snapshot.vehicleChassis.make, 'Chevrolet');
assert.equal(snapshot.installedEngine.manufacturer, 'Ford');
assert.equal(snapshot.installedEngine.isSwap, true);
assert.notDeepEqual(snapshot.vehicleChassis, snapshot.installedEngine);
for (const domain of Object.keys(contracts.DOMAINS)) assert.ok(domain in snapshot, `missing service domain ${domain}`);

assert.throws(() => contracts.appendValidationResult(legacy, { validationType: 'BAD', result: 'PASS', lifecycle: 'CURRENT', observedAt: '2026-02-01T00:00:00Z', source: { origin: 'TEST' } }), /id is required/);
console.log('Service contract checks passed: legacy unknown, current proof, supersession, staleness, invalidation, and domain separation.');
