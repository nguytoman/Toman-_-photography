const router = require('express').Router()
const path   = require('path')
const fs     = require('fs')
const auth   = require('../middleware/authMiddleware')

const FILE = path.join(__dirname, '../data/settings.json')

function load() {
  if (!fs.existsSync(FILE)) return { coverPhoto: null, coverOpacity: 0.78 }
  return JSON.parse(fs.readFileSync(FILE, 'utf8'))
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}

// GET /api/settings
router.get('/', (req, res) => res.json(load()))

// PATCH /api/settings
router.patch('/', auth, (req, res) => {
  const current = load()
  const updated = { ...current, ...req.body }
  save(updated)
  res.json(updated)
})

module.exports = router
