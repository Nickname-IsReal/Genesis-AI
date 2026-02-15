import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage as IChatMessage } from '../types';
import { Bot, User, MapPin, Search, ThumbsUp, ThumbsDown, Download, Copy, Check, ImageDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Tooltip } from './Tooltip';

interface ChatMessageProps {
  message: IChatMessage;
  onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
  index: number;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFeedback, index }) => {
  const isUser = message.role === 'user';
  const [isCopied, setIsCopied] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([message.text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `genesis-response-${message.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `genesis-image-${message.id}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.23, 1, 0.32, 1],
        delay: Math.min(index * 0.05, 0.2) // Subtle stagger for history load
      }}
      className={`flex w-full mb-10 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[90%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          w-11 h-11 rounded-2xl flex items-center justify-center shrink-0
          ${isUser 
            ? 'bg-[#FFE4D6] dark:bg-[#3d342f] text-slate-900 dark:text-stone-200' 
            : 'bg-slate-800 dark:bg-stone-800 text-[#FFE4D6] dark:text-[#E7E5E4]'}
          shadow-lg ring-1 ring-black/5 dark:ring-white/5
        `}>
          {isUser ? <User size={22} /> : <Bot size={22} />}
        </div>

        {/* Bubble Group */}
        <div className="flex flex-col gap-2 group/msg w-full">
            <motion.div 
              layout
              className={`
              p-6 rounded-3xl text-lg leading-relaxed shadow-xl backdrop-blur-md transition-all duration-500 relative
              ${isUser 
                  ? 'bg-[#FFE4D6]/90 dark:bg-[#2C2420]/90 text-slate-900 dark:text-stone-200 rounded-tr-none border border-transparent dark:border-stone-700/50' 
                  : 'bg-slate-800/90 dark:bg-stone-900/95 text-gray-100 dark:text-stone-200 rounded-tl-none border border-white/5 dark:border-stone-800/80'
              }
              `}
            >
            {message.attachments && message.attachments.length > 0 && (
                <div className="mb-5 flex flex-col gap-5">
                {message.attachments.map((att, i) => (
                    <div key={i} className="relative group/img rounded-2xl overflow-hidden shadow-2xl">
                      {att.type === 'video' ? (
                          <div className="flex items-center gap-3 p-6 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-md">
                              <Bot size={20} className="text-fuchsia-400" />
                              <span className="text-xs uppercase font-black tracking-[0.2em] text-white/70">Multimodal Insight Ready</span>
                          </div>
                      ) : (
                          <div className="relative">
                            <motion.img 
                              initial={{ scale: 1.1, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                              src={att.url} 
                              alt="attachment" 
                              className="rounded-2xl w-full max-h-[600px] object-contain bg-black/5 cursor-zoom-in" 
                            />
                            
                            {!isUser && (
                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.25)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDownloadImage(att.url, i)}
                                className="absolute top-4 right-4 p-3.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white shadow-2xl transition-all"
                              >
                                <ImageDown size={22} />
                              </motion.button>
                            )}
                          </div>
                      )}
                    </div>
                ))}
                </div>
            )}
            
            <div className={`max-w-none ${isUser ? 'prose-stone dark:prose-invert' : 'prose-invert'} prose prose-p:my-1 prose-headings:my-3 prose-code:bg-white/10 prose-code:p-1 prose-code:rounded prose-pre:bg-black/20 prose-pre:rounded-xl`}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>

            {/* Response Metadata/Grounding Chips */}
            {message.groundingMetadata && (
                <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/10">
                    {message.groundingMetadata.searchChunks?.map((chunk, idx) => (
                        <motion.a 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            key={`search-${idx}`}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/20 text-blue-200 text-xs font-bold rounded-full hover:bg-blue-800/40 transition-all hover:scale-105"
                        >
                            <Search size={14} />
                            {chunk.web.title}
                        </motion.a>
                    ))}
                    {message.groundingMetadata.mapChunks?.map((chunk, idx) => (
                         <motion.a 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            key={`map-${idx}`}
                            href={chunk.maps.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-500/20 text-emerald-200 text-xs font-bold rounded-full hover:bg-emerald-800/40 transition-all hover:scale-105"
                        >
                            <MapPin size={14} />
                            {chunk.maps.title}
                        </motion.a>
                    ))}
                </div>
            )}
            </motion.div>

            {/* Action Bar */}
            {!isUser && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2.5 px-3"
              >
                <div className="flex items-center p-1 bg-white/50 dark:bg-stone-800/50 rounded-2xl border border-white/20 dark:border-stone-700/50 backdrop-blur-xl shadow-lg">
                  <button 
                    onClick={() => onFeedback?.(message.id, 'like')}
                    onMouseEnter={() => setHoveredAction('like')}
                    onMouseLeave={() => setHoveredAction(null)}
                    className={`relative p-2.5 rounded-xl transition-all ${message.feedback === 'like' ? 'bg-white dark:bg-stone-700 text-emerald-500 shadow-md' : 'text-stone-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    <ThumbsUp size={16} strokeWidth={message.feedback === 'like' ? 3 : 2} />
                    <Tooltip text="Helpful" visible={hoveredAction === 'like'} />
                  </button>
                  <button 
                    onClick={() => onFeedback?.(message.id, 'dislike')}
                    onMouseEnter={() => setHoveredAction('dislike')}
                    onMouseLeave={() => setHoveredAction(null)}
                    className={`relative p-2.5 rounded-xl transition-all ${message.feedback === 'dislike' ? 'bg-white dark:bg-stone-700 text-rose-500 shadow-md' : 'text-stone-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    <ThumbsDown size={16} strokeWidth={message.feedback === 'dislike' ? 3 : 2} />
                    <Tooltip text="Not Helpful" visible={hoveredAction === 'dislike'} />
                  </button>
                </div>

                <div className="h-5 w-[1px] bg-stone-300 dark:bg-stone-800/50 mx-1" />

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  onMouseEnter={() => setHoveredAction('copy')}
                  onMouseLeave={() => setHoveredAction(null)}
                  className="relative p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 bg-white/50 dark:bg-stone-800/50 rounded-xl border border-white/20 dark:border-stone-700/50 shadow-lg backdrop-blur-xl transition-all"
                >
                  {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  <Tooltip text={isCopied ? "Copied!" : "Copy Text"} visible={hoveredAction === 'copy'} />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadText}
                  onMouseEnter={() => setHoveredAction('download')}
                  onMouseLeave={() => setHoveredAction(null)}
                  className="relative p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 bg-white/50 dark:bg-stone-800/50 rounded-xl border border-white/20 dark:border-stone-700/50 shadow-lg backdrop-blur-xl transition-all"
                >
                  <Download size={16} />
                  <Tooltip text="Save as TXT" visible={hoveredAction === 'download'} />
                </motion.button>
              </motion.div>
            )}
        </div>
      </div>
    </motion.div>
  );
};