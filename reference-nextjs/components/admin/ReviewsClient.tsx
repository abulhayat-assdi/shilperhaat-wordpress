"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Review } from "@/types";

interface ReviewsClientProps {
  reviews: Review[];
}

export default function ReviewsClient({ reviews: initialReviews }: ReviewsClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<Partial<Review>>({
    rating: 5,
    isVisible: true,
    sortOrder: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = () => {
    setEditingReview(null);
    setFormData({ rating: 5, isVisible: true, sortOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setFormData(review);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) return;
    setIsSaving(true);
    try {
      const url = editingReview ? `/api/admin/reviews/${editingReview.id}` : "/api/admin/reviews";
      const res = await fetch(url, {
        method: editingReview ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      if (editingReview) {
        setReviews((prev) => prev.map((r) => (r.id === editingReview.id ? data.review : r)));
      } else {
        setReviews((prev) => [...prev, data.review]);
      }
      setModalOpen(false);
    } catch {
      alert("Failed to save review. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisible = async (id: string) => {
    const review = reviews.find((r) => r.id === id);
    if (!review) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...review, isVisible: !review.isVisible }),
      });
      if (res.ok) setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isVisible: !r.isVisible } : r)));
    } catch {
      // silent fail
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
      else alert("Failed to delete review.");
    } catch {
      alert("Failed to delete review.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Customer Reviews</h2>
          <p className="text-gray-500 text-sm">{reviews.length} reviews</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#5C0000] transition-colors"
        >
          <Plus size={16} />
          Add Review
        </button>
      </div>

      {/* Reviews list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Reviewer</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Rating</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Review</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Visible</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <tr key={review.id} className={`hover:bg-gray-50 transition-colors ${!review.isVisible ? "opacity-60" : ""}`}>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-800">{review.name}</p>
                    {review.role && <p className="text-xs text-gray-400">{review.role}</p>}
                    {review.product && (
                      <a
                        href={`/product/${review.product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-0.5 text-xs text-[#800000] bg-[#FFF0F0] px-2 py-0.5 rounded-full hover:underline max-w-[180px] truncate"
                        title={review.product.title}
                      >
                        📦 {review.product.title}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < review.rating ? "text-[#800000] fill-[#800000]" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-gray-600 text-xs max-w-xs truncate">{review.content}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    review.isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {review.isVisible ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(review)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => toggleVisible(review.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                      {review.isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-800">{editingReview ? "Edit Review" : "Add Review"}</h3>
                <button onClick={() => setModalOpen(false)}><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                    <input
                      value={formData.name || ""}
                      onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#800000]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location/Role</label>
                    <input
                      value={formData.role || ""}
                      onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value }))}
                      placeholder="Dhaka, Bangladesh"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#800000]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    value={formData.title || ""}
                    onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#800000]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setFormData((f) => ({ ...f, rating: v }))}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={v <= (formData.rating || 0) ? "text-[#800000] fill-[#800000]" : "text-gray-300"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Review Content *</label>
                  <textarea
                    value={formData.content || ""}
                    onChange={(e) => setFormData((f) => ({ ...f, content: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#800000] resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisible ?? true}
                    onChange={(e) => setFormData((f) => ({ ...f, isVisible: e.target.checked }))}
                    className="w-4 h-4 accent-[#800000]"
                  />
                  <span className="text-sm text-gray-700">Visible on website</span>
                </label>

                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name || !formData.content}
                  className="w-full flex items-center justify-center gap-2 bg-[#800000] text-white py-3 rounded-xl font-semibold disabled:opacity-70"
                >
                  {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Review"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
