const router = require('express').Router()
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')
const auth   = require('../middleware/authMiddleware')
const { generatePreview } = require('../utils/preview')

const FOTKY_DIR = path.join(__dirname, '../uploads/fotky')

const upload = multer({
  storage: multer.memoryStorage(),
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
  const album = (req.body.album || 'nezarazene').trim()
  const dir = path.join(FOTKY_DIR, album)
  fs.mkdirSync(dir, { recursive: true })

  const inserted = req.files.map(f => {
    const filePath = path.join(dir, f.originalname)
    fs.writeFileSync(filePath, f.buffer)
    return { filename: `fotky/${album}/${f.originalname}` }
  })

  // Generate previews in background (non-blocking)
  inserted.forEach(({ filename }) => generatePreview(filename).catch(console.error))

  res.status(201).json({ inserted })
})

module.exports = router
