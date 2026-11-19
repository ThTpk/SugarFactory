// Caneline's wet end: the plant that turns cane into clarified juice, in exactly the toy airport, car
// plant and construction site kits' look (airport-shared/style.js, plant-shared/line.js, site-shared/machines.js)
//: toy proportions, generous bevels on every edge, matte paint with a soft clearcoat,
// dark glass, crisp printed signs. Blue frames and structure, pale MILL.tank shells, yellow only on the working
// parts (the carrier's slats, the shredder's hammer rotor, the mill rollers and frames, the clarifier's scrapers),
// green only on the cane. The helper preamble below is site-shared/machines.js's, copied as the house style asks;
// the vehicle half of it (wheels, tracks, the cab-over cab) is left out because nothing in the wet end rolls.
//
// Toy metres, y up. A machine's length runs along +x, its right side is +z, the origin on the ground at its centre.
// Everything stands on the hall floor at y = 0. The tallest solid part in the kit is the evaporators' vapour header
// at y = 11.1, well under the brief's y = 12 ceiling; only the evaporators' plume (soft, fading) goes higher.
//
//   buildCaneCarrier({length = 34, rise = 5.2})
//       -> {group, setSlats(d), setCane(k, t), deckAt(s), footY: 1.2, headY: 1.2 + rise, length, run, angle,
//           width: 3.6}
//       An inclined slat conveyor in a blue trough, deck 3.6 wide, yellow slats. `length` is the horizontal run
//       along x (the deck itself is `run` = hypot(length, rise) long, at `angle` radians). Deck top y = 1.2 at the
//       foot (x = -length / 2, inside the hopper) and 1.2 + rise = 6.4 at the head (x = +length / 2, over the
//       shredder). setSlats(d): the slats run d metres up the deck (pure in d, any sign, wraps).
//       setCane(k, t): the bed of cane on the deck, k = 0 empty .. 1 a full load; it drifts up the deck with t
//       (seconds) at 1.1 m/s. deckAt(s) -> [x, y, z]: the point on the deck s metres from the foot.
//   buildCaneHopper()
//       -> {group, lipY: 1.2, floorY: 1.2 (an alias for lipY), rimY: 3.0, setFill(k), span: {x: 9, z: 8}}
//       The sloped receiving hopper the tipping table pours into: a blue box on four columns, flared side walls with
//       a white rim cap, a yellow wear strip on the -x pour rim at rimY = 3.0 and an interior floor sloping from
//       y = 2.4 there down to the yellow discharge lip at lipY = 1.2 on its +x end, which is where the cane
//       carrier's foot deck sits (the brief's y = 1.2). setFill(k): the heap of stalks inside, 0 empty .. 1 full,
//       filling in four layers so a half-full hopper reads as half full.
//   buildShredder({number = '01'})
//       -> {group, setRotor(a), inletY: 6.4, outletY: 5.6, rotorY: 7.4}
//       A chunky blue housing on a steel leg frame, the yellow hammer rotor on an axis along z at y = 7.4 seen
//       through a big opening in its +z face, a motor on a bracket and a drive belt guard. The carrier drops cane in
//       at the inlet lip inletY = 6.4 on its -x side; shredded cane leaves the outlet chute lip outletY = 5.6 on
//       its +x side. setRotor(a): the rotor turns a radians about z (pure in a).
//   buildMillTandem({n = 4})
//       -> {group, setRollers(a), setJuice(k, t), mills: [{x, feedLip: 5.6, trayLip: 0.9}], length, pitch: 7}
//       n three-roller mills in a row along +x, 7.0 apart, under one yellow frame. Each mill's top roller centre is
//       at y = 4.2, the rollers are 1.9 across and 2.8 long, fed by a Donnelly chute whose lip is at y = 5.6 and
//       drained by one juice tray running the whole row, lip at y = 0.9. Short 45 degree intercarriers carry the
//       bagasse from one mill to the next. setRollers(a): every roller turns a radians (the two bottom rollers
//       counter to the top one), pure in a. setJuice(k, t): the dark juice falling from the bottom rollers into the
//       tray, k = 0 dry .. 1 a thick stream, t (seconds) runs the ripple and the tray's level.
//   buildJuiceTank({d = 6, h = 5, label = 'RAW JUICE', color = MILL.juice})
//       -> {group, setLevel(k), topY: 0.6 + h, d, skirtY: 0.6}
//       A lathed vessel with a dished bottom on a 0.6 skirt, so the default top is at y = 5.6: a ladder with a cage,
//       a top handrail, a sight glass on its -x flank and the label printed round its shell with labelTexture.
//       setLevel(k): the sight glass reads 0 empty .. 1 full; `color` is the liquid in it.
//   buildClarifier()
//       -> {group, setRake(a), topY: 5.0, d: 11}
//       A wide shallow open tank, 11.0 across and 4.4 tall on a 0.6 skirt, the clarified juice surface at y = 4.5,
//       a steel bridge across the top on a centre drive head with two yellow surface scrapers.
//       setRake(a): the bridge and its scrapers turn a radians about y (pure in a; 1 turn per 90 s reads right).
//   buildEvaporatorRow({n = 5})
//       -> {group, setVapour(t, k), bodies: [{x, topY: 10.0}], walkwayY: 6.0, length, pitch: 6.5}
//       n bodies in a row along +x, 4.2 across and 10.0 tall counting the dished bottom, feet at y = 0, 6.5 apart,
//       with a blue calandria band, hot vapour pipes joining their heads and juice pipes joining their bottoms, a
//       steel walkway at y = 6.0 down the +z side and a ladder up to it. setVapour(t, k): the plume off the last
//       body's vapour head, k = 0 off .. 1 boiling hard, t (seconds) drifts it. The vapour header over the bodies
//       tops out at y = 11.1; only the plume's soft billows go higher, and they have faded out by about y = 13.
//   buildPipeRack({length = 40, lines = 4, y = 6.4})
//       -> {group, length, y, lines}
//       The pipe bridge that ties the vessels together: steel portal frames every 6 m and `lines` runs of pipe along
//       +x at height y, alternating cold (MILL.pipe) and steam (MILL.pipeHot). Nothing above y + 0.6.
//
// Static parts are merged per material and cached per variant by tpl(), so a second copy of a machine only costs
// draw calls; moving parts (slats, cane, rollers, the rotor, the rake, the juice) are separate meshes on shared
// geometry. Every builder is a pure function of its arguments and every setter a pure function of its input: no
// timers, no state between frames, no Math.random() outside the seeded rnd() below.
// Text uses Inter: build after document.fonts has loaded it (runSim does that before setup).
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {TOY, labelTexture, rbox, toyMat} from '../airport-shared/style.js';
import {GSE_COLORS} from '../airport-shared/gse.js';
import {MILL, clamp, lathe, lerp, pipe, plume, sat, smooth, walkway} from './palette.js';

const PI = Math.PI;
const V2 = (x, y) => new THREE.Vector2(x, y);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const C = GSE_COLORS;
/** a seeded 0..1: the only randomness in this file, so every frame of every copy is identical */
const rnd = (i, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ================================================================ materials
const paint = (color, rough = 0.5) => toyMat(color, {paint: true, rough});
let MM = null;
function mats() {
  if (MM) return MM;
  const glow = (color, emissive, k, rough = 0.35) => new THREE.MeshStandardMaterial({color, roughness: rough, emissive, emissiveIntensity: k});
  MM = {
    white: paint(TOY.white),
    panel: paint(TOY.panel),
    blue: paint(TOY.blue, 0.48),
    blueDeep: paint(TOY.blueDeep, 0.48),
    blueLight: paint(TOY.blueLight, 0.5),
    roof: paint(TOY.roof, 0.5),
    yellow: paint(TOY.yellow, 0.5),
    yellowDeep: paint('#e0a02e', 0.56), // one step down from TOY.yellow, as BUILD_COLORS does
    ink: toyMat(C.ink, {rough: 0.62}),
    chassis: toyMat(C.chassis, {rough: 0.66}),
    glass: toyMat(TOY.glass, {paint: true, rough: 0.12}),
    bumper: paint(C.bumper),
    shade: toyMat(TOY.shade, {rough: 0.7}),
    // the mill's own set
    tank: paint(MILL.tank, 0.46),
    tankMid: paint(MILL.tankMid, 0.48),
    tankDeep: paint(MILL.tankDeep, 0.5),
    steel: toyMat(MILL.steel, {rough: 0.42, metal: 0.25}),
    steelDeep: toyMat(MILL.steelDeep, {rough: 0.5, metal: 0.2}),
    pipe: toyMat(MILL.pipe, {rough: 0.45, metal: 0.12}),
    pipeHot: toyMat(MILL.pipeHot, {rough: 0.5, metal: 0.08}),
    cane: toyMat(MILL.cane, {rough: 0.78}),
    caneDeep: toyMat(MILL.caneDeep, {rough: 0.8}),
    caneDry: toyMat(MILL.caneDry, {rough: 0.85}),
    bagasse: toyMat(MILL.bagasse, {rough: 0.9}),
    juice: toyMat(MILL.juice, {paint: true, rough: 0.22}),
    clear: toyMat(MILL.clear, {paint: true, rough: 0.2}),
    lamp: glow(C.lamp, '#fff1c8', 0.22, 0.3),
    beacon: glow('#ffb072', '#ff7a1f', 0.9, 0.3),
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
function decalMat(tex, {rough = 0.5, opaque = false, side = THREE.FrontSide} = {}) {
  const key = tex.uuid + rough + opaque + side;
  if (DECALS.has(key)) return DECALS.get(key);
  const m = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: rough,
    side,
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
const tubeG = (r0, r1, h, seg = 20) => cg(`tu|${r0}|${r1}|${h}|${seg}`, () => new THREE.CylinderGeometry(r0, r1, h, seg, 1, true));
const sphere = (r) => cg(`sp|${r}`, () => new THREE.SphereGeometry(r, 18, 12));
const dome = (r) => cg(`dome|${r}`, () => new THREE.SphereGeometry(r, 18, 8, 0, PI * 2, 0, PI / 2));
const planeG = (w, h) => cg(`pl|${w.toFixed(3)}|${h.toFixed(3)}`, () => new THREE.PlaneGeometry(w, h));
const discG = (r) => cg(`di|${r.toFixed(3)}`, () => new THREE.CircleGeometry(r, 48).rotateX(-PI / 2));
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
  /** a square bar with rounded edges between two points (frame members, rails) */
  bar(mat, a, b, t = 0.12) {
    const A = V3(...a);
    const d = V3(...b).sub(A);
    const len = d.length();
    _q.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize());
    return this.put(mat, rb(t, len + t, t, t * 0.4), _m.compose(A.addScaledVector(d, 0.5), _q, _s.set(1, 1, 1)));
  }
  /** a pin through a joint: a soft steel cylinder along z with dark caps */
  pin(x, y, z, r, len) {
    const M = mats();
    this.rcyl(M.steel, r, r, len, x, y, z, 'z', r * 0.3, 20);
    return this;
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
  /** a chunky vertical steel ladder (two stringers, rungs every 0.42) from y0 to y1 at x, z, climbing the +x face */
  ladder(x, y0, y1, z, w = 0.62) {
    const M = mats();
    for (const s of [-1, 1]) this.ext(M.steel, x - 0.06, x + 0.06, y0, y1, s * w * 0.5 - 0.06 + z, s * w * 0.5 + 0.06 + z, 0.03);
    for (let y = y0 + 0.4; y < y1 - 0.1; y += 0.42) this.ext(M.steelDeep, x - 0.05, x + 0.05, y - 0.04, y + 0.04, z - w * 0.5, z + w * 0.5, 0.025);
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

// ================================================================ the wet end's own kit
/** a fluted mill roller or shredder drum: a core with n axial flutes, axis along z, tip radius r */
function flutedGeo(r, len, n = 16) {
  return cg(`flute|${r}|${len}|${n}`, () => {
    const P = new Parts();
    P.cyl(null, r - 0.16, r - 0.16, len, 0, 0, 0, 'z', 30);
    const rr = r - 0.1;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * PI * 2;
      P.add(null, rb(0.2, 0.26, len, 0.08), Math.cos(a) * rr, Math.sin(a) * rr, 0, 0, 0, a);
    }
    return mergeGeometries(P.map.get(null), false);
  });
}
/** a roller as a Group turning about its local z: the flutes plus a steel journal through both frames */
function rollerUnit(r, len, journal, mat) {
  const M = mats();
  const g = new THREE.Group();
  part(flutedGeo(r, len, 16), mat, g);
  part(rcylG(0.26, 0.26, journal, 0.08, 18), M.steel, g).rotation.x = PI / 2;
  return g;
}
/**
 * A bed of cane stalks lying crossways on a deck, instanced in two layers (fresh green, dry tops on top).
 * set(k, u): k = 0 bare .. 1 a full load (the bed deepens and the stalks spread), u drifts the whole bed along x by
 * u turns of the span. Pure in both.
 */
function caneBed(count, spanX, spanZ, {seed = 1, lift = 0.0, rise = 0.46} = {}) {
  const M = mats();
  const im = new THREE.InstancedMesh(rb(0.3, 0.26, 1, 0.1), M.cane, count);
  const im2 = new THREE.InstancedMesh(rb(0.24, 0.21, 1, 0.09), M.caneDry, Math.round(count * 0.4));
  for (const m of [im, im2]) {
    m.castShadow = m.receiveShadow = true;
    m.frustumCulled = false;
  }
  const g = new THREE.Group();
  g.add(im, im2);
  const place = (mesh, i, u, s, dry) => {
    const f = (((i * 0.6180339887 + u) % 1) + 1) % 1; // a golden-ratio comb: evenly spread, never banded
    const x = (f - 0.5) * spanX;
    const z = (rnd(i + (dry ? 400 : 0), seed) - 0.5) * spanZ * 0.5;
    const len = spanZ * (0.6 + 0.36 * rnd(i + 31, seed)) * (dry ? 0.8 : 1);
    const layer = rnd(i + 7, seed);
    const h = lift + 0.14 + rise * s * layer + (dry ? 0.2 * s : 0);
    _e.set(0, (rnd(i + 11, seed) - 0.5) * 0.44, (rnd(i + 17, seed) - 0.5) * 0.2);
    _q.setFromEuler(_e);
    _m.compose(_p.set(x, h, z), _q, _s.set(1, 1, len));
    mesh.setMatrixAt(i, _m);
  };
  const set = (k, u) => {
    const kk = sat(k);
    g.visible = kk > 0.01;
    if (!g.visible) return;
    const s = 0.35 + 0.65 * kk;
    for (let i = 0; i < count; i++) place(im, i, u, s, false);
    for (let i = 0; i < im2.count; i++) place(im2, i, u + 0.31, s, true);
    im.instanceMatrix.needsUpdate = im2.instanceMatrix.needsUpdate = true;
  };
  set(0, 0);
  return {group: g, set};
}

// ================================================================ the cane carrier
export function buildCaneCarrier({length = 34, rise = 5.2} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'cane-carrier';
  const W = 3.6; // the slat deck's width
  const footY = 1.2;
  const headY = footY + rise;
  const angle = Math.atan2(rise, length);
  const run = Math.hypot(length, rise);
  const key = `carrier|${length.toFixed(2)}|${rise.toFixed(2)}`;

  // ---- the legs and the head platform, in the machine's own (level) frame
  const deckYAt = (x) => footY + ((x + length / 2) / length) * rise;
  tpl(`${key}|legs`, (P) => {
    const n = Math.max(2, Math.round(length / 5.2));
    for (let i = 1; i <= n; i++) {
      const x = -length / 2 + (length * i) / (n + 0.6);
      const top = deckYAt(x) - 0.62;
      if (top < 0.5) continue;
      for (const s of [-1, 1]) {
        P.ext(M.blueDeep, x - 0.19, x + 0.19, 0, top, s * (W / 2 + 0.26) - 0.19, s * (W / 2 + 0.26) + 0.19, 0.08);
        P.ext(M.chassis, x - 0.34, x + 0.34, 0, 0.09, s * (W / 2 + 0.26) - 0.34, s * (W / 2 + 0.26) + 0.34, 0.04);
      }
      P.ext(M.blueDeep, x - 0.12, x + 0.12, top - 0.55, top - 0.34, -W / 2 - 0.2, W / 2 + 0.2, 0.06);
      if (top > 1.6) {
        P.bar(M.steelDeep, [x - 0.1, 0.4, -W / 2 - 0.26], [x - 0.1, top - 0.6, W / 2 + 0.26], 0.1);
      }
    }
    // the head drive: a blue gear case on the +z side with a belt guard, and a small platform with a rail
    const hx = length / 2;
    P.ext(M.blue, hx - 1.5, hx + 0.5, headY - 1.5, headY + 0.5, W / 2 + 0.34, W / 2 + 1.5, 0.2);
    P.rcyl(M.steelDeep, 0.5, 0.5, 0.3, hx - 0.62, headY - 0.5, W / 2 + 1.58, 'z', 0.08, 24);
    P.ext(M.yellow, hx - 1.3, hx + 0.26, headY - 1.2, headY + 0.3, W / 2 + 1.5, W / 2 + 1.62, 0.06);
    P.text('CC 01', {fg: TOY.white, px: 110}, 0.3, hx - 0.5, headY - 1.2, W / 2 + 1.67);
    // the foot: a dark seal plate so the trough reads as going into the hopper
    P.ext(M.chassis, -length / 2 - 0.5, -length / 2 + 0.3, footY - 0.95, footY - 0.2, -W / 2 - 0.3, W / 2 + 0.3, 0.1);
  }, group);

  // ---- the trough, tilted: local x runs up the deck, the deck top is local y = 0
  const incline = new THREE.Group();
  incline.position.set(0, (footY + headY) / 2, 0);
  incline.rotation.z = angle;
  group.add(incline);
  const hl = run / 2;
  tpl(`${key}|trough`, (P) => {
    // the pan under the slats, the blue side walls with a white lip, cross ribs
    P.ext(M.blueDeep, -hl - 0.3, hl + 0.3, -0.42, -0.2, -W / 2 - 0.02, W / 2 + 0.02, 0.07);
    for (const s of [-1, 1]) {
      P.ext(M.blue, -hl - 0.36, hl + 0.36, -0.5, 0.62, s * (W / 2 + 0.17) - 0.17, s * (W / 2 + 0.17) + 0.17, 0.12);
      P.ext(M.white, -hl - 0.4, hl + 0.4, 0.56, 0.72, s * (W / 2 + 0.17) - 0.21, s * (W / 2 + 0.17) + 0.21, 0.07);
      P.ext(M.blueLight, -hl - 0.3, hl + 0.3, 0.1, 0.24, s * (W / 2 + 0.34) - 0.04, s * (W / 2 + 0.34) + 0.04, 0.04);
    }
    for (let x = -hl + 1.2; x < hl; x += 2.6) P.ext(M.blueDeep, x - 0.13, x + 0.13, -0.52, -0.3, -W / 2 - 0.2, W / 2 + 0.2, 0.07);
    // the head and tail drums on steel shafts
    for (const e of [-1, 1]) {
      P.rcyl(M.steelDeep, 0.56, 0.56, W + 0.1, e * hl, -0.62, 0, 'z', 0.1, 26);
      P.rcyl(M.steel, 0.17, 0.17, W + 0.95, e * hl, -0.62, 0, 'z', 0.06, 18);
    }
  }, incline);

  // ---- the slats: instanced yellow bars across the deck
  const step = 0.64;
  const nSlat = Math.max(4, Math.round(run / step));
  const per = nSlat * step;
  const slats = new THREE.InstancedMesh(rb(0.42, 0.2, W - 0.06, 0.07), M.yellow, nSlat);
  slats.castShadow = slats.receiveShadow = true;
  slats.frustumCulled = false;
  incline.add(slats);
  const one = V3(1, 1, 1);
  const setSlats = (d) => {
    for (let i = 0; i < nSlat; i++) {
      const f = (((i * step + d) % per) + per) % per;
      _m.compose(_p.set(-hl + f, -0.11, 0), _q.identity(), one);
      slats.setMatrixAt(i, _m);
    }
    slats.instanceMatrix.needsUpdate = true;
  };
  setSlats(0);

  // ---- the cane bed on the deck
  const bed = caneBed(Math.max(16, Math.round(run / 0.8)), run - 0.8, W - 0.3, {seed: 3, lift: 0.1, rise: 0.5});
  incline.add(bed.group);
  const setCane = (k, t = 0) => bed.set(k, (((t * 1.1) / run) % 1 + 1) % 1);
  setCane(0, 0);

  const deckAt = (s) => [-length / 2 + Math.cos(angle) * s, footY + Math.sin(angle) * s, 0];
  return {group, setSlats, setCane, deckAt, footY, headY, length, run, angle, width: W};
}

// ================================================================ the cane hopper
export function buildCaneHopper() {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'cane-hopper';
  const lipY = 1.2; // the discharge lip at +x: the cane carrier's foot deck top sits here
  const rimY = 3.0; // the top of the side walls, where the tipping table pours in
  const backY = 2.4; // the sloped floor's high end at -x
  const X = 9.0;
  const Z = 8.0;
  const hx = X / 2;
  const hz = Z / 2;
  const fx0 = -hx + 0.25;
  const fx1 = hx - 0.1;
  const fa = Math.atan2(backY - lipY, fx1 - fx0);
  const floorAt = (x) => lerp(backY, lipY, clamp((x - fx0) / (fx1 - fx0)));
  tpl('hopper', (P) => {
    // the pit frame: a dark plinth, four blue corner columns
    P.ext(M.chassis, -hx - 0.18, hx + 0.18, 0, 0.2, -hz - 0.18, hz + 0.18, 0.07);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) P.ext(M.blueDeep, sx * hx - 0.5, sx * hx + 0.1, 0.12, rimY - 0.2, sz * hz - 0.5, sz * hz + 0.1, 0.16);
    // the side walls, flared out 10 degrees, with a white rim cap
    for (const sz of [-1, 1]) {
      P.add(M.blue, rb(X, rimY - 0.2, 0.36, 0.13), 0, (rimY + 0.2) / 2, sz * (hz - 0.26), sz * 0.175, 0, 0);
      P.ext(M.white, -hx - 0.08, hx + 0.08, rimY - 0.18, rimY, sz * (hz + 0.0) - 0.3, sz * (hz + 0.0) + 0.3, 0.07);
      P.ext(M.blueLight, -hx, hx, 1.5, 1.68, sz * (hz - 0.14) - 0.06, sz * (hz - 0.14) + 0.06, 0.05);
    }
    // the back wall at -x with the yellow wear strip the cane lands on, and the low front wall over the carrier
    P.ext(M.blue, -hx - 0.16, -hx + 0.24, 0.3, rimY - 0.1, -hz - 0.1, hz + 0.1, 0.16);
    P.ext(M.yellow, -hx - 0.34, -hx + 0.3, rimY - 0.42, rimY + 0.08, -hz - 0.3, hz + 0.3, 0.14);
    P.ext(M.blue, hx - 0.24, hx + 0.16, 0.3, lipY + 0.5, -hz - 0.1, hz + 0.1, 0.14);
    P.ext(M.white, hx - 0.3, hx + 0.22, lipY + 0.5, lipY + 0.64, -hz - 0.16, hz + 0.16, 0.07);
    // the interior floor sloping from backY down to the discharge lip, on two ribs
    P.add(M.steelDeep, rb(Math.hypot(fx1 - fx0, backY - lipY) + 0.5, 0.3, Z - 0.9, 0.1), (fx0 + fx1) / 2, (backY + lipY) / 2 - 0.1, 0, 0, 0, -fa);
    for (const sz of [-1, 1])
      P.add(M.chassis, rb(Math.hypot(fx1 - fx0, backY - lipY), 0.9, 0.22, 0.08), (fx0 + fx1) / 2, (backY + lipY) / 2 - 0.64, sz * (hz - 0.55), 0, 0, -fa);
    // the yellow discharge lip the carrier picks the cane off
    P.ext(M.yellow, hx - 1.1, hx + 0.2, lipY - 0.14, lipY + 0.22, -hz + 0.5, hz - 0.5, 0.11);
    P.text('CANE IN', {fg: TOY.white, px: 110}, 0.5, -0.6, 2.0, hz + 0.34, 0);
  }, group);
  // ---- the cane in the hopper: a heap of stalks lying on the sloped floor, in 4 layers
  const N = 64;
  const stalk = new THREE.InstancedMesh(rb(0.32, 0.28, 1, 0.11), M.cane, N);
  const dry = new THREE.InstancedMesh(rb(0.26, 0.22, 1, 0.09), M.caneDry, 22);
  for (const m of [stalk, dry]) {
    m.castShadow = m.receiveShadow = true;
    m.frustumCulled = false;
    group.add(m);
  }
  const setFill = (k) => {
    const kk = sat(k);
    const put = (mesh, n, off) => {
      for (let i = 0; i < n; i++) {
        const layer = Math.floor((i * 4) / n); // 0 .. 3, filling from the bottom up
        const show = kk > layer * 0.25 + 0.04;
        if (!show) {
          _m.compose(_p.set(0, -5, 0), _q.identity(), _s.set(0, 0, 0));
          mesh.setMatrixAt(i, _m);
          continue;
        }
        const u = rnd(i + off, 9);
        const v = rnd(i + off + 61, 9);
        const x = (u - 0.5) * (X - 2.2);
        const z = (v - 0.5) * (Z - 4.8);
        const y = floorAt(x) + 0.22 + layer * 0.44 + rnd(i + off + 13, 9) * 0.12;
        _e.set(0, (rnd(i + off + 23, 9) - 0.5) * 0.7, (rnd(i + off + 29, 9) - 0.5) * 0.26);
        _q.setFromEuler(_e);
        _m.compose(_p.set(x, y, z), _q, _s.set(1, 1, 2.6 + 2.0 * rnd(i + off + 37, 9)));
        mesh.setMatrixAt(i, _m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    put(stalk, N, 0);
    put(dry, dry.count, 500);
  };
  setFill(0);
  return {group, lipY, rimY, floorY: lipY, setFill, span: {x: X, z: Z}};
}

// ================================================================ the shredder
export function buildShredder({number = '01'} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'shredder';
  const rotorY = 7.4;
  const inletY = 6.4;
  const outletY = 5.6;
  const HX = 2.8; // housing half length (x)
  const HZ = 2.3; // housing half width (z)
  const y0 = 5.0; // housing floor
  const y1 = 9.4; // housing roof
  const RT = 1.5; // rotor tip radius
  tpl(`shredder|${number}`, (P) => {
    // ---- the leg frame: 4 chunky blue legs, a dark base plate under each, braced
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const x = sx * (HX - 0.5);
        const z = sz * (HZ - 0.45);
        P.ext(M.blueDeep, x - 0.3, x + 0.3, 0, y0 + 0.1, z - 0.3, z + 0.3, 0.12);
        P.ext(M.chassis, x - 0.52, x + 0.52, 0, 0.12, z - 0.52, z + 0.52, 0.05);
      }
    for (const sz of [-1, 1]) {
      P.bar(M.steelDeep, [-HX + 0.5, 1.0, sz * (HZ - 0.45)], [HX - 0.5, 3.4, sz * (HZ - 0.45)], 0.16);
      P.bar(M.steelDeep, [-HX + 0.5, 3.4, sz * (HZ - 0.45)], [HX - 0.5, 1.0, sz * (HZ - 0.45)], 0.16);
      P.ext(M.blueDeep, -HX + 0.4, HX - 0.4, 2.1, 2.34, sz * (HZ - 0.45) - 0.18, sz * (HZ - 0.45) + 0.18, 0.08);
    }
    // ---- the housing, built as plates so the +z face keeps a big opening on the rotor
    P.ext(M.blue, -HX, HX, y0, y0 + 0.4, -HZ, HZ, 0.16); // floor
    P.ext(M.blue, -HX, HX, y1 - 0.45, y1, -HZ, HZ, 0.18); // roof
    P.ext(M.blue, -HX, HX, y0, y1, -HZ, -HZ + 0.42, 0.16); // the -z wall
    P.ext(M.chassis, -HX + 0.3, HX - 0.3, y0 + 0.3, y1 - 0.4, -HZ + 0.42, -HZ + 0.52, 0.04); // its dark liner
    for (const sx of [-1, 1]) P.ext(M.blue, sx * HX - 0.42, sx * HX, y0, y1, -HZ, HZ, 0.16); // the end walls
    // the +z face: a frame around a 3.6 x 2.5 window
    P.ext(M.blue, -HX, HX, y0, rotorY - 1.72, HZ - 0.42, HZ, 0.16);
    P.ext(M.blue, -HX, HX, rotorY + 1.62, y1, HZ - 0.42, HZ, 0.16);
    for (const sx of [-1, 1]) P.ext(M.blue, sx * (HX - 0.62), sx * HX, y0, y1, HZ - 0.42, HZ, 0.16);
    P.ext(M.blueLight, -HX + 0.5, HX - 0.5, rotorY - 1.86, rotorY - 1.62, HZ - 0.06, HZ + 0.14, 0.07);
    P.ext(M.blueLight, -HX + 0.5, HX - 0.5, rotorY + 1.62, rotorY + 1.86, HZ - 0.06, HZ + 0.14, 0.07);
    // the anvil / grid bars under the rotor, the dark inner shadow behind it
    P.ext(M.chassis, -HX + 0.5, HX - 0.5, y0 + 0.36, y0 + 0.5, -HZ + 0.5, HZ - 0.5, 0.05);
    for (let x = -HX + 0.8; x < HX - 0.6; x += 0.46) P.ext(M.steelDeep, x - 0.1, x + 0.1, y0 + 0.44, y0 + 0.72, -HZ + 0.55, HZ - 0.55, 0.05);
    // ---- the inlet mouth at -x, where the carrier's head drops cane in: a tray sloping down into the housing
    //      between two cheeks, with a yellow wear lip across its mouth
    //      (the tray's outer lip tops out exactly at inletY, so cane leaving the carrier's head deck slides in)
    P.add(M.blue, rb(2.3, 0.34, 2 * HZ + 0.5, 0.12), -HX - 0.9, inletY - 0.47, 0, 0, 0, -0.26);
    for (const sz of [-1, 1]) {
      P.add(M.blue, rb(2.3, 1.7, 0.34, 0.12), -HX - 0.9, inletY + 0.41, sz * (HZ + 0.2), 0, 0, -0.26);
      P.add(M.white, rb(2.4, 0.2, 0.5, 0.08), -HX - 0.9, inletY + 1.26, sz * (HZ + 0.2), 0, 0, -0.26);
    }
    P.ext(M.yellow, -HX - 2.35, -HX - 1.85, inletY - 0.42, inletY + 0.04, -HZ - 0.34, HZ + 0.34, 0.15);
    // ---- the outlet chute at +x: a blue trough sloping down to its lip at outletY, hung off the housing
    const a = -0.42;
    P.add(M.blue, rb(2.6, 0.34, 2 * HZ - 0.3, 0.12), HX + 1.0, outletY + 0.6, 0, 0, 0, a);
    for (const sz of [-1, 1]) P.add(M.blue, rb(2.6, 1.3, 0.3, 0.1), HX + 1.0, outletY + 1.1, sz * (HZ - 0.15), 0, 0, a);
    P.ext(M.yellow, HX + 1.88, HX + 2.3, outletY - 0.06, outletY + 0.3, -HZ + 0.1, HZ - 0.1, 0.12);
    for (const sz of [-1, 1]) P.bar(M.steelDeep, [HX + 1.95, outletY + 0.3, sz * (HZ - 0.15)], [HX + 0.1, y0 + 2.6, sz * (HZ - 0.15)], 0.16);
    // ---- the motor on a bracket at -z, its belt guard in the rotor's plane
    const mz = -HZ - 1.65;
    P.rcyl(M.blue, 0.78, 0.78, 2.1, 0.55, rotorY, mz, 'z', 0.14, 26);
    P.rcyl(M.blueDeep, 0.5, 0.5, 0.5, 0.55, rotorY, mz + 1.2, 'z', 0.08, 20);
    // the motor's cooling fins, wrapped round its barrel
    for (let k = 0; k < 9; k++) {
      const fa = -0.9 + k * 0.225;
      P.add(M.blueDeep, rb(0.2, 0.26, 1.8, 0.06), 0.55 + Math.sin(fa) * 0.82, rotorY + Math.cos(fa) * 0.82, mz, 0, 0, -fa);
    }
    P.ext(M.chassis, -0.5, 1.7, rotorY - 1.1, rotorY - 0.86, mz - 0.9, mz + 0.9, 0.07);
    P.bar(M.steelDeep, [-0.3, rotorY - 1.0, mz], [-0.3, y0 + 0.2, -HZ + 0.1], 0.16);
    P.bar(M.steelDeep, [1.5, rotorY - 1.0, mz], [1.5, y0 + 0.2, -HZ + 0.1], 0.16);
    // the belt guard: a stadium plate over the drive, yellow (a working part)
    P.add(M.yellow, extrude('shr-guard', () => roundedPoly([V2(-0.95, -0.95), V2(0.95, -0.62), V2(0.95, 0.62), V2(-0.95, 0.95)], [0.9, 0.56, 0.56, 0.9]), 0.42, 0.1), 0.0, rotorY, mz + 0.95, 0, PI / 2, 0);
    P.ext(M.blueDeep, -1.0, 0.05, rotorY - 0.5, rotorY + 0.5, mz + 0.74, mz + 1.16, 0.12);
    // ---- the signs
    P.text(`SHREDDER ${number}`, {fg: TOY.white, px: 110}, 0.38, 0, y0 + 0.28, HZ + 0.17);
    P.text(`SH ${number}`, {fg: TOY.white, px: 110}, 0.46, 0, y1 - 1.0, -HZ - 0.07, PI);
    P.beacon(HX - 0.6, y1, HZ - 0.6, 0.15);
  }, group);
  // ---- the rotor: a yellow hammer rotor on an axis along z at rotorY
  const rotor = new THREE.Group();
  rotor.position.set(0, rotorY, 0);
  group.add(rotor);
  tpl('shredder|rotor', (P) => {
    P.rcyl(M.steelDeep, 0.56, 0.56, 3.1, 0, 0, 0, 'z', 0.12, 26);
    P.rcyl(M.steel, 0.22, 0.22, 2 * HZ + 1.6, 0, 0, 0, 'z', 0.07, 18);
    // 5 discs of 4 hammers, each disc turned 18 deg on from the last
    for (let d = 0; d < 5; d++) {
      const z = -1.24 + d * 0.62;
      P.rcyl(M.yellowDeep, 0.95, 0.95, 0.2, 0, 0, z, 'z', 0.06, 26);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * PI * 2 + d * 0.314;
        P.add(M.yellow, rb(0.86, 0.4, 0.42, 0.14), Math.cos(a) * (RT - 0.42), Math.sin(a) * (RT - 0.42), z, 0, 0, a);
        P.add(M.yellowDeep, rb(0.22, 0.52, 0.46, 0.1), Math.cos(a) * (RT - 0.08), Math.sin(a) * (RT - 0.08), z, 0, 0, a);
      }
    }
  }, rotor);
  const setRotor = (a) => {
    rotor.rotation.z = a;
  };
  setRotor(0);
  return {group, setRotor, inletY, outletY, rotorY};
}

// ================================================================ the mill tandem
export function buildMillTandem({n = 4} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'mill-tandem';
  const pitch = 7.0;
  const RR = 0.95; // roller radius (1.9 across)
  const RL = 2.8; // roller length along z
  const topY = 4.2;
  const botY = 2.55;
  const botX = 1.02;
  const feedLip = 5.6;
  const trayLip = 0.9;
  const FZ = 1.78; // the headstock plates' z
  const half = ((n - 1) * pitch) / 2;
  const length = (n - 1) * pitch + 5.4;
  const xs = [];
  for (let i = 0; i < n; i++) xs.push(-half + i * pitch);

  // ---- the plinth and the juice tray, the whole row long
  tpl(`mill|tray|${n}`, (P) => {
    const hl = length / 2;
    P.ext(M.chassis, -hl - 0.2, hl + 0.2, 0, 0.14, -2.9, 2.9, 0.06);
    P.ext(M.blueDeep, -hl, hl, 0.1, 0.42, -2.7, 2.7, 0.12);
    // the tray: a blue box open on top, its lip at trayLip
    for (const sz of [-1, 1]) P.ext(M.blue, -hl, hl, 0.3, trayLip, sz * 2.52 - 0.18, sz * 2.52 + 0.18, 0.1);
    for (const sx of [-1, 1]) P.ext(M.blue, sx * hl - 0.18, sx * hl + 0.18, 0.3, trayLip, -2.7, 2.7, 0.1);
    for (const sz of [-1, 1]) P.ext(M.white, -hl - 0.04, hl + 0.04, trayLip - 0.1, trayLip + 0.02, sz * 2.52 - 0.23, sz * 2.52 + 0.23, 0.05);
    P.ext(M.chassis, -hl + 0.2, hl - 0.2, 0.26, 0.4, -2.45, 2.45, 0.05);
    // the strainer drain at the +x end and the juice main under the tray
    P.rcyl(M.pipe, 0.3, 0.3, 2.2, hl + 1.0, 0.56, 0, 'x', 0.08, 20);
    P.rcyl(M.pipe, 0.3, 0.3, 1.0, hl + 2.0, 0.56, 0, 'z', 0.08, 20);
    P.text('JUICE', {fg: TOY.white, px: 110}, 0.34, -hl + 2.2, 0.58, 2.76);
  }, group);
  // the juice standing in the tray, so the row reads wet from above
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(length - 0.5, 4.7).rotateX(-PI / 2), M.juice);
  pool.receiveShadow = true;
  group.add(pool);

  const mills = [];
  for (let i = 0; i < n; i++) {
    const mill = new THREE.Group();
    mill.position.x = xs[i];
    group.add(mill);
    const num = String(i + 1);
    // ---- the yellow headstocks, the cap bearings, the feed chute, the trash plate
    tpl('mill|frame', (P) => {
      // the headstocks: two yellow plates, low enough that the top roller stands proud of them
      const plate = () =>
        roundedPoly([V2(-2.1, 0.3), V2(2.1, 0.3), V2(2.1, 2.9), V2(1.5, 4.05), V2(-1.5, 4.05), V2(-2.1, 2.9)], [0.3, 0.3, 0.42, 0.34, 0.34, 0.42]);
      for (const sz of [-1, 1]) {
        P.add(M.yellow, extrude('mill-plate', plate, 0.56, 0.14), 0, 0, sz * FZ);
        // the bearing housings for the three rollers, the hydraulic cap over the top one
        P.rcyl(M.yellowDeep, 0.5, 0.5, 0.72, 0, topY, sz * (FZ + 0.26), 'z', 0.1, 22);
        for (const sx of [-1, 1]) P.rcyl(M.yellowDeep, 0.44, 0.44, 0.64, sx * botX, botY, sz * (FZ + 0.22), 'z', 0.1, 22);
        P.rcyl(M.steel, 0.24, 0.24, 0.8, 0, topY + 0.86, sz * FZ, 'y', 0.07, 16);
        P.ext(M.chassis, -0.34, 0.34, topY + 1.2, topY + 1.5, sz * FZ - 0.34, sz * FZ + 0.34, 0.1);
      }
      // two tie bars over the top roller instead of a full cross head, so the roller stays in view
      for (const sx of [-1, 1]) P.ext(M.yellow, sx * 1.52 - 0.3, sx * 1.52 + 0.3, 3.85, 4.3, -FZ - 0.3, FZ + 0.3, 0.15);
      P.ext(M.yellowDeep, -1.9, 1.9, 0.3, 0.74, -FZ, FZ, 0.14);
      P.ext(M.chassis, -2.2, 2.2, 0.14, 0.34, -FZ - 0.34, FZ + 0.34, 0.07);
      // the Donnelly feed chute on -x: three walls with a white rim, its lip at feedLip, its mouth at the nip
      for (const sz of [-1, 1]) P.ext(M.blue, -2.15, -0.62, 4.55, feedLip, sz * 1.3 - 0.13, sz * 1.3 + 0.13, 0.06);
      P.ext(M.blue, -2.15, -1.89, 4.45, feedLip, -1.43, 1.43, 0.09);
      P.ext(M.blue, -0.88, -0.62, 4.85, feedLip, -1.43, 1.43, 0.09);
      for (const sz of [-1, 1]) P.ext(M.white, -2.22, -0.56, feedLip - 0.13, feedLip + 0.03, sz * 1.3 - 0.19, sz * 1.3 + 0.19, 0.05);
      P.ext(M.white, -2.22, -1.83, feedLip - 0.13, feedLip + 0.03, -1.49, 1.49, 0.05);
      P.ext(M.white, -0.94, -0.56, feedLip - 0.13, feedLip + 0.03, -1.49, 1.49, 0.05);
      P.add(M.blueDeep, rb(1.2, 0.22, 2.6, 0.08), -1.42, 4.6, 0, 0, 0, -0.42);
      // the trash plate between the bottom rollers, a scraper on each, the discharge shelf at +x
      P.add(M.steelDeep, rb(1.9, 0.26, RL - 0.1, 0.08), 0.1, 1.82, 0, 0, 0, 0.22);
      for (const sx of [-1, 1]) P.add(M.steel, rb(0.7, 0.18, RL - 0.2, 0.06), sx * (botX + 0.95), botY - 0.46, 0, 0, 0, sx * -0.5);
      P.ext(M.steel, 1.6, 2.6, 2.5, 2.68, -RL / 2, RL / 2, 0.06);
    }, mill);
    tpl(`mill|num|${num}`, (P) => {
      P.text(`MILL ${num}`, {fg: C.text, px: 120}, 0.46, 0, 2.3, FZ + 0.3);
      P.text(`MILL ${num}`, {fg: C.text, px: 120}, 0.46, 0, 2.3, -FZ - 0.3, PI);
    }, mill);
    // ---- the three rollers
    const rollers = [];
    const top = rollerUnit(RR, RL, 2 * FZ + 1.5, M.yellowDeep);
    top.position.set(0, topY, 0);
    mill.add(top);
    rollers.push([top, -1]);
    for (const sx of [-1, 1]) {
      const r = rollerUnit(RR, RL, 2 * FZ + 1.3, M.yellowDeep);
      r.position.set(sx * botX, botY, 0);
      mill.add(r);
      rollers.push([r, 1]);
    }
    // ---- the juice falling from each bottom roller into the tray
    const streams = [-1, 1].map((sx) => {
      const s = part(rb(0.46, 1, RL - 0.5, 0.15), M.juice, mill);
      s.castShadow = false;
      s.userData.x = sx * botX;
      return s;
    });
    mills.push({x: xs[i], feedLip, trayLip, rollers, streams});
    // ---- the intercarrier up to the next mill's feed chute
    if (i < n - 1) {
      const inter = new THREE.Group();
      inter.position.set(3.55, 4.3, 0);
      mill.add(inter);
      tpl('mill|inter', (P) => {
        const a = Math.atan2(2.8, 2.7);
        const len = Math.hypot(2.7, 2.8);
        P.add(M.blueDeep, rb(len, 0.26, 2.5, 0.08), 0, 0, 0, 0, 0, a);
        for (const sz of [-1, 1]) P.add(M.blue, rb(len, 0.9, 0.26, 0.09), 0, 0, sz * 1.38, 0, 0, a);
        for (let k = 0; k < 6; k++) {
          const u = -len / 2 + 0.45 + (k * (len - 0.9)) / 5;
          P.add(M.yellow, rb(0.32, 0.2, 2.3, 0.07), Math.cos(a) * u, Math.sin(a) * u + 0.2, 0, 0, 0, a);
        }
        P.bar(M.steelDeep, [-0.3, -0.9, 1.3], [-0.3, -3.1, 1.3], 0.16);
        P.bar(M.steelDeep, [-0.3, -0.9, -1.3], [-0.3, -3.1, -1.3], 0.16);
      }, inter);
    }
  }
  const setRollers = (a) => {
    for (const m of mills) for (const [r, s] of m.rollers) r.rotation.z = s * a;
  };
  const y0 = trayLip - 0.18; // the juice surface in the tray
  const h = botY - RR - y0; // from the bottom rollers' lowest point down to it
  const setJuice = (k, t = 0) => {
    const kk = sat(k);
    pool.position.y = lerp(trayLip - 0.5, trayLip - 0.14, kk);
    for (let i = 0; i < mills.length; i++) {
      const m = mills[i];
      for (let j = 0; j < 2; j++) {
        const s = m.streams[j];
        const ph = t * 2.4 + i * 1.7 + j * 0.9;
        s.visible = kk > 0.02;
        if (!s.visible) continue;
        s.scale.set(0.3 + 0.9 * kk + 0.06 * Math.sin(ph), h, 0.72 + 0.28 * kk);
        s.position.set(s.userData.x + 0.05 * Math.sin(ph * 0.7), y0 + h / 2, 0);
      }
    }
  };
  setRollers(0);
  setJuice(0, 0);
  return {group, setRollers, setJuice, mills: mills.map(({x, feedLip: f, trayLip: tr}) => ({x, feedLip: f, trayLip: tr})), length, pitch};
}

// ================================================================ the juice / liquor tanks
export function buildJuiceTank({d = 6, h = 5, label = 'RAW JUICE', color = MILL.juice} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'juice-tank';
  const skirtY = 0.6;
  const R = d / 2;
  const topY = skirtY + h;
  const key = `tank|${d.toFixed(2)}|${h.toFixed(2)}`;
  tpl(key, (P) => {
    // the skirt on a dark ring foot, with four dark access cut-outs
    P.rcyl(M.steelDeep, R * 0.95, R * 0.95, 0.14, 0, 0.07, 0, 'y', 0.04, 32);
    P.rcyl(M.tankDeep, R * 0.93, R * 0.93, 0.78, 0, 0.39, 0, 'y', 0.1, 32);
    for (let k = 0; k < 4; k++) {
      const a = k * (PI / 2) + PI / 4;
      P.add(M.chassis, rb(0.8, 0.42, 0.2, 0.13), Math.cos(a) * R * 0.93, 0.4, Math.sin(a) * R * 0.93, 0, -a, 0);
    }
    // the nozzles: a juice inlet high on -x, the outlet out of the dish into the skirt
    P.rcyl(M.pipe, 0.26, 0.26, 1.3, -(R + 0.4), topY - 0.9, 0, 'x', 0.08, 18);
    P.rcyl(M.pipe, 0.3, 0.3, 1.4, 0, 0.42, R * 0.93 + 0.5, 'z', 0.08, 18);
    // the top rail: a chunky ring of posts and two rails
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * PI * 2;
      P.ext(M.steel, Math.cos(a) * (R - 0.3) - 0.07, Math.cos(a) * (R - 0.3) + 0.07, topY - 0.1, topY + 0.95, Math.sin(a) * (R - 0.3) - 0.07, Math.sin(a) * (R - 0.3) + 0.07, 0.03);
    }
    for (const ry of [topY + 0.9, topY + 0.5]) {
      for (let k = 0; k < 24; k++) {
        const a0 = (k / 24) * PI * 2;
        const a1 = ((k + 1) / 24) * PI * 2;
        const rr = R - 0.3;
        P.rod(M.steel, [Math.cos(a0) * rr, ry, Math.sin(a0) * rr], [Math.cos(a1) * rr, ry, Math.sin(a1) * rr], 0.055, 8);
      }
    }
    // the manway and vent on the dome
    P.rcyl(M.tankDeep, 0.52, 0.52, 0.3, R * 0.3, topY - 0.02, 0, 'y', 0.08, 20);
    P.rcyl(M.pipe, 0.2, 0.2, 0.9, -R * 0.4, topY + 0.3, 0, 'y', 0.06, 16);
    P.rcyl(M.pipe, 0.3, 0.3, 0.26, -R * 0.4, topY + 0.8, 0, 'y', 0.08, 16);
    // the ladder up the +x flank, up past the rail
    P.ladder(R + 0.12, 1.0, topY + 0.9, 0, 0.66);
    // the sight glass frame on +z (the camera side): two steel collars and a guard either side of the tube
    P.rcyl(M.steel, 0.17, 0.17, 0.26, 0, 1.15, R + 0.22, 'y', 0.05, 16);
    P.rcyl(M.steel, 0.17, 0.17, 0.26, 0, topY - 0.5, R + 0.22, 'y', 0.05, 16);
    for (const sx of [-1, 1]) P.ext(M.steelDeep, sx * 0.19 - 0.03, sx * 0.19 + 0.03, 1.25, topY - 0.6, R + 0.3, R + 0.34, 0.015);
  }, group);
  // the shell: one lathe so the dished bottom and the dome come free
  const prof = [
    [0, 0.45],
    [R * 0.5, 0.56],
    [R * 0.82, 0.8],
    [R * 0.96, 1.0],
    [R, 1.15],
    [R, topY - 0.62],
    [R * 0.97, topY - 0.4],
    [R * 0.78, topY - 0.14],
    [R * 0.45, topY - 0.01],
    [0, topY + 0.04],
  ];
  group.add(lathe(prof, 40, M.tank));
  // the printed label, wrapped round the shell between +x and +z (the camera's quarter)
  const tex = labelTexture(label, {color: TOY.blue});
  const bandH = 0.9;
  const span = Math.min(1.9, (bandH * 4.6) / R); // the label texture is 4:1; the extra 15% keeps the ends off the seam
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.02, R + 0.02, bandH, 48, 1, true, PI / 4 - span / 2, span), decalMat(tex, {rough: 0.5}));
  band.position.y = topY - h * 0.44;
  group.add(band);
  // a blue waist band under it, so the label sits on something
  const waist = new THREE.Mesh(tubeG(R + 0.012, R + 0.012, 0.22, 48), M.blue);
  waist.position.y = topY - h * 0.44 - bandH * 0.85;
  waist.castShadow = false;
  group.add(waist);
  // ---- the sight glass column on +z: a tube with a liquid core that setLevel scales from its bottom
  const gz = R + 0.22;
  const g0 = 1.2;
  const g1 = topY - 0.55;
  const tube = new THREE.Mesh(tubeG(0.13, 0.13, g1 - g0, 14), toyMat(TOY.glass, {rough: 0.1, opacity: 0.45}));
  tube.position.set(0, (g0 + g1) / 2, gz);
  group.add(tube);
  const core = part(cylG(0.1, 0.1, 1, 14), toyMat(color, {paint: true, rough: 0.22}), group);
  const setLevel = (k) => {
    const kk = clamp(sat(k), 0.015, 1);
    core.scale.set(1, (g1 - g0) * kk, 1);
    core.position.set(0, g0 + ((g1 - g0) * kk) / 2, gz);
  };
  setLevel(0.6);
  return {group, setLevel, topY, skirtY, d, label};
}

// ================================================================ the clarifier
export function buildClarifier() {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'clarifier';
  const D = 11.0;
  const R = D / 2;
  const skirtY = 0.6;
  const topY = skirtY + 4.4;
  const surf = topY - 0.5;
  tpl('clarifier', (P) => {
    P.rcyl(M.steelDeep, R * 0.97, R * 0.97, 0.14, 0, 0.07, 0, 'y', 0.04, 40);
    P.rcyl(M.tankDeep, R * 0.95, R * 0.95, 0.95, 0, 0.48, 0, 'y', 0.1, 40);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * PI * 2;
      P.add(M.chassis, rb(0.9, 0.5, 0.22, 0.14), Math.cos(a) * R * 0.95, 0.46, Math.sin(a) * R * 0.95, 0, -a, 0);
    }
    // the feed launder in on -x, the clarified juice out on -z, the mud leg down out of the cone
    P.rcyl(M.pipe, 0.3, 0.3, 1.6, -(R + 0.6), topY - 0.9, 0, 'x', 0.08, 18);
    P.rcyl(M.pipe, 0.26, 0.26, 1.5, 0, topY - 1.5, -(R + 0.55), 'z', 0.08, 18);
    P.rcyl(M.pipe, 0.3, 0.3, 1.6, 0, 0.6, -(R * 0.9 + 0.6), 'z', 0.08, 18);
    // the ladder up the +x flank and the blue rim band (an open tube: a solid one would roof the tank)
    P.ladder(R + 0.14, 1.0, topY + 0.3, 0, 0.66);
    P.add(M.blue, tubeG(R + 0.05, R + 0.05, 0.42, 48), 0, topY - 0.62, 0);
    // the centre column the bridge turns on, standing out of the juice
    P.rcyl(M.tankDeep, 0.62, 0.62, surf + 0.6, 0, (surf + 0.6) / 2, 0, 'y', 0.1, 24);
  }, group);
  // the open bowl: a lathe wound out along the bottom, up the outside, in over the rim, down the inside
  const wall = 0.22;
  group.add(
    lathe(
      [
        [0, 0.6],
        [R * 0.6, 0.76],
        [R * 0.9, 1.04],
        [R, 1.3],
        [R, topY],
        [R - wall, topY],
        [R - wall, 1.35],
        [R * 0.9 - wall, 1.12],
        [R * 0.6 - wall, 0.9],
        [0, 0.76],
      ],
      44,
      M.tank,
    ),
  );
  // the name, wrapped round the shell under the blue band
  {
    const tex = labelTexture('CLARIFIER', {color: TOY.blue});
    const bandH = 0.85;
    const span = (bandH * 4.6) / R;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.02, R + 0.02, bandH, 48, 1, true, PI / 4 - span / 2, span), decalMat(tex, {rough: 0.5}));
    band.position.y = topY - 1.5;
    group.add(band);
  }
  // the juice surface
  const juice = new THREE.Mesh(discG(R - wall - 0.02), M.clear);
  juice.position.y = surf;
  juice.receiveShadow = true;
  group.add(juice);
  // ---- the rake: a bridge across the top on a drive head, two surface scrapers under it
  const rake = new THREE.Group();
  group.add(rake);
  rake.add(walkway(2 * R + 1.2, 1.3, topY + 0.5));
  tpl('clarifier|rake', (P) => {
    // the drive head over the column, the truss under the deck, the two arms and their yellow blades
    P.ext(M.blue, -1.0, 1.0, topY + 0.6, topY + 1.5, -0.9, 0.9, 0.2);
    P.ext(M.blueDeep, -0.7, 0.7, topY + 1.5, topY + 1.72, -0.65, 0.65, 0.09);
    P.rcyl(M.steelDeep, 0.5, 0.5, 0.5, 0, topY + 0.4, 0, 'y', 0.1, 24);
    for (const sx of [-1, 1]) {
      P.bar(M.steelDeep, [sx * 0.8, topY + 0.46, 0], [sx * (R + 0.4), topY + 0.46, 0], 0.22);
      P.ext(M.steelDeep, sx * (R + 0.2) - 0.14, sx * (R + 0.2) + 0.14, topY - 0.3, topY + 0.5, -0.5, 0.5, 0.07);
      // the arm just over the juice, with scraper blades hanging into it
      P.bar(M.steel, [sx * 0.7, surf + 0.26, 0], [sx * (R - 0.6), surf + 0.26, 0], 0.2);
      for (let k = 1; k <= 5; k++) {
        const x = sx * (0.9 + (k * (R - 1.8)) / 5);
        P.add(M.yellow, rb(0.9, 0.5, 0.16, 0.06), x, surf + 0.02, 0, 0, sx * 0.5, 0);
      }
    }
    P.beacon(0, topY + 1.72, 0, 0.16);
  }, rake);
  const setRake = (a) => {
    rake.rotation.y = a;
  };
  setRake(0);
  return {group, setRake, topY, skirtY, d: D, surfaceY: surf};
}

// ================================================================ the evaporator row
export function buildEvaporatorRow({n = 5} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'evaporator-row';
  const pitch = 6.5;
  const R = 2.1;
  const bodyTop = 10.0;
  const walkwayY = 6.0;
  const half = ((n - 1) * pitch) / 2;
  const xs = [];
  for (let i = 0; i < n; i++) xs.push(-half + i * pitch);
  const length = (n - 1) * pitch + 2 * R + 1.2;

  const bodyProf = [
    [0, 0.5],
    [R * 0.5, 0.62],
    [R * 0.8, 0.95],
    [R * 0.95, 1.3],
    [R, 1.6],
    [R, 2.0],
    [R * 1.12, 2.1],
    [R * 1.12, 4.2],
    [R, 4.3],
    [R, 8.4],
    [R * 0.9, 8.9],
    [R * 0.62, 9.2],
    [R * 0.52, 9.3],
    [R * 0.52, bodyTop - 0.3],
    [R * 0.4, bodyTop - 0.05],
    [0, bodyTop],
  ];
  for (let i = 0; i < n; i++) {
    const body = new THREE.Group();
    body.position.x = xs[i];
    group.add(body);
    body.add(lathe(bodyProf, 36, M.tank));
    tpl('evap|body', (P) => {
      // the support skirt with feet, the blue calandria band, the nozzles, the sight glasses
      P.rcyl(M.steelDeep, R * 0.92, R * 0.92, 0.14, 0, 0.07, 0, 'y', 0.04, 30);
      P.rcyl(M.tankDeep, R * 0.88, R * 0.88, 1.15, 0, 0.58, 0, 'y', 0.1, 30);
      for (let k = 0; k < 4; k++) {
        const a = k * (PI / 2) + PI / 4;
        P.add(M.chassis, rb(0.7, 0.44, 0.18, 0.13), Math.cos(a) * R * 0.88, 0.42, Math.sin(a) * R * 0.88, 0, -a, 0);
      }
      P.rcyl(M.blue, R * 1.14, R * 1.14, 0.34, 0, 2.3, 0, 'y', 0.1, 34);
      P.rcyl(M.blue, R * 1.14, R * 1.14, 0.34, 0, 3.98, 0, 'y', 0.1, 34);
      P.rcyl(M.blueLight, R * 1.15, R * 1.15, 0.14, 0, 3.14, 0, 'y', 0.05, 34);
      // The upper barrel runs 4.3 to 8.4 with nothing on it, and at the film's camera that 4 m of pale shell
      // dissolves into the lavender ground: five bodies read as one white smear. A mid-tone jacket over the upper
      // half and a blue collar under the dome give each body a waist and a top, so the row reads as five objects.
      P.rcyl(M.tankMid, R * 1.02, R * 1.02, 4.0, 0, 6.35, 0, 'y', 0.12, 34);
      P.rcyl(M.blue, R * 1.1, R * 1.1, 0.3, 0, 4.42, 0, 'y', 0.1, 34);
      P.rcyl(M.blue, R * 1.1, R * 1.1, 0.34, 0, 8.42, 0, 'y', 0.1, 34);
      // the steam inlet on -z, the condensate out at the bottom, the vapour head's collar
      P.rcyl(M.pipeHot, 0.3, 0.3, 1.2, 0, 3.14, -(R * 1.14 + 0.4), 'z', 0.08, 18);
      P.rcyl(M.pipe, 0.26, 0.26, 1.1, 0, 1.0, R * 0.88 + 0.4, 'z', 0.08, 18);
      P.rcyl(M.steelDeep, R * 0.56, R * 0.56, 0.22, 0, 9.3, 0, 'y', 0.07, 26);
      P.add(M.blue, tubeG(R * 0.53, R * 0.53, 0.42, 30), 0, 9.75, 0);
      P.rcyl(M.steelDeep, R * 0.56, R * 0.56, 0.22, 0, bodyTop - 0.28, 0, 'y', 0.07, 26);
      // the sight glass strip on the +x flank
      for (const yy of [5.0, 6.9]) P.rcyl(M.steel, 0.15, 0.15, 0.24, R + 0.12, yy, 0, 'y', 0.05, 14);
      P.ext(M.steelDeep, R + 0.2, R + 0.26, 5.1, 6.8, -0.18, 0.18, 0.02);
    }, body);
  }
  // the sight-glass tubes (shared geometry, no state)
  for (const x of xs) {
    const t = new THREE.Mesh(tubeG(0.11, 0.11, 1.7, 12), toyMat(TOY.glass, {rough: 0.1, opacity: 0.45}));
    t.position.set(x + R + 0.12, 5.95, 0);
    group.add(t);
  }
  // ---- the pipe runs and the walkway
  tpl(`evap|links|${n}`, (P) => {
    for (let i = 0; i < n - 1; i++) {
      const a = xs[i];
      const b = xs[i + 1];
      // the vapour line: up out of body i's head, across, down into body i+1's top
      P.rcyl(M.pipeHot, 0.34, 0.34, 1.0, a, bodyTop + 0.35, 0, 'y', 0.08, 18);
      P.rcyl(M.pipeHot, 0.34, 0.34, b - a, (a + b) / 2, bodyTop + 0.72, 0, 'x', 0.08, 18);
      P.rcyl(M.pipeHot, 0.34, 0.34, 1.0, b, bodyTop + 0.35, 0, 'y', 0.08, 18);
      // the juice line along the bottom on -z
      P.rcyl(M.pipe, 0.26, 0.26, b - a, (a + b) / 2, 1.0, -(R + 0.7), 'x', 0.07, 16);
      P.rcyl(M.pipe, 0.26, 0.26, 0.9, a, 1.0, -(R + 0.3), 'z', 0.07, 16);
      P.rcyl(M.pipe, 0.26, 0.26, 0.9, b, 1.0, -(R + 0.3), 'z', 0.07, 16);
      P.ext(M.steelDeep, (a + b) / 2 - 0.1, (a + b) / 2 + 0.1, 1.2, walkwayY, -(R + 0.8), -(R + 0.6), 0.05);
    }
    // the walkway's chunky posts and the stub bridges over to each body
    const wz = R + 1.5;
    for (const x of xs) {
      P.ext(M.steelDeep, x - 0.21, x + 0.21, 0, walkwayY, wz + 0.46, wz + 0.88, 0.09);
      P.ext(M.chassis, x - 0.36, x + 0.36, 0, 0.1, wz + 0.31, wz + 1.03, 0.04);
      P.ext(M.steel, x - 0.5, x + 0.5, walkwayY - 0.07, walkwayY + 0.07, R * 0.8, wz, 0.03);
      for (const sz of [R * 0.9, wz - 0.1]) P.ext(M.steel, x - 0.54, x - 0.44, walkwayY, walkwayY + 1.0, sz - 0.05, sz + 0.05, 0.04);
    }
    P.ladder(xs[n - 1] + R + 1.0, 0, walkwayY + 0.95, wz + 0.2, 0.66);
  }, group);
  // the row's name, wrapped round the first body's shell so it follows the curve
  {
    const tex = labelTexture('EVAPORATORS', {color: TOY.blue});
    const bandH = 0.78;
    const span = (bandH * 4.6) / R;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.02, R + 0.02, bandH, 36, 1, true, PI / 4 - span / 2, span), decalMat(tex, {rough: 0.5}));
    band.position.set(xs[0], 7.2, 0);
    group.add(band);
  }
  const wk = walkway(length, 1.4, walkwayY);
  wk.position.z = R + 1.5;
  group.add(wk);
  // ---- the plume off the last body's vapour head
  const pl = plume({n: 9, r: 1.45, rise: 3.2, spread: 1.4, seed: 3});
  pl.group.position.set(xs[n - 1], bodyTop + 0.2, 0);
  group.add(pl.group);
  const setVapour = (t, k = 1) => pl.set(t, smooth(sat(k)) * 0.9);
  setVapour(0, 0);
  return {group, setVapour, bodies: xs.map((x) => ({x, topY: bodyTop})), walkwayY, length, pitch};
}

// ================================================================ the pipe rack
export function buildPipeRack({length = 40, lines = 4, y = 6.4} = {}) {
  const M = mats();
  const group = new THREE.Group();
  group.name = 'pipe-rack';
  const hl = length / 2;
  const Z = 1.7;
  const nb = Math.max(2, Math.round(length / 6) + 1);
  tpl(`rack|${length.toFixed(1)}|${y.toFixed(2)}`, (P) => {
    for (let k = 0; k < nb; k++) {
      const x = -hl + 0.6 + ((length - 1.2) * k) / (nb - 1);
      for (const sz of [-1, 1]) {
        P.ext(M.blue, x - 0.26, x + 0.26, 0, y + 0.3, sz * Z - 0.26, sz * Z + 0.26, 0.1);
        P.ext(M.chassis, x - 0.46, x + 0.46, 0, 0.12, sz * Z - 0.46, sz * Z + 0.46, 0.05);
      }
      P.ext(M.blue, x - 0.24, x + 0.24, y + 0.04, y + 0.3, -Z - 0.26, Z + 0.26, 0.09);
      P.ext(M.steel, x - 0.17, x + 0.17, y * 0.5, y * 0.5 + 0.22, -Z - 0.2, Z + 0.2, 0.08);
      if (k < nb - 1) {
        const x2 = -hl + 0.6 + ((length - 1.2) * (k + 1)) / (nb - 1);
        for (const sz of [-1, 1]) P.bar(M.steelDeep, [x + 0.2, y * 0.5, sz * Z], [x2 - 0.2, y + 0.1, sz * Z], 0.14);
      }
    }
  }, group);
  // the pipe runs: alternating cold and steam, resting on the beams
  for (let i = 0; i < lines; i++) {
    const f = lines === 1 ? 0.5 : i / (lines - 1);
    const z = lerp(-Z + 0.45, Z - 0.45, f);
    const r = i % 2 ? 0.26 : 0.34;
    group.add(pipe([-hl - 0.3, y + 0.34 + r, z], [hl + 0.3, y + 0.34 + r, z], r, i % 2 ? M.pipeHot : M.pipe));
  }
  return {group, length, y, lines};
}
