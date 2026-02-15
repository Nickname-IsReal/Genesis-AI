import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  text: string;
  visible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, visible, position = 'top' }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={`
            absolute px-3 py-1.5 bg-stone-900/95 dark:bg-white/95 
            text-stone-50 dark:text-stone-900 text-[10px] font-bold tracking-wider uppercase 
            rounded-lg whitespace-nowrap shadow-xl pointer-events-none z-[100] backdrop-blur-md
            border border-white/10 dark:border-stone-900/10
            ${position === 'top' ? '-top-12 left-1/2 -translate-x-1/2' : ''}
            ${position === 'bottom' ? 'top-full mt-3 left-1/2 -translate-x-1/2' : ''}
            ${position === 'left' ? 'right-full mr-3 top-1/2 -translate-y-1/2' : ''}
            ${position === 'right' ? 'left-full ml-3 top-1/2 -translate-y-1/2' : ''}
          `}
        >
          {text}
          {/* Arrow */}
          <div className={`
            absolute w-2 h-2 rotate-45 bg-stone-900/95 dark:bg-white/95
            ${position === 'top' ? 'top-full -mt-1 left-1/2 -translate-x-1/2' : ''}
            ${position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2' : ''}
            ${position === 'left' ? 'left-full -ml-1 top-1/2 -translate-y-1/2' : ''}
            ${position === 'right' ? 'right-full -mr-1 top-1/2 -translate-y-1/2' : ''}
          `} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};