import { env } from './env.js'

// Sets --w/--h/--m (1% of width / height / min side) from the real visible size.
// Using JS instead of vh avoids mobile browser toolbars eating the bottom of the stage.
export function initViewport (onResize) {
  const root = document.documentElement
  let t = 0
  const apply = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    env.w = w
    env.h = h
    env.portrait = w / h < 1.05
    root.style.setProperty('--w', `${w / 100}px`)
    root.style.setProperty('--h', `${h / 100}px`)
    root.style.setProperty('--m', `${Math.min(w, h) / 100}px`)
    root.classList.toggle('portrait', env.portrait)
    root.classList.toggle('landscape', !env.portrait)
    root.classList.toggle('short', !env.portrait && h < 560)
    root.classList.toggle('tight', env.portrait && h < 700)
    onResize?.(w, h)
  }
  const schedule = () => { clearTimeout(t); t = setTimeout(apply, 120) }
  window.addEventListener('resize', schedule)
  window.addEventListener('orientationchange', () => setTimeout(apply, 250))
  window.visualViewport?.addEventListener('resize', schedule)
  apply()
}
