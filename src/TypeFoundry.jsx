import { useState, useRef, useLayoutEffect } from 'react'
import './TypeFoundry.css'
import { useLang } from './i18n'
import SiteFooter from './SiteFooter'

/* Shrink a sample-text paragraph's font-size until it fits its fixed-size box,
   so the specimen text is fully contained without scrolling. Re-runs when the
   text changes, on resize, and once web fonts finish loading. */
function useFitText(text) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const MAX_PX = 1.7 * 16 // matches the CSS starting size (1.7rem)
    const MIN_PX = 9
    const fit = () => {
      let size = MAX_PX
      el.style.fontSize = `${size}px`
      while (
        size > MIN_PX &&
        (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
      ) {
        size -= 1
        el.style.fontSize = `${size}px`
      }
    }
    fit()
    window.addEventListener('resize', fit)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit)
    return () => window.removeEventListener('resize', fit)
  }, [text])
  return ref
}

/* Size the single big character so its glyph ink fills — but stays fully inside
   — its card, then optically centre the ink. Uses canvas font metrics so each
   font is sized on its own proportions (narrow letters grow, wide ones shrink).
   Re-runs on resize and once the web font has loaded. */
function useFitChar(family, ch) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const layer = el.parentElement
    const REF = 300 // reference size for measuring; result is scaled from this
    const FILL = 0.75 // fraction of the box the ink is allowed to occupy
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const fit = () => {
      const availW = layer.clientWidth
      const availH = layer.clientHeight
      if (!availW || !availH) return
      ctx.font = `${REF}px '${family}', sans-serif`
      const m = ctx.measureText(ch)
      const inkL = m.actualBoundingBoxLeft ?? 0
      const inkR = m.actualBoundingBoxRight ?? 0
      const inkAsc = m.actualBoundingBoxAscent ?? 0
      const inkDesc = m.actualBoundingBoxDescent ?? 0
      const inkW = inkL + inkR
      const inkH = inkAsc + inkDesc
      if (!inkW || !inkH) return

      // Largest scale where the ink fits both dimensions of the box.
      const k = (Math.min((availW * FILL) / inkW, (availH * FILL) / inkH))
      const size = REF * k
      el.style.fontSize = `${size}px`
      el.style.lineHeight = '1'

      // Centre the ink box (flex centres the line box, which the ink isn't
      // centred within). Horizontal uses the advance width; vertical uses the
      // font's line metrics when the browser exposes them.
      const dx = (m.width / 2 - (inkR - inkL) / 2) * k
      const fbAsc = m.fontBoundingBoxAscent
      const fbDesc = m.fontBoundingBoxDescent
      let dy = 0
      if (fbAsc != null && fbDesc != null) {
        const leading = size - (fbAsc + fbDesc) * k
        const baselineFromTop = fbAsc * k + leading / 2
        const inkCenterFromTop = baselineFromTop + ((inkDesc - inkAsc) * k) / 2
        dy = size / 2 - inkCenterFromTop
      }
      el.style.transform = `translate(${dx}px, ${dy}px)`
    }

    fit()
    window.addEventListener('resize', fit)
    if (document.fonts) {
      document.fonts.load(`${REF}px '${family}'`).then(fit).catch(() => {})
      document.fonts.ready.then(fit)
    }
    return () => window.removeEventListener('resize', fit)
  }, [family, ch])
  return ref
}

const FONTS = [
  { family: 'BeronBuch', file: '/BeronBuch-Regular.otf',           name: 'Beron Buch', author: 'Antonia Danailova' },
  { family: 'SofiaSans', file: '/SofiaSans-VariableFont_wght.ttf', name: 'Sofia Sans', author: 'Botio Nikoltchev, Ani Petrova' },
  { family: 'Oi',        file: '/fontsforweb/Oi-Regular.ttf',      name: 'Oi',         author: 'Kostas Bartsokas' },
  { family: 'Ossem',     file: '/fontsforweb/Ossem-Regular.otf',   name: 'Ossem',      author: 'Kiril Semkov' },
  { family: 'Tochka12',  file: '/fontsforweb/Tochka12.otf',        name: 'Tochka12',   author: 'Antonia Danailova' },
  { family: 'Veleka',    file: '/fontsforweb/Veleka-Regular.otf',  name: 'Veleka',     author: 'Stefan Peev' },
  { family: 'Yuliana',   file: '/fontsforweb/Yuliana-Regular.otf', name: 'Yuliana',    author: 'Anonymous' },
  { family: 'Azbuki',    file: '/fontsforweb/Azbuki-Regular.otf', name: 'Azbuki',    author: 'Anita Rupova' }
]

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
         stroke="currentColor" strokeWidth="1.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7.5v7M8.5 11l3.5 3.5L15.5 11" />
    </svg>
  )
}

function download(file) {
  const a = document.createElement('a')
  a.href = file
  a.download = file.split('/').pop()
  a.click()
}

function SpecimenCard({ font, showAuthor }) {
  const { t } = useLang()
  const style = { fontFamily: `'${font.family}', sans-serif` }
  const sampleText = t('tf.sampleText')
  const textRef = useFitText(sampleText)
  const charRef = useFitChar(font.family, 'А')
  return (
    <article className="spec-card">
      <header className="spec-head">
        <div className="spec-id">
          <span className="spec-name">{font.name}</span>
          <button
            className="spec-download"
            onClick={() => download(font.file)}
            aria-label={`${t('tf.download')} ${font.name}`}
            title={t('tf.download')}
          >
            <DownloadIcon />
          </button>
        </div>
        {showAuthor && <span className="spec-author">{font.author}</span>}
      </header>

      <div className="spec-body">
        {/* RIGHT layer — sample text */}
        <div className="spec-layer spec-layer--text">
          <p ref={textRef} style={style}>{sampleText}</p>
        </div>

        {/* MIDDLE layer — alphabet specimen */}
        <div className="spec-layer spec-layer--specimen">
          <div className="spec-row" style={style}>АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЮЯ</div>
          <div className="spec-row" style={style}>абвгдежзийклмнопрстуфхцчшщъьюя</div>
          <div className="spec-row" style={style}>0123456789</div>
          <div className="spec-row" style={style}>. , : ; ! ? ( )</div>
        </div>

        {/* LEFT layer — single character */}
        <div className="spec-layer spec-layer--char">
          <span ref={charRef} style={style}>А</span>
        </div>
      </div>
    </article>
  )
}

function TypeFoundry() {
  const { t, lang, toggle } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  return (
    <div className="tf">
      <header className="topbar">
        <a href="#/" className="logo" onClick={closeMenu}>{t('brand.abc')}</a>
        <nav className={`menu${menuOpen ? ' open' : ''}`}>
          <a href="#/type" className="active" onClick={closeMenu}>{t('nav.typeFoundry')}</a>
          <a href="#/history" onClick={closeMenu}>{t('nav.history')}</a>
          <a href="#/submit" onClick={closeMenu}>{t('nav.submit')}</a>
        </nav>
        <button className="lang-pill" onClick={toggle} aria-label="Toggle language">
          <span className="dot" />
          {lang === 'en' ? 'EN' : 'БГ'}
        </button>
        <button
          className={`burger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </header>

      <main className="specimens">
        {FONTS.map((f) => (
          <SpecimenCard key={f.family} font={f} showAuthor />
        ))}
      </main>

      {/* Licence heading only */}
      <section className="tf-license">
        <div className="tf-license-head">
          <h2 className="tf-license-title">{t('license.title')}</h2>
          <p className="tf-license-line">{t('license.version')}</p>
          <p className="tf-license-line">{t('license.date')}</p>
        </div>
      </section>

      <SiteFooter theme="light" />
    </div>
  )
}

export default TypeFoundry
