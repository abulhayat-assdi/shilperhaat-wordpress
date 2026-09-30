"use client";

import { createContext, useContext } from "react";
import type { AdminSession } from "./auth";

interface AdminSessionContextValue {
  session: AdminSession | null;
  allowedPages: string[];
  isSuperAdmin: boolean;
}

const AdminSessionContext = createContext<AdminSessionContextValue>({
  session: null,
  allowedPages: [],
  isSuperAdmin: false,
});

export function AdminSessionProvider({
  children,
  session,
  allowedPages,
}: {
  children: React.ReactNode;
  session: AdminSession | null;
  allowedPages: string[];
}) {
  return (
    <AdminSessionContext.Provider
      value={{
        session,
        allowedPages,
        isSuperAdmin: session?.role === "super_admin",
      }}
    >
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}
