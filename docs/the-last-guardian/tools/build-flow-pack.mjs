// THE LAST GUARDIAN — Google Flow / Omni paste-ready prompt pack generator
// Builds: prompts-flow/scene-XX.txt (one per scene) + prompts-flow/ALL-PROMPTS.txt
//         + prompts-flow/shots.csv
// Usage: node tools/build-flow-pack.mjs   (run from docs/the-last-guardian)
//
// Why this exists: 09-veo-prompts.md embeds the FULL locked identity block in every
// prompt, which is correct for an archival spec but unusable for pasting 306 times
// into a web UI. This pack emits short, natural-language, audio-aware prompts sized
// for an 8-second generation window, with compact character cards.

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, CLIP_SECONDS, loadScenes, buildFlowPrompt, clipsFor
} from './lib-prompt.mjs';

const OUT = path.join(ROOT, 'prompts-flow');

/* ---------------- OUTPUT ---------------- */

fs.mkdirSync(OUT, { recursive: true });
const scenes = loadScenes();

let allTxt = [];
let csv = ['clip_id,scene,shot,clip_of,seconds,location,prompt'];
let totalClips = 0;

allTxt.push('THE LAST GUARDIAN — FULL PROMPT PACK FOR GOOGLE FLOW / OMNI');
allTxt.push('Paste one block at a time. Each block is sized for one 8-second generation.');
allTxt.push('='.repeat(78));
allTxt.push('');

for (const s of scenes) {
  const lines = [];
  const head = `SCENE ${String(s.scene).padStart(2, '0')} — ${s.title}`;
  lines.push(head);
  lines.push(s.slug + '  |  ' + s.loc + '  |  ' + s.time + '  |  ' + s.weather);
  lines.push('OBJECTIVE: ' + s.objective);
  lines.push('='.repeat(78));
  lines.push('');

  for (const sh of s.shots) {
    const durs = clipsFor(sh);
    const n = durs.length;
    for (let i = 0; i < n; i++) {
      totalClips++;
      const id = n > 1
        ? `S${String(s.scene).padStart(2, '0')}-${sh.id}-${String.fromCharCode(97 + i)}`
        : `S${String(s.scene).padStart(2, '0')}-${sh.id}`;
      const p = buildFlowPrompt(s, sh, i, n);
      lines.push(`--- ${id}  (${sh.size}, ${durs[i]}s) ---`);
      lines.push(p);
      lines.push('');
      csv.push([id, s.scene, sh.id, `${i + 1}/${n}`, durs[i], s.loc, '"' + p.replace(/"/g, '""') + '"'].join(','));
    }
  }

  const file = `scene-${String(s.scene).padStart(2, '0')}.txt`;
  fs.writeFileSync(path.join(OUT, file), lines.join('\n'));
  allTxt.push(...lines);
}

fs.writeFileSync(path.join(OUT, 'ALL-PROMPTS.txt'), allTxt.join('\n'));
fs.writeFileSync(path.join(OUT, 'shots.csv'), csv.join('\n'));

console.log(`Flow pack built: ${scenes.length} scenes, ${scenes.reduce((n, s) => n + s.shots.length, 0)} shots, ${totalClips} clips of ${CLIP_SECONDS}s or less`);
console.log(` -> prompts-flow/scene-01.txt … scene-30.txt`);
console.log(` -> prompts-flow/ALL-PROMPTS.txt`);
console.log(` -> prompts-flow/shots.csv`);
