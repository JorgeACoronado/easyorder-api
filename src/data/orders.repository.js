import { eq, and, desc } from 'drizzle-orm'
import { orders } from './schema.js'

// Public
export async function createOrder(db, data) {
  const now = new Date().toISOString()

  const order = {
    id: crypto.randomUUID(),
    ownerId: data.ownerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone || null,
    orderType: data.orderType || 'pickup',
    status: data.status || 'pending',
    itemsJson: JSON.stringify(data.items),
    total: Number(data.total),
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(orders).values(order)

  return order
}

export async function getOrderStatusById(db, id) {
  const result = await db
    .select({
      id: orders.id,
      customerName: orders.customerName,
      status: orders.status,
      orderType: orders.orderType,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.id, id))

  return result[0] || null
}

// Business Owner
export async function listOrdersByOwner(db, ownerId) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.ownerId, ownerId))
    .orderBy(desc(orders.createdAt))
}

export async function getOrderById(db, id, ownerId) {
  const result = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.ownerId, ownerId)))

  return result[0] || null
}

export async function updateOrderStatus(db, id, ownerId, status) {
  const now = new Date().toISOString()

  await db
    .update(orders)
    .set({
      status,
      updatedAt: now,
    })
    .where(and(eq(orders.id, id), eq(orders.ownerId, ownerId)))
}

export async function deleteOrder(db, id, ownerId) {
  await db
    .delete(orders)
    .where(and(eq(orders.id, id), eq(orders.ownerId, ownerId)))
}
