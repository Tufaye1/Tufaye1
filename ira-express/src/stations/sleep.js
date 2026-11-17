import { gsap } from 'gsap'
import { h, createScope } from '../core/scope.js'
import { env, clamp } from '../core/env.js'
import { copy } from '../content.js'
import { pillow, blanket } from '../art/art.js'
import { polaroid } from '../ui/polaroid.js'
import { shell, note, swap, at } from './shell.js'

const START = -27
const SNAP = 4

export default {
  sky: 'day',
  photos: ['sleep'],
  create (ctx) {
    const S = createScope()
    const { guide, sfx, fx } = ctx
    const { el, body } = shell('sleep', 'Sleep', 'two')
    const media = h('div', { class: 'media' })
    media.innerHTML = `
      <div class="bed" role="slider" tabindex="0" aria-label="Photo tilt. Use left and right arrows to straighten." aria-valuemin="-60" aria-valuemax="60" aria-valuenow="${START}">
        <div class="bed-photo">
          <div class="pillow">${pillow}</div>
          <div class="blanket">${blanket}</div>
          <div class="zzz" aria-hidden="true"><span>z</span><span>z</span><span>Z</span></div>
        </div>
        <div class="drag-hint" aria-hidden="true"><span>⟵</span> drag <span>⟶</span></div>
      </div>`
    const bed = media.querySelector('.bed')
    const holder = media.querySelector('.bed-photo')
    const pol = polaroid('sleep', { cls: 'pol-main', tape: 'corners' })
    holder.append(pol)
    const play = h('div', { class: 'play' })
    play.innerHTML = `
      <div class="card level-card">
        <h2 class="game-title">Fix her posture</h2>
        <div class="level" aria-hidden="true"><div class="level-tube"><span class="level-mark"></span><span class="level-bubble"></span></div></div>
        <p class="level-read"><span class="deg">27°</span> off. Not acceptable.</p>
      </div>`
    const n = note(copy.sleep.note)
    n.style.display = 'none'
    play.append(n)
    body.append(media, play)

    const card = play.querySelector('.level-card')
    const bubble = play.querySelector('.level-bubble')
    const tube = play.querySelector('.level-tube')
    const deg = play.querySelector('.deg')
    const read = play.querySelector('.level-read')
    let rot = START
    let done = false
    let drag = null

    const render = () => {
      gsap.set(pol, { rotation: rot })
      const half = tube.clientWidth / 2 - 14
      gsap.set(bubble, { x: clamp(rot / 40, -1, 1) * half })
      deg.textContent = `${Math.abs(Math.round(rot))}°`
      bed.setAttribute('aria-valuenow', String(Math.round(rot)))
      read.classList.toggle('close', Math.abs(rot) < 12)
    }

    const finish = () => {
      if (done) return
      done = true
      drag = null
      bed.classList.add('is-done')
      sfx.click(); sfx.ding()
      guide.hide()
      read.innerHTML = 'Perfect. Now she can sleep.'
      const tl = S.timeline()
      tl.to(pol, { rotation: 0, duration: 0.45, ease: 'back.out(3)' })
        .to(bubble, { x: 0, duration: 0.45, ease: 'back.out(3)' }, 0)
        .to(media.querySelector('.drag-hint'), { autoAlpha: 0, duration: 0.3 }, 0)
        .fromTo(media.querySelector('.pillow'), { autoAlpha: 0, y: -40, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.8)' }, 0.3)
        .fromTo(media.querySelector('.blanket'), { autoAlpha: 0, yPercent: 60 }, { autoAlpha: 1, yPercent: 0, duration: 0.9, ease: 'power3.out' }, 0.65)
        .add(() => { const [x, y] = at(pol, 0.5, 0.2); fx.burst(x, y, { n: 18, speed: 3, g: 0.05, life: 50, shape: 'heart', s: 8 }) }, 1)
        .fromTo(media.querySelectorAll('.zzz span'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.25 }, 1.2)
        .add(() => swap(S, card, n), 1.8)
      if (!env.reduced) S.to(media.querySelector('.zzz'), { y: -10, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2 })
      ctx.complete({ delay: 3.6 })
    }

    const set = (v) => {
      if (done) return
      rot = clamp(v, -60, 60)
      render()
      if (Math.abs(rot) < SNAP) finish()
    }

    // Drag sideways to turn the photo (works the same for mouse and finger).
    S.on(bed, 'pointerdown', (e) => {
      if (done) return
      e.preventDefault()
      bed.setPointerCapture?.(e.pointerId)
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, rot }
      bed.classList.add('is-dragging')
    })
    S.on(bed, 'pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      set(drag.rot + dx * 0.22 + dy * 0.05)
    })
    const end = () => { drag = null; bed.classList.remove('is-dragging') }
    S.on(bed, 'pointerup', end)
    S.on(bed, 'pointercancel', end)
    S.on(bed, 'keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(rot + 5) }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(rot - 5) }
    })

    return {
      el,
      start () {
        render()
        guide.say(copy.guide.posture, { key: '← →' })
        if (!env.reduced) S.fromTo(media.querySelector('.drag-hint'), { x: -8 }, { x: 8, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      },
      // Enter nudges the photo toward straight.
      primary () { set(rot + Math.sign(-rot) * Math.min(Math.abs(rot), 8)) },
      destroy () { S.kill() },
    }
  },
}
