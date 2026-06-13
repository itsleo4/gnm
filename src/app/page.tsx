"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, ClipboardCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden flex flex-col">
      {/* Navigation - No Squeeze Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-slate-50">
        <div className="max-w-6xl mx-auto h-20 px-6 flex items-center justify-between gap-4">
          <div className="flex flex-col shrink-0">
            <span className="text-sm font-black tracking-tighter text-slate-900 uppercase">GNM Companion</span>
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-0.5 whitespace-nowrap">by Nitin Kumar</span>
          </div>
          {!loading && (
            <div className="shrink-0 flex items-center">
              <Link 
                href={session ? "/dashboard" : "/login"} 
                className="px-5 md:px-8 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-90 transition-all whitespace-nowrap"
              >
                {session ? "Dashboard" : "Sign In"}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-40 pb-20 px-6 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full flex flex-col items-center"
          >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-10 shadow-inner">
                <Sparkles className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Odin AI 🫀 Powered Clinical OS</span>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 w-full max-w-4xl">
                Your Future <br className="hidden md:block" />
                in Nursing <br />
                <span className="text-primary italic">Starts Here</span>
              </h1>
              
              <p className="text-md md:text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed mb-12 w-full">
                The high-performance Learning OS for GNM nursing students. Mastery driven, AI-powered, and designed for clinical excellence.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm mx-auto">
                <Link 
                  href={session ? "/dashboard" : "/signup"} 
                  className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all group"
                >
                   {session ? "Enter Dashboard" : "Get Started Now"}
                   <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
           <FeatureCard icon={Zap} title="High-Speed Revision" desc="Master complex topics like Shock and Hypertension in under 5 minutes." />
           <FeatureCard icon={ClipboardCheck} title="NCP Synthesis" desc="Generate professional Grade-A Nursing Care Plans with Odin AI 🫀 logic." />
           <FeatureCard icon={Shield} title="Clinical Vault" desc="Secure database of drug reports and clinical mastery metrics." />
        </section>
      </main>

      {/* Footer - No Squeeze Signature */}
      <footer className="py-20 px-6 border-t border-slate-50 bg-slate-50/30">
         <div className="max-w-xl mx-auto text-center flex flex-col items-center">
            <div className="mb-10">
               <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] block mb-2">GNM COMPANIION</span>
               <div className="w-10 h-1 bg-slate-100 mx-auto rounded-full" />
            </div>
            
            <div className="w-full bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-10 flex flex-col items-center group hover:shadow-xl transition-all">
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 transition-transform group-hover:rotate-12">
                  <Heart className="w-8 h-8 fill-primary" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Designed for Excellence</p>
               <p className="text-xl font-black text-slate-900 uppercase">By Nitin Kumar</p>
               <p className="text-[9px] font-bold text-slate-500 mt-4 leading-relaxed max-w-[200px]">
                  GNM Nursing Student & <br /> Full-Stack Systems Developer
               </p>
               <div className="mt-8 pt-8 border-t border-slate-50 w-full flex justify-center gap-6">
                  <div className="flex flex-col items-center">
                     <span className="text-[14px] font-black text-slate-900">2026</span>
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Cohort</span>
                  </div>
                  <div className="w-px h-8 bg-slate-50" />
                  <div className="flex flex-col items-center">
                     <span className="text-[14px] font-black text-slate-900">AI</span>
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Brained</span>
                  </div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-10 bg-white border border-slate-100 rounded-[3.5rem] text-left hover:shadow-2xl hover:border-transparent transition-all group relative overflow-hidden">
       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all" />
       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary mb-8 transition-all group-hover:bg-primary group-hover:text-white group-hover:rotate-12">
          <Icon className="w-8 h-8" />
       </div>
       <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">{title}</h4>
       <p className="text-sm font-bold text-slate-400 leading-relaxed mb-4">{desc}</p>
       <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
          Explore Feature <ArrowRight className="w-3 h-3" />
       </div>
    </div>
  )
}
