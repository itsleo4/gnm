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
  MoreVertical,
  Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  type?: "simple" | "complex";
};

import { askAI } from "@/app/actions/ai";

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Nursing Tutor. How can I help you today? You can ask about medical topics, drugs, or get help with your care plans.",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<"gemini" | "openai">("gemini");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    
    try {
      const response = await askAI(input, selectedModel);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        type: selectedModel === "openai" ? "complex" : "simple",
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col h-screen overflow-hidden">
      <TopBar />
      
      {/* Chat Area */}
      <main className="flex-1 pt-20 pb-40 overflow-y-auto scroll-smooth" ref={scrollRef}>
        <div className="container-responsive max-w-2xl space-y-lg py-md">
          {/* Modes Grid */}
          {messages.length <= 1 && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-2 gap-sm"
            >
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setActiveMode(mode.id);
                    setInput(`Tell me about ${mode.label}...`);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-lg rounded-2xl border border-outline-variant/30 bg-white shadow-sm transition-all active:scale-95 text-center",
                    activeMode === mode.id && "ring-2 ring-primary border-primary"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md", mode.color)}>
                    <mode.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-xs text-on-surface">{mode.label}</span>
                </button>
              ))}
            </motion.section>
          )}

          {/* Messages */}
          <div className="space-y-md">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                className={cn(
                  "flex gap-sm max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === "user" ? "bg-primary text-white" : "bg-white text-primary border border-outline-variant/30"
                )}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                  "p-md rounded-2xl shadow-sm text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-white text-on-surface rounded-tl-none border border-outline-variant/20"
                )}>
                  {msg.type && (
                    <div className="flex items-center gap-1.5 mb-2 opacity-70">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {msg.type === "complex" ? "ChatGPT (GPT-4o)" : "Google Gemini 3.5"}
                      </span>
                    </div>
                  )}
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-sm mr-auto items-center">
                <div className="w-8 h-8 rounded-full bg-white text-primary border border-outline-variant/30 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Input Container */}
      <footer className="fixed bottom-24 w-full px-md pb-md">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Model Selector */}
          <div className="flex justify-center">
            <div className="bg-white/80 backdrop-blur-md border border-outline-variant/30 rounded-full p-1 flex items-center gap-1 shadow-sm">
              <button 
                onClick={() => setSelectedModel("gemini")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-2",
                  selectedModel === "gemini" ? "bg-primary text-white shadow-md scale-105" : "text-on-surface-variant hover:bg-surface-container"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                GEMINI 3.5
              </button>
              <button 
                onClick={() => setSelectedModel("openai")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-2",
                  selectedModel === "openai" ? "bg-inverse-surface text-inverse-on-surface shadow-md scale-105" : "text-on-surface-variant hover:bg-surface-container"
                )}
              >
                <Bot className="w-3.5 h-3.5" />
                GPT-4 TURBO
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/30 p-2 flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl hover:bg-surface-container flex items-center justify-center text-on-surface-variant">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={selectedModel === "gemini" ? "Ask Gemini anything..." : "Ask GPT-4 Turbo anything..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium h-12"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95",
                input.trim() 
                  ? selectedModel === "openai" ? "bg-inverse-surface text-white shadow-lg" : "bg-primary text-white shadow-lg"
                  : "bg-surface-container text-outline"
              )}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
