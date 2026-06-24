import { useState } from 'react';
import type { FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp } from 'lucide-react';

interface MobileVerdictFABProps {
  score: number;
  verdictLabel: string;
  children: ReactNode; // The full ScoreEngine + Execution Gateway content
}

export const MobileVerdictFAB: FC<MobileVerdictFABProps> = ({ score, verdictLabel, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Score-based color theming
  let bgColor = 'bg-red-500/20 border-red-500/40';
  let dotColor = 'bg-red-500';
  let textColor = 'text-red-400';

  if (score >= 85) {
    bgColor = 'bg-amber-500/20 border-amber-500/40';
    dotColor = 'bg-amber-400';
    textColor = 'text-amber-300';
  } else if (score >= 70) {
    bgColor = 'bg-emerald-500/20 border-emerald-500/40';
    dotColor = 'bg-emerald-400';
    textColor = 'text-emerald-300';
  } else if (score >= 50) {
    bgColor = 'bg-amber-500/20 border-amber-500/40';
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-400';
  }

  return (
    <>
      {/* Floating Action Button — visible only on mobile/tablet */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <AnimatePresence>
          {!isExpanded && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsExpanded(true)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl cursor-pointer ${bgColor}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${dotColor}`} />
              <span className={`text-lg font-black font-mono ${textColor}`}>{score}%</span>
              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold max-w-[80px] truncate">
                {verdictLabel}
              </span>
              <ChevronUp size={14} className="text-gray-400" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Overlay — full verdict + execution panel */}
      <AnimatePresence>
        {isExpanded && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />

            {/* Content panel — slides up from bottom */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative mt-auto max-h-[85vh] overflow-y-auto bg-[#0c0d12] border-t border-white/10 rounded-t-2xl"
            >
              {/* Close handle */}
              <div className="sticky top-0 z-10 bg-[#0c0d12] border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Verdict Engine</span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Injected content */}
              <div className="p-4 space-y-4">
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
