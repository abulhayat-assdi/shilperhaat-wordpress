"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "@/types";
import { getImageUrl, generateSlug } from "@/lib/utils";

interface CategoriesClientProps {
  categories: Category[];
}

interface CategoryFormData {
  name: string;
  slug: string;
  isFeatured: boolean;
  sortOrder: number;
  imageUrl?: string;
}

export default function CategoriesClient({ categories: initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    isFeatured: false,
    sortOrder: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", isFeatured: false, sortOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      isFeatured: cat.isFeatured,
      sortOrder: cat.sortOrder,
      imageUrl: cat.imageUrl || undefined,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "categories");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setFormData((f) => ({ ...f, imageUrl: data.url }));
      } else {
        alert(data.error || "ছবি আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch {
      alert("ছবি আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsUploading(false);
    }
  };


  const handleSave = async () => {
    if (!formData.name || !formData.slug) return;
    setIsSaving(true);
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const res = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category. Please try again.");
      if (editingCategory) {
        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? data.category : c)));
      } else {
        setCategories((prev) => [...prev, data.category]);
      }
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save category. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
      else alert("Failed to delete category.");
    } catch {
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Categories</h2>
          <p className="text-gray-500 text-sm">{categories.length} categories</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#5C0000] transition-colors"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            layout
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-square bg-[#f0e8d8] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(cat.imageUrl)}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.endsWith("/placeholder-product.svg")) {
                    img.src = "/placeholder-product.svg";
                  }
                }}
              />
              {cat.isFeatured && (
                <div className="absolute top-2 right-2 bg-[#800000] text-white rounded-full p-1 z-10">
                  <Star size={10} fill="currentColor" />
                </div>
              )}
            </div>

            <div className="p-3">
              <p className="font-semibold text-gray-800 text-sm truncate">{cat.name}</p>
              <p className="text-xs text-gray-400 truncate">{cat.slug}</p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex-1 flex items-center justify-center py-1.5 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="flex-1 flex items-center justify-center py-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-800">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Image</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#f0e8d8]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(formData.imageUrl)}
                        alt="Category"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.src.endsWith("/placeholder-product.svg")) {
                            img.src = "/placeholder-product.svg";
                          }
                        }}
                      />
                    </div>
                    <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
                      {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Upload
                      <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((f) => ({
                        ...f,
                        name,
                        // Auto-fill slug from name if slug is still empty/unchanged
                        slug: f.slug && f.slug !== generateSlug(f.name) ? f.slug : generateSlug(name),
                      }));
                    }}
                    placeholder="কাঁথা or Katha"
                    lang="bn"
                    style={{ fontFamily: "'Hind Siliguri', 'Open Sans', sans-serif" }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug *
                    <span className="ml-2 text-xs font-normal bg-[#FFF0F0] text-[#800000] px-1.5 py-0.5 rounded">Auto</span>
                  </label>
                  <input
                    value={formData.slug}
                    onChange={(e) => setFormData((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="কাঁথা or katha"
                    dir="auto"
                    style={{ fontFamily: "'Hind Siliguri', monospace, sans-serif" }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
                  />
                  <p className="text-xs text-gray-400 mt-1">Auto-generated from name. Edit freely.</p>
                </div>

                {/* Sort order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
                  />
                </div>

                {/* Featured */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData((f) => ({ ...f, isFeatured: e.target.checked }))}
                    className="w-4 h-4 accent-[#800000]"
                  />
                  <span className="text-sm text-gray-700">Featured on Homepage</span>
                </label>

                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name || !formData.slug}
                  className="w-full flex items-center justify-center gap-2 bg-[#800000] text-white py-3 rounded-xl font-semibold disabled:opacity-70"
                >
                  {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Category"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
