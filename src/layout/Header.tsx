/**
 * Header Component - Pharmaceutical-Grade Design
 * 
 * Premium, trustworthy navbar with theme-aware styling.
 * Light mode: teal/dark text on light background
 * Dark mode: white text on dark background
 */

import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useSpring } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import hbLogoDark from "@/assets/hb-logo-teal.png";
import EligibilityDialog from "@/components/EligibilityDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import NavigationMenu from "@/components/NavigationMenu";
import NavigationOverlay from "@/components/NavigationOverlay";
import AnimatedMenuButton from "@/components/AnimatedMenuButton";

interface HeaderProps {
  onMenuStateChange?: (isOpen: boolean) => void;
}

const Header = ({ onMenuStateChange }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation('common');
  const { resolvedTheme } = useTheme();
  const headerRef = useRef<HTMLElement>(null);
  
  const isDark = resolvedTheme === 'dark';
  
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
      setScrolled(window.scrollY > 20);
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

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className={cn(
        "fixed top-0 left-0 right-0 h-0.5 z-[100]",
        isDark ? "bg-white/10" : "bg-black/10"
      )}>
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 origin-left"
          style={{ scaleX }}
        />
      </div>

      {/* Main Header - Theme Aware */}
      <header 
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "transition-all duration-500 ease-out"
        )}
      >
        {/* Navbar Background - Theme Aware */}
        <div 
          className={cn(
            "transition-all duration-500",
            isDark
              ? scrolled 
                ? "bg-[#1A2E2A]/98 backdrop-blur-xl shadow-2xl shadow-black/30" 
                : "bg-[#1A2E2A]"
              : scrolled
                ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/10"
                : "bg-white"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Navigation Row */}
            <div className={cn(
              "flex items-center justify-between",
              "transition-all duration-500 ease-out",
              scrolled ? "h-16" : "h-20"
            )}>
              
              {/* Logo - Far Left (Theme Aware) */}
              <Link 
                to="/" 
                className="flex items-center flex-shrink-0 group"
              >
                <img 
                  src={isDark ? hbLogoWhite : hbLogoDark} 
                  alt="Healing Buds" 
                  className={cn(
                    "w-auto object-contain transition-all duration-500 group-hover:opacity-90",
                    scrolled ? "h-9 sm:h-10" : "h-11 sm:h-12"
                  )}
                />
              </Link>
            
              {/* Center Navigation - Desktop */}
              <NavigationMenu scrolled={scrolled} isDark={isDark} />
              
              {/* Right Actions - Desktop */}
              <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
                <LanguageSwitcher scrolled={scrolled} />
                <ThemeToggle isDark={isDark} />

                <div className="flex items-center gap-2 ml-3">
                  {/* Check Eligibility - Emerald Green CTA */}
                  <button
                    onClick={() => setEligibilityDialogOpen(true)}
                    className={cn(
                      "font-semibold px-5 py-2.5 rounded-lg transition-all duration-300",
                      "bg-emerald-500 text-white hover:bg-emerald-400",
                      "shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/50",
                      "text-sm whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    {t('nav.checkEligibility')}
                  </button>
                  
                  {user ? (
                    <>
                      <Link
                        to="/dashboard"
                        className={cn(
                          "font-medium px-4 py-2.5 rounded-lg transition-all duration-300",
                          isDark 
                            ? "bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-gold-500/50"
                            : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 hover:border-teal-400",
                          "text-sm flex items-center gap-2"
                        )}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Portal
                      </Link>
                      <button
                        onClick={handleLogout}
                        className={cn(
                          "p-2.5 rounded-lg transition-all duration-300",
                          isDark 
                            ? "text-white/70 hover:text-white hover:bg-white/10"
                            : "text-teal-600 hover:text-teal-800 hover:bg-teal-50"
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
                        "font-medium px-4 py-2.5 rounded-lg transition-all duration-300",
                        isDark 
                          ? "bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-[#EAB308]/50 hover:text-[#EAB308]"
                          : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 hover:border-teal-400",
                        "text-sm flex items-center gap-2"
                      )}
                    >
                      <User className="w-4 h-4" />
                      {t('nav.patientLogin')}
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button - EXTREME RIGHT */}
              <div className="xl:hidden flex items-center gap-2">
                <ThemeToggle isDark={isDark} />
                <AnimatedMenuButton
                  isOpen={mobileMenuOpen}
                  onClick={() => setMobileMenuOpen(prev => !prev)}
                  className="ml-auto"
                  isDark={isDark}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Intentional Gap - Theme Aware Separator Line */}
        <div className={cn(
          "h-[2px] shadow-sm",
          isDark ? "bg-white/80" : "bg-teal-600/30"
        )} />
      </header>

      {/* Mobile Navigation Overlay */}
      <NavigationOverlay
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
        onEligibilityClick={() => setEligibilityDialogOpen(true)}
        scrolled={scrolled}
      />

      {/* Eligibility Dialog */}
      <EligibilityDialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen} />
    </>
  );
};

export default Header;