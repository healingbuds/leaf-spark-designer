import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ConditionOption {
  value: string;
  label: string;
}

interface ConditionChipsProps {
  options: ConditionOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  maxVisible?: number;
  title?: string;
  description?: string;
}

export function ConditionChips({
  options,
  selectedValues,
  onChange,
  maxVisible = 8,
  title,
  description,
}: ConditionChipsProps) {
  const [showAll, setShowAll] = useState(false);
  
  const visibleOptions = showAll ? options : options.slice(0, maxVisible);
  const hasMore = options.length > maxVisible;
  const hiddenSelectedCount = showAll 
    ? 0 
    : selectedValues.filter(v => 
        !options.slice(0, maxVisible).some(opt => opt.value === v)
      ).length;

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-base">{title}</h4>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {selectedValues.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              {selectedValues.length} selected
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {visibleOptions.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <motion.button
                key={option.value}
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleValue(option.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all touch-manipulation',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/50 hover:bg-muted text-foreground border border-border/50 hover:border-primary/30'
                )}
              >
                {isSelected && <Check className="h-3.5 w-3.5" />}
                {option.label}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {hasMore && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-primary hover:text-primary/80"
        >
          {showAll ? (
            <>Show less</>
          ) : (
            <>
              See all {options.length} options
              {hiddenSelectedCount > 0 && (
                <span className="ml-1 text-xs bg-primary/20 px-1.5 py-0.5 rounded">
                  +{hiddenSelectedCount} selected
                </span>
              )}
              <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
