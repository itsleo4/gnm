"use client";

import { useEffect, useState } from "react";
import { getAIStatus } from "@/app/actions/ai";
import TopBar from "@/components/layout/TopBar";
import { Activity, ShieldCheck, ShieldAlert, Cpu, Database, RefreshCw } from "lucide-react";

export default function AIDebugPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    const data = await getAIStatus();
    setStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (!status && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-xl text-center">
        <div className="space-y-md">
          <ShieldAlert className="w-16 h-16 text-error mx-auto" />
          <h1 className="text-2xl font-bold">Debug Mode Disabled</h1>
          <p className="text-on-surface-variant max-w-xs">This page is only available in local development mode (NODE_ENV=development).</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <TopBar />
      <main className="container-responsive pt-24 space-y-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            AI Diagnostics
          </h1>
          <button 
            onClick={fetchStatus}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {/* Environment Status */}
          <section className="bg-white p-lg rounded-2xl shadow-sm border border-outline-variant/30 space-y-md">
            <h2 className="text-sm font-bold uppercase tracking-widest text-outline flex items-center gap-2">
              <Database className="w-4 h-4" /> Environment Keys
            </h2>
            <div className="space-y-sm">
              <StatusRow 
                label="GEMINI_API_KEY" 
                active={status?.geminiKeyDetected} 
                value={status?.geminiKeyDetected ? "DETECTED" : "MISSING"} 
              />
              <StatusRow 
                label="OPENAI_API_KEY" 
                active={status?.openaiKeyDetected} 
                value={status?.openaiKeyDetected ? "DETECTED" : "MISSING"} 
              />
            </div>
          </section>

          {/* Last Transaction */}
          <section className="bg-white p-lg rounded-2xl shadow-sm border border-outline-variant/30 space-y-md">
            <h2 className="text-sm font-bold uppercase tracking-widest text-outline flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Last Transaction
            </h2>
            <div className="space-y-sm text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-on-surface-variant">Provider:</span>
                <span className="font-bold text-primary">{status?.provider || "None"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-on-surface-variant">Model:</span>
                <span className="font-mono text-xs">{status?.model || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-on-surface-variant">Status:</span>
                <span className={`font-bold ${status?.lastStatus === 'Connected' ? 'text-secondary' : 'text-error'}`}>
                  {status?.lastStatus || "No requests yet"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-on-surface-variant">Time:</span>
                <span className="opacity-70">{status?.timestamp ? new Date(status.timestamp).toLocaleTimeString() : "-"}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Error Console */}
        {status?.lastError && (
          <section className="bg-error/5 border border-error/20 p-lg rounded-2xl space-y-sm">
            <h3 className="font-bold text-error flex items-center gap-2 text-sm uppercase tracking-wider">
              Raw Error Message
            </h3>
            <pre className="bg-white/50 p-md rounded-lg text-[11px] font-mono whitespace-pre-wrap break-all text-error/80 overflow-x-auto">
              {status.lastError}
            </pre>
          </section>
        )}

        <p className="text-[10px] text-center text-on-surface-variant italic">
          Auto-refreshing every 5 seconds. Use this page to verify your API keys and model access.
        </p>
      </main>
    </div>
  );
}

function StatusRow({ label, active, value }: { label: string, active: boolean, value: string }) {
  return (
    <div className="flex items-center justify-between p-md bg-surface-container-lowest rounded-xl">
      <span className="text-xs font-bold text-on-surface-variant">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-black uppercase ${active ? 'text-secondary' : 'text-error'}`}>{value}</span>
        {active ? <ShieldCheck className="w-4 h-4 text-secondary" /> : <ShieldAlert className="w-4 h-4 text-error" />}
      </div>
    </div>
  );
}
