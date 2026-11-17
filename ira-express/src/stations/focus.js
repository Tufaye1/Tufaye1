import { gsap } from 'gsap'
import { h, esc, createScope } from '../core/scope.js'
import { env, rand } from '../core/env.js'
import { copy } from '../content.js'
import { polaroid } from '../ui/polaroid.js'
import { shell, note, revealNote, wiggle } from './shell.js'

export default {
  sky: 'day',
  photos: ['stress'],
  create (ctx) {
    const S = createScope()
    const { guide, sfx } = ctx
    const t = copy.focus
    const { el, body } = shell('focus', 'Focus', 'two')
    const media = h('div', { class: 'media' })
    media.append(polaroid('stress', { rot: -4, cls: 'pol-main' }))
    const play = h('div', { class: 'play' })
    play.innerHTML = `
      <div class="chat">
        <div class="chat-head"><span class="chat-dot"></span><span class="chat-name">Ira</span><span class="chat-count"><b>${t.long.length}</b> long texts</span></div>
        <div class="bubble short" tabindex="-1">${esc(t.short)}<span class="seen" aria-hidden="true">✓✓</span></div>
      </div>`
    const n = note(t.note)
    n.style.display = 'none'
    play.append(n)
    body.append(media, play)
    const flood = h('div', { class: 'flood' })
    el.append(flood)
    const shortB = play.querySelector('.bubble.short')
    const countEl = play.querySelector('.chat-count b')
    let left = []
    let done = false
    let z = 10

    const toss = (b, dx = 0, dy = 0) => {
      if (b.dataset.gone) return
      b.dataset.gone = '1'
      sfx.whoosh()
      const W = el.clientWidth
      const r = b.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      const dir = Math.hypot(dx, dy) > 30 ? [dx, dy] : [(r.left + r.width / 2 - er.left) < W / 2 ? -1 : 1, -0.25]
      const len = Math.hypot(dir[0], dir[1]) || 1
      const dist = W * 0.9
      S.to(b, {
        x: `+=${(dir[0] / len) * dist}`, y: `+=${(dir[1] / len) * dist * 0.6}`,
        rotation: `+=${dir[0] > 0 ? 35 : -35}`, autoAlpha: 0,
        duration: env.reduced ? 0.25 : 0.5, ease: 'power2.in', onComplete: () => b.remove(),
      })
      left = left.filter((x) => x !== b)
      countEl.textContent = String(left.length)
      if (!left.length) finish()
    }

    const finish = () => {
      done = true
      guide.hide()
      sfx.ding()
      play.querySelector('.chat').classList.add('is-clear')
      play.querySelector('.chat-count').innerHTML = 'one clear message'
      const tl = S.timeline({ delay: 0.5 })
      tl.fromTo(shortB, { scale: 1 }, { scale: env.reduced ? 1 : 1.06, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' })
        .fromTo(shortB.querySelector('.seen'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .add(() => { n.style.display = ''; revealNote(n, S) }, '+=0.3')
      ctx.complete({ delay: 3.2 })
    }

    const makeBubbles = () => {
      const W = el.clientWidth
      const H = el.clientHeight
      t.long.forEach((txt, i) => {
        const b = h('div', { class: 'bubble long', role: 'button', tabindex: '-1', 'aria-label': `Long text: ${txt}. Swipe away.` }, esc(txt))
        flood.append(b)
        const bw = Math.min(W * (env.portrait ? 0.78 : 0.34), 340)
        b.style.width = `${bw}px`
        const x = rand(W * 0.03, W - bw - W * 0.03)
        const y = rand(H * 0.08, H * 0.72)
        gsap.set(b, { x, y, rotation: rand(-7, 7), autoAlpha: 0, scale: 0.6 })
        S.to(b, { autoAlpha: 1, scale: 1, duration: env.reduced ? 0.2 : 0.45, ease: 'back.out(2)', delay: i * 0.14, onStart: () => { if (i % 2 === 0) sfx.pop() } })
        left.push(b)
        let d = null
        S.on(b, 'pointerdown', (e) => {
          if (b.dataset.gone) return
          e.stopPropagation(); e.preventDefault()
          b.setPointerCapture?.(e.pointerId)
          d = { id: e.pointerId, x: e.clientX, y: e.clientY, bx: gsap.getProperty(b, 'x'), by: gsap.getProperty(b, 'y'), r: gsap.getProperty(b, 'rotation') }
          b.classList.add('is-held')
          b.style.zIndex = String(++z)
        })
        S.on(b, 'pointermove', (e) => {
          if (!d || e.pointerId !== d.id) return
          const dx = e.clientX - d.x; const dy = e.clientY - d.y
          gsap.set(b, { x: d.bx + dx, y: d.by + dy, rotation: d.r + dx * 0.04 })
        })
        const up = (e) => {
          if (!d || e.pointerId !== d.id) return
          const dx = e.clientX - d.x; const dy = e.clientY - d.y
          d = null
          b.classList.remove('is-held')
          toss(b, dx, dy)
        }
        S.on(b, 'pointerup', up)
        S.on(b, 'pointercancel', up)
      })
    }

    S.on(shortB, 'click', () => { if (!done) { S.add(wiggle(shortB)); guide.say('Keep this one. It is perfect.', { key: 'Enter' }) } })

    return {
      el,
      start () {
        makeBubbles()
        S.delay(env.reduced ? 0.4 : 1.3, () => guide.say(copy.guide.focus, { key: 'Enter' }))
      },
      primary () { const top = left[left.length - 1]; if (top) toss(top) },
      destroy () { S.kill() },
    }
  },
}
