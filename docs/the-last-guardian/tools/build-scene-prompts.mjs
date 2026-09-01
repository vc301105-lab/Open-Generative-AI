// THE LAST GUARDIAN — scene-by-scene prompt pack generator
// Builds: prompts-scene/scene-XX.md  (30 self-contained, paste-ready scene sheets)
//         12-scene-by-scene-prompts.md (single-file index of all 30 scenes)
// Usage:  node tools/build-scene-prompts.mjs   (run from docs/the-last-guardian)
//
// Difference from the other two generators:
//   09-veo-prompts.md      = archival, full identity block per shot (306)
//   prompts-flow/          = clip-sized prompts, one per 8s generation (440)
//   prompts-scene/  (this) = ONE SHEET PER SCENE: the two still prompts you need
//                            first, a whole-scene-in-one-clip prompt, the hero
//                            shot, then full shot-by-shot coverage. Work a scene
//                            top to bottom and it is finished.

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, loadScenes, cameraLine, cards, loc, clipsFor, buildFlowPrompt,
  STYLE, AVOID, IMG_STYLE, IMG_AVOID
} from './lib-prompt.mjs';

const OUT = path.join(ROOT, 'prompts-scene');

/* Which approved reference still to attach for each location code. */
const LOC_REF = {
  'LOC-01': null, // no still — use boards/scene-01/*.png as the look reference
  'LOC-02': 'loc-05-drowned-cathedral.png',
  'LOC-03': 'loc-04-stiltway-market.png',
  'LOC-04': 'loc-06-ward-12-clinic.png',
  'LOC-05': 'loc-01-anjari-salt-flats.png',
  'LOC-06': 'loc-07-archive-b7.png',
  'LOC-07': 'loc-08-tidewall.png',
  'LOC-08': 'loc-02-the-ark.png',
  'LOC-09': 'loc-03-cradle-loom.png',
  'LOC-10': 'loc-09-kite-field-golden.png'
};

const CHAR_REF = {
  arjun: 'char-01-arjun-vedh.png',
  kira: 'char-02-kira-okonkwo.png',
  dev: 'char-03-dev-aranya.png',
  riya: 'char-04-riya-sen.png',
  sera: 'char-05-sera-vance.png',
  meera: 'char-06-meera-sanyal.png',
  cadetArjun: 'char-07-cadet-arjun-2059.png',
  devCommander: 'char-08-dev-aranya-2059.png',
  amara: 'char-09-amara-okonkwo.png',
  hollow: 'char-10-the-hollow.png',
  bhaskar: 'char-12-bhaskar-rele.png',
  devRecording: 'char-03-dev-aranya.png',
  arjunRecording: 'char-01-arjun-vedh.png',
  ose: null,
  ila: null
};

const NAME = {
  arjun: 'Arjun', cadetArjun: 'Cadet Arjun (2059)', kira: 'Kira', dev: 'Dev / the Hollow',
  devCommander: 'Dev (2059)', devRecording: 'Dev (recording)', arjunRecording: 'Arjun (recording)',
  riya: 'Riya', meera: 'Meera', sera: 'Sera', ose: 'Minister Ose', bhaskar: 'Bhaskar',
  amara: 'Amara', ila: 'Ila', hollow: 'the Hollow'
};

const SIZE_RANK = { EWS: 0, WS: 1, FS: 2, MWS: 3, MS: 4, MCU: 5, CU: 6, ECU: 7, INSERT: 8, POV: 6 };

const pad = n => String(n).padStart(2, '0');

function clamp(text, max = 190) {
  const t = String(text).trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

/* Trim a beat description to a clean sentence/clause boundary — never mid-thought. */
function clampBeat(text, max = 190) {
  const t = String(text).trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t.replace(/[.;\s]+$/, '');
  const cut = t.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '), cut.lastIndexOf(' — '));
  const body = stop > max * 0.45 ? cut.slice(0, stop) : cut.slice(0, cut.lastIndexOf(' '));
  return body.replace(/[.;,\s—]+$/, '');
}

/* The widest of the first three shots — what an audience sees the scene "as". */
function establishingShot(s) {
  const pool = s.shots.slice(0, 3);
  return pool.slice().sort((a, b) =>
    (SIZE_RANK[a.size] ?? 4) - (SIZE_RANK[b.size] ?? 4))[0] || s.shots[0];
}

/* The shot the scene is remembered for: a flagged hero VFX beat, else the longest. */
function heroShot(s) {
  const flagged = s.shots.filter(sh => /^HERO VFX/i.test(sh.vfx || ''));
  const pool = flagged.length ? flagged : s.shots;
  return pool.slice().sort((a, b) => (b.dur || 0) - (a.dur || 0))[0];
}

function sceneChars(s) {
  const out = [];
  for (const sh of s.shots) for (const c of (sh.chars || [])) if (c && !out.includes(c)) out.push(c);
  return out;
}

/* ---------------- PROMPT FLAVOURS ---------------- */

function imagePrompt(s, sh, kind) {
  const who = cards(sh);
  const frozen = kind === 'establishing'
    ? 'A single frozen frame, no motion blur on the environment.'
    : 'The decisive frame of the moment — everything held at its peak.';
  return [
    `${sh.size}, ${sh.angle}, ${sh.lens}.`,
    `${clamp(sh.action, 320)}.`,
    who.length ? `${who.join('. ')}.` : '',
    `Setting: ${loc(s.loc)}. ${s.time}, ${s.weather}.`,
    `Light: ${sh.light}.`,
    sh.vfx && !/^none/i.test(sh.vfx) ? `In frame: ${sh.vfx.replace(/^HERO VFX — /, '')}.` : '',
    frozen,
    IMG_STYLE,
    IMG_AVOID
  ].filter(Boolean).join(' ');
}

/* Whole scene compressed into one 8-second generation — the fast route. */
function sceneInOnePrompt(s) {
  const first = s.shots[0];
  const hero = heroShot(s);
  const last = s.shots[s.shots.length - 1];
  const beats = [first, hero, last].filter((v, i, a) => a.indexOf(v) === i);
  const who = [];
  for (const b of beats) for (const c of cards(b)) if (!who.includes(c)) who.push(c);
  const beatText = beats.map((b, i) =>
    `Beat ${i + 1}${i === beats.length - 1 ? ' (final)' : ''}: ${clampBeat(b.action, 170)}.`
  ).join(' ');
  return [
    `One continuous ${hero.lens} take, ${hero.move.replace(/\bstatic\b/i, 'locked-off')}, compressing the whole scene into eight seconds.`,
    beatText,
    who.length ? `${who.slice(0, 3).join('. ')}.` : '',
    `Setting: ${loc(s.loc)}. ${s.time}, ${s.weather}.`,
    `Light: ${hero.light}.`,
    hero.vfx && !/^none/i.test(hero.vfx) ? `Effect: ${hero.vfx.replace(/^HERO VFX — /, '')}.` : '',
    `Audio: ${hero.sound}.`,
    STYLE,
    AVOID
  ].filter(Boolean).join(' ');
}

function refList(s) {
  const rows = [];
  const codes = [...new Set(String(s.loc).match(/LOC-\d+/g) || [])];
  if (!codes.length) {
    rows.push(['boards/scene-01/', `non-physical space (${s.loc}) — match the Scene 1 plates for grain and contrast`]);
  }
  for (const code of codes) {
    const lr = LOC_REF[code];
    rows.push(lr
      ? [`reference/${lr}`, `location lock — ${code}`]
      : ['boards/scene-01/', `no location still exists for ${code} — match the Scene 1 plates`]);
  }
  for (const c of sceneChars(s)) {
    const f = CHAR_REF[c];
    if (f) rows.push([`reference/${f}`, NAME[c] || c]);
  }
  const seen = new Set();
  return rows.filter(r => (seen.has(r[0] + r[1]) ? false : seen.add(r[0] + r[1])));
}

/* ---------------- OUTPUT ---------------- */

fs.mkdirSync(OUT, { recursive: true });
const scenes = loadScenes();

const index = [];
index.push('# 12 · Scene-by-scene prompt sheets');
index.push('');
index.push('One sheet per scene. Each sheet is self-contained: open it, work top to bottom, the scene is shot.');
index.push('');
index.push('| Sheet | Order in a scene | Paste into |');
index.push('|---|---|---|');
index.push('| ① Establishing still | the frame the scene is set in | Omni / any image model |');
index.push('| ② Hero still | the frame the scene is remembered for | Omni / any image model |');
index.push('| ③ Scene in one clip | 8s version of the whole scene | Flow / Veo (text-to-video) |');
index.push('| ④ Hero shot clip | the money shot at full quality | Flow / Veo (use ② as first frame) |');
index.push('| ⑤ Full coverage | every shot, clip-sized, in order | Flow / Veo |');
index.push('');
index.push('Do ① → ② first. Feed the stills back in as the first frame / Ingredient for ③ ④ ⑤ — that is what keeps faces and rooms from drifting.');
index.push('');
index.push('| # | Scene | Location | Shots | Clips | Runtime | Sheet |');
index.push('|---|---|---|---|---|---|---|');

let totalClips = 0;

for (const s of scenes) {
  const est = establishingShot(s);
  const hero = heroShot(s);
  const runtime = s.shots.reduce((n, sh) => n + (sh.dur || 0), 0);
  const clipCount = s.shots.reduce((n, sh) => n + clipsFor(sh).length, 0);
  totalClips += clipCount;
  const file = `scene-${pad(s.scene)}.md`;

  const L = [];
  L.push(`# SCENE ${pad(s.scene)} — ${s.title}`);
  L.push('');
  L.push(`\`${s.slug}\``);
  L.push('');
  L.push(`**Act ${s.act}** · ${s.loc} · ${s.time} · ${s.weather} · **${s.shots.length} shots / ${clipCount} clips / ${runtime}s**`);
  L.push('');
  L.push(`**Objective —** ${s.objective}`);
  L.push('');
  L.push('**Attach these reference images (Flow → Ingredients, Omni → reference input):**');
  L.push('');
  for (const [file, note] of refList(s)) L.push(`- \`${file}\` — ${note}`);
  L.push('');
  L.push('---');
  L.push('');
  L.push(`## ① ESTABLISHING STILL — shot ${est.id}`);
  L.push('');
  L.push('> Generate this first. It becomes the location lock for every clip in the scene.');
  L.push('');
  L.push('```text');
  L.push(imagePrompt(s, est, 'establishing'));
  L.push('```');
  L.push('');
  L.push(`## ② HERO STILL — shot ${hero.id}`);
  L.push('');
  L.push('> The image the scene is remembered for. Use it as the first frame of ④.');
  L.push('');
  L.push('```text');
  L.push(imagePrompt(s, hero, 'hero'));
  L.push('```');
  L.push('');
  L.push('## ③ WHOLE SCENE IN ONE 8-SECOND CLIP');
  L.push('');
  L.push('> Fast route — an animatic-grade version of the scene in a single generation.');
  L.push('');
  L.push('```text');
  L.push(sceneInOnePrompt(s));
  L.push('```');
  L.push('');
  L.push(`## ④ HERO SHOT — ${s.scene < 10 ? 'S0' : 'S'}${s.scene}-${hero.id} (${hero.size}, ${hero.dur}s)`);
  L.push('');
  L.push('```text');
  L.push(buildFlowPrompt(s, hero, 0, 1));
  L.push('```');
  L.push('');
  L.push(`## ⑤ FULL COVERAGE — ${clipCount} clips in cut order`);
  L.push('');
  L.push('Generate in this order. Each clip is already sized for one Flow / Veo generation.');
  L.push('');

  for (const sh of s.shots) {
    const durs = clipsFor(sh);
    for (let i = 0; i < durs.length; i++) {
      const id = durs.length > 1
        ? `S${pad(s.scene)}-${sh.id}-${String.fromCharCode(97 + i)}`
        : `S${pad(s.scene)}-${sh.id}`;
      L.push(`### ${id} · ${sh.size} · ${durs[i]}s${durs.length > 1 ? ` · part ${i + 1}/${durs.length}` : ''}`);
      L.push('');
      L.push('```text');
      L.push(buildFlowPrompt(s, sh, i, durs.length));
      L.push('```');
      L.push('');
    }
  }

  L.push('---');
  L.push('');
  L.push(`Prev: ${s.scene > 1 ? `[Scene ${pad(s.scene - 1)}](scene-${pad(s.scene - 1)}.md)` : '—'} · `
    + `Next: ${s.scene < scenes.length ? `[Scene ${pad(s.scene + 1)}](scene-${pad(s.scene + 1)}.md)` : '—'} · `
    + `[All sheets](../12-scene-by-scene-prompts.md)`);
  L.push('');

  fs.writeFileSync(path.join(OUT, file), L.join('\n'));

  index.push(`| ${pad(s.scene)} | ${s.title} | ${s.loc} | ${s.shots.length} | ${clipCount} | ${runtime}s | [sheet](prompts-scene/${file}) |`);
}

index.push('');
index.push(`**Totals —** ${scenes.length} scenes · ${scenes.reduce((n, s) => n + s.shots.length, 0)} shots · ${totalClips} clips · ${scenes.reduce((n, s) => n + s.shots.reduce((m, sh) => m + (sh.dur || 0), 0), 0)}s of coverage · 60 still prompts (2 per scene).`);
index.push('');
index.push('Regenerate everything with `node tools/build-scene-prompts.mjs`. Never hand-edit `prompts-scene/` — edit `data/shots-*.json` or the cards in `tools/lib-prompt.mjs`.');
index.push('');

fs.writeFileSync(path.join(ROOT, '12-scene-by-scene-prompts.md'), index.join('\n'));

console.log(`Scene sheets built: ${scenes.length} scenes, ${totalClips} clips, ${scenes.length * 2} still prompts`);
console.log(' -> prompts-scene/scene-01.md … scene-30.md');
console.log(' -> 12-scene-by-scene-prompts.md');
