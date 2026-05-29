"use client";

import { useActionState, startTransition, useState, useEffect } from "react";
import { loginAdmin } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAdmin, null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      router.push("/admin");
    }
  }, [state, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden select-none font-sans">
      
      {/* 1. Subtle Stark Backdrop Spotlight */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-[120px] pointer-events-none transition-all duration-1000"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      {/* 2. Micro-grid Subtle Racing Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", 
          backgroundSize: "24px 24px" 
        }} 
      />

      {/* 3. Stark Minimalist Card Container */}
      <div className="relative w-full max-w-[390px] mx-4 z-10">
        
        <div className="relative w-full bg-zinc-950 border border-zinc-900 rounded-lg px-8 py-10 shadow-2xl flex flex-col items-center">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="text-xl font-bold uppercase tracking-widest text-white leading-none mb-1">
              SPEEDMANIA
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              Control Tower Login
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 text-left">
            
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="username" 
                className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 pl-0.5"
              >
                Username
              </label>
              <input 
                id="username"
                name="username"
                type="text"
                required
                disabled={isPending}
                placeholder="admin"
                className="w-full h-10 bg-black border border-zinc-800 rounded-md px-3 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-400 focus:ring-0 transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="password" 
                className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 pl-0.5"
              >
                Password
              </label>
              <div className="relative w-full">
                <input 
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isPending}
                  placeholder="••••••••"
                  className="w-full h-10 bg-black border border-zinc-800 rounded-md pl-3 pr-10 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-400 focus:ring-0 transition-all duration-200 disabled:opacity-50"
                />
                
                {/* Visibility Toggler */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors p-1 rounded focus:outline-none cursor-pointer disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message banner */}
            {state?.error && (
              <div className="w-full px-3 py-2.5 bg-black border border-red-900/60 rounded-md flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                <p className="text-[11px] text-red-500 font-semibold tracking-tight uppercase">
                  {state.error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="relative w-full h-10 bg-white hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-bold text-[10px] uppercase tracking-widest rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer mt-2"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
                  <span>Entering...</span>
                </div>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>

          </form>

        </div>
      </div>
      
    </div>
  );
}
