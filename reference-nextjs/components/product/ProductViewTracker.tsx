"use client";

import { useEffect, useRef } from "react";
import { trackEvent, FB_CURRENCY } from "@/lib/fbpixel";

interface ProductViewTrackerProps {
  productId: string;
  title: string;
  price: number;
}

/** Fires a Meta `ViewContent` event once when a product page is opened. */
export default function ProductViewTracker({ productId, title, price }: ProductViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("ViewContent", {
      content_type: "product",
      content_ids: [productId],
      content_name: title,
      value: price,
      currency: FB_CURRENCY,
    });
  }, [productId, title, price]);

  return null;
}
