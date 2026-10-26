/** Opt-in developer-only vendor of Khronos Fox. Never fetch during gameplay.
 * Pinning to Git blob SHA protects against altered binaries, including redirects.
 */
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {COMPANION_SOURCE} from '../src/animated-companion-manifest.js';
const dir=resolve('public/assets/companions'),file=join(dir,'fox.glb');
const gitSha=(bytes)=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
await mkdir(dir,{recursive:true});
let data;
try{data=await readFile(file);}catch{}
if(!data||data.length!==COMPANION_SOURCE.size||gitSha(data)!==COMPANION_SOURCE.sha){
 const url=`https://raw.githubusercontent.com/${COMPANION_SOURCE.repo}/${COMPANION_SOURCE.revision}/${COMPANION_SOURCE.path}`;
 const result=await fetch(url,{signal:AbortSignal.timeout(35000),redirect:'error'});
 if(!result.ok)throw new Error(`Khronos asset download failed: ${result.status}`);
 data=Buffer.from(await result.arrayBuffer());
 if(data.length!==COMPANION_SOURCE.size||gitSha(data)!==COMPANION_SOURCE.sha||data.toString('ascii',0,4)!=='glTF')
  throw new Error('Fox GLB integrity verification failed. File was not installed.');
 const temp=file+'.tmp';await writeFile(temp,data);await rename(temp,file);
}
await writeFile(join(dir,'index.json'),JSON.stringify({version:1,revision:COMPANION_SOURCE.revision,sourceSha:COMPANION_SOURCE.sha,installed:true},null,2)+'\n');
console.log(`Installed locally: Khronos Fox (${data.length} verified bytes). See docs/ANIMATED_ASSET_LICENSE.md for full credits.`);
