import { db } from "@/lib/db";
import { count } from "drizzle-orm";
import { drivers, circuits, blogs } from "@/lib/db/schema";
import Link from "next/link";
import { ArrowRight, ShieldAlert, Award, Compass, Newspaper, ArrowUpRight } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export const dynamic = "force-dynamic";

export default async function CMSHomePage() {
  // Fetch database statistics
  let stats = { drivers: 0, circuits: 0, blogs: 0 };
  try {
    const [dCount] = await db.select({ value: count() }).from(drivers);
    const [cCount] = await db.select({ value: count() }).from(circuits);
    const [bCount] = await db.select({ value: count() }).from(blogs);
    stats = {
      drivers: dCount?.value || 0,
      circuits: cCount?.value || 0,
      blogs: bCount?.value || 0,
    };
  } catch (error) {
    console.error("Failed to load CMS stats:", error);
  }

  const user = await getCurrentUser();

  return (
    <div className="relative min-h-screen w-full bg-black text-zinc-100 flex flex-col items-center justify-center px-4 overflow-hidden font-sans select-none">
      
      {/* Dynamic Background Spotlights - Blue */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/[0.03] blur-[150px] pointer-events-none"
        style={{ top: "-10%", left: "10%" }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full bg-blue-800/[0.02] blur-[180px] pointer-events-none"
        style={{ bottom: "-15%", right: "10%" }}
      />

      {/* Racing Micro-Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: "radial-gradient(circle, #ffffff 1.2px, transparent 1.2px)", 
          backgroundSize: "28px 28px" 
        }} 
      />

      {/* Subtle diagonal speed lines */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(37,99,235,0.015)_50%,transparent_55%)] bg-[length:10px_10px] pointer-events-none opacity-40" />

      {/* Central Portal Wrapper */}
      <div className="relative w-full max-w-5xl z-10 py-12 flex flex-col items-center">
        
        {/* Header Branding */}
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full mb-4">
            <span className="text-[12px] font-extrabold uppercase tracking-widest text-blue-500">
              CMS HUB & MIDDLEWARE
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-none mb-4 uppercase">
            SPEED<span className="text-blue-600">MANIA</span>
          </h1>
          <p className="max-w-xl text-sm md:text-base text-zinc-400 font-medium">
            Control center for the SpeedMania grid directory, circuit guides, news updates, and driver profile registrations.
          </p>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          
          {/* Admin Dashboard Entry */}
          <div className="group relative bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-800/10 rounded-bl-full pointer-events-none" />
            
            <div>
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-blue-950/20 group-hover:border-blue-900/40 transition-colors">
                <ShieldAlert className="w-6 h-6 text-zinc-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                Administrator
                <span className="text-xs font-extrabold bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-widest">CMS</span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                Review driver details, publish blog articles, edit circuit FAQs, manage results tables, and moderate community discussion comments.
              </p>
            </div>

            <Link href="/admin">
              <button className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                <span>Access Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Athlete Portal Entry */}
          <div className="group relative bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.02)] overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-950/5 rounded-bl-full pointer-events-none" />
            
            <div>
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-blue-950/20 group-hover:border-blue-900/40 transition-colors">
                <Award className="w-6 h-6 text-zinc-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                Athlete Portal
                <span className="text-xs font-extrabold bg-blue-950 text-blue-500 px-2 py-0.5 rounded border border-blue-900/30 uppercase tracking-widest">Drivers</span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                For professional racers and riders to register driver accounts, submit motorsport credentials, build portfolios, and edit profiles.
              </p>
            </div>

            <Link href={user ? "/submit-profile" : "/login"}>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)]">
                <span>{user ? "Enter Driver Portal" : "Login to Driver Portal"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Author Portal Entry */}
          <div className="group relative bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-800/10 rounded-bl-full pointer-events-none" />
            
            <div>
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-blue-950/20 group-hover:border-blue-900/40 transition-colors">
                <Newspaper className="w-6 h-6 text-zinc-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                Author Portal
                <span className="text-xs font-extrabold bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-widest">Media</span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                For journalists and contributors to publish news articles, race reports, and media features.
              </p>
            </div>

            <Link href={user ? "/author/dashboard" : "/login"}>
              <button className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                <span>Enter Media Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

        </div>

        {/* Database Live Stats Footer */}
        <div className="w-full border-t border-zinc-900 pt-8 grid grid-cols-3 gap-4 text-center">
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">Athletes</span>
            </div>
            <span className="text-xl md:text-3xl font-black text-white font-mono">{stats.drivers}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">Circuits</span>
            </div>
            <span className="text-xl md:text-3xl font-black text-white font-mono">{stats.circuits}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
              <Newspaper className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">News</span>
            </div>
            <span className="text-xl md:text-3xl font-black text-white font-mono">{stats.blogs}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
