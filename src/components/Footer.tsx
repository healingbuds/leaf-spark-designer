import drGreenLogo from "@/assets/drgreen-nft-logo.png";
import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useTenant } from "@/hooks/useTenant";
import HBIcon from "@/components/HBIcon";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');
  const locationConfig = useGeoLocation();
  const { tenant } = useTenant();
  
  return (
    <footer id="contact" className="text-white relative overflow-hidden" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 border-b border-white/10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <Link to="/" className="inline-block mb-5 group">
                <img 
                  src={tenant.logo.dark} 
                  alt={`${tenant.name} Logo`} 
                  className="h-10 min-w-[100px] w-auto object-contain group-hover:opacity-80 transition-opacity"
                />
              </Link>
              <p className="font-body text-white/70 text-sm leading-relaxed mb-6">
                {tenant.description}
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-white/60 text-sm group">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary/80 group-hover:text-primary transition-colors" />
                  <span className="font-body">
                    {locationConfig.address}<br />
                    {locationConfig.city}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm group">
                  <Mail size={16} className="flex-shrink-0 text-primary/80 group-hover:text-primary transition-colors" />
                  <a href={`mailto:${locationConfig.email}`} className="font-body hover:text-white transition-colors">
                    {locationConfig.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-10">
              
              {/* Patient */}
              <div>
              <h4 className="font-jakarta font-semibold text-sm uppercase tracking-wider mb-5 text-white/90 flex items-center gap-2">
                  <HBIcon size="sm" variant="white" className="flex-shrink-0" />
                  Patient
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/eligibility" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      Check Eligibility
                    </Link>
                  </li>
                  <li>
                    <Link to="/shop" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      Dispensary
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      Patient Portal
                    </Link>
                  </li>
                  <li>
                    <Link to="/the-wire" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      The Wire
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
              <h4 className="font-jakarta font-semibold text-sm uppercase tracking-wider mb-5 text-white/90 flex items-center gap-2">
                  <HBIcon size="sm" variant="white" className="flex-shrink-0" />
                  Support
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/support" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link to="/support" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/support#delivery" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      Shipping Info
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
              <h4 className="font-jakarta font-semibold text-sm uppercase tracking-wider mb-5 text-white/90 flex items-center gap-2">
                  <HBIcon size="sm" variant="white" className="flex-shrink-0" />
                  Legal
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/privacy-policy" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms-of-service" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 pb-28 lg:pb-8">
          {/* Top row: Copyright and Dr. Green logo */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-body text-white/50 text-xs">
              © {currentYear} {tenant.name}. All rights reserved.
            </p>
            
            {/* Dr. Green NFT Partnership Logo - with "Powered by" text */}
            <a 
              href="https://drgreennft.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 opacity-60 hover:opacity-80 transition-opacity duration-300"
              title="Powered by Dr. Green NFT"
            >
              <span className="font-body text-white/50 text-xs">Powered by</span>
              <img 
                src={drGreenLogo}
                alt="Dr. Green NFT"
                className="h-8 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
