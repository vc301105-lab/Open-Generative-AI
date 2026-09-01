# SHOOTING BOARDS
### Keyframe plates for THE LAST GUARDIAN

Each scene folder holds one **approved keyframe plate per shot**, plus a board document laying the plates out against the shot spec from `data/shots-*.json`.

## What these are for

The plates are the **first-frame conditioning references** for video generation. The pipeline in Document 10 is:

```
reference stills (reference/)      → who and where, locked
        ↓
keyframe plates (boards/)          → what each shot actually looks like
        ↓
Veo prompt (09-veo-prompts.md)     → the motion, conditioned on the plate
        ↓
QC against Doc 08 Part C           → approve or re-render
```

Never generate a shot from text alone once its plate exists. Condition on the plate.

## Progress

| Scene | Title | Shots | Plates | Board | Status |
|---|---|---|---|---|---|
| **01** | The Silence (prologue) | 10 | 10 | [board](scene-01/README.md) | ✅ complete — **locked** |
| 15 | Ninety Seconds (midpoint) | 12 | 3 inherited from Sc. 1 | — | 9 plates outstanding |
| 02–14, 16–30 | | 284 | 0 | — | outstanding |

**Total: 10 of 306 plates generated.**

## Generation order (from Document 10, Part B.7)

1. **Scene 1** — done. Its plates are the source of truth for the Scene 15 frame-match, which is the single highest-priority continuity task in the film.
2. **Scene 15** — reuses `S01-1D`, `S01-1E` and `S01-1J` directly; only the nine remaining plates need generating, and `15D` must continue past the Scene 1 cut point with identical lighting, lens, blocking and wardrobe damage at the splice.
3. **Everything else in script order**, chaining the last frame of shot *n* into shot *n+1* wherever the action is continuous.

## Rules for every plate

- Cite the shot's location code and match the locked location sheet in Document 03.
- Embed the LOCKED IDENTITY BLOCK for every character in frame — never paraphrase it.
- Respect the costume state matrix and the wound clock for the scene's position (Document 08).
- Run the QC checklist (Document 08, Part C) before a plate is marked approved.
- Log every asset in `data/qc-log.csv`. Rejections are re-rendered, never graded around.
