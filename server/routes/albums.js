const router    = require('express').Router()
const path      = require('path')
const fs        = require('fs')
const auth      = require('../middleware/authMiddleware')

const FOTKY_DIR  = path.join(__dirname, '../uploads/fotky')
const ORDER_FILE = path.join(__dirname, '../data/folder-order.json')
const IMAGE_EXT  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

function getFolders() {
  return fs.readdirSync(FOTKY_DIR).filter(name =>
    fs.statSync(path.join(FOTKY_DIR, name)).isDirectory()
  )
}

function getOrder() {
  if (!fs.existsSync(ORDER_FILE)) return []
  return JSON.parse(fs.readFileSync(ORDER_FILE, 'utf8'))
}

function saveOrder(order) {
  fs.writeFileSync(ORDER_FILE, JSON.stringify(order, null, 2))
}

function sortedFolders() {
  const all   = getFolders()
  const order = getOrder()
  const inOrder = order.filter(f => all.includes(f))
  const rest    = all.filter(f => !inOrder.includes(f))
  return [...inOrder, ...rest]
}

// GET /api/albums
router.get('/', (req, res) => {
  const albums = sortedFolders().map(name => ({
    slug:     name.toLowerCase().replace(/\s+/g, '-'),
    title_cs: name.charAt(0).toUpperCase() + name.slice(1),
    title_en: name.charAt(0).toUpperCase() + name.slice(1),
    folder:   name,
    count:    fs.readdirSync(path.join(FOTKY_DIR, name))
                .filter(f => IMAGE_EXT.has(path.extname(f).toLowerCase())).length,
  }))
  res.json(albums)
})

// POST /api/albums — create folder
router.post('/', auth, (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Missing name' })
  const dir = path.join(FOTKY_DIR, name)
  if (fs.existsSync(dir)) return res.status(409).json({ error: 'Already exists' })
  fs.mkdirSync(dir, { recursive: true })
  res.status(201).json({ ok: true, folder: name })
})

// PUT /api/albums/order — save order
router.put('/order', auth, (req, res) => {
  const { order } = req.body
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid' })
  saveOrder(order)
  res.json({ ok: true })
})

// PATCH /api/albums/:folder — rename
router.patch('/:folder', auth, (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Missing name' })
  const oldDir = path.join(FOTKY_DIR, req.params.folder)
  const newDir = path.join(FOTKY_DIR, name)
  if (!fs.existsSync(oldDir)) return res.status(404).json({ error: 'Not found' })
  fs.renameSync(oldDir, newDir)
  // update order file if needed
  const order = getOrder().map(f => f === req.params.folder ? name : f)
  saveOrder(order)
  res.json({ ok: true })
})

// DELETE /api/albums/:folder
router.delete('/:folder', auth, (req, res) => {
  const dir = path.join(FOTKY_DIR, req.params.folder)
  if (!fs.existsSync(dir)) return res.status(404).json({ error: 'Not found' })
  fs.rmSync(dir, { recursive: true })
  saveOrder(getOrder().filter(f => f !== req.params.folder))
  res.json({ ok: true })
})

module.exports = router
