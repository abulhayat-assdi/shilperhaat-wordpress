"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface ProductTabsProps {
  description?: string;
  tags?: string[];
  productId: string;
  reviews?: ProductReview[];
}

function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((v) => (
        <Star
          key={v}
          size={size}
          style={{
            color: v <= rating ? "#f59e0b" : "#ddd",
            fill: v <= rating ? "#f59e0b" : "none",
          }}
        />
      ))}
    </span>
  );
}

export default function ProductTabs({ description, tags, productId, reviews = [] }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : 0;

  // Review form state
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, rating, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitMsg({ type: "error", text: data.error || "Failed to submit review. Please try again." });
      } else {
        setSubmitMsg({
          type: "success",
          text: "Thank you! Your review has been submitted and will appear after approval.",
        });
        setName("");
        setRating(5);
        setContent("");
        setFormOpen(false);
      }
    } catch {
      setSubmitMsg({ type: "error", text: "Failed to submit review. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 40 }}>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "2px solid #eee" }}>
        {(["description", "reviews"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === "description"
              ? "Description"
              : `Customer Reviews (${reviewCount})`;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#800000" : "#666",
                marginBottom: -2,
                background: "none",
                borderTopWidth: 0,
                borderLeftWidth: 0,
                borderRightWidth: 0,
                borderBottomWidth: 3,
                borderBottomStyle: "solid",
                borderBottomColor: isActive ? "#800000" : "transparent",
                cursor: "pointer",
                fontFamily: "'Open Sans', sans-serif",
                transition: "color 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #eee",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          padding: 24,
        }}
      >
        {activeTab === "description" && (
          <div>
            {/* "Product Details" heading with orange underline */}
            <div style={{ marginBottom: 20 }}>
              <h3
                style={{
                  fontSize: 16, fontWeight: 600, color: "#222",
                  fontFamily: "'Open Sans', sans-serif",
                  paddingBottom: 8,
                  display: "inline-block",
                }}
              >
                Product Details
              </h3>
              <div style={{ height: 3, width: 48, backgroundColor: "#800000", borderRadius: 2, marginTop: -4 }} />
            </div>

            {description ? (
              <div
                className="prose-description"
                style={{
                  fontSize: 14, lineHeight: 1.8, color: "#444",
                  fontFamily: "'Open Sans', sans-serif",
                }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p style={{ color: "#aaa", fontSize: 14 }}>No description available.</p>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#222", marginBottom: 10, fontFamily: "'Open Sans',sans-serif" }}>
                  Tags
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/shop?search=${encodeURIComponent(tag)}`}
                      style={{
                        fontSize: 12, padding: "4px 12px",
                        backgroundColor: "#FFF0F0", color: "#800000",
                        borderRadius: 4, textDecoration: "none",
                        fontFamily: "'Open Sans',sans-serif", fontWeight: 500,
                        border: "1px solid #f5d0d0",
                        transition: "background-color 0.2s, color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#800000";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#FFF0F0";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#800000";
                      }}
                    >
                      #{tag}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div style={{ fontFamily: "'Open Sans',sans-serif" }}>

            {/* Summary row + write button */}
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 12, marginBottom: 20,
              }}
            >
              {reviewCount > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#222" }}>{avgRating}</span>
                  <div>
                    <StarRow rating={Math.round(avgRating)} size={16} />
                    <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                      Based on {reviewCount} review{reviewCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "#888" }}>No reviews yet — be the first to review this product.</p>
              )}

              {!formOpen && (
                <button
                  onClick={() => { setFormOpen(true); setSubmitMsg(null); }}
                  style={{
                    backgroundColor: "#800000", color: "#fff",
                    fontSize: 13, fontWeight: 600,
                    padding: "10px 20px", borderRadius: 6,
                    border: "none", cursor: "pointer",
                    fontFamily: "'Open Sans',sans-serif",
                  }}
                >
                  ✍️ Write a Review
                </button>
              )}
            </div>

            {/* Success / error message */}
            {submitMsg && (
              <div
                style={{
                  padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13,
                  backgroundColor: submitMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${submitMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                  color: submitMsg.type === "success" ? "#15803d" : "#b91c1c",
                }}
              >
                {submitMsg.text}
              </div>
            )}

            {/* Write review form */}
            {formOpen && (
              <form
                onSubmit={handleSubmitReview}
                style={{
                  border: "1px solid #eee", borderRadius: 8,
                  padding: 20, marginBottom: 24, backgroundColor: "#fafafa",
                }}
              >
                <h4 style={{ fontSize: 15, fontWeight: 600, color: "#222", marginBottom: 16 }}>
                  Write a Review
                </h4>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>
                    Your Rating *
                  </label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRating(v)}
                        aria-label={`${v} star${v > 1 ? "s" : ""}`}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                      >
                        <Star
                          size={26}
                          style={{
                            color: v <= rating ? "#f59e0b" : "#ccc",
                            fill: v <= rating ? "#f59e0b" : "none",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={60}
                    placeholder="e.g. Rahim Uddin"
                    style={{
                      width: "100%", maxWidth: 360, padding: "10px 12px",
                      border: "1px solid #ddd", borderRadius: 6,
                      fontSize: 14, outline: "none", boxSizing: "border-box",
                      fontFamily: "'Open Sans',sans-serif",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>
                    Your Review *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    minLength={5}
                    maxLength={2000}
                    rows={4}
                    placeholder="Share your experience with this product..."
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "1px solid #ddd", borderRadius: 6,
                      fontSize: 14, outline: "none", resize: "vertical",
                      boxSizing: "border-box",
                      fontFamily: "'Open Sans',sans-serif",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      backgroundColor: "#800000", color: "#fff",
                      fontSize: 13, fontWeight: 600,
                      padding: "10px 24px", borderRadius: 6,
                      border: "none", cursor: submitting ? "wait" : "pointer",
                      opacity: submitting ? 0.7 : 1,
                      fontFamily: "'Open Sans',sans-serif",
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    style={{
                      backgroundColor: "#fff", color: "#666",
                      fontSize: 13, fontWeight: 600,
                      padding: "10px 20px", borderRadius: 6,
                      border: "1px solid #ddd", cursor: "pointer",
                      fontFamily: "'Open Sans',sans-serif",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Reviews list */}
            {reviewCount > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {reviews.map((review, i) => (
                  <div
                    key={review.id}
                    style={{
                      padding: "16px 0",
                      borderTop: i === 0 ? "1px solid #eee" : "none",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div
                        style={{
                          width: 36, height: 36, borderRadius: "50%",
                          backgroundColor: "#800000", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 15, fontWeight: 700, flexShrink: 0,
                        }}
                      >
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#222" }}>{review.name}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <StarRow rating={review.rating} size={12} />
                          <span style={{ fontSize: 11, color: "#aaa" }}>{formatReviewDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: "#444", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
