"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, Plus, Play, Pencil, Lock } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { productSchema, type ProductInput } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import type { Category, Product } from "@/types";
import RichTextEditor from "./RichTextEditor";

const IMAGE_MAX_MB = 15;
const VIDEO_MAX_MB = 200;

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtu\.be\/([^?\s]+)/,
    /youtube\.com\/embed\/([^?\s]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();

  // ── images ──────────────────────────────────────────────────────────────────
  const [images, setImages] = useState<string[]>(
    product?.images.map((i) => i.imageUrl) || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ── video ────────────────────────────────────────────────────────────────────
  const [videoTab, setVideoTab] = useState<"upload" | "youtube">("youtube");
  const [videoUrl, setVideoUrl] = useState<string>(product?.videoUrl || "");
  const [videoLocalPreview, setVideoLocalPreview] = useState<string>("");
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string>(product?.youtubeUrl || "");
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>(
    product?.youtubeVideoId || ""
  );

  // ── description ──────────────────────────────────────────────────────────────
  const [descriptionHtml, setDescriptionHtml] = useState<string>(
    product?.description || ""
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          title: product.title,
          slug: product.slug,
          description: product.description || "",
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : undefined,
          stock: product.stock,
          categoryId: product.categoryId || "",
          isFeatured: product.isFeatured,
          isBestSelling: product.isBestSelling,
          status: product.status,
          tags: product.tags.join(", "),
        }
      : {
          status: "ACTIVE",
          isFeatured: false,
          isBestSelling: false,
          stock: 0,
        },
  });

  const titleValue = watch("title");
  const slugValue = watch("slug");

  // ── slug auto-generation ─────────────────────────────────────────────────────
  const [slugEditable, setSlugEditable] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (!slugEditable && titleValue) {
      setValue("slug", generateSlug(titleValue));
    }
  }, [titleValue, slugEditable, setValue]);

  useEffect(() => {
    if (slugEditable && slugValue === "") {
      setSlugEditable(false);
    }
  }, [slugValue, slugEditable]);

  // ── image upload ─────────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImgError(null);
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
          setImgError(`"${file.name}" exceeds ${IMAGE_MAX_MB}MB. Image size must be under ${IMAGE_MAX_MB}MB.`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          setImages((prev) => [...prev, data.url]);
        } else {
          const data = await res.json();
          setImgError(data.error || "Upload failed");
        }
      }
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  // ── drag-and-drop reorder ────────────────────────────────────────────────────
  const onDragStart = (index: number) => {
    dragIndexRef.current = index;
  };
  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === dropIndex) {
      dragIndexRef.current = null;
      setDragOverIndex(null);
      return;
    }
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(dropIndex, 0, item);
      return next;
    });
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };
  const onDragEnd = () => setDragOverIndex(null);

  // ── video upload via XHR (for progress) ──────────────────────────────────────
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoError(null);

    if (file.size > VIDEO_MAX_MB * 1024 * 1024) {
      setVideoError(
        `Video file must be under ${VIDEO_MAX_MB}MB. Please use YouTube link instead.`
      );
      e.target.value = "";
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setVideoLocalPreview(localUrl);
    setIsUploadingVideo(true);
    setVideoUploadProgress(0);

    try {
      const uploaded = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (ev) => {
          if (ev.lengthComputable)
            setVideoUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        });
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url);
          } else {
            reject(new Error(JSON.parse(xhr.responseText).error || "Upload failed"));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "videos");
        xhr.open("POST", "/api/upload");
        xhr.send(fd);
      });

      setVideoUrl(uploaded);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setVideoError(msg);
      setVideoLocalPreview("");
    } finally {
      setIsUploadingVideo(false);
      e.target.value = "";
    }
  };

  const removeVideo = () => {
    setVideoUrl("");
    setVideoLocalPreview("");
    setVideoUploadProgress(0);
    setVideoError(null);
  };

  // ── YouTube URL handler ───────────────────────────────────────────────────────
  const handleYoutubeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setYoutubeUrl(val);
    const id = extractYoutubeId(val);
    setYoutubeVideoId(id || "");
  };

  const clearYoutube = () => {
    setYoutubeUrl("");
    setYoutubeVideoId("");
  };

  useEffect(() => {
    setValue("description", descriptionHtml);
  }, [descriptionHtml, setValue]);

  // ── submit ────────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        description: descriptionHtml,
        tags: data.tags
          ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [],
        images,
        videoUrl: videoUrl || null,
        youtubeUrl: youtubeUrl || null,
        youtubeVideoId: youtubeVideoId || null,
      };

      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save product");
      router.push("/admin/products");
    } catch (error) {
      console.error("Product save error:", error);
      alert(error instanceof Error ? error.message : "Failed to save product. Please try again.");
    }
  };

  // ── shared class helpers ──────────────────────────────────────────────────────
  const cardCls = "bg-white border border-[#eee] rounded-lg p-5";
  const cardTitleCls = "text-sm font-bold text-[#333] mb-[14px] pb-[10px] border-b border-[#f0f0f0]";
  const inputCls = "w-full h-10 border rounded-lg px-3 text-sm outline-none transition-colors";
  const inputNormalCls = `${inputCls} border-gray-200 focus:border-[#800000]`;

  // ── UI ────────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="grid gap-6 md:grid-cols-[1fr_0.65fr]">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* Product Information */}
          <div className={cardCls}>
            <h3 className={cardTitleCls}>Product Information</h3>
            <div className="space-y-3">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("title")}
                  placeholder="Enter product title (English or Bengali)"
                  lang="bn"
                  style={{ fontFamily: "'Hind Siliguri', 'Open Sans', sans-serif" }}
                  className={`${inputCls} ${errors.title ? "border-red-400" : "border-gray-200 focus:border-[#800000]"}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal bg-[#FFF0F0] text-[#800000] px-1.5 py-0.5 rounded">
                    Auto
                  </span>
                </label>
                <div className="relative">
                  <input
                    {...register("slug")}
                    readOnly={!slugEditable}
                    placeholder="product-url-slug"
                    dir="auto"
                    style={{ fontFamily: "'Hind Siliguri', 'Open Sans', monospace" }}
                    className={`${inputCls} pr-24 ${
                      errors.slug
                        ? "border-red-400"
                        : slugEditable
                        ? "border-gray-200 focus:border-[#800000] bg-white"
                        : "border-gray-200 bg-gray-50 text-gray-500 cursor-default"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setSlugEditable((v) => !v)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      slugEditable
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {slugEditable ? (
                      <><Lock size={11} /> Lock</>
                    ) : (
                      <><Pencil size={11} /> Edit</>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Auto-generated from title. Click Edit to customize.
                </p>
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <RichTextEditor
                  value={descriptionHtml}
                  onChange={setDescriptionHtml}
                  placeholder="Product description..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tags (comma-separated)
                </label>
                <input
                  {...register("tags")}
                  placeholder="katha, silk, rajshahi"
                  className={inputNormalCls}
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className={cardCls}>
            <h3 className={cardTitleCls}>Product Images</h3>
            <p className="text-xs text-gray-400 mb-3">
              Drag to reorder. First image is the main product image. Max {IMAGE_MAX_MB}MB each.
            </p>

            {imgError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {imgError}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((url, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={(e) => onDragOver(e, i)}
                  onDrop={(e) => onDrop(e, i)}
                  onDragEnd={onDragEnd}
                  className="relative rounded-lg overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing transition-opacity flex-shrink-0"
                  style={{
                    width: 90,
                    height: 90,
                    opacity: dragOverIndex === i && dragIndexRef.current !== i ? 0.5 : 1,
                    outline: dragOverIndex === i ? "2px dashed #800000" : "none",
                  }}
                >
                  <Image
                    src={url}
                    alt={`Image ${i + 1}`}
                    fill
                    unoptimized
                    className="object-cover pointer-events-none"
                    sizes="90px"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center z-10"
                  >
                    <X size={10} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-[#800000] text-white text-xs px-1.5 py-0.5 rounded z-10">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {images.length < 10 && (
                <label
                  className="flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#800000] flex flex-col items-center justify-center cursor-pointer transition-colors"
                  style={{ width: 90, height: 90 }}
                >
                  {isUploading ? (
                    <Loader2 size={20} className="text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <Plus size={20} className="text-gray-400" />
                      <span className="text-xs text-gray-400 mt-1">Add Image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="sr-only"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            <p className="text-xs text-gray-400">
              Accepted: JPG, PNG, WebP, GIF — up to 10 images, {IMAGE_MAX_MB}MB each.
            </p>
          </div>

          {/* Product Video */}
          <div className={cardCls}>
            <h3 className={cardTitleCls}>Product Video</h3>

            <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
              {(["youtube", "upload"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setVideoTab(tab)}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    videoTab === tab
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "youtube" ? "YouTube URL" : "Upload Video"}
                </button>
              ))}
            </div>

            {videoError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {videoError}
              </div>
            )}

            {videoTab === "youtube" && (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={handleYoutubeChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={`${inputNormalCls} pr-10`}
                  />
                  {youtubeUrl && (
                    <button
                      type="button"
                      onClick={clearYoutube}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Upload your video to YouTube as Unlisted, then paste the link here.
                  Accepts youtube.com/watch?v=... and youtu.be/... formats.
                </p>
                {youtubeVideoId && (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`}
                        alt="YouTube thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 rounded-full w-7 h-7 flex items-center justify-center">
                          <Play size={12} fill="white" className="text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-700 font-medium">Video ID: {youtubeVideoId}</p>
                      <p className="text-gray-400 text-xs mt-0.5">Thumbnail preview loaded</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {videoTab === "upload" && (
              <div className="space-y-2">
                {!videoUrl && !isUploadingVideo && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#800000] rounded-lg p-4 cursor-pointer transition-colors">
                    <Play size={24} className="text-gray-400 mb-1" />
                    <span className="text-sm font-medium text-gray-600">Click to upload a video</span>
                    <span className="text-xs text-gray-400 mt-0.5">MP4, WebM, MOV — max {VIDEO_MAX_MB}MB</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="sr-only"
                      onChange={handleVideoFileChange}
                    />
                  </label>
                )}

                {isUploadingVideo && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Uploading video...</span>
                      <span>{videoUploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#800000] rounded-full transition-all duration-300"
                        style={{ width: `${videoUploadProgress}%` }}
                      />
                    </div>
                    {videoLocalPreview && (
                      <video
                        src={videoLocalPreview}
                        className="w-full max-h-40 rounded-lg object-cover mt-2"
                        muted
                      />
                    )}
                  </div>
                )}

                {videoUrl && !isUploadingVideo && (
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      src={videoLocalPreview || videoUrl}
                      controls
                      className="w-full max-h-48 object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (sticky) ────────────────────────────────────────── */}
        <div className="sticky top-[72px] self-start space-y-4 min-w-0">

          {/* Product Status */}
          <div className={cardCls}>
            <h3 className={cardTitleCls}>Product Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  {...register("status")}
                  className={inputNormalCls}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register("isFeatured")}
                  type="checkbox"
                  className="w-4 h-4 accent-[#800000]"
                />
                <span className="text-sm text-gray-700">Featured Product</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register("isBestSelling")}
                  type="checkbox"
                  className="w-4 h-4 accent-[#800000]"
                />
                <span className="text-sm text-gray-700">Best Selling</span>
              </label>
            </div>
          </div>

          {/* Category */}
          <div className={cardCls}>
            <h3 className={cardTitleCls}>Category</h3>
            <select
              {...register("categoryId")}
              className={inputNormalCls}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing & Inventory */}
          <div className={cardCls}>
            <h3 className={cardTitleCls}>Pricing & Inventory</h3>
            <div className="space-y-3">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sale Price (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("price")}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`${inputCls} ${errors.price ? "border-red-400" : "border-gray-200 focus:border-[#800000]"}`}
                />
                <p className="text-xs text-gray-400 mt-1">Current selling price</p>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Original Price (৳)
                </label>
                <input
                  {...register("compareAtPrice")}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={inputNormalCls}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Shown with strikethrough. Leave 0 if no discount.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("stock")}
                  type="number"
                  placeholder="0"
                  className={`${inputCls} ${errors.stock ? "border-red-400" : "border-gray-200 focus:border-[#800000]"}`}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="space-y-[10px] pt-2 border-t border-[#eee]">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#5C0000] disabled:opacity-70 text-white font-bold rounded-[8px] transition-colors"
              style={{ height: 46, fontSize: 15 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Save Product"
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-white border border-[#ddd] text-[#666] text-sm rounded-[8px] hover:bg-gray-50 transition-colors"
              style={{ height: 46 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
