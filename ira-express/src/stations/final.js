import { gsap } from 'gsap'
import { h, esc, createScope } from '../core/scope.js'
import { env, rand } from '../core/env.js'
import { copy } from '../content.js'
import { cake, lamp, flame } from '../art/art.js'
import { polaroid } from '../ui/polaroid.js'
import { shell, words, at } from './shell.js'
import { SPEED } from '../world/world.js'

const LAMPS = 6

export default {
  sky: 'night',
  speed: SPEED.stop,
  musicLevel: 0.65,
  photos: ['hearts'],
  create (ctx) {
    const S = createScope()
    const { guide, sfx, fx, skyfx, world, director } = ctx
    const t = copy.final
    const { el, body } = shell('final', '18 November', 'one')
    el.insertAdjacentHTML('afterbegin', `
      <div class="platform" aria-hidden="true">
        <div class="lamps">${Array.from({ length: LAMPS }, () => `<div class="lamp">${lamp}<span class="lamp-glow"></span></div>`).join('')}</div>
        <div class="platform-floor"><span class="safety"></span></div>
      </div>`)
    body.innerHTML = `
      <p class="priority">${words(t.priority)}</p>
      <div class="cake-wrap">
        <div class="cake">${cake}
          ${[0, 1, 2].map((i) => `<div class="flame" data-i="${i}"><div class="flame-in">${flame}</div></div>`).join('')}
          ${[0, 1, 2].map((i) => `<button type="button" class="candle-btn" data-i="${i}" aria-label="Blow out candle ${i + 1}"></button>`).join('')}
        </div>
      </div>
      <div class="finale">
        <div class="finale-photo"></div>
        <div class="finale-text">
          <h1 class="hb">${words(t.title)}</h1>
          <p class="from">${esc(t.from)}</p>
          <button type="button" class="again">${esc(t.again)} <span aria-hidden="true">↻</span></button>
        </div>
      </div>`
    const pol = polaroid('hearts', { rot: -4, cls: 'pol-final', tape: 'corners' })
    body.querySelector('.finale-photo').append(pol)
    const priority = body.querySelector('.priority')
    const cakeWrap = body.querySelector('.cake-wrap')
    const flames = [...body.querySelectorAll('.flame')]
    const candleBtns = [...body.querySelectorAll('.candle-btn')]
    const finale = body.querySelector('.finale')
    const again = body.querySelector('.again')
    const out = new Set()
    let ready = false
    let celebrating = false

    // Candle flames flicker (transform only).
    flames.forEach((f, i) => {
      if (!env.reduced) S.to(f.querySelector('.flame-in'), { scaleY: 1.12, scaleX: 0.9, duration: 0.12 + i * 0.03, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 85%' })
    })

    const blow = (i) => {
      if (!ready || out.has(i) || celebrating) return
      out.add(i)
      sfx.poof()
      const f = flames[i]
      candleBtns[i].disabled = true
      const [x, y] = at(f, 0.5, 0.55)
      S.to(f, { scale: 0, autoAlpha: 0, duration: 0.35, ease: 'power2.in', transformOrigin: '50% 80%' })
      fx.smoke(x, y)
      if (out.size === 3) celebrate()
    }

    const celebrate = () => {
      celebrating = true
      guide.hide()
      const tl = S.timeline({ delay: 0.9 })
      tl.add(() => { fireworks(); fx.confetti(env.lowPower ? 90 : 160); sfx.boom() })
        .to(cakeWrap, { autoAlpha: 0, y: env.reduced ? 0 : 40, scale: env.reduced ? 1 : 0.9, duration: 0.7, ease: 'power2.in' }, 0.4)
        .to(priority, { autoAlpha: 0, duration: 0.5 }, 0.4)
        .add(() => { cakeWrap.style.display = 'none'; priority.style.display = 'none'; finale.classList.add('on') })
        .fromTo(pol, { autoAlpha: 0, y: env.reduced ? 0 : 80, rotation: -18, scale: 0.7 }, { autoAlpha: 1, y: 0, rotation: -4, scale: 1, duration: 1.1, ease: 'back.out(1.4)' })
        .fromTo(finale.querySelectorAll('.hb .w'), { autoAlpha: 0, y: 18, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2)' }, '-=0.3')
        .fromTo(finale.querySelector('.from'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.7 }, '+=0.2')
        .fromTo(again, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6 }, '+=0.6')
        .add(() => { if (document.activeElement === document.body) again.focus({ preventScroll: true }) })
    }

    // Fireworks keep going, gently slowing down to save battery.
    let shots = 0
    const fireworks = () => {
      const W = el.clientWidth
      const H = window.innerHeight
      const burst = () => {
        shots++
        skyfx.firework(rand(0.12, 0.88) * W, rand(0.1, 0.36) * H)
        if (shots < 8) sfx.boom()
        if (!env.reduced && Math.random() < 0.4) S.delay(0.25, () => skyfx.firework(rand(0.15, 0.85) * W, rand(0.1, 0.3) * H))
        const gap = env.reduced ? 2.6 : shots < 14 ? rand(0.6, 1.2) : shots < 40 ? rand(1.6, 2.6) : rand(3.5, 5)
        S.delay(gap, burst)
      }
      burst()
      S.delay(3, () => fx.confetti(env.lowPower ? 50 : 90))
    }

    candleBtns.forEach((b, i) => S.on(b, 'click', (e) => { e.stopPropagation(); blow(i) }))
    S.on(body.querySelector('.cake'), 'click', () => { const i = [0, 1, 2].find((n) => !out.has(n)); if (i != null) blow(i) })
    S.on(again, 'click', (e) => { e.stopPropagation(); director.restart() })

    return {
      el,
      async start () {
        world.setSpeed(SPEED.stop, 1.5, 'power2.out')
        const lamps = [...el.querySelectorAll('.lamp')]
        const tl = S.timeline()
        lamps.forEach((l, i) => {
          tl.add(() => { l.classList.add('on'); if (i % 2 === 0) sfx.click() }, 0.3 + i * 0.22)
          tl.fromTo(l.querySelector('.lamp-glow'), { opacity: 0 }, { keyframes: [{ opacity: 0.7, duration: 0.06 }, { opacity: 0.15, duration: 0.08 }, { opacity: 1, duration: 0.3 }] }, 0.3 + i * 0.22)
        })
        tl.add(() => el.classList.add('lit'), 0.6)
        tl.fromTo(priority.querySelectorAll('.w'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.09, ease: 'power2.out' }, 1.6)
        tl.add(() => el.classList.add('cake-time'), '+=1.4')
        tl.fromTo(cakeWrap, { autoAlpha: 0, y: env.reduced ? 0 : 60 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'back.out(1.3)' }, '<')
        tl.add(() => { ready = true; guide.say(copy.guide.candles, { key: 'Enter' }) })
      },
      primary () {
        if (celebrating) { if (gsap.getProperty(again, 'opacity') > 0.9) director.restart(); return }
        const i = [0, 1, 2].find((n) => !out.has(n)); if (i != null) blow(i)
      },
      destroy () { S.kill(); fx.clear(); skyfx.clear() },
    }
  },
}
