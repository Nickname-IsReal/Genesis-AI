import React, { useState, useEffect, useRef } from 'react';
import { Dock } from './components/Dock';
import { InputBar } from './components/InputBar';
import { ChatMessage } from './components/ChatMessage';
import { HistorySidebar } from './components/HistorySidebar';
import { SettingsModal } from './components/SettingsModal';
import { Onboarding } from './components/Onboarding';
import { AppMode, ChatMessage as IChatMessage, Attachment, ChatSession, Theme } from './types';
import { generateResponse } from './services/geminiService';
import { AnimatePresence, motion } from 'framer-motion';
import { Rocket, Sparkles, BrainCircuit, Loader2, Zap, Globe, MapPin, Search, Cpu, Code2, Terminal, Image as ImageIcon, Palette, CloudUpload } from 'lucide-react';

const STORAGE_KEY = 'genesis_chat_sessions_v2';
const LEGACY_STORAGE_KEY = 'genesis_chat_history_v1';
const THEME_STORAGE_KEY = 'genesis_theme';
const ONBOARDING_KEY = 'genesis_onboarding_complete_v1';

// --- Transition Constants ---
const springTransition = { type: "spring", stiffness: 260, damping: 20 };
const fluidTransition = { ease: [0.23, 1, 0.32, 1], duration: 0.8 };

// --- Specialized Loading Components ---

const ImageIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, y: 15 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={springTransition}
    className="flex items-center gap-4 bg-white/70 dark:bg-stone-900/70 p-5 rounded-3xl rounded-tl-none border border-orange-200/50 dark:border-orange-900/30 backdrop-blur-md shadow-xl"
  >
    <div className="relative w-10 h-10 flex items-center justify-center">
      <motion.div 
        animate={{ 
          rotate: [0, 180, 360],
          scale: [1, 1.25, 1],
          borderRadius: ["24%", "50%", "24%"]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-rose-400 opacity-25 blur-md"
      />
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="text-orange-600 dark:text-orange-400 z-10"
      >
        <Palette size={24} />
      </motion.div>
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-orange-900 dark:text-orange-100 tracking-wider uppercase">Visualizing</span>
      <span className="text-[10px] text-orange-500 dark:text-orange-500 font-mono font-bold">IMAGEN 4.0 SYNTHESIS</span>
    </div>
  </motion.div>
);

const ThinkingIndicator = () => {
  const [text, setText] = useState("Reasoning");
  useEffect(() => {
    const states = ["Reasoning", "Analyzing context", "Formulating logic", "Verifying facts", "Optimizing path"];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % states.length;
      setText(states[i]);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={springTransition}
      className="flex items-center gap-4 bg-white/70 dark:bg-stone-900/70 p-5 rounded-3xl rounded-tl-none border border-fuchsia-200/50 dark:border-fuchsia-900/30 backdrop-blur-md shadow-xl"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="text-fuchsia-500/30 dark:text-fuchsia-400/20"
        >
          <Loader2 size={32} />
        </motion.div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400"
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
           <BrainCircuit size={20} className="fill-fuchsia-100 dark:fill-fuchsia-900/50" />
        </motion.div>
      </div>
      <div className="flex flex-col min-w-[140px]">
        <AnimatePresence mode="wait">
          <motion.span 
            key={text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="text-sm font-black text-fuchsia-900 dark:text-fuchsia-100 tracking-wider uppercase"
          >
            {text}
          </motion.span>
        </AnimatePresence>
        <span className="text-[10px] text-fuchsia-500 dark:text-fuchsia-500 font-mono font-bold">DEEP COGNITION ACTIVE</span>
      </div>
    </motion.div>
  );
};

const FastIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, y: 15 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={springTransition}
    className="flex items-center gap-4 bg-white/70 dark:bg-stone-900/70 p-5 rounded-3xl rounded-tl-none border border-amber-200/50 dark:border-amber-900/30 backdrop-blur-md shadow-xl"
  >
    <div className="relative w-10 h-10 flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-amber-400 rounded-full blur-md"
      />
      <motion.div
        animate={{ y: [-1, 1, -1], skew: [0, 5, 0] }}
        transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
        className="text-amber-600 dark:text-amber-400 z-10"
      >
        <Zap size={24} fill="currentColor" />
      </motion.div>
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-amber-900 dark:text-amber-100 tracking-wider uppercase">Flash Processing</span>
      <span className="text-[10px] text-amber-500 dark:text-amber-500 font-mono font-bold">LATENCY OPTIMIZED</span>
    </div>
  </motion.div>
);

const SearchIndicator = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={springTransition}
      className="flex items-center gap-4 bg-white/70 dark:bg-stone-900/70 p-5 rounded-3xl rounded-tl-none border border-blue-200/50 dark:border-blue-900/30 backdrop-blur-md shadow-xl"
    >
      <div className="relative w-10 h-10 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="text-blue-500 dark:text-blue-400"
        >
          <Globe size={28} />
        </motion.div>
        <motion.div 
          className="absolute inset-0 border-2 border-dashed border-blue-400/20 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-black text-blue-900 dark:text-blue-100 tracking-wider uppercase">Crawling Web</span>
        <span className="text-[10px] text-blue-500 dark:text-blue-500 font-mono font-bold">GROUNDING ACTIVE</span>
      </div>
    </motion.div>
);

const CodeIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, y: 15 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={springTransition}
    className="flex items-center gap-4 bg-white/70 dark:bg-stone-900/70 p-5 rounded-3xl rounded-tl-none border border-indigo-200/50 dark:border-indigo-900/30 backdrop-blur-md shadow-xl"
  >
    <div className="relative w-10 h-10 flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 180, 270, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="text-indigo-500 dark:text-indigo-400"
      >
        <Terminal size={28} />
      </motion.div>
      <motion.div 
        className="absolute -right-1 -top-1"
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />
      </motion.div>
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-indigo-900 dark:text-indigo-100 tracking-wider uppercase">Compiling Logic</span>
      <span className="text-[10px] text-indigo-500 dark:text-indigo-500 font-mono font-bold">ALGORITHMIC SYNTHESIS</span>
    </div>
  </motion.div>
);

const ModeLoadingIndicator = ({ mode }: { mode: AppMode }) => {
  switch (mode) {
    case AppMode.THINKING: return <ThinkingIndicator />;
    case AppMode.FAST: return <FastIndicator />;
    case AppMode.SEARCH: return <SearchIndicator />;
    case AppMode.CODE: return <CodeIndicator />;
    case AppMode.IMAGE: return <ImageIndicator />;
    default: return <ThinkingIndicator />;
  }
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'system';
    }
    return 'system';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ONBOARDING_KEY) !== 'true';
  });
  const [isDragging, setIsDragging] = useState(false);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.remove('light', 'dark');
    if (theme === 'system') root.classList.add(systemTheme);
    else root.classList.add(theme);
  }, [theme]);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
        const savedSessions = localStorage.getItem(STORAGE_KEY);
        return savedSessions ? JSON.parse(savedSessions) : [];
    } catch (e) {
        return [];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.FAST);
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession ? currentSession.messages : [];
  const isThinking = currentMode === AppMode.THINKING;

  useEffect(() => {
    if (sessions.length === 0) createNewSession();
    else if (!currentSessionId) setCurrentSessionId(sessions[0].id);
  }, [sessions.length, currentSessionId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const createNewSession = () => {
    const newSession: ChatSession = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        lastModified: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsHistoryOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentSessionId === id && newSessions.length > 0) setCurrentSessionId(newSessions[0].id);
  };
  
  const clearAllHistory = () => {
    setSessions([]);
    setCurrentSessionId('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      setAttachments(prev => [...prev, {
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: base64String,
        mimeType: file.type,
        data: base64Data
      }]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
          if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1];
                setAttachments(prev => [...prev, {
                    type: file.type.startsWith('video') ? 'video' : 'image',
                    url: base64String,
                    mimeType: file.type,
                    data: base64Data
                }]);
            };
            reader.readAsDataURL(file);
          }
      });
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const updateSessionMessages = (sessionId: string, newMessages: IChatMessage[]) => {
    setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
            let title = s.title;
            if (s.messages.length === 0 && newMessages.length > 0 && newMessages[0].role === 'user') {
                 title = newMessages[0].text.slice(0, 30) || "Image Query";
            }
            return { ...s, messages: newMessages, title, lastModified: Date.now() };
        }
        return s;
    }));
  };

  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    if (!currentSessionId) return;
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        const newFeedback = msg.feedback === feedback ? undefined : feedback;
        return { ...msg, feedback: newFeedback };
      }
      return msg;
    });
    updateSessionMessages(currentSessionId, updatedMessages);
  };

  const handlePlay = async () => {
    if ((!inputText.trim() && attachments.length === 0) || isProcessing || !currentSessionId) return;
    const currentAttachments = [...attachments];
    const userText = inputText;
    setInputText('');
    setAttachments([]);
    setIsProcessing(true);
    const newMessage: IChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
      attachments: currentAttachments
    };
    const updatedMessages = [...messages, newMessage];
    updateSessionMessages(currentSessionId, updatedMessages);
    try {
      const result = await generateResponse({
        prompt: newMessage.text,
        attachments: currentAttachments.map(a => ({ mimeType: a.mimeType, data: a.data })),
        mode: currentMode,
        location: location
      });
      
      const responseAttachments: Attachment[] = [];
      if (result.imageUrl) {
        responseAttachments.push({
          type: 'image',
          url: result.imageUrl,
          mimeType: 'image/png',
          data: result.imageUrl.split(',')[1]
        });
      }

      const responseMessage: IChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text,
        timestamp: Date.now(),
        groundingMetadata: result.grounding,
        attachments: responseAttachments.length > 0 ? responseAttachments : undefined
      };
      updateSessionMessages(currentSessionId, [...updatedMessages, responseMessage]);
    } catch (error) {
      const errorMessage: IChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Error connecting to Genesis AI. Check your connection and try again.",
        timestamp: Date.now()
      };
      updateSessionMessages(currentSessionId, [...updatedMessages, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative min-h-screen bg-[#F4F1EA] dark:bg-[#0c0a09] text-slate-800 dark:text-stone-200 font-sans selection:bg-stone-800 selection:text-white dark:selection:bg-stone-200 dark:selection:text-stone-900 overflow-hidden transition-colors duration-700"
    >
      
      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-stone-900/80 backdrop-blur-md flex flex-col items-center justify-center p-8 pointer-events-none"
          >
             <motion.div 
               animate={{ scale: [1, 1.1, 1], y: [0, -10, 0] }} 
               transition={{ duration: 2, repeat: Infinity }}
               className="p-8 rounded-full bg-white/10 border-2 border-white/20 shadow-2xl mb-6"
             >
                <CloudUpload className="text-white" size={64} strokeWidth={1.5} />
             </motion.div>
             <h2 className="text-3xl font-black text-white tracking-tight text-center">DROP TO ATTACH</h2>
             <p className="text-stone-400 font-medium mt-2">Images and videos supported</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refined Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#F4F1EA] dark:bg-[#0c0a09] transition-colors duration-1000" />
          <motion.div 
            animate={{ 
              x: [0, 80, -40, 0], 
              y: [0, -60, 40, 0], 
              scale: [1, 1.15, 0.9, 1],
              opacity: isThinking ? [0.5, 0.7, 0.5] : [0.35, 0.5, 0.35] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-25%] left-[-25%] w-[90vw] h-[90vw] rounded-full blur-[140px] bg-stone-200 dark:bg-stone-800/15" 
          />
          <motion.div 
            animate={{ 
              x: [0, -80, 40, 0], 
              y: [0, 60, -40, 0], 
              scale: [1, 1.25, 1],
              opacity: isThinking ? [0.4, 0.6, 0.4] : [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-25%] right-[-25%] w-[90vw] h-[90vw] rounded-full blur-[160px] bg-stone-300 dark:bg-stone-800/15" 
          />
      </div>

      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      </AnimatePresence>

      <HistorySidebar 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
        onClearHistory={clearAllHistory}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentTheme={theme} setTheme={setTheme} />

      <main className={`relative z-10 w-full max-w-4xl mx-auto h-screen flex flex-col pt-10 pb-52 transition-all duration-700 ${isHistoryOpen ? 'translate-x-12 opacity-40 scale-[0.98]' : 'translate-x-0 opacity-100 scale-100'}`}>
        
        <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-[900] tracking-tight uppercase mb-2 flex items-center gap-2">
                <Sparkles className={isThinking ? "text-fuchsia-600 animate-pulse" : "text-stone-600 dark:text-stone-300"} size={24} />
                <span className="text-stone-800 dark:text-stone-200">GENESIS</span>
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isThinking ? 'from-fuchsia-600 to-purple-600' : 'from-stone-500 to-stone-700 dark:from-stone-400 dark:to-stone-200'}`}>AI</span>
            </h1>
            <motion.div 
              layout
              transition={springTransition}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-xl shadow-sm transition-colors duration-700
              ${isThinking 
                ? 'bg-white/60 dark:bg-stone-900/60 border-fuchsia-200/50 dark:border-fuchsia-900/40' 
                : 'bg-white/40 dark:bg-stone-800/40 border-stone-200/50 dark:border-stone-800/50'}`}
            >
                <div className={`relative w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-700 ${
                    currentMode === AppMode.THINKING ? 'bg-fuchsia-500 text-fuchsia-500' : 
                    currentMode === AppMode.FAST ? 'bg-amber-500 text-amber-500' :
                    currentMode === AppMode.CODE ? 'bg-indigo-500 text-indigo-500' :
                    currentMode === AppMode.IMAGE ? 'bg-orange-500 text-orange-500' :
                    'bg-emerald-500 text-emerald-500'
                }`}>
                  {isThinking && (
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-fuchsia-400"
                      animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className={`text-[10px] font-black tracking-[0.2em] uppercase opacity-90 transition-colors duration-700 ${isThinking ? 'text-fuchsia-800 dark:text-fuchsia-300' : 'text-stone-600 dark:text-stone-400'}`}>
                    {currentMode === AppMode.THINKING ? 'Thinking Active' : currentMode}
                </span>
            </motion.div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-0 scroll-smooth custom-scrollbar">
            {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 0.4, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center pointer-events-none select-none"
                >
                    {isThinking ? (
                         <BrainCircuit size={72} className="mb-6 text-fuchsia-500 drop-shadow-2xl animate-pulse" strokeWidth={1} />
                    ) : (
                        <Rocket size={64} className="mb-6 text-stone-400 dark:text-stone-600 drop-shadow-xl" strokeWidth={1} />
                    )}
                    <p className="text-3xl font-light tracking-wide text-stone-700 dark:text-stone-300">{isThinking ? "Deep Cognition Syncing" : "Genesis Core Active"}</p>
                    <p className="text-xs mt-3 font-mono text-stone-500 dark:text-stone-600 tracking-widest">{isThinking ? "REASONING MODULE INITIALIZED" : "NEURAL BRIDGE READY"}</p>
                </motion.div>
            ) : (
                <div className="pb-16">
                    {messages.map((msg, idx) => (
                        <ChatMessage 
                          key={msg.id} 
                          message={msg} 
                          onFeedback={handleFeedback}
                          index={idx}
                        />
                    ))}
                    
                    <AnimatePresence mode="wait">
                      {isProcessing && (
                           <motion.div 
                              initial={{ opacity: 0, y: 20, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 15, scale: 0.9, transition: { duration: 0.2 } }}
                              transition={springTransition}
                              className="flex justify-start w-full mb-10"
                           >
                              <ModeLoadingIndicator mode={currentMode} />
                          </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>
      </main>

      <InputBar 
        value={inputText}
        onChange={setInputText}
        onEnter={handlePlay}
        onFileSelect={handleFileSelect}
        attachments={attachments}
        onRemoveAttachment={handleRemoveAttachment}
        onSetMode={setCurrentMode}
        currentMode={currentMode}
      />

      <Dock 
        currentMode={currentMode}
        setMode={setCurrentMode}
        onPlay={handlePlay}
        isProcessing={isProcessing}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    </div>
  );
};

export default App;