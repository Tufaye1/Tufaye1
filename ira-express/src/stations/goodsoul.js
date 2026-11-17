import { gsap } from 'gsap'
import { h, esc, createScope } from '../core/scope.js'
import { env, clamp } from '../core/env.js'
import { copy } from '../content.js'
import { polaroid } from '../ui/polaroid.js'
import { shell } from './shell.js'
import { SPEED } from '../world/world.js'

const PER_LINE = 2.8 // seconds of holding per line

export default {
  sky: 'golden',
  speed: SPEED.slow,
  musicLevel: 0.3,
  photos: ['smile'],
  create (ctx) {
    const S = createScope()
    const { guide, sfx, world } = ctx
    const lines = copy.goodsoul.lines
    const { el, body } = shell('goodsoul', 'Good soul', 'two')
    el.classList.add('quiet')
    const media = h('div', { class: 'media' })
    media.append(polaroid('smile', { rot: -3, cls: 'pol-main' }))
    const play = h('div', { class: 'play' })
    play.innerHTML = `
      <div class="letter">
        ${lines.map((l) => `<p class="line">${esc(l).split(' ').map((w) => `<span class="lw">${w}</span>`).join(' ')}</p>`).join('')}
        <p class="hold-hint" aria-hidden="true">hold anywhere ♡</p>
        <div class="hold-bar" aria-hidden="true"><span></span></div>
      </div>`
    body.append(media, play)
    const orb = h('div', { class: 'orb', 'aria-hidden': 'true' })
    el.append(orb)
    const lineEls = [...play.querySelectorAll('.line')]
    const wordEls = lineEls.map((l) => [...l.querySelectorAll('.lw')])
    const bar = play.querySelector('.hold-bar span')
    const sr = h('p', { class: 'sr-only', 'aria-live': 'polite' })
    play.append(sr)
    let p = 0
    let holding = false
    let done = false
    let shownLines = 0
    let sky = null
    let ready = false

    const render = () => {
      wordEls.forEach((ws, i) => {
        const lp = clamp(p - i, 0, 1)
        const n = ws.length
        ws.forEach((w, j) => {
          const a = clamp(lp * (n + 3) - j, 0, 1)
          w.style.opacity = String(a)
          if (!env.reduced) w.style.transform = `translateY(${(1 - a) * 8}px)`
        })
      })
      gsap.set(bar, { scaleX: p / lines.length })
      sky?.progress(clamp(p / lines.length, 0, 1))
      const whole = Math.floor(p + 0.001)
      if (whole > shownLines) {
        shownLines = whole
        sr.textContent = lines[whole - 1] || ''
        sfx.chime()
      }
    }

    const hold = (on, x, y) => {
      if (!ready) return
      if (done) return
      holding = on
      el.classList.toggle('is-holding', on)
      if (on) gsap.to(play.querySelector('.hold-hint'), { autoAlpha: 0, duration: 0.4 })
      if (on) {
        const r = el.getBoundingClientRect()
        const ox = x != null ? x - r.left : r.width * (env.portrait ? 0.5 : 0.7)
        const oy = y != null ? y - r.top : r.height * 0.5
        gsap.set(orb, { x: ox, y: oy })
        gsap.to(orb, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' })
      } else {
        gsap.to(orb, { autoAlpha: 0, scale: 0.6, duration: 0.6 })
      }
    }

    const tick = (time, dtMs) => {
      if (!holding || done) return
      p = Math.min(lines.length, p + Math.min(dtMs, 200) / 1000 / PER_LINE)
      render()
      if (p >= lines.length) {
        done = true
        holding = false
        el.classList.remove('is-holding')
        gsap.to(orb, { autoAlpha: 0, scale: 1.6, duration: 1 })
        gsap.to(play.querySelector('.hold-bar'), { autoAlpha: 0, duration: 0.8 })
        ctx.complete({ delay: 1.6 })
      }
    }

    S.on(el, 'pointerdown', (e) => { e.preventDefault(); hold(true, e.clientX, e.clientY) })
    S.on(window, 'pointerup', () => hold(false))
    S.on(window, 'pointercancel', () => hold(false))
    S.on(window, 'blur', () => hold(false))

    return {
      el,
      start () {
        world.setSpeed(SPEED.slow, 3)
        sky = world.scrubSky('night')
        sky.progress(0)
        render()
        S.tick(tick)
        S.delay(0.4, () => { ready = true; guide.say(copy.guide.hold, { key: 'Hold Space', quiet: true }) })
      },
      holdKey (down) { if (done) return false; hold(down); return true },
      destroy () {
        S.kill()
        if (sky) { sky.progress(1); world.setSky('night', 0) }
      },
    }
  },
}
