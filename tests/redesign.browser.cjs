const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.CARBTUNE_URL||'http://127.0.0.1:4173';
const shots=process.env.CARBTUNE_SCREENSHOT_DIR;
let count=0;
function check(value,description){assert.ok(value,description);count++;console.log('PASS '+description);}
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
    await page.goto(base,{waitUntil:'networkidle'});
    await page.evaluate(()=>{localStorage.clear();});
    await page.reload({waitUntil:'networkidle'});
    const nav=id=>page.locator(`.ct-nav [data-ct-page="${id}"]`).click();
    async function edit(group,key,value){const input=page.locator(`[data-ct-group="${group}"][data-ct-field="${key}"]`);await input.fill(value);await input.dispatchEvent('change');}
    check(await page.locator('body').evaluate(e=>e.classList.contains('ct61')),'redesign is default entry point');
    check(await page.locator('.ct-sheet h1').innerText()==='Customer & Repair Order','Page 1 opens as distinct customer/RO workspace');
    await edit('customer','name','Acceptance customer');
    await edit('customer','technician','Test technician');
    await edit('customer','complaint','Hesitation at light throttle');
    check((await page.locator('.ct-context').innerText()).includes('Test technician'),'persistent technician context comes from entered facts');
    const vehicleId=await page.evaluate(()=>state.vehicleRecordId);
    await nav('vehicle');
    const installedBefore=await page.evaluate(()=>JSON.stringify([state.vehicle.engineManufacturer,state.vehicle.engineFamily,state.vehicle.engineVariant]));
    await page.locator('[data-b51-vehicle="year"]').selectOption('1983');
    const makes=await page.locator('[data-b51-vehicle="make"] option').allTextContents();
    check(makes.includes('Ford'),'1983 has sourced manufacturers in redesigned chassis selector');
    await page.locator('[data-b51-vehicle="make"]').selectOption('Ford');
    const models=await page.locator('[data-b51-vehicle="model"] option').allTextContents();
    check(models.includes('Bronco')&&!models.includes('Firebird'),'year/make model relationships remain exact');
    await page.locator('[data-b51-vehicle="model"]').selectOption('Bronco');
    check(await page.evaluate(()=>JSON.stringify([state.vehicle.engineManufacturer,state.vehicle.engineFamily,state.vehicle.engineVariant]))===installedBefore,'chassis changes do not replace installed engine');
    check(await page.evaluate(()=>state.vehicleRecordId)===vehicleId,'vehicle service relationship remains stable');
    await nav('build');
    check(await page.locator('.ct-domain[data-ct-domain]').count()===8,'Page 3 exposes eight distinct progressive domains');
    await page.locator('[data-ct-domain="induction"] summary').click();
    await page.locator('[data-component-filter="carburetor"]').click();
    check(await page.locator('[data-component-filter="intake-manifold"]').getAttribute('aria-pressed')==='true','carburetor filtering does not change intake filtering');
    for(let i=0;i<2;i++){
      await page.locator('[data-custom-component="carburetor"]').click();
      check(await page.locator('#customComponentName').count()>0,'custom component entry opens');
      await page.locator('[data-custom-component="carburetor"]').click();
      check(await page.locator('#customComponentName').count()===0,'custom component entry closes');
    }
    await page.locator('[data-select-component="carburetor:holley:0-1850c"]').click();
    await nav('configuration');
    check(await page.locator('[data-ct-field="manualChoke"]').count()===1,'identified manual choke generates relevant as-found field');
    check(await page.locator('[data-ct-field="vacuumSecondary"]').count()===1,'identified vacuum secondary generates relevant as-found field');
    check((await page.locator('.ct-sheet').innerText()).includes('stock calibration is not supplied'),'missing manufacturer calibration remains explicit');
    await edit('configuration','manualChoke','Cable connected, fully open when warm');
    await nav('baseline');
    check(!(await page.evaluate(()=>CarbTuneRedesign.gate())).complete,'legacy measurements are not silently treated as newly verified');
    await nav('stack');
    check(!(await page.evaluate(()=>CarbTuneRedesign.gate())).complete,'opening Stack cannot override missing evidence');
    for(const label of ['Objective','Evidence','Action','Verification','Outcome'])check((await page.locator('.ct-stack').innerText()).toLowerCase().includes(label.toLowerCase()),'Stack includes '+label);
    await nav('baseline');
    await page.locator('#ct-leaks').selectOption('None observed');await page.locator('[data-ct-record-safety]').click();
    await page.locator('#ct-value-fp').fill('999');await page.locator('#ct-condition-fp').fill('Warm idle, gauge at inlet');await page.locator('[data-ct-record="fp"]').click();
    check(!(await page.evaluate(()=>CarbTuneRedesign.current('fp'))),'implausible pressure is rejected');
    check(await page.locator('#ct-value-fp').inputValue()==='999','implausible entry remains visible for correction');
    for(const [key,value] of Object.entries({temp:190,rpm:800,vac:16,fp:9,initial:12})){
      await page.locator('#ct-value-'+key).fill(String(value));
      await page.locator('#ct-condition-'+key).fill('Warm stable idle, Park, appropriate calibrated instrument; advance disconnected for timing');
      await page.locator(`[data-ct-record="${key}"]`).click();
    }
    let gate=await page.evaluate(()=>CarbTuneRedesign.gate());
    check(gate.complete&&gate.abnormal.length===1,'valid abnormal pressure satisfies evidence completion without an override');
    await nav('stack');
    check((await page.locator('.ct-stack').innerText()).includes('Verify fuel delivery'),'Stack objective responds to abnormal measured fuel pressure');
    check((await page.locator('.ct-stack').innerText()).includes('Awaiting verified outcome'),'Stack never invents a successful outcome');
    await edit('stack','action','Verified gauge identity; obtained carburetor source reference');
    await nav('overview');check((await page.locator('.ct-sheet').innerText()).includes('9 PSI'),'overview uses actual recorded evidence');
    await nav('report');check(await page.getByRole('button',{name:'Finalize — awaiting verified outcome'}).isDisabled(),'finalization cannot manually declare success');
    await page.reload({waitUntil:'networkidle'});
    check((await page.locator('.ct-sheet h1').innerText()).includes('Customer Report'),'page location persists across reload');
    check((await page.locator('.ct-context').innerText()).includes('Test technician'),'context persists across reload');
    const oldObservations=await page.evaluate(()=>JSON.stringify(state.redesign.observations));
    await nav('configuration');await edit('configuration','manualChoke','Cable inspection corrected');
    check(!(await page.evaluate(()=>CarbTuneRedesign.gate())).complete,'configuration change invalidates current evidence gate');
    check(await page.evaluate(()=>JSON.stringify(state.redesign.observations))===oldObservations,'dependency invalidation preserves prior observations verbatim');
    await edit('configuration','manualChoke','Cable connected, fully open when warm');
    check(!(await page.evaluate(()=>CarbTuneRedesign.gate())).complete,'reverting configuration cannot resurrect invalidated observations');
    await nav('baseline');
    await page.locator('#ct-value-fp').fill('6');await page.locator('#ct-condition-fp').fill('Warm stationary idle, same inlet gauge');
    await page.locator('[data-ct-record="fp"]').click();
    check(!(await page.evaluate(()=>CarbTuneRedesign.current('fp'))),'replacement evidence requires a reason');
    await page.locator('#ct-value-fp').fill('6');await page.locator('#ct-condition-fp').fill('Warm stationary idle, same inlet gauge');await page.locator('#ct-reason-fp').fill('Repeat after configuration review');await page.locator('[data-ct-record="fp"]').click();
    check((await page.evaluate(()=>state.redesign.observations.filter(o=>o.key==='fp'))).length===2,'corrected observation appends instead of overwriting');
    await page.locator('#ct-leaks').selectOption('Observed');await page.locator('[data-ct-record-safety]').click();
    check(await page.locator('[data-ct-record="rpm"]').isDisabled(),'observed fuel leak blocks live reading controls');
    await nav('stack');check((await page.locator('.ct-sheet').innerText()).includes('LIVE TESTING BLOCKED'),'Stack prioritizes observed safety evidence');
    check((await page.locator('.ct-stack').innerText()).includes('Stop engine operation'),'safety action takes precedence over missing measurement work');
    for(const width of [1440,820,390]){
      await page.setViewportSize({width,height:1000});
      for(const id of ['customer','vehicle','build','configuration','baseline','stack','overview','report']){
        await nav(id);
        check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${id} has no horizontal overflow at ${width}px`);
      }
      if(shots){fs.mkdirSync(shots,{recursive:true});await nav('customer');await page.screenshot({path:path.join(shots,`ct61-${width}.png`),fullPage:true});await nav('stack');await page.screenshot({path:path.join(shots,`ct61-stack-${width}.png`),fullPage:true});}
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(()=>{state.results.completed=true;save();renderGuided();});
    await nav('customer');
    check(await page.locator('[data-ct-field="name"]').isDisabled(),'completed historical job facts are read-only');
    await page.locator('.ct-top [data-ct-home]').click();
    const historical=await page.evaluate(()=>({id:state.id,observations:JSON.stringify(state.redesign.observations),snapshots:JSON.stringify(vehicleRecords.find(v=>v.id===state.vehicleRecordId).configurationSnapshots)}));
    await page.locator(`[data-new-job-vehicle="${vehicleId}"]`).click();
    check(await page.evaluate(()=>state.vehicle.jobNo)==='1','first numeric return-visit RO starts at 1');
    check(await page.evaluate(()=>state.redesign.observations.length)===0,'return visit does not copy prior live measurements');
    check((await page.locator('.ct-context').innerText()).includes('Not recorded'),'missing return-visit facts are not fabricated');
    check(await page.evaluate(id=>JSON.stringify(jobs.find(j=>j.id===id).redesign.observations),historical.id)===historical.observations,'return visit preserves prior observation history');
    check(await page.evaluate(({vehicleId,prior})=>JSON.stringify(vehicleRecords.find(v=>v.id===vehicleId).configurationSnapshots.slice(0,JSON.parse(prior).length))===prior,{vehicleId,prior:historical.snapshots}),'return visit preserves historical configuration snapshots');
    await edit('vehicle','jobNo','DEMO-001');
    check((await page.locator('.ct-sheet').innerText()).includes('already in use'),'manual duplicate RO receives a warning');
    check(await page.evaluate(()=>state.vehicle.jobNo)==='1','manual duplicate RO does not replace generated number');
    const id=await page.evaluate(()=>state.id);
    await page.locator('.ct-footer [data-action="delete-active-job"]').click();
    check(await page.locator('#deleteJobModal').getAttribute('aria-hidden')==='false','active workflow Delete Job opens existing confirmation');
    check(await page.evaluate(id=>jobs.some(j=>j.id===id),id),'job remains until confirmation');
    await page.locator('[data-action="confirm-delete-job"]').click();
    check(!(await page.evaluate(id=>jobs.some(j=>j.id===id),id)),'confirmed deletion removes only requested job');
    check((await page.locator('.ct-sheet h1').innerText()).includes('Vehicles & repair orders'),'deletion returns to Jobs/Home');
    await page.locator(`[data-new-job-vehicle="${vehicleId}"]`).click();
    check(await page.evaluate(()=>state.vehicle.jobNo)==='2','deleted numeric RO is never reused on the next visit');
    check(errors.length===0,'redesign browser reports no unexpected errors: '+errors.join(' | '));
    console.log(`CT-0061: ${count} assertions passed.`);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
