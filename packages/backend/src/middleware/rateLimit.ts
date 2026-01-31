import type { Context, Next } from 'hono'
import { getAuth } from './auth'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const WINDOW_MS = 60 * 1000 // 1 minute
const AUTH_ENDPOINT_LIMIT = 5 // Sehr strikt für Auth-Endpunkt
const store = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}, WINDOW_MS)

function getClientIp(c: Context): string {
  return c.req.header('x-forwarded-for')?.split(',')[0].trim()
    || c.req.header('x-real-ip')
    || 'unknown'
}

// Striktes Rate-Limiting für Auth-Endpunkt (IP-basiert)
export function authRateLimitMiddleware() {
  return async (c: Context, next: Next) => {
    const now = Date.now()
    const identifier = `auth:${getClientIp(c)}`

    let entry = store.get(identifier)

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + WINDOW_MS }
      store.set(identifier, entry)
    }

    entry.count++

    const remaining = Math.max(0, AUTH_ENDPOINT_LIMIT - entry.count)
    const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000)

    c.header('X-RateLimit-Limit', String(AUTH_ENDPOINT_LIMIT))
    c.header('X-RateLimit-Remaining', String(remaining))
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

    if (entry.count > AUTH_ENDPOINT_LIMIT) {
      return c.json({
        success: false,
        error: 'Too many authentication attempts',
        retryAfter: resetInSeconds,
      }, 429)
    }

    await next()
  }
}

// Rate-Limiting für authentifizierte Nutzer
export function rateLimitMiddleware() {
  return async (c: Context, next: Next) => {
    const auth = getAuth(c)
    const now = Date.now()

    // Ohne Auth kein Zugriff (wird von requireAuth behandelt)
    if (!auth.isAuthenticated || !auth.user) {
      await next()
      return
    }

    const identifier = `user:${auth.user.username}`
    const limit = auth.user.rateLimit

    let entry = store.get(identifier)

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + WINDOW_MS }
      store.set(identifier, entry)
    }

    entry.count++

    const remaining = Math.max(0, limit - entry.count)
    const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000)

    c.header('X-RateLimit-Limit', String(limit))
    c.header('X-RateLimit-Remaining', String(remaining))
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

    if (entry.count > limit) {
      return c.json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: resetInSeconds,
      }, 429)
    }

    await next()
  }
}
