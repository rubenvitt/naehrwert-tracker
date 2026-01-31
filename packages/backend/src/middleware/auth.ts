import type { Context, Next } from 'hono'

export interface AuthUser {
  username: string
  rateLimit: number
}

export interface AuthContext {
  isAuthenticated: boolean
  user?: AuthUser
}

// Parse API_TOKENS environment variable
// Format: token:username:rateLimit,token2:username2:rateLimit2
function parseTokens(): Map<string, AuthUser> {
  const tokens = new Map<string, AuthUser>()
  const raw = process.env.API_TOKENS || ''

  if (!raw) return tokens

  for (const entry of raw.split(',')) {
    const parts = entry.trim().split(':')
    if (parts.length >= 3) {
      const [token, username, rateLimitStr] = parts
      const rateLimit = parseInt(rateLimitStr, 10)
      if (token && username && !isNaN(rateLimit)) {
        tokens.set(token, { username, rateLimit })
      }
    }
  }

  return tokens
}

const tokenStore = parseTokens()

export function authMiddleware() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization')
    let auth: AuthContext = { isAuthenticated: false }

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const user = tokenStore.get(token)

      if (user) {
        auth = { isAuthenticated: true, user }
      }
    }

    c.set('auth', auth)
    await next()
  }
}

export function getAuth(c: Context): AuthContext {
  return c.get('auth') || { isAuthenticated: false }
}

// Middleware die Auth erzwingt (401 ohne Token)
export function requireAuth() {
  return async (c: Context, next: Next) => {
    const auth = getAuth(c)

    if (!auth.isAuthenticated) {
      return c.json({
        success: false,
        error: 'Authentication required',
      }, 401)
    }

    await next()
  }
}
