# THE LAST GUARDIAN — HOW TO GENERATE THE FILM
### Document 11 of 11 · Paste-ready prompt pack for Google Flow / Veo and Omni

---

## WHAT YOU'VE GOT

| Folder / file | What it is | Use it for |
|---|---|---|
| **`prompts-flow/scene-01.txt` … `scene-30.txt`** | One text file per scene, every clip as a clean copy-paste block | **This is the one you want.** Open a scene, copy a block, paste into Flow, generate |
| `prompts-flow/ALL-PROMPTS.txt` | All 440 clips in one file | Bulk work, search, printing |
| `prompts-flow/shots.csv` | Spreadsheet: `clip_id, scene, shot, clip_of, seconds, location, prompt` | Batch tools, progress tracking, Omni/API automation |
| `reference/` | 29 approved character, costume and location stills | **Image references — upload these into Flow's "Ingredients"** |
| `boards/scene-01/` | 10 approved keyframe plates | First-frame references for Scene 1 |
| `09-veo-prompts.md` | The long-form archival version (full identity blocks) | When a shot drifts and you need the strict spec |

**440 clips · 2,594 seconds of generated footage · average prompt 1,143 characters.**

Every shot longer than 8 seconds is already split into evenly-sized parts (a 9-second shot becomes 5s + 4s, never 8s + 1s), and each part carries a beat instruction telling the model whether to *begin*, *continue* or *resolve* the movement.

---

## GOOGLE FLOW — STEP BY STEP

### 1. Set up the project once
- New project → name it **The Last Guardian**.
- Aspect ratio: **16:9** (Flow's widest). Crop to 2.39:1 in your editor afterwards — do not try to fake letterboxing in the prompt, the model will render black bars as image content.
- Model: **Veo 3** (or latest) with **audio on**. Every prompt has an `Audio:` line written for it.

### 2. Load your characters as Ingredients
Flow's **"Frames to Video" / "Ingredients to Video"** mode is what keeps faces consistent. Upload from `reference/`:

| Upload | For |
|---|---|
| `char-01-arjun-vedh.png` | every 2071 Arjun shot |
| `char-07-cadet-arjun-2059.png` | every 2059 Arjun shot — **different ingredient, do not mix** |
| `char-02-kira-okonkwo.png` | Kira, Acts I–II |
| `costume-02-kira-tether-mantle.png` | Kira, Act III |
| `char-03-dev-aranya.png` | Dev, Sc. 17–25 |
| `char-13-dev-stage-4.png` | Dev, Sc. 27–29 |
| `char-08-dev-aranya-2059.png` | Dev, Sc. 1 and 15 |
| `char-04` / `05` / `06` / `10` / `12` | Riya, Sera, Meera, the Hollow, Bhaskar |
| `costume-01-arjun-bastion-mantle.png` | Arjun, Sc. 23–29 |
| `loc-*.png` | drop the matching location plate in alongside the character |

### 3. Generate
1. Open `prompts-flow/scene-01.txt`.
2. Copy one `--- S01-1A ---` block (everything under the header, not the header).
3. Paste into Flow. Attach the right ingredients for that clip.
4. Generate **3 takes**. Pick one.
5. For a multi-part clip (`-a`, `-b`, `-c`), use **"Extend"** or feed the last frame of part *a* as the first frame of part *b*.
6. Tick it off in `shots.csv`.

### 4. Order of work
Do **not** start at Scene 2. Follow this:

```
Scene 1   (10 clips)  ← do this first, it is the source of truth
Scene 15  (14 clips)  ← reuses Sc. 1's 1D, 1E, 1J footage. Only 15D continues past the cut
Scene 2 → 14, then 16 → 30, in script order
```

Scenes 1 and 15 are the same photography. If they drift, the midpoint reveal collapses and the third act stops working. Get them right before you generate anything else.

---

## OMNI / API — BATCH

`prompts-flow/shots.csv` is built for this. Columns:

```
clip_id, scene, shot, clip_of, seconds, location, prompt
```

Minimal batch loop:

```bash
# example shape — adapt to your provider's client
while IFS=, read -r id scene shot clipof secs loc prompt; do
  [ "$id" = "clip_id" ] && continue
  your-cli generate \
    --prompt "$prompt" \
    --duration "$secs" \
    --aspect 16:9 \
    --out "renders/${id}.mp4"
done < prompts-flow/shots.csv
```

For image-conditioned runs, map the character in `shot` to its file in `reference/` and pass it as the conditioning image. The mapping is in Document 08's costume state matrix.

---

## THE FIVE THINGS THAT WILL GO WRONG

**1. Arjun's grey streak disappears — or shows up in 2059.**
The single most common failure. It is at the **RIGHT temple**, present in every 2071 shot, absent in every 2059 shot. Reject and re-render; do not accept it.

**2. Kira grows or loses braids.**
Exactly **six** cornrows, **three** copper clips, always on the **left**. Models drift to five or seven. Check every clip.

**3. The Bloom comes out as an explosion.**
It is not fire. It is a slow, silent, glassy white expansion that makes things go white and stop. If you see flame, smoke, debris or a shockwave, regenerate. Same for the Concord launch (27K) and the ground (29G).

**4. The Hollow run, or get full-face masks.**
They only ever **walk**. Their masks cover nose to chin only — eyes and brows bare. Faceless masked figures turn them into generic goons and kill the idea that they are volunteers.

**5. Everything looks too clean.**
The Stiltway is filthy, wet and colourful. The Ark and the Salt Flats are the only clean places in the film, and their cleanliness is the horror. If Scene 3 looks as tidy as Scene 22, the film's central visual argument is gone.

---

## QC — RUN THIS ON EVERY CLIP BEFORE YOU KEEP IT

```
[ ] Grey streak: present (2071) / absent (2059)
[ ] Kira: six braids, three clips, left side
[ ] Dev: right eye crystalline, correct crystallisation stage, cracked gorget
[ ] Riya: bun before Sc.14, braid after; insignia torn off from Sc.21
[ ] Meera: LEFT arm prosthetic; shoulder bandage from Sc.9 on
[ ] Sera: both eyes chrome; gauntlet cracked from Sc.9; chest cracked from Sc.26
[ ] Costume state matches the matrix (Doc 08 A.3)
[ ] Wounds only ever accumulate, never reset
[ ] Bastion = cyan hexagons, casts a real shadow, never moves
[ ] Tether = gold lines with visible sag, max six
[ ] Sky: nothing clear before Sc.29M
[ ] No burned-in text, subtitles, UI or watermark
```

Log every reject in `data/qc-log.csv`. **Re-render, never grade around it.**

---

## AFTER GENERATION

1. **Assemble in script order** — the escalation is built on adjacency.
2. **Conform the ten cuts** in Document 10, Part B.3. They are the film.
3. **Do not trust the model's audio.** Use it as temp only. The 38 Hz spine, the bastion chime and — most importantly — the *silences* have to be built properly in a sound edit. Roughly eleven minutes of this film has no music and near-zero ambience, and that is the most expensive thing in it.
4. **Crop to 2.39:1** and grade to the seven-LUT structure in Document 10, Part B.5.

---

## REBUILDING THE PACK

```bash
cd docs/the-last-guardian
node tools/build-flow-pack.mjs    # → prompts-flow/
node tools/build-prompts.mjs      # → 06-shot-list.md, 09-veo-prompts.md, veo-prompts.jsonl
```

Edit the JSON in `data/`, or the character cards at the top of `tools/build-flow-pack.mjs`. Never hand-edit the generated files — they get overwritten.
