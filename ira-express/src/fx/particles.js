import { gsap } from 'gsap'
import { env, rand, pick } from '../core/env.js'

export const PALETTE = ['#F6D3DC', '#E7A3B6', '#F4CF5D', '#FFFBF7', '#F09AB4', '#FFE6A3']

// One canvas particle system. `trails` fades old frames instead of clearing (fireworks).
export class Particles {
  constructor (canvas, { trails = false } = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.trails = trails
    this.items = []
    this.running = false
    this.loop = this.loop.bind(this)
  }

  resize (W, H) {
    const R = Math.min(window.devicePixelRatio || 1, env.lowPower ? 1 : 1.5)
    this.W = W; this.H = H; this.R = R
    // The fireworks canvas only needs the sky (top 70%), which halves its fill cost.
    const h = this.trails ? H * 0.7 : H
    this.canvas.width = Math.ceil(W * R)
    this.canvas.height = Math.ceil(h * R)
    this.canvas.style.height = `${h}px`
  }

  get budget () { return env.lowPower ? 0.4 : env.touch ? 0.6 : 0.85 }

  start () {
    if (this.running) return
    this.running = true
    gsap.ticker.add(this.loop)
  }

  clear () {
    this.items.length = 0
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  loop (t, dtMs) {
    const dt = Math.min(dtMs, 50) / 16.67
    const { ctx, R } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    if (this.trails) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      ctx.globalCompositeOperation = 'lighter'
    } else {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.setTransform(R, 0, 0, R, 0, 0)
    const next = []
    for (const p of this.items) {
      p.age += dt
      if (p.age > p.life) { p.onDie?.(p); continue }
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g * dt
      p.x += p.vx * dt; p.y += p.vy * dt
      p.rot += p.vr * dt
      const k = p.age / p.life
      const a = p.fade ? Math.max(0, 1 - k * k) : 1
      this.draw(p, a, k)
      next.push(p)
    }
    this.items = next
    if (!this.items.length && !this.trails) {
      gsap.ticker.remove(this.loop); this.running = false
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    if (!this.items.length && this.trails) {
      this.idle = (this.idle || 0) + 1
      if (this.idle > 40) { gsap.ticker.remove(this.loop); this.running = false; this.idle = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) }
    } else this.idle = 0
  }

  draw (p, a, k) {
    const { ctx, R } = this
    ctx.globalAlpha = a * (p.alpha ?? 1)
    ctx.fillStyle = p.color
    switch (p.shape) {
      case 'rect': {
        // One setTransform per piece instead of save/translate/rotate/scale/restore.
        const c = Math.cos(p.rot) * R, s = Math.sin(p.rot) * R, f = Math.cos(p.age * p.flip)
        ctx.setTransform(c, s, -s * f, c * f, p.x * R, p.y * R)
        ctx.fillRect(-p.s / 2, -p.s * 0.3, p.s, p.s * 0.6)
        ctx.setTransform(R, 0, 0, R, 0, 0); break
      }
      case 'heart': {
        const m = p.s / 16, c = Math.cos(p.rot) * R * m, s = Math.sin(p.rot) * R * m
        ctx.setTransform(c, s, -s, c, p.x * R, p.y * R)
        ctx.beginPath(); ctx.moveTo(0, 5)
        ctx.bezierCurveTo(-8, -1, -6, -9, 0, -4); ctx.bezierCurveTo(6, -9, 8, -1, 0, 5)
        ctx.fill(); ctx.setTransform(R, 0, 0, R, 0, 0); break
      }
      case 'smoke': {
        const s = p.s * (1 + k * 2.2)
        ctx.globalAlpha = a * 0.32
        ctx.beginPath(); ctx.arc(p.x + Math.sin(p.age * 0.12 + p.rot) * 4, p.y, s, 0, Math.PI * 2); ctx.fill()
        break
      }
      case 'spark': {
        const s = p.s * (1 - k * 0.6) * 1.6
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
        break
      }
      default: {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill()
      }
    }
  }

  add (p) {
    this.items.push({ vx: 0, vy: 0, g: 0, drag: 1, rot: 0, vr: 0, age: 0, life: 60, s: 4, color: '#fff', shape: 'dot', fade: true, flip: 0.2, ...p })
    this.start()
  }

  confetti (n = 140, { hearts = true } = {}) {
    n = Math.round(n * this.budget * (env.reduced ? 0.35 : 1))
    for (let i = 0; i < n; i++) {
      this.add({
        x: rand(0, this.W), y: rand(-this.H * 0.6, -10),
        vx: rand(-1.2, 1.2), vy: rand(1.5, 3.8), g: 0.02, drag: 0.995,
        rot: rand(0, 6), vr: rand(-0.12, 0.12), flip: rand(0.08, 0.25),
        s: rand(7, 13), life: rand(180, 320), color: pick(PALETTE), fade: false,
        shape: hearts && Math.random() < 0.18 ? 'heart' : 'rect',
      })
    }
  }

  burst (x, y, { n = 40, colors = PALETTE, speed = 5, g = 0.06, life = 70, s = 2.6, shape = 'spark', drag = 0.96 } = {}) {
    n = Math.round(n * this.budget)
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + rand(-0.1, 0.1)
      const v = speed * rand(0.55, 1)
      this.add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g, drag, life: life * rand(0.7, 1.1), s: s * rand(0.7, 1.2), color: pick(colors), shape, rot: rand(0, 6), vr: rand(-0.1, 0.1) })
    }
  }

  // A rising rocket that bursts near (tx, ty).
  firework (tx, ty, colors) {
    const x0 = tx + rand(-40, 40)
    const pal = colors || [pick(PALETTE), pick(PALETTE), '#FFFBF7']
    this.add({
      x: x0, y: this.H * 0.62, vx: (tx - x0) / 45, vy: -(this.H * 0.62 - ty) / 45 * 1.9, g: 0.0, drag: 0.975,
      s: 2.2, life: 40, color: '#FFF3C4', shape: 'spark', fade: false,
      onDie: (p) => this.burst(p.x, p.y, { n: env.reduced ? 26 : 58, colors: pal, speed: rand(4.2, 6.2), g: 0.045, life: 80, s: 2.4 }),
    })
  }

  smoke (x, y) {
    for (let i = 0; i < 9; i++) {
      this.add({ x: x + rand(-2, 2), y: y - i * 2, vx: rand(-0.25, 0.25), vy: rand(-0.9, -0.5), drag: 0.99, s: rand(2, 4), life: rand(70, 110), color: '#E9DDE3', shape: 'smoke', rot: rand(0, 6) })
    }
  }
}
