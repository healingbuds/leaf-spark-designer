import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, LogOut } from "lucide-react";
import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import EligibilityDialog from "./EligibilityDialog";
import { motion, useScroll, useSpring } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [whatWeDoOpen, setWhatWeDoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { t } = useTranslation('common');
  
  // Scroll progress tracking
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;
  
  const isWhatWeDoActive = ['/what-we-do', '/cultivating-processing', '/manufacture-distribution', '/medical-clinics', '/online-pharmacy'].includes(location.pathname);
  const isAboutUsActive = ['/about-us', '/blockchain-technology'].includes(location.pathname);
  const [aboutUsOpen, setAboutUsOpen] = useState(false);

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary origin-left z-[60]"
        style={{ 
          scaleX,
          transformOrigin: "0%"
        }}
      />
      
      <header 
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn(
            "flex items-center justify-between transition-all duration-500 ease-out",
            scrolled ? "h-16 md:h-20" : "h-20 md:h-28"
          )}>
            <Link to="/" className="flex items-center flex-shrink-0 group">
            <img 
              src={hbLogoWhite} 
              alt="Healing Buds Logo" 
              className={cn(
                "w-auto object-contain transition-all duration-500 ease-out group-hover:scale-105",
                scrolled ? "h-10 sm:h-12 md:h-16" : "h-12 sm:h-16 md:h-20"
              )}
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className={cn(
            "hidden lg:flex items-center transition-all duration-500 ease-out",
            scrolled ? "space-x-4" : "space-x-6"
          )}>
            <div 
              className="relative"
              onMouseEnter={() => setWhatWeDoOpen(true)}
              onMouseLeave={() => setWhatWeDoOpen(false)}
            >
                <button 
                className={cn(
                  "font-body flex items-center gap-1 font-medium transition-all duration-300 ease-out relative rounded-md hover:scale-105",
                  scrolled ? "text-sm px-2.5 py-1.5" : "text-sm px-3 py-1.5",
                  isWhatWeDoActive
                    ? "text-white bg-white/10" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {t('nav.whatWeDo')}
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-150", whatWeDoOpen && "rotate-180")} />
              </button>
              
              {/* Dropdown Menu - Linear style */}
              <div 
                className={cn(
                  "absolute top-full left-0 mt-2 w-72 bg-background rounded-xl shadow-card border border-border/40 overflow-hidden transition-all duration-150 z-50",
                  whatWeDoOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                )}
              >
                <Link
                  to="/cultivating-processing"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors border-b border-border"
                  onClick={() => setWhatWeDoOpen(false)}
                >
                  <div className="font-medium">{t('dropdown.cultivating')}</div>
                  <div className="text-sm text-muted-foreground">{t('dropdown.cultivatingDesc')}</div>
                </Link>
                <Link
                  to="/manufacture-distribution"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors border-b border-border"
                  onClick={() => setWhatWeDoOpen(false)}
                >
                  <div className="font-medium">{t('dropdown.manufacture')}</div>
                  <div className="text-sm text-muted-foreground">{t('dropdown.manufactureDesc')}</div>
                </Link>
                <Link
                  to="/medical-clinics"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors border-b border-border"
                  onClick={() => setWhatWeDoOpen(false)}
                >
                  <div className="font-medium">{t('dropdown.clinics')}</div>
                  <div className="text-sm text-muted-foreground">{t('dropdown.clinicsDesc')}</div>
                </Link>
                <Link
                  to="/online-pharmacy"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors"
                  onClick={() => setWhatWeDoOpen(false)}
                >
                  <div className="font-medium">{t('dropdown.pharmacy')}</div>
                  <div className="text-sm text-muted-foreground">{t('dropdown.pharmacyDesc')}</div>
                </Link>
              </div>
            </div>
            <Link 
              to="/research" 
              className={cn(
                "font-body font-medium transition-all duration-300 ease-out rounded-md hover:scale-105",
                scrolled ? "text-sm px-2.5 py-1.5" : "text-sm px-3 py-1.5",
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
                "font-body font-medium transition-all duration-300 ease-out rounded-md hover:scale-105",
                scrolled ? "text-sm px-2.5 py-1.5" : "text-sm px-3 py-1.5",
                isActive("/the-wire") || location.pathname.startsWith("/the-wire/")
                  ? "text-white bg-white/10" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              {t('nav.theWire')}
            </Link>
            <div 
              className="relative"
              onMouseEnter={() => setAboutUsOpen(true)}
              onMouseLeave={() => setAboutUsOpen(false)}
            >
              <button 
                className={cn(
                  "font-body flex items-center gap-1 font-medium transition-all duration-300 ease-out relative rounded-md hover:scale-105",
                  scrolled ? "text-sm px-2.5 py-1.5" : "text-sm px-3 py-1.5",
                  isAboutUsActive
                    ? "text-white bg-white/10" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {t('nav.aboutUs')}
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-150", aboutUsOpen && "rotate-180")} />
              </button>
              
              {/* Dropdown Menu */}
              <div 
                className={cn(
                  "absolute top-full left-0 mt-2 w-72 bg-background rounded-xl shadow-card border border-border/40 overflow-hidden transition-all duration-150 z-50",
                  aboutUsOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                )}
              >
                <Link
                  to="/about-us"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors border-b border-border"
                  onClick={() => setAboutUsOpen(false)}
                >
                  <div className="font-medium">{t('dropdown.aboutHealing')}</div>
                  <div className="text-sm text-muted-foreground">{t('dropdown.aboutHealingDesc')}</div>
                </Link>
                <Link
                  to="/blockchain-technology"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors"
                  onClick={() => setAboutUsOpen(false)}
                >
                  <div className="font-medium">{t('dropdown.blockchain')}</div>
                  <div className="text-sm text-muted-foreground">{t('dropdown.blockchainDesc')}</div>
                </Link>
              </div>
            </div>
            <Link 
              to="/contact" 
              className={cn(
                "font-body font-medium transition-all duration-300 ease-out rounded-md hover:scale-105",
                scrolled ? "text-sm px-2.5 py-1.5" : "text-sm px-3 py-1.5",
                isActive("/contact") 
                  ? "text-white bg-white/10" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              {t('nav.contactUs')}
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher scrolled={scrolled} />

            {/* Desktop Action Buttons */}
            <div className="flex items-center gap-3 ml-4">
              <button
                onClick={() => setEligibilityDialogOpen(true)}
                className={cn(
                  "font-body font-semibold px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl",
                  "backdrop-blur-2xl bg-gradient-to-br from-white/30 via-white/20 to-white/10",
                  "dark:from-white/20 dark:via-white/10 dark:to-white/5",
                  "border border-white/40 shadow-lg hover:border-white/60",
                  "text-white hover:bg-white/30",
                  scrolled ? "text-sm" : "text-sm"
                )}
              >
                {t('nav.checkEligibility')}
              </button>
              {user ? (
                <button
                  onClick={handleLogout}
                  className={cn(
                    "font-body font-semibold px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl",
                    "backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/15 to-white/10",
                    "dark:from-white/15 dark:via-white/10 dark:to-white/5",
                    "border border-white/30 shadow-lg hover:border-white/50",
                    "text-white hover:bg-white/25 flex items-center gap-2",
                    scrolled ? "text-sm" : "text-sm"
                  )}
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.signOut')}
                </button>
              ) : (
                <Link
                  to="/auth"
                  className={cn(
                    "font-body font-semibold px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl",
                    "backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/15 to-white/10",
                    "dark:from-white/15 dark:via-white/10 dark:to-white/5",
                    "border border-white/30 shadow-lg hover:border-white/50",
                    "text-white hover:bg-white/25",
                    scrolled ? "text-sm" : "text-sm"
                  )}
                >
                  {t('nav.patientLogin')}
                </Link>
              )}
            </div>
          </nav>

          {/* Eligibility Dialog */}
          <EligibilityDialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen} />

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "lg:hidden text-white p-2 transition-all duration-300 hover:scale-110 active:scale-95",
              scrolled && "p-1.5"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className={cn("transition-all duration-300", scrolled ? "w-5 h-5" : "w-6 h-6")} />
            ) : (
              <Menu className={cn("transition-all duration-300", scrolled ? "w-5 h-5" : "w-6 h-6")} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav 
          className={cn(
            "lg:hidden overflow-y-auto max-h-[calc(100vh-140px)] transition-all duration-300 ease-in-out border-t border-white/10",
            mobileMenuOpen ? "py-4 opacity-100" : "max-h-0 py-0 opacity-0"
          )}
        >
          <div className="flex flex-col space-y-3 px-2">
            <div className="space-y-1.5">
              <div className={cn(
                "font-normal text-sm py-1.5 font-semibold",
                isWhatWeDoActive ? "text-white" : "text-white/80"
              )}>
                {t('nav.whatWeDo')}
              </div>
              <div className="pl-3 space-y-1 border-l-2 border-white/20">
                <Link 
                  to="/cultivating-processing" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('dropdown.cultivating')}
                </Link>
                <Link 
                  to="/manufacture-distribution" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('dropdown.manufacture')}
                </Link>
                <Link 
                  to="/medical-clinics" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('dropdown.clinics')}
                </Link>
                <Link 
                  to="/online-pharmacy" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('dropdown.pharmacy')}
                </Link>
              </div>
            </div>
            <Link 
              to="/research" 
              className={cn(
                "font-normal text-sm transition-all duration-200 py-1.5",
                isActive("/research") ? "text-white font-semibold" : "text-white/80 hover:text-white"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.research')}
            </Link>
            <Link 
              to="/the-wire" 
              className={cn(
                "font-normal text-sm transition-all duration-200 py-1.5",
                isActive("/the-wire") || location.pathname.startsWith("/the-wire/") ? "text-white font-semibold" : "text-white/80 hover:text-white"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.theWire')}
            </Link>
            <div className="space-y-1.5">
              <div className={cn(
                "font-normal text-sm py-1.5 font-semibold",
                isAboutUsActive ? "text-white" : "text-white/80"
              )}>
                {t('nav.aboutUs')}
              </div>
              <div className="pl-3 space-y-1 border-l-2 border-white/20">
                <Link 
                  to="/about-us" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('dropdown.aboutHealing')}
                </Link>
                <Link 
                  to="/blockchain-technology" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('dropdown.blockchain')}
                </Link>
              </div>
            </div>
            <Link 
              to="/contact" 
              className={cn(
                "font-normal text-sm transition-all duration-200 py-1.5",
                isActive("/contact") ? "text-white font-semibold" : "text-white/80 hover:text-white"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.contactUs')}
            </Link>

            {/* Mobile Language Switcher */}
            <div className="pt-2 border-t border-white/10">
              <LanguageSwitcher scrolled={scrolled} />
            </div>
          </div>
        </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
