import { NextRequest, NextResponse } from "next/server";
import { adminLogin } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const result = await adminLogin(parsed.data.email, parsed.data.password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
