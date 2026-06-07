"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Stethoscope, 
  Activity, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Loader2,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askAI } from "@/app/actions/ai";

const STEPS = [
  { id: 1, label: "Assess", icon: UserPlus },
  { id: 2, label: "Diagnose", icon: Stethoscope },
  { id: 3, label: "Plan", icon: Activity },
];

export default function NCPPage() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientInitials: "",
    age: "",
    gender: "",
    complaint: "",
    diagnosis: "",
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const prompt = `You are a clinical nursing instructor. Create a professional Nursing Care Plan (NCP) for:
    Patient: ${formData.patientInitials} (${formData.age}y, ${formData.gender})
    Complaint: ${formData.complaint}
    Initial Diagnosis: ${formData.diagnosis}

    Please provide:
    1. Assessment (Subjective & Objective Data)
    2. Nursing Diagnosis (NANDA format)
    3. Goals/Outcomes (SMART format)
    4. 3-5 Nursing Interventions with Rationales
    5. Evaluation Criteria

    Use Markdown tables and bullet points.`;

    try {
      const response = await askAI(prompt);
      if (response.error) throw new Error(response.message);
      setAiReport(response.text);
      setIsGenerated(true);
      
      // Smooth scroll to result
      setTimeout(() => {
        const target = document.getElementById("ncp-result");
        target?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (error: any) {
      alert("Error: " + (error.message || "Failed to generate NCP"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-44">
      <TopBar />
      
      <main className="container-responsive pt-24 space-y-lg px-4 max-w-2xl mx-auto">
        <section className="space-y-sm text-center">
          <h2 className="font-plus-jakarta text-3xl font-bold text-slate-900 tracking-tight">AI NCP Generator</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Instant clinical care plans for your nursing assignments.</p>
        </section>

        {/* Stepper */}
        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300",
                step < s.id ? "opacity-30 scale-90" : "opacity-100 scale-100"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-md",
                  step >= s.id ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                )}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "h-[2px] flex-1 mx-4 rounded-full",
                  step > s.id ? "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" : "bg-gray-100"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Patient Initials</label>
                    <input 
                      value={formData.patientInitials}
                      onChange={(e) => setFormData({...formData, patientInitials: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary h-14 text-sm font-bold" 
                      placeholder="e.g. MK-12"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Age</label>
                      <input 
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary h-14 text-sm font-bold" 
                        placeholder="28" type="number"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary h-14 text-sm font-bold"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chief Complaint</label>
                  <textarea 
                    value={formData.complaint}
                    onChange={(e) => setFormData({...formData, complaint: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary h-32 text-sm font-bold" 
                    placeholder="Briefly describe why the patient was admitted..."
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Medical Diagnosis</label>
                  <input 
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary h-14 text-sm font-bold" 
                    placeholder="e.g. Acute Myocardial Infarction"
                  />
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? "Crafting Your Plan..." : "Generate Pro NCP"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-4 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 font-bold text-slate-400 py-4 hover:bg-gray-50 rounded-xl transition-all">
                Back
              </button>
            )}
            {step < 3 && (
              <button onClick={() => setStep(step + 1)} className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all">
                Next Step
              </button>
            )}
          </div>
        </div>

        {/* Result Area */}
        <AnimatePresence>
          {isGenerated && aiReport && (
            <motion.section id="ncp-result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-plus-jakarta text-xl font-bold text-slate-900">Clinical Draft</h4>
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Ready</span>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 prose prose-sm max-w-none prose-slate">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiReport}
                </ReactMarkdown>
              </div>

              <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[13px] font-bold">Ready to Export?</h5>
                    <p className="text-[10px] text-white/50">Print or Save as PDF</p>
                  </div>
                  <button className="ml-auto bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all">
                    Export
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
