"use client";

import { Bell, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TopBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
      <div className="container-responsive h-16 flex justify-between items-center">
        <div className="flex items-center gap-md">
          <Link href="/profile" className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container overflow-hidden academic-card">
            <User className="w-5 h-5" />
          </Link>
        <div className="flex flex-col">
          <span className="font-plus-jakarta text-lg md:text-xl font-black text-slate-900 tracking-tight">
            GNM Companion
          </span>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-[-2px]">
            by Nitin Kumar
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
      </div>
      </div>
    </header>
  );
}
