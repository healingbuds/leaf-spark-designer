/**
 * NavigationOverlay Component
 * 
 * Full-screen mobile navigation overlay.
 * Responsibilities:
 * - Full-screen overlay (100vw/100vh)
 * - Focus trap integration
 * - Body scroll locking (iOS-safe)
 * - Escape key handling
 * - Z-index ownership
 * - Blocks all background interaction
 * 
 * Layer ownership: Page → Overlay → Menu Surface
 */

import { Link, useLocation } from "react-router-dom";
import { ChevronDown, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

interface NavigationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onEligibilityClick: () => void;
  scrolled: boolean;
}

const NavigationOverlay = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onEligibilityClick,
  scrolled
}: NavigationOverlayProps) => {
  const [mobileWhatWeDoOpen, setMobileWhatWeDoOpen] = useState(false);
  const [mobileAboutUsOpen, setMobileAboutUsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation('common');
  
  // Focus trap for accessibility
  const focusTrapRef = useFocusTrap(isOpen);

  // Active state detection
  const isActive = (path: string) => location.pathname === path;
  const isWhatWeDoActive = ['/what-we-do', '/cultivating-processing', '/manufacture-distribution', '/medical-clinics', '/online-pharmacy'].includes(location.pathname);
  const isAboutUsActive = ['/about-us', '/blockchain-technology'].includes(location.pathname);

  // Reset dropdown states when menu closes
  useEffect(() => {
    if (!isOpen) {
      setMobileWhatWeDoOpen(false);
      setMobileAboutUsOpen(false);
    }
  }, [isOpen]);

  // Lock body scroll when overlay is open - comprehensive iOS support
  useEffect(() => {
    const scrollY = window.scrollY;
    if (isOpen) {
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
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const handleEligibility = () => {
    onEligibilityClick();
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - solid opaque to completely block background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="xl:hidden fixed inset-0 z-[9998]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}
            onClick={onClose}
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
                onClick={onClose}
                className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
              >
                <img 
                  src={hbLogoWhite} 
                  alt="Healing Buds Logo" 
                  className="h-12 min-w-[120px] w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Scrollable menu content */}
            <div 
              className="flex-1 overflow-y-auto py-6 px-5"
              style={{ 
                height: 'calc(100dvh - 72px)',
                minHeight: 'calc(100vh - 72px)',
                paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))'
              }}
            >
              {/* Navigation Links */}
              <div className="flex flex-col space-y-2">
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
                      "w-full font-semibold text-base py-4 px-5 rounded-2xl",
                      "flex items-center justify-between transition-all duration-200",
                      "cursor-pointer touch-manipulation min-h-[56px] active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                      isWhatWeDoActive 
                        ? "text-white bg-gradient-to-r from-primary/40 to-primary/20 shadow-lg shadow-primary/20" 
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    )}
                    aria-expanded={mobileWhatWeDoOpen}
                  >
                    <span className="flex items-center gap-3">
                      {isWhatWeDoActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      {t('nav.whatWeDo')}
                    </span>
                    <ChevronDown className={cn(
                      "w-5 h-5 transition-transform duration-200 pointer-events-none",
                      isWhatWeDoActive ? "text-white" : "text-white/60",
                      mobileWhatWeDoOpen && "rotate-180"
                    )} />
                  </button>
                  <AnimatePresence>
                    {mobileWhatWeDoOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 space-y-1 py-2 pl-4 border-l border-white/15">
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
                                "block text-base py-3 px-4 rounded-xl transition-all duration-200",
                                "touch-manipulation min-h-[44px]",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                                isActive(to)
                                  ? "text-white font-medium bg-white/15"
                                  : "text-white/70 hover:text-white hover:bg-white/10"
                              )}
                              onClick={onClose}
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
                    "text-base transition-all duration-200 py-4 px-5 rounded-2xl",
                    "touch-manipulation min-h-[56px] flex items-center gap-3 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    isActive("/research") 
                      ? "text-white font-semibold bg-gradient-to-r from-primary/40 to-primary/20 shadow-lg shadow-primary/20" 
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                  onClick={onClose}
                >
                  {isActive("/research") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  {t('nav.research')}
                </Link>

                <Link 
                  to="/the-wire" 
                  className={cn(
                    "text-base transition-all duration-200 py-4 px-5 rounded-2xl",
                    "touch-manipulation min-h-[56px] flex items-center gap-3 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    isActive("/the-wire") || location.pathname.startsWith("/the-wire/") 
                      ? "text-white font-semibold bg-gradient-to-r from-primary/40 to-primary/20 shadow-lg shadow-primary/20" 
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                  onClick={onClose}
                >
                  {(isActive("/the-wire") || location.pathname.startsWith("/the-wire/")) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
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
                      "w-full font-semibold text-base py-4 px-5 rounded-2xl",
                      "flex items-center justify-between transition-all duration-200",
                      "cursor-pointer touch-manipulation min-h-[56px] active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      isAboutUsActive 
                        ? "text-white bg-gradient-to-r from-primary/40 to-primary/20 shadow-lg shadow-primary/20" 
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    )}
                    aria-expanded={mobileAboutUsOpen}
                  >
                    <span className="flex items-center gap-3">
                      {isAboutUsActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      {t('nav.aboutUs')}
                    </span>
                    <ChevronDown className={cn(
                      "w-5 h-5 transition-transform duration-200 pointer-events-none",
                      isAboutUsActive ? "text-white" : "text-white/60",
                      mobileAboutUsOpen && "rotate-180"
                    )} />
                  </button>
                  <AnimatePresence>
                    {mobileAboutUsOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 space-y-1 py-2 pl-4 border-l border-white/15">
                          {[
                            { to: '/about-us', label: 'aboutHealing' },
                            { to: '/blockchain-technology', label: 'blockchain' }
                          ].map(({ to, label }) => (
                            <Link 
                              key={to}
                              to={to}
                              className={cn(
                                "block text-base py-3 px-4 rounded-xl transition-all duration-200",
                                "touch-manipulation min-h-[44px]",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                                isActive(to)
                                  ? "text-white font-medium bg-white/15"
                                  : "text-white/70 hover:text-white hover:bg-white/10"
                              )}
                              onClick={onClose}
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
                    "text-base transition-all duration-200 py-4 px-5 rounded-2xl",
                    "touch-manipulation min-h-[56px] flex items-center gap-3 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    isActive("/shop") || location.pathname.startsWith("/shop/") 
                      ? "text-white font-semibold bg-gradient-to-r from-primary/40 to-primary/20 shadow-lg shadow-primary/20" 
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                  onClick={onClose}
                >
                  {(isActive("/shop") || location.pathname.startsWith("/shop/")) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  {t('nav.shop')}
                </Link>

                <Link 
                  to="/contact" 
                  className={cn(
                    "text-base transition-all duration-200 py-4 px-5 rounded-2xl",
                    "touch-manipulation min-h-[56px] flex items-center gap-3 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    isActive("/contact") 
                      ? "text-white font-semibold bg-gradient-to-r from-primary/40 to-primary/20 shadow-lg shadow-primary/20" 
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                  onClick={onClose}
                >
                  {isActive("/contact") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  {t('nav.contactUs')}
                </Link>
              </div>

              {/* Divider */}
              <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Mobile CTAs */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleEligibility}
                  className={cn(
                    "w-full font-semibold px-6 py-4 rounded-2xl",
                    "transition-all duration-300 ease-out active:scale-[0.97]",
                    "bg-gradient-to-r from-primary to-primary/80 text-white text-base",
                    "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40",
                    "hover:from-primary/90 hover:to-primary/70",
                    "touch-manipulation min-h-[56px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  )}
                >
                  {t('nav.checkEligibility')}
                </button>
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={onClose}
                      className={cn(
                        "w-full font-semibold px-6 py-4 rounded-2xl",
                        "transition-all duration-300 ease-out active:scale-[0.97]",
                        "bg-white/10 backdrop-blur-sm border border-white/20 text-white text-base",
                        "flex items-center justify-center gap-3",
                        "hover:bg-white/15 hover:border-white/30",
                        "touch-manipulation min-h-[56px]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      )}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Patient Portal
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={cn(
                        "w-full font-semibold px-6 py-4 rounded-2xl",
                        "transition-all duration-300 ease-out active:scale-[0.97]",
                        "bg-white/5 border border-white/10 text-white/80 text-base",
                        "flex items-center justify-center gap-3",
                        "hover:bg-white/10 hover:text-white hover:border-white/20",
                        "touch-manipulation min-h-[56px]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      )}
                    >
                      <LogOut className="w-5 h-5" />
                      {t('nav.signOut')}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-center gap-3 w-full text-center",
                      "font-semibold px-6 py-4 rounded-2xl",
                      "transition-all duration-300 ease-out active:scale-[0.97]",
                      "bg-white/10 backdrop-blur-sm border border-white/20 text-white text-base",
                      "hover:bg-white/15 hover:border-white/30",
                      "touch-manipulation min-h-[56px]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    )}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {t('nav.patientLogin')}
                  </Link>
                )}
              </div>

              {/* Divider */}
              <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Bottom Section: Language & Theme */}
              <div className="flex items-center justify-center gap-6 px-2">
                <LanguageSwitcher scrolled={scrolled} />
                <div className="w-px h-6 bg-white/20" />
                <ThemeToggle variant="button" className="" />
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};

export default NavigationOverlay;
