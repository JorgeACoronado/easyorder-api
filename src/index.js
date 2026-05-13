import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { rateLimiter } from 'hono-rate-limiter'
import auth from './routes/auth.js'
import menuItems from './routes/menuItems.js'
import orders from './routes/orders.js'
import { authenticate } from './middleware/authenticate.js'
import { isApiError } from './utils/errors.js'
import { sendError } from './utils/response.js'

const app = new Hono()
const api = new Hono()

app.use('*', async (c, next) => {
  c.set('traceId', crypto.randomUUID())
  await next()
})

app.use(
  rateLimiter({
    binding: (c) => c.env.AUTH_LIMITER,
    keyGenerator: (c) => c.req.header('cf-connecting-ip') ?? '',
    message: (c) => {
      return {
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests, please try again later.',
          details: [],
          trace_id: c.get('traceId'),
        },
      }
    },
  }),
)

app.use(
  '/api/*',
  cors({
    origin: (origin, c) => {
      const allowed =
        c.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? []
      return allowed.includes(origin) ? origin : null
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

api.route('/auth', auth)

// Public customer routes
api.route('/orders', orders)

// Protected business/admin routes
api.use('/menu-items/*', authenticate)
api.route('/menu-items', menuItems)

app.route('/api', api)

app.notFound((c) => {
  return sendError(c, 404, 'NOT_FOUND', 'Route not found')
})

app.onError((error, c) => {
  if (isApiError(error)) {
    return sendError(c, error.status, error.code, error.message, error.details)
  }

  console.error('Unhandled error:', error)
  return sendError(
    c,
    500,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred',
  )
})

export default app
