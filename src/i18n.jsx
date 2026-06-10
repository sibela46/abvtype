import { createContext, useContext, useEffect, useState } from 'react'
import strings from './translations.json'

const STORAGE_KEY = 'abvtype-lang'
const LanguageContext = createContext(null)

// Resolve a bilingual value, falling back so the UI never shows a blank
// while a translation is still missing.
export function pick(entry, lang) {
  if (!entry) return ''
  if (typeof entry === 'string') return entry
  return entry[lang] || entry.en || entry.bg || ''
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'bg'
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const toggle = () => setLang((l) => (l === 'en' ? 'bg' : 'en'))

  // Look up a UI string by key from translations.json
  const t = (key) => pick(strings[key], lang)

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider')
  return ctx
}
