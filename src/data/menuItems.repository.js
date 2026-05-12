import { eq, and } from 'drizzle-orm'
import { menuItems } from './schema.js'

export async function listMenuItemsByOwner(db, ownerId) {
  return db.select().from(menuItems).where(eq(menuItems.ownerId, ownerId))
}

export async function getMenuItemById(db, id, ownerId) {
  const result = await db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.id, id), eq(menuItems.ownerId, ownerId)))

  return result[0] || null
}

export async function createMenuItem(db, data) {
  await db.insert(menuItems).values(data)
}

export async function updateMenuItem(db, id, ownerId, patch) {
  await db
    .update(menuItems)
    .set(patch)
    .where(and(eq(menuItems.id, id), eq(menuItems.ownerId, ownerId)))
}

export async function deleteMenuItem(db, id, ownerId) {
  await db
    .delete(menuItems)
    .where(and(eq(menuItems.id, id), eq(menuItems.ownerId, ownerId)))
}
