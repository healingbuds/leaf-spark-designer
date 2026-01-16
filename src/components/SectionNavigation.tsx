import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSectionNavigation, Section } from '@/hooks/useSectionNavigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SectionNavigationProps {
  sections: Section[];
  className?: string;
  showLabels?: boolean;
  hideOnMobile?: boolean;
  minScroll?: number;
}

const SectionNavigation = ({
  sections,
  className,
  showLabels = false,
  hideOnMobile = true,
  minScroll = 200,
}: SectionNavigationProps) => {
  const { currentSection, scrollToSection, progress } = useSectionNavigation({
    sections,
    syncHash: true,
  });

  // Hide when near top
  const isVisible = typeof window !== 'undefined' && window.scrollY > minScroll;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'fixed right-4 top-1/2 -translate-y-1/2 z-[45]',
            hideOnMobile && 'hidden lg:flex',
            'flex-col items-end gap-3',
            className
          )}
          aria-label="Page sections"
        >
          <TooltipProvider delayDuration={100}>
            {sections.map((section) => {
              const isActive = currentSection === section.id;
              
              return (
                <Tooltip key={section.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        'group flex items-center gap-2 transition-all duration-200',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Go to ${section.label}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      {/* Label (optional) */}
                      {showLabels && (
                        <motion.span
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ 
                            opacity: isActive ? 1 : 0,
                            x: isActive ? 0 : 10 
                          }}
                          className="text-xs font-medium text-foreground/80 whitespace-nowrap"
                        >
                          {section.label}
                        </motion.span>
                      )}
                      
                      {/* Dot indicator */}
                      <motion.div
                        className={cn(
                          'relative flex items-center justify-center',
                          'w-3 h-3 rounded-full',
                          'transition-all duration-200',
                          isActive 
                            ? 'bg-primary shadow-lg shadow-primary/30' 
                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        )}
                        animate={{
                          scale: isActive ? 1.2 : 1,
                        }}
                      >
                        {/* Active ring */}
                        {isActive && (
                          <motion.div
                            layoutId="activeSection"
                            className="absolute inset-0 rounded-full ring-2 ring-primary/30"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </motion.div>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={8}>
                    <p>{section.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
          
          {/* Progress line */}
          <div className="absolute right-[5px] top-0 bottom-0 w-0.5 bg-muted-foreground/10 rounded-full -z-10">
            <motion.div
              className="w-full bg-primary/50 rounded-full origin-top"
              style={{ height: `${progress}%` }}
            />
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default SectionNavigation;
