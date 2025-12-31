import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  isDark?: boolean;
}

const AnimatedMenuButton = ({ isOpen, onClick, className = "", isDark = true }: AnimatedMenuButtonProps) => {
  const barTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
      whileTap={{ scale: 0.92 }}
      whileHover={{ backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 128, 128, 0.1)" }}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div className="relative w-6 h-5 flex flex-col justify-between">
        {/* Top bar */}
        <motion.span
          className={cn(
            "absolute top-0 left-0 w-full h-0.5 rounded-full origin-center",
            isDark ? "bg-white" : "bg-teal-700"
          )}
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 9 : 0,
          }}
          transition={barTransition}
        />
        
        {/* Middle bar */}
        <motion.span
          className={cn(
            "absolute top-1/2 left-0 w-full h-0.5 rounded-full origin-center -translate-y-1/2",
            isDark ? "bg-white" : "bg-teal-700"
          )}
          animate={{
            opacity: isOpen ? 0 : 1,
            scaleX: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.15 }}
        />
        
        {/* Bottom bar */}
        <motion.span
          className={cn(
            "absolute bottom-0 left-0 w-full h-0.5 rounded-full origin-center",
            isDark ? "bg-white" : "bg-teal-700"
          )}
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -9 : 0,
          }}
          transition={barTransition}
        />
      </div>
    </motion.button>
  );
};

export default AnimatedMenuButton;
