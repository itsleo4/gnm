"use client";

import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { motion } from "framer-motion";
import { 
  Dna, 
  Activity, 
  Brain, 
  Pill, 
  Users, 
  Stethoscope, 
  GraduationCap,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  { id: "anatomy", label: "Anatomy", icon: Dna, color: "bg-blue-500", progress: 65 },
  { id: "physiology", label: "Physiology", icon: Activity, color: "bg-red-500", progress: 40 },
  { id: "psychology", label: "Psychology", icon: Brain, color: "bg-purple-500", progress: 85 },
  { id: "pharmacology", label: "Pharmacology", icon: Pill, color: "bg-orange-500", progress: 20 },
  { id: "community", label: "Community Health", icon: Users, color: "bg-green-500", progress: 55 },
  { id: "msn", label: "Medical Surgical", icon: Stethoscope, color: "bg-cyan-500", progress: 30 },
];

export default function RevisionHub() {
  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopBar />
      
      <main className="container-responsive pt-24 space-y-lg">
        <section>
          <h1 className="font-plus-jakarta text-2xl md:text-3xl font-bold mb-xs">Revision Hub</h1>
          <p className="text-on-surface-variant text-sm font-medium">Select a subject to start your quick revision.</p>
        </section>

        <div className="grid grid-cols-1 gap-md">
          {SUBJECTS.map((sub, idx) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-md border border-outline-variant/30 shadow-md academic-card group active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-md">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", sub.color)}>
                  <sub.icon className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-plus-jakarta font-bold text-on-surface text-lg">{sub.label}</h3>
                    <span className="text-[10px] font-bold text-on-surface-variant italic">{sub.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={cn("h-full rounded-full", sub.color)}
                    />
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Action */}
        <section className="bg-primary p-lg rounded-2xl text-on-primary flex items-center justify-between shadow-xl shadow-primary/20 overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="font-plus-jakarta font-bold text-xl mb-1">Ready for an Exam?</h4>
            <p className="text-sm opacity-90">Take a full mock test now.</p>
          </div>
          <button className="bg-white text-primary px-lg py-sm rounded-xl font-bold text-sm z-10 active:scale-95 transition-transform">
            Static Mock
          </button>
          <GraduationCap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
