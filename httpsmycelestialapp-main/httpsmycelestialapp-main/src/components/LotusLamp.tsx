import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const INTENTIONS = [
  { key: 'peace', emoji: '🕊️' },
  { key: 'success', emoji: '🌟' },
  { key: 'health', emoji: '💚' },
  { key: 'love', emoji: '💛' },
] as const;

const LotusLamp = () => {
  const { t } = useTranslation();
  const [lit, setLit] = useState(false);
  const [selected, setSelected] = useState<(typeof INTENTIONS)[number] | null>(null);

  const lightLamp = (intention: (typeof INTENTIONS)[number]) => {
    setSelected(intention);
    setLit(true);
  };

  const reset = () => {
    setLit(false);
    setSelected(null);
  };

  return (
    <div className="glass-card-highlight flex flex-col items-center gap-4 py-8 relative overflow-hidden">
      {/* Ambient glow background */}
      <AnimatePresence>
        {lit && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              background: 'radial-gradient(ellipse at 50% 60%, hsla(var(--gold) / 0.15), transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Lotus / Flame */}
      <div className="relative w-32 h-40 flex items-end justify-center">
        {/* Base lotus petals */}
        <div className="absolute bottom-0 text-5xl" style={{ filter: 'drop-shadow(0 0 12px hsla(var(--gold) / 0.4))' }}>
          🪷
        </div>

        {/* Flame */}
        <AnimatePresence>
          {lit && (
            <motion.div
              className="absolute bottom-16 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.3, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.3, y: 20 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {/* Flame glow */}
              <motion.div
                className="text-4xl"
                animate={{ scale: [1, 1.1, 1], y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: 'drop-shadow(0 0 20px hsla(var(--gold) / 0.6))' }}
              >
                🕯️
              </motion.div>

              {/* Intention label */}
              <motion.div
                className="mt-2 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                style={{
                  background: 'hsla(var(--gold) / 0.12)',
                  color: 'hsl(var(--gold))',
                  border: '1px solid hsla(var(--gold) / 0.25)',
                }}
              >
                {selected?.emoji} {t(`altar.intention.${selected?.key}`)}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rising particles when lit */}
        <AnimatePresence>
          {lit && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 3 + Math.random() * 3,
                    height: 3 + Math.random() * 3,
                    background: 'hsl(var(--gold))',
                    left: `${40 + Math.random() * 20}%`,
                    bottom: '50%',
                  }}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    y: -80 - Math.random() * 60,
                    x: (Math.random() - 0.5) * 40,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Intention picker or reset */}
      {!lit ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground">{t('altar.chooseIntention')}</p>
          <div className="flex gap-2">
            {INTENTIONS.map((intention) => (
              <button
                key={intention.key}
                onClick={() => lightLamp(intention)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'hsla(var(--gold) / 0.08)',
                  border: '1px solid hsla(var(--gold) / 0.2)',
                  color: 'hsl(var(--gold))',
                }}
              >
                {intention.emoji} {t(`altar.intention.${intention.key}`)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <motion.button
          onClick={reset}
          className="text-xs text-muted-foreground underline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {t('altar.lightAnother')}
        </motion.button>
      )}
    </div>
  );
};

export default LotusLamp;
