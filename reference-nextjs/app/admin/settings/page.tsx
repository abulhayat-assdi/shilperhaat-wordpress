import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import SettingsClient from "@/components/admin/SettingsClient";

const defaultSettings = {
  id: "default",
  siteName: "Shilperhaat",
  logoUrl: null,
  faviconUrl: null,
  footerCopyright: null,
  whatsappNumber: null,
  socialLinks: null,
  deliveryCharge: 0,
  freeDeliveryMin: null,
  updatedAt: new Date(),
};

export default async function SettingsPage() {
  const session = await requirePageAccess("settings");

  let settings: any = defaultSettings;
  try {
    const dbSettings = await prisma.siteSetting.findFirst();
    if (dbSettings) settings = dbSettings;
  } catch {
    // DB unavailable
  }

  return (
    <AdminLayout title="Site Settings" adminName={session.name}>
      <SettingsClient settings={settings} />
    </AdminLayout>
  );
}
