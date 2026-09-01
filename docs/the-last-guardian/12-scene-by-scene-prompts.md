# 12 · Scene-by-scene prompt sheets

One sheet per scene. Each sheet is self-contained: open it, work top to bottom, the scene is shot.

| Sheet | Order in a scene | Paste into |
|---|---|---|
| ① Establishing still | the frame the scene is set in | Omni / any image model |
| ② Hero still | the frame the scene is remembered for | Omni / any image model |
| ③ Scene in one clip | 8s version of the whole scene | Flow / Veo (text-to-video) |
| ④ Hero shot clip | the money shot at full quality | Flow / Veo (use ② as first frame) |
| ⑤ Full coverage | every shot, clip-sized, in order | Flow / Veo |

Do ① → ② first. Feed the stills back in as the first frame / Ingredient for ③ ④ ⑤ — that is what keeps faces and rooms from drifting.

| # | Scene | Location | Shots | Clips | Runtime | Sheet |
|---|---|---|---|---|---|---|
| 01 | THE SILENCE (PROLOGUE) | LOC-01 | 10 | 11 | 60s | [sheet](prompts-scene/scene-01.md) |
| 02 | THE DROWNED CATHEDRAL | LOC-02 | 8 | 8 | 49s | [sheet](prompts-scene/scene-02.md) |
| 03 | THE STILTWAY / THE KITE RUNNER | LOC-03 / LOC-10 | 11 | 13 | 68s | [sheet](prompts-scene/scene-03.md) |
| 04 | THE SWEEP | LOC-03 | 9 | 10 | 56s | [sheet](prompts-scene/scene-04.md) |
| 05 | WARD 12 / THE NOTEBOOK | LOC-04 | 8 | 10 | 61s | [sheet](prompts-scene/scene-05.md) |
| 06 | THE LONG WALK (INCITING INCIDENT) | LOC-03 | 13 | 14 | 81s | [sheet](prompts-scene/scene-06.md) |
| 07 | THE SPIRE / OSE | LOC-06 | 6 | 8 | 50s | [sheet](prompts-scene/scene-07.md) |
| 08 | THE STONE OPENS | LOC-04 | 7 | 10 | 62s | [sheet](prompts-scene/scene-08.md) |
| 09 | WARD 12 BURNS (PLOT POINT I) | LOC-04 | 9 | 9 | 63s | [sheet](prompts-scene/scene-09.md) |
| 10 | SLUICE GATE 31 | LOC-07 | 11 | 11 | 68s | [sheet](prompts-scene/scene-10.md) |
| 11 | THE THREE LAWS | LOC-05 | 12 | 20 | 127s | [sheet](prompts-scene/scene-11.md) |
| 12 | SKIFF SIX | LOC-05 | 8 | 12 | 68s | [sheet](prompts-scene/scene-12.md) |
| 13 | FOUR FRAMES | LOC-05 + LOC-01 | 7 | 9 | 43s | [sheet](prompts-scene/scene-13.md) |
| 14 | ARCHIVE B7 | LOC-06 | 8 | 9 | 54s | [sheet](prompts-scene/scene-14.md) |
| 15 | NINETY SECONDS (MIDPOINT) | LOC-06 + LOC-01 | 12 | 16 | 100s | [sheet](prompts-scene/scene-15.md) |
| 16 | THE STAIRWELL | LOC-06 | 8 | 11 | 66s | [sheet](prompts-scene/scene-16.md) |
| 17 | THE CONCORD (VILLAIN PARLEY) | Concord mind-space (LOC-05 restored) | 10 | 17 | 109s | [sheet](prompts-scene/scene-17.md) |
| 18 | THE KITE-FIELD (PLOT POINT II) | LOC-10 | 15 | 22 | 120s | [sheet](prompts-scene/scene-18.md) |
| 19 | SIXTEEN TIMES (ALL IS LOST) | LOC-03 underside | 9 | 13 | 86s | [sheet](prompts-scene/scene-19.md) |
| 20 | THE ANCHOR PROCEDURE | LOC-04 (burnt) | 9 | 15 | 94s | [sheet](prompts-scene/scene-20.md) |
| 21 | DEFECTION & THE FLEET | LOC-06 + LOC-03 | 9 | 15 | 77s | [sheet](prompts-scene/scene-21.md) |
| 22 | THE ARK / THE OFFER | LOC-08 | 11 | 20 | 108s | [sheet](prompts-scene/scene-22.md) |
| 23 | SUIT-UP / THE LAST PAGE | LOC-02 + LOC-03 | 10 | 19 | 119s | [sheet](prompts-scene/scene-23.md) |
| 24 | THE CROSSING | open sea → LOC-08 ext | 6 | 9 | 55s | [sheet](prompts-scene/scene-24.md) |
| 25 | THE STAIRCASE OF LIGHT | LOC-08 | 9 | 12 | 75s | [sheet](prompts-scene/scene-25.md) |
| 26 | MIRRORS | LOC-08 | 12 | 15 | 86s | [sheet](prompts-scene/scene-26.md) |
| 27 | THE REFUSAL | LOC-08 | 12 | 20 | 118s | [sheet](prompts-scene/scene-27.md) |
| 28 | THE LOOM (CLIMAX A) | LOC-09 | 14 | 23 | 141s | [sheet](prompts-scene/scene-28.md) |
| 29 | THE GROUND (CLIMAX B) | LOC-09 → LOC-08 | 16 | 26 | 144s | [sheet](prompts-scene/scene-29.md) |
| 30 | FOUR MONTHS LATER | LOC-03 + LOC-10 | 17 | 33 | 186s | [sheet](prompts-scene/scene-30.md) |

**Totals —** 30 scenes · 306 shots · 440 clips · 2594s of coverage · 60 still prompts (2 per scene).

Regenerate everything with `node tools/build-scene-prompts.mjs`. Never hand-edit `prompts-scene/` — edit `data/shots-*.json` or the cards in `tools/lib-prompt.mjs`.
