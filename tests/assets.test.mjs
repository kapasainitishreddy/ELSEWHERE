import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {KENNEY_SOURCE,KENNEY_ASSETS,KENNEY_PLACEMENTS,assertKenneyCatalog} from '../src/asset-catalog.js';

const read=path=>readFileSync(new URL(path, import.meta.url),'utf8');

test('the optional Kenney 3D catalog is CC0, pinned and placement-complete',()=>{
 assert.equal(KENNEY_SOURCE.license,'CC0-1.0');
 assert.match(KENNEY_SOURCE.commit,/^[0-9a-f]{40}$/);
 assert.equal(assertKenneyCatalog(),KENNEY_ASSETS.length);
 assert.ok(KENNEY_ASSETS.length>=20);
 assert.deepEqual(Object.keys(KENNEY_PLACEMENTS).sort(),['dungeon','future','mech','past','self']);
});

test('all world HUD assets are actual local open-source SVGs',()=>{
 const icons=['orbit','swords','hourglass','bot','shield','lock-keyhole','sparkles','compass','volume-2','book-open','scan-eye','crosshair'];
 for(const name of icons){
  const svg=read(`../public/assets/icons/${name}.svg`);
  assert.match(svg,/^<svg /);assert.match(svg,/viewBox="0 0 24 24"/);
  assert.ok(!/(<script|onload=|javascript:|xlink:href=)/i.test(svg));
 }
 assert.match(read('../public/assets/icons/LICENSE-lucide.txt'),/ISC License/);
});

test('local GLB loader cannot request off-origin model URLs',()=>{
 const loader=read('../src/open-assets.js');
 assert.match(loader,/\/assets\/kenney\//);
 assert.doesNotMatch(loader,/raw\.githubusercontent|api\.github|kenney\.nl|fetch\(['"]http/);
 const source=read('../src/atmosphere.js');
 assert.match(source,/InstancedMesh/);assert.match(source,/BackSide/);
});

test('default game ships a valid empty allowlist with no unaudited GLB files',()=>{
 const index=JSON.parse(read('../public/assets/kenney/index.json'));
 assert.equal(index.license,'CC0-1.0');
 assert.equal(index.sourceCommit,KENNEY_SOURCE.commit);
 assert.deepEqual(index.models,[]);
});

test('installer requires SHA-1 git object verification and GLB binary magic',()=>{
 const script=read('../scripts/vendor-kenney.mjs');
 assert.match(script,/gitBlobSha/);assert.match(script,/expectedBytes/);assert.match(script,/glTF/);
 assert.match(script,/sourceCommit:KENNEY_SOURCE.commit/);
});
