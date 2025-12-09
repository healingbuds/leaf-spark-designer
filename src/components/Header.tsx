import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, LogOut } from "lucide-react";
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

interface HeaderProps {
  onMenuStateChange?: (isOpen: boolean) => void;
}

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
    
    // Close desktop dropdowns when clicking outside
    if (whatWeDoRef.current && !whatWeDoRef.current.contains(target)) {
      setWhatWeDoOpen(false);
    }
    if (aboutUsRef.current && !aboutUsRef.current.contains(target)) {
      setAboutUsOpen(false);
    }
  }, []);

  // Add click-outside listener
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

  // Notify parent of menu state changes
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

  // Close dropdowns on route change
  useEffect(() => {
    setWhatWeDoOpen(false);
    setAboutUsOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Scroll Progress Bar with Background Track */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-[60]">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-secondary to-primary origin-left"
          style={{ 
            scaleX,
            transformOrigin: "0%"
          }}
        />
      </div>
      
      <header 
        ref={headerRef}
        className={cn(
          "fixed top-2 left-2 right-2 z-50 backdrop-blur-xl rounded-xl transition-all duration-500 ease-out border",
          scrolled 
            ? "shadow-2xl border-white/20 scale-[0.99]" 
            : "shadow-sm border-white/10"
        )}
        style={{ 
          backgroundColor: scrolled ? 'rgba(42, 61, 58, 0.98)' : 'rgba(42, 61, 58, 0.95)',
          transition: 'background-color 0.5s ease-out, transform 0.5s ease-out'
        }}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className={cn(
            "flex items-center justify-between transition-all duration-500 ease-out",
            scrolled ? "h-20 md:h-22" : "h-24 md:h-28"
          )}>
            <Link to="/" className="flex items-center flex-shrink-0 group">
              <img 
                src={hbLogoWhite} 
                alt="Healing Buds Logo" 
                className={cn(
                  "w-auto object-contain transition-all duration-500 ease-out group-hover:scale-105",
                  scrolled ? "h-12 sm:h-14 md:h-16" : "h-14 sm:h-16 md:h-20"
                )}
              />
            </Link>
          
          {/* Desktop Navigation */}
          <nav className={cn(
            "hidden lg:flex items-center flex-1 justify-end transition-all duration-500 ease-out",
            scrolled ? "gap-2 xl:gap-3" : "gap-3 xl:gap-4"
          )}>
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
                  "font-body flex items-center gap-1 font-medium transition-all duration-300 ease-out relative rounded-md hover:scale-105 whitespace-nowrap cursor-pointer select-none",
                  scrolled ? "text-xs xl:text-sm px-2 py-1" : "text-xs xl:text-sm px-2 xl:px-3 py-1.5",
                  isWhatWeDoActive
                    ? "text-white bg-white/10" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {t('nav.whatWeDo')}
                <ChevronDown className={cn("w-3 h-3 xl:w-4 xl:h-4 transition-transform duration-150 pointer-events-none", whatWeDoOpen && "rotate-180")} />
              </button>
              
              {/* Dropdown Menu - Linear style */}
              <AnimatePresence>
                {whatWeDoOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-card rounded-xl shadow-card border border-border/40 overflow-hidden z-[100]"
                  >
                    <Link
                      to="/cultivating-processing"
                      className="block px-4 py-3 text-card-foreground hover:bg-muted transition-colors border-b border-border"
                      onClick={() => setWhatWeDoOpen(false)}
                    >
                      <div className="font-medium">{t('dropdown.cultivating')}</div>
                      <div className="text-sm text-muted-foreground">{t('dropdown.cultivatingDesc')}</div>
                    </Link>
                    <Link
                      to="/manufacture-distribution"
                      className="block px-4 py-3 text-card-foreground hover:bg-muted transition-colors border-b border-border"
                      onClick={() => setWhatWeDoOpen(false)}
                    >
                      <div className="font-medium">{t('dropdown.manufacture')}</div>
                      <div className="text-sm text-muted-foreground">{t('dropdown.manufactureDesc')}</div>
                    </Link>
                    <Link
                      to="/medical-clinics"
                      className="block px-4 py-3 text-card-foreground hover:bg-muted transition-colors border-b border-border"
                      onClick={() => setWhatWeDoOpen(false)}
                    >
                      <div className="font-medium">{t('dropdown.clinics')}</div>
                      <div className="text-sm text-muted-foreground">{t('dropdown.clinicsDesc')}</div>
                    </Link>
                    <Link
                      to="/online-pharmacy"
                      className="block px-4 py-3 text-card-foreground hover:bg-muted transition-colors"
                      onClick={() => setWhatWeDoOpen(false)}
                    >
                      <div className="font-medium">{t('dropdown.pharmacy')}</div>
                      <div className="text-sm text-muted-foreground">{t('dropdown.pharmacyDesc')}</div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link 
              to="/research" 
              className={cn(
                "font-body font-medium transition-all duration-300 ease-out rounded-md hover:scale-105 whitespace-nowrap",
                scrolled ? "text-xs xl:text-sm px-2 py-1" : "text-xs xl:text-sm px-2 xl:px-3 py-1.5",
                isActive("/research") 
                  ? "text-white bg-white/10" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              {t('nav.research')}
            </Link>
            <Link 
              to="/the-wire" 
              className={cn(
                "font-body font-medium transition-all duration-300 ease-out rounded-md hover:scale-105 whitespace-nowrap",
                scrolled ? "text-xs xl:text-sm px-2 py-1" : "text-xs xl:text-sm px-2 xl:px-3 py-1.5",
                isActive("/the-wire") || location.pathname.startsWith("/the-wire/")
                  ? "text-white bg-white/10" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              {t('nav.theWire')}
            </Link>
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
                  "font-body flex items-center gap-1 font-medium transition-all duration-300 ease-out relative rounded-md hover:scale-105 whitespace-nowrap cursor-pointer select-none",
                  scrolled ? "text-xs xl:text-sm px-2 py-1" : "text-xs xl:text-sm px-2 xl:px-3 py-1.5",
                  isAboutUsActive
                    ? "text-white bg-white/10" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {t('nav.aboutUs')}
                <ChevronDown className={cn("w-3 h-3 xl:w-4 xl:h-4 transition-transform duration-150 pointer-events-none", aboutUsOpen && "rotate-180")} />
              </button>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {aboutUsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-card rounded-xl shadow-card border border-border/40 overflow-hidden z-[100]"
                  >
                    <Link
                      to="/about-us"
                      className="block px-4 py-3 text-card-foreground hover:bg-muted transition-colors border-b border-border"
                      onClick={() => setAboutUsOpen(false)}
                    >
                      <div className="font-medium">{t('dropdown.aboutHealing')}</div>
                      <div className="text-sm text-muted-foreground">{t('dropdown.aboutHealingDesc')}</div>
                    </Link>
                    <Link
                      to="/blockchain-technology"
                      className="block px-4 py-3 text-card-foreground hover:bg-muted transition-colors"
                      onClick={() => setAboutUsOpen(false)}
                    >
                      <div className="font-medium">{t('dropdown.blockchain')}</div>
                      <div className="text-sm text-muted-foreground">{t('dropdown.blockchainDesc')}</div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link 
              to="/contact" 
              className={cn(
                "font-body font-medium transition-all duration-300 ease-out rounded-md hover:scale-105 whitespace-nowrap",
                scrolled ? "text-xs xl:text-sm px-2 py-1" : "text-xs xl:text-sm px-2 xl:px-3 py-1.5",
                isActive("/contact") 
                  ? "text-white bg-white/10" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              {t('nav.contactUs')}
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher scrolled={scrolled} />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Desktop Action Buttons */}
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              <button
                onClick={() => setEligibilityDialogOpen(true)}
                className={cn(
                  "font-body font-semibold px-3 xl:px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl relative z-10 whitespace-nowrap",
                  "backdrop-blur-2xl bg-gradient-to-br from-white/35 via-white/25 to-white/15",
                  "dark:from-white/25 dark:via-white/15 dark:to-white/10",
                  "border border-white/50 shadow-lg hover:border-white/70",
                  "text-white hover:bg-white/35",
                  scrolled ? "text-xs xl:text-sm" : "text-xs xl:text-sm"
                )}
              >
                <span className="hidden xl:inline">{t('nav.checkEligibility')}</span>
                <span className="xl:hidden">Eligibility</span>
              </button>
              {user ? (
                <button
                  onClick={handleLogout}
                  className={cn(
                    "font-body font-semibold px-3 xl:px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl relative z-10 whitespace-nowrap",
                    "backdrop-blur-2xl bg-gradient-to-br from-white/25 via-white/18 to-white/12",
                    "dark:from-white/20 dark:via-white/12 dark:to-white/8",
                    "border border-white/40 shadow-lg hover:border-white/60",
                    "text-white hover:bg-white/30 flex items-center gap-1.5",
                    scrolled ? "text-xs xl:text-sm" : "text-xs xl:text-sm"
                  )}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{t('nav.signOut')}</span>
                  <span className="xl:hidden">Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/auth"
                  className={cn(
                    "font-body font-semibold px-3 xl:px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl relative z-10 whitespace-nowrap",
                    "backdrop-blur-2xl bg-gradient-to-br from-white/25 via-white/18 to-white/12",
                    "dark:from-white/20 dark:via-white/12 dark:to-white/8",
                    "border border-white/40 shadow-lg hover:border-white/60",
                    "text-white hover:bg-white/30",
                    scrolled ? "text-xs xl:text-sm" : "text-xs xl:text-sm"
                  )}
                >
                  <span className="hidden xl:inline">{t('nav.patientLogin')}</span>
                  <span className="xl:hidden">Login</span>
                </Link>
              )}
            </div>
          </nav>

          {/* Eligibility Dialog */}
          <EligibilityDialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen} />

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="lg:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              className={cn(
                "text-white p-3 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center",
                "hover:bg-white/10 active:bg-white/20",
                scrolled && "p-2.5"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className={cn("transition-all duration-300", scrolled ? "w-6 h-6" : "w-7 h-7")} />
              ) : (
                <Menu className={cn("transition-all duration-300", scrolled ? "w-6 h-6" : "w-7 h-7")} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Full Height Slide-in */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.nav 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="lg:hidden overflow-hidden border-t border-white/10"
              >
                <div className="flex flex-col py-6 px-5 max-h-[calc(100vh-140px)] overflow-y-auto">
                  {/* Navigation Links */}
                  <div className="flex flex-col space-y-2">
                    {/* What We Do Section - Collapsible */}
                    <div className="space-y-2">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMobileWhatWeDoOpen(!mobileWhatWeDoOpen);
                        }}
                        className={cn(
                          "w-full font-semibold text-base py-4 px-5 rounded-xl flex items-center justify-between transition-all cursor-pointer touch-manipulation min-h-[56px] active:scale-[0.98]",
                          isWhatWeDoActive ? "text-white bg-white/15" : "text-white/90 hover:bg-white/5 active:bg-white/10"
                        )}
                      >
                        {t('nav.whatWeDo')}
                        <ChevronDown className={cn("w-5 h-5 transition-transform duration-200 pointer-events-none", mobileWhatWeDoOpen && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {mobileWhatWeDoOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pl-4 border-l-2 border-white/20 ml-4"
                          >
                            <div className="space-y-1 py-2">
                              <Link 
                                to="/cultivating-processing" 
                                className="block text-base text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10 py-4 px-5 rounded-xl transition-all touch-manipulation min-h-[52px]"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {t('dropdown.cultivating')}
                              </Link>
                              <Link 
                                to="/manufacture-distribution" 
                                className="block text-base text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10 py-4 px-5 rounded-xl transition-all touch-manipulation min-h-[52px]"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {t('dropdown.manufacture')}
                              </Link>
                              <Link 
                                to="/medical-clinics" 
                                className="block text-base text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10 py-4 px-5 rounded-xl transition-all touch-manipulation min-h-[52px]"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {t('dropdown.clinics')}
                              </Link>
                              <Link 
                                to="/online-pharmacy" 
                                className="block text-base text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10 py-4 px-5 rounded-xl transition-all touch-manipulation min-h-[52px]"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {t('dropdown.pharmacy')}
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Link 
                      to="/research" 
                      className={cn(
                        "text-base transition-all duration-200 py-4 px-5 rounded-xl touch-manipulation min-h-[56px] flex items-center active:scale-[0.98]",
                        isActive("/research") ? "text-white font-semibold bg-white/15" : "text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.research')}
                    </Link>

                    <Link 
                      to="/the-wire" 
                      className={cn(
                        "text-base transition-all duration-200 py-4 px-5 rounded-xl touch-manipulation min-h-[56px] flex items-center active:scale-[0.98]",
                        isActive("/the-wire") || location.pathname.startsWith("/the-wire/") ? "text-white font-semibold bg-white/15" : "text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.theWire')}
                    </Link>

                    {/* About Us Section - Collapsible */}
                    <div className="space-y-2">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMobileAboutUsOpen(!mobileAboutUsOpen);
                        }}
                        className={cn(
                          "w-full font-semibold text-base py-4 px-5 rounded-xl flex items-center justify-between transition-all cursor-pointer touch-manipulation min-h-[56px] active:scale-[0.98]",
                          isAboutUsActive ? "text-white bg-white/15" : "text-white/90 hover:bg-white/5 active:bg-white/10"
                        )}
                      >
                        {t('nav.aboutUs')}
                        <ChevronDown className={cn("w-5 h-5 transition-transform duration-200 pointer-events-none", mobileAboutUsOpen && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {mobileAboutUsOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pl-4 border-l-2 border-white/20 ml-4"
                          >
                            <div className="space-y-1 py-2">
                              <Link 
                                to="/about-us" 
                                className="block text-base text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10 py-4 px-5 rounded-xl transition-all touch-manipulation min-h-[52px]"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {t('dropdown.aboutHealing')}
                              </Link>
                              <Link 
                                to="/blockchain-technology" 
                                className="block text-base text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10 py-4 px-5 rounded-xl transition-all touch-manipulation min-h-[52px]"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {t('dropdown.blockchain')}
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Link 
                      to="/contact" 
                      className={cn(
                        "text-base transition-all duration-200 py-4 px-5 rounded-xl touch-manipulation min-h-[56px] flex items-center active:scale-[0.98]",
                        isActive("/contact") ? "text-white font-semibold bg-white/15" : "text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.contactUs')}
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="my-6 border-t border-white/10" />

                  {/* Mobile CTAs inside menu */}
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEligibilityDialogOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full font-body font-semibold px-6 py-5 rounded-2xl transition-all duration-300 ease-out active:scale-[0.96] shadow-lg backdrop-blur-2xl bg-gradient-to-br from-white/35 via-white/25 to-white/15 border border-white/50 text-white text-base hover:from-white/45 hover:via-white/35 hover:to-white/25 hover:border-white/70 hover:shadow-xl touch-manipulation min-h-[60px]"
                    >
                      {t('nav.checkEligibility')}
                    </button>
                    {user ? (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full font-body font-semibold px-6 py-5 rounded-2xl transition-all duration-300 ease-out active:scale-[0.96] shadow-lg backdrop-blur-2xl bg-gradient-to-br from-white/25 via-white/18 to-white/12 border border-white/40 text-white text-base flex items-center justify-center gap-2 hover:from-white/35 hover:via-white/28 hover:to-white/22 hover:border-white/60 hover:shadow-xl touch-manipulation min-h-[60px]"
                      >
                        <LogOut className="w-5 h-5" />
                        {t('nav.signOut')}
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center w-full text-center font-body font-semibold px-6 py-5 rounded-2xl transition-all duration-300 ease-out active:scale-[0.96] shadow-lg backdrop-blur-2xl bg-gradient-to-br from-white/25 via-white/18 to-white/12 border border-white/40 text-white text-base hover:from-white/35 hover:via-white/28 hover:to-white/22 hover:border-white/60 hover:shadow-xl touch-manipulation min-h-[60px]"
                      >
                        {t('nav.patientLogin')}
                      </Link>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="my-6 border-t border-white/10" />

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
        </div>
      </header>
    </>
  );
};

export default Header;
