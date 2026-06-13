"use client";

import { useEffect, useState, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, BookOpen, Brain, 
  Settings, ChevronRight, 
  ArrowLeft, CheckCircle2, 
  AlertTriangle, Flame,
  Timer, Target, Zap, 
  Trash2, X, Info, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import ChapterWorkspace from "@/components/revision/ChapterWorkspace";
import { 
  getSubjects, addSubject, deleteSubject,
  getTopics, addTopic, updateTopicStatus,
  getRevisionStats 
} from "@/app/actions/revision";

export default function RevisionHub() {
  const [view, setView] = useState<"dashboard" | "subject" | "study">("dashboard");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const [subList, statData] = await Promise.all([
      getSubjects(),
      getRevisionStats()
    ]);
    setSubjects(subList);
    setStats(statData);
    setView("dashboard");
  };

  const handleOpenSubject = async (sub: any) => {
    setSelectedSubject(sub);
    const topicList = await getTopics(sub.id);
    setTopics(topicList);
    setView("subject");
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    await addSubject(newName);
    setNewName("");
    setIsAddingSubject(false);
    loadDashboard();
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !selectedSubject) return;
    await addTopic(selectedSubject.id, newName);
    setNewName("");
    const topicList = await getTopics(selectedSubject.id);
    setTopics(topicList);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      <TopBar />
      
      <main className="w-full max-w-7xl mx-auto px-4 pt-24 block">
        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <DashboardView 
              stats={stats} 
              subjects={subjects} 
              onOpen={handleOpenSubject} 
              onAdd={() => setIsAddingSubject(true)} 
            />
          )}

          {view === "subject" && (
            <SubjectDetailView 
              subject={selectedSubject} 
              topics={topics} 
              onBack={loadDashboard}
              onAddTopic={handleAddTopic}
              nameState={[newName, setNewName]}
              onStudy={(topic: any) => {
                setSelectedTopic(topic);
                setView("study");
              }}
              onDeleteSub={async () => {
                if(confirm("Delete this entire subject and all topics?")) {
                  await deleteSubject(selectedSubject.id);
                  loadDashboard();
                }
              }}
            />
          )}

          {view === "study" && (
            <ChapterWorkspace 
              topic={selectedTopic} 
              onBack={() => handleOpenSubject(selectedSubject)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {isAddingSubject && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm min-w-[320px] shadow-2xl relative"
            >
               <h3 className="text-xl font-black mb-6">Create New Subject</h3>
               <form onSubmit={handleAddSubject}>
                  <input 
                    autoFocus
                    placeholder="e.g. Pharmacology or Ward Duty"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 text-sm font-bold focus:outline-none focus:ring-2 ring-primary/20"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <div className="flex gap-4">
                     <button type="button" onClick={() => setIsAddingSubject(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-400">Cancel</button>
                     <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-primary/20">Create</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

function DashboardView({ stats, subjects, onOpen, onAdd }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      className="space-y-8 w-full block"
    >
      {/* Real Stats Header */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative group">
         <div className="flex items-start justify-between relative z-10 mb-8">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Learning Status</p>
               <h2 className="text-3xl font-black text-slate-900">Spaced Repetition</h2>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
               <Brain className="w-6 h-6" />
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <StatCard icon={Timer} label="Due Today" value={stats?.dueToday ?? 0} color="text-orange-500" bg="bg-orange-50" />
            <StatCard icon={CheckCircle2} label="Mastered" value={stats?.mastered ?? 0} color="text-green-500" bg="bg-green-50" />
            <StatCard icon={AlertTriangle} label="Weak Areas" value={stats?.needsRevision ?? 0} color="text-red-500" bg="bg-red-50" />
            <StatCard icon={Target} label="Readiness" value={(stats?.readiness ?? 0) + "%"} color="text-primary" bg="bg-blue-50" />
         </div>
         <Sparkles className="absolute -right-4 -top-4 w-32 h-32 text-slate-50/50 -z-0" />
      </section>

      {/* Global Progress Bar */}
      <div className="px-2">
         <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-tight">
               <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> 
               EXAM READINESS SCORE
            </h3>
            <span className="text-xs font-black text-primary">{stats?.readiness ?? 0}%</span>
         </div>
         <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${stats?.readiness ?? 0}%` }} className="h-full bg-primary" />
         </div>
      </div>

      <div className="flex items-center justify-between px-2">
         <h3 className="text-xl font-black text-slate-900">Your Subjects</h3>
         <button onClick={onAdd} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all">
            <Plus className="w-6 h-6" />
         </button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-slate-100">
           <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <p className="text-sm font-bold text-slate-400">No subjects created yet. Add one to start learning!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {subjects.map((sub: any) => (
            <motion.div 
              whileHover={{ x: 5 }}
              onClick={() => onOpen(sub)}
              key={sub.id} 
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
            >
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-primary/10 transition-colors">
                     <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-black text-slate-900 text-lg leading-tight">{sub.name}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.topics[0]?.count ?? 0} Topics</p>
                  </div>
               </div>
               <ChevronRight className="w-5 h-5 text-slate-300" />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className={cn("p-4 rounded-2xl border border-transparent transition-all", bg)}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", bg.replace('50', '100'))}>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn("text-xl font-black", color.replace('text-', 'text-'))}>{value}</p>
    </div>
  );
}

function SubjectDetailView({ subject, topics, onBack, onAddTopic, nameState, onStudy, onDeleteSub }: any) {
  const [newName, setNewName] = nameState;
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-8 w-full max-w-2xl mx-auto block shrink-0"
    >
      <div className="flex items-center justify-between">
         <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold text-xs hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
         </button>
         <button onClick={onDeleteSub} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center active:scale-90 transition-all">
            <Trash2 className="w-4 h-4" />
         </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
         <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Subject</p>
            <h2 className="text-4xl font-black text-slate-900">{subject.name}</h2>
         </div>
         <BookOpen className="absolute -right-8 -bottom-8 w-40 h-40 text-slate-50" />
      </div>

      <section>
         <form onSubmit={onAddTopic} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 mb-8">
            <input 
               placeholder="Add a new topic (e.g. Shock)"
               className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 px-4"
               value={newName}
               onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all">
               <Plus className="w-6 h-6" />
            </button>
         </form>

         {topics.length === 0 ? (
           <div className="text-center py-10">
              <Zap className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No topics yet</p>
           </div>
         ) : (
           <div className="space-y-4">
              {topics.map((topic: any) => (
                <div key={topic.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                         <h4 className="font-bold text-slate-900 text-lg leading-tight">{topic.name}</h4>
                         <StatusBadge status={topic.status} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {topic.next_review_date ? `Next Review: ${new Date(topic.next_review_date).toLocaleDateString()}` : 'Not Started'}
                      </p>
                   </div>
                   <button 
                    onClick={() => onStudy(topic)}
                    className="px-6 py-3 bg-slate-50 group-hover:bg-primary group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                   >
                      Revise ⚡
                   </button>
                </div>
              ))}
           </div>
         )}
      </section>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    "Mastered": "bg-green-100 text-green-600",
    "Learning": "bg-blue-100 text-blue-600",
    "Needs Revision": "bg-orange-100 text-orange-600",
    "Not Started": "bg-slate-100 text-slate-500"
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider", colors[status] || colors["Not Started"])}>
      {status}
    </span>
  );
}

function StudyModeView({ topic, onBack, onFinish }: any) {
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="w-full flex flex-col items-center space-y-8 py-4 sm:py-8"
    >
      <div className="w-full max-w-xl text-center space-y-4 px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
             <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Scientific Revision</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{topic.name}</h2>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden mx-auto w-full max-w-[90vw] sm:max-w-xl min-w-[320px] shrink-0">
         {step === 1 ? (
           <div className="space-y-8 py-4">
              <div className="space-y-4 text-center">
                 <h3 className="text-xl font-bold text-slate-900 leading-snug">Can you explain the key concepts of <span className="text-primary italic">"{topic.name}"</span> from memory right now?</h3>
                 <p className="text-sm text-slate-500 max-w-sm mx-auto">Active Recall is the #1 way to remember nursing topics for the long term.</p>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                I've finished recalling
              </button>

              <div className="flex gap-4">
                 <button className="flex-1 p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Quick Test (AI)</span>
                 </button>
                 <button className="flex-1 p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Rapid Notes</span>
                 </button>
                 <button className="flex-1 p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2">
                    <Timer className="w-5 h-5 text-green-400" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Study Clock</span>
                 </button>
              </div>
           </div>
         ) : (
           <div className="space-y-10 text-center py-4">
              <h3 className="text-xl font-black text-slate-900">How would you rate your confidence?</h3>
              <div className="grid grid-cols-5 gap-3">
                 {[1, 2, 3, 4, 5].map((num) => (
                   <button 
                    key={num} 
                    onClick={() => {
                      setScore(num);
                      onFinish(num);
                    }}
                    className={cn(
                      "aspect-square rounded-2xl text-lg font-black flex items-center justify-center transition-all active:scale-95",
                      num <= 2 ? "bg-red-50 text-red-500 border-red-100" : 
                      num <= 3 ? "bg-orange-50 text-orange-500 border-orange-100" : 
                      "bg-green-50 text-green-500 border-green-100",
                      "border"
                    )}
                   >
                     {num}
                   </button>
                 ))}
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-300">
                 <span>Forgot Everything</span>
                 <span>Expert Mastery</span>
              </div>
              <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 hover:text-primary transition-all">Back to recall mode</button>
           </div>
         )}
      </div>

      <button onClick={onBack} className="w-full text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Quit Session</button>
    </motion.div>
  );
}
