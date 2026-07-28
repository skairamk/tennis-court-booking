import 'dotenv/config'
import { betterAuth } from 'better-auth'
import { pool } from './db.js'

const port = process.env.PORT || 3001

// trustedOrigins covers the case where the browser talks to Vite's dev
// server (port 5173) while this Express process (and Better Auth's own
// baseURL) runs on a different port; Vite proxies /api there, but the
// browser's Origin header still says :5173. In production there's only
// one origin (this same process serves everything), so this list is
// only load-bearing during local dev.
const baseURL = process.env.BETTER_AUTH_URL || `http://localhost:${port}`

export const auth = betterAuth({
  database: pool,
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: ['http://localhost:5173', `http://localhost:${port}`, baseURL],
  emailAndPassword: {
    enabled: true,
  },
})
