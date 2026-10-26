/** Carefully selected Kenney CC0 low-poly models, pinned to a mirror commit and Git blob SHA.
 * No asset is ever loaded from the internet during gameplay: only /assets/kenney/.
 */
export const KENNEY_SOURCE = Object.freeze({
  project: 'Kenney CC0 game assets',
  mirror: 'Hidencod/tge-assets',
  commit: '7be9b573bc74f32ed766b44b3f46550d02ca83b5',
  original: 'https://kenney.nl/assets',
  license: 'CC0-1.0'
});

export const KENNEY_ASSETS = Object.freeze([
  // Named local GLB, original GitHub mirror relative path, Git blob SHA and file size.
  ['skyline-a', 'city-kit-commercial/low-detail-building-a.glb', '06f67ee309fa75379b87bf3ad4f1c8a5fc02c827', 25364],
  ['skyline-b', 'city-kit-commercial/low-detail-building-b.glb', '154a72960ae868189ad8e47f84ef597bfa8ae7d5', 27364],
  ['skyline-c', 'city-kit-commercial/low-detail-building-c.glb', 'edc6434291d3b0f88d0db97e4507ae32dbde58e2', 23308],
  ['skyline-spire', 'city-kit-commercial/building-skyscraper-e.glb', '48acc977235d2fab5979b1198bf89a08aa0bd28d', 112920],
  ['monorail', 'space-kit/monorail-traincargo.glb', '7eaf2f080f594c0d1e3abd16a201eeecc03cfcdc', 51296],
  ['space-terminal', 'space-kit/desk-computer.glb', '08b99d38c764c3a78a39d3337a98ed20497016bc', 6972],
  ['console', 'space-kit/desk-computerscreen.glb', 'c409162285e49564329e0f4bf2cbb9cbd54d915a', 8248],
  ['turret', 'space-kit/turret-double.glb', '087fbeceb538d0198a858f497597a463340ba6b6', 50484],
  ['spaceship', 'space-kit/craft-cargoa.glb', '58d0904bbf032230ae794ff0b2501bb378b48396', 18964],
  ['lamp', 'furniture-kit/lamproundfloor.glb', '69f7c9df4fb9e2fb327c59f3b20e8669faf7df0d', 6600],
  ['sofa', 'furniture-kit/loungesofalong.glb', '8816aabe08a41566ab1a64a7014a4f23ef407a41', 13112],
  ['books', 'furniture-kit/books.glb', '615aaa9632cf1b262c257f2cb7c208a6f199ab84', 6864],
  ['bookcase', 'furniture-kit/bookcaseopen.glb', '9a0cce7691e94277f3409719e9e68c910c25aa2c', 18020],
  ['table', 'furniture-kit/tableround.glb', '885fdcd356eff8cc379e306d7b3b1ef3c5ca7475', 6444],
  ['plant', 'furniture-kit/pottedplant.glb', '774d659a2d2be3f9af3fea78e13b2f250fdbb262', 7576],
  ['dungeon-chest', 'mini-dungeon/chest.glb', '04c69e7cefec4a34ada418856174bbcafa93ed69', 44768],
  ['dungeon-gate', 'mini-dungeon/gate.glb', 'eacdf4b5b1a7ec4205e33b20096cf6cc3e73a79a', 24864],
  ['dungeon-column', 'mini-dungeon/column.glb', 'b02503a9148449d579a13b7bd811c859d872b4bd', 22128],
  ['dungeon-potion', 'mini-dungeon/potion.glb', '50bf9da00efefc24259828b40b55021181cf4c21', 23720],
  ['dungeon-orc', 'mini-dungeon/character-orc.glb', '3fa9bef5969c24027e36bc50f50ca1cbce89a5cb', 208204],
  ['castle-gate', 'castle-kit/gate.glb', 'b259d854c195890e56a3b9e7fe453e29568035f4', 21424],
  ['castle-tower', 'castle-kit/tower-square.glb', '9a1107d39ad3a0ec2a5c49df97f4f92e873bf36f', 24116],
  ['rock-crystal', 'space-kit/rock-crystalslargea.glb', 'b880cffcf1a219b3c64d864a94f5befae445f14f', 26160],
  ['world-tree', 'castle-kit/tree-large.glb', '3a4b4defaba65f623e06be511c8d95e884b30e79', 28804],
]);

export const KENNEY_PLACEMENTS = Object.freeze({
  future: [
    ['skyline-a', -13, -13, 7, 0], ['skyline-b', -17, -5, 6, .5], ['skyline-spire', 15, -16, 12, -.1],
    ['monorail', 1, 8, 2.5, 1.1], ['world-tree', -12, 4, 3.0, .3], ['skyline-c', 14, -3, 6, -.5],
  ],
  self: [
    ['sofa', 2.1, -9, 1.5, -1.6], ['bookcase', -5.5, -10, 2.7, 0], ['lamp', 5, -8.7, 2.2, 0],
    ['plant', 6.3, -7.4, 1.5, 0], ['books', -1.7, -6.2, .65, .3]
  ],
  past: [
    ['table', -3.3, -5.8, 1.7, 0], ['bookcase', 8.2, -11.4, 2.6, .2],
    ['castle-tower', -17.5, -13.2, 6.0, .8], ['world-tree', 13.5, 1.5, 5, .2]
  ],
  dungeon: [
    ['dungeon-column', -4.8, -12, 4.4, 0], ['dungeon-column', 4.8, -12, 4.4, 0],
    ['dungeon-gate', 0, -17, 5.5, 0], ['dungeon-chest', 7.4, -6.8, 1.7, -.3],
    ['rock-crystal', -11, -5, 3.6, .9], ['dungeon-orc', 12, -10, 2.4, -1],
  ],
  mech: [
    ['turret', -10, -9, 2.8, .4], ['turret', 10, -9, 2.8, -.3],
    ['space-terminal', 6.8, -3.4, 1.8, 1.2], ['spaceship', 0, -19, 8.5, .15],
    ['console', -5.5, -3.8, 1.7, -1], ['rock-crystal', -17, -12, 3.4, 0]
  ],
});

export function assertKenneyCatalog(){
  const names = new Set();
  for (const [id,relative,sha,size] of KENNEY_ASSETS){
    if(names.has(id)||!/^[-a-z0-9]+$/.test(id)||!/^[-a-z0-9/]+\.glb$/.test(relative)||!(/^[a-f0-9]{40}$/.test(sha))||!Number.isInteger(size)||size<500)throw new Error(`Invalid CC0 asset manifest entry: ${id}`);
    names.add(id);
  }
  for(const placements of Object.values(KENNEY_PLACEMENTS))for(const [id,x,z,height,angle] of placements){
    if(!names.has(id)||![x,z,height,angle].every(Number.isFinite)||height<=0)throw new Error(`Invalid asset placement: ${id}`);
  }
  return names.size;
}
