// One-off board builder for Scene 15 (run from docs/the-last-guardian).
import fs from 'node:fs';

const d = JSON.parse(fs.readFileSync('data/shots-11-20.json', 'utf8'));
const s = d.scenes.find(x => x.scene === 15);
const INHERIT = { '15B': 'S01-1D', '15C': 'S01-1E', '15D': 'S01-1J' };
const L = [];

L.push('# SCENE 15 — NINETY SECONDS (MIDPOINT)');
L.push('## Shooting board · keyframe plates');
L.push('');
L.push(`**${s.slug}** · Act ${s.act} · \`${s.loc}\` · ${s.time} · ${s.weather}`);
L.push('');
L.push('> **SCENE OBJECTIVE:** ' + s.objective);
L.push('> **OUTCOME:** He sees it. The hand on the lever is his own.');
L.push('> **VALUE SHIFT:** Grief (−) → Guilt (−−). The film turns here.');
L.push('');
L.push('---');
L.push('');
L.push('## ⚠️ THE FRAME-MATCH CONTRACT');
L.push('');
L.push('`15B`, `15C` and `15D` are **not new photography**. They are the Scene 1 plates run through the helmet-camera degrade — 4:3 image pillarboxed inside the 2.39 frame, −60% saturation, scan lines, exposure pumping, band-limited audio. If a single element drifts, the midpoint reveal dies.');
L.push('');
L.push('| Scene 15 plate | Source | Treatment |');
L.push('|---|---|---|');
L.push('| `15B` | `boards/scene-01/S01-1D.png` | degrade only — frame-for-frame identical |');
L.push('| `15C` | `boards/scene-01/S01-1E.png` | degrade only — frame-for-frame identical |');
L.push('| `15D` | `boards/scene-01/S01-1J.png` | degrade, then **continues past the Scene 1 cut point**: the hand closes, the lever hauls, the containment ring retracts |');
L.push('');
L.push('The degrade is deterministic, not a re-render. Reproduce it from the repo root of this package with:');
L.push('');
L.push('```bash');
L.push('tools/helmet-cam-degrade.sh boards/scene-01/S01-1D.png boards/scene-15/S15-15B.png');
L.push('tools/helmet-cam-degrade.sh boards/scene-01/S01-1E.png boards/scene-15/S15-15C.png');
L.push('```');
L.push('');
L.push('---');
L.push('');
L.push('## THE BOARD');
L.push('');

for (const sh of s.shots) {
  const inh = INHERIT[sh.id] ? `  ·  ⛓ inherited from \`${INHERIT[sh.id]}\`` : '';
  L.push(`### ${sh.id} · ${sh.size} · ${sh.lens} · ${sh.dur}s${inh}`);
  L.push('');
  L.push(`<img src="S15-${sh.id}.png" width="780">`);
  L.push('');
  L.push('| | |');
  L.push('|---|---|');
  L.push(`| **Angle** | ${sh.angle} |`);
  L.push(`| **Movement** | ${sh.move} |`);
  L.push(`| **Action** | ${sh.action} |`);
  L.push(`| **Lighting** | ${sh.light} |`);
  L.push(`| **VFX** | ${sh.vfx} |`);
  L.push(`| **Sound** | ${sh.sound} |`);
  L.push('');
}

L.push('---');
L.push('');
L.push('## Continuity guards for this scene');
L.push('');
L.push('- **2059 footage:** Cadet Arjun has **no** grey streak and is clean-shaven; Dev has **no** crystallisation, both eyes brown, wedding band **on his hand**.');
L.push('- **2071 booth:** the streak is on Arjun\u2019s **RIGHT** temple; Kira is six cornrows in a high knot with **three copper clips on the LEFT** and one brass earring; Meera\u2019s prosthetic is her **LEFT** arm.');
L.push('- **15K** must be the same market, the same light and the same day as `reference/key-art-04-anjari-1411.png` — the shot recurs as 22G and 28L and all three must match exactly.');
L.push('- The Bloom never burns: no fire, no smoke, no debris, no shockwave, in any plate.');
L.push('- **15H** holds eleven seconds with nobody moving. The plate is a lighting state, not an action.');
L.push('');
L.push('[← all boards](../README.md) · [Scene 1 board](../scene-01/README.md) · [prompt sheet](../../prompts-scene/scene-15.md)');
L.push('');

fs.writeFileSync('boards/scene-15/README.md', L.join('\n'));
console.log('Scene 15 board written:', s.shots.length, 'plates');
