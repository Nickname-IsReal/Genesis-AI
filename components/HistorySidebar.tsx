import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSession } from '../types';
import { MessageSquare, Trash2, Plus, X, Clock } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearHistory
}) => {
  const [hoveredDeleteId, setHoveredDeleteId] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
          />
          
          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-80 bg-[#F4F1EA]/95 dark:bg-[#0c0a09]/95 border-r border-white/50 dark:border-stone-800 backdrop-blur-xl shadow-2xl z-[60] flex flex-col p-6 transition-colors duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-stone-800 dark:text-stone-200 tracking-tight">History</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-stone-500 dark:text-stone-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="flex items-center justify-center gap-3 w-full py-4 bg-stone-800 dark:bg-stone-700 text-[#F4F1EA] dark:text-stone-100 rounded-2xl font-bold shadow-lg hover:bg-stone-700 dark:hover:bg-stone-600 transition-all active:scale-95 mb-6 group relative"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>New Chat</span>
            </button>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-stone-400 dark:text-stone-600 gap-2">
                    <Clock size={32} />
                    <span className="text-sm font-medium">No history yet</span>
                </div>
              ) : (
                sessions.sort((a, b) => b.lastModified - a.lastModified).map((session) => (
                    <motion.div
                    layout
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group relative flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${
                        session.id === currentSessionId
                        ? 'bg-white dark:bg-stone-800 shadow-md border-stone-200 dark:border-stone-700'
                        : 'hover:bg-white/50 dark:hover:bg-stone-800/50 border-transparent hover:border-white/50 dark:hover:border-stone-700/50'
                    }`}
                    onClick={() => {
                        onSelectSession(session.id);
                        if (window.innerWidth < 768) onClose();
                    }}
                    >
                    <MessageSquare 
                        size={18} 
                        className={session.id === currentSessionId ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400'} 
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-bold truncate ${session.id === currentSessionId ? 'text-stone-800 dark:text-stone-200' : 'text-stone-600 dark:text-stone-400'}`}>
                        {session.title}
                        </h3>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 font-mono mt-0.5">
                        {new Date(session.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    <button
                        onClick={(e) => onDeleteSession(session.id, e)}
                        onMouseEnter={() => setHoveredDeleteId(session.id)}
                        onMouseLeave={() => setHoveredDeleteId(null)}
                        className="relative opacity-0 group-hover:opacity-100 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                        <Trash2 size={16} />
                        <Tooltip text="Delete" visible={hoveredDeleteId === session.id} position="top" />
                    </button>
                    </motion.div>
                ))
              )}
            </div>

             {/* Footer Info & Actions */}
             <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800">
                {sessions.length > 0 && (
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
                                onClearHistory();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 mb-4 text-xs font-bold text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all uppercase tracking-wide group relative"
                    >
                        <Trash2 size={14} />
                        Clear All History
                    </button>
                )}
                <div className="text-center">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400 dark:text-stone-600">
                        Stored Locally
                    </span>
                </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};