const root = document.documentElement
const params = new URLSearchParams(location.search)
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')

export const env = {
  reduced: mqReduce.matches || params.has('reduced'),
  touch: window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0,
  // A first guess; world.js downgrades further if frames are slow.
  lowPower: (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3,
  params,
  debug: params.has('debug'),
  startAt: params.has('at') ? Math.max(0, Math.min(8, parseInt(params.get('at'), 10) || 0)) : 0,
  w: window.innerWidth,
  h: window.innerHeight,
  portrait: window.innerWidth / window.innerHeight < 1.05,
}

const listeners = new Set()
export function onReducedChange (fn) { listeners.add(fn) }

function applyFlags () {
  root.classList.toggle('reduced', env.reduced)
  root.classList.toggle('touch', env.touch)
  root.classList.toggle('low-power', env.lowPower)
}
applyFlags()

mqReduce.addEventListener?.('change', (e) => {
  env.reduced = e.matches
  applyFlags()
  listeners.forEach((fn) => fn(env.reduced))
})

export function setLowPower (v) {
  if (env.lowPower === v) return
  env.lowPower = v
  applyFlags()
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const rand = (a, b) => a + Math.random() * (b - a)
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
