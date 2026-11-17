// All words and photos live here, so you can edit them without touching the scenes.
// Captions marked "(mine)" were not in your brief: I wrote them. Change freely.

export const photos = {
  office: { src: 'office.jpg', caption: 'RizeUp, where it started', alt: 'Ira at the RizeUp office', pos: '50% 35%' },
  tongue: { src: 'tongue.jpg', caption: 'no filter', alt: 'Ira sticking her tongue out', pos: '50% 40%' },
  angry: { src: 'angry.jpg', caption: 'ragebait mode', alt: 'Ira giving her angriest look', pos: '58% 45%' },
  einstein: { src: 'einstein.png', fallback: 'einstein.jpg', alt: 'Einstein sticking his tongue out' },
  sleep: { src: 'sleep.jpg', caption: 'evidence 👀', alt: 'Ira asleep in a very questionable posture', pos: '50% 40%' },
  stress: { src: 'stress.jpg', caption: 'too many texts', alt: 'Ira stressed at her laptop', pos: '50% 34%' },
  river: { src: 'river.jpg', caption: 'river days', alt: 'Ira by the river', pos: '50% 40%' }, // caption (mine)
  street: { src: 'street.jpg', caption: 'street walks', alt: 'Ira on the street', pos: '50% 40%' }, // caption (mine)
  cake: { src: 'cake.jpg', caption: 'cake first', alt: 'Ira with cake', pos: '50% 45%' }, // caption (mine)
  smile: { src: 'smile.jpg', caption: 'this smile', alt: 'Ira smiling with a peace sign', pos: '50% 32%' }, // caption (mine)
  conference: { src: 'conference.jpg', caption: 'we will shine', alt: 'Ira at a conference', pos: '50% 40%' },
  hearts: { src: 'hearts.jpg', caption: '18 November', alt: 'Ira, hearts', pos: '50% 40%' }, // caption (mine)
}

export const ticket = {
  brand: 'The Ira Express',
  fields: [
    ['PASSENGER:', 'Ira'],
    ['FROM:', 'Tufayel Bhaia'],
    ['DESTINATION:', '18 November'],
  ],
  number: 'No. 1811',
}

// Station order = progress map order. `chapter` is the movie-credit title between stations.
export const stations = [
  { id: 'rizeup', name: 'RizeUp', chapter: 'Chapter one' },
  { id: 'ragebait', name: 'Ragebait', chapter: 'Chapter two' },
  { id: 'sleep', name: 'Sleep', chapter: 'Chapter three' },
  { id: 'focus', name: 'Focus', chapter: 'Chapter four' },
  { id: 'happy', name: 'Happy', chapter: 'Chapter five' },
  { id: 'goodsoul', name: 'Good soul', chapter: 'Chapter six' },
  { id: 'promise', name: 'Promise', chapter: 'Chapter seven' },
  { id: 'final', name: '18 November', chapter: 'Final station' },
]

export const copy = {
  guide: {
    punch: 'Tap to punch your ticket',
    shoes: 'Find the shoes',
    quiz: 'Pick the right answer',
    quizWrong: 'Nope. Think ragebait.',
    posture: 'Drag to straighten her photo',
    focus: 'Swipe the long texts away',
    develop: 'Tap each polaroid to develop it',
    hold: 'Hold the screen',
    promise: 'Hold to promise',
    candles: 'Make a wish, then blow out each candle',
    ready: 'Ready? Ride on',
    next: 'Next station',
  },

  rizeup: {
    title: "Find Ira's lost shoes!",
    timer: 'minutes searching...',
    nope: ['not here', 'nope', 'hmm…', 'where??', 'not this'],
    note: 'We met for business. Day one, you lost your shoes for 30 minutes and panicked like the office was on fire. Somehow that girl became my friend. And now you send me long texts 🥹',
  },

  ragebait: {
    question: 'What does Ira say the most?',
    options: [
      { key: 'A', text: '"Good morning"' },
      { key: 'B', text: '"I\'m here to eat your brain. Don\'t worry."', correct: true },
      { key: 'C', text: '"I\'ll sleep early"' },
    ],
    note: "Random acting. Full-time ragebaiter. I'm worried.",
  },

  sleep: {
    note: 'Big brother rule #1: sleep properly. With proper posture. Not like this.',
  },

  focus: {
    // The long ones get swiped away. They are mine, written as harmless rambling.
    long: [
      'Bhaia okay so listen, first the client changed the deck again and then I thought maybe I should redo the whole thing but then…',
      'also about what you said yesterday, I have like 4 points, no wait 6 points, let me explain each one properly before you reply',
      'and the meeting got moved, then moved back, then someone said it was cancelled but it is not cancelled??',
      'sorry this is long but it is important. also not that important. but kind of important. I will explain…',
      'ok one more thing (it is actually three things)',
      'wait did you see my previous message? the long one? the one before the long one?',
      'I wrote a whole paragraph, deleted it, and now I am writing it again but better',
      'update on the office shoes situation: found. but let me tell you how',
    ],
    short: 'Bhaia, can you check slide 3? 5 minutes.',
    note: 'Rule #2: one thing at a time. Long texts stress you out, so send direct messages. Be specific. Be focused.',
  },

  happy: {
    hint: 'tap to develop',
    note: 'Rule #3: stay happy like this. Keep your random acting. Never lose it.',
  },

  goodsoul: {
    lines: [
      'I saw you cry once. That day I understood how soft your heart is.',
      'You are beautiful the way you are. And most importantly, you are a good soul.',
      "I can share every single thing with you. That's rare.",
    ],
  },

  promise: {
    button: 'Hold to promise 🤙',
    note: "Promise me: stay calm. Allah is always with you. Don't stress yourself, you have so many people around you. Whenever you need me, just ask. Tufayel Bhaia will be there, 100%.",
    note2: 'Have faith. We will shine together, inshallah.',
  },

  final: {
    priority: 'Today you are my No. 1 priority.',
    title: 'Happy Birthday, Tufayel 2.0 🎉',
    from: 'From your Tufayel Bhaia',
    again: 'Ride again',
  },
}
