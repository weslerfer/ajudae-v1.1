import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../../providers/FeedbackProvider';
import { usePageTransition } from '../../experience/hooks/usePageTransition';

interface GlobalProgressBarProps {
  isTransitioning?: boolean;
}

export const GlobalProgressBar: React.FC<GlobalProgressBarProps> = ({ isTransitioning = false }) => {
  const { isGlobalLoading } = useFeedback();
  const [progress, setProgress] = useState(0);

  const isActive = isTransitioning || isGlobalLoading;

  useEffect(() => {
    let interval: any;
    if (isActive) {
      setProgress(15);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 300);
    } else {
      setProgress(100);
      const timer = setTimeout(() => {
        setProgress(0);
      }, 300); // fade out time
      return () => clearTimeout(timer);
    }
    
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] z-[9999] pointer-events-none">
      <AnimatePresence>
        {(isActive || progress > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.2 } }}
            className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] relative"
            style={{ width: `${progress}%`, transition: 'width 0.2s ease-out' }}
          >
            {/* Glow Head */}
            <div className="absolute right-0 top-0 h-full w-[100px] shadow-[0_0_15px_rgba(52,211,153,1)] bg-gradient-to-r from-transparent to-white rounded-full opacity-80" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
