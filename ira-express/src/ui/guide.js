import { gsap } from 'gsap'
import { conductor } from '../art/art.js'
import { env } from '../core/env.js'
import { esc } from '../core/scope.js'

// The little conductor. Always one short instruction, optionally a button.
export class Guide {
  constructor (root) {
    this.root = root
    root.innerHTML = `
      <div class="guide-char">${conductor}</div>
      <div class="guide-bubble" role="status" aria-live="polite">
        <p class="guide-text"></p>
        <span class="guide-key" aria-hidden="true"></span>
        <button class="guide-btn" type="button" hidden></button>
      </div>`
    this.char = root.querySelector('.guide-char')
    this.bubble = root.querySelector('.guide-bubble')
    this.text = root.querySelector('.guide-text')
    this.key = root.querySelector('.guide-key')
    this.btn = root.querySelector('.guide-btn')
    this.arm = root.querySelector('.cond-arm')
    this.visible = false
    this.btn.addEventListener('click', (e) => { e.stopPropagation(); const fn = this.onBtn; this.onBtn = null; fn?.() })
    gsap.set(root, { autoAlpha: 0, y: 30 })
    this.armTl = gsap.timeline({ repeat: -1, repeatDelay: 2.4, paused: true })
      .to(this.arm, { rotation: -18, transformOrigin: '0% 100%', duration: 0.18, yoyo: true, repeat: 3, ease: 'sine.inOut' })
  }

  // text: instruction. opts.key: keyboard hint ('Enter', 'Hold Space'...). opts.button + opts.onButton.
  say (text, { key = null, button = null, onButton = null, quiet = false } = {}) {
    this.root.classList.toggle('is-quiet', quiet)
    const show = () => {
      this.text.innerHTML = esc(text)
      const k = !env.touch && key
      this.key.textContent = k || ''
      this.key.hidden = !k
      this.btn.hidden = !button
      if (button) { this.btn.innerHTML = `${esc(button)} <span aria-hidden="true">→</span>`; this.onBtn = onButton }
      else this.onBtn = null
    }
    if (!this.visible) {
      show()
      this.visible = true
      gsap.to(this.root, { autoAlpha: 1, y: 0, duration: env.reduced ? 0.3 : 0.6, ease: 'back.out(1.6)' })
      if (!env.reduced) this.armTl.play(0)
    } else {
      gsap.timeline()
        .to(this.bubble, { autoAlpha: 0, scale: 0.92, duration: 0.15, ease: 'power1.in' })
        .add(show)
        .to(this.bubble, { autoAlpha: 1, scale: 1, duration: env.reduced ? 0.2 : 0.4, ease: 'back.out(2)' })
      if (!env.reduced) gsap.fromTo(this.char, { y: 0 }, { y: -10, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.out' })
    }
    if (button) setTimeout(() => { if (!this.btn.hidden && document.activeElement === document.body) this.btn.focus({ preventScroll: true }) }, 400)
  }

  nudge () {
    if (env.reduced) return
    gsap.fromTo(this.bubble, { x: 0 }, { x: 6, duration: 0.07, yoyo: true, repeat: 5, ease: 'sine.inOut', clearProps: 'x' })
  }

  hide () {
    if (!this.visible) return Promise.resolve()
    this.visible = false
    this.onBtn = null
    this.armTl.pause()
    return gsap.to(this.root, { autoAlpha: 0, y: 30, duration: 0.35, ease: 'power2.in' })
  }

  get hasButton () { return !this.btn.hidden && !!this.onBtn }
  pressButton () { if (this.hasButton) this.btn.click() }
}
