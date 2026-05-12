import { z } from 'zod'
import { ApiError } from './errors.js'

const ORDER_TYPES = ['pickup', 'delivery', 'curbside']
const ORDER_STATUSES = [
  'pending',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]

const idParamSchema = z
  .string()
  .regex(/^\d+$/, { error: 'ID must be a positive integer.' })
  .transform((value) => Number(value))
  .refine((value) => Number.isSafeInteger(value) && value > 0, {
    error: 'ID must be a positive integer.',
  })

const menuItemCreateSchema = z.strictObject({
  name: z
    .string({ error: 'Menu item name is required.' })
    .trim()
    .min(1, { error: 'Menu item name is required.' }),

  category: z
    .string({ error: 'Category is required.' })
    .trim()
    .min(1, { error: 'Category is required.' }),

  price: z
    .number({ error: 'Price must be a number.' })
    .positive({ error: 'Price must be greater than 0.' }),

  available: z
    .boolean({ error: 'Available must be true or false.' })
    .optional(),

  image_url: z.string({ error: 'Image URL must be a string.' }).optional(),
})

const menuItemPatchSchema = z
  .strictObject({
    name: z
      .string({ error: 'Menu item name is required.' })
      .trim()
      .min(1, { error: 'Menu item name is required.' })
      .optional(),
    category: z
      .string({ error: 'Category is required.' })
      .trim()
      .min(1, { error: 'Category is required.' })
      .optional(),
    price: z
      .number({ error: 'Price must be a number.' })
      .positive({ error: 'Price must be greater than 0.' })
      .optional(),
    available: z
      .boolean({ error: 'Available must be true or false.' })
      .optional(),
    image_url: z.string({ error: 'Image URL must be a string.' }).optional(),
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'Provide at least one field to update.',
      })
    }
  })

const orderCreateSchema = z.strictObject({
  customerName: z
    .string({ error: 'Customer name is required.' })
    .trim()
    .min(1, { error: 'Customer name is required.' }),

  customerPhone: z
    .string({ error: 'Customer phone must be a string.' })
    .optional(),

  orderType: z
    .string({ error: 'Order type is required.' })
    .refine((value) => ORDER_TYPES.includes(value), {
      error: 'Order type must be pickup, delivery, or curbside.',
    })
    .optional(),

  itemsJson: z
    .string({ error: 'Items JSON is required.' })
    .trim()
    .min(1, { error: 'Items JSON is required.' }),

  total: z
    .number({ error: 'Total must be a number.' })
    .positive({ error: 'Total must be greater than 0.' }),
})

const orderStatusPatchSchema = z.strictObject({
  status: z
    .string({ error: 'Status is required.' })
    .refine((value) => ORDER_STATUSES.includes(value), {
      error:
        'Status must be pending, preparing, ready, completed, or cancelled.',
    }),
})

export function parseIdParam(rawValue, fieldName = 'id') {
  const result = idParamSchema.safeParse(rawValue)

  if (!result.success) {
    throw new ApiError(400, 'BAD_REQUEST', 'Malformed request.', [
      {
        field: fieldName,
        issue:
          result.error.issues[0]?.message || 'ID must be a positive integer.',
      },
    ])
  }

  return result.data
}

function mapZodIssuesToDetails(issues) {
  const details = []

  for (const issue of issues) {
    if (issue.code === 'unrecognized_keys') {
      for (const key of issue.keys) {
        details.push({ field: key, issue: 'Field is not allowed.' })
      }
      continue
    }

    if (issue.code === 'invalid_type' && issue.path.length === 0) {
      details.push({
        field: 'body',
        issue: 'Request body must be a JSON object.',
      })
      continue
    }

    const field = issue.path.length > 0 ? issue.path.join('.') : 'body'
    details.push({ field, issue: issue.message })
  }

  return details
}

const registerSchema = z.strictObject({
  name: z
    .string({ error: 'Name is required.' })
    .trim()
    .min(1, { error: 'Name is required.' }),
  email: z.email({ error: 'Email must be a valid email address.' }),
  password: z
    .string({ error: 'Password is required.' })
    .min(8, { error: 'Password must be at least 8 characters.' }),
})

const loginSchema = z.strictObject({
  email: z.email({ error: 'Email must be a valid email address.' }),
  password: z.string({ error: 'Password is required.' }).min(1, {
    error: 'Password is required.',
  }),
})

const refreshSchema = z.strictObject({
  refresh_token: z
    .string({ error: 'Refresh token is required.' })
    .min(1, { error: 'Refresh token is required.' }),
})

const logoutSchema = z.strictObject({
  refresh_token: z
    .string({ error: 'Refresh token is required.' })
    .min(1, { error: 'Refresh token is required.' }),
})

function validateWithSchema(payload, schema) {
  const result = schema.safeParse(payload)

  if (result.success) {
    return []
  }

  return mapZodIssuesToDetails(result.error.issues)
}

export function validateMenuItemCreate(payload) {
  return validateWithSchema(payload, menuItemCreateSchema)
}

export function validateMenuItemPatch(payload) {
  return validateWithSchema(payload, menuItemPatchSchema)
}

export function validateOrderCreate(payload) {
  return validateWithSchema(payload, orderCreateSchema)
}

export function validateOrderStatusPatch(payload) {
  return validateWithSchema(payload, orderStatusPatchSchema)
}

export function validateRegister(payload) {
  return validateWithSchema(payload, registerSchema)
}

export function validateLogin(payload) {
  return validateWithSchema(payload, loginSchema)
}

export function validateRefresh(payload) {
  return validateWithSchema(payload, refreshSchema)
}

export function validateLogout(payload) {
  return validateWithSchema(payload, logoutSchema)
}
