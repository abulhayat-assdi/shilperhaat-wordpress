"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, Play } from "lucide-react";
import type { ProductImage } from "@/types";
import { getImageUrl } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  videoUrl?: string | null;
  youtubeVideoId?: string | null;
}

type MediaItem =
  | { type: "image"; image: ProductImage }
  | { type: "video"; videoUrl?: string | null; youtubeVideoId?: string | null };

function YoutubeEmbed({ videoId }: { videoId: string }) {
  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
      title="Product video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full rounded"
      style={{ border: "none", minHeight: 340 }}
    />
  );
}

function ThumbnailButton({
  item,
  index,
  size,
  activeIndex,
  onSelect,
}: {
  item: MediaItem;
  index: number;
  size: number;
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  const isActive = index === activeIndex;
  return (
    <button
      onClick={() => onSelect(index)}
      aria-label={`View ${item.type} ${index + 1}`}
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        overflow: "hidden",
        border: isActive ? "2px solid #800000" : "2px solid #eee",
        cursor: "pointer",
        transition: "border-color 0.2s ease",
        backgroundColor: "#fff",
        padding: 0,
        flexShrink: 0,
        position: "relative",
      }}
    >
      {item.type === "image" ? (
        <Image
          src={getImageUrl(item.image.imageUrl)}
          alt={item.image.altText || `Image ${index + 1}`}
          fill
          sizes="80px"
          className="object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-product.svg";
          }}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center relative"
          style={{ background: "#1a1a1a" }}
        >
          {item.youtubeVideoId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://img.youtube.com/vi/${item.youtubeVideoId}/mqdefault.jpg`}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "#1a1a1a" }}
            />
          )}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.35)" }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: size < 70 ? 20 : 28,
                height: size < 70 ? 20 : 28,
                background: "rgba(255,255,255,0.9)",
              }}
            >
              <Play
                size={size < 70 ? 9 : 13}
                fill="#800000"
                style={{ color: "#800000", marginLeft: 2 }}
              />
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

function VideoPlayer({ src }: { src: string }) {
  return (
    <video
      src={src}
      controls
      autoPlay
      className="w-full rounded object-contain"
      style={{ maxHeight: 380, background: "#000" }}
    />
  );
}

export default function ProductGallery({
  images,
  title,
  videoUrl,
  youtubeVideoId,
}: ProductGalleryProps) {
  const hasVideo = !!(videoUrl || youtubeVideoId);

  const mediaItems: MediaItem[] = [
    ...images.map((img) => ({ type: "image" as const, image: img })),
    ...(hasVideo ? [{ type: "video" as const, videoUrl, youtubeVideoId }] : []),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (mediaItems.length === 0) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{
          aspectRatio: "1",
          backgroundColor: "#F5F5F5",
          borderRadius: 8,
          border: "1px solid #F0F0F0",
        }}
      >
        <span style={{ color: "#888888", fontSize: 14 }}>No image available</span>
      </div>
    );
  }

  const activeItem = mediaItems[activeIndex];
  const isVideoActive = activeItem.type === "video";

  const prev = () =>
    setActiveIndex((i) => (i === 0 ? mediaItems.length - 1 : i - 1));
  const next = () =>
    setActiveIndex((i) => (i + 1) % mediaItems.length);

  return (
    <>
      {/* Gallery panel */}
      <div
        className="flex"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 8,
          border: "1px solid #F0F0F0",
          padding: 16,
          gap: 12,
          position: "sticky",
          top: 68,
        }}
      >
        {/* Thumbnails strip (left) — desktop */}
        {mediaItems.length > 1 && (
          <div
            className="hidden md:flex flex-col"
            style={{
              gap: 8,
              width: 80,
              flexShrink: 0,
              maxHeight: 440,
              overflowY: "auto",
              scrollbarWidth: "none",
            } as React.CSSProperties}
          >
            {mediaItems.map((item, i) => (
              <ThumbnailButton key={i} item={item} index={i} size={76} activeIndex={activeIndex} onSelect={setActiveIndex} />
            ))}
          </div>
        )}

        {/* Main area */}
        <div
          className="flex-1 relative flex items-center justify-center overflow-hidden"
          style={{ minHeight: 380, maxHeight: 500 }}
          onClick={() => {
            if (!isVideoActive) setLightboxOpen(true);
          }}
        >
          {isVideoActive ? (
            // Video player — fill the area
            <div className="w-full" style={{ cursor: "default" }}>
              {activeItem.youtubeVideoId ? (
                <YoutubeEmbed videoId={activeItem.youtubeVideoId} />
              ) : activeItem.videoUrl ? (
                <VideoPlayer src={activeItem.videoUrl} />
              ) : null}
            </div>
          ) : (
            // Image
            <>
              <div
                key={activeIndex}
                className="gallery-fade absolute inset-0 flex items-center justify-center cursor-zoom-in"
              >
                <Image
                  src={getImageUrl(
                    (activeItem as Extract<MediaItem, { type: "image" }>).image.imageUrl
                  )}
                  alt={
                    (activeItem as Extract<MediaItem, { type: "image" }>).image.altText ||
                    `${title} — image ${activeIndex + 1}`
                  }
                  fill
                  className="object-contain transition-transform duration-300 hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  preload={activeIndex === 0}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                  }}
                />
              </div>

              {/* Zoom hint */}
              <div
                className="absolute bottom-3 right-3 flex items-center justify-center pointer-events-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.85)",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  zIndex: 10,
                }}
              >
                <ZoomIn size={14} style={{ color: "#666" }} />
              </div>
            </>
          )}

          {/* Arrows — mobile (left + right) */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 md:hidden flex items-center justify-center"
                aria-label="Previous"
                style={{
                  backgroundColor: "rgba(0,0,0,0.12)",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: "#FFFFFF",
                  zIndex: 10,
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden flex items-center justify-center"
                aria-label="Next"
                style={{
                  backgroundColor: "rgba(0,0,0,0.12)",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: "#FFFFFF",
                  zIndex: 10,
                }}
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Arrow — desktop (right side only) */}
          {mediaItems.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center"
              aria-label="Next image"
              style={{
                backgroundColor: "rgba(255,255,255,0.92)",
                border: "1px solid #eee",
                width: 28,
                height: 28,
                borderRadius: "50%",
                cursor: "pointer",
                color: "#666",
                zIndex: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile thumbnails */}
      {mediaItems.length > 1 && (
        <div
          className="flex md:hidden overflow-x-auto mt-3"
          style={{ gap: 8, paddingBottom: 4 }}
        >
          {mediaItems.map((item, i) => (
            <ThumbnailButton key={i} item={item} index={i} size={64} activeIndex={activeIndex} onSelect={setActiveIndex} />
          ))}
        </div>
      )}

      {/* Lightbox (images only) */}
      {lightboxOpen && !isVideoActive && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.type === "image" && (
              <Image
                src={getImageUrl(activeItem.image.imageUrl)}
                alt={activeItem.image.altText || title}
                width={800}
                height={800}
                className="object-contain w-full rounded-lg"
                style={{ maxHeight: "80vh" }}
              />
            )}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute flex items-center justify-center"
              style={{
                top: -12,
                right: -12,
                backgroundColor: "#FFFFFF",
                color: "#222831",
                borderRadius: "50%",
                width: 32,
                height: 32,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ✕
            </button>
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={() => prev()}
                  className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    left: 8,
                    backgroundColor: "rgba(255,255,255,0.8)",
                    border: "none",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => next()}
                  className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    right: 8,
                    backgroundColor: "rgba(255,255,255,0.8)",
                    border: "none",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
