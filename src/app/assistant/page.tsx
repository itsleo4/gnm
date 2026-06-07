"use client";

import { useState, useRef, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { 
  Bot, User, Send, GraduationCap, Loader2, Paperclip, 
  Stethoscope, Pill, FileText, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your **GNM Nursing Tutor**. Powered by Gemini 1.5 Flash.\n\nAsk me anything about Nursing Care Plans, Anatomy, or pharmacology. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageContent = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessageContent,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessageContent }),
      });

      if (!response.ok) throw new Error(`Stream failed: ${response.status}`);

      const reader = response.body?.getReader();
      const textDecoder = new TextDecoder();
      
      let aiContent = "";
      const aiMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: aiMessageId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = textDecoder.decode(value);
        aiContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.id === aiMessageId) {
            return [...prev.slice(0, -1), { ...last, content: aiContent }];
          }
          return prev;
        });
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Connect Error: ${error.message || "Failed to reach AI engine."}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col h-screen overflow-hidden">
      <TopBar />
      
      <header className="fixed top-0 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center justify-between px-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-plus-jakarta font-bold text-sm leading-none">Nursing Tutor</h1>
            <p className="text-[9px] font-bold text-primary uppercase tracking-tighter mt-1">Live Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-green-700 tracking-widest uppercase">Healthy</span>
        </div>
      </header>
      
      <main className="flex-1 pt-20 pb-44 overflow-y-auto scrollbar-hide" ref={scrollRef}>
        <div className="container-responsive max-w-2xl space-y-md py-md px-4">

          {messages.length <= 1 && (
            <motion.section initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-2 gap-3">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => { setActiveMode(mode.id); setInput(`Explain this topic please: ${mode.label}...`); }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm transition-all active:scale-95 text-center group hover:border-primary/30",
                    activeMode === mode.id && "ring-2 ring-primary border-primary"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg", mode.color)}>
                    <mode.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-[11px] text-slate-700">{mode.label}</span>
                </button>
              ))}
            </motion.section>
          )}

          <div className="space-y-6">
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm font-bold text-[10px]",
                  msg.role === "user" ? "bg-primary text-white" : "bg-white text-primary border border-gray-100"
                )}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm text-sm leading-relaxed prose prose-sm max-w-none",
                    msg.role === "user" ? "bg-primary text-white rounded-tr-sm shadow-primary/20" : "bg-white text-slate-800 rounded-tl-sm border border-gray-100"
                  )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                      p: ({children}) => <p className={msg.role === "user" ? "text-white m-0" : "m-0"}>{children}</p>,
                      h1: ({children}) => <h1 className="text-lg font-bold my-2">{children}</h1>,
                      h2: ({children}) => <h2 className="text-md font-bold my-2">{children}</h2>,
                      ul: ({children}) => <ul className="list-disc ml-4 my-2">{children}</ul>,
                    }}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && messages[messages.length-1]?.content === "" && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
                <p className="text-[10px] font-bold text-gray-400">Tutor is thinking...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-24 w-full px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 flex items-center gap-2">
            <button className="w-10 h-10 rounded-2xl hover:bg-gray-50 flex items-center justify-center text-gray-400">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask a nursing student question..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium h-14"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95",
                input.trim() ? "bg-primary text-white shadow-xl shadow-primary/30" : "bg-gray-100 text-gray-300"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold">
            STATLESS EMERGENCY MODE ACTIVE
          </p>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
