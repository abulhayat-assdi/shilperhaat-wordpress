import { NextRequest, NextResponse } from "next/server";
import { adminLogout } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await adminLogout();
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export async function GET(req: NextRequest) {
  await adminLogout();
  return NextResponse.redirect(new URL("/admin/login", req.url));
}
