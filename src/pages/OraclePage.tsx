import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, Star, Layers, BookOpen, Orbit, Shield, Wind, Flower2, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EnergyRadar from '@/components/EnergyRadar';
import BirthInputModal from '@/components/BirthInputModal';
import DailyWisdom from '@/components/DailyWisdom';
import DailyCheckin from '@/components/DailyCheckin';
import CreateCardCTA from '@/components/CreateCardCTA';

import { useNavigate } from 'react-router-dom';
import { calculateElementEnergy, generateInsight } from '@/lib/fiveElements';
import type { ElementEnergy, CelestialProfile } from '@/lib/fiveElements';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const tools = [
  { key: 'bazi', icon: Compass },
  { key: 'ziwei', icon: Star },
  { key: 'qimen', icon: Shield },
  { key: 'liuren', icon: Orbit },
  { key: 'xiaoliuren', icon: Wind },
  { key: 'xuankong', icon: Hexagon },
  { key: 'tarot', icon: Layers },
  { key: 'astrology', icon: Flower2 },
  { key: 'meihua', icon: BookOpen },
] as const;

const AWAKENED_KEY = 'celestial_awakened_tools';
const getAwakened = (): string[] => {
  try { return JSON.parse(localStorage.getItem(AWAKENED_KEY) || '[]'); } catch { return []; }
};

const OraclePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [energy, setEnergy] = useState<ElementEnergy | null>(null);
  const [insight, setInsight] = useState('');
  const [compareSoul, setCompareSoul] = useState<string | null>(null);
  const [awakened] = useState<string[]>(getAwakened);
  const [tappedTool, setTappedTool] = useState<string | null>(null);

  useEffect(() => {
    const soul = localStorage.getItem('celestial_compare_soul');
    if (soul) {
      setCompareSoul(soul);
      localStorage.removeItem('celestial_compare_soul');
    }
  }, []);

  const handleBirthSubmit = async (year: number, month: number, day: number) => {
    const profile: CelestialProfile = calculateElementEnergy(year, month, day);
    setEnergy(profile.energy);
    setInsight(generateInsight(profile, i18n.language, t));

    if (user) {
      await supabase.from('profiles').update({
        birthday: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        wood: profile.energy.wood, fire: profile.energy.fire, earth: profile.energy.earth,
        metal: profile.energy.metal, water: profile.energy.water,
        dominant_element: profile.dominantElement,
      }).eq('id', user.id);
    }
  };

  const handleToolTap = (key: string) => {
    setTappedTool(key);
    setTimeout(() => {
      navigate(`/oracle/reading?tool=${key}`);
    }, 700);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition">
      {/* Challenge Banner */}
      {compareSoul && (
        <div
          className="rounded-2xl p-3 flex items-center gap-3 animate-in slide-in-from-top-4 duration-500"
          style={{
            background: 'linear-gradient(135deg, hsla(var(--gold) / 0.12), hsla(var(--accent) / 0.08))',
            border: '1px solid hsla(var(--gold) / 0.25)',
          }}
        >
          <span className="text-lg">⚔️</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: 'hsl(var(--gold))' }}>
              ⚡ Comparing your soul with Soul #{compareSoul.slice(0, 8)}...
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              Begin your reading to see who vibrates higher!
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="text-[10px] px-3 py-1.5 rounded-full font-semibold whitespace-nowrap"
            style={{
              background: 'hsla(var(--gold) / 0.2)',
              border: '1px solid hsla(var(--gold) / 0.3)',
              color: 'hsl(var(--gold))',
            }}
          >
            {t('oracle.startReading')}
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {t('oracle.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('oracle.subtitle')}</p>
      </div>

      {/* Energy Radar */}
      <EnergyRadar energy={energy} insight={insight} onRequestReading={() => setModalOpen(true)} />

      {/* Daily Check-in */}
      <DailyCheckin />

      {/* CTA for new users */}
      <CreateCardCTA />

      {/* Today's Wisdom */}
      <DailyWisdom />

      {/* Tools grid with enhanced animations */}
      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'hsla(var(--gold) / 0.6)', fontFamily: 'var(--font-sans)' }}>
          {t('oracle.tools')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {tools.map(({ key, icon: Icon }, index) => {
            const isAwakened = awakened.includes(key);
            const isTapped = tappedTool === key;

            return (
              <motion.button
                key={key}
                onClick={() => handleToolTap(key)}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isTapped ? 0 : 1,
                  y: 0,
                  scale: isTapped ? 0.3 : 1,
                }}
                transition={{
                  delay: index * 0.05,
                  duration: isTapped ? 0.5 : 0.4,
                  ease: isTapped ? 'easeIn' : 'easeOut',
                }}
                className="glass-card text-center p-3 relative overflow-hidden"
                style={{
                  border: isAwakened ? '1px solid hsla(var(--gold) / 0.6)' : undefined,
                  boxShadow: isAwakened
                    ? '0 0 16px hsla(var(--gold) / 0.25), inset 0 0 10px hsla(var(--gold) / 0.08)'
                    : undefined,
                }}
              >
                {/* Breathing border glow - flowing linear light */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, hsla(var(--gold) / 0.15), transparent, hsla(var(--gold) / 0.1), transparent)',
                    maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: 1,
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 4 + index * 0.3, ease: 'linear' }}
                />

                {/* Breathing inner glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{
                    boxShadow: [
                      'inset 0 0 6px hsla(var(--gold) / 0.02)',
                      'inset 0 0 18px hsla(var(--gold) / 0.1)',
                      'inset 0 0 6px hsla(var(--gold) / 0.02)',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                />

                {/* Awakened badge */}
                {isAwakened && (
                  <div className="absolute top-1.5 right-1.5">
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'hsl(var(--gold))', boxShadow: '0 0 6px hsl(var(--gold))' }}
                      animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </div>
                )}

                <Icon size={18} className="mb-1.5 mx-auto relative z-10" style={{ color: 'hsl(var(--gold))', filter: 'drop-shadow(0 0 6px hsla(var(--gold) / 0.4))' }} />
                <div className="text-xs font-semibold text-foreground relative z-10" style={{ fontFamily: 'var(--font-serif)' }}>
                  {t(`oracle.${key}`)}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight relative z-10">
                  {t(`oracle.${key}Desc`)}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Collapse particle overlay when a tool is tapped */}
      <AnimatePresence>
        {tappedTool && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Golden particle burst */}
            {Array.from({ length: 32 }).map((_, i) => {
              const angle = (Math.PI * 2 * i) / 32;
              const dist = 100 + Math.random() * 120;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 2 + Math.random() * 3,
                    height: 2 + Math.random() * 3,
                    background: 'hsl(var(--gold))',
                    boxShadow: '0 0 8px hsl(var(--gold)), 0 0 16px hsla(var(--gold) / 0.5)',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 0.1,
                  }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              );
            })}
            {/* Central flash */}
            <motion.div
              className="w-32 h-32 rounded-full"
              style={{ background: 'radial-gradient(circle, hsla(var(--gold) / 0.5), transparent)' }}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <BirthInputModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleBirthSubmit} />
    </div>
  );
};

export default OraclePage;
