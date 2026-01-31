import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import 'dotenv/config'

import analyzeRoute from './routes/analyze'
import modelsRoute from './routes/models'
import authRoute from './routes/auth'
import { authMiddleware, requireAuth } from './middleware/auth'
import { rateLimitMiddleware, authRateLimitMiddleware } from './middleware/rateLimit'

const app = new Hono()

app.use('*', logger())
app.use('/api/*', cors({
  origin: ['http://localhost:5173'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
}))

// Auth-Middleware für alle API-Routen (setzt auth context)
app.use('/api/*', authMiddleware())

// Auth-Endpunkt: striktes IP-basiertes Rate-Limiting, kein requireAuth
app.use('/api/auth/*', authRateLimitMiddleware())
app.route('/api/auth', authRoute)

// Geschützte Endpunkte: erfordern gültigen Token + User-basiertes Rate-Limiting
app.use('/api/analyze', requireAuth(), rateLimitMiddleware())
app.use('/api/models', requireAuth(), rateLimitMiddleware())
app.route('/api', analyzeRoute)
app.route('/api', modelsRoute)

app.get('/', (c) => c.text('Nährwert-Tracker API'))

const port = 3000
console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
