import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scroll';

interface ReadingProgressProps {
  /** Container to track progress within (optional - defaults to full document) */
  containerRef?: React.RefObject<HTMLElement>;
  /** Position of the progress bar */
  position?: 'top' | 'bottom';
  /** Height of the progress bar in pixels */
  height?: number;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Custom class name */
  className?: string;
  /** Color milestones for visual feedback */
  colorMilestones?: boolean;
  /** Z-index for the progress bar */
  zIndex?: number;
}

const ReadingProgress = ({
  containerRef,
  position = 'top',
  height = 3,
  showPercentage = false,
  className,
  colorMilestones = false,
  zIndex = 100,
}: ReadingProgressProps) => {
  const [percentage, setPercentage] = useState(0);
  const reducedMotion = useRef(prefersReducedMotion());
  
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  // Smooth spring animation (respects reduced motion)
  const scaleX = useSpring(scrollYProgress, {
    stiffness: reducedMotion.current ? 400 : 100,
    damping: reducedMotion.current ? 40 : 30,
    restDelta: 0.001,
  });

  // Track percentage for display and color milestones
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setPercentage(Math.round(latest * 100));
    });
    return unsubscribe;
  }, [scrollYProgress]);

  // Get color based on progress milestone
  const getProgressColor = () => {
    if (!colorMilestones) return 'bg-primary';
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-primary';
    if (percentage >= 25) return 'bg-primary/80';
    return 'bg-primary/60';
  };

  return (
    <>
      {/* Progress bar */}
      <motion.div
        className={cn(
          'fixed left-0 right-0 origin-left',
          position === 'top' ? 'top-0' : 'bottom-0',
          getProgressColor(),
          'transition-colors duration-300',
          className
        )}
        style={{
          height,
          scaleX,
          zIndex,
        }}
      />
      
      {/* Percentage indicator */}
      {showPercentage && percentage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'fixed right-4 px-2 py-1 rounded-full',
            'bg-background/80 backdrop-blur-sm border border-border/50',
            'text-xs font-medium text-muted-foreground',
            'shadow-sm',
            position === 'top' ? 'top-4' : 'bottom-4'
          )}
          style={{ zIndex: zIndex + 1 }}
        >
          {percentage}%
        </motion.div>
      )}
    </>
  );
};

export default ReadingProgress;
