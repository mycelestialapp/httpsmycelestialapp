import { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Download, Share2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const mbtiArchetypes: Record<string, { title: string; vibe: string }> = {
  INTJ: { title: 'The Architect', vibe: 'A visionary strategist channeling cosmic precision into every blueprint of reality.' },
  INTP: { title: 'The Thinker', vibe: 'A boundless mind exploring the infinite corridors of universal knowledge.' },
  ENTJ: { title: 'The Commander', vibe: 'A born leader whose willpower bends the arc of destiny itself.' },
  ENTP: { title: 'The Debater', vibe: 'A spark of intellectual lightning, igniting new paradigms wherever they land.' },
  INFJ: { title: 'The Advocate', vibe: 'A rare soul whose empathy resonates across dimensions of human experience.' },
  INFP: { title: 'The Mediator', vibe: 'A dreamer weaving tapestries of meaning from the threads of starlight.' },
  ENFJ: { title: 'The Protagonist', vibe: 'A radiant beacon guiding kindred spirits toward collective awakening.' },
  ENFP: { title: 'The Campaigner', vibe: 'A free spirit whose enthusiasm turns every moment into cosmic celebration.' },
  ISTJ: { title: 'The Logistician', vibe: 'A pillar of unwavering integrity, grounding chaos into sacred order.' },
  ISFJ: { title: 'The Defender', vibe: 'A gentle guardian whose quiet devotion sustains the fabric of connection.' },
  ESTJ: { title: 'The Executive', vibe: 'A force of structured brilliance orchestrating harmony from complexity.' },
  ESFJ: { title: 'The Consul', vibe: 'A warm-hearted catalyst creating sanctuary wherever community gathers.' },
  ISTP: { title: 'The Virtuoso', vibe: 'A masterful artisan decoding the mechanics of the universe through touch.' },
  ISFP: { title: 'The Adventurer', vibe: 'A sensitive explorer painting life with bold strokes of authentic beauty.' },
  ESTP: { title: 'The Entrepreneur', vibe: 'A dynamic risk-taker riding the electric pulse of the present moment.' },
  ESFP: { title: 'The Entertainer', vibe: 'A luminous performer transforming the ordinary into pure enchantment.' },
};

const vibrationFrequencies: Record<string, string> = {
  wood: 'Vibrating at 528 Hz — the frequency of growth, renewal, and infinite potential.',
  fire: 'Vibrating at 741 Hz — the frequency of passion, transformation, and creative ignition.',
  earth: 'Vibrating at 396 Hz — the frequency of stability, nurture, and grounded wisdom.',
  metal: 'Vibrating at 852 Hz — the frequency of clarity, precision, and transcendent insight.',
  water: 'Vibrating at 432 Hz — the frequency of flow, intuition, and deep cosmic memory.',
};

// Social platforms with share URL templates
const socialPlatforms = [
  { name: 'Twitter', icon: '𝕏', color: '0, 0%, 100%', getUrl: (text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
  { name: 'Facebook', icon: 'f', color: '221, 44%, 41%', getUrl: (text: string) => `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}` },
  { name: 'WhatsApp', icon: 'W', color: '142, 70%, 49%', getUrl: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}` },
  { name: 'Telegram', icon: 'T', color: '200, 80%, 50%', getUrl: (text: string) => `https://t.me/share/url?text=${encodeURIComponent(text)}` },
  { name: 'Weibo', icon: '微', color: '2, 80%, 56%', getUrl: (text: string) => `https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}` },
];

const SoulCardModal = ({ open, onClose, profile }: SoulCardModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const dom = profile.dominant_element || 'earth';
  const domColor = elementColors[dom] || elementColors.earth;
  const archetype = profile.mbti ? mbtiArchetypes[profile.mbti.toUpperCase()] : null;

  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

  const getShareText = useCallback(() => {
    const mbtiLine = archetype ? `${profile.mbti} — ${archetype.title}` : (profile.mbti || '???');
    return `✦ My Celestial Soul Card ✦\n${profile.display_name || 'Soul'} | ${mbtiLine}\nDominant Element: ${dom}\n${vibrationFrequencies[dom] || ''}\nSoul ID: ${profile.soul_id}\n\nDiscover yours at Celestial ✨`;
  }, [profile, dom, archetype]);

  const generateCardImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 3, useCORS: true });
      return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
    } catch {
      return null;
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 3, useCORS: true });
      const link = document.createElement('a');
      link.download = `soul-card-${profile.soul_id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: '✦ Card saved!', description: 'Your Soul Card has been downloaded.' });
    } catch {
      toast({ title: '⚠ Download failed', description: 'Please try again or use the share buttons.' });
    }
  }, [profile, toast]);

  // Native share with image (mobile) — falls back to text share
  const handleNativeShare = useCallback(async () => {
    const text = getShareText();
    const blob = await generateCardImage();

    if (blob && navigator.canShare) {
      const file = new File([blob], `soul-card-${profile.soul_id}.png`, { type: 'image/png' });
      const shareData = { title: 'My Celestial Soul Card', text, files: [file] };
      try {
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch { /* cancelled or failed */ }
    }

    // Fallback: text-only native share
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Soul Card', text });
        return;
      }
    } catch { /* cancelled */ }

    // Final fallback: show social buttons
    setShareMenuOpen(true);
  }, [getShareText, generateCardImage, profile]);

  const handleSocialShare = (getUrl: (text: string) => string) => {
    const text = getShareText();
    window.open(getUrl(text), '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-sm"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            <button onClick={onClose} className="absolute -top-10 right-0 text-muted-foreground hover:text-foreground transition-colors z-10">
              <X size={20} />
            </button>

            {/* The Card */}
            <div
              ref={cardRef}
              className="rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(160deg, hsl(232 45% 14%), hsl(232 55% 6%))`,
                border: `1px solid hsla(${domColor} / 0.35)`,
                boxShadow: `0 0 80px hsla(${domColor} / 0.2), 0 0 30px hsla(${domColor} / 0.1), inset 0 1px 0 hsla(${domColor} / 0.15)`,
              }}
            >
              <div className="h-1.5" style={{
                background: `linear-gradient(90deg, hsl(${domColor}), hsla(var(--gold) / 0.6), hsl(${domColor}))`,
              }} />

              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-semibold flex items-center gap-1.5" style={{ color: 'hsla(var(--gold) / 0.6)' }}>
                    <Sparkles size={10} /> Celestial Soul Card
                  </span>
                  <span className="text-[9px] tracking-wider text-muted-foreground font-mono">#{profile.soul_id}</span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold"
                    style={{
                      width: 72, height: 72,
                      background: `radial-gradient(circle at 35% 35%, hsla(${domColor} / 0.5), hsla(${domColor} / 0.1))`,
                      border: `2px solid hsla(${domColor} / 0.5)`,
                      color: `hsl(${domColor})`,
                      fontFamily: 'var(--font-serif)',
                      boxShadow: `0 0 40px hsla(${domColor} / 0.3), inset 0 0 20px hsla(${domColor} / 0.1)`,
                    }}
                  >
                    {(profile.display_name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-foreground truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                      {profile.display_name || 'Soul'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {profile.mbti && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                          background: 'hsla(var(--accent) / 0.15)', border: '1px solid hsla(var(--accent) / 0.3)', color: 'hsl(var(--accent))',
                        }}>
                          {profile.mbti}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                        background: `hsla(${domColor} / 0.12)`, border: `1px solid hsla(${domColor} / 0.25)`, color: `hsl(${domColor})`,
                      }}>
                        {elementEmoji[dom]} {dom.charAt(0).toUpperCase() + dom.slice(1)}
                      </span>
                    </div>
                    {archetype && (
                      <p className="text-[11px] mt-1.5 font-medium" style={{ color: 'hsl(var(--gold))', fontFamily: 'var(--font-serif)' }}>
                        {archetype.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl p-3 mb-4" style={{
                  background: `linear-gradient(135deg, hsla(${domColor} / 0.08), hsla(var(--gold) / 0.04))`,
                  border: `1px solid hsla(${domColor} / 0.12)`,
                }}>
                  <p className="text-[11px] italic leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
                    "{archetype?.vibe || profile.bio || `A ${dom}-aligned soul, dancing between starlight and shadow, forever seeking cosmic harmony.`}"
                  </p>
                  <p className="text-[9px] mt-2 tracking-wide" style={{ color: `hsla(${domColor} / 0.7)` }}>
                    ∿ {vibrationFrequencies[dom]}
                  </p>
                </div>

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
                          style={{ background: `linear-gradient(90deg, hsl(${elementColors[el]}), hsla(${elementColors[el]} / 0.6))` }}
                        />
                      </div>
                      <span className="text-[10px] w-7 text-right text-muted-foreground font-mono">{profile[el]}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid hsla(var(--gold) / 0.1)' }}>
                  <span className="text-[9px] text-muted-foreground tracking-wider">✦ celestial.app</span>
                  <span className="text-[9px] text-muted-foreground">✦ {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.97] hover:scale-[1.02]"
                style={{ background: 'hsla(var(--gold) / 0.12)', border: '1px solid hsla(var(--gold) / 0.25)', color: 'hsl(var(--gold))' }}
              >
                <Download size={16} /> {t('tribe.downloadCard')}
              </button>
              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.97] hover:scale-[1.02]"
                style={{ background: 'hsla(var(--accent) / 0.12)', border: '1px solid hsla(var(--accent) / 0.25)', color: 'hsl(var(--accent))' }}
              >
                <Share2 size={16} /> {t('tribe.shareCard')}
              </button>
            </div>

            {/* Social Platform Quick Buttons — always visible */}
            <div className="mt-3">
              <p className="text-[10px] text-center text-muted-foreground mb-2 tracking-wider uppercase">
                {t('tribe.shareVia')}
              </p>
              <div className="flex items-center justify-center gap-3">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleSocialShare(platform.getUrl)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:scale-110 active:scale-95"
                    style={{
                      background: `hsla(${platform.color} / 0.12)`,
                      border: `1px solid hsla(${platform.color} / 0.25)`,
                      color: `hsl(${platform.color})`,
                    }}
                    title={platform.name}
                  >
                    {platform.icon}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoulCardModal;
