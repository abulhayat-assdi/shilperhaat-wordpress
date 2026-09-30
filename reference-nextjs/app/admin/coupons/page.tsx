import { requirePageAccess } from '@/lib/auth'
import CouponsClient from './CouponsClient'

export default async function AdminCouponsPage() {
  await requirePageAccess('coupons')
  return <CouponsClient />
}
