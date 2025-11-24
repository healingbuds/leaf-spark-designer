import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import EligibilityDialog from "./EligibilityDialog";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [whatWeDoOpen, setWhatWeDoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  
  const isWhatWeDoActive = ['/what-we-do', '/cultivating-processing', '/manufacture-distribution', '/medical-devices', '/medical-clinics', '/online-pharmacy'].includes(location.pathname);

  return (
    <>
      <header 
        className={cn(
          "fixed top-4 left-4 right-4 z-50 backdrop-blur-xl rounded-xl transition-all duration-200 border border-white/10",
          scrolled ? "shadow-card" : "shadow-sm"
        )}
        style={{ backgroundColor: 'rgba(42, 61, 58, 0.95)' }}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-20 md:h-28">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src={hbLogoWhite} 
              alt="Healing Buds Logo" 
              className="h-12 w-auto object-contain sm:h-16 md:h-20"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <div 
              className="relative"
              onMouseEnter={() => setWhatWeDoOpen(true)}
              onMouseLeave={() => setWhatWeDoOpen(false)}
            >
                <button 
                className={cn(
                  "font-body flex items-center gap-1 font-medium text-sm transition-all duration-150 relative px-3 py-1.5 rounded-md",
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
                  to="/medical-devices"
                  className="block px-4 py-3 text-foreground hover:bg-muted transition-colors border-b border-border"
                  onClick={() => setWhatWeDoOpen(false)}
                >
                  <div className="font-medium">Medical Devices</div>
                  <div className="text-sm text-muted-foreground">Advanced delivery systems</div>
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
                "font-body font-medium text-sm transition-all duration-150 px-3 py-1.5 rounded-md",
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
                "font-body flex items-center gap-1 font-medium text-sm transition-all duration-150 px-3 py-1.5 rounded-md",
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
                "font-body font-medium text-sm transition-all duration-150 px-3 py-1.5 rounded-md",
                isActive("/contact") 
                  ? "text-white bg-white/10" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              Contact Us
            </Link>
          </nav>

          {/* Eligibility Dialog */}
          <EligibilityDialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen} />

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav 
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/10",
            mobileMenuOpen ? "max-h-[600px] py-6 opacity-100" : "max-h-0 py-0 opacity-0"
          )}
        >
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <div className={cn(
                "font-normal text-base py-2",
                isWhatWeDoActive ? "text-white font-semibold" : "text-white/80"
              )}>
                What We Do
              </div>
              <div className="pl-4 space-y-2 border-l-2 border-white/20">
                <Link 
                  to="/cultivating-processing" 
                  className="block text-sm text-white/80 hover:text-white py-1.5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cultivating & Processing
                </Link>
                <Link 
                  to="/manufacture-distribution" 
                  className="block text-sm text-white/80 hover:text-white py-1.5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Manufacture & Distribution
                </Link>
                <Link 
                  to="/medical-devices" 
                  className="block text-sm text-white/80 hover:text-white py-1.5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Medical Devices
                </Link>
                <Link 
                  to="/medical-clinics" 
                  className="block text-sm text-white/80 hover:text-white py-1.5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Medical Cannabis Clinics
                </Link>
                <Link 
                  to="/online-pharmacy" 
                  className="block text-sm text-white/80 hover:text-white py-1.5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Online Medical Cannabis Pharmacy
                </Link>
              </div>
            </div>
            <Link 
              to="/research" 
              className={cn(
                "font-normal text-base transition-all duration-200 py-2",
                isActive("/research") ? "text-white font-semibold" : "text-white/80 hover:text-white"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Research
            </Link>
            <Link 
              to="/about-us" 
              className={cn(
                "font-normal text-base transition-all duration-200 py-2",
                isActive("/about-us") ? "text-white font-semibold" : "text-white/80 hover:text-white"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={cn(
                "font-normal text-base transition-all duration-200 py-2",
                isActive("/contact") ? "text-white font-semibold" : "text-white/80 hover:text-white"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            
            {/* Mobile Buttons - Floating Style */}
            <div className="pt-4 space-y-3 border-t border-white/20 mt-4">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setEligibilityDialogOpen(true);
                }}
                className="w-full font-body font-semibold text-sm text-white border-2 border-white bg-white/5 px-5 py-3 rounded-full transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
              >
                Eligibility Check
              </button>
              <button 
                className="w-full font-body font-semibold text-sm text-white border-2 border-white bg-white/5 px-5 py-3 rounded-full transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
              >
                Patient Sign-In
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>

    {/* Buttons underneath navbar - desktop: liquid, mobile: floating */}
    <div className="hidden md:block fixed top-24 md:top-32 left-4 z-40">
      <div className="flex gap-3">
        <button 
          onClick={() => setEligibilityDialogOpen(true)}
          className="relative font-body font-semibold text-sm text-white border-2 border-white px-8 py-2 rounded-full overflow-hidden group backdrop-blur-md"
          style={{ backgroundColor: 'rgba(42, 61, 58, 0.7)' }}
        >
          <span className="relative z-10">Eligibility Check</span>
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-500 ease-out transform scale-x-0 group-hover:scale-x-100 origin-left"></span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></span>
        </button>
        <button 
          className="relative font-body font-semibold text-sm text-white border-2 border-white px-8 py-2 rounded-full overflow-hidden group backdrop-blur-md"
          style={{ backgroundColor: 'rgba(42, 61, 58, 0.7)' }}
        >
          <span className="relative z-10">Patient Sign-In</span>
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-500 ease-out transform scale-x-0 group-hover:scale-x-100 origin-left"></span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></span>
        </button>
      </div>
    </div>
  </>
  );
};

export default Header;
