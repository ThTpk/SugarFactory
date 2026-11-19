// Caneline, a toy sugar mill: the colours and small helpers the three model kits share, on top of the
// airport's style.js. Nothing here builds anything; it only fixes the look so wet end, dry end and yard read as one
// world. Blue + white on a lavender ground, yellow only on the working machines, green only on cane and trees,
// exactly as the airport, the plant and the site do.
import * as THREE from 'three';
import {TOY, toyMat, rbox, mesh} from '../airport-shared/style.js';

/** the colours the airport's palette has no entry for: cane, juice, sugar, the plant's steel */
export const MILL = {
  cane: '#86b354', // a fresh stalk: duller than a lawn green, so a big heap reads as cane and not as grass
  caneDeep: '#6fa23c', // its shaded side, and the body of a stacked heap
  caneCut: '#e8e2c0', // the pale cut end of a stalk
  caneDry: '#c9b273', // trash, dry leaf, the tops
  bagasse: '#dcc694', // the crushed fibre heap and the boiler feed
  juice: '#6d4a24', // raw juice, the darkest liquid
  clear: '#c08c3f', // clarified juice
  syrup: '#a86a22', // evaporated syrup
  massecuite: '#8d5a22', // the pan's boiling mass
  raw: '#e0b47a', // raw sugar crystals
  white: '#f5f1e4', // the white sugar that leaves the dryer
  tank: '#e3e8f4', // the pale vessel shells
  tankMid: '#d4dcee', // their bands, collars and the detail that has to sit between shell and shadow
  tankDeep: '#c4cfe6', // their shaded flank and the skirts
  yellowDeep: '#e0a02e', // the shaded side of a working machine's yellow, so all three kits shade alike
  steel: '#aab6d0', // walkways, frames, structure
  steelDeep: '#8d9bbb',
  pipe: '#9fb2d8', // the pipe runs between the vessels
  pipeHot: '#d9b7bd', // the steam lines: dusty, not salmon — a whole line in it has to sit back, not shout
  hot: '#ff8a3d', // the boiler's fire door and the furnace glow
  steam: '#ffffff',
  brick: '#cfd6ea', // the boiler house and the stack
  belt: '#2b3346', // conveyor rubber
  ink: '#1a2440', // feet, pads, grates and printed text: the kit's dark, matching TOY.navy
};

export const PI = Math.PI;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sat = (v) => clamp(v, 0, 1);
export const smooth = (v) => {
  const t = sat(v);
  return t * t * (3 - 2 * t);
};

/** a cylinder that casts and receives shadows, standing on y = 0 unless y says otherwise */
export function cyl(rTop, rBot, h, seg = 28, {x = 0, y = h / 2, z = 0, mat} = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** a lathed vessel from a [r, y] profile: dished bottoms and domed tops without a hand-built mesh */
export function lathe(profile, seg = 32, mat) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-3), y));
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, seg), mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** a straight pipe between two points, with a bevelled collar at each end */
export function pipe(a, b, r = 0.22, mat = toyMat(MILL.pipe, {rough: 0.45, metal: 0.1})) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const d = new THREE.Vector3().subVectors(B, A);
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 14), mat);
  body.castShadow = body.receiveShadow = true;
  body.position.copy(A).addScaledVector(d, 0.5);
  body.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  g.add(body);
  for (const p of [A, B]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.35, r * 1.35, r * 0.7, 14), mat);
    c.position.copy(p);
    c.quaternion.copy(body.quaternion);
    c.castShadow = true;
    g.add(c);
  }
  return g;
}

/**
 * an open steel walkway with a handrail, running along +x. The rails are deliberately chunky: at toy scale a
 * true-to-life 50 mm tube disappears, so they are drawn the way the airport's fences and the plant's guards are.
 * `bar` is the rail thickness, `post` the stanchion thickness.
 */
export function walkway(length, width = 1.4, y = 4.0, {rail = true, bar = 0.12, post = 0.13} = {}) {
  const g = new THREE.Group();
  const deck = toyMat(MILL.steel, {rough: 0.5, metal: 0.15});
  g.add(mesh(rbox(length, 0.12, width, 0.04), deck, 0, y, 0));
  if (rail)
    for (const s of [-1, 1]) {
      g.add(mesh(rbox(length, bar, bar, bar * 0.4), deck, 0, y + 1.0, (s * width) / 2));
      g.add(mesh(rbox(length, bar * 0.85, bar * 0.85, bar * 0.35), deck, 0, y + 0.55, (s * width) / 2));
      for (let x = -length / 2 + 0.4; x <= length / 2; x += 2.4) g.add(mesh(rbox(post, 1.0, post, post * 0.35), deck, x, y + 0.5, (s * width) / 2));
    }
  return g;
}

/**
 * a soft white plume: a stack of fading billows that drift and grow with t; pure in t.
 * `density` is the peak opacity of a billow as it leaves the vent (0.7 reads at map scale; lower it for a wisp).
 */
export function plume({n = 7, r = 1.1, rise = 7, spread = 1.4, seed = 1, density = 0.7} = {}) {
  const g = new THREE.Group();
  const balls = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), new THREE.MeshStandardMaterial({color: MILL.steam, roughness: 1, transparent: true, opacity: density, depthWrite: false}));
    m.renderOrder = 3;
    g.add(m);
    balls.push(m);
  }
  const set = (t, k = 1) => {
    g.visible = k > 0.01;
    if (!g.visible) return;
    for (let i = 0; i < n; i++) {
      const u = ((t * 0.22 + i / n + seed * 0.13) % 1 + 1) % 1;
      const s = r * (0.5 + 1.5 * u);
      balls[i].position.set(Math.sin((u + seed) * 5.3) * spread * u, rise * u, Math.cos((u + seed) * 4.1) * spread * u);
      balls[i].scale.setScalar(s);
      // fade in over the first slice as well as out: without it the smallest, lowest billow is the most opaque and
      // the whole plume reads as a solid white egg sitting on the vent
      balls[i].material.opacity = density * smooth(u / 0.15) * (1 - u) * k;
    }
  };
  set(0);
  return {group: g, set};
}

export {TOY, toyMat, rbox, mesh};
