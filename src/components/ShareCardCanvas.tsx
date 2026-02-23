import { forwardRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface ShareCardCanvasProps {
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
  appUrl: string;
  refCode?: string;
}

const elementColors: Record<string, { hsl: string; glow: string }> = {
  wood:  { hsl: '152, 60%, 42%', glow: '152, 70%, 55%' },
  fire:  { hsl: '4, 80%, 55%',   glow: '4, 90%, 65%' },
  earth: { hsl: '42, 78%, 55%',  glow: '42, 85%, 65%' },
  metal: { hsl: '220, 15%, 72%', glow: '220, 30%, 85%' },
  water: { hsl: '210, 80%, 55%', glow: '210, 90%, 68%' },
};

const elementEmoji: Record<string, string> = {
  wood: '🌿', fire: '🔥', earth: '⛰️', metal: '⚔️', water: '🌊',
};

const mbtiArchetypes: Record<string, { title: string; vibe: string }> = {
  INTJ: { title: 'The Architect', vibe: 'A visionary strategist channeling cosmic precision.' },
  INTP: { title: 'The Thinker', vibe: 'A boundless mind exploring infinite corridors of knowledge.' },
  ENTJ: { title: 'The Commander', vibe: 'A born leader whose willpower bends the arc of destiny.' },
  ENTP: { title: 'The Debater', vibe: 'A spark of lightning, igniting new paradigms.' },
  INFJ: { title: 'The Advocate', vibe: 'A rare soul resonating across dimensions of experience.' },
  INFP: { title: 'The Mediator', vibe: 'A dreamer weaving meaning from threads of starlight.' },
  ENFJ: { title: 'The Protagonist', vibe: 'A radiant beacon guiding spirits toward awakening.' },
  ENFP: { title: 'The Campaigner', vibe: 'A free spirit turning moments into cosmic celebration.' },
  ISTJ: { title: 'The Logistician', vibe: 'A pillar of integrity grounding chaos into order.' },
  ISFJ: { title: 'The Defender', vibe: 'A gentle guardian sustaining the fabric of connection.' },
  ESTJ: { title: 'The Executive', vibe: 'Structured brilliance orchestrating harmony from complexity.' },
  ESFJ: { title: 'The Consul', vibe: 'A warm catalyst creating sanctuary wherever community gathers.' },
  ISTP: { title: 'The Virtuoso', vibe: 'An artisan decoding the mechanics of the universe.' },
  ISFP: { title: 'The Adventurer', vibe: 'Painting life with bold strokes of authentic beauty.' },
  ESTP: { title: 'The Entrepreneur', vibe: 'Riding the electric pulse of the present moment.' },
  ESFP: { title: 'The Entertainer', vibe: 'Transforming the ordinary into pure enchantment.' },
};

const vibrationFrequencies: Record<string, string> = {
  wood: '528 Hz — Growth & Renewal',
  fire: '741 Hz — Passion & Transformation',
  earth: '396 Hz — Stability & Wisdom',
  metal: '852 Hz — Clarity & Insight',
  water: '432 Hz — Flow & Intuition',
};

const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

const ShareCardCanvas = forwardRef<HTMLDivElement, ShareCardCanvasProps>(
  ({ profile, appUrl, refCode }, ref) => {
    const dom = profile.dominant_element || 'earth';
    const domCol = elementColors[dom] || elementColors.earth;
    const archetype = profile.mbti ? mbtiArchetypes[profile.mbti.toUpperCase()] : null;
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    const shareUrl = refCode ? `${appUrl}?ref=${refCode}` : appUrl;

    useEffect(() => {
      QRCode.toDataURL(shareUrl, {
        width: 180,
        margin: 1,
        color: { dark: '#d4c9a8cc', light: '#00000000' },
        errorCorrectionLevel: 'M',
      }).then(setQrDataUrl).catch(() => {});
    }, [shareUrl]);

    // Seeded starfield
    const stars = Array.from({ length: 80 }, (_, i) => {
      const seed = (i * 7919 + 104729) % 100000;
      const r = (n: number) => ((seed * n) % 1000) / 1000;
      return {
        size: r(13) * 3 + 0.5,
        hue: r(23) * 60 + 200,
        opacity: r(29) * 0.6 + 0.15,
        left: r(31) * 100,
        top: r(37) * 100,
      };
    });

    const soulScore = Math.min(99, Math.round(
      (profile.wood + profile.fire + profile.earth + profile.metal + profile.water) / 5 * 0.85 + 12
    ));

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: 1080,
          height: 1920,
          fontFamily: "'Playfair Display', 'Noto Serif SC', Georgia, serif",
          background: '#0d0d1a',
          backgroundImage: 'linear-gradient(170deg, #1a1a2e 0%, #12112a 35%, #0d0d1a 70%, #080818 100%)',
          color: '#e8e4de',
          overflow: 'hidden',
        }}
      >
        {/* ═══ Nebula orbs ═══ */}
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: `radial-gradient(circle, hsla(${domCol.glow}, 0.12) 0%, hsla(${domCol.hsl}, 0.04) 40%, transparent 70%)`,
          left: -150, top: -120, filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', width: 550, height: 550, borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(280, 60%, 50%, 0.08) 0%, transparent 70%)',
          right: -100, top: 300, filter: 'blur(50px)',
        }} />
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: `radial-gradient(circle, hsla(${domCol.glow}, 0.08) 0%, transparent 70%)`,
          right: -200, bottom: 100, filter: 'blur(60px)',
        }} />

        {/* ═══ Starfield ═══ */}
        {stars.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: s.size, height: s.size,
              borderRadius: '50%',
              background: `hsla(${s.hue}, 60%, 82%, ${s.opacity})`,
              boxShadow: s.size > 2 ? `0 0 ${s.size * 3}px hsla(${s.hue}, 60%, 82%, ${s.opacity * 0.6})` : undefined,
              left: `${s.left}%`,
              top: `${s.top}%`,
            }}
          />
        ))}

        {/* ═══ Gold border frame ═══ */}
        <div style={{
          position: 'absolute', inset: 16, borderRadius: 40,
          border: '1px solid transparent',
          backgroundClip: 'padding-box',
          // Gold gradient border via box-shadow trick
          boxShadow: 'inset 0 0 0 1px rgba(212, 175, 100, 0.25), 0 0 80px rgba(212, 175, 100, 0.05)',
        }} />

        {/* ═══ Content ═══ */}
        <div style={{ position: 'relative', zIndex: 1, padding: '80px 64px 50px', height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: 13, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(212, 175, 100, 0.6)', marginBottom: 8 }}>
              ─── ✦ Celestial Soul Card ✦ ───
            </div>
          </div>

          {/* Avatar + Name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
            <div style={{
              width: 150, height: 150, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 60, fontWeight: 700,
              background: `radial-gradient(circle at 35% 35%, hsla(${domCol.glow}, 0.45), hsla(${domCol.hsl}, 0.08))`,
              border: `2.5px solid hsla(${domCol.glow}, 0.5)`,
              color: `hsl(${domCol.glow})`,
              boxShadow: `0 0 50px hsla(${domCol.glow}, 0.3), 0 0 100px hsla(${domCol.glow}, 0.12)`,
              marginBottom: 28,
            }}>
              {(profile.display_name || 'S').charAt(0).toUpperCase()}
            </div>

            {/* Name with glow */}
            <div style={{
              fontSize: 46, fontWeight: 800, marginBottom: 10, textAlign: 'center',
              textShadow: `0 0 30px hsla(${domCol.glow}, 0.35), 0 2px 4px rgba(0,0,0,0.5)`,
            }}>
              {profile.display_name || 'Soul'}
            </div>

            {/* Soul Score */}
            <div style={{
              fontSize: 22, fontWeight: 700, marginBottom: 14,
              color: 'rgba(212, 175, 100, 0.9)',
              textShadow: '0 0 20px rgba(212, 175, 100, 0.4)',
              letterSpacing: '0.05em',
            }}>
              ✦ Soul Score: {soulScore}/100 ✦
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
              {profile.mbti && (
                <span style={{
                  fontSize: 17, padding: '7px 22px', borderRadius: 999, fontWeight: 700,
                  background: 'rgba(180, 120, 255, 0.12)', border: '1px solid rgba(180, 120, 255, 0.35)',
                  color: 'rgba(200, 160, 255, 0.95)',
                  textShadow: '0 0 12px rgba(180, 120, 255, 0.3)',
                }}>{profile.mbti}</span>
              )}
              <span style={{
                fontSize: 17, padding: '7px 22px', borderRadius: 999, fontWeight: 600,
                background: `hsla(${domCol.hsl}, 0.1)`, border: `1px solid hsla(${domCol.hsl}, 0.3)`,
                color: `hsl(${domCol.glow})`,
              }}>
                {elementEmoji[dom]} {dom.charAt(0).toUpperCase() + dom.slice(1)}
              </span>
            </div>

            {/* Archetype title with gold accents */}
            {archetype && (
              <div style={{
                fontSize: 22, fontWeight: 600, fontStyle: 'italic',
                color: 'rgba(212, 175, 100, 0.9)',
                textShadow: '0 0 18px rgba(212, 175, 100, 0.3)',
                letterSpacing: '0.02em',
              }}>
                ── {archetype.title} ──
              </div>
            )}
          </div>

          {/* Vibe quote */}
          <div style={{
            padding: '28px 36px', borderRadius: 22, marginBottom: 36, textAlign: 'center',
            background: `linear-gradient(135deg, hsla(${domCol.hsl}, 0.06), rgba(212, 175, 100, 0.03))`,
            border: `1px solid hsla(${domCol.hsl}, 0.1)`,
            boxShadow: `inset 0 0 40px hsla(${domCol.hsl}, 0.03)`,
          }}>
            <p style={{
              fontSize: 19, fontStyle: 'italic', lineHeight: 1.75,
              color: 'rgba(232, 228, 222, 0.85)', margin: '0 0 14px',
            }}>
              "{archetype?.vibe || profile.bio || `A ${dom}-aligned soul, dancing between starlight and shadow.`}"
            </p>
            <p style={{ fontSize: 13, color: `hsla(${domCol.glow}, 0.55)`, margin: 0, letterSpacing: '0.08em' }}>
              ∿ {vibrationFrequencies[dom]}
            </p>
          </div>

          {/* ═══ Glowing Element Bars ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28, flex: 1 }}>
            {elements.map((el) => {
              const col = elementColors[el];
              const val = profile[el];
              return (
                <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 26, width: 38, textAlign: 'center' }}>{elementEmoji[el]}</span>
                  <span style={{ fontSize: 14, width: 60, textTransform: 'uppercase', color: 'rgba(200, 195, 185, 0.6)', fontWeight: 600, letterSpacing: '0.06em' }}>
                    {el}
                  </span>
                  {/* Capsule bar with glow */}
                  <div style={{
                    flex: 1, height: 18, borderRadius: 99, overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.04)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
                  }}>
                    <div style={{
                      width: `${val}%`, height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, hsl(${col.hsl}), hsl(${col.glow}))`,
                      boxShadow: `0 0 14px hsla(${col.glow}, 0.5), 0 0 4px hsla(${col.glow}, 0.3)`,
                    }} />
                  </div>
                  <span style={{
                    fontSize: 17, width: 44, textAlign: 'right', fontFamily: "'Inter', monospace",
                    fontWeight: 700, color: `hsl(${col.glow})`,
                    textShadow: `0 0 10px hsla(${col.glow}, 0.3)`,
                  }}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ═══ Footer ═══ */}
          <div style={{
            borderTop: '1px solid rgba(212, 175, 100, 0.1)', paddingTop: 26,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
              <div style={{ fontSize: 13, color: 'rgba(180, 170, 155, 0.7)', letterSpacing: '0.15em', fontFamily: "'Inter', sans-serif" }}>
                SOUL ID: #{profile.soul_id}
              </div>
              <div style={{ fontSize: 16, color: 'rgba(212, 175, 100, 0.65)', letterSpacing: '0.08em' }}>
                ✦ {appUrl.replace(/^https?:\/\//, '')} ✦
              </div>
              <div style={{ fontSize: 13, color: 'rgba(200, 190, 175, 0.5)', marginTop: 2 }}>
                Who are you in the Universe? ✨
              </div>
              <div style={{ fontSize: 10, color: 'rgba(160, 150, 140, 0.35)', marginTop: 6, letterSpacing: '0.1em', fontFamily: "'Inter', sans-serif" }}>
                Made with Cosmic Energy at Celestial Oracle
              </div>
            </div>

            {/* QR Code — rounded, semi-transparent */}
            {qrDataUrl && (
              <div style={{
                width: 130, height: 130, borderRadius: 18, overflow: 'hidden',
                background: 'rgba(20, 18, 40, 0.7)',
                border: '1px solid rgba(212, 175, 100, 0.15)',
                boxShadow: '0 0 30px rgba(212, 175, 100, 0.06)',
                padding: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <img src={qrDataUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.85 }} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ShareCardCanvas.displayName = 'ShareCardCanvas';

export default ShareCardCanvas;
