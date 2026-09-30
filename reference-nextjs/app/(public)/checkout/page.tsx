import type { Metadata } from "next";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout — Shilperhaat",
  description: "Complete your order at Shilperhaat",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
