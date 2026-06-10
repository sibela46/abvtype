import { useState } from 'react'
import './TypeFoundry.css'
import { useLang } from './i18n'

const FONTS = [
  { family: 'BeronBuch', file: '/BeronBuch-Regular.otf',           name: 'Beron Buch', author: 'Antonia Danailova' },
  { family: 'SofiaSans', file: '/SofiaSans-VariableFont_wght.ttf', name: 'Sofia Sans', author: 'Antonia Danailova' },
  { family: 'Oi',        file: '/fontsforweb/Oi-Regular.ttf',      name: 'Oi',         author: 'Antonia Danailova' },
  { family: 'Ossem',     file: '/fontsforweb/Ossem-Regular.otf',   name: 'Ossem',      author: 'Antonia Danailova' },
  { family: 'Tochka12',  file: '/fontsforweb/Tochka12.otf',        name: 'Tochka12',   author: 'Antonia Danailova' },
  { family: 'Veleka',    file: '/fontsforweb/Veleka-Regular.otf',  name: 'Veleka',     author: 'Antonia Danailova' },
  { family: 'Yuliana',   file: '/fontsforweb/Yuliana-Regular.otf', name: 'Yuliana',    author: 'Antonia Danailova' },
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
          <p style={style}>{t('tf.sampleText')}</p>
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
          <span style={style}>А</span>
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

      <footer className="tf-license">
        <h2 className="tf-license-title">{t('license.title')}</h2>
        <p className="tf-license-line">{t('license.version')}</p>
        <p className="tf-license-line">{t('license.date')}</p>
      </footer>
    </div>
  )
}

export default TypeFoundry
