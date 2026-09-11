# CarbTune Knowledge Graph

Status: DESIGN BASELINE — LIVING TECHNICAL MODEL

CarbTune organizes technical knowledge hierarchically for human maintenance but reasons over it as an interconnected dependency graph. A node may have multiple causes, multiple effects, multiple tests, conflicting evidence, and multiple valid next branches. The graph is bidirectional: CarbTune can reason from cause to effect or from observed effect back toward likely causes.

## Top-level model

CARBTUNE
└── VEHICLE OPERATING MODEL
    ├── CONFIGURATION — what the vehicle is
    ├── EVIDENCE — what the vehicle is doing
    ├── OBJECTIVE — what the job is trying to achieve
    └── TECHNICAL KNOWLEDGE GRAPH

Primary technical domains:

1. Mechanical Integrity
2. Fuel Delivery
3. Carburetor
4. Ignition
5. Induction / Air
6. Exhaust
7. Drivetrain / Load

Cross-cutting layers:

- Environment / test context
- Measurement and evidence validity
- Symptoms / operating conditions
- Safety constraints
- Evidence provenance and confidence

## Node contract

Every meaningful technical node should support, where applicable:

- Identity: stable ID, name, system, subsystem, applicable architectures/components.
- Purpose: why CarbTune cares about this node.
- Inputs: vehicle configuration, measurements, observations, manufacturer data, environment/test context.
- Expected state: manufacturer/reference specification, calculated sweet zone, learned sweet zone.
- Evidence: supporting evidence, contradictory evidence, provenance, trust/confidence state.
- Upstream dependencies: what can affect this node.
- Downstream effects: what this node can affect.
- Diagnostic triggers: what evidence causes CarbTune to investigate it.
- Test definition: why the test matters, required conditions, procedure, measurement type, plausibility checks.
- Interpretation: normal patterns, abnormal patterns, contradictions, uncertainty.
- Corrective actions: possible corrections, component-specific procedures, safety constraints.
- Verification: required retests, meaningful-improvement criteria, branch-closing criteria.
- State: unverified, verified normal, verified abnormal, blocked, needs review, invalidated, corrected, stable/frozen.
- Seeds: results capable of activating, suppressing, freezing, or reopening another node or branch.
- Source references: provenance/documentation supporting technical assertions.

Technicians supply measurements, observations, confirmations, and actions. CarbTune calculates node state.

## Graph behavior

### Bidirectional traversal

Every important node should answer:

1. What can cause or influence this?
2. What can this cause or influence?
3. When should CarbTune care?
4. How does CarbTune validly verify it?
5. What can each result spawn next?

### Seeds

A terminal-looking result is not necessarily an endpoint. Example:

Tip-in hesitation → accelerator-pump verification → pump shot verified healthy → reduce confidence in pump fault → increase confidence in transition/main-circuit handoff → activate transition/booster-signal branch.

Seeds may increase/decrease confidence, close a hypothesis, reopen a frozen dependency, require a new test, or generate a corrective Stack objective.

### Freeze points

When an upstream system is adequately verified and a correction has been successfully retested, it becomes stable/frozen. Later fine-tuning cannot casually reopen it. Reopening requires materially contradictory evidence, a changed dependency, or invalidated test conditions.

### Contradiction handling

CarbTune should detect combinations that do not make physical/diagnostic sense before recommending adjustment. Example: an extremely high recorded carburetor fuel pressure combined with an unexpectedly low float level may justify verifying the pressure gauge, test conditions, fuel-level observation, or carburetor identification before changing metering.

## Domain skeleton

### 01 Mechanical Integrity

- Engine mechanical condition
- Valvetrain
- Compression / cylinder sealing
- Vacuum integrity
- Cooling / operating temperature
- Mechanical timing / indexing
- Throttle and linkage mechanical operation
- Drivetrain/load faults that masquerade as engine tuning issues
- Safety conditions that invalidate or prohibit tuning tests

Mechanical testing is evidence-activated rather than mandatory on every job.

### 02 Fuel Delivery

#### 02.01 Fuel Characteristics
- Fuel family/type
- Ethanol category/content when relevant
- Stoichiometric relationship / lambda interpretation
- Energy-density/demand implications
- Material compatibility
- Vapor characteristics
- Fuel age/condition when relevant

#### 02.02 Fuel Storage
- Tank
- Pickup
- Pickup location
- Venting
- Sump
- Contamination/debris

#### 02.03 Supply Plumbing
- Line size
- Line length
- Routing
- Restrictions
- Hose/material compatibility
- Heat exposure
- Fittings

#### 02.04 Filtration
- Pre-pump filtration
- Post-pump filtration
- Micron suitability
- Restriction
- Contamination

#### 02.05 Fuel Pump
- Mechanical / electric
- Manufacturer/model
- Rated pressure
- Rated flow
- Voltage/current supply when electric
- Mounting/location
- Inlet restriction
- Suitability for demand and fuel type

#### 02.06 Regulation
- Regulator type
- Deadhead
- Bypass/return
- Boost referenced
- Adjustment
- Return capacity
- Stability

#### 02.07 Fuel Pressure
- Static/key-on where applicable
- Idle
- Cruise
- Loaded/WOT
- Pressure stability
- Pressure differential when applicable

Pressure and volume/capacity are distinct. Acceptable pressure at one operating condition does not prove adequate fuel delivery under load.

#### 02.08 Fuel Volume / Capacity
- Free-flow capability
- Flow at relevant pressure
- Loaded demand
- Pump reserve
- Carburetor demand

#### 02.09 Fuel Temperature / Vapor
- Heat soak
- Percolation
- Vapor formation
- Hot restart
- Routing/insulation influence

#### 02.10 Carburetor Interface
- Needle/seat capacity
- Bowl demand
- Inlet configuration
- Required operating pressure
- Fuel-level dependency

#### 02.11 High-Demand Operation
- High RPM
- Sustained load
- Nitrous
- Supercharger
- Turbocharger

#### 02.12 Fuel Delivery Fault Patterns
- Excessive pressure
- Low pressure
- Pressure falls under load
- Pressure oscillation
- Insufficient volume
- Aeration
- Restriction
- Vapor lock/percolation
- Contamination

### 03 Carburetor

- Identity / architecture
- Fuel level
- Idle circuit
- Transition circuit
- Main metering
- Power enrichment
- Accelerator pump
- Secondary system
- Choke / cold enrichment
- Air bleeds where applicable
- Needle/seat
- Booster signal
- Internal restrictions/calibration architecture
- Throttle-blade / transfer-slot relationship

Questions and available adjustment nodes are generated from the identified carburetor family/component, never from one universal checklist.

### 04 Ignition

- Spark generation
- Distributor/indexing
- Initial timing
- Mechanical advance
- Vacuum advance
- Total timing
- Timing curve
- Coil/module/box
- Spark plugs
- Plug wires
- Firing order
- Rev limiting
- Timing stability
- Crank-trigger systems where applicable

### 05 Induction / Air

- Air cleaner/restriction
- Intake manifold
- Spacer
- Plenum/runner characteristics
- Vacuum sources
- PCV/breather influence
- Boost configuration
- Throttle airflow
- Carburetor sizing/signal suitability

### 06 Exhaust

- Manifolds/headers
- Exhaust restriction
- Exhaust leaks
- Collector/crossover configuration
- Sensor placement
- Wideband sampling validity
- Backpressure-related symptoms

### 07 Drivetrain / Load

- Transmission
- Converter/stall
- TV/kickdown/linkage geometry
- Rear gearing
- Tire diameter
- Vehicle weight
- Cruise RPM/load
- Accessory load
- Road-test/dyno operating conditions

## Cross-cutting: Environment

Potential context includes ambient temperature, barometric pressure/elevation, humidity, fuel composition, heat-soak state, and seasonal variation. Capture automatically/contextually where possible. Environmental context modifies interpretation and comparability; it should not become a standalone technician worksheet.

## Cross-cutting: Measurement / Evidence Validity

- Tool suitability
- Sensor/gauge calibration
- Required test conditions
- Repeatability
- Plausibility checks
- Contradictory measurements
- Evidence provenance
- Manufacturer/document confidence
- Technician observation
- Vision identification
- Inference vs confirmed fact

No downstream conclusion may become more certain than the evidence supporting it.

## Cross-cutting: Symptoms / Operating Conditions

Operating conditions include cold start, hot start, idle, off-idle, tip-in, light cruise, moderate acceleration, heavy load, WOT, deceleration, restart/heat soak.

Symptom vocabulary includes miss, surge, bog, hesitation, carburetor pop/backfire, exhaust backfire, rich/lean behavior, temperature complaint, flooding/fuel smell, poor economy, and lack of power.

Free-text complaints remain preserved verbatim while CarbTune proposes structured symptom candidates for technician confirmation.

## Example node: 02.07 Loaded Fuel Pressure

Purpose: determine whether the fuel-delivery system maintains an appropriate and stable pressure under a load condition relevant to the installed carburetor/system.

Possible upstream influences:
- pump capacity
- electric pump voltage/current supply
- inlet restriction
- pickup restriction
- filter restriction
- line size/routing
- regulator behavior
- return capacity
- vapor/aeration
- fuel demand

Possible downstream effects:
- bowl fuel level
- main-metering stability
- WOT lambda/AFR
- engine power
- high-load drivability
- detonation/safety margin in a lean condition

Typical triggers:
- lean trend under load
- power falls off with RPM/load
- bowl-fuel concern
- observed pressure concern
- high-demand combination

Test contract:
- measurement must be captured under a defined and safe load/test condition
- gauge/sensor suitability and placement must be credible
- required thermal state and fuel level should be controlled where relevant
- unsafe road/WOT testing is prohibited when a safety dependency is unresolved

Seeds:
- pressure stable → reduce/freeze pressure-delivery suspicion; investigate other causes if symptom persists
- pressure falls → activate pump/capacity/restriction/supply branch
- pressure oscillates → activate regulation/aeration/pump-behavior branch
- implausible value → activate measurement-validity branch before adjustment

## Knowledge-map inspector requirements

Development/admin tooling should eventually expose an internal graph inspector that can:

- search and open a node
- show upstream and downstream edges
- show active source/provenance references
- show diagnostic triggers
- show test/verification requirements
- show seeds and branch-closing conditions
- reveal orphan nodes
- reveal dead-end branches
- reveal circular diagnostic loops
- reveal corrections without verification
- reveal unsupported numerical recommendations
- reveal contradictory rules
- reveal UI/data requirements that Pages 1–5 cannot currently supply

The inspector is a development and quality-control tool first; it need not be exposed to normal shop users.
