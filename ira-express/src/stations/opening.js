import { gsap } from 'gsap'
import { h, esc, createScope } from '../core/scope.js'
import { env } from '../core/env.js'
import { ticket, copy } from '../content.js'
import { trainIcon } from '../art/art.js'
import { SPEED } from '../world/world.js'

const HEART = 'M12 20S2 13 2 7c0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 6-10 13-10 13z'

export default {
  sky: 'morning',
  create (ctx) {
    const S = createScope()
    const { guide, sfx, world, director, app } = ctx
    const el = h('section', { class: 'station st-opening', 'aria-label': 'Your ticket' })
    el.innerHTML = `
      <div class="ticket" role="button" tabindex="0" aria-label="Your train ticket. Passenger Ira, from Tufayel Bhaia, destination 18 November. Press to punch it.">
        <div class="t-main">
          <div class="t-head"><span class="t-brand">${esc(ticket.brand)}</span><span class="t-icon">${trainIcon}</span></div>
          <div class="t-fields">${ticket.fields.map(([k, v]) => `<div class="t-field"><span class="t-k">${esc(k)}</span> <span class="t-v">${esc(v)}</span></div>`).join('<span class="t-sep" aria-hidden="true">|</span>')}</div>
          <div class="t-foot"><span>one way</span><span>window seat</span></div>
        </div>
        <div class="t-stub">
          <span class="t-no">${esc(ticket.number)}</span>
          <span class="t-target"><svg viewBox="0 0 24 22" class="t-hole"><path d="${HEART}"/></svg></span>
        </div>
      </div>
      <svg viewBox="0 0 24 22" class="t-chad" aria-hidden="true"><path d="${HEART}"/></svg>`
    const tk = el.querySelector('.ticket')
    const hole = el.querySelector('.t-hole')
    const chad = el.querySelector('.t-chad')
    let punched = false
    let ready = false

    const punch = () => {
      if (punched || !ready) return
      punched = true
      sfx.unlock()
      sfx.punch()
      guide.hide()
      el.classList.add('is-punched')
      const hr = hole.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      gsap.set(chad, { x: hr.left - er.left, y: hr.top - er.top, width: hr.width, height: hr.height, autoAlpha: 1 })
      const tl = S.timeline()
      tl.fromTo(tk, { scale: 1 }, { scale: 0.965, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut' })
        .fromTo(hole, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 0)
        .to(chad, { x: `+=${env.reduced ? 0 : 50}`, y: `+=${env.reduced ? 0 : 160}`, rotation: 260, autoAlpha: 0, duration: 1.1, ease: 'power1.in' }, 0.05)
        .add(() => sfx.whistle(), 0.3)
        .to(tk, env.reduced ? { autoAlpha: 0, duration: 0.6 } : { y: -env.h * 0.75, rotation: -14, autoAlpha: 0, duration: 1.1, ease: 'power3.in' }, 1)
        .add(() => {
          director.openBars(1.9)
          world.setSpeed(SPEED.cruise, 4.5, 'power1.in')
          world.camera({ scale: 1.02, duration: 3 })
        }, 1.15)
        .add(() => app.classList.remove('is-opening'), 2.15)
        .add(() => director.goTo(1), 2.6)
    }

    S.on(app, 'click', (e) => { if (!e.target.closest('.music')) punch() })
    S.on(tk, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); punch() } })

    return {
      el,
      async start () {
        world.setSpeed(0, 0.01)
        gsap.set(tk, { y: env.h * 0.6, rotation: 9, autoAlpha: 0 })
        gsap.set(chad, { autoAlpha: 0 })
        const tl = S.timeline({ delay: 0.5 })
        tl.to(tk, env.reduced ? { y: 0, rotation: -2, autoAlpha: 1, duration: 0.6 } : { y: 0, rotation: -2, autoAlpha: 1, duration: 1.4, ease: 'back.out(1.15)' })
          .add(() => { ready = true; guide.say(copy.guide.punch, { key: 'Enter' }) }, '-=0.3')
      },
      primary: punch,
      destroy () { S.kill() },
    }
  },
}
