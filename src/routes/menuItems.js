import { Hono } from 'hono'
import { getDb } from '../data/db.js'
import {
  listMenuItemsByOwner,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../data/menuItems.repository.js'

import { parseJsonBody } from '../utils/body.js'
import { ApiError } from '../utils/errors.js'
import { sendCollection, sendResource } from '../utils/response.js'
import {
  parseIdParam,
  validateMenuItemCreate,
  validateMenuItemPatch,
} from '../utils/validation.js'

const menuItemsRoute = new Hono()

menuItemsRoute.get('/', async (c) => {
  const userId = c.get('user').sub
  const db = getDb(c.env.DB)

  const data = await listMenuItemsByOwner(db, userId)

  return sendCollection(c, data)
})

menuItemsRoute.post('/', async (c) => {
  const userId = c.get('user').sub
  const payload = await parseJsonBody(c)

  const details = validateMenuItemCreate(payload)

  if (details.length > 0) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      'Some fields are invalid.',
      details,
    )
  }

  const db = getDb(c.env.DB)
  const menuItem = await createMenuItem(db, userId, payload)

  c.header('Location', `/api/menu-items/${menuItem.id}`)

  return sendResource(c, menuItem, 201)
})

menuItemsRoute.get('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))

  const db = getDb(c.env.DB)
  const menuItem = await getMenuItemById(db, id, userId)

  if (!menuItem) {
    throw new ApiError(404, 'NOT_FOUND', 'Menu item not found.')
  }

  return sendResource(c, menuItem)
})

menuItemsRoute.patch('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const payload = await parseJsonBody(c)

  const details = validateMenuItemPatch(payload)

  if (details.length > 0) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      'Some fields are invalid.',
      details,
    )
  }

  const db = getDb(c.env.DB)
  const updatedMenuItem = await updateMenuItem(db, id, userId, payload)

  if (!updatedMenuItem) {
    throw new ApiError(404, 'NOT_FOUND', 'Menu item not found.')
  }

  return sendResource(c, updatedMenuItem)
})

menuItemsRoute.delete('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))

  const db = getDb(c.env.DB)
  const deleted = await deleteMenuItem(db, id, userId)

  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Menu item not found.')
  }

  return c.body(null, 204)
})

export default menuItemsRoute
