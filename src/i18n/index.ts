import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enAuth from './locales/en/auth.json';
import enResearch from './locales/en/research.json';
import enContact from './locales/en/contact.json';
import enConditions from './locales/en/conditions.json';
import enWhatWeDo from './locales/en/whatWeDo.json';
import enAboutUs from './locales/en/aboutUs.json';
import enClinics from './locales/en/clinics.json';
import enTheWire from './locales/en/theWire.json';
import enLegal from './locales/en/legal.json';
import enConditionPages from './locales/en/conditionPages.json';
import enShop from './locales/en/shop.json';

import ptCommon from './locales/pt/common.json';
import ptHome from './locales/pt/home.json';
import ptAuth from './locales/pt/auth.json';
import ptResearch from './locales/pt/research.json';
import ptContact from './locales/pt/contact.json';
import ptConditions from './locales/pt/conditions.json';
import ptWhatWeDo from './locales/pt/whatWeDo.json';
import ptAboutUs from './locales/pt/aboutUs.json';
import ptClinics from './locales/pt/clinics.json';
import ptTheWire from './locales/pt/theWire.json';
import ptLegal from './locales/pt/legal.json';
import ptConditionPages from './locales/pt/conditionPages.json';
import ptShop from './locales/pt/shop.json';

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    auth: enAuth,
    research: enResearch,
    contact: enContact,
    conditions: enConditions,
    whatWeDo: enWhatWeDo,
    aboutUs: enAboutUs,
    clinics: enClinics,
    theWire: enTheWire,
    legal: enLegal,
    conditionPages: enConditionPages,
    shop: enShop,
  },
  pt: {
    common: ptCommon,
    home: ptHome,
    auth: ptAuth,
    research: ptResearch,
    contact: ptContact,
    conditions: ptConditions,
    whatWeDo: ptWhatWeDo,
    aboutUs: ptAboutUs,
    clinics: ptClinics,
    theWire: ptTheWire,
    legal: ptLegal,
    conditionPages: ptConditionPages,
    shop: ptShop,
  },
};

// Detect language based on domain
const detectLanguageFromDomain = (): string => {
  // First check if user has manually selected a language
  const storedLang = localStorage.getItem('i18nextLng');
  if (storedLang && (storedLang === 'en' || storedLang === 'pt')) {
    return storedLang;
  }

  const hostname = window.location.hostname;
  
  // Portugal domains get Portuguese
  if (hostname.endsWith('.pt') || hostname.includes('.pt.') || hostname.includes('healingbuds.pt')) {
    return 'pt';
  }
  
  // UK, South Africa, and Global domains get English
  if (
    hostname.endsWith('.co.uk') || 
    hostname.endsWith('.co.za') || 
    hostname.endsWith('.global') ||
    hostname.includes('.uk') || 
    hostname.includes('.za')
  ) {
    return 'en';
  }
  
  // Default to English for all other domains (including .com, localhost, lovable.app, etc.)
  return 'en';
};

// Initialize with stored language or domain-based default
const getInitialLanguage = (): string => {
  return detectLanguageFromDomain();
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'home', 'auth', 'research', 'contact', 'conditions', 'whatWeDo', 'aboutUs', 'clinics', 'theWire', 'legal', 'conditionPages', 'shop'],
    interpolation: {
      escapeValue: false,
    },
  });

// Set initial language based on domain if not manually changed
if (!localStorage.getItem('i18nextLng')) {
  const domainLang = detectLanguageFromDomain();
  localStorage.setItem('i18nextLng', domainLang);
}

export default i18n;
