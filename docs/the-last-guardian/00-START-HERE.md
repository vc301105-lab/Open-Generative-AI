# START HERE — how to actually make this film

### Document 00 · The step-by-step. Read this before anything else.

You have a complete pre-production package: story, script, 306 shots, 440 clip prompts, 60 still prompts, 29 approved reference images and 22 approved keyframe plates. This page tells you, in order, what to click and what to do with what comes out.

**Hinglish quick version is at the bottom of this page.**

---

## WHAT YOU NEED

| Thing | Why | Alternatives |
|---|---|---|
| **Google Flow** (Veo 3 or later, audio on) | every video clip | Runway, Kling, Luma, Sora — the prompts are plain language, they work anywhere |
| **Omni** (or any image model) | the still frames that lock faces and rooms | Midjourney, Imagen, Flux, Ideogram |
| **An editor** — DaVinci Resolve (free) or CapCut | assembling clips, crop to 2.39:1, colour, sound | Premiere, Final Cut |
| **A folder on your disk** | ~440 video files | — |

Nothing else. No 3D, no compositing software required for a first cut.

---

## THE ONE RULE

> **Never generate a shot from text alone once a picture of it exists.**

Text prompts drift: the face changes, the room changes, the hair changes. Images do not drift. So the whole workflow is: **make a picture first, then make the video from that picture.**

That is why the package is built in this order:

```
reference/  (29 stills — who and where, locked)
      ↓  attach as Ingredients / reference input
boards/     (keyframe plates — what each shot looks like)
      ↓  use as the FIRST FRAME of the generation
prompts-scene/ or prompts-flow/   (the motion + audio)
      ↓
your renders/ folder
      ↓
edit → colour → sound → export
```

---

## PHASE 0 · SET UP (30 minutes, once)

1. **Make the folder structure** on your disk:

```
The Last Guardian/
  01_stills/         ← the images you generate in Omni
  02_clips/          ← the videos you generate in Flow
  03_selects/        ← the approved take of each clip
  04_project/        ← your Resolve / CapCut project
  05_export/
```

2. **Flow project settings** — new project, name it *The Last Guardian*.
   - Aspect ratio **16:9** (Flow's widest). You crop to 2.39:1 in the edit. **Do not** ask the model for letterboxing — it will paint black bars into the picture.
   - Model **Veo 3** or later, **audio ON**. Every prompt already carries an `Audio:` line.
3. **Upload your Ingredients** — in Flow, add the files from `reference/` as image ingredients. At minimum: `char-01` (Arjun), `char-02` (Kira), `char-03` (Dev), and the location still for the scene you are shooting. Full mapping table: [Document 11](11-how-to-generate.md).
4. **Naming rule.** Every file you save is named after its clip id and nothing else:
   `S06-6H-a_v1.mp4`, `S06-6H-a_v2.mp4`, then the approved one copied into `03_selects/` as `S06-6H-a.mp4`. If you break this rule you will lose the film in your own downloads folder.

---

## PHASE 1 · THE ANIMATIC (120 generations — do this before anything else)

Do **not** start generating 440 finished clips. Build a rough version of the whole film first, so you find out what does not work while it is still cheap.

For each scene, open its sheet — `prompts-scene/scene-01.md` — and do only the first four blocks:

| Block | Action |
|---|---|
| ① Establishing still | paste into Omni → save as `01_stills/S06-establishing.png` |
| ② Hero still | paste into Omni → save as `01_stills/S06-hero.png` |
| ③ Whole scene in one 8s clip | paste into Flow, attach ① → save as `02_clips/S06-scene.mp4` |
| ④ Hero shot | paste into Flow, use ② as the first frame → `02_clips/S06-hero.mp4` |

30 scenes × 4 = **120 generations ≈ 8 minutes of film**. Drop them on a timeline in scene order and watch it.

**Now judge it.** Does the story land? Is scene 19 boring? Is the Bloom scary or silly? Fix problems *here* — change the shot data in `data/shots-*.json`, re-run `node tools/build-scene-prompts.mjs`, regenerate two clips. Fixing it later costs fifteen clips per scene.

---

## PHASE 2 · FULL COVERAGE, SCENE BY SCENE

Only after the animatic works. Take one scene at a time — never jump around, continuity dies when you jump around.

For scene N:

1. Open `prompts-scene/scene-NN.md`, go to section **⑤ FULL COVERAGE**.
2. Check the reference list at the top of the sheet — attach exactly those images in Flow.
3. Work down the clips **in the printed order**. For each one:
   - paste the prompt,
   - attach the scene's establishing still (and the character stills for anyone in frame),
   - if the previous clip is a continuation (`part 2/3` etc.), **use the last frame of the previous clip as the first frame of this one**,
   - generate 2–3 takes, pick one, save as `03_selects/SNN-XX.mp4`.
4. Run the per-clip QC (below). Reject and regenerate rather than "fixing it in the grade".
5. When the scene is done, cut it together immediately and watch it once before moving on.

Realistic pace: **one scene per session**. 30 sessions to a finished film.

---

## PHASE 3 · QC — CHECK EVERY CLIP AGAINST THIS

Ten seconds per clip. Reject if any answer is wrong.

- [ ] **Arjun's grey streak** — on his **RIGHT** temple. In 2059 flashbacks it must be **absent**, and he is clean-shaven.
- [ ] **Kira's hair** — exactly **six** cornrows, high knot, **three copper clips on the LEFT**, one brass earring.
- [ ] **Dev** — 2071: left eye brown, **right eye crystalline white-blue**, crystal spreading from the left jaw, barefoot. 2059: no crystal at all, both eyes brown, wedding band **on his hand**.
- [ ] **The Bloom is not an explosion** — slow, silent, glassy, white. No fire, no smoke, no debris, no shockwave, no sparks.
- [ ] **The Hollow only walk.** They never run. Their masks cover **nose to chin only** — eyes always bare.
- [ ] **Nothing is too clean.** The Ark and the Salt Flats are the only clean places in the film, and that is the horror. Everywhere else: rust, damp, salt, wear.
- [ ] No on-screen text, no subtitles, no watermark, no HUD.
- [ ] Hands. Count the fingers.

Log the result in `data/qc-log.csv` — one row per asset: `asset_id,type,scene_ref,status,notes`.
Track your render progress in `data/render-tracker.csv` — it already lists all 440 clips as `TODO`.

---

## PHASE 4 · EDIT

1. New Resolve project, timeline **3840×1608 (2.39:1)**, 24 fps. Drop your 16:9 clips in and scale/crop — you framed for it.
2. Assemble **in scene order** using `06-shot-list.md` for durations. The shot durations in the package are cut lengths, not generation lengths — trim into and out of each clip.
3. Then do the ten cuts that matter — [Document 10, Part B](10-image-prompts-and-edit-plan.md) lists them, including the hard cut to black at the end of Scene 1 followed by **3 full seconds of silence** and three silent title cards. Do not shorten that silence. It is the film's signature.
4. Runtime target: **2h 09m**. The runtime map is in Document 10.

---

## PHASE 5 · SOUND (this is where amateur films die)

Veo's generated audio is a **temp track**. Keep it for reference, then rebuild:

- **The 38 Hz spine** — a sub-bass tone under every Bloom-related moment. One sine wave, automated. It is the sound of the film's dread.
- **The bastion chime** — Arjun's hardlight has one clean bell-like attack, no sci-fi whoosh.
- **~11 minutes of near-silence** — the package is built around held silence (Scene 15's eleven motionless seconds, the Long Walk). Silence only works if the rest of the film has been loud.
- Dialogue: the script is in `05a-` and `05b-`. Record or generate it separately and lip-sync where possible — do not rely on the model's mouths.

Full spec: [Document 07](07-vfx-sound-music.md).

---

## PHASE 6 · COLOUR AND EXPORT

- Three looks, one per act — the LUT notes are in [Document 10, Part B](10-image-prompts-and-edit-plan.md). Act I is grey-green and damp; Act II-A introduces amber; Act III earns gold.
- The Ark scenes are deliberately **bleached and shadowless**. Do not "improve" them.
- Export: H.264/H.265, 2.39:1, 24 fps, stereo + 5.1 if you have it.

---

## WHEN SOMETHING GOES WRONG

| Problem | Fix |
|---|---|
| Face changes between clips | you generated from text alone — go back, attach the character still and the previous clip's last frame |
| The model adds a cape / a mask / a glowing suit | the negative line is already in the prompt; regenerate with a lower "creativity"/higher adherence setting, and attach the costume still |
| The Bloom looks like a nuke | say "no fire, no smoke, no debris, no shockwave" again, and attach `boards/scene-01/S01-1G.png` as the first frame |
| Clip is too short / cuts off mid-move | it is a multi-part shot — check the `part 2/3` note and chain the last frame |
| A shot needs changing | edit `data/shots-*.json`, then re-run the generators. **Never hand-edit the generated prompt files** |
| You want different wording everywhere | edit the cards in `tools/lib-prompt.mjs`, re-run both generators — all 440 prompts update at once |

Regenerate everything:

```bash
cd docs/the-last-guardian
node tools/build-prompts.mjs        # 06-shot-list.md, 09-veo-prompts.md, data/veo-prompts.jsonl
node tools/build-flow-pack.mjs      # prompts-flow/
node tools/build-scene-prompts.mjs  # prompts-scene/, 12-scene-by-scene-prompts.md
```

---

## THE MAP — which file for which job

| I want to… | Open |
|---|---|
| understand the story | [01-story-bible.md](01-story-bible.md) |
| know who someone is | [02-characters.md](02-characters.md) |
| read the script | [05a](05a-screenplay-scenes-01-15.md) · [05b](05b-screenplay-scenes-16-30.md) |
| **shoot a scene** | **`prompts-scene/scene-NN.md`** |
| copy prompts fast, no headings | `prompts-flow/scene-NN.txt` |
| batch / spreadsheet / API | `prompts-flow/shots.csv`, `data/render-tracker.csv` |
| see what a shot should look like | `boards/scene-01/` · `boards/scene-15/` |
| check a continuity detail | [08-continuity-bible.md](08-continuity-bible.md) |
| cut the film | [10-image-prompts-and-edit-plan.md](10-image-prompts-and-edit-plan.md) |
| the long archival prompt for one shot | [09-veo-prompts.md](09-veo-prompts.md) |

---

## हिंग्लिश में — छोटा वर्शन

1. **Setup:** Flow me project banao — 16:9, Veo 3, audio ON. `reference/` ki images Ingredients me daal do. Disk par 5 folders bana lo (stills, clips, selects, project, export).
2. **Rule:** pehle **image** banao, phir usi image se **video**. Sirf text se kabhi mat banao — chehra badal jayega.
3. **Pehle poori film ka animatic:** har scene ki sheet `prompts-scene/scene-NN.md` kholo aur sirf ①②③④ banao. 30 scenes × 4 = 120 clips ≈ 8 min. Ye dekh lo, jo kharab hai wahi abhi theek karo.
4. **Phir ek-ek scene ka full coverage** — sheet ka section ⑤, upar se neeche, order me. Multi-part shot ho to pichle clip ka **last frame** agle clip ka first frame banao.
5. **Har clip check karo:** Arjun ki grey streak RIGHT temple (2059 me nahi), Kira ke 6 cornrows + 3 copper clips LEFT, Dev ki right aankh crystal, Bloom me aag/dhuan bilkul nahi, Hollow kabhi bhagte nahi. Galat lage to dobara banao.
6. **File naming:** `S06-6H-a_v1.mp4` — clip id ke naam se. Warna sab kho jayega.
7. **Edit:** Resolve/CapCut me 2.39:1 timeline, scene order me jodo, Scene 1 ke baad **3 second ki poori silence** mat kaato.
8. **Sound alag se banao** — model ka audio sirf temp hai. 38 Hz sub-bass, bastion chime, aur silence — yahi film ko Hollywood feel deta hai.
9. **Colour:** Act I grey-green, Act II amber, Act III gold. Ark ko clean hi rehne do.
10. Kuch badalna ho to `data/shots-*.json` edit karo aur generator dobara chala do — prompt files kabhi haath se mat badlo.

**Ek scene, ek session. 30 sessions me poori film.**
