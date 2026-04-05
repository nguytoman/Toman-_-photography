require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const express = require('express')
const cors    = require('cors')
const path    = require('path')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth',   require('./routes/auth'))
app.use('/api/photos', require('./routes/photos'))
app.use('/api/albums', require('./routes/albums'))
app.use('/api/upload', require('./routes/upload'))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`)
})
