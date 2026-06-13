"use client";

import { useState, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Stethoscope, 
  Users, 
  Heart, 
  Home,
  Sparkles, 
  CheckCircle2, 
  Loader2,
  FileText,
  ClipboardList,
  Printer,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askAI } from "@/app/actions/ai";
import { initialFormData, NCPFormData, STEPS } from "@/components/ncp/types";

export default function NCPPage() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [formData, setFormData] = useState<NCPFormData>(initialFormData);
  const reportRef = useRef<HTMLDivElement>(null);

  const updateField = (field: keyof NCPFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { name: "", age: "", gender: "", relation: "", occupation: "", healthStatus: "" }]
    }));
  };

  const removeFamilyMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index)
    }));
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updated = [...prev.familyMembers];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, familyMembers: updated };
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const prompt = `Senior Nursing Educator: Create a concise, professional 12-section NCP Package for a GNM student assignment.
Student Input: ${JSON.stringify(formData)}

Sections:
1. Profile: Brief table.
2. Complaints: Bullet points.
3. History (Present/Past): Max 3 sentences each.
4. Genogram: Structured text list representation.
5. Vitals: Table (T, P, R, BP, BMI).
6. Investigations: Table (Test, Result, Normal, Remark).
7. Medications: Table (Drug, Dose, Route, Action, Nurse Role).
8. Diagnoses: Exactly 3 NANDA-style diagnoses.
9. Care Plan: Professional table (Assessment, Diagnosis, Goal, Interventions, Evaluation).
10. Health Edu: 5 practical nursing bullets.
11. Conclusion: 2 sentences.

Rules: Be a 'Virtual Nursing Preceptor'. Fill missing data with HIGHLY REALISTIC, evidence-based academic simulation data that perfectly matches the clinical presentation of the patient's condition in a professional hospital setting. Use advanced medical terminology (e.g., Pyrexia, Dyspnea, Diaphoresis). Ensure Labs, Vitals, and Medications are clinically coherent for the diagnosis. Use Markdown tables. Do not stop at section 9. Complete all 12 sections.`;

    try {
      const response = await askAI(prompt);
      if (response.error) throw new Error(response.message);
      
      setAiReport(response.text || "Report generation failed.");
      setIsGenerated(true);
      
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (error: any) {
      alert("Error: " + (error.message || "Failed to generate NCP"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4 py-1">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-slate-900">Patient Identity</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-sm">Patient Name (Optional)</label>
                <input value={formData.patientName} onChange={e => updateField("patientName", e.target.value)} className="input-primary" placeholder="e.g. Mr. John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="label-sm">Age</label>
                  <input type="number" value={formData.age} onChange={e => updateField("age", e.target.value)} className="input-primary" placeholder="Years" />
                </div>
                <div className="space-y-1.5">
                  <label className="label-sm">Gender</label>
                  <select value={formData.gender} onChange={e => updateField("gender", e.target.value)} className="input-primary">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Marital Status</label>
                <select value={formData.maritalStatus} onChange={e => updateField("maritalStatus", e.target.value)} className="input-primary">
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Education</label>
                <input value={formData.education} onChange={e => updateField("education", e.target.value)} className="input-primary" placeholder="e.g. Secondary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="label-sm">Occupation</label>
                  <input value={formData.occupation} onChange={e => updateField("occupation", e.target.value)} className="input-primary" placeholder="e.g. Teacher" />
                </div>
                <div className="space-y-1.5">
                  <label className="label-sm">Religion</label>
                  <input value={formData.religion} onChange={e => updateField("religion", e.target.value)} className="input-primary" placeholder="e.g. Hindu" />
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="label-sm">Address</label>
                <input value={formData.address} onChange={e => updateField("address", e.target.value)} className="input-primary" placeholder="Village/City, District" />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4 py-1">
              <Stethoscope className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-slate-900">Hospital & Clinical</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-sm">Hospital Name</label>
                <input value={formData.hospitalName} onChange={e => updateField("hospitalName", e.target.value)} className="input-primary" placeholder="City Hospital..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="label-sm">Ward</label>
                  <input value={formData.ward} onChange={e => updateField("ward", e.target.value)} className="input-primary" placeholder="Medical" />
                </div>
                <div className="space-y-1.5">
                  <label className="label-sm">Bed No</label>
                  <input value={formData.bedNumber} onChange={e => updateField("bedNumber", e.target.value)} className="input-primary" placeholder="12" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Date of Admission</label>
                <input type="date" value={formData.admissionDate} onChange={e => updateField("admissionDate", e.target.value)} className="input-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="label-sm text-red-500 font-black">Medical Diagnosis*</label>
                <input value={formData.medicalDiagnosis} onChange={e => updateField("medicalDiagnosis", e.target.value)} className="input-primary border-red-100 ring-4 ring-red-50" placeholder="e.g. Pneumonia" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="label-sm">Chief Complaints*</label>
                <textarea value={formData.chiefComplaints} onChange={e => updateField("chiefComplaints", e.target.value)} className="input-primary h-24" placeholder="Brief symptoms..." />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4 py-1">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-slate-900">Family & Structure</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-sm">Family Structure</label>
                <select value={formData.familyStructure} onChange={e => updateField("familyStructure", e.target.value)} className="input-primary">
                  <option value="">Select</option>
                  <option value="Nuclear">Nuclear</option>
                  <option value="Joint">Joint</option>
                  <option value="Extended">Extended</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Total Members</label>
                <input type="number" value={formData.familyMembersCount} onChange={e => updateField("familyMembersCount", e.target.value)} className="input-primary" />
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="label-sm">Family Members Detail</label>
                <button onClick={addFamilyMember} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Member
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.familyMembers.map((member, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">Member #{idx + 1}</span>
                      <button onClick={() => removeFamilyMember(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <input placeholder="Relation" value={member.relation} onChange={e => updateFamilyMember(idx, "relation", e.target.value)} className="input-primary h-10 px-3 text-xs" />
                      <input placeholder="Age" value={member.age} onChange={e => updateFamilyMember(idx, "age", e.target.value)} className="input-primary h-10 px-3 text-xs" />
                      <input placeholder="Health Status" value={member.healthStatus} onChange={e => updateFamilyMember(idx, "healthStatus", e.target.value)} className="input-primary h-10 px-3 text-xs md:col-span-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4 py-1">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-slate-900">Personal History</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-sm">Diet</label>
                <select value={formData.diet} onChange={e => updateField("diet", e.target.value)} className="input-primary">
                  <option value="">Select</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Sleep Pattern</label>
                <input value={formData.sleepPattern} onChange={e => updateField("sleepPattern", e.target.value)} className="input-primary" placeholder="e.g. 6-7 hours" />
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Addictions</label>
                <input value={formData.addictions} onChange={e => updateField("addictions", e.target.value)} className="input-primary" placeholder="None / Smoking" />
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Hygiene</label>
                <input value={formData.hygiene} onChange={e => updateField("hygiene", e.target.value)} className="input-primary" placeholder="Good / Fair" />
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4 py-1">
              <Home className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-slate-900">Socioeconomic Status</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-sm">Monthly Income</label>
                <input value={formData.income} onChange={e => updateField("income", e.target.value)} className="input-primary" placeholder="Approx income..." />
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Housing</label>
                <input value={formData.housing} onChange={e => updateField("housing", e.target.value)} className="input-primary" placeholder="Pucca / Kutcha" />
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Water Supply</label>
                <input value={formData.waterSupply} onChange={e => updateField("waterSupply", e.target.value)} className="input-primary" placeholder="Tap / Well" />
              </div>
              <div className="space-y-1.5">
                <label className="label-sm">Sanitation</label>
                <input value={formData.sanitation} onChange={e => updateField("sanitation", e.target.value)} className="input-primary" placeholder="Open / Closed" />
              </div>
            </div>
            
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 mt-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Genie Magic Enabled</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">Empty fields will be intelligently filled with clinically accurate "Academic Simulation Data" for your assignment.</p>
                </div>
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !formData.medicalDiagnosis}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? "Synthesizing Full Package..." : "Generate Assignment Package"}
              </button>
              {!formData.medicalDiagnosis && (
                <p className="text-[10px] text-red-500 font-bold text-center flex items-center justify-center gap-1.5 mt-2">
                  <AlertCircle className="w-3 h-3" /> Please enter Medical Diagnosis in Step 2.
                </p>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-44 print:bg-white print:pb-0">
      <div className="print:hidden">
        <TopBar />
      </div>
      
      <main className="container-responsive pt-24 space-y-lg px-4 max-w-2xl mx-auto print:pt-0 print:max-w-none print:px-0">
        <section className="space-y-sm text-center print:hidden">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-2">
            <ClipboardList className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Assignment Builder</span>
          </div>
          <h2 className="font-plus-jakarta text-3xl font-bold text-slate-900 tracking-tight">Case Study & NCP</h2>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">Generate comprehensive assignment packages with genograms, physical assessments, and clinical tables.</p>
        </section>

        {/* Stepper - Mobile Friendly */}
        <div className="flex items-center justify-between px-4 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 print:hidden overflow-x-auto no-scrollbar">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center shrink-0">
              <div 
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all duration-300 cursor-pointer",
                  step < s.id ? "opacity-30 scale-90" : "opacity-100 scale-100"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shadow-md",
                  step >= s.id ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                )}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-700">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "h-[2px] w-6 mx-2 rounded-full",
                  step > s.id ? "bg-primary" : "bg-gray-100"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        {!isGenerated && (
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 print:hidden">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            <div className="flex items-center justify-between gap-4 mt-10 p-2 bg-gray-50 rounded-2xl">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="flex-1 flex items-center justify-center gap-2 font-bold text-slate-500 py-4 hover:bg-white rounded-xl transition-all shadow-sm">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div className="flex-1" />
              )}
              {step < 5 && (
                <button 
                  onClick={() => setStep(step + 1)} 
                  className="flex-[2] flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Result Area */}
        <AnimatePresence>
          {isGenerated && aiReport && (
            <motion.section ref={reportRef} id="ncp-result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between px-2 print:hidden">
                <div>
                  <h4 className="font-plus-jakarta text-2xl font-bold text-slate-900 tracking-tight">Assignment Draft</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Ready for Export</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsGenerated(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white rounded-xl border border-gray-100 shadow-sm transition-all">
                    Edit Data
                  </button>
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-2 rounded-2xl border border-green-100 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Complete</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-8 md:p-12 markdown-result max-w-none print:shadow-none print:p-0 print:border-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiReport}
                </ReactMarkdown>
              </div>

              <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-6 shadow-2xl shadow-slate-900/40 relative overflow-hidden group print:hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-all duration-700" />
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                    <Printer className="w-7 h-7" />
                  </div>
                  <div className="text-center md:text-left">
                    <h5 className="text-lg font-bold">Print Your Assignment</h5>
                    <p className="text-[11px] text-white/50 font-medium tracking-wide">Tip: Use "Save as PDF" in print options to export for college.</p>
                  </div>
                  <button onClick={handlePrint} className="md:ml-auto w-full md:w-auto bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" /> Export PDF
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <div className="print:hidden">
        <BottomNav />
      </div>

      <style jsx global>{`
        .input-primary {
          width: 100%;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .input-primary:focus {
          outline: none;
          ring: 2px;
          border-color: #004ac6;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(0, 74, 198, 0.1);
        }
        .label-sm {
          font-size: 10px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding-left: 2px;
        }
        
        /* Markdown Rendering Styles */
        .markdown-result {
          line-height: 1.6;
          color: #1e293b;
        }
        .markdown-result h1, .markdown-result h2, .markdown-result h3 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          color: #0f172a;
          margin-top: 2rem;
          margin-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 0.5rem;
        }
        .markdown-result h2 { font-size: 1.5rem; }
        .markdown-result h3 { font-size: 1.25rem; border-bottom: none; }
        .markdown-result p { margin-bottom: 1rem; font-size: 0.9375rem; }
        .markdown-result table {
          display: block;
          width: 100%;
          overflow-x: auto;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .markdown-result table::-webkit-scrollbar { height: 4px; }
        .markdown-result table::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .markdown-result th {
          background-color: #f8fafc;
          font-weight: 800;
          text-align: left;
          padding: 12px;
          border-bottom: 2px solid #e2e8f0;
        }
        .markdown-result td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .markdown-result ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .markdown-result li { margin-bottom: 0.5rem; }

        @media print {
          body { background-color: white !important; }
          .container-responsive { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          @page { margin: 2cm; }
          .markdown-result h1, .markdown-result h2 {
            border-bottom-color: black;
          }
          .markdown-result table {
            border-color: black;
          }
          .markdown-result th {
            border-bottom-color: black;
            background-color: #eee !important;
            -webkit-print-color-adjust: exact;
          }
          .markdown-result td {
            border-bottom-color: #ddd;
          }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
