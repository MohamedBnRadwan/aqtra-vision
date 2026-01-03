import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json';
import ar from './locales/ar/translation.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

function applyDir(lng: string) {
  const root = document.documentElement;
  root.dir = lng === 'ar' ? 'rtl' : 'ltr';
  root.lang = lng || 'en';
}

// Set document direction based on language
i18n.on('languageChanged', (lng) => {
  applyDir(lng);
});

// Ensure initial direction matches the detected language
applyDir(i18n.language || 'en');

export default i18n;