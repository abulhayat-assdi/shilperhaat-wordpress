"use client";

/**
 * Client-side Meta Pixel helpers.
 *
 * Every tracked event is sent twice with a shared `event_id`:
 *   1. directly to the browser Pixel via `window.fbq`
 *   2. to our server (`/api/meta/track`) which forwards it to the Conversions API
 * Meta deduplicates the two using the matching `event_id`, so the event is
 * counted once but still arrives even if the browser Pixel is blocked.
 */

export const FB_CURRENCY = "BDT";

export interface FbContent {
  id: string;
  quantity: number;
  item_price: number;
}

/** Custom data shared by the Pixel and the Conversions API (same field names). */
export interface FbEventData {
  value?: number;
  currency?: string;
  content_type?: string;
  content_ids?: string[];
  contents?: FbContent[];
  content_name?: string;
  num_items?: number;
  order_id?: string;
}

export function newEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Fire a Pixel event directly in the browser. */
export function fbqTrack(eventName: string, data?: FbEventData, eventId?: string): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (eventId) {
    window.fbq("track", eventName, data ?? {}, { eventID: eventId });
  } else {
    window.fbq("track", eventName, data ?? {});
  }
}

/**
 * Track a standard event through BOTH the Pixel and the Conversions API,
 * deduplicated by a freshly generated `event_id`.
 */
export function trackEvent(eventName: string, data: FbEventData): void {
  const eventId = newEventId(eventName.toLowerCase());
  fbqTrack(eventName, data, eventId);
  void sendToCapi(eventName, eventId, data);
}

/**
 * Purchase is special: the authoritative Conversions API call is made
 * server-side from the order API (with real DB totals + hashed contact info).
 * Here we only fire the browser Pixel, using a deterministic `event_id` derived
 * from the order number so it deduplicates against the server event — and against
 * a page refresh on the thank-you page.
 */
export function trackPurchasePixel(orderNumber: string, data: FbEventData): void {
  fbqTrack("Purchase", data, `purchase_${orderNumber}`);
}

function sendToCapi(eventName: string, eventId: string, customData: FbEventData): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  return fetch("/api/meta/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      customData,
    }),
    keepalive: true,
  })
    .then(() => undefined)
    .catch(() => undefined);
}
