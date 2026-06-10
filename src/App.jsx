import { useEffect, useState } from 'react'
import Landing from './Landing'
import TypeFoundry from './TypeFoundry'
import History from './History'
import Submit from './Submit'
import { LanguageProvider } from './i18n'

function getRoute() {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  return hash.split('?')[0]
}

function App() {
  const [route, setRoute] = useState(getRoute())

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Jump to top whenever the route changes
  useEffect(() => { window.scrollTo(0, 0) }, [route])

  let page = <Landing />
  if (route === '/type') page = <TypeFoundry />
  else if (route === '/history') page = <History />
  else if (route === '/submit') page = <Submit />

  return <LanguageProvider>{page}</LanguageProvider>
}

export default App
