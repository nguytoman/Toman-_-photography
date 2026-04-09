const path     = require('path')
const fs       = require('fs')
const sharp    = require('sharp')
const opentype = require('opentype.js')

const UPLOADS_DIR       = path.join(__dirname, '../uploads')
const PREVIEWS_DIR      = path.join(__dirname, '../uploads/previews')
const orbitronFont      = opentype.loadSync(path.join(__dirname, 'Orbitron.ttf'))
const spaceGroteskFont  = opentype.loadSync(path.join(__dirname, 'SpaceGrotesk.ttf'))

/**
 * Measure rendered width of text with a given font at a given size.
 */
function measureWidth(font, text, fontSize) {
  const scale = (1 / font.unitsPerEm) * fontSize
  return font.stringToGlyphs(text).reduce((sum, g) => sum + (g.advanceWidth || 0) * scale, 0)
}

/**
 * Render "© TOMAN PHOTOGRAPHY" as SVG paths.
 * © uses Space Grotesk, the rest uses Orbitron.
 * Right-aligned to (x, y).
 */
function watermarkPaths(fontSize, x, y, color) {
  const copyright = '© '
  const label     = 'TOMAN PHOTOGRAPHY'

  const wCopyright = measureWidth(spaceGroteskFont, copyright, fontSize)
  const wLabel     = measureWidth(orbitronFont, label, fontSize)
  const totalWidth = wCopyright + wLabel

  const startX = x - totalWidth

  const dCopyright = spaceGroteskFont.getPath(copyright, startX, y, fontSize).toPathData(2)
  const dLabel     = orbitronFont.getPath(label, startX + wCopyright, y, fontSize).toPathData(2)

  return `<path d="${dCopyright}" fill="${color}" /><path d="${dLabel}" fill="${color}" />`
}

/**
 * Generate a compressed + watermarked preview.
 * @param {string} filename - relative path like "fotky/Album/file.jpg"
 */
async function generatePreview(filename) {
  const srcPath     = path.join(UPLOADS_DIR, filename)
  const previewPath = path.join(PREVIEWS_DIR, filename)

  if (!fs.existsSync(srcPath)) return

  await fs.promises.mkdir(path.dirname(previewPath), { recursive: true })

  await sharp(srcPath)
    .rotate()
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 72 })
    .toFile(previewPath)
}

/**
 * Delete the preview for a given filename.
 */
function deletePreview(filename) {
  const previewPath = path.join(PREVIEWS_DIR, filename)
  try { fs.unlinkSync(previewPath) } catch {}
}

module.exports = { generatePreview, deletePreview, PREVIEWS_DIR }
