import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  scrolled?: boolean;
}

const LanguageSwitcher = ({ scrolled }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "pt", label: "Português", flag: "🇵🇹" },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("i18nextLng", langCode);
    setIsOpen(false);
  };

  // Click outside handler
  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 font-medium transition-all duration-300 ease-out rounded-xl hover:scale-105 flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px] justify-center",
          scrolled ? "text-xs xl:text-sm p-2.5" : "text-xs xl:text-sm p-2.5 xl:p-3",
          "text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20"
        )}
        aria-label="Change language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-xs xl:text-sm font-semibold uppercase">{currentLang.code}</span>
      </button>

      <div
        className={cn(
          "absolute top-full right-0 mt-2 w-44 bg-background rounded-xl shadow-card border border-border/40 overflow-hidden transition-all duration-150 z-50",
          isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
        )}
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "w-full px-4 py-4 text-left text-base hover:bg-muted transition-colors flex items-center gap-3 touch-manipulation min-h-[52px]",
              i18n.language === lang.code
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground"
            )}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;