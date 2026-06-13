"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Brain, PenTool, 
  Layers, FileText, Share2, 
  ChevronRight, ArrowLeft, 
  Sparkles, Zap, Timer, 
  CheckCircle2, Menu, X,
  Download, Save, History,
  Edit3, List, HelpCircle,
  BarChart3, Plus, Maximize2,
  Stethoscope, GraduationCap, 
  ClipboardList, Info, 
  Settings, ChevronDown, ChevronUp,
  AlertTriangle, Lightbulb, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getTopicDetails, 
  updateTopicDetails, 
  generateTopicContent,
  evaluateRecallAnswer 
} from "@/app/actions/revision";

interface ChapterWorkspaceProps {
  topic: any;
  onBack: () => void;
}

export default function ChapterWorkspace({ topic, onBack }: ChapterWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("notes");
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [topic.id]);

  async function loadDetails() {
    setLoading(true);
    const data = await getTopicDetails(topic.id);
    setDetails(data);
    setLoading(false);
  }

  async function handleGenerate(type: any, options: any = {}) {
    setIsGenerating(true);
    try {
      await generateTopicContent(topic.id, topic.name, type, options);
      const data = await getTopicDetails(topic.id);
      setDetails(data);
    } catch (err) {
      alert("Odin AI 🫀 encountered a glitch. Please try again.");
    }
    setIsGenerating(false);
    setMenuOpen(false);
  }

  async function handleExplainQuestion(q: string) {
    setSelectedQuestion(q);
    setExplanation(null);
    setIsExplaining(true);
    try {
       const { askAI } = await import("@/app/actions/ai");
       const prompt = `Odin AI 🫀: Directly explain this nursing question with zero self-introduction or fluff. 
       Question: "${q}"
       Use professional headings and ADPIE framework if relevant. Start immediately with the answer.`;
       const res = await askAI(prompt);
       if (res.error) throw new Error(res.message);
       setExplanation(res.text);
    } catch (err) {
       setExplanation("Search failed. Odin 🫀 is offline.");
    }
    setIsExplaining(false);
  }

  const tabs = [
    { id: "notes", icon: BookOpen, label: "Detailed Notes" },
    { id: "builder", icon: PenTool, label: "Question Bank" },
    { id: "progressive", icon: Layers, label: "Compression" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; visibility: visible !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <header className="flex items-center justify-between mb-8 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-black text-[10px] hover:text-slate-900 transition-colors uppercase tracking-[0.2em]">
          <ArrowLeft className="w-4 h-4" /> Finalize Study
        </button>
        <button onClick={() => setMenuOpen(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
          <Menu className="w-4 h-4" /> Odin Tools 🫀
        </button>
      </header>

      <section className="mb-12 no-print">
         <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest">Odin AI Mastery 🫀</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{topic.name}</span>
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">by Nitin Kumar</span>
         </div>
         <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mt-4">{topic.name}</h1>
      </section>

      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar no-print">
         {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
               activeTab === tab.id ? "bg-primary text-white shadow-xl" : "bg-white text-slate-400 border border-slate-100 hover:border-slate-300"
             )}
           >
             <tab.icon className="w-4 h-4" /> {tab.label}
           </button>
         ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl min-h-[700px] relative overflow-hidden mb-12 print-area">
         <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-6">
            <h1 className="text-4xl font-black text-slate-900">{topic.name} - Official Revision Report</h1>
            <p className="text-xs font-bold text-slate-400 uppercase mt-2">Odin AI 🫀 | Developed by Nitin Kumar</p>
         </div>

         <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-8 md:p-16">
              <TabContent tab={activeTab} details={details} topicName={topic.name} onGenerate={handleGenerate} isGenerating={isGenerating} onExplain={handleExplainQuestion} />
            </motion.div>
         </AnimatePresence>

         <AnimatePresence>
            {selectedQuestion && (
              <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm no-print">
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[3rem] p-10 shadow-2xl overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Odin Logic 🫀</h3>
                       <button onClick={() => setSelectedQuestion(null)} className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-xl"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-xl font-black text-slate-900 leading-tight">"{selectedQuestion}"</h4>
                       {isExplaining ? <div className="space-y-4 py-8"><div className="h-4 w-full bg-slate-50 rounded-full animate-pulse" /><div className="h-4 w-3/4 bg-slate-50 rounded-full animate-pulse" /></div> : <div className="prose prose-slate max-w-none prose-p:text-base prose-strong:text-primary"><div className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed">{explanation}</div></div>}
                    </div>
                    {!isExplaining && <button onClick={() => setSelectedQuestion(null)} className="w-full py-4 mt-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Back to Study</button>}
                 </motion.div>
              </div>
            )}
         </AnimatePresence>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-4 left-4 right-4 z-[500] bg-white rounded-[3rem] p-8 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar no-print">
               <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
               <div className="space-y-10">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-2">Mastery Tools</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ToolItem icon={BookOpen} label="Generate Full Book" sub="16-section educator grade" onClick={() => handleGenerate('notes', { mode: 'detailed' })} />
                        <ToolItem icon={Zap} label="Quick Revision" sub="High-impact summary" onClick={() => handleGenerate('notes', { mode: 'quick' })} />
                        <ToolItem icon={GraduationCap} label="University Exam Focus" sub="15-mark long answers" onClick={() => handleGenerate('notes', { mode: 'exam' })} />
                        <ToolItem icon={Stethoscope} label="Clinical Case Study" sub="Scenario learning" onClick={() => handleGenerate('caseStudy')} />
                        <ToolItem icon={HelpCircle} label="Viva Questions" sub="Practical exam prep" onClick={() => handleGenerate('viva')} />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Personal Tools</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ToolItem icon={Download} label="Export Pro PDF" sub="Formatted Nursing Report" onClick={() => window.print()} />
                        <ToolItem icon={Info} label="About the Founder" sub="Meet Nitin Kumar" onClick={() => window.location.href='/profile'} />
                     </div>
                  </div>
               </div>
               <button onClick={() => setMenuOpen(false)} className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl mt-12 font-black text-[10px] uppercase tracking-widest">Close Tools</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolItem({ icon: Icon, label, sub, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 rounded-3xl transition-all group text-left border border-transparent hover:border-slate-100">
       <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all"><Icon className="w-5 h-5" /></div>
       <div><h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{label}</h4>{sub && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{sub}</p>}</div>
    </button>
  );
}

function TabContent({ tab, details, topicName, onGenerate, isGenerating, onExplain }: any) {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8 no-print">
        <div className="relative"><div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center"><Brain className="w-10 h-10 text-primary animate-pulse" /></div><div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        <div className="text-center space-y-2"><h3 className="text-2xl font-black text-slate-900">Odin 🫀 is Constructing...</h3><p className="text-sm text-slate-400 font-bold">Synchronizing with latest clinical standards.</p></div>
      </div>
    );
  }
  switch(tab) {
    case "notes": return <SmartNotesTab notes={details?.smart_notes} onGenerate={onGenerate} />;
    case "builder": return <RecallBuilderTab questions={details?.recall_questions} onGenerate={onGenerate} onExplain={onExplain} />;
    case "progressive": return <ProgressiveSummariesTab summaries={details?.summaries} onGenerate={onGenerate} />;
    default: return null;
  }
}

function SmartNotesTab({ notes, onGenerate }: any) {
  const [mode, setMode] = useState<"detailed" | "quick" | "exam">("detailed");
  if (!notes?.detailed && !notes?.quick && !notes?.exam) { return <EmptyState icon={BookOpen} title="Advanced Book Mode" desc="Generate 16-section educator notes built on latest medical standards." onGenerate={() => onGenerate('notes')} />; }
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar no-print">
        {[{ id: 'detailed', label: 'Advanced Book' }, { id: 'exam', label: 'University Level' }, { id: 'quick', label: 'Rapid Summary' }].map(m => (
          <button key={m.id} onClick={() => setMode(m.id as any)} className={cn("px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all", mode === m.id ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-400")}>{m.label}</button>
        ))}
      </div>
      <div className="prose prose-slate max-w-none prose-p:text-lg prose-p:leading-relaxed prose-headings:font-black prose-headings:text-slate-900 prose-blockquote:border-primary prose-strong:text-slate-900 prose-strong:font-black prose-ul:list-disc">
         <div className="whitespace-pre-wrap font-serif text-slate-800 leading-[1.8]">{notes[mode] || "Odin hasn't charted this yet. 🫀"}</div>
      </div>
    </div>
  );
}

function RecallBuilderTab({ questions, onGenerate, onExplain }: any) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'exam' | 'university'>('exam');
  const [loadingMore, setLoadingMore] = useState(false);
  if (!questions?.questions?.length) { return <EmptyState icon={PenTool} title="University Question Bank" desc="Generate multi-level exam questions curated by Odin AI 🫀." onGenerate={() => onGenerate('recall', { difficulty })} />; }
  return (
    <div className="space-y-12">
      <div className="flex gap-3 overflow-x-auto no-print">{(['easy', 'medium', 'exam', 'university'] as const).map(d => ( <button key={d} onClick={() => setDifficulty(d)} className={cn("px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all", difficulty === d ? "bg-primary text-white" : "bg-slate-50 text-slate-400")}>{d.toUpperCase()}</button> ))}</div>
      <div className="grid gap-4">{questions.questions.map((q: string, i: number) => ( <div key={i} onClick={() => onExplain(q)} className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all flex items-start justify-between gap-6 cursor-pointer"><div className="flex gap-6"><span className="text-xl font-black text-slate-200">{i + 1}</span><p className="text-xl font-bold text-slate-800">{q}</p></div><div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all"><HelpCircle className="w-5 h-5" /></div></div> ))}</div>
      <button disabled={loadingMore} onClick={async () => { setLoadingMore(true); await onGenerate('recall', { difficulty }); setLoadingMore(false); }} className="w-full py-6 border-4 border-dashed border-slate-100 text-slate-300 rounded-[2.5rem] font-black text-xs uppercase tracking-widest no-print">{loadingMore ? "Seeking Knowledge..." : "Append More Questions"}</button>
    </div>
  );
}

function ProgressiveSummariesTab({ summaries, onGenerate }: any) {
  const [level, setLevel] = useState<"level1" | "level2" | "level3">("level2");
  if (!summaries?.level2) { return <EmptyState icon={Layers} title="Concept Compression" desc="Scientifically compress notes into essential memory blocks." onGenerate={() => onGenerate('summaries')} />; }
  return (
    <div className="space-y-12">
       <div className="flex gap-4 no-print overflow-x-auto pb-4">{(["level1", "level2", "level3"] as const).map(l => ( <button key={l} onClick={() => setLevel(l)} className={cn("px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all", level === l ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400")}>{l.toUpperCase()}</button> ))}</div>
       <div className="p-16 bg-slate-50 rounded-[4rem] border border-slate-100 italic text-xl font-bold font-serif text-slate-700 leading-relaxed whitespace-pre-wrap">{summaries[level]}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, onGenerate }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center no-print">
       <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border border-slate-100 shadow-inner"><Icon className="w-10 h-10" /></div>
       <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
       <p className="text-lg text-slate-400 font-bold max-w-sm mb-12 leading-relaxed">{desc}</p>
       <button onClick={onGenerate} className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-4 group"><Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Activate Odin AI 🫀</button>
    </div>
  );
}
