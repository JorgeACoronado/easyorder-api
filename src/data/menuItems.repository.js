import { eq, and } from 'drizzle-orm'
import { menuItems } from './schema.js'
import { nowIso } from './db.js'

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

export async function createMenuItem(db, ownerId, payload) {
  const now = nowIso()

  const [menuItem] = await db
    .insert(menuItems)
    .values({
      id: crypto.randomUUID(),
      ownerId,
      name: payload.name,
      category: payload.category,
      price: payload.price,
      available: payload.available ?? true,
      imageUrl: payload.image_url ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return menuItem
}

export async function updateMenuItem(db, id, ownerId, patch) {
  const now = nowIso()

  const [menuItem] = await db
    .update(menuItems)
    .set({
      ...patch,
      imageUrl: patch.image_url,
      updatedAt: now,
    })
    .where(and(eq(menuItems.id, id), eq(menuItems.ownerId, ownerId)))
    .returning()

  return menuItem || null
}

export async function deleteMenuItem(db, id, ownerId) {
  const result = await db
    .delete(menuItems)
    .where(and(eq(menuItems.id, id), eq(menuItems.ownerId, ownerId)))
    .returning()

  return result.length > 0
}
