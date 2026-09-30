import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns";
import https from "node:https";

// Force the Node.js runtime — the Edge runtime has no raw TCP/DNS, which would
// itself cause "fetch failed" against a 3rd-party API.
export const runtime = "nodejs";

// Steadfast's API is served from portal.packzy.com (per their official docs).
// portal.steadfast.com.bd no longer exists in DNS (NXDOMAIN globally), which
// surfaced as getaddrinfo ENOTFOUND.
const STEADFAST_HOST = "portal.packzy.com";
const STEADFAST_BASE = `https://${STEADFAST_HOST}/api/v1`;
const REQUEST_TIMEOUT_MS = 20_000;

// --- Resilient DNS ----------------------------------------------------------
// Some VPS hosts have a broken local resolver (systemd-resolved returning
// NXDOMAIN for valid domains). We bypass it by resolving Steadfast's host with
// public DNS servers (Google / Cloudflare) via c-ares, falling back to the
// system resolver if that fails. This keeps SNI/Host intact for TLS.
const publicResolver = new dns.promises.Resolver();
publicResolver.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

const resilientLookup: typeof dns.lookup = ((
  hostname: string,
  options: any,
  callback: any
) => {
  const cb = typeof options === "function" ? options : callback;
  const opts = typeof options === "function" ? {} : options || {};

  publicResolver
    .resolve4(hostname)
    .then((addresses) => {
      if (!addresses.length) throw new Error("no A records");
      if (opts.all) {
        cb(null, addresses.map((address) => ({ address, family: 4 })));
      } else {
        cb(null, addresses[0], 4);
      }
    })
    .catch(() => {
      // Last resort: the OS resolver (may still work for other reasons).
      dns.lookup(hostname, opts, cb);
    });
}) as unknown as typeof dns.lookup;

// --- HTTPS request helper ---------------------------------------------------
interface SteadfastResponse {
  status: number;
  ok: boolean;
  json: any;
  text: string;
}

function steadfastRequest(
  path: string,
  init: { method: string; headers: Record<string, string>; body?: string }
): Promise<SteadfastResponse> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      `${STEADFAST_BASE}${path}`,
      {
        method: init.method,
        headers: init.headers,
        lookup: resilientLookup,
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          let json: any = null;
          try {
            json = JSON.parse(data);
          } catch {
            /* non-JSON body (HTML error page, empty, etc.) */
          }
          resolve({ status, ok: status >= 200 && status < 300, json, text: data });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(
        new Error(`request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`)
      );
    });
    req.on("error", reject);

    if (init.body) req.write(init.body);
    req.end();
  });
}

// Steadfast wants a clean 11-digit local mobile number (e.g. 01XXXXXXXXX).
function normalizePhone(raw: string): string {
  let phone = String(raw || "").replace(/[^\d]/g, "");
  if (phone.startsWith("88") && phone.length === 13) phone = phone.slice(2);
  return phone;
}

function describeError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code;
    return `${err.message}${code ? ` [${code}]` : ""}`;
  }
  return String(err);
}

export async function POST(req: NextRequest) {
  let orderData: any;
  try {
    orderData = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const apiKey = (process.env.STEADFAST_API_KEY || orderData.apiKey || "").trim();
  const secretKey = (
    process.env.STEADFAST_SECRET_KEY ||
    orderData.secretKey ||
    ""
  ).trim();

  if (!apiKey || !secretKey) {
    return NextResponse.json(
      {
        error:
          "Steadfast API credentials not configured. Set STEADFAST_API_KEY and STEADFAST_SECRET_KEY in the server environment (or add them in Settings).",
      },
      { status: 400 }
    );
  }

  try {
    const res = await steadfastRequest("/create_order", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        invoice: orderData.orderId,
        recipient_name: orderData.customerName,
        recipient_phone: normalizePhone(orderData.customerPhone),
        recipient_address: orderData.address,
        cod_amount: orderData.total,
        note: orderData.specialNotes || "",
      }),
    });

    if (!res.ok) {
      let message = res.json?.message || res.json?.error;
      if (!message && res.json?.errors) {
        message = Object.values(res.json.errors).flat().join(" ");
      }
      if (!message) {
        message = res.text?.slice(0, 200) || `Steadfast returned HTTP ${res.status}`;
      }
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const result = res.json;
    if (!result) {
      return NextResponse.json(
        { error: "Steadfast returned an unexpected response. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      consignmentId: result.consignment?.id || result.consignment_id,
      trackingCode: result.consignment?.tracking_code || result.tracking_code,
      status: result.status,
    });
  } catch (err) {
    const detail = describeError(err);
    console.error("Steadfast create_order failed:", detail);
    return NextResponse.json(
      { error: `Could not reach Steadfast API: ${detail}` },
      { status: 502 }
    );
  }
}

// Test connectivity with provided credentials
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = (
    process.env.STEADFAST_API_KEY ||
    searchParams.get("apiKey") ||
    ""
  ).trim();
  const secretKey = (
    process.env.STEADFAST_SECRET_KEY ||
    searchParams.get("secretKey") ||
    ""
  ).trim();

  if (!apiKey || !secretKey) {
    return NextResponse.json(
      { error: "API credentials not provided" },
      { status: 400 }
    );
  }

  try {
    const res = await steadfastRequest("/get_balance", {
      method: "GET",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!res.ok || !res.json) {
      const message =
        res.json?.message || res.text?.slice(0, 200) || "Invalid credentials";
      return NextResponse.json({ error: message }, { status: res.status || 401 });
    }

    return NextResponse.json({ success: true, balance: res.json.current_balance });
  } catch (err) {
    const detail = describeError(err);
    console.error("Steadfast get_balance failed:", detail);
    return NextResponse.json(
      { error: `Could not reach Steadfast API: ${detail}` },
      { status: 502 }
    );
  }
}
