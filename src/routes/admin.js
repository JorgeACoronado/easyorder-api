import { Hono } from 'hono'
import { authenticate } from '../middleware/authenticate.js'

const admin = new Hono()

admin.use('*', authenticate)

function nowIso() {
  return new Date().toISOString()
}

function makeId() {
  return crypto.randomUUID()
}

function requireOwner(c) {
  const payload = c.get('user')

  if (payload?.role !== 'owner') {
    return c.json(
      {
        success: false,
        error: 'FORBIDDEN',
        message: 'Owner access required.',
      },
      403,
    )
  }

  return null
}

function insertMenuItem(db, item) {
  return db
    .prepare(
      `
      INSERT INTO menu_items
      (id, owner_id, name, category, price, available, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .bind(
      item.id,
      item.ownerId,
      item.name,
      item.category,
      item.price,
      item.available,
      item.imageUrl,
      item.createdAt,
      item.updatedAt,
    )
}

admin.post('/reset-orders', async (c) => {
  const forbidden = requireOwner(c)
  if (forbidden) return forbidden

  const db = c.env.DB

  try {
    await db.prepare('DELETE FROM orders').run()

    return c.json({
      success: true,
      message: 'Orders have been reset.',
    })
  } catch (error) {
    console.error(error)

    return c.json(
      {
        success: false,
        message: 'Failed to reset orders.',
      },
      500,
    )
  }
})

admin.post('/reset-demo', async (c) => {
  const forbidden = requireOwner(c)
  if (forbidden) return forbidden

  const db = c.env.DB
  const user = c.get('user')
  const timestamp = nowIso()

  try {
    await db.prepare('DELETE FROM orders').run()
    await db.prepare('DELETE FROM menu_items').run()

    const demoItems = [
      {
        id: makeId(),
        ownerId: user.sub,
        name: 'Concha',
        category: 'Pastries',
        price: 1.5,
        available: 1,
        imageUrl: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: makeId(),
        ownerId: user.sub,
        name: 'Chocolate Cake Slice',
        category: 'Cakes',
        price: 4.25,
        available: 1,
        imageUrl: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: makeId(),
        ownerId: user.sub,
        name: 'Iced Coffee',
        category: 'Coffee',
        price: 3.5,
        available: 1,
        imageUrl: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: makeId(),
        ownerId: user.sub,
        name: 'Banana Bread',
        category: 'Breads',
        price: 2.75,
        available: 1,
        imageUrl: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]

    await db.batch(demoItems.map((item) => insertMenuItem(db, item)))

    return c.json({
      success: true,
      message: 'Demo data has been reset.',
    })
  } catch (error) {
    console.error(error)

    return c.json(
      {
        success: false,
        message: 'Failed to reset demo data.',
      },
      500,
    )
  }
})

export default admin
