import { notFound } from "next/navigation";
import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await requirePageAccess("products");

  const { id } = await params;

  let product: any = null;
  let categories: any[] = [];
  try {
    [product, categories] = await Promise.all([
      prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
        },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {
    // DB unavailable
  }

  if (!product) notFound();

  return (
    <AdminLayout title="Edit Product" adminName={session.name}>
      <ProductForm categories={categories} product={product} />
    </AdminLayout>
  );
}
