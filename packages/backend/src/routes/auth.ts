import { Hono } from 'hono'
import { getAuth } from '../middleware/auth'

const app = new Hono()

// Token validieren - gibt zurück ob Token gültig ist + User-Info
app.get('/validate', (c) => {
  const auth = getAuth(c)

  if (!auth.isAuthenticated || !auth.user) {
    return c.json({
      success: false,
      valid: false,
    })
  }

  return c.json({
    success: true,
    valid: true,
    username: auth.user.username,
    rateLimit: auth.user.rateLimit,
  })
})

export default app
