// Tiny synthesized sound effects (no files). Independent of the music toggle,
// because the whistle is part of the opening. Quiet by design.
let ac = null
let master = null
let muted = false

function ctx () {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ac = new AC()
    master = ac.createGain()
    master.gain.value = 0.32
    master.connect(ac.destination)
  }
  if (ac.state === 'suspended') ac.resume()
  return ac
}

function noiseBuffer (a, seconds) {
  const len = Math.floor(a.sampleRate * seconds)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function env (a, g, t0, attack, hold, release, peak) {
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack)
  g.gain.setValueAtTime(peak, t0 + attack + hold)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release)
}

function tone (freq, { type = 'sine', at = 0, attack = 0.01, hold = 0.05, release = 0.2, peak = 0.3, to = null, filter = null } = {}) {
  const a = ctx(); if (!a || muted) return
  const t0 = a.currentTime + at
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + attack + hold + release)
  let node = o
  if (filter) {
    const f = a.createBiquadFilter()
    f.type = 'lowpass'; f.frequency.value = filter
    o.connect(f); node = f
  }
  node.connect(g); g.connect(master)
  env(a, g, t0, attack, hold, release, peak)
  o.start(t0); o.stop(t0 + attack + hold + release + 0.05)
}

function noise ({ at = 0, dur = 0.3, type = 'bandpass', freq = 1200, to = null, q = 1, peak = 0.3, attack = 0.01 } = {}) {
  const a = ctx(); if (!a || muted) return
  const t0 = a.currentTime + at
  const s = a.createBufferSource()
  s.buffer = noiseBuffer(a, dur + 0.1)
  const f = a.createBiquadFilter()
  f.type = type; f.Q.value = q
  f.frequency.setValueAtTime(freq, t0)
  if (to) f.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  const g = a.createGain()
  s.connect(f); f.connect(g); g.connect(master)
  env(a, g, t0, attack, dur * 0.2, dur * 0.8, peak)
  s.start(t0); s.stop(t0 + dur + 0.1)
}

export const sfx = {
  unlock () { ctx() },
  setMuted (v) { muted = v },
  whistle () {
    // Steam whistle: a minor-ish chord with a breathy attack, two blasts.
    ;[0, 0.62].forEach((at, n) => {
      const len = n ? 0.85 : 0.4
      ;[466, 554, 698].forEach((f) => tone(f, { type: 'triangle', at, attack: 0.06, hold: len, release: 0.25, peak: 0.09, filter: 2400 }))
      noise({ at, dur: len + 0.2, freq: 1800, q: 0.7, peak: 0.05, attack: 0.05 })
    })
  },
  punch () {
    noise({ dur: 0.06, type: 'highpass', freq: 2500, peak: 0.5, attack: 0.002 })
    tone(140, { type: 'sine', attack: 0.002, hold: 0.02, release: 0.09, peak: 0.4, to: 70 })
  },
  pop () { tone(520, { attack: 0.005, hold: 0.02, release: 0.12, peak: 0.25, to: 900 }) },
  boop () { tone(240, { type: 'square', attack: 0.005, hold: 0.04, release: 0.12, peak: 0.06, to: 170, filter: 1200 }) },
  ding () {
    tone(880, { attack: 0.005, hold: 0.05, release: 0.7, peak: 0.18 })
    tone(1320, { at: 0.08, attack: 0.005, hold: 0.05, release: 0.8, peak: 0.12 })
  },
  whoosh () { noise({ dur: 0.22, freq: 2400, to: 500, q: 1.2, peak: 0.12 }) },
  click () { tone(1600, { attack: 0.001, hold: 0.005, release: 0.04, peak: 0.12 }) },
  poof () { noise({ dur: 0.35, type: 'lowpass', freq: 900, to: 200, peak: 0.25, attack: 0.02 }) },
  sparkle () { [0, 0.07, 0.14, 0.21].forEach((at, i) => tone(1200 + i * 260, { at, attack: 0.003, hold: 0.02, release: 0.25, peak: 0.07 })) },
  boom () {
    noise({ dur: 0.9, type: 'lowpass', freq: 500, to: 80, peak: 0.22, attack: 0.005 })
    noise({ at: 0.15, dur: 0.5, type: 'highpass', freq: 3000, peak: 0.04 })
  },
  chime () { [523, 659, 784, 1047].forEach((f, i) => tone(f, { at: i * 0.12, attack: 0.005, hold: 0.05, release: 0.9, peak: 0.08 })) },
}
