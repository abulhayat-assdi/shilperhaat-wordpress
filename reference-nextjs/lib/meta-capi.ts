import crypto from "crypto";
import type { NextRequest } from "next/server";

/**
 * Server-side Meta Conversions API (CAPI).
 *
 * SECRET: reads `META_CAPI_ACCESS_TOKEN` — this must only ever run on the server.
 * Never import this from a "use client" file or expose the token to the browser.
 *
 * If the token (or pixel id) is missing, every call is a silent no-op so the app
 * keeps working without CAPI configured.
 */

const GRAPH_VERSION = "v21.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Normalise a Bangladeshi phone number to digits with country code (e.g. 8801712345678). */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return "880" + digits.slice(1);
  if (digits.startsWith("1") && digits.length === 10) return "880" + digits;
  return digits;
}

export interface MetaUserData {
  phone?: string | null;
  firstName?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  content_type?: string;
  content_ids?: string[];
  contents?: { id: string; quantity: number; item_price: number }[];
  content_name?: string;
  num_items?: number;
  order_id?: string;
}

export interface SendMetaEventOptions {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string | null;
  actionSource?: "website" | "server";
  userData?: MetaUserData;
  customData?: MetaCustomData;
}

export async function sendMetaEvent(opts: SendMetaEventOptions): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return; // CAPI not configured — skip silently.

  const u = opts.userData ?? {};
  const user_data: Record<string, unknown> = {};
  if (u.phone) user_data.ph = sha256(normalizePhone(u.phone));
  if (u.firstName) user_data.fn = sha256(u.firstName.trim().toLowerCase());
  if (u.fbp) user_data.fbp = u.fbp;
  if (u.fbc) user_data.fbc = u.fbc;
  if (u.clientIp) user_data.client_ip_address = u.clientIp;
  if (u.userAgent) user_data.client_user_agent = u.userAgent;

  const body = {
    data: [
      {
        event_name: opts.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: opts.eventId,
        action_source: opts.actionSource ?? "website",
        ...(opts.eventSourceUrl ? { event_source_url: opts.eventSourceUrl } : {}),
        user_data,
        ...(opts.customData ? { custom_data: opts.customData } : {}),
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_TEST_EVENT_CODE }
      : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error(`[meta-capi] ${opts.eventName} failed:`, res.status, text);
    }
  } catch (err) {
    console.error(`[meta-capi] ${opts.eventName} request error:`, err);
  }
}

/** Pull fbp/fbc cookies and IP/user-agent off an incoming request for better match quality. */
export function userDataFromRequest(req: NextRequest, extra?: MetaUserData): MetaUserData {
  const fbp = req.cookies.get("_fbp")?.value ?? null;
  const fbc = req.cookies.get("_fbc")?.value ?? null;
  const xff = req.headers.get("x-forwarded-for");
  const clientIp = xff ? xff.split(",")[0].trim() : req.headers.get("x-real-ip");
  const userAgent = req.headers.get("user-agent");
  return { fbp, fbc, clientIp, userAgent, ...extra };
}
