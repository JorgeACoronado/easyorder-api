import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { menuItems } from '../schema'

export async function listMenuItemsByOwner(ownerId) {
  return db.select().from(menuItems).where(eq(menuItems.ownerId, ownerId))
}

export async function getMenuItemById(id, ownerId) {
  const result = await db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.id, id), eq(menuItems.ownerId, ownerId)))

  return result[0] || null
}

export async function createMenuItem(data) {
  await db.insert(menuItems).values(data)
}

export async function updateMenuItem(id, ownerId, patch) {
  await db
    .update(menuItems)
    .set(patch)
    .where(and(eq(menuItems.id, id), eq(menuItems.ownerId, ownerId)))
}

export async function deleteMenuItem(id, ownerId) {
  await db
    .delete(menuItems)
    .where(and(eq(menuItems.id, id), eq(menuItems.ownerId, ownerId)))
}
