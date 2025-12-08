import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import { Link } from "react-router-dom";
import { Mail, MapPin, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');
  
  return (
    <footer id="contact" className="text-white relative overflow-hidden" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
      {/* Decorative botanical cannabis leaf - line art style */}
      <div className="absolute bottom-[60px] right-[30px] md:right-[60px] pointer-events-none opacity-[0.12]">
        <svg 
          viewBox="0 0 200 280" 
          className="w-[180px] md:w-[220px] h-auto"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.8"
        >
          {/* Main stem */}
          <path d="M100 280 L100 140" strokeWidth="1.2" />
          
          {/* Center leaf (largest) */}
          <path d="M100 140 Q100 80 100 30 Q85 60 70 90 Q80 85 90 95 Q85 105 75 115 Q85 110 95 115 Q90 125 80 135 Q90 125 100 140" />
          <path d="M100 140 Q100 80 100 30 Q115 60 130 90 Q120 85 110 95 Q115 105 125 115 Q115 110 105 115 Q110 125 120 135 Q110 125 100 140" />
          {/* Center leaf veins */}
          <path d="M100 35 L100 135" strokeWidth="0.5" />
          <path d="M100 50 Q90 65 78 85" strokeWidth="0.4" />
          <path d="M100 50 Q110 65 122 85" strokeWidth="0.4" />
          <path d="M100 70 Q92 80 85 100" strokeWidth="0.4" />
          <path d="M100 70 Q108 80 115 100" strokeWidth="0.4" />
          
          {/* Left upper leaf */}
          <path d="M100 145 Q70 130 35 100 Q50 115 55 130 Q45 125 35 135 Q50 135 55 145 Q45 150 40 165 Q55 155 70 160 Q60 145 100 145" />
          {/* Left upper leaf veins */}
          <path d="M95 145 Q70 130 42 108" strokeWidth="0.4" />
          <path d="M85 148 Q65 140 50 130" strokeWidth="0.3" />
          
          {/* Right upper leaf */}
          <path d="M100 145 Q130 130 165 100 Q150 115 145 130 Q155 125 165 135 Q150 135 145 145 Q155 150 160 165 Q145 155 130 160 Q140 145 100 145" />
          {/* Right upper leaf veins */}
          <path d="M105 145 Q130 130 158 108" strokeWidth="0.4" />
          <path d="M115 148 Q135 140 150 130" strokeWidth="0.3" />
          
          {/* Left middle leaf */}
          <path d="M100 165 Q60 160 25 145 Q45 155 50 170 Q40 168 30 175 Q45 175 55 185 Q45 190 40 205 Q55 195 75 195 Q55 175 100 165" />
          {/* Left middle leaf veins */}
          <path d="M95 167 Q60 162 32 152" strokeWidth="0.4" />
          
          {/* Right middle leaf */}
          <path d="M100 165 Q140 160 175 145 Q155 155 150 170 Q160 168 170 175 Q155 175 145 185 Q155 190 160 205 Q145 195 125 195 Q145 175 100 165" />
          {/* Right middle leaf veins */}
          <path d="M105 167 Q140 162 168 152" strokeWidth="0.4" />
          
          {/* Left lower leaf (smaller) */}
          <path d="M100 190 Q70 195 50 185 Q60 195 58 205 Q50 202 45 210 Q58 210 62 220 Q55 225 55 235 Q68 225 80 225 Q65 210 100 190" />
          
          {/* Right lower leaf (smaller) */}
          <path d="M100 190 Q130 195 150 185 Q140 195 142 205 Q150 202 155 210 Q142 210 138 220 Q145 225 145 235 Q132 225 120 225 Q135 210 100 190" />
          
          {/* Serrated edges detail on main leaves */}
          <path d="M70 90 Q68 88 72 85" strokeWidth="0.4" />
          <path d="M75 115 Q73 113 77 110" strokeWidth="0.4" />
          <path d="M130 90 Q132 88 128 85" strokeWidth="0.4" />
          <path d="M125 115 Q127 113 123 110" strokeWidth="0.4" />
        </svg>
      </div>
      
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
