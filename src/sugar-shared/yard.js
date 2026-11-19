// Caneline's yard: everything outside the mill hall, plus everything that moves on wheels. Built in exactly the toy
// airport / car plant / construction site look (airport-shared/style.js, site-shared/machines.js, plant-shared/line.js):
// toy proportions, generous bevels on every edge, matte paint with a soft clearcoat, dark tyres with light hubs and a
// dark cap, dark glass, crisp printed numbers and signs. Blue cabs, frames and structure; white and MILL.tank shells;
// yellow only on the working machines (the cane cage, the tipping table, the grab); green only on the cane itself.
// The cane truck's cab is the airport box truck's cab-over cab to the millimetre (the shared cab() below).
//
// Toy metres, y up. A machine's length runs along +x, its right side is +z, origin on the ground at its centre.
// Nothing here goes above y = 12: the tallest things are the tipping table at full tilt (11.4), the cane grab's boom
// tip (10.5) and the yard lamp (8.3).
//
//   buildCaneTruck({number = '18', livery = 'aurora' | 'kestrel', load = 1})
//       -> {group, roll(d), setSteer(a), setLoad(k), deckY: 1.5, dims}
//       9.6 long (x = -4.80 .. +4.80), 4.2 wide over the tyres, wheel radius 0.75, cab roof 4.10, cage floor (deck)
//       top y = 1.50, cage rails 2.6 above it so the top rail is y = 4.10, the cane crowning at 4.60.
//       roll(d): wheels turn for d metres travelled. setSteer(a): front wheels, radians, + is toward +z.
//       setLoad(k): 1 a full strapped load .. 0 empty; between, the bed of cane shrinks and slides toward the
//       truck's own rear (its local -x, i.e. toward the tailgate). On the tipping table the truck is yawed PI, so
//       that is table +x: the load crowds the tailgate and pours off the east edge. Pure in k.
//   buildCaneTrailer({number = '18'})
//       -> {group, roll(d), setSteer(a), setLoad(k), deckY: 1.5, hitch, dims}
//       the same yellow cage on a drawbar trailer, 7.0 long overall (cage 5.0 + drawbar), deck top y = 1.50, top rail
//       4.10. hitch: an Object3D at the drawbar eye (x = +3.45, y = 1.05). setSteer turns the front dolly.
//   buildTippingTable({number = 'T1'})
//       -> {group, deck, seat(obj, {x, z, yaw}), setTilt(k), deckY: 0.90, deckSpan: {x0: -6.5, x1: 6.5, z: 2.3},
//           hingeX: 6.5, tilt: 0.9250 rad}
//       An in-line cane tippler: a yellow 13.0 x 4.6 platform on a blue pit frame, two big hydraulic rams outside
//       the deck at z = +-2.9. The truck drives FORWARD up the east ramp and finishes nosed WEST, so the deck lifts
//       its nose and the cane leaves EAST over the tailgate, back past the ramp. Deck top y = 0.90 flat.
//       setTilt(k): 0 flat .. 1 at 53 deg about the east edge (x = +6.5, hinge pin at y = 0.20); the west deck
//       corner rises to y = 10.90. Pure in k. 53 deg, not the contract's 55, so a FULL cane truck's cab roof stays
//       under y = 12 at k = 1 (measured max 11.69; at 55 deg it is 11.81, which is inside the ceiling but has no
//       margin left for the film).
//       The approach ramp (x = +6.66 .. +9.40) is a bridge: two 0.9-wide wheel runways under the tyre tracks at
//       z = +-1.82, leaving 3.0 clear down the centreline (z = -1.37 .. +1.37) for the cane to fall through into
//       the receiving hopper underneath. Nothing on the table stands above deck level east of x = +4.55.
//       Wheel chocks sit at the high (west) end at x = -3.80 / -4.25, in front of the truck's front tyres; a pair
//       of chunky yellow wheel clamps (static) arch over the rear tandem tyres between x = +1.30 and +4.55.
//       seat(obj, {x = 0, z = 0, yaw = PI}): parents obj to the tilting deck, placing it at table-group x when the
//       deck is flat, so setTilt carries it. seat(truck.group) is exactly a cane truck reversed onto the table:
//       flat, its origin lands at (0, 0.90, 0) in the table group's frame with rotation.y = PI.
//   buildWeighbridge({label = 'WB-1'})
//       -> {group, deckY: 0.25, setBoom(k), boomOpen: 1.48}
//       a 16.0 x 4.6 deck with its top at y = 0.25 and flush ramps either end (x = +-8.0 .. +-10.2), a kiosk with dark
//       glass (roof 3.3), a lit display board at y = 2.4 .. 3.5 printed with a tonnage, and a barrier boom at x = 8.6.
//       setBoom(k): 0 down across the lane .. 1 up; boomOpen is the raised angle in radians.
//   buildCanePile({volume = 400, seed = 1})   -> THREE.Group
//       a long heap of stacked cane, shaped like site-shared's buildToySoilHeap but made of visible stalks: a
//       vertex-coloured ridge of MILL.cane / MILL.caneDeep with MILL.caneDry crowns, and ~200 instanced stalks lying
//       across it. volume is in toy cubic metres; 400 gives a ridge 26 long, 10 wide, 3.4 tall. seed changes nothing
//       but the shape. Deterministic: same args, same heap.
//   buildBagassePile({volume = 300, seed = 1})   -> THREE.Group
//       the pale MILL.bagasse fibre heap by the boiler, the same ridge, lumpier and shorter: 300 gives 15 x 9.4 x 3.2.
//   buildCaneGrab({number = '02'})
//       -> {group, setSlew(a), setBoom(k), setGrab(k), setLoad(k), grabTip}
//       a fixed pedestal grab crane. Pedestal 6.0 tall (slew ring top y = 6.00), boom foot y = 6.75, boom 8.4 long.
//       setSlew(a): radians about y, 0 aims the boom along +x. setBoom(k): 0 boom down (-8 deg, tip y = 5.6) .. 1 up
//       (+24 deg, tip y = 10.17); nothing on the machine ever goes above y = 10.5. setGrab(k): 0 tines wide open ..
//       1 shut. setLoad(k): the clump of cane in the tines, 0 none .. 1 full. grabTip: an Object3D at the tines' tip.
//   buildMillGate()   -> {group, setBoom(k)}
//       the entrance: two blue piers at z = +-4.2 either side of the lane, a guard kiosk with dark glass, an 8.0 boom.
//       setBoom(k): 0 down .. 1 up (1.48 rad). Pier caps at y = 4.0.
//   buildMillSign({name = 'CANELINE', sub = 'Sugar mill & refinery'})   -> THREE.Group
//       a ground sign: a white plinth and a blue panel printed both sides with labelTexture, top at y = 3.70.
//   buildLabOffice()   -> THREE.Group
//       a two-storey blue-and-white office and laboratory block, 18 x 12, parapet (roof) at y = 8.0, roof plant 8.8.
//   buildTankFarm({n = 3})   -> THREE.Group
//       n molasses tanks 8.0 across and 7.0 tall (dome y = 7.50, roof hatch 7.77) on 0.5 skirts, 10.0 apart, in a bund
//       wall 1.1 tall, with a pipe manifold at y = 1.4 using palette.js's pipe().
//   buildYardLamp()   -> THREE.Group
//       a yard light: a blue mast 8.0 tall with a twin head on a bracket, top y = 8.30.
//
// Static parts are merged per material and cached per variant with tpl(), so a second copy only costs draw calls;
// moving parts (wheels, the table deck, the grab's boom and tines, booms) are separate meshes on shared geometry.
// Every builder is a pure function of its arguments and every setter a pure function of its input: no timers, no
// state carried between frames, no bare Math.random() (seeded rng only). Text uses Inter: build after document.fonts
// has loaded it (runSim does that before setup).
import * as THREE from 'three';
import {mergeGeometries, mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {TOY, rbox, toyMat, labelTexture} from '../airport-shared/style.js';
import {GSE_COLORS} from '../airport-shared/gse.js';
import {MILL, pipe as millPipe} from './palette.js';

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
const C = GSE_COLORS;

/** the yard's own colours, on top of TOY and MILL */
const Y = {
  yellowDeep: '#e0a02e', // the inner faces of the cage, the table's ribs: one step down from TOY.yellow
  concrete: '#c9cfe0', // the weighbridge deck, the bund floor
  concreteDeep: '#aab3c9',
  board: '#131a2c', // the lit display board's face
  boardLit: '#ffd27a',
};
const LIVERY = {
  aurora: {cab: TOY.blue, seam: TOY.blueDeep, stripe: null, name: 'CANELINE'},
  kestrel: {cab: TOY.white, seam: TOY.shade, stripe: TOY.teal, name: 'CANELINE'},
};
const liv = (k) => LIVERY[k] ?? LIVERY.aurora;

// ================================================================ materials
const paint = (color, rough = 0.5) => toyMat(color, {paint: true, rough});
let MM = null;
function mats() {
  if (MM) return MM;
  const glow = (color, emissive, k, rough = 0.35) => new THREE.MeshStandardMaterial({color, roughness: rough, emissive, emissiveIntensity: k});
  MM = {
    white: paint(TOY.white),
    panel: paint(TOY.panel),
    roof: paint(TOY.roof, 0.55),
    blue: paint(TOY.blue, 0.48),
    blueDeep: paint(TOY.blueDeep, 0.48),
    blueLight: paint(TOY.blueLight, 0.5),
    yellow: paint(TOY.yellow, 0.5),
    yellowDeep: paint(Y.yellowDeep, 0.56),
    ink: toyMat(C.ink, {rough: 0.62}),
    chassis: toyMat(C.chassis, {rough: 0.66}),
    tyre: toyMat(C.tyre, {rough: 0.82}),
    hub: toyMat(C.hub, {rough: 0.42}),
    hubCap: toyMat(C.hubCap, {rough: 0.45, metal: 0.1}),
    glass: toyMat(TOY.glass, {paint: true, rough: 0.12}),
    bumper: paint(C.bumper),
    steel: toyMat(C.steel, {rough: 0.42, metal: 0.25}),
    shade: toyMat(TOY.shade, {rough: 0.8}),
    lamp: glow(C.lamp, '#fff1c8', 0.22, 0.3),
    tail: glow('#f0656a', TOY.red, 0.35, 0.3),
    beacon: glow('#ffb072', '#ff7a1f', 0.9, 0.3),
    red: paint(TOY.red, 0.5),
    strap: paint(TOY.yellow, 0.55),
    // the mill's own set
    cane: toyMat(MILL.cane, {rough: 0.78}),
    caneDeep: toyMat(MILL.caneDeep, {rough: 0.8}),
    caneDry: toyMat(MILL.caneDry, {rough: 0.85}),
    caneCut: toyMat(MILL.caneCut, {rough: 0.72}),
    bagasse: toyMat(MILL.bagasse, {rough: 0.92}),
    tank: paint(MILL.tank, 0.52),
    tankDeep: paint(MILL.tankDeep, 0.56),
    millSteel: toyMat(MILL.steel, {rough: 0.5, metal: 0.15}),
    millSteelDeep: toyMat(MILL.steelDeep, {rough: 0.55, metal: 0.15}),
    syrup: toyMat(MILL.syrup, {rough: 0.5}),
    concrete: toyMat(Y.concrete, {rough: 0.88}),
    concreteDeep: toyMat(Y.concreteDeep, {rough: 0.9}),
  };
  return MM;
}

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
function textTex(text, {fg = C.text, bg = null, weight = 800, px = 96, pad = 26} = {}) {
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
/** the Caneline mark: a rounded blue square with a white cane stalk and two leaves */
function drawMark(g, x, y, s) {
  g.save();
  g.fillStyle = TOY.blue;
  g.beginPath();
  g.roundRect(x, y, s, s, s * 0.26);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.22)';
  g.beginPath();
  g.roundRect(x + s * 0.52, y, s * 0.48, s, [0, s * 0.26, s * 0.26, 0]);
  g.fill();
  g.strokeStyle = '#ffffff';
  g.lineCap = 'round';
  g.lineWidth = s * 0.11;
  g.beginPath();
  g.moveTo(x + s * 0.5, y + s * 0.84);
  g.lineTo(x + s * 0.5, y + s * 0.2);
  g.stroke();
  g.lineWidth = s * 0.08;
  for (const d of [-1, 1]) {
    g.beginPath();
    g.moveTo(x + s * 0.5, y + s * 0.52);
    g.quadraticCurveTo(x + s * (0.5 + d * 0.3), y + s * 0.4, x + s * (0.5 + d * 0.34), y + s * 0.2);
    g.stroke();
  }
  g.restore();
}
/** the wordmark: the mark + CANELINE (heavy), optional sub line */
function brandTex({fg = C.text, sub = null} = {}) {
  const key = `brand|${fg}|${sub}`;
  if (TEX.has(key)) return TEX.get(key);
  const H = 256;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `800 ${H * 0.44}px ${FONT}`;
  const w1 = probe.measureText('CANELINE').width;
  const ms = H * 0.72;
  const W = Math.ceil(ms + H * 0.16 + w1 + 24);
  return canvasTex(key, W, H, (g) => {
    const y0 = (H - ms) / 2 - (sub ? H * 0.07 : 0);
    drawMark(g, 8, y0, ms);
    g.fillStyle = fg;
    g.textBaseline = 'middle';
    const tx = 8 + ms + H * 0.16;
    g.font = `800 ${H * 0.44}px ${FONT}`;
    g.fillText('CANELINE', tx, H / 2 + H * 0.02 - (sub ? H * 0.1 : 0));
    if (sub) {
      g.globalAlpha = 0.75;
      g.font = `600 ${H * 0.145}px ${FONT}`;
      g.fillText(sub, tx + 4, H * 0.82);
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
const sphere = (r) => cg(`sp|${r}`, () => new THREE.SphereGeometry(r, 18, 12));
const dome = (r) => cg(`dome|${r}`, () => new THREE.SphereGeometry(r, 20, 9, 0, PI * 2, 0, PI / 2));
const planeG = (w, h) => cg(`pl|${w.toFixed(3)}|${h.toFixed(3)}`, () => new THREE.PlaneGeometry(w, h));
/**
 * A side profile x0..x1 by y0..y1 with corner radii rc = [rear-bottom, front-bottom, front-top, rear-top] and wheel
 * arches [[x, cy, R]] cut into the bottom edge. Inset by the bevel b so the extruded walls land on the outline.
 */
function profile(x0, x1, y0, y1, {arches = [], rc = [0.15, 0.15, 0.15, 0.15]} = {}, b = 0) {
  x0 += b;
  x1 -= b;
  y0 += b;
  y1 -= b;
  const [r0, r1, r2, r3] = rc.map((r) => Math.max(0.02, r - b));
  const s = new THREE.Shape();
  s.moveTo(x0 + r0, y0);
  for (const [ax, cy, R0] of [...arches].sort((p, q) => p[0] - q[0])) {
    const R = R0 + b;
    const a = Math.asin(clamp((y0 - cy) / R, -1, 1));
    s.lineTo(ax - R * Math.cos(a), y0);
    s.absarc(ax, cy, R, PI - a, a, true);
  }
  s.lineTo(x1 - r1, y0);
  s.absarc(x1 - r1, y0 + r1, r1, -PI / 2, 0, false);
  s.lineTo(x1, y1 - r2);
  s.absarc(x1 - r2, y1 - r2, r2, 0, PI / 2, false);
  s.lineTo(x0 + r3, y1);
  s.absarc(x0 + r3, y1 - r3, r3, PI / 2, PI, false);
  s.lineTo(x0, y0 + r0);
  s.absarc(x0 + r0, y0 + r0, r0, PI, PI * 1.5, false);
  return s;
}
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
/** a shape drawn in the yz plane (shape x = -z, shape y = y) extruded along x, centred */
function extrudeX(key, makeShape, len, b = 0.04) {
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

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
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
  /** a rounded box centred at x, y, z */
  box(mat, w, h, d, x = 0, y = 0, z = 0, r) {
    return this.add(mat, rb(w, h, d, r), x, y, z);
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
  /** a square bar with rounded edges between two points (cage posts, rails) */
  bar(mat, a, b, t = 0.12) {
    const A = V3(...a);
    const d = V3(...b).sub(A);
    const len = d.length();
    _q.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize());
    return this.put(mat, rb(t, len + t, t, t * 0.4), _m.compose(A.addScaledVector(d, 0.5), _q, _s.set(1, 1, 1)));
  }
  /** a flat print of width w, height h facing +z, turned by ry (rx tips it face-up) */
  print(mat, w, h, x, y, z, ry = 0, rx = 0) {
    return this.add(mat, planeG(w, h), x, y, z, rx, ry, 0);
  }
  /** a texture printed at height h, facing +z turned by ry */
  printTex(tex, h, x, y, z, ry = 0, rx = 0) {
    const a = tex.image.width / tex.image.height;
    return this.print(decalMat(tex), h * a, h, x, y, z, ry, rx);
  }
  /** a text plate of height h, facing +z turned by ry */
  text(text, opts, h, x, y, z, ry = 0) {
    return this.printTex(textTex(text, opts), h, x, y, z, ry);
  }
  /** the wordmark as a print of height h, facing +z turned by ry */
  brand(opts, h, x, y, z, ry = 0) {
    return this.printTex(brandTex(opts), h, x, y, z, ry);
  }
  /** a print of text on both sides of a body at +-z (s > 0 faces +z) */
  sides(fn, z) {
    for (const s of [-1, 1]) fn(s, s * z, s > 0 ? 0 : PI);
    return this;
  }
  /** an orange beacon on a dark ring */
  beacon(x, y, z, r = 0.14) {
    const M = mats();
    this.cyl(M.ink, r * 1.05, r * 1.15, r * 0.5, x, y + r * 0.25, z, 'y', 18);
    return this.add(M.beacon, dome(r), x, y + r * 0.5, z);
  }
  /** a pin through a joint: a soft steel cylinder along z with dark caps */
  pin(x, y, z, r, len) {
    const M = mats();
    return this.rcyl(M.steel, r, r, len, x, y, z, 'z', r * 0.3, 20);
  }
  /** a ladder up a flank: two stiles along y at x, z +- w/2, rungs every 0.36 */
  ladder(x, y0, y1, z = 0, w = 0.46) {
    const M = mats();
    for (const s of [-1, 1]) this.ext(M.ink, x - 0.04, x + 0.04, y0, y1, z + s * w * 0.5 - 0.035, z + s * w * 0.5 + 0.035, 0.02);
    for (let y = y0 + 0.3; y < y1 - 0.1; y += 0.36) this.ext(M.ink, x - 0.03, x + 0.03, y - 0.025, y + 0.025, z - w * 0.5, z + w * 0.5, 0.012);
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
const instanced = (geo, mat, n) => {
  const m = new THREE.InstancedMesh(geo, mat, n);
  m.castShadow = m.receiveShadow = true;
  return m;
};

// ================================================================ noise and seeded randomness
function hash2(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed + 1, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function vnoise(x, y, seed = 0) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}
function fbm(x, y, seed = 0, oct = 3) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  let n = 0;
  for (let o = 0; o < oct; o++) {
    s += a * vnoise(x * f + o * 13.7, y * f - o * 7.3, seed + o * 31);
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return s / n;
}
const rng = (seed) => {
  let r = (Math.abs(seed) * 104729 + 7) % 233280;
  return () => (r = (r * 9301 + 49297) % 233280) / 233280;
};

// ================================================================ wheels (the shared kit, unchanged)
/** a chunky tyre with round shoulders, axis along z */
function tyreGeo(r, w) {
  return cg(`tyre|${r}|${w}`, () => {
    const ri = r * 0.54;
    const hw = w / 2;
    const c = Math.min(hw * 0.78, (r - ri) * 0.62);
    const pts = [V2(ri, -hw * 0.84), V2((ri + r - c) / 2, -hw * 1.0)];
    for (let i = 0; i <= 7; i++) {
      const a = -PI / 2 + (PI / 2) * (i / 7);
      pts.push(V2(r - c + c * Math.cos(a), -hw + c + c * Math.sin(a)));
    }
    for (let i = 0; i <= 7; i++) {
      const a = (PI / 2) * (i / 7);
      pts.push(V2(r - c + c * Math.cos(a), hw - c + c * Math.sin(a)));
    }
    pts.push(V2((ri + r - c) / 2, hw * 1.0), V2(ri, hw * 0.84));
    const g = new THREE.LatheGeometry(pts, 44);
    g.rotateX(PI / 2);
    return g;
  });
}
/** the light hub disc with a stepped centre, both faces */
function hubGeo(r, w) {
  return cg(`hub|${r}|${w}`, () => {
    const P = new Parts();
    const ri = r * 0.54;
    P.cyl(null, ri + 0.004, ri + 0.004, w * 0.76, 0, 0, 0, 'z', 36);
    P.cyl(null, ri * 0.8, ri * 0.86, w * 0.84, 0, 0, 0, 'z', 32);
    return mergeGeometries(P.map.get(null), false);
  });
}
/** the dark cap and 5 nuts, so a turning wheel reads as turning */
function capGeo(r, w) {
  return cg(`cap|${r}|${w}`, () => {
    const P = new Parts();
    const ri = r * 0.54;
    P.cyl(null, ri * 0.3, ri * 0.3, w * 0.9, 0, 0, 0, 'z', 24);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * PI * 2;
      P.cyl(null, ri * 0.075, ri * 0.075, w * 0.88, Math.cos(a) * ri * 0.55, Math.sin(a) * ri * 0.55, 0, 'z', 8);
    }
    return mergeGeometries(P.map.get(null), false);
  });
}
/** one wheel: a group (tyre, hub, cap) spinning about its local z, centred at its axle */
function makeWheel(r, w) {
  const M = mats();
  const g = new THREE.Group();
  part(tyreGeo(r, w), M.tyre, g);
  part(hubGeo(r, w), M.hub, g);
  part(capGeo(r, w), M.hubCap, g);
  g.userData.r = r;
  return g;
}
/** a pair of wheels at x, +-z; steer = true puts each on a pivot */
function axle(parent, list, r, w, x, z, steer = null) {
  for (const sz of [-1, 1]) {
    const wh = makeWheel(r, w);
    if (steer) {
      const pivot = new THREE.Group();
      pivot.position.set(x, r, sz * z);
      pivot.add(wh);
      parent.add(pivot);
      steer.push(pivot);
    } else {
      wh.position.set(x, r, sz * z);
      parent.add(wh);
    }
    list.push(wh);
  }
}
const roller = (wheels) => (d) => {
  for (const w of wheels) w.rotation.z = -d / w.userData.r;
};
const steerer = (pivots) => (a) => {
  for (const p of pivots) p.rotation.y = a;
};

/** a hydraulic ram between two points in parent's frame: dark barrel + steel rod; returns set(a, b) */
function ram(parent, rBarrel = 0.1, lBarrel = 1.2) {
  const M = mats();
  const barrel = part(cg(`ramb|${rBarrel}|${lBarrel}`, () => new THREE.CylinderGeometry(rBarrel, rBarrel, lBarrel, 16).rotateZ(-PI / 2).translate(lBarrel / 2, 0, 0)), M.ink, parent);
  const rod = part(cg(`ramr|${rBarrel}`, () => new THREE.CylinderGeometry(rBarrel * 0.55, rBarrel * 0.55, 1, 12).rotateZ(-PI / 2).translate(0.5, 0, 0)), M.steel, parent);
  const _d = new THREE.Vector3();
  const _qq = new THREE.Quaternion();
  return (a, b) => {
    _d.subVectors(b, a);
    const len = _d.length();
    _d.normalize();
    _qq.setFromUnitVectors(V3(1, 0, 0), _d);
    barrel.position.copy(a);
    barrel.quaternion.copy(_qq);
    rod.position.copy(b);
    rod.quaternion.copy(_qq).multiply(new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), PI));
    rod.scale.set(Math.max(0.05, len - lBarrel * 0.6), 1, 1);
  };
}

// ================================================================ the cab-over cab (the airport box truck's, unchanged)
/**
 * The reference's truck cab: a chunky rounded box over the front axle, a big dark windshield, a dark side window close
 * to the front corner, a dark grille with light slats, cream lamps at the lower corners, a light bumper, black mirrors.
 */
function cab(P, {x0, x1, y0 = 0.62, top, W, color, wheelX, wheelR, stripe = null, seam}) {
  const M = mats();
  const b = 0.17;
  const key = [x0, x1, y0, top, W, wheelX, wheelR].join('|');
  P.add(paint(color, 0.46), extrude(`cab|${key}`, () => profile(x0, x1, y0, top, {arches: [[wheelX, wheelR, wheelR + 0.15]], rc: [0.14, 0.34, 0.44, 0.34]}, b), W, b));
  const hw = W / 2;
  const H = top - y0;
  const wt = Math.min(top - 0.12 * H, top - 0.46);
  const wb = top - 0.5 * H;
  P.ext(M.glass, x1 - 0.08, x1 + 0.035, wb, wt, -hw + 0.27, hw - 0.27, 0.05);
  for (const s of [-1, 1]) {
    P.ext(M.glass, x1 - Math.min(1.62, (x1 - x0) * 0.56), x1 - 0.34, wb, wt, s > 0 ? hw - 0.06 : -hw - 0.035, s > 0 ? hw + 0.035 : -hw + 0.06, 0.05);
    P.ext(paint(seam), x1 - Math.min(1.8, (x1 - x0) * 0.62), x1 - Math.min(1.76, (x1 - x0) * 0.62) + 0.04, y0 + 0.85, top - 0.3, s > 0 ? hw - 0.02 : -hw - 0.012, s > 0 ? hw + 0.012 : -hw + 0.02, 0.008);
    P.ext(M.ink, x1 - 1.45, x1 - 1.15, wb - 0.3, wb - 0.22, s > 0 ? hw - 0.02 : -hw - 0.04, s > 0 ? hw + 0.04 : -hw + 0.02, 0.02);
    P.bar(M.ink, [x1 - 0.2, wt - 0.25, s * (hw - 0.05)], [x1 - 0.05, wt - 0.25, s * (hw + 0.36)], 0.07);
    P.ext(M.ink, x1 - 0.12, x1 + 0.02, wt - 0.95, wt - 0.12, s * (hw + 0.32) - 0.1, s * (hw + 0.32) + 0.1, 0.05);
    if (stripe) P.ext(paint(stripe, 0.46), x0 + 0.22, x1 - 0.3, wb - 0.55, wb - 0.33, s > 0 ? hw - 0.02 : -hw - 0.02, s > 0 ? hw + 0.02 : -hw + 0.02, 0.01);
  }
  const gb = y0 + 0.18 * H;
  const gt = wb - 0.07 * H;
  P.ext(M.ink, x1 - 0.06, x1 + 0.04, gb, gt, -0.92, 0.92, 0.06);
  const n = 5;
  for (let k = 0; k < n; k++) P.ext(M.bumper, x1 + 0.01, x1 + 0.065, gb + ((gt - gb) * (k + 0.55)) / (n + 0.1) - 0.03, gb + ((gt - gb) * (k + 0.55)) / (n + 0.1) + 0.03, -0.8, 0.8, 0.02);
  for (const s of [-1, 1]) P.ext(M.lamp, x1 - 0.05, x1 + 0.045, gb, gb + 0.1 * H, s > 0 ? hw - 0.62 : -hw + 0.2, s > 0 ? hw - 0.2 : -hw + 0.62, 0.06);
  P.ext(M.bumper, x1 - 0.3, x1 + 0.28, y0 - 0.06, y0 + 0.56, -hw - 0.08, hw + 0.08, 0.2);
}

// ================================================================ cane: stalks, beds and clumps
/**
 * A bed of cut cane lying along x: `layers` courses of stalks in a rounded mound L long, W wide, H tall, origin at the
 * middle of its base. Merged per material and cached, so a truck, a trailer and a grab can all carry one for free.
 */
function caneBed(key, {L, W, H, seed = 1, layers = 4, dry = 0.2, straps = 0, r0 = 0.085}) {
  const M = mats();
  return tpl(`canebed|${key}`, (P) => {
    const R = rng(seed + 11);
    for (let i = 0; i < layers; i++) {
      const u = (i + 0.5) / layers;
      const y = u * H;
      const hw = (W / 2) * Math.sqrt(Math.max(0.06, 1 - u * u * 0.9));
      const hl = (L / 2) * (0.99 - 0.14 * u * u);
      const m = Math.max(2, Math.round((hw * 2) / 0.27));
      for (let k = 0; k < m; k++) {
        const z = -hw + ((k + 0.5) / m) * 2 * hw;
        const r = r0 + 0.03 * R();
        const len = hl * 2 * (0.82 + 0.18 * R());
        const x = (R() - 0.5) * (hl * 2 - len);
        const yaw = (R() - 0.5) * 0.12;
        const mat = R() < dry * (0.35 + u) ? M.caneDry : R() < 0.52 ? M.cane : M.caneDeep;
        P.add(mat, cylG(r, r, 1, 8), x, y + (R() - 0.5) * 0.09, z, 0, yaw, PI / 2, 1, len, 1);
      }
    }
    // the strapping over the crown: a half hoop either end of the load
    for (let s = 0; s < straps; s++) {
      const x = straps === 1 ? 0 : lerp(-L * 0.28, L * 0.28, s / (straps - 1));
      P.add(M.strap, cg('hoop', () => new THREE.TorusGeometry(1, 0.055, 7, 28, PI).rotateY(PI / 2)), x, H * 0.3, 0, 0, 0, 0, 1, H * 0.66, W * 0.53);
    }
  });
}

// ================================================================ heaps: the cane pile and the bagasse pile
let MOUND = null;
const moundMat = () => (MOUND ??= new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.93}));
/**
 * The height field of a long heap: a ridge with rounded ends, like a line of truck loads dumped side by side.
 * H at the crest line, 0 at the toe, negative outside it. Pure in x, z.
 */
function ridge({L, W, H, seed, lumpK}) {
  const R = W / 2;
  const a = Math.max(0.001, L / 2 - R);
  return (x, z) => {
    const dx = Math.max(0, Math.abs(x) - a);
    const d = Math.hypot(dx, z) / R;
    if (d >= 1) return -0.1;
    let h = H * (1 - Math.pow(d, 1.7));
    h += H * lumpK * fbm(x * 0.5 + seed * 3.1, z * 0.5, seed + 4, 3) * sat(h / (H * 0.3));
    return h;
  };
}
/** the ridge as a vertex-coloured mesh; the flat skirt round the toe is dropped so no square of ground shows */
function moundMesh(key, dims, cTop, cFlank, cCrown) {
  const f = ridge(dims);
  const geo = cg(`mound|${key}`, () => {
    const {L, W, H, seed} = dims;
    const nx = 88;
    const nz = 46;
    const g = new THREE.PlaneGeometry(L + 1.6, W + 1.6, nx, nz).rotateX(-PI / 2);
    g.deleteAttribute('normal');
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, Math.max(-0.06, f(p.getX(i), p.getZ(i))));
    const ix = g.index.array;
    const keep = [];
    for (let t = 0; t < ix.length; t += 3) if (Math.max(p.getY(ix[t]), p.getY(ix[t + 1]), p.getY(ix[t + 2])) > -0.04) keep.push(ix[t], ix[t + 1], ix[t + 2]);
    g.setIndex(keep);
    g.computeVertexNormals();
    const nn = g.attributes.normal;
    const cols = new Float32Array(p.count * 3);
    const a = new THREE.Color(cTop);
    const b = new THREE.Color(cFlank);
    const c2 = new THREE.Color(cCrown);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      c.copy(a).lerp(b, sat((1 - nn.getY(i)) / 0.34));
      c.lerp(c2, 0.55 * sat((y - H * 0.5) / (H * 0.5)));
      const gr = 0.94 + 0.08 * sat(y / (H * 0.6)) + 0.04 * fbm(p.getX(i) * 0.6, p.getZ(i) * 0.6, dims.seed + 2, 2);
      cols[i * 3] = c.r * gr;
      cols[i * 3 + 1] = c.g * gr;
      cols[i * 3 + 2] = c.b * gr;
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return g;
  });
  const m = new THREE.Mesh(geo, moundMat());
  m.castShadow = m.receiveShadow = true;
  return {mesh: m, f};
}
/** volume (toy cubic metres) -> ridge dimensions, aspect = L / W, hk = H / W */
function ridgeDims(volume, seed, aspect, hk, lumpK) {
  const k = 0.6155 * (aspect - 1) + 0.349; // the ridge's volume = H * W * W * k
  const W = Math.cbrt(Math.max(4, volume) / (hk * k));
  return {L: aspect * W, W, H: hk * W, seed, lumpK};
}

export function buildCanePile({volume = 400, seed = 1} = {}) {
  const M = mats();
  const dims = ridgeDims(volume, seed, 2.6, 0.42, 0.16);
  const group = new THREE.Group();
  group.name = 'cane-pile';
  const {mesh, f} = moundMesh(`cane|${volume}|${seed}`, dims, MILL.caneDeep, MILL.caneDeep, MILL.caneDry);
  group.add(mesh);
  // The stalks ARE the pile, not a dressing on it. Cut cane is stacked in long billets lying parallel to each other
  // and to the heap's long axis, so they run along x with only a few degrees of scatter, they are chunky at toy
  // scale, and every one shows a pale cut face at each end. That wall of cut ends is the single detail that makes a
  // green heap read as cane rather than as scrub.
  const R = rng(seed + 31);
  const wet = [];
  const dry = [];
  const n = Math.round(clamp((dims.L * dims.W) / 2.1, 70, 230));
  for (let i = 0; i < n * 3 && wet.length + dry.length < n; i++) {
    const len = dims.L * (0.3 + 0.24 * R());
    const x = (R() - 0.5) * (dims.L - len * 0.52);
    const z = (R() - 0.5) * dims.W * 0.96;
    const ha = f(x - len / 2, z);
    const hb = f(x + len / 2, z);
    if (Math.min(ha, hb) < 0.12) continue;
    const r = 0.24 + 0.1 * R();
    const h = (ha + hb) / 2;
    const row = [x, h + r * 0.35, z, (R() - 0.5) * 0.26, PI / 2 + Math.atan((hb - ha) / len), len, r];
    (R() < 0.16 + 0.5 * sat((h - dims.H * 0.5) / (dims.H * 0.5)) ? dry : wet).push(row);
  }
  // a few loose stalks spilled at the toe
  for (let i = 0; i < 10; i++) {
    const len = dims.L * (0.18 + 0.12 * R());
    const sx = R() < 0.5 ? -1 : 1;
    wet.push([sx * dims.L * (0.3 + 0.2 * R()), 0.2, (R() - 0.5) * dims.W * 1.14, (R() - 0.5) * 1.4, PI / 2, len, 0.24]);
  }
  const m4 = new THREE.Matrix4();
  const e = new THREE.Euler();
  const q = new THREE.Quaternion();
  const axis = new THREE.Vector3();
  const ends = [];
  for (const [list, mat] of [
    [wet, M.cane],
    [dry, M.caneDry],
  ]) {
    if (!list.length) continue;
    const im = instanced(cylG(1, 1, 1, 7), mat, list.length);
    list.forEach(([x, y, z, yaw, rz, len, r], i) => {
      e.set(0, yaw, rz);
      q.setFromEuler(e);
      im.setMatrixAt(i, m4.compose(V3(x, y, z), q, V3(r, len, r)));
      axis.set(0, 1, 0).applyQuaternion(q).multiplyScalar(len / 2);
      for (const s of [-1, 1]) ends.push([x + axis.x * s, y + axis.y * s, z + axis.z * s, q.clone(), r]);
    });
    im.instanceMatrix.needsUpdate = true;
    group.add(im);
  }
  if (ends.length) {
    const im = instanced(cylG(1, 1, 1, 7), M.caneCut, ends.length);
    ends.forEach(([x, y, z, qq, r], i) => im.setMatrixAt(i, m4.compose(V3(x, y, z), qq, V3(r * 1.03, 0.12, r * 1.03))));
    im.instanceMatrix.needsUpdate = true;
    group.add(im);
  }
  group.userData.dims = dims;
  return group;
}

export function buildBagassePile({volume = 300, seed = 1} = {}) {
  const M = mats();
  const dims = ridgeDims(volume, seed, 1.7, 0.44, 0.2);
  const group = new THREE.Group();
  group.name = 'bagasse-pile';
  const {mesh, f} = moundMesh(`bag|${volume}|${seed}`, dims, MILL.bagasse, MILL.caneDry, MILL.bagasse);
  group.add(mesh);
  // tufts of loose fibre: flattened lumps scattered over the crown and the toe
  const R = rng(seed + 57);
  const n = Math.round(clamp(dims.L * dims.W * 0.42, 20, 70));
  const im = instanced(lumpGeo(seed + 3, {flat: 0.45, rough: 0.3, detail: 2}), M.bagasse, n);
  const m4 = new THREE.Matrix4();
  const e = new THREE.Euler();
  const q = new THREE.Quaternion();
  let k = 0;
  for (let i = 0; i < n * 3 && k < n; i++) {
    const x = (R() - 0.5) * dims.L * 1.1;
    const z = (R() - 0.5) * dims.W * 1.1;
    const h = f(x, z);
    if (h < 0.05) continue;
    const s = 0.3 + 0.42 * R();
    e.set(0, R() * PI, 0);
    q.setFromEuler(e);
    im.setMatrixAt(k++, m4.compose(V3(x, h - s * 0.2, z), q, V3(s, s * 0.6, s * 0.85)));
  }
  for (; k < n; k++) im.setMatrixAt(k, m4.compose(V3(0, -50, 0), q, V3(0.001, 0.001, 0.001)));
  im.instanceMatrix.needsUpdate = true;
  group.add(im);
  group.userData.dims = dims;
  return group;
}

/** a lump of fibre: a squashed lumpy sphere of radius 1, flat underneath, deterministic per seed */
function lumpGeo(seed = 1, {flat = 0.15, rough = 0.16, detail = 3} = {}) {
  return cg(`lump|${seed}|${flat}|${rough}|${detail}`, () => {
    let g = new THREE.IcosahedronGeometry(1, detail);
    g.deleteAttribute('normal');
    g.deleteAttribute('uv');
    g = mergeVertices(g);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    const s = seed * 1.731;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n =
        Math.sin(v.x * 3.1 + s) * Math.sin(v.y * 2.7 + s * 0.7) * Math.sin(v.z * 3.3 + s * 1.3) * 0.6 +
        Math.sin(v.x * 6.3 - s * 0.4 + v.z * 4.1) * 0.25 +
        Math.sin(v.z * 7.7 + v.y * 5.3 + s) * 0.15;
      v.multiplyScalar(1 + rough * n);
      if (v.y < 0) v.y *= flat;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(p.count * 2), 2));
    return g;
  });
}

// ================================================================ the cane cage (shared by the truck and the trailer)
const CAGE = {
  top: 4.1, // the top rail: 2.6 above the deck
  deckY: 1.5,
  hz: 1.5, // the cage's half width (the tyres run outside it)
  post: 0.13,
};
/** the yellow slatted cage from x0 to x1 on a deck whose top is CAGE.deckY: floor, posts, rails, headboard, rear gate */
function cageInto(P, x0, x1, {headboard = true} = {}) {
  const M = mats();
  const hz = CAGE.hz;
  const top = CAGE.top;
  const d = CAGE.deckY;
  // the floor: a yellow plate on darker transverse bearers
  P.ext(M.yellow, x0, x1, d - 0.16, d, -hz, hz, 0.07);
  for (let x = x0 + 0.5; x < x1; x += 1.05) P.ext(M.yellowDeep, x - 0.1, x + 0.1, d - 0.26, d - 0.15, -hz + 0.04, hz - 0.04, 0.045);
  P.ext(M.yellowDeep, x0 + 0.04, x1 - 0.04, d - 0.01, d + 0.02, -hz + 0.1, hz - 0.1, 0.008);
  // posts and rails down both sides
  const n = Math.max(3, Math.round((x1 - x0) / 1.08));
  for (const s of [-1, 1]) {
    for (let i = 0; i <= n; i++) {
      const x = lerp(x0 + 0.1, x1 - 0.1, i / n);
      P.ext(M.yellow, x - CAGE.post / 2, x + CAGE.post / 2, d, top, s * hz - 0.07, s * hz + 0.07, 0.05);
    }
    for (const y of [d + 0.62, d + 1.3, d + 1.98]) P.ext(M.yellowDeep, x0 + 0.02, x1 - 0.02, y - 0.055, y + 0.055, s * hz - 0.05, s * hz + 0.05, 0.025);
    P.ext(M.yellow, x0 - 0.04, x1 + 0.04, top - 0.17, top, s * hz - 0.095, s * hz + 0.095, 0.07);
    P.ext(M.yellowDeep, x0, x1, d + 0.04, d + 0.2, s * hz - 0.06, s * hz + 0.06, 0.05);
  }
  // the headboard behind the cab, and the rear gate
  if (headboard) {
    P.ext(M.yellow, x1 - 0.16, x1, d, top, -hz, hz, 0.07);
    for (const z of [-0.85, 0, 0.85]) P.ext(M.yellowDeep, x1 - 0.22, x1 - 0.14, d + 0.2, top - 0.2, z - 0.07, z + 0.07, 0.03);
  }
  P.ext(M.yellow, x0, x0 + 0.14, d, top, -hz, hz, 0.06);
  for (const y of [d + 0.62, d + 1.3, d + 1.98]) P.ext(M.yellowDeep, x0 - 0.03, x0 + 0.17, y - 0.06, y + 0.06, -hz + 0.05, hz - 0.05, 0.03);
  for (const s of [-1, 1]) P.ext(M.yellow, x0 - 0.02, x0 + 0.16, d, top, s * hz - 0.1, s * hz + 0.1, 0.06);
}

// ================================================================ the cane truck
export function buildCaneTruck({number = '18', livery = 'aurora', load = 1} = {}) {
  const M = mats();
  const L = liv(livery);
  const group = new THREE.Group();
  group.name = 'cane-truck';
  const W = 3.5;
  const R = 0.75;
  const WW = 0.56; // the tyre's width: the tyres run outside the cage, clear of its floor
  const cx1 = 4.52;
  const cx0 = cx1 - 2.95;
  const top = 4.1;
  const wheelX = cx1 - 1.65;
  const rearX = [-1.9, -3.35];
  const frontZ = 1.72;
  const rearZ = 1.82;
  const x0 = -4.62;
  const x1 = 1.46;
  const d = CAGE.deckY;
  tpl(`canetruck|${number}|${livery}`, (P) => {
    cab(P, {x0: cx0, x1: cx1, top, W, color: L.cab, wheelX, wheelR: R, stripe: L.stripe, seam: L.seam});
    // the chassis rails and their cross members, the fuel and battery boxes, the air tanks
    for (const s of [-1, 1]) P.ext(M.chassis, -4.72, cx0 + 0.62, 0.98, 1.36, s * 0.8 - 0.16, s * 0.8 + 0.16, 0.07);
    for (const x of [-4.2, -2.62, -0.6, 1.1]) P.ext(M.chassis, x - 0.12, x + 0.12, 1.04, 1.3, -0.72, 0.72, 0.04);
    for (const s of [-1, 1]) {
      P.ext(M.blue, -0.95, 0.9, 0.56, 1.3, s * 1.02, s * 1.5, 0.17);
      P.ext(M.blueLight, -0.8, 0.75, 1.27, 1.32, s * 1.08, s * 1.44, 0.02);
      P.rcyl(M.steel, 0.2, 0.2, 0.8, -2.0, 0.78, s * 1.26, 'x', 0.06, 20);
      // the mudguards over the tandem, well clear of the cage floor
      P.ext(M.yellow, rearX[1] - 0.95, rearX[0] + 0.95, 1.58, 1.72, s * 1.46, s * 2.16, 0.07);
      P.ext(M.yellowDeep, rearX[1] - 0.95, rearX[0] + 0.95, 1.46, 1.58, s * 2.08, s * 2.18, 0.05);
    }
    // the rear: a light bar with the lamps and the under-ride bar
    P.ext(M.chassis, -4.78, -4.56, 0.62, 0.92, -1.7, 1.7, 0.08);
    for (const s of [-1, 1]) P.ext(M.tail, -4.82, -4.75, 0.68, 0.86, s * 1.38 - 0.17, s * 1.38 + 0.17, 0.03);
    cageInto(P, x0, x1);
    // the prints: the fleet number on the cab doors, the wordmark along the cage's bottom rail
    for (const s of [-1, 1]) P.text(`T-${number}`, {fg: L.cab === TOY.white ? C.text : TOY.white, px: 110}, 0.3, cx0 + 0.56, 1.98, s * (W / 2 + 0.008), s > 0 ? 0 : PI);
    P.sides((s, z, ry) => P.brand({fg: C.text}, 0.42, -1.6, d + 0.12, z + s * 0.075, ry), CAGE.hz);
  }, group);

  // ---- the load: a bed of cane crowning over the top rail, strapped
  const bedL = x1 - x0 - 0.3;
  const loadCentre = (x0 + x1) / 2;
  const cane = caneBed(`truck|${number}`, {L: bedL, W: 3.2, H: 3.25, seed: 5, layers: 5, dry: 0.2, straps: 2});
  cane.position.set(loadCentre, d, 0);
  group.add(cane);
  let loadK = 1;
  const setLoad = (k) => {
    loadK = sat(k);
    cane.visible = loadK > 0.015;
    if (!cane.visible) return;
    // shrinks and slides toward the rear (-x) as it empties, so the tipping table can pour it out
    cane.position.set(loadCentre - (1 - loadK) * 1.5, d - 0.02, 0);
    cane.scale.set(0.62 + 0.38 * loadK, 0.3 + 0.7 * loadK, 0.74 + 0.26 * loadK);
  };
  setLoad(load);
  const wheels = [];
  const steer = [];
  axle(group, wheels, R, WW, wheelX, frontZ, steer);
  for (const x of rearX) axle(group, wheels, R, WW, x, rearZ);
  return {
    group,
    roll: roller(wheels),
    setSteer: steerer(steer),
    setLoad,
    deckY: d,
    dims: {length: 9.6, width: 2 * (rearZ + WW / 2), cabTop: top, railTop: CAGE.top, loadTop: d + 3.3, x0: -4.8, x1: 4.8},
  };
}

// ================================================================ the cane trailer
export function buildCaneTrailer({number = '18'} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'cane-trailer';
  const R = 0.75;
  const WW = 0.56;
  const x0 = -3.45;
  const x1 = 1.55;
  const d = CAGE.deckY;
  const rearX = [-1.35, -2.75];
  const dollyX = 0.75;
  tpl(`canetrailer|${number}`, (P) => {
    for (const s of [-1, 1]) P.ext(M.chassis, -3.55, 1.7, 0.98, 1.36, s * 0.8 - 0.16, s * 0.8 + 0.16, 0.07);
    for (const x of [-3.1, -2.05, -0.5, 1.2]) P.ext(M.chassis, x - 0.12, x + 0.12, 1.04, 1.3, -0.72, 0.72, 0.04);
    cageInto(P, x0, x1, {headboard: true});
    // the mudguards over the tandem and the dolly
    for (const s of [-1, 1]) {
      P.ext(M.yellow, rearX[1] - 0.95, rearX[0] + 0.95, 1.58, 1.72, s * 1.46, s * 2.16, 0.07);
      P.ext(M.yellowDeep, rearX[1] - 0.95, rearX[0] + 0.95, 1.46, 1.58, s * 2.08, s * 2.18, 0.05);
      P.ext(M.yellow, dollyX - 0.95, dollyX + 0.95, 1.58, 1.72, s * 1.36, s * 2.06, 0.07);
      P.ext(M.tail, -3.62, -3.55, 0.68, 0.86, s * 1.3 - 0.16, s * 1.3 + 0.16, 0.03);
    }
    P.ext(M.chassis, -3.58, -3.4, 0.62, 0.92, -1.6, 1.6, 0.08);
    // the drawbar: an A frame out to the eye, with a parking leg under it
    P.bar(M.chassis, [1.3, 1.1, 0.68], [3.1, 1.05, 0.12], 0.17);
    P.bar(M.chassis, [1.3, 1.1, -0.68], [3.1, 1.05, -0.12], 0.17);
    P.ext(M.chassis, 3.0, 3.4, 0.94, 1.16, -0.14, 0.14, 0.07);
    P.add(M.steel, cg('eye', () => new THREE.TorusGeometry(0.17, 0.055, 8, 22).rotateX(PI / 2)), 3.44, 1.05, 0, 0, 0, 0);
    P.ext(M.ink, 2.3, 2.46, 0.3, 1.0, -0.12, 0.12, 0.05);
    P.ext(M.shade, 2.2, 2.56, 0.18, 0.32, -0.2, 0.2, 0.05);
    P.sides((s, z, ry) => P.brand({fg: C.text}, 0.4, -1.0, d + 0.12, z + s * 0.075, ry), CAGE.hz);
  }, group);
  const cane = caneBed(`trailer|${number}`, {L: x1 - x0 - 0.3, W: 3.2, H: 3.25, seed: 9, layers: 5, dry: 0.2, straps: 2});
  const loadCentre = (x0 + x1) / 2;
  cane.position.set(loadCentre, d, 0);
  group.add(cane);
  const setLoad = (k) => {
    const s = sat(k);
    cane.visible = s > 0.015;
    if (!cane.visible) return;
    cane.position.set(loadCentre - (1 - s) * 1.1, d - 0.02, 0);
    cane.scale.set(0.62 + 0.38 * s, 0.3 + 0.7 * s, 0.74 + 0.26 * s);
  };
  setLoad(1);
  const wheels = [];
  const steer = [];
  axle(group, wheels, R, WW, dollyX, 1.62, steer);
  for (const x of rearX) axle(group, wheels, R, WW, x, 1.82);
  const hitch = new THREE.Object3D();
  hitch.position.set(3.45, 1.05, 0);
  group.add(hitch);
  return {group, roll: roller(wheels), setSteer: steerer(steer), setLoad, deckY: d, hitch, dims: {length: 7.0, width: 2 * (1.82 + WW / 2), railTop: CAGE.top, x0: -3.55, x1: 3.45}};
}

// ================================================================ the tipping table
export function buildTippingTable({number = 'T1'} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'tipping-table';
  const hingeX = 6.5;
  const pivotY = 0.2;
  const deckY = 0.9;
  const hz = 2.3;
  const DL = 13.0;
  const TILT = (53 * PI) / 180; // 53 deg, not 55: it keeps a full cane truck's cab roof under y = 12 at k = 1
  const dTop = deckY - pivotY; // the deck's top in the deck frame
  const dBot = dTop - 0.26;
  const rib = dBot - 0.18;
  // ---- the pit frame, the hinge pedestals, the ram feet and the approach ramp (static)
  tpl(`tiptable|${number}`, (P) => {
    for (const s of [-1, 1]) {
      // the pit's side walls, with bearing pads the deck rests on
      P.ext(M.blue, hingeX - DL - 0.2, hingeX + 0.2, 0, 0.44, s * hz + 0.04, s * hz + 0.34, 0.1);
      P.ext(M.blueLight, hingeX - DL - 0.2, hingeX + 0.2, 0.44, 0.5, s * hz + 0.06, s * hz + 0.32, 0.025);
      for (const x of [hingeX - 1.6, hingeX - 5.2, hingeX - 9.0, hingeX - 12.4]) P.ext(M.blueDeep, x - 0.4, x + 0.4, 0.34, pivotY + rib - 0.01, s * 1.1 - 0.22, s * 1.1 + 0.22, 0.06);
      // the hinge pedestal and its pin
      P.ext(M.blue, hingeX - 0.5, hingeX + 0.5, 0, pivotY + 0.12, s * 1.85 - 0.26, s * 1.85 + 0.26, 0.1);
      P.pin(hingeX, pivotY, s * 1.85, 0.17, 0.78);
      // the ram's foot pedestal, outside the deck
      P.ext(M.blue, hingeX - 1.95, hingeX - 1.25, 0, 0.55, s * 2.9 - 0.36, s * 2.9 + 0.36, 0.11);
      P.pin(hingeX - 1.6, 0.55, s * 2.9, 0.14, 0.5);
    }
    // the cross wall at the high end of the pit, and the pit floor
    P.ext(M.blue, hingeX - DL - 0.2, hingeX - DL + 0.1, 0, 0.44, -hz - 0.3, hz + 0.3, 0.1);
    P.ext(M.concreteDeep, hingeX - DL + 0.08, hingeX + 0.18, 0, 0.12, -hz - 0.02, hz + 0.02, 0.04);
    // The approach ramp on the east side: a bridge over the receiving hopper, built as two wheel runways under
    // the tyre tracks so the 3.0 down the centreline (z = -1.37 .. +1.37) stays open and the cane falls through it.
    for (const s of [-1, 1]) {
      P.add(M.concreteDeep, extrude(`tt-ramp|${number}`, () => roundedPoly([V2(hingeX + 0.16, deckY - 0.02), V2(hingeX + 2.9, 0.03), V2(hingeX + 2.9, 0.0), V2(hingeX + 0.16, 0.0)], 0.06), 0.9, 0.05), 0, 0, s * 1.82);
      P.ext(M.yellow, hingeX + 0.24, hingeX + 2.82, 0.02, 0.07, s * 2.26, s * 2.12, 0.02);
      // the trestle under the runways, so the bridge reads as a bridge
      for (const x of [hingeX + 1.1, hingeX + 2.3]) P.ext(M.shade, x - 0.16, x + 0.16, 0, 0.36, s * 1.4, s * 2.24, 0.06);
    }
    for (const x of [hingeX + 1.1, hingeX + 2.3]) P.ext(M.shade, x - 0.13, x + 0.13, 0.02, 0.2, -1.4, 1.4, 0.05);
    // the number plate on the pit wall
    P.text(`${number}`, {fg: TOY.white, px: 120}, 0.42, hingeX - 2.2, 0.26, hz + 0.35, 0);
  }, group);

  // ---- the deck: hinged about the pin at (hingeX, pivotY), running from x = -DL to 0 in its own frame
  const deck = new THREE.Group();
  deck.position.set(hingeX, pivotY, 0);
  group.add(deck);
  tpl(`tiptable-deck|${number}`, (P) => {
    P.ext(M.yellow, -DL, 0, dBot, dTop, -hz, hz, 0.1);
    // the ribs and cross beams under it
    for (const s of [-1, 1]) P.ext(M.yellowDeep, -DL + 0.1, -0.1, rib, dBot + 0.01, s * 1.1 - 0.26, s * 1.1 + 0.26, 0.07);
    for (let x = -DL + 0.8; x < -0.3; x += 1.5) P.ext(M.ink, x - 0.1, x + 0.1, rib + 0.03, dBot + 0.01, -hz + 0.2, hz - 0.2, 0.04);
    // the deck's yellow edge kerbs and the tread print; both stop short of the discharge edge, which stays clear
    for (const s of [-1, 1]) P.ext(M.yellowDeep, -DL, -1.1, dTop, dTop + 0.07, s * hz - 0.16, s * hz, 0.025);
    P.print(decalMat(canvasTex('tt-tread', 256, 256, (g, w, h) => {
      g.fillStyle = 'rgba(32,42,72,0.16)';
      for (let i = 0; i < 9; i++) g.fillRect(0, (i * h) / 9, w, h / 22);
    }, {repeat: true})), DL - 1.4, 2 * hz - 0.5, -DL / 2 - 0.5, dTop + 0.012, 0, 0, -PI / 2);
    // the wheel chocks at the high (west) end, in front of the reversed truck's front tyres (table x -3.80 / -4.25)
    for (const x of [-10.3, -10.75]) for (const s of [-1, 1]) {
      P.ext(M.yellow, x - 0.14, x + 0.14, dTop, dTop + 0.38, s * 1.72 - 0.42, s * 1.72 + 0.42, 0.09);
      P.ext(M.ink, x - 0.16, x + 0.16, dTop + 0.1, dTop + 0.2, s * 1.72 - 0.44, s * 1.72 + 0.44, 0.03);
    }
    for (const s of [-1, 1]) {
      // the wheel clamps: a chunky yellow yoke on a post at the deck edge, arching over the rear tandem tyres
      // (table x +1.90 and +3.35) with a pad bearing down on each. Static: the film never has to drive them.
      P.ext(M.yellow, -2.15, -1.95, dTop, dTop + 2.06, s * 2.06, s * 2.3, 0.08);
      P.ext(M.yellow, -5.2, -1.95, dTop + 1.8, dTop + 2.06, s * 1.78, s * 2.3, 0.1);
      for (const x of [-4.6, -3.15]) P.ext(M.yellowDeep, x - 0.19, x + 0.19, dTop + 1.73, dTop + 1.86, s * 1.84, s * 2.24, 0.05);
      P.pin(-2.05, dTop + 0.22, s * 2.18, 0.1, 0.36);
      P.ext(M.ink, -5.34, -5.14, dTop + 1.74, dTop + 2.1, s * 1.84, s * 2.24, 0.06);
      // the outriggers the rams push on
      P.ext(M.yellow, -4.55, -3.85, dBot - 0.18, dTop, s * hz - 0.05, s * 2.95, 0.08);
      P.pin(-4.2, dBot - 0.05, s * 2.78, 0.14, 0.46);
    }
  }, deck);
  const rams = [-1, 1].map((s) => {
    const g = new THREE.Group();
    group.add(g);
    const set = ram(g, 0.23, 1.7);
    return {s, set};
  });
  const _a = new THREE.Vector3();
  const _b = new THREE.Vector3();
  const setTilt = (k) => {
    const a = sat(k) * TILT;
    deck.rotation.z = -a;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    // the ram's top pin, local (-4.2, dBot - 0.05), rotated about the hinge
    const lx = -4.2;
    const ly = dBot - 0.05;
    const tx = hingeX + lx * ca + ly * sa;
    const ty = pivotY - lx * sa + ly * ca;
    for (const r of rams) {
      _a.set(hingeX - 1.6, 0.55, r.s * 2.9);
      _b.set(tx, ty, r.s * 2.78);
      r.set(_a, _b);
    }
  };
  setTilt(0);
  // seat(): put a truck (or anything) on the deck so setTilt carries it. x is its centre in the table group's
  // frame when flat, yaw its heading; a cane truck reversing onto the table is seat(truck.group) exactly.
  const seat = (obj, {x = 0, z = 0, yaw = PI} = {}) => {
    obj.position.set(x - hingeX, dTop, z);
    obj.rotation.set(0, yaw, 0);
    deck.add(obj);
    return obj;
  };
  return {group, deck, seat, setTilt, deckY, deckSpan: {x0: hingeX - DL, x1: hingeX, z: hz}, hingeX, tilt: TILT};
}

// ================================================================ the weighbridge
export function buildWeighbridge({label = 'WB-1'} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'weighbridge';
  const deckY = 0.25;
  const hz = 2.3;
  const hx = 8.0;
  const boomOpen = 1.48;
  tpl(`weighbridge|${label}`, (P) => {
    // the deck: a light plate in a dark frame, yellow edge stripes, a flush ramp either end
    P.ext(M.concrete, -hx, hx, 0, deckY, -hz, hz, 0.07);
    P.ext(M.millSteel, -hx + 0.14, hx - 0.14, deckY - 0.04, deckY + 0.02, -hz + 0.14, hz - 0.14, 0.03);
    for (const s of [-1, 1]) {
      P.ext(M.yellow, -hx, hx, deckY - 0.01, deckY + 0.035, s * hz - 0.22, s * hz - 0.04, 0.015);
      P.add(M.concreteDeep, extrude(`wb-ramp|${label}`, () => roundedPoly([V2(0.02, 0.0), V2(2.2, 0.0), V2(2.2, 0.025), V2(0.02, deckY - 0.01)], 0.05), 2 * hz, 0.04), s * hx, 0, 0, 0, s > 0 ? 0 : PI);
      // the load-cell plinths you can see under the deck edge
      for (const x of [-6.0, -2.0, 2.0, 6.0]) P.ext(M.shade, x - 0.4, x + 0.4, 0, 0.06, s * hz - 0.5, s * hz - 0.1, 0.02);
    }
    // the kiosk on the +z side: white with a blue band and a blue roof, dark glass all round
    const kx = -4.2;
    const kz = hz + 2.3;
    P.ext(M.white, kx - 1.8, kx + 1.8, 0.12, 2.9, kz - 1.5, kz + 1.5, 0.16);
    P.ext(M.blue, kx - 1.84, kx + 1.84, 0.12, 0.72, kz - 1.54, kz + 1.54, 0.16);
    P.ext(M.roof, kx - 2.0, kx + 2.0, 2.9, 3.14, kz - 1.7, kz + 1.7, 0.1);
    P.ext(M.blueLight, kx - 2.06, kx + 2.06, 3.14, 3.26, kz - 1.76, kz + 1.76, 0.06);
    P.ext(M.shade, kx - 2.1, kx + 2.1, 0, 0.14, kz - 1.8, kz + 1.8, 0.05);
    P.ext(M.glass, kx - 1.5, kx + 1.5, 1.2, 2.5, kz - 1.56, kz - 1.46, 0.05); // the window over the lane
    for (const s of [-1, 1]) P.ext(M.glass, kx + s * 1.86, kx + s * 1.82, 1.3, 2.4, kz - 1.0, kz + 1.0, 0.05);
    P.ext(M.ink, kx - 0.6, kx + 0.6, 0.14, 2.3, kz + 1.46, kz + 1.56, 0.06); // the door
    P.printTex(brandTex({fg: C.text, sub: 'Weighbridge'}), 0.4, kx, 2.66, kz - 1.58, PI);
    P.text(label, {fg: TOY.white, px: 110}, 0.34, kx + 1.2, 0.42, kz - 1.58, PI);
    P.beacon(kx, 3.3, kz, 0.16);
    // the lit display board on two posts, facing the lane and the approach
    const bx = 5.6;
    const bz = hz + 1.2;
    for (const s of [-1, 1]) P.ext(M.blue, bx + s * 1.1 - 0.11, bx + s * 1.1 + 0.11, 0, 2.5, bz - 0.11, bz + 0.11, 0.05);
    P.ext(M.ink, bx - 1.35, bx + 1.35, 2.3, 3.5, bz - 0.16, bz + 0.16, 0.09);
    P.ext(M.shade, bx - 1.45, bx + 1.45, 3.5, 3.62, bz - 0.22, bz + 0.22, 0.05);
  }, group);
  // the board's two lit faces (emissive, so they read at a glance)
  const boardTex = labelTexture('32.4 t', {color: Y.boardLit, bg: Y.board, w: 512, h: 224, font: '800 132px Inter, system-ui, sans-serif'});
  const boardMat = new THREE.MeshStandardMaterial({map: boardTex, emissive: new THREE.Color(Y.boardLit), emissiveMap: boardTex, emissiveIntensity: 0.85, roughness: 0.4});
  for (const s of [-1, 1]) {
    const m = part(planeG(2.3, 1.0), boardMat, group);
    m.position.set(5.6, 2.9, hz + 1.2 + s * 0.175);
    m.rotation.y = s > 0 ? 0 : PI;
    m.castShadow = false;
  }
  // ---- the barrier boom at the exit end
  const post = new THREE.Group();
  post.position.set(8.6, 0, -hz - 0.7);
  group.add(post);
  tpl('wb-boompost', (P) => {
    P.ext(M.blue, -0.26, 0.26, 0, 1.5, -0.26, 0.26, 0.1);
    P.ext(M.blueLight, -0.3, 0.3, 1.5, 1.62, -0.3, 0.3, 0.05);
    P.ext(M.shade, -0.45, 0.45, 0, 0.12, -0.45, 0.45, 0.05);
  }, post);
  const boom = new THREE.Group();
  boom.position.set(0, 1.32, 0);
  post.add(boom);
  tpl('wb-boom', (P) => {
    P.ext(M.white, -0.14, 0.14, -0.1, 0.1, 0.1, 5.1, 0.07);
    for (let i = 0; i < 6; i++) P.ext(M.blue, -0.15, 0.15, -0.105, 0.105, 0.45 + i * 0.8, 0.85 + i * 0.8, 0.07);
    P.ext(M.red, -0.16, 0.16, -0.12, 0.12, 4.9, 5.16, 0.08);
    P.ext(M.ink, -0.2, 0.2, -0.18, 0.18, -0.62, 0.1, 0.1); // the counterweight
  }, boom);
  const setBoom = (k) => {
    boom.rotation.x = -sat(k) * boomOpen;
  };
  setBoom(0);
  return {group, deckY, setBoom, boomOpen};
}

// ================================================================ the cane grab
export function buildCaneGrab({number = '02'} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'cane-grab';
  const slewY = 6.0;
  const footY = 0.75; // the boom foot above the slew ring: world y = 6.75
  const BL = 8.4;
  tpl(`grab-ped|${number}`, (P) => {
    // the pedestal: a chunky blue tower on a grey base, with a ladder and a platform
    P.ext(M.shade, -2.1, 2.1, 0, 0.42, -2.1, 2.1, 0.12);
    P.ext(M.blue, -1.4, 1.4, 0.42, 1.3, -1.4, 1.4, 0.22);
    P.ext(M.blue, -1.12, 1.12, 1.3, 3.5, -1.12, 1.12, 0.2);
    P.ext(M.blueDeep, -1.16, 1.16, 3.5, 3.72, -1.16, 1.16, 0.1);
    P.ext(M.blue, -0.98, 0.98, 3.72, slewY - 0.34, -0.98, 0.98, 0.18);
    P.rcyl(M.ink, 1.18, 1.18, 0.34, 0, slewY - 0.17, 0, 'y', 0.07, 32);
    // the maintenance gallery round the ring, with a handrail all the way round, and the ladder up to it
    for (const s of [-1, 1]) {
      P.ext(M.millSteel, -1.75, 1.75, slewY - 0.44, slewY - 0.34, s * 1.1, s * 1.75, 0.04);
      P.ext(M.millSteel, s * 1.1, s * 1.75, slewY - 0.44, slewY - 0.34, -1.75, 1.75, 0.04);
      P.ext(M.millSteel, -1.75, 1.75, slewY + 0.5, slewY + 0.58, s * 1.68, s * 1.75, 0.03);
      P.ext(M.millSteel, s * 1.68, s * 1.75, slewY + 0.5, slewY + 0.58, -1.75, 1.75, 0.03);
      for (const x of [-1.55, 0, 1.55]) {
        P.ext(M.millSteel, x - 0.05, x + 0.05, slewY - 0.34, slewY + 0.58, s * 1.7, s * 1.74, 0.02);
        P.ext(M.millSteel, s * 1.7, s * 1.74, slewY - 0.34, slewY + 0.58, x - 0.05, x + 0.05, 0.02);
      }
    }
    P.ladder(-1.22, 0.5, slewY - 0.4, 0, 0.52);
    P.sides((s, z, ry) => P.text(`G-${number}`, {fg: TOY.white, px: 110}, 0.42, 0, 2.4, z + s * 0.02, ry), 1.12);
  }, group);

  // ---- the slew house
  const slew = new THREE.Group();
  slew.position.y = slewY;
  group.add(slew);
  tpl(`grab-house|${number}`, (P) => {
    P.ext(M.blue, -2.5, 1.5, 0.02, 1.6, -1.3, 1.3, 0.22);
    P.ext(M.blueLight, -2.56, 1.56, 1.6, 1.74, -1.36, 1.36, 0.08);
    P.ext(M.ink, -2.64, -2.1, 0.1, 1.5, -1.0, 1.0, 0.14); // the counterweight
    // the operator cab out on the +z side: dark glass on three faces
    P.ext(M.blue, -0.6, 1.2, 0.1, 2.5, 1.26, 2.5, 0.2);
    P.ext(M.glass, -0.5, 1.1, 1.0, 2.26, 2.46, 2.56, 0.05);
    P.ext(M.glass, 1.16, 1.24, 1.0, 2.26, 1.4, 2.4, 0.05);
    P.ext(M.roof, -0.68, 1.28, 2.5, 2.66, 1.2, 2.58, 0.08);
    P.beacon(-0.2, 2.66, 1.9, 0.15);
    // the boom foot brackets and the pin, and the forward deck the luffing ram stands on
    for (const s of [-1, 1]) P.ext(M.blue, 0.6, 1.5, 0.6, footY + 0.42, s * 0.5 - 0.14, s * 0.5 + 0.14, 0.06);
    P.pin(1.0, footY, 0, 0.16, 1.4);
    P.ext(M.blue, 1.4, 2.35, 0.02, 0.42, -0.95, 0.95, 0.12);
    P.pin(1.9, 0.2, 0, 0.14, 1.45);
  }, slew);

  // ---- the boom, pivoting at (1.0, footY) in the slew frame
  const boom = new THREE.Group();
  boom.position.set(1.0, footY, 0);
  slew.add(boom);
  tpl(`grab-boom|${number}`, (P) => {
    // a tapered yellow beam with darker webs and a head sheave box
    P.add(M.yellow, extrude(`grab-beam|${number}`, () => roundedPoly([V2(0.0, -0.42), V2(BL, -0.2), V2(BL, 0.26), V2(0.0, 0.48)], 0.12), 0.78, 0.09), 0, 0, 0);
    for (const s of [-1, 1]) P.add(M.yellowDeep, extrude(`grab-web|${number}`, () => roundedPoly([V2(0.5, -0.3), V2(BL - 0.4, -0.14), V2(BL - 0.4, 0.18), V2(0.5, 0.34)], 0.08), 0.04, 0.015), 0, 0, s * 0.4);
    for (let i = 1; i < 5; i++) {
      const x = (i / 5) * BL;
      P.ext(M.yellowDeep, x - 0.07, x + 0.07, -0.34 + 0.22 * (x / BL), 0.4 - 0.2 * (x / BL), -0.42, 0.42, 0.03);
    }
    P.ext(M.ink, BL - 0.1, BL + 0.42, -0.24, 0.3, -0.44, 0.44, 0.1);
    P.pin(BL + 0.16, 0.03, 0, 0.14, 1.0);
    P.pin(0, 0, 0, 0.16, 0.9);
    for (const s of [-1, 1]) P.ext(M.yellow, 3.9, 4.5, -0.62, -0.16, s * 0.56 - 0.12, s * 0.56 + 0.12, 0.08); // the luffing rams' lugs
    P.pin(4.2, -0.4, 0, 0.13, 1.5);
  }, boom);
  const setRams = [-1, 1].map(() => ram(slew, 0.17, 2.5));

  // ---- what hangs off the boom head: rope, rotator, grab
  const hang = new THREE.Group();
  hang.position.set(BL + 0.16, 0.03, 0);
  boom.add(hang);
  const ROPE = 2.6;
  tpl(`grab-hang|${number}`, (P) => {
    for (const s of [-1, 1]) P.ext(M.steel, -0.045, 0.045, -ROPE + 0.1, 0, s * 0.22 - 0.04, s * 0.22 + 0.04, 0.015);
    P.rcyl(M.ink, 0.46, 0.4, 0.62, 0, -ROPE - 0.2, 0, 'y', 0.09, 24);
    P.ext(M.blue, -0.78, 0.78, -ROPE - 0.74, -ROPE - 0.44, -0.78, 0.78, 0.12);
  }, hang);
  // the tines: two pairs, hinged under the rotator, closing about z and x
  const tines = [];
  for (const [ax, s] of [['z', 1], ['z', -1], ['x', 1], ['x', -1]]) {
    const t = new THREE.Group();
    t.position.set(0, -ROPE - 0.72, 0);
    t.userData = {ax, s};
    hang.add(t);
    tpl(`grab-tine|${number}`, (P) => {
      // a big curved claw: an arm from the hinge, then the shell curling in to a toothed lip
      P.ext(M.yellow, -0.22, 0.22, -1.0, 0.06, -0.62, 0.62, 0.1);
      P.add(M.yellow, extrude(`grab-claw|${number}`, () => roundedPoly([V2(-0.22, -1.02), V2(0.22, -1.02), V2(0.98, -1.82), V2(0.82, -2.06), V2(-0.3, -1.46)], 0.12), 1.3, 0.1), 0, 0, 0);
      P.ext(M.yellowDeep, 0.66, 1.02, -2.08, -1.82, -0.56, 0.56, 0.07);
      for (const z of [-0.34, 0, 0.34]) P.ext(M.ink, 0.84, 1.0, -2.2, -2.04, z - 0.07, z + 0.07, 0.03);
      P.pin(0, 0, 0, 0.13, 1.36);
    }, t);
    tines.push(t);
  }
  const grabTip = new THREE.Object3D();
  grabTip.position.set(0, -ROPE - 2.9, 0);
  hang.add(grabTip);
  const clump = caneBed(`grab|${number}`, {L: 1.7, W: 1.5, H: 0.9, seed: 13, layers: 3, dry: 0.26, r0: 0.085});
  clump.position.set(0, -ROPE - 2.5, 0);
  hang.add(clump);

  let boomK = 0;
  const A0 = (-8 * PI) / 180;
  const A1 = (24 * PI) / 180;
  const _a = new THREE.Vector3();
  const _b = new THREE.Vector3();
  const setBoom = (k) => {
    boomK = sat(k);
    const a = lerp(A0, A1, boomK);
    boom.rotation.z = a;
    hang.rotation.z = -a; // what hangs off it stays plumb
    // the luffing ram, from the house's forward deck (1.9, 0.2) to the lug under the boom at local (4.2, -0.4)
    setRams.forEach((set, i) => {
      const z = i ? 0.56 : -0.56;
      _a.set(1.9, 0.2, z);
      _b.set(1.0 + Math.cos(a) * 4.2 + Math.sin(a) * 0.4, footY + Math.sin(a) * 4.2 - Math.cos(a) * 0.4, z);
      set(_a, _b);
    });
  };
  const setGrab = (k) => {
    const a = lerp(0.78, 0.06, sat(k));
    for (const t of tines) {
      t.rotation.set(0, 0, 0);
      if (t.userData.ax === 'z') t.rotation.z = t.userData.s * a;
      else t.rotation.x = -t.userData.s * a;
    }
  };
  const setLoad = (k) => {
    const s = sat(k);
    clump.visible = s > 0.02;
    if (clump.visible) clump.scale.set(0.6 + 0.4 * s, 0.4 + 0.6 * s, 0.6 + 0.4 * s);
  };
  const setSlew = (a) => {
    slew.rotation.y = a;
  };
  setBoom(0.5);
  setGrab(0.2);
  setLoad(0);
  setSlew(0);
  return {group, setSlew, setBoom, setGrab, setLoad, grabTip};
}

// ================================================================ the mill gate
export function buildMillGate() {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'mill-gate';
  const lane = 4.2; // the piers stand at z = +-4.2, so the 8.0 boom just reaches the far one
  const boomOpen = 1.48;
  tpl('mill-gate', (P) => {
    for (const s of [-1, 1]) {
      P.ext(M.white, -0.55, 0.55, 0.2, 3.7, s * lane - 0.55, s * lane + 0.55, 0.16);
      P.ext(M.blue, -0.6, 0.6, 0.2, 1.1, s * lane - 0.6, s * lane + 0.6, 0.16);
      P.ext(M.blue, -0.7, 0.7, 3.7, 3.98, s * lane - 0.7, s * lane + 0.7, 0.1);
      P.ext(M.shade, -0.8, 0.8, 0, 0.2, s * lane - 0.8, s * lane + 0.8, 0.06);
      P.ext(M.lamp, -0.22, 0.22, 3.98, 4.12, s * lane - 0.22, s * lane + 0.22, 0.07);
      P.printTex(brandTex({fg: C.text}), 0.46, 0, 2.5, s * lane + 0.57, s > 0 ? 0 : PI);
      P.printTex(brandTex({fg: C.text}), 0.46, 0.57, 2.5, s * lane, PI / 2);
    }
    // the guard kiosk beside the lane, clear of both piers, its window looking down the road
    const kz = lane + 1.2;
    const kx = -4.4;
    P.ext(M.white, kx - 1.5, kx + 1.5, 0.14, 2.6, kz - 1.3, kz + 1.3, 0.16);
    P.ext(M.blue, kx - 1.54, kx + 1.54, 0.14, 0.66, kz - 1.34, kz + 1.34, 0.16);
    P.ext(M.roof, kx - 1.72, kx + 1.72, 2.6, 2.84, kz - 1.5, kz + 1.5, 0.1);
    P.ext(M.blueLight, kx - 1.78, kx + 1.78, 2.84, 2.94, kz - 1.56, kz + 1.56, 0.05);
    P.ext(M.shade, kx - 1.8, kx + 1.8, 0, 0.16, kz - 1.6, kz + 1.6, 0.05);
    P.ext(M.glass, kx - 1.2, kx + 1.2, 1.1, 2.24, kz - 1.36, kz - 1.26, 0.05);
    for (const s of [-1, 1]) P.ext(M.glass, kx + s * 1.56, kx + s * 1.52, 1.1, 2.24, kz - 0.8, kz + 0.8, 0.05);
    P.text('SECURITY', {fg: C.text, px: 90}, 0.26, kx, 2.42, kz - 1.38, PI);
  }, group);
  const boom = new THREE.Group();
  boom.position.set(0, 1.9, -lane + 0.5);
  group.add(boom);
  tpl('mill-gate-boom', (P) => {
    P.ext(M.white, -0.15, 0.15, -0.11, 0.11, 0.1, 8.0, 0.08);
    for (let i = 0; i < 9; i++) P.ext(M.blue, -0.16, 0.16, -0.115, 0.115, 0.5 + i * 0.84, 0.92 + i * 0.84, 0.08);
    P.ext(M.red, -0.17, 0.17, -0.13, 0.13, 7.8, 8.08, 0.09);
    P.ext(M.ink, -0.22, 0.22, -0.2, 0.2, -0.8, 0.1, 0.1);
    P.rcyl(M.ink, 0.26, 0.26, 0.5, 0, 0, 0, 'x', 0.06, 20);
  }, boom);
  const setBoom = (k) => {
    boom.rotation.x = -sat(k) * boomOpen;
  };
  setBoom(0);
  return {group, setBoom};
}

// ================================================================ the mill sign
export function buildMillSign({name = 'CANELINE', sub = 'Sugar mill & refinery'} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'mill-sign';
  const W = 6.4;
  tpl(`millsign|${name}|${sub}`, (P) => {
    // a white plinth, two blue posts and the blue panel
    P.ext(M.white, -W / 2, W / 2, 0, 0.7, -0.7, 0.7, 0.14);
    P.ext(M.blueLight, -W / 2 - 0.06, W / 2 + 0.06, 0.7, 0.82, -0.76, 0.76, 0.06);
    for (const s of [-1, 1]) P.ext(M.blue, s * (W / 2 - 0.8) - 0.18, s * (W / 2 - 0.8) + 0.18, 0.82, 1.5, -0.2, 0.2, 0.07);
    P.ext(M.blue, -W / 2 + 0.2, W / 2 - 0.2, 1.4, 3.6, -0.22, 0.22, 0.14);
    P.ext(M.blueLight, -W / 2 + 0.14, W / 2 - 0.14, 3.6, 3.7, -0.28, 0.28, 0.05);
    // the printed faces, and a lamp at each end washing the panel
    const nameTex = labelTexture(name, {color: TOY.white, w: 1024, h: 256, font: 'italic 800 170px Inter, system-ui, sans-serif'});
    const subTex = labelTexture(sub, {color: TOY.blueLight, w: 1024, h: 180, font: '600 92px Inter, system-ui, sans-serif'});
    for (const s of [-1, 1]) {
      P.printTex(nameTex, 0.94, 0, 2.88, s * 0.235, s > 0 ? 0 : PI);
      P.printTex(subTex, 0.44, 0, 1.98, s * 0.235, s > 0 ? 0 : PI);
      for (const x of [-1, 1]) {
        P.ext(M.ink, x * (W / 2 - 1.2) - 0.22, x * (W / 2 - 1.2) + 0.22, 0.82, 1.06, s * 0.6 - 0.16, s * 0.6 + 0.16, 0.07);
        P.ext(M.lamp, x * (W / 2 - 1.2) - 0.15, x * (W / 2 - 1.2) + 0.15, 1.0, 1.06, s * 0.6 - 0.1, s * 0.6 + 0.1, 0.02);
      }
    }
  }, group);
  return group;
}

// ================================================================ the lab and office block
export function buildLabOffice() {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'lab-office';
  const hx = 9.0;
  const hz = 6.0;
  tpl('lab-office', (P) => {
    // the ground floor white, the first floor blue, a parapet at y = 8
    P.ext(M.shade, -hx - 0.3, hx + 0.3, 0, 0.22, -hz - 0.3, hz + 0.3, 0.08);
    P.ext(M.white, -hx, hx, 0.22, 4.0, -hz, hz, 0.26);
    P.ext(M.blueLight, -hx - 0.06, hx + 0.06, 4.0, 4.22, -hz - 0.06, hz + 0.06, 0.08);
    P.ext(M.blue, -hx + 0.08, hx - 0.08, 4.22, 7.6, -hz + 0.08, hz - 0.08, 0.24);
    P.ext(M.white, -hx, hx, 7.6, 8.0, -hz, hz, 0.12);
    // the glass bands: the ground floor on all four faces, the first floor a long ribbon
    for (const s of [-1, 1]) {
      P.ext(M.glass, -hx + 1.0, hx - 1.0, 1.1, 3.1, s * hz - 0.06, s * hz + 0.05, 0.08);
      P.ext(M.glass, -hx + 0.9, hx - 0.9, 5.0, 6.9, s * (hz - 0.08) - 0.06, s * (hz - 0.08) + 0.05, 0.08);
      P.ext(M.glass, s * hx - 0.05, s * hx + 0.05, 1.1, 3.1, -hz + 0.9, hz - 0.9, 0.08);
      P.ext(M.glass, s * (hx - 0.08) - 0.05, s * (hx - 0.08) + 0.05, 5.0, 6.9, -hz + 0.8, hz - 0.8, 0.08);
      // the mullions, so the ribbon reads as windows and not a slot
      for (let x = -hx + 1.6; x < hx - 1.0; x += 2.0) {
        P.ext(M.white, x - 0.1, x + 0.1, 1.1, 3.14, s * hz - 0.08, s * hz + 0.1, 0.04);
        P.ext(M.panel, x - 0.1, x + 0.1, 5.0, 6.94, s * (hz - 0.08) - 0.08, s * (hz - 0.08) + 0.1, 0.04);
      }
    }
    // the entrance on the +z face: a canopy on two posts, steps, the sign over the door
    P.ext(M.glass, -1.9, 1.9, 0.3, 2.9, hz - 0.06, hz + 0.06, 0.08);
    P.ext(M.blue, -2.3, 2.3, 2.9, 3.2, hz - 0.1, hz + 2.5, 0.12);
    for (const s of [-1, 1]) P.ext(M.millSteel, s * 2.0 - 0.11, s * 2.0 + 0.11, 0.2, 2.9, hz + 2.2, hz + 2.42, 0.05);
    P.ext(M.shade, -2.6, 2.6, 0, 0.22, hz, hz + 1.3, 0.06);
    P.ext(M.panel, -2.6, 2.6, 0, 0.11, hz + 1.3, hz + 1.9, 0.04);
    P.printTex(brandTex({fg: C.text, sub: 'Laboratory and offices'}), 0.62, 0, 3.6, hz + 0.02, 0);
    P.text('LABORATORY', {fg: TOY.white, px: 96}, 0.3, 0, 3.05, hz + 2.52, 0);
    // the roof: a stair box, two plant units, a railing round the parapet
    P.ext(M.panel, -hx + 1.0, -hx + 3.6, 8.0, 8.8, -1.4, 1.4, 0.16);
    for (const x of [1.6, 4.6]) {
      P.ext(M.millSteel, x - 1.1, x + 1.1, 8.0, 8.62, -1.6, 1.6, 0.14);
      P.rcyl(M.millSteelDeep, 0.6, 0.6, 0.14, x, 8.68, 0, 'y', 0.04, 24);
    }
    P.ext(M.millSteel, -hx + 0.3, hx - 0.3, 8.0, 8.06, hz - 0.5, hz - 0.3, 0.02);
  }, group);
  return group;
}

// ================================================================ the tank farm
export function buildTankFarm({n = 3} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'tank-farm';
  const d = 8.0;
  const h = 7.0;
  const gap = 10.0;
  const span = (n - 1) * gap;
  const bx = span / 2 + d / 2 + 1.6;
  const bz = d / 2 + 2.2;
  const xs = [];
  for (let i = 0; i < n; i++) xs.push(-span / 2 + i * gap);
  tpl(`tankfarm|${n}`, (P) => {
    // the bund: a slab with a low wall round it, a stepover at the middle of the +z side
    P.ext(M.concrete, -bx, bx, 0, 0.12, -bz, bz, 0.06);
    for (const s of [-1, 1]) {
      P.ext(M.concreteDeep, -bx, bx, 0.06, 1.1, s * bz - 0.42, s * bz, 0.1);
      P.ext(M.concreteDeep, s * bx - 0.42, s * bx, 0.06, 1.1, -bz, bz, 0.1);
      P.ext(M.yellow, -bx + 0.1, bx - 0.1, 1.1, 1.16, s * bz - 0.4, s * bz - 0.02, 0.02);
    }
    for (let i = 0; i < n; i++) {
      const x = xs[i];
      // the skirt, the shell with a dished bottom and a domed top, two girth bands
      P.rcyl(M.tankDeep, d / 2 - 0.25, d / 2 - 0.2, 0.5, x, 0.37, 0, 'y', 0.08, 36);
      P.add(M.tank, cg(`tank-shell|${d}|${h}`, () => {
        const pts = [];
        for (let k = 0; k <= 6; k++) {
          const a = (-PI / 2) * (1 - k / 6);
          pts.push(V2((d / 2) * Math.cos(a) * 0.999 + 1e-4, 0.5 + (d / 2) * 0.22 * (1 + Math.sin(a))));
        }
        pts.push(V2(d / 2, h - 0.6));
        for (let k = 1; k <= 8; k++) {
          const a = (PI / 2) * (k / 8);
          pts.push(V2((d / 2) * Math.cos(a), h - 0.6 + 1.1 * Math.sin(a)));
        }
        return new THREE.LatheGeometry(pts.map((p) => V2(Math.max(1e-3, p.x), p.y)), 44);
      }), x, 0, 0);
      for (const y of [2.4, 4.8]) P.rcyl(M.tankDeep, d / 2 + 0.07, d / 2 + 0.07, 0.2, x, y, 0, 'y', 0.06, 44);
      // the top handrail ring and the roof hatch
      P.add(M.millSteel, cg('tank-rail', () => new THREE.TorusGeometry(d / 2 - 0.5, 0.05, 8, 44).rotateX(PI / 2)), x, h - 0.1, 0);
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * PI * 2;
        P.ext(M.millSteel, x + Math.cos(a) * (d / 2 - 0.5) - 0.04, x + Math.cos(a) * (d / 2 - 0.5) + 0.04, h - 0.8, h - 0.1, Math.sin(a) * (d / 2 - 0.5) - 0.04, Math.sin(a) * (d / 2 - 0.5) + 0.04, 0.02);
      }
      P.rcyl(M.millSteelDeep, 0.44, 0.44, 0.3, x, h + 0.62, 0, 'y', 0.07, 20);
      // the ladder up the -z flank and the outlet nozzle
      P.ladder(x - d / 2 - 0.04, 0.5, h + 0.1, 0, 0.56);
      P.rcyl(M.syrup, 0.26, 0.26, 0.9, x, 1.0, d / 2 - 0.1, 'z', 0.07, 20);
      P.sides((s, z, ry) => P.text(`MOLASSES ${String(i + 1).padStart(2, '0')}`, {fg: C.text, px: 96}, 0.5, x, 3.6, z + s * 0.02, ry), d / 2);
    }
    // the ladder stiles' feet and the pipe supports along the front
    for (const x of xs) P.ext(M.concreteDeep, x - 0.5, x + 0.5, 0.12, 0.6, bz - 1.5, bz - 1.0, 0.07);
    for (const x of xs) P.ext(M.blue, x - d / 2 - 0.3, x - d / 2 + 0.3, 0.12, 0.42, -0.42, 0.42, 0.08);
  }, group);
  // the manifold: palette.js's pipe() between the nozzles and out of the bund
  for (let i = 0; i < n; i++) {
    group.add(millPipe([xs[i], 1.0, d / 2 + 0.3], [xs[i], 1.4, bz - 1.25], 0.24));
    if (i) group.add(millPipe([xs[i - 1], 1.4, bz - 1.25], [xs[i], 1.4, bz - 1.25], 0.24));
  }
  group.add(millPipe([xs[n - 1], 1.4, bz - 1.25], [bx + 1.6, 1.4, bz - 1.25], 0.24));
  return group;
}

// ================================================================ the yard lamp
export function buildYardLamp() {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'yard-lamp';
  tpl('yard-lamp', (P) => {
    P.ext(M.shade, -0.5, 0.5, 0, 0.26, -0.5, 0.5, 0.08);
    P.ext(M.blueDeep, -0.34, 0.34, 0.26, 0.8, -0.34, 0.34, 0.1);
    P.rcyl(M.blue, 0.13, 0.21, 7.2, 0, 4.4, 0, 'y', 0.05, 18);
    P.rcyl(M.blueLight, 0.15, 0.15, 0.16, 0, 7.9, 0, 'y', 0.04, 18);
    // the bracket and the twin heads
    P.bar(M.blue, [0, 7.9, 0], [0, 8.18, 0.9], 0.13);
    for (const s of [-1, 1]) {
      P.ext(M.ink, -0.46, 0.46, 8.12, 8.3, s * 0.42 + 0.9 - 0.34, s * 0.42 + 0.9 + 0.34, 0.07);
      P.ext(M.lamp, -0.38, 0.38, 8.06, 8.14, s * 0.42 + 0.9 - 0.28, s * 0.42 + 0.9 + 0.28, 0.03);
    }
  }, group);
  return group;
}
