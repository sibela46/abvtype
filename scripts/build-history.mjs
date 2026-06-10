// Converts history.xlsx (+ optional history_en.xlsx) → src/history-data.json.
// Runs automatically on every Vite build/dev start (see vite.config.js) and can
// also be invoked directly:  node scripts/build-history.mjs
//
// Spreadsheet layout (sheet "Tabelle1"), one source per row after the header:
//   A category | B name | C year | D image | E additional images | F text | G —
// The image columns hold "folder\file.ext" references that map to files under
// public/history/<folder>/; they are turned into "/history/<folder>/<file>" web
// paths (missing files are warned about and skipped).
//
// history.xlsx holds the Bulgarian text. history_en.xlsx is its English mirror
// (identical row order); when present, its category/name/year/text are merged in
// as the { en } half of each field. If it is missing, only { bg } is emitted and
// the UI falls back to Bulgarian for English (see pick() in src/i18n.jsx).

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import * as XLSX from 'xlsx'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const XLSX_PATH = resolve(root, 'history.xlsx')
const XLSX_EN_PATH = resolve(root, 'history_en.xlsx')
const JSON_PATH = resolve(root, 'src/history-data.json')
const HISTORY_DIR = resolve(root, 'public/history')

const clean = (v) => (v == null ? '' : String(v).trim())

// Turn a "folder\file.ext" spreadsheet reference into a "/history/folder/file.ext"
// web path. Returns '' (with a warning) when the file isn't present on disk.
const warnings = []
function toImagePath(ref) {
  const rel = clean(ref).replace(/\\/g, '/').replace(/^\/+/, '')
  if (!rel) return ''
  if (!existsSync(resolve(HISTORY_DIR, rel))) {
    warnings.push(rel)
    return ''
  }
  return '/history/' + rel.split('/').map(encodeURIComponent).join('/')
}

// Read a sheet's rows (header row included) from an .xlsx, or null if absent.
function readRows(path) {
  if (!existsSync(path)) return null
  const wb = XLSX.read(readFileSync(path), { type: 'buffer' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false })
}

export function buildHistory() {
  const rows = readRows(XLSX_PATH)
  // English mirror shares the same row order, so we pair rows by index.
  const enRows = readRows(XLSX_EN_PATH)
  // Build an { en } half only when the value is non-empty, so empty cells fall
  // back to Bulgarian via pick() rather than overriding it with "".
  const withEn = (bg, en) => (en ? { bg, en } : { bg })

  warnings.length = 0
  const items = []
  for (let i = 1; i < rows.length; i++) {
    const [category, name, year, image, extra, text] = rows[i]
    const title = clean(name)
    const desc = clean(text)
    // Skip blank rows and the stray category-only cells at the bottom of the sheet.
    if (!title || !desc) continue

    const en = enRows?.[i] ?? []
    const [enCategory, enName, enYear, , , enText] = en

    items.push({
      id: String(items.length + 1).padStart(3, '0'),
      category: withEn(clean(category), clean(enCategory)),
      title: withEn(title, clean(enName)),
      year: withEn(clean(year), clean(enYear)),
      desc: withEn(desc, clean(enText)),
      images: [image, extra].map(toImagePath).filter(Boolean),
    })
  }

  writeFileSync(JSON_PATH, JSON.stringify(items, null, 2) + '\n')
  if (warnings.length) {
    console.warn(`history-data.json: ${warnings.length} missing image(s): ${warnings.join(', ')}`)
  }
  return items.length
}

// Run standalone when executed directly (not when imported by vite.config.js).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const n = buildHistory()
  console.log(`history-data.json: wrote ${n} entries from history.xlsx`)
}
