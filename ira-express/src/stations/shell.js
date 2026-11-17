import { gsap } from 'gsap'
import { h, esc } from '../core/scope.js'
import { env } from '../core/env.js'

// The shared frame of a station: a hanging name board and a body.
export function shell (id, name, layout = '') {
  const el = h('section', { class: `station st-${id}`, 'aria-label': `Station: ${name}` })
  el.innerHTML = `<div class="sign"><div class="board">${esc(name)}</div></div><div class="body ${layout}"></div>`
  return { el, body: el.querySelector('.body') }
}

export const words = (text) => esc(text).split(' ').map((w) => `<span class="w">${w}</span>`).join(' ')

// A taped paper note holding the final copy of a station.
export function note (paragraphs, cls = '') {
  const el = h('div', { class: `note ${cls}` })
  const list = Array.isArray(paragraphs) ? paragraphs : [paragraphs]
  el.innerHTML = `<span class="tape tape-top"></span>${list.map((p, i) => `<p class="${i ? 'p2' : ''}">${words(p)}</p>`).join('')}`
  return el
}

// Must run after the note is displayed: GSAP re-inserts display:none targets to
// measure them, which shuffles the spaces between word spans.
export function revealNote (el, S, at = 0) {
  el.style.display = ''
  const ws = el.querySelectorAll('.w')
  const tl = S.timeline({ delay: at })
  if (env.reduced) return tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 })
  tl.fromTo(el, { autoAlpha: 0, y: 26, rotation: -4, scale: 0.94 }, { autoAlpha: 1, y: 0, rotation: -1, scale: 1, duration: 0.8, ease: 'back.out(1.4)' })
    .fromTo(ws, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, stagger: Math.min(0.03, 1.4 / ws.length), ease: 'power2.out' }, 0.25)
  return tl
}

export function wiggle (el) {
  if (env.reduced) return gsap.fromTo(el, { opacity: 0.5 }, { opacity: 1, duration: 0.4 })
  return gsap.timeline()
    .to(el, { rotation: -8, duration: 0.07, transformOrigin: '50% 100%' })
    .to(el, { rotation: 7, duration: 0.09 })
    .to(el, { rotation: -4, duration: 0.08 })
    .to(el, { rotation: 2, duration: 0.07 })
    .to(el, { rotation: 0, duration: 0.08 })
}

export function shake (el) {
  if (env.reduced) return gsap.fromTo(el, { opacity: 0.4 }, { opacity: 1, duration: 0.4 })
  return gsap.timeline()
    .to(el, { x: -12, duration: 0.06 }).to(el, { x: 10, duration: 0.07 })
    .to(el, { x: -7, duration: 0.06 }).to(el, { x: 4, duration: 0.06 }).to(el, { x: 0, duration: 0.06 })
}

// Screen position of an element's point (fractions of its box), for particles.
export function at (el, fx = 0.5, fy = 0.5) {
  const r = el.getBoundingClientRect()
  return [r.left + r.width * fx, r.top + r.height * fy]
}

// Fade the game out and the note in, in the same spot.
export function swap (S, out, noteEl) {
  const tl = S.timeline()
  tl.to(out, { autoAlpha: 0, y: env.reduced ? 0 : -14, scale: env.reduced ? 1 : 0.97, duration: 0.45, ease: 'power2.in' })
  tl.add(() => { out.style.display = 'none'; revealNote(noteEl, S) })
  return tl
}
