import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import { Link } from "react-router-dom";
import { Mail, MapPin, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');
  
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
                  src={hbLogoWhite} 
                  alt="Healing Buds Logo" 
                  className="h-10 w-auto object-contain group-hover:opacity-80 transition-opacity"
                />
              </Link>
              <p className="font-body text-white/70 text-sm leading-relaxed mb-6">
                {t('footer.tagline')}
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-white/60 text-sm group">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                  <span className="font-body">
                    Avenida D. João II, 98 A<br />
                    1990-100 Lisboa, Portugal
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm group">
                  <Mail className="w-4 h-4 flex-shrink-0 group-hover:text-primary transition-colors" />
                  <a href="mailto:info@healingbuds.com" className="font-body hover:text-white transition-colors">
                    info@healingbuds.com
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-10">
              
              {/* Company */}
              <div>
                <h4 className="font-jakarta font-semibold text-sm uppercase tracking-wider mb-5 text-white/90 flex items-center gap-2">
                  <Leaf className="w-3.5 h-3.5 text-primary" />
                  {t('footer.company')}
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/about-us" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      {t('footer.aboutUs')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/what-we-do" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      {t('footer.ourStandards')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/research" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      {t('footer.research')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/the-wire" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      {t('footer.theWire')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-jakarta font-semibold text-sm uppercase tracking-wider mb-5 text-white/90 flex items-center gap-2">
                  <Leaf className="w-3.5 h-3.5 text-primary" />
                  {t('footer.resources')}
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/contact" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      {t('footer.patientAccess')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/conditions" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      {t('footer.conditionsTreated')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      {t('footer.franchiseOpportunities')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-jakarta font-semibold text-sm uppercase tracking-wider mb-5 text-white/90 flex items-center gap-2">
                  <Leaf className="w-3.5 h-3.5 text-primary" />
                  {t('footer.legal')}
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/privacy-policy" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      {t('footer.privacyPolicy')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms-of-service" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      {t('footer.termsOfService')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="font-body text-sm text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 transform duration-200">
                      {t('footer.compliance')}
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-body text-white/50 text-xs">
              {t('footer.copyright', { year: currentYear })}
            </p>
            <p className="font-body text-white/40 text-xs">
              {t('footer.commitment')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
