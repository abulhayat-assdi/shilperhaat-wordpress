"use client";

import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-green-600" />,
  error: <XCircle size={18} className="text-red-600" />,
  warning: <AlertCircle size={18} className="text-yellow-600" />,
  info: <Info size={18} className="text-blue-600" />,
};

const toastColors: Record<ToastType, string> = {
  success: "bg-white border-green-200 shadow-green-100",
  error: "bg-white border-red-200 shadow-red-100",
  warning: "bg-white border-yellow-200 shadow-yellow-100",
  info: "bg-white border-blue-200 shadow-blue-100",
};

interface ToastItemProps {
  t: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ t, onRemove }: ToastItemProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(show);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border shadow-lg max-w-xs ${toastColors[t.type]}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0) scale(1)" : "translateX(60px) scale(0.9)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
      }}
    >
      <div className="mt-0.5 flex-shrink-0">{toastIcons[t.type]}</div>
      <p className="text-sm text-[#1a1208] flex-1 leading-snug">{t.message}</p>
      <button
        onClick={() => onRemove(t.id)}
        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg),
    warning: (msg: string) => addToast("warning", msg),
    info: (msg: string) => addToast("info", msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 md:bottom-6 md:right-6">
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
