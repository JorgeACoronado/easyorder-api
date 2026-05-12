import { eq } from 'drizzle-orm'
import { nowIso } from './db.js'
import { users } from './schema.js'

export async function findUserByEmail(db, email) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))

  return user || null
}

export async function createUser(db, { name, email, passwordHash }) {
  const timestamp = nowIso()

  const [created] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'owner',
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()

  return created
}
