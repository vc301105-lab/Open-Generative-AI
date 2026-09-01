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
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUT = path.join(ROOT, 'prompts-flow');

const CLIP_SECONDS = 8; // Veo / Flow generation window

/* ---------------- COMPACT CHARACTER CARDS ---------------- */
// Short enough to sit inside every prompt without drowning it.

const CARD = {
  arjun: "Arjun (32, South Indian man, lean swimmer's build, deep brown skin, black mid-length hair pushed back with a grey streak at the RIGHT temple, heavy stubble, faint silver branching scars along both forearms)",
  cadetArjun: "Cadet Arjun (20, same face as Arjun but younger, CLEAN-SHAVEN, NO grey streak, short neat black hair, charcoal cadet suit with a brass half-plate on the LEFT shoulder only)",
  kira: "Kira (17, mixed Nigerian-Indian girl, wiry, dark brown skin, SIX cornrows in a high knot with THREE copper clips on the left, one brass earring, grey cloth wraps on both forearms)",
  dev: "Dev (58, South Indian man, tall and broad, grey beard, iron-grey hair swept back, LEFT eye brown and RIGHT eye crystalline white-blue, translucent crystal spreading from his left jaw down his neck, long plain charcoal coat, cracked bronze gorget, wedding band on a chain, barefoot)",
  devCommander: "Dev in 2059 (46, tall broad South Indian man, grey beard, BOTH eyes human brown, NO crystal anywhere, brass-bronze cuirass, bronze gorget, heavy oxblood cloak, wedding band ON HIS HAND)",
  devRecording: "a shoulders-up projection of Dev (grey beard, one crystalline white-blue right eye) whose edges dissolve into drifting light-grain",
  arjunRecording: "a shoulders-up projection of Arjun (grey temple streak, stubble, rain on his shoulders) whose edges dissolve into drifting light-grain",
  riya: "Riya (34, Bengali-Indian woman, athletic, storm-grey military command coat with oxblood shoulder piping, black hair)",
  meera: "Meera (61, small Bengali woman, cropped grey-white hair, glasses on a beaded chain, her LEFT arm a brass mechanical prosthetic, indigo kurta and canvas apron)",
  sera: "Sera (29, pale Anglo-Indian woman, BOTH eyes mirrored chrome with no iris, platinum crown braid, no eyebrows, seamless bone-white lacquer armour with mirror-polished gauntlets)",
  ose: "Minister Ose (55, silver-black chignon, ivory high-collar coat, jade ring)",
  bhaskar: "Bhaskar (44, bald South Indian man, thick grey moustache, gold tooth, tattooed forearms, oily work vest)",
  amara: "Amara (33, tall Nigerian woman, close-cropped hair, field-medic kit, a RED THREAD bracelet on her wrist, laughing)",
  ila: "Ila (15, slight South Indian girl, long plait, school satchel)",
  hollow: "the Hollow (figures in bone-white hooded lacquer coats and smooth half-masks covering only nose to chin so their calm eyes stay bare — they only ever WALK, never run)",
  kiraAbsent: ""
};

const LOC = {
  'LOC-01': "a 60m-wide industrial containment shaft 200m deep, brass containment rings, crystal growing through cracked concrete, four levels of catwalk, amber work lamps and spinning red alarm gyros",
  'LOC-02': "a drowned transit hall 18m underwater, 40m vaulted ceiling, cast-iron columns, silt, one vertical green god-ray from a broken skylight",
  'LOC-03': "the Stiltway — nine towers of stacked shipping containers and bamboo scaffold linked by rope walkways, saffron and teal tarpaulins, LED string lights, grey monsoon water below",
  'LOC-04': "Ward 12, a clinic of three welded shipping containers: a dental chair, pegboard walls of brass instruments, a wall of ten thousand index cards, a fishless aquarium glowing green",
  'LOC-05': "the Anjari Salt Flats — 90km of cracked white salt, ghost-foundations of vanished buildings, a leaning melted pylon, flat white sky, absolutely no wind and nothing moving",
  'LOC-06': "the Bastion Spire — a brutalist grey concrete tower, low corridors, oxblood floor stripe, cyan fluorescents, rain on every window",
  'LOC-07': "the Tidewall — a 40m concrete sea-wall with rusted steel teeth, sluice gates, sodium searchlights, heavy swell",
  'LOC-08': "the Ark — a drilling rig re-clad in seamless bone-white lacquer, 30m ceilings, nothing on any wall, a 40m circular pool of black water, even sourceless shadowless white light",
  'LOC-09': "the Cradle Loom — a 200m crystal geode lined floor to ceiling with standing filament like a giant harp, a brass ring platform at the centre, the walls themselves glowing white-blue",
  'LOC-10': "a corrugated rooftop kite-field high above the Stiltway: a red water-tank, antenna masts, laundry lines, pigeon coops"
};

const STYLE = "Photoreal live-action cinema, 2.39:1 anamorphic widescreen, fine 35mm grain, naturalistic skin, practical lighting, no CGI gloss.";
const AVOID = "Avoid: on-screen text, subtitles, watermarks, HUD or UI graphics, comic-book styling, capes, masks on the hero, glossy 3D-render look, extra fingers, changing hairstyles.";

function loc(code) {
  return String(code).split(/[+/]/).map(s => s.trim()).map(c => LOC[c] || c).join(', intercut with ');
}

function loadScenes() {
  const files = fs.readdirSync(DATA).filter(f => /^shots-.*\.json$/.test(f)).sort();
  const scenes = [];
  for (const f of files) scenes.push(...JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')).scenes);
  return scenes.sort((a, b) => a.scene - b.scene);
}

/* ---------------- PROMPT BUILDER ---------------- */

function cameraLine(sh) {
  const move = /static|locked/i.test(sh.move) ? `locked-off, no camera movement` : sh.move;
  return `${sh.size}, ${sh.angle}, ${sh.lens}, ${move}.`;
}

function beatHint(i, n) {
  if (n === 1) return '';
  const where = i === 0
    ? 'Begin the described action; end the clip mid-movement, not on a settle.'
    : (i === n - 1
        ? 'Complete the described action and settle on the final beat.'
        : 'Continue the described action already in progress; neither begin nor resolve it.');
  return ` (Continuous shot, part ${i + 1} of ${n}. ${where} Use the final frame of part ${i} as the starting reference so the move is unbroken.)`;
}

function buildFlowPrompt(scene, sh, clipIndex, clipCount) {
  const who = (sh.chars || []).filter(Boolean).map(c => CARD[c]).filter(Boolean);
  const subject = who.length ? ` ${who.join('. ')}.` : '';
  const beat = beatHint(clipIndex, clipCount);
  return [
    cameraLine(sh),
    `${sh.action}.${subject}`,
    `Setting: ${loc(scene.loc)}. ${scene.time}, ${scene.weather}.`,
    `Light: ${sh.light}.`,
    sh.vfx && !/^none/i.test(sh.vfx) ? `Effect: ${sh.vfx.replace(/^HERO VFX — /, '')}.` : '',
    `Audio: ${sh.sound}.`,
    STYLE,
    AVOID + beat
  ].filter(Boolean).join(' ');
}

// Split a shot into clips of <= CLIP_SECONDS, distributed EVENLY so we never
// emit a stranded 1-second tail. A 9s shot becomes 5s + 4s, not 8s + 1s.
function clipsFor(sh) {
  const d = sh.dur || 8;
  const n = Math.max(1, Math.ceil(d / CLIP_SECONDS));
  const base = Math.floor(d / n);
  const extra = d - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
}

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
