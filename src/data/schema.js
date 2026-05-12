import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('owner'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const menuItems = sqliteTable('menu_items', {
  id: text('id').primaryKey(),

  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  category: text('category').notNull(),
  price: real('price').notNull(),
  available: integer('available', { mode: 'boolean' }).notNull().default(true),
  imageUrl: text('image_url'),

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),

  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  orderType: text('order_type').notNull().default('pickup'),
  status: text('status').notNull().default('pending'),

  //storing cart/order items as JSON text
  itemsJson: text('items_json').notNull(),

  total: real('total').notNull(),

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),

  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  tokenHash: text('token_hash').notNull().unique(),

  expiresAt: text('expires_at').notNull(),

  createdAt: text('created_at').notNull(),
})
