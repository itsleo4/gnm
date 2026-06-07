"use client";

import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { motion } from "framer-motion";
import { Flame, Brain, BookOpen, Clock, ChevronRight, Plus, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardClient({ profile, stats }: { profile: any, stats: any }) {
  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopBar />
      
      <main className="container-responsive pt-24 space-y-lg">
        {/* Hero Section: Glassmorphic Learning Goal */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-hero rounded-2xl p-md md:p-lg text-on-primary relative overflow-hidden academic-card"
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-md">
              <div>
                <p className="font-inter text-[10px] uppercase tracking-wider mb-1 opacity-90">Current Learning Goal</p>
                <h2 className="font-plus-jakarta text-2xl font-bold leading-tight line-clamp-2">
                  {stats?.current_goal || "Advanced Maternal-Newborn Nursing"}
                </h2>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-white" />
                <span className="font-inter text-xs font-bold text-white">{profile?.streak || 0} Days</span>
              </div>
            </div>
            
            <div className="mt-lg">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Weekly Progress</span>
                <span>{stats?.weekly_progress || 0}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.weekly_progress || 0}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="bg-secondary-container h-2 rounded-full"
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-md">
          {/* Syllabus Coverage */}
          <div className="bg-white p-md rounded-lg academic-card flex flex-col items-center justify-center text-center">
            <div className="relative w-20 h-20 mb-sm">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-highest" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6"></circle>
                <motion.circle 
                  initial={{ strokeDashoffset: 213.6 }}
                  animate={{ strokeDashoffset: 213.6 * (1 - (stats?.syllabus_coverage || 0) / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="40" cy="40" fill="transparent" r="34" stroke="#14B8A6" strokeDasharray="213.6" strokeLinecap="round" strokeWidth="6"
                ></motion.circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-plus-jakarta text-primary font-bold text-lg">{stats?.syllabus_coverage || 0}%</span>
              </div>
            </div>
            <p className="font-inter text-xs text-on-surface-variant font-medium">Syllabus Covered</p>
          </div>

          {/* Flashcards */}
          <div className="bg-white p-md rounded-lg academic-card flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Brain className="w-6 h-6 text-secondary" />
              <span className="text-[10px] font-bold text-secondary bg-secondary-container/30 px-2 py-0.5 rounded-full">+12 today</span>
            </div>
            <div className="mt-2">
              <h4 className="font-plus-jakarta text-2xl font-bold text-primary">{stats?.mastered_flashcards || 0}</h4>
              <p className="font-inter text-xs text-on-surface-variant font-medium">Mastered Cards</p>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <section className="bg-white p-md rounded-lg academic-card">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-plus-jakarta font-bold text-on-surface">Recent Notes</h3>
            <button className="text-primary font-bold text-xs">View All</button>
          </div>
          <div className="space-y-sm">
            <NoteItem title="Pharmacology: Beta Blockers" time="Edited 2h ago" type="med" />
            <NoteItem title="NCP for Type 2 Diabetes" time="Edited Yesterday" type="note" />
          </div>
        </section>

        {/* Quick Revision Hub */}
        <section className="space-y-sm">
          <h3 className="font-plus-jakarta font-bold text-on-surface px-xs">Quick Revision Hub</h3>
          <div className="grid grid-cols-2 gap-sm">
            <RevisionButton icon={Brain} label="Daily Quiz" color="primary" />
            <RevisionButton icon={BookOpen} label="Case Studies" color="secondary" />
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function NoteItem({ title, time, type }: { title: string; time: string; type: "med" | "note" }) {
  return (
    <div className="flex items-center gap-md p-sm hover:bg-surface-container-low rounded-md transition-colors border border-transparent hover:border-outline-variant cursor-pointer group">
      <div className={cn(
        "w-10 h-10 rounded flex items-center justify-center shrink-0",
        type === "med" ? "bg-tertiary-container/20 text-tertiary" : "bg-primary-container/20 text-primary"
      )}>
        <ClipboardList className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{title}</p>
        <p className="text-[10px] text-on-surface-variant">{time}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" />
    </div>
  );
}

function RevisionButton({ icon: Icon, label, color }: { icon: any; label: string; color: "primary" | "secondary" }) {
  return (
    <button className="bg-surface-container flex items-center gap-sm p-md rounded-lg active:scale-95 transition-transform text-left border border-outline-variant/30 flex-1">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary")}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-inter font-semibold text-on-surface text-sm">{label}</span>
    </button>
  );
}
