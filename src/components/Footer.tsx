import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer id="contact" className="bg-gradient-to-br from-[#1F2A25] to-[#13303D] text-white">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-10 sm:py-12 border-b border-white/10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <Link to="/" className="inline-block mb-4">
                <img 
                  src={hbLogoWhite} 
                  alt="Healing Buds Logo" 
                  className="h-8 w-auto object-contain hover:opacity-80 transition-opacity"
                />
              </Link>
              <p className="font-body text-white/60 text-sm leading-relaxed mb-4">
                Shaping the future of cannabis through research and excellence.
              </p>
              <div className="flex items-start gap-2 text-white/60 text-xs mb-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="font-body">
                  Av. Fco. Sá Carneiro, Edf. Golfinho, Lj. 3<br />
                  Quarteira, Faro, 812 5148, Portugal
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:info@healingbuds.com" className="font-body hover:text-white transition-colors">
                  info@healingbuds.com
                </a>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              
              {/* Company */}
              <div>
                <h4 className="font-pharma font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">
                  Company
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/about-us" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/what-we-do" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block">
                      Our Standards
                    </Link>
                  </li>
                  <li>
                    <Link to="/research" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block">
                      Research
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-pharma font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">
                  Resources
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/contact" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block">
                      Patient Access
                    </Link>
                  </li>
                  <li>
                    <Link to="/research" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block">
                      Healthcare Professionals
                    </Link>
                  </li>
                  <li>
                    <Link to="/#news" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block">
                      News & Updates
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-pharma font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">
                  Legal
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/contact" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block">
                      Compliance
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-body text-white/50 text-xs">
              © {currentYear} Healing Buds Global. All rights reserved.
            </p>
            <p className="font-body text-white/40 text-xs">
              Committed to advancing global cannabis medicine
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
