// THE LAST GUARDIAN — production package generator
// Builds: 06-shot-list.md and 09-veo-prompts.md from data/shots-*.json
// Usage: node tools/build-prompts.mjs   (run from docs/the-last-guardian)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

/* ------------------------------------------------------------------ */
/*  LOCKED IDENTITY BLOCKS — the continuity spine of every prompt      */
/* ------------------------------------------------------------------ */

const CHARACTERS = {
  arjun: "ARJUN VEDH, 32, South Indian man, 183cm lean-muscular swimmer's build, warm deep-brown weathered skin, dark brown eyes, thick black mid-length hair pushed back with a distinct three-finger-wide GREY STREAK at the right temple, permanent 8-10 day stubble, a nick through the right eyebrow, fine silver-grey dendritic Threadwork scarring running from the base of his skull down the spine and along the outside of both forearms to mid-palm, a brass anchor-stone on a braided cord at his right hip, a waterlogged leather notebook in a chest pouch, a worn steel thumb-ring on the left hand",
  cadetArjun: "CADET ARJUN VEDH, 20, same face as Arjun but younger, clean-shaven, NO grey streak in the hair, hair shorter and neater, Threadwork scarring thinner and fainter, squarer posture, charcoal Corps cadet undersuit with a brushed brass-bronze half-plate over chest and left shoulder stamped with a hexagon that has one open side",
  kira: "KIRA OKONKWO, 17, mixed Nigerian-Kaveri girl, 168cm wiry and coiled, rich dark brown skin, dark amber-brown eyes, dense black 4C hair in EXACTLY SIX thick cornrows swept back into a high knot with THREE copper kite-clips on the left side, one brass earring in the left ear, a small keloid scar on the right jawline, grey cloth wraps on both forearms, rope-burn callouses across both palms, a carved wooden kite spool on her belt clip",
  dev: "DEV ARANYA, 58, Kaveri man, 188cm broad and heavy-shouldered with upright military carriage, deep brown skin, iron-grey hair shaved close at the sides and swept back on top, full close-cropped grey beard, LEFT eye human dark brown and RIGHT eye fully crystalline white-blue with no pupil, translucent crystalline tissue with slow-moving light beneath it growing from his left jaw down his neck, a floor-length plain charcoal coat over bone-grey lattice weave, a CRACKED Corps commander's gorget at his throat, a gold wedding band on a steel chain worn outside the coat, bare feet",
  devCommander: "DEV ARANYA, 46, Kaveri man, 188cm broad, deep brown skin, darker grey hair, close-cropped beard, BOTH eyes human dark brown and NO crystallisation anywhere, full Corps Loom commander regalia: charcoal lattice weave, full brass-bronze cuirass with an open-sided hexagon in relief, an intact commander's gorget, a heavy oxblood cloak, a gold wedding band ON HIS HAND",
  devRecording: "DEV ARANYA as a recorded volumetric projection: shoulders-up only, grey beard, broad shoulders, one crystalline white-blue right eye, edges of the projection dissolving into drifting light-grain",
  arjunRecording: "ARJUN VEDH as a recorded volumetric projection: shoulders-up only, grey temple streak, stubble, rain on his shoulders, a Bastion mantle collar visible, edges dissolving into drifting light-grain",
  riya: "COMMANDER RIYA SEN, 34, Bengali-Kaveri woman, 173cm athletic with parade-ground posture, medium warm brown skin, dark brown eyes, straight black hair, a thin scar under the right jaw, a Nullpin burn scar on the inside of the right wrist, a storm-grey Coastal Authority command coat with oxblood shoulder piping, an analogue field watch worn face-inward",
  meera: "DR. MEERA SANYAL, 61, Bengali woman, 160cm small and round-shouldered, light warm brown skin, cropped grey-white hair tucked behind the ears, reading glasses on a beaded chain, her LEFT ARM amputated above the elbow and replaced by a brass-and-lattice prosthetic with visible filament channels that glow faintly amber, a faded indigo kurta under a canvas apron with twenty pockets and a burnt-sleeved cardigan",
  sera: "SERA VANCE / ECHO-ONE, 29, Anglo-Indian woman, 178cm long-limbed with a dancer's line, pale olive bloodless skin, BOTH EYES FULLY MIRRORED chrome with no visible iris, platinum-white hair in a tight crown braid shaved at the nape, no eyebrows, a hairline crystalline seam from the left temple to the corner of the mouth, bone-white lacquered plate armour over grey weave with articulated mirror-plate gauntlets and shin plates, a resonance blade horizontally at the small of her back",
  ose: "MINISTER TALIA OSE, 55, silver-black hair in a chignon, ivory high-collar coat, a jade signet ring, immaculate and still",
  bhaskar: "BHASKAR 'BASH' RELE, 44, bald with a thick grey moustache and a gold tooth, tattooed forearms, an oil-stained work vest",
  amara: "AMARA OKONKWO, 33, tall Nigerian woman, dark brown skin, close-cropped hair, a Corps field medic's kit, a RED THREAD BRACELET on her wrist, warm and laughing",
  ila: "ILA VEDH, 15, slight South Indian girl with a long plait and a school satchel",
  hollow: "THE HOLLOW: figures in bone-white hooded lacquer coats over grey weave, smooth featureless half-masks covering nose to chin only with calm eyes always visible, soft-soled boots, absolutely silent, always WALKING and never running",
  kiraAbsent: ""
};

const LOCATIONS = {
  'LOC-01': "the CRADLE CORE containment shaft, 2059: a 60m-wide cylindrical industrial shaft 200m deep, concentric brass containment rings on hydraulic arms, crystal filament growing through cracked concrete like frost, catwalks at four levels, amber sodium work lamps, spinning red alarm gyros, venting steam",
  'LOC-02': "the DROWNED CATHEDRAL: a submerged 1940s-style transit hall 18m underwater, 40m barrel-vaulted ceiling, cast-iron columns, a collapsed departure board frozen at 14:12, an open-sided hexagon inlaid in the terrazzo floor, silt-drifted benches, a single vertical green god-ray through a broken skylight, 8m visibility",
  'LOC-03': "THE STILTWAY: nine 14-22 storey stilt-towers built from stacked shipping containers, bamboo scaffold and corrugated steel, linked by forty rope-and-plank walkways, tarpaulin awnings in faded saffron teal and oxblood, LED string lights, marigold garlands, grey monsoon water 11m below",
  'LOC-04': "WARD 12, Meera's clinic: three shipping containers welded into an L, a repurposed dental chair, pegboard walls of brass instruments, a wall of ten thousand index cards, a fishless aquarium used as a coolant tank glowing green, a curtain of x-ray film, rain drumming on a steel roof",
  'LOC-05': "the ANJARI SALT FLATS: ninety kilometres of bleached cracked white salt plain, ghost-foundations of vanished buildings visible as low rectangles, a leaning half-melted transmission pylon on the horizon, bleached car shells, flat white overcast sky three stops brighter than everything else, ABSOLUTELY NO WIND, no rain, no birds, no movement of any kind",
  'LOC-06': "the BASTION SPIRE: a 300m brutalist storm-tower of board-formed grey concrete with oxblood stencilled numerals, low-ceilinged corridors with an oxblood floor stripe, cyan institutional fluorescents, rain on every window",
  'LOC-07': "the TIDEWALL: a 40m concrete sea-wall with rusted steel teeth running 60km, sluice gates every 400m, a barnacle line at 12m, sweeping sodium searchlights, heavy swell, driving rain",
  'LOC-08': "the ARK: a converted deep-sea drilling rig 240m across standing on four legs 80m above the sea, re-clad in seamless bone-white lacquer with no fasteners, labels or wear visible anywhere, a cathedral-like Assembly Hall with 30m ceilings and nothing on any wall, a 40m circular Moon Pool of black water at the centre, 144 white transmission spines on the upper deck, even sourceless shadowless white light",
  'LOC-09': "the CRADLE LOOM: a 200m spherical natural geode cavity lined entirely in standing crystal filament like the strings of a stadium-sized harp, a brass-and-crystal ring platform 30m across suspended at the centre, reached by a single catwalk, the walls themselves emissive cool white-blue",
  'LOC-10': "the KITE-FIELD on Tower Six roof: a 30x20m corrugated steel roof deck with a red water-tank, a forest of antenna masts, drying laundry lines, pigeon coops and a painted hopscotch grid, high above the Stiltway"
};

// Location codes can be compound, e.g. "LOC-06 + LOC-01"
function describeLocation(code) {
  return String(code)
    .split(/[+/]/)
    .map(s => s.trim())
    .map(c => LOCATIONS[c] || c)
    .join('; intercut with ');
}

const FILM_GRAMMAR =
  "Shot on large-format digital with detuned vintage anamorphic glass, 2.39:1 widescreen, fine 35mm-style grain, photoreal live-action cinematography, naturalistic skin texture, practical motivated lighting, no CGI sheen, no digital-looking gloss. Horizontal blue anamorphic flares are permitted ONLY from Cradle-derived light sources.";

const NEGATIVE =
  "no text, no watermark, no logos, no subtitles, no on-screen UI, no HUD graphics, no comic-book styling, no cape, no mask on the hero, no existing superhero costumes or insignia, no anime, no illustration, no 3D-render look, no plastic skin, no extra fingers, no distorted faces, no duplicated characters, no changing hairstyles, no changing scars, no lens dirt overlays, no on-screen date stamps, no slow-motion unless specified, no crowd of identical faces";

const ACT_GRAMMAR = {
  'I': "ACT I GRAMMAR: 32-50mm, handheld, shoulder-level, close and breathing — the camera is hiding with him.",
  'II-A': "ACT II-A GRAMMAR: 25-40mm, locked-off tripod, wide and symmetrical — the camera has stopped hiding.",
  'II-B': "ACT II-B GRAMMAR: 75-135mm, compressed and shallow — everyone is isolated in their own frame.",
  'III': "ACT III GRAMMAR: 21-40mm handheld on a stabilised head — wide, close, chaotic and large-scale."
};

/* ------------------------------------------------------------------ */
/*  LOAD                                                               */
/* ------------------------------------------------------------------ */

function loadScenes() {
  const files = fs.readdirSync(DATA).filter(f => /^shots-.*\.json$/.test(f)).sort();
  const scenes = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
    scenes.push(...j.scenes);
  }
  return scenes.sort((a, b) => a.scene - b.scene);
}

/* ------------------------------------------------------------------ */
/*  BUILDERS                                                           */
/* ------------------------------------------------------------------ */

function buildShotList(scenes) {
  const out = [];
  out.push('# THE LAST GUARDIAN — MASTER SHOT LIST');
  out.push('### Document 06 of 10 · Shot list · Camera angles · Lens · Movement · Lighting · Environment · VFX · Sound');
  out.push('');
  out.push('> **AUTO-GENERATED** from `data/shots-*.json` by `tools/build-prompts.mjs`. Edit the JSON, not this file.');
  out.push('');

  const totalShots = scenes.reduce((n, s) => n + s.shots.length, 0);
  const totalDur = scenes.reduce((n, s) => n + s.shots.reduce((m, sh) => m + (sh.dur || 0), 0), 0);
  out.push(`**Scenes:** ${scenes.length} · **Shots:** ${totalShots} · **Estimated cut runtime from shot durations:** ${Math.floor(totalDur / 60)}m ${totalDur % 60}s (before trims and score-driven holds)`);
  out.push('');
  out.push('---');
  out.push('');

  // Summary table
  out.push('## SCENE SUMMARY');
  out.push('');
  out.push('| # | Scene | Act | Location | Time | Weather | Shots | Est. |');
  out.push('|---|---|---|---|---|---|---|---|');
  for (const s of scenes) {
    const d = s.shots.reduce((m, sh) => m + (sh.dur || 0), 0);
    out.push(`| ${s.scene} | ${s.title} | ${s.act} | ${s.loc} | ${s.time} | ${s.weather} | ${s.shots.length} | ${d}s |`);
  }
  out.push('');
  out.push('---');
  out.push('');

  for (const s of scenes) {
    out.push(`## SCENE ${s.scene} — ${s.title}`);
    out.push(`**${s.slug}** · Act ${s.act} · \`${s.loc}\` · ${s.time} · ${s.weather}`);
    out.push('');
    out.push(`> **SCENE OBJECTIVE:** ${s.objective}`);
    out.push('');
    out.push('| Shot | Size | Angle | Lens | Movement | Subject | Action | Lighting | VFX | Sound | Sec |');
    out.push('|---|---|---|---|---|---|---|---|---|---|---|');
    for (const sh of s.shots) {
      const subj = (sh.chars || []).filter(Boolean).map(c => shortName(c)).join(', ') || '—';
      out.push(`| **${sh.id}** | ${sh.size} | ${sh.angle} | ${sh.lens} | ${sh.move} | ${subj} | ${esc(sh.action)} | ${esc(sh.light)} | ${esc(sh.vfx)} | ${esc(sh.sound)} | ${sh.dur} |`);
    }
    out.push('');
  }
  return out.join('\n');
}

function shortName(key) {
  const m = {
    arjun: 'Arjun', cadetArjun: 'Cadet Arjun (2059)', kira: 'Kira', dev: 'Dev/The Hollow',
    devCommander: 'Dev (2059)', devRecording: 'Dev (recording)', arjunRecording: 'Arjun (recording)',
    riya: 'Riya', meera: 'Meera', sera: 'Sera', ose: 'Ose', bhaskar: 'Bhaskar',
    amara: 'Amara', ila: 'Ila', hollow: 'The Hollow', kiraAbsent: ''
  };
  return m[key] || key;
}

function esc(s) { return String(s || '—').replace(/\|/g, '\\|'); }

function buildVeoPrompt(scene, sh) {
  const chars = (sh.chars || []).filter(Boolean).map(c => CHARACTERS[c]).filter(Boolean);
  const subject = chars.length
    ? `SUBJECT (identity locked, must match exactly): ${chars.join(' | ')}.`
    : `SUBJECT: environment / object only — no principal cast in frame.`;

  return [
    `${sh.size}, ${sh.angle}. ${sh.move}. ${sh.lens} anamorphic.`,
    `ACTION: ${sh.action}.`,
    subject,
    `LOCATION (locked): ${describeLocation(scene.loc)}. Time: ${scene.time}. Weather/atmosphere: ${scene.weather}.`,
    `LIGHTING: ${sh.light}.`,
    `VFX: ${sh.vfx}.`,
    `AUDIO INTENT (for reference; generate picture to match): ${sh.sound}.`,
    ACT_GRAMMAR[scene.act] || '',
    FILM_GRAMMAR,
    `Duration ${sh.dur}s.`,
    `NEGATIVE: ${NEGATIVE}.`
  ].filter(Boolean).join(' ');
}

function buildVeoDoc(scenes) {
  const out = [];
  out.push('# THE LAST GUARDIAN — VEO-READY VIDEO PROMPTS');
  out.push('### Document 09 of 10 · One prompt per shot · Continuity-locked');
  out.push('');
  out.push('> **AUTO-GENERATED** from `data/shots-*.json` by `tools/build-prompts.mjs`.');
  out.push('> Every prompt embeds the LOCKED IDENTITY BLOCK for each character in frame and the LOCKED LOCATION SHEET, so any shot can be regenerated in isolation without drifting.');
  out.push('');
  out.push('**How to use**');
  out.push('1. Generate character reference stills first (Document 10) and keep them as image conditioning / first-frame references wherever the tool supports it.');
  out.push('2. Generate shots in scene order. For continuity, use the last frame of the previous shot as the first-frame reference when two shots are continuous in time and space.');
  out.push('3. Never edit a character description inside a prompt. If a look must change (damage, wetness, wound state), add it to the ACTION line only and log it in Document 08.');
  out.push('4. Re-render, do not "fix in grade", any shot where hair count, scar map, costume state or the grey temple streak deviates.');
  out.push('');
  out.push('---');
  out.push('');

  for (const s of scenes) {
    out.push(`## SCENE ${s.scene} — ${s.title}`);
    out.push(`\`${s.loc}\` · ${s.time} · ${s.weather} · Act ${s.act}`);
    out.push('');
    for (const sh of s.shots) {
      out.push(`### Shot ${sh.id} — ${sh.size} · ${sh.dur}s`);
      out.push('```text');
      out.push(buildVeoPrompt(s, sh));
      out.push('```');
      out.push('');
    }
    out.push('---');
    out.push('');
  }
  return out.join('\n');
}

function buildJsonl(scenes) {
  const lines = [];
  for (const s of scenes) {
    for (const sh of s.shots) {
      lines.push(JSON.stringify({
        shot_id: `S${String(s.scene).padStart(2, '0')}-${sh.id}`,
        scene: s.scene,
        scene_title: s.title,
        act: s.act,
        location: s.loc,
        duration_seconds: sh.dur,
        aspect_ratio: '2.39:1',
        prompt: buildVeoPrompt(s, sh),
        negative_prompt: NEGATIVE
      }));
    }
  }
  return lines.join('\n') + '\n';
}

/* ------------------------------------------------------------------ */

const scenes = loadScenes();
fs.writeFileSync(path.join(ROOT, '06-shot-list.md'), buildShotList(scenes));
fs.writeFileSync(path.join(ROOT, '09-veo-prompts.md'), buildVeoDoc(scenes));
fs.writeFileSync(path.join(ROOT, 'data', 'veo-prompts.jsonl'), buildJsonl(scenes));

const totalShots = scenes.reduce((n, s) => n + s.shots.length, 0);
console.log(`Built ${scenes.length} scenes / ${totalShots} shots`);
console.log(' -> 06-shot-list.md');
console.log(' -> 09-veo-prompts.md');
console.log(' -> data/veo-prompts.jsonl');
