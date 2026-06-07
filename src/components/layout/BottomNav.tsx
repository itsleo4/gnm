"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Pill, ClipboardList, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Meds", href: "/drugs", icon: Pill },
  { label: "Care Plan", href: "/ncp", icon: ClipboardList },
  { label: "AI Tutor", href: "/assistant", icon: Bot },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-xl bg-surface shadow-[0_-4px_20px_rgba(15,23,42,0.05)] border-t border-outline-variant/10">
      <div className="container-responsive flex justify-around items-center h-20">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-150 active:scale-90 flex-1",
                isActive 
                  ? "text-primary" 
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-colors",
                isActive ? "bg-primary/10" : "bg-transparent"
              )}>
                <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
              </div>
              <span className={cn(
                "font-inter text-[10px] mt-1 font-bold uppercase tracking-wider",
                isActive ? "opacity-100" : "opacity-60"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
