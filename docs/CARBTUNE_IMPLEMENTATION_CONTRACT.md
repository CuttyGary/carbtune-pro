# CarbTune Implementation Contract

Status: DESIGN BASELINE — MANDATORY RULES FOR FUTURE IMPLEMENTATION

This contract exists to prevent implementation drift. Development agents may improve implementation details, but they must not silently reinterpret the product architecture defined in the CarbTune Blueprint and Knowledge Graph.

## Non-negotiable product rules

1. Do not turn the product into a generic data-entry wizard.
2. Do not create predetermined post-baseline tuning pages. Page 6 onward is generated from current evidence and active dependencies.
3. Do not allow technicians to manually mark systems corrected, stable, passed, invalidated, or otherwise control reasoning state.
4. Do not allow a click-through override that advances past missing required evidence.
5. Verified abnormal evidence is valid evidence; it must not trap the technician on the baseline page.
6. Do not overwrite historical job evidence. Corrections to prior entries are appended with reason, actor, and timestamp; dependent conclusions are recalculated.
7. Do not silently convert inference into fact.
8. Do not invent specifications or component details when exact data is unavailable.
9. Do not use a universal carburetor checklist. Component-specific configuration and adjustment questions must come from the identified carburetor/component family.
10. Do not recommend downstream tuning changes while an unresolved upstream condition materially invalidates them.
11. Do not repeatedly reopen a stable/frozen upstream system without new contradictory evidence or a dependency change.
12. Do not repeat a diagnostic branch merely because a symptom remains. A repeat requires new evidence, invalid test conditions, a changed dependency, or incomplete verification.
13. Do not present an optimization percentage, score, or false precision as a measure of vehicle quality.
14. Do not imply successful completion when critical unresolved conditions, required repairs, or declined work remain.
15. Do not expose internal AI implementation as the primary user experience. CarbTune should feel like professional diagnostic/tuning software.

## Data and reasoning invariants

- Chassis/vehicle identity and installed engine identity remain independent.
- Returning jobs may clone known configuration into a new snapshot; historical snapshots remain immutable.
- Current measurements are newly measured unless a test result is explicitly reused under still-valid conditions.
- Every measurement carries enough context to determine whether it remains valid after a dependency change.
- Every technical assertion can carry provenance.
- Manufacturer facts, CarbTune calculations, CarbTune inferences, technician observations, and learned successful settings remain distinguishable.
- Numerical recommendations without supporting provenance or a documented calculation path are invalid knowledge records.
- Corrections must declare what they changed so dependent evidence can be invalidated/retested.
- A correction is not considered successful until its required verification is completed.

## Dynamic Stack contract

Each generated Stack sheet must include:

- Objective
- Evidence supporting why this is the next objective
- Action/procedure appropriate to the identified hardware and current condition
- Verification requirements
- Outcome computed from the resulting evidence

A Stack sheet must earn its existence. Generation must be explainable by active graph relationships and current evidence.

The next-objective selector must respect, in order:

1. immediate safety/mechanical validity constraints
2. measurement/evidence validity
3. upstream/downstream dependency ordering
4. distance from the current acceptable/sweet zone
5. diagnostic importance
6. downstream leverage
7. confidence in the active hypothesis
8. diminishing-return/refinement constraints

## Test-condition contract

Every measurement/test that depends on operating conditions must define the relevant condition recipe. The UI should present only what the technician needs to perform a valid test. Before/after comparisons must not be treated as equivalent when their test conditions are materially incompatible.

## Evidence disagreement contract

The technician may disagree with a CarbTune recommendation, but disagreement does not directly change progression state. The disagreement path captures a reason and any new evidence such as:

- different diagnostic direction
- known vehicle behavior
- measurement concern
- incorrect component/configuration data
- other documented reason

CarbTune then recalculates the graph and next action.

## Hardware-limited outcome

The reasoning engine must support a legitimate terminal state in which the current hardware has reached its practical tuning limit. This is not the same as unresolved diagnosis. The system must identify the limiting hardware/architecture, supporting evidence, and what category of hardware change would be necessary for further meaningful improvement.

## Automated knowledge-graph validation

Before a knowledge-graph change is accepted, automated checks should identify at minimum:

- orphan nodes
- unreachable nodes that should be active
- dead-end diagnostic results with no defined terminal/next behavior
- circular paths capable of infinite diagnostic loops
- corrective actions without verification requirements
- tests without required test-condition metadata where conditions matter
- unsupported numerical specifications
- contradictory active rules for the same component/application
- references to required evidence that the intake/baseline workflow cannot supply
- unsafe load-test paths permitted while a blocking safety condition is active
- state transitions initiated directly by technician UI input instead of evidence processing

## Application validation

Future implementation tasks must preserve or expand automated validation for:

- saved-job migration and backward compatibility
- vehicle/job/configuration history immutability
- dependency invalidation
- evidence provenance
- correction/retest lifecycle
- Dynamic Stack selection and anti-loop behavior
- component-specific UI generation
- safe stopping/refinement logic
- responsive desktop/tablet/phone behavior
- zero unexpected browser-console errors in canonical workflows

## Change control

If implementation requires changing a locked product rule, the development agent must stop and record:

- the exact rule in conflict
- why implementation cannot satisfy it as written
- proposed alternative
- affected workflow/data/validation areas
- migration implications

The agent must not silently choose a different product behavior.

## Build strategy

Preserve proven CT-0059/CT-0060 foundations where compatible, including vehicle records, job history, immutable configuration snapshots, validation lifecycle, provenance concepts, and migration behavior. Replace or refactor the Build 51 workflow only after the blueprint and knowledge-graph contracts are sufficiently defined and implementation acceptance criteria are explicit.
