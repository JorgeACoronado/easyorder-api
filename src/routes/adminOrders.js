import { Hono } from 'hono'
import { getDb } from '../data/db.js'
import {
  listOrdersByOwner,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../data/orders.repository.js'

import { parseJsonBody } from '../utils/body.js'
import { ApiError } from '../utils/errors.js'
import { sendCollection, sendResource } from '../utils/response.js'
import { parseIdParam, validateOrderStatusPatch } from '../utils/validation.js'

const adminOrders = new Hono()

adminOrders.get('/', async (c) => {
  const userId = c.get('user').sub
  const db = getDb(c.env.DB)

  const data = await listOrdersByOwner(db, userId)

  return sendCollection(c, data)
})

adminOrders.get('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))

  const db = getDb(c.env.DB)
  const order = await getOrderById(db, id, userId)

  if (!order) {
    throw new ApiError(404, 'NOT_FOUND', 'Order not found.')
  }

  return sendResource(c, order)
})

adminOrders.patch('/:id/status', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const payload = await parseJsonBody(c)

  const details = validateOrderStatusPatch(payload)

  if (details.length > 0) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      'Some fields are invalid.',
      details,
    )
  }

  const db = getDb(c.env.DB)
  const updatedOrder = await updateOrderStatus(db, id, userId, payload.status)

  if (!updatedOrder) {
    throw new ApiError(404, 'NOT_FOUND', 'Order not found.')
  }

  return sendResource(c, updatedOrder)
})

adminOrders.delete('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))

  const db = getDb(c.env.DB)
  const deleted = await deleteOrder(db, id, userId)

  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Order not found.')
  }

  return c.body(null, 204)
})

export default adminOrders
