type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, boolean | undefined | null>
  | ClassValue[];

// Simple cn utility (no external clsx dependency)
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .filter(Boolean)
    .map((input) => {
      if (typeof input === "string" || typeof input === "number") return String(input);
      if (Array.isArray(input)) return cn(...input);
      if (typeof input === "object" && input !== null) {
        return Object.entries(input)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k)
          .join(" ");
      }
      return "";
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

// Convert ASCII digits to Bengali digits (0-9 → ০-৯)
function toBengaliDigits(str: string): string {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return str.replace(/\d/g, (d) => map[parseInt(d)]);
}

// Format price in Bengali/BDT format — use deterministic digit conversion to avoid server/client locale mismatch
export function formatPrice(price: number): string {
  const formatted = Math.round(price).toLocaleString("en-US");
  return `৳${toBengaliDigits(formatted)}`;
}

// Format price in English — use "en-US" which is universally supported in Node.js and browsers
export function formatPriceEn(price: number): string {
  return `৳${Math.round(price).toLocaleString("en-US")}`;
}

// Calculate discount percentage
export function calculateDiscount(price: number, compareAtPrice: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

// Generate slug from text — supports English, Bengali, and mixed Unicode
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    // Keep Unicode letters (incl. Bengali ক-ৱ), digits, spaces, hyphens — strip everything else
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    // Collapse spaces/underscores into a single hyphen
    .replace(/[\s_]+/g, "-")
    // Collapse consecutive hyphens
    .replace(/-{2,}/g, "-")
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, "");
}

// Generate order number
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `SH${year}${month}${day}${random}`;
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_BN = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

// Format date in Bengali — deterministic, no locale dependency
export function formatDateBn(date: Date | string): string {
  const d = new Date(date);
  return `${toBengaliDigits(String(d.getDate()))} ${MONTHS_BN[d.getMonth()]} ${toBengaliDigits(String(d.getFullYear()))}`;
}

// Format date in English — deterministic, no locale dependency
export function formatDateEn(date: Date | string): string {
  const d = new Date(date);
  return `${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Order status labels in Bengali (for customer-facing UI)
export const ORDER_STATUS_BN: Record<string, string> = {
  PENDING: "অপেক্ষমাণ",
  CONFIRMED: "নিশ্চিত",
  PROCESSING: "প্রক্রিয়াধীন",
  SHIPPED: "পাঠানো হয়েছে",
  DELIVERED: "পৌঁছে গেছে",
  CANCELLED: "বাতিল",
};

// Order status labels in English (for admin panel)
export const ORDER_STATUS_EN: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// Product status labels
export const PRODUCT_STATUS_BN: Record<string, string> = {
  ACTIVE: "সক্রিয়",
  INACTIVE: "নিষ্ক্রিয়",
  OUT_OF_STOCK: "স্টক নেই",
};

// Rating stars
export function getStars(rating: number): { full: number; empty: number } {
  const full = Math.round(rating);
  return { full, empty: 5 - full };
}

// Image URL helper
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder-product.svg";
  if (url.startsWith("http")) return url;
  return url;
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
