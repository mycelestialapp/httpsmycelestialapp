import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'zh-Hant', label: '繁' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
  { code: 'ja', label: '日' },
  { code: 'ko', label: '한' },
  { code: 'ar', label: 'عر' },
  { code: 'hi', label: 'हि' },
  { code: 'th', label: 'ไทย' },
  { code: 'de', label: 'DE' },
  { code: 'ru', label: 'РУ' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Set dir=rtl for Arabic
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const current = languages.find(l => i18n.language.startsWith(l.code))?.label || 'EN';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all"
        style={{
          background: 'hsla(var(--card) / 0.5)',
          border: '1px solid hsla(var(--gold) / 0.2)',
          color: 'hsl(var(--gold))',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Globe size={14} />
        {current}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50 max-h-64 overflow-y-auto scrollbar-hide"
          style={{
            background: 'hsla(var(--card) / 0.9)',
            border: '1px solid hsla(var(--gold) / 0.2)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => { i18n.changeLanguage(code); setOpen(false); }}
              className={`block w-full px-4 py-2 text-xs text-left transition-colors ${
                i18n.language === code ? 'text-gold-glow' : 'text-foreground hover:text-primary'
              }`}
              style={i18n.language === code ? { color: 'hsl(var(--gold))' } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
