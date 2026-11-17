import { gsap } from 'gsap'
import './styles/base.css'
import './styles/world.css'
import './styles/ui.css'
import './styles/stations.css'
import { env } from './core/env.js'
import { initViewport } from './core/viewport.js'
import { sfx } from './core/sfx.js'
import { World } from './world/world.js'
import { Particles } from './fx/particles.js'
import { Guide } from './ui/guide.js'
import { ProgressMap } from './ui/map.js'
import { Music } from './ui/music.js'
import { Director } from './core/director.js'
import { initGrain } from './fx/grain.js'

gsap.config({ force3D: 'auto' })
if (env.params.has('speed')) gsap.globalTimeline.timeScale(Math.max(0.25, Math.min(8, parseFloat(env.params.get('speed')) || 1)))

const $ = (id) => document.getElementById(id)
const app = $('app')

const world = new World($('world'))
const fx = new Particles($('fx'))
const skyfx = new Particles(world.skyfx, { trails: true })
const guide = new Guide($('guide'))
const map = new ProgressMap($('map'))
const music = new Music($('music'))

const ctx = { world, fx, skyfx, guide, map, music, sfx, env, stage: $('stage'), chapterEl: $('chapter'), app }

initViewport((w, h) => {
  world.resize(w, h)
  fx.resize(w, h)
  skyfx.resize(w, h)
})
initGrain(app.querySelector('.grain'))
gsap.set(world.root, { scale: 1.02, transformOrigin: '50% 60%' })

const director = new Director(ctx)

// Enter / Space = main action. Buttons keep their native behaviour.
const isKey = (e) => e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'
window.addEventListener('keydown', (e) => {
  if (!isKey(e)) return
  const onButton = e.target.closest?.('button, a, input, textarea, [role="button"]')
  if (director.holdKey(true)) { e.preventDefault(); return }
  if (onButton) return
  e.preventDefault()
  if (!e.repeat) director.primary()
})
window.addEventListener('keyup', (e) => {
  if (isKey(e) && director.holdKey(false)) e.preventDefault()
})

// No long-press menus, no pinch-zoom surprises, no pull-to-refresh.
app.addEventListener('contextmenu', (e) => e.preventDefault())
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false })

// Pause everything when the tab is hidden (saves her battery).
document.addEventListener('visibilitychange', () => {
  if (document.hidden) gsap.ticker.sleep()
  else gsap.ticker.wake()
})

if (env.debug) window.__ira = { director, world, fx, skyfx, guide, gsap }

document.fonts?.ready.finally(() => app.classList.add('fonts-ready'))
director.start(env.startAt)
