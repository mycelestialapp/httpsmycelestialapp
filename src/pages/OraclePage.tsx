import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, Star, Layers, BookOpen } from 'lucide-react';
import EnergyRadar from '@/components/EnergyRadar';
import BirthInputModal from '@/components/BirthInputModal';
import DailyWisdom from '@/components/DailyWisdom';
import DailyCheckin from '@/components/DailyCheckin';

import { useNavigate } from 'react-router-dom';
import { calculateElementEnergy, generateInsight } from '@/lib/fiveElements';
import type { ElementEnergy, CelestialProfile } from '@/lib/fiveElements';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const tools = [
  { key: 'bazi', icon: Compass, path: '/oracle/bazi' },
  { key: 'astrology', icon: Star, path: '/oracle/astrology' },
  { key: 'tarot', icon: Layers, path: '/oracle/tarot' },
  { key: 'iching', icon: BookOpen, path: '/oracle/iching' },
] as const;

const OraclePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [energy, setEnergy] = useState<ElementEnergy | null>(null);
  const [insight, setInsight] = useState('');

  const handleBirthSubmit = async (year: number, month: number, day: number) => {
    const profile: CelestialProfile = calculateElementEnergy(year, month, day);
    setEnergy(profile.energy);
    setInsight(generateInsight(profile, i18n.language));

    // Save to profile if logged in
    if (user) {
      await supabase.from('profiles').update({
        birthday: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        wood: profile.energy.wood,
        fire: profile.energy.fire,
        earth: profile.energy.earth,
        metal: profile.energy.metal,
        water: profile.energy.water,
        dominant_element: profile.dominantElement,
      }).eq('id', user.id);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {t('oracle.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('oracle.subtitle')}</p>
      </div>

      {/* Energy Radar */}
      <EnergyRadar
        energy={energy}
        insight={insight}
        onRequestReading={() => setModalOpen(true)}
      />

      {/* Daily Check-in */}
      <DailyCheckin />

      {/* Today's Wisdom */}
      <DailyWisdom />

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

      

      {/* Modal */}
      <BirthInputModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleBirthSubmit}
      />
    </div>
  );
};

export default OraclePage;
