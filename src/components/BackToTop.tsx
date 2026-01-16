import { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { scrollToTop, prefersReducedMotion } from "@/lib/scroll";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY.current;
        
        // Show conditions:
        // 1. Scrolled past 400px AND
        // 2. Either scrolling down OR not too close to top (>200px)
        const shouldShow = currentScrollY > 400 && 
          (scrollingDown || currentScrollY > 200);
        
        setIsVisible(shouldShow);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    scrollToTop(behavior);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          onClick={handleClick}
          className={cn(
            "fixed bottom-32 md:bottom-8 right-4 md:right-8 z-40 w-12 h-12 rounded-full",
            "bg-gradient-to-br from-primary to-primary/80",
            "text-white shadow-lg hover:shadow-2xl",
            "flex items-center justify-center",
            "transition-all duration-300 hover:scale-110 active:scale-95",
            "border-2 border-white/20 backdrop-blur-sm"
          )}
          whileHover={{ 
            boxShadow: "0 0 25px rgba(77, 191, 161, 0.5)"
          }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
