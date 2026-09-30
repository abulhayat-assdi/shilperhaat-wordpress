import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import ReviewsClient from "@/components/admin/ReviewsClient";

export default async function ReviewsPage() {
  const session = await requirePageAccess("reviews");

  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { product: { select: { title: true, slug: true } } },
    });
  } catch {
    // DB unavailable
  }

  return (
    <AdminLayout title="Reviews" adminName={session.name}>
      <ReviewsClient reviews={reviews} />
    </AdminLayout>
  );
}
