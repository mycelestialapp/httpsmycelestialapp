import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import fr from './locales/fr.json';
import zhHant from './locales/zh-Hant.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import th from './locales/th.json';
import de from './locales/de.json';
import ru from './locales/ru.json';

const supportedLngs = ['en', 'fr', 'zh-Hant', 'zh-CN', 'zh', 'es', 'pt', 'ja', 'ko', 'ar', 'hi', 'th', 'de', 'ru'];

/**
 * Map any detected browser language code to our supported language codes.
 * e.g. "ko-KR" → "ko", "zh-TW" → "zh-Hant", "zh-CN" → "zh-Hant", "pt-BR" → "pt"
 */
function resolveLanguage(detected: string): string {
  const lower = detected.toLowerCase();
  
  // Exact match first
  if (supportedLngs.includes(detected)) return detected;
  
  // Chinese variants → zh-Hant
  if (lower.startsWith('zh')) return 'zh-Hant';
  
  // Base language match (e.g. ko-KR → ko, pt-BR → pt)
  const base = lower.split('-')[0];
  if (supportedLngs.includes(base)) return base;
  
  return 'en';
}

// 中文統一用繁體：若偵測到 zh-CN / zh，啟動後改為 zh-Hant，避免介面出現簡體
function normalizeChineseLng(lng: string): string {
  if (lng === 'zh-CN' || lng === 'zh' || lng?.startsWith('zh-')) return 'zh-Hant';
  return lng;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      'zh-Hant': { translation: zhHant },
      'zh-CN': { translation: zhHant },
      zh: { translation: zhHant },
      es: { translation: es },
      pt: { translation: pt },
      ja: { translation: ja },
      ko: { translation: ko },
      ar: { translation: ar },
      hi: { translation: hi },
      th: { translation: th },
      de: { translation: de },
      ru: { translation: ru },
    },
    supportedLngs,
    nonExplicitSupportedLngs: false,
    load: 'currentOnly',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      convertDetectedLanguage: (lng: string) => normalizeChineseLng(resolveLanguage(lng)),
    },
  });

// 啟動後若當前是 zh-CN / zh，強制改為 zh-Hant，確保介面一律顯示繁體
i18n.on('initialized', () => {
  const current = i18n.language || '';
  if (current === 'zh-CN' || current === 'zh' || (current.startsWith('zh') && current !== 'zh-Hant')) {
    i18n.changeLanguage('zh-Hant');
  }
});

export default i18n;
