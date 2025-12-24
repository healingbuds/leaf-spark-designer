/**
 * NavigationMenu Component
 * 
 * Desktop navigation with dropdown menus.
 * Responsibilities:
 * - Desktop navigation items and hierarchy
 * - Dropdown expand/collapse logic
 * - Active state logic
 * - Keyboard navigation
 * - ARIA roles and attributes
 * 
 * NO overlay behavior
 * NO body scroll locking
 */

import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface NavigationMenuProps {
  scrolled: boolean;
  onCloseAllDropdowns?: () => void;
}

const NavigationMenu = ({ scrolled, onCloseAllDropdowns }: NavigationMenuProps) => {
  const [whatWeDoOpen, setWhatWeDoOpen] = useState(false);
  const [aboutUsOpen, setAboutUsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation('common');
  
  // Refs for click-outside detection
  const whatWeDoRef = useRef<HTMLDivElement>(null);
  const aboutUsRef = useRef<HTMLDivElement>(null);

  // Active state detection
  const isActive = (path: string) => location.pathname === path;
  const isWhatWeDoActive = ['/what-we-do', '/cultivating-processing', '/manufacture-distribution', '/medical-clinics', '/online-pharmacy'].includes(location.pathname);
  const isAboutUsActive = ['/about-us', '/blockchain-technology'].includes(location.pathname);

  // Click outside handler
  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    const target = event.target as Node;
    
    if (whatWeDoRef.current && !whatWeDoRef.current.contains(target)) {
      setWhatWeDoOpen(false);
    }
    if (aboutUsRef.current && !aboutUsRef.current.contains(target)) {
      setAboutUsOpen(false);
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

  // Close dropdowns on route change
  useEffect(() => {
    setWhatWeDoOpen(false);
    setAboutUsOpen(false);
  }, [location.pathname]);

  // Navigation item styles - WCAG AA compliant
  const navItemBase = cn(
    "font-body font-semibold transition-all duration-200 ease-out rounded-lg",
    "whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
  );
  
  const navItemSize = scrolled ? "text-xs 2xl:text-sm px-3 py-2" : "text-sm 2xl:text-base px-4 py-2.5";
  
  const getNavItemStyles = (isItemActive: boolean) => cn(
    navItemBase,
    navItemSize,
    isItemActive
      ? "text-white bg-white/25 font-bold shadow-sm border-b-2 border-white" 
      : "text-white/90 hover:text-white hover:bg-white/12"
  );

  // Dropdown item styles
  const dropdownItemBase = cn(
    "block px-5 py-4 transition-all duration-300 relative group/item",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
  );

  // Dropdown animation config
  const dropdownAnimation = {
    initial: { opacity: 0, y: -12, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.97 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }
  };

  // Dropdown styles
  const dropdownStyles = {
    background: 'linear-gradient(135deg, hsl(var(--primary) / 0.95) 0%, hsl(var(--primary) / 0.85) 50%, hsl(var(--secondary) / 0.9) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
  };

  return (
    <nav className={cn(
      "hidden xl:flex items-center justify-center",
      "transition-all duration-500 ease-out mx-4",
      scrolled ? "gap-0.5 xl:gap-1 2xl:gap-2" : "gap-1 xl:gap-2 2xl:gap-3"
    )}>
      {/* What We Do Dropdown */}
      <div 
        ref={whatWeDoRef}
        className="relative group"
        onMouseEnter={() => setWhatWeDoOpen(true)}
        onMouseLeave={() => setWhatWeDoOpen(false)}
      >
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setWhatWeDoOpen(!whatWeDoOpen);
            setAboutUsOpen(false);
          }}
          className={cn(
            getNavItemStyles(isWhatWeDoActive),
            "flex items-center gap-1.5 cursor-pointer select-none hover:scale-105"
          )}
          aria-expanded={whatWeDoOpen}
          aria-haspopup="menu"
        >
          {t('nav.whatWeDo')}
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform duration-150 pointer-events-none",
            whatWeDoOpen && "rotate-180"
          )} />
        </button>
        
        <AnimatePresence>
          {whatWeDoOpen && (
            <motion.div 
              {...dropdownAnimation}
              className="absolute top-full left-0 mt-3 w-80 rounded-2xl overflow-hidden z-[200] shadow-2xl backdrop-blur-xl"
              style={dropdownStyles}
              role="menu"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              
              {[
                { to: '/cultivating-processing', label: 'cultivating', desc: 'cultivatingDesc' },
                { to: '/manufacture-distribution', label: 'manufacture', desc: 'manufactureDesc' },
                { to: '/medical-clinics', label: 'clinics', desc: 'clinicsDesc' },
                { to: '/online-pharmacy', label: 'pharmacy', desc: 'pharmacyDesc' }
              ].map(({ to, label, desc }, index, arr) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    dropdownItemBase,
                    index < arr.length - 1 && "border-b border-white/10",
                    isActive(to)
                      ? "bg-gradient-to-r from-white/20 to-white/10"
                      : "hover:bg-white/10"
                  )}
                  onClick={() => setWhatWeDoOpen(false)}
                  role="menuitem"
                >
                  <div className="flex items-center gap-3 relative z-10">
                    {isActive(to) && (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                    <div>
                      <div className="font-semibold text-white group-hover/item:translate-x-1 transition-transform duration-200">
                        {t(`dropdown.${label}`)}
                      </div>
                      <div className="text-sm text-white/60 mt-0.5">
                        {t(`dropdown.${desc}`)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Link to="/research" className={getNavItemStyles(isActive("/research"))}>
        {t('nav.research')}
      </Link>
      
      <Link 
        to="/the-wire" 
        className={getNavItemStyles(isActive("/the-wire") || location.pathname.startsWith("/the-wire/"))}
      >
        {t('nav.theWire')}
      </Link>
      
      {/* About Us Dropdown */}
      <div 
        ref={aboutUsRef}
        className="relative group"
        onMouseEnter={() => setAboutUsOpen(true)}
        onMouseLeave={() => setAboutUsOpen(false)}
      >
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAboutUsOpen(!aboutUsOpen);
            setWhatWeDoOpen(false);
          }}
          className={cn(
            getNavItemStyles(isAboutUsActive),
            "flex items-center gap-1.5 cursor-pointer select-none hover:scale-105"
          )}
          aria-expanded={aboutUsOpen}
          aria-haspopup="menu"
        >
          {t('nav.aboutUs')}
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform duration-150 pointer-events-none",
            aboutUsOpen && "rotate-180"
          )} />
        </button>
        
        <AnimatePresence>
          {aboutUsOpen && (
            <motion.div 
              {...dropdownAnimation}
              className="absolute top-full left-0 mt-3 w-80 rounded-2xl overflow-hidden z-[200] shadow-2xl backdrop-blur-xl"
              style={dropdownStyles}
              role="menu"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              
              {[
                { to: '/about-us', label: 'aboutHealing', desc: 'aboutHealingDesc' },
                { to: '/blockchain-technology', label: 'blockchain', desc: 'blockchainDesc' }
              ].map(({ to, label, desc }, index, arr) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    dropdownItemBase,
                    index < arr.length - 1 && "border-b border-white/10",
                    isActive(to)
                      ? "bg-gradient-to-r from-white/20 to-white/10"
                      : "hover:bg-white/10"
                  )}
                  onClick={() => setAboutUsOpen(false)}
                  role="menuitem"
                >
                  <div className="flex items-center gap-3 relative z-10">
                    {isActive(to) && (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                    <div>
                      <div className="font-semibold text-white group-hover/item:translate-x-1 transition-transform duration-200">
                        {t(`dropdown.${label}`)}
                      </div>
                      <div className="text-sm text-white/60 mt-0.5">
                        {t(`dropdown.${desc}`)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Link 
        to="/shop" 
        className={getNavItemStyles(isActive("/shop") || location.pathname.startsWith("/shop/"))}
      >
        {t('nav.shop')}
      </Link>
      
      <Link to="/contact" className={getNavItemStyles(isActive("/contact"))}>
        {t('nav.contactUs')}
      </Link>
    </nav>
  );
};

export default NavigationMenu;
