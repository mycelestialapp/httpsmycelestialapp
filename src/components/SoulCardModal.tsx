import { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Download, Share2, Sparkles, Link2, Check } from 'lucide-react';
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

const socialPlatforms = [
  // Global Messaging
  { name: 'WhatsApp', emoji: '💬', bg: '142, 70%, 49%', getUrl: (t: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t)}` },
  { name: 'Telegram', emoji: '✈️', bg: '200, 80%, 50%', getUrl: (t: string) => `https://t.me/share/url?text=${encodeURIComponent(t)}` },
  { name: 'Messenger', emoji: '💭', bg: '214, 89%, 52%', getUrl: (t: string) => `https://www.facebook.com/dialog/send?link=${encodeURIComponent('https://celestial.app')}&app_id=0&redirect_uri=${encodeURIComponent('https://celestial.app')}&quote=${encodeURIComponent(t)}` },
  // Social Media
  { name: 'Twitter / X', emoji: '🐦', bg: '204, 88%, 53%', getUrl: (t: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}` },
  { name: 'Facebook', emoji: '👤', bg: '221, 44%, 41%', getUrl: (t: string) => `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(t)}` },
  { name: 'Instagram', emoji: '📷', bg: '330, 70%, 50%', getUrl: (_t: string) => `https://www.instagram.com/` },
  { name: 'Threads', emoji: '🧵', bg: '0, 0%, 90%', getUrl: (t: string) => `https://www.threads.net/intent/post?text=${encodeURIComponent(t)}` },
  { name: 'Reddit', emoji: '🤖', bg: '16, 100%, 50%', getUrl: (t: string) => `https://www.reddit.com/submit?title=${encodeURIComponent(t)}` },
  // Asia
  { name: '微信', emoji: '🟢', bg: '120, 50%, 45%', getUrl: (_t: string) => `weixin://` },
  { name: '微博', emoji: '🔴', bg: '2, 80%, 56%', getUrl: (t: string) => `https://service.weibo.com/share/share.php?title=${encodeURIComponent(t)}` },
  { name: '小红书', emoji: '📕', bg: '0, 75%, 50%', getUrl: (_t: string) => `https://www.xiaohongshu.com/` },
  { name: 'LINE', emoji: '🟩', bg: '145, 65%, 45%', getUrl: (t: string) => `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(t)}` },
  { name: 'KakaoTalk', emoji: '💛', bg: '47, 85%, 55%', getUrl: (t: string) => `https://story.kakao.com/share?url=${encodeURIComponent('https://celestial.app')}&text=${encodeURIComponent(t)}` },
  // Professional & Other
  { name: 'LinkedIn', emoji: '💼', bg: '210, 60%, 40%', getUrl: (t: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://celestial.app')}&summary=${encodeURIComponent(t)}` },
  { name: 'Pinterest', emoji: '📌', bg: '0, 80%, 45%', getUrl: (t: string) => `https://pinterest.com/pin/create/button/?description=${encodeURIComponent(t)}` },
  { name: 'Email', emoji: '📧', bg: '0, 0%, 60%', getUrl: (t: string) => `mailto:?subject=${encodeURIComponent('My Celestial Soul Card ✦')}&body=${encodeURIComponent(t)}` },
];

const SoulCardModal = ({ open, onClose, profile }: SoulCardModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const dom = profile.dominant_element || 'earth';
  const domColor = elementColors[dom] || elementColors.earth;
  const archetype = profile.mbti ? mbtiArchetypes[profile.mbti.toUpperCase()] : null;

  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

  const getShareText = useCallback(() => {
    const mbtiLine = archetype ? `${profile.mbti} — ${archetype.title}` : (profile.mbti || '???');
    return `✦ My Celestial Soul Card ✦\n${profile.display_name || 'Soul'} | ${mbtiLine}\nDominant Element: ${dom}\n${vibrationFrequencies[dom] || ''}\nSoul ID: ${profile.soul_id}\n\nDiscover yours at Celestial ✨`;
  }, [profile, dom, archetype]);

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
      toast({ title: '⚠ Download failed', description: 'Please try again.' });
    }
  }, [profile, toast]);

  const handleCopyLink = useCallback(async () => {
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getShareText]);

  const handleSocialShare = (getUrl: (text: string) => string) => {
    window.open(getUrl(getShareText()), '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  // Try native share with image first (mobile)
  const handleNativeShare = useCallback(async () => {
    const text = getShareText();
    // Try image share
    if (cardRef.current) {
      try {
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 3, useCORS: true });
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
        if (blob && navigator.canShare) {
          const file = new File([blob], `soul-card.png`, { type: 'image/png' });
          const data = { title: 'My Celestial Soul Card', text, files: [file] };
          if (navigator.canShare(data)) { await navigator.share(data); return; }
        }
      } catch { /* fall through */ }
    }
    // Fallback text share
    try {
      if (navigator.share) { await navigator.share({ title: 'My Soul Card', text }); return; }
    } catch { /* fall through */ }
    // Final fallback — open share sheet
    setShowShareSheet(true);
  }, [getShareText]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { onClose(); setShowShareSheet(false); }} />

          {/* Main content — scrollable */}
          <motion.div
            className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto px-4 py-6 scrollbar-hide"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            <button onClick={() => { onClose(); setShowShareSheet(false); }} className="absolute top-0 right-4 text-muted-foreground hover:text-foreground transition-colors z-10">
              <X size={20} />
            </button>

            {/* ========== THE CARD ========== */}
            <div
              ref={cardRef}
              className="rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(160deg, hsl(232 45% 14%), hsl(232 55% 6%))`,
                border: `1px solid hsla(${domColor} / 0.35)`,
                boxShadow: `0 0 80px hsla(${domColor} / 0.2), 0 0 30px hsla(${domColor} / 0.1), inset 0 1px 0 hsla(${domColor} / 0.15)`,
              }}
            >
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, hsl(${domColor}), hsla(var(--gold) / 0.6), hsl(${domColor}))` }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-semibold flex items-center gap-1.5" style={{ color: 'hsla(var(--gold) / 0.6)' }}>
                    <Sparkles size={10} /> Celestial Soul Card
                  </span>
                  <span className="text-[9px] tracking-wider text-muted-foreground font-mono">#{profile.soul_id}</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold" style={{
                    width: 72, height: 72,
                    background: `radial-gradient(circle at 35% 35%, hsla(${domColor} / 0.5), hsla(${domColor} / 0.1))`,
                    border: `2px solid hsla(${domColor} / 0.5)`, color: `hsl(${domColor})`,
                    fontFamily: 'var(--font-serif)', boxShadow: `0 0 40px hsla(${domColor} / 0.3), inset 0 0 20px hsla(${domColor} / 0.1)`,
                  }}>
                    {(profile.display_name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-foreground truncate" style={{ fontFamily: 'var(--font-serif)' }}>{profile.display_name || 'Soul'}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {profile.mbti && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'hsla(var(--accent) / 0.15)', border: '1px solid hsla(var(--accent) / 0.3)', color: 'hsl(var(--accent))' }}>{profile.mbti}</span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `hsla(${domColor} / 0.12)`, border: `1px solid hsla(${domColor} / 0.25)`, color: `hsl(${domColor})` }}>
                        {elementEmoji[dom]} {dom.charAt(0).toUpperCase() + dom.slice(1)}
                      </span>
                    </div>
                    {archetype && <p className="text-[11px] mt-1.5 font-medium" style={{ color: 'hsl(var(--gold))', fontFamily: 'var(--font-serif)' }}>{archetype.title}</p>}
                  </div>
                </div>
                <div className="rounded-xl p-3 mb-4" style={{ background: `linear-gradient(135deg, hsla(${domColor} / 0.08), hsla(var(--gold) / 0.04))`, border: `1px solid hsla(${domColor} / 0.12)` }}>
                  <p className="text-[11px] italic leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
                    "{archetype?.vibe || profile.bio || `A ${dom}-aligned soul, dancing between starlight and shadow, forever seeking cosmic harmony.`}"
                  </p>
                  <p className="text-[9px] mt-2 tracking-wide" style={{ color: `hsla(${domColor} / 0.7)` }}>∿ {vibrationFrequencies[dom]}</p>
                </div>
                <div className="space-y-2 mb-4">
                  {elements.map((el) => (
                    <div key={el} className="flex items-center gap-2">
                      <span className="text-sm w-5 text-center">{elementEmoji[el]}</span>
                      <span className="text-[9px] w-10 text-muted-foreground uppercase">{t(`oracle.${el}`)}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'hsla(var(--muted) / 0.3)' }}>
                        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${profile[el]}%` }}
                          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                          style={{ background: `linear-gradient(90deg, hsl(${elementColors[el]}), hsla(${elementColors[el]} / 0.6))` }} />
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

            {/* ========== ACTION BUTTONS ========== */}
            <div className="flex gap-3 mt-4">
              <button onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.97] hover:scale-[1.02]"
                style={{ background: 'hsla(var(--gold) / 0.12)', border: '1px solid hsla(var(--gold) / 0.25)', color: 'hsl(var(--gold))' }}>
                <Download size={16} /> {t('tribe.downloadCard')}
              </button>
              <button onClick={() => setShowShareSheet((v) => !v)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.97] hover:scale-[1.02]"
                style={{ background: showShareSheet ? 'hsla(var(--accent) / 0.25)' : 'hsla(var(--accent) / 0.12)', border: '1px solid hsla(var(--accent) / 0.25)', color: 'hsl(var(--accent))' }}>
                <Share2 size={16} /> {t('tribe.shareCard')}
              </button>
            </div>

            {/* ========== SHARE SHEET ========== */}
            <AnimatePresence>
              {showShareSheet && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-2xl p-4" style={{
                    background: 'hsla(232, 50%, 10%, 0.9)',
                    border: '1px solid hsla(var(--gold) / 0.15)',
                    backdropFilter: 'blur(20px)',
                  }}>
                    {/* Native Share (mobile) */}
                    <button onClick={handleNativeShare}
                      className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] hover:scale-[1.01]"
                      style={{
                        background: 'linear-gradient(135deg, hsla(var(--gold) / 0.2), hsla(var(--accent) / 0.15))',
                        border: '1px solid hsla(var(--gold) / 0.3)',
                        color: 'hsl(var(--gold))',
                      }}>
                      <Share2 size={16} /> {t('tribe.nativeShare')}
                    </button>

                    {/* Social Grid */}
                    <p className="text-[10px] text-center text-muted-foreground mb-3 tracking-[0.15em] uppercase">
                      {t('tribe.shareVia')}
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {socialPlatforms.map((p, i) => (
                        <motion.button
                          key={p.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => handleSocialShare(p.getUrl)}
                          className="flex flex-col items-center gap-1.5 py-2 rounded-xl transition-all hover:scale-110 active:scale-95"
                          style={{ background: `hsla(${p.bg} / 0.08)` }}
                          title={p.name}
                        >
                          <span className="text-xl">{p.emoji}</span>
                          <span className="text-[8px] text-muted-foreground leading-tight text-center truncate w-full px-0.5">{p.name}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Copy Link */}
                    <button onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl text-xs transition-all active:scale-[0.97]"
                      style={{
                        background: copied ? 'hsla(142, 70%, 45%, 0.15)' : 'hsla(var(--muted) / 0.15)',
                        border: `1px solid ${copied ? 'hsla(142, 70%, 45%, 0.3)' : 'hsla(var(--muted) / 0.25)'}`,
                        color: copied ? 'hsl(142, 70%, 55%)' : 'hsl(var(--muted-foreground))',
                      }}>
                      {copied ? <><Check size={14} /> {t('tribe.copied')}</> : <><Link2 size={14} /> {t('tribe.copyText')}</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoulCardModal;
