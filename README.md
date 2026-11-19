<h1 align="center">Caneline</h1>

<p align="center"><b>A sugar mill you can drive.</b><br>
One offline HTML page. Every machine, every number and every frame is code.</p>

<p align="center"><img src="docs/overview.png" alt="The whole mill: cane yard, tipping table, carrier, mill house, boiler, packing and the sugar store" width="100%"></p>

<p align="center">
<b>44.6 seconds</b> &nbsp;·&nbsp; <b>one camera</b> &nbsp;·&nbsp; <b>~5,000 lines</b> &nbsp;·&nbsp; <b>no 3D files, no downloads, no network</b>
</p>

---

## What it is

A toy-scale isometric sugar mill — **Suphan Mill, ML-01** — with a product UI laid over it. The whole plant runs on
one clock: the cane carrier, the four-mill tandem, the clarifier, five evaporator bodies, two vacuum pans, six
centrifugals running deliberately out of phase, the rotary dryer, two bagging lines and the boiler burning its own
bagasse. One camera pans and zooms across it and never cuts.

Open [`index.html`](index.html) in any browser. Nothing is fetched — three.js, the fonts and every model are inlined.

## The story it tells

You follow **one cane load, #CN-4412** — 31.4 t of Khon Kaen 3 from Ban Rai Farms — from the gate to a bagged pallet:

| | |
|---|---|
| **0.6–5.2 s** | CT-18 weighs in at WB-1. Gross 44.6 t, tare 13.2 t. |
| **5.8–12.6 s** | It runs the internal road west past the mill house, and the camera rides with it. |
| **13.2–18.8 s** | It drives forward up the tipping table's bridge ramp, the deck lifts its nose to 53°, and the load goes east over the tailgate into the receiving hopper. |
| **15.4–23.4 s** | The cane climbs the 38 m slat carrier from y 1.2 to 6.4 and in through the hall's west door. |
| **20.5–28.0 s** | The shredder and the four-mill tandem crush it. Juice to the tray, bagasse to the boiler. |
| **26.0–33.5 s** | The clarifier, then five evaporator effects take it to syrup. |
| **32.0–39.0 s** | Pan 01 boils strike #ST-2207; the centrifugals spin it white. |
| **37.0–42.4 s** | The dryer, then bag 1 of pallet P-2207 rides the bagging belt. |
| **40.4–44.6 s** | FL-02 carries P-2207 out to Store ST-1, dock 2, and the camera pulls back over the whole mill. |

Every panel on screen reads from that same clock. The tracker ticks over as the load moves, the mill torques and the
pan's strike are the scene's own numbers, and the area switcher walks Cane Yard → Mill House → Process House →
Packing & Store as the camera gets there.

<p align="center"><img src="docs/tipping.png" alt="CT-18 nosed up on the tipping table at 35 degrees, the cane going into the hopper and up the carrier" width="100%"></p>

## The rules it follows

| | |
|---|---|
| **One camera** | Azimuth 42°, elevation 34°. In the film it only pans and zooms, and never cuts; on the page you take it over. |
| **`render(t)` is pure** | Any second renders the same frame in any order. No physics, no timers, no state between frames — which is what lets you scrub the day backwards and get the same mill. |
| **Toy scale** | A cane truck nearly as tall as the hopper. Big simple shapes, generous bevels, nothing sharp. |
| **Two colours** | Blue and white on a lavender ground. Yellow only on the working machines — the mill rollers, the tipping table, the carrier slats, the cane cage. Green only on cane. |
| **Nothing above y = 12** | At 34° a tall column hides the work behind it. The one exception is the boiler stack, at the back where it blocks nothing. |
| **It is swept for collisions** | Oriented boxes from each body's own geometry, every 0.1 s across all 44.6 s. The sweep currently reports nothing. |

## The beats

<p align="center"><img src="docs/beats.png" alt="Eight frames: the opening, the drive, the yard, the tip, the carrier, the mills, the process house and packing" width="100%"></p>

## Run it

**Live: [thtpk.github.io/SugarFactory](https://thtpk.github.io/SugarFactory/)**

Or open [`index.html`](index.html) from a clone. That is the whole thing — one file, no server, no network.

It opens playing the tour above, so you can see the mill working without being told what to look at. The moment you
touch it, the tour hands over and does not take control back:

| | |
|---|---|
| **drag** | pan over the map |
| **scroll** or **pinch** | zoom |
| **right-drag** | swing the camera round |
| **click a machine** | select it — its card, its outline, and its route drawn on the ground |
| **click the map** | deselect, back to the area card |
| **the switcher, top right** | jump to the Cane Yard, Mill House, Process House or Packing |
| **the tool column** | zoom, rotate, and home to the whole mill |
| **the fleet table** | click a row to select what it names |
| **the scrubber** | scrub the crushing day; `space` plays and pauses |
| `←` `→` `r` `f` `Esc` | seek two seconds, restart, fullscreen, deselect |

[`film.html`](film.html) is the same mill cut as a fixed 44.6 s film — one camera, scripted clicks, no controls.
That is the page the video is recorded from. Both are built from the same world, so neither can drift from the other.

The site is published straight from this branch (Settings → Pages → Source: *Deploy from a branch*, `main` / `(root)`).
The pages are committed, so there is no build step in CI and nothing to go stale between a push and the live site.

## Build it

The sources in `src/` are written against the kit in the [`Nyxera0x/simulator`](https://github.com/Nyxera0x/simulator)
Claude Code skill — its stage and lighting, its product UI, its selection marks, and its airport, car-plant and
construction-site model kits, which Caneline reuses for the box trucks, forklifts, pallets, hall, fences and trees.
That kit is not a published npm package, so the build borrows it from an installed copy of the skill.

```bash
npx skills add Nyxera0x/simulator -g -a claude-code
```

```bash
cd ~/.claude/skills/simulator && npm install && npx playwright install chromium
```

Then, back in this repository:

```bash
npm run build
```

`scripts/build.mjs` finds the installed skill (or `SIMULATOR_SKILL_DIR`), copies `src/*` into its `sims/` folder, runs
its bundler and copies the single self-contained HTML file back here as `index.html`. Node 20 or newer.

To re-run the collision sweep:

```bash
npm run collide
```

## What is inside

| | |
|---|---|
| `index.html` | The built page you can drive. Self-contained, offline, ~1 MB. This is the deliverable. |
| `film.html` | The same mill as a fixed 44.6 s film, for recording. |
| `src/sugar-shared/mill.js` | Everything the two pages share: the stage, the world, the product UI, the selection marks, the thumbnails, and every panel's contents as a function of the clock. |
| `src/sugar-shared/app.js` | The interactive page: camera control, picking by raycast, the live panels and the scrubber. |
| `src/sugar-shared/palette.js` | The mill's colours on top of the kit's, and the shared helpers: lathed vessels, pipe runs, walkways, plumes. |
| `src/sugar-shared/wet.js` | The wet end: cane carrier, receiving hopper, shredder, four-mill tandem, juice tanks, clarifier, five evaporator bodies, pipe racks. |
| `src/sugar-shared/dry.js` | The dry end: vacuum pans, crystallisers, six centrifugals, rotary dryer, silos, bagging line, sugar bags and pallets, boiler house. |
| `src/sugar-shared/yard.js` | The yard: cane trucks and trailers, the tipping table, the weighbridge, cane and bagasse piles, the pedestal grab, gate, office, tank farm. |
| `src/sugar-shared/world.js` | The map and the whole crushing day as `pose(t)` — every path, every machine's state, the numbers the UI reads. |
| `src/sugar-shared/film.js` | The film's timeline: the camera keys, the ten clicks and the drawn cursor. |
| `src/sugar-app/`, `src/sugar-film/` | The two pages' entry points. `src/sugar-collide/`: the collision sweep. |
| `docs/BRIEF.md` | The brief the three model kits were built from, including the scale contract every height in the mill meets. |

## Credits

Built with the [`Nyxera0x/simulator`](https://github.com/Nyxera0x/simulator) skill, which supplies the look, the
stage, the product UI and the vehicle and building kits Caneline reuses.

The mill, its sites, its loads, its staff and its numbers are fictional.

## License

MIT — see [LICENSE](LICENSE).
