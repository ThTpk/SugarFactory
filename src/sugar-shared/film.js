// Caneline, the toy sugar mill's film: one camera at one angle (azimuth 42, elevation 34) that only pans and zooms,
// over the product UI the airport, the plant, the site and the warehouse all share. The story moves through clicks
// and the area switcher's dropdown, never through a cut. This file is the timeline only — the stage, the world, the
// UI and every panel's contents live in mill.js, which app.js drives from the visitor instead.
//   0-5.2    the weighbridge: CT-18 weighs in with cane load CN-4412
//   5.8-12.6 the camera rides it down the internal road to the tipping table
//   13.2-18.8 the table tilts and the load goes into the hopper
//   15.4-23.4 the carrier climbs to the shredder; 20.5-28 the 4-mill tandem crushes
//   29.3-30.4 the dropdown jumps to the Process House; 30-36 clarifier, evaporators, pan 01's strike
//   35-39    the centrifugals; 38-42.4 the dryer and the bagging line, bag 1 of P-2207
//   42.4-44.6 home over the whole mill
import * as THREE from 'three';
import {runSim} from '../kit/runtime.js';
import {DUR, buildWorld} from './world.js';
import {AREAS, DROP, D2R, createMill, lerp, sm, ss, tuneForRealtime} from './mill.js';

export {UI_WORDS} from './mill.js';

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

/** the camera's keyframed path, exported so the app can open on the same shot the film opens on */
export function filmCam(t, heroPos) {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].t <= t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = ss(a.t, b.t, t);
  const far = Math.hypot(b.x - a.x, b.z - a.z);
  const arc = far > 50 ? 0.3 * Math.sin(Math.PI * k) : 0;
  const c = {x: lerp(a.x, b.x, k), z: lerp(a.z, b.z, k), d: lerp(a.d, b.d, k) * (1 + arc), az: AZ, el: EL};
  // the camera rides CT-18 down the internal road, past the hall, to the tipping apron
  const w = ss(6.4, 7.8, t) * (1 - ss(11.0, 12.4, t));
  if (w > 0 && heroPos) {
    c.x = lerp(c.x, heroPos.x + 3, w);
    c.z = lerp(c.z, heroPos.z + 3, w);
    c.d = lerp(c.d, 96, w);
  }
  return c;
}

export const filmAreaAt = (t) => (t < 13.2 ? 'YARD' : t < 30.4 ? 'MILLS' : t < 39.6 ? 'PROCESS' : 'PACK');

/** what the film has selected at t, so the app's auto tour opens the same cards in the same order */
export const filmSelection = (t) => {
  let cur = {kind: 'area', t0: -1};
  for (const c of CLICKS) if (c.card && t >= c.t) cur = {kind: c.card, t0: c.t};
  return cur;
};

export function runToySugarFilm() {
  return runSim({duration: DUR, fps: 60, theme: 'light', hud: {enabled: false, title: 'Caneline', subtitle: '— Suphan Mill'}, director: {enabled: false}, watermark: ''}, async ({canvas, capture}) => {
    const app = document.getElementById('app');
    const M = createMill({app, canvas, capture});
    const {st, W, ui, sel, proj, panels} = M;
    const fit = () => (app.style.transform = `scale(${Math.min(innerWidth / 1600, innerHeight / 900)})`);
    // a page someone opens has to run; a frame-by-frame capture has all the time it wants, so it keeps full quality
    const rt = capture ? null : tuneForRealtime(st);
    const resize = () => {
      fit();
      st.resize(1600, 900, capture ? devicePixelRatio || 1 : Math.min(devicePixelRatio || 1, 2));
      rt?.afterResize();
    };
    resize();

    const P = (o) => o.getWorldPosition(new THREE.Vector3());
    const camAt = (t) => filmCam(t, P(W.objects.hero.group));

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

    window.TOYSUGAR = {st, W, camAt};
    return {
      resize,
      render(t) {
        M.setST(W.pose(t));
        const s = filmSelection(t);
        const area = filmAreaAt(t);
        const obj = panels.SEL_OBJ[s.kind];
        const fadeIn = ss(s.t0, s.t0 + 0.3, t);
        sel.box(obj ?? null, fadeIn);
        const rf = panels.ROUTE[s.kind];
        sel.route(rf ? rf(t) : null, ss(s.t0, s.t0 + 0.9, t), 1);
        sel.update();
        const c = camAt(t);
        rt?.beforeFrame();
        st.frame({tx: c.x, ty: 2.5, tz: c.z, az: c.az * D2R, el: c.el * D2R, d: c.d, fov: 28, sx: -110, sy: 26});
        const tags = panels.pinsAt(t);
        if (obj) {
          const a = proj(W.anchors[s.kind]());
          const [txt, sub] = panels.SEL_TEXT(s.kind, t) ?? ['', ''];
          if (a && !panels.underUI(a)) tags.push({kind: 'sel', x: a[0], y: a[1], text: txt, sub, a: fadeIn});
        }
        const cur = cursorAt(t);
        let tool = -1;
        for (const cl of CLICKS) if (cl.tool != null && t >= cl.t && t < cl.t + 0.6) tool = cl.tool;
        ui.update({
          clock: panels.clockAt(t),
          site: AREAS[area],
          kpi: panels.kpiFor(area),
          card: panels.cardAt(t, s.kind, s.t0, area),
          track: panels.trackFor(t),
          table: panels.tableFor(area, t),
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
