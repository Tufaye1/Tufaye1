import { gsap } from 'gsap'

// Music toggle, off by default. Hidden until /music.mp3 actually exists.
export class Music {
  constructor (btn) {
    this.btn = btn
    this.on = false
    this.audio = null
    this.vol = { v: 0 }
    this.level = 0.55
    btn.hidden = true
    btn.addEventListener('click', (e) => { e.stopPropagation(); this.toggle() })
    btn.addEventListener('pointerdown', (e) => e.stopPropagation())
    this.check()
  }

  async check () {
    try {
      const r = await fetch('music.mp3', { method: 'HEAD', cache: 'no-store' })
      const type = r.headers.get('content-type') || ''
      if (r.ok && !type.includes('text/html')) this.btn.hidden = false
    } catch { /* offline or missing: keep hidden */ }
  }

  render () {
    this.btn.setAttribute('aria-pressed', String(this.on))
    this.btn.setAttribute('aria-label', this.on ? 'Turn music off' : 'Turn music on')
    this.btn.classList.toggle('is-on', this.on)
  }

  toggle () {
    this.on = !this.on
    this.render()
    if (this.on) {
      if (!this.audio) {
        this.audio = new Audio('music.mp3')
        this.audio.loop = true
        this.audio.volume = 0
      }
      this.audio.play().catch(() => { this.on = false; this.render() })
      gsap.to(this.vol, { v: this.level, duration: 1.5, onUpdate: () => { if (this.audio) this.audio.volume = this.vol.v } })
    } else if (this.audio) {
      gsap.to(this.vol, { v: 0, duration: 0.6, onUpdate: () => { this.audio.volume = this.vol.v }, onComplete: () => this.audio.pause() })
    }
  }

  // Quieter for the emotional stations.
  duck (level) {
    this.level = level
    if (this.on && this.audio) gsap.to(this.vol, { v: level, duration: 2, onUpdate: () => { this.audio.volume = this.vol.v } })
  }
}
