# THE LAST GUARDIAN
## Feature-film pre-production package — original IP

<p align="center">
  <img src="reference/key-art-01-the-long-walk.png" width="900" alt="The Last Guardian — key art">
</p>

> **Epic science-fiction superhero action thriller** · 2h 09m · 2.39:1 anamorphic · Dolby Atmos · PG-13 target
> **Original intellectual property.** No character, organisation, power system, artifact or storyline here derives from Marvel, DC, Star Wars or any other existing franchise.

**LOGLINE**
> Twelve years after a catastrophe erased a coastline and every super-powered Guardian but one, a memory-losing salvage diver must train the last child to inherit his power — and stop the mentor he thought he killed from erasing the grief of all humanity, one mind at a time.

---

## The package

| # | Document | Contents |
|---|---|---|
| 01 | [Story Bible](01-story-bible.md) | Logline · complete story · three-act structure · thematic rules |
| 02 | [Character Bible](02-characters.md) | Main characters · relationships · backstories · powers · limitations · villain motivation |
| 03 | [World, Tech & Locations](03-world-tech-locations.md) | World-building · timeline · technology · 10 locked location sheets · usage matrix |
| 04 | [Costume & Visual Language](04-costume-and-visual-language.md) | Costume states for every character · colour palettes · lens & format language |
| 05a | [Screenplay, Scenes 1–15](05a-screenplay-scenes-01-15.md) | Scene objectives · action · dialogue (Act I / Act II-A) |
| 05b | [Screenplay, Scenes 16–30](05b-screenplay-scenes-16-30.md) | Scene objectives · action · dialogue (Act II-B / Act III) |
| 06 | [Master Shot List](06-shot-list.md) | **306 shots** — size, angle, lens, movement, lighting, environment, VFX, sound, duration *(generated)* |
| 07 | [VFX, Sound & Music](07-vfx-sound-music.md) | 8 hero effects · secondary effects register · sound design · music direction & themes |
| 08 | [Continuity Bible](08-continuity-bible.md) | Character continuity · location continuity · wound clocks · prop clocks · QC checklist |
| 09 | [Veo-Ready Video Prompts](09-veo-prompts.md) | **One continuity-locked prompt per shot, all 306** *(generated)* |
| 10 | [Image Prompts & Edit Plan](10-image-prompts-and-edit-plan.md) | Reference-still prompts · location plates · key art · post pipeline · the 10 cuts that matter |

### Machine-readable data
| File | Contents |
|---|---|
| `data/shots-01-10.json` · `data/shots-11-20.json` · `data/shots-21-30.json` | The shot list as structured data — the single source of truth |
| `data/veo-prompts.jsonl` | 306 rows: `shot_id`, `scene`, `act`, `location`, `duration_seconds`, `aspect_ratio`, `prompt`, `negative_prompt` — ready to feed a batch generation job |
| `tools/build-prompts.mjs` | Regenerates docs 06 and 09 plus the JSONL from the shot data |

### Reference stills
`reference/` contains approved character, costume, location and key-art references. **These are the ground truth for every generated shot** — condition on the image, never re-prompt from text.

**Cast**
| File | Subject |
|---|---|
| `char-01-arjun-vedh.png` | Arjun Vedh — salvage diver (state A2) |
| `char-02-kira-okonkwo.png` | Kira Okonkwo — kite runner (state K1) |
| `char-03-dev-aranya.png` | Dev Aranya / The Hollow — crystallisation stage 3 |
| `char-04-riya-sen.png` | Commander Riya Sen — Authority command (R1) |
| `char-05-sera-vance.png` | Sera Vance / Echo-One |
| `char-06-meera-sanyal.png` | Dr. Meera Sanyal |
| `char-07-cadet-arjun-2059.png` | Cadet Arjun, 2059 (state A1) — no grey streak, clean-shaven |
| `char-08-dev-aranya-2059.png` | Dev Aranya, 2059 (state D1) — no crystallisation, band on hand |
| `char-09-amara-okonkwo.png` | Amara Okonkwo, 2059 — with 5-year-old Kira, red thread |
| `char-10-the-hollow.png` | The Hollow, rank and file ⚠ *see QC note* |

**Costume**
| File | Subject |
|---|---|
| `costume-01-arjun-bastion-mantle.png` | Arjun — hero Bastion mantle (A5) |
| `costume-02-kira-tether-mantle.png` | Kira — hero Tether mantle (K4) |

**Locations**
| File | Subject |
|---|---|
| `loc-01-anjari-salt-flats.png` | LOC-05 — the Anjari Salt Flats |
| `loc-02-the-ark.png` | LOC-08 — the Ark |
| `loc-03-cradle-loom.png` | LOC-09 — the Cradle Loom |
| `loc-04-stiltway-market.png` | LOC-03 — the Stiltway, market level |
| `loc-05-drowned-cathedral.png` | LOC-02 — the Drowned Cathedral |

**Key art**
| File | Subject |
|---|---|
| `key-art-01-the-long-walk.png` | Teaser one-sheet — Scene 6, the bastion bridge |
| `key-art-02-the-staircase.png` | Character one-sheet — Scene 25, the staircase of light |
| `key-art-03-let-the-corner-argue.png` | Final one-sheet — Scene 30, the kite |

⚠ **Open QC item.** `char-10-the-hollow.png` renders full-face masks with eye holes; the locked design is a **half-mask covering nose to chin only, with the eyes and brows fully bare**. Re-render before it is used as conditioning — the exposed, calm human eyes are the entire point of the design. Logged in `data/qc-log.csv`.

*Still to generate (full prompts in Document 10): Authority riot unit, Bhaskar Rele, and location plates for Ward 12, Archive B7, the Tidewall and the Kite-field.*

---

## Rebuilding the generated documents

```bash
cd docs/the-last-guardian
node tools/build-prompts.mjs
# → 06-shot-list.md, 09-veo-prompts.md, data/veo-prompts.jsonl
```

Edit the JSON in `data/`, never the generated markdown. Character identity blocks, location sheets, film grammar and the global negative prompt all live at the top of `tools/build-prompts.mjs` — change them there once and all 306 prompts update consistently.

---

## Production order (recommended)

1. **Approve the reference stills** (Document 10, Part A). Lock a seed per character per costume state.
2. **Generate Scene 1**, then **Scene 15** using Scene 1's plates — the frame-match between them is the highest-priority continuity task in the film (Document 08, Part B.5).
3. **Generate everything else in script order**, chaining the last frame of each shot into the next where the action is continuous.
4. **Run the QC checklist** (Document 08, Part C) on every take. Reject and re-render; never fix continuity in the grade.
5. **Cut in script order**, then conform to the ten cuts in Document 10, Part B.3.

---

## The three rules that hold the film together

1. **Powers always cost.** Every use of the current is followed within two scenes by a visible price — a nosebleed, a tremor, a forgotten name, a wrong name.
2. **The villain is never wrong about the problem, only about the solution.** Dev's diagnosis of human grief must be allowed to land.
3. **One clear sky.** Rain, cloud, ash or salt-haze in every frame until the final ninety seconds of Act III.

---

*Original IP. All names, organisations and designs were constructed for this project and should be cleared by production legal before principal photography.*
