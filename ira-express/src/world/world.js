import { gsap } from 'gsap'
import { env, setLowPower, clamp } from '../core/env.js'
import { buildTiles, buildStars } from './landscape.js'

// Speeds are in px/s for a 1440px-wide screen; scaled for smaller screens.
export const SPEED = { stop: 0, slow: 20, station: 46, cruise: 520 }

// Sky phases. Positions are fractions of the screen.
const PHASES = {
  morning: { sky: 0, sun: [0.18, 0.3], sunO: 1, warm: 0.15, moon: [0.82, 0.7], moonO: 0, gold: 0, night: 0, stars: 0, clouds: 1 },
  day: { sky: 1, sun: [0.7, 0.13], sunO: 1, warm: 0, moon: [0.82, 0.7], moonO: 0, gold: 0, night: 0, stars: 0, clouds: 1 },
  golden: { sky: 2, sun: [0.76, 0.54], sunO: 1, warm: 1, moon: [0.82, 0.7], moonO: 0, gold: 1, night: 0, stars: 0, clouds: 0.8 },
  night: { sky: 3, sun: [0.8, 0.86], sunO: 0, warm: 1, moon: [0.76, 0.15], moonO: 1, gold: 0, night: 1, stars: 1, clouds: 0 },
}
const SKY_NAMES = ['morning', 'day', 'golden', 'night']

export class World {
  constructor (root) {
    this.root = root
    root.innerHTML = `
      <div class="sky">${SKY_NAMES.map((n) => `<div class="sky-l sky-${n}"></div>`).join('')}</div>
      <div class="stars"><canvas></canvas>${Array.from({ length: 14 }, (_, i) => `<i style="--d:${(i * 0.37) % 3}s;--x:${(i * 37 + 11) % 97}%;--y:${(i * 23 + 7) % 52}%"></i>`).join('')}</div>
      <div class="moon"></div>
      <div class="sun"><div class="sun-warm"></div></div>
      <canvas class="skyfx"></canvas>
      <canvas class="land"></canvas>`
    const q = (s) => root.querySelector(s)
    this.skyLayers = SKY_NAMES.map((n) => q(`.sky-${n}`))
    this.sun = q('.sun'); this.sunWarm = q('.sun-warm'); this.moon = q('.moon')
    this.stars = q('.stars'); this.starCanvas = q('.stars canvas')
    this.land = q('.land'); this.ctx = this.land.getContext('2d')
    this.skyfxCanvas = q('.skyfx')

    // gold / night: time-of-day tint painted inside the landscape canvas (cheaper than overlays).
    this.state = { speed: 0, offset: 0, cloud: 0, cloudA: 1, gold: 0, night: 0 }
    this.phase = 'morning'
    this.layers = []
    this.k = 1
    this.frames = []
    this.tick = this.tick.bind(this)
    gsap.ticker.add(this.tick)
  }

  resize (W, H) {
    this.W = W; this.H = H
    this.k = clamp(W / 1440, 0.5, 1.15) * (env.portrait ? 1.15 : 1)
    const dpr = window.devicePixelRatio || 1
    this.R = Math.min(dpr, env.lowPower ? 1.15 : env.touch ? 1.6 : 2)
    this.land.width = Math.ceil(W * this.R)
    this.land.height = Math.ceil(H * this.R)
    this.layers = buildTiles(W, H, this.R)
    const R = this.R
    const g = this.ctx.createLinearGradient(0, H * 0.4 * R, 0, H * R)
    g.addColorStop(0, 'rgba(244,150,110,0)'); g.addColorStop(0.45, 'rgba(244,150,110,0.2)'); g.addColorStop(1, 'rgba(214,110,120,0.32)')
    const n = this.ctx.createLinearGradient(0, H * 0.4 * R, 0, H * R)
    n.addColorStop(0, 'rgba(13,8,32,0.1)'); n.addColorStop(0.35, 'rgba(18,9,36,0.56)'); n.addColorStop(1, 'rgba(16,7,28,0.72)')
    this.goldGrad = g; this.nightGrad = n
    buildStars(this.starCanvas, W, H, Math.min(dpr, 2), Math.round(clamp(W * H / 9000, 70, 170)))
    // Re-place sun and moon for the new size, unless the sky is being scrubbed by a hold.
    if (!this.skyTl || !this.skyTl.paused()) this.setSky(this.phase, 0)
    this.sig = ''
    this.draw()
  }

  tick (time, dtMs) {
    const dt = Math.min(dtMs, 64) / 1000
    const s = this.state
    const move = env.reduced ? Math.min(s.speed, SPEED.station) * 0.35 : s.speed
    s.offset += move * this.k * dt
    s.cloud += (move * 0.035 + (env.reduced ? 2 : 7)) * this.k * dt
    // Only repaint when something on the canvas actually changed (a stopped train at
    // night is static), so the layers above it don't have to be re-blended every frame.
    const sig = `${Math.round(s.offset * 4)}|${s.cloudA > 0.02 ? Math.round(s.cloud * 4) : 0}|${s.cloudA.toFixed(3)}|${s.gold.toFixed(3)}|${s.night.toFixed(3)}`
    if (sig !== this.sig) { this.sig = sig; this.draw() }
    this.watchFps(dtMs)
  }

  draw () {
    const { ctx, R } = this
    if (!this.layers.length) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.land.width, this.land.height)
    for (const L of this.layers) {
      const off = L.cloud ? this.state.cloud : this.state.offset * L.f
      const x0 = -(off % L.tw)
      if (L.sprites) {
        if (this.state.cloudA < 0.02) continue
        ctx.globalAlpha = this.state.cloudA
        for (const s of L.sprites) {
          for (let x = x0 + s.x - s.w / 2; x < this.W; x += L.tw) {
            if (x + s.w > 0) ctx.drawImage(s.c, x * R, s.y * R, s.w * R, s.h * R)
          }
        }
        ctx.globalAlpha = 1
        continue
      }
      if (L.vector) {
        ctx.setTransform(R, 0, 0, R, 0, 0)
        for (let x = x0 - L.tw; x < this.W; x += L.tw) if (x + L.tw * 1.3 > 0) L.paint(ctx, x)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        continue
      }
      for (let x = x0; x < this.W; x += L.tw) ctx.drawImage(L.c, x * R, L.y * R, L.tw * R, L.h * R)
    }
    const { gold, night } = this.state
    for (const [a, grad] of [[gold, this.goldGrad], [night, this.nightGrad]]) {
      if (a < 0.01) continue
      ctx.globalAlpha = a
      ctx.fillStyle = grad
      ctx.fillRect(0, this.H * 0.4 * R, this.land.width, this.H * 0.6 * R)
    }
    ctx.globalAlpha = 1
  }

  // If frames are consistently slow while moving, drop canvas resolution and effects.
  // Ignores the first seconds (loading jank) and needs two slow windows in a row.
  watchFps (dtMs) {
    if (env.lowPower || this.state.speed < 100 || performance.now() < 3000) return
    this.frames.push(dtMs)
    if (this.frames.length < 90) return
    const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length
    this.frames.length = 0
    this.slow = avg > 26 ? (this.slow || 0) + 1 : 0
    if (this.slow >= 2) {
      setLowPower(true)
      this.resize(this.W, this.H)
    }
  }

  setSpeed (v, duration = 2, ease = 'power2.inOut') {
    gsap.killTweensOf(this.state, 'speed')
    return gsap.to(this.state, { speed: v, duration, ease })
  }

  camera (vars) {
    if (env.reduced) return gsap.to(this.root, { scale: 1.02, x: 0, y: 0, duration: 0.6 })
    return gsap.to(this.root, { duration: 2.2, ease: 'power2.inOut', ...vars })
  }

  // Tween the sky toward a phase. Returns a timeline so callers can scrub it.
  phaseTimeline (name, duration = 3) {
    const p = PHASES[name]
    const W = this.W, H = this.H
    this.skyLayers.forEach((el, i) => { if (i <= p.sky || parseFloat(el.style.opacity || '0') > 0) el.style.visibility = '' })
    const tl = gsap.timeline({
      defaults: { duration, ease: 'sine.inOut' },
      onComplete: () => this.skyLayers.forEach((el, i) => { el.style.visibility = i === p.sky ? '' : 'hidden' }),
    })
    this.skyLayers.forEach((el, i) => tl.to(el, { opacity: i <= p.sky ? 1 : 0 }, 0))
    tl.to(this.sun, { x: p.sun[0] * W, y: p.sun[1] * H, autoAlpha: p.sunO }, 0)
    tl.to(this.sunWarm, { opacity: p.warm }, 0)
    tl.to(this.moon, { x: p.moon[0] * W, y: p.moon[1] * H, autoAlpha: p.moonO }, 0)
    tl.to(this.stars, { autoAlpha: p.stars }, 0)
    tl.to(this.state, { cloudA: p.clouds, gold: p.gold, night: p.night }, 0)
    return tl
  }

  setSky (name, duration = 3) {
    this.phase = name
    this.skyTl?.kill()
    this.skyTl = this.phaseTimeline(name, duration)
    if (duration === 0) this.skyTl.progress(1)
    return this.skyTl
  }

  // Scrubbable transition (used by the Good soul station while holding).
  scrubSky (name) {
    this.skyTl?.kill()
    this.phase = name
    this.skyTl = this.phaseTimeline(name, 1).pause()
    return this.skyTl
  }

  get skyfx () { return this.skyfxCanvas }
}
