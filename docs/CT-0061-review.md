# CT-0061 reviewer decision — CHANGES_REQUESTED

Review date: 2026-10-27. Reviewed branch: `design/knowledge-graph-v1`.
Reviewed HEAD: `5148ef91a698c01b28c81b0669fc750f54c4d565`.
Implementation: `b9e3702ad6ea9b9f061ac23966eee4e19a156153`.

## Scope and decision

Reviewed actual code and tests against CARBTUNE_BLUEPRINT.md, CARBTUNE_KNOWLEDGE_GRAPH.md, CARBTUNE_IMPLEMENTATION_CONTRACT.md and CT-0061's narrower workflow-foundation assignment. Full graph traversal, freeze/anti-loop/learned-zone reasoning and successful finalization are explicitly deferred; their absence alone does not reject this milestone. Two implemented evidence/safety boundaries fail the governing rules and prevent acceptance.

## CT61-R1 — P1: configuration edits erase an unresolved safety block

Location: `ui/redesign.js` functions `save`, `current`, `gate`, `baselinePage`, and the measurement recording handler (lines 42–61, 139, 211–218 at reviewed HEAD).

Reproduction on a clean default-entry demo:
1. Open Baseline and record fuel-leak inspection = Observed. RPM reading controls are disabled.
2. Open As-Found Configuration, expand Ignition & fuel-system settings, and change Other settings to an unrelated note.
3. Return to Baseline. `CarbTuneRedesign.gate()` now reports `safety:null`, `unsafe:false`; the live RPM reading controls are enabled. No new leak inspection or repair evidence was supplied.

Cause: the global configuration dependency revision makes the leak observation disappear from `current('leaks')`. `gate()` treats absent safety evidence as safe for live controls. A clean job without an inspection also enables those controls. Stack then drops the known fuel-leak objective in favor of generic missing evidence.

Required correction: preserve unresolved safety hazards independently of measurement freshness. A changed dependency may require reinspection, but must never resolve the hazard. Require current valid safety clearance before live testing, enforce the same rule in the recording handler, and retain the original concern and resolution evidence in append-only history. A technician supplies inspection/repair facts; no manual pass override. Add browser regressions for unrelated and relevant configuration edits, reload, reversal to the old configuration, stale/missing inspection, and evidence-backed resolution. Maintain safety-first Stack and report behavior throughout.

Basis: Blueprint condition-driven state and safety-first Stack; Implementation Contract rules 4 and 10, evidence-driven state, and prohibition of unsafe test paths with unresolved safety dependencies. This is a defect in the representative leak handling already claimed by CT-0061, not a request for an exhaustive safety engine.

## CT61-R2 — P1: invalid operating conditions satisfy baseline verification

Location: `ui/redesign.js` functions `current`, `gate`, `baselinePage`, and recording handler (lines 50–61, 128–143, 211–222 at reviewed HEAD).

Reproduction on fresh evidence after recording None observed for leaks:
1. Record temperature 40 F, RPM 0, vacuum 0 inHg, pressure 6 PSI and initial timing 12 BTDC.
2. For every measurement enter actual conditions exactly: `Engine off, cold, no instrument identified`.
3. All five readings are accepted and `CarbTuneRedesign.gate().complete` becomes true. The UI declares required evidence recorded despite explicit contradiction of the warm/running test recipe.

Cause: conditions are accepted solely because a free-text string is nonempty. The broad numerical plausibility check does not validate the test recipe, and `current()` counts every stored observation as verified evidence.

Required correction: define the relevant condition recipe for the existing measurement types, capture the necessary facts, and calculate condition validity before counting a reading toward completion. Preserve invalid/uncertain observations with provenance and explain what must be repeated; do not silently discard them. Use structured facts or explicit factual confirmations, not arbitrary text length or a manual status toggle. Reject known-incompatible warm-idle tests from gate completion; include temperature/running state, timing advance state when applicable, measurement location/instrument suitability, and other conditions required by the existing procedures. No universal numeric target should turn a valid abnormal result into a completion blocker. Add negative recipe tests plus valid abnormal completion, persistence, correction history and dependency-invalidation coverage.

Basis: Blueprint Page 5 requires validly verified facts; standardized test conditions. Implementation Contract test-condition contract and measurement context invariant. More elaborate comparisons can remain future work, but this gate must not claim verification of explicitly invalid tests.

## Verified strengths and limits

The dark shell, warm working surface, real context strip and eight distinct destinations implement the approved visual/information architecture. Inspected generated desktop Customer/RO and phone Stack screenshots. Responsive assertions cover all eight destinations at 1440, 820 and 390 px. Page 3 has eight progressive domains; Page 4 derives supported choke/secondary questions from identified hardware and states missing stock calibration honestly. Navigation does not mark evidence complete; notes do not mark correction success; finalization is disabled. Existing services and append-only measurement history are reused. Catalog provenance and installed-engine/chassis separation are retained by code inspection and passing regression suites.

No actual-shop technician acceptance, exhaustive safety coverage, complete diagnostic graph, or production readiness is claimed. Freeform Stack action notes and conservative dependency invalidation remain milestone limits subject to the two required corrections above.

## Fresh validation

On 2026-10-27, `node scripts/validate.cjs` passed all seven canonical programs: syntax (two inline scripts plus redesign module), vehicle registry/provenance (35,036 combined records), project control, service contracts/migration/history, vehicle cascade browser tests, legacy workflow (165 assertions), and default redesign workflow (78 assertions). Browser suites reported no unexpected errors. Bundled Playwright and installed Chrome ran the tests; no dependency/lockfile change was needed. The first restricted browser run could not access localhost; the successful rerun had local-server access.

Independent browser probes reproduced R1 and R2 beyond existing coverage. Passing canonical tests therefore do not establish acceptance. No application code was changed during this review.

## Executable next action and CT-0062 gate

Keep CT-0061 active as CHANGES_REQUESTED. Fix R1/R2 on `design/knowledge-graph-v1`, preserve all existing task/review notes, add meaningful regressions, run canonical validation and diff checks, then commit implementation and a separate exact-SHA handoff via the protected wrapper. Return to READY_FOR_CHATGPT_REVIEW; do not self-accept.

CT-0062 is not issued because CT-0061 was not accepted. After acceptance, prepare its assignment for evidence-backed diagnostic graph traversal, ordered dynamic objectives, hypothesis/test/result/correction/retest lifecycle, dependency invalidation, seeds, anti-loop/freeze behavior, condition-compatible before/after evidence, learned zones, and safe stopping/hardware-limited outcomes. Require explainable selection, authoritative numerical provenance and graph validators; preserve the shell and existing job services. Do not begin that implementation under this review.

Production: no main writes, merges or deployments. Review documentation is delivered on the design branch only.
