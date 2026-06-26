"use client";

import { useActionState, startTransition, useState, useEffect } from "react";
import { registerAuthor } from "@/lib/actions/author.actions";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AuthorRegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAuthor, null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      router.push("/submit-profile");
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
      
      {/* Subtle Backdrop Spotlight */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/[0.03] blur-[120px] pointer-events-none transition-all duration-1000"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      {/* Micro-grid Racing Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", 
          backgroundSize: "24px 24px" 
        }} 
      />

      {/* Stark Minimalist Card Container */}
      <div className="relative w-full max-w-[390px] mx-4 z-10">
        
        <div className="relative w-full bg-zinc-950 border border-zinc-900 rounded-lg px-8 py-10 shadow-2xl flex flex-col items-center">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="text-xl font-bold uppercase tracking-widest text-white leading-none mb-1">
              SPEEDMANIA
            </h1>
            <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">
              Create Author Account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 text-left">
            
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="username" 
                className="text-xs font-bold uppercase tracking-widest text-zinc-400 pl-0.5"
              >
                Username
              </label>
              <input 
                id="username"
                name="username"
                type="text"
                required
                disabled={isPending}
                placeholder="Choose username (min 3 chars)"
                className="w-full h-10 bg-black border border-zinc-800 rounded-md px-3 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-900 focus:ring-0 transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="password" 
                className="text-xs font-bold uppercase tracking-widest text-zinc-400 pl-0.5"
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
                  placeholder="Min 6 characters"
                  className="w-full h-10 bg-black border border-zinc-800 rounded-md pl-3 pr-10 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-900 focus:ring-0 transition-all duration-200 disabled:opacity-50"
                />
                
                {/* Visibility Toggler */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors p-1 rounded focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="confirmPassword" 
                className="text-xs font-bold uppercase tracking-widest text-zinc-400 pl-0.5"
              >
                Confirm Password
              </label>
              <div className="relative w-full">
                <input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={isPending}
                  placeholder="Repeat your password"
                  className="w-full h-10 bg-black border border-zinc-800 rounded-md pl-3 pr-10 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-900 focus:ring-0 transition-all duration-200 disabled:opacity-50"
                />
                
                {/* Visibility Toggler */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors p-1 rounded focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  {showConfirmPassword ? (
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
                <p className="text-xs text-red-500 font-semibold tracking-tight uppercase">
                  {state.error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="relative w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer mt-2"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  <span>Registering...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>Register Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </button>

          </form>

          <div className="mt-8 text-center text-xs text-zinc-500">
            <span>Already have an account? </span>
            <Link href="/login" className="text-blue-500 hover:underline font-bold transition-all duration-150">
              Sign in
            </Link>
          </div>

        </div>
      </div>
      
    </div>
  );
}
