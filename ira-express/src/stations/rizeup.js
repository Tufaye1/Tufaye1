import { gsap } from 'gsap'
import { h, esc, createScope } from '../core/scope.js'
import { env, pick } from '../core/env.js'
import { copy } from '../content.js'
import { desk, shelf, chair, bag, shoes } from '../art/art.js'
import { polaroid } from '../ui/polaroid.js'
import { shell, note, swap, wiggle, at } from './shell.js'

const ORDER = ['shelf', 'desk', 'chair', 'bag']
const HIDE_IN = 'bag'

export default {
  sky: 'morning',
  photos: ['office'],
  create (ctx) {
    const S = createScope()
    const { guide, sfx, fx } = ctx
    const t = copy.rizeup
    const { el, body } = shell('rizeup', 'RizeUp', 'two')
    const media = h('div', { class: 'media' })
    media.append(polaroid('office', { rot: -5, cls: 'pol-main' }))
    const play = h('div', { class: 'play' })
    play.innerHTML = `
      <div class="card game">
        <div class="game-head">
          <h2 class="game-title">${esc(t.title)}</h2>
          <p class="timer"><span class="clock">00:00</span> ${esc(t.timer)}</p>
        </div>
        <div class="office">
          <div class="office-wall"></div><div class="office-floor"></div>
          <div class="office-window"></div>
          <div class="corkboard"><span>day 1 ✿</span></div>
          <button type="button" class="obj obj-shelf" data-obj="shelf" aria-label="Search the shelf">${shelf}</button>
          <button type="button" class="obj obj-desk" data-obj="desk" aria-label="Search the desk">${desk}</button>
          <button type="button" class="obj obj-chair" data-obj="chair" aria-label="Search the chair">${chair}</button>
          <div class="shoes" aria-hidden="true">${shoes}</div>
          <button type="button" class="obj obj-bag" data-obj="bag" aria-label="Search the bag">${bag}</button>
        </div>
      </div>`
    const n = note(t.note)
    n.style.display = 'none'
    play.append(n)
    body.append(media, play)

    const game = play.querySelector('.game')
    const office = play.querySelector('.office')
    const clock = play.querySelector('.clock')
    const shoesEl = play.querySelector('.shoes')
    const searched = new Set()
    let found = false
    let started = false
    let t0 = 0
    let fakeSec = 0
    let shown = ''

    const show = (sec) => {
      const s = Math.min(1800, Math.floor(sec))
      const txt = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
      if (txt !== shown) { clock.textContent = txt; shown = txt }
    }
    // Fake timer: one real second is one minute of panic. Stops at 30:00.
    const tick = () => {
      if (!started || found) return
      fakeSec = Math.min(1800, (gsap.ticker.time - t0) * 60)
      show(fakeSec)
      if (fakeSec >= 1800 && !el.dataset.hinted) { el.dataset.hinted = '1'; guide.say('Psst… check the bag', { key: 'Enter' }) }
    }

    const nope = (obj) => {
      const tag = h('span', { class: 'nope' }, esc(pick(t.nope)))
      const r = obj.getBoundingClientRect(); const o = office.getBoundingClientRect()
      tag.style.left = `${((r.left + r.width / 2 - o.left) / o.width) * 100}%`
      tag.style.top = `${((r.top - o.top) / o.height) * 100}%`
      office.append(tag)
      S.fromTo(tag, { autoAlpha: 0, y: 6, xPercent: -50 }, { autoAlpha: 1, y: -14, duration: 0.35, ease: 'back.out(2)' })
      S.to(tag, { autoAlpha: 0, y: -24, duration: 0.4, delay: 0.9, onComplete: () => tag.remove() })
    }

    const search = (name) => {
      if (found) return
      const obj = office.querySelector(`[data-obj="${name}"]`)
      if (name !== HIDE_IN) {
        sfx.boop()
        S.add(wiggle(obj))
        nope(obj)
        searched.add(name)
        obj.classList.add('searched')
        return
      }
      found = true
      sfx.pop()
      office.classList.add('is-found')
      const tl = S.timeline()
      tl.add(wiggle(obj))
      tl.fromTo(shoesEl, { autoAlpha: 0, y: 30, scale: 0.4, rotation: -20 },
        { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: env.reduced ? 0.4 : 0.75, ease: 'back.out(2.2)' }, 0.25)
      tl.add(() => { sfx.ding(); const [x, y] = at(shoesEl); fx.burst(x, y, { n: 26, speed: 4.5, g: 0.08, life: 50, shape: 'heart', s: 9 }) }, 0.5)
      // The clock races to the legendary 30:00.
      const c = { v: fakeSec }
      tl.to(c, { v: 1800, duration: 0.9, ease: 'power2.out', onUpdate: () => show(c.v) }, 0.3)
      tl.add(() => play.querySelector('.timer').classList.add('done'), 1.2)
      tl.add(() => { guide.hide(); swap(S, game, n) }, 2.3)
      tl.add(() => ctx.complete({ delay: 1.6 }), 2.4)
    }

    office.querySelectorAll('.obj').forEach((b) => S.on(b, 'click', (e) => { e.stopPropagation(); search(b.dataset.obj) }))

    return {
      el,
      start () {
        started = true
        t0 = gsap.ticker.time
        S.tick(tick)
        guide.say(copy.guide.shoes, { key: 'Enter' })
      },
      primary () { const next = ORDER.find((o) => !searched.has(o)); if (next) search(next) },
      destroy () { S.kill() },
    }
  },
}
