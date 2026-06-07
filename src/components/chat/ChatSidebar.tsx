"use client";

import { useState } from "react";
import { 
  Plus, 
  MessageSquare, 
  Pin, 
  Trash2, 
  Edit2, 
  MoreVertical,
  X,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type ChatSession = {
  id: string;
  title: string;
  is_pinned: boolean;
  updated_at: string;
};

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onTogglePin,
  isOpen,
  onClose
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const pinned = sessions.filter(s => s.is_pinned);
  const recent = sessions.filter(s => !s.is_pinned);

  const handleEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[280px] bg-white border-r border-gray-100 z-[70] flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none",
          !isOpen && "pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <History className="w-5 h-5" />
            <span className="font-plus-jakarta font-bold">Chat History</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={() => { onNew(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-hide">
          {pinned.length > 0 && (
            <div className="space-y-2">
              <h3 className="px-2 text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Pin className="w-3 h-3" /> Pinned
              </h3>
              {pinned.map(session => (
                <SessionItem 
                  key={session.id}
                  session={session}
                  active={activeSessionId === session.id}
                  editing={editingId === session.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={(id: string) => { onSelect(id); onClose(); }} // Fixed any type
                  onSave={() => saveEdit(session.id)}
                  onToggleMenu={() => setMenuOpenId(menuOpenId === session.id ? null : session.id)}
                  menuOpen={menuOpenId === session.id}
                  onEdit={() => handleEdit(session)}
                  onDelete={() => { onDelete(session.id); setMenuOpenId(null); }}
                  onPin={() => { onTogglePin(session.id, false); setMenuOpenId(null); }}
                />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="px-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Recent</h3>
            {recent.length > 0 ? (
              recent.map(session => (
                <SessionItem 
                  key={session.id}
                  session={session}
                  active={activeSessionId === session.id}
                  editing={editingId === session.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={(id: string) => { onSelect(id); onClose(); }} // Fixed any type
                  onSave={() => saveEdit(session.id)}
                  onToggleMenu={() => setMenuOpenId(menuOpenId === session.id ? null : session.id)}
                  menuOpen={menuOpenId === session.id}
                  onEdit={() => handleEdit(session)}
                  onDelete={() => { onDelete(session.id); setMenuOpenId(null); }}
                  onPin={() => { onTogglePin(session.id, true); setMenuOpenId(null); }}
                />
              ))
            ) : (
              <div className="p-8 text-center space-y-2 opacity-30">
                <MessageSquare className="w-8 h-8 mx-auto" />
                <p className="text-[10px] font-bold">No history yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
          <p className="text-[9px] font-bold text-center text-gray-400 uppercase tracking-widest">
            GNM AI Tutor • Cloud Sync Active
          </p>
        </div>
      </motion.aside>
    </>
  );
}

interface SessionItemProps {
  session: ChatSession;
  active: boolean;
  editing: boolean;
  editTitle: string;
  setEditTitle: (val: string) => void;
  onSelect: (id: string) => void;
  onSave: () => void;
  onToggleMenu: () => void;
  menuOpen: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}

function SessionItem({ 
  session, 
  active, 
  editing, 
  editTitle, 
  setEditTitle, 
  onSelect, 
  onSave, 
  onToggleMenu, 
  menuOpen, 
  onEdit, 
  onDelete, 
  onPin 
}: SessionItemProps) {
  return (
    <div className="relative group">
      <div 
        onClick={() => !editing && onSelect(session.id)}
        className={cn(
          "group w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer",
          active ? "bg-primary/5 border border-primary/10" : "hover:bg-gray-50 border border-transparent"
        )}
      >
        <MessageSquare className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "text-gray-400")} />
        
        {editing ? (
          <input 
            autoFocus
            className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSave()}
            onBlur={onSave}
          />
        ) : (
          <span className={cn("flex-1 text-sm font-bold truncate", active ? "text-slate-900" : "text-slate-600")}>
            {session.title}
          </span>
        )}

        <button 
          onClick={(e) => { e.stopPropagation(); onToggleMenu(); }}
          className={cn(
            "p-1 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100",
            menuOpen && "opacity-100 bg-gray-100"
          )}
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="absolute right-0 top-12 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden"
          >
            <button onClick={onPin} className="w-full flex items-center gap-2 p-3 text-[11px] font-bold text-gray-600 hover:bg-gray-50">
              <Pin className="w-3.5 h-3.5" />
              {session.is_pinned ? "Unpin" : "Pin Chat"}
            </button>
            <button onClick={onEdit} className="w-full flex items-center gap-2 p-3 text-[11px] font-bold text-gray-600 hover:bg-gray-50">
              <Edit2 className="w-3.5 h-3.5" />
              Rename
            </button>
            <button onClick={onDelete} className="w-full flex items-center gap-2 p-3 text-[11px] font-bold text-error hover:bg-error/5">
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
