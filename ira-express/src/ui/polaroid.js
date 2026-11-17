import { photos } from '../content.js'
import { h, esc } from '../core/scope.js'
import { heartDoodle, doodles } from '../art/art.js'

const DIR = 'photos/'

export function photoUrl (key) { return DIR + photos[key].src }

// A taped polaroid. `blank` starts undeveloped (Happy station).
export function polaroid (key, { rot = 0, cls = '', caption = true, blank = false, tape = 'top' } = {}) {
  const p = photos[key]
  const el = h('figure', { class: `polaroid ${cls}${blank ? ' is-blank' : ''}`, 'data-photo': key })
  el.innerHTML = `
    ${tape === 'top' ? '<span class="tape tape-top"></span>' : '<span class="tape tape-l"></span><span class="tape tape-r"></span>'}
    <div class="ph">
      <div class="ph-missing">${doodles[key] || heartDoodle}</div>
      <img alt="${esc(p.alt)}" decoding="async" draggable="false" style="object-position:${p.pos || '50% 40%'}">
      ${blank ? '<div class="ph-dev"></div>' : ''}
    </div>
    ${caption && p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}`
  const img = el.querySelector('img')
  img.addEventListener('error', () => {
    if (p.fallback && !img.dataset.fb) { img.dataset.fb = '1'; img.src = DIR + p.fallback; return }
    el.classList.add('is-missing')
  })
  img.src = photoUrl(key)
  el.style.setProperty('--rot', `${rot}deg`)
  return el
}

export function sticker (key, cls = '') {
  const p = photos[key]
  const el = h('div', { class: `sticker ${cls}` })
  const img = h('img', { alt: p.alt, draggable: 'false', decoding: 'async' })
  img.addEventListener('error', () => {
    if (p.fallback && !img.dataset.fb) { img.dataset.fb = '1'; img.src = DIR + p.fallback; el.classList.add('is-square'); return }
    el.remove()
  })
  img.src = photoUrl(key)
  el.append(img)
  return el
}

// Warm the cache so polaroids appear instantly when a station arrives.
export function preload (keys) {
  return Promise.all(keys.map((k) => new Promise((res) => {
    const img = new Image()
    img.onload = img.onerror = () => res()
    img.src = photoUrl(k)
    img.decode?.().then(res, res)
  })))
}
