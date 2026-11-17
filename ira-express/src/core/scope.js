import { gsap } from 'gsap'

// Tracks a scene's tweens, timers and listeners so leaving a scene cleans everything up.
export function createScope () {
  const tweens = []
  const offs = []
  const raf = []
  return {
    add (t) { tweens.push(t); return t },
    to (...a) { return this.add(gsap.to(...a)) },
    from (...a) { return this.add(gsap.from(...a)) },
    fromTo (...a) { return this.add(gsap.fromTo(...a)) },
    timeline (o) { return this.add(gsap.timeline(o)) },
    delay (s, fn) { return this.add(gsap.delayedCall(s, fn)) },
    wait (s) { return new Promise((res) => this.delay(s, res)) },
    on (el, type, fn, opts) {
      el.addEventListener(type, fn, opts)
      offs.push(() => el.removeEventListener(type, fn, opts))
    },
    tick (fn) { gsap.ticker.add(fn); raf.push(fn) },
    untick (fn) { gsap.ticker.remove(fn) },
    kill () {
      tweens.forEach((t) => t.kill())
      offs.forEach((f) => f())
      raf.forEach((f) => gsap.ticker.remove(f))
      tweens.length = offs.length = raf.length = 0
    },
  }
}

export function h (tag, attrs = {}, html = '') {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue
    if (k === 'class') el.className = v
    else if (k === 'style') el.style.cssText = v
    else el.setAttribute(k, v === true ? '' : v)
  }
  if (html) el.innerHTML = html
  return el
}

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
