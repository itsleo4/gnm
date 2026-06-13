"use client";

import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { User, Settings, Shield, LogOut, ChevronRight, Award, Mail, Globe, MessageSquare, Info, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopBar />
      
      <main className="pt-24 px-md space-y-lg">
        {/* Profile Header */}
        <section className="bg-white rounded-[2.5rem] p-10 academic-card flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full bg-primary-container flex items-center justify-center text-primary shadow-inner border-8 border-slate-50 overflow-hidden">
               {profile?.avatar_url ? <img src={profile.avatar_url} alt="profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12" />}
            </div>
            <div className="absolute bottom-1 right-1 w-10 h-10 bg-primary rounded-full border-4 border-white flex items-center justify-center text-white">
                <Award className="w-5 h-5" />
            </div>
          </div>
          <h2 className="font-plus-jakarta text-3xl font-black text-slate-900">{profile?.full_name || "Nursing Student"}</h2>
          <div className="flex flex-col gap-1 items-center mt-2">
             <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{profile?.college_name || "GNM Scholar"} • Year {profile?.year_level || 1}</p>
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Platform built by Nitin Kumar</span>
          </div>
        </section>

        {/* Menu Items */}
        <section className="bg-white rounded-[2.5rem] overflow-hidden academic-card">
           <MenuItem icon={Info} label="About Nitin Kumar" onClick={() => setShowAbout(true)} />
           <MenuItem icon={MessageSquare} label="Feedback & Socials" onClick={() => setShowFeedback(true)} />
           <MenuItem icon={Shield} label="Privacy & Security" onClick={() => setShowSecurity(true)} />
           <MenuItem icon={Settings} label="Account Settings" />
           <div onClick={handleLogout}>
             <MenuItem icon={LogOut} label="Log Out" color="text-red-500" border={false} />
           </div>
        </section>

        {/* Footer Attribution */}
        <div className="text-center py-8">
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">GNM COMPANIION</p>
           <p className="text-[9px] font-black text-slate-300 uppercase mt-2 font-black italic">v1.0 • Designed by Nitin Kumar</p>
        </div>
      </main>

      {/* OVERLAY: ABOUT NITIN KUMAR */}
      <Overlay isOpen={showAbout} onClose={() => setShowAbout(false)} title="Meet the Founder: Nitin Kumar">
         <div className="space-y-6 text-slate-700 leading-relaxed font-medium text-base">
            <p>I'm a GNM nursing student and self-taught web developer driven by curiosity, systems thinking, and practical problem-solving.</p>
            <p>My interests sit at the intersection of healthcare, technology, artificial intelligence, psychology, and learning science. Rather than simply consuming information, I enjoy breaking complex topics into understandable systems and building tools that make learning faster, clearer, and more effective.</p>
            <p>I believe knowledge becomes valuable only when it can be applied in the real world. Whether I'm studying patient care, designing software, exploring human behavior, or experimenting with AI, my goal is always the same: understand deeply, think independently, and create something useful.</p>
            <p>Currently, I'm focused on combining nursing education with modern technology to build smarter learning tools for healthcare students and future professionals.</p>
            
            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Connect:</span>
                  <a href="https://instagram.com/odincalm0" target="_blank" className="text-primary hover:scale-110 transition-all"><ExternalLink className="w-6 h-6" /></a>
               </div>
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">@odincalm0</span>
            </div>
         </div>
      </Overlay>

      {/* OVERLAY: FEEDBACK */}
      <Overlay isOpen={showFeedback} onClose={() => setShowFeedback(false)} title="Feedback & Contact">
         <div className="space-y-8">
            <p className="text-sm font-bold text-slate-500 leading-relaxed">I value independent thinking and creator feedback. Reach out to me directly for any suggestions or bugs.</p>
            
            <div className="grid gap-4">
               <ContactBox icon={Mail} label="Email Nitin" value="odincalm@proton.me" onClick={() => window.open('mailto:odincalm@proton.me')} />
               <ContactBox icon={Globe} label="Instagram" value="@odincalm0" onClick={() => window.open('https://instagram.com/odincalm0')} />
            </div>
         </div>
      </Overlay>

      {/* OVERLAY: SECURITY */}
      <Overlay isOpen={showSecurity} onClose={() => setShowSecurity(false)} title="Vault Security">
         <div className="space-y-8">
            <p className="text-sm font-bold text-slate-500 leading-relaxed">Your academic data is protected by a multi-layered security architecture designed by the founder.</p>
            
            <div className="space-y-8">
               <SecurityPoint title="Supabase Hardening" desc="Bank-grade encryption for all database transactions and user profiles." />
               <SecurityPoint title="Stateless Chat" desc="Odin AI 🫀 interactions are processed securely without unnecessary data leaks." />
               <SecurityPoint title="Auth Guardians" desc="Role-based access control ensuring your clinical notes are private to you." />
            </div>
         </div>
      </Overlay>

      <BottomNav />
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, color = "text-on-surface", border = true }: any) {
    return (
        <div onClick={onClick} className={cn(
            "flex items-center gap-md p-lg hover:bg-slate-50 transition-colors cursor-pointer group",
            border && "border-b border-slate-100"
        )}>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 group-hover:bg-primary/5 transition-all text-slate-400 group-hover:text-primary")}>
                <Icon className={cn("w-5 h-5")} />
            </div>
            <span className={cn("flex-1 font-black text-[12px] uppercase tracking-widest ml-2", color === "text-on-surface" ? "text-slate-600" : color)}>{label}</span>
            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-primary transition-all" />
        </div>
    )
}

function Overlay({ isOpen, onClose, title, children }: any) {
   return (
      <AnimatePresence>
         {isOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.9, opacity: 0 }} 
                  className="bg-white w-full max-w-[500px] rounded-[3rem] p-10 md:p-14 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
               >
                  <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                     <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-10">{title}</h3>
                  <div className="w-full">
                     {children}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
   )
}

function ContactBox({ icon: Icon, label, value, onClick }: any) {
   return (
      <button onClick={onClick} className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] hover:bg-slate-100 transition-all text-left w-full group border border-transparent hover:border-slate-200">
         <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-all"><Icon className="w-5 h-5" /></div>
         <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-black text-slate-900 truncate">{value}</p>
         </div>
      </button>
   )
}

function SecurityPoint({ title, desc }: any) {
   return (
      <div className="flex gap-6">
         <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0"><Shield className="w-5 h-5" /></div>
         <div>
            <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest mb-1">{title}</h4>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">{desc}</p>
         </div>
      </div>
   )
}
