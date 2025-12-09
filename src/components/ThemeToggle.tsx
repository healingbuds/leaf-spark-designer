import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "button";
}

const ThemeToggle = ({ className, variant = "icon" }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "flex items-center gap-2 w-full px-4 py-4 text-left text-sm transition-colors rounded-xl touch-manipulation min-h-[48px]",
          "hover:bg-white/10 active:bg-white/20 text-white/80 hover:text-white",
          className
        )}
      >
        {theme === "dark" ? (
          <>
            <Sun className="w-5 h-5" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-5 h-5" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "p-2.5 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center",
        "text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;