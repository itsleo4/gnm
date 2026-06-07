"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-md relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-xl z-10"
      >
        <div className="flex flex-col items-center gap-md">
          <Link href="/">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg hover:rotate-3 transition-transform">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </Link>
          <div className="text-center">
            <h1 className="font-plus-jakarta text-3xl font-bold text-on-surface">Create Account</h1>
            <p className="text-on-surface-variant text-sm font-medium">Join 1,000+ nursing students today.</p>
          </div>
        </div>

        <form onSubmit={handleSignup} className="bg-white/80 backdrop-blur-md p-lg rounded-[32px] shadow-2xl space-y-lg border border-white/20">
          {error && (
            <div className="bg-error/10 text-error p-md rounded-xl text-xs font-bold border border-error/20">
              {error}
            </div>
          )}
          
          <div className="space-y-md">
            <div className="space-y-xs">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-14 pl-12 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                  placeholder="Nurse Joy"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                  placeholder="name@college.edu"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-primary text-on-primary rounded-2xl font-bold text-md shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-on-surface-variant">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
