const router  = require('express').Router()
const path    = require('path')
const fs      = require('fs')
const multer  = require('multer')
const auth    = require('../middleware/authMiddleware')

const DATA_FILE  = path.join(__dirname, '../data/webprojects.json')
const LOGOS_DIR  = path.join(__dirname, '../uploads/logos')

fs.mkdirSync(LOGOS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: LOGOS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

function load() {
  if (!fs.existsSync(DATA_FILE)) return []
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// GET /api/webprojects
router.get('/', (req, res) => res.json(load()))

// POST /api/webprojects
router.post('/', auth, upload.single('logo'), (req, res) => {
  const { url, name, description_cs, description_en } = req.body
  if (!url || !name) return res.status(400).json({ error: 'Missing fields' })
  const projects = load()
  const project = {
    id:             Date.now().toString(),
    url,
    name,
    description_cs: description_cs || '',
    description_en: description_en || '',
    logo:           req.file ? `logos/${req.file.filename}` : null,
  }
  projects.push(project)
  save(projects)
  res.status(201).json(project)
})

// PATCH /api/webprojects/:id
router.patch('/:id', auth, upload.single('logo'), (req, res) => {
  const projects = load()
  const idx = projects.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const { url, name, description_cs, description_en } = req.body
  if (url) projects[idx].url = url
  if (name) projects[idx].name = name
  if (description_cs !== undefined) projects[idx].description_cs = description_cs
  if (description_en !== undefined) projects[idx].description_en = description_en
  if (req.file) projects[idx].logo = `logos/${req.file.filename}`
  save(projects)
  res.json(projects[idx])
})

// DELETE /api/webprojects/:id
router.delete('/:id', auth, (req, res) => {
  const projects = load()
  const idx = projects.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  projects.splice(idx, 1)
  save(projects)
  res.json({ ok: true })
})

module.exports = router
