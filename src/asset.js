// Prefix a public-folder path (e.g. "/whale.png") with Vite's base URL so the
// asset resolves both in dev (base "/") and on GitHub Pages (base "/abvtype/").
// Vite rewrites asset URLs in index.html and CSS automatically, but NOT string
// literals in JS — those go through here.
const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export function asset(path) {
  return base + path
}
