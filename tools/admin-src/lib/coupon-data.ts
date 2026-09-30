export type DiscountType = 'PERCENTAGE' | 'FIXED'

// Plain-JSON shape used by the admin UI and API responses
// (Prisma Decimal fields are serialized to numbers, dates to ISO strings)
export interface Coupon {
  id: string
  code: string
  type: DiscountType
  value: number
  minOrderAmount: number
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  description: string
  createdAt: string
  updatedAt: string
}

// Serialize a Prisma Coupon row (Decimal/Date fields) to the plain-JSON shape
export function serializeCoupon(c: {
  id: string
  code: string
  type: DiscountType
  value: unknown
  minOrderAmount: unknown
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: Date | null
  description: string
  createdAt: Date
  updatedAt: Date
}): Coupon {
  return {
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    minOrderAmount: Number(c.minOrderAmount),
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    isActive: c.isActive,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    description: c.description,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }
}

export function validateCoupon(
  coupon: {
    isActive: boolean
    expiresAt: Date | string | null
    maxUses: number | null
    usedCount: number
    minOrderAmount: number
    type: DiscountType
    value: number
  },
  orderTotal: number
): { valid: boolean; discount: number; message: string } {
  if (!coupon.isActive) return { valid: false, discount: 0, message: 'This coupon is not active.' }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, discount: 0, message: 'This coupon has expired.' }
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discount: 0, message: 'This coupon has reached its usage limit.' }
  }

  if (orderTotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order of ৳${coupon.minOrderAmount} required.`,
    }
  }

  const discount =
    coupon.type === 'PERCENTAGE'
      ? Math.round((orderTotal * coupon.value) / 100)
      : coupon.value

  return { valid: true, discount: Math.min(discount, orderTotal), message: '' }
}
