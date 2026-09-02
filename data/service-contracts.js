(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CARB_TUNE_CONTRACTS = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const CONTRACT_VERSION = '2.0.0';
  const VALIDATION_SCHEMA = 'carbtune.validation-result';
  const JOB_SCHEMA = 'carbtune.job';
  const VEHICLE_SCHEMA = 'carbtune.vehicle-record';
  const CONFIGURATION_SCHEMA = 'carbtune.vehicle-configuration-snapshot';
  const ACTOR_SCHEMA = 'carbtune.actor-reference';
  const AUDIT_SCHEMA = 'carbtune.audit-event';
  const RESULT = Object.freeze(['PASS', 'FAIL', 'WARNING', 'NOT_RUN', 'UNKNOWN']);
  const LIFECYCLE = Object.freeze(['CURRENT', 'SUPERSEDED', 'STALE', 'INVALIDATED', 'UNKNOWN']);
  const DOMAINS = Object.freeze({
    job: ['id', 'createdAt', 'updatedAt', 'status'],
    vehicleChassis: ['year', 'make', 'model', 'submodel', 'vin', 'evidence'],
    installedEngine: ['manufacturer', 'size', 'family', 'variant', 'origin', 'isSwap'],
    components: ['category', 'componentId', 'partNumber', 'evidence'],
    baselineMeasurements: ['measurementType', 'value', 'unit', 'observedAt', 'source'],
    diagnosticFindings: ['findingType', 'result', 'observedAt', 'evidenceRefs'],
    recommendedCorrections: ['recommendation', 'rationale', 'status', 'evidenceRefs'],
    performedCorrections: ['correction', 'performedAt', 'technician', 'evidenceRefs'],
    retestVerificationResults: ['validationResultId', 'measurementRefs', 'outcome'],
    technicianEvidenceMedia: ['mediaType', 'uri', 'capturedAt', 'origin', 'hash']
  });

  const text = value => typeof value === 'string' ? value.trim() : '';
  const validDate = value => Boolean(text(value) && !Number.isNaN(Date.parse(value)));
  const clone = value => JSON.parse(JSON.stringify(value));
  const allowed = (value, values, fallback) => values.includes(value) ? value : fallback;
  const stableIdentity = value => JSON.stringify(value, (_, nested) => nested && typeof nested === 'object' && !Array.isArray(nested)
    ? Object.keys(nested).sort().reduce((sorted, key) => { sorted[key] = nested[key]; return sorted; }, {})
    : nested);
  const nullable = value => text(value) || null;
  const iso = value => validDate(value) ? new Date(value).toISOString() : null;
  const unique = values => [...new Set(values.filter(Boolean))];
  function stableId(prefix, value) {
    const input = typeof value === 'string' ? value : stableIdentity(value);
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `${prefix}-${(hash >>> 0).toString(36)}`;
  }

  function actorReference(input) {
    const actor = input && typeof input === 'object' ? input : {};
    const kind = ['LOCAL_TECHNICIAN', 'AUTHENTICATED_USER', 'SYSTEM', 'UNKNOWN'].includes(actor.kind) ? actor.kind : 'UNKNOWN';
    return {
      schema: ACTOR_SCHEMA, schemaVersion: 1,
      id: nullable(actor.id), kind,
      displayName: nullable(actor.displayName),
      source: nullable(actor.source) || (kind === 'UNKNOWN' ? 'UNKNOWN' : 'LOCAL_EXPLICIT')
    };
  }

  function installedEngineFromJob(job) {
    const vehicle = job && job.vehicle || {};
    return {
      manufacturer: nullable(vehicle.engineManufacturer), size: nullable(vehicle.engineSize),
      family: nullable(vehicle.engineFamily), variant: nullable(vehicle.engineVariant),
      label: nullable(vehicle.engineLabel), origin: nullable(vehicle.engineOrigin),
      isSwap: vehicle.engineSwap === true
    };
  }

  function configurationFromJob(job) {
    const vehicle = job && job.vehicle || {};
    const build = job && job.build || {};
    return {
      installedEngine: installedEngineFromJob(job),
      cylinderHeads: nullable(build.cylinderHeads), cylinderHeadPart: nullable(build.cylinderHeadPart),
      camValvetrain: {
        camshaft: nullable(build.camshaft || vehicle.cam), duration050: build.camDuration050 ?? null,
        lift: build.camLift ?? null, lsa: build.camLsa ?? null,
        valvetrain: nullable(build.valvetrain), type: nullable(build.valvetrainType || vehicle.lifter),
        rocker: nullable(vehicle.rocker), lash: nullable(vehicle.lash)
      },
      intake: { description: nullable(build.intake), componentId: nullable(build.componentSelections && build.componentSelections['intake-manifold'] || vehicle.intakeManifoldId) },
      carburetor: { description: nullable(build.carburetor || vehicle.carb), componentId: nullable(build.componentSelections && build.componentSelections.carburetor || vehicle.carbRecordId) },
      fuelSystem: { description: nullable(build.fuelDelivery), componentId: nullable(build.componentSelections && build.componentSelections['fuel-delivery']) },
      ignition: { description: nullable(build.ignition), componentId: nullable(build.componentSelections && build.componentSelections.ignition) },
      exhaust: { description: nullable(build.exhaust), componentId: nullable(build.componentSelections && build.componentSelections.exhaust || vehicle.exhaustManifoldId) },
      transmission: { description: nullable(build.transmission || vehicle.trans), componentId: nullable(build.componentSelections && build.componentSelections.transmission) },
      converterClutch: { stallRpm: build.converterStall ?? null, description: null },
      differential: { rearGear: build.rearGear ?? null },
      tires: clone(build.tires || { front: null, rear: null }),
      tuneSettings: clone(job && job.baseline || {}),
      components: clone(build.componentSelections || {})
    };
  }

  function configurationSnapshot(job, input) {
    const options = input && typeof input === 'object' ? input : {};
    const jobId = nullable(job && job.id);
    const observedAt = iso(options.observedAt || job && (job.createdAt || job.updatedAt));
    return {
      schema: CONFIGURATION_SCHEMA, schemaVersion: 1,
      id: nullable(options.id) || stableId('configuration', `${jobId || 'unknown'}|${observedAt || 'unknown'}`),
      vehicleId: nullable(options.vehicleId || job && job.vehicleRecordId), jobId,
      revision: Number.isInteger(options.revision) && options.revision > 0 ? options.revision : 1,
      observedAt, createdAt: iso(options.createdAt) || observedAt,
      source: nullable(options.source) || 'LOCAL_JOB_SNAPSHOT',
      actor: actorReference(options.actor),
      supersedesId: nullable(options.supersedesId), invalidatedAt: iso(options.invalidatedAt),
      invalidationReason: nullable(options.invalidationReason),
      configuration: clone(options.configuration || configurationFromJob(job))
    };
  }

  function vehicleIdentity(job) {
    const vehicle = job && job.vehicle || {};
    const vin = text(vehicle.vin).toUpperCase();
    return vin ? `vin:${vin}` : `legacy-job:${text(job && job.id) || stableId('job', job || {})}`;
  }

  function vehicleRecordFromJob(job, input) {
    const options = input && typeof input === 'object' ? input : {};
    const vehicle = job && job.vehicle || {};
    const timestamp = iso(options.timestamp || job && (job.createdAt || job.updatedAt));
    const vehicleId = nullable(options.id || job && job.vehicleRecordId) || stableId('vehicle', vehicleIdentity(job));
    const snapshot = configurationSnapshot(job, { vehicleId, observedAt: timestamp, actor: options.actor, source: options.source || 'LEGACY_LOCAL_STORAGE_MIGRATION' });
    return {
      schema: VEHICLE_SCHEMA, schemaVersion: 1, id: vehicleId, revision: 1,
      chassis: { year: nullable(vehicle.year), make: nullable(vehicle.make), model: nullable(vehicle.model), submodel: nullable(vehicle.submodel), platform: nullable(vehicle.chassisPlatform), evidence: nullable(vehicle.chassisEvidence) || 'UNKNOWN' },
      vin: nullable(vehicle.vin), installedEngine: installedEngineFromJob(job),
      customerReference: clone(vehicle.customerReference || { customerName: null, reference: null }),
      notes: nullable(vehicle.vehicleNotes), createdAt: timestamp, updatedAt: timestamp,
      archivedAt: null, archiveReason: null,
      provenance: [{ source: options.source || 'LEGACY_LOCAL_STORAGE_MIGRATION', migratedAt: timestamp, sourceJobId: nullable(job && job.id) }],
      jobIds: job && job.id ? [job.id] : [], configurationSnapshots: [snapshot],
      currentConfigurationSnapshotId: snapshot.id, auditEvents: []
    };
  }

  function auditEvent(input) {
    const event = input && typeof input === 'object' ? input : {};
    const occurredAt = iso(event.occurredAt);
    return {
      schema: AUDIT_SCHEMA, schemaVersion: 1,
      id: nullable(event.id) || stableId('audit', `${event.action || 'UNKNOWN'}|${occurredAt || 'unknown'}|${event.jobId || ''}|${event.vehicleId || ''}`),
      actor: actorReference(event.actor), action: nullable(event.action) || 'UNKNOWN', occurredAt,
      source: nullable(event.source) || 'LOCAL_APPLICATION', vehicleId: nullable(event.vehicleId),
      jobId: nullable(event.jobId), componentId: nullable(event.componentId), evidenceId: nullable(event.evidenceId), detail: nullable(event.detail)
    };
  }

  function normalizeVehicleRecord(input) {
    const source = input && typeof input === 'object' ? input : {};
    const normalized = {
      schema: VEHICLE_SCHEMA, schemaVersion: 1, id: nullable(source.id),
      revision: Number.isInteger(source.revision) && source.revision > 0 ? source.revision : 1,
      chassis: { year: nullable(source.chassis && source.chassis.year), make: nullable(source.chassis && source.chassis.make), model: nullable(source.chassis && source.chassis.model), submodel: nullable(source.chassis && source.chassis.submodel), platform: nullable(source.chassis && source.chassis.platform), evidence: nullable(source.chassis && source.chassis.evidence) || 'UNKNOWN' },
      vin: nullable(source.vin), installedEngine: clone(source.installedEngine || {}),
      customerReference: clone(source.customerReference || { customerName: null, reference: null }), notes: nullable(source.notes),
      createdAt: iso(source.createdAt), updatedAt: iso(source.updatedAt), archivedAt: iso(source.archivedAt), archiveReason: nullable(source.archiveReason),
      provenance: Array.isArray(source.provenance) ? source.provenance.map(clone) : [],
      jobIds: unique(Array.isArray(source.jobIds) ? source.jobIds.map(text) : []),
      configurationSnapshots: Array.isArray(source.configurationSnapshots) ? source.configurationSnapshots.map(clone) : [],
      currentConfigurationSnapshotId: nullable(source.currentConfigurationSnapshotId),
      auditEvents: Array.isArray(source.auditEvents) ? source.auditEvents.map(auditEvent) : []
    };
    if (!normalized.currentConfigurationSnapshotId && normalized.configurationSnapshots.length) normalized.currentConfigurationSnapshotId = normalized.configurationSnapshots.at(-1).id;
    return normalized;
  }

  function migrateVehicleRecords(jobs, existing, options) {
    const records = (Array.isArray(existing) ? existing : []).map(normalizeVehicleRecord);
    const byId = new Map(records.filter(item => item.id).map(item => [item.id, item]));
    const byVin = new Map(records.filter(item => item.vin).map(item => [text(item.vin).toUpperCase(), item]));
    for (const job of Array.isArray(jobs) ? jobs : []) {
      normalizeJob(job);
      const vin = text(job.vehicle && job.vehicle.vin).toUpperCase();
      let record = byId.get(text(job.vehicleRecordId)) || (vin ? byVin.get(vin) : null);
      if (!record) {
        record = vehicleRecordFromJob(job, { actor: options && options.actor, timestamp: job.createdAt || job.updatedAt, source: 'LEGACY_LOCAL_STORAGE_MIGRATION' });
        records.push(record); byId.set(record.id, record); if (vin) byVin.set(vin, record);
      }
      job.vehicleRecordId = record.id;
      if (!record.jobIds.includes(job.id)) record.jobIds.push(job.id);
      let snapshot = record.configurationSnapshots.find(item => item.jobId === job.id);
      if (!snapshot) {
        snapshot = configurationSnapshot(job, { vehicleId: record.id, observedAt: job.createdAt || job.updatedAt, actor: options && options.actor, source: 'LEGACY_LOCAL_STORAGE_MIGRATION' });
        record.configurationSnapshots.push(snapshot);
      }
      job.configurationSnapshotId = job.configurationSnapshotId || snapshot.id;
      record.currentConfigurationSnapshotId = record.currentConfigurationSnapshotId || snapshot.id;
    }
    return records.map(normalizeVehicleRecord);
  }

  function startJobFromVehicle(recordInput, jobInput, options) {
    const record = normalizeVehicleRecord(recordInput);
    if (!record.id) throw new Error('Vehicle record id is required.');
    const job = clone(jobInput || {});
    if (!job.id) throw new Error('Job id is required.');
    const current = record.configurationSnapshots.find(item => item.id === record.currentConfigurationSnapshotId) || record.configurationSnapshots.at(-1);
    const timestamp = iso(options && options.timestamp || job.createdAt || job.updatedAt) || new Date().toISOString();
    job.vehicleRecordId = record.id;
    job.vehicle = { ...(job.vehicle || {}), vin: record.vin, year: record.chassis.year, make: record.chassis.make, model: record.chassis.model, submodel: record.chassis.submodel };
    if (current && current.configuration) {
      const configuration = current.configuration;
      const engine = configuration.installedEngine || {};
      job.vehicle = { ...job.vehicle, engineManufacturer: engine.manufacturer, engineSize: engine.size, engineFamily: engine.family, engineVariant: engine.variant, engineLabel: engine.label, engineOrigin: engine.origin, engineSwap: engine.isSwap === true, carb: configuration.carburetor && configuration.carburetor.description };
      job.build = { ...(job.build || {}), cylinderHeads: configuration.cylinderHeads, cylinderHeadPart: configuration.cylinderHeadPart, camshaft: configuration.camValvetrain && configuration.camValvetrain.camshaft, camDuration050: configuration.camValvetrain && configuration.camValvetrain.duration050, camLift: configuration.camValvetrain && configuration.camValvetrain.lift, camLsa: configuration.camValvetrain && configuration.camValvetrain.lsa, valvetrain: configuration.camValvetrain && configuration.camValvetrain.valvetrain, valvetrainType: configuration.camValvetrain && configuration.camValvetrain.type, intake: configuration.intake && configuration.intake.description, carburetor: configuration.carburetor && configuration.carburetor.description, fuelDelivery: configuration.fuelSystem && configuration.fuelSystem.description, ignition: configuration.ignition && configuration.ignition.description, exhaust: configuration.exhaust && configuration.exhaust.description, transmission: configuration.transmission && configuration.transmission.description, converterStall: configuration.converterClutch && configuration.converterClutch.stallRpm, rearGear: configuration.differential && configuration.differential.rearGear, tires: clone(configuration.tires || { front: null, rear: null }), componentSelections: clone(configuration.components || {}) };
    }
    const snapshot = configurationSnapshot(job, { vehicleId: record.id, observedAt: timestamp, createdAt: timestamp, actor: options && options.actor, source: 'NEW_JOB_FROM_VEHICLE', configuration: current ? current.configuration : configurationFromJob(job), revision: record.configurationSnapshots.length + 1, supersedesId: current && current.id });
    job.configurationSnapshotId = snapshot.id;
    record.jobIds = unique([...record.jobIds, job.id]);
    record.configurationSnapshots.push(snapshot); record.currentConfigurationSnapshotId = snapshot.id;
    record.revision += 1; record.updatedAt = timestamp;
    record.auditEvents.push(auditEvent({ action: 'JOB_STARTED', occurredAt: timestamp, actor: options && options.actor, vehicleId: record.id, jobId: job.id, source: 'LOCAL_APPLICATION' }));
    return { vehicle: record, job, snapshot };
  }

  function archiveVehicle(recordInput, input) {
    const record = normalizeVehicleRecord(recordInput);
    const timestamp = iso(input && input.occurredAt) || new Date().toISOString();
    record.archivedAt = timestamp; record.archiveReason = nullable(input && input.reason); record.updatedAt = timestamp; record.revision += 1;
    record.auditEvents.push(auditEvent({ action: 'VEHICLE_ARCHIVED', occurredAt: timestamp, actor: input && input.actor, vehicleId: record.id, source: 'LOCAL_APPLICATION', detail: record.archiveReason }));
    return record;
  }

  function subjectForJob(job) {
    const vehicle = job && job.vehicle || {};
    return {
      jobId: text(job && job.id) || null,
      vehicleId: text(vehicle.vin) || text(vehicle.vehicleName) || null,
      componentId: null,
      chassis: {
        year: text(vehicle.year) || null,
        make: text(vehicle.make) || null,
        model: text(vehicle.model) || null,
        submodel: text(vehicle.submodel) || null
      },
      installedEngine: {
        manufacturer: text(vehicle.engineManufacturer) || null,
        size: text(vehicle.engineSize) || null,
        family: text(vehicle.engineFamily) || null,
        variant: text(vehicle.engineVariant) || null,
        origin: text(vehicle.engineOrigin) || null,
        isSwap: vehicle.engineSwap === true
      }
    };
  }

  function subjectFingerprint(subject) {
    return stableIdentity(subject || {});
  }

  function normalizeValidationResult(input, fallbackSubject) {
    const record = input && typeof input === 'object' ? input : {};
    const subject = record.subject && typeof record.subject === 'object' ? clone(record.subject) : clone(fallbackSubject || {});
    const normalized = {
      schema: VALIDATION_SCHEMA,
      schemaVersion: 1,
      id: text(record.id) || null,
      validationType: text(record.validationType) || 'UNKNOWN',
      result: allowed(record.result, RESULT, 'UNKNOWN'),
      lifecycle: allowed(record.lifecycle, LIFECYCLE, 'UNKNOWN'),
      observedAt: validDate(record.observedAt) ? new Date(record.observedAt).toISOString() : null,
      source: {
        origin: text(record.source && record.source.origin) || 'UNKNOWN',
        actor: text(record.source && record.source.actor) || null,
        method: text(record.source && record.source.method) || null
      },
      subject,
      subjectFingerprint: text(record.subjectFingerprint) || subjectFingerprint(subject),
      evidence: Array.isArray(record.evidence) ? record.evidence.filter(Boolean).map(clone) : [],
      statusDetail: text(record.statusDetail) || null,
      supersededBy: text(record.supersededBy) || null,
      invalidatedAt: validDate(record.invalidatedAt) ? new Date(record.invalidatedAt).toISOString() : null,
      invalidationReason: text(record.invalidationReason) || null
    };
    if (!normalized.id || !normalized.observedAt || normalized.source.origin === 'UNKNOWN') {
      normalized.lifecycle = 'UNKNOWN';
    }
    if (normalized.supersededBy) normalized.lifecycle = 'SUPERSEDED';
    if (normalized.invalidatedAt) normalized.lifecycle = 'INVALIDATED';
    return normalized;
  }

  function isCurrentVerified(record, currentSubject) {
    const item = normalizeValidationResult(record, currentSubject);
    return item.result === 'PASS' &&
      item.lifecycle === 'CURRENT' &&
      Boolean(item.id && item.observedAt) &&
      item.source.origin !== 'UNKNOWN' &&
      !item.supersededBy && !item.invalidatedAt &&
      item.subjectFingerprint === subjectFingerprint(currentSubject || item.subject);
  }

  function legacyResults(job) {
    return (Array.isArray(job.verificationSessions) ? job.verificationSessions : []).map((session, index) =>
      normalizeValidationResult({
        id: `legacy-verification-${session.id || index}`,
        validationType: 'TECHNICIAN_RETEST',
        result: session.outcome === 'POSITIVE' ? 'PASS' : session.outcome === 'NEGATIVE' ? 'FAIL' : session.outcome === 'NOT_YET_VERIFIED' ? 'NOT_RUN' : 'UNKNOWN',
        lifecycle: 'UNKNOWN',
        observedAt: session.at,
        source: { origin: 'LEGACY_LOCAL_STORAGE_IMPORT', method: session.mode || null },
        subject: subjectForJob(job),
        evidence: session.id ? [{ type: 'VERIFICATION_SESSION', reference: session.id }] : [],
        statusDetail: 'Migrated legacy evidence; currency was not asserted by the older schema.'
      }, subjectForJob(job))
    );
  }

  function normalizeJob(job) {
    const normalized = job && typeof job === 'object' ? job : {};
    const subject = subjectForJob(normalized);
    const hasVersionedResults = Array.isArray(normalized.validationResults) && (normalized.validationResults.length > 0 || normalized.contract && normalized.contract.schema === JOB_SCHEMA);
    const supplied = hasVersionedResults ? normalized.validationResults : legacyResults(normalized);
    normalized.contract = { schema: JOB_SCHEMA, schemaVersion: 1, contractVersion: CONTRACT_VERSION };
    normalized.odometerObservations = Array.isArray(normalized.odometerObservations) ? normalized.odometerObservations.map(observation => ({
      id: nullable(observation && observation.id), value: Number.isFinite(Number(observation && observation.value)) ? Number(observation.value) : null,
      unit: ['MILES', 'KILOMETERS', 'HOURS', 'UNKNOWN'].includes(observation && observation.unit) ? observation.unit : 'UNKNOWN',
      observedAt: iso(observation && observation.observedAt), source: nullable(observation && observation.source) || 'UNKNOWN',
      actor: actorReference(observation && observation.actor)
    })) : [];
    normalized.validationResults = supplied.map(item => {
      const result = normalizeValidationResult(item, subject);
      if (result.lifecycle === 'CURRENT' && result.subjectFingerprint !== subjectFingerprint(subject)) result.lifecycle = 'STALE';
      return result;
    });
    return normalized;
  }

  function appendValidationResult(job, input) {
    normalizeJob(job);
    const subject = input.subject || subjectForJob(job);
    const next = normalizeValidationResult({ ...input, subject }, subject);
    if (!next.id) throw new Error('Validation result id is required.');
    if (!next.observedAt) throw new Error('Validation result timestamp is required.');
    if (next.source.origin === 'UNKNOWN') throw new Error('Validation result source origin is required.');
    if (next.lifecycle === 'CURRENT') {
      job.validationResults.forEach(item => {
        if (item.lifecycle === 'CURRENT' && item.validationType === next.validationType && item.subjectFingerprint === next.subjectFingerprint) {
          item.lifecycle = 'SUPERSEDED';
          item.supersededBy = next.id;
        }
      });
    }
    job.validationResults.push(next);
    return next;
  }

  function invalidateValidationResults(job, reason, at) {
    normalizeJob(job);
    const timestamp = validDate(at) ? new Date(at).toISOString() : new Date().toISOString();
    job.validationResults.forEach(item => {
      if (item.lifecycle === 'CURRENT') {
        item.lifecycle = 'INVALIDATED';
        item.invalidatedAt = timestamp;
        item.invalidationReason = text(reason) || 'Related job data changed.';
      }
    });
  }

  function serviceBoundarySnapshot(job) {
    const vehicle = job && job.vehicle || {};
    return {
      schema: 'carbtune.service-boundary', schemaVersion: 1, contractVersion: CONTRACT_VERSION,
      job: { id: job.id || null, createdAt: job.createdAt || null, updatedAt: job.updatedAt || null, status: job.results && job.results.completed ? 'COMPLETED' : 'ACTIVE', odometerObservations: clone(job.odometerObservations || []) },
      vehicleChassis: { year: vehicle.year || null, make: vehicle.make || null, model: vehicle.model || null, submodel: vehicle.submodel || null, vin: vehicle.vin || null, evidence: vehicle.chassisEvidence || 'UNKNOWN' },
      installedEngine: { manufacturer: vehicle.engineManufacturer || null, size: vehicle.engineSize || null, family: vehicle.engineFamily || null, variant: vehicle.engineVariant || null, origin: vehicle.engineOrigin || 'UNKNOWN', isSwap: vehicle.engineSwap === true },
      components: clone(job.build && job.build.componentSelections || {}),
      baselineMeasurements: clone(job.baseline || {}),
      diagnosticFindings: clone(job.diagnostic && job.diagnostic.tests || []),
      recommendedCorrections: clone(job.requiredActions || []),
      performedCorrections: clone(job.tuneLog || []),
      retestVerificationResults: clone(job.verificationSessions || []),
      technicianEvidenceMedia: clone(job.evidenceMedia || []),
      validationResults: clone(job.validationResults || [])
    };
  }

  return Object.freeze({
    CONTRACT_VERSION, VALIDATION_SCHEMA, JOB_SCHEMA, VEHICLE_SCHEMA, CONFIGURATION_SCHEMA, ACTOR_SCHEMA, AUDIT_SCHEMA, RESULT, LIFECYCLE, DOMAINS,
    subjectForJob, subjectFingerprint, normalizeValidationResult, normalizeJob,
    appendValidationResult, invalidateValidationResults, isCurrentVerified, serviceBoundarySnapshot,
    actorReference, auditEvent, configurationFromJob, configurationSnapshot, vehicleRecordFromJob,
    normalizeVehicleRecord, migrateVehicleRecords, startJobFromVehicle, archiveVehicle, stableId
  });
});
