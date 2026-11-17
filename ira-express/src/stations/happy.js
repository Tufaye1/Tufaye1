import { gsap } from 'gsap'
import { h, esc, createScope } from '../core/scope.js'
import { env } from '../core/env.js'
import { copy } from '../content.js'
import { polaroid } from '../ui/polaroid.js'
import { shell, note, revealNote, at } from './shell.js'

const KEYS = ['river', 'street', 'cake']
const ROTS = [-6, 3, -3]

export default {
  sky: 'golden',
  photos: KEYS,
  create (ctx) {
    const S = createScope()
    const { guide, sfx, fx } = ctx
    const { el, body } = shell('happy', 'Happy', 'one')
    const row = h('div', { class: 'film-row' })
    const pols = KEYS.map((k, i) => {
      const btn = h('button', { type: 'button', class: 'dev-btn', 'aria-label': `Develop photo ${i + 1}` })
      const p = polaroid(k, { rot: ROTS[i], blank: true, cls: 'pol-dev' })
      p.querySelector('.ph').insertAdjacentHTML('beforeend', `<span class="dev-hint">${esc(copy.happy.hint)}</span>`)
      btn.append(p)
      row.append(btn)
      return { btn, p }
    })
    const n = note(copy.happy.note, 'note-short')
    n.style.display = 'none'
    body.append(row, n)
    let count = 0

    const develop = (i) => {
      const { btn, p } = pols[i]
      if (btn.dataset.done) return
      btn.dataset.done = '1'
      btn.setAttribute('aria-label', `Photo ${i + 1}, developed`)
      sfx.whoosh()
      const dev = p.querySelector('.ph-dev')
      const hint = p.querySelector('.dev-hint')
      const cap = p.querySelector('figcaption')
      const tl = S.timeline()
      if (!env.reduced) {
        // Shake it like a polaroid picture.
        tl.to(p, { x: -8, rotation: ROTS[i] - 4, duration: 0.07, repeat: 5, yoyo: true, ease: 'sine.inOut' })
          .to(p, { x: 0, rotation: ROTS[i], duration: 0.15 })
      }
      tl.to(hint, { autoAlpha: 0, duration: 0.2 }, 0)
        .to(dev, { opacity: 0, duration: env.reduced ? 0.6 : 2.2, ease: 'power1.inOut' }, env.reduced ? 0 : 0.4)
        .add(() => p.classList.add('is-developed'), 0.4)
        .fromTo(cap, { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.6 }, env.reduced ? 0.4 : 1.8)
        .add(() => { sfx.sparkle(); const [x, y] = at(p, 0.5, 0.4); fx.burst(x, y, { n: 16, speed: 3, life: 45, s: 2.4, g: 0.02 }) }, env.reduced ? 0.4 : 1.6)
      count++
      if (count === KEYS.length) {
        guide.hide()
        tl.add(() => {
          el.classList.add('is-complete')
          n.style.display = ''
          revealNote(n, S)
        }, '+=0.4')
        ctx.complete({ delay: (env.reduced ? 1 : 3.4) + 1.4 })
      }
    }
    pols.forEach((x, i) => S.on(x.btn, 'click', (e) => { e.stopPropagation(); develop(i) }))

    return {
      el,
      start () { guide.say(copy.guide.develop, { key: 'Enter' }) },
      primary () { const i = pols.findIndex((x) => !x.btn.dataset.done); if (i >= 0) develop(i) },
      destroy () { S.kill() },
    }
  },
}
