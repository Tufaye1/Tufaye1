// Film grain from a tiny generated noise tile. Moved with transform steps only.
export function initGrain (el) {
  const c = document.createElement('canvas')
  c.width = c.height = 160
  const g = c.getContext('2d')
  const img = g.createImageData(160, 160)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() < 0.5 ? 0 : 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = Math.random() * 46
  }
  g.putImageData(img, 0, 0)
  el.style.backgroundImage = `url(${c.toDataURL()})`
}
