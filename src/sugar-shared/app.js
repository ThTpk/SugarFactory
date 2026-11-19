// Caneline, the toy sugar mill you can drive yourself. The same world, the same product UI and the same panels as
// the film (mill.js builds all of it) — but the camera, the selection and the clock belong to the visitor.
//
// It opens playing the film's own shot, so somebody who lands on the page sees the mill working within a second and
// does not have to be told what they are looking at. The moment they touch it — drag, scroll, click, scrub — the
// tour hands over and never takes control back.
//
//   drag            pan over the map
//   scroll / pinch  zoom
//   right-drag      swing the camera round
//   click a machine select it: its card, its outline, and its route on the ground
//   click the map   deselect, back to the area card
//   the switcher    jump to an area
//   the scrubber    scrub the crushing day; space plays and pauses
//
// render(t) stays a pure function of the clock exactly as in the film: scrubbing backwards shows the same frame as
// playing forwards into it, because nothing in the world carries state between frames.
import * as THREE from 'three';
import {DUR} from './world.js';
import {AREAS, AREA_KEYS, AREA_VIEW, D2R, DROP, clamp, createMill, lerp, tuneForRealtime} from './mill.js';
import {filmAreaAt, filmCam, filmSelection} from './film.js';

const FOV = 28;
const MIN_D = 34;
const MAX_D = 620;
const MIN_EL = 16;
const MAX_EL = 72;
// the whole mill in one shot: what the home button and the opening frame give you
const HOME = {x: 60, z: -4, d: 440, az: 42, el: 34};

export async function runToySugarApp() {
  const root = document.documentElement;
  root.dataset.theme = 'light';
  document.title = 'Caneline — Suphan Mill';
  const app = document.getElementById('app');
  const canvas = document.createElement('canvas');
  canvas.id = 'gl';
  app.appendChild(canvas);

  // the models print their numbers and liveries with Inter, so the fonts have to be in before the world is built
  await Promise.all([
    document.fonts.load('400 20px "JetBrains Mono"'),
    document.fonts.load('600 20px "JetBrains Mono"'),
    document.fonts.load('800 20px "Inter"'),
  ]).catch(() => {});

  const M = createMill({app, canvas});
  const {st, W, ui, sel, proj, panels} = M;

  // ---------------------------------------------------------------- layout
  // #app is a true 1600 x 900 stage centred in the window, so the UI's fixed positions and the 3D share one frame
  // and nothing is stretched on a window that is not 16:9.
  const fit = () => {
    const k = Math.min(innerWidth / 1600, innerHeight / 900);
    app.style.transform = `translate(-50%, -50%) scale(${k})`;
  };
  const rt = tuneForRealtime(st);
  const resize = () => {
    fit();
    st.resize(1600, 900, Math.min(devicePixelRatio || 1, 2));
    rt.afterResize();
  };
  addEventListener('resize', resize);
  resize();

  // ---------------------------------------------------------------- state
  let t = 0;
  let playing = true;
  let manual = false; // false while the opening tour drives; the first touch flips it for good
  const cam = {...HOME};
  let selKind = null;
  let selT0 = -1;
  let area = 'YARD';
  let dropOpen = false;
  let toolDown = -1;
  let toolAt = 0;

  const heroPos = new THREE.Vector3();
  const autoCam = () => filmCam(t, W.objects.hero.group.getWorldPosition(heroPos));

  const takeOver = () => {
    if (manual) return;
    manual = true;
    app.classList.add('took-over');
  };
  const flashTool = (i) => {
    toolDown = i;
    toolAt = performance.now();
  };

  const select = (kind) => {
    if (kind && kind !== selKind) {
      selKind = kind;
      selT0 = t;
      const a = panels.SEL_AREA[kind];
      if (a) area = a;
    } else if (!kind) {
      selKind = null;
      selT0 = -1;
    }
  };
  /** swing the camera to hold a world point without changing the angle */
  const lookAt = (p, d) => {
    cam.x = p.x;
    cam.z = p.z;
    if (d) cam.d = clamp(d, MIN_D, MAX_D);
  };
  const focusSelection = () => {
    if (!selKind) return;
    const a = W.anchors[selKind];
    if (a) lookAt(a(), Math.min(cam.d, 90));
  };
  const goArea = (key) => {
    area = key;
    const v = AREA_VIEW[key];
    if (v) {
      cam.x = v.x;
      cam.z = v.z;
      cam.d = v.d;
    }
  };

  // ---------------------------------------------------------------- picking
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const PICKABLE = Object.entries(panels.SEL_OBJ);
  const pickAt = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, st.camera);
    for (const hit of ray.intersectObject(W.root, true)) {
      let o = hit.object;
      while (o) {
        for (const [k, g] of PICKABLE) if (g === o) return k;
        o = o.parent;
      }
    }
    return null;
  };

  // ---------------------------------------------------------------- camera input
  // metres per CSS pixel at the current distance, so a drag keeps the ground under the pointer
  const perPx = () => (2 * cam.d * Math.tan((FOV * Math.PI) / 360)) / 900;
  const pointers = new Map();
  let drag = null;
  let pinch = 0;

  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});
    takeOver();
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
      drag = null;
      return;
    }
    drag = {x: e.clientX, y: e.clientY, moved: 0, rotate: e.button === 2 || e.shiftKey, x0: e.clientX, y0: e.clientY};
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0 && d > 0) cam.d = clamp(cam.d * (pinch / d), MIN_D, MAX_D);
      pinch = d;
      return;
    }
    if (!drag) return;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    // the window is scaled to fit, so a CSS pixel on screen is not a pixel of the 1600 x 900 stage
    const k = 1600 / canvas.getBoundingClientRect().width;
    if (drag.rotate) {
      cam.az = (cam.az - dx * k * 0.25) % 360;
      cam.el = clamp(cam.el + dy * k * 0.12, MIN_EL, MAX_EL);
      return;
    }
    const m = perPx() * k;
    const a = cam.az * D2R;
    // screen right and screen up, projected on the ground; the map follows the pointer, so the target moves against it
    cam.x += -dx * m * Math.cos(a) + dy * m * Math.sin(a);
    cam.z += -dx * m * -Math.sin(a) + dy * m * Math.cos(a);
  });
  const endPointer = (e) => {
    const was = drag;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = 0;
    if (!was || pointers.size) {
      drag = null;
      return;
    }
    drag = null;
    if (was.moved > 6 || was.rotate) return;
    select(pickAt(was.x0, was.y0));
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      takeOver();
      cam.d = clamp(cam.d * Math.exp(e.deltaY * 0.0012), MIN_D, MAX_D);
    },
    {passive: false},
  );

  // ---------------------------------------------------------------- the UI's own controls
  const wt = app.querySelector('.wt');
  const q = (k) => wt.querySelector(`[data-k="${k}"]`);
  const dropEl = q('drop');
  const swEl = wt.querySelector('.sw');
  swEl.addEventListener('click', () => {
    takeOver();
    dropOpen = !dropOpen;
  });
  // the dropdown's rows are rebuilt every frame, so the click is delegated from the card
  dropEl.addEventListener('click', (e) => {
    const it = e.target.closest('.it');
    if (!it) return;
    takeOver();
    const i = [...it.parentElement.children].indexOf(it);
    if (AREA_KEYS[i]) {
      goArea(AREA_KEYS[i]);
      select(null);
    }
    dropOpen = false;
  });
  const TOOL = {
    0: () => (cam.d = clamp(cam.d * 0.78, MIN_D, MAX_D)),
    1: () => (cam.d = clamp(cam.d * 1.28, MIN_D, MAX_D)),
    3: () => (cam.az -= 15),
    4: () => (cam.az += 15),
    6: () => Object.assign(cam, HOME),
  };
  for (const i of Object.keys(TOOL)) {
    const b = q(`tool${i}`);
    if (!b) continue;
    b.addEventListener('click', () => {
      takeOver();
      TOOL[i]();
      flashTool(Number(i));
    });
  }
  // the detail card's three buttons: centre on the selection, and close it
  const btns = wt.querySelectorAll('.det .btns b');
  btns[0]?.addEventListener('click', () => {
    takeOver();
    focusSelection();
  });
  btns[2]?.addEventListener('click', () => {
    takeOver();
    select(null);
  });
  // the fleet table's rows pick the thing they name
  const ROW_PICK = {'CT-18': 'hero', 'Mill 1': 'tandem', 'Mill 2': 'tandem', 'Mill 3': 'tandem', 'Mill 4': 'tandem', 'Pan 01': 'pan', 'CF-04': 'fuge', 'Effect 1': 'evap', 'Line 1': 'bagging', 'Line 2': 'bagging', 'FL-02': 'fork', 'TRK-4120': 'store'};
  q('rows')?.addEventListener('click', (e) => {
    const tr = e.target.closest('.tr');
    if (!tr) return;
    const id = tr.querySelector('b')?.textContent?.trim();
    const kind = ROW_PICK[id];
    if (!kind) return;
    takeOver();
    select(kind);
    focusSelection();
  });

  // ---------------------------------------------------------------- the scrubber
  const bar = document.createElement('div');
  bar.className = 'scrub';
  bar.innerHTML =
    '<b class="pp" title="Play or pause (space)"></b><div class="tk"><i></i></div><span class="tm"></span>' +
    '<span class="hint">drag to pan · scroll to zoom · click a machine</span>';
  app.appendChild(bar);
  const ppEl = bar.querySelector('.pp');
  const tkEl = bar.querySelector('.tk');
  const fillEl = bar.querySelector('.tk i');
  const tmEl = bar.querySelector('.tm');
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  ppEl.addEventListener('click', () => {
    takeOver();
    playing = !playing;
  });
  const scrubTo = (clientX) => {
    const r = tkEl.getBoundingClientRect();
    t = clamp((clientX - r.left) / r.width) * DUR;
  };
  // No setPointerCapture here: the track is a 230 px strip inside a scaled stage, and capturing the pointer on it
  // means any stray release outside leaves it stuck. Window-level listeners are simpler and cannot wedge.
  let scrubbing = false;
  tkEl.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    takeOver();
    playing = false;
    scrubbing = true;
    scrubTo(e.clientX);
  });
  addEventListener('pointermove', (e) => {
    if (scrubbing) scrubTo(e.clientX);
  });
  const stopScrub = () => (scrubbing = false);
  addEventListener('pointerup', stopScrub);
  addEventListener('pointercancel', stopScrub);

  addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      takeOver();
      playing = !playing;
    } else if (e.key === 'ArrowRight') {
      takeOver();
      t = (t + 2) % DUR;
    } else if (e.key === 'ArrowLeft') {
      takeOver();
      t = (t - 2 + DUR) % DUR;
    } else if (e.key === 'r') {
      t = 0;
    } else if (e.key === 'Escape') {
      select(null);
      dropOpen = false;
    } else if (e.key === 'f') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } else return;
    e.preventDefault();
  });

  // ---------------------------------------------------------------- the loop
  let last = performance.now();
  const draw = (now) => {
    // rAF's timestamp is the start of the frame, which can predate the performance.now() we seeded `last` with, so
    // the first delta can come out negative and run the clock backwards. Clamp both ends: never negative, and never
    // a whole second after a tab has been in the background.
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (playing) t = (t + dt) % DUR;

    M.setST(W.pose(t));

    // the tour drives until the visitor takes over; keeping cam synced to it makes the handover seamless
    if (!manual) {
      Object.assign(cam, autoCam());
      const s = filmSelection(t);
      selKind = s.kind === 'area' ? null : s.kind;
      selT0 = s.t0;
      area = filmAreaAt(t);
      dropOpen = t > 29.3 && t < 30.45;
    }

    const obj = selKind ? panels.SEL_OBJ[selKind] : null;
    const fade = selKind ? clamp((t - selT0) / 0.3) : 0;
    sel.box(obj ?? null, obj ? Math.max(0.15, fade) : 0);
    const rf = selKind ? panels.ROUTE[selKind] : null;
    sel.route(rf ? rf(t) : null, selKind ? Math.max(0.2, clamp((t - selT0) / 0.9)) : 0, 1);
    sel.update();

    rt.beforeFrame();
    st.frame({tx: cam.x, ty: 2.5, tz: cam.z, az: cam.az * D2R, el: cam.el * D2R, d: cam.d, fov: FOV, sx: -110, sy: 26});

    const tags = panels.pinsAt(t);
    if (obj) {
      const a = proj(W.anchors[selKind]?.() ?? obj.getWorldPosition(new THREE.Vector3()));
      const [txt, sub] = panels.SEL_TEXT(selKind, t) ?? ['', ''];
      if (a && !panels.underUI(a)) tags.push({kind: 'sel', x: a[0], y: a[1], text: txt, sub, a: Math.max(0.2, fade)});
    }

    dropEl.style.pointerEvents = dropOpen ? 'auto' : 'none';
    if (toolDown >= 0 && now - toolAt > 260) toolDown = -1;

    ui.update({
      clock: panels.clockAt(t),
      site: AREAS[area],
      kpi: panels.kpiFor(area),
      card: panels.cardAt(t, selKind ?? 'area', selT0, area),
      track: panels.trackFor(t),
      table: panels.tableFor(area, t),
      drop: {open: dropOpen ? 1 : 0, sites: DROP, on: AREA_KEYS.indexOf(area)},
      tool: toolDown,
      tags,
      cursor: [-9999, -9999], // the visitor has a real one
      hand: false,
      click: 0,
    });

    ppEl.className = `pp${playing ? ' on' : ''}`;
    fillEl.style.width = `${(t / DUR) * 100}%`;
    tmEl.textContent = `${mmss(t)} / ${mmss(DUR)}`;

    requestAnimationFrame(draw);
  };

  window.TOYSUGAR = {st, W, cam, pickAt, seek: (v) => (t = clamp(v / DUR) * DUR)};
  window.SIM = {ready: true, duration: DUR, render: (v) => (t = v)};
  requestAnimationFrame(draw);
}
