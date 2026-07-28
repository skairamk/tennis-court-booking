import { createAuthClient } from 'better-auth/react'

// No baseURL needed: the app is served from a single origin (Vite proxies
// /api to Express in dev; Express serves everything in production), so
// relative requests to /api/auth/* always reach the right place.
export const authClient = createAuthClient()
