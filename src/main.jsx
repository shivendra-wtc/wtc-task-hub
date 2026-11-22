import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Fade out the opening animation once the app has drawn, but keep it at least ~2.2 s so
// the animation can be seen (and never longer than 6 s, even on a slow connection).
;(function hideSplash() {
  const el = document.getElementById('wtc-splash')
  if (!el) return
  let hidden = false
  const done = () => {
    if (hidden) return
    hidden = true
    el.classList.add('hide')
    setTimeout(() => el.remove(), 700)
  }
  const minMs = 2200 // from the moment the app window opened
  const whenReady = () => setTimeout(done, Math.max(0, minMs - performance.now()))
  if (document.readyState === 'complete') whenReady()
  else window.addEventListener('load', whenReady, { once: true })
  setTimeout(done, 6000)
})()
