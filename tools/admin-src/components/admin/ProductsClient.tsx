"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, ImageIcon } from "lucide-react";
import type { Product } from "@/types";

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="w-12 h-12 rounded-[6px] bg-gray-100 border border-[#eee] flex items-center justify-center flex-shrink-0">
        <ImageIcon size={20} className="text-gray-400" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      unoptimized
      className="rounded-[6px] object-cover border border-[#eee] flex-shrink-0"
      style={{ width: 48, height: 48 }}
      sizes="48px"
      onError={() => setFailed(true)}
    />
  );
}

interface ProductsClientProps {
  products: Product[];
}

export default function ProductsClient({ products: initialProducts }: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
      else alert("Failed to delete product.");
    } catch {
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">All Products</h2>
          <p className="text-gray-500 text-sm">{products.length} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#5C0000] transition-colors"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product, i) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images[0]?.imageUrl ? (
                        <ProductThumb src={product.images[0].imageUrl} alt={product.title} />
                      ) : (
                        <div className="w-12 h-12 rounded-[6px] bg-gray-100 border border-[#eee] flex items-center justify-center flex-shrink-0">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      )}
                      <p className="font-medium text-[#222] text-[14px] max-w-[200px] truncate">{product.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.category?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800">৳{Number(product.price).toLocaleString()}</span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-gray-400 line-through ml-1">৳{Number(product.compareAtPrice).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${product.stock === 0 ? "text-red-600" : product.stock < 5 ? "text-[#800000]" : "text-green-600"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === "ACTIVE" ? "bg-green-100 text-green-700"
                      : product.status === "OUT_OF_STOCK" ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <a
                        href={`/product/${encodeURIComponent(product.slug)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        aria-label="View"
                      >
                        <Eye size={15} />
                      </a>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
