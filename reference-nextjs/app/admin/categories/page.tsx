import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import CategoriesClient from "@/components/admin/CategoriesClient";

export default async function CategoriesPage() {
  const session = await requirePageAccess("categories");

  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
  } catch {
    // DB unavailable
  }

  return (
    <AdminLayout title="Categories" adminName={session.name}>
      <CategoriesClient categories={categories} />
    </AdminLayout>
  );
}
