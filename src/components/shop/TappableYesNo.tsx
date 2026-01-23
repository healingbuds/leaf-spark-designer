import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TappableYesNoProps {
  question: string;
  description?: string;
  value?: 'yes' | 'no';
  onChange: (value: 'yes' | 'no') => void;
  variant?: 'default' | 'warning' | 'danger';
  required?: boolean;
}

export function TappableYesNo({
  question,
  description,
  value,
  onChange,
  variant = 'default',
  required = false,
}: TappableYesNoProps) {
  const borderColors = {
    default: 'border-border/50',
    warning: 'border-amber-500/30',
    danger: 'border-red-500/30',
  };

  const bgColors = {
    default: 'bg-muted/30',
    warning: 'bg-amber-500/5',
    danger: 'bg-red-500/5',
  };

  return (
    <div className={cn(
      'p-4 sm:p-5 rounded-2xl border-2 transition-all',
      borderColors[variant],
      bgColors[variant]
    )}>
      <h3 className="font-medium text-base sm:text-lg mb-1">
        {question} {required && <span className="text-destructive">*</span>}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        {/* YES Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange('yes')}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 p-4 sm:p-5 rounded-xl border-2 transition-all min-h-[80px] touch-manipulation',
            value === 'yes'
              ? 'border-amber-500 bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-lg shadow-amber-500/10'
              : 'border-border/50 hover:border-amber-500/50 hover:bg-amber-500/5'
          )}
        >
          {value === 'yes' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center"
            >
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          )}
          <span className="font-semibold text-lg">Yes</span>
        </motion.button>

        {/* NO Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange('no')}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 p-4 sm:p-5 rounded-xl border-2 transition-all min-h-[80px] touch-manipulation',
            value === 'no'
              ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/10'
              : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
          )}
        >
          {value === 'no' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center"
            >
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          )}
          <span className="font-semibold text-lg">No</span>
        </motion.button>
      </div>
    </div>
  );
}
