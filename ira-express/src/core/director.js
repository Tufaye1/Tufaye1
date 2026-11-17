import { gsap } from 'gsap'
import { env } from './env.js'
import { SPEED } from '../world/world.js'
import { stations, copy } from '../content.js'
import { showChapter } from '../ui/chapter.js'
import { preload } from '../ui/polaroid.js'

import opening from '../stations/opening.js'
import rizeup from '../stations/rizeup.js'
import ragebait from '../stations/ragebait.js'
import sleep from '../stations/sleep.js'
import focus from '../stations/focus.js'
import happy from '../stations/happy.js'
import goodsoul from '../stations/goodsoul.js'
import promise from '../stations/promise.js'
import final from '../stations/final.js'

const SCENES = [opening, rizeup, ragebait, sleep, focus, happy, goodsoul, promise, final]
const DARK_SKY = new Set(['golden', 'night'])

// Scene manager: one continuous ride, no reloads, no hard cuts.
export class Director {
  constructor (ctx) {
    this.ctx = ctx
    this.i = -1
    this.scene = null
    this.busy = false
    ctx.director = this
    ctx.complete = (opts) => this.complete(opts)
    this.bars = [...document.querySelectorAll('.bar')]
    gsap.set(this.bars, { '--open': 0 })
  }

  get index () { return this.i }

  openBars (d = 1.8) { return gsap.to(this.bars, { '--open': 1, duration: env.reduced ? 0.6 : d, ease: 'power3.inOut' }) }
  closeBars (d = 1.4) { return gsap.to(this.bars, { '--open': 0, duration: env.reduced ? 0.6 : d, ease: 'power3.inOut' }) }

  async start (at = 0) {
    const { world } = this.ctx
    if (at <= 0) return this.mount(0)
    // Debug / resume jump: open the curtains and arrive straight at station `at`.
    document.getElementById('app').classList.remove('is-opening')
    world.setSky(SCENES[at].sky, 0)
    this.openBars(0.01)
    world.setSpeed(SPEED.cruise, 0.01)
    return this.goTo(at)
  }

  // Mount scene i without a travel sequence (the opening).
  async mount (i) {
    const def = SCENES[i]
    const scene = def.create(this.ctx)
    this.ctx.stage.append(scene.el)
    this.scene = scene
    this.i = i
    await scene.start?.()
  }

  next () { if (!this.busy && this.i < SCENES.length - 1) return this.goTo(this.i + 1) }

  complete ({ delay = 1.2, button = copy.guide.next } = {}) {
    const { guide } = this.ctx
    gsap.delayedCall(env.reduced ? 0.4 : delay, () => {
      if (this.scene && !this.busy) guide.say(copy.guide.ready, { button, key: 'Enter', onButton: () => this.next() })
    })
  }

  async goTo(i) {
    if (this.busy) return
    this.busy = true
    const { world, guide, map, stage, music } = this.ctx
    const prev = this.scene
    const def = SCENES[i]
    const meta = stations[i - 1]
    guide.hide()

    // Depart: the train picks up speed and the camera lets the station slide away.
    if (prev && this.i > 0) {
      world.setSpeed(SPEED.cruise, 3.2, 'power2.in')
      world.camera({ scale: 1.02, x: 0, y: 0, duration: 2.6 })
      await (env.reduced
        ? gsap.to(prev.el, { autoAlpha: 0, duration: 0.6 })
        : gsap.to(prev.el, { xPercent: -115, duration: 1.6, ease: 'power2.in' }))
    }
    if (prev) { prev.destroy?.(); prev.el.remove() }
    this.scene = null
    this.i = i

    // Travel: chapter title like movie credits, sky and map move on.
    map.moveTo(i - 1)
    if (def.sky !== world.phase) world.setSky(def.sky, 3.4)
    music.duck(def.musicLevel ?? 0.55)
    const scene = def.create(this.ctx)
    gsap.set(scene.el, env.reduced ? { autoAlpha: 0 } : { xPercent: 115 })
    stage.append(scene.el)
    const chapter = showChapter(this.ctx.chapterEl, { small: meta.chapter, big: meta.name, dark: DARK_SKY.has(def.sky) })
    await Promise.all([preload(def.photos || []), gsap.delayedCall(Math.max(0.1, chapter.duration() - 1.1), () => {}).then()])

    // Arrive: slow down, dolly in a little, station slides into frame.
    world.setSpeed(def.speed ?? SPEED.station, 2.8, 'power3.out')
    world.camera({ scale: 1.06, x: 0, y: -(env.h * 0.012), duration: 2.8, ease: 'power2.out' })
    await (env.reduced
      ? gsap.to(scene.el, { autoAlpha: 1, duration: 0.6 })
      : gsap.to(scene.el, { xPercent: 0, duration: 2, ease: 'power3.out' }))
    map.arrive(i - 1)
    this.scene = scene
    this.busy = false
    await scene.start?.()
  }

  // Main action for Enter/Space when no button has focus.
  primary () {
    if (this.busy) return
    const { guide } = this.ctx
    if (guide.hasButton) return guide.pressButton()
    this.scene?.primary?.()
  }

  holdKey (down) {
    if (this.busy) return false
    return !!this.scene?.holdKey?.(down)
  }

  // Ride again: close the curtains, reset the world behind them, reopen on the ticket.
  async restart () {
    if (this.busy) return
    this.busy = true
    const { world, guide, map, fx, skyfx, stage } = this.ctx
    guide.hide()
    await this.closeBars(1.6)
    this.scene?.destroy?.()
    stage.innerHTML = ''
    fx.clear(); skyfx.clear()
    world.setSpeed(0, 0.01)
    world.setSky('morning', 0)
    gsap.set(world.root, { scale: 1.02, x: 0, y: 0 })
    map.reset()
    document.getElementById('app').classList.add('is-opening')
    this.busy = false
    this.mount(0)
  }
}
