import { requirePageAccess } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import ContactWidgetClient from "@/components/admin/ContactWidgetClient";

export default async function ContactWidgetPage() {
  const session = await requirePageAccess("contact-widget");

  return (
    <AdminLayout title="Contact Widget" adminName={session.name}>
      <ContactWidgetClient />
    </AdminLayout>
  );
}
