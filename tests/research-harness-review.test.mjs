import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=x=>readFileSync(new URL('../'+x,import.meta.url),'utf8');
test('research harnesses are pinned development-only git submodules',()=>{
 const text=read('.gitmodules');
 assert.match(text,/google-research\/harness2\.git/);
 assert.match(text,/google-research\/rrsi\.git/);
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.scripts['review:source'],'node tools/review/run.mjs --source-only');
 assert.ok(!Object.keys(pkg.dependencies).some(x=>x.includes('harness2')||x.includes('rrsi')));
});
test('review script never reads secrets or certifies Stage One without a live run',()=>{
 const js=read('tools/review/run.mjs');
 assert.match(js,/NO-GO: stage-one Meta evidence/);
 assert.match(js,/Proven live Meta Model API or eligible open-weight call/);
 assert.match(js,/MODEL_API_KEY:''/);
 assert.doesNotMatch(js,/read\(['"]\.env/);
 assert.doesNotMatch(js,/fetch\s*\(/);
});
