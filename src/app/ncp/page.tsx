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
  FileText,
  ClipboardList
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
    
    // Detailed clinical prompt for Gemini 3.5 Flash
    const prompt = `You are a Senior Clinical Nursing Instructor. Create a professional, comprehensive Nursing Care Plan (NCP) assignment for:
    
    PATIENT PROFILE:
    - Initials: ${formData.patientInitials}
    - Age: ${formData.age} years
    - Gender: ${formData.gender}
    - Medical Diagnosis: ${formData.diagnosis}
    - Primary Complaint: ${formData.complaint}

    REQUIRED ASSIGNMENT STRUCUTRE:
    1. Introduction: Detailed overview of the pathophysiology of the diagnosed disease (${formData.diagnosis}).
    2. Nursing Assessment:
       - Subjective Data (Patient quotes, symptoms)
       - Objective Data (Vitals, physical findings, lab expectations)
    3. NANDA Nursing Diagnosis: (PES format: Problem + Etiology + Signs/Symptoms)
    4. SMART Goals: (Short-term and Long-term outcomes)
    5. Detailed Interventions Table:
       - Nursing Intervention
       - Scientific Rationale (Explain WHY based on physiology)
    6. Evaluation: Expected outcomes.

    USE PROFESSIONAL ACADEMIC TONE. Use Markdown tables for interventions.`;

    try {
      const response = await askAI(prompt);
      if (response.error) throw new Error(response.message);
      
      // Fix: response.text is guaranteed string from action, but we check just in case
      const finalText = response.text || "Report generation failed.";
      setAiReport(finalText);
      setIsGenerated(true);
      
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
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-2">
            <ClipboardList className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Academic Tool</span>
          </div>
          <h2 className="font-plus-jakarta text-3xl font-bold text-slate-900 tracking-tight">Assignment Generator</h2>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">Create detailed Nursing Care Plan assignments with professional pathophysiology reports.</p>
        </section>

        {/* Stepper */}
        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100">
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
                  step > s.id ? "bg-primary" : "bg-gray-100"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                <h3 className="font-bold text-lg text-slate-900 border-l-4 border-primary pl-3">Patient Intake</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Full Initials / Ward ID</label>
                    <input 
                      value={formData.patientInitials}
                      onChange={(e) => setFormData({...formData, patientInitials: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary h-14 text-sm font-bold" 
                      placeholder="e.g. SR-204-Med"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Age</label>
                      <input 
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary h-14 text-sm font-bold" 
                        placeholder="Years" type="number"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary h-14 text-sm font-bold"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                <h3 className="font-bold text-lg text-slate-900 border-l-4 border-primary pl-3">Presentation</h3>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chief Complaint / Notes</label>
                  <textarea 
                    value={formData.complaint}
                    onChange={(e) => setFormData({...formData, complaint: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-primary h-40 text-sm font-bold leading-relaxed shadow-inner" 
                    placeholder="Describe symptoms, vital signs, or patient history details..."
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                <h3 className="font-bold text-lg text-slate-900 border-l-4 border-primary pl-3">Diagnosis</h3>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Primary Medical Diagnosis</label>
                  <input 
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary h-14 text-sm font-bold ring-2 ring-primary/10" 
                    placeholder="e.g. Congestive Heart Failure"
                  />
                  <p className="text-[10px] text-slate-400 font-medium px-2">Gemini 3.5 Flash will generate the pathophysiology report for this disease.</p>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? "Analyzing Clinical Data..." : "Generate Professional Assignment"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-4 mt-10 p-2 bg-gray-50 rounded-2xl">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 font-bold text-slate-500 py-3 hover:bg-white rounded-xl transition-all shadow-sm">
                Back
              </button>
            )}
            {step < 3 && (
              <button 
                onClick={() => setStep(step + 1)} 
                disabled={step === 2 && !formData.complaint}
                className="flex-[2] bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-30"
              >
                Continue
              </button>
            )}
          </div>
        </div>

        {/* Result Area */}
        <AnimatePresence>
          {isGenerated && aiReport && (
            <motion.section id="ncp-result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h4 className="font-plus-jakarta text-2xl font-bold text-slate-900 tracking-tight">Assignment Draft</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Generated by Gemini 3.5 Flash</p>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-2 rounded-2xl border border-green-100 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Verified</span>
                </div>
              </div>
              
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-8 prose prose-sm max-w-none prose-slate prose-headings:font-plus-jakarta prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-relaxed prose-table:border prose-table:rounded-xl prose-table:overflow-hidden">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiReport}
                </ReactMarkdown>
              </div>

              <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-6 shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-all duration-700" />
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="text-center md:text-left">
                    <h5 className="text-lg font-bold">Academic Ready</h5>
                    <p className="text-[11px] text-white/50 font-medium tracking-wide">Professional pathophysiology report & NCP table ready for submission.</p>
                  </div>
                  <button className="md:ml-auto w-full md:w-auto bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                    Export PDF
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
