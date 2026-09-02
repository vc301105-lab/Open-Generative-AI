#!/usr/bin/env node
// build-n8n-sheet.mjs — builds n8n/render-tracker-full.csv from prompts-flow/shots.csv
// One Google-Sheet-import-ready row per clip, in the exact column layout the
// TLG 01 n8n workflow reads/writes (see n8n/render-tracker-sheet-template.csv).
// Run: node tools/build-n8n-sheet.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// --- minimal RFC-4180 CSV parser (quoted fields with embedded commas) ------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n') {
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const esc = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const src = parseCsv(readFileSync(join(root, 'prompts-flow/shots.csv'), 'utf8'));
const header = src[0];
const idx = Object.fromEntries(header.map((h, i) => [h, i]));
for (const need of ['clip_id', 'scene', 'shot', 'clip_of', 'seconds', 'location', 'prompt']) {
  if (!(need in idx)) throw new Error(`prompts-flow/shots.csv is missing column "${need}"`);
}

const outHeader = [
  'clip_id', 'scene', 'shot', 'clip_of', 'seconds', 'location',
  'status', 'prompt', 'video_prompt',
  'still_file', 'clip_file', 'started_at', 'finished_at', 'qc_notes', 'take_file',
];

const lines = [outHeader.join(',')];
let count = 0;
for (const r of src.slice(1)) {
  if (!r[idx.clip_id]) continue;
  const prompt = r[idx.prompt] || '';
  lines.push([
    r[idx.clip_id], r[idx.scene], r[idx.shot], r[idx.clip_of], r[idx.seconds], r[idx.location],
    'TODO',
    prompt, // still: same description, Gemini renders it as a single frame
    prompt, // video: same prompt drives Veo with the still as first frame
    '', '', '', '', '', '',
  ].map(esc).join(','));
  count++;
}

writeFileSync(join(root, 'n8n/render-tracker-full.csv'), lines.join('\n') + '\n');
console.log(`n8n/render-tracker-full.csv written — ${count} clip rows.`);
