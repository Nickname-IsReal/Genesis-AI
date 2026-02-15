import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, BrainCircuit, Search, MapPin, X, History, Settings, Image as ImageIcon } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  targetLabel: string;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: "Welcome to Genesis",
      description: "Experience the next generation of AI interaction. Fast, smart, and deeply integrated with your world.",
      icon: <Sparkles className="text-stone-800 dark:text-white" size={48} />,
      position: 'center',
      targetLabel: "Let's Begin"
    },
    {
      title: "Adaptive Modes",
      description: "Switch modes via the Dock. Use 'Thinking' for deep logic, 'Fast' for speed, or 'Search' and 'Maps' for real-time grounding.",
      icon: (
        <div className="flex gap-2">
            <Zap size={24} className="text-amber-500" />
            <BrainCircuit size={24} className="text-fuchsia-500" />
            <Search size={24} className="text-blue-500" />
            <MapPin size={24} className="text-emerald-500" />
        </div>
      ),
      position: 'bottom-right',
      targetLabel: "Got it"
    },
    {
      title: "Your Workspace",
      description: "Access your conversation history and customize your theme or preferences from the left utility cluster.",
      icon: (
        <div className="flex gap-2">
            <History size={24} className="text-stone-500" />
            <Settings size={24} className="text-stone-500" />
        </div>
      ),
      position: 'bottom-left',
      targetLabel: "Next"
    },
    {
      title: "Multimodal Power",
      description: "Genesis isn't just text. Attach images or videos to analyze them with industry-leading precision.",
      icon: <ImageIcon className="text-stone-800 dark:text-white" size={32} />,
      position: 'bottom-center',
      targetLabel: "Start Chatting"
    }
  ];

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  const getPositionClass = (pos: string) => {
    switch (pos) {
      case 'bottom-right': return 'bottom-32 right-8 md:right-[calc(50%-400px)]';
      case 'bottom-left': return 'bottom-32 left-8 md:left-[calc(50%-400px)]';
      case 'bottom-center': return 'bottom-52 left-1/2 -translate-x-1/2';
      default: return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Dark Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] pointer-events-auto"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`absolute z-10 w-[90%] max-w-sm p-8 rounded-[2.5rem] glass-panel shadow-2xl border-white/40 dark:border-stone-700/50 ${getPositionClass(step.position)}`}
        >
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-stone-800 dark:bg-stone-200' : 'w-2 bg-stone-300 dark:bg-stone-800'}`} 
              />
            ))}
          </div>

          <div className="mb-6">
            {step.icon}
          </div>

          <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 mb-3 tracking-tight">
            {step.title}
          </h2>
          
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-8">
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <button 
              onClick={onComplete}
              className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600 dark:text-stone-600 dark:hover:text-stone-400 transition-colors"
            >
              Skip Tour
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-2xl font-bold shadow-lg shadow-stone-500/20"
            >
              <span>{step.targetLabel}</span>
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Spotlight Effect for specific steps */}
      <AnimatePresence>
        {currentStep === 1 && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-8 right-8 md:right-[calc(50%-180px)] w-20 h-20 rounded-3xl border-2 border-dashed border-white/50 pointer-events-none"
            >
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20 blur-xl rounded-full"
                />
            </motion.div>
        )}
        {currentStep === 2 && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-8 left-8 md:left-[calc(50%-180px)] w-36 h-20 rounded-3xl border-2 border-dashed border-white/50 pointer-events-none"
            >
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20 blur-xl rounded-full"
                />
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};