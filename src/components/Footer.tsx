import hbLogoWhite from "@/assets/hb-logo-white-new.png";
import { Link } from "react-router-dom";
import { Mail, MapPin, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');
  
  return (
    <footer id="contact" className="text-white relative overflow-hidden" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
      {/* Continuous single-line cannabis leaf - exact match to reference */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-[0.06] pointer-events-none">
        <svg 
          viewBox="0 0 400 140" 
          fill="none" 
          className="w-[600px] md:w-[800px] h-auto text-white"
        >
          {/* Flowing horizontal line from left */}
          <path 
            d="M0 120 
               Q30 118 60 115
               Q90 112 110 105
               Q130 98 145 90"
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Decorative curl/loop at start of leaf */}
          <path 
            d="M145 90
               Q135 95 130 105
               Q128 115 135 120
               Q145 125 155 118
               Q165 110 160 95
               Q158 85 165 80"
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* 7-fingered cannabis leaf - continuous line with serrated edges */}
          {/* Left outer leaflet (finger 1) */}
          <path 
            d="M165 80
               Q155 75 145 60
               Q142 55 140 48
               Q138 42 142 38
               Q145 35 148 38
               Q152 42 155 50
               Q158 58 168 65"
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Left middle leaflet (finger 2) */}
          <path 
            d="M168 65
               Q160 55 155 40
               Q152 30 155 22
               Q158 16 162 20
               Q166 26 170 38
               Q174 50 180 58"
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Left inner leaflet (finger 3) */}
          <path 
            d="M180 58
               Q175 45 178 28
               Q180 18 185 12
               Q190 8 194 14
               Q198 22 196 38
               Q194 52 195 60"
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Center leaflet (finger 4 - tallest) */}
          <path 
            d="M195 60
               Q195 42 200 22
               Q203 10 208 5
               Q213 2 218 8
               Q223 16 222 32
               Q220 48 225 58"
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Right inner leaflet (finger 5) */}
          <path 
            d="M225 58
               Q228 45 235 28
               Q240 18 248 14
               Q254 10 258 18
               Q260 28 255 45
               Q250 58 252 65"
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Right middle leaflet (finger 6) */}
          <path 
            d="M252 65
               Q258 50 268 38
               Q275 28 282 26
               Q288 24 290 32
               Q290 42 282 55
               Q275 65 272 72"
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Right outer leaflet (finger 7) */}
          <path 
            d="M272 72
               Q280 62 290 55
               Q298 50 305 52
               Q310 56 308 64
               Q304 72 295 78
               Q285 84 278 85"
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Stem connecting to right flowing line */}
          <path 
            d="M278 85
               Q285 92 295 100
               Q310 110 330 115
               Q360 120 400 120"
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
          />
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
