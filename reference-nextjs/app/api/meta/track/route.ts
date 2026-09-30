import { NextRequest, NextResponse } from "next/server";
import { sendMetaEvent, userDataFromRequest, type MetaCustomData } from "@/lib/meta-capi";

/**
 * Receives browser-originated standard events (ViewContent, AddToCart,
 * InitiateCheckout, ...) and forwards them to the Meta Conversions API,
 * enriched with fbp/fbc cookies + IP/user-agent from the request.
 *
 * The browser already fired the same event to the Pixel using the same
 * `eventId`, so Meta deduplicates the pair.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventName = typeof body?.eventName === "string" ? body.eventName : null;
    const eventId = typeof body?.eventId === "string" ? body.eventId : null;
    if (!eventName || !eventId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await sendMetaEvent({
      eventName,
      eventId,
      eventSourceUrl: typeof body?.eventSourceUrl === "string" ? body.eventSourceUrl : null,
      userData: userDataFromRequest(req),
      customData: (body?.customData ?? undefined) as MetaCustomData | undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Analytics must never break the page — swallow and report soft failure.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
