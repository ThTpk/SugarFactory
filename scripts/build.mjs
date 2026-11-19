#!/usr/bin/env node
// Builds Caneline into one self-contained index.html.
//
// The sources in src/ are written against the `simulator` skill's kit (its stage, its product UI, its selection
// marks and its airport / plant / site model kits), so the build borrows that kit: it copies src/* into the skill's
// sims/ folder, runs the skill's own bundler, and copies the single HTML file it produces back here as index.html.
// Nothing is left behind in the skill but the copied folders, which the next run overwrites.
//
//   node scripts/build.mjs                        build index.html
//   node scripts/build.mjs --collide              run the collision sweep instead and print the pairs that touch
//   SIMULATOR_SKILL_DIR=/path/to/simulator node scripts/build.mjs      a skill installed somewhere else
//
// Install the skill first:  npx skills add Nyxera0x/simulator -g -a claude-code
// then, once, inside it:    npm install && npx playwright install chromium
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const COLLIDE = process.argv.includes('--collide');

const candidates = [
  process.env.SIMULATOR_SKILL_DIR,
  path.join(os.homedir(), '.claude', 'skills', 'simulator'),
  path.join(os.homedir(), '.agents', 'skills', 'simulator'),
  path.join(os.homedir(), '.config', 'claude', 'skills', 'simulator'),
].filter(Boolean);
const SKILL = candidates.find((d) => fs.existsSync(path.join(d, 'sims', 'build.mjs')));
if (!SKILL) {
  console.error(
    [
      'Could not find the simulator skill. Install it with',
      '',
      '  npx skills add Nyxera0x/simulator -g -a claude-code',
      '',
      'then, inside the installed folder,',
      '',
      '  npm install && npx playwright install chromium',
      '',
      'If it lives somewhere unusual, point at it with SIMULATOR_SKILL_DIR.',
      'Looked in:',
      ...candidates.map((c) => '  ' + c),
    ].join('\n'),
  );
  process.exit(1);
}
if (!fs.existsSync(path.join(SKILL, 'node_modules', 'three'))) {
  console.error(`The skill at ${SKILL} has no dependencies yet. Run, inside it:\n\n  npm install && npx playwright install chromium`);
  process.exit(1);
}

const copy = (from, to) => {
  fs.rmSync(to, {recursive: true, force: true});
  fs.cpSync(from, to, {recursive: true});
};
for (const dir of fs.readdirSync(path.join(ROOT, 'src'))) {
  copy(path.join(ROOT, 'src', dir), path.join(SKILL, 'sims', dir));
}
console.log(`kit: ${SKILL}`);

const entry = COLLIDE ? 'sugar-collide' : 'sugar-film';
const run = (args) => execFileSync(process.execPath, args, {cwd: SKILL, stdio: 'inherit'});
run([path.join('sims', 'build.mjs'), entry]);

if (COLLIDE) {
  // The sweep runs inside the page and reports on the console, so drive it with the skill's own Chromium and print
  // what it says. An empty list means no two bodies overlapped at any 0.1 s step across the whole film.
  const {chromium} = await import(pathToFileURL(path.join(SKILL, 'node_modules', 'playwright', 'index.mjs')).href);
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1200, height: 700}});
  const lines = [];
  page.on('console', (m) => {
    const t = m.text();
    if (t.startsWith('COLLIDE')) lines.push(t.slice('COLLIDE '.length));
  });
  page.on('pageerror', (e) => lines.push('page error: ' + String(e).split('\n')[0]));
  await page.goto(pathToFileURL(path.join(SKILL, 'simulator-out', 'dist', `${entry}.html`)).href);
  const deadline = Date.now() + 90000;
  while (!lines.length && Date.now() < deadline) await page.waitForTimeout(500);
  await browser.close();
  if (!lines.length) {
    console.error('the sweep did not report within 90 s');
    process.exit(1);
  }
  for (const l of lines) {
    const hits = l.startsWith('[') ? JSON.parse(l) : [l];
    if (!hits.length) console.log('collision sweep: clean, nothing overlaps');
    else {
      console.log(`collision sweep: ${hits.length} overlapping pair(s)`);
      for (const h of hits) console.log('  ' + h);
    }
  }
  process.exit(0);
}

const built = path.join(SKILL, 'simulator-out', 'dist', `${entry}.html`);
if (!fs.existsSync(built)) {
  console.error(`the skill's bundler produced nothing at ${built}`);
  process.exit(1);
}
fs.copyFileSync(built, path.join(ROOT, 'index.html'));
const kb = (fs.statSync(built).size / 1024).toFixed(0);
console.log(`index.html  ${kb} KB  — open it in a browser, or push and serve it with GitHub Pages`);
