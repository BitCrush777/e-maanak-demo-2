import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { hi } from './locales/hi';

const STORAGE_KEY = 'emaanak_language';

const savedLang = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'en';
const initialLang = savedLang === 'hi' ? 'hi' : 'en';

// Set document lang attribute on start
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React handles escaping
    },
  });

export const setAppLanguage = (lang: 'en' | 'hi') => {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }
};

export const getAppLanguage = (): 'en' | 'hi' => {
  return (i18n.language as 'en' | 'hi') || 'en';
};

export const formatDateLocale = (dateStr?: string | Date, lang?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    const currentLang = lang || getAppLanguage();
    const locale = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    return d.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
};

export default i18n;
