import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplets, Wind, TreePine } from 'lucide-react';

const rituals = [
  { key: 'purify', icon: Flame, color: '#f87171', duration: 5000, emoji: '🔥' },
  { key: 'cleanse', icon: Droplets, color: '#60a5fa', duration: 6000, emoji: '💧' },
  { key: 'breathe', icon: Wind, color: '#a78bfa', duration: 7000, emoji: '🌬️' },
  { key: 'ground', icon: TreePine, color: '#34d399', duration: 5000, emoji: '🌿' },
];

const HealingSanctuary = () => {
  const { t } = useTranslation();
  const [activeRitual, setActiveRitual] = useState<string | null>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const startRitual = (key: string, color: string, duration: number) => {
    if (activeRitual) return;
    setActiveRitual(key);

    // Spawn particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color,
    }));
    setParticles(newParticles);

    setTimeout(() => {
      setActiveRitual(null);
      setParticles([]);
    }, duration);
  };

  return (
    <div className="glass-card relative overflow-hidden">
      {/* Ritual particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{ background: p.color, left: `${p.x}%`, top: `${p.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 0], y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: 'hsl(var(--gold))' }}>🕯️</span>
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.6)' }}>
          {t('altar.healingRituals', { defaultValue: 'Healing Rituals' })}
        </span>
        <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, hsla(var(--gold) / 0.3), transparent)' }} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {rituals.map(({ key, icon: Icon, color, duration, emoji }) => {
          const isActive = activeRitual === key;
          return (
            <motion.button
              key={key}
              onClick={() => startRitual(key, color, duration)}
              disabled={!!activeRitual}
              className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all disabled:opacity-50"
              style={{
                background: isActive ? `${color}15` : 'hsla(var(--card) / 0.3)',
                border: `1px solid ${isActive ? `${color}40` : 'hsla(var(--gold) / 0.1)'}`,
              }}
              animate={isActive ? { scale: [1, 1.03, 1] } : {}}
              transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
            >
              {isActive ? (
                <motion.span
                  className="text-2xl"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {emoji}
                </motion.span>
              ) : (
                <Icon size={18} style={{ color }} />
              )}
              <span className="text-[10px] font-semibold" style={{ color: isActive ? color : 'hsl(var(--foreground))' }}>
                {t(`altar.ritual_${key}`, { defaultValue: key.charAt(0).toUpperCase() + key.slice(1) })}
              </span>
              {isActive && (
                <span className="text-[9px] text-muted-foreground italic">
                  {t('altar.ritualActive', { defaultValue: 'Channeling...' })}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default HealingSanctuary;
