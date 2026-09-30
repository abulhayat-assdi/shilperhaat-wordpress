import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Cart — Shilperhaat",
  description: "Your shopping cart at Shilperhaat",
};

export default function CartPage() {
  return <CartPageClient />;
}
