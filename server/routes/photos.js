const router    = require('express').Router()
const path      = require('path')
const fs        = require('fs')
const multer    = require('multer')
const auth      = require('../middleware/authMiddleware')

const replaceUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })

const FOTKY_DIR     = path.join(__dirname, '../uploads/fotky')
const ORDER_FILE    = path.join(__dirname, '../data/photo-order.json')
const EDITS_FILE    = path.join(__dirname, '../data/photo-edits.json')
const ORIGINALS_DIR = path.join(__dirname, '../data/originals')
const IMAGE_EXT     = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

function getEdits() {
  if (!fs.existsSync(EDITS_FILE)) return {}
  return JSON.parse(fs.readFileSync(EDITS_FILE, 'utf8'))
}

function saveEdits(data) {
  fs.writeFileSync(EDITS_FILE, JSON.stringify(data, null, 2))
}

function getPhotoOrder() {
  if (!fs.existsSync(ORDER_FILE)) return {}
  return JSON.parse(fs.readFileSync(ORDER_FILE, 'utf8'))
}

function savePhotoOrder(data) {
  fs.writeFileSync(ORDER_FILE, JSON.stringify(data, null, 2))
}

function sortedFiles(folder, files) {
  const order = getPhotoOrder()[folder] || []
  const inOrder = order.filter(f => files.includes(f))
  const rest    = files.filter(f => !inOrder.includes(f))
  return [...inOrder, ...rest]
}

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
    return res.json(sortedFiles(folder, files).map(f => ({ filename: `fotky/${folder}/${f}` })))
  }

  const photos = []
  const folders = fs.readdirSync(FOTKY_DIR).filter(name =>
    fs.statSync(path.join(FOTKY_DIR, name)).isDirectory()
  )
  for (const folder of folders) {
    const files = fs.readdirSync(path.join(FOTKY_DIR, folder))
      .filter(f => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    for (const f of sortedFiles(folder, files)) {
      photos.push({ filename: `fotky/${folder}/${f}`, album: folder })
    }
  }
  res.json(photos)
})

// PUT /api/photos/order — save photo order for a folder
router.put('/order', auth, (req, res) => {
  const { folder, order } = req.body
  if (!folder || !Array.isArray(order)) return res.status(400).json({ error: 'Invalid' })
  const all = getPhotoOrder()
  all[folder] = order
  savePhotoOrder(all)
  res.json({ ok: true })
})

// GET /api/photos/edits — return edit records (admin only)
router.get('/edits', auth, (req, res) => {
  res.json(getEdits())
})

// POST /api/photos/replace — overwrite file with edited version
router.post('/replace', auth, replaceUpload.single('file'), (req, res) => {
  const { filename } = req.body
  if (!filename || !req.file) return res.status(400).json({ error: 'Missing data' })
  const filePath = path.join(__dirname, '../uploads', filename)
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' })

  // Save original before first edit
  const originalPath = path.join(ORIGINALS_DIR, filename)
  if (!fs.existsSync(originalPath)) {
    fs.mkdirSync(path.dirname(originalPath), { recursive: true })
    fs.copyFileSync(filePath, originalPath)
  }

  // Save edit params
  let params = null
  try { params = JSON.parse(req.body.params) } catch {}
  const edits = getEdits()
  edits[filename] = { editedAt: new Date().toISOString(), params }
  saveEdits(edits)

  fs.writeFileSync(filePath, req.file.buffer)
  res.json({ ok: true })
})

// POST /api/photos/revert — restore original
router.post('/revert', auth, (req, res) => {
  const { filename } = req.body
  if (!filename) return res.status(400).json({ error: 'Missing filename' })
  const originalPath = path.join(ORIGINALS_DIR, filename)
  if (!fs.existsSync(originalPath)) return res.status(404).json({ error: 'No original found' })
  const filePath = path.join(__dirname, '../uploads', filename)
  fs.copyFileSync(originalPath, filePath)
  fs.unlinkSync(originalPath)
  const edits = getEdits()
  delete edits[filename]
  saveEdits(edits)
  res.json({ ok: true })
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

// PATCH /api/photos — move to different folder
router.patch('/', auth, (req, res) => {
  const { filename, targetFolder } = req.body
  if (!filename || !targetFolder) return res.status(400).json({ error: 'Missing fields' })
  const oldPath    = path.join(__dirname, '../uploads', filename)
  const newFilename = `fotky/${targetFolder}/${path.basename(filename)}`
  const newPath    = path.join(__dirname, '../uploads', newFilename)
  fs.mkdirSync(path.dirname(newPath), { recursive: true })
  try {
    fs.renameSync(oldPath, newPath)
    res.json({ ok: true, filename: newFilename })
  } catch {
    res.status(500).json({ error: 'Failed to move file' })
  }
})

module.exports = router
