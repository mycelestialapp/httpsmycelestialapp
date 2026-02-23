import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark, Compass, Volume2, VolumeX } from 'lucide-react';
import LotusLamp from '@/components/LotusLamp';
import GoldParticles from '@/components/GoldParticles';
import Disclaimer from '@/components/Disclaimer';

const AltarPage = () => {
  const { t } = useTranslation();
  const [offering, setOffering] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);

  const handleOffering = () => {
    setOffering(true);
    setTimeout(() => setOffering(false), 4000);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {t('altar.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('altar.subtitle')}</p>
      </div>

      {/* Ambient sound toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setAmbientOn(!ambientOn)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
          style={{
            background: ambientOn ? 'hsla(var(--gold) / 0.12)' : 'hsla(var(--muted) / 0.3)',
            color: ambientOn ? 'hsl(var(--gold))' : 'hsl(var(--muted-foreground))',
            border: `1px solid ${ambientOn ? 'hsla(var(--gold) / 0.3)' : 'hsla(var(--border))'}`,
          }}
        >
          {ambientOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {t('altar.ambientSound')}
        </button>
      </div>

      {/* Lotus Lamp Offering */}
      <section>
        <h3 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'hsla(var(--gold) / 0.6)', fontFamily: 'var(--font-sans)' }}>
          {t('altar.lightOffering')}
        </h3>
        <LotusLamp />
      </section>

      {/* Ancestral Memorial */}
      <section>
        <h3 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'hsla(var(--gold) / 0.6)', fontFamily: 'var(--font-sans)' }}>
          {t('altar.ancestralSpace')}
        </h3>
        <div className="glass-card relative overflow-hidden">
          <GoldParticles active={offering} />
          <div className="flex items-center gap-4 p-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'hsla(var(--gold) / 0.1)' }}>
              <Landmark size={20} style={{ color: 'hsl(var(--gold))' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>{t('altar.memorial')}</div>
              <div className="text-xs text-muted-foreground">{t('altar.memorialDesc')}</div>
            </div>
          </div>
          <button
            onClick={handleOffering}
            disabled={offering}
            className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
            style={{
              background: offering ? 'hsla(var(--gold) / 0.2)' : 'hsla(var(--gold) / 0.1)',
              border: '1px solid hsla(var(--gold) / 0.25)',
              color: 'hsl(var(--gold))',
            }}
          >
            {offering ? t('altar.offeringActive') : t('altar.makeOffering')}
          </button>
        </div>
      </section>

      {/* Feng Shui */}
      <section>
        <div className="glass-card flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsla(var(--gold) / 0.1)' }}>
            <Compass size={18} style={{ color: 'hsl(var(--gold))' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>{t('altar.fengshui')}</div>
            <div className="text-xs text-muted-foreground">{t('common.comingSoon')}</div>
          </div>
        </div>
      </section>

      <Disclaimer />
    </div>
  );
};

export default AltarPage;
