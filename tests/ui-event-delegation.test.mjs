import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('only world navigation buttons intercept delegated UI clicks',()=>{
 const source=readFileSync(new URL('../src/ui.js',import.meta.url),'utf8');
 assert.match(source,/root\.dataset\.world=state\.world/);
 assert.match(source,/e\.target\.closest\('button\[data-world\]'\)/);
});
