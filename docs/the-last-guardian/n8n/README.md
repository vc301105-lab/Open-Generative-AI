# THE LAST GUARDIAN — n8n Automation (Full Setup Guide)

Ye folder **complete n8n automation package** hai — sab workflows, sab connections, ready-to-import JSON files.

Ek baar setup hone ke baad ye pipeline khud-ba-khud:

1. Google Sheet se agla `TODO` shot uthata hai
2. **Gemini** se uska still frame banata hai
3. Still ko first-frame banakar **Veo** se video clip generate karta hai
4. Still + clip **Google Drive** me save karta hai
5. Sheet me `DONE` / `FAILED` + file links update karta hai
6. Agla shot… jab tak batch khatam
7. End me optional **Telegram** summary bhejta hai

---

## Folder contents

| File | Kya hai |
|---|---|
| `workflows/tlg-01-render-pipeline.code.json` | **Main pipeline** — Still → Veo → Drive → Sheet (24 nodes, sab connections pre-wired) |
| `workflows/tlg-02-error-alerts.code.json` | **Error workflow** — crash pe Telegram alert |
| `workflows/tlg-03-qc-approve-webhook.code.json` | **QC webhook** — ek URL kholke shot approve/reject |
| `render-tracker-full.csv` | **Complete sheet — 440 clips, sab prompts bhare hue, sab `TODO`** (ise hi import karo) |
| `render-tracker-sheet-template.csv` | Chhota template — 6 example shots, structure samajhne ke liye |

---

## Architecture (data flow)

```
 Schedule Trigger (roz 09:00 IST) ya manual Execute
        │
     Config  ←── saari IDs/models yahan (ek hi jagah)
        │
 Read Tracker Rows (Google Sheet)
        │
 Only TODO Shots ──► Limit Per Run (max N shots/run)
        │
    Loop Shots ─────────────────────────────┐ (har iteration = 1 shot)
        │                                   │
  Build Prompts                             │
        │                                   │
 Generate Still (Gemini API)                │
        │                                   │
   Parse Still                              │
        │                                   │
   Still OK? ── false ──────────────► Mark FAILED ──► wapas Loop
        │ true                              │
  Upload Still (Drive 01_stills)            │
        │                                   │
 Submit Veo Job (still = first frame)       │
        │                                   │
 Veo Submitted? ── false ───────────► Mark FAILED ──► wapas Loop
        │ true                              │
  Wait 30s ◄────────────┐                   │
        │               │                   │
  Poll Veo Job          │                   │
        │               │                   │
   Veo Done? ── false ──┘                   │
        │ true                              │
 Veo OK? ── false ──────────────────► Mark FAILED ──► wapas Loop
        │ true                              │
 Download Video                             │
        │                                   │
 Upload Clip (Drive 02_clips)               │
        │                                   │
 Mark DONE (links + timestamp sheet me) ────┘
        │
 (loop khatam) ──► Run Summary ──► Telegram Configured? ──► Notify Telegram
```

Failure kisi bhi stage pe ho — row `FAILED` mark hoti hai reason ke saath, aur pipeline **agle shot pe continue** karta hai. Poora run kabhi ek error se nahi rukta.

---

## Step 0 — Chahiye kya

| Cheez | Kahan se |
|---|---|
| n8n | Cloud (n8n.io) ya self-host (Docker/npm) |
| Google account | Sheet + Drive ke liye |
| **Gemini API key** | https://aistudio.google.com/apikey — **Veo ke liye billing enable karna zaroori** |
| Telegram bot (optional) | @BotFather se token + apna chat ID |

> Model names Config node me hain: image = `gemini-2.5-flash-image`, video = `veo-3.0-generate-preview`. Agar koi naya model use karna ho to sirf Config me string badlo — baaki workflow ko touch nahi karna. Latest names check: `GET https://generativelanguage.googleapis.com/v1beta/models` (header me API key).

---

## Step 1 — n8n install

**Docker (recommended):**
```bash
docker run -it --rm --name n8n -p 5678:5678 \
  -e GENERIC_TIMEZONE="Asia/Kolkata" \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```
Phir browser me `http://localhost:5678`.

**npm:**
```bash
npm install n8n -g
n8n
```

**Cloud:** n8n.io pe account banao, koi install nahi.

---

## Step 2 — Credentials banao (n8n → Credentials → Add credential)

1. **Header Auth** — naam: `Gemini API Key`
   - Name: `x-goog-api-key`
   - Value: apni `AIza...` key
2. **Google OAuth2 API** — naam: `Google (TLG)`
   - Scope allow karo, Google account se connect karo (Sheets + Drive dono isi se chalenge)
3. **Telegram API** *(optional)* — naam: `Telegram TLG`, @BotFather wala bot token

---

## Step 3 — Google Sheet banao

1. Ek nayi Google Sheet kholo → **File → Import → Upload** → **`render-tracker-full.csv`** choose karo (440 clips, sab prompts ready) → *Replace spreadsheet*.
2. Tab ka naam **`Render Tracker`** hi rehne do (Config me yahi naam hai).
3. Sheet URL se ID copy karo:
   `https://docs.google.com/spreadsheets/d/`**`YEH_ID`**`/edit`

**Columns ka matlab:**

| Column | Kaun likhta hai |
|---|---|
| `clip_id`, `scene`, `shot`, `seconds`, `location` | Tum (har shot ki identity) |
| `prompt` | Tum — still ka image prompt (scene sheets se) |
| `video_prompt` | Tum — clip ka motion prompt |
| `status` | Workflow — `TODO` → `DONE`/`FAILED` (QC webhook se `APPROVED`/`REJECTED`) |
| `still_file`, `clip_file`, `finished_at`, `qc_notes` | Workflow auto-bharta hai |

> **`render-tracker-full.csv` me saare 440 clips ke prompts pehle se bhare hain** (`prompts-flow` pack se generate kiya hai — `node tools/build-n8n-sheet.mjs` se dobara bana sakte ho). Template wali 6 example rows sirf structure samajhne ke liye hain.

---

## Step 4 — Drive folders banao

Drive me 2 folders banao: **`01_stills`** aur **`02_clips`**. Har folder kholke URL se ID copy karo:
`https://drive.google.com/drive/folders/`**`YEH_ID`**

---

## Step 5 — Workflows import karo

n8n → **Workflows → Import from File** → teeno `.code.json` files import karo:
1. `tlg-01-render-pipeline.code.json`
2. `tlg-02-error-alerts.code.json`
3. `tlg-03-qc-approve-webhook.code.json`

---

## Step 6 — Config node me IDs paste karo (sirf ek jagah)

**TLG 01 → `Config` node** kholo aur values bharo:

| Field | Value |
|---|---|
| `sheetDocId` | Step 3 wali Sheet ID |
| `sheetTab` | `Render Tracker` (default hi hai) |
| `stillsFolderId` | Step 4 wali `01_stills` folder ID |
| `clipsFolderId` | Step 4 wali `02_clips` folder ID |
| `geminiImageModel` | `gemini-2.5-flash-image` (default) |
| `veoModel` | `veo-3.0-generate-preview` (sasta chahiye to `veo-3.0-fast-generate-preview`) |
| `maxShotsPerRun` | `25` (quota ke hisaab se) |
| `telegramChatId` | apna chat ID (optional) |

`styleSuffix` / `negativeSuffix` film ki visual language hain — inhe mat hatao.

**TLG 03 → `QC Config`** me bhi `sheetDocId` + `sheetTab` paste karo (wahi Sheet ID).

---

## Step 7 — Credentials assign karo

Ye nodes kholke **Credential** dropdown me `Gemini API Key` (Header Auth) select karo:
- `Generate Still (Gemini)`
- `Submit Veo Job`
- `Poll Veo Job`

`Read Tracker Rows`, `Upload Still`, `Upload Clip`, `Mark DONE`, `Mark FAILED`, `Update QC Row` nodes me **`Google (TLG)`** OAuth credential select karo.
(Agar Telegram use karna hai to `Notify Telegram` / `Send Telegram Alert` me Telegram credential.)

---

## Step 8 — Error workflow link karo

**TLG 01** → Workflow **Settings (⚙)** → **Error Workflow** → `TLG 02 — Error Alerts` select karo → Save.

---

## Step 9 — Pehla test run

1. Sheet me sirf **1 row** `TODO` rakho (baaki rows ka status `HOLD` kar do — full sheet me sab `TODO` hain, isliye testing ke liye Column G me manually `HOLD` likh do).
2. TLG 01 kholo → **Execute Workflow** dabao.
3. Execution me dekho: still banega → Drive me aayega → Veo job → ~2–8 min → clip Drive me → Sheet row `DONE` + links.
4. Sheet me `still_file` / `clip_file` link kholke QC karo.

Sab sahi? Ab `maxShotsPerRun` badhao aur poori batch TODO karo.

---

## Step 10 — Auto pilot

TLG 01 aur TLG 03 ko **Activate** kar do (top-right toggle). Bas:
- Roz 09:00 IST pe pipeline khud chalega (cron `0 9 * * *` Config ke paas Schedule Trigger me hai — time badalna ho to wahan).
- Sheet me jitni `TODO` rows, utna kaam. `DONE` rows dobara nahi chalti.
- Re-render chahiye? Status wapas `TODO` karo aur `video_prompt` tweak karo.

---

## QC webhook — approve/reject ek click me

TLG 03 **Activate** karne ke baad:

```
https://YOUR-N8N-HOST/webhook/tlg-qc?clip_id=S01-1A&verdict=approve
https://YOUR-N8N-HOST/webhook/tlg-qc?clip_id=S01-1A&verdict=reject&notes=streak%20wrong%20side
```

- `approve` → status `APPROVED`
- `reject` → status `REJECTED` (notes column me reason save)

Drive file kholo, dekho, URL paste — QC complete. (n8n cloud pe URL `*.app.n8n.cloud/webhook/...` hoga.)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `404 model not found` | Model name purana/naya — Config me `geminiImageModel` / `veoModel` string update karo |
| `429 RESOURCE_EXHAUSTED` | Rate limit — `maxShotsPerRun` ghatao, ya paid tier enable karo |
| `PERMISSION_DENIED` on Veo | API key wale project me **billing enable** karo; Veo preview access check karo |
| Sheet update `lookup not found` | `clip_id` column me exactly wahi value honi chahiye; spelling/case check |
| Still blank/black | Prompt me continuity lines check karo; `prompt` column khali to nahi |
| Clip me text/watermark | `negativeSuffix` me already `no text, no watermark` hai; phir bhi aaye to take reject karke re-run |
| Drive upload fail | Google credential ke scopes me Drive + Sheets dono allowed hon |

**QC rule (video dekhne ke waqt):** Arjun ki grey streak **RIGHT** temple pe hi honi chahiye (2059 flashbacks me streak nahi), Bloom kabhi aag/smoke nahi — sirf silent white expansion. Fail ho to webhook se `reject` maaro.

---

## Paisa / quota note

- Har shot = 1 Gemini image + 1 Veo video. 440 clips ≈ 440 images + 440 videos.
- Veo paid-tier pe hi chalta hai — pehle `maxShotsPerRun=2` se test karo, cost dekh lo, phir batch badhao.
- Failures ka reason sheet ke `qc_notes` column me aata hai — wahan se debug karo, execution history me nahi jaana padta.

---

## Node reference (TLG 01 — sab connections)

| # | Node | Type | Karta kya hai |
|---|---|---|---|
| 1 | Schedule Trigger | scheduleTrigger | Roz 09:00 IST |
| 2 | Config | set | Saari IDs/models ek jagah |
| 3 | Read Tracker Rows | googleSheets | Sheet ki saari rows |
| 4 | Only TODO Shots | filter | Sirf status=TODO |
| 5 | Limit Per Run | code | Max N shots/run |
| 6 | Loop Shots | splitInBatches | Ek waqt me 1 shot |
| 7 | Build Prompts | code | Image + video prompt compose |
| 8 | Generate Still (Gemini) | httpRequest | POST generateContent |
| 9 | Parse Still | code | base64 → binary, ok/fail flag |
| 10 | Still OK? | if | Branch |
| 11 | Upload Still | googleDrive | 01_stills folder |
| 12 | Submit Veo Job | httpRequest | predictLongRunning (still = first frame) |
| 13 | Check Veo Submit | code | operation name / failReason |
| 14 | Veo Submitted? | if | Branch |
| 15 | Wait 30s | wait | Poll interval |
| 16 | Poll Veo Job | httpRequest | GET operation status |
| 17 | Veo Done? | if | Loop back to Wait 30s |
| 18 | Check Veo Result | code | video URI / failReason |
| 19 | Veo OK? | if | Branch |
| 20 | Download Video | httpRequest | binary mp4 |
| 21 | Upload Clip | googleDrive | 02_clips folder |
| 22 | Mark DONE | googleSheets | links + timestamp |
| 23 | Mark FAILED | googleSheets | reason sheet me |
| 24 | Run Summary | code | done/failed count |
| 25 | Telegram Configured? → Notify Telegram / Done | if + telegram + noOp | Optional summary |

Agar kisi prompt me badlav karna ho → **sheet ka `prompt`/`video_prompt` column edit karo, status `TODO` karo, agla run khud utha lega.** Workflow JSON ko haath se edit karne ki zaroorat kabhi nahi.
