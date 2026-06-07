"use client";

import { useState, useRef, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Stethoscope, 
  Pill, 
  FileText, 
  GraduationCap,
  Loader2,
  Paperclip,
  Zap,
  Info,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { askAI } from "@/app/actions/ai";

const MODES = [
  { id: "explain", label: "Explain Topic", icon: GraduationCap, color: "bg-primary" },
  { id: "drug", label: "Drug Info", icon: Pill, color: "bg-tertiary" },
  { id: "ncp", label: "NCP Help", icon: Stethoscope, color: "bg-secondary" },
  { id: "exam", label: "Exam Prep", icon: FileText, color: "bg-error" },
];

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sourceModel?: string;
  isDowngraded?: boolean;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your GNM AI Nursing Tutor. I'm powered by Gemini 3.5 and GPT-5.5. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<"gemini" | "openai">("gemini");
  const [showLimitNotice, setShowLimitNotice] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowLimitNotice(false);
    
    try {
      const response = await askAI(input, selectedProvider);
      
      if (response.error) {
        throw new Error(response.message);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.text,
        sourceModel: response.model,
        isDowngraded: response.downgraded,
      };

      if (response.downgraded) {
        setShowLimitNotice(true);
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "I encountered an error. Please check your keys or connection.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col h-screen overflow-hidden">
      {/* Custom Top Header with Provider Toggle */}
      <header className="fixed top-0 w-full h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center justify-between px-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-plus-jakarta font-bold text-lg leading-none">AI Tutor</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">Frontier Intelligence</p>
          </div>
        </div>

        {/* TOP RIGHT PROVIDER SELECTOR */}
        <div className="bg-gray-100/80 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
          <button 
            onClick={() => setSelectedProvider("gemini")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2",
              selectedProvider === "gemini" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:bg-white/50"
            )}
          >
            <Sparkles className="w-3 h-3" />
            GEMINI
          </button>
          <button 
            onClick={() => setSelectedProvider("openai")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2",
              selectedProvider === "openai" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:bg-white/50"
            )}
          >
            <Bot className="w-3 h-3" />
            GPT-5.5
          </button>
        </div>
      </header>
      
      {/* Chat Area */}
      <main className="flex-1 pt-24 pb-48 overflow-y-auto scrollbar-hide" ref={scrollRef}>
        <div className="container-responsive max-w-2xl space-y-md py-md px-4">
          
          {/* Quick Info & Notice */}
          <AnimatePresence>
            {showLimitNotice && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3 mb-4"
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[11px] font-bold text-amber-700 leading-tight">
                  GPT-5.5 Instant limit reached. Automatically shifted to <span className="underline">GPT-5.5 Mini</span> for uninterrupted high-volume study.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modes Grid */}
          {messages.length <= 1 && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-2 gap-3"
            >
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setActiveMode(mode.id);
                    setInput(`GNM Tutor: ${mode.label} for...`);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm transition-all active:scale-95 text-center group hover:border-primary/30",
                    activeMode === mode.id && "ring-2 ring-primary border-primary"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", mode.color)}>
                    <mode.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-xs text-slate-700">{mode.label}</span>
                </button>
              ))}
            </motion.section>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm font-bold text-[10px]",
                  msg.role === "user" ? "bg-primary text-white" : "bg-white text-primary border border-gray-100"
                )}>
                  {msg.role === "user" ? "U" : "AI"}
                </div>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  {msg.role === "assistant" && msg.sourceModel && (
                    <div className="flex items-center gap-2 px-1">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                        msg.isDowngraded ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {msg.sourceModel}
                      </span>
                      {msg.isDowngraded && <Info className="w-3 h-3 text-amber-500" />}
                    </div>
                  )}
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-primary text-white rounded-tr-sm" 
                      : "bg-white text-slate-800 rounded-tl-sm border border-gray-100"
                  )}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
                <p className="text-[10px] font-bold text-gray-400">AI remains thinking...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Input Container */}
      <footer className="fixed bottom-24 w-full px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Ask ${selectedProvider === "gemini" ? "Gemini 3.5" : "GPT-5.5"} anything...`}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium h-12"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95",
                input.trim() 
                  ? selectedProvider === "openai" ? "bg-black text-white shadow-lg" : "bg-primary text-white shadow-lg"
                  : "bg-gray-100 text-gray-300"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
