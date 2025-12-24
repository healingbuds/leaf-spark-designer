import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import EligibilityDialog from "./EligibilityDialog";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface HeaderProps {
  onMenuStateChange?: (isOpen: boolean) => void;
}

/**
 * Header Component - Systems-Level Architecture
 * 
 * STRUCTURE: 3-Zone Grid Layout
 * - Left Zone: Logo (fixed width, never shrinks)
 * - Center Zone: Navigation (flexible, collapses first)
 * - Right Zone: Actions (fixed width, never overlaps)
 * 
 * OVERLAY: Full viewport ownership
 * - 100vw/100vh coverage
 * - Focus trapped within menu
 * - Background scroll locked
 * - Screen readers blocked from background
 */
const Header = ({ onMenuStateChange }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [whatWeDoOpen, setWhatWeDoOpen] = useState(false);
  const [aboutUsOpen, setAboutUsOpen] = useState(false);
  const [mobileWhatWeDoOpen, setMobileWhatWeDoOpen] = useState(false);
  const [mobileAboutUsOpen, setMobileAboutUsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { t } = useTranslation('common');
  
  // Refs for click-outside detection
  const whatWeDoRef = useRef<HTMLDivElement>(null);
  const aboutUsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  
  // Focus trap for mobile menu accessibility
  const focusTrapRef = useFocusTrap(mobileMenuOpen);
  
  // Scroll progress tracking
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    onMenuStateChange?.(mobileMenuOpen);
  }, [mobileMenuOpen, onMenuStateChange]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    setMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;
  
  const isWhatWeDoActive = ['/what-we-do', '/cultivating-processing', '/manufacture-distribution', '/medical-clinics', '/online-pharmacy'].includes(location.pathname);
  const isAboutUsActive = ['/about-us', '/blockchain-technology'].includes(location.pathname);

  // Reset mobile dropdown states when menu closes
  useEffect(() => {
    if (!mobileMenuOpen) {
      setMobileWhatWeDoOpen(false);
      setMobileAboutUsOpen(false);
    }
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open - comprehensive iOS support
  useEffect(() => {
    const scrollY = window.scrollY;
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';
    } else {
      const savedScrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
      if (savedScrollY) {
        window.scrollTo(0, parseInt(savedScrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close dropdowns on route change
  useEffect(() => {
    setWhatWeDoOpen(false);
    setAboutUsOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Shared navigation item styles - WCAG AA compliant
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
    "block px-5 py-4 transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-inset"
  );

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 sm:top-2 sm:left-2 sm:right-2 h-1 bg-primary/20 z-[60] sm:rounded-t-xl">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-secondary to-primary origin-left will-change-transform"
          style={{ 
            scaleX,
            transformOrigin: "0%"
          }}
        />
      </div>
      
      <header 
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 sm:top-2 sm:left-2 sm:right-2 z-50",
          "backdrop-blur-xl rounded-none sm:rounded-xl transition-all duration-500 ease-out",
          "border-b sm:border",
          scrolled 
            ? "shadow-2xl border-white/20 sm:scale-[0.99]" 
            : "shadow-sm border-white/10"
        )}
        style={{ 
          backgroundColor: `hsl(var(--nav-bg${scrolled ? '-elevated' : ''}))`,
          transition: 'background-color 0.5s ease-out, transform 0.5s ease-out'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          {/* 
            3-ZONE GRID LAYOUT - Regression-proof architecture
            - Grid ensures zones never overlap regardless of content
            - Left/Right zones have fixed constraints
            - Center zone flexes to available space
          */}
          <div className={cn(
            "grid grid-cols-[auto_1fr_auto] items-center gap-4",
            "transition-all duration-500 ease-out",
            scrolled ? "h-20 md:h-[88px]" : "h-24 md:h-28"
          )}>
            
            {/* ZONE 1: Left - Logo (fixed width, never shrinks) */}
            <Link 
              to="/" 
              className="flex items-center flex-shrink-0 group justify-self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg"
            >
              <img 
                src={hbLogoWhite} 
                alt="Healing Buds Logo" 
                className={cn(
                  "w-auto object-contain transition-all duration-500 ease-out group-hover:scale-105",
                  scrolled ? "h-12 sm:h-14 md:h-16" : "h-14 sm:h-16 md:h-20"
                )}
              />
            </Link>
          
            {/* ZONE 2: Center - Navigation (flexible, adapts to available space) */}
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
                
                {/* Dropdown Menu - High contrast, proper z-index hierarchy */}
                <AnimatePresence>
                  {whatWeDoOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-3 w-80 rounded-xl overflow-hidden z-[200] shadow-2xl"
                      style={{ 
                        backgroundColor: 'hsl(var(--nav-dropdown-bg))',
                        border: '1px solid hsl(var(--nav-dropdown-border))'
                      }}
                      role="menu"
                    >
                      <Link
                        to="/cultivating-processing"
                        className={cn(
                          dropdownItemBase,
                          isActive("/cultivating-processing")
                            ? "bg-white/15 border-l-4 border-white"
                            : "hover:bg-white/10 border-l-4 border-transparent"
                        )}
                        style={{ borderBottom: '1px solid hsl(var(--nav-dropdown-border))' }}
                        onClick={() => setWhatWeDoOpen(false)}
                        role="menuitem"
                      >
                        <div className="font-semibold text-white">{t('dropdown.cultivating')}</div>
                        <div className="text-sm text-white/70 mt-0.5">{t('dropdown.cultivatingDesc')}</div>
                      </Link>
                      <Link
                        to="/manufacture-distribution"
                        className={cn(
                          dropdownItemBase,
                          isActive("/manufacture-distribution")
                            ? "bg-white/15 border-l-4 border-white"
                            : "hover:bg-white/10 border-l-4 border-transparent"
                        )}
                        style={{ borderBottom: '1px solid hsl(var(--nav-dropdown-border))' }}
                        onClick={() => setWhatWeDoOpen(false)}
                        role="menuitem"
                      >
                        <div className="font-semibold text-white">{t('dropdown.manufacture')}</div>
                        <div className="text-sm text-white/70 mt-0.5">{t('dropdown.manufactureDesc')}</div>
                      </Link>
                      <Link
                        to="/medical-clinics"
                        className={cn(
                          dropdownItemBase,
                          isActive("/medical-clinics")
                            ? "bg-white/15 border-l-4 border-white"
                            : "hover:bg-white/10 border-l-4 border-transparent"
                        )}
                        style={{ borderBottom: '1px solid hsl(var(--nav-dropdown-border))' }}
                        onClick={() => setWhatWeDoOpen(false)}
                        role="menuitem"
                      >
                        <div className="font-semibold text-white">{t('dropdown.clinics')}</div>
                        <div className="text-sm text-white/70 mt-0.5">{t('dropdown.clinicsDesc')}</div>
                      </Link>
                      <Link
                        to="/online-pharmacy"
                        className={cn(
                          dropdownItemBase,
                          isActive("/online-pharmacy")
                            ? "bg-white/15 border-l-4 border-white"
                            : "hover:bg-white/10 border-l-4 border-transparent"
                        )}
                        onClick={() => setWhatWeDoOpen(false)}
                        role="menuitem"
                      >
                        <div className="font-semibold text-white">{t('dropdown.pharmacy')}</div>
                        <div className="text-sm text-white/70 mt-0.5">{t('dropdown.pharmacyDesc')}</div>
                      </Link>
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
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-3 w-80 rounded-xl overflow-hidden z-[200] shadow-2xl"
                      style={{ 
                        backgroundColor: 'hsl(var(--nav-dropdown-bg))',
                        border: '1px solid hsl(var(--nav-dropdown-border))'
                      }}
                      role="menu"
                    >
                      <Link
                        to="/about-us"
                        className={cn(
                          dropdownItemBase,
                          isActive("/about-us")
                            ? "bg-white/15 border-l-4 border-white"
                            : "hover:bg-white/10 border-l-4 border-transparent"
                        )}
                        style={{ borderBottom: '1px solid hsl(var(--nav-dropdown-border))' }}
                        onClick={() => setAboutUsOpen(false)}
                        role="menuitem"
                      >
                        <div className="font-semibold text-white">{t('dropdown.aboutHealing')}</div>
                        <div className="text-sm text-white/70 mt-0.5">{t('dropdown.aboutHealingDesc')}</div>
                      </Link>
                      <Link
                        to="/blockchain-technology"
                        className={cn(
                          dropdownItemBase,
                          isActive("/blockchain-technology")
                            ? "bg-white/15 border-l-4 border-white"
                            : "hover:bg-white/10 border-l-4 border-transparent"
                        )}
                        onClick={() => setAboutUsOpen(false)}
                        role="menuitem"
                      >
                        <div className="font-semibold text-white">{t('dropdown.blockchain')}</div>
                        <div className="text-sm text-white/70 mt-0.5">{t('dropdown.blockchainDesc')}</div>
                      </Link>
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
            
            {/* ZONE 3: Right - Actions (fixed width container, never overlaps nav) */}
            <div className="hidden xl:flex items-center gap-2 2xl:gap-3 justify-self-end flex-shrink-0">
              <LanguageSwitcher scrolled={scrolled} />
              <ThemeToggle />

              {/* Action Buttons - explicit constraints prevent collapse */}
              <div className="flex items-center gap-1.5 xl:gap-2 flex-shrink-0 ml-2">
                <button
                  onClick={() => setEligibilityDialogOpen(true)}
                  className={cn(
                    "font-body font-bold px-4 py-2 rounded-full transition-all duration-300",
                    "hover:scale-105 hover:shadow-xl whitespace-nowrap",
                    "bg-white text-[#2A3D3A] hover:bg-white/95",
                    "border-2 border-white shadow-lg",
                    "text-xs 2xl:text-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
                  )}
                >
                  {t('nav.checkEligibility')}
                </button>
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={cn(
                        "font-body font-bold px-4 py-2 rounded-full transition-all duration-300",
                        "hover:scale-105 hover:shadow-xl whitespace-nowrap",
                        "bg-primary text-white hover:bg-primary/90",
                        "border-2 border-primary shadow-lg flex items-center gap-1.5",
                        "text-xs 2xl:text-sm",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
                      )}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Patient Portal
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={cn(
                        "font-body font-bold px-4 py-2 rounded-full transition-all duration-300",
                        "hover:scale-105 hover:shadow-xl whitespace-nowrap",
                        "bg-transparent text-white hover:bg-white/20",
                        "border-2 border-white/60 shadow-lg flex items-center gap-1.5",
                        "text-xs 2xl:text-sm",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
                      )}
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.signOut')}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className={cn(
                      "font-body font-bold px-4 py-2 rounded-full transition-all duration-300",
                      "hover:scale-105 hover:shadow-xl whitespace-nowrap",
                      "bg-transparent text-white hover:bg-white/20",
                      "border-2 border-white/60 shadow-lg",
                      "text-xs 2xl:text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
                    )}
                  >
                    {t('nav.patientLogin')}
                  </Link>
                )}
              </div>
            </div>

            {/* Eligibility Dialog */}
            <EligibilityDialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen} />

          {/* Mobile Menu Button & Theme Toggle */}
            <div className="xl:hidden flex items-center gap-3 justify-self-end">
              <ThemeToggle />
              <button
                type="button"
                className={cn(
                  "text-white p-3 rounded-xl transition-all duration-300",
                  "hover:scale-110 active:scale-95 touch-manipulation",
                  "min-h-[48px] min-w-[48px] flex items-center justify-center",
                  "hover:bg-white/10 active:bg-white/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                  scrolled && "p-2.5"
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className={cn("transition-all duration-300", scrolled ? "w-6 h-6" : "w-7 h-7")} />
                ) : (
                  <Menu className={cn("transition-all duration-300", scrolled ? "w-6 h-6" : "w-7 h-7")} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION - OUTSIDE HEADER for true full-viewport ownership */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop - solid opaque to completely block background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="xl:hidden fixed inset-0 z-[9998]"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Menu Surface - highest z-index, owns entire viewport */}
            <motion.nav 
              ref={focusTrapRef as React.RefObject<HTMLElement>}
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="xl:hidden fixed inset-0 z-[9999] flex flex-col"
              style={{ 
                backgroundColor: 'hsl(178 35% 22%)',
                height: '100dvh',
                minHeight: '100vh'
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Menu Header - fixed height */}
              <div 
                className="flex-shrink-0 flex items-center justify-between px-5"
                style={{ 
                  height: '72px', 
                  backgroundColor: 'hsl(178 35% 18%)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
                >
                  <img 
                    src={hbLogoWhite} 
                    alt="Healing Buds Logo" 
                    className="h-12 w-auto object-contain"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              
              {/* Scrollable menu content - explicit height with iOS safe area */}
              <div 
                className="flex-1 overflow-y-auto py-6 px-5"
                style={{ 
                  height: 'calc(100dvh - 72px)',
                  minHeight: 'calc(100vh - 72px)',
                  paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))'
                }}
              >
                    {/* Navigation Links */}
                    <div className="flex flex-col space-y-1">
                      {/* What We Do Section */}
                      <div className="space-y-1">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMobileWhatWeDoOpen(!mobileWhatWeDoOpen);
                          }}
                          className={cn(
                            "w-full font-semibold text-base py-4 px-5 rounded-xl",
                            "flex items-center justify-between transition-all duration-150",
                            "cursor-pointer touch-manipulation min-h-[56px] active:scale-[0.98]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                            isWhatWeDoActive 
                              ? "text-white bg-white/25 border-l-4 border-white" 
                              : "text-white hover:bg-white/15 active:bg-white/20"
                          )}
                          aria-expanded={mobileWhatWeDoOpen}
                        >
                          {t('nav.whatWeDo')}
                          <ChevronDown className={cn(
                            "w-5 h-5 transition-transform duration-150 pointer-events-none text-white/80",
                            mobileWhatWeDoOpen && "rotate-180"
                          )} />
                        </button>
                        <AnimatePresence>
                          {mobileWhatWeDoOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden ml-3 pl-4 border-l-2 border-white/30"
                            >
                              <div className="space-y-1 py-2">
                                {[
                                  { to: '/cultivating-processing', label: 'cultivating' },
                                  { to: '/manufacture-distribution', label: 'manufacture' },
                                  { to: '/medical-clinics', label: 'clinics' },
                                  { to: '/online-pharmacy', label: 'pharmacy' }
                                ].map(({ to, label }) => (
                                  <Link 
                                    key={to}
                                    to={to}
                                    className={cn(
                                      "block text-base py-3.5 px-4 rounded-lg transition-all duration-150",
                                      "touch-manipulation min-h-[48px]",
                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                                      isActive(to)
                                        ? "text-white font-medium bg-white/20"
                                        : "text-white/85 hover:text-white hover:bg-white/15 active:bg-white/20"
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {t(`dropdown.${label}`)}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Link 
                        to="/research" 
                        className={cn(
                          "text-base transition-all duration-150 py-4 px-5 rounded-xl",
                          "touch-manipulation min-h-[56px] flex items-center active:scale-[0.98]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                          isActive("/research") 
                            ? "text-white font-semibold bg-white/25 border-l-4 border-white" 
                            : "text-white hover:bg-white/15 active:bg-white/20"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.research')}
                      </Link>

                      <Link 
                        to="/the-wire" 
                        className={cn(
                          "text-base transition-all duration-150 py-4 px-5 rounded-xl",
                          "touch-manipulation min-h-[56px] flex items-center active:scale-[0.98]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                          isActive("/the-wire") || location.pathname.startsWith("/the-wire/") 
                            ? "text-white font-semibold bg-white/25 border-l-4 border-white" 
                            : "text-white hover:bg-white/15 active:bg-white/20"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.theWire')}
                      </Link>

                      {/* About Us Section */}
                      <div className="space-y-1">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMobileAboutUsOpen(!mobileAboutUsOpen);
                          }}
                          className={cn(
                            "w-full font-semibold text-base py-4 px-5 rounded-xl",
                            "flex items-center justify-between transition-all duration-150",
                            "cursor-pointer touch-manipulation min-h-[56px] active:scale-[0.98]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                            isAboutUsActive 
                              ? "text-white bg-white/25 border-l-4 border-white" 
                              : "text-white hover:bg-white/15 active:bg-white/20"
                          )}
                          aria-expanded={mobileAboutUsOpen}
                        >
                          {t('nav.aboutUs')}
                          <ChevronDown className={cn(
                            "w-5 h-5 transition-transform duration-150 pointer-events-none text-white/80",
                            mobileAboutUsOpen && "rotate-180"
                          )} />
                        </button>
                        <AnimatePresence>
                          {mobileAboutUsOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden ml-3 pl-4 border-l-2 border-white/30"
                            >
                              <div className="space-y-1 py-2">
                                {[
                                  { to: '/about-us', label: 'aboutHealing' },
                                  { to: '/blockchain-technology', label: 'blockchain' }
                                ].map(({ to, label }) => (
                                  <Link 
                                    key={to}
                                    to={to}
                                    className={cn(
                                      "block text-base py-3.5 px-4 rounded-lg transition-all duration-150",
                                      "touch-manipulation min-h-[48px]",
                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                                      isActive(to)
                                        ? "text-white font-medium bg-white/20"
                                        : "text-white/85 hover:text-white hover:bg-white/15 active:bg-white/20"
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {t(`dropdown.${label}`)}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Link 
                        to="/shop" 
                        className={cn(
                          "text-base transition-all duration-150 py-4 px-5 rounded-xl",
                          "touch-manipulation min-h-[56px] flex items-center active:scale-[0.98]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                          isActive("/shop") || location.pathname.startsWith("/shop/") 
                            ? "text-white font-semibold bg-white/25 border-l-4 border-white" 
                            : "text-white hover:bg-white/15 active:bg-white/20"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.shop')}
                      </Link>

                      <Link 
                        to="/contact" 
                        className={cn(
                          "text-base transition-all duration-150 py-4 px-5 rounded-xl",
                          "touch-manipulation min-h-[56px] flex items-center active:scale-[0.98]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                          isActive("/contact") 
                            ? "text-white font-semibold bg-white/25 border-l-4 border-white" 
                            : "text-white hover:bg-white/15 active:bg-white/20"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.contactUs')}
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="my-6 border-t border-white/20" />

                    {/* Mobile CTAs */}
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEligibilityDialogOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full font-body font-semibold px-6 py-4 rounded-xl",
                          "transition-all duration-150 ease-out active:scale-[0.97]",
                          "shadow-md bg-white text-[#1C4F4D] text-base",
                          "hover:bg-white/95 hover:shadow-lg",
                          "touch-manipulation min-h-[56px]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        )}
                      >
                        {t('nav.checkEligibility')}
                      </button>
                      {user ? (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "w-full font-body font-semibold px-6 py-4 rounded-xl",
                              "transition-all duration-150 ease-out active:scale-[0.97]",
                              "shadow-md bg-white/20 border border-white/40 text-white text-base",
                              "flex items-center justify-center gap-2",
                              "hover:bg-white/30 hover:border-white/60",
                              "touch-manipulation min-h-[56px]",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                            )}
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            Patient Portal
                          </Link>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className={cn(
                              "w-full font-body font-semibold px-6 py-4 rounded-xl",
                              "transition-all duration-150 ease-out active:scale-[0.97]",
                              "shadow-md bg-white/10 border border-white/30 text-white text-base",
                              "flex items-center justify-center gap-2",
                              "hover:bg-white/20 hover:border-white/50",
                              "touch-manipulation min-h-[56px]",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                            )}
                          >
                            <LogOut className="w-5 h-5" />
                            {t('nav.signOut')}
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/auth"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-center w-full text-center",
                            "font-body font-semibold px-6 py-4 rounded-xl",
                            "transition-all duration-150 ease-out active:scale-[0.97]",
                            "shadow-md bg-white/15 border border-white/35 text-white text-base",
                            "hover:bg-white/25 hover:border-white/55",
                            "touch-manipulation min-h-[56px]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                          )}
                        >
                          {t('nav.patientLogin')}
                        </Link>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="my-6 border-t border-white/20" />

                    {/* Bottom Section: Language & Theme */}
                    <div className="flex items-center justify-between gap-4 px-2">
                      <LanguageSwitcher scrolled={scrolled} />
                      <ThemeToggle variant="button" className="flex-1" />
                    </div>
                  </div>
                </motion.nav>
              </>
            )}
          </AnimatePresence>

          {/* Eligibility Dialog */}
          <EligibilityDialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen} />
        </>
      );
    };

export default Header;
