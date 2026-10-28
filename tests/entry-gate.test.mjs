import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('HTML contains the complete unlock screen used by the runtime',()=>{
 const html=read('index.html');
 for(const id of ['vault-gate','vault-title','vault-form','vault-passphrase','vault-submit','vault-notice','guest-play','physics-play'])
   assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/type="password"/);
 assert.match(html,/minlength="10"/);
 assert.doesNotMatch(html,/<script[^>]+https?:\/\//);
});
test('guest demo is memory-only and cannot mutate the persistent vault',()=>{
 const code=read('src/main.js');
 assert.match(code,/if\(guestMode\)return Promise\.resolve\(true\)/);
 assert.match(code,/sessionEpoch\+\+;abortPendingRequests\(\);cloudEnabled=false;localAiEnabled=false/);
 assert.match(code,/try\{await vault\.save\(state\);\}catch\(error\)\{saveError=error;\}[\s\S]*?try\{await vault\.lock\(\);\}catch\(error\)\{saveError\?\?=error;\}/,'lock clears the active session and still locks the vault when saving fails');
 assert.match(code,/begin\(initialState\(\),\{guest:true\}\)/);
 assert.match(code,/if\(guestMode\)\{toast\('Guest runs are not saved or exported/);
 assert.match(code,/if\(guestMode\)\{toast\('Leave guest mode to import/);
 assert.match(code,/guestMode\?'GUEST · NOT SAVED':'LOCAL · ENCRYPTED'/);
});
test('one-click WebContainer launch does not expose the default local server',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.scripts.dev,'vite --host 127.0.0.1');
 assert.equal(pkg.scripts.play,'vite --host 0.0.0.0 --port 5173');
 assert.equal(JSON.parse(read('.stackblitzrc')).startCommand,'npm run play');
 assert.match(read('README.md'),/stackblitz\.com\/fork\/github\/kapasainitishreddy\/ELSEWHERE/);
});

test('the direct physics practice starts in cinematic mode without finishing story chapters',()=>{
 const main=read('src/main.js'),ui=read('src/ui.js'),world=read('src/worlds.js');
 assert.match(main,/if\(physicsPreview\)ui\.enterSandbox\(\)/);
 assert.match(ui,/enterSandbox\(\)\{journeyVisible=false;storyOpen=false;atlasOpen=false;focus=true;/);
 assert.match(world,/options\.spawnNearPhysics&&state\.world==='dungeon'/);
});
