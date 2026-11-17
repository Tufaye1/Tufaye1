// Procedural, seamless parallax tiles drawn once into offscreen canvases.
// Each tile wraps perfectly because every curve uses whole periods of the tile width.

function rng (seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeCanvas (w, h, R) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.ceil(w * R))
  c.height = Math.max(1, Math.ceil(h * R))
  const ctx = c.getContext('2d')
  ctx.scale(R, R)
  return { c, ctx }
}

// y(x) of a soft ridge; k values are whole numbers so the ends meet.
function ridge (tw, base, amp, ks, r) {
  const parts = ks.map((k, i) => ({ k, a: amp * (1 / (i + 1)) * (0.6 + r() * 0.6), p: r() * Math.PI * 2 }))
  return (x) => base - parts.reduce((s, q) => s + q.a * Math.sin((Math.PI * 2 * q.k * x) / tw + q.p), 0)
}

function fillRidge (ctx, tw, y0, bottom, fn, fill) {
  ctx.beginPath()
  ctx.moveTo(0, bottom)
  for (let x = 0; x <= tw; x += 6) ctx.lineTo(x, fn(x) - y0)
  ctx.lineTo(tw, fn(tw) - y0)
  ctx.lineTo(tw, bottom)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

function blob (ctx, cx, cy, r, color) {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
}

// x positions spaced along a tile, away from its edges so nothing gets cut at the seam.
function spots (r, tw, min, max, margin) {
  const out = []
  let x = margin + r() * min
  while (x < tw - margin) { out.push(x); x += min + r() * (max - min) }
  return out
}

export function buildTiles (W, H, R, seed = 1811) {
  const r = rng(seed)
  const base = Math.round(Math.max(W, W < 700 ? 720 : 960))
  const layers = []
  const add = (name, f, tw, y, h, draw, extra = {}) => {
    tw = Math.round(tw)
    const { c, ctx } = makeCanvas(tw, h, R)
    draw(ctx, tw, y, h)
    layers.push({ name, f, tw, y, h, c, ...extra })
  }

  // Clouds: small sprites (cheap to draw), moved by the wind even when the train stops.
  {
    const tw = Math.round(base * 1.7)
    const n = Math.max(3, Math.round(tw / 340))
    const sprites = []
    for (let i = 0; i < n; i++) {
      const sc = (0.55 + r() * 0.7) * Math.min(1.25, Math.max(0.65, W / 1100))
      const cw = 150 * sc, ch = 90 * sc
      const { c, ctx } = makeCanvas(cw, ch, R)
      const parts = [[-38, 6, 26], [-12, -10, 34], [20, -4, 30], [46, 8, 22], [0, 12, 30]]
      const ox = cw / 2, oy = ch * 0.52
      ctx.fillStyle = 'rgba(231,163,182,0.22)'
      parts.forEach(([dx, dy, rr]) => { ctx.beginPath(); ctx.arc(ox + dx * sc, oy + dy * sc + 7 * sc, rr * sc, 0, Math.PI * 2); ctx.fill() })
      ctx.fillStyle = 'rgba(255,251,247,0.94)'
      parts.forEach(([dx, dy, rr]) => { ctx.beginPath(); ctx.arc(ox + dx * sc, oy + dy * sc, rr * sc, 0, Math.PI * 2); ctx.fill() })
      sprites.push({ c, x: (tw / n) * (i + 0.15 + r() * 0.5), y: H * (0.04 + r() * 0.3), w: cw, h: ch })
    }
    layers.push({ name: 'clouds', f: 0.035, tw, cloud: true, sprites })
  }

  // Far mountains: pale, slow.
  add('mountains', 0.05, base * 1.5, H * 0.44, H * 0.31, (ctx, tw, y0, h) => {
    const fn = ridge(tw, H * 0.6, H * 0.075, [1, 2, 3, 5], r)
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#E9C3D2'); g.addColorStop(0.5, '#F1D6E0'); g.addColorStop(1, '#F6E3EA')
    fillRidge(ctx, tw, y0, h, fn, g)
  })

  // Far hills.
  add('far', 0.1, base * 1.25, H * 0.52, H * 0.29, (ctx, tw, y0, h) => {
    const fn = ridge(tw, H * 0.67, H * 0.045, [2, 3, 5], r)
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#DEA6BB'); g.addColorStop(1, '#EBC6D3')
    fillRidge(ctx, tw, y0, h, fn, g)
  })

  // Mid hills with lollipop trees on the ridge.
  add('mid', 0.22, base, H * 0.58, H * 0.27, (ctx, tw, y0, h) => {
    const fn = ridge(tw, H * 0.73, H * 0.032, [2, 4, 7], r)
    spots(r, tw, 34, 120, 16).forEach((x) => {
      const y = fn(x) - y0
      const s = 0.7 + r() * 0.6
      ctx.fillStyle = '#9E5A79'
      ctx.fillRect(x - 1.2, y - 12 * s, 2.4, 14 * s)
      blob(ctx, x, y - 14 * s, 8 * s, r() > 0.5 ? '#B8698B' : '#C27795')
    })
    fillRidge(ctx, tw, y0, h, fn, '#D293AB')
  })

  // Near trees and bushes on a ground strip.
  add('near', 0.45, base, H * 0.6, H * 0.3, (ctx, tw, y0, h) => {
    const groundY = H * 0.82 - y0
    const fn = ridge(tw, H * 0.82, H * 0.01, [3, 7], r)
    spots(r, tw, 70, 230, 46).forEach((x) => {
      const y = fn(x) - y0
      const s = (0.75 + r() * 0.6) * Math.min(1.2, Math.max(0.6, H / 900))
      if (r() < 0.35) {
        blob(ctx, x - 14 * s, y + 2, 16 * s, '#934A6C'); blob(ctx, x + 10 * s, y, 20 * s, '#A2557A'); blob(ctx, x, y - 8 * s, 18 * s, '#AD6085')
        return
      }
      ctx.fillStyle = '#5E2F4B'
      ctx.fillRect(x - 3 * s, y - 40 * s, 6 * s, 42 * s)
      const tone = r() > 0.5 ? ['#8E456A', '#A0547A', '#B26688'] : ['#7F3D5F', '#93496E', '#A65A7F']
      blob(ctx, x - 15 * s, y - 42 * s, 19 * s, tone[0])
      blob(ctx, x + 15 * s, y - 44 * s, 18 * s, tone[1])
      blob(ctx, x, y - 60 * s, 23 * s, tone[2])
      blob(ctx, x - 7 * s, y - 66 * s, 7 * s, 'rgba(255,251,247,0.12)')
    })
    fillRidge(ctx, tw, y0, h, fn, '#C47F9B')
    ctx.fillStyle = '#BB7592'
    ctx.fillRect(0, groundY + H * 0.04, tw, h)
  })

  // Electric poles with sagging wires: drawn as vectors each frame (no big transparent bitmap).
  {
    const tw = base
    const top = H * 0.24
    const ground = H * 0.835
    const sag = H * 0.06
    const arm = Math.max(26, Math.min(48, W * 0.035))
    layers.push({
      name: 'poles', f: 0.85, tw, vector: true,
      paint (ctx, x0) {
        ctx.strokeStyle = 'rgba(58,23,48,0.55)'
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ;[-arm, 0, arm].forEach((dx, i) => {
          const yy = top + 10 + (i === 1 ? -8 : 0)
          ;[[0.25, 0.75], [0.75, 1.25]].forEach(([a, b]) => {
            const xa = x0 + tw * a + dx, xb = x0 + tw * b + dx
            ctx.moveTo(xa, yy); ctx.quadraticCurveTo((xa + xb) / 2, yy + sag * 2, xb, yy)
          })
        })
        ctx.stroke()
        ;[0.25, 0.75].forEach((k) => {
          const x = x0 + tw * k
          ctx.fillStyle = '#4A2140'
          ctx.fillRect(x - 3.5, top - 8, 7, ground - top + 8)
          ctx.fillRect(x - arm - 6, top + 6, arm * 2 + 12, 6)
          ctx.fillStyle = '#F4CF5D'
          ;[-arm, 0, arm].forEach((dx, i) => { ctx.beginPath(); ctx.arc(x + dx, top + 4 + (i === 1 ? -8 : 0), 3.2, 0, Math.PI * 2); ctx.fill() })
        })
      },
    })
  }

  // A neighbouring rail track, seen from the side: ballast, low sleepers, one shiny rail.
  add('track', 1.35, base, H * 0.855, H * 0.145, (ctx, tw, y0, h) => {
    const y = (v) => H * v - y0
    ctx.fillStyle = '#B97592'; ctx.fillRect(0, y(0.875), tw, h)
    ctx.fillStyle = '#A8627F'
    ctx.beginPath(); ctx.moveTo(0, y(0.9)); ctx.lineTo(tw, y(0.9)); ctx.lineTo(tw, y(0.93)); ctx.lineTo(0, y(0.93)); ctx.fill()
    ctx.fillStyle = 'rgba(255,251,247,0.18)'
    for (let i = 0; i < tw / 5; i++) ctx.fillRect(r() * tw, y(0.902) + r() * (y(0.928) - y(0.902)), 2, 1.5)
    let x = 6
    ctx.fillStyle = '#7C4462'
    while (x < tw - 26) { const w = 18 + r() * 4; ctx.fillRect(x, y(0.894), w, Math.max(3, H * 0.007)); x += 30 + r() * 10 }
    ctx.fillStyle = '#4A2140'; ctx.fillRect(0, y(0.887), tw, Math.max(3, H * 0.005))
    ctx.fillStyle = 'rgba(246,211,220,0.75)'; ctx.fillRect(0, y(0.887), tw, 1)
    spots(r, tw, 14, 60, 8).forEach((gx) => {
      ctx.fillStyle = r() > 0.5 ? '#94506F' : '#A05C7C'
      const gy = y(0.875) + r() * 4
      ctx.beginPath(); ctx.moveTo(gx - 5, gy + 6); ctx.lineTo(gx - 2, gy - 5); ctx.lineTo(gx, gy + 2); ctx.lineTo(gx + 3, gy - 7); ctx.lineTo(gx + 6, gy + 6); ctx.fill()
    })
  })

  return layers
}

export function buildStars (canvas, W, H, R, count) {
  const r = rng(77)
  canvas.width = Math.ceil(W * R)
  canvas.height = Math.ceil(H * 0.62 * R)
  canvas.style.height = `${H * 0.62}px`
  const ctx = canvas.getContext('2d')
  ctx.scale(R, R)
  for (let i = 0; i < count; i++) {
    const x = r() * W
    const y = Math.pow(r(), 1.3) * H * 0.6
    const s = r() < 0.08 ? 1.6 + r() : 0.5 + r() * 1.1
    ctx.globalAlpha = 0.35 + r() * 0.65
    ctx.fillStyle = r() < 0.15 ? '#F4CF5D' : r() < 0.3 ? '#F6D3DC' : '#FFFBF7'
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
}
