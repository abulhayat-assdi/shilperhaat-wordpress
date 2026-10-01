// Core types that match the Prisma schema structure

export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  sortOrder: number;
  altText: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  categoryId: string | null;
  isFeatured: boolean;
  isBestSelling: boolean;
  status: ProductStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  images: ProductImage[];
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  youtubeVideoId?: string | null;
}

export interface Review {
  id: string;
  name: string;
  title: string | null;
  rating: number;
  content: string;
  avatarUrl: string | null;
  role: string | null;
  isVisible: boolean;
  sortOrder: number;
  productId?: string | null;
  product?: { title: string; slug: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productTitle: string;
  productImage: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  notes: string | null;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  courierConsignmentId?: string | null;
  courierTrackingCode?: string | null;
  courierSentAt?: string | null;
  courierStatus?: "pending" | "sent" | "failed" | null;
}

export interface SiteSetting {
  id: string;
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  footerCopyright: string | null;
  whatsappNumber: string | null;
  socialLinks: Record<string, string> | null;
  deliveryCharge: number;
  freeDeliveryMin: number | null;
  updatedAt: Date;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cart types (client-side only)
export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  quantity: number;
  stock: number;
  slug: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

// Filter types for shop page
export interface ProductFilters {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "best_selling";
  page?: number;
  limit?: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
