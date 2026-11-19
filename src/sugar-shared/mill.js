// Everything the toy sugar mill's two pages share: the stage, the world, the product UI, the selection marks, the
// card thumbnails, and every panel's contents as a function of the clock and the posed world.
//
// Two pages are built on this. `film.js` drives it from a timeline — scripted camera keys, a drawn cursor, scripted
// clicks — and records to video. `app.js` drives it from the visitor — drag, zoom, click to select, scrub the day.
// Both call `W.pose(t)` and then fill the same panels from the same numbers, so they can never disagree about what
// the mill is doing at a given second.
//
//   const M = createMill({app, canvas, capture});
//   M.setST(M.W.pose(t));                      // pose the world, hand the numbers to the panels
//   M.panels.cardAt(t, 'tandem', t0, 'MILLS')  // -> the detail card for the mill tandem
//
// The panels read the pose through a mutable cell rather than taking it as an argument everywhere, because the
// reference's cards mix live numbers into almost every line and threading one more parameter through all of them
// buys nothing.
import * as THREE from 'three';
import {TOY, createToyStage} from '../airport-shared/style.js';
import {createToyUI, ICONS} from '../airport-shared/ui.js';
import {createSelection} from '../airport-shared/select.js';
import {thumb} from '../airport-shared/thumbs.js';
import {OPERATOR_AVATAR} from '../airport-shared/avatar.js';
import {buildToyForklift} from '../airport-shared/gse.js';
import {buildToyCargoTerminal} from '../airport-shared/airside.js';
import {buildCaneTruck, buildCaneGrab, buildTippingTable} from './yard.js';
import {buildCaneCarrier, buildMillTandem, buildEvaporatorRow} from './wet.js';
import {buildVacuumPan, buildCentrifugalRow, buildBaggingLine, buildRotaryDryer, buildBoilerHouse} from './dry.js';
import {DUR, T, buildWorld} from './world.js';

export const D2R = Math.PI / 180;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const sm = (x) => {
  const u = clamp(x);
  return u * u * u * (u * (u * 6 - 15) + 10);
};
export const ss = (a, b, t) => sm((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
const f1 = (n) => n.toFixed(1);
const num = (n) => Math.round(n).toLocaleString('en-US');

// two more KPI glyphs in the reference's language: a cane stalk and a droplet, three shades per shape
ICONS.cane = `<svg viewBox="0 0 40 40" width="26" height="26"><rect x="16" y="5" width="8" height="30" rx="3" fill="#3166ea"/><rect x="16" y="5" width="4" height="30" rx="2" fill="#6f98f7"/><path d="M16 14h8M16 21h8M16 28h8" stroke="#2448c8" stroke-width="2"/></svg>`;
ICONS.drop = `<svg viewBox="0 0 40 40" width="26" height="26"><path d="M20 4c7 9 11 14 11 19a11 11 0 01-22 0c0-5 4-10 11-19z" fill="#3166ea"/><path d="M20 4c-7 9-11 14-11 19 0 2 .3 3.6 1 5 2-9 5-15 10-24z" fill="#6f98f7"/></svg>`;

export const UI_WORDS = {
  brand: 'Caneline',
  search: 'Search areas, mills, trucks, loads, pallets...',
  user: ['Mila Novak', 'Mill Operations'],
  avatar: OPERATOR_AVATAR,
  kpis: [
    {ic: 'cane', k: 'Cane crushed', key: 'a', v: '3,861 t', d: '+312', s: 'today · cane in'},
    {ic: 'cube', k: 'Sugar bagged', key: 'b', v: '2,418', d: '+42', s: 'bags · lines 1-2'},
    {ic: 'clock', k: 'Mill uptime', key: 'c', v: '94.2%', d: '+0.6%', s: 'last 24 h · 1 tipper'},
  ],
};

export const AREAS = {
  YARD: ['CY', 'Cane Yard', '41 trucks today · 1 tipping'],
  MILLS: ['MH', 'Mill House', '4 mills · 312 t/h'],
  PROCESS: ['PH', 'Process House', '5 effects · 2 pans'],
  PACK: ['PK', 'Packing & Store', '2 lines · 4/4 docks'],
};
export const AREA_KEYS = ['YARD', 'MILLS', 'PROCESS', 'PACK'];
export const DROP = [
  ['CY', 'Cane Yard', '41 trucks today · 1 tipping', 72],
  ['MH', 'Mill House', '4 mills · 312 t/h', 88],
  ['PH', 'Process House', '5 effects · 2 pans', 64],
  ['PK', 'Packing & Store', '2 lines · 4/4 docks', 58],
];
/** where the camera sits when an area is chosen from the switcher, and which area a selectable belongs to */
export const AREA_VIEW = {
  YARD: {x: -96, z: 10, d: 150},
  MILLS: {x: -2, z: 4, d: 116},
  PROCESS: {x: 74, z: 2, d: 150},
  PACK: {x: 156, z: 16, d: 128},
};

/**
 * Make the map cheap enough to drive. It is 5,200 meshes and 4.6 million triangles, and at 1600 x 900 the GTAO pass
 * alone costs more than everything else put together: measured on this scene, full-resolution ambient occlusion runs
 * the page at 7-9 fps and half-resolution at 60+. AO is a low-frequency signal, so half resolution gives that back
 * for nothing visible. The shadow pass is the next biggest cost. The sun's shadow box rides the camera, so it does
 * have to refresh while you pan, but every third frame is indistinguishable and roughly doubles the rate again.
 *
 * Capture mode opts out of both: a frame-by-frame render has all the time in the world, and the video should get the
 * best frame the scene can produce.
 */
export function tuneForRealtime(st) {
  st.renderer.shadowMap.autoUpdate = false;
  let n = 0;
  return {
    // the composer resizes every pass with the canvas, so the AO has to be put back to half size after each resize
    afterResize() {
      st.gtao.setSize(Math.max(2, Math.round(st.size.w / 2)), Math.max(2, Math.round(st.size.h / 2)));
    },
    beforeFrame() {
      if (n++ % 3 === 0) st.renderer.shadowMap.needsUpdate = true;
    },
  };
}

export function createMill({app, canvas, capture = false}) {
  const st = createToyStage(canvas, {fov: 28});
  const W = buildWorld();
  st.scene.add(W.root);
  const ui = createToyUI(app, UI_WORDS);
  const sel = createSelection(st.scene, st);

  // thumbnails come from fresh copies: thumb() reparents what it is given
  const TH = {
    truck: thumb(buildCaneTruck({number: '18', livery: 'aurora', load: 1}).group),
    grab: thumb(buildCaneGrab({number: '02'}).group, {pad: 1.05}),
    table: thumb(buildTippingTable({number: 'T1'}).group, {pad: 1.05}),
    carrier: thumb(buildCaneCarrier({length: 38, rise: 5.2}).group, {pad: 0.98}),
    tandem: thumb(buildMillTandem({n: 4}).group, {pad: 0.98}),
    pan: thumb(buildVacuumPan({number: '01'}).group, {pad: 1.05}),
    fuge: thumb(buildCentrifugalRow({n: 6}).group, {pad: 0.98}),
    bagging: thumb(buildBaggingLine({length: 22}).group, {pad: 0.98}),
    fork: thumb(buildToyForklift().group),
    mill: thumb(buildToyCargoTerminal({docks: 4, name: 'ST-1'}).group, {pad: 0.95}),
    evap: thumb(buildEvaporatorRow({n: 5}).group, {pad: 0.95}),
    dryer: thumb(buildRotaryDryer({length: 16}).group, {pad: 0.98}),
    boiler: thumb(buildBoilerHouse().group, {pad: 0.95}),
  };

  // the pose, in a cell the panels read: setST() every frame, right after W.pose(t)
  const cell = {ST: {phase: 'weigh', netT: 31.4, tilt: 0, tiltDeg: 0, tiltMaxDeg: 53, crushed: 0, brix: 14.2, strike: 0, bags: 0, forkState: 'park', pallets: 4}};
  const setST = (v) => (cell.ST = v);

  const proj = (v) => st.project(v);
  const O = W.objects;

  const heroState = (t) => {
    const ST = cell.ST;
    return t < T.toTable[0] ? ['Weighing', 'WB-1 · gross 44.6 t', 'wait'] :
      t < T.tilt[0] ? ['To tipper', 'Yard road · table T1', 'in'] :
      t < T.tilt[1] ? [`Tipping ${Math.round(ST.tilt * 100)}%`, `Table T1 · ${ST.tiltMaxDeg} deg`, 'go'] :
      ['Tipped', 'Table T1 · empty, tare 13.2 t', 'go'];
  };
  const stage = (t) =>
    t < T.tilt[0] ? 'Weighed in' :
    t < T.carrier[0] ? 'Tipping' :
    t < T.mills[0] ? 'On the carrier' :
    t < T.clarify[0] ? 'Milling' :
    t < T.pan[0] ? 'Evaporating' :
    t < T.fuge[0] ? 'Boiling' :
    t < T.bagging[0] ? 'Curing' : 'Bagging';

  /** every object a visitor can pick, and the area it belongs to */
  const SEL_OBJ = {
    hero: O.hero.group,
    grab: O.grab.group,
    table: O.table.group,
    carrier: O.carrier.group,
    tandem: O.tandem.group,
    evap: O.evap.group,
    pan: O.pan1.group,
    fuge: O.fuges.group,
    dryer: O.dryer.group,
    bagging: O.bagging.group,
    fork: O.fork.group,
    boiler: O.boiler.group,
    store: O.store.group,
  };
  const SEL_AREA = {
    hero: 'YARD', grab: 'YARD', table: 'YARD',
    carrier: 'MILLS', tandem: 'MILLS',
    evap: 'PROCESS', pan: 'PROCESS', fuge: 'PROCESS',
    dryer: 'PACK', bagging: 'PACK', fork: 'PACK', store: 'PACK',
    boiler: 'MILLS',
  };
  const SEL_TEXT = (kind, t) => {
    const ST = cell.ST;
    return {
      hero: ['CT-18', heroState(t)[0]],
      grab: ['GR-02', 'Feeding'],
      table: ['T1', ST.tilt > 0.02 && ST.tilt < 0.99 ? 'Tipping' : 'Ready'],
      carrier: ['Carrier A', 'Running'],
      tandem: ['Tandem 1-4', 'Crushing'],
      evap: ['Effects 1-5', 'Evaporating'],
      pan: ['Pan 01', 'Boiling'],
      fuge: ['CF-01 to 06', '5 of 6 running'],
      dryer: ['Dryer D1', 'Running'],
      bagging: ['Line 1', 'Running'],
      fork: ['FL-02', ST.forkState === 'park' ? 'Waiting' : 'Carrying'],
      boiler: ['Boiler 1', 'Firing'],
      store: ['Store ST-1', '2 of 4 docks'],
    }[kind];
  };
  const ROUTE = {hero: (t) => W.routes.hero(t), fork: (t) => W.routes.fork(t)};

  const cardAt = (t, kind, t0, area) => {
    const ST = cell.ST;
    const pop = ss(t0, t0 + 0.35, t);
    const pc = (a, b) => clamp((t - a) / (b - a));
    if (kind === 'hero') {
      const [s, txt, cls] = heroState(t);
      return {pop, thumb: TH.truck, org: 'BAN RAI FARMS', title: 'CT-18', sub: 'Cane truck · SPN-4418', stat: s, statCls: cls, statText: txt, prog: t < T.toTable[0] ? pc(...T.weigh) : t < T.tilt[0] ? pc(...T.toTable) : ST.tilt, progText: t < T.tilt[0] ? `${Math.round(100 * (t < T.toTable[0] ? pc(...T.weigh) : pc(...T.toTable)))}%` : `${Math.round(ST.tiltDeg)} deg`, rows: [['Load', '#CN-4412', 1], ['Variety', 'Khon Kaen 3'], ['Net weight', `${f1(ST.netT)} t`], ['Cut', 'Burnt · 18 h old'], ['Destination', 'Table T1 · carrier A'], ['Pol reading', '12.8%']]};
    }
    if (kind === 'grab') return {pop, thumb: TH.grab, org: 'CANE YARD · CY', title: 'GR-02', sub: 'Pedestal cane grab · 6 t', stat: 'Feeding', statCls: 'go', statText: 'Pile 2 to carrier A · 310 t/h', prog: 0.68, progText: '68%', rows: [['Grab', '6.0 t per pass'], ['Cycles this hour', '52'], ['Pile', 'P2 · 430 t left'], ['Shift', 'A · Nok Prasert']]};
    if (kind === 'table') return {pop, thumb: TH.table, org: 'TIPPER · CY', title: 'T1', sub: `Hydraulic tipping table · ${ST.tiltMaxDeg} deg`, stat: ST.tilt > 0.02 && ST.tilt < 0.99 ? 'Tipping' : 'Ready', statCls: 'go', statText: `CT-18 · load CN-4412 · ${f1(ST.netT)} t`, prog: ST.tilt, progText: `${Math.round(ST.tiltDeg)} deg`, rows: [['On deck', 'CT-18', 1], ['Load', `#CN-4412 · ${f1(ST.netT)} t`], ['Tips today', '41'], ['Cycle', '94 s'], ['Next', 'CT-24 · queued']]};
    if (kind === 'carrier') return {pop, thumb: TH.carrier, org: 'MILL HOUSE · MH', title: 'Carrier A', sub: 'Slat cane carrier · 38 m', stat: 'Running', statCls: 'go', statText: 'Feeding shredder 01 · 310 t/h', prog: pc(...T.carrier), progText: `${Math.round(100 * pc(...T.carrier))}%`, rows: [['Speed', '3.4 m/s'], ['Rise', '1.2 to 6.4 m'], ['Bed depth', '0.9 m'], ['Load on deck', '#CN-4412', 1], ['Drive', '110 kW · 72%']]};
    if (kind === 'tandem') return {pop, thumb: TH.tandem, org: 'MILL HOUSE · MH', title: 'Tandem 1-4', sub: '4 three-roller mills · 310 t/h', stat: 'Crushing', statCls: 'go', statText: `#CN-4412 · ${f1(ST.crushed)} of ${f1(ST.netT)} t`, prog: ST.crushed / ST.netT, progText: `${f1(ST.crushed)} t`, rows: [['Mill 1 torque', '68%'], ['Mill 4 torque', '61%'], ['Imbibition', '248% on fibre'], ['Extraction', '96.4%'], ['Bagasse', 'to boiler · 48% moist']]};
    if (kind === 'evap') return {pop, thumb: TH.evap, org: 'PROCESS HOUSE · PH', title: 'Effects 1-5', sub: 'Quintuple evaporator · 10 m bodies', stat: 'Evaporating', statCls: 'go', statText: `Clear juice to syrup · brix ${f1(ST.brix + 48)}`, prog: clamp((ST.brix - 14.2) / 6.4), progText: `${f1(ST.brix + 48)} bx`, rows: [['Effect 1', '118 C · 1.2 bar'], ['Effect 5', '58 C · vacuum'], ['Juice in', '318 m3/h'], ['Syrup out', '65 brix', 1], ['Condensate', 'to boiler feed']]};
    if (kind === 'pan') return {pop, thumb: TH.pan, org: 'PAN HOUSE · PH', title: 'Pan 01', sub: 'Batch vacuum pan · 60 m3', stat: ST.strike > 0.97 ? 'Striking' : 'Boiling', statCls: ST.strike > 0.97 ? 'go' : 'in', statText: `A massecuite · brix ${f1(ST.brix + 68)}`, prog: ST.strike, progText: `${Math.round(ST.strike * 100)}%`, rows: [['Strike', '#ST-2207', 1], ['Vacuum', '-0.86 bar'], ['Steam', '1.2 bar · 118 C'], ['Crystal', '0.62 mm'], ['Next', 'Drop to crystalliser 2']]};
    if (kind === 'fuge') return {pop, thumb: TH.fuge, org: 'CENTRIFUGALS · PH', title: 'CF-01 to 06', sub: 'Batch fugals · 1,750 kg', stat: '5 of 6 running', statCls: 'go', statText: 'A massecuite · 1,180 rpm', prog: 0.83, progText: '5/6', rows: [['Cycle', '3 min 10 s'], ['Purity rise', '+8.4 pts'], ['Molasses', 'to tank farm'], ['CF-04', 'Screen change', 1], ['Sugar out', 'to dryer D1']]};
    if (kind === 'dryer') return {pop, thumb: TH.dryer, org: 'PACKING · PK', title: 'Dryer D1', sub: 'Rotary dryer and cooler · 16 m', stat: 'Running', statCls: 'go', statText: 'White sugar · 0.9% moisture in', prog: 0.71, progText: '71%', rows: [['Drum', '3.0 m across · 2 deg fall'], ['Air in', '110 C'], ['Sugar out', '0.04% moisture', 1], ['To', 'Silos A and B']]};
    if (kind === 'bagging') return {pop, thumb: TH.bagging, org: 'PACKING · PK', title: 'Line 1', sub: 'Weigh, fill and stitch · 50 kg', stat: 'Running', statCls: 'go', statText: `Pallet P-2207 · ${ST.bags} bags`, prog: clamp(ST.bags / 42), progText: `${ST.bags}/42`, rows: [['Bag', '50 kg net'], ['Rate', '19 bags a minute'], ['Check-weigher', 'All in spec'], ['Pallet', 'P-2207 · 12 bags', 1], ['To', 'Store ST-1 · dock 2']]};
    if (kind === 'fork') return {pop, thumb: TH.fork, org: 'STORE · PK', title: 'FL-02', sub: 'Electric forklift · 2.5 t', stat: ST.forkState === 'park' ? 'Waiting' : 'Carrying', statCls: ST.forkState === 'park' ? 'wait' : 'go', statText: ST.forkState === 'park' ? 'At palletiser 1' : 'Pallet P-2207 to dock 2', prog: ST.forkState === 'park' ? 0 : 0.62, progText: '1.1 t', rows: [['Load', 'Pallet P-2207 · 1.1 t', 1], ['Battery', '81%'], ['Shift', 'A · Sam Lee'], ['Next', 'Dock 2 · TRK-4120']]};
    if (kind === 'boiler') return {pop, thumb: TH.boiler, org: 'POWER · MH', title: 'Boiler 1', sub: 'Bagasse-fired · 45 t/h steam', stat: 'Firing', statCls: 'go', statText: 'Bagasse from tandem 1-4 · 142 t/h', prog: 0.88, progText: '88%', rows: [['Steam', '45 t/h · 32 bar'], ['Fuel', 'Bagasse, 48% moist', 1], ['Ash', 'to the field'], ['Export', '4.2 MW to grid']]};
    if (kind === 'store') return {pop, thumb: TH.mill, org: 'STORE · PK', title: 'Store ST-1', sub: 'Sugar store · 4 docks', stat: 'Operational', statCls: 'go', statText: `2 of 4 docks busy · ${ST.pallets} staged`, prog: 0.5, progText: '2/4', rows: [['Dock 2', 'TRK-4120 · loading', 1], ['Dock 4', 'TRK-4088 · loading'], ['Bagged today', `${num(2418 + ST.bags)}`], ['Loaded out', '31 trucks']]};
    // the area card
    const d = {
      YARD: {org: 'AREA · CY', title: 'Cane Yard', sub: 'Suphan Mill · ML-01', text: '1 tipping · 2 queued · 4 piles', stats: [['Cane in yard', '1,610', '/ 2,400 t', 0.67], ['Tipping tables', '1', '/ 2 busy', 0.5, 1], ['Trucks today', '41', ''], ['Avg wait', '18', 'min']], inv: [['pallet', 'Cane, Khon Kaen 3', '1,610 t', 'In Stock', 'go'], ['box', 'Burnt cane, 24 h+', '210 t', 'Mill First', 'wait'], ['tape', 'Bagasse bales', '1,204', 'In Stock', 'go'], ['bin', 'Molasses totes', '96', 'Low Stock', 'wait']], fleet: {title: 'Yard fleet', meta: '2/3 working', rows: [['GR-02', 'Feeding carrier A from pile 2', 0.68]]}},
      MILLS: {org: 'AREA · MH', title: 'Mill House', sub: 'Carrier A · tandem 1-4', text: '4 mills running · 310 t/h', stats: [['Crush rate', '310', '/ 340 t/h', 0.91], ['Mills running', '4', '/ 4', 1, 1], ['Extraction', '96.4%', ''], ['Bagasse', '48%', 'moisture']], inv: [['water', 'Raw juice', '284 m3', 'In Stock', 'go'], ['tape', 'Bagasse to boiler', '142 t/h', 'In Stock', 'go'], ['box', 'Filter cake', '18 t', 'In Stock', 'go'], ['bin', 'Imbibition water', '96 m3', 'Low Stock', 'wait']], fleet: {title: 'Mill tandem', meta: '4/4 running', rows: [['Mill 1', 'Crushing #CN-4412 · 68% torque', 0.68]]}},
      PROCESS: {org: 'AREA · PH', title: 'Process House', sub: '5 effects · 2 vacuum pans', text: '5 effects · pan 01 on strike', stats: [['Syrup brix', f1(14.2 + 50), '/ 68', 0.95], ['Pans', '2', '/ 2 busy', 1, 1], ['Steam', '1.2', 'bar'], ['Purity', '84.6%', '']], inv: [['water', 'Clear juice', '318 m3', 'In Stock', 'go'], ['frozen', 'Syrup, 65 brix', '96 m3', 'In Stock', 'go'], ['bin', 'A molasses', '42 m3', 'In Stock', 'go'], ['gloves', 'Lime, milk of', '8 m3', 'Low Stock', 'wait']], fleet: {title: 'Pan house', meta: '2/2 boiling', rows: [['Pan 01', 'Strike #ST-2207 · A massecuite', 0.74]]}},
      PACK: {org: 'AREA · PK', title: 'Packing & Store', sub: 'Store ST-1 · 4 docks', text: '2 lines · 4/4 docks · 5 staged', stats: [['Bagged today', '2,418', '/ 3,000', 0.81], ['Lines', '2', '/ 2 running', 1, 1], ['Docks busy', '2', '/ 4'], ['Loaded out', '31', 'trucks']], inv: [['box', 'White sugar 50 kg', '2,418', 'In Stock', 'go'], ['pallet', 'Export pallets', '184', 'In Stock', 'go'], ['tape', 'Stretch wrap', '1,204', 'In Stock', 'go'], ['bin', 'Raw sugar totes', '96', 'Low Stock', 'wait']], fleet: {title: 'Store fleet', meta: '1/2 working', rows: [['FL-02', 'Pallet P-2207 to dock 2', 0.62]]}},
    }[area];
    return {pop, thumb: area === 'PACK' ? TH.mill : area === 'YARD' ? TH.grab : area === 'MILLS' ? TH.tandem : TH.pan, org: d.org, title: d.title, sub: d.sub, stat: 'Operational', statCls: 'go', statText: d.text, prog: 0, progText: '', stats: d.stats, inv: d.inv, fleet: d.fleet, rows: []};
  };

  // The three KPI cards keep their headings all film long — the reference's do — so the numbers under them have to
  // stay the same three quantities. What changes is the figure, which climbs with the hero load, and the sub-line,
  // which names the area you are looking at. Everything area-specific lives in the detail card and the table.
  const kpiFor = (area) => {
    const ST = cell.ST;
    return {
      a: [`${num(3861 + ST.crushed)} t`, '+312', {YARD: 'today · cane in', MILLS: 'today · tandem 1-4', PROCESS: 'today · ML-01', PACK: 'today · ML-01'}[area]],
      b: [num(2418 + ST.bags), `+${42 + ST.bags}`, {YARD: 'bags · lines 1-2', MILLS: 'bags · lines 1-2', PROCESS: 'bags · lines 1-2', PACK: `bags · ${ST.pallets} pallets staged`}[area]],
      c: ['94.2%', '+0.6%', {YARD: 'last 24 h · 1 tipper', MILLS: 'last 24 h · 4/4 mills', PROCESS: 'last 24 h · 2/2 pans', PACK: 'last 24 h · 2/2 lines'}[area]],
    };
  };

  const trackFor = (t) => {
    const ST = cell.ST;
    const st2 = (a, b) => (t < a ? '' : t < b ? 'on' : 'done');
    const steps = [
      ['Weighed in', '06:48', 'doc', 'done'],
      ['Tipped', '07:02', 'truck', st2(T.tilt[0], T.tilt[1])],
      [`Milled ${f1(ST.crushed)} t`, '07:14', 'load', st2(T.mills[0], T.mills[1])],
      ['Boiled & spun', '09:26', 'box', st2(T.pan[0], T.fuge[1])],
      [ST.bags ? `Bagged ${ST.bags}` : 'Bagged', 'ETA 10:40', 'check', st2(T.bagging[0], DUR + 1)],
    ];
    const fill = clamp((t - T.tilt[0]) / (T.bagging[1] - T.tilt[0])) * 0.98;
    const [s, txt, cls] = heroState(t);
    return {
      title: 'Cane Load Tracking',
      meta: 'CT-18 · Ban Rai Farms',
      fill,
      steps,
      ship: {thumb: TH.truck, id: '#CN-4412', to: 'To: Carrier A, tandem 1-4', stat: t < T.tilt[1] ? s : stage(t), statCls: t < T.tilt[1] ? cls : 'go', meta: t < T.tilt[1] ? txt : `${f1(ST.netT)} t · pol 12.8% · strike ST-2207`},
    };
  };

  const tableFor = (area, t) => {
    const ST = cell.ST;
    if (area === 'YARD')
      return {tabs: [['Tables', '1/2'], ['Grabs', '2/3'], ['Trucks', '3']], active: 2, site: 'Cane Yard', rows: [
        {id: 'CT-18', org: 'Ban Rai', dot: TOY.blue, where: t < T.toTable[0] ? 'WB-1 · weighing' : t < T.tilt[0] ? 'Yard road' : 'Table T1', stat: heroState(t)[0], cls: heroState(t)[2], p: t < T.tilt[0] ? null : 100 * ST.tilt, pt: t < T.tilt[0] ? '31.4 t' : `${Math.round(ST.tiltDeg)} deg`},
        {id: 'CT-24', org: 'Nong Khae', dot: TOY.teal, where: 'Yard road · to T1', stat: 'En route', cls: 'in', p: null, pt: '4 min'},
        {id: 'CT-31', org: 'Ban Rai', dot: TOY.blue, where: 'Lorry park', stat: 'Queued', cls: 'wait', p: null, pt: '18 min'},
        {id: 'CT-12', org: 'Sala Daeng', dot: TOY.orange, where: 'Weighbridge WB-1', stat: 'Tare out', cls: 'go', p: null, pt: '13.2 t'},
      ]};
    if (area === 'MILLS')
      return {tabs: [['Mills', '4/4'], ['Carriers', '1/1'], ['Drives', '6']], active: 0, site: 'Mill House', rows: [
        {id: 'Mill 1', org: 'Tandem', dot: TOY.blue, where: '#CN-4412 · crushing', stat: 'Running', cls: 'go', p: 68, pt: '68%'},
        {id: 'Mill 2', org: 'Tandem', dot: TOY.blue, where: '#CN-4412 · crushing', stat: 'Running', cls: 'go', p: 64, pt: '64%'},
        {id: 'Mill 3', org: 'Tandem', dot: TOY.blue, where: 'Imbibition on', stat: 'Running', cls: 'go', p: 63, pt: '63%'},
        {id: 'Mill 4', org: 'Tandem', dot: TOY.teal, where: 'Bagasse to boiler', stat: 'Running', cls: 'go', p: 61, pt: '61%'},
      ]};
    if (area === 'PROCESS')
      return {tabs: [['Effects', '5/5'], ['Pans', '2/2'], ['Fugals', '5/6']], active: 1, site: 'Process House', rows: [
        {id: 'Pan 01', org: 'A massecuite', dot: TOY.blue, where: 'Strike #ST-2207', stat: ST.strike > 0.97 ? 'Striking' : 'Boiling', cls: ST.strike > 0.97 ? 'go' : 'in', p: 100 * ST.strike, pt: `${Math.round(ST.strike * 100)}%`},
        {id: 'Pan 02', org: 'B massecuite', dot: TOY.teal, where: 'Strike #ST-2206', stat: 'Boiling', cls: 'in', p: 42, pt: '42%'},
        {id: 'Effect 1', org: 'Evaporator', dot: TOY.blue, where: 'Juice to effect 2', stat: 'Running', cls: 'go', p: null, pt: '118 C'},
        {id: 'CF-04', org: 'Centrifugal', dot: TOY.orange, where: 'Screen change', stat: 'Down', cls: 'wait', p: null, pt: '12 min'},
      ]};
    return {tabs: [['Lines', '2/2'], ['Docks', '2/4'], ['Pallets', String(ST.pallets)]], active: 0, site: 'Packing & Store', rows: [
      {id: 'Line 1', org: 'Packing', dot: TOY.blue, where: `Pallet P-2207 · ${ST.bags} bags`, stat: 'Running', cls: 'go', p: 100 * clamp(ST.bags / 42), pt: `${ST.bags}/42`},
      {id: 'Line 2', org: 'Packing', dot: TOY.blue, where: 'Pallet P-2208 · 31 bags', stat: 'Running', cls: 'go', p: 74, pt: '31/42'},
      {id: 'FL-02', org: 'Store', dot: TOY.teal, where: ST.forkState === 'run' ? 'P-2207 to dock 2' : 'Palletiser 1', stat: ST.forkState === 'park' ? 'Waiting' : 'Carrying', cls: ST.forkState === 'park' ? 'wait' : 'go', p: null, pt: '1.1 t'},
      {id: 'TRK-4120', org: 'Aurora', dot: TOY.blue, where: 'ST-1 · dock 2', stat: 'Loading', cls: 'go', p: 55, pt: '11/20'},
    ]};
  };

  /** the rectangles the UI panels cover, so a pin or a label never lands under one */
  const underUI = ([x, y]) => (x > 1130 && y < 560) || (x > 1080 && y > 620) || (x < 1000 && y > 720) || (x < 780 && y < 185);
  const pinsAt = (t) => {
    const out = [];
    const pin = (v, a = 1) => {
      const s = proj(v);
      if (s && s[0] > 20 && s[0] < 1580 && s[1] > 80 && s[1] < 880 && !underUI(s)) out.push({kind: 'pin', x: s[0], y: s[1], a});
    };
    if (t < 13) {
      pin(W.anchors.pile());
      pin(W.anchors.grab());
    }
    if (t > 16 && t < 30) pin(W.anchors.tandem());
    if (t > 30 && t < 40) pin(W.anchors.evap());
    if (t > 39) pin(W.anchors.store());
    return out;
  };

  const clockAt = (t) => `07:${String(10 + Math.floor(t / 2)).padStart(2, '0')}`;

  return {
    st, W, ui, sel, TH, proj, setST, capture,
    get ST() {
      return cell.ST;
    },
    panels: {heroState, stage, cardAt, kpiFor, trackFor, tableFor, pinsAt, clockAt, underUI, SEL_OBJ, SEL_AREA, SEL_TEXT, ROUTE},
  };
}
