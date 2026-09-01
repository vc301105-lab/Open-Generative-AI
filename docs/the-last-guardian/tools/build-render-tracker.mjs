// Builds data/render-tracker.csv — a 440-row TODO list for the generation phase.
// Usage: node tools/build-render-tracker.mjs   (run from docs/the-last-guardian)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadScenes, clipsFor } from './lib-prompt.mjs';

const pad = n => String(n).padStart(2, '0');
const rows = ['clip_id,scene,shot,clip_of,seconds,location,still_used,status,take_file,qc_notes'];

for (const s of loadScenes()) {
  for (const sh of s.shots) {
    const durs = clipsFor(sh);
    durs.forEach((d, i) => {
      const id = durs.length > 1
        ? `S${pad(s.scene)}-${sh.id}-${String.fromCharCode(97 + i)}`
        : `S${pad(s.scene)}-${sh.id}`;
      rows.push([id, s.scene, sh.id, `${i + 1}/${durs.length}`, d, s.loc, '', 'TODO', '', ''].join(','));
    });
  }
}

fs.writeFileSync(path.join(ROOT, 'data', 'render-tracker.csv'), rows.join('\n') + '\n');
console.log(`Render tracker built: ${rows.length - 1} clips, all TODO`);
