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
assert.match(html, /Verified compatible for known engine context/);
assert.match(html, /Conditional compatibility/);
assert.match(html, /Incompatible chassis application/);
assert.match(html, /Insufficient information/);
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

console.log(`Build 51 structural checks passed (${inlineScripts.length} inline scripts validated).`);
