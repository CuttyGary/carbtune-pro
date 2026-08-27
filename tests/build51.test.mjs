import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .filter(script => script.trim());

assert.match(html, /Build 51\s*•\s*Guided Intelligence Workflow/);
assert.match(html, /const B51_PHASES=\['vehicle','build','review','baseline','diagnose','tune','verify','results'\]/);
assert.match(html, /Factory engine/);
assert.match(html, /Engine swap/);
assert.match(html, /Stock internally/);
assert.match(html, /VERIFIED COMPATIBLE/);
assert.match(html, /CONDITIONAL/);
assert.match(html, /INCOMPATIBLE/);
assert.match(html, /UNKNOWN/);
assert.match(html, /Compatible with this build only/);
assert.match(html, /componentFilters/);
assert.match(html, /componentQueries/);
assert.match(html, /cp\.code==='VERIFIED'/);
assert.match(html, /cylinder-head\/intake pattern is not identified/);
assert.match(html, /traditional SBC intake pattern does not fit Vortec heads/);
assert.match(html, /select the intake manifold to establish carburetor flange/);
assert.match(html, /workflow\(\)\.customCategory===category\?null:category/);
assert.match(html, /B51_JOB_SEQUENCE_KEY='carbtune\.job\.sequence\.v51'/);
assert.match(html, /function b51NextJobNumber/);
assert.match(html, /function b51ReserveJobNumber/);
assert.match(html, /Duplicate warning — creation paused/);
assert.match(html, /function b51JobsHomeHTML/);
assert.match(html, /data-resume-current/);
assert.match(html, /INITIAL_BASELINE/);
assert.match(html, /No measured snapshots exist yet\. CarbTune never fabricates graph points/);
assert.match(html, /TUNING NOT COMPLETE/);
assert.match(html, /Start New Tuning Session/);
assert.match(html, /data-action="delete-active-job"/);
assert.match(html, /function findDuplicatePairs/);
assert.match(html, /localStorage\.setItem\(KEY/);
assert.match(html, /localStorage\.setItem\(JOBS_KEY/);

for (const [index, script] of inlineScripts.entries()) {
  new vm.Script(script, { filename: `index-inline-${index + 1}.js` });
}

const knowledgeSource = fs.readFileSync(new URL('../data/knowledge-base.js', import.meta.url), 'utf8');
const knowledgeContext = { window: {} };
vm.runInNewContext(knowledgeSource, knowledgeContext, { filename: 'knowledge-base.js' });
const verifiedCarbs = knowledgeContext.window.CARB_TUNE_KNOWLEDGE.components
  .filter(component => component.category === 'carburetor' && component.verificationStatus === 'VERIFIED');
assert.equal(verifiedCarbs.length, 2);
assert.ok(verifiedCarbs.every(component => component.fitment.carburetorFlanges.includes('4150 square bore')));
assert.ok(verifiedCarbs.every(component => component.evidence.some(item => item.type === 'MANUFACTURER_VERIFIED_FACT')));

console.log(`Build 51 structural checks passed (${inlineScripts.length} inline scripts validated).`);
