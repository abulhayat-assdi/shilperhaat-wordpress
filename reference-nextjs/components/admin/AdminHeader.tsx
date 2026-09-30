"use client";

import { useState } from "react";
import { Bell, Menu, User, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";

interface AdminHeaderProps {
  title: string;
  adminName?: string;
}

export default function AdminHeader({ title, adminName = "Admin" }: AdminHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-3">
        <h1 className="font-bold text-gray-800 text-base md:text-lg">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Notifications">
          <Bell size={18} className="text-gray-600" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-[#800000] flex items-center justify-center text-white text-xs font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">{adminName}</span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{adminName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <form action="/api/admin/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
