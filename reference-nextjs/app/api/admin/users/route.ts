import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ADMIN_PAGES } from "@/lib/admin-pages";

const VALID_PAGE_KEYS = new Set(ADMIN_PAGES.map((p) => p.key));

// GET /api/admin/users — list all admins with their page access
export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        pageAccess: { select: { pageKey: true } },
      },
    });

    const result = users.map((u: typeof users[number]) => ({
      ...u,
      pageAccess: u.pageAccess.map((p: { pageKey: string }) => p.pageKey),
    }));

    return NextResponse.json({ users: result });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/users — create a new admin
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, email, password, role, pageAccess } = await req.json();

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const adminRole = role === "super_admin" ? "super_admin" : "admin";
    const validatedPages = Array.isArray(pageAccess)
      ? pageAccess.filter((k: unknown) => typeof k === "string" && VALID_PAGE_KEYS.has(k))
      : [];

    const user = await prisma.adminUser.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: adminRole,
        ...(adminRole === "admin" && validatedPages.length > 0
          ? {
              pageAccess: {
                create: validatedPages.map((key: string) => ({ pageKey: key })),
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        pageAccess: { select: { pageKey: true } },
      },
    });

    return NextResponse.json({
      user: { ...user, pageAccess: user.pageAccess.map((p: { pageKey: string }) => p.pageKey) },
    });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
