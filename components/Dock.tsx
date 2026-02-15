import React, { useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  MapPin, 
  Globe, 
  Zap, 
  BrainCircuit,
  MessageSquarePlus,
  History,
  Code2,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppMode } from '../types';
import { Tooltip } from './Tooltip';

interface DockProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  onPlay: () => void;
  isProcessing: boolean;
  onToggleHistory: () => void;
  onOpenSettings: () => void;
}

interface DockButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  large?: boolean;
  disabled?: boolean;
  label: string;
}

const springConfig = { type: "spring", stiffness: 260, damping: 20 };

const DockButton: React.FC<DockButtonProps> = ({ 
  children, 
  onClick, 
  active = false, 
  large = false,
  disabled = false,
  label
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -8 }}
      whileTap={{ scale: 0.95 }}
      transition={springConfig}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      disabled={disabled}
      className={`
        relative flex items-center justify-center 
        transition-all duration-300 ease-out
        ${large 
          ? 'h-20 px-12 rounded-[32px] text-4xl font-black tracking-tighter' 
          : 'h-16 w-16 rounded-[24px]'
        }
        ${active 
            ? 'bg-[#2D2B26] text-[#F4F1EA] shadow-2xl dark:bg-[#E7E5E4] dark:text-[#1C1917]' 
            : 'bg-white/80 text-stone-500 hover:bg-white border border-white/50 dark:bg-stone-800/80 dark:text-stone-400 dark:border-stone-700/50 dark:hover:bg-stone-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg'}
      `}
    >
        <Tooltip text={label} visible={isHovered && !disabled} />
        
        {active && (
            <motion.div 
              layoutId="dock-glow"
              className={`absolute inset-0 blur-xl bg-stone-900 opacity-20 -z-10 dark:bg-white/30 ${large ? 'rounded-[32px]' : 'rounded-[24px]'}`} 
            />
        )}
      {children}
    </motion.button>
  );
};

export const Dock: React.FC<DockProps> = ({ currentMode, setMode, onPlay, isProcessing, onToggleHistory, onOpenSettings }) => {
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);

  const modes = [
    { id: AppMode.FAST, icon: Zap, label: 'Fast', desc: 'Flash 3.0' },
    { id: AppMode.THINKING, icon: BrainCircuit, label: 'Thinking', desc: 'Pro 3.0' },
    { id: AppMode.CODE, icon: Code2, label: 'Code', desc: 'Expert Engineer' },
    { id: AppMode.IMAGE, icon: ImageIcon, label: 'Image', desc: 'Imagen 4.0' },
    { id: AppMode.SEARCH, icon: Globe, label: 'Search', desc: 'Google Search' },
    { id: AppMode.MAPS, icon: MapPin, label: 'Maps', desc: 'Google Maps' },
  ];

  const activeModeItem = modes.find(m => m.id === currentMode) || modes[0];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-5 z-50">
      
      {/* Left Utilities */}
      <div className="flex gap-4 pb-1">
        <DockButton onClick={onToggleHistory} label="History">
            <History size={30} strokeWidth={2.5} />
        </DockButton>
        <DockButton onClick={onOpenSettings} label="Settings">
            <Settings size={30} strokeWidth={2.5} />
        </DockButton>
      </div>

      {/* Main Core Action */}
      <DockButton 
        large 
        active={true} 
        onClick={onPlay}
        disabled={isProcessing}
        label={isProcessing ? "Processing Response" : "Submit Request"}
      >
        <div className="flex items-center gap-5 fill-current">
          {isProcessing ? (
             <motion.div 
               animate={{ rotate: 360, scale: [1, 1.15, 1] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
             >
                <Sparkles size={40} fill="currentColor" />
             </motion.div>
          ) : (
            <>
                <MessageSquarePlus size={40} strokeWidth={2.5} />
                <span className="text-4xl font-[900] tracking-tighter">ASK</span>
            </>
          )}
        </div>
      </DockButton>

      {/* Mode Cluster */}
      <div className="relative pb-1">
        <AnimatePresence>
            {isModeMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 15, scale: 0.9, filter: "blur(12px)" }}
                    transition={springConfig}
                    className="absolute bottom-full right-0 mb-8 w-72 bg-[#F4F1EA]/95 dark:bg-[#1C1917]/95 backdrop-blur-3xl border border-white/60 dark:border-stone-700 rounded-[36px] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.35)] overflow-hidden p-4 flex flex-col gap-2 origin-bottom-right z-50"
                >
                    <div className="px-4 py-2 text-[12px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-2 border-b border-black/5 dark:border-white/5">
                        NEURAL CONFIG
                    </div>
                    {modes.map((mode) => (
                        <motion.button
                            key={mode.id}
                            whileHover={{ scale: 1.02, x: 6 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setMode(mode.id);
                                setIsModeMenuOpen(false);
                            }}
                            className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all ${
                                currentMode === mode.id 
                                ? 'bg-white dark:bg-stone-800 shadow-xl ring-1 ring-black/5 dark:ring-white/5' 
                                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-75 hover:opacity-100'
                            }`}
                        >
                            <div className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                                currentMode === mode.id 
                                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xl scale-110' 
                                : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500'
                            }`}>
                                <mode.icon size={22} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <span className={`text-sm font-black leading-tight ${currentMode === mode.id ? 'text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}`}>
                                    {mode.label}
                                </span>
                                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 leading-tight uppercase tracking-[0.15em] mt-1">
                                    {mode.desc}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>

        <DockButton 
            onClick={() => setIsModeMenuOpen(!isModeMenuOpen)} 
            active={isModeMenuOpen}
            label={`Config: ${activeModeItem.label}`}
        >
            <motion.div
                key={currentMode}
                initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
                animate={{ 
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                    filter: [
                        "drop-shadow(0 0 0px rgba(0,0,0,0))",
                        "drop-shadow(0 0 12px currentColor)",
                        "drop-shadow(0 0 0px rgba(0,0,0,0))"
                    ]
                }}
                transition={{ 
                    scale: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
                    filter: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.2 }
                }}
                className="relative flex items-center justify-center"
            >
                <activeModeItem.icon size={32} strokeWidth={2.5} />
            </motion.div>
            
            <motion.div 
              animate={isModeMenuOpen ? { scale: 1.8, opacity: 1 } : { scale: 1, opacity: 0.6 }}
              className={`absolute top-3.5 right-3.5 w-2 h-2 rounded-full ${isModeMenuOpen ? 'bg-stone-500 dark:bg-stone-400' : 'bg-stone-300 dark:bg-stone-600'}`} 
            />
        </DockButton>
      </div>

    </div>
  );
};