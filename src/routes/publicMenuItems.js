import { Hono } from 'hono'
import { getDb } from '../data/db.js'
import { listAvailableMenuItems } from '../data/menuItems.repository.js'
import { sendCollection } from '../utils/response.js'

const app = new Hono()

app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const menuItems = await listAvailableMenuItems(db)

  return sendCollection(c, menuItems)
})

export default app
