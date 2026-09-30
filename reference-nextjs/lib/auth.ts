import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { cache } from "react";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwt = require("jsonwebtoken");
import { prisma } from "./prisma";

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("NEXTAUTH_SECRET environment variable must be set in production");
}
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-only-secret-not-for-production";
const COOKIE_NAME = "sh_admin_token";

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession;
  } catch {
    return null;
  }
}

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
});

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireSuperAdmin(): Promise<AdminSession> {
  const session = await requireAdminSession();
  if (session.role !== "super_admin") {
    redirect("/admin/dashboard");
  }
  return session;
}

export async function getAdminPageAccess(adminId: string): Promise<string[]> {
  try {
    const access = await prisma.adminPageAccess.findMany({
      where: { adminId },
      select: { pageKey: true },
    });
    return access.map((a: { pageKey: string }) => a.pageKey);
  } catch {
    return [];
  }
}

export async function requirePageAccess(pageKey: string): Promise<AdminSession> {
  const session = await requireAdminSession();
  if (session.role === "super_admin") return session;

  let hasAccess = false;
  try {
    const access = await prisma.adminPageAccess.findUnique({
      where: { adminId_pageKey: { adminId: session.id, pageKey } },
    });
    hasAccess = !!access;
  } catch {
    hasAccess = false;
  }

  if (!hasAccess) {
    redirect("/admin/dashboard");
  }
  return session;
}

export async function adminLogin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const superAdminEmail    = process.env.ADMIN_EMAIL;
  const superAdminPassword = process.env.ADMIN_PASSWORD;

  let session: AdminSession | null = null;

  if (
    superAdminEmail &&
    superAdminPassword &&
    email === superAdminEmail &&
    password === superAdminPassword
  ) {
    session = { id: "super-admin", name: "Super Admin", email: superAdminEmail, role: "super_admin" };
  } else {
    try {
      const admin = await prisma.adminUser.findUnique({ where: { email } });
      if (admin && (await verifyPassword(password, admin.passwordHash))) {
        session = {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: (admin.role as "super_admin" | "admin") || "admin",
        };
      }
    } catch (dbError) {
      console.error("DB login error (falling back to env credentials):", dbError);
    }
  }

  if (!session) {
    return { success: false, error: "Invalid credentials" };
  }

  const token = createToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return { success: true };
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function seedAdminUser(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await hashPassword(password);
    await prisma.adminUser.create({
      data: {
        name: "Super Admin",
        email,
        passwordHash,
        role: "super_admin",
      },
    });
    console.log("Super admin user seeded successfully");
  }
}
