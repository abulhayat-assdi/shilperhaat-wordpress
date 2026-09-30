import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductsClient from "@/components/admin/ProductsClient";

export default async function ProductsPage() {
  const session = await requirePageAccess("products");

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // DB unavailable
  }

  return (
    <AdminLayout title="Products" adminName={session.name}>
      <ProductsClient products={products} />
    </AdminLayout>
  );
}
