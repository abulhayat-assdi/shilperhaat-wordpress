import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import AccessManagementClient from "@/components/admin/AccessManagementClient";

export default async function AccessManagementPage() {
  const session = await requireSuperAdmin();

  let users: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    pageAccess: string[];
  }[] = [];

  try {
    const raw = await prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        pageAccess: { select: { pageKey: true } },
      },
    });
    users = raw.map((u: typeof raw[number]) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      pageAccess: u.pageAccess.map((p: { pageKey: string }) => p.pageKey),
    }));
  } catch {
    // DB not available — show empty state
  }

  return (
    <AdminLayout title="Access Management" adminName={session.name}>
      <AccessManagementClient initialUsers={users} currentAdminId={session.id} />
    </AdminLayout>
  );
}
