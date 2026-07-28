import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth.js'
import courtsRouter from './routes/courts.js'
import bookingsRouter from './routes/bookings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

const app = express()

// Better Auth needs the raw request stream, so it must be mounted before
// express.json() parses the body.
app.all('/api/auth/*', toNodeHandler(auth))

app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/courts', courtsRouter)
app.use('/api/bookings', bookingsRouter)

// In production there's no separate frontend server: this same Express
// process serves the Vite-built static assets, so the whole app is one
// deployable artifact (one process, one port).
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
