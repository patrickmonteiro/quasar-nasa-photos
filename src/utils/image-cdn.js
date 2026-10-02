// Netlify Image CDN — resizes/re-encodes the rover images on the fly.
// Allowed source hosts are listed in netlify.toml (repo root) under [images].
const CDN_ORIGIN = 'https://quasar-nasa-photos.netlify.app'

export const DEFAULT_IMAGE_SETTINGS = {
  width: 480,
  height: 360, // PhotoCard is 4:3
  fit: 'cover',
  position: 'center',
  format: '',
  quality: 75
}

export function cdnUrl (src, settings = DEFAULT_IMAGE_SETTINGS) {
  const { width, height, fit, position, format, quality } = settings
  const params = new URLSearchParams({ url: src, fit, position })
  if (width) params.set('w', width)
  if (height) params.set('h', height)
  if (format) params.set('fm', format)
  if (Number(quality) !== 75) params.set('q', quality)
  return `${CDN_ORIGIN}/.netlify/images?${params}`
}
