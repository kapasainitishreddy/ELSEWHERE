import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Meta live probe requires deliberate opt-in and synthetic data',()=>{
 const source=read('tools/review/meta-live-probe.mjs'),pkg=JSON.parse(read('package.json'));
 assert.match(source,/process\.argv\.includes\('--live'\)/);
 assert.match(source,/await handler\(request,response\)/);
 assert.match(source,/cloudConsent:true,world:'self'/);
 assert.match(source,/result\.body\?\.provider==='Meta Model API'/);
 assert.doesNotMatch(source,/console\.log\(process\.env\.MODEL_API_KEY/);
 assert.equal(pkg.scripts['meta:probe'],'node tools/review/meta-live-probe.mjs');
});
