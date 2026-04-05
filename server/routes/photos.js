const router    = require('express').Router()
const path      = require('path')
const fs        = require('fs')
const auth      = require('../middleware/authMiddleware')

const FOTKY_DIR = path.join(__dirname, '../uploads/fotky')
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

function getFolderBySlug(slug) {
  return fs.readdirSync(FOTKY_DIR).find(name =>
    name.toLowerCase().replace(/\s+/g, '-') === slug
  )
}

// GET /api/photos?album=<slug>
router.get('/', (req, res) => {
  const { album } = req.query

  if (album) {
    const folder = getFolderBySlug(album)
    if (!folder) return res.json([])
    const files = fs.readdirSync(path.join(FOTKY_DIR, folder))
      .filter(f => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    return res.json(files.map(f => ({ filename: `fotky/${folder}/${f}` })))
  }

  const photos = []
  const folders = fs.readdirSync(FOTKY_DIR).filter(name =>
    fs.statSync(path.join(FOTKY_DIR, name)).isDirectory()
  )
  for (const folder of folders) {
    const files = fs.readdirSync(path.join(FOTKY_DIR, folder))
      .filter(f => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    for (const f of files) {
      photos.push({ filename: `fotky/${folder}/${f}`, album: folder })
    }
  }
  res.json(photos)
})

// DELETE /api/photos  (body: { filename })
router.delete('/', auth, (req, res) => {
  const { filename } = req.body
  if (!filename) return res.status(400).json({ error: 'Missing filename' })

  const filePath = path.join(__dirname, '../uploads', filename)
  try {
    fs.unlinkSync(filePath)
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Not found' })
  }
})

module.exports = router
