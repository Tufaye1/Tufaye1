import { gsap } from 'gsap'
import { trainIcon } from '../art/art.js'
import { stations } from '../content.js'
import { env } from '../core/env.js'

// Small progress map: stations as dots on a rail line, a train that rides between them.
export class ProgressMap {
  constructor (root) {
    this.root = root
    root.innerHTML = `
      <div class="map-line">
        <div class="map-rail"></div>
        <div class="map-fill"></div>
        ${stations.map((s, i) => `<span class="map-dot" style="--i:${i}" title="${s.name}"></span>`).join('')}
        <div class="map-runner"><div class="map-train">${trainIcon}</div></div>
      </div>
      <div class="map-label" aria-live="polite"></div>`
    this.dots = [...root.querySelectorAll('.map-dot')]
    this.train = root.querySelector('.map-runner')
    this.fill = root.querySelector('.map-fill')
    this.label = root.querySelector('.map-label')
    this.at = -1
    gsap.set(this.train, { xPercent: 0 })
    gsap.set(this.fill, { scaleX: 0 })
  }

  pct (i) { return (i / (stations.length - 1)) * 100 }

  // i = station index (0..7). `arrive` marks it current.
  moveTo (i, duration = 2.6) {
    const d = env.reduced ? 0.4 : duration
    gsap.to(this.train, { xPercent: this.pct(i), duration: d, ease: 'power2.inOut' })
    gsap.to(this.fill, { scaleX: i / (stations.length - 1), duration: d, ease: 'power2.inOut' })
    this.dots.forEach((dot, n) => {
      dot.classList.toggle('done', n < i)
      dot.classList.toggle('next', n === i)
      dot.classList.remove('here')
    })
    this.at = i
    this.label.textContent = `Next: ${stations[i].name}`
  }

  arrive (i) {
    this.dots[i]?.classList.add('here')
    this.dots[i]?.classList.remove('next')
    this.label.textContent = stations[i].name
  }

  reset () {
    gsap.set(this.train, { xPercent: 0 })
    gsap.set(this.fill, { scaleX: 0 })
    this.dots.forEach((d) => d.classList.remove('done', 'next', 'here'))
    this.label.textContent = ''
  }
}
