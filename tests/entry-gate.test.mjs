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
 assert.match(html,/ENTER YOUR POSSIBLE WORLDS/);
 assert.match(html,/Play the unsaved demo instantly[\s\S]*invent in 1889[\s\S]*2087/);
 assert.match(read('src/main.js'),/gateTitle\.textContent=vault\.present\(\)\?'UNLOCK YOUR PRIVATE WORLD':'ENTER YOUR POSSIBLE WORLDS'/);
 assert.doesNotMatch(html,/<script[^>]+https?:\/\//);
});
test('guest demo is memory-only and cannot mutate the persistent vault',()=>{
 const code=read('src/main.js');
 const vault=read('src/vault.js');
 assert.match(code,/if\(guestMode\)return Promise\.resolve\(true\)/);
 assert.match(code,/sessionEpoch\+\+;abortPendingRequests\(\);cloudEnabled=false;localAiEnabled=false/);
 assert.match(code,/async function lock\(\)\{[\s\S]*?gate\.hidden=false;setGateBusy\(true\)[\s\S]*?document\.querySelector\('#app'\)\.inert=true;[\s\S]*?Promise\.race\(\[finalSave,[\s\S]*?vault\.lock\(\);/,'lock blocks the private world immediately, bounds final persistence, then revokes the key');
 assert.match(code,/setTimeout\(\(\)=>\{timedOut=true;resolve\(false\);\},5000\)/,'a stalled storage operation must not hold the world open indefinitely');
 assert.match(vault,/function lock\(\)\{key=null;salt=null;queue=Promise\.resolve\(\);\}/,'vault key revocation must be synchronous');
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
