import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Monitor, Check } from 'lucide-react';
import { Theme } from '../types';
import { Tooltip } from './Tooltip';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  setTheme
}) => {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#F4F1EA] dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden border border-white/50 dark:border-stone-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800">
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Settings</h2>
            <button 
              onClick={onClose}
              className="p-2 text-stone-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors dark:text-stone-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-sm font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-4">Appearance</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', icon: Sun, label: 'Light', tooltip: 'Light Mode' },
                { id: 'dark', icon: Moon, label: 'Dark', tooltip: 'Dark Mode' },
                { id: 'system', icon: Monitor, label: 'System', tooltip: 'Follow System' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id as Theme)}
                  onMouseEnter={() => setHoveredTheme(item.id)}
                  onMouseLeave={() => setHoveredTheme(null)}
                  className={`
                    relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all
                    ${currentTheme === item.id 
                      ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 shadow-md' 
                      : 'bg-transparent border-stone-200 dark:border-stone-800 hover:bg-black/5 dark:hover:bg-white/5'
                    }
                  `}
                >
                  <Tooltip text={item.tooltip} visible={hoveredTheme === item.id} position="top" />
                  <item.icon 
                    size={24} 
                    className={currentTheme === item.id ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'} 
                  />
                  <span className={`text-sm font-semibold ${currentTheme === item.id ? 'text-stone-800 dark:text-stone-100' : 'text-stone-500'}`}>
                    {item.label}
                  </span>
                  
                  {currentTheme === item.id && (
                    <div className="absolute top-2 right-2 text-stone-800 dark:text-stone-100">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <p className="mt-6 text-xs text-stone-400 text-center dark:text-stone-600">
                Setting applies to this device only.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};