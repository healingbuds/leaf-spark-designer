/**
 * NavigationOverlay Component - Pharmaceutical Grade
 * 
 * Premium mobile navigation drawer sliding from RIGHT with glassmorphism.
 */

import { Link, useLocation } from "react-router-dom";
import { X, LogOut, LayoutDashboard, User, FileText, ClipboardCheck, ShoppingBag, HeadphonesIcon, Home } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

interface NavigationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser | null;
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
}: NavigationOverlayProps) => {
  const location = useLocation();
  const { t } = useTranslation('common');
  
  // Focus trap for accessibility
  const focusTrapRef = useFocusTrap(isOpen);

  // Active state detection
  const isActive = (path: string) => location.pathname === path;
  const isShopActive = location.pathname === '/shop' || location.pathname.startsWith('/shop/');

  // Lock body scroll when overlay is open
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

  const handleEligibility = () => {
    onEligibilityClick();
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const navItems = [
    { to: "/", label: "Home", icon: Home, active: isActive("/") },
    { to: "/research", label: "Research", icon: FileText, active: isActive("/research") },
    { to: "/eligibility", label: "Eligibility", icon: ClipboardCheck, active: isActive("/eligibility") },
    { to: "/shop", label: "Products", icon: ShoppingBag, active: isShopActive },
    { to: "/support", label: "Support", icon: HeadphonesIcon, active: isActive("/support") }
  ];

  const navLinkStyles = (active: boolean) => cn(
    "text-base transition-all duration-200 py-4 px-5 rounded-xl",
    "touch-manipulation min-h-[56px] flex items-center gap-4 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]/50",
    active
      ? "text-white font-semibold bg-white/15 border-l-4 border-[#EAB308]"
      : "text-white/90 hover:text-white hover:bg-white/10"
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Glassmorphism blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="xl:hidden fixed inset-0 z-[9998] bg-black/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Drawer - Slides from RIGHT */}
          <motion.div 
            ref={focusTrapRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: "spring",
              stiffness: 350,
              damping: 35
            }}
            className="xl:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-[380px] z-[9999] flex flex-col"
            style={{ 
              background: 'linear-gradient(180deg, #1A2E2A 0%, #1E3632 100%)',
              boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.5)'
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Menu Header */}
            <div 
              className="flex-shrink-0 flex items-center justify-between px-5 py-4"
              style={{ 
                borderBottom: '2px solid rgba(255, 255, 255, 0.8)'
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
                  className="h-10 w-auto object-contain"
                />
              </Link>
              
              {/* Close Button - Easy reach on right */}
              <button
                type="button"
                onClick={onClose}
                className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]/50"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Scrollable menu content */}
            <div 
              className="flex-1 overflow-y-auto py-6 px-4"
              style={{ 
                paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))'
              }}
            >
              {/* Navigation Links */}
              <motion.div 
                className="flex flex-col space-y-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.1
                    }
                  }
                }}
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.to}
                      variants={{
                        hidden: { opacity: 0, x: 30 },
                        visible: { 
                          opacity: 1, 
                          x: 0,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                          }
                        }
                      }}
                    >
                      <Link 
                        to={item.to} 
                        className={navLinkStyles(item.active)}
                        onClick={onClose}
                      >
                        <Icon className={cn(
                          "w-5 h-5",
                          item.active ? "text-[#EAB308]" : "text-white/60"
                        )} />
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Divider */}
              <div className="my-6 h-[2px] bg-white/20" />

              {/* User Section */}
              <div className="space-y-4">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-4 py-4 px-5 rounded-xl transition-all duration-200",
                        "touch-manipulation min-h-[56px] active:scale-[0.98]",
                        "bg-white/10 text-white hover:bg-white/15 border border-white/20",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]/50"
                      )}
                    >
                      <LayoutDashboard className="w-5 h-5 text-[#EAB308]" />
                      <span className="font-medium">Patient Portal</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={cn(
                        "w-full flex items-center gap-4 py-4 px-5 rounded-xl transition-all duration-200",
                        "touch-manipulation min-h-[56px] active:scale-[0.98]",
                        "bg-white/10 text-white hover:bg-white/15 border border-white/20",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]/50"
                      )}
                    >
                      <LogOut className="w-5 h-5 text-white/70" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Check Eligibility - Primary CTA - HIGH VISIBILITY */}
                    <button
                      onClick={handleEligibility}
                      className={cn(
                        "w-full flex items-center justify-center gap-3 py-5 px-6 rounded-xl transition-all duration-200",
                        "touch-manipulation min-h-[60px] active:scale-[0.97]",
                        "bg-white text-[hsl(178,48%,16%)] font-bold text-lg",
                        "shadow-xl shadow-white/20 border-2 border-white",
                        "hover:bg-white/95",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2E2A]"
                      )}
                    >
                      Check Eligibility
                    </button>
                    
                    {/* Patient Login - Secondary CTA - Clear but distinct */}
                    <Link
                      to="/auth"
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-center gap-3 py-5 px-6 rounded-xl transition-all duration-200",
                        "touch-manipulation min-h-[60px] active:scale-[0.97]",
                        "bg-[#EAB308]/20 text-[#EAB308] font-semibold text-lg border-2 border-[#EAB308]/60",
                        "hover:bg-[#EAB308]/30 hover:border-[#EAB308]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2E2A]"
                      )}
                    >
                      <User className="w-5 h-5" />
                      Patient Login
                    </Link>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 h-[2px] bg-white/20" />

              {/* Settings */}
              <div className="flex items-center justify-between gap-4 px-2">
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