# CarbTune Pro Product Blueprint

Status: DESIGN BASELINE — NOT PRODUCTION IMPLEMENTATION

This document defines the redesign direction for CarbTune Pro. Existing production code remains a foundation to preserve useful vehicle/job/history infrastructure, but this blueprint—not the current Build 51 workflow—is the product specification for the next major implementation phase.

## Core product model

CarbTune Pro is professional shop software for carbureted/performance vehicles. It is not a generic form wizard and not a chat-first AI interface. It should behave like an intelligent technician workflow that understands the installed combination, verifies the vehicle's current condition, identifies the next highest-value action, guides the technician through that action, verifies the result, and iterates until the vehicle reaches a safe, stable, defensible stopping point.

Primary workflow:

1. Static Page 1 — Customer & Repair Order
2. Static Page 2 — Vehicle & Drivetrain
3. Static Page 3 — Modifications / Engine Build
4. Static Page 4 — As-Found Configuration
5. Static Page 5 — Projected Baseline & As-Found Verification
6. Dynamic Tuning Stack — Page 6 onward, generated from current evidence
7. Static Job Overview
8. Static Customer Report / Finalize

## Governing rules

- Workflow state is driven by vehicle condition and verification status, not page clicks.
- CarbTune never asks for information without knowing what it intends to do with it.
- Carry forward what the vehicle IS. Re-measure how the vehicle IS RUNNING.
- Technicians enter facts; CarbTune owns diagnostic/progression state.
- Technicians cannot manually override progression state. They may disagree with a recommendation by supplying new evidence/reasoning; the system then recalculates.
- Required but unverified evidence can block progression. Verified abnormal evidence does not block progression; it creates work for the next stage.
- Component-specific questions are generated from identified components. There is no universal carburetor checklist.
- Exact component identification supplies stock/manufacturer configuration where available. Stock may be assumed only with explicit provenance; uncertainty remains uncertainty.
- Any input or calibration change must recalculate dependent expectations and invalidate conclusions that are no longer trustworthy.
- Later information may invalidate earlier assumptions. CarbTune guides the technician only to affected items rather than restarting the job.
- Published specifications establish a starting envelope. Verified vehicle response establishes the learned sweet zone, subject to safety/hard-limit constraints.
- Sweet spots are zones, not infinitely precise points.
- Further refinement requires a predicted meaningful benefit and must produce a verified net improvement to be retained.
- Once an upstream system is verified stable, it becomes frozen. Reopening it requires stronger new evidence or a dependency change.
- CarbTune does not grade the vehicle with an optimization score. It documents verified change from As-Found to As-Leaving.

## Static page intent

### Page 1 — Customer & Repair Order

Capture customer identity, repair-order identity, job intent, complaint/request, current technician, Date In, previous work access, and build-sheet upload when appropriate. Every visit receives a new RO. Historical ROs are immutable records. A return visit may carry forward known configuration as a new snapshot, but today's measurements are always re-measured.

### Page 2 — Vehicle & Drivetrain

Capture chassis identity and installed engine identity independently. Use relational Year → Make → Model → Trim/Submodel selection where supported. VIN may prepopulate original-build information but never silently proves the current installed engine. Capture factory-vs-swap engine configuration, transmission, converter information when relevant, and other load-related vehicle facts without turning this page into a tuning worksheet.

### Page 3 — Modifications / Engine Build

Capture what differs from stock and what additional equipment matters to carburetor diagnosis/tuning. Use architecture-aware progressive disclosure. Default collapsed sections represent assumed-stock configuration with provenance; modified sections expand only when relevant. Major domains include Fuel System, Engine Build, Heads/Valvetrain, Induction, Ignition, Exhaust, Power Adders, and AFR Monitoring.

### Page 4 — As-Found Configuration

Capture how adjustable systems are configured when the vehicle arrives, particularly deviations from known stock/manufacturer configuration. Questions are generated from the identified component family. This page records configuration, not current live operating measurements.

### Page 5 — Projected Baseline & As-Found Verification

Compile Pages 1–4 into predicted operating expectations and require factual technician measurements/observations. Page 5 is a fact-completion gate, not a perfection gate. It may complete with abnormal results once every required item has been validly verified. Contradictions and implausible entries trigger verification rather than blind correction.

## Dynamic Tuning Stack

There is no predetermined sequence of pages after Page 5. Each new sheet is generated from:

- static Pages 1–5,
- every completed Stack sheet,
- newest test results,
- every correction performed,
- current configuration and condition,
- active dependencies and invalidations,
- current evidence confidence/provenance.

Every Stack sheet uses the universal structure:

OBJECTIVE → EVIDENCE → ACTION → VERIFICATION → OUTCOME

A sheet represents a diagnostic/correction objective, not a single measurement. Related tests and retests stay on the same sheet when they belong to the same corrective objective.

Next-sheet priority considers safety/mechanical validity first, then measurement validity, then the combination of distance from current sweet zone, importance, downstream influence, and confidence. The system must prefer upstream/high-leverage corrections over downstream compensation.

## Reasoning behavior

CarbTune maintains an internal working theory of the remaining condition. It must be concise, evidence-based, and revisable. The technician may expose a "Why CarbTune is doing this" view, but the primary UI remains a professional diagnostic instrument rather than an AI chat interface.

The system tracks Problem → Hypothesis → Test → Result → Correction → Retest. Repeating a branch requires new evidence, a changed dependency, or incomplete/invalid verification. Failed hypotheses are reduced or closed. Corrections that produce no meaningful improvement cause the system to change direction rather than loop.

## Standardized test conditions

Measurements are only comparable when captured under appropriate conditions. Each measurement/test type can define a hidden test-condition recipe such as engine temperature state, RPM, transmission state, accessory/load state, vacuum-advance state, sensor location, and other context. The technician is guided through the recipe without being burdened with another generic form.

## Evidence and provenance

The system distinguishes manufacturer facts, authoritative technical facts, CarbTune calculations, CarbTune inferences, technician observations, measured results, document-derived facts, and unverified information. Inference never silently becomes confirmed fact. Conflicting evidence can force verification.

## Environmental context

Ambient temperature, barometric pressure/elevation, humidity, fuel composition, heat-soak state, and similar environmental factors may be captured automatically or contextually when relevant. They are stored as test context, not presented as a separate weather worksheet.

## Hardware-limited tuning

CarbTune may conclude that current hardware has reached its practical tuning limit. This is distinct from an unresolved tuning fault. The system should state what evidence supports the limitation and what hardware change would be required for further meaningful improvement.

## Stop/refinement logic

When the vehicle is safe, stable, within an acceptable learned zone, the original complaint is addressed to the degree possible, and no critical dependency remains unresolved, CarbTune may offer:

- Proceed to Job Overview
- Continue Performance Refinement

Performance refinement is not allowed to reopen frozen upstream systems without stronger evidence. Microscopic gains do not justify degrading overall drivability, reliability, safety, or stability.

## Job Overview

Automatically assemble As Found → findings → corrections → before/after evidence → final configuration/settings → complaint outcome → remaining concerns → As Leaving. The technician reviews and corrects factual mistakes rather than rewriting the job narrative from scratch.

## Customer Report / Finalize

Generate a clean customer-facing summary: why the vehicle came in, important findings, corrections performed, final results, recommendations/declined work/unresolved concerns, and overall outcome. If critical issues remain or further repair is required, the report must say so explicitly rather than implying success because the workflow reached the end.

## Visual direction

Use a dark application shell with a clean warm-white/light-gray central working surface, restrained semantic colors, strong typography hierarchy, generous spacing, and minimal competing cards/borders. Suggested semantics: dark gray/black for structure; blue for location/information/interaction; green for verified/proceed; red for actual problems; orange for attention/priority. The central work area may subtly evoke a stack of work sheets without literal paper gimmicks.

The intelligence should mostly disappear into the workflow. Avoid glowing AI motifs, dominant chat windows, and repetitive "AI says" language.
