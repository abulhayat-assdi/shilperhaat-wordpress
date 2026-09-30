import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import BannersClient from "@/components/admin/BannersClient";

export default async function BannersPage() {
  const session = await requirePageAccess("banners");

  let banners: any[] = [];
  try {
    banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  } catch {
    // DB unavailable
  }

  return (
    <AdminLayout title="Banners" adminName={session.name}>
      <BannersClient banners={banners} />
    </AdminLayout>
  );
}
