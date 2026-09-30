import { requirePageAccess } from "@/lib/auth";
import SiteLayoutClient from "@/components/admin/SiteLayoutClient";
import AdminLayout from "@/components/admin/AdminLayout";

export default async function SiteLayoutPage() {
  const session = await requirePageAccess("site-layout");

  return (
    <AdminLayout title="Site Layout" adminName={session.name}>
      <SiteLayoutClient />
    </AdminLayout>
  );
}
