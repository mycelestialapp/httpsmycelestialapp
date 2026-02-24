import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { searchCities, type CityEntry } from '@/lib/cities';

interface CitySearchProps {
  value: string;
  onChange: (city: CityEntry | null) => void;
}

const CitySearch = ({ value, onChange }: CitySearchProps) => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<CityEntry[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isZh = i18n.language.startsWith('zh');

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    setOpen(true);
    setResults(searchCities(val, 8));
    if (!val) onChange(null);
  };

  const handleSelect = (city: CityEntry) => {
    const display = isZh && city.nameZh ? `${city.nameZh} (${city.name})` : city.name;
    setQuery(display);
    setOpen(false);
    onChange(city);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          className="glass-input pl-8"
          placeholder={t('divination.regionPlaceholder')}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (query) setResults(searchCities(query, 8)); setOpen(true); }}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden max-h-48 overflow-y-auto"
          style={{
            background: 'hsla(var(--card) / 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid hsla(var(--gold) / 0.15)',
            boxShadow: '0 8px 32px hsla(0 0% 0% / 0.4)',
          }}>
          {results.map((city) => (
            <button
              key={`${city.name}-${city.country}`}
              onClick={() => handleSelect(city)}
              className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors"
              style={{ color: 'hsl(var(--foreground))' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(var(--gold) / 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span className="text-xs text-muted-foreground w-6">{city.country}</span>
              <span className="flex-1 truncate">
                {isZh && city.nameZh ? `${city.nameZh} · ${city.name}` : city.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {city.lat.toFixed(1)}°, {city.lng.toFixed(1)}°
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearch;
