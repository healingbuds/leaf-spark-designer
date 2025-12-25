/**
 * NavigationOverlay Component
 * 
 * Full-screen mobile navigation overlay for country dispensary site.
 * Simplified, store-focused navigation.
 */

import { Link, useLocation } from "react-router-dom";
import { X, LogOut, LayoutDashboard } from "lucide-react";
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
  const location = useLocation();
  const { t } = useTranslation('common');
  
  // Focus trap for accessibility
  const focusTrapRef = useFocusTrap(isOpen);

  // Active state detection
  const isActive = (path: string) => location.pathname === path;
  const isShopActive = location.pathname === '/shop' || location.pathname.startsWith('/shop/');

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

  // Note: Route change closing is handled by Header component
  // to avoid dependency issues with onClose callback

  const handleEligibility = () => {
    onEligibilityClick();
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const navLinkStyles = (active: boolean) => cn(
    "text-base transition-all duration-200 py-4 px-5 rounded-2xl",
    "touch-manipulation min-h-[56px] flex items-center gap-3 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    active
      ? "text-white font-semibold bg-gradient-to-r from-primary/40 to-primary/20 shadow-lg shadow-primary/20"
      : "text-white/90 hover:text-white hover:bg-white/10"
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - smooth fade with blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="xl:hidden fixed inset-0 z-[9998] bg-black/90"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Menu Surface - smooth slide-in with spring physics */}
          <motion.div 
            ref={focusTrapRef}
            initial={{ opacity: 0, x: '100%', scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: '100%', scale: 0.98 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              opacity: { duration: 0.2 }
            }}
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
                <Link 
                  to="/" 
                  className={navLinkStyles(isActive("/"))}
                  onClick={onClose}
                >
                  {isActive("/") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  Home
                </Link>

                <Link 
                  to="/eligibility" 
                  className={navLinkStyles(isActive("/eligibility"))}
                  onClick={onClose}
                >
                  {isActive("/eligibility") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  Eligibility
                </Link>

                <Link 
                  to="/shop" 
                  className={navLinkStyles(isShopActive)}
                  onClick={onClose}
                >
                  {isShopActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  Dispensary
                </Link>

                <Link 
                  to="/support" 
                  className={navLinkStyles(isActive("/support"))}
                  onClick={onClose}
                >
                  {isActive("/support") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  Support
                </Link>
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-white/10" />

              {/* User Section */}
              <div className="space-y-3">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 py-4 px-5 rounded-2xl transition-all duration-200",
                        "touch-manipulation min-h-[56px] active:scale-[0.98]",
                        "text-white/90 hover:text-white hover:bg-white/10",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      )}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Patient Portal</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={cn(
                        "w-full flex items-center gap-3 py-4 px-5 rounded-2xl transition-all duration-200",
                        "touch-manipulation min-h-[56px] active:scale-[0.98]",
                        "text-white/90 hover:text-white hover:bg-white/10",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      )}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-center gap-2 py-4 px-5 rounded-2xl transition-all duration-200",
                        "touch-manipulation min-h-[56px] active:scale-[0.98]",
                        "bg-white text-primary font-semibold",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      )}
                    >
                      Sign In
                    </Link>
                    <button
                      onClick={handleEligibility}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-4 px-5 rounded-2xl transition-all duration-200",
                        "touch-manipulation min-h-[56px] active:scale-[0.98]",
                        "bg-primary/20 text-white font-semibold border border-white/20",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      )}
                    >
                      Check Eligibility
                    </button>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-white/10" />

              {/* Settings */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm">Language:</span>
                  <LanguageSwitcher />
                </div>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NavigationOverlay;
