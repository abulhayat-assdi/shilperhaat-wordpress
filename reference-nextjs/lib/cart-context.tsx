"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react";
import type { CartItem, Cart } from "@/types";

interface DeliveryConfig {
  deliveryCharge: number;
  freeDeliveryMin: number | null;
}

interface CartContextType extends Cart {
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  isHydrated: boolean;
  cartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  freeDeliveryMin: number | null;
}

const CartContext = createContext<CartContextType | null>(null);

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((i) => i.productId === action.payload.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === action.payload.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case "REMOVE_ITEM":
      return state.filter((i) => i.productId !== action.payload);
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return state.filter((i) => i.productId !== action.payload.productId);
      }
      return state.map((i) =>
        i.productId === action.payload.productId
          ? {
              ...i,
              quantity: Math.min(action.payload.quantity, i.stock),
            }
          : i
      );
    case "CLEAR_CART":
      return [];
    case "LOAD_CART":
      return action.payload;
    default:
      return state;
  }
}

function computeCart(items: CartItem[], config: DeliveryConfig): Cart {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge =
    config.freeDeliveryMin !== null && subtotal >= config.freeDeliveryMin
      ? 0
      : items.length > 0
      ? config.deliveryCharge
      : 0;
  return {
    items,
    subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>({
    deliveryCharge: 80,
    freeDeliveryMin: 2000,
  });

  const openCartDrawer  = useCallback(() => setCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setCartDrawerOpen(false), []);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sh_cart");
      if (saved) {
        dispatch({ type: "LOAD_CART", payload: JSON.parse(saved) });
      }
    } catch {
      // ignore
    }
    setIsHydrated(true);
  }, []);

  // Fetch delivery settings from DB
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setDeliveryConfig({
          deliveryCharge: data.deliveryCharge ?? 80,
          freeDeliveryMin: data.freeDeliveryMin ?? null,
        });
      })
      .catch(() => {
        // keep defaults
      });
  }, []);

  // Persist cart to localStorage after hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("sh_cart", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isHydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const cart = computeCart(items, deliveryConfig);
  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{
        ...cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        isHydrated,
        cartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        freeDeliveryMin: deliveryConfig.freeDeliveryMin,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
