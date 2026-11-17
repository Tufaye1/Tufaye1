import { gsap } from 'gsap'
import { h, esc, createScope } from '../core/scope.js'
import { env } from '../core/env.js'
import { copy } from '../content.js'
import { polaroid } from '../ui/polaroid.js'
import { shell, note, revealNote, at } from './shell.js'
import { SPEED } from '../world/world.js'

const HOLD = 2 // seconds

export default {
  sky: 'night',
  speed: SPEED.slow,
  musicLevel: 0.4,
  photos: ['conference'],
  create (ctx) {
    const S = createScope()
    const { guide, sfx, fx } = ctx
    const t = copy.promise
    const { el, body } = shell('promise', 'Promise', 'two')
    const media = h('div', { class: 'media' })
    media.append(polaroid('conference', { rot: 4, cls: 'pol-main' }))
    const play = h('div', { class: 'play' })
    play.innerHTML = `
      <div class="promise-box">
        <button type="button" class="hold-btn" aria-label="Hold to promise">
          <span class="hold-fill" aria-hidden="true"></span>
          <span class="hold-label">${esc(t.button)}</span>
        </button>
        <p class="hold-sub" aria-hidden="true">keep holding…</p>
      </div>`
    const n = note([t.note, t.note2], 'note-promise')
    n.style.display = 'none'
    play.append(n)
    body.append(media, play)
    const star = h('div', { class: 'shooting-star', 'aria-hidden': 'true' })
    el.prepend(star)
    const btn = play.querySelector('.hold-btn')
    const fill = play.querySelector('.hold-fill')
    const sub = play.querySelector('.hold-sub')
    const box = play.querySelector('.promise-box')
    let tw = null
    let done = false
    gsap.set(fill, { scaleX: 0 })

    const success = () => {
      done = true
      btn.classList.add('is-done')
      btn.disabled = true
      try { navigator.vibrate?.(40) } catch { /* not allowed here */ }
      sfx.sparkle()
      guide.hide()
      const [x, y] = at(btn)
      fx.burst(x, y, { n: 40, speed: 5.5, g: 0.04, life: 70, shape: 'heart', s: 10 })
      const tl = S.timeline({ delay: 0.6 })
      tl.to(box, { autoAlpha: 0, scale: 0.9, duration: 0.5, ease: 'power2.in' })
        .add(() => { box.style.display = 'none'; revealNote(n, S) })
        // "We will shine together": a shooting star crosses the sky.
        .add(() => { if (!env.reduced) shoot() }, '+=1.4')
      ctx.complete({ delay: 4.6 })
    }

    const shoot = () => {
      const W = el.clientWidth
      S.fromTo(star, { x: W * 0.85, y: el.clientHeight * 0.05, autoAlpha: 0 },
        { x: W * 0.15, y: el.clientHeight * 0.32, autoAlpha: 1, duration: 1.3, ease: 'power1.in' })
      S.to(star, { autoAlpha: 0, duration: 0.4, delay: 1 })
    }

    const press = (on) => {
      if (done) return
      tw?.kill()
      btn.classList.toggle('is-holding', on)
      const cur = gsap.getProperty(fill, 'scaleX')
      if (on) {
        sfx.unlock()
        S.to(sub, { autoAlpha: 1, duration: 0.3 })
        tw = S.to(fill, { scaleX: 1, duration: HOLD * (1 - cur), ease: 'none', onComplete: success })
      } else {
        S.to(sub, { autoAlpha: 0, duration: 0.3 })
        tw = S.to(fill, { scaleX: 0, duration: Math.max(0.2, cur * 0.6), ease: 'power2.out' })
      }
    }

    S.on(btn, 'pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); btn.setPointerCapture?.(e.pointerId); press(true) })
    S.on(btn, 'pointerup', () => press(false))
    S.on(btn, 'pointercancel', () => press(false))
    S.on(btn, 'lostpointercapture', () => press(false))
    S.on(btn, 'click', (e) => e.preventDefault())

    return {
      el,
      start () {
        guide.say(copy.guide.promise, { key: 'Hold Space' })
        S.fromTo(btn, { scale: 0.92, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2)' })
      },
      holdKey (down) { if (done) return false; press(down); return true },
      destroy () { S.kill() },
    }
  },
}
