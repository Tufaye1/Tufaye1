import { gsap } from 'gsap'
import { h, esc, createScope } from '../core/scope.js'
import { env, rand } from '../core/env.js'
import { copy } from '../content.js'
import { brain } from '../art/art.js'
import { polaroid, sticker } from '../ui/polaroid.js'
import { shell, note, swap, shake } from './shell.js'

export default {
  sky: 'day',
  photos: ['tongue', 'angry', 'einstein'],
  create (ctx) {
    const S = createScope()
    const { guide, sfx } = ctx
    const t = copy.ragebait
    const { el, body } = shell('ragebait', 'Ragebait', 'two')
    const media = h('div', { class: 'media stack' })
    media.append(
      polaroid('tongue', { rot: -7, cls: 'pol-a' }),
      polaroid('angry', { rot: 6, cls: 'pol-b' }),
      sticker('einstein', 'stk'),
    )
    const play = h('div', { class: 'play' })
    play.innerHTML = `
      <div class="card quiz">
        <h2 class="quiz-q">${esc(t.question)}</h2>
        <div class="quiz-opts" role="group" aria-label="Answers">
          ${t.options.map((o, i) => `<button type="button" class="opt" data-i="${i}"><span class="opt-k">${o.key}</span><span class="opt-t">${esc(o.text)}</span></button>`).join('')}
        </div>
      </div>`
    const n = note(t.note, 'note-short')
    n.style.display = 'none'
    play.append(n)
    body.append(media, play)
    const quiz = play.querySelector('.quiz')
    const opts = [...play.querySelectorAll('.opt')]
    let done = false

    const brains = () => {
      const layer = h('div', { class: 'brains', 'aria-hidden': 'true' })
      el.append(layer)
      const W = el.clientWidth
      const H = el.clientHeight
      const count = env.reduced ? 3 : env.lowPower ? 5 : 8
      for (let i = 0; i < count; i++) {
        const b = h('div', { class: 'brain' }, brain)
        layer.append(b)
        const size = rand(46, 84) * Math.min(1.2, Math.max(0.7, W / 1100))
        const y = H * rand(0.12, 0.7)
        gsap.set(b, { width: size, x: -size * 1.4, y })
        if (env.reduced) {
          S.fromTo(b, { x: rand(0.1, 0.85) * W, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, delay: i * 0.12, yoyo: true, repeat: 1, repeatDelay: 1.2 })
          continue
        }
        const dur = rand(2.2, 3.2)
        const delay = i * 0.16
        S.to(b, { x: W + size * 1.4, duration: dur, delay, ease: 'none' })
        S.to(b, { rotation: rand(-25, 25), duration: dur / 4, delay, yoyo: true, repeat: 3, ease: 'sine.inOut' })
        const hop = rand(50, 120)
        const hops = Math.round(rand(4, 6))
        S.to(b, { y: y - hop, duration: dur / (hops * 2), delay, yoyo: true, repeat: hops * 2 - 1, ease: 'power1.out' })
      }
      S.delay(4.4, () => layer.remove())
    }

    const answer = (i) => {
      if (done) return
      const o = t.options[i]
      const btn = opts[i]
      if (!o.correct) {
        sfx.boop()
        btn.classList.add('wrong')
        S.add(shake(btn))
        guide.say(copy.guide.quizWrong, { key: 'Enter' })
        return
      }
      done = true
      sfx.ding()
      btn.classList.add('right')
      opts.forEach((b) => { b.disabled = b !== btn })
      if (!env.reduced) S.fromTo(btn, { scale: 1 }, { scale: 1.05, duration: 0.16, yoyo: true, repeat: 1 })
      guide.hide()
      brains()
      S.delay(env.reduced ? 1.5 : 2.6, () => swap(S, quiz, n))
      ctx.complete({ delay: env.reduced ? 2.2 : 4 })
    }
    opts.forEach((b, i) => S.on(b, 'click', (e) => { e.stopPropagation(); answer(i) }))

    return {
      el,
      start () { guide.say(copy.guide.quiz, { key: 'Tab, Enter' }) },
      primary () { opts[0].focus() },
      destroy () { S.kill() },
    }
  },
}
