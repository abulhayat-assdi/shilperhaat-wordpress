import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await requirePageAccess("products");

  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    // DB unavailable
  }

  return (
    <AdminLayout title="Add New Product" adminName={session.name}>
      <ProductForm categories={categories} />
    </AdminLayout>
  );
}
