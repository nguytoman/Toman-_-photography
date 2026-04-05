const router = require('express').Router()
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')
const auth   = require('../middleware/authMiddleware')

const FOTKY_DIR = path.join(__dirname, '../uploads/fotky')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const album = req.body.album || 'nezarazene'
    const dir = path.join(FOTKY_DIR, album)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only images allowed'))
  },
})

// POST /api/upload
router.post('/', auth, upload.array('photos', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' })
  }
  const album = req.body.album || 'nezarazene'
  const inserted = req.files.map(f => ({ filename: `fotky/${album}/${f.originalname}` }))
  res.status(201).json({ inserted })
})

module.exports = router
