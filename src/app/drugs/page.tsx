"use client";

import { useState, useRef, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { 
  Search, Bookmark, ArrowLeft, Pill, Info, 
  Sparkles, MessageSquare, 
  GraduationCap, RefreshCw,
  Zap, Camera, Loader2, X,
  ChevronRight, BookmarkCheck, Heart,
  AlertTriangle, Stethoscope, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  searchDrugs, 
  getDrugEducation, 
  saveDrug, 
  getSavedDrugs, 
  deleteSavedDrug,
  isDrugSaved 
} from "@/app/actions/drugs";
import { identifyMedicineFromImage } from "@/app/actions/vision";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";

export default function MedsPage() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedList, setSavedList] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  
  // RxNorm Real-time Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchDrugs(search);
        setSuggestions(results || []);
        setIsSearching(false);
      } else {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (showSaved) loadSavedList();
  }, [showSaved]);

  const loadSavedList = async () => {
    setIsRefreshing(true);
    const data = await getSavedDrugs();
    setSavedList(data);
    setIsRefreshing(false);
  };

  const handleSelectDrug = async (drug: any) => {
    setSearch("");
    setSuggestions([]);
    setIsGenerating(true);
    
    try {
      const data = await getDrugEducation(drug.rxcui, drug.name);
      // Check saved status safely
      try {
        const savedStatus = await isDrugSaved(drug.rxcui);
        setIsSaved(savedStatus);
      } catch (e) {
        setIsSaved(false);
      }
      setSelectedDrug(data);
    } catch (e) {
      alert("Failed to generate medication report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      <TopBar />
      
      <main className="container-responsive pt-24 px-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!selectedDrug ? (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <section className="mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-4">
                  <Heart className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Odin Pharmacology Engine 🫀</span>
                </div>
                <h1 className="font-plus-jakarta text-3xl font-bold text-slate-900 tracking-tight leading-tight">Medication OS</h1>
                <p className="text-sm text-slate-500 font-medium mt-2">Professional nursing drug database powered by RxNorm.</p>
              </section>

              <div className="relative mb-6 group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  {isSearching ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />}
                </div>
                <input 
                  type="text"
                  placeholder="Seach generic or brand (e.g Serta, Emset)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-16 pl-12 pr-16 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                />
                <button 
                  onClick={() => setIsVisionOpen(true)}
                  className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary active:scale-90 transition-all flex items-center justify-center p-0"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* RxNorm Suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden mb-8 z-20 relative">
                    <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-blue-500" />
                       <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Global Pharma Index</span>
                    </div>
                    {suggestions.map((drug, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSelectDrug(drug)}
                        className="w-full text-left px-6 py-4 hover:bg-primary/5 transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{drug.name}</span>
                          {drug.synonym && <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{drug.synonym}</span>}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No Results Fallback */}
              {search.trim().length > 3 && suggestions.length === 0 && !isSearching && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-10 rounded-[3rem] border border-gray-100 text-center shadow-lg mb-8">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-orange-500 animate-pulse" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Odin Deep Intelligence</h4>
                  <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">No exact database match found for "{search}". Odin AI can still generate an accurate pharmacological guide for you.</p>
                  <button 
                    onClick={() => handleSelectDrug({ rxcui: `AI_${search}`, name: search })}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Generate with Odin AI 🫀
                  </button>
                </motion.div>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                 <FeatureCard icon={BookmarkCheck} label="Clinical Registry" sub="View saved meds" onClick={() => setShowSaved(true)} />
                 <FeatureCard icon={GraduationCap} label="Med Study Room" sub="Start Med Viva" onClick={() => alert("Select a drug to start viva session.")} />
              </div>

              {showSaved && (
                <div className="fixed inset-0 z-[150] bg-[#fafafa] pt-24 px-4 overflow-y-auto pb-32 no-scrollbar">
                  <div className="container-responsive max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                       <button onClick={() => setShowSaved(false)} className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm active:scale-90 transition-all">
                          <ArrowLeft className="w-5 h-5 text-slate-900" />
                       </button>
                       <h2 className="text-xl font-bold font-plus-jakarta">Clinical Registry</h2>
                       <button onClick={loadSavedList} className={cn("p-2 rounded-full", isRefreshing && "animate-spin")}>
                          <RefreshCw className="w-5 h-5 text-slate-300" />
                       </button>
                    </div>

                    {savedList.length === 0 && !isRefreshing ? (
                      <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Bookmark className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-xl">Empty Registry</h3>
                        <p className="text-sm text-slate-500 mt-2">Saved medications will appear here for clinical reference.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                         {savedList.map((item) => (
                           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group" whileHover={{ scale: 1.01 }}>
                              <button 
                                onClick={() => {
                                  setSelectedDrug({ name: item.drug_name, rxcui: item.rxcui, content: item.content });
                                  setIsSaved(true);
                                  setShowSaved(false);
                                }}
                                className="flex-1 text-left"
                              >
                                 <h4 className="font-bold text-slate-900 text-lg mb-1 leading-tight">{item.drug_name}</h4>
                                 <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Stored in Local Vault</p>
                                 </div>
                              </button>
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if(confirm("Remove from registry?")){
                                    await deleteSavedDrug(item.id);
                                    loadSavedList();
                                  }
                                }}
                                className="w-12 h-12 rounded-2xl hover:bg-red-50 text-slate-200 hover:text-red-500 transition-all flex items-center justify-center p-0"
                              >
                                 <X className="w-5 h-5" />
                              </button>
                           </motion.div>
                         ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <DrugDetailsView 
              drug={selectedDrug} 
              isSaved={isSaved}
              setIsSaved={setIsSaved}
              onBack={() => setSelectedDrug(null)} 
              router={router}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isGenerating && (
          <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-xl flex items-center justify-center p-8">
            <div className="text-center">
               <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Pill className="w-10 h-10 text-primary animate-bounce" />
                  <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2">Synthesizing Pharmacology</h3>
               <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Odin 🫀 is charting clinical findings.</p>
            </div>
          </div>
        )}
      </AnimatePresence>

      <VisionModal isOpen={isVisionOpen} onClose={() => setIsVisionOpen(false)} onIdentified={(name) => handleSelectDrug({ rxcui: `VIS_${Date.now()}`, name })} />
      <BottomNav />
    </div>
  );
}

function FeatureCard({ icon: Icon, label, sub, onClick }: any) {
  return (
    <button onClick={onClick} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm text-center active:scale-95 transition-all">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary shadow-inner">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest mb-1">{label}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{sub}</p>
    </button>
  );
}

function DrugDetailsView({ drug, onBack, isSaved, setIsSaved, router }: any) {
  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        alert("Medication is already in your registry.");
      } else {
        await saveDrug(drug.name, drug.rxcui, drug.content);
        setIsSaved(true);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleAskAI = () => {
     const prompt = encodeURIComponent(`Odin AI 🫀: Tell me everything important about ${drug.name} for clinical practice and exams. Focus on nursing responsibilities and university marking points.`);
     router.push(`/assistant?prompt=${prompt}`);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-32">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Med Index
        </button>
        <button onClick={handleSaveToggle} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all active:scale-90", isSaved ? "bg-primary text-white" : "bg-white text-slate-300 border border-gray-100")}>
          <BookmarkCheck className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-10 border-b border-gray-50 bg-slate-50/20">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Verified Pharmacology Reference</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">💊 {drug.name}</h2>
           <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-relaxed">Reference Hub Study</p>
        </div>

        <div className="p-10 md:p-14 drug-report-enhanced">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>{drug.content}</ReactMarkdown>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
         <button onClick={handleAskAI} className="w-full p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl flex items-center gap-6 group hover:scale-[1.02] transition-all">
            <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center border border-white/5 transition-transform group-hover:rotate-12">
               <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 text-left">
               <h4 className="font-black text-lg tracking-tight">Ask AI Tutor about this Med</h4>
               <p className="text-xs text-white/40 font-medium">Get deep clinical answers regarding interactions or dosing.</p>
            </div>
            <ChevronRight className="w-6 h-6 text-white/20" />
         </button>
      </div>

      <style jsx global>{`
        .drug-report-enhanced h1, .drug-report-enhanced h2 { display: none; }
        .drug-report-enhanced h3 { 
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 900;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #0c4aae;
          margin-top: 3.5rem;
          margin-bottom: 1.5rem;
          background: #eff6ff;
          padding: 10px 20px;
          border-radius: 12px;
          display: inline-block;
          border-left: 4px solid #0c4aae;
        }
        .drug-report-enhanced h3:first-of-type { margin-top: 0; }
        .drug-report-enhanced p { font-size: 16px; line-height: 1.8; color: #1e293b; font-weight: 500; margin-bottom: 24px; }
        .drug-report-enhanced ul { list-style-type: none; padding-left: 0; margin-bottom: 2rem; }
        .drug-report-enhanced li { font-size: 14px; margin-bottom: 14px; padding: 16px 20px; background: #fdfdfd; border: 1px solid #f1f5f9; border-radius: 18px; color: #334155; font-weight: 600; display: flex; align-items: flex-start; gap: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        .drug-report-enhanced li::before { content: "•"; color: #0c4aae; font-size: 24px; line-height: 1; font-weight: 900; }
        .drug-report-enhanced strong { color: #0f172a; font-weight: 900; }
      `}</style>
    </motion.div>
  );
}

function VisionModal({ isOpen, onClose, onIdentified }: { isOpen: boolean, onClose: () => void, onIdentified: (name: string) => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await identifyMedicineFromImage(base64);
      if (res.name) {
        onIdentified(res.name);
        onClose();
      } else {
        alert("Medicine not clearly detected. Try another photo.");
      }
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-[500px] rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
      >
        <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
           <X className="w-5 h-5" />
        </button>

        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 text-primary shadow-inner">
           <Camera className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">Odin Vision 🫀</h3>
        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-10">Instant Medicine Identification</p>
        
        <div className="grid grid-cols-1 gap-4 w-full">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
           >
              <Loader2 className={cn("w-5 h-5", !isProcessing && "hidden animate-spin")} />
              {isProcessing ? "Identifying..." : "Scan Medical Label"}
           </button>
           <button onClick={onClose} className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">Back to Search</button>
        </div>
        
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />
        
        {isProcessing && (
           <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-10">
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
              <p className="text-xl font-black text-slate-900">Identifying Medication...</p>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">Cross-referencing Global Indices</p>
           </div>
        )}
      </motion.div>
    </div>
  );
}
