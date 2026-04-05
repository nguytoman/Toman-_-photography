const router = require('express').Router()
const path   = require('path')
const fs     = require('fs')

const FOTKY_DIR = path.join(__dirname, '../uploads/fotky')

router.get('/', (req, res) => {
  const folders = fs.readdirSync(FOTKY_DIR).filter(name => {
    return fs.statSync(path.join(FOTKY_DIR, name)).isDirectory()
  })
  const albums = folders.map(name => ({
    slug:     name.toLowerCase().replace(/\s+/g, '-'),
    title_cs: name.charAt(0).toUpperCase() + name.slice(1),
    title_en: name.charAt(0).toUpperCase() + name.slice(1),
    folder:   name,
  }))
  res.json(albums)
})

module.exports = router
