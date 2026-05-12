import { eq, and, desc } from 'drizzle-orm'
import { orders } from './schema.js'

export async function listOrdersByOwner(ownerId) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.ownerId, ownerId))
    .orderBy(desc(orders.createdAt))
}

export async function getOrderById(id, ownerId) {
  const result = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.ownerId, ownerId)))

  return result[0] || null
}

export async function createOrder(data) {
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

export async function updateOrderStatus(id, ownerId, status) {
  const now = new Date().toISOString()

  await db
    .update(orders)
    .set({
      status,
      updatedAt: now,
    })
    .where(and(eq(orders.id, id), eq(orders.ownerId, ownerId)))
}

export async function deleteOrder(id, ownerId) {
  await db
    .delete(orders)
    .where(and(eq(orders.id, id), eq(orders.ownerId, ownerId)))
}
