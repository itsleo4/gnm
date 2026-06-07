"use client";

import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Heart, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-[28px] md:rounded-[32px] flex items-center justify-center shadow-2xl mb-lg relative z-10"
      >
        <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-white" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute inset-0 bg-primary rounded-[28px] md:rounded-[32px] -z-10"
        ></motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 w-full max-w-lg px-4"
      >
        <h1 className="font-plus-jakarta text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-md leading-tight">
          Your Future in <span className="text-primary italic">Nursing</span> Begins Here.
        </h1>
        <p className="font-inter text-on-surface-variant text-base md:text-lg mb-xl leading-relaxed max-w-md mx-auto">
          The all-in-one companion for GNM students. Master nursing with AI-powered tools and clinical precision.
        </p>

        <div className="space-y-md w-full max-w-xs mx-auto">
          <Link href="/dashboard">
            <button className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group active:scale-95 transition-all">
              Get Started
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] flex-1 bg-outline-variant opacity-30"></div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Empowering 10k+ Students</span>
            <div className="h-[1px] flex-1 bg-outline-variant opacity-30"></div>
          </div>
        </div>
      </motion.div>

      {/* Feature Pills */}
      <div className="mt-2xl flex flex-wrap justify-center gap-sm relative z-10">
        <FeaturePill icon={Heart} label="Clinical NCP" color="text-secondary" bg="bg-secondary/10" />
        <FeaturePill icon={Sparkles} label="AI Tutor" color="text-primary" bg="bg-primary/10" />
        <FeaturePill icon={BookOpen} label="Med Center" color="text-tertiary" bg="bg-tertiary/10" />
      </div>
    </div>
  );
}

function FeaturePill({ icon: Icon, label, color, bg }: { icon: any; label: string; color: string; bg: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={cn("flex items-center gap-2 px-md py-sm rounded-full bg-white shadow-sm border border-outline-variant/30", bg)}
    >
      <Icon className={cn("w-4 h-4", color)} />
      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface">{label}</span>
    </motion.div>
  );
}
