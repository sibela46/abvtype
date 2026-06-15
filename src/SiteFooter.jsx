import { useLang } from './i18n'
import { asset } from './asset'

// Site-wide footer shared by every page.
// theme="dark"  → dark band, white ornament (default; pages with a light body).
// theme="light" → transparent (inherits the page), black ornament + dark text.
// Impressum sits at the bottom-left, the copyright at the bottom-right, both
// aligned with the bottom line of the centred text.
export default function SiteFooter({ theme = 'dark' }) {
  const { t } = useLang()
  const mark = theme === 'light' ? '/footer black.png' : '/footer white.png'
  return (
    <footer className={`site-footer${theme === 'light' ? ' site-footer--light' : ''}`}>
      <img className="footer-mark" src={asset(mark)} alt="" />
      <p>{t('footer.project')}</p>
      <p>{t('footer.credits')}</p>
      <a className="footer-impressum" href="#/impressum">{t('footer.impressum')}</a>
      <p className="footer-rights">{t('footer.rights')}</p>
    </footer>
  )
}
