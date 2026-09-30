import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import OrdersClient from "@/components/admin/OrdersClient";

// Sample orders for demo
const demoOrders = [
  {
    id: "ord-1",
    orderNumber: "SH240501001",
    customerName: "রাহেলা বেগম",
    phone: "01712345678",
    address: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা",
    notes: null,
    subtotal: 5300,
    deliveryCharge: 80,
    total: 5380,
    paymentMethod: "COD",
    status: "PENDING",
    adminNote: null,
    createdAt: new Date("2024-05-01"),
    updatedAt: new Date("2024-05-01"),
    items: [
      {
        id: "item-1",
        orderId: "ord-1",
        productId: "prod-1",
        productTitle: "হাতে বোনা রাজশাহী সিল্ক কাঁথা",
        productImage: null,
        price: 2500,
        quantity: 1,
        lineTotal: 2500,
      },
      {
        id: "item-2",
        orderId: "ord-1",
        productId: "prod-3",
        productTitle: "সুতি চাদর — ট্র্যাডিশনাল স্ট্রাইপ",
        productImage: null,
        price: 1200,
        quantity: 2,
        lineTotal: 2400,
      },
    ],
  },
];

export default async function OrdersPage() {
  const session = await requirePageAccess("orders");

  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    // DB unavailable
  }

  return (
    <AdminLayout title="Orders" adminName={session.name}>
      <OrdersClient orders={orders} />
    </AdminLayout>
  );
}
