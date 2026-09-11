# CT-0061 redesign review milestone

The default entry point on `design/knowledge-graph-v1` now opens the approved dark shell and light technician sheet. This milestone implements the workflow chassis, rather than the full knowledge graph or tuning engine. Production `main` is not changed or merged by this assignment.

## Implementation boundaries

- `ui/redesign.css` owns scoped visual tokens, responsive navigation, work sheets, and print styles.
- `ui/redesign.js` adapts existing global job, vehicle, component, persistence, and validation services. It is loaded after the existing application initializes; it replaces the primary rendered workflow without rewriting those services.
- Pages 1–5 separately house customer/RO, chassis/drivetrain, modifications, as-found settings, and measured baseline verification. Stack, Overview and Report are separate destinations.
- Navigation is independent of evidence completion. Opening a page never marks a system passed or a job complete.
- The explicit `?workflow=legacy` reference entry retains the previous workflow for regression and historical support. It is not linked as a progression override in the redesign. The canonical suite exercises that entry plus the new default entry; passing old browser tests alone is insufficient.

## Additive saved-job data

Existing storage keys and contract schemas remain unchanged. The optional `redesign` object is preserved by the existing job normalizer and includes:

- UI location, customer/visit fields, domain disclosure state, component-specific configuration notes, and worksheet notes.
- `legacyBaseline`: an unchanged copy of prior-workflow measurements captured before editing through this interface; these are displayed as historical evidence, not current verification.
- Append-only `observations`: ID, key/value, actual conditions, reason, actor, timestamp, provenance, replaced observation ID, configuration fingerprint and dependency revision.
- Append-only edit audit entries with actor/time and old/new values.
- Persisted reading drafts, kept distinct from recorded observations.

An installed configuration change invalidates CT-0059 validation records and increments a monotonically increasing dependency revision. Old readings remain stored; restoring identical configuration cannot resurrect previously invalidated evidence. In this milestone invalidation is deliberately conservative across the baseline set. Fine-grained graph dependencies are future work.

Return visits use the existing CT-0060 `startJobFromVehicle` service and immutable configuration snapshot model. They start a fresh redesign evidence set. Additional as-found notes are job-scoped; automatic carry-forward of those new freeform settings is not implemented.

## Evidence and honest limitations

The initial measurement set uses the existing application’s temperature, RPM, vacuum, pressure and timing definitions; AFR appears only when wideband availability is recorded. Their published UI windows are labeled CarbTune inference, not manufacturer specifications. Exact installed-combination expectations are not invented.

The as-found interface uses the selected verified carburetor record’s manual choke and vacuum-secondary architecture. The current catalog does not provide verified stock jet, float or calibration settings; those remain explicitly unavailable. No catalog records or numerical specifications were added.

Valid abnormal readings satisfy factual completion and create a review objective. Missing/implausible readings do not. A recorded fuel-leak concern blocks live measurement controls. This is one representative safety condition, not a complete mechanical/safety rule engine.

The representative Stack selects an evidence-completion, fuel-leak, fuel-pressure or neutral review objective from actual evidence. It presents Objective → Evidence → Action → Verification → Outcome. Notes cannot declare successful corrections. Full graph traversal, automated adjustment prescriptions, learned zones, automatic verified outcomes and finalization are pending. Report printing is available; successful finalization remains disabled until there is an implemented verified terminal-outcome contract.

## Verification and review

`node scripts/validate.cjs` runs seven canonical programs, including the original 165 workflow assertions and the new `tests/redesign.browser.cjs` acceptance suite. The latter tests the default entry, all eight pages, conditional component fields, relational selection, independent compatibility filters, repeated custom-entry toggling, evidence validity, abnormal completion, non-revival of invalidated evidence, persistence, history protection, return visits, sequential numbering, duplicate warnings, deletion, and desktop/tablet/phone widths.

For focused development, `CARBTUNE_TEST=tests/redesign.browser.cjs` selects that program only and reports the actual number of executed programs. Clear the variable for complete validation. `CARBTUNE_SCREENSHOT_DIR` can retain review screenshots outside the repository.

Manual review should start on the default URL, inspect all eight destinations on desktop and phone, and test a new actual repair order. The built-in demo is explicitly labeled as sample data. Review this branch before any production merge or deployment.
