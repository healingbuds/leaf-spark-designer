import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import EligibilityDialog from "./EligibilityDialog";
import { motion, useScroll, useSpring } from "framer-motion";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [whatWeDoOpen, setWhatWeDoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const location = useLocation();
  
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

  const isActive = (path: string) => location.pathname === path;
  
  const isWhatWeDoActive = ['/what-we-do', '/cultivating-processing', '/manufacture-distribution', '/conditions', '/medical-clinics', '/online-pharmacy'].includes(location.pathname) || location.pathname.startsWith('/conditions/');

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
            "hidden md:flex items-center transition-all duration-500 ease-out",
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
                What We Do
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
                  <div className="font-medium">Cultivating & Processing</div>
                  <div className="text-sm text-muted-foreground">Pharmaceutical-grade cultivation</div>
                </Link>
                <Link
                  to="/manufacture-distribution"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors border-b border-border"
                  onClick={() => setWhatWeDoOpen(false)}
                >
                  <div className="font-medium">Manufacture & Distribution</div>
                  <div className="text-sm text-muted-foreground">Global supply chain excellence</div>
                </Link>
                <Link
                  to="/conditions"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors border-b border-border"
                  onClick={() => setWhatWeDoOpen(false)}
                >
                  <div className="font-medium">Eligible Conditions</div>
                  <div className="text-sm text-muted-foreground">Treatable conditions with medical cannabis</div>
                </Link>
                <Link
                  to="/medical-clinics"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors border-b border-border"
                  onClick={() => setWhatWeDoOpen(false)}
                >
                  <div className="font-medium">Medical Cannabis Clinics</div>
                  <div className="text-sm text-muted-foreground">Patient-centered care</div>
                </Link>
                <Link
                  to="/online-pharmacy"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors"
                  onClick={() => setWhatWeDoOpen(false)}
                >
                  <div className="font-medium">Online Medical Cannabis Pharmacy</div>
                  <div className="text-sm text-muted-foreground">Convenient access to care</div>
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
              Research
            </Link>
            <Link 
              to="/about-us" 
              className={cn(
                "font-body flex items-center gap-1 font-medium transition-all duration-300 ease-out rounded-md hover:scale-105",
                scrolled ? "text-sm px-2.5 py-1.5" : "text-sm px-3 py-1.5",
                isActive("/about-us") 
                  ? "text-white bg-white/10" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              About Us
              <ChevronDown className="w-4 h-4" />
            </Link>
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
              Contact Us
            </Link>

            {/* Desktop Action Buttons - Removed, moved to bottom */}
          </nav>

          {/* Eligibility Dialog */}
          <EligibilityDialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen} />

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "md:hidden text-white p-2 transition-all duration-300 hover:scale-110 active:scale-95",
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
            "md:hidden overflow-y-auto max-h-[calc(100vh-140px)] transition-all duration-300 ease-in-out border-t border-white/10",
            mobileMenuOpen ? "py-4 opacity-100" : "max-h-0 py-0 opacity-0"
          )}
        >
          <div className="flex flex-col space-y-3 px-2">
            <div className="space-y-1.5">
              <div className={cn(
                "font-normal text-sm py-1.5 font-semibold",
                isWhatWeDoActive ? "text-white" : "text-white/80"
              )}>
                What We Do
              </div>
              <div className="pl-3 space-y-1 border-l-2 border-white/20">
                <Link 
                  to="/cultivating-processing" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cultivating & Processing
                </Link>
                <Link 
                  to="/manufacture-distribution" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Manufacture & Distribution
                </Link>
                <Link 
                  to="/conditions" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Eligible Conditions
                </Link>
                <Link 
                  to="/medical-clinics" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Medical Cannabis Clinics
                </Link>
                <Link 
                  to="/online-pharmacy" 
                  className="block text-xs text-white/80 hover:text-white py-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Online Medical Cannabis Pharmacy
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
              Research
            </Link>
            <Link 
              to="/about-us" 
              className={cn(
                "font-normal text-sm transition-all duration-200 py-1.5",
                isActive("/about-us") ? "text-white font-semibold" : "text-white/80 hover:text-white"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={cn(
                "font-normal text-sm transition-all duration-200 py-1.5",
                isActive("/contact") ? "text-white font-semibold" : "text-white/80 hover:text-white"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            
            {/* Mobile Action Buttons - Removed, moved to bottom */}
          </div>
        </nav>
      </div>
    </header>
  </>
  );
};

export default Header;
