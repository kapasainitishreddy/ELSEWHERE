import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {COMPANION_SOURCE,validCompanionIndex,companionMoodDistance} from '../src/animated-companion-manifest.js';
const source=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('Khronos animated asset is pinned to a revision, SHA and attribution',()=>{
 assert.match(COMPANION_SOURCE.revision,/^[a-f0-9]{40}$/);
 assert.match(COMPANION_SOURCE.sha,/^[a-f0-9]{40}$/);
 assert.equal(COMPANION_SOURCE.size,162852);
 assert.match(COMPANION_SOURCE.license,/CC-BY-4\.0/);
 assert.match(COMPANION_SOURCE.attribution,/tomkranis/);
 assert.match(COMPANION_SOURCE.path,/Fox\.glb$/);
});
test('optional animated asset index cannot advertise unverified revisions',()=>{
 const okay={version:1,revision:COMPANION_SOURCE.revision,sourceSha:COMPANION_SOURCE.sha,installed:true};
 assert.equal(validCompanionIndex(okay),true);
 assert.equal(validCompanionIndex({...okay,revision:'latest'}),false);
 assert.equal(validCompanionIndex({...okay,installed:false}),false);
 assert.equal(validCompanionIndex({...okay,sourceSha:'a'.repeat(40)}),false);
});
test('animation states are bounded to real imported Survey Walk Run clips',()=>{
 assert.equal(companionMoodDistance(.3),'survey');
 assert.equal(companionMoodDistance(4),'walk');
 assert.equal(companionMoodDistance(15),'run');
 assert.equal(companionMoodDistance(NaN),'survey');
});
test('companion runtime only reads its own origin; external download is dev-only',async()=>{
 const runtime=await source('src/animated-companion.js'),installer=await source('scripts/vendor-animated.mjs');
 assert.match(runtime,/loader\.loadAsync\('\/assets\/companions\/fox\.glb'\)/);
 assert.match(runtime,/speed\*Math\.min\(dt,\.05\)/);
 assert.match(runtime,/THREE\.MathUtils\.clamp\(avatar\.position\.x/);
 assert.doesNotMatch(runtime,/https?:\/\/|raw\.githubusercontent\.com|\b(?:sendBeacon|localStorage)\b/);
 assert.match(installer,/gitSha\(data\)!==COMPANION_SOURCE\.sha/);
 assert.match(installer,/redirect:'error'/);
 const index=JSON.parse(await source('public/assets/companions/index.json'));
 assert.equal(index.installed,false,'Do not claim binary bundled without verification');
});
