import { useRef, useState } from 'react'
import './Submit.css'
import { useLang } from './i18n'

// Submissions go to our own backend (server/index.js), which emails them to
// abvtype@gmail.com with the font file attached. In dev, Vite proxies /api to
// the local mail server (see vite.config.js). On a static host like GitHub
// Pages there is no backend, so set VITE_API_BASE at build time to the full
// URL of a deployed mail server (e.g. https://abvtype-api.onrender.com).
const ENDPOINT = `${import.meta.env.VITE_API_BASE ?? ''}/api/submit`

function Submit() {
  const { t, lang, toggle } = useLang()
  const formRef = useRef(null)
  const fileRef = useRef(null)
  const [agreed, setAgreed] = useState(false)
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const [licenseOpen, setLicenseOpen] = useState(false)
  // Whether the license has been expanded at least once (gates the agree tick)
  const [licenseSeen, setLicenseSeen] = useState(false)
  // Alert shown if the user tries to tick before opening the license
  const [showLicenseAlert, setShowLicenseAlert] = useState(false)
  const toggleLicense = () => {
    setLicenseOpen((o) => !o)
    setLicenseSeen(true)
    setShowLicenseAlert(false)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!agreed || status === 'sending') return

    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        body: new FormData(formRef.current),
        headers: { Accept: 'application/json' },
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || `Server responded ${res.status}`)
      setStatus('success')
      formRef.current.reset()
      setFileName('')
      setAgreed(false)
    } catch (err) {
      console.error('Submit failed:', err)
      setStatus('error')
    }
  }

  return (
    <div className="submit">
      {/* Top navigation bar (same as the other pages) */}
      <header className="topbar">
        <a href="#/" className="logo" onClick={closeMenu}>{t('brand.abc')}</a>
        <nav className={`menu${menuOpen ? ' open' : ''}`}>
          <a href="#/type" onClick={closeMenu}>{t('nav.typeFoundry')}</a>
          <a href="#/history" onClick={closeMenu}>{t('nav.history')}</a>
          <a href="#/submit" className="active" onClick={closeMenu}>{t('nav.submit')}</a>
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
        <p className="submit-intro">
          {t('submit.heading1')}<br />
          {t('submit.heading2')}
        </p>

        <form className="submit-form" ref={formRef} onSubmit={onSubmit}>
          <input className="submit-field" type="text" name="name" placeholder={t('submit.name')} required />
          <input className="submit-field" type="email" name="email" placeholder={t('submit.email')} required />

          {/* File picker styled to match the other fields */}
          <button
            type="button"
            className="submit-field submit-file"
            onClick={() => fileRef.current?.click()}
          >
            {fileName || t('submit.file')}
          </button>
          <input
            ref={fileRef}
            type="file"
            name="attachment"
            hidden
            onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
          />

          <textarea className="submit-field submit-message" name="message" placeholder={t('submit.message')} rows={5} />

          {/* License: collapsed to its title + a preview; the arrow expands it */}
          <section
            className={`license-box${licenseOpen ? ' open' : ''}${licenseSeen ? '' : ' unseen'}`}
            aria-label="SIL Open Font License"
          >
            <button
              type="button"
              className="license-toggle"
              onClick={toggleLicense}
              aria-expanded={licenseOpen}
              aria-label={licenseOpen ? 'Collapse license' : 'Expand license'}
            >
              <svg
                className="license-chevron"
                viewBox="0 0 24 24" width="22" height="22"
                fill="none" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <header className="license-head">
              <h2 className="license-title">{t('license.title')}</h2>
              <p className="license-sub">{t('license.version')}</p>
              <p className="license-sub">{t('license.date')}</p>
            </header>

            <div className="license-body">
              <div className="license-cols">
                <div className="license-col">
                  <h3 className="license-h">{t('license.preamble.h')}</h3>
                  <p>{t('license.preamble.p1')}</p>
                  <p>{t('license.preamble.p2')}</p>

                  <h3 className="license-h">{t('license.definitions.h')}</h3>
                  <p>{t('license.definitions.p1')}</p>
                  <p>{t('license.definitions.p2')}</p>
                  <p>{t('license.definitions.p3')}</p>
                  <p>{t('license.definitions.p4')}</p>
                  <p>{t('license.definitions.p5')}</p>
                </div>

                <div className="license-col">
                  <h3 className="license-h">{t('license.permission.h')}</h3>
                  <p>{t('license.permission.intro')}</p>
                  <ul className="license-list">
                    <li>{t('license.permission.li1')}</li>
                    <li>{t('license.permission.li2')}</li>
                    <li>{t('license.permission.li3')}</li>
                    <li>{t('license.permission.li4')}</li>
                    <li>{t('license.permission.li5')}</li>
                  </ul>

                  <h3 className="license-h">{t('license.termination.h')}</h3>
                  <p>{t('license.termination.p')}</p>
                </div>
              </div>

              <div className="license-disclaimer">
                <h3 className="license-h">{t('license.disclaimer.h')}</h3>
                <p>{t('license.disclaimer.p')}</p>
              </div>
            </div>
          </section>

          <button
            type="button"
            className={`submit-field submit-agree${agreed ? ' checked' : ''}`}
            onClick={() => {
              if (!licenseSeen) { setShowLicenseAlert(true); return }
              setAgreed((a) => !a)
            }}
            aria-pressed={agreed}
          >
            <span>{t('submit.agree')}</span>
            <span className="submit-check" aria-hidden="true">✓</span>
          </button>
          {showLicenseAlert && <p className="submit-alert" role="alert">{t('submit.expandFirst')}</p>}

          <button type="submit" className="submit-button" disabled={!agreed || status === 'sending'}>
            {status === 'sending' ? t('submit.sending') : t('submit.submit')}
          </button>

          {status === 'success' && <p className="submit-status submit-status-ok">{t('submit.success')}</p>}
          {status === 'error' && <p className="submit-status submit-status-err">{t('submit.error')}</p>}
        </form>
      </main>
    </div>
  )
}

export default Submit
