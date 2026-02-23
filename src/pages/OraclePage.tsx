import { useTranslation } from 'react-i18next';
import { Compass, Star, Layers, BookOpen } from 'lucide-react';
import EnergyRadar from '@/components/EnergyRadar';
import Disclaimer from '@/components/Disclaimer';
import { useNavigate } from 'react-router-dom';

const tools = [
  { key: 'bazi', icon: Compass, path: '/oracle/bazi' },
  { key: 'astrology', icon: Star, path: '/oracle/astrology' },
  { key: 'tarot', icon: Layers, path: '/oracle/tarot' },
  { key: 'iching', icon: BookOpen, path: '/oracle/iching' },
] as const;

const OraclePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 animate-fade-in">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {t('oracle.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('oracle.subtitle')}</p>
      </div>

      {/* Energy Radar */}
      <EnergyRadar />

      {/* Tools grid */}
      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'hsla(var(--gold) / 0.6)', fontFamily: 'var(--font-sans)' }}>
          {t('oracle.tools')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {tools.map(({ key, icon: Icon, path }) => (
            <button
              key={key}
              onClick={() => navigate(path)}
              className="glass-card text-left p-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Icon size={20} className="mb-2" style={{ color: 'hsl(var(--gold))' }} />
              <div className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
                {t(`oracle.${key}`)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t(`oracle.${key}Desc`)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
};

export default OraclePage;
