import { useState, useRef, useLayoutEffect, useEffect, Fragment } from 'react'
import './App.css'
import { useLang } from './i18n'
import { asset } from './asset'
import SiteFooter from './SiteFooter'

/* Safari plays WebM but ignores its alpha channel, rendering the transparent
   hero animation as an opaque white box. Feed it the background-baked MP4
   instead (its grey matches the page, so no white box and the whale stays put
   via the Safari CSS branch). */
const isSafari =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent)

const aboutImages = [
  { src: '/about/about-01-coolfonts.jpg', alt: 'I want to use cool fonts на български', height: '55vh' },
  { src: '/about/about-02-azbuka.png', alt: 'Cyrillic alphabet pages from the Beron primer', height: '57vh' },
  { src: '/about/about-03-glyphs.png', alt: 'Beron typeface in progress in the Glyphs editor', height: '43vh' },
  { src: '/about/about-04-beron-otf.png', alt: 'Beron.otf font file', height: '26vh' },
  { src: '/about/about-05-document.png', alt: 'Cyrillic Matters — thesis document', height: '53vh' },
  { src: '/about/about-06-woodtype.png', alt: 'Hand-cut type and prints', height: '48vh' },
]

const aboutTextKeys = [
  'landing.about1',
  'landing.about2',
  'landing.about3',
  'landing.about4',
]

const fontImages = [
  '/font/01.jpg', '/font/02.jpg', '/font/04.png', '/font/03.png', '/font/05.png',
  '/font/06.png', '/font/07.jpg', '/font/08.jpg', '/font/09.jpg', '/font/10.jpg',
  '/font/11.jpg', '/font/12.jpg', '/font/13.jpg', '/font/14.jpg', '/font/15.jpg',
].map(asset)

const fontTextKeys = [
  'landing.font1',
  'landing.font2',
  'landing.font3',
  'landing.font4',
  'landing.font5',
  'landing.font6',
  'landing.font7',
  'landing.font8',
  'landing.font9',
  'landing.font10',
  'landing.font11',
]

const sources = [
  'Атанасов, Петър: Начало на българското книгопечатане. София, 1959.',
  'Берон, Петър: Буквар с различни поучения. Брашов, 1824.',
  'Иванова, Климентина: В началото бе книгата. София, 1983.',
  'Петрова-Проданова, Захарина: Красивите букви. София, 2023.',
  'Танев, Тачо: Беседи за българските азбуки. София, 2003.',
  'Йончев, Васил: Азбуката от Плиска, кирилицата и глаголицата. София, 1997.',
  'Йончев, Васил; Йончева, Олга: Древен и съвременен български шрифт. София, 1982.',
  'Йончев, Васил: Книгата през вековете. София, 1976.',
  'Йончев, Васил: Шрифтът през вековете. София, 1974',
]

const sourceLinksLeft = [
  'scripta-bulgarica.eu/en',
  'npoekmu.me',
  'bgkalendar.com',
  'ypography.bg',
]

const sourceLinksRight = [
  'cyrillic.bgweb.bg',
  'azbukifont.com',
  'cyrillic.bg',
  'abva.bg',
  'fontrevival.com/',
]

/* True while the viewport is at the mobile breakpoint (matches the 820px CSS
   media query), so layout can be restructured rather than only restyled. */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

/* The About strip: two rows (images + texts) sharing one horizontal scroller.
   Each row is rendered as three identical copies and its gap is tuned so both
   rows span the exact same repeat width, letting a single scrollLeft wrap both
   seamlessly — scroll past the last item and the first comes back into view. */
function AboutStrip() {
  const { t } = useLang()
  const stripRef = useRef(null)
  const imagesRowRef = useRef(null)
  const textsRowRef = useRef(null)
  const periodRef = useRef(0)
  const initializedRef = useRef(false)

  // On mobile the texts read better as a vertical stack below the image strip,
  // so they leave the horizontal looping scroller entirely.
  const isMobile = useIsMobile()

  useLayoutEffect(() => {
    const strip = stripRef.current
    const imgRow = imagesRowRef.current
    const txtRow = textsRowRef.current // absent on mobile (texts stacked outside the strip)
    if (!strip || !imgRow) return

    initializedRef.current = false // re-centre when crossing the mobile breakpoint

    // Size the row(s) to a common period and recentre the loop on the middle copy.
    const measure = () => {
      const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      const baseGap = (isMobile ? 7 : 10) * remPx
      const ki = aboutImages.length
      const kt = aboutTextKeys.length
      const sumWidths = (row, k) =>
        Array.from(row.children)
          .slice(0, k)
          .reduce((acc, el) => acc + el.getBoundingClientRect().width, 0)
      const imgWidth = sumWidths(imgRow, ki)
      const txtWidth = txtRow ? sumWidths(txtRow, kt) : 0
      if (imgWidth === 0 || (txtRow && txtWidth === 0)) return // not laid out / images not loaded yet

      const period = Math.max(imgWidth + ki * baseGap, txtWidth + kt * baseGap)
      const imgGap = (period - imgWidth) / ki
      imgRow.style.gap = `${imgGap}px`
      imgRow.style.paddingRight = `${imgGap}px`
      if (txtRow) {
        const txtGap = (period - txtWidth) / kt
        txtRow.style.gap = `${txtGap}px`
        txtRow.style.paddingRight = `${txtGap}px`
      }
      periodRef.current = period

      if (!initializedRef.current) {
        strip.scrollLeft = period // start on the middle copy so it loops both ways
        initializedRef.current = true
      }
    }

    // Keep the scroll position within the middle copy, wrapping at either edge.
    const handleScroll = () => {
      const period = periodRef.current
      if (!period) return
      if (strip.scrollLeft >= 2 * period) strip.scrollLeft -= period
      else if (strip.scrollLeft < period) strip.scrollLeft += period
    }

    measure()
    strip.addEventListener('scroll', handleScroll, { passive: true })
    const ro = new ResizeObserver(measure) // re-measure as images load / on resize
    ro.observe(imgRow)
    if (txtRow) ro.observe(txtRow)
    window.addEventListener('resize', measure)
    return () => {
      strip.removeEventListener('scroll', handleScroll)
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [isMobile])

  const copies = [0, 1, 2]

  return (
    <section className="about-section">
      <div className="about-backdrop" />

      <h2 className="about-heading">{t('landing.aboutHeading')}</h2>

      <div className="scroll-strip" ref={stripRef}>
        <div className="strip-row strip-images" ref={imagesRowRef}>
          {copies.map((c) =>
            aboutImages.map((img) => (
              <img
                src={asset(img.src)}
                alt={img.alt}
                className="strip-img"
                style={{ height: img.height }}
                key={`${img.src}-${c}`}
                draggable={false}
                aria-hidden={c !== 0}
              />
            )),
          )}
        </div>
        {!isMobile && (
          <div className="strip-row strip-texts" ref={textsRowRef}>
            {copies.map((c) =>
              aboutTextKeys.map((key, i) => (
                <div className="about-item-text" key={`${key}-${c}`} aria-hidden={c !== 0}>
                  <div className="about-number">{String(i + 1).padStart(3, '0')}</div>
                  <p className="about-text">{t(key)}</p>
                </div>
              )),
            )}
          </div>
        )}
      </div>

      {isMobile && (
        <div className="about-texts-stack">
          {aboutTextKeys.map((key, i) => (
            <div className="about-item-text" key={key}>
              <div className="about-number">{String(i + 1).padStart(3, '0')}</div>
              <p className="about-text">{t(key)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* The first Font cluster (texts 1–4 + their images). On desktop it is a
   two-column masonry where the columns stagger the pairs; on mobile that
   staggering would scramble the reading order, so the pairs are emitted as a
   single column in narrative order, each image above its own caption. */
function FontIntroCluster() {
  const { t } = useLang()
  const isMobile = useIsMobile()

  if (isMobile) {
    // [image, text] in story order: font1→font2→font3→font4 with their photos.
    // The Glyphs screenshot (font4) reads better narrower, with its caption
    // constrained to the same width.
    const pairs = [
      { img: fontImages[1], key: fontTextKeys[0] }, // 1 — при проучването
      { img: fontImages[0], key: fontTextKeys[1] }, // 2 — след тези критерии
      { img: fontImages[3], key: fontTextKeys[2] }, // 3 — за работата в програмата
      { img: fontImages[2], key: fontTextKeys[3], narrow: true }, // 4 — след няколко преработки
    ]
    return (
      <div className="font-cols">
        <div className="font-col">
          {pairs.map(({ img, key, narrow }) => (
            <Fragment key={key}>
              <img
                src={img}
                alt=""
                className={narrow ? 'font-col-img font-col-img-narrow' : 'font-col-img'}
              />
              <p className={narrow ? 'font-text font-text-narrow' : 'font-text'}>{t(key)}</p>
            </Fragment>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="font-cols">
      <div className="font-col">
        <img src={fontImages[0]} alt="" className="font-col-img" />
        <p className="font-text">{t(fontTextKeys[1])}</p>
        <img src={fontImages[2]} alt="" className="font-col-img" />
        <p className="font-text">{t(fontTextKeys[3])}</p>
      </div>
      <div className="font-col">
        <img src={fontImages[1]} alt="" className="font-col-img" />
        <p className="font-text">{t(fontTextKeys[0])}</p>
        <img src={fontImages[3]} alt="" className="font-col-img" />
        <p className="font-text">{t(fontTextKeys[2])}</p>
      </div>
    </div>
  )
}

function Landing() {
  const { t, lang, toggle } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const pageRef = useRef(null)
  const isMobile = useIsMobile()

  // Soft snap between the hero and the About section: a small scroll (≈15% of
  // the viewport) commits to the next/previous panel, while everything below
  // About scrolls freely. This replaces CSS scroll-snap for that transition so
  // the snap can trigger after far less scrolling than `proximity` allows,
  // without the all-or-nothing grabbiness of `mandatory`.
  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    const about = page.querySelector('.about-section')
    if (!about) return

    const TRIGGER = 0.15 // fraction of the viewport to scroll before it commits
    let locked = false   // ignore scroll events while a programmatic snap runs
    let inFree = false   // true once we've scrolled past About into the free zone
    let stable = 0       // the snap station we're anchored to: 0 (hero) or aboutTop
    let lastTop = page.scrollTop

    const snapTo = (target) => {
      locked = true
      stable = target
      page.scrollTo({ top: target, behavior: 'smooth' })
      const settle = () => {
        if (Math.abs(page.scrollTop - target) < 2) {
          locked = false
          lastTop = page.scrollTop
        } else {
          requestAnimationFrame(settle)
        }
      }
      requestAnimationFrame(settle)
    }

    const onScroll = () => {
      if (locked) return
      const top = page.scrollTop
      const dir = top - lastTop
      lastTop = top
      const aboutTop = about.offsetTop
      const trig = window.innerHeight * TRIGGER

      if (inFree) {
        // Coming back up out of the font section: settle on About, not the hero.
        if (top <= aboutTop) {
          inFree = false
          snapTo(aboutTop)
        }
        return
      }

      if (stable === 0) {
        // At the hero: a small downward nudge commits to About.
        if (dir > 0 && top > trig) snapTo(aboutTop)
      } else {
        // At About: a small upward nudge goes back to the hero; scrolling down
        // releases into the free font section below.
        if (dir < 0 && top < aboutTop - trig) snapTo(0)
        else if (dir > 0 && top > aboutTop + 1) inFree = true
      }
    }

    page.addEventListener('scroll', onScroll, { passive: true })
    return () => page.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="page" ref={pageRef}>
      {/* Top nav */}
      <header className="topnav">
        <div className="topnav-left">
          <a href="#/" className="logo" onClick={closeMenu}>{t('brand.abc')}</a>
          <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
            <a href="#/type" onClick={closeMenu}>{t('nav.typeFoundry')}</a>
            <a href="#/history" onClick={closeMenu}>{t('nav.history')}</a>
            <a href="#/submit" onClick={closeMenu}>{t('nav.submit')}</a>
          </nav>
        </div>
        <div className="topnav-right">
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
        </div>
      </header>

      {/* Hero */}
      <main className="hero">
        <img src={asset('/whale.png')} alt="" className="whale-img" />
        <div className="letters-group">
          {/* poster shows the letters instantly (especially on mobile, where
              there's no hover to start playback) so nothing waits on the video
              download; preload="metadata" keeps the heavy file off the initial
              load until a hover actually plays it. */}
          <video
            className="hero-letters"
            ref={(el) => { if (el) el.playbackRate = 0.7 }}
            loop
            muted
            playsInline
            preload="metadata"
            poster={asset('/hero-poster.png')}
            aria-label="АБВ"
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => e.currentTarget.pause()}
          >
            {isSafari ? (
              <source src={asset('/hero-animation-bg.mp4')} type="video/mp4" />
            ) : (
              <>
                <source src={asset('/hero-animation.webm')} type="video/webm" />
                <source src={asset('/hero-animation-bg.mp4')} type="video/mp4" />
              </>
            )}
          </video>
        </div>
        <p className="tagline">{t('landing.tagline')}</p>
      </main>

      {/* Footer ornament sitting just above the About section */}
      <img src={asset('/footer black.png')} alt="" className="footer-mark about-mark" />

      {/* About section with horizontally scrollable, looping images + texts */}
      <AboutStrip />

      {/* The Font section */}
      <section className="font-section">
        <h2 className="font-heading">{t('landing.fontHeading')}</h2>

        {/* Two independent columns (masonry-style) on desktop; a single
            narrative-ordered column on mobile (see FontIntroCluster) */}
        <FontIntroCluster />

        {/* Images 5 & 6 side by side, 50% each */}
        <div className="font-pair">
          <img src={fontImages[4]} alt="" className="font-pair-img" />
          <img src={fontImages[5]} alt="" className="font-pair-img" />
        </div>
        <p className="font-text">{t(fontTextKeys[4])}</p>

        {/* Images 7 & 8 in two columns; text 6 sits under image 7 (left).
            On mobile the order flips: image 8 full-width on top, then image 7. */}
        <div className="font-cols font-cols-rev font-cols-rev-wide">
          <div className="font-col">
            <img src={fontImages[6]} alt="" className="font-col-img" />
            <p className="font-text">{t(fontTextKeys[5])}</p>
          </div>
          <div className="font-col">
            <img src={fontImages[7]} alt="" className="font-col-img" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Images 9 & 10 in two columns; image 9 smaller (bottom-right), text 7 under image 10 */}
        <div className="font-cols font-cols-stretch">
          <div className="font-col font-col-cr">
            <img src={fontImages[8]} alt="" className="font-col-img" style={{ width: '50%' }} />
          </div>
          <div className="font-col">
            <img src={fontImages[9]} alt="" className="font-col-img" />
            <p className="font-text">{t(fontTextKeys[6])}</p>
          </div>
        </div>

        {/* Images 11 & 12: text 8 under image 11; image 12 top, centered.
            On mobile image 12 (kept at 75%, centered) stacks above image 11. */}
        <div className="font-cols font-cols-rev">
          <div className="font-col">
            <img src={fontImages[10]} alt="" className="font-col-img" />
            <p className="font-text">{t(fontTextKeys[7])}</p>
          </div>
          <div className="font-col font-col-ct">
            <img src={fontImages[11]} alt="" className="font-col-img" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Image 13 full page; text matches the image width */}
        <div className="font-full">
          <img src={fontImages[12]} alt="" className="font-full-img" />
          <p className="font-text font-full-text">{t(fontTextKeys[8])}</p>
        </div>

        {/* Images 14 & 15: next two texts under each.
            On mobile image 15 + its text stack above image 14 + its text. */}
        <div className="font-cols font-cols-rev">
          <div className="font-col">
            <img src={fontImages[13]} alt="" className="font-col-img" />
            <p className="font-text">{t(fontTextKeys[9])}</p>
          </div>
          <div className="font-col">
            <img src={fontImages[14]} alt="" className="font-col-img" />
            <p className="font-text">{t(fontTextKeys[10])}</p>
          </div>
        </div>

        {/* Sources: clickable cover downloads the PDF; bibliography + links on the right.
            On mobile the heading moves above the cover image. */}
        <div className="sources-block">
          {isMobile && <h3 className="sources-heading sources-heading-top">{t('landing.sourcesHeading')}</h3>}
          <a
            className="sources-cover"
            href={asset('/about/sources.pdf')}
            download="Beron-sources.pdf"
          >
            <img src={asset('/about/sources-cover.jpg')} alt="Източници — корица на книгата" />
          </a>
          <div className="sources-info">
            {!isMobile && <h3 className="sources-heading">{t('landing.sourcesHeading')}</h3>}
            <ul className="sources-list">
              {sources.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <div className="sources-links">
              <ul>
                {sourceLinksLeft.map((l) => (
                  <li key={l}><a href={`https://${l}`} target="_blank" rel="noreferrer">{l}</a></li>
                ))}
              </ul>
              <ul>
                {sourceLinksRight.map((l) => (
                  <li key={l}><a href={`https://${l}`} target="_blank" rel="noreferrer">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Remaining images, two per row */}
        <div className="font-grid">
          {fontImages.slice(15).map((src) => (
            <img src={src} alt="" className="font-grid-img" key={src} />
          ))}
        </div>

        {/* Full-bleed closing poster at the end of the section, rotated 90° */}
        <div className="poster-frame">
          <img src={asset('/about/poster-beron-display.jpg')} alt="Beron Display poster" className="poster-img" />
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}

export default Landing
