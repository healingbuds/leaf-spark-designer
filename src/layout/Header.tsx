/**
 * Header Component - Structure Only
 * 
 * Systems-Level Architecture:
 * 
 * STRUCTURE: 3-Zone Grid Layout
 * - Left Zone: Logo (fixed width, never shrinks)
 * - Center Zone: Navigation (flexible, collapses first)
 * - Right Zone: Actions (fixed width, never overlaps)
 * 
 * This component is STRUCTURE ONLY:
 * - NO dropdown logic (handled by NavigationMenu)
 * - NO overlay logic (handled by NavigationOverlay)
 * - NO scroll locking (handled by NavigationOverlay)
 * - NO focus trapping (handled by NavigationOverlay)
 * 
 * Imports and coordinates:
 * - NavigationMenu (desktop navigation)
 * - NavigationOverlay (mobile overlay)
 */

import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useSpring } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import EligibilityDialog from "@/components/EligibilityDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import NavigationMenu from "@/components/NavigationMenu";
import NavigationOverlay from "@/components/NavigationOverlay";

interface HeaderProps {
  onMenuStateChange?: (isOpen: boolean) => void;
}

const Header = ({ onMenuStateChange }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation('common');
  const headerRef = useRef<HTMLElement>(null);
  
  // Scroll progress tracking
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth state management
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleEligibilityClick = () => {
    setEligibilityDialogOpen(true);
  };

  return (
    <>
      {/* Scroll Progress Bar - Always sticky at absolute top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#1C4F4D]/30 z-[100]">
        <motion.div
          className="h-full bg-gradient-to-r from-[#4DBFA1] via-[#2C7D7A] to-[#1C4F4D] origin-left will-change-transform"
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
                  "w-auto min-w-[140px] sm:min-w-[160px] md:min-w-[180px] object-contain transition-all duration-500 ease-out group-hover:scale-105",
                  scrolled ? "h-12 sm:h-14 md:h-16" : "h-14 sm:h-16 md:h-20"
                )}
              />
            </Link>
          
            {/* ZONE 2: Center - Navigation (flexible, adapts to available space) */}
            <NavigationMenu scrolled={scrolled} />
            
            {/* ZONE 3: Right - Actions (uses 2xl breakpoint to prevent overlap with nav) */}
            <div className="hidden xl:flex items-center gap-2 justify-self-end flex-shrink-0">
              <LanguageSwitcher scrolled={scrolled} />
              <ThemeToggle />

              {/* Action Buttons - explicit constraints prevent collapse */}
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  onClick={() => setEligibilityDialogOpen(true)}
                  className={cn(
                    "font-body font-bold px-3 py-1.5 rounded-full transition-all duration-300",
                    "hover:scale-105 hover:shadow-xl whitespace-nowrap",
                    "bg-white text-[#2A3D3A] hover:bg-white/95",
                    "border-2 border-white shadow-lg",
                    "text-xs",
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
                        "font-body font-bold px-3 py-1.5 rounded-full transition-all duration-300",
                        "hover:scale-105 hover:shadow-xl whitespace-nowrap",
                        "bg-primary text-white hover:bg-primary/90",
                        "border-2 border-primary shadow-lg flex items-center gap-1",
                        "text-xs",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
                      )}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Portal
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={cn(
                        "font-body font-bold p-1.5 rounded-full transition-all duration-300",
                        "hover:scale-105 hover:shadow-xl",
                        "bg-transparent text-white hover:bg-white/20",
                        "border-2 border-white/60 shadow-lg flex items-center justify-center",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
                      )}
                      title={t('nav.signOut')}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className={cn(
                      "font-body font-bold px-3 py-1.5 rounded-full transition-all duration-300",
                      "hover:scale-105 hover:shadow-xl whitespace-nowrap",
                      "bg-transparent text-white hover:bg-white/20",
                      "border-2 border-white/60 shadow-lg",
                      "text-xs",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
                    )}
                  >
                    {t('nav.patientLogin')}
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile/Tablet Menu Button & Theme Toggle - shows below 2xl */}
            <div className="xl:hidden flex items-center gap-2 justify-self-end">
              <ThemeToggle />
              <button
                type="button"
                className={cn(
                  "text-white p-2.5 rounded-xl transition-all duration-300",
                  "hover:scale-110 active:scale-95 touch-manipulation",
                  "min-h-[44px] min-w-[44px] flex items-center justify-center",
                  "hover:bg-white/10 active:bg-white/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                  scrolled && "p-2"
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className={cn("transition-all duration-300", scrolled ? "w-5 h-5" : "w-6 h-6")} />
                ) : (
                  <Menu className={cn("transition-all duration-300", scrolled ? "w-5 h-5" : "w-6 h-6")} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay - OUTSIDE header for true full-viewport ownership */}
      <NavigationOverlay
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
        onEligibilityClick={handleEligibilityClick}
        scrolled={scrolled}
      />

      {/* Eligibility Dialog */}
      <EligibilityDialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen} />
    </>
  );
};

export default Header;
