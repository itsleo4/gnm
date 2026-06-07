"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Sparkles, BookOpen, Activity, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function WelcomePage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse"></div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center text-center py-20">
        {/* Logo/Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 relative"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-3xl flex items-center justify-center shadow-2xl relative z-10 transition-transform hover:rotate-3">
            <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute inset-0 bg-primary rounded-3xl -z-10 blur-xl"
          ></motion.div>
        </motion.div>

        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-6 md:space-y-8 max-w-4xl"
        >
          <h1 className="font-plus-jakarta text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface leading-tight tracking-tight">
            Your Future in Nursing <span className="text-primary">Starts Here</span>
          </h1>
          
          <p className="font-inter text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed px-4">
            Study smarter with AI-powered revision, NCP generation, medication learning, and clinical preparation in one place.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-xs md:max-w-none"
        >
          <Link href={user ? "/dashboard" : "/signup"} className="w-full md:w-auto">
            <button className="w-full md:px-10 h-14 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all">
              {user ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          
          <Link href="/login" className="w-full md:w-auto">
            <button className="w-full md:px-10 h-14 bg-surface-container-high text-on-surface rounded-2xl font-bold text-lg border border-outline/30 hover:bg-surface-container-highest active:scale-95 transition-all">
              Sign In
            </button>
          </Link>
        </motion.div>

        {/* Feature Marks */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl"
        >
          <FeatureBadge icon={Sparkles} label="AI Tutor" delay={0.7} />
          <FeatureBadge icon={Activity} label="Clinical Practice" delay={0.8} />
          <FeatureBadge icon={BookOpen} label="Drug Learning" delay={0.9} />
          <FeatureBadge icon={Zap} label="Smart Revision" delay={1.0} />
        </motion.div>
      </main>

      {/* Footer Hint */}
      <div className="py-8 text-center border-t border-outline/10">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-50">
          The Learning OS for Modern Nursing
        </p>
      </div>
    </div>
  );
}

function FeatureBadge({ icon: Icon, label, delay }: { icon: any; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-xs font-bold text-on-surface uppercase tracking-wide">{label}</span>
    </motion.div>
  );
}
