require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const express = require('express')
const cors    = require('cors')
const path    = require('path')
const fs      = require('fs')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

// Public: compressed previews only
app.use('/uploads/previews', express.static(path.join(__dirname, 'uploads/previews')))
// Admin-facing: full quality originals (URL not exposed in public API)
app.use('/uploads',   express.static(path.join(__dirname, 'uploads')))
app.use('/originals', express.static(path.join(__dirname, 'data/originals')))

app.use('/api/auth',    require('./routes/auth'))
app.use('/api/photos',  require('./routes/photos'))
app.use('/api/albums',  require('./routes/albums'))
app.use('/api/upload',  require('./routes/upload'))
app.use('/api/contact',     require('./routes/contact'))
app.use('/api/webprojects', require('./routes/webprojects'))
app.use('/api/settings',   require('./routes/settings'))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`)
  generateMissingPreviews()
})

// Generate previews for any photos that don't have one yet (runs async on startup)
async function generateMissingPreviews() {
  const { generatePreview } = require('./utils/preview')
  const FOTKY_DIR    = path.join(__dirname, 'uploads/fotky')
  const PREVIEWS_DIR = path.join(__dirname, 'uploads/previews')
  const IMAGE_EXT    = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

  if (!fs.existsSync(FOTKY_DIR)) return

  const folders = fs.readdirSync(FOTKY_DIR).filter(n =>
    fs.statSync(path.join(FOTKY_DIR, n)).isDirectory()
  )

  let count = 0
  for (const folder of folders) {
    const files = fs.readdirSync(path.join(FOTKY_DIR, folder))
      .filter(f => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    for (const f of files) {
      const filename    = `fotky/${folder}/${f}`
      const previewPath = path.join(PREVIEWS_DIR, filename)
      if (!fs.existsSync(previewPath)) {
        try {
          await generatePreview(filename)
          count++
        } catch (e) {
          console.error(`[preview] Failed for ${filename}:`, e.message)
        }
      }
    }
  }
  if (count > 0) console.log(`[preview] Generated ${count} missing preview(s)`)
}
