import { useState, useRef, useCallback, useId, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
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
  /** Auto-focus first chip on mount (desktop only) */
  autoFocus?: boolean;
  /** ID for accessibility labeling */
  id?: string;
}

export function ConditionChips({
  options,
  selectedValues,
  onChange,
  maxVisible = 8,
  title,
  description,
  autoFocus = false,
  id: propId,
}: ConditionChipsProps) {
  const generatedId = useId();
  const id = propId || generatedId;
  const [showAll, setShowAll] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const visibleOptions = showAll ? options : options.slice(0, maxVisible);
  const hasMore = options.length > maxVisible;
  const hiddenSelectedCount = showAll 
    ? 0 
    : selectedValues.filter(v => 
        !options.slice(0, maxVisible).some(opt => opt.value === v)
      ).length;

  // Auto-focus first chip on desktop
  useEffect(() => {
    if (autoFocus) {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      if (!isTouch && chipRefs.current[0]) {
        setTimeout(() => {
          chipRefs.current[0]?.focus();
          setFocusedIndex(0);
        }, 150);
      }
    }
  }, [autoFocus]);

  const toggleValue = useCallback((value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  }, [selectedValues, onChange]);

  // Roving tabindex keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const chips = chipRefs.current.filter(Boolean);
    const currentIndex = focusedIndex >= 0 ? focusedIndex : 0;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % chips.length;
        setFocusedIndex(nextIndex);
        chips[nextIndex]?.focus();
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = currentIndex === 0 ? chips.length - 1 : currentIndex - 1;
        setFocusedIndex(prevIndex);
        chips[prevIndex]?.focus();
        break;
      }
      case 'Home': {
        e.preventDefault();
        setFocusedIndex(0);
        chips[0]?.focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        const lastIndex = chips.length - 1;
        setFocusedIndex(lastIndex);
        chips[lastIndex]?.focus();
        break;
      }
      case ' ':
      case 'Enter': {
        e.preventDefault();
        const option = visibleOptions[currentIndex];
        if (option) {
          toggleValue(option.value);
        }
        break;
      }
    }
  }, [focusedIndex, visibleOptions, toggleValue]);

  const handleChipFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 id={`${id}-title`} className="font-semibold text-base">
              {title}
            </h4>
            {description && (
              <p id={`${id}-description`} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {selectedValues.length > 0 && (
            <span 
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium shrink-0"
              aria-live="polite"
            >
              {selectedValues.length} selected
            </span>
          )}
        </div>
      )}

      <div 
        ref={containerRef}
        role="listbox"
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-describedby={description ? `${id}-description` : undefined}
        aria-multiselectable="true"
        className="flex flex-wrap gap-2"
        onKeyDown={handleKeyDown}
      >
        <AnimatePresence mode="popLayout">
          {visibleOptions.map((option, index) => {
            const isSelected = selectedValues.includes(option.value);
            const isFocused = focusedIndex === index;
            
            return (
              <motion.button
                key={option.value}
                ref={(el) => { chipRefs.current[index] = el; }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={isFocused || (focusedIndex === -1 && index === 0) ? 0 : -1}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleValue(option.value)}
                onFocus={() => handleChipFocus(index)}
                className={cn(
                  // Mobile-first: 44px minimum touch target
                  'inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all touch-manipulation',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/50 hover:bg-muted text-foreground border border-border/50 hover:border-primary/30'
                )}
              >
                <AnimatePresence mode="wait">
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, width: 0 }}
                      animate={{ scale: 1, width: 'auto' }}
                      exit={{ scale: 0, width: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
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
          onClick={() => {
            setShowAll(!showAll);
            // Reset focus when expanding/collapsing
            setFocusedIndex(-1);
          }}
          className="text-primary hover:text-primary/80 min-h-[44px]"
        >
          {showAll ? (
            <>
              Show less
              <ChevronUp className="ml-1 h-4 w-4" />
            </>
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

      {/* Screen reader announcement for selection changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedValues.length > 0 
          ? `${selectedValues.length} items selected`
          : 'No items selected'}
      </div>
    </div>
  );
}
