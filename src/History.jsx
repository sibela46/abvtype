import { useEffect, useRef, useState } from 'react'
import './History.css'
import data from './history-data.json'
import { useLang, pick } from './i18n'
import { asset } from './asset'

// Normalise the generated data (images may be a string or array)
const ITEMS = data.map((e) => ({
  ...e,
  images: Array.isArray(e.images) ? e.images : e.images ? [e.images] : [],
}))

function History() {
  const { t, lang, toggle } = useLang()
  const contentRef = useRef(null)
  const sectionRefs = useRef([])
  const [active, setActive] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  // Track which section is in view and update the active list item
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const onScroll = () => {
      // Pick the section whose top has passed a marker near the viewport top
      const marker = el.getBoundingClientRect().top + el.offsetHeight * 0.3
      let idx = 0
      for (let i = 0; i < sectionRefs.current.length; i++) {
        const sec = sectionRefs.current[i]
        if (sec && sec.getBoundingClientRect().top <= marker) idx = i
      }
      setActive(idx)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const goTo = (i) => {
    const target = sectionRefs.current[i]
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="cat">
      {/* Top navigation bar (same as the other pages) */}
      <header className="topbar">
        <a href="#/" className="logo" onClick={closeMenu}>{t('brand.abc')}</a>
        <nav className={`menu${menuOpen ? ' open' : ''}`}>
          <a href="#/type" onClick={closeMenu}>{t('nav.typeFoundry')}</a>
          <a href="#/history" className="active" onClick={closeMenu}>{t('nav.history')}</a>
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

      <div className="cat-body">
        {/* Left list */}
        <aside className="cat-sidebar">
          <div className="cat-items">
            <div className="cat-list-header">
              <span className="cat-list-source">{t('history.source')}</span>
              <span className="cat-list-year">{t('history.year')}</span>
            </div>
            <div className="cat-items-scroll">
              {ITEMS.map((item, i) => (
                <a
                  key={item.id}
                  href={`#item-${item.id}`}
                  className={`cat-list-item${i === active ? ' active' : ''}`}
                  onClick={(e) => { e.preventDefault(); goTo(i) }}
                >
                  <span className="cat-item-number">{item.id}</span>
                  <span className="cat-item-title">{pick(item.title, lang)}</span>
                  <span className="cat-item-year">{pick(item.year, lang)}</span>
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* Scrolling content area */}
        <main className="cat-content" ref={contentRef}>
          {ITEMS.map((item, i) => {
            const title = pick(item.title, lang)
            const year = pick(item.year, lang)
            const desc = pick(item.desc, lang)
            const category = pick(item.category, lang)
            return (
              <section
                key={item.id}
                id={`item-${item.id}`}
                className={`cat-item${item.images.length ? '' : ' no-image'}`}
                ref={(el) => { sectionRefs.current[i] = el }}
              >
                <div className="cat-item-inner">
                  <div className="cat-item-text">
                    {category && <div className="cat-item-type">{category}</div>}
                    {desc && <div className="cat-item-head">{item.id}</div>}
                    {desc && <p>{desc}</p>}
                  </div>
                  <div className={`cat-item-image count-${item.images.length}`}>
                    {item.images.length > 0 && <div className="cat-image-number">{item.id}</div>}
                    {item.images.map((src, k) => (
                      <figure key={k} className="cat-image-figure">
                        <img src={asset(src)} alt={title} />
                        <figcaption className="cat-image-caption">
                          {title} <span className="cat-footer-year">{year}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </section>
            )
          })}
        </main>
      </div>
    </div>
  )
}

export default History
