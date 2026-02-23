import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Download, Share2 } from 'lucide-react';

interface SoulCardModalProps {
  open: boolean;
  onClose: () => void;
  profile: {
    display_name: string | null;
    soul_id: string;
    mbti: string | null;
    dominant_element: string | null;
    bio: string | null;
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}

const elementColors: Record<string, string> = {
  wood: '120, 60%, 40%',
  fire: '0, 75%, 55%',
  earth: '35, 70%, 50%',
  metal: '210, 20%, 70%',
  water: '210, 80%, 55%',
};

const elementEmoji: Record<string, string> = {
  wood: '🌿', fire: '🔥', earth: '⛰️', metal: '⚔️', water: '🌊',
};

const SoulCardModal = ({ open, onClose, profile }: SoulCardModalProps) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const dom = profile.dominant_element || 'earth';
  const domColor = elementColors[dom] || elementColors.earth;

  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `soul-card-${profile.soul_id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // Fallback: copy text
      const text = `✦ Soul Card — ${profile.display_name || 'Soul'} | ${profile.mbti || '???'} | ${dom} ✦`;
      navigator.clipboard.writeText(text);
    }
  }, [profile, dom]);

  const handleShare = useCallback(async () => {
    const text = `✦ My Celestial Soul Card ✦\n${profile.display_name || 'Soul'} | ${profile.mbti || '???'}\nDominant Element: ${dom}\nSoul ID: ${profile.soul_id}\n\nDiscover yours at Celestial ✨`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Soul Card', text });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
    }
  }, [profile, dom]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-sm"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close */}
            <button onClick={onClose} className="absolute -top-10 right-0 text-muted-foreground hover:text-foreground transition-colors z-10">
              <X size={20} />
            </button>

            {/* The Card */}
            <div
              ref={cardRef}
              className="rounded-3xl overflow-hidden p-6"
              style={{
                background: `linear-gradient(160deg, hsl(232 45% 12%), hsl(232 55% 8%))`,
                border: `1px solid hsla(${domColor} / 0.3)`,
                boxShadow: `0 0 60px hsla(${domColor} / 0.15), inset 0 1px 0 hsla(${domColor} / 0.1)`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: 'hsla(var(--gold) / 0.5)' }}>
                  ✦ Celestial Soul Card
                </span>
                <span className="text-[9px] tracking-wider text-muted-foreground">#{profile.soul_id}</span>
              </div>

              {/* Avatar + Info */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: `radial-gradient(circle, hsla(${domColor} / 0.4), hsla(${domColor} / 0.08))`,
                    border: `2px solid hsla(${domColor} / 0.5)`,
                    color: `hsl(${domColor})`,
                    fontFamily: 'var(--font-serif)',
                    boxShadow: `0 0 30px hsla(${domColor} / 0.25)`,
                  }}
                >
                  {(profile.display_name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
                    {profile.display_name || 'Soul'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {profile.mbti && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                        background: 'hsla(var(--accent) / 0.15)',
                        border: '1px solid hsla(var(--accent) / 0.3)',
                        color: 'hsl(var(--accent))',
                      }}>
                        {profile.mbti}
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                      background: `hsla(${domColor} / 0.12)`,
                      border: `1px solid hsla(${domColor} / 0.25)`,
                      color: `hsl(${domColor})`,
                    }}>
                      {elementEmoji[dom]} {dom.charAt(0).toUpperCase() + dom.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs italic text-muted-foreground leading-relaxed mb-5" style={{ fontFamily: 'var(--font-serif)' }}>
                "{profile.bio || `A ${dom}-aligned soul, dancing between starlight and shadow, forever seeking cosmic harmony.`}"
              </p>

              {/* Energy Radar — Bar style */}
              <div className="space-y-2 mb-4">
                {elements.map((el) => (
                  <div key={el} className="flex items-center gap-2">
                    <span className="text-sm w-5 text-center">{elementEmoji[el]}</span>
                    <span className="text-[9px] w-10 text-muted-foreground uppercase">{t(`oracle.${el}`)}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'hsla(var(--muted) / 0.3)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${profile[el]}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                        style={{ background: `hsl(${elementColors[el]})` }}
                      />
                    </div>
                    <span className="text-[10px] w-7 text-right text-muted-foreground">{profile[el]}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid hsla(var(--gold) / 0.1)' }}>
                <span className="text-[9px] text-muted-foreground tracking-wider">celestial.app</span>
                <span className="text-[9px] text-muted-foreground">✦ {new Date().getFullYear()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
                style={{
                  background: 'hsla(var(--gold) / 0.12)',
                  border: '1px solid hsla(var(--gold) / 0.25)',
                  color: 'hsl(var(--gold))',
                }}
              >
                <Download size={16} /> {t('tribe.downloadCard')}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
                style={{
                  background: 'hsla(var(--accent) / 0.12)',
                  border: '1px solid hsla(var(--accent) / 0.25)',
                  color: 'hsl(var(--accent))',
                }}
              >
                <Share2 size={16} /> {t('tribe.shareCard')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoulCardModal;
