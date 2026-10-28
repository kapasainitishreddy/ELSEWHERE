import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('default startup cannot enable a cloud backend without an explicit alternate command',()=>{
 const pkg=JSON.parse(load('package.json'));
 assert.equal(pkg.scripts.dev,'vite --host 127.0.0.1');
 assert.equal(pkg.scripts['dev:api'],'node server.mjs');
 assert.equal(pkg.scripts['dev:meta'],'node scripts/dev.mjs');
 const source=load('src/main.js');
 assert.match(source,/cloudEnabled=false/);
 assert.match(source,/window\.confirm\('Optional CLOUD MODE/);
 assert.match(source,/if\(cloudEnabled\)/);
 assert.ok(!/SpeechRecognition|webkitSpeechRecognition/.test(source));
});

test('web entry contains no external fonts/scripts and blocks cross-origin connections',()=>{
 const html=load('index.html');
 assert.ok(!/fonts\.googleapis|fonts\.gstatic|<script[^>]+https?:\/\//i.test(html));
 assert.match(html,/connect-src 'self'/);
 assert.match(html,/script-src 'self'/);
 const cache=load('public/sw.js');
 assert.match(cache,/url\.origin!==self\.location\.origin/);
 assert.match(cache,/url\.pathname\.startsWith\('\/api\/'\)/);
});

test('opt-in Meta request omits NPC memory, letter, dialogue and other branches',()=>{
 const main=load('src/main.js');
 const payload=main.match(/const body=\{cloudConsent:true,[\s\S]*?\}\};/);
 assert.ok(payload,'The remote request has one explicit allowlist');
 for(const field of ['letter:','conversation:','cast:','parallel:','private:','passphrase:'])assert.equal(payload[0].includes(field),false);
 const server=load('server.mjs');
 assert.match(server,/data\.cloudConsent===true/);
 assert.ok(!/raw\.letter|data\.history/.test(server),'Backend must ignore optional private payload fields');
});
test('consent revocation, restart, world travel and lock invalidate in-flight optional inference',()=>{
 const source=load('src/main.js');
 const vault=load('src/vault.js');
 assert.match(source,/const pendingCloudRequests=new Set\(\)/);
 assert.match(source,/pendingCloudRequests\.add\(controller\)/);
 assert.match(source,/function invalidateOptionalInference\(\)\{sessionEpoch\+\+;abortPendingRequests\(\);\}/);
 assert.match(source,/function reset\(\)[\s\S]*?invalidateOptionalInference\(\);cloudEnabled=false;localAiEnabled=false/);
 assert.match(source,/if\(cloudEnabled\)\{invalidateOptionalInference\(\);cloudEnabled=false/);
 assert.match(source,/if\(changed\)\{stopPresence\(\);abortPendingRequests\(\);\}/);
 assert.match(source,/sessionEpoch\+\+;abortPendingRequests\(\);cloudEnabled=false;localAiEnabled=false/);
 assert.match(source,/async function lock\(\)\{[\s\S]*?gate\.hidden=false;setGateBusy\(true\)[\s\S]*?document\.querySelector\('#app'\)\.inert=true;[\s\S]*?Promise\.race\(\[finalSave,[\s\S]*?vault\.lock\(\);/);
 assert.match(vault,/function lock\(\)\{lifecycle\+\+;key=null;salt=null;queue=Promise\.resolve\(\);\}/);
});
