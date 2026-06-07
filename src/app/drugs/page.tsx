"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { Search, Bookmark, ArrowRight, Pill, Info, ClipboardCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const DRUGS = [
  {
    id: 1,
    name: "Amoxicillin",
    class: "Antibiotic",
    category: "Penicillins",
    indications: "Bacterial infections (ENT, UTI, Skin), H. pylori eradication.",
    considerations: "Assess for Penicillin allergy. Monitor for anaphylaxis and superinfection. Complete full course.",
    type: "Antibiotic"
  },
  {
    id: 2,
    name: "Paracetamol",
    class: "Analgesic",
    category: "Non-opioid",
    indications: "Mild to moderate pain, fever reduction (Antipyretic).",
    considerations: "Monitor liver function tests. Ensure max daily dose of 4g is not exceeded. Check OTC combinations.",
    type: "Analgesic"
  },
  {
    id: 3,
    name: "Metoprolol",
    class: "Antihypertensive",
    category: "Beta-Blocker",
    indications: "Hypertension, Angina, Heart Failure prevention.",
    considerations: "Monitor HR and BP before administration. Hold if HR < 60bpm. Watch for orthostatic hypotension.",
    type: "Antihypertensive"
  }
];

const FILTERS = ["All Classes", "Antibiotics", "Analgesics", "Antihypertensives", "Diuretics"];

export default function MedsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Classes");

  const filteredDrugs = DRUGS.filter(drug => {
    const matchesSearch = drug.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All Classes" || drug.class === activeFilter.slice(0, -1); // Simple logic
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopBar />
      
      <main className="container-responsive pt-24 space-y-lg">
        <section>
          <h1 className="font-plus-jakarta text-2xl md:text-3xl font-bold mb-xs">Medication Center</h1>
          <p className="text-on-surface-variant text-sm mb-md">Quick reference for nursing students.</p>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-outline" />
            </div>
            <input 
              type="text"
              placeholder="Search 5000+ Drugs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white border-none rounded-xl academic-card focus:ring-2 focus:ring-primary transition-all placeholder:text-outline text-sm font-medium"
            />
          </div>
        </section>

        {/* Filter Chips */}
        <section className="mb-lg -mx-md px-md overflow-x-auto scrollbar-hide flex gap-sm">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "whitespace-nowrap px-md py-2 rounded-full font-bold text-xs transition-all",
                activeFilter === filter 
                  ? "bg-primary text-on-primary shadow-md" 
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              {filter}
            </button>
          ))}
        </section>

        {/* Drug List */}
        <section className="space-y-md">
          <AnimatePresence mode="popLayout">
            {filteredDrugs.map((drug, index) => (
              <motion.div
                key={drug.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <DrugCard drug={drug} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {/* Study Tool Tip */}
        <section className="relative p-lg rounded-2xl overflow-hidden bg-primary-container text-on-primary-container mt-xl">
          <div className="relative z-10">
            <h4 className="font-plus-jakarta text-xl font-bold mb-xs">Quiz Yourself!</h4>
            <p className="text-sm opacity-90 mb-md">Test your knowledge on drug classifications and side effects.</p>
            <button className="bg-white text-primary px-lg py-2 rounded-full font-bold text-xs shadow-md active:scale-95 transition-transform">
              Start Daily Quiz
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-secondary/30 rounded-full blur-xl"></div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function DrugCard({ drug }: { drug: any }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant/30 shadow-md overflow-hidden active:scale-[0.98] transition-transform">
      <div className="p-md">
        <div className="flex justify-between items-start mb-sm">
          <div>
            <span className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
              drug.class === "Antibiotic" ? "bg-secondary-container/30 text-on-secondary-container" :
              drug.class === "Analgesic" ? "bg-tertiary-container/30 text-tertiary" :
              "bg-primary-container/30 text-primary"
            )}>
              {drug.class}
            </span>
            <h3 className="font-plus-jakarta text-xl font-bold text-on-surface mt-1">{drug.name}</h3>
          </div>
          <button className="text-outline hover:text-primary transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-sm">
          <div className="flex gap-sm">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-outline">Key Indications</p>
              <p className="text-sm text-on-surface-variant leading-snug">{drug.indications}</p>
            </div>
          </div>
          <div className="flex gap-sm border-l-2 border-secondary pl-sm py-1 bg-secondary-container/5 rounded-r-lg">
            <ClipboardCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-secondary">Nursing Considerations</p>
              <p className="text-sm text-on-surface-variant italic leading-snug">{drug.considerations}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-md py-3 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/30">
        <span className="text-[10px] font-bold text-outline">Category: {drug.category}</span>
        <button className="text-primary font-bold text-[10px] flex items-center gap-1">
          View Details <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
