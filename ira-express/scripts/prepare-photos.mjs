// Resizes the originals in photos/ to max 1200px into public/photos/.
// Also cuts the grey background out of einstein.* so it can be a die-cut sticker.
//   node scripts/prepare-photos.mjs          strict: exits 1 if a photo is missing
//   node scripts/prepare-photos.mjs --soft   warns only (used by `npm run dev`)
//   ALLOW_MISSING_PHOTOS=1 npm run build     build anyway (placeholders are shown)
import { readdir, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const SRC = path.join(ROOT, 'photos')
const OUT = path.join(ROOT, 'public', 'photos')
const NAMES = ['office', 'tongue', 'angry', 'einstein', 'sleep', 'stress', 'river', 'street', 'cake', 'smile', 'conference', 'hearts']
const EXT = ['.jpg', '.jpeg', '.png', '.webp']
const MAX = 1200

const soft = process.argv.includes('--soft') || process.env.ALLOW_MISSING_PHOTOS === '1'

await mkdir(OUT, { recursive: true })
let files = []
try { files = await readdir(SRC) } catch { /* folder missing */ }

const find = (name) => files.find((f) => {
  const p = path.parse(f)
  return p.name.toLowerCase() === name && EXT.includes(p.ext.toLowerCase())
})

const newer = async (a, b) => {
  try { return (await stat(a)).mtimeMs <= (await stat(b)).mtimeMs } catch { return false }
}

const missing = []
for (const name of NAMES) {
  const f = find(name)
  if (!f) {
    const heic = files.find((x) => path.parse(x).name.toLowerCase() === name)
    missing.push(heic ? `${name} (found ${heic}: convert it to .jpg first)` : name)
    continue
  }
  const src = path.join(SRC, f)
  const out = path.join(OUT, `${name}.jpg`)
  if (!(await newer(src, out))) {
    await sharp(src).rotate()
      .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toFile(out)
  }
  if (name === 'einstein') await sticker(src, path.join(OUT, 'einstein.png'))
}

console.log(`photos: ${NAMES.length - missing.length}/${NAMES.length} ready in public/photos`)
if (missing.length) {
  const msg = `Missing photos: ${missing.join(', ')}\nPut them in ira-express/photos/ (jpg, jpeg, png or webp).`
  if (soft) {
    console.warn(`\n⚠  ${msg}\n   The app shows a pink placeholder for each until you add them.\n`)
  } else {
    console.error(`\n✖  ${msg}\n   Refusing to build a gift with holes in it.\n   To build anyway: ALLOW_MISSING_PHOTOS=1 npm run build\n`)
    process.exit(1)
  }
}

// Flood-fills the flat grey background from the borders and makes it transparent.
async function sticker (src, out) {
  if (await newer(src, out)) return
  const { data, info } = await sharp(src).rotate().resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const idx = (x, y) => (y * w + x) * 4
  // Background + its drop shadow: low-saturation grey that is darker than the white die-cut border.
  const close = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const sat = Math.max(r, g, b) - Math.min(r, g, b)
    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    return sat < 22 && luma < 228 && luma > 90
  }
  const seen = new Uint8Array(w * h)
  const stack = []
  for (let x = 0; x < w; x++) stack.push(x, 0, x, h - 1)
  for (let y = 0; y < h; y++) stack.push(0, y, w - 1, y)
  let cleared = 0
  while (stack.length) {
    const y = stack.pop(); const x = stack.pop()
    if (x < 0 || y < 0 || x >= w || y >= h) continue
    const k = y * w + x
    if (seen[k]) continue
    seen[k] = 1
    const i = idx(x, y)
    if (!close(i)) continue
    data[i + 3] = 0
    cleared++
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1)
  }
  if (cleared < w * h * 0.08) return // background was not flat: keep the plain jpg only
  // Re-draw a white die-cut border (R px) around whatever is left, on a padded canvas.
  const R = Math.round(Math.max(w, h) * 0.026)
  const P = R + 4
  const W2 = w + P * 2, H2 = h + P * 2
  const out2 = Buffer.alloc(W2 * H2 * 4)
  const solid = new Uint8Array(W2 * H2)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = idx(x, y), j = ((y + P) * W2 + x + P) * 4
    out2[j] = data[i]; out2[j + 1] = data[i + 1]; out2[j + 2] = data[i + 2]; out2[j + 3] = data[i + 3]
    if (data[i + 3] > 0) solid[(y + P) * W2 + x + P] = 1
  }
  const offs = []
  for (let dy = -R - 1; dy <= R + 1; dy++) for (let dx = -R - 1; dx <= R + 1; dx++) {
    const d = Math.hypot(dx, dy)
    if (d <= R + 1) offs.push([dx, dy, d])
  }
  offs.sort((a, b) => a[2] - b[2])
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const k = y * W2 + x
    const j = k * 4
    if (out2[j + 3] === 255) continue
    let best = 99
    for (const [dx, dy, d] of offs) {
      const xx = x + dx, yy = y + dy
      if (xx < 0 || yy < 0 || xx >= W2 || yy >= H2) continue
      if (solid[yy * W2 + xx]) { best = d; break }
    }
    if (best > R + 1) continue
    const a = Math.round(255 * Math.min(1, Math.max(0, R + 1 - best)))
    // white border under any partially transparent edge pixel
    const ea = out2[j + 3] / 255
    out2[j] = Math.round(out2[j] * ea + 255 * (1 - ea))
    out2[j + 1] = Math.round(out2[j + 1] * ea + 255 * (1 - ea))
    out2[j + 2] = Math.round(out2[j + 2] * ea + 255 * (1 - ea))
    out2[j + 3] = Math.max(out2[j + 3], a)
  }
  await sharp(out2, { raw: { width: W2, height: H2, channels: 4 } }).png({ compressionLevel: 9 }).toFile(out)
}
