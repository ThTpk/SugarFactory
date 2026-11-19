// Caneline, the toy sugar mill's world: one crushing day laid out as a pure function of the film clock.
// The site is read east to west by the lorries and west to east by the cane, which is why the camera travels once
// each way. Toy metres, y up, x east, z south.
//
//   x =  230, z = 62     the gate off the public road, and the lorry park
//   x =   60, z = 62     the weighbridge on the internal road, south of the hall
//   x = -160 .. -100     the cane yard: four stacked piles and the pedestal grab
//   x =  -86 ..  -70     the tipping table: the truck drives west up the east ramp, the west (nose) end lifts to
//                        55 deg and the load leaves east over the tailgate, past the ramp, into the hopper
//   x =  -69 ..  -60     the receiving hopper, pour rim at y = 3.0, discharge lip at y = 1.2
//   x =  -60 ..  -22     the cane carrier, climbing 1.2 to 6.4 and in through the hall's west door
//   x =  -35 ..  175     the process hall, open-topped: MILLS, CLARIFIER, EVAPORATORS, PAN HOUSE, CENTRIFUGALS, PACKING
//   x =  200 ..  255     the sugar store, 4 docks
//   z =  -75 ..  -45     the boiler house, the bagasse piles and the molasses tank farm, behind everything
//   z =   92             the public road
//
// The hero is one cane load, CN-4412, 31.4 t of Ban Rai cane on truck CT-18. It is weighed, tipped, carried,
// crushed, clarified, evaporated, boiled, spun, dried and bagged, and the pallet of it leaves on a truck at dock 2:
//   0.6-5.2    CT-18 on the weighbridge; the boom lifts at 4.4
//   5.8-12.6   it runs the internal road west past the hall to the tipping table and up the ramp
//   13.2-18.8  the table tilts to 55 deg and the load goes east into the hopper
//   15.4-23.4  the cane rides the carrier up to the shredder
//   20.5-28.0  the 4-mill tandem crushes it; juice to the tray, bagasse to the boiler
//   26.0-33.5  the clarifier and the 5 evaporator bodies
//   32.0-36.4  pan 01 boils a strike; 35.0-39.0 the centrifugals spin it white
//   37.0-42.4  the dryer and the bagging line; bag 1 of pallet P-2207 is the hero again
//   40.4-44.6  FL-02 runs the pallet out to the store
import * as THREE from 'three';
import {TOY, toyMat, rbox, mesh} from '../airport-shared/style.js';
import {buildToyCargoTerminal, buildToyCityBlock, buildToyFence, buildToyTrees} from '../airport-shared/airside.js';
import {buildToyBoxTruck, buildToyForklift} from '../airport-shared/gse.js';
import {buildToyHall, buildToySign} from '../plant-shared/plant.js';
import {MILL, clamp, lerp, smooth as sm} from './palette.js';
import {buildCaneCarrier, buildCaneHopper, buildShredder, buildMillTandem, buildJuiceTank, buildClarifier, buildEvaporatorRow, buildPipeRack} from './wet.js';
import {buildVacuumPan, buildCrystalliser, buildCentrifugalRow, buildRotaryDryer, buildSugarSilo, buildBaggingLine, buildSugarBag, buildSugarPallet, buildBoilerHouse} from './dry.js';
import {buildCaneTruck, buildCaneTrailer, buildTippingTable, buildWeighbridge, buildCanePile, buildBagassePile, buildCaneGrab, buildMillGate, buildMillSign, buildLabOffice, buildTankFarm, buildYardLamp} from './yard.js';

const ss = (a, b, t) => sm((t - a) / (b - a));
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const yawOf = (t) => Math.atan2(-t.z, t.x);

export const DUR = 44.6;
export const T = {
  weigh: [0.6, 5.2],
  gate: [4.4, 5.8],
  toTable: [5.8, 12.6],
  tilt: [13.2, 18.8],
  carrier: [15.4, 23.4],
  mills: [20.5, 28.0],
  clarify: [26.0, 30.0],
  evap: [28.5, 33.5],
  pan: [32.0, 36.4],
  fuge: [35.0, 39.0],
  dry: [37.0, 40.4],
  bagging: [38.0, 42.4],
  fork: [40.4, 44.6],
};

// ---------------------------------------------------------------- the map
const ROAD_Z = 92; // the public road
const YARD_Z = 62; // the internal road, south of the hall
const HALL = {x: 70, z: 0, L: 210, W: 76}; // x -35 .. 175, z -38 .. 38
const GATE = {x: 230, z: YARD_Z};
const WB = {x: 60, z: YARD_Z};
// The tipping table: deck x -6.5 .. +6.5 local, hinge at its east edge, the east approach ramp built as a bridge on
// two wheel runways with 3.0 clear down the centreline. The truck drives forward up that ramp and finishes nosed
// west, so the deck lifts its nose and the load leaves east over the tailgate.
// The hopper's pour rim stands clear to the east of the ramp's far end (-67.6): the truck has to drive over that
// ramp to reach the deck, and the hopper's walls rise to y = 3.0, so anything overlapping it is a truck driving
// through a wall. The whole wet end east of here is positioned off the hopper's discharge lip.
const TABLE = {x: -77, z: 2, hingeLocalX: 6.5, hingeY: 0.2, deckY: 0.9, truckDX: 0};
const HOPPER = {x: -59, z: 2}; // span 9 in x: pour rim at -63.5, discharge lip at -54.5
const CARRIER = {x: -35.5, z: 2, length: 38, rise: 5.2}; // foot at -54.5, head at -16.5
const SHRED = {x: -11.8, z: 2}; // inlet (-x) at about -16.5, outlet (+x) at about -7
const TANDEM = {x: 6.5, z: 2}; // 4 mills, pitch 7: mill 1 at about -4
const BAGGING = {x: 156, z: 22};
const PALLETISER = {x: 172, z: 22};
const STORE = {x: 228, z: 16};

function makePath(pts) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, z]) => V(x, 0, z)), false, 'centripetal');
  const L = c.getLength();
  const at = (s) => {
    if (s <= 0) return {p: c.getPointAt(0).addScaledVector(c.getTangentAt(0), s), t: c.getTangentAt(0)};
    if (s >= L) return {p: c.getPointAt(1).addScaledVector(c.getTangentAt(1), s - L), t: c.getTangentAt(1)};
    return {p: c.getPointAt(s / L), t: c.getTangentAt(s / L)};
  };
  return {L, at, points: (s0, s1, n = 48) => Array.from({length: n + 1}, (_, i) => at(lerp(s0, s1, i / n)).p)};
}

export function buildWorld() {
  const root = new THREE.Group();
  const add = (o, x = 0, z = 0, ry = 0, y = 0) => {
    o.position.set(x, y, z);
    o.rotation.y = ry;
    root.add(o);
    return o;
  };
  const flat = (w, d, color, x, z, y = 0.01) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), toyMat(color, {rough: 0.95}));
    m.position.set(x, y, z);
    m.receiveShadow = true;
    root.add(m);
    return m;
  };

  // ---------------------------------------------------------------- ground, roads, yards
  flat(3600, 3600, TOY.ground, 0, 0, 0);
  const road = '#ccd6f4';
  flat(1000, 13, road, 20, ROAD_Z, 0.02);
  for (let x = -460; x < 520; x += 9) flat(4, 0.45, TOY.lane, x, ROAD_Z, 0.03);
  flat(13, 34, road, GATE.x, (ROAD_Z + YARD_Z) / 2, 0.02); // in at the gate
  flat(300, 11, road, 80, YARD_Z, 0.019); // the internal road, east half
  flat(120, 11, road, -40, YARD_Z - 2, 0.019);
  flat(130, 50, TOY.road, -128, 12, 0.015); // the cane yard's hardstanding
  flat(66, 34, TOY.road, -70, 12, 0.016); // the tipping apron
  flat(96, 44, TOY.road, 214, 20, 0.015); // the store's apron
  flat(74, 32, TOY.road, 20, -60, 0.015); // the boiler yard

  // ---------------------------------------------------------------- the hall
  const hall = buildToyHall({
    length: HALL.L,
    width: HALL.W,
    wallH: 2.4,
    zones: [
      {name: 'MILLS', w: 4},
      {name: 'CLARIFIER', w: 2.4},
      {name: 'EVAPORATORS', w: 3.2},
      {name: 'PAN HOUSE', w: 2.6},
      {name: 'CENTRIFUGALS', w: 2.4},
      {name: 'PACKING', w: 3.4},
    ],
    doors: [
      {side: '-x', at: 2, w: 11, h: 9, name: 'CARRIER'},
      {side: '+x', at: 22, w: 8, h: 6.6, name: 'G2'},
      {side: '+z', at: -40, w: 8, h: 6.6, name: 'G3'},
      {side: '-z', at: 60, w: 8, h: 6.6, name: 'G4'},
    ],
  });
  add(hall.group, HALL.x, HALL.z);
  add(buildToySign({text: 'CANELINE', sub: 'Suphan Mill  ·  ML-01', kind: 'stand'}), 60, 42);

  // ---------------------------------------------------------------- the wet end
  const carrier = buildCaneCarrier({length: CARRIER.length, rise: CARRIER.rise});
  add(carrier.group, CARRIER.x, CARRIER.z);
  const hopper = buildCaneHopper();
  add(hopper.group, HOPPER.x, HOPPER.z);
  const shredder = buildShredder({number: '01'});
  add(shredder.group, SHRED.x, SHRED.z);
  const tandem = buildMillTandem({n: 4});
  add(tandem.group, TANDEM.x, TANDEM.z);
  const rawTank = buildJuiceTank({d: 6, h: 5, label: 'RAW JUICE', color: MILL.juice});
  add(rawTank.group, 14, 14);
  const clarifier = buildClarifier();
  add(clarifier.group, 28, -8);
  const clearTank = buildJuiceTank({d: 6, h: 5, label: 'CLEAR JUICE', color: MILL.clear});
  add(clearTank.group, 14, -18);
  const evap = buildEvaporatorRow({n: 5});
  add(evap.group, 58, 8);
  const syrupTank = buildJuiceTank({d: 6, h: 5, label: 'SYRUP', color: MILL.syrup});
  add(syrupTank.group, 58, -18);
  add(buildPipeRack({length: 46, lines: 4, y: 6.4}).group, 36, -2);
  add(buildPipeRack({length: 40, lines: 3, y: 6.4}).group, 104, -2);

  // ---------------------------------------------------------------- the dry end
  const pan1 = buildVacuumPan({number: '01'});
  add(pan1.group, 86, 6);
  const pan2 = buildVacuumPan({number: '02'});
  add(pan2.group, 95, 6);
  const cryst = buildCrystalliser({n: 3});
  add(cryst.group, 92, -16);
  const fuges = buildCentrifugalRow({n: 6});
  add(fuges.group, 121, 4);
  const dryer = buildRotaryDryer({length: 16});
  add(dryer.group, 148, 8);
  const siloA = buildSugarSilo({d: 7, h: 9, label: 'A'});
  add(siloA.group, 160, -12);
  const siloB = buildSugarSilo({d: 7, h: 9, label: 'B'});
  add(siloB.group, 170, -12);
  const bagging = buildBaggingLine({length: 22});
  add(bagging.group, BAGGING.x, BAGGING.z);
  const boiler = buildBoilerHouse();
  add(boiler.group, 10, -62);

  // ---------------------------------------------------------------- the yard
  const wb = buildWeighbridge({label: 'WB-1'});
  add(wb.group, WB.x, WB.z);
  const gate = buildMillGate();
  add(gate.group, GATE.x, ROAD_Z - 16, Math.PI / 2);
  add(buildMillSign({name: 'CANELINE', sub: 'Suphan Mill'}), GATE.x + 15, ROAD_Z - 16);
  const table = buildTippingTable({number: 'T1'});
  add(table.group, TABLE.x, TABLE.z);
  const grab = buildCaneGrab({number: '02'});
  add(grab.group, -116, 12);
  const piles = [
    add(buildCanePile({volume: 520, seed: 3}), -158, 0, 0.1),
    add(buildCanePile({volume: 430, seed: 7}), -156, 24, -0.05),
    add(buildCanePile({volume: 360, seed: 11}), -124, -4, 0.08),
    add(buildCanePile({volume: 300, seed: 17}), -128, 26, 0),
  ];
  add(buildBagassePile({volume: 420, seed: 5}), -8, -58, 0.2);
  add(buildBagassePile({volume: 260, seed: 9}), 42, -62, -0.1);
  add(buildTankFarm({n: 3}), 118, -52);
  add(buildLabOffice(), -96, -28);
  // lamps down the internal road as well as round the yard: the camera rides this road for 7 seconds and an empty
  // verge reads as nothing happening
  for (const [x, z] of [[-150, 40], [-104, 40], [-70, -14], [120, -34], [206, 38]]) add(buildYardLamp(), x, z);
  for (let x = -40; x <= 220; x += 52) add(buildYardLamp(), x, YARD_Z - 8);

  // ---------------------------------------------------------------- the store
  const store = buildToyCargoTerminal({docks: 4, stock: true, name: 'ST-1', sign: ['CANELINE', 'Sugar Store  ·  ST-1']});
  add(store.group, STORE.x, STORE.z);
  const DOCK_OFF = 6.3;
  const dockX = (i) => STORE.x + store.docks[i].x;
  const outTruck = buildToyBoxTruck({livery: 'aurora'});
  add(outTruck.group, dockX(1), STORE.z + DOCK_OFF, -Math.PI / 2);
  const outTruck2 = buildToyBoxTruck({livery: 'kestrel'});
  add(outTruck2.group, dockX(3), STORE.z + DOCK_OFF, -Math.PI / 2);
  for (let i = 0; i < 4; i++) store.setDoor(i, i === 1 || i === 3 ? 1 : 0);

  // ---------------------------------------------------------------- the hero truck and the yard traffic
  const hero = buildCaneTruck({number: '18', livery: 'aurora', load: 1});
  root.add(hero.group);
  // the internal road west, then the swing north into the tipping apron and straight up the table's east ramp
  const toTable = makePath([
    [WB.x, WB.z], [20, YARD_Z], [-12, YARD_Z - 1], [-36, YARD_Z - 5], [-54, 47], [-62, 33], [-64, 18], [-67, 8], [-70, 2.6], [TABLE.x, TABLE.z],
  ]);
  const second = buildCaneTruck({number: '24', livery: 'kestrel', load: 1});
  root.add(second.group);
  const secondTrailer = buildCaneTrailer({number: '24'});
  root.add(secondTrailer.group);
  // the lorry park by the gate: loaded trucks waiting their turn, nose to tail along the verge
  const queue = [
    add(buildCaneTruck({number: '31', livery: 'plain', load: 1}).group, GATE.x - 18, YARD_Z + 11, Math.PI),
    add(buildCaneTruck({number: '35', livery: 'kestrel', load: 1}).group, GATE.x - 31, YARD_Z + 11, Math.PI),
    add(buildCaneTruck({number: '41', livery: 'aurora', load: 1}).group, GATE.x - 44, YARD_Z + 11, Math.PI),
    add(buildCaneTruck({number: '47', livery: 'kestrel', load: 1}).group, 116, YARD_Z + 11, Math.PI),
  ];
  // tared out and on their way back to the farms, parked clear of the lane
  const empties = [
    add(buildCaneTruck({number: '12', livery: 'aurora', load: 0}).group, -96, YARD_Z + 9, 0),
    add(buildCaneTruck({number: '09', livery: 'plain', load: 0}).group, 24, YARD_Z + 16, 0),
  ];
  const traffic = [0, 1].map((i) => {
    const tr = buildToyBoxTruck({livery: i ? 'kestrel' : 'plain'});
    root.add(tr.group);
    return tr;
  });

  // ---------------------------------------------------------------- the hero bag, the pallet and the forklift
  const heroBag = buildSugarBag({kind: 'white'});
  root.add(heroBag);
  const heroPallet = buildSugarPallet({layers: 3, kind: 'white', seed: 4});
  root.add(heroPallet);

  const stockPallets = [
    add(buildSugarPallet({layers: 3, kind: 'white', seed: 1}), 180, 30),
    add(buildSugarPallet({layers: 3, kind: 'white', seed: 2}), 180, 26),
    add(buildSugarPallet({layers: 2, kind: 'raw', seed: 3}), 208, 30),
    add(buildSugarPallet({layers: 3, kind: 'white', seed: 5}), 208, 26),
  ];
  const fork = buildToyForklift();
  root.add(fork.group);
  const forkPath = makePath([[PALLETISER.x + 2, 22], [188, 22], [200, 20], [212, 18], [dockX(1) - 7.5, STORE.z + 9.5]]);

  // ---------------------------------------------------------------- landscape
  for (let x = -340; x < 480; x += 30) add(buildToyFence({length: 30}), x + 15, ROAD_Z - 14);
  // a second fence between the internal road and the public one, so the drive down it has a near edge to read against
  for (let x = -80; x < 260; x += 30) add(buildToyFence({length: 30}), x + 15, YARD_Z + 17);
  const trees = [];
  for (let x = -340; x < 480; x += 16) trees.push({x: x + 3 * Math.sin(x), z: ROAD_Z + 11, size: 0.95 + 0.15 * Math.sin(x)});
  for (let x = -60; x < 250; x += 26) trees.push({x: x + 2 * Math.sin(x * 0.7), z: YARD_Z + 21, size: 1.0 + 0.12 * Math.cos(x)});
  for (const [x, z] of [[-250, 20], [-250, -30], [-180, -34], [-60, -40], [96, -74], [180, -60], [268, -20], [272, 30], [-10, -84], [-120, -48]]) trees.push({x, z, size: 1.25});
  root.add(buildToyTrees(trees));
  let seed = 7;
  for (let x = -320; x < 480; x += 44) {
    add(buildToyCityBlock({w: 28, d: 20, floors: 3 + (seed % 3), seed}), x, ROAD_Z + 34);
    seed += 5;
  }

  // ================================================================ the clock
  const HX = TABLE.x + TABLE.hingeLocalX; // the hinge, in world x
  const DY = TABLE.deckY - TABLE.hingeY; // the deck above the hinge pin

  /** the hero truck: on the weighbridge, the internal road, then pitched nose-up on the tilting deck */
  const poseHero = (t) => {
    const g = hero.group;
    if (t < T.toTable[0]) {
      g.position.set(WB.x, wb.deckY, WB.z);
      g.quaternion.setFromEuler(new THREE.Euler(0, Math.PI, 0));
      hero.setLoad(1);
      return 'weigh';
    }
    if (t < T.tilt[0]) {
      const s = toTable.L * ss(...T.toTable, t);
      const {p, t: tg} = toTable.at(s);
      // down off the weighbridge, then up the table's east ramp over the last 11 m
      const y = lerp(wb.deckY, 0, clamp(s / 14)) + TABLE.deckY * clamp((s - (toTable.L - 11)) / 9);
      g.position.set(p.x, y, p.z);
      g.quaternion.setFromEuler(new THREE.Euler(0, yawOf(tg), 0));
      hero.roll(s);
      hero.setLoad(1);
      return 'drive';
    }
    // on the deck, nosed west: the deck swings about the hinge at its east edge, the west end rising. The angle comes
    // from the table itself (53 deg, trimmed from the contract's 55 so a loaded truck's cab stays under y = 12).
    const k = ss(...T.tilt, t);
    const phi = -table.tilt * k;
    const dx = TABLE.truckDX - TABLE.hingeLocalX; // the truck's origin, west of the hinge
    const c = Math.cos(phi);
    const s2 = Math.sin(phi);
    g.position.set(HX + dx * c - DY * s2, TABLE.hingeY + dx * s2 + DY * c, TABLE.z);
    g.quaternion
      .setFromAxisAngle(V(0, 0, 1), phi)
      .multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI));
    hero.setLoad(1 - ss(0.42, 0.94, k));
    return 'tip';
  };

  const pose = (t) => {
    const phase = poseHero(t);
    wb.setBoom(ss(...T.gate, t));
    gate.setBoom(1);
    const tilt = ss(...T.tilt, t);
    table.setTilt(tilt);
    // the hopper takes the load, then feeds it away down the carrier
    const fed = ss(T.tilt[0] + 2.0, T.tilt[1], t);
    hopper.setFill(clamp(fed - ss(T.carrier[0] + 1.8, T.carrier[1], t)));
    // ---- the carrier runs all day; the hero load is the deep bed that climbs it
    carrier.setSlats(t * 3.4);
    const base = 0.45 * ss(0, 2.2, t);
    const heroBed = 0.5 * ss(T.carrier[0], T.carrier[0] + 2.4, t) * (1 - ss(T.carrier[1] - 2.2, T.carrier[1], t));
    carrier.setCane(clamp(base + heroBed), t);
    // ---- the mill house never stops
    shredder.setRotor(t * 9.0);
    tandem.setRollers(t * 2.6);
    tandem.setJuice(0.6 + 0.4 * Math.sin(t * 1.3), t);
    rawTank.setLevel(0.42 + 0.3 * ss(T.mills[0], T.mills[1], t));
    clarifier.setRake(t * 0.22);
    clearTank.setLevel(0.36 + 0.34 * ss(T.clarify[0], T.clarify[1] + 3, t));
    evap.setVapour(t, 0.55 + 0.45 * ss(T.evap[0], T.evap[1], t));
    syrupTank.setLevel(0.3 + 0.4 * ss(T.evap[0], T.evap[1] + 2, t));
    // ---- the pans: 01 takes the hero strike, 02 runs its own cycle
    pan1.setBoil(t, 0.5 + 0.5 * ss(T.pan[0], T.pan[0] + 2, t));
    pan1.setStrike(ss(...T.pan, t));
    pan2.setBoil(t, 0.7);
    pan2.setStrike((t * 0.08 + 0.4) % 1);
    cryst.setStir(t * 0.5);
    // ---- the fugals, out of phase so the row never pulses as one
    for (let i = 0; i < 6; i++) {
      const u = ((t * 0.16 + i * 0.1667) % 1 + 1) % 1;
      fuges.setSpin(i, t * (9 + i * 0.7));
      fuges.setCharge(i, clamp(u / 0.3));
      fuges.setDischarge(i, clamp((u - 0.62) / 0.22) * (1 - clamp((u - 0.9) / 0.1)));
    }
    dryer.setDrum(t * 1.1);
    dryer.setHot(t);
    siloA.setLevel(0.46 + 0.2 * ss(T.dry[0], T.dry[1], t));
    siloB.setLevel(0.72);
    // ---- the bagging line, and the hero bag riding it to the pallet
    bagging.setBelt(t * 1.8);
    bagging.setFiller(0.5 + 0.5 * Math.sin(t * 2.4));
    const bagRun = ss(...T.bagging, t);
    const onBelt = t >= T.bagging[0] && bagRun < 0.78;
    heroBag.visible = t >= T.bagging[0];
    if (onBelt) {
      // bagAt is in the line's own frame; the bag's origin is its base, which sits on the belt
      const [bx, by, bz] = bagging.bagAt((bagRun / 0.78) * bagging.length);
      heroBag.position.set(BAGGING.x + bx, by, BAGGING.z + bz);
      heroBag.rotation.set(0, 0, 0);
    }
    // ---- the hero pallet: built at the palletiser, then carried to the store
    const palletBuilt = t >= T.bagging[0] + 2.0;
    heroPallet.visible = palletBuilt;
    let forkState = 'park';
    if (t < T.fork[0]) {
      fork.group.position.set(PALLETISER.x + 6, 0, 18);
      fork.group.rotation.y = Math.PI;
      fork.setForks(0.12);
      heroPallet.position.set(PALLETISER.x, 0, PALLETISER.z);
      heroPallet.rotation.y = 0;
    } else {
      const k = ss(...T.fork, t);
      const lift = 0.12 + 0.58 * clamp((k - 0.04) / 0.08) * (1 - clamp((k - 0.84) / 0.1));
      const s = forkPath.L * clamp((k - 0.14) / 0.68);
      const {p, t: tg} = forkPath.at(s);
      fork.group.position.set(p.x, 0, p.z);
      fork.group.rotation.y = yawOf(tg);
      fork.roll(s);
      fork.setForks(lift);
      const yaw = fork.group.rotation.y;
      heroPallet.position.set(p.x + Math.cos(yaw) * 2.6, lift + 0.08, p.z - Math.sin(yaw) * 2.6);
      heroPallet.rotation.y = yaw;
      forkState = k < 0.84 ? 'run' : 'drop';
    }
    // once it is off the belt the hero bag is the last one laid on the hero pallet, so it rides wherever that goes
    if (heroBag.visible && !onBelt) {
      const yaw = heroPallet.rotation.y;
      heroBag.position.set(
        heroPallet.position.x + Math.cos(yaw) * 0.3,
        heroPallet.position.y + 1.1,
        heroPallet.position.z - Math.sin(yaw) * 0.3,
      );
      heroBag.rotation.set(0, yaw, 0);
    }
    boiler.setFire(t, 0.8 + 0.2 * Math.sin(t * 0.9));
    boiler.setPlume(t, 1);
    // ---- the grab works the cane yard on its own cycle
    {
      const u = ((t * 0.09) % 1 + 1) % 1;
      grab.setSlew(-0.5 + 1.1 * Math.sin(u * Math.PI * 2));
      grab.setBoom(0.35 + 0.4 * Math.sin(u * Math.PI * 2 + 1.2));
      grab.setGrab(clamp((u - 0.15) / 0.1) * (1 - clamp((u - 0.62) / 0.1)));
      grab.setLoad(clamp((u - 0.2) / 0.08) * (1 - clamp((u - 0.6) / 0.08)));
    }
    // ---- the second cane truck runs the internal road a while behind the hero
    {
      // It runs a slice of the hero's road, monotonically across the whole film: no wrap (a wrap pops it across the
      // yard mid-shot), never back as far as the weighbridge it would otherwise drive through, and never as far
      // forward as the table, which is the hero's.
      const s = toTable.L * (0.16 + 0.62 * (t / DUR));
      const {p, t: tg} = toTable.at(s);
      second.group.position.set(p.x, 0, p.z + 7);
      second.group.rotation.y = yawOf(tg);
      second.roll(s);
      second.setLoad(1);
      const b = toTable.at(Math.max(0, s - 11));
      secondTrailer.group.position.set(b.p.x, 0, b.p.z + 7);
      secondTrailer.group.rotation.y = yawOf(b.t);
      secondTrailer.setLoad(1);
    }
    traffic.forEach((tr, i) => {
      const x = 480 - ((t * 16 + i * 360) % 860);
      tr.group.position.set(x, 0, ROAD_Z - 3.2);
      tr.group.rotation.y = Math.PI;
      tr.roll(t * 16);
      tr.group.visible = x > -340 && x < 480;
    });
    store.setDoor(1, 1);

    const crushed = 31.4 * clamp(ss(T.mills[0] - 2, T.mills[1], t));
    return {
      phase,
      netT: 31.4,
      tilt,
      tiltDeg: (tilt * table.tilt * 180) / Math.PI,
      tiltMaxDeg: Math.round((table.tilt * 180) / Math.PI),
      crushed,
      brix: 14.2 + 6.4 * ss(T.evap[0], T.evap[1], t),
      strike: ss(...T.pan, t),
      bags: Math.floor(42 * ss(T.bagging[0], DUR, t)),
      forkState,
      pallets: 4 + (palletBuilt ? 1 : 0),
    };
  };
  pose(0);

  // ---------------------------------------------------------------- anchors, routes, bodies
  const at = (o, dy) => o.getWorldPosition(V()).add(V(0, dy, 0));
  const anchors = {
    hero: () => at(hero.group, 6.0),
    table: () => V(TABLE.x, 4.2, TABLE.z),
    carrier: () => V(CARRIER.x, 6.2, CARRIER.z),
    tandem: () => V(TANDEM.x, 7.4, TANDEM.z),
    evap: () => V(58, 11.4, 8),
    pan: () => V(86, 9.6, 6),
    fuge: () => V(121, 4.6, 4),
    dryer: () => V(148, 5.6, 8),
    bagging: () => V(BAGGING.x, 3.4, BAGGING.z),
    fork: () => at(fork.group, 4.0),
    boiler: () => V(10, 10.0, -62),
    grab: () => at(grab.group, 8.0),
    pile: () => V(-158, 5.0, 0),
    store: () => V(STORE.x, 12.0, STORE.z),
  };
  const routes = {
    hero: (t) => {
      if (t >= T.tilt[0]) return null;
      const s = t < T.toTable[0] ? 0 : toTable.L * ss(...T.toTable, t);
      return toTable.points(s, toTable.L, 48);
    },
    fork: (t) => {
      if (t < T.fork[0] || t > T.fork[1]) return null;
      const k = clamp((ss(...T.fork, t) - 0.14) / 0.68);
      return forkPath.points(forkPath.L * k, forkPath.L, 24);
    },
  };
  const bodies = [
    {name: 'hero', g: hero.group},
    {name: 'second', g: second.group},
    {name: 'secondTrailer', g: secondTrailer.group},
    {name: 'fork', g: fork.group},
    {name: 'heroPallet', g: heroPallet},
    {name: 'table', g: table.group},
    {name: 'wb', g: wb.group},
    {name: 'hopper', g: hopper.group},
    {name: 'outTruck', g: outTruck.group},
    {name: 'outTruck2', g: outTruck2.group},
    ...queue.map((g, i) => ({name: `queue${i}`, g})),
    ...empties.map((g, i) => ({name: `empty${i}`, g})),
    ...traffic.map((tr, i) => ({name: `traffic${i}`, g: tr.group})),
    ...stockPallets.map((g, i) => ({name: `stock${i}`, g})),
    ...piles.map((g, i) => ({name: `pile${i}`, g})),
  ];
  // the pairs that are meant to touch
  const touching = ['hero|table', 'hero|wb', 'second|secondTrailer', 'fork|heroPallet', 'table|hopper'];

  return {
    root,
    pose,
    anchors,
    routes,
    bodies,
    touching,
    trees,
    objects: {hero, second, fork, table, wb, gate, grab, carrier, hopper, shredder, tandem, clarifier, evap, pan1, fuges, dryer, bagging, boiler, store, heroPallet, siloA, hall},
    HALL,
    TABLE,
    STORE,
    dockX,
  };
}
