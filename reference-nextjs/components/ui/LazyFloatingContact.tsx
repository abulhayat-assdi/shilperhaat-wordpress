"use client";

import dynamic from "next/dynamic";

const FloatingContact = dynamic(
  () => import("@/components/ui/FloatingContact"),
  { ssr: false }
);

export default function LazyFloatingContact() {
  return <FloatingContact />;
}
