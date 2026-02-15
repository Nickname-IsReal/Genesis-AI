import React, { useRef, useState, useEffect } from 'react';
import { Paperclip, X, Video, Mic, MicOff, Loader2, ImagePlus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from './Tooltip';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { AppMode } from '../types';

interface InputBarProps {
  value: string;
  onChange: (val: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  attachments: { type: string, url: string }[];
  onRemoveAttachment: (index: number) => void;
  onEnter: () => void;
  onSetMode: (mode: AppMode) => void;
  currentMode: AppMode;
}

const springTransition = { type: "spring", stiffness: 260, damping: 25 };

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const InputBar: React.FC<InputBarProps> = ({ 
  value, 
  onChange, 
  onFileSelect,
  attachments,
  onRemoveAttachment,
  onEnter,
  onSetMode,
  currentMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAttachHovered, setIsAttachHovered] = useState(false);
  const [isMicHovered, setIsMicHovered] = useState(false);
  const [isImgGenHovered, setIsImgGenHovered] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    sessionRef.current = null;
  };

  const startListening = async () => {
    try {
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
      }

      setIsListening(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = audioContext.createMediaStreamSource(stream);
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!isListening) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmData = new Uint8Array(int16.buffer);
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: {
                    data: encode(pcmData),
                    mimeType: 'audio/pcm;rate=16000',
                  }
                });
              }).catch(() => stopListening());
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              if (text) {
                onChange(value + (value.length > 0 && !value.endsWith(' ') ? ' ' : '') + text);
              }
            }
          },
          onerror: async (e: any) => {
            if (e?.message?.includes("unavailable") || e?.message?.includes("Requested entity was not found")) {
                if (window.aistudio) await window.aistudio.openSelectKey();
            }
            stopListening();
          },
          onclose: () => stopListening()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          systemInstruction: 'You are a silent transcriptionist. Transcribe audio to text exactly as heard. Do not generate audio responses.',
        }
      });
      sessionRef.current = sessionPromise;
    } catch (err) {
      stopListening();
    }
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleToggleImageMode = () => {
    if (currentMode === AppMode.IMAGE) onSetMode(AppMode.FAST);
    else onSetMode(AppMode.IMAGE);
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  const isImageMode = currentMode === AppMode.IMAGE;

  return (
    <motion.div 
      initial={{ x: "-50%", y: 40, opacity: 0 }}
      animate={{ x: "-50%", y: 0, opacity: 1 }}
      transition={springTransition}
      className="fixed bottom-40 left-1/2 w-[94%] max-w-3xl z-40"
    >
      <motion.div 
        layout
        className={`glass-panel rounded-[32px] px-7 py-5 flex flex-col gap-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-700 bg-white/75 dark:bg-stone-900/80 border-white/60 dark:border-stone-800 ring-1 ${isListening ? 'ring-fuchsia-500/40 dark:ring-fuchsia-400/30' : isImageMode ? 'ring-orange-500/40 dark:ring-orange-400/30' : 'ring-white/40 dark:ring-white/5'}`}
      >
        
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 12 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="flex gap-4 overflow-x-auto pb-1 px-1 scrollbar-hide"
            >
              {attachments.map((att, i) => (
                <motion.div 
                  layout
                  key={i} 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative group shrink-0"
                >
                  <div className="w-20 h-20 rounded-[24px] overflow-hidden border-2 border-white/50 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {att.type === 'video' ? <Video className="text-stone-500" size={28} /> : <img src={att.url} alt="preview" className="w-full h-full object-cover" />}
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemoveAttachment(i)}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 rounded-full p-1.5 text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <motion.button 
              whileHover={{ scale: 1.15, rotate: 12 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={() => setIsAttachHovered(true)}
              onMouseLeave={() => setIsAttachHovered(false)}
              className="relative p-2.5 text-stone-500 hover:text-stone-900 hover:bg-black/5 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-white/10 rounded-2xl transition-all"
            >
              <Paperclip size={26} strokeWidth={2} />
              <Tooltip text="Multimodal" visible={isAttachHovered} />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleImageMode}
              onMouseEnter={() => setIsImgGenHovered(true)}
              onMouseLeave={() => setIsImgGenHovered(false)}
              className={`relative p-2.5 rounded-2xl transition-all duration-300 ${isImageMode ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/40' : 'text-stone-500 hover:text-stone-900 hover:bg-black/5 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-white/10'}`}
            >
              <ImagePlus size={26} strokeWidth={2} />
              <Tooltip text={isImageMode ? "Standard Engine" : "Vision Studio"} visible={isImgGenHovered} />
            </motion.button>
          </div>
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={onFileSelect} />

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : isImageMode ? "Paint a vision..." : "Message Genesis AI..."}
            className={`w-full bg-transparent text-slate-800 dark:text-stone-200 placeholder-stone-400/70 dark:placeholder-stone-500/70 focus:outline-none resize-none font-bold text-xl h-[30px] overflow-hidden leading-relaxed transition-opacity ${isListening ? 'opacity-50' : 'opacity-100'}`}
            rows={1}
            style={{ height: 'auto' }} 
          />

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              onMouseEnter={() => setIsMicHovered(true)}
              onMouseLeave={() => setIsMicHovered(false)}
              className={`p-3 rounded-2xl transition-all duration-500 ${
                isListening 
                  ? 'bg-fuchsia-500 text-white shadow-xl' 
                  : 'text-stone-500 hover:text-stone-900 hover:bg-black/5 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-white/10'
              }`}
            >
              {isListening ? (
                <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Mic size={26} strokeWidth={2} />
                </motion.div>
              ) : (
                <Mic size={26} strokeWidth={2} />
              )}
              <Tooltip text={isListening ? "Streaming" : "Voice Sync"} visible={isMicHovered} />
            </motion.button>
            
            {isListening && (
              <motion.div
                layoutId="mic-pulse"
                className="absolute inset-0 bg-fuchsia-400 rounded-2xl blur-xl -z-10"
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.35, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </div>
      </motion.div>
      
      <div className="text-center mt-6 flex flex-col items-center gap-1.5 select-none pointer-events-none">
         <AnimatePresence mode="wait">
            {isListening ? (
              <motion.span 
                key="listening"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-fuchsia-500 dark:text-fuchsia-400 text-[10px] font-black tracking-[0.4em] uppercase flex items-center gap-2"
              >
                Neural Stream Active
              </motion.span>
            ) : isImageMode ? (
              <motion.span 
                key="image"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-orange-500 dark:text-orange-400 text-[10px] font-black tracking-[0.4em] uppercase flex items-center gap-2"
              >
                Vision Synthesis Mode
              </motion.span>
            ) : (
              <motion.span 
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="text-stone-500 dark:text-stone-500 text-[10px] font-black tracking-[0.5em] uppercase"
              >
                Genesis AI System
              </motion.span>
            )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
};