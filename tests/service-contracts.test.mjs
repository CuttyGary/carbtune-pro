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

const unknownActor = contracts.actorReference();
assert.equal(unknownActor.kind, 'UNKNOWN');
assert.equal(unknownActor.id, null);
const knownActor = contracts.actorReference({ id: 'tech-local-1', kind: 'LOCAL_TECHNICIAN', displayName: 'Pat', source: 'LOCAL_EXPLICIT' });
assert.equal(knownActor.displayName, 'Pat');

const legacyJobs = [
  { id: 'legacy-a', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z', vehicle: { vin: 'VIN-SHARED', year: '1969', make: 'Chevrolet', model: 'Camaro', chassisPlatform: 'F-body', engineManufacturer: 'Chevrolet', engineFamily: 'Small Block Chevrolet', engineVariant: '350', engineSwap: false }, build: { cylinderHeads: 'Iron', carburetor: 'Holley 4150', transmission: 'TH350', rearGear: 3.55 }, baseline: { fp: 6.1 }, verificationSessions: [] },
  { id: 'legacy-b', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z', vehicle: { vin: 'VIN-SHARED', year: '1969', make: 'Chevrolet', model: 'Camaro', engineManufacturer: 'Ford', engineFamily: 'Windsor', engineVariant: '302', engineSwap: true }, build: { cylinderHeads: 'Aluminum', carburetor: 'Holley 4160', transmission: 'T5', rearGear: 3.73 }, baseline: { fp: 5.8 }, verificationSessions: [] },
  { id: 'legacy-unknown', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z', vehicle: { year: '1969', make: 'Chevrolet', model: 'Camaro', vin: '', engineManufacturer: '', engineFamily: '', engineVariant: '' }, build: {}, verificationSessions: [] }
];
const vehicles = contracts.migrateVehicleRecords(legacyJobs, [], { actor: knownActor });
assert.equal(vehicles.length, 2, 'matching supplied VIN links jobs; no-VIN legacy job remains its own vehicle');
assert.equal(legacyJobs[0].vehicleRecordId, legacyJobs[1].vehicleRecordId, 'one persistent vehicle supports multiple jobs');
assert.notEqual(legacyJobs[0].vehicleRecordId, legacyJobs[2].vehicleRecordId, 'unknown physical identity is not guessed');
const shared = vehicles.find(vehicle => vehicle.vin === 'VIN-SHARED');
assert.deepEqual(shared.jobIds, ['legacy-a', 'legacy-b']);
assert.equal(shared.configurationSnapshots.length, 2);
assert.equal(shared.configurationSnapshots[0].configuration.installedEngine.manufacturer, 'Chevrolet');
assert.equal(shared.configurationSnapshots[1].configuration.installedEngine.manufacturer, 'Ford');
assert.equal(shared.chassis.make, 'Chevrolet');
assert.notDeepEqual(shared.chassis, shared.configurationSnapshots[1].configuration.installedEngine, 'chassis and installed engine remain independent');
assert.equal(shared.configurationSnapshots[0].configuration.tires.front, null, 'unknown tire information stays unknown');
assert.deepEqual(legacyJobs[0].odometerObservations, [], 'missing mileage remains an empty job observation history');
legacyJobs[0].odometerObservations.push({ id: 'odo-1', value: 84500, unit: 'MILES', observedAt: '2025-01-01T00:00:00Z', source: 'TECHNICIAN_ENTRY', actor: knownActor });
contracts.normalizeJob(legacyJobs[0]);
assert.equal(legacyJobs[0].odometerObservations[0].value, 84500, 'mileage is retained as a job observation rather than a vehicle overwrite');

const once = JSON.stringify({ jobs: legacyJobs, vehicles });
const twiceVehicles = contracts.migrateVehicleRecords(legacyJobs, vehicles, { actor: knownActor });
assert.equal(JSON.stringify({ jobs: legacyJobs, vehicles: twiceVehicles }), once, 'migration is idempotent');

const priorSnapshot = JSON.stringify(shared.configurationSnapshots[0]);
const newJobSeed = { id: 'job-return-visit', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z', vehicle: { jobNo: 'RO-3' }, build: {}, baseline: {}, verificationSessions: [] };
const started = contracts.startJobFromVehicle(shared, newJobSeed, { timestamp: '2026-06-01T00:00:00Z', actor: knownActor });
started.snapshot.configuration.carburetor.description = 'New carburetor';
assert.equal(JSON.stringify(started.vehicle.configurationSnapshots[0]), priorSnapshot, 'starting or changing a later job cannot mutate historical configuration');
assert.equal(started.job.vehicleRecordId, shared.id);
assert.equal(started.job.vehicle.vin, 'VIN-SHARED');
assert.equal(started.vehicle.auditEvents.at(-1).actor.id, 'tech-local-1');

const unknownStarted = contracts.startJobFromVehicle(twiceVehicles[1], { id: 'job-unknown-actor', createdAt: '2026-07-01T00:00:00Z', vehicle: {}, build: {} }, { timestamp: '2026-07-01T00:00:00Z' });
assert.equal(unknownStarted.vehicle.auditEvents.at(-1).actor.kind, 'UNKNOWN');
const archived = contracts.archiveVehicle(started.vehicle, { occurredAt: '2026-06-02T00:00:00Z', reason: 'No longer serviced', actor: knownActor });
assert.ok(archived.archivedAt);
assert.deepEqual(archived.jobIds, ['legacy-a', 'legacy-b', 'job-return-visit'], 'archiving preserves historical jobs');
assert.equal(archived.auditEvents.at(-1).action, 'VEHICLE_ARCHIVED');

assert.equal(contracts.isCurrentVerified(legacy.validationResults.find(item => item.id === 'legacy-verification-old-pass'), contracts.subjectForJob(legacy)), false, 'historical validation remains non-current after vehicle migration');
console.log('Service contract checks passed: validation lifecycle, vehicle migration/idempotence, multiple jobs, immutable configuration history, archive, relationships, and known/unknown attribution.');
