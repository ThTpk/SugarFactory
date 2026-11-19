# Caneline — the model brief

We are rebuilding **a sugar mill** in the format of the simulator skill's four systems that already worked: the toy
airport (`sims/airport-shared/`), the car plant (`sims/plant-shared/`), the construction site (`sims/site-shared/`)
and the warehouse network (`sims/warehouse-shared/`). Those four ARE the reference: there is no video to sample, so
the look is already written down in code. Match it exactly. Your job is the **3D models only**. The world layout, the
camera, the UI and the film come afterwards on top of your kit.

## Study the reference first

Open these before writing anything, and keep `site-shared/machines.js` beside you the whole time — it is the closest
reference for industrial plant and it is the file whose helper preamble you should copy:

- `sims/airport-shared/style.js` — the palette (`TOY`), `toyMat`, `rbox`, `mesh`, `labelTexture`. **Never redefine a
  colour that is already in `TOY`.**
- `sims/sugar-shared/palette.js` — ours: `MILL` (cane, juice, sugar, steel, pipe), plus `cyl`, `lathe`, `pipe`,
  `walkway`, `plume`, `clamp`, `lerp`, `sat`, `smooth`. Import these; do not re-invent them.
- `sims/site-shared/machines.js` lines 1–880 — the helper preamble: `mats()`, `canvasTex`, `cg`, `rb`, `roundedPoly`,
  `prep`, `tpl`, `roller(wheels)`, `cab(P, {...})`. Copy this preamble into your own file (each kit file in this repo
  carries its own copy — that is the house style) and build with it. `tpl` merges the static parts per material and
  caches them per variant, which is why a scene with 40 machines still renders fast.
- `sims/plant-shared/line.js` — `buildToyRollerConveyor`, `buildToyPress`, `buildToyPaintBooth` for how big fixed
  plant is drawn.

What makes the look, checked against those files:

- **Toy proportions.** Machines big against the buildings, simple chunky rounded forms. Small real detail is left out;
  what stays is made bigger. A worker-sized railing is drawn as a chunky rail, not a thin wire.
- **Premium finish.** Generous bevels on every edge (`rbox`'s `r` is never smaller than about 0.08 of the smallest
  side), matte paint with a soft clearcoat (`toyMat(c, {paint: true})`) on anything that would be painted, dark glass
  (`TOY.glass`), crisp printed numbers and signs via `labelTexture`. Cheap = flat boxes, sharp corners, noisy detail.
- **Few colours.** Blue (`TOY.blue`) frames, cabs and structure; white and `MILL.tank` shells; **yellow
  (`TOY.yellow`) only on the working machines** — the rollers, the tipping table, the grab, the carrier's slats;
  `TOY.navy` tyres and glass; green only on cane and trees.
- **Readable at a glance.** Every object recognisable from its silhouette at thumbnail size.
- **No people built in code.** Cabs get dark glass.

## Keep everything low

The camera sits at 34 degrees over the map and never cuts. A 40 m column or a tall chimney hides the work behind it.
Hard ceiling: **nothing above y = 12**, except the boiler stack, which is 18 and lives at the north edge where it
blocks nothing. If a real sugar mill's vessel is 20 m, draw it 9 and make it wider.

## Scale contract (toy metres, y up)

Both the wet end and the dry end stand on the floor of one open-top hall and must meet each other and the yard here:

| | |
|---|---|
| Hall | `buildToyHall` from `plant-shared/plant.js`, open-top, wall height 2.4, floor at y = 0. Your plant stands on y = 0. |
| Nose / length | A machine's length runs along **+x**, its right side is **+z**, origin on the ground at its centre. |
| Cane carrier | slat deck 3.6 wide. Foot (the hopper's lip) deck top at **y = 1.2**; head (the discharge over the shredder) deck top at **y = 6.4**; the run is 34 long. |
| Shredder | rotor axis at **y = 7.4**, its outlet chute lip at **y = 5.6**. |
| Mill tandem | 4 mills in a row along +x, 7.0 apart. Each mill's **top roller centre at y = 4.2**, roller 1.9 across, 2.8 long. Its feed chute lip at **y = 5.6** (meets the shredder's outlet and the previous mill's discharge). Juice tray lip at **y = 0.9**. |
| Juice / liquor tanks | 6.0 across, 5.0 tall, standing on a 0.6 skirt, so the top is at **y = 5.6**. |
| Clarifier | 11.0 across, 4.4 tall, on a 0.6 skirt. |
| Evaporators | 5 bodies in a row, 4.2 across, **10.0 tall** including the dished bottom, 6.5 apart, feet at y = 0. |
| Vacuum pans | 2 pans, 6.6 across, **9.0 tall**, 9.0 apart. |
| Centrifugals | 6 in a row on a 1.4 platform, basket 2.4 across, each machine 2.6 tall above the platform, so the top is at **y = 4.0**, 3.4 apart. |
| Rotary dryer | drum 3.0 across, 16 long, axis at **y = 3.4**, running along +x with a 2 degree tilt. |
| Bagging line | belt top at **y = 0.70** (the same as `buildToyRollerConveyor`'s `topY`), so a bag can hand over to one. A sugar bag is **0.90 x 0.52 x 0.30** (x, y, z) and weighs 50 kg in the fiction. |
| Pallet | `buildToyPallet` from `plant-shared/plant.js`, deck top at y = 0.14 or so. A full sugar pallet is 4 bags x 3 layers, its top at **y = 1.10**. |
| Tipping table | deck top at **y = 0.90** when flat; it tilts about its east edge to **55 degrees**. The deck is 13.0 x 4.6, enough for one cane truck. |
| Cane truck | the airport box truck's cab-over cab to the millimetre (`cab()` from the preamble), **9.6 long**, cage sides 2.6 above the deck, deck at y = 1.5, wheel radius 0.75. It drives onto the tipping table. |
| Weighbridge | deck 16.0 x 4.6, deck top at **y = 0.25**, flush ramps either end. |
| Boiler stack | 2.6 across, **18 tall**, north edge only. |

## Agent A — the wet end, in `sims/sugar-shared/wet.js`

Where cane becomes clarified juice. Everything stands in the hall's west half.

- `buildCaneCarrier({length = 34, rise = 5.2})` gives `{group, setSlats(d), setCane(k, t), deckAt(s), footY, headY, length}`.
  An inclined slat conveyor in a blue trough with **yellow slats**. `setSlats(d)` runs the slats by distance (pure in
  d). `setCane(k, t)` shows a bed of cane on the deck, `k` = 0 empty to 1 a full load, drifting up the deck with `t`.
  `deckAt(s)` gives `[x, y, z]` on the deck `s` metres from the foot, so the film can ride a marker up it.
- `buildCaneHopper()` gives `{group, lipY, setFill(k)}` — the sloped receiving hopper the tipping table pours into.
- `buildShredder({number = '01'})` gives `{group, setRotor(a), inletY, outletY}` — a chunky blue housing with a yellow
  hammer rotor seen through a side opening, a motor and a drive belt guard.
- `buildMillTandem({n = 4})` gives `{group, setRollers(a), setJuice(k, t), mills: [{x, feedLip, trayLip}], length}`.
  `n` roller mills under one yellow frame, each with three visible fluted rollers that turn with `setRollers(a)`, a
  feed chute, a trash plate and a juice tray running underneath. `setJuice(k, t)` is the dark stream falling from the
  rollers into the tray, k its thickness.
- `buildJuiceTank({d = 6, h = 5, label = 'RAW JUICE', color = MILL.juice})` gives `{group, setLevel(k), topY}`.
  A lathed vessel with a dished bottom on a skirt, a ladder, a level sight-glass that reads `setLevel`, the label
  printed on its flank with `labelTexture`.
- `buildClarifier()` gives `{group, setRake(a), topY}` — a wide shallow tank with a slow central rake arm.
- `buildEvaporatorRow({n = 5})` gives `{group, setVapour(t, k), bodies: [{x, topY}]}` — five tall bodies joined by
  vapour pipes at the top and juice pipes at the bottom, a steel walkway at y = 6.0 down the row, a soft plume off the
  last body's vapour head (use `plume` from `palette.js`).
- `buildPipeRack({length = 40, lines = 4, y = 6.4})` gives `{group}` — the pipe bridge that ties the vessels together.
  Use `pipe()` from `palette.js`.

## Agent B — the dry end, in `sims/sugar-shared/dry.js`

Where syrup becomes bagged sugar. Everything stands in the hall's east half.

- `buildVacuumPan({number = '01'})` gives `{group, setBoil(t, k), setStrike(k), topY}` — a fat domed vessel on legs
  with a conical bottom, a discharge valve, a sight glass that shows the massecuite rising with `setStrike`.
- `buildCrystalliser({n = 3})` gives `{group, setStir(a)}` — three horizontal U-troughs with slow ribbon stirrers.
- `buildCentrifugalRow({n = 6})` gives
  `{group, setSpin(i, a), setCharge(i, k), setDischarge(i, k), platformY, units: [{x}]}`.
  Six basket centrifugals on a steel platform at y = 1.4, each a blue drum with a yellow lid; `setSpin(i, a)` turns
  unit `i`'s basket, `setCharge` fills it with massecuite, `setDischarge` drops white sugar out of its bottom onto
  the belt below. They must be able to run out of phase, so the row never pulses as one.
- `buildRotaryDryer({length = 16})` gives `{group, setDrum(a), setHot(t), inletY, outletY}` — a long tilted drum on
  two trunnion rings with a blue shell and yellow riding rings, a hot-air box at the inlet and a soft plume at the
  outlet.
- `buildSugarSilo({d = 7, h = 9, label = 'A'})` gives `{group, setLevel(k), outletY}` — a cone-bottomed silo on legs.
- `buildBaggingLine({length = 22})` gives `{group, setBelt(d), bagAt(s), setFiller(k), beltY, length}` — a weigh
  hopper and filling spout over a belt at y = 0.70, a stitching head, a check-weigher, a short roller run out to the
  palletiser. `bagAt(s)` gives `[x, y, z]` on the belt `s` metres along, so the film can place one bag anywhere on it.
- `buildSugarBag({kind = 'white'})` gives a `THREE.Group` — a 0.90 x 0.52 x 0.30 sack, soft and slightly slumped, with
  `CANELINE` and a net weight printed on its face. `kind` is `'white'` or `'raw'`.
- `buildSugarPallet({layers = 3, kind = 'white', seed = 1})` gives a `THREE.Group` — `buildToyPallet`'s deck with 4
  bags per layer, stretch-wrapped on the top layer. Top at y = 1.10.
- `buildBoilerHouse()` gives `{group, setFire(t, k), setPlume(t, k), stackTop, feedY}` — a blue-and-white boiler
  building 14 x 18, roof at y = 9, with a glowing fire door (`MILL.hot`, emissive), a bagasse feed chute at `feedY`,
  and the **18 m stack** on its north flank with a lazy plume.

## Agent C — the yard, in `sims/sugar-shared/yard.js`

Everything outside the hall, plus everything that moves on wheels.

- `buildCaneTruck({number = '18', livery = 'aurora', load = 1})` gives
  `{group, roll(d), setSteer(a), setLoad(k), deckY, dims}`.
  The airport box truck's cab-over cab (blue) on a **yellow cane cage** body: open slatted sides 2.6 high, the cane
  stacked above the rail and strapped. `setLoad(k)`: 1 a full load, 0 empty — the cane shrinks and slides toward the
  rear as the table tilts, so the film can empty it. 9.6 long.
- `buildTippingTable({number = 'T1'})` gives `{group, setTilt(k), deckY, deckSpan: {x0, x1, z}, hingeX}`.
  A yellow platform on a blue pit frame with two big hydraulic rams. `setTilt(k)`: 0 flat, 1 at 55 degrees about its
  east edge. Wheel chocks and a back stop at the high end.
- `buildWeighbridge({label = 'WB-1'})` gives `{group, deckY, setBoom(k), boomOpen}` — the 16 m deck, a kiosk with dark
  glass, a lit display board showing a tonnage (`labelTexture`), and a barrier boom that `setBoom` lifts.
- `buildCanePile({volume = 400, seed = 1})` gives a `THREE.Group` — a long heap of stacked cane in the yard,
  `MILL.cane` with `MILL.caneDry` tops; shaped like `buildToySoilHeap` in `site-shared/site.js` but made of visible
  stalks.
- `buildBagassePile({volume = 300, seed = 1})` gives a `THREE.Group` — the pale fibre heap by the boiler.
- `buildCaneGrab({number = '02'})` gives `{group, setSlew(a), setBoom(k), setGrab(k), setLoad(k), grabTip}` — a fixed
  pedestal grab crane over the cane yard. **Pedestal 6 tall, boom never above y = 11.**
- `buildMillGate()` gives `{group, setBoom(k)}` and `buildMillSign({name, sub})` gives a `THREE.Group` — the entrance.
- `buildLabOffice()` gives a `THREE.Group` — a two-storey blue-and-white office block 18 x 12, roof at y = 8.
- `buildTankFarm({n = 3})` gives a `THREE.Group` — three molasses tanks, 8 across, 7 tall, in a bund.
- `buildYardLamp()` and `buildCaneTrailer()` — a yard light, and a trailer that a truck tows, same cage, 7.0 long.

## How to work

1. Read `style.js`, `palette.js`, this brief, and `site-shared/machines.js`'s preamble.
2. Write your file. **Touch only your own file**, plus your own bench folder. Never edit `palette.js`,
   `airport-shared/*`, `plant-shared/*`, `site-shared/*`, or another agent's file.
3. Build a bench page at `sims/sugar-bench-<a|b|c>/main.js` laying every model you own out on the ground, spaced so
   none touches another, with a floor under them. Template:

   ```js
   import * as THREE from 'three';
   import {runSim} from '../kit/runtime.js';
   import {createToyStage, TOY} from '../airport-shared/style.js';
   import {buildCaneCarrier} from '../sugar-shared/wet.js';

   runSim({duration: 6, fps: 30, theme: 'light', hud: {enabled: false, title: 'bench', subtitle: ''}, director: {enabled: false}}, async ({canvas, capture}) => {
     const st = createToyStage(canvas, {fov: 28});
     const root = new THREE.Group();
     const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({color: TOY.ground, roughness: 0.95}));
     ground.receiveShadow = true;
     root.add(ground);
     const put = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.y = ry; root.add(o); return o; };
     // put(buildCaneCarrier().group, -60, 0);   one call per model
     st.scene.add(root);
     const resize = () => st.resize(1600, 900, capture ? devicePixelRatio || 1 : Math.min(devicePixelRatio || 1, 2));
     resize();
     return {resize, render(t) {
       // drive every moving part here so the still shows them working
       st.frame({tx: 0, ty: 3, tz: 0, az: 42 * Math.PI / 180, el: 34 * Math.PI / 180, d: 180, fov: 28});
       return {};
     }};
   });
   ```

4. Build and capture, from `C:\Users\Thanunchai\.claude\skills\simulator`:

   ```
   node sims/build.mjs sugar-bench-a
   node sims/capture.mjs sugar-bench-a --still 2 --out simulator-out/bench-a.png
   ```

   **Read the PNG back with your image tool and look at it.** Then fix what is wrong and capture again. Do this at
   least three times. A model you never looked at is not finished.
5. Finish with close-up stills: `--still 2` with the bench camera moved in (`d: 40`) over each machine, plus one
   whole-bench still.

## Rules

- No downloads, no new packages. Everything is three.js, already in the kit.
- Merge static parts per material (`tpl`) and instance repeated parts. A 60-machine scene must still render at 60 fps.
- Every exported builder is **a pure function of its arguments** and every setter is **a pure function of its input**:
  no timers, no internal state that carries between frames, no `Math.random()` outside a seeded helper. The film calls
  `render(t)` for any `t` in any order and must get the same frame.
- Text uses Inter via `labelTexture`; build after `document.fonts` has loaded (runSim does that before setup).
- Document every export at the top of your file in the style of `machines.js`'s header block, including every setter's
  units and its 0 and 1 ends.
- Report in under 25 lines: what you built, the exported API with its key heights, your still paths, and anything in
  `palette.js` you would change and why.
