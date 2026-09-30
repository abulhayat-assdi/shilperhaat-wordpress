"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema) as any,
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.error || "Invalid credentials");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
        >
          {error}
        </motion.div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            {...register("email")}
            type="email"
            placeholder="admin@shilperhaat.com"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-colors ${
              errors.email
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-[#800000]"
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm outline-none transition-colors ${
              errors.password
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-[#800000]"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#5C0000] disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </motion.button>
    </form>
  );
}
