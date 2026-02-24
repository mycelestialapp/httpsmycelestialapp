import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Moon } from 'lucide-react';

const PET_KEY = 'celestial_pet';

interface PetState {
  name: string;
  level: number;
  xp: number;
  mood: 'happy' | 'calm' | 'sleepy';
  lastFed: number;
  element: string;
}

const defaultPet: PetState = {
  name: '灵狐 Spirit Fox',
  level: 1,
  xp: 0,
  mood: 'calm',
  lastFed: 0,
  element: 'fire',
};

const getPet = (): PetState => {
  try { return { ...defaultPet, ...JSON.parse(localStorage.getItem(PET_KEY) || '{}') }; } catch { return defaultPet; }
};

const savePet = (p: PetState) => localStorage.setItem(PET_KEY, JSON.stringify(p));

const petEmojis: Record<string, string> = { happy: '🦊', calm: '🦊', sleepy: '😴' };
const moodColors: Record<string, string> = { happy: '#fbbf24', calm: '#60a5fa', sleepy: '#a78bfa' };

const SpiritualPet = () => {
  const { t } = useTranslation();
  const [pet, setPet] = useState<PetState>(getPet);
  const [sparkle, setSparkle] = useState(false);

  const xpToNext = pet.level * 50;

  useEffect(() => {
    // Check mood based on time since last interaction
    const hoursSince = (Date.now() - pet.lastFed) / (1000 * 60 * 60);
    if (hoursSince > 12) {
      setPet(p => { const u = { ...p, mood: 'sleepy' as const }; savePet(u); return u; });
    }
  }, []);

  const feedPet = () => {
    setSparkle(true);
    setTimeout(() => setSparkle(false), 1500);

    setPet(prev => {
      let newXp = prev.xp + 15;
      let newLevel = prev.level;
      if (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel++;
      }
      const updated: PetState = { ...prev, xp: newXp, level: newLevel, mood: 'happy', lastFed: Date.now() };
      savePet(updated);
      return updated;
    });
  };

  const meditatePet = () => {
    setSparkle(true);
    setTimeout(() => setSparkle(false), 2000);

    setPet(prev => {
      let newXp = prev.xp + 25;
      let newLevel = prev.level;
      if (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel++;
      }
      const updated: PetState = { ...prev, xp: newXp, level: newLevel, mood: 'calm', lastFed: Date.now() };
      savePet(updated);
      return updated;
    });
  };

  return (
    <div className="glass-card-highlight relative overflow-hidden">
      {/* Sparkle particles */}
      {sparkle && Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ background: moodColors[pet.mood], left: '50%', top: '40%' }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 120,
            y: (Math.random() - 0.5) * 80,
            opacity: 0, scale: 0,
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      ))}

      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} style={{ color: 'hsl(var(--gold))' }} />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.6)' }}>
          {t('altar.spiritCompanion', { defaultValue: 'Spirit Companion' })}
        </span>
      </div>

      {/* Pet display */}
      <div className="flex items-center gap-4">
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl relative"
          style={{ background: `${moodColors[pet.mood]}15`, border: `2px solid ${moodColors[pet.mood]}40` }}
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          {petEmojis[pet.mood]}
          {sparkle && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 20px ${moodColors[pet.mood]}60` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5 }}
            />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            {pet.name}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Lv.{pet.level} · {pet.mood === 'happy' ? '✨ Happy' : pet.mood === 'calm' ? '🧘 Calm' : '💤 Sleepy'}
          </div>
          {/* XP bar */}
          <div className="mt-1.5 w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'hsla(var(--muted) / 0.3)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${moodColors[pet.mood]}, ${moodColors[pet.mood]}80)` }}
              initial={{ width: 0 }}
              animate={{ width: `${(pet.xp / xpToNext) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">{pet.xp}/{xpToNext} XP</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={feedPet}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.97]"
          style={{
            background: 'hsla(var(--gold) / 0.08)',
            border: '1px solid hsla(var(--gold) / 0.2)',
            color: 'hsl(var(--gold))',
          }}
        >
          <Heart size={12} /> {t('altar.feedPet', { defaultValue: 'Feed' })}
        </button>
        <button
          onClick={meditatePet}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.97]"
          style={{
            background: 'hsla(var(--accent) / 0.08)',
            border: '1px solid hsla(var(--accent) / 0.2)',
            color: 'hsl(var(--accent))',
          }}
        >
          <Moon size={12} /> {t('altar.meditatePet', { defaultValue: 'Meditate' })}
        </button>
      </div>
    </div>
  );
};

export default SpiritualPet;
