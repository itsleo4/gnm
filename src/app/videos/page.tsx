"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { Play, Search, GraduationCap, Heart, FlaskConical, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "anatomy", label: "Anatomy", icon: FlaskConical },
  { id: "procedures", label: "Procedures", icon: Heart },
  { id: "pharma", label: "Pharmacology", icon: GraduationCap },
  { id: "psych", label: "Psychology", icon: BrainCircuit },
];

const VIDEOS = [
  {
    id: "1",
    title: "Understanding Cardiovascular System",
    subject: "Anatomy",
    thumbnail: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop",
    duration: "15:20",
    ytId: "vH_D_vYI1_k"
  },
  {
    id: "2",
    title: "How to perform IV Cannulation",
    subject: "Procedures",
    thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
    duration: "08:45",
    ytId: "example2"
  },
  {
    id: "3",
    title: "Mechanism of Beta Blockers",
    subject: "Pharmacology",
    thumbnail: "https://images.unsplash.com/photo-1471864190281-ad5fe9bbef72?q=80&w=800&auto=format&fit=crop",
    duration: "10:30",
    ytId: "example3"
  }
];

export default function VideoHub() {
  const [activeCategory, setActiveCategory] = useState("anatomy");

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopBar />
      
      <main className="pt-24 px-md space-y-lg">
        <section>
          <h1 className="font-plus-jakarta text-3xl font-bold mb-sm">Video Learning</h1>
          <p className="text-on-surface-variant text-sm mb-md">Master complex procedures and anatomy through video.</p>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-outline" />
            </div>
            <input 
              placeholder="Search lectures..."
              className="w-full h-12 pl-12 pr-4 bg-white border-none rounded-xl academic-card focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
            />
          </div>
        </section>

        {/* Categories Horizontal Scroll */}
        <section className="-mx-md px-md flex gap-md overflow-x-auto scrollbar-hide py-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-md min-w-[80px] rounded-2xl transition-all active:scale-95",
                activeCategory === cat.id 
                  ? "bg-primary text-on-primary shadow-lg" 
                  : "bg-white text-on-surface-variant border border-outline-variant/30"
              )}
            >
              <cat.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{cat.label}</span>
            </button>
          ))}
        </section>

        {/* Video Grid */}
        <section className="space-y-lg">
          <h3 className="font-plus-jakarta font-bold text-on-surface">Recommended for You</h3>
          <div className="space-y-md">
            {VIDEOS.map((video) => (
              <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-md academic-card group active:scale-[0.98] transition-transform">
                <div className="relative aspect-video">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl group-hover:bg-primary group-hover:border-primary transition-colors">
                      <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-bold font-mono">
                    {video.duration}
                  </div>
                </div>
                <div className="p-md">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{video.subject}</span>
                  <h4 className="font-plus-jakarta font-bold text-on-surface mt-1 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
