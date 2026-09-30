"use client";

import { useState } from "react";
import {
  Users, Crown, Shield, Plus, Pencil, Trash2, X, Check,
  ChevronRight, Mail, Eye, EyeOff,
} from "lucide-react";
import { ADMIN_PAGES } from "@/lib/admin-pages";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  pageAccess: string[];
}

interface Props {
  initialUsers: AdminUser[];
  currentAdminId: string;
}

type Panel = "edit" | "add" | null;

function RoleBadge({ role }: { role: string }) {
  if (role === "super_admin") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF0F0] text-[#800000] border border-[#f5d0d0]">
        <Crown size={11} />
        Super Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
      <Shield size={11} />
      Admin
    </span>
  );
}

export default function AccessManagementClient({ initialUsers, currentAdminId }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit form state
  const [editRole, setEditRole] = useState<"super_admin" | "admin">("admin");
  const [editPages, setEditPages] = useState<string[]>([]);

  // Add form state
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<"super_admin" | "admin">("admin");
  const [addPages, setAddPages] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const openEdit = (user: AdminUser) => {
    setSelected(user);
    setEditRole(user.role as "super_admin" | "admin");
    setEditPages([...user.pageAccess]);
    setPanel("edit");
    setMsg(null);
  };

  const openAdd = () => {
    setAddName("");
    setAddEmail("");
    setAddPassword("");
    setAddRole("admin");
    setAddPages([]);
    setShowPassword(false);
    setPanel("add");
    setMsg(null);
  };

  const closePanel = () => {
    setPanel(null);
    setSelected(null);
    setMsg(null);
  };

  const togglePage = (key: string, pages: string[], setPages: (p: string[]) => void) => {
    if (pages.includes(key)) {
      setPages(pages.filter((k) => k !== key));
    } else {
      setPages([...pages, key]);
    }
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editRole,
          pageAccess: editRole === "admin" ? editPages : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMsg("error", data.error || "Failed to save changes");
      } else {
        setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
        showMsg("success", "Access updated successfully");
        setTimeout(() => closePanel(), 1500);
      }
    } catch {
      showMsg("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!addName.trim() || !addEmail.trim() || !addPassword.trim()) {
      showMsg("error", "Name, email, and password are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          email: addEmail.trim(),
          password: addPassword,
          role: addRole,
          pageAccess: addRole === "admin" ? addPages : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMsg("error", data.error || "Failed to create admin");
      } else {
        setUsers((prev) => [...prev, data.user]);
        showMsg("success", `Admin "${data.user.name}" created successfully`);
        setTimeout(() => closePanel(), 1500);
      }
    } catch {
      showMsg("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showMsg("error", data.error || "Failed to delete admin");
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showMsg("success", "Admin removed successfully");
      }
    } catch {
      showMsg("error", "Network error. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const superAdmins = users.filter((u) => u.role === "super_admin");
  const regularAdmins = users.filter((u) => u.role === "admin");

  const PageAccessGrid = ({
    pages,
    setPages,
  }: {
    pages: string[];
    setPages: (p: string[]) => void;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-600">Page Access</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPages(ADMIN_PAGES.map((p) => p.key))}
            className="text-xs text-[#800000] hover:underline"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => setPages([])}
            className="text-xs text-gray-500 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ADMIN_PAGES.map((page) => {
          const checked = pages.includes(page.key);
          return (
            <button
              key={page.key}
              type="button"
              onClick={() => togglePage(page.key, pages, setPages)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                checked
                  ? "bg-[#FFF0F0] border-[#800000] text-[#7a4a1a]"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                  checked ? "bg-[#800000] border-[#800000]" : "border-gray-300"
                }`}
              >
                {checked && <Check size={10} className="text-white" />}
              </div>
              <span className="truncate text-xs font-medium">{page.label}</span>
            </button>
          );
        })}
      </div>
      {pages.length === 0 && (
        <p className="text-xs text-[#800000] mt-2 bg-[#FFF0F0] px-3 py-2 rounded-lg border border-[#f5d0d0]">
          No pages selected — this admin will only see the Dashboard.
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Global message */}
      {msg && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl border text-sm font-medium ${
            msg.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Users size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              <p className="text-xs text-gray-500">Total Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] flex items-center justify-center">
              <Crown size={18} className="text-[#800000]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{superAdmins.length}</p>
              <p className="text-xs text-gray-500">Super Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Shield size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{regularAdmins.length}</p>
              <p className="text-xs text-gray-500">Regular Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-700">All Admin Users</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold bg-[#800000] hover:bg-[#5C0000] transition-colors"
        >
          <Plus size={16} />
          Add Admin
        </button>
      </div>

      {/* Admin Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Page Access</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${user.role === "super_admin" ? "bg-[#800000]" : "bg-gray-400"}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        {user.id === currentAdminId && (
                          <span className="text-xs text-gray-400">(you)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Mail size={13} className="text-gray-400" />
                      {user.email}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-5 py-4">
                    {user.role === "super_admin" ? (
                      <span className="text-xs text-gray-400 italic">All pages</span>
                    ) : user.pageAccess.length === 0 ? (
                      <span className="text-xs text-[#800000]">Dashboard only</span>
                    ) : (
                      <span className="text-xs text-gray-600">
                        {user.pageAccess.length} page{user.pageAccess.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:border-[#800000] hover:text-[#800000] hover:bg-[#FFF0F0] transition-colors"
                      >
                        <Pencil size={13} />
                        Edit
                        <ChevronRight size={13} />
                      </button>

                      {user.id !== currentAdminId && (
                        <>
                          {deleteTarget === user.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(user.id)}
                                disabled={deleting}
                                className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                              >
                                {deleting ? "..." : "Delete"}
                              </button>
                              <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteTarget(user.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove admin"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">How access control works</p>
        <ul className="space-y-1 text-blue-600 text-xs list-disc list-inside">
          <li>Super Admins have full access to all pages and can manage other admins.</li>
          <li>Regular Admins can only see pages that have been explicitly granted to them.</li>
          <li>All admins always have access to the Dashboard.</li>
          <li>Access changes take effect the next time the admin logs in.</li>
        </ul>
      </div>

      {/* Edit Panel */}
      {panel === "edit" && selected && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closePanel} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-800">Edit Access</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selected.name} — {selected.email}</p>
              </div>
              <button onClick={closePanel} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {msg && (
                <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {msg.text}
                </div>
              )}

              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["admin", "super_admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditRole(r)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                        editRole === r
                          ? "border-[#800000] bg-[#FFF0F0]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {r === "super_admin" ? (
                        <Crown size={18} className={editRole === r ? "text-[#800000]" : "text-gray-400"} />
                      ) : (
                        <Shield size={18} className={editRole === r ? "text-[#800000]" : "text-gray-400"} />
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${editRole === r ? "text-[#7a4a1a]" : "text-gray-600"}`}>
                          {r === "super_admin" ? "Super Admin" : "Admin"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {r === "super_admin" ? "Full access" : "Restricted"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Page access grid — only for regular admin */}
              {editRole === "admin" && (
                <PageAccessGrid pages={editPages} setPages={setEditPages} />
              )}

              {editRole === "super_admin" && (
                <div className="bg-[#FFF0F0] border border-[#f5d0d0] rounded-xl p-4 text-sm text-[#800000]">
                  <p className="font-semibold">Super Admin privileges</p>
                  <p className="text-xs mt-1">This admin will have full access to all pages and can manage other admins.</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm bg-[#800000] hover:bg-[#5C0000] transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={closePanel} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Admin Panel */}
      {panel === "add" && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closePanel} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-800">Add New Admin</h3>
              <button onClick={closePanel} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {msg && (
                <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {msg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["admin", "super_admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAddRole(r)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                        addRole === r ? "border-[#800000] bg-[#FFF0F0]" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {r === "super_admin" ? (
                        <Crown size={18} className={addRole === r ? "text-[#800000]" : "text-gray-400"} />
                      ) : (
                        <Shield size={18} className={addRole === r ? "text-[#800000]" : "text-gray-400"} />
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${addRole === r ? "text-[#7a4a1a]" : "text-gray-600"}`}>
                          {r === "super_admin" ? "Super Admin" : "Admin"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {r === "super_admin" ? "Full access" : "Restricted"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {addRole === "admin" && (
                <PageAccessGrid pages={addPages} setPages={setAddPages} />
              )}

              {addRole === "super_admin" && (
                <div className="bg-[#FFF0F0] border border-[#f5d0d0] rounded-xl p-4 text-sm text-[#800000]">
                  <p className="font-semibold">Super Admin privileges</p>
                  <p className="text-xs mt-1">This admin will have full access to all pages and can manage other admins.</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm bg-[#800000] hover:bg-[#5C0000] transition-colors disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Admin"}
              </button>
              <button onClick={closePanel} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
