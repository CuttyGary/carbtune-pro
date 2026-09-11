/* CT-0061 workflow adapter. Existing storage and component services stay authoritative. */
(function () {
  'use strict';
  // Explicit reference workspace for historical workflow support and regression coverage.
  if (new URLSearchParams(location.search).get('workflow') === 'legacy') return;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet'; stylesheet.href = 'ui/redesign.css'; document.head.append(stylesheet);
  document.body.classList.add('ct61');
  const contracts = window.CARB_TUNE_CONTRACTS;
  const pages = [
    ['customer', 'Customer & Repair Order', 'Customer, visit and work requested'],
    ['vehicle', 'Vehicle & Drivetrain', 'Chassis, installed engine and load'],
    ['build', 'Modifications / Engine Build', 'Identify the installed combination'],
    ['configuration', 'As-Found Configuration', 'Record the settings on arrival'],
    ['baseline', 'Projected Baseline & Verification', 'Establish current measured evidence'],
    ['stack', 'Dynamic Tuning Stack', 'Work from the evidence'],
    ['overview', 'Job Overview', 'Review the complete visit'],
    ['report', 'Customer Report / Finalize', 'Document the outcome']
  ];
  const originalSave = save;
  const originalSetPhase = setPhase;
  const fingerprints = new Map();
  let message = '';
  function model() {
    if (!state.redesign) state.redesign = { version:1, page:'customer', customer:{}, configuration:{}, domains:{}, observations:[], audit:[], stack:{}, legacyBaseline:clone(state.baseline) };
    const m=state.redesign;
    for (const key of ['customer','configuration','domains','stack','drafts']) m[key] ||= {};
    for (const key of ['observations','audit']) if (!Array.isArray(m[key])) m[key]=[];
    if (!Number.isSafeInteger(m.dependencyRevision)) m.dependencyRevision=0;
    if (!pages.some(p=>p[0]===m.page)) m.page='customer';
    return m;
  }
  function fingerprint() {
    return JSON.stringify([contracts.subjectFingerprint(contracts.subjectForJob(state)), state.build, model().configuration, !!b51().hasWideband]);
  }
  function actor() { return model().customer.technician || 'UNKNOWN'; }
  function audit(field,before,after,reason='Technician entered a fact') {
    model().audit.push({id:crypto.randomUUID(),at:now(),actor:actor(),field,before:clone(before??null),after:clone(after??null),reason,provenance:'TECHNICIAN_OBSERVATION'});
  }
  save = function () {
    const next=fingerprint(), previous=fingerprints.get(state.id);
    if (previous && previous!==next) {
      model().dependencyRevision++;
      invalidateValidationTruth('Installed configuration changed in CT-0061; verify dependent evidence again.');
      audit('configuration dependency',previous,next,'Configuration changed; prior observations remain historical evidence.');
    }
    fingerprints.set(state.id,next);
    originalSave();
  };
  function current(key) {
    const fp=fingerprint();
    return [...model().observations].reverse().find(o=>o.key===key && o.fingerprint===fp && (o.dependencyRevision||0)===model().dependencyRevision) || null;
  }
  function required() { return BASELINE_TESTS.filter(t=>['temp','rpm','vac','fp','initial'].includes(t.key) || (t.key==='afr' && b51().hasWideband)); }
  function gate() {
    const missing=required().filter(t=>!current(t.key));
    const safety=current('leaks');
    return { missing, safety, complete:missing.length===0 && !!safety,
      unsafe:safety?.value==='Observed', abnormal:required().filter(t=>current(t.key)?.interpretation==='ABNORMAL') };
  }
  function show(page) { model().page=page; b51().showJobs=false; workflow().showOverview=false; message=''; save(); renderGuided(); window.scrollTo(0,0); }
  setPhase=function(phase) {
    const mapping={vehicle:'vehicle',build:'build',review:'baseline',baseline:'baseline',diagnose:'stack',tune:'stack',verify:'stack',results:'overview'};
    model().page=mapping[phase]||'customer'; originalSetPhase(phase);
  };
  function field(group,key,label,type='text',options=null) {
    const source=group==='vehicle'?state.vehicle:group==='build'?state.build:model()[group];
    if (group==='build'&&['compressionRatio','camDuration050','camLift','camLsa'].includes(key)) type='number';
    const val=source?.[key]??'';
    const id='ct-'+group+'-'+key;
    const attr=`id="${id}" data-ct-group="${group}" data-ct-field="${key}"`;
    const control=options?`<select ${attr}><option value="">Not recorded</option>${options.map(v=>`<option ${val===v?'selected':''}>${esc(v)}</option>`).join('')}</select>`:type==='textarea'?`<textarea ${attr} rows="3">${esc(val)}</textarea>`:`<input ${attr} type="${type}" value="${esc(val)}" ${type==='number'?'step="any"':''}>`;
    return `<div ${type==='textarea'?'class="ct-wide"':''}><label for="${id}">${esc(label)}</label>${control}</div>`;
  }
  const notice=(text,kind='')=>`<div class="ct-notice ${kind}">${text}</div>`;
  function context() {
    const vh=state.vehicle;
    const engine=[vh.engineManufacturer,vh.engineSize,vh.engineFamily,vh.engineVariant].filter(nonempty).join(' · ') || vh.engineLabel;
    const values=[['Vehicle',vh.vehicleName],['Installed engine',engine],['Carburetor',vh.carb],['Transmission',state.build.transmission||vh.trans],['RO / Job',vh.jobNo],['Technician',model().customer.technician]];
    return `<div class="ct-context" aria-label="Current vehicle and repair order">${values.map(([k,v])=>`<div><small>${k}</small><strong>${esc(nonempty(v)?v:'Not recorded')}</strong></div>`).join('')}</div>`;
  }
  function customerPage() {
    return `<div class="ct-fields">${field('customer','name','Customer / business')}${field('vehicle','jobNo','RO / Job number')}${field('customer','contact','Contact information')}${field('customer','technician','Current technician')}${field('customer','dateIn','Date in','date')}${field('customer','intent','Job intent','text',['Diagnose a concern','Establish baseline','Tune installed combination','Verify previous work'])}${field('customer','complaint','Customer complaint / work requested','textarea')}</div>
      <h2>Previous work & documents</h2><p class="ct-intro">Returning visits use the vehicle’s known configuration. Measurements for this visit must be recorded again.</p>
      <button class="secondary" data-ct-home>View vehicles & previous repair orders</button>
      <details class="ct-domain"><summary>Build sheet / source references</summary>${notice('Document ingestion is not connected in this milestone. Record a document reference or technician transcription; no document contents are inferred.')}<div class="ct-fields">${field('customer','documentReference','Document name / reference')}${field('customer','documentNotes','Technician transcription / source notes','textarea')}</div></details>`;
  }
  function vehiclePage() {
    const fragment=document.createElement('div'); fragment.innerHTML=vehiclePhaseHTML();
    fragment.querySelectorAll('.guided-actions,.guided-kicker,.guided-title,.b51-question').forEach(e=>e.remove());
    fragment.querySelector('[data-vehicle-field="jobNo"]')?.parentElement.remove();
    return `<h2>Chassis identity</h2>${fragment.innerHTML}<h2>Installed engine</h2>${b51EngineHTML()}<h2>Drivetrain & vehicle load</h2><div class="ct-fields">${field('vehicle','vin','VIN (chassis evidence only)')}${field('vehicle','trans','Transmission type','text',['Automatic','Manual','Other / Custom'])}${field('build','transmission','Installed transmission / model')}${state.vehicle.trans==='Automatic'?field('build','converterStall','Converter stall, RPM (if known)','number'):''}${field('build','rearGear','Rear axle ratio (if known)','number')}${field('build','tireDiameter','Tire diameter, inches (if known)','number')}</div>`;
  }
  const domains=[
    ['fuel','Fuel system',[['fuelDelivery','Pump / regulator / plumbing']],['fuel-delivery']],
    ['engine','Engine build',[['compressionRatio','Compression ratio'],['rotatingAssembly','Rotating assembly']],[]],
    ['heads','Heads / valvetrain',[['cylinderHeads','Cylinder head identity'],['intakePattern','Cylinder-head / intake pattern'],['camshaft','Camshaft identity'],['camDuration050','Duration at 0.050 in'],['camLift','Cam lift, inches'],['camLsa','Lobe separation, degrees'],['valvetrainType','Valvetrain type']],['cylinder-head','camshaft','valvetrain']],
    ['induction','Induction',[['intake','Intake notes']],['carburetor','intake-manifold']],
    ['ignition','Ignition',[['ignition','Ignition system']],['ignition']],
    ['exhaust','Exhaust',[['exhaustNotes','Exhaust / packaging notes']],['exhaust']],
    ['power','Power adders',[['powerAdders','Installed power adder / configuration']],[]],
    ['monitor','AFR monitoring',[],[]]
  ];
  function buildPage() {
    const m=model();
    return notice('Collapsed sections mean “not reviewed,” not verified stock. Record stock or modified status from an identified source. Compatibility remains separate from performance suitability.')+
      domains.map(([id,label,fields,categories])=>`<details class="ct-domain" data-ct-domain="${id}" ${m.domains[id]?'open':''}><summary>${label}<small>${esc(m.configuration['status-'+id]||'Not reviewed')}</small></summary><div class="ct-fields">${field('configuration','status-'+id,'Configuration evidence','text',['Technician reports stock — unverified','Technician reports modified','Unknown'])}${fields.map(([key,label])=>field('build',key,label)).join('')}</div>${categories.map(c=>`<h3>${esc(c.replaceAll('-',' '))}</h3>${componentSearchHTML(c)}`).join('')}${id==='monitor'?`<label><input type="checkbox" data-wideband ${b51().hasWideband?'checked':''}> Wideband is installed and available for this visit</label>`:''}</details>`).join('');
  }
  function selectedCarb() {
    return componentRecordById(state.build.componentSelections?.carburetor) || b51CarbCatalog().find(c=>norm(c.partNumber)===norm(state.vehicle.carb));
  }
  function configurationPage() {
    const carb=selectedCarb(),spec=carb?.technicalSpecifications||{};
    const known=carb && carb.verificationStatus==='VERIFIED';
    return `<h2>Carburetor as received</h2>${known?notice(`<strong>${esc(carb.manufacturer)} ${esc(carb.model)} · ${esc(carb.partNumber)}</strong><br>Catalog identity: ${esc(spec.secondaryType||'Unknown')} secondaries; ${esc(spec.chokeType||'Unknown')} choke. Manufacturer identification does not verify today’s settings.`):notice('Exact carburetor identity is unverified. Identify it under Modifications / Engine Build to reveal supported component-specific questions.','attention')}
      <button class="secondary" data-ct-page="build">Identify components</button>
      <div class="ct-fields" style="margin-top:22px">${known && spec.chokeType==='Manual'?field('configuration','manualChoke','Manual choke linkage / as-found position'):''}${known && spec.secondaryType==='Vacuum'?field('configuration','vacuumSecondary','Vacuum-secondary spring / diaphragm identification'):''}${field('configuration','carbChanges','Known carburetor calibration changes / source','textarea')}</div>
      ${notice('Manufacturer stock calibration is not supplied by the current catalog. Jet sizes, float dimensions and adjustment targets remain unknown until supported by an exact component source.')}
      <details class="ct-domain"><summary>Ignition & fuel-system settings</summary><div class="ct-fields">${field('configuration','advanceSetup','Vacuum / mechanical advance configuration')}${field('configuration','regulatorSetting','As-found regulator setting / source')}${field('configuration','otherSettings','Other settings as found — identify component and source','textarea')}</div></details>`;
  }
  function baselinePage() {
    const g=gate();
    return notice(g.complete?(g.unsafe?'Evidence recorded; an observed fuel leak prevents live testing.':`Required evidence recorded. ${g.abnormal.length} result(s) outside the CarbTune starting window remain work to investigate.`):`${g.missing.length} measurement(s) ${g.safety?'':'and fuel-leak inspection '}await current verification. Opening later pages never marks this gate complete.`,g.unsafe?'fault':g.complete?'verified':'attention')+
      `<h2>Test conditions</h2><p class="ct-intro">Use a safe stationary setup, warm stabilized operation and suitable instruments. Each reading retains its recorded conditions. Review the procedure before recording; do not perform live tests with an observed fuel leak.</p>
      <div class="ct-measure"><label for="ct-leaks">Fuel-leak inspection — technician observation</label><select id="ct-leaks"><option value="">Not checked</option><option>None observed</option><option>Observed</option></select><button data-ct-record-safety style="margin-top:12px">Record inspection</button>${g.safety?notice(`${esc(g.safety.value)} · ${esc(g.safety.at)}`,g.unsafe?'fault':''):''}</div>`+
      required().map(t=>{
        const o=current(t.key),past=[...model().observations].reverse().find(o=>o.key===t.key),draft=model().drafts[t.key]||{};
        return `<section class="ct-measure" data-ct-measure="${t.key}"><h3>${esc(t.name)} <small>${esc(t.unit)}</small></h3>
          <p><strong>Projected starting envelope · CarbTune inference:</strong> ${esc(t.target)}. Exact manufacturer requirements take precedence; this is not a verified specification for the installed combination.</p>
          <details><summary>Procedure & required conditions</summary><p>${esc(t.how)} ${esc(t.more)}</p></details>
          ${o?notice(`${esc(o.value)} ${esc(t.unit)} · ${o.interpretation==='ABNORMAL'?'Verified observation outside starting envelope':'Recorded observation'} · ${esc(o.conditions)}`):past?notice('A prior reading exists but its configuration dependency changed. Record a fresh observation.','attention'):''}
          <div class="ct-fields"><div><label for="ct-value-${t.key}">Measured value (${esc(t.unit)})</label><input id="ct-value-${t.key}" type="number" step="${t.step||'any'}" value="${esc(draft.value??o?.value??'')}" ${g.unsafe?'disabled':''}></div><div><label for="ct-condition-${t.key}">Actual test conditions / instrument</label><input id="ct-condition-${t.key}" value="${esc(draft.condition||'')}" placeholder="Temperature, RPM, advance state, gauge…" ${g.unsafe?'disabled':''}></div><button data-ct-record="${t.key}" ${g.unsafe?'disabled':''}>Record reading</button></div>
          ${past?`<label for="ct-reason-${t.key}" style="margin-top:12px">Reason for replacement / repeat reading</label><input id="ct-reason-${t.key}" value="${esc(draft.reason||'')}" placeholder="Prior observations remain in the audit history">`:''}</section>`;
      }).join('');
  }
  function stackPage() {
    const g=gate(),m=model(),fp=current('fp');
    const pressureConcern=fp?.interpretation==='ABNORMAL';
    const objective=g.unsafe?'Resolve fuel-leak safety concern':!g.complete?'Establish valid as-found evidence':pressureConcern?'Verify fuel delivery against the installed carburetor requirement':'Review verified observations and remaining complaint';
    return `<span class="ct-state">${g.unsafe?'LIVE TESTING BLOCKED':g.complete?'AWAITING TECHNICAL VERIFICATION':'AWAITING BASELINE EVIDENCE'}</span><div class="ct-stack">
      <section><h2>Objective</h2><h3>${objective}</h3><p>${g.complete?'This worksheet is selected from this job’s current evidence. Further graph-driven diagnosis remains pending.':'Complete the required factual evidence before the system can choose a corrective objective.'}</p></section>
      <section><h2>Evidence</h2>${g.missing.length?`<p>Missing or stale: ${g.missing.map(t=>esc(t.name)).join(', ')}.</p>`:''}${!g.safety?'<p>Fuel-leak inspection is not recorded.</p>':`<p>Fuel-leak observation: ${esc(g.safety.value)}.</p>`}${fp?`<p>Fuel pressure: ${esc(fp.value)} PSI; ${esc(fp.conditions)}. ${pressureConcern?'Outside the CarbTune starting window; the exact manufacturer requirement is still needed.':'Recorded value alone does not establish loaded fuel-delivery capacity.'}</p>`:''}<p>Customer concern: ${esc(m.customer.complaint||'Not recorded')}.</p></section>
      <section><h2>Action</h2>${g.unsafe?'<p>Stop engine operation. Investigate and repair the observed leak safely before recording a new inspection.</p>':!g.complete?'<button data-ct-page="baseline">Enter missing evidence</button>':'<p>Identify the component-specific source and gather evidence for the proposed diagnostic direction. No automatic calibration adjustment is prescribed by this milestone.</p>'}<div class="ct-fields">${field('stack','action','Technician action / new evidence','textarea')}${field('stack','source','Source / procedure reference')}</div></section>
      <section><h2>Verification</h2><p>Repeat affected measurements under comparable conditions after a change. Configuration changes invalidate prior dependent conclusions while preserving their history.</p><button class="secondary" data-ct-page="baseline">Review / record verification evidence</button><div class="ct-fields" style="margin-top:16px">${field('stack','verificationNotes','Verification observations — not a pass declaration','textarea')}</div></section>
      <section><h2>Outcome</h2>${notice('Awaiting verified outcome. Technician notes do not mark a correction successful or a system stable. A verified outcome requires component requirements and comparable retest evidence. No successful correction has been established.','attention')}</section></div>`;
  }
  function evidenceHistory() {
    return `<details class="ct-domain"><summary>Observation & correction history <small>${model().observations.length} readings · ${model().audit.length} edits</small></summary><div class="ct-audit">${Object.entries(model().legacyBaseline||{}).filter(([,v])=>nonempty(v)).map(([key,value])=>`<article>Prior workflow measurement — ${esc(key)}: ${esc(value)}. Historical evidence; not verified for the current test conditions.</article>`).join('')}${[...model().observations].reverse().map(o=>`<article><strong>${esc(o.key)}: ${esc(o.value)}</strong><br>${esc(o.at)} · ${esc(o.actor)} · ${esc(o.conditions)}<br>${esc(o.reason||'Initial observation')} · Technician evidence</article>`).join('')}${[...model().audit].reverse().map(a=>`<article>${esc(a.field)} · ${esc(a.at)} · ${esc(a.actor)}<br>${esc(a.reason)}</article>`).join('')}</div></details>`;
  }
  function overviewPage(report=false) {
    const m=model(),g=gate(),legacy=currentVerificationResult();
    return `<h2>${report?'Why the vehicle came in':'As found'}</h2><p>${esc(m.customer.complaint||'No customer complaint recorded for this visit.')}</p>
      <h2>Recorded findings</h2>${notice(g.complete?'Required as-found observations are present. This does not establish a completed tune.':'Required current evidence remains incomplete. The job outcome is unverified.','attention')}
      <ul>${required().map(t=>{const o=current(t.key);return `<li>${esc(t.name)}: ${o?`${esc(o.value)} ${esc(t.unit)} — technician measurement`:'Awaiting current reading'}</li>`}).join('')}</ul>
      <h2>Corrections & verification</h2><p>${esc(m.stack.action||'No action recorded in the new worksheet.')}</p><p>${esc(m.stack.verificationNotes||'No verification notes recorded.')}</p>
      ${state.tuneLog.length?`<details class="ct-domain"><summary>Carried-forward job change history</summary>${state.tuneLog.map(t=>`<p>${esc(t.parameter)}: ${esc(t.before??'Unknown')} → ${esc(t.after??'Unknown')} · ${esc(t.outcome||'Unverified')}</p>`).join('')}</details>`:''}
      <h2>Final configuration / as leaving</h2><p>${esc(m.configuration.otherSettings||'No as-leaving configuration has been verified by this milestone.')}</p>
      <h2>Remaining concerns & outcome</h2>${g.unsafe?notice('Observed fuel leak: live testing is blocked.','fault'):''}${notice('Tuning outcome awaiting verification. The report must not imply success because the technician opened this page.','attention')}
      <p>${legacy?'A current legacy verification record exists and remains available in job history; no new repair conclusion is inferred.':'No current passing repair verification is available.'}</p>
      ${state.requiredActions.filter(a=>!['Completed','Not Needed'].includes(a.status)).map(a=>notice(esc(a.title),'attention')).join('')}
      ${report?`<button class="secondary" data-ct-print>Print factual report</button> <button disabled title="A verified terminal outcome is required">Finalize — awaiting verified outcome</button><p class="ct-intro" style="margin-top:14px">Finalization is reserved for a verified terminal outcome. This workflow foundation does not yet calculate one.</p>`:evidenceHistory()}`;
  }
  const views={customer:customerPage,vehicle:vehiclePage,build:buildPage,configuration:configurationPage,baseline:baselinePage,stack:stackPage,overview:()=>overviewPage(false),report:()=>overviewPage(true)};
  renderGuided=function () {
    if (!$id('guidedCard')) return;
    b51(); const m=model(); if (!fingerprints.has(state.id)) fingerprints.set(state.id,fingerprint());
    const home=b51().showJobs, page=pages.find(p=>p[0]===m.page), index=pages.indexOf(page),g=gate();
    const locked=!!state.results.completed;
    const content=(state.id==='demo-001'?notice('Sample job / demonstration data. Start a new repair order for an actual customer vehicle.'): '')+(home?b51JobsHomeHTML():views[m.page]());
    $id('guidedCard').innerHTML=`<div class="ct-top"><div><div class="ct-brand">CarbTune <span>Pro</span></div><small>CARBURETED / PERFORMANCE · DESIGN REVIEW</small></div><button data-ct-home>Jobs / Home</button></div>${context()}<div class="ct-layout"><nav class="ct-nav" aria-label="Job workspace"><p>Repair order workspace</p>${pages.map(([id,label],i)=>`<button data-ct-page="${id}" ${!home&&id===m.page?'aria-current="page"':''}><span class="ct-number">${i<5?'0'+(i+1):i===5?'↳':i===6?'◎':'↗'}</span><span>${label}${id==='baseline'?`<small>${g.complete?'Evidence recorded':'Awaiting evidence'}</small>`:''}</span></button>`).join('')}<hr><button class="ct-nav-extra" data-ct-home>Vehicles & previous work</button></nav><main class="ct-work"><article class="ct-sheet"><div class="ct-eyebrow">${home?'Shop workspace':index<5?`Static page ${index+1} / 5`:index===5?'Evidence-driven workspace':'Job record'}</div><h1>${home?'Vehicles & repair orders':page[1]}</h1><p class="ct-intro">${home?'Open an existing visit or start a new repair order for a returning vehicle.':page[2]}</p>${message?notice(esc(message),'attention'):''}${locked&&!home?notice('Completed historical visit — facts are read-only. Start a new job from Vehicles & previous work to record today’s evidence.'):''}<fieldset ${locked&&!home?'disabled':''}>${content}</fieldset><div class="ct-footer">${!home&&index>0?`<button class="secondary" data-ct-page="${pages[index-1][0]}">Back</button>`:'<button class="secondary" data-action="new-job">New Job</button>'}${!home&&index<pages.length-1?`<button data-ct-page="${pages[index+1][0]}">Open ${index<4?'Page '+(index+2):pages[index+1][1]}</button>`:''}<button class="danger" data-action="delete-active-job">Delete Job</button></div></article></main></div>`;
    $id('guidedCard').querySelectorAll('input:not([aria-label]),select:not([aria-label]),textarea:not([aria-label])').forEach((el,i)=>{
      if (el.id && $id('guidedCard').querySelector(`label[for="${el.id}"]`)) return;
      const label=el.parentElement.querySelector('label')?.textContent || el.placeholder || el.dataset.componentSearch || 'Component information';
      el.setAttribute('aria-label',label.trim());
    });
    if (locked&&!home) {
      const print=$id('guidedCard').querySelector('[data-ct-print]');
      if (print) $id('guidedCard').querySelector('.ct-footer').prepend(print);
    }
    document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen==='guided'));
    const nav=$id('guidedCard').querySelector('.ct-nav'),active=nav.querySelector('[aria-current="page"]');
    if (innerWidth<=700&&active) nav.scrollLeft=Math.max(0,active.offsetLeft-nav.offsetLeft-12);
  };
  // Capture at window before legacy handlers so CT-0061 writes are evidence-based.
  window.addEventListener('click',e=>{
    const dependency=e.target.closest('[data-identify-dependency]');
    if (dependency) {
      e.preventDefault();e.stopImmediatePropagation();
      const key=dependency.dataset.identifyDependency;
      if (key==='vehicle'||key==='engine') {show('vehicle');return;}
      model().domains[key==='heads'||key==='valvetrain'?'heads':'induction']=true;
      show('build');return;
    }
    const target=e.target.closest('[data-ct-page],[data-ct-home],[data-ct-record],[data-ct-record-safety],[data-ct-print]');
    if (!target) return;
    e.preventDefault();e.stopImmediatePropagation();
    if (target.dataset.ctPage) {show(target.dataset.ctPage);return;}
    if (target.hasAttribute('data-ct-home')) {b51().showJobs=true;save();renderGuided();return;}
    if (target.hasAttribute('data-ct-print')) {window.print();return;}
    if (state.results.completed) return;
    const key=target.dataset.ctRecord || 'leaks',t=BASELINE_TESTS.find(t=>t.key===key);
    const raw=key==='leaks'?$id('ct-leaks').value:$id('ct-value-'+key).value;
    const conditions=key==='leaks'?'Stationary fuel-leak inspection':$id('ct-condition-'+key).value.trim();
    const reason=key==='leaks'?'New fuel-leak inspection':$id('ct-reason-'+key)?.value.trim();
    const past=[...model().observations].reverse().find(o=>o.key===key);
    const value=key==='leaks'?raw:Number(raw);
    let error=!raw?'Enter an observation.':!conditions?'Record actual test conditions and instrument.':past&&key!=='leaks'&&!reason?'Give a reason for the repeat / corrected reading.':t?b51ValidateMeasurement(t,value):null;
    if (key!=='leaks' && gate().unsafe) error='Resolve and re-inspect the observed fuel leak before live testing.';
    if (error) {message=error;renderGuided();return;}
    const observation={id:crypto.randomUUID(),key,value,conditions,reason:reason||'Initial reading',actor:actor(),at:now(),fingerprint:fingerprint(),dependencyRevision:model().dependencyRevision,replaces:past?.id||null,provenance:key==='leaks'?'TECHNICIAN_OBSERVATION':'TECHNICIAN_MEASURED_RESULT',interpretation:t&&testResult(t,value).kind==='bad'?'ABNORMAL':'RECORDED'};
    model().observations.push(observation);
    delete model().drafts[key];
    // Keep legacy measurements readable, without rewriting any historical snapshot.
    if (t) state.baseline[key]=value;
    invalidateValidationTruth('New technician evidence recorded; conclusions require reassessment.');
    save(); message='Observation saved with conditions and provenance.'; renderGuided();
  },true);
  window.addEventListener('input',e=>{
    const match=e.target.id?.match(/^ct-(value|condition|reason)-(.+)$/);
    if (!match||state.results.completed) return;
    model().drafts[match[2]] ||= {};
    model().drafts[match[2]][match[1]]=e.target.value;
    save();
  },true);
  window.addEventListener('change',e=>{
    const input=e.target.closest('[data-ct-field]'); if (!input) return;
    e.stopImmediatePropagation(); if (state.results.completed) return;
    const group=input.dataset.ctGroup,key=input.dataset.ctField,source=['vehicle','build'].includes(group)?state[group]:model()[group];
    const value=input.type==='number'?(input.value===''?null:Number(input.value)):input.value;
    if (group==='vehicle' && key==='jobNo' && jobs.some(j=>j.id!==state.id&&norm(j.vehicle?.jobNo)===norm(value)&&nonempty(value))) {
      message='That RO / Job number is already in use. Choose a different number.';renderGuided();return;
    }
    audit(group+'.'+key,source[key],value);source[key]=value;
    if (group==='vehicle'&&key==='jobNo') b51ReserveJobNumber(0,value);
    save();renderGuided();
  },true);
  // Reused selectors keep their existing compatibility and persistence handlers.
  document.addEventListener('change',e=>{
    if (e.target.matches('[data-b51-engine]')) {
      const vh=state.vehicle;
      vh.engineLabel=[vh.engineManufacturer,vh.engineSize,vh.engineFamily,vh.engineVariant].filter(nonempty).join(' · ');
      const match=ENGINE_CATALOG.find(x=>x.manufacturer===vh.engineManufacturer&&x.size===vh.engineSize&&x.family===vh.engineFamily&&x.variant===vh.engineVariant);
      vh.cid=match?.cid??null;save();renderGuided();
    }
  });
  document.addEventListener('toggle',e=>{
    const d=e.target;if(d.matches?.('[data-ct-domain]')) {model().domains[d.dataset.ctDomain]=d.open;}
  },true);
  window.CarbTuneRedesign={gate:()=>clone(gate()),current:key=>clone(current(key)),navigate:show};
  renderGuided();
})();
