"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.refresh();
      router.push("/dashboard");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset password");
      return;
    }
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
    } else {
      alert("Password reset link sent to your email!");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[400px] space-y-8 z-10"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <Link href="/" className="group">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">GNM Companion</h1>
            <p className="text-on-surface-variant font-medium">Welcome Back</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-[0px_20px_50px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-error/10 text-error p-3 rounded-xl text-xs font-bold border border-error/20 flex items-center gap-2"
              >
                <div className="w-1 h-4 bg-error rounded-full"></div>
                {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface/70 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-outline/20 bg-background pl-12 pr-4 text-base text-on-surface placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="john@college.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-on-surface/70">Password</label>
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-outline/20 bg-background pl-12 pr-4 text-base text-on-surface placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="h-12 w-full bg-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-bold hover:underline transition-all">
              Create Account
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 py-4">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Enterprise grade security</span>
        </div>
      </motion.div>
    </div>
  );
}
