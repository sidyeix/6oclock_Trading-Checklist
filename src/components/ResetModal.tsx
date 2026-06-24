import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal: FC<ResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          {/* Backdrop click close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          
          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden glass-card p-6 z-10 border border-red-500/20"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
                <AlertTriangle size={24} className="animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Reset Trading Session</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Are you sure you want to reset today's trading session? This will clear all checklists, mental trackers, thoughts, and score calculations.
                </p>
                <p className="text-xs text-red-400/80 mt-2 font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 border border-red-500/30 rounded-lg shadow-lg hover:shadow-red-900/30 transition-all cursor-pointer"
              >
                Reset Session
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
