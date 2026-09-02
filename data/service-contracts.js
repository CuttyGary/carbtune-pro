(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CARB_TUNE_CONTRACTS = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const CONTRACT_VERSION = '1.0.0';
  const VALIDATION_SCHEMA = 'carbtune.validation-result';
  const JOB_SCHEMA = 'carbtune.job';
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
      job: { id: job.id || null, createdAt: job.createdAt || null, updatedAt: job.updatedAt || null, status: job.results && job.results.completed ? 'COMPLETED' : 'ACTIVE' },
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
    CONTRACT_VERSION, VALIDATION_SCHEMA, JOB_SCHEMA, RESULT, LIFECYCLE, DOMAINS,
    subjectForJob, subjectFingerprint, normalizeValidationResult, normalizeJob,
    appendValidationResult, invalidateValidationResults, isCurrentVerified, serviceBoundarySnapshot
  });
});
