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
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Assess", icon: UserPlus },
  { id: 2, label: "Diagnose", icon: Stethoscope },
  { id: 3, label: "Plan", icon: Activity },
];

import { askAI } from "@/app/actions/ai";

export default function NCPPage() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  const [formData, setFormData] = useState({
    patientInitials: "",
    age: "",
    gender: "",
    complaint: "",
    temp: "",
    bp: "",
    nanda: "",
    goals: "",
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const prompt = `Generate a Nursing Care Plan (NCP) for a patient with:
    Initials: ${formData.patientInitials}
    Age: ${formData.age}
    Gender: ${formData.gender}
    Chief Complaint: ${formData.complaint}
    NANDA Diagnosis: ${formData.nanda}
    Provide subjective data, objective data, and 3 interventions.`;

    try {
      const response = await askAI(prompt, true); // Use OpenAI for complex medical logic
      setAiReport(response);
      setIsGenerated(true);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error("NCP Gen Error", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopBar />
      
      <main className="container-responsive pt-24 space-y-lg">
        <section className="space-y-sm">
          <div className="flex flex-col gap-xs">
            <h2 className="font-plus-jakarta text-2xl md:text-3xl font-bold text-on-surface">NCP Generator</h2>
            <p className="text-sm text-on-surface-variant font-medium">Create professional Nursing Care Plans in seconds with AI.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between px-4 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex flex-1 items-center">
                <div className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  step < s.id ? "opacity-40" : "opacity-100"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                    step >= s.id ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
                  )}>
                    {s.id}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    step >= s.id ? "text-primary" : "text-on-surface-variant"
                  )}>{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn(
                    "h-[2px] flex-1 mx-2 transition-colors duration-300",
                    step > s.id ? "bg-primary" : "bg-outline-variant"
                  )}></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Form Container */}
        <section className="relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-md"
              >
                <div className="bg-white rounded-xl p-md academic-card">
                  <h3 className="font-bold text-sm text-primary mb-md flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> Patient Details
                  </h3>
                  <div className="space-y-md">
                    <div className="space-y-xs">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Patient Initials / Ward ID</label>
                      <input 
                        className="w-full bg-surface-container-low border-none rounded-lg p-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium" 
                        placeholder="e.g. JK-102"
                        value={formData.patientInitials}
                        onChange={(e) => setFormData({...formData, patientInitials: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-md">
                      <div className="space-y-xs">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Age</label>
                        <input 
                          className="w-full bg-surface-container-low border-none rounded-lg p-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium" 
                          placeholder="45"
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({...formData, age: e.target.value})}
                        />
                      </div>
                      <div className="space-y-xs">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Gender</label>
                        <select 
                          className="w-full bg-surface-container-low border-none rounded-lg p-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Chief Complaint</label>
                      <textarea 
                        className="w-full bg-surface-container-low border-none rounded-lg p-md focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium" 
                        placeholder="Describe the patient's primary symptoms..."
                        rows={3}
                        value={formData.complaint}
                        onChange={(e) => setFormData({...formData, complaint: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-md"
              >
                <div className="bg-white rounded-xl p-md academic-card">
                  <h3 className="font-bold text-sm text-primary mb-md flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" /> Clinical Data
                  </h3>
                  <div className="space-y-md">
                    <div className="grid grid-cols-2 gap-md">
                      <div className="space-y-xs">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Temp (°C)</label>
                        <input className="w-full bg-surface-container-low border-none rounded-lg p-md focus:ring-2 focus:ring-primary text-sm font-medium" placeholder="37.5" />
                      </div>
                      <div className="space-y-xs">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">BP (mmHg)</label>
                        <input className="w-full bg-surface-container-low border-none rounded-lg p-md focus:ring-2 focus:ring-primary text-sm font-medium" placeholder="120/80" />
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Primary Diagnosis (NANDA if known)</label>
                      <input className="w-full bg-surface-container-low border-none rounded-lg p-md focus:ring-2 focus:ring-primary text-sm font-medium" placeholder="Acute Pain related to surgery..." />
                    </div>
                    <div className="p-md bg-secondary-container/10 border border-secondary/20 rounded-xl flex items-start gap-3">
                      <Info className="w-5 h-5 text-secondary shrink-0" />
                      <p className="text-xs text-on-secondary-container leading-relaxed">
                        Our AI will suggest Nursing Diagnoses based on the assessment data in the next step.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-md"
              >
                <div className="bg-white rounded-xl p-md academic-card">
                  <h3 className="font-bold text-sm text-primary mb-md flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Desired Outcomes
                  </h3>
                  <div className="space-y-md">
                    <div className="space-y-xs">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">SMART Goals</label>
                      <textarea 
                        className="w-full bg-surface-container-low border-none rounded-lg p-md focus:ring-2 focus:ring-primary text-sm font-medium" 
                        placeholder="Patient will report pain level <3 within 4 hours..." 
                        rows={4}
                      />
                    </div>
                    
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate AI NCP
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-md">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="font-bold text-on-surface-variant px-lg py-md rounded-xl hover:bg-surface-container-high transition-colors flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < 3 && (
            <button 
              onClick={() => setStep(step + 1)}
              className="ml-auto w-full bg-primary text-on-primary font-bold px-lg py-md rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* AI Result Area */}
        <AnimatePresence>
          {isGenerated && (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-xl pb-10 space-y-md"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-plus-jakarta text-xl font-bold text-on-surface">Preview Plan</h4>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Academic Draft
                </span>
              </div>
              
              <div className="space-y-lg">
                <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant/30 shadow-lg academic-card">
                  <div className="bg-primary/5 p-md border-b border-outline-variant/30 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h5 className="font-bold text-sm text-primary">Generated Nursing Care Plan</h5>
                  </div>
                  <div className="p-md whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant font-medium">
                    {aiReport}
                  </div>
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
