"use client";

import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { User, Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight, Award } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
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
        <section className="bg-white rounded-3xl p-lg academic-card flex flex-col items-center text-center">
          <div className="relative mb-md">
            <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center text-primary shadow-inner border-4 border-surface overflow-hidden">
               {profile?.avatar_url ? <img src={profile.avatar_url} alt="profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12" />}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-secondary rounded-full border-4 border-white flex items-center justify-center">
                < Award className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="font-plus-jakarta text-2xl font-bold text-on-surface">{profile?.full_name || "Nursing Student"}</h2>
          <p className="text-on-surface-variant text-sm font-medium">{profile?.college_name || "GNM Scholar"} • Year {profile?.year_level || 1}</p>
          
          <div className="flex gap-md mt-lg w-full">
            <div className="flex-1 bg-surface-container-low p-sm rounded-2xl">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Level</p>
                <p className="text-lg font-bold text-primary">{profile?.level || 1}</p>
            </div>
            <div className="flex-1 bg-surface-container-low p-sm rounded-2xl">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Streak</p>
                <p className="text-lg font-bold text-secondary">{profile?.streak || 0} Days</p>
            </div>
          </div>
        </section>

        {/* Menu Items */}
        <section className="bg-white rounded-3xl overflow-hidden academic-card">
           <MenuItem icon={Settings} label="Account Settings" />
           <MenuItem icon={Bell} label="Notifications" />
           <MenuItem icon={Shield} label="Privacy & Security" />
           <MenuItem icon={HelpCircle} label="Help & Support" />
           <div onClick={handleLogout}>
             <MenuItem icon={LogOut} label="Log Out" color="text-error" border={false} />
           </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function MenuItem({ icon: Icon, label, color = "text-on-surface", border = true }: { icon: any; label: string; color?: string; border?: boolean }) {
    return (
        <div className={cn(
            "flex items-center gap-md p-lg hover:bg-surface-container-low transition-colors cursor-pointer group",
            border && "border-b border-outline-variant/20"
        )}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container", color.replace('text-', 'bg-').replace('text-on-surface', 'bg-surface-container'))}>
                <Icon className={cn("w-5 h-5", color)} />
            </div>
            <span className={cn("flex-1 font-bold text-sm", color)}>{label}</span>
            <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition-all" />
        </div>
    )
}


