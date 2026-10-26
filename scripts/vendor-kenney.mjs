/** Dev-time only CC0 model downloader. NO remote asset fetching in the running game.
 * Downloads models from a pinned commit and checks the exact Git blob hash.
 * Run voluntarily from a connected developer computer: npm run assets:fetch
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { KENNEY_ASSETS, KENNEY_SOURCE, assertKenneyCatalog } from '../src/asset-catalog.js';

const OUT = resolve('public/assets/kenney');
const chosen = process.argv.includes('--world') ? process.argv[process.argv.indexOf('--world') + 1] : null;
const worlds = {
  future:['skyline-a','skyline-b','skyline-c','skyline-spire','monorail','world-tree'],
  self:['sofa','bookcase','lamp','plant','books'],
  past:['table','bookcase','castle-tower','world-tree'],
  dungeon:['dungeon-column','dungeon-gate','dungeon-chest','rock-crystal','dungeon-orc'],
  mech:['turret','space-terminal','spaceship','console','rock-crystal']
};
if(chosen && !worlds[chosen])throw new Error(`Unknown world: ${chosen}`);
const selected = chosen ? new Set(worlds[chosen]) : null;
assertKenneyCatalog();
await mkdir(OUT,{recursive:true});
function gitBlobSha(bytes){return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');}
let installed = new Set();
try{
 const index=JSON.parse(await readFile(join(OUT,'index.json'),'utf8'));
 if(index.sourceCommit===KENNEY_SOURCE.commit && Array.isArray(index.models))installed=new Set(index.models);
}catch{}
for(const [id,source,sha,expectedBytes] of KENNEY_ASSETS){
 if(selected && !selected.has(id))continue;
 const dest=join(OUT,`${id}.glb`);
 try{
  const existing=await readFile(dest);
  if(existing.length===expectedBytes && gitBlobSha(existing)===sha){installed.add(id);console.log(`cached ${id}`);continue;}
 }catch{}
 const url=`https://raw.githubusercontent.com/${KENNEY_SOURCE.mirror}/${KENNEY_SOURCE.commit}/packs/${source}`;
 const response=await fetch(url,{signal:AbortSignal.timeout(25000),redirect:'error'});
 if(!response.ok)throw new Error(`Download failed for ${id}: ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length!==expectedBytes||gitBlobSha(bytes)!==sha||bytes.toString('ascii',0,4)!=='glTF')throw new Error(`Asset integrity check failed for ${id}`);
 const tmp=dest+'.tmp';await writeFile(tmp,bytes);await rename(tmp,dest);installed.add(id);
 console.log(`verified ${id} (${bytes.length} bytes)`);
}
await writeFile(join(OUT,'index.json'),JSON.stringify({version:1,license:'CC0-1.0',sourceCommit:KENNEY_SOURCE.commit,models:[...installed].sort()},null,2)+'\n');
console.log(`Installed ${installed.size} verified CC0 models, served only from the game origin.`);
