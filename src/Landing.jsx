import { useState } from 'react'
import './App.css'
import { useLang } from './i18n'
import { asset } from './asset'

const aboutImages = [
  { src: '/about/about-01-coolfonts.jpg', alt: 'I want to use cool fonts на български', height: '42vh' },
  { src: '/about/about-02-azbuka.png', alt: 'Cyrillic alphabet pages from the Beron primer', height: '44vh' },
  { src: '/about/about-03-glyphs.png', alt: 'Beron typeface in progress in the Glyphs editor', height: '31vh' },
  { src: '/about/about-04-beron-otf.png', alt: 'Beron.otf font file', height: '13vh' },
  { src: '/about/about-05-document.png', alt: 'Cyrillic Matters — thesis document', height: '40vh' },
  { src: '/about/about-06-woodtype.png', alt: 'Hand-cut type and prints', height: '35vh' },
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

function Landing() {
  const { t, lang, toggle } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="page">
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
          <video
            className="hero-letters"
            ref={(el) => { if (el) el.playbackRate = 0.7 }}
            loop
            muted
            playsInline
            aria-label="АБВ"
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => e.currentTarget.pause()}
          >
            <source src={asset('/hero-animation.webm')} type="video/webm" />
            <source src={asset('/hero-animation.mp4')} type="video/mp4" />
          </video>
        </div>
        <p className="tagline">{t('landing.tagline')}</p>
      </main>

      {/* About section with horizontally scrollable images */}
      <section className="about-section">
        <div className="about-backdrop" />

        <h2 className="about-heading">{t('landing.aboutHeading')}</h2>

        <div className="scroll-strip">
          <div className="strip-row strip-images">
            {aboutImages.map((img) => (
              <img
                src={asset(img.src)}
                alt={img.alt}
                className="strip-img"
                style={{ height: img.height }}
                key={img.src}
              />
            ))}
          </div>
          <div className="strip-row strip-texts">
            {aboutTextKeys.map((key, i) => (
              <div className="about-item-text" key={key}>
                <div className="about-number">{String(i + 1).padStart(3, '0')}</div>
                <p className="about-text">{t(key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Font section */}
      <section className="font-section">
        <h2 className="font-heading">{t('landing.fontHeading')}</h2>

        {/* Two independent columns (masonry-style): each text sits directly
            under its own image, so they stagger between the columns */}
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

        {/* Images 5 & 6 side by side, 50% each */}
        <div className="font-pair">
          <img src={fontImages[4]} alt="" className="font-pair-img" />
          <img src={fontImages[5]} alt="" className="font-pair-img" />
        </div>
        <p className="font-text">{t(fontTextKeys[4])}</p>

        {/* Images 7 & 8 in two columns; text 6 sits under image 7 (left) */}
        <div className="font-cols">
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

        {/* Images 11 & 12: text 8 under image 11; image 12 top, centered */}
        <div className="font-cols">
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

        {/* Images 14 & 15: next two texts under each */}
        <div className="font-cols">
          <div className="font-col">
            <img src={fontImages[13]} alt="" className="font-col-img" />
            <p className="font-text">{t(fontTextKeys[9])}</p>
          </div>
          <div className="font-col">
            <img src={fontImages[14]} alt="" className="font-col-img" />
            <p className="font-text">{t(fontTextKeys[10])}</p>
          </div>
        </div>

        {/* Sources: clickable cover downloads the PDF; bibliography + links on the right */}
        <div className="sources-block">
          <a
            className="sources-cover"
            href={asset('/about/sources.pdf')}
            download="Beron-sources.pdf"
          >
            <img src={asset('/about/sources-cover.jpg')} alt="Източници — корица на книгата" />
          </a>
          <div className="sources-info">
            <h3 className="sources-heading">{t('landing.sourcesHeading')}</h3>
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
      <footer className="site-footer">
        <p>{t('footer.project')}</p>
        <p>{t('footer.credits')}</p>
        <p>{t('footer.year')}</p>
      </footer>
    </div>
  )
}

export default Landing
