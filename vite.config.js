import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { buildHistory } from './scripts/build-history.mjs'

// Regenerate src/history-data.json from history.xlsx whenever Vite starts a
// build or the dev server, so the JSON is never out of sync with the spreadsheet.
function historyData() {
  return {
    name: 'history-data',
    buildStart() {
      const n = buildHistory()
      this.info(`history-data.json: wrote ${n} entries from history.xlsx`)
    },
  }
}

export default defineConfig({
  plugins: [react(), historyData()],
  server: {
    proxy: {
      // Forward API calls to the local mail server during development
      '/api': 'http://localhost:3001',
    },
  },
})
