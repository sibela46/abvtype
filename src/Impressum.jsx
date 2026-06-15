import { useState } from 'react'
// Reuses the Submit page shell (top bar + light centred layout)
import './Submit.css'
import './Impressum.css'
import { useLang } from './i18n'
import SiteFooter from './SiteFooter'

// The right card is always the German "Impressum"; the left card follows the
// site language (English or Bulgarian) and is built from translations below.
const EMAIL = 'abvtype@gmail.com'

const impressum = {
  heading: 'Impressum',
  intro: 'Informationen über den Diensteanbieter.',
  address: ['Antonia Danailova', 'Gärtnergasse 9', '55116 Mainz,', 'Deutschland'],
  creditsHeading: 'Bildnachweis',
  creditsBody: 'Die Bilder, Fotos und Grafiken auf dieser Webseite sind urheberrechtlich geschützt.',
  rightsLabel: 'Die Bilderrechte liegen bei:',
  rightsName: 'Antonia Danailova',
  textsNote: 'Alle Texte sind urheberrechtlich geschützt.',
}

function ImpressumCard({ c }) {
  return (
    <section className="impressum-card">
      <h2 className="impressum-card-title">{c.heading}</h2>
      <p className="impressum-intro">{c.intro}</p>
      <p className="impressum-address">
        {c.address.map((line, i) => (
          <span key={i}>{line}<br /></span>
        ))}
      </p>
      <p>Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
      <div className="impressum-block">
        <h3 className="impressum-h">{c.creditsHeading}</h3>
        <p>{c.creditsBody}</p>
      </div>
      <p>{c.rightsLabel}<br />{c.rightsName}</p>
      <p>{c.textsNote}</p>
    </section>
  )
}

function Impressum() {
  const { t, lang, toggle } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  // Left card: translated to whichever site language is active
  const legalNotice = {
    heading: t('legal.heading'),
    intro: t('legal.intro'),
    address: [t('legal.name'), t('legal.street'), t('legal.city'), t('legal.country')],
    creditsHeading: t('legal.creditsHeading'),
    creditsBody: t('legal.creditsBody'),
    rightsLabel: t('legal.rightsLabel'),
    rightsName: t('legal.name'),
    textsNote: t('legal.textsNote'),
  }

  return (
    <div className="submit impressum">
      {/* Top navigation bar (same as the other pages) */}
      <header className="topbar">
        <a href="#/" className="logo" onClick={closeMenu}>{t('brand.abc')}</a>
        <nav className={`menu${menuOpen ? ' open' : ''}`}>
          <a href="#/type" onClick={closeMenu}>{t('nav.typeFoundry')}</a>
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

      <main className="submit-main">
        <div className="impressum-cards">
          <ImpressumCard c={legalNotice} />
          <ImpressumCard c={impressum} />
        </div>
      </main>

      <SiteFooter theme="light" />
    </div>
  )
}

export default Impressum
