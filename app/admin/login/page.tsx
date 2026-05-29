"use client";

import { useActionState, startTransition, useState, useEffect } from "react";
import { loginAdmin } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Trophy } from "lucide-react";

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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#09090b] overflow-hidden select-none font-sans">
      
      {/* 1. Glowing Racing Auras / Aural Background Gradients */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full bg-[#000DFF]/15 blur-[120px] pointer-events-none transition-all duration-1000"
        style={{ top: "-10%", left: "-10%" }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full bg-[#000580]/10 blur-[150px] pointer-events-none transition-all duration-1000"
        style={{ bottom: "-10%", right: "-10%" }}
      />

      {/* 2. Micro-grid Subtle Racing Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", 
          backgroundSize: "20px 20px" 
        }} 
      />

      {/* 3. Glassmorphic Card Container */}
      <div className="relative w-full max-w-[420px] mx-4 z-10">
        
        {/* Animated outer glowing border */}
        <div className="absolute -inset-0.5 rounded-[24px] bg-gradient-to-r from-[#000DFF]/30 to-[#000580]/30 opacity-70 blur-sm pointer-events-none" />

        <div className="relative w-full bg-[#18181b]/70 backdrop-blur-xl border border-zinc-800/80 rounded-[24px] px-8 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
          
          {/* Header Icon & Title */}
          <div className="w-[60px] h-[60px] rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-inner group transition-transform duration-500 hover:rotate-12">
            <Trophy className="w-6 h-6 text-[#000DFF] drop-shadow-[0_0_10px_rgba(0,13,255,0.6)]" />
          </div>

          <h1 className="text-2xl font-bold uppercase tracking-tight text-white mb-1 leading-none font-sans">
            Speedmania Admin
          </h1>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-8">
            Control Tower Login
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 text-left">
            
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="username" 
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1"
              >
                Username
              </label>
              <input 
                id="username"
                name="username"
                type="text"
                required
                disabled={isPending}
                placeholder="Enter admin username"
                className="w-full h-11 bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#000DFF] focus:ring-1 focus:ring-[#000DFF] focus:shadow-[0_0_15px_rgba(0,13,255,0.15)] transition-all duration-300 disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="password" 
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1"
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
                  className="w-full h-11 bg-zinc-950/80 border border-zinc-800 rounded-xl pl-4 pr-11 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#000DFF] focus:ring-1 focus:ring-[#000DFF] focus:shadow-[0_0_15px_rgba(0,13,255,0.15)] transition-all duration-300 disabled:opacity-50"
                />
                
                {/* Visibility Toggler */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded focus:outline-none cursor-pointer disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message banner */}
            {state?.error && (
              <div className="w-full px-4 py-3 bg-red-950/20 border border-red-900/50 rounded-xl flex items-center gap-3 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-xs text-red-400 font-bold uppercase tracking-tight">
                  {state.error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="relative group/btn w-full h-11 bg-[#000DFF] hover:bg-[#0006c7] disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-[0_4px_25px_rgba(0,13,255,0.3)] hover:shadow-[0_6px_35px_rgba(0,13,255,0.5)] transition-all duration-300 flex items-center justify-center cursor-pointer mt-3"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Clearing Grid...</span>
                </div>
              ) : (
                <>
                  <span>Initialize Dashboard</span>
                  {/* Subtle shining light micro-animation */}
                  <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-20deg] translate-x-[-120%] group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                </>
              )}
            </button>

          </form>

        </div>
      </div>
      
    </div>
  );
}
