import { gsap } from 'gsap'
import { env } from '../core/env.js'
import { esc } from '../core/scope.js'

// Movie-credit style chapter titles between stations.
export function showChapter (root, { small, big, dark }) {
  root.innerHTML = `<span class="ch-small">${esc(small)}</span><span class="ch-big">${esc(big)}</span><span class="ch-rule"></span>`
  root.classList.toggle('on-dark', !!dark)
  const [s, b, r] = root.children
  const tl = gsap.timeline()
  tl.set(root, { autoAlpha: 1 })
  if (env.reduced) {
    tl.fromTo([s, b, r], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 })
      .to([s, b, r], { autoAlpha: 0, duration: 0.5 }, '+=1.2')
  } else {
    tl.fromTo(s, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' })
      .fromTo(b, { autoAlpha: 0, y: 14, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' }, 0.25)
      .fromTo(r, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power2.inOut' }, 0.45)
      .to([s, b, r], { autoAlpha: 0, y: -8, duration: 0.7, ease: 'power2.in', stagger: 0.06 }, '+=0.9')
  }
  tl.set(root, { autoAlpha: 0 })
  return tl
}
