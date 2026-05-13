import { Hono } from 'hono'
import { getDb } from '../data/db.js'
import { createOrder, getOrderStatusById } from '../data/orders.repository.js'
import { findUserByEmail } from '../data/users.repository.js'
import { parseJsonBody } from '../utils/body.js'
import { ApiError } from '../utils/errors.js'
import { sendResource } from '../utils/response.js'
import { parseIdParam, validateOrderCreate } from '../utils/validation.js'

const publicOrders = new Hono()

publicOrders.post('/', async (c) => {
  const payload = await parseJsonBody(c)

  const details = validateOrderCreate(payload)

  if (details.length > 0) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      'Some fields are invalid.',
      details,
    )
  }

  const db = getDb(c.env.DB)

  const owner = await findUserByEmail(db, payload.businessEmail)

  if (!owner) {
    throw new ApiError(404, 'NOT_FOUND', 'Business owner not found.')
  }

  const order = await createOrder(db, {
    ...payload,
    ownerId: owner.id,
    items: JSON.parse(payload.itemsJson),
  })

  c.header('Location', `/api/orders/status/${order.id}`)

  return sendResource(c, order, 201)
})

publicOrders.get('/status/:id', async (c) => {
  const id = parseIdParam(c.req.param('id'))

  const db = getDb(c.env.DB)
  const order = await getOrderStatusById(db, id)

  if (!order) {
    throw new ApiError(404, 'NOT_FOUND', 'Order not found.')
  }

  return sendResource(c, order)
})

export default publicOrders
