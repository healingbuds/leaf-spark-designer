import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useId, useCallback, useEffect, KeyboardEvent, forwardRef } from 'react';

interface TappableYesNoProps {
  question: string;
  description?: string;
  value?: 'yes' | 'no';
  onChange: (value: 'yes' | 'no') => void;
  variant?: 'default' | 'warning' | 'danger';
  required?: boolean;
  disabled?: boolean;
  yesLabel?: string;
  noLabel?: string;
  /** Show warning icon when "Yes" is selected for safety questions */
  showYesWarning?: boolean;
  /** Called when a selection is made (for auto-advance behavior) */
  onComplete?: () => void;
  /** Delay in ms before calling onComplete (default: 300) */
  autoAdvanceDelay?: number;
  /** Whether this is the first question in a group (for initial focus) */
  autoFocus?: boolean;
}

export const TappableYesNo = forwardRef<HTMLDivElement, TappableYesNoProps>(function TappableYesNo({
  question,
  description,
  value,
  onChange,
  variant = 'default',
  required = false,
  disabled = false,
  yesLabel = 'Yes',
  noLabel = 'No',
  showYesWarning = false,
  onComplete,
  autoAdvanceDelay = 300,
  autoFocus = false,
}, ref) {
  const groupId = useId();
  const questionId = `${groupId}-question`;
  const descriptionId = `${groupId}-description`;

  // Call onComplete after selection with optional delay
  useEffect(() => {
    if (value && onComplete) {
      const timer = setTimeout(onComplete, autoAdvanceDelay);
      return () => clearTimeout(timer);
    }
  }, [value, onComplete, autoAdvanceDelay]);

  // Auto-focus first button when autoFocus is true (mobile-safe: uses ref)
  useEffect(() => {
    if (autoFocus && ref && 'current' in ref && ref.current) {
      const firstButton = ref.current.querySelector<HTMLButtonElement>('button[role="radio"]');
      // Only focus on desktop - check for coarse pointer (touch)
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      if (firstButton && !isTouch) {
        setTimeout(() => firstButton.focus(), 150);
      }
    }
  }, [autoFocus, ref]);

  const borderColors = {
    default: 'border-border/50',
    warning: 'border-amber-500/30',
    danger: 'border-destructive/30',
  };

  const bgColors = {
    default: 'bg-muted/30',
    warning: 'bg-amber-500/5',
    danger: 'bg-destructive/5',
  };

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange('yes');
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange('no');
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Allow Enter/Space on focused button
      const target = e.target as HTMLElement;
      if (target.role === 'radio') {
        e.preventDefault();
        target.click();
      }
    }
  }, [disabled, onChange]);

  const cardVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.97 },
    selected: { 
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 400, damping: 25 }
    }
  };

  const checkmarkVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { type: 'spring' as const, stiffness: 500, damping: 25, delay: 0.05 }
    },
    exit: { 
      scale: 0, 
      rotate: 180,
      transition: { duration: 0.15 }
    }
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.3 },
    animate: { 
      scale: [1, 1.5, 1],
      opacity: [0.3, 0, 0.3],
      transition: { duration: 1.5, repeat: Infinity }
    }
  };

  return (
    <div 
      ref={ref}
      className={cn(
        'p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200',
        borderColors[variant],
        bgColors[variant],
        disabled && 'opacity-60 pointer-events-none'
      )}
    >
      <h3 
        id={questionId}
        className="font-medium text-base sm:text-lg mb-1 leading-snug"
      >
        {question} 
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
        {required && <span className="sr-only">(required)</span>}
      </h3>
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-muted-foreground mb-4 leading-relaxed"
        >
          {description}
        </p>
      )}
      
      <div 
        role="radiogroup"
        aria-labelledby={questionId}
        aria-describedby={description ? descriptionId : undefined}
        aria-required={required}
        className="grid grid-cols-2 gap-3"
        onKeyDown={handleKeyDown}
      >
        {/* YES Button */}
        <motion.button
          type="button"
          role="radio"
          aria-checked={value === 'yes'}
          tabIndex={value === 'yes' || !value ? 0 : -1}
          variants={cardVariants}
          initial="initial"
          whileTap="tap"
          animate={value === 'yes' ? 'selected' : 'initial'}
          onClick={() => onChange('yes')}
          disabled={disabled}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 p-4 sm:p-5 rounded-xl border-2 transition-colors duration-200 min-h-[88px] touch-manipulation cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            value === 'yes'
              ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-400'
              : 'border-border/50 hover:border-amber-500/50 hover:bg-amber-500/5 text-foreground'
          )}
        >
          {/* Selection indicator */}
          <AnimatePresence mode="wait">
            {value === 'yes' && (
              <motion.div
                variants={checkmarkVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center shadow-md"
              >
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Warning pulse for safety questions */}
          {showYesWarning && value === 'yes' && (
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-0 rounded-xl border-2 border-amber-500"
            />
          )}

          {/* Icon and label */}
          {showYesWarning && value === 'yes' ? (
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          ) : null}
          <span className="font-semibold text-lg select-none">{yesLabel}</span>
        </motion.button>

        {/* NO Button */}
        <motion.button
          type="button"
          role="radio"
          aria-checked={value === 'no'}
          tabIndex={value === 'no' ? 0 : -1}
          variants={cardVariants}
          initial="initial"
          whileTap="tap"
          animate={value === 'no' ? 'selected' : 'initial'}
          onClick={() => onChange('no')}
          disabled={disabled}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 p-4 sm:p-5 rounded-xl border-2 transition-colors duration-200 min-h-[88px] touch-manipulation cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            value === 'no'
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-border/50 hover:border-primary/50 hover:bg-primary/5 text-foreground'
          )}
        >
          {/* Selection indicator */}
          <AnimatePresence mode="wait">
            {value === 'no' && (
              <motion.div
                variants={checkmarkVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-md"
              >
                <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>

          <span className="font-semibold text-lg select-none">{noLabel}</span>
        </motion.button>
      </div>

      {/* Keyboard hint for screen readers */}
      <p className="sr-only">Use arrow keys to change selection</p>
    </div>
  );
});
