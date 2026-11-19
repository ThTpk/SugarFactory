// Caneline, the toy sugar mill's film: one camera at one angle (azimuth 42, elevation 34) that only pans and zooms,
// over the product UI the airport, the plant, the site and the warehouse all share. The story moves through clicks
// and the area switcher's dropdown, never through a cut.
//   0-5.0    the weighbridge: CT-18 weighs in with cane load CN-4412
//   5.6-11.4 the camera rides it along the cane yard to the tipping table
//   12-17.6  the table tilts and the load goes into the hopper
//   18-23    the carrier climbs to the shredder; 23-28 the 4-mill tandem crushes
//   29.3-30.4 the dropdown jumps to the Process House; 30-36 clarifier, evaporators, pan 01's strike
//   36-39    the centrifugals; 39-42.4 the dryer and the bagging line, bag 1 of P-2207
//   42.4-44.6 home over the whole mill
import * as THREE from 'three';
import {runSim} from '../kit/runtime.js';
import {TOY, createToyStage} from '../airport-shared/style.js';
import {createToyUI, ICONS} from '../airport-shared/ui.js';
import {createSelection} from '../airport-shared/select.js';
import {thumb} from '../airport-shared/thumbs.js';
import {OPERATOR_AVATAR} from '../airport-shared/avatar.js';
import {buildToyForklift} from '../airport-shared/gse.js';
import {buildToyCargoTerminal} from '../airport-shared/airside.js';
import {buildCaneTruck, buildCaneGrab, buildTippingTable} from './yard.js';
import {buildCaneCarrier, buildMillTandem} from './wet.js';
import {buildVacuumPan, buildCentrifugalRow, buildBaggingLine} from './dry.js';
import {DUR, T, buildWorld} from './world.js';

const D2R = Math.PI / 180;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (x) => {
  const u = clamp(x);
  return u * u * u * (u * (u * 6 - 15) + 10);
};
const ss = (a, b, t) => sm((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
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

const CLICKS = [
  {t: 1.8, at: 'hero', card: 'hero'},
  {t: 14.8, at: 'table', card: 'table'},
  {t: 20.4, at: 'carrier', card: 'carrier'},
  {t: 25.3, at: 'tandem', card: 'tandem'},
  {t: 29.3, ui: [1167, 37], drop: 'open'},
  {t: 30.4, ui: [930, 274], card: 'area'},
  {t: 34.1, at: 'pan', card: 'pan'},
  {t: 37.6, at: 'fuge', card: 'fuge'},
  {t: 41.0, at: 'bagging', card: 'bagging'},
  {t: 43.4, ui: [1159, 275], tool: 6, card: 'area'},
];
export const FILM_CLICKS = CLICKS.map((c) => c.t);

const AZ = 42;
const EL = 34;
const KEYS = [
  // the opening frame has to carry the whole mill at a glance, so it sits back far enough to hold the weighbridge,
  // the internal road and the hall's south flank in one shot before it closes in on CT-18
  {t: 0, x: 76, z: 46, d: 132},
  {t: 5.2, x: 66, z: 50, d: 112},
  {t: 12.6, x: -78, z: 6, d: 100},
  {t: 18.8, x: -76, z: 4, d: 92},
  {t: 23.4, x: -35, z: 4, d: 98},
  {t: 28.0, x: 6, z: 4, d: 94},
  {t: 33.5, x: 52, z: 2, d: 120},
  {t: 36.4, x: 90, z: 2, d: 102},
  {t: 39.0, x: 121, z: 6, d: 88},
  {t: 41.2, x: 152, z: 20, d: 92},
  {t: DUR, x: 60, z: -4, d: 440},
];

const AREAS = {
  YARD: ['CY', 'Cane Yard', '41 trucks today · 1 tipping'],
  MILLS: ['MH', 'Mill House', '4 mills · 312 t/h'],
  PROCESS: ['PH', 'Process House', '5 effects · 2 pans'],
  PACK: ['PK', 'Packing & Store', '2 lines · 4/4 docks'],
};
const DROP = [
  ['CY', 'Cane Yard', '41 trucks today · 1 tipping', 72],
  ['MH', 'Mill House', '4 mills · 312 t/h', 88],
  ['PH', 'Process House', '5 effects · 2 pans', 64],
  ['PK', 'Packing & Store', '2 lines · 4/4 docks', 58],
];

export function runToySugarFilm() {
  return runSim({duration: DUR, fps: 60, theme: 'light', hud: {enabled: false, title: 'Caneline', subtitle: '— Suphan Mill'}, director: {enabled: false}, watermark: ''}, async ({canvas, capture}) => {
    const app = document.getElementById('app');
    const st = createToyStage(canvas, {fov: 28});
    const W = buildWorld();
    st.scene.add(W.root);
    const ui = createToyUI(app, UI_WORDS);
    const sel = createSelection(st.scene, st);
    const fit = () => (app.style.transform = `scale(${Math.min(innerWidth / 1600, innerHeight / 900)})`);
    const resize = () => {
      fit();
      st.resize(1600, 900, capture ? devicePixelRatio || 1 : Math.min(devicePixelRatio || 1, 2));
    };
    resize();

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
    };

    const P = (o) => o.getWorldPosition(new THREE.Vector3());
    const keyCam = (t) => {
      let i = 0;
      while (i < KEYS.length - 2 && KEYS[i + 1].t <= t) i++;
      const a = KEYS[i];
      const b = KEYS[i + 1];
      const k = ss(a.t, b.t, t);
      const far = Math.hypot(b.x - a.x, b.z - a.z);
      const arc = far > 50 ? 0.3 * Math.sin(Math.PI * k) : 0;
      return {x: lerp(a.x, b.x, k), z: lerp(a.z, b.z, k), d: lerp(a.d, b.d, k) * (1 + arc)};
    };
    const camAt = (t) => {
      const c = keyCam(t);
      // the camera rides CT-18 down the internal road, past the hall, to the tipping apron
      const w = ss(6.4, 7.8, t) * (1 - ss(11.0, 12.4, t));
      if (w > 0) {
        const p = P(W.objects.hero.group);
        c.x = lerp(c.x, p.x + 3, w);
        c.z = lerp(c.z, p.z + 3, w);
        c.d = lerp(c.d, 96, w);
      }
      return c;
    };

    let ST = {phase: 'weigh', netT: 31.4, tilt: 0, tiltDeg: 0, tiltMaxDeg: 53, crushed: 0, brix: 14.2, strike: 0, bags: 0, forkState: 'park', pallets: 4};
    const areaAt = (t) => (t < 13.2 ? 'YARD' : t < 30.4 ? 'MILLS' : t < 39.6 ? 'PROCESS' : 'PACK');
    const heroState = (t) =>
      t < T.toTable[0] ? ['Weighing', 'WB-1 · gross 44.6 t', 'wait'] :
      t < T.tilt[0] ? ['To tipper', 'Yard road · table T1', 'in'] :
      t < T.tilt[1] ? [`Tipping ${Math.round(ST.tilt * 100)}%`, `Table T1 · ${ST.tiltMaxDeg} deg`, 'go'] :
      ['Tipped', 'Table T1 · empty, tare 13.2 t', 'go'];
    const stage = (t) =>
      t < T.tilt[0] ? 'Weighed in' :
      t < T.carrier[0] ? 'Tipping' :
      t < T.mills[0] ? 'On the carrier' :
      t < T.clarify[0] ? 'Milling' :
      t < T.pan[0] ? 'Evaporating' :
      t < T.fuge[0] ? 'Boiling' :
      t < T.bagging[0] ? 'Curing' : 'Bagging';

    const cardAt = (t, kind, t0) => {
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
      if (kind === 'pan') return {pop, thumb: TH.pan, org: 'PAN HOUSE · PH', title: 'Pan 01', sub: 'Batch vacuum pan · 60 m3', stat: ST.strike > 0.97 ? 'Striking' : 'Boiling', statCls: ST.strike > 0.97 ? 'go' : 'in', statText: `A massecuite · brix ${f1(ST.brix + 68)}`, prog: ST.strike, progText: `${Math.round(ST.strike * 100)}%`, rows: [['Strike', '#ST-2207', 1], ['Vacuum', '-0.86 bar'], ['Steam', '1.2 bar · 118 C'], ['Crystal', '0.62 mm'], ['Next', 'Drop to crystalliser 2']]};
      if (kind === 'fuge') return {pop, thumb: TH.fuge, org: 'CENTRIFUGALS · PH', title: 'CF-01 to 06', sub: 'Batch fugals · 1,750 kg', stat: '5 of 6 running', statCls: 'go', statText: 'A massecuite · 1,180 rpm', prog: 0.83, progText: '5/6', rows: [['Cycle', '3 min 10 s'], ['Purity rise', '+8.4 pts'], ['Molasses', 'to tank farm'], ['CF-04', 'Screen change', 1], ['Sugar out', 'to dryer D1']]};
      if (kind === 'bagging') return {pop, thumb: TH.bagging, org: 'PACKING · PK', title: 'Line 1', sub: 'Weigh, fill and stitch · 50 kg', stat: 'Running', statCls: 'go', statText: `Pallet P-2207 · ${ST.bags} bags`, prog: clamp(ST.bags / 42), progText: `${ST.bags}/42`, rows: [['Bag', '50 kg net'], ['Rate', '19 bags a minute'], ['Check-weigher', 'All in spec'], ['Pallet', 'P-2207 · 12 bags', 1], ['To', 'Store ST-1 · dock 2']]};
      // the area card
      const area = areaAt(t);
      const d = {
        YARD: {org: 'AREA · CY', title: 'Cane Yard', sub: 'Suphan Mill · ML-01', text: '1 tipping · 2 queued · 4 piles', stats: [['Cane in yard', '1,610', '/ 2,400 t', 0.67], ['Tipping tables', '1', '/ 2 busy', 0.5, 1], ['Trucks today', '41', ''], ['Avg wait', '18', 'min']], inv: [['pallet', 'Cane, Khon Kaen 3', '1,610 t', 'In Stock', 'go'], ['box', 'Burnt cane, 24 h+', '210 t', 'Mill First', 'wait'], ['tape', 'Bagasse bales', '1,204', 'In Stock', 'go'], ['bin', 'Molasses totes', '96', 'Low Stock', 'wait']], fleet: {title: 'Yard fleet', meta: '2/3 working', rows: [['GR-02', 'Feeding carrier A from pile 2', 0.68]]}},
        MILLS: {org: 'AREA · MH', title: 'Mill House', sub: 'Carrier A · tandem 1-4', text: '4 mills running · 310 t/h', stats: [['Crush rate', '310', '/ 340 t/h', 0.91], ['Mills running', '4', '/ 4', 1, 1], ['Extraction', '96.4%', ''], ['Bagasse', '48%', 'moisture']], inv: [['water', 'Raw juice', '284 m3', 'In Stock', 'go'], ['tape', 'Bagasse to boiler', '142 t/h', 'In Stock', 'go'], ['box', 'Filter cake', '18 t', 'In Stock', 'go'], ['bin', 'Imbibition water', '96 m3', 'Low Stock', 'wait']], fleet: {title: 'Mill tandem', meta: '4/4 running', rows: [['Mill 1', 'Crushing #CN-4412 · 68% torque', 0.68]]}},
        PROCESS: {org: 'AREA · PH', title: 'Process House', sub: '5 effects · 2 vacuum pans', text: '5 effects · pan 01 on strike', stats: [['Syrup brix', f1(14.2 + 50), '/ 68', 0.95], ['Pans', '2', '/ 2 busy', 1, 1], ['Steam', '1.2', 'bar'], ['Purity', '84.6%', '']], inv: [['water', 'Clear juice', '318 m3', 'In Stock', 'go'], ['frozen', 'Syrup, 65 brix', '96 m3', 'In Stock', 'go'], ['bin', 'A molasses', '42 m3', 'In Stock', 'go'], ['gloves', 'Lime, milk of', '8 m3', 'Low Stock', 'wait']], fleet: {title: 'Pan house', meta: '2/2 boiling', rows: [['Pan 01', 'Strike #ST-2207 · A massecuite', 0.74]]}},
        PACK: {org: 'AREA · PK', title: 'Packing & Store', sub: 'Store ST-1 · 4 docks', text: '2 lines · 4/4 docks · 5 staged', stats: [['Bagged today', '2,418', '/ 3,000', 0.81], ['Lines', '2', '/ 2 running', 1, 1], ['Docks busy', '2', '/ 4'], ['Loaded out', '31', 'trucks']], inv: [['box', 'White sugar 50 kg', '2,418', 'In Stock', 'go'], ['pallet', 'Export pallets', '184', 'In Stock', 'go'], ['tape', 'Stretch wrap', '1,204', 'In Stock', 'go'], ['bin', 'Raw sugar totes', '96', 'Low Stock', 'wait']], fleet: {title: 'Store fleet', meta: '1/2 working', rows: [['FL-02', 'Pallet P-2207 to dock 2', 0.62]]}},
      }[area];
      return {pop, thumb: area === 'PACK' ? TH.mill : area === 'YARD' ? TH.grab : area === 'MILLS' ? TH.tandem : TH.pan, org: d.org, title: d.title, sub: d.sub, stat: 'Operational', statCls: 'go', statText: d.text, prog: 0, progText: '', stats: d.stats, inv: d.inv, fleet: d.fleet, rows: []};
    };

    const selection = (t) => {
      let cur = {kind: 'area', t0: -1};
      for (const c of CLICKS) if (c.card && t >= c.t) cur = {kind: c.card, t0: c.t};
      return cur;
    };
    const O = W.objects;
    const SEL_OBJ = {hero: O.hero.group, grab: O.grab.group, table: O.table.group, carrier: O.carrier.group, tandem: O.tandem.group, pan: O.pan1.group, fuge: O.fuges.group, bagging: O.bagging.group};
    const SEL_TEXT = (kind, t) => ({
      hero: ['CT-18', heroState(t)[0]],
      grab: ['GR-02', 'Feeding'],
      table: ['T1', ST.tilt > 0.02 && ST.tilt < 0.99 ? 'Tipping' : 'Ready'],
      carrier: ['Carrier A', 'Running'],
      tandem: ['Tandem 1-4', 'Crushing'],
      pan: ['Pan 01', 'Boiling'],
      fuge: ['CF-01 to 06', '5 of 6 running'],
      bagging: ['Line 1', 'Running'],
    })[kind];
    const ROUTE = {hero: (t) => W.routes.hero(t)};

    const proj = (v) => st.project(v);
    const targetOf = (c) => (c.ui ? c.ui : proj(W.anchors[c.at]()) ?? [800, 450]);
    const GLIDE = 1.0;
    const cursorAt = (t) => {
      let prev = [1040, 640];
      let hand = true;
      for (const c of CLICKS) {
        const target = targetOf(c);
        if (t < c.t - GLIDE) return {p: prev, hand};
        if (t < c.t) {
          const k = sm((t - (c.t - GLIDE)) / GLIDE);
          return {p: [lerp(prev[0], target[0], k), lerp(prev[1], target[1], k) - 16 * Math.sin(Math.PI * k)], hand: !c.ui};
        }
        prev = target;
        hand = !c.ui;
      }
      return {p: prev, hand};
    };
    const clickAt = (t) => {
      let v = 0;
      for (const c of CLICKS) if (t >= c.t && t < c.t + 0.7) v = Math.max(v, 1 - (t - c.t) / 0.7);
      return v;
    };
    const dropOpen = (t) => ss(29.3, 29.6, t) * (1 - ss(30.45, 30.7, t));

    // The three KPI cards keep their headings all film long — the reference's do — so the numbers under them have to
    // stay the same three quantities. What changes is the figure, which climbs with the hero load, and the sub-line,
    // which names the area you are looking at. Everything area-specific lives in the detail card and the table.
    const kpiFor = (area, t) => ({
      a: [`${num(3861 + ST.crushed)} t`, '+312', {YARD: 'today · cane in', MILLS: 'today · tandem 1-4', PROCESS: 'today · ML-01', PACK: 'today · ML-01'}[area]],
      b: [num(2418 + ST.bags), `+${42 + ST.bags}`, {YARD: 'bags · lines 1-2', MILLS: 'bags · lines 1-2', PROCESS: 'bags · lines 1-2', PACK: `bags · ${ST.pallets} pallets staged`}[area]],
      c: ['94.2%', '+0.6%', {YARD: 'last 24 h · 1 tipper', MILLS: 'last 24 h · 4/4 mills', PROCESS: 'last 24 h · 2/2 pans', PACK: 'last 24 h · 2/2 lines'}[area]],
    });

    const trackFor = (t) => {
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
      return {tabs: [['Lines', '2/2'], ['Docks', '2/4'], ['Pallets', String(ST.pallets)]], active: 0, site: area === 'PACK' ? 'Packing & Store' : 'Suphan Mill', rows: [
        {id: 'Line 1', org: 'Packing', dot: TOY.blue, where: `Pallet P-2207 · ${ST.bags} bags`, stat: 'Running', cls: 'go', p: 100 * clamp(ST.bags / 42), pt: `${ST.bags}/42`},
        {id: 'Line 2', org: 'Packing', dot: TOY.blue, where: 'Pallet P-2208 · 31 bags', stat: 'Running', cls: 'go', p: 74, pt: '31/42'},
        {id: 'FL-02', org: 'Store', dot: TOY.teal, where: ST.forkState === 'run' ? 'P-2207 to dock 2' : 'Palletiser 1', stat: ST.forkState === 'park' ? 'Waiting' : 'Carrying', cls: ST.forkState === 'park' ? 'wait' : 'go', p: null, pt: '1.1 t'},
        {id: 'TRK-4120', org: 'Aurora', dot: TOY.blue, where: 'ST-1 · dock 2', stat: 'Loading', cls: 'go', p: 55, pt: '11/20'},
      ]};
    };

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

    window.TOYSUGAR = {st, W, camAt};
    return {
      resize,
      render(t) {
        ST = W.pose(t);
        const s = selection(t);
        const area = areaAt(t);
        const obj = SEL_OBJ[s.kind];
        const fadeIn = ss(s.t0, s.t0 + 0.3, t);
        sel.box(obj ?? null, fadeIn);
        const rf = ROUTE[s.kind];
        sel.route(rf ? rf(t) : null, ss(s.t0, s.t0 + 0.9, t), 1);
        sel.update();
        const c = camAt(t);
        st.frame({tx: c.x, ty: 2.5, tz: c.z, az: AZ * D2R, el: EL * D2R, d: c.d, fov: 28, sx: -110, sy: 26});
        const tags = pinsAt(t);
        if (obj) {
          const a = proj(W.anchors[s.kind]());
          const [txt, sub] = SEL_TEXT(s.kind, t) ?? ['', ''];
          if (a && !underUI(a)) tags.push({kind: 'sel', x: a[0], y: a[1], text: txt, sub, a: fadeIn});
        }
        const cur = cursorAt(t);
        let tool = -1;
        for (const cl of CLICKS) if (cl.tool != null && t >= cl.t && t < cl.t + 0.6) tool = cl.tool;
        ui.update({
          clock: `07:${String(10 + Math.floor(t / 2)).padStart(2, '0')}`,
          site: AREAS[area],
          kpi: kpiFor(area, t),
          card: cardAt(t, s.kind, s.t0),
          track: trackFor(t),
          table: tableFor(area, t),
          drop: {open: dropOpen(t), sites: DROP, on: t > 30.0 ? 2 : 0},
          tool,
          tags,
          cursor: cur.p,
          hand: cur.hand,
          click: clickAt(t),
        });
        return {};
      },
    };
  });
}
