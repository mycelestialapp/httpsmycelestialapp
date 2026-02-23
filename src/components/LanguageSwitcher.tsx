import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState } from 'react';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'zh-Hant', label: '繁' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
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
        {languages.find(l => l.code === i18n.language)?.label || 'EN'}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50"
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
