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

import ptCommon from './locales/pt/common.json';
import ptHome from './locales/pt/home.json';
import ptAuth from './locales/pt/auth.json';
import ptResearch from './locales/pt/research.json';
import ptContact from './locales/pt/contact.json';
import ptConditions from './locales/pt/conditions.json';
import ptWhatWeDo from './locales/pt/whatWeDo.json';
import ptAboutUs from './locales/pt/aboutUs.json';
import ptClinics from './locales/pt/clinics.json';

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
  },
};

// Detect language based on geolocation
const detectLanguageFromGeo = async (): Promise<string> => {
  const storedLang = localStorage.getItem('i18nextLng');
  if (storedLang) {
    return storedLang;
  }

  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const lang = data.country_code === 'PT' ? 'pt' : 'en';
    localStorage.setItem('i18nextLng', lang);
    return lang;
  } catch (error) {
    console.log('Geolocation detection failed, defaulting to English');
    return 'en';
  }
};

// Initialize with stored language or default
const getInitialLanguage = (): string => {
  return localStorage.getItem('i18nextLng') || 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'home', 'auth', 'research', 'contact', 'conditions', 'whatWeDo', 'aboutUs', 'clinics'],
    interpolation: {
      escapeValue: false,
    },
  });

// Run geolocation detection after init (only on first visit)
if (!localStorage.getItem('i18nextLng')) {
  detectLanguageFromGeo().then((lang) => {
    i18n.changeLanguage(lang);
  });
}

export default i18n;
