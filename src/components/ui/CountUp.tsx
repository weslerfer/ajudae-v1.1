import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { cn } from '../../utils/cn';

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  onComplete?: () => void;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1.2,
  className,
  prefix = '',
  suffix = '',
  decimals = 2,
  onComplete
}) => {
  const [isReady, setIsReady] = useState(false);
  const count = useMotionValue(0);
  
  const formattedText = useTransform(count, (latest) => {
    return `${prefix}${latest.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(count, value, {
      duration: duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo equivalent for punchy start and slow finish
      onComplete: () => {
        setIsReady(true);
        if (onComplete) onComplete();
      }
    });

    return controls.stop;
  }, [value, duration, count, onComplete]);

  return (
    <motion.span className={cn('tabular-nums tracking-tight', className)}>
      {formattedText}
    </motion.span>
  );
};
