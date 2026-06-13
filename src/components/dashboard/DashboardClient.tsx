"use client";

import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { motion } from "framer-motion";
import { Flame, Brain, BookOpen, ClipboardList, ChevronRight, Sparkles, Activity, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DashboardClient({ profile, stats, revisionStats }: { profile: any; stats: any; revisionStats: any }) {
  const goal = stats?.current_goal || 'Complete your first lesson';
  const streak = profile?.streak ?? 0;
  
  // Real scientific progress from revision system
  const readiness = revisionStats?.readiness ?? 0;
  const dueToday = revisionStats?.dueToday ?? 0;
  const mastered = revisionStats?.mastered ?? 0;
  const total = revisionStats?.totalTopics ?? 0;

  return (
    <div className="min-h-screen bg-[#faf8ff] pb-32">
      <TopBar />

      <main className="mx-auto max-w-2xl px-4 pt-24 space-y-6">

        {/* Welcome Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6 bg-primary text-white shadow-xl shadow-primary/20"
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Learning Goal</p>
                <h2 className="font-bold text-xl leading-snug max-w-[200px]">{goal}</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 shrink-0">
                <Flame className="w-4 h-4 fill-orange-300 text-orange-300" />
                <span className="text-sm font-bold">{streak}d</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span>Exam Readiness</span>
                <span>{readiness}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${readiness}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                  className="bg-white h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2"
          >
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <motion.circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke="#004ac6" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="213.6"
                  initial={{ strokeDashoffset: 213.6 }}
                  animate={{ strokeDashoffset: 213.6 * (1 - readiness / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">{readiness}%</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-500 text-center">Learning Progress</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full">Flashcards</span>
            </div>
            <div className="mt-4">
              <h4 className="text-3xl font-bold text-on-surface">{mastered}/{total}</h4>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">Mastered Topics</p>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <h3 className="font-bold text-on-surface px-1">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              href="/ncp"
              icon={ClipboardList}
              label="NCP Generator"
              description="Create nursing care plans"
              colorClass="bg-primary/10"
              iconColor="text-primary"
            />
            <QuickActionCard
              href="/revision"
              icon={BookOpen}
              label="Revision Hub"
              description="Study flashcards & quizzes"
              colorClass="bg-secondary/10"
              iconColor="text-secondary"
            />
            <QuickActionCard
              href="/assistant"
              icon={Sparkles}
              label="AI Assistant"
              description="Ask nursing questions"
              colorClass="bg-tertiary/10"
              iconColor="text-tertiary"
            />
            <QuickActionCard
              href="/drugs"
              icon={Activity}
              label="Drug Library"
              description="Medication reference"
              colorClass="bg-primary/10"
              iconColor="text-primary"
            />
          </div>
        </motion.section>

        {/* Profile Reminder for new users */}
        {!profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3"
          >
            <GraduationCap className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">Complete your profile</p>
              <p className="text-xs text-amber-600 mt-0.5">Add your college and year to personalize your experience.</p>
            </div>
          </motion.div>
        )}

      </main>

      <BottomNav />
    </div>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  label,
  description,
  colorClass,
  iconColor,
}: {
  href: string;
  icon: any;
  label: string;
  description: string;
  colorClass: string;
  iconColor: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer h-full">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", colorClass)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <p className="font-bold text-sm text-on-surface">{label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{description}</p>
      </div>
    </Link>
  );
}
