// Caneline's dry end: where syrup becomes bagged sugar. The vacuum pans, the crystallisers, the
// centrifugal row, the rotary dryer, the sugar silo, the bagging line, the bag, the pallet and the boiler house, in
// exactly the toy airport / car plant / construction site kits' look (airport-shared/style.js,
// plant-shared/line.js, site-shared/machines.js), whose helper preamble this file carries its own copy of
//: toy proportions, generous bevels on every edge, matte paint with a soft clearcoat,
// dark glass, crisp printed signs. Blue frames and structure, pale MILL.tank shells, yellow only on the working
// parts (the centrifugal lids and baskets, the dryer's riding rings, the slide gates, the sewing head).
//
// Toy metres, y up. A machine's length runs along +x, its right side is +z, origin on the ground at its centre, so
// every builder here stands on the hall floor at y = 0. Nothing reaches above y = 12 except the boiler stack (18).
// Every builder is a pure function of its arguments and every setter a pure function of its input: no timers, no
// state carried between frames, no Math.random() outside a seeded helper, so the film may call them for any t in
// any order and get the same frame. Setters only ever touch their own objects, so setBoil and setStrike (and the six
// centrifugals) are independent and may run out of phase.
//
//   buildVacuumPan({number = '01'})
//       -> {group, setBoil(t, k), setStrike(k), topY (9.0), dia (6.6), valveY (1.30)}
//       A fat domed vessel 6.6 across and 9.0 tall on 4 blue legs that carry the cone-to-barrel ring at y = 2.84,
//       a yellow discharge valve under the cone at valveY, a sight glass up the front flank from y = 3.4 to 7.0,
//       and the vapour line out of the dome's flank and down the side.
//       setStrike(k): the massecuite in the sight glass, 0 empty .. 1 a full strike (so the pan reads as filling).
//       setBoil(t, k): t seconds runs the vapour plume off the dome top, k = 0 cold (no vapour) .. 1 on full boil.
//   buildCrystalliser({n = 3})
//       -> {group, setStir(a), troughs: [{z, axisY (2.1), rimY (3.0)}], length (11)}
//       n horizontal U-troughs side by side along z, 3.3 apart, each 11 long with a slow ribbon stirrer under an
//       open rim, a blue cover over the drive third, and a walkway at y = 3.2 down the far side of the bank. setStir(a): every ribbon turns a radians about its own axis (each trough
//       carries a fixed phase offset, so the bank never pulses as one).
//   buildCentrifugalRow({n = 6})
//       -> {group, setSpin(i, a), setCharge(i, k), setDischarge(i, k), platformY (1.4), topY (4.0),
//           units: [{x, chargeY (3.5), basketY (1.55)}], length}
//       n basket centrifugals on a steel platform at y = 1.4, 3.4 apart: a blue casing, a yellow lid ring, a yellow
//       slotted basket 2.4 across seen through the bore of both, top of the machine at y = 4.0, a massecuite header
//       pipe behind the row, and a sugar launder in front at z = 3.95 (rim y = 0.68) that each discharge chute
//       empties into, so the fall is never hidden under the deck.
//       setSpin(i, a): unit i's basket turns a radians. setCharge(i, k): 0 empty .. 1 the basket walled with
//       massecuite (k > 0.02 also shows the charge stream out of the chute). setDischarge(i, k): 0 nothing ..
//       1 a full fall of white sugar out of the bottom into the trough below. Each unit is independent.
//   buildRotaryDryer({length = 16})
//       -> {group, setDrum(a), setHot(t, k = 1), inletY (5.6), outletY (1.4), axisY (3.4), dia (3.0), length}
//       A blue drum 3.0 across on two trunnion pedestals, tilted 2 deg down toward +x, yellow riding rings and a
//       girth gear, a hot-air box at the inlet with a feed chute whose lip is at inletY, a discharge hood at the
//       outlet whose chute lip is at outletY. setDrum(a): the drum turns a radians about its own (tilted) axis.
//       setHot(t, k): k = 0 cold .. 1 the furnace glowing and a plume off the outlet hood; t seconds flickers both.
//   buildSugarSilo({d = 7, h = 9, label = 'A'})
//       -> {group, setLevel(k), outletY (1.4), topY (= h), dia (= d)}
//       A cone-bottomed silo on 6 blue legs, the cone mouth over a yellow slide gate at outletY, a nameplate on the
//       flank and a sight gauge beside it. setLevel(k): 0 empty .. 1 full on the gauge.
//   buildBaggingLine({length = 22})
//       -> {group, setBelt(d), bagAt(s), setFiller(k), beltY (0.70), length, stations: {filler, stitch, weigher},
//           rollerRun: {x0, x1}}
//       A weigh hopper and filling spout over a belt whose top is at y = 0.70 (the same as
//       plant-shared/line.js's buildToyRollerConveyor, so a bag hands straight over to one), a stitching portal, a
//       check-weigher and a 5 m roller run out to the palletiser (that very builder). setBelt(d): the belt and both
//       runs move d metres. bagAt(s): [x, y, z] on the belt s metres from the inlet end (place a bag's group there
//       and it stands on the belt). setFiller(k): 0 shut .. 1 a full fall of sugar out of the spout.
//   buildSugarBag({kind = 'white' | 'raw'}) -> THREE.Group
//       A 0.90 x 0.52 x 0.30 sack (x, y, z), soft and slumped, CANELINE and 50 kg NET printed on both faces, origin
//       at the centre of its base. Static and merged per material, so a clone costs 3 draw calls and no geometry.
//   buildSugarPallet({layers = 3, kind = 'white', seed = 1}) -> THREE.Group
//       plant-shared/plant.js's buildToyPallet (deck top y = 0.32) with 4 bags per layer, each layer laid across the
//       last and squashed to 0.26, so 3 layers top out at y = 1.10, and stretch wrap over the top layer.
//       seed only jitters the bags, deterministically.
//   buildBoilerHouse()
//       -> {group, setFire(t, k), setPlume(t, k), stackTop (18), feedY (6.0), roofY (9), dims}
//       A blue-and-white boiler building 14 x 18 (x by z) with its parapet at y = 9 and a roof monitor to 9.48, a
//       glowing barred fire door and a roller door on the +z face, a bagasse feed chute on the +x flank whose
//       hopper lip is at feedY, and the 2.6 m by 18 m stack on its north (-z) flank at z = -11.4.
//       setFire(t, k): k = 0 out .. 1 the door at full heat, t seconds flickers it. setPlume(t, k): the stack plume.
//
// Static parts are merged per material and cached per variant (`tpl`), so a second copy of a machine costs only draw
// calls; only the parts that move or that a setter recolours are separate meshes. Text uses Inter: build after
// document.fonts has loaded it (runSim does that before setup).
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {TOY, rbox, toyMat, labelTexture} from '../airport-shared/style.js';
import {MILL, lathe, pipe, walkway, plume} from './palette.js';
import {buildToyPallet} from '../plant-shared/plant.js';
import {buildToyRollerConveyor} from '../plant-shared/line.js';

const PI = Math.PI;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sat = (v) => clamp(v, 0, 1);
const smooth = (v) => {
  const t = sat(v);
  return t * t * (3 - 2 * t);
};
const V2 = (x, y) => new THREE.Vector2(x, y);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
/** a deterministic stream of numbers in [0, 1) for a seed: the only randomness in this file */
const rng = (seed) => {
  let s = Math.floor(seed * 104729 + 7);
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

/** the colours TOY and MILL have no entry for */
export const DRY_COLORS = {
  yellowDeep: '#e0a02e', // the inner face of a lid or a gate: one step down from TOY.yellow
  belt: '#2f3650', // the bagging belt's rubber
  text: '#1d2748', // printed text on a pale plate
  wrap: '#eef2fb', // the pallet's stretch wrap
  hopper: '#c9d3ea', // the weigh hopper's pale flank
};
const D = DRY_COLORS;

// ================================================================ materials
const paint = (color, rough = 0.5) => toyMat(color, {paint: true, rough});
let MM = null;
function mats() {
  if (MM) return MM;
  MM = {
    white: paint(TOY.white),
    panel: paint(TOY.panel),
    blue: paint(TOY.blue, 0.48),
    blueDeep: paint(TOY.blueDeep, 0.48),
    blueLight: paint(TOY.blueLight, 0.5),
    roof: paint(TOY.roof, 0.5),
    wall: paint(TOY.wall, 0.55),
    yellow: paint(TOY.yellow, 0.5),
    yellowDeep: paint(D.yellowDeep, 0.56),
    shade: toyMat(TOY.shade, {rough: 0.7}),
    ink: toyMat(TOY.navy, {rough: 0.62}),
    glass: toyMat(TOY.glass, {paint: true, rough: 0.12}),
    tank: paint(MILL.tank, 0.46),
    tankDeep: paint(MILL.tankDeep, 0.52),
    steel: toyMat(MILL.steel, {rough: 0.45, metal: 0.2}),
    steelDeep: toyMat(MILL.steelDeep, {rough: 0.5, metal: 0.2}),
    pipe: toyMat(MILL.pipe, {rough: 0.45, metal: 0.12}),
    pipeHot: toyMat(MILL.pipeHot, {rough: 0.5}),
    brick: toyMat(MILL.brick, {rough: 0.78}),
    mass: toyMat(MILL.massecuite, {paint: true, rough: 0.34}),
    syrup: toyMat(MILL.syrup, {paint: true, rough: 0.32}),
    sugar: toyMat(MILL.white, {rough: 0.72}),
    raw: toyMat(MILL.raw, {rough: 0.76}),
    bagasse: toyMat(MILL.bagasse, {rough: 0.9}),
    belt: toyMat(D.belt, {rough: 0.78}),
    hopper: paint(D.hopper, 0.5),
    wrap: new THREE.MeshPhysicalMaterial({color: D.wrap, roughness: 0.28, transparent: true, opacity: 0.26, clearcoat: 0.6, depthWrite: false}),
  };
  return MM;
}
/** a fresh emissive material, never cached: a setter mutates it, so every instance owns its own */
const glowMat = (color, emissive, k = 1, rough = 0.35) => new THREE.MeshStandardMaterial({color, roughness: rough, emissive: new THREE.Color(emissive), emissiveIntensity: k});

// ================================================================ textures
const TEX = new Map();
function canvasTex(key, w, h, draw, {repeat = false} = {}) {
  if (TEX.has(key)) return TEX.get(key);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  TEX.set(key, t);
  return t;
}
const DECALS = new Map();
/** a printed layer: the texture's alpha is the print, it never casts shadows */
function decalMat(tex, {rough = 0.5, opaque = false} = {}) {
  const key = tex.uuid + rough + opaque;
  if (DECALS.has(key)) return DECALS.get(key);
  const m = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: rough,
    transparent: !opaque,
    depthWrite: opaque,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
  });
  m.userData.noCast = true;
  DECALS.set(key, m);
  return m;
}
const FONT = 'Inter, "Segoe UI", system-ui, sans-serif';

/** a text plate: fg text, optional rounded bg, sized to the text */
function textTex(text, {fg = D.text, bg = null, weight = 800, px = 96, pad = 26} = {}) {
  const key = `txt|${text}|${fg}|${bg}|${weight}|${px}`;
  if (TEX.has(key)) return TEX.get(key);
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `${weight} ${px}px ${FONT}`;
  const W = Math.ceil(probe.measureText(text).width + pad * 2);
  const H = Math.ceil(px * 1.3 + pad);
  return canvasTex(key, W, H, (g) => {
    if (bg) {
      g.fillStyle = bg;
      g.beginPath();
      g.roundRect(0, 0, W, H, H * 0.22);
      g.fill();
    }
    g.fillStyle = fg;
    g.font = `${weight} ${px}px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, W / 2, H / 2 + px * 0.04);
  });
}
/** a two-line plate: a heavy title over a light sub, both centred, on a transparent canvas */
function signTex(title, sub, {fg = TOY.white, px = 118} = {}) {
  const key = `sign|${title}|${sub}|${fg}|${px}`;
  if (TEX.has(key)) return TEX.get(key);
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `800 ${px}px ${FONT}`;
  const w1 = probe.measureText(title).width;
  probe.font = `600 ${px * 0.44}px ${FONT}`;
  const w2 = sub ? probe.measureText(sub).width : 0;
  const W = Math.ceil(Math.max(w1, w2) + 90);
  const H = Math.ceil(px * (sub ? 1.95 : 1.4));
  return canvasTex(key, W, H, (g) => {
    g.fillStyle = fg;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `800 ${px}px ${FONT}`;
    g.fillText(title, W / 2, sub ? H * 0.37 : H / 2);
    if (sub) {
      g.globalAlpha = 0.82;
      g.font = `600 ${px * 0.44}px ${FONT}`;
      g.fillText(sub, W / 2, H * 0.74);
    }
  });
}

// ================================================================ geometry kit
const GEO = new Map();
const cg = (key, make) => {
  let g = GEO.get(key);
  if (!g) GEO.set(key, (g = make()));
  return g;
};
/** a rounded box; r defaults to a generous 20% of the smallest side */
function rb(w, h, d, r) {
  r = r ?? Math.min(w, h, d) * 0.2;
  r = Math.min(r, Math.min(w, h, d) / 2 - 1e-3);
  if (r < 0.006) return cg(`b|${w}|${h}|${d}`, () => new THREE.BoxGeometry(w, h, d));
  return rbox(w, h, d, r, 3);
}
const cylG = (r0, r1, h, seg = 20) => cg(`cy|${r0}|${r1}|${h}|${seg}`, () => new THREE.CylinderGeometry(r0, r1, h, seg));
const tubeG = (r0, r1, h, seg = 24, t0 = 0, t1 = PI * 2) => cg(`tu|${r0}|${r1}|${h}|${seg}|${t0}|${t1}`, () => new THREE.CylinderGeometry(r0, r1, h, seg, 1, true, t0, t1));
const sphere = (r) => cg(`sp|${r}`, () => new THREE.SphereGeometry(r, 18, 12));
const dome = (r) => cg(`dome|${r}`, () => new THREE.SphereGeometry(r, 20, 8, 0, PI * 2, 0, PI / 2));
const planeG = (w, h) => cg(`pl|${w.toFixed(3)}|${h.toFixed(3)}`, () => new THREE.PlaneGeometry(w, h));
/** a ring of rectangular section, bevelled, inside and out: a casing or a lid you can see through the bore of */
const annulusG = (ri, ro, h, b = 0.05, seg = 36) =>
  cg(`an|${ri}|${ro}|${h}|${b}|${seg}`, () => {
    const bb = Math.min(b, h / 2 - 1e-3, (ro - ri) / 2 - 1e-3);
    const p = [V2(ri, -h / 2), V2(ro - bb, -h / 2), V2(ro, -h / 2 + bb), V2(ro, h / 2 - bb), V2(ro - bb, h / 2), V2(ri, h / 2), V2(ri, -h / 2)];
    return new THREE.LatheGeometry(p, seg);
  });
/** a polygon with every corner rounded by r (or r[i]) */
function roundedPoly(pts, r) {
  const s = new THREE.Shape();
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const a = pts[(i - 1 + n) % n];
    const c = pts[(i + 1) % n];
    const ri = Array.isArray(r) ? r[i] : r;
    const da = a.clone().sub(p);
    const dc = c.clone().sub(p);
    const k = Math.min(ri, da.length() / 2, dc.length() / 2);
    const p1 = p.clone().addScaledVector(da.normalize(), k);
    const p2 = p.clone().addScaledVector(dc.normalize(), k);
    if (i === 0) s.moveTo(p1.x, p1.y);
    else s.lineTo(p1.x, p1.y);
    s.quadraticCurveTo(p.x, p.y, p2.x, p2.y);
  }
  s.closePath();
  return s;
}
/** a shape extruded `depth` along z (centred), every edge rounded by the bevel b */
function extrude(key, makeShape, depth, b = 0.12) {
  return cg(`ex|${key}|${depth}|${b}`, () => {
    const g = new THREE.ExtrudeGeometry(makeShape(), {
      depth: Math.max(0.002, depth - 2 * b),
      bevelEnabled: b > 0,
      bevelThickness: b,
      bevelSize: b,
      bevelSegments: 4,
      curveSegments: 20,
    });
    g.translate(0, 0, -(depth - 2 * b) / 2);
    return g;
  });
}
/** a shape drawn in the yz plane (shape x = -z, shape y = y) extruded `len` along x, centred on x = 0 */
function extrudeX(key, makeShape, len, b = 0.05) {
  return cg(`exx|${key}|${len}|${b}`, () => extrude(`yz|${key}`, makeShape, len, b).clone().rotateY(PI / 2));
}
/** a soft-edged cylinder (lathe with rounded rims), axis y, centred */
function rcylG(r0, r1, h, b = 0.06, seg = 28) {
  return cg(`rcyl|${r0}|${r1}|${h}|${b}|${seg}`, () => {
    const bb = Math.min(b, h / 2 - 1e-3, Math.min(r0, r1) - 1e-3);
    const pts = [V2(1e-4, -h / 2)];
    const arc = (cx, cy, a0, a1) => {
      for (let k = 0; k <= 4; k++) {
        const a = lerp(a0, a1, k / 4);
        pts.push(V2(cx + bb * Math.cos(a), cy + bb * Math.sin(a)));
      }
    };
    arc(r0 - bb, -h / 2 + bb, -PI / 2, 0);
    arc(r1 - bb, h / 2 - bb, 0, PI / 2);
    pts.push(V2(1e-4, h / 2));
    return new THREE.LatheGeometry(pts, seg);
  });
}
/** a lathed profile [[r, y]] as a cached geometry, for vessel shells merged into a template */
const latheG = (key, profile, seg = 36) =>
  cg(`la|${key}|${seg}`, () => new THREE.LatheGeometry(profile.map(([r, y]) => V2(Math.max(r, 1e-4), y)), seg));

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _d = new THREE.Vector3();
const KEEP = ['position', 'normal', 'uv'];
function prep(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const k of Object.keys(g.attributes)) if (!KEEP.includes(k)) g.deleteAttribute(k);
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  g.morphAttributes = {};
  g.clearGroups();
  return g;
}

/** collects transformed parts per material; merged() gives one geometry per material */
class Parts {
  constructor() {
    this.map = new Map();
  }
  put(mat, geo, m4) {
    const g = prep(geo);
    g.applyMatrix4(m4);
    if (!this.map.has(mat)) this.map.set(mat, []);
    this.map.get(mat).push(g);
    return this;
  }
  add(mat, geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    _e.set(rx, ry, rz);
    _q.setFromEuler(_e);
    return this.put(mat, geo, _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)));
  }
  /** a rounded box between two corners */
  ext(mat, x0, x1, y0, y1, z0, z1, r) {
    if (x1 < x0) [x0, x1] = [x1, x0];
    if (y1 < y0) [y0, y1] = [y1, y0];
    if (z1 < z0) [z0, z1] = [z1, z0];
    return this.add(mat, rb(x1 - x0, y1 - y0, z1 - z0, r), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  }
  /** the same box on both sides, z0..z1 and -z1..-z0 */
  pair(mat, x0, x1, y0, y1, z0, z1, r) {
    this.ext(mat, x0, x1, y0, y1, z0, z1, r);
    return this.ext(mat, x0, x1, y0, y1, -z1, -z0, r);
  }
  /** a cylinder along 'x', 'y' or 'z' */
  cyl(mat, r0, r1, h, x, y, z, axis = 'y', seg = 20) {
    const g = cylG(r0, r1, h, seg);
    if (axis === 'x') return this.add(mat, g, x, y, z, 0, 0, -PI / 2);
    if (axis === 'z') return this.add(mat, g, x, y, z, PI / 2, 0, 0);
    return this.add(mat, g, x, y, z);
  }
  /** a soft-edged cylinder along 'x', 'y' or 'z' */
  rcyl(mat, r0, r1, h, x, y, z, axis = 'y', b = 0.06, seg = 28) {
    const g = rcylG(r0, r1, h, b, seg);
    if (axis === 'x') return this.add(mat, g, x, y, z, 0, 0, -PI / 2);
    if (axis === 'z') return this.add(mat, g, x, y, z, PI / 2, 0, 0);
    return this.add(mat, g, x, y, z);
  }
  /** a round bar between two points */
  rod(mat, a, b, r = 0.05, seg = 10) {
    const A = V3(...a);
    const d = V3(...b).sub(A);
    const len = d.length();
    _q.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize());
    return this.put(mat, cylG(r, r, len, seg), _m.compose(A.addScaledVector(d, 0.5), _q, _s.set(1, 1, 1)));
  }
  /** a square bar with rounded edges between two points (frames, rails, ribbon flights) */
  bar(mat, a, b, t = 0.12, w = null) {
    const A = V3(...a);
    const d = V3(...b).sub(A);
    const len = d.length();
    _q.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize());
    return this.put(mat, rb(w ?? t, len + t, t, Math.min(w ?? t, t) * 0.4), _m.compose(A.addScaledVector(d, 0.5), _q, _s.set(1, 1, 1)));
  }
  /** a pin through a joint: a soft steel cylinder along z with a generous bevel */
  pin(x, y, z, r, len) {
    return this.rcyl(mats().steel, r, r, len, x, y, z, 'z', r * 0.3, 20);
  }
  /** a flat print of width w, height h facing +z, turned by ry */
  print(mat, w, h, x, y, z, ry = 0, rx = 0) {
    return this.add(mat, planeG(w, h), x, y, z, rx, ry, 0);
  }
  /** a text plate of height h, facing +z turned by ry */
  text(text, opts, h, x, y, z, ry = 0) {
    const tex = textTex(text, opts);
    const a = tex.image.width / tex.image.height;
    return this.print(decalMat(tex), h * a, h, x, y, z, ry);
  }
  /** a two-line sign of height h, facing +z turned by ry */
  sign(title, sub, opts, h, x, y, z, ry = 0) {
    const tex = signTex(title, sub, opts);
    const a = tex.image.width / tex.image.height;
    return this.print(decalMat(tex), h * a, h, x, y, z, ry);
  }
  /** a single-line label from style.js's labelTexture, height h, facing +z turned by ry */
  label(text, opts, h, x, y, z, ry = 0) {
    const tex = labelTexture(text, opts);
    const a = tex.image.width / tex.image.height;
    return this.print(decalMat(tex), h * a, h, x, y, z, ry);
  }
  /** a print of text on both sides of a body at +-z (s > 0 faces +z) */
  sides(fn, z) {
    for (const s of [-1, 1]) fn(s, s * z, s > 0 ? 0 : PI);
    return this;
  }
  merged() {
    return [...this.map].map(([mat, list]) => [mat, mergeGeometries(list, false)]);
  }
}

const TPL = new Map();
/** the static meshes of a model, built once per key and shared between copies */
function tpl(key, make, parent = new THREE.Group()) {
  let list = TPL.get(key);
  if (!list) {
    const P = new Parts();
    make(P);
    list = P.merged();
    TPL.set(key, list);
  }
  for (const [mat, geo] of list) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = !mat.userData.noCast && !mat.transparent;
    m.receiveShadow = true;
    parent.add(m);
  }
  return parent;
}
const part = (geo, mat, parent) => {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = !mat.transparent;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
};

// ================================================================ the dry end's own small kit
/**
 * A sight gauge: a pale strip with a dark frame and a column that fills it. Facing +z at (x, z), the column runs
 * from y0 to y1. Returns set(k): 0 empty .. 1 full. Pure in k, and it owns its own mesh.
 */
function gauge(parent, {x = 0, z = 0, y0 = 1, y1 = 4, w = 0.34, ry = 0, mat, label = null, dark = false}) {
  const M = mats();
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  parent.add(g);
  tpl(`gauge|${y0}|${y1}|${w}|${label}|${dark}`, (P) => {
    P.ext(dark ? M.steelDeep : M.ink, -w / 2 - 0.06, w / 2 + 0.06, y0 - 0.12, y1 + 0.12, -0.05, 0.05, 0.04);
    P.ext(dark ? M.glass : M.white, -w / 2, w / 2, y0 - 0.05, y1 + 0.05, 0.04, 0.09, 0.02);
    for (let k = 0; k <= 4; k++) {
      const y = lerp(y0, y1, k / 4);
      P.ext(dark ? M.steelDeep : M.ink, -w / 2 - 0.11, -w / 2 + 0.02, y - 0.03, y + 0.03, 0.02, 0.08, 0.012);
    }
    if (label) P.text(label, {px: 72}, 0.22, 0, y1 + 0.3, 0.06);
  }, g);
  const col = part(rb(w - 0.08, 1, 0.045, 0.02), mat ?? M.mass, g);
  const set = (k) => {
    const h = Math.max(0.001, (y1 - y0) * sat(k));
    col.scale.y = h;
    col.position.set(0, y0 + h / 2, 0.095);
    col.visible = k > 0.004;
  };
  set(0);
  return set;
}

/**
 * A falling stream: a tapered column from y0 down to y1 with a soft splash pad at the bottom. Returns set(k):
 * 0 nothing .. 1 the full fall. Pure in k.
 */
function fall(parent, {x = 0, z = 0, y0, y1, r = 0.3, mat, splash = true}) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  const h = y0 - y1;
  const body = part(cylG(r * 0.72, r, 1, 14), mat, g);
  body.scale.y = h;
  body.position.y = y1 + h / 2;
  const pad = splash ? part(rcylG(r * 1.45, r * 1.1, 0.2, 0.08, 20), mat, g) : null;
  if (pad) pad.position.y = y1 + 0.1;
  const set = (k) => {
    const s = smooth(k);
    g.visible = k > 0.02;
    if (!g.visible) return;
    body.scale.set(0.35 + 0.65 * s, h, 0.35 + 0.65 * s);
    if (pad) pad.scale.set(0.4 + 0.6 * s, 0.35 + 0.65 * s, 0.4 + 0.6 * s);
  };
  set(0);
  return set;
}

// ================================================================ the vacuum pan
const PAN = {dia: 6.6, topY: 9.0, legY: 2.84, coneY: 2.95, bodyY: 7.5, valveY: 1.3};

/** the pan's shell: the discharge cone, the tall barrel and the shallow dished dome, as one [r, y] profile */
function panProfile() {
  const R = PAN.dia / 2;
  const p = [[0.001, PAN.valveY], [0.46, PAN.valveY], [0.54, PAN.valveY + 0.16], [R - 0.06, PAN.coneY], [R, PAN.coneY + 0.2], [R, PAN.bodyY - 0.1]];
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (PI / 2);
    p.push([R * Math.cos(a) * (1 - 0.004 * i), PAN.bodyY + (PAN.topY - PAN.bodyY) * Math.sin(a)]);
  }
  return p;
}

export function buildVacuumPan({number = '01'} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = `vacuum-pan-${number}`;
  const R = PAN.dia / 2;
  // the shell: one lathed mesh (palette's lathe), the dominant form, so it stays a single draw call
  const shell = lathe(panProfile(), 40, M.tank);
  group.add(shell);
  tpl(`pan|${number}`, (P) => {
    // 4 blue legs on pads, straight up under the cone-to-barrel ring, tied by a ring beam at mid height
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const x = sx * 2.25;
        const z = sz * 2.25;
        P.ext(M.ink, x - 0.48, x + 0.48, 0, 0.11, z - 0.48, z + 0.48, 0.04);
        P.ext(M.blue, x - 0.33, x + 0.33, 0.06, PAN.legY, z - 0.33, z + 0.33, 0.11);
      }
    for (const sz of [-1, 1]) {
      P.ext(M.blueDeep, -2.4, 2.4, 1.52, 1.8, sz * 2.25 - 0.13, sz * 2.25 + 0.13, 0.06);
      P.ext(M.blueDeep, sz * 2.25 - 0.13, sz * 2.25 + 0.13, 1.52, 1.8, -2.4, 2.4, 0.06);
      P.bar(M.blueDeep, [sz * 2.25, 1.8, -2.25], [-sz * 2.25, 2.6, 2.25], 0.13);
    }
    // the cone's stiffening ring where it meets the barrel, a blue skirt band and a band under the dome
    P.rcyl(M.blue, R + 0.1, R + 0.1, 0.44, 0, PAN.coneY + 0.26, 0, 'y', 0.14, 36);
    P.rcyl(M.blueLight, R + 0.06, R + 0.06, 0.26, 0, PAN.bodyY - 0.3, 0, 'y', 0.09, 36);
    P.rcyl(M.tankDeep, R + 0.04, R + 0.04, 0.2, 0, PAN.coneY + 1.6, 0, 'y', 0.07, 36);
    // the discharge valve under the cone: a yellow body, a blue handwheel, a short outlet
    P.ext(M.yellow, -0.62, 0.62, 0.74, PAN.valveY + 0.06, -0.62, 0.62, 0.2);
    P.rcyl(M.yellowDeep, 0.36, 0.36, 0.26, 0, 0.66, 0, 'y', 0.08, 20);
    P.rcyl(M.blue, 0.4, 0.4, 0.11, 0.92, 1.04, 0, 'x', 0.04, 20);
    P.rod(M.steel, [0.58, 1.04, 0], [0.9, 1.04, 0], 0.07);
    P.rcyl(M.pipe, 0.3, 0.3, 0.34, 0, 0.5, 0, 'y', 0.08, 20);
    // the ladder up the back flank
    for (const sz of [-1, 1]) P.bar(M.steel, [-R - 0.14, 0.2, sz * 0.34], [-R - 0.14, PAN.bodyY - 0.2, sz * 0.34], 0.1);
    for (let y = 0.6; y < PAN.bodyY - 0.3; y += 0.46) P.rod(M.steelDeep, [-R - 0.16, y, -0.34], [-R - 0.16, y, 0.34], 0.045);
    // the nameplate on the front flank, bedded into the shell so the print stays flat
    P.ext(M.blue, -1.15, 1.15, 5.3, 6.2, R - 0.25, R + 0.02, 0.1);
    P.sign(`PAN ${number}`, 'Vacuum · 2 strikes/h', {}, 0.62, 0, 5.76, R + 0.04);
    // the vapour line off the dome's flank, down the side to the condenser, and the syrup inlet into the cone
    P.rcyl(M.pipe, 0.34, 0.34, 2.3, 3.5, 8.45, 0, 'x', 0.1, 18);
    P.rcyl(M.pipe, 0.34, 0.34, 6.5, 4.5, 5.2, 0, 'y', 0.1, 18);
    P.rcyl(M.pipeHot, 0.38, 0.38, 0.3, 4.5, 7.1, 0, 'y', 0.09, 18);
    P.rcyl(M.pipe, 0.26, 0.26, 1.6, -3.3, PAN.coneY + 1.1, 0, 'x', 0.07, 16);
    P.rcyl(M.pipe, 0.26, 0.26, 2.0, -4.0, PAN.coneY + 0.2, 0, 'y', 0.07, 16);
  }, group);
  // the vapour plume off the dome top, and the sight glass the strike shows in
  const pl = plume({n: 7, r: 0.62, rise: 2.6, spread: 0.7, seed: 3});
  pl.group.position.set(0, PAN.topY + 0.35, 0);
  group.add(pl.group);
  const setStrike = gauge(group, {x: 1.9, z: 2.76, y0: 3.4, y1: 7.0, w: 0.5, mat: M.mass, label: 'STRIKE'});
  const setBoil = (t, k = 1) => pl.set(t, sat(k));
  setBoil(0, 0);
  return {group, setBoil, setStrike, topY: PAN.topY, dia: PAN.dia, valveY: PAN.valveY};
}

// ================================================================ the crystallisers
const CRY = {len: 11, rOut: 1.25, axisY: 2.1, rimY: 3.0, pitch: 3.3, rRibbon: 0.68};

/** the U-trough's wall, drawn in the yz plane about the shaft axis and extruded along x */
function troughShape() {
  const ro = CRY.rOut;
  const ri = ro - 0.15;
  const top = CRY.rimY - CRY.axisY;
  const s = new THREE.Shape();
  s.moveTo(-ro, top);
  s.lineTo(-ro, 0);
  s.absarc(0, 0, ro, PI, PI * 2, false);
  s.lineTo(ro, top);
  s.lineTo(ri, top);
  s.lineTo(ri, 0);
  s.absarc(0, 0, ri, 0, PI, true);
  s.lineTo(-ri, top);
  s.closePath();
  return s;
}
/** one ribbon stirrer's flights and spokes, merged, centred on x = 0 and turning about x */
function ribbonGeo(len) {
  return cg(`ribbon|${len}`, () => {
    const M = mats();
    const P = new Parts();
    const rr = CRY.rRibbon;
    const n = Math.round(len / 0.26);
    const step = len / n;
    const turn = 0.5; // radians per step: about 3 full turns down an 11 m trough
    for (let i = 0; i < n; i++) {
      const a0 = i * turn;
      const a1 = (i + 1) * turn;
      const x0 = -len / 2 + i * step;
      const x1 = x0 + step;
      for (const ph of [0, PI]) {
        P.bar(M.yellow, [x0, rr * Math.cos(a0 + ph), rr * Math.sin(a0 + ph)], [x1, rr * Math.cos(a1 + ph), rr * Math.sin(a1 + ph)], 0.1, 0.34);
        if (i % 6 === 2) P.bar(M.steel, [x0, 0, 0], [x0, rr * Math.cos(a0 + ph), rr * Math.sin(a0 + ph)], 0.11);
      }
    }
    return mergeGeometries([...P.map.values()].flat(), false);
  });
}

export function buildCrystalliser({n = 3} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'crystalliser';
  const L = CRY.len;
  const troughs = [];
  const ribbons = [];
  const z0 = -((n - 1) * CRY.pitch) / 2;
  tpl(`cryst|${n}`, (P) => {
    for (let i = 0; i < n; i++) {
      const z = z0 + i * CRY.pitch;
      // the trough shell, a blue rim band, and A-frame legs
      P.add(M.tank, extrudeX(`trough`, troughShape, L, 0.05), 0, CRY.axisY, z, 0, 0, 0);
      for (const sz of [-1, 1]) P.ext(M.blue, -L / 2 - 0.06, L / 2 + 0.06, CRY.rimY - 0.22, CRY.rimY + 0.06, z + sz * CRY.rOut - 0.1, z + sz * CRY.rOut + 0.1, 0.09);
      // a blue cover over the drive third, with a yellow inspection hatch
      P.ext(M.blueLight, -L / 2 - 0.08, -L / 2 + 3.2, CRY.rimY + 0.02, CRY.rimY + 0.2, z - CRY.rOut - 0.1, z + CRY.rOut + 0.1, 0.09);
      P.ext(M.yellow, -L / 2 + 1.9, -L / 2 + 2.8, CRY.rimY + 0.18, CRY.rimY + 0.28, z - 0.5, z + 0.5, 0.05);
      for (const x of [-L / 2 + 0.9, 0, L / 2 - 0.9]) {
        P.ext(M.ink, x - 0.5, x + 0.5, 0, 0.1, z - 1.34, z + 1.34, 0.04);
        // a cradle: two posts just clear of the shell, a centre post under the keel, a cross beam
        for (const sz of [-1, 1]) P.ext(M.blue, x - 0.2, x + 0.2, 0.06, 1.4, z + sz * 1.05 - 0.17, z + sz * 1.05 + 0.17, 0.08);
        P.ext(M.blue, x - 0.2, x + 0.2, 0.06, 0.9, z - 0.2, z + 0.2, 0.08);
        P.ext(M.blueDeep, x - 0.16, x + 0.16, 0.86, 1.04, z - 1.05, z + 1.05, 0.07);
      }
      // the shaft, its end bearings on their own posts, and the drive at the -x end
      P.rcyl(M.steel, 0.17, 0.17, L + 0.9, 0, CRY.axisY, z, 'x', 0.06, 18);
      for (const sx of [-1, 1]) {
        const bx = sx * (L / 2 + 0.3);
        P.ext(M.steelDeep, bx - 0.24, bx + 0.24, CRY.axisY - 0.36, CRY.axisY + 0.36, z - 0.32, z + 0.32, 0.12);
        P.ext(M.blue, bx - 0.19, bx + 0.19, 0.06, CRY.axisY - 0.3, z - 0.19, z + 0.19, 0.07);
        P.ext(M.ink, bx - 0.32, bx + 0.32, 0, 0.1, z - 0.32, z + 0.32, 0.04);
      }
      P.ext(M.blue, -L / 2 - 1.7, -L / 2 - 0.7, CRY.axisY - 0.55, CRY.axisY + 0.55, z - 0.5, z + 0.5, 0.18);
      P.ext(M.blueDeep, -L / 2 - 1.55, -L / 2 - 0.85, 0.06, CRY.axisY - 0.5, z - 0.3, z + 0.3, 0.1);
      P.rcyl(M.blueDeep, 0.3, 0.3, 0.44, -L / 2 - 0.5, CRY.axisY, z, 'x', 0.1, 18);
      P.text(`C${i + 1}`, {px: 88}, 0.34, -L / 2 - 1.2, CRY.axisY + 0.1, z + 0.52);
      // the massecuite filling the trough: the inner arc closed off by a flat surface under the shaft
      P.add(M.mass, extrudeX(`fill`, () => {
        const ri = CRY.rOut - 0.18;
        const yf = -0.38;
        const th = Math.acos(clamp(-yf / ri, -1, 1));
        const s = new THREE.Shape();
        s.moveTo(-ri * Math.sin(th), yf);
        s.absarc(0, 0, ri, PI + (PI / 2 - th), PI * 2 - (PI / 2 - th), false);
        s.lineTo(ri * Math.sin(th), yf);
        s.closePath();
        return s;
      }, L - 0.4, 0.0), 0, CRY.axisY, z);
      troughs.push({z, axisY: CRY.axisY, rimY: CRY.rimY});
    }
  }, group);
  // the ribbons: one mesh each, turning about its own axis with a fixed phase
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group();
    g.position.set(0, CRY.axisY, z0 + i * CRY.pitch);
    part(ribbonGeo(L - 0.6), M.yellow, g);
    group.add(g);
    ribbons.push({g, phase: i * 2.0944});
  }
  // the service walkway down the bank (palette's walkway), clear of the rims
  const wkZ = z0 - 1.95;
  const wk = walkway(L + 1.0, 1.4, 3.2);
  wk.position.z = wkZ;
  group.add(wk);
  for (const sx of [-1, 0, 1])
    for (const sz of [-1, 1]) {
      const leg = part(rb(0.18, 3.2, 0.18, 0.06), M.steelDeep, group);
      leg.position.set(sx * (L / 2 - 0.6), 1.6, wkZ + sz * 0.6);
      leg.castShadow = leg.receiveShadow = true;
    }
  const setStir = (a) => {
    for (const r of ribbons) r.g.rotation.x = a + r.phase;
  };
  setStir(0);
  return {group, setStir, troughs, length: L};
}

// ================================================================ the centrifugal row
const CEN = {platformY: 1.4, pitch: 3.4, rCase: 1.5, caseTop: 3.3, lidTop: 3.56, topY: 4.0, rBasket: 1.2, basketY: 1.55, troughTop: 0.46, troughZ: 3.95};

/** the basket's perforated wall: a striped texture so a turning basket reads as turning */
const basketTex = () =>
  canvasTex('cen|basket', 512, 128, (g, w, h) => {
    g.fillStyle = TOY.yellow;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#9a6c16';
    for (let k = 0; k < 28; k++) g.fillRect(k * (w / 28) + w / 90, h * 0.1, w / 60, h * 0.8);
    g.fillStyle = D.yellowDeep;
    g.fillRect(0, 0, w, h * 0.07);
    g.fillRect(0, h * 0.93, w, h * 0.07);
  });

export function buildCentrifugalRow({n = 6} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'centrifugal-row';
  const xs = [];
  for (let i = 0; i < n; i++) xs.push((i - (n - 1) / 2) * CEN.pitch);
  const L = (n - 1) * CEN.pitch + 3.6;
  const hz = 2.4;
  tpl(`cen|${n}`, (P) => {
    // the platform: a steel deck on blue legs, a handrail along the back, stairs at the -x end
    P.ext(M.steel, -L / 2, L / 2, CEN.platformY - 0.14, CEN.platformY, -hz, hz, 0.06);
    P.ext(M.blueDeep, -L / 2 - 0.04, L / 2 + 0.04, CEN.platformY - 0.4, CEN.platformY - 0.12, -hz - 0.05, hz + 0.05, 0.09);
    for (let i = 0; i <= n; i++) {
      const x = -L / 2 + 0.6 + ((L - 1.2) * i) / n;
      for (const sz of [-1, 1]) {
        P.ext(M.ink, x - 0.3, x + 0.3, 0, 0.1, sz * (hz - 0.45) - 0.3, sz * (hz - 0.45) + 0.3, 0.04);
        P.ext(M.blue, x - 0.19, x + 0.19, 0.06, CEN.platformY - 0.36, sz * (hz - 0.45) - 0.19, sz * (hz - 0.45) + 0.19, 0.07);
      }
      P.ext(M.blueLight, x - 0.1, x + 0.1, 0.5, 0.66, -hz + 0.45, hz - 0.45, 0.04);
    }
    // the handrail behind the row (the camera looks in from +z, so the rail goes on -z)
    P.ext(M.steel, -L / 2, L / 2, CEN.platformY + 1.0, CEN.platformY + 1.1, -hz - 0.04, -hz + 0.06, 0.04);
    P.ext(M.steel, -L / 2, L / 2, CEN.platformY + 0.52, CEN.platformY + 0.6, -hz - 0.03, -hz + 0.05, 0.03);
    for (let x = -L / 2 + 0.5; x <= L / 2; x += 2.2) P.ext(M.steelDeep, x - 0.05, x + 0.05, CEN.platformY, CEN.platformY + 1.06, -hz - 0.03, -hz + 0.05, 0.025);
    // the stairs off the -x end
    for (let k = 0; k < 7; k++) {
      const y = (CEN.platformY * (k + 1)) / 7;
      P.ext(M.steel, -L / 2 - 0.3 - k * 0.34, -L / 2 - 0.02 - k * 0.34, y - 0.08, y, -1.2, 0.2, 0.03);
    }
    for (const sz of [-1, 1]) P.bar(M.blue, [-L / 2 - 2.5, 0.1, sz * 0.7 - 0.5], [-L / 2 - 0.1, CEN.platformY + 1.0, sz * 0.7 - 0.5], 0.12);
    // the massecuite header behind the row and a chute down into each lid
    P.rcyl(M.pipe, 0.2, 0.2, L + 0.6, 0, 3.8, -2.25, 'x', 0.07, 18);
    for (const x of xs) {
      P.bar(M.pipe, [x, 3.7, -2.25], [x, CEN.lidTop + 0.12, -0.5], 0.32);
      P.ext(M.blueDeep, x - 0.28, x + 0.28, CEN.lidTop - 0.06, CEN.lidTop + 0.26, -0.76, -0.24, 0.1);
    }
    for (const x of [-L / 2 + 1.0, 0, L / 2 - 1.0]) P.ext(M.steelDeep, x - 0.08, x + 0.08, CEN.platformY, 3.8, -2.36, -2.2, 0.03);
    // the sugar launder along the front of the platform, where every discharge lands in plain sight
    const tz = CEN.troughZ;
    P.ext(M.ink, -L / 2, L / 2, 0, 0.07, tz - 0.72, tz + 0.72, 0.03);
    P.add(M.blue, extrudeX('cenTrough', () => roundedPoly([V2(-0.56, 0.22), V2(0.56, 0.22), V2(0.46, -0.24), V2(-0.46, -0.24)], 0.16), L - 0.3, 0.05), 0, CEN.troughTop, tz);
    for (const sz of [-1, 1]) P.ext(M.yellow, -L / 2 + 0.2, L / 2 - 0.2, CEN.troughTop + 0.16, CEN.troughTop + 0.24, tz + sz * 0.5 - 0.12, tz + sz * 0.5 + 0.12, 0.03);
    // each machine's discharge chute: out under the deck and over the launder's open top
    for (const x of xs) {
      P.ext(M.blueLight, x - 0.34, x + 0.34, 1.0, 1.26, -0.4, tz - 0.2, 0.09);
      P.ext(M.blueLight, x - 0.38, x + 0.38, 0.9, 1.28, tz - 0.56, tz - 0.16, 0.1);
      P.ext(M.yellow, x - 0.42, x + 0.42, 0.86, 0.96, tz - 0.62, tz - 0.08, 0.04);
    }
    // the machines: a blue casing and a yellow lid, both rings, so the basket shows through the bore
    for (let i = 0; i < n; i++) {
      const x = xs[i];
      P.add(M.blue, annulusG(CEN.rBasket + 0.08, CEN.rCase, CEN.caseTop - CEN.platformY, 0.1, 34), x, (CEN.caseTop + CEN.platformY) / 2, 0);
      P.add(M.blueDeep, annulusG(0.5, CEN.rCase, 0.16, 0.05, 30), x, CEN.platformY + 0.08, 0);
      P.add(M.white, annulusG(CEN.rBasket + 0.08, CEN.rCase + 0.06, 0.34, 0.1, 34), x, CEN.platformY + 0.72, 0);
      P.add(M.yellow, annulusG(CEN.rBasket + 0.12, CEN.rCase + 0.14, CEN.lidTop - CEN.caseTop, 0.07, 34), x, (CEN.lidTop + CEN.caseTop) / 2, 0);
      P.ext(M.blue, x - 0.52, x + 0.52, CEN.platformY, CEN.platformY + 0.92, 1.55, 2.45, 0.16);
      P.rcyl(M.blueDeep, 0.3, 0.3, 0.3, x, CEN.platformY + 1.0, 2.0, 'y', 0.08, 18);
      P.ext(M.shade, x - 0.16, x + 0.16, CEN.platformY + 0.2, CEN.platformY + 0.8, CEN.rCase - 0.1, 1.6, 0.07);
      P.sign(`${i + 1}`, null, {fg: TOY.white, px: 150}, 0.6, x, CEN.platformY + 1.45, CEN.rCase + 0.05);
    }
  }, group);
  // the moving parts: a basket per unit, its massecuite wall, its charge stream and its discharge
  const bmat = new THREE.MeshStandardMaterial({map: basketTex(), roughness: 0.5, metalness: 0.1, side: THREE.DoubleSide});
  const units = [];
  for (let i = 0; i < n; i++) {
    const x = xs[i];
    const bg = new THREE.Group();
    bg.position.set(x, 0, 0);
    group.add(bg);
    const h = CEN.caseTop + 0.1 - CEN.basketY;
    const basket = part(tubeG(CEN.rBasket, CEN.rBasket, h, 36), bmat, bg);
    basket.position.y = CEN.basketY + h / 2;
    const floor = part(cylG(CEN.rBasket - 0.02, CEN.rBasket - 0.08, 0.14, 28), M.yellowDeep, bg);
    floor.position.y = CEN.basketY + 0.07;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * PI * 2;
      const lug = part(rb(0.3, 0.14, 0.5, 0.05), M.yellowDeep, bg);
      lug.position.set(Math.cos(a) * (CEN.rBasket - 0.18), CEN.caseTop + 0.07, Math.sin(a) * (CEN.rBasket - 0.18));
      lug.rotation.y = -a;
    }
    // the charge: a solid plug of massecuite that rises up the basket as it fills
    const wall = part(cylG(CEN.rBasket - 0.08, CEN.rBasket - 0.1, 1, 30), M.mass, bg);
    const setCharge = (k) => {
      const s = sat(k);
      const hh = Math.max(0.02, 1.55 * s);
      wall.scale.y = hh;
      wall.position.y = CEN.basketY + 0.14 + hh / 2;
      wall.visible = s > 0.02;
    };
    setCharge(0);
    const setChargeFall = fall(bg, {x: 0, z: -0.5, y0: CEN.lidTop + 0.1, y1: 2.5, r: 0.2, mat: M.mass, splash: false});
    const setDis = fall(bg, {x: 0, z: CEN.troughZ - 0.3, y0: 0.92, y1: 0.66, r: 0.3, mat: M.sugar});
    units.push({x, chargeY: CEN.lidTop, basketY: CEN.basketY, basket, setCharge, setChargeFall, setDis});
  }
  const setSpin = (i, a) => {
    const u = units[i];
    if (u) u.basket.rotation.y = a;
  };
  const setCharge = (i, k) => {
    const u = units[i];
    if (!u) return;
    u.setCharge(k);
    u.setChargeFall(k > 0.02 ? 1 : 0);
  };
  const setDischarge = (i, k) => {
    const u = units[i];
    if (u) u.setDis(k);
  };
  return {group, setSpin, setCharge, setDischarge, platformY: CEN.platformY, topY: CEN.topY, units: units.map(({x, chargeY, basketY}) => ({x, chargeY, basketY})), length: L};
}

// ================================================================ the rotary dryer
const DRY = {axisY: 3.4, r: 1.5, tilt: (2 * PI) / 180, inletY: 5.6, outletY: 1.4};

export function buildRotaryDryer({length = 16} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'rotary-dryer';
  const L = length;
  const hl = L / 2;
  const ringX = hl * 0.57;
  const axisAt = (x) => DRY.axisY - x * Math.tan(DRY.tilt);
  // the drum: a tilted carrier holding one spinning group, so setDrum turns it about its own axis
  const carrier = new THREE.Group();
  carrier.position.y = DRY.axisY;
  carrier.rotation.z = -DRY.tilt;
  group.add(carrier);
  const drum = new THREE.Group();
  carrier.add(drum);
  tpl(`dryerDrum|${L}`, (P) => {
    P.rcyl(M.blue, DRY.r, DRY.r, L, 0, 0, 0, 'x', 0.2, 36);
    for (const sx of [-1, 1]) {
      P.rcyl(M.yellow, DRY.r + 0.2, DRY.r + 0.2, 0.62, sx * ringX, 0, 0, 'x', 0.12, 36);
      P.rcyl(M.white, DRY.r + 0.04, DRY.r + 0.04, 0.26, sx * (hl - 1.2), 0, 0, 'x', 0.08, 36);
    }
    // the girth gear at the middle and 8 lifting ribs down the shell, so the turn reads
    P.rcyl(M.steelDeep, DRY.r + 0.26, DRY.r + 0.26, 0.3, 0, 0, 0, 'x', 0.06, 40);
    for (let k = 0; k < 36; k++) {
      const a = (k / 36) * PI * 2;
      P.add(M.steel, rb(0.22, 0.2, 0.16, 0.04), 0, Math.cos(a) * (DRY.r + 0.38), Math.sin(a) * (DRY.r + 0.38), a, 0, 0);
    }
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2 + PI / 16;
      P.add(M.blueDeep, rb(L - 1.4, 0.18, 0.3, 0.07), 0, Math.cos(a) * (DRY.r + 0.04), Math.sin(a) * (DRY.r + 0.04), a, 0, 0);
    }
  }, drum);
  tpl(`dryer|${L}`, (P) => {
    // two trunnion pedestals, each meeting its own (tilted) ring height
    for (const sx of [-1, 1]) {
      const x = sx * ringX;
      const ay = axisAt(x);
      P.ext(M.ink, x - 0.9, x + 0.9, 0, 0.12, -2.3, 2.3, 0.05);
      P.ext(M.blue, x - 0.7, x + 0.7, 0.08, ay - 2.2, -2.0, 2.0, 0.22);
      P.ext(M.blueDeep, x - 0.8, x + 0.8, ay - 2.24, ay - 2.0, -2.1, 2.1, 0.1);
      for (const sz of [-1, 1]) {
        const rr = 0.46;
        const dz = (DRY.r + 0.2 + rr) * Math.sin(PI / 4);
        const dy = (DRY.r + 0.2 + rr) * Math.cos(PI / 4);
        P.rcyl(M.steel, rr, rr, 0.7, x, ay - dy, sz * dz, 'x', 0.08, 24);
        P.rcyl(M.steelDeep, 0.14, 0.14, 1.0, x, ay - dy, sz * dz, 'x', 0.05, 14);
        P.bar(M.blueDeep, [x, ay - 2.0, sz * dz], [x, ay - dy, sz * dz], 0.3);
      }
    }
    // the hot-air box at the inlet: a low body with a taller collar where the drum enters, yellow louvres on
    // the -x face, and the feed funnel standing on the low roof with its lip at inletY
    const x0 = -hl - 3.1;
    const x1 = -hl + 0.3;
    const stepX = -hl - 1.1;
    P.ext(M.ink, x0 - 0.1, x1, 0, 0.12, -2.0, 2.0, 0.05);
    P.ext(M.blue, x0, stepX + 0.25, 0.1, 4.0, -1.9, 1.9, 0.3);
    P.ext(M.blue, stepX, x1, 0.1, 5.35, -1.9, 1.9, 0.3);
    P.ext(M.white, x0 + 0.16, stepX + 0.25, 3.88, 4.1, -2.0, 2.0, 0.1);
    P.ext(M.white, stepX, x1 - 0.16, 5.23, 5.45, -2.0, 2.0, 0.1);
    for (let k = 0; k < 3; k++) P.ext(M.yellow, x0 - 0.08, x0 + 0.06, 0.7 + k * 0.52, 1.06 + k * 0.52, -1.4, 1.4, 0.06);
    P.sign('DRYER', 'Hot air · 2 deg fall', {}, 0.52, (x0 + stepX) / 2, 3.1, 1.92);
    // the feed funnel: a square hopper standing on the low roof, its lip at inletY
    P.add(M.blueLight, extrude('dryerFunnel', () => roundedPoly([V2(-1.0, DRY.inletY), V2(1.0, DRY.inletY), V2(0.5, 3.95), V2(-0.5, 3.95)], 0.2), 2.0, 0.08), -hl - 2.05, 0, 0);
    P.ext(M.yellow, -hl - 3.12, -hl - 0.98, DRY.inletY - 0.04, DRY.inletY + 0.14, -1.1, 1.1, 0.07);
    // the discharge hood at the outlet, and its chute down to the lip at outletY
    const x2 = hl - 0.3;
    const x3 = hl + 2.2;
    P.ext(M.ink, x2, x3 + 0.1, 0, 0.12, -1.9, 1.9, 0.05);
    P.ext(M.blue, x2, x3, 1.9, 4.8, -1.8, 1.8, 0.28);
    P.ext(M.blueDeep, x2 + 0.25, x3 - 0.25, 0.1, 2.0, -1.35, 1.35, 0.16);
    P.add(M.blueLight, extrude('dryerOut', () => roundedPoly([V2(-0.9, 2.05), V2(1.6, 1.58), V2(1.6, 1.12), V2(-0.9, 1.6)], 0.16), 1.7, 0.08), x3 - 0.75, 0, 0);
    P.ext(M.yellow, x3 + 0.55, x3 + 1.05, DRY.outletY - 0.1, DRY.outletY + 0.16, -0.9, 0.9, 0.07);
    P.rcyl(M.white, 0.46, 0.46, 1.1, x2 + 1.1, 5.2, 0, 'y', 0.1, 24);
    P.rcyl(M.panel, 0.56, 0.56, 0.2, x2 + 1.1, 5.72, 0, 'y', 0.07, 24);
    // the fire window's frame on the +z flank
    P.ext(M.yellow, -hl - 3.1, -hl - 0.9, 0.84, 2.16, 1.88, 2.04, 0.08);
    P.ext(M.ink, -hl - 3.0, -hl - 1.0, 0.96, 2.04, 1.98, 2.06, 0.05);
    // the drive: a motor and gearbox on a plinth, its pinion meshing the girth gear
    P.ext(M.blue, -1.1, 1.1, 0.1, 1.4, -2.9, -1.6, 0.22);
    P.rcyl(M.blueDeep, 0.44, 0.44, 1.3, 0, 1.78, -2.5, 'x', 0.12, 20);
    P.rcyl(M.steelDeep, 0.32, 0.32, 0.36, 0, 1.95, -1.55, 'x', 0.07, 20);
    P.rcyl(M.steel, 0.12, 0.12, 1.2, 0, 1.9, -2.0, 'x', 0.04, 12);
  }, group);
  // the furnace glow in a window on the hot box's +z flank, and the plume off the outlet hood
  const fire = glowMat(MILL.hot, MILL.hot, 0.6, 0.4);
  const face = part(rb(1.96, 1.04, 0.14, 0.06), fire, group);
  face.position.set(-hl - 2.0, 1.5, 2.06);
  const pl = plume({n: 6, r: 0.8, rise: 3.2, spread: 0.9, seed: 7});
  pl.group.position.set(hl + 0.7, 4.6, 0);
  group.add(pl.group);
  const setHot = (t, k = 1) => {
    const s = sat(k);
    fire.emissiveIntensity = s * (0.55 + 0.22 * Math.sin(t * 5.1) + 0.1 * Math.sin(t * 11.3));
    face.visible = s > 0.02;
    pl.set(t, s * 0.85);
  };
  const setDrum = (a) => {
    drum.rotation.x = a;
  };
  setDrum(0);
  setHot(0, 0);
  return {group, setDrum, setHot, inletY: DRY.inletY, outletY: DRY.outletY, axisY: DRY.axisY, dia: DRY.r * 2, length: L};
}

// ================================================================ the sugar silo
export function buildSugarSilo({d = 7, h = 9, label = 'A'} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = `sugar-silo-${label}`;
  const R = d / 2;
  const outletY = 1.4;
  const coneTop = 4.0;
  const roofY = h - 0.85;
  const prof = [[0.001, outletY + 0.1], [0.62, outletY + 0.1], [0.66, outletY + 0.3], [R - 0.08, coneTop - 0.12], [R, coneTop + 0.1], [R, roofY - 0.1]];
  for (let i = 0; i <= 5; i++) {
    const u = i / 5;
    prof.push([lerp(R, 0.5, u) * (1 - 0.02 * u), lerp(roofY, h - 0.15, Math.sin((u * PI) / 2))]);
  }
  prof.push([0.5, h], [0.001, h]);
  const shell = lathe(prof, 40, M.tank);
  group.add(shell);
  tpl(`silo|${d}|${h}|${label}`, (P) => {
    // 6 blue legs with X bracing, up to the barrel's bottom ring
    const nL = 6;
    for (let i = 0; i < nL; i++) {
      const a = (i / nL) * PI * 2 + PI / nL;
      const a2 = ((i + 1) / nL) * PI * 2 + PI / nL;
      const rr = R - 0.45;
      const p = [Math.cos(a) * rr, Math.sin(a) * rr];
      const q = [Math.cos(a2) * rr, Math.sin(a2) * rr];
      P.ext(M.ink, p[0] - 0.36, p[0] + 0.36, 0, 0.1, p[1] - 0.36, p[1] + 0.36, 0.04);
      P.ext(M.blue, p[0] - 0.22, p[0] + 0.22, 0.06, coneTop + 0.2, p[1] - 0.22, p[1] + 0.22, 0.08);
      P.bar(M.blueDeep, [p[0], 1.1, p[1]], [q[0], 2.9, q[1]], 0.14);
      P.bar(M.blueDeep, [p[0], 2.9, p[1]], [q[0], 1.1, q[1]], 0.14);
    }
    P.rcyl(M.blueDeep, R + 0.08, R + 0.08, 0.4, 0, coneTop + 0.1, 0, 'y', 0.12, 36);
    P.rcyl(M.tankDeep, R + 0.06, R + 0.06, 0.26, 0, roofY - 0.22, 0, 'y', 0.1, 36);
    // the discharge: a yellow slide gate under the cone mouth, on a short spout
    P.ext(M.yellow, -0.7, 0.7, outletY, outletY + 0.42, -0.7, 0.7, 0.14);
    P.ext(M.yellowDeep, -0.95, 0.95, outletY + 0.1, outletY + 0.3, 0.6, 0.98, 0.07);
    P.rcyl(M.pipe, 0.46, 0.5, 0.34, 0, outletY - 0.17, 0, 'y', 0.08, 20);
    // the nameplate, bedded into the flank, and the roof vent cap
    P.ext(M.blue, -1.4, 1.4, 5.6, 6.9, R - 0.35, R + 0.05, 0.12);
    P.sign(`SILO ${label}`, 'White sugar · 900 t', {}, 0.74, 0, 6.25, R + 0.07);
    P.rcyl(M.white, 0.62, 0.62, 0.16, 0, h - 0.08, 0, 'y', 0.05, 24);
    // the ladder up the flank
    for (const sz of [-1, 1]) P.bar(M.steel, [-R - 0.16, coneTop, sz * 0.32], [-R - 0.16, roofY, sz * 0.32], 0.1);
    for (let y = coneTop + 0.4; y < roofY; y += 0.46) P.rod(M.steelDeep, [-R - 0.18, y, -0.32], [-R - 0.18, y, 0.32], 0.045);
  }, group);
  const setLevel = gauge(group, {x: 1.8, z: 2.95, y0: coneTop + 0.4, y1: roofY - 0.5, w: 0.46, mat: M.sugar, label: 'LEVEL', dark: true});
  // the fill line up the back flank and into the roof edge (palette's pipe)
  group.add(pipe([-R - 0.5, coneTop + 0.2, 0], [-R - 0.5, roofY + 0.25, 0], 0.3));
  group.add(pipe([-R - 0.5, roofY + 0.25, 0], [-R + 0.6, roofY + 0.25, 0], 0.3));
  return {group, setLevel, outletY, topY: h, dia: d};
}

// ================================================================ the sugar bag
const BAG = {w: 0.9, h: 0.52, d: 0.3};

export function buildSugarBag({kind = 'white'} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = `sugar-bag-${kind}`;
  const skin = kind === 'raw' ? M.raw : M.white;
  const print = kind === 'raw' ? MILL.raw : TOY.blue;
  tpl(`bag|${kind}`, (P) => {
    // two stacked rounded slabs: a slumped belly under a narrower crown, 0.90 x 0.52 x 0.30 overall
    P.ext(skin, -BAG.w / 2, BAG.w / 2, 0, 0.3, -BAG.d / 2, BAG.d / 2, 0.11);
    P.ext(skin, -BAG.w / 2 + 0.04, BAG.w / 2 - 0.04, 0.27, BAG.h, -BAG.d / 2 + 0.03, BAG.d / 2 - 0.03, 0.1);
    // the sewn ends, a touch darker
    for (const sx of [-1, 1]) P.ext(kind === 'raw' ? M.bagasse : M.panel, sx * (BAG.w / 2 - 0.06), sx * (BAG.w / 2 + 0.01), 0.3, BAG.h - 0.03, -0.08, 0.08, 0.025);
    // CANELINE and the net weight on both faces
    P.sides((s, z, ry) => {
      P.sign('CANELINE', kind === 'raw' ? 'RAW SUGAR · 50 kg NET' : 'WHITE SUGAR · 50 kg NET', {fg: print, px: 110}, 0.2, 0, 0.3, z, ry);
    }, BAG.d / 2 + 0.002);
  }, group);
  return group;
}

// ================================================================ the sugar pallet
export function buildSugarPallet({layers = 3, kind = 'white', seed = 1} = {}) {
  const group = new THREE.Group();
  group.name = `sugar-pallet-${kind}`;
  const M = mats();
  const deckY = 0.32; // buildToyPallet's top boards
  const layerH = 0.26; // a bag squashed under the stack: 3 layers put the top at y = 1.10
  group.add(buildToyPallet({load: 'none', layers: 0, seed: 1}));
  const rand = rng(seed);
  for (let c = 0; c < layers; c++) {
    // 2 by 2, each bag laid on its face (0.90 x 0.52 in plan) and squashed to layerH, the layer handed the
    // other way each course so the seams never line up
    const flip = c % 2 === 1;
    for (let i = 0; i < 4; i++) {
      const holder = new THREE.Group();
      holder.position.set((i % 2 ? 1 : -1) * 0.46 + (rand() - 0.5) * 0.04, deckY + c * layerH, (i < 2 ? 1 : -1) * 0.27 + (rand() - 0.5) * 0.04);
      holder.rotation.y = (flip ? PI : 0) + (rand() - 0.5) * 0.05;
      const bag = buildSugarBag({kind});
      bag.rotation.x = -PI / 2;
      bag.scale.z = layerH / BAG.d;
      bag.position.set(0, layerH / 2, BAG.h / 2);
      holder.add(bag);
      group.add(holder);
    }
  }
  // the stretch wrap over the top layer
  const top = deckY + (layers - 1) * layerH;
  const wrap = new THREE.Mesh(rb(1.96, layerH + 0.05, 1.2, 0.08), M.wrap);
  wrap.position.set(0, top + layerH / 2 - 0.01, 0);
  wrap.renderOrder = 2;
  group.add(wrap);
  return group;
}

// ================================================================ the bagging line
export function buildBaggingLine({length = 22} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'bagging-line';
  const beltY = 0.7;
  const hl = length / 2;
  const beltEnd = hl - 5.0; // the last 5 m are a roller run (plant-shared's own conveyor)
  const hzb = 0.85;
  const fillerX = -hl + 3.0;
  const stitchX = -1.2;
  const weighX = 3.2;
  tpl(`bag-line|${length}`, (P) => {
    // the belt frame: blue side beams with a white lip on legs every 3 m
    for (const sz of [-1, 1]) {
      P.ext(M.blue, -hl, beltEnd, beltY - 0.34, beltY - 0.04, sz * (hzb + 0.1) - 0.08, sz * (hzb + 0.1) + 0.08, 0.06);
      P.ext(M.white, -hl - 0.02, beltEnd + 0.02, beltY - 0.08, beltY + 0.015, sz * (hzb + 0.1) - 0.1, sz * (hzb + 0.1) + 0.1, 0.03);
      const legs = Math.max(2, Math.ceil((beltEnd + hl) / 3) + 1);
      for (let k = 0; k < legs; k++) {
        const x = -hl + 0.3 + ((beltEnd + hl - 0.6) * k) / (legs - 1);
        P.ext(M.shade, x - 0.09, x + 0.09, 0, beltY - 0.3, sz * (hzb + 0.1) - 0.09, sz * (hzb + 0.1) + 0.09, 0.04);
        P.ext(M.ink, x - 0.16, x + 0.16, 0, 0.05, sz * (hzb + 0.1) - 0.16, sz * (hzb + 0.1) + 0.16, 0.02);
        if (sz > 0) P.ext(M.shade, x - 0.05, x + 0.05, 0.14, 0.22, -hzb - 0.05, hzb + 0.05, 0.03);
      }
    }
    // the weigh hopper and filling spout: 4 legs clear of the belt, a square funnel, a yellow gate
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const x = fillerX + sx * 1.3;
        const z = sz * 1.55;
        P.ext(M.ink, x - 0.26, x + 0.26, 0, 0.1, z - 0.26, z + 0.26, 0.04);
        P.ext(M.blue, x - 0.17, x + 0.17, 0.06, 4.7, z - 0.17, z + 0.17, 0.07);
        P.bar(M.blueDeep, [x, 2.4, z], [x - sx * 0.6, 3.1, z - sz * 0.6], 0.12);
      }
    for (const sz of [-1, 1]) P.ext(M.blueDeep, fillerX - 1.3, fillerX + 1.3, 4.5, 4.74, sz * 1.55 - 0.14, sz * 1.55 + 0.14, 0.08);
    P.ext(M.hopper, fillerX - 1.25, fillerX + 1.25, 4.1, 5.5, -1.25, 1.25, 0.2);
    P.add(M.hopper, extrude('fillerFunnel', () => roundedPoly([V2(-1.25, 4.15), V2(1.25, 4.15), V2(0.36, 2.3), V2(-0.36, 2.3)], 0.2), 2.5, 0.08), fillerX, 0, 0);
    P.rcyl(M.blueDeep, 0.4, 0.34, 0.5, fillerX, 2.1, 0, 'y', 0.1, 22);
    P.ext(M.yellow, fillerX - 0.56, fillerX + 0.56, 1.78, 1.98, -0.5, 0.5, 0.08);
    P.rcyl(M.yellowDeep, 0.1, 0.1, 0.5, fillerX + 0.7, 1.88, 0, 'x', 0.04, 12);
    P.rcyl(M.pipe, 0.3, 0.3, 0.42, fillerX, 1.73, 0, 'y', 0.07, 20);
    P.ext(M.blue, fillerX - 0.9, fillerX + 0.9, 5.42, 5.7, -1.0, 1.0, 0.1);
    P.sign('FILL 01', '50 kg · nett', {}, 0.5, fillerX, 4.85, 1.27);
    // the stitching portal: blue posts, a cross beam, a yellow sewing head over the belt
    for (const sz of [-1, 1]) {
      P.ext(M.ink, stitchX - 0.3, stitchX + 0.3, 0, 0.1, sz * 1.3 - 0.3, sz * 1.3 + 0.3, 0.04);
      P.ext(M.blue, stitchX - 0.2, stitchX + 0.2, 0.06, 2.6, sz * 1.3 - 0.2, sz * 1.3 + 0.2, 0.08);
    }
    P.ext(M.blue, stitchX - 0.26, stitchX + 0.26, 2.5, 2.84, -1.5, 1.5, 0.11);
    P.ext(M.yellow, stitchX - 0.42, stitchX + 0.42, 1.36, 2.2, -0.42, 0.42, 0.14);
    P.ext(M.yellowDeep, stitchX - 0.26, stitchX + 0.26, 1.22, 1.4, -0.22, 0.22, 0.07);
    P.ext(M.blueDeep, stitchX - 0.5, stitchX + 0.5, 2.2, 2.54, -0.5, 0.5, 0.1);
    P.ext(M.white, stitchX - 0.7, stitchX + 0.7, 1.5, 2.1, 1.3, 1.46, 0.07);
    P.sign('STITCH', null, {fg: TOY.blue, px: 120}, 0.26, stitchX, 1.8, 1.48);
    // the check-weigher: a steel weigh deck in the belt line and a display pillar beside it
    P.ext(M.steel, weighX - 0.9, weighX + 0.9, beltY - 0.06, beltY + 0.04, -hzb, hzb, 0.04);
    P.ext(M.blue, weighX - 0.95, weighX + 0.95, beltY - 0.1, beltY - 0.02, -1.0, 1.0, 0.03);
    P.ext(M.ink, weighX - 0.34, weighX + 0.34, 0, 0.1, 1.1, 1.7, 0.04);
    P.ext(M.blue, weighX - 0.2, weighX + 0.2, 0.06, 1.9, 1.3, 1.5, 0.08);
    P.ext(M.white, weighX - 0.72, weighX + 0.72, 1.6, 2.5, 1.36, 1.56, 0.1);
    P.ext(M.glass, weighX - 0.6, weighX + 0.6, 1.74, 2.36, 1.52, 1.6, 0.05);
    P.label('50.0 kg', {color: '#a8e6c0', w: 640, h: 256, font: '800 160px Inter, system-ui, sans-serif'}, 0.34, weighX, 2.05, 1.62);
    // the end pulley housings
    P.rcyl(M.steelDeep, 0.17, 0.17, 2.1, -hl + 0.1, beltY - 0.17, 0, 'x', 0.05, 18);
    P.rcyl(M.steelDeep, 0.17, 0.17, 2.1, beltEnd - 0.1, beltY - 0.17, 0, 'x', 0.05, 18);
  }, group);
  // the belt surface: a dark band with chevrons that scroll with setBelt, so travel reads
  const tex = canvasTex('belt|chev', 128, 128, (g, w, h) => {
    g.fillStyle = D.belt;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#48527a';
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(w * 0.12, 0);
    g.lineTo(w * 0.62, h / 2);
    g.lineTo(w * 0.12, h);
    g.stroke();
  }, {repeat: true}).clone();
  tex.needsUpdate = true;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const span = beltEnd + hl;
  tex.repeat.set(span / 1.1, 1);
  const bmat = new THREE.MeshStandardMaterial({map: tex, roughness: 0.8});
  const surf = new THREE.Mesh(planeG(span, hzb * 2).clone().rotateX(-PI / 2), bmat);
  surf.position.set((beltEnd - hl) / 2, beltY + 0.02, 0);
  surf.receiveShadow = true;
  group.add(surf);
  const pulleys = [-hl + 0.1, beltEnd - 0.1].map((x) => {
    const m = part(rcylG(0.2, 0.2, 1.9, 0.06, 20).clone().rotateZ(PI / 2), M.steel, group);
    m.position.set(x, beltY - 0.18, 0);
    return m;
  });
  // the roller run out to the palletiser: plant-shared's own conveyor, same topY
  const run = buildToyRollerConveyor({length: 5.0});
  run.group.position.x = beltEnd + 2.5;
  group.add(run.group);
  // the sugar falling out of the spout
  const setFiller = fall(group, {x: fillerX, z: 0, y0: 1.72, y1: 1.24, r: 0.26, mat: M.sugar, splash: false});
  const setBelt = (d) => {
    tex.offset.x = -d / 1.1;
    for (const p of pulleys) p.rotation.x = d / 0.2;
    run.setOffset(d);
  };
  setBelt(0);
  const bagAt = (s) => [-hl + clamp(s, 0, length), beltY, 0];
  return {
    group,
    setBelt,
    bagAt,
    setFiller,
    beltY,
    length,
    stations: {filler: fillerX + hl, stitch: stitchX + hl, weigher: weighX + hl},
    rollerRun: {x0: beltEnd, x1: hl},
  };
}

// ================================================================ the boiler house
export function buildBoilerHouse() {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'boiler-house';
  const W = 14;
  const Dz = 18;
  const roofY = 9;
  const hw = W / 2;
  const hd = Dz / 2;
  const stackZ = -hd - 2.4;
  const stackTop = 18;
  const feedY = 6.0;
  tpl('boiler', (P) => {
    // the shell: a blue plinth, white walls, a dark glass band, a blue parapet
    P.ext(M.blueDeep, -hw - 0.24, hw + 0.24, 0, 0.3, -hd - 0.24, hd + 0.24, 0.1);
    P.ext(M.blue, -hw - 0.1, hw + 0.1, 0.2, 2.2, -hd - 0.1, hd + 0.1, 0.14);
    P.ext(M.white, -hw, hw, 2.1, roofY - 0.5, -hd, hd, 0.3);
    P.ext(M.blue, -hw - 0.14, hw + 0.14, roofY - 0.6, roofY, -hd - 0.14, hd + 0.14, 0.16);
    P.ext(M.roof, -hw + 0.2, hw - 0.2, roofY - 0.56, roofY - 0.34, -hd + 0.2, hd - 0.2, 0.1);
    // the roof: a raised monitor ridge down the middle with dark louvre slots, and four fan drums beside it
    P.ext(M.white, -hw + 1.8, hw - 1.8, roofY - 0.4, roofY + 0.36, -2.1, 2.1, 0.2);
    for (const sz of [-1, 1]) for (let k = 0; k < 6; k++) P.ext(M.glass, -hw + 2.3 + k * 1.5, -hw + 3.4 + k * 1.5, roofY - 0.18, roofY + 0.18, sz * 2.1 - 0.05, sz * 2.1 + 0.05, 0.04);
    P.ext(M.blue, -hw + 1.65, hw - 1.65, roofY + 0.32, roofY + 0.48, -2.26, 2.26, 0.07);
    for (const z of [-6.6, -4.0, 4.0, 6.6]) {
      P.rcyl(M.white, 0.62, 0.62, 0.6, -hw + 2.9, roofY - 0.2, z, 'y', 0.14, 24);
      P.rcyl(M.panel, 0.72, 0.56, 0.18, -hw + 2.9, roofY + 0.18, z, 'y', 0.06, 24);
    }
    // the glass band on the long flanks and a tall window on the +x end
    for (const sz of [-1, 1]) {
      P.ext(M.glass, -hw + 1.0, hw - 1.0, 4.6, 6.4, sz * hd - 0.06, sz * hd + 0.06, 0.06);
      for (let k = 1; k < 4; k++) P.ext(M.white, -hw + 1.0 + (k * (W - 2)) / 4 - 0.14, -hw + 1.0 + (k * (W - 2)) / 4 + 0.14, 4.5, 6.5, sz * hd - 0.1, sz * hd + 0.1, 0.06);
    }
    P.ext(M.glass, -hw - 0.06, -hw + 0.06, 3.0, 7.4, -3.4, 3.4, 0.06);
    for (let k = 1; k < 4; k++) P.ext(M.white, -hw - 0.1, -hw + 0.1, 3.0, 7.4, -3.4 + (k * 6.8) / 4 - 0.14, -3.4 + (k * 6.8) / 4 + 0.14, 0.06);
    // the roller door on the +z face, standing proud of the plinth band
    P.ext(M.panel, hw - 5.9, hw - 2.5, 0.3, 3.6, hd + 0.26, hd + 0.5, 0.1);
    for (let k = 0; k < 7; k++) P.ext(M.blue, hw - 5.92, hw - 2.48, 0.4 + k * 0.46, 0.68 + k * 0.46, hd + 0.48, hd + 0.56, 0.03);
    P.ext(M.white, hw - 6.1, hw - 2.3, 3.5, 3.95, hd + 0.22, hd + 0.64, 0.12);
    // the fire door frame on the +z face, left of the roller door, with bars over the glow (a separate mesh)
    P.ext(M.yellow, -hw + 1.1, -hw + 4.3, 0.8, 3.2, hd + 0.26, hd + 0.56, 0.14);
    for (let k = 0; k < 4; k++) P.ext(M.ink, -hw + 1.68 + k * 0.72, -hw + 1.86 + k * 0.72, 1.1, 2.9, hd + 0.56, hd + 0.62, 0.04);
    // the name band over the doors
    P.ext(M.blue, -hw + 0.6, hw - 0.6, 7.5, 8.5, hd + 0.06, hd + 0.22, 0.12);
    P.sign('BOILER 01', 'Bagasse fired · 45 t/h', {}, 0.78, 0, 8.0, hd + 0.24);
    // the bagasse feed on the +x flank: a yellow hopper mouth at feedY on a blue chute into the wall
    P.ext(M.blue, hw - 0.3, hw + 2.9, 3.4, 4.7, -2.0, 2.0, 0.26);
    P.add(M.blueLight, extrude('boilerChute', () => roundedPoly([V2(0.5, 4.7), V2(2.8, 4.7 - 0.5), V2(2.8, feedY), V2(0.5, feedY)], 0.18), 2.6, 0.09), hw, 0, 0);
    for (const sz of [-1, 1]) P.ext(M.yellow, hw + 0.4, hw + 3.0, feedY - 0.04, feedY + 0.16, sz * 1.34 - 0.14, sz * 1.34 + 0.14, 0.06);
    for (const sx of [0.4, 3.0]) P.ext(M.yellow, hw + sx - 0.14, hw + sx + 0.14, feedY - 0.04, feedY + 0.16, -1.48, 1.48, 0.06);
    for (const sz of [-1, 1]) {
      P.ext(M.blue, hw + 2.26, hw + 2.66, 0.1, 4.3, sz * 1.5 - 0.2, sz * 1.5 + 0.2, 0.08);
      P.bar(M.blueDeep, [hw + 2.46, 1.0, sz * 1.5], [hw + 0.6, 2.4, sz * 1.5], 0.2);
    }
    P.ext(M.ink, hw + 1.9, hw + 3.1, 0, 0.12, -1.9, 1.9, 0.05);
    // the stack on the north flank: a brick column with blue bands, on a wide skirt
    P.rcyl(M.blueDeep, 1.95, 1.7, 0.8, 0, 0.4, stackZ, 'y', 0.2, 32);
    P.rcyl(M.brick, 1.3, 1.1, stackTop - 0.7, 0, (stackTop + 0.5) / 2, stackZ, 'y', 0.18, 32);
    const sr = (y) => lerp(1.3, 1.1, clamp((y - 0.5) / (stackTop - 0.7), 0, 1));
    for (let k = 1; k <= 4; k++) {
      const y = 1.6 + k * 3.3;
      P.rcyl(M.blue, sr(y) + 0.07, sr(y) + 0.07, 0.44, 0, y, stackZ, 'y', 0.12, 32);
    }
    P.rcyl(M.steelDeep, sr(stackTop) + 0.1, sr(stackTop) + 0.1, 0.5, 0, stackTop - 0.25, stackZ, 'y', 0.14, 32);
    // the flue duct from the building's north wall into the stack
    P.rcyl(M.brick, 0.95, 0.95, 2.8, 0, 6.4, -hd - 1.3, 'z', 0.16, 24);
    P.ext(M.blueDeep, -1.2, 1.2, 6.2, 6.6, -hd - 0.2, -hd + 0.1, 0.1);
    // an access ladder up the stack
    for (const sz of [-1, 1]) P.bar(M.steel, [sz * 0.34, 0.9, stackZ - 1.36], [sz * 0.34, stackTop - 0.6, stackZ - 1.2], 0.1);
    for (let y = 1.3; y < stackTop - 0.8; y += 0.5) P.rod(M.steelDeep, [-0.34, y, stackZ - 1.36 + 0.16 * ((y - 0.9) / (stackTop - 1.5))], [0.34, y, stackZ - 1.36 + 0.16 * ((y - 0.9) / (stackTop - 1.5))], 0.045);
  }, group);
  // the fire's glow, and the stack's plume
  const fire = glowMat(MILL.hot, MILL.hot, 0.7, 0.42);
  const door = part(rb(2.5, 1.85, 0.12, 0.05), fire, group);
  door.position.set(-hw + 2.7, 2.0, hd + 0.56);
  const pl = plume({n: 8, r: 1.3, rise: 6, spread: 2.0, seed: 11});
  pl.group.position.set(0, stackTop, stackZ);
  group.add(pl.group);
  const setFire = (t, k = 1) => {
    const s = sat(k);
    fire.emissiveIntensity = s * (0.6 + 0.26 * Math.sin(t * 4.3) + 0.14 * Math.sin(t * 9.7 + 1.1));
    door.visible = s > 0.02;
  };
  const setPlume = (t, k = 1) => pl.set(t, sat(k) * 0.9);
  setFire(0, 0);
  setPlume(0, 0);
  return {group, setFire, setPlume, stackTop, feedY, roofY, dims: {w: W, d: Dz, stackZ}};
}
