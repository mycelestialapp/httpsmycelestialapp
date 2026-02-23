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

const elColors: Record<string, { from: string; to: string; glow: string }> = {
  wood:  { from: '#34d399', to: '#059669', glow: '152, 70%, 55%' },
  fire:  { from: '#f87171', to: '#dc2626', glow: '4, 85%, 60%' },
  earth: { from: '#fbbf24', to: '#d97706', glow: '42, 85%, 58%' },
  metal: { from: '#d1d5db', to: '#9ca3af', glow: '220, 20%, 80%' },
  water: { from: '#60a5fa', to: '#2563eb', glow: '217, 85%, 60%' },
};

const elEmoji: Record<string, string> = {
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

const freqMap: Record<string, string> = {
  wood: '528 Hz · Growth & Renewal',
  fire: '741 Hz · Passion & Transformation',
  earth: '396 Hz · Stability & Wisdom',
  metal: '852 Hz · Clarity & Insight',
  water: '432 Hz · Flow & Intuition',
};

const ELS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

const ShareCardCanvas = forwardRef<HTMLDivElement, ShareCardCanvasProps>(
  ({ profile, appUrl, refCode }, ref) => {
    const dom = profile.dominant_element || 'earth';
    const domGlow = elColors[dom]?.glow || elColors.earth.glow;
    const archetype = profile.mbti ? mbtiArchetypes[profile.mbti.toUpperCase()] : null;
    const [qrDataUrl, setQrDataUrl] = useState('');

    const shareUrl = refCode ? `${appUrl}?ref=${refCode}` : appUrl;

    useEffect(() => {
      QRCode.toDataURL(shareUrl, {
        width: 140, margin: 1,
        color: { dark: '#c8b88acc', light: '#00000000' },
        errorCorrectionLevel: 'M',
      }).then(setQrDataUrl).catch(() => {});
    }, [shareUrl]);

    const soulScore = Math.min(99, Math.round(
      (profile.wood + profile.fire + profile.earth + profile.metal + profile.water) / 5 * 0.85 + 12
    ));

    // Seeded stars
    const stars = Array.from({ length: 70 }, (_, i) => {
      const s = (i * 7919 + 104729) % 100000;
      const r = (n: number) => ((s * n) % 1000) / 1000;
      return { sz: r(13) * 2.5 + 0.5, hue: r(23) * 60 + 200, op: r(29) * 0.5 + 0.15, x: r(31) * 100, y: r(37) * 100 };
    });

    const W = 1080;
    const H = 1920;

    return (
      <div ref={ref} style={{
        position: 'fixed', left: -9999, top: 0, width: W, height: H,
        fontFamily: "'Playfair Display', Georgia, serif",
        background: '#0d0d1a',
        backgroundImage: 'linear-gradient(170deg, #1a1a2e 0%, #13112b 30%, #0d0d1a 65%, #080818 100%)',
        color: '#e8e4de', overflow: 'hidden',
      }}>
        {/* Nebula orbs */}
        <div style={{ position: 'absolute', width: 650, height: 650, borderRadius: '50%', background: `radial-gradient(circle, hsla(${domGlow}, 0.14), transparent 70%)`, left: -120, top: -80, filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, hsla(280,50%,45%,0.07), transparent 70%)', right: -80, top: 350, filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', background: `radial-gradient(circle, hsla(${domGlow}, 0.06), transparent 70%)`, left: 200, bottom: 200, filter: 'blur(70px)' }} />

        {/* Stars */}
        {stars.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', width: s.sz, height: s.sz, borderRadius: '50%',
            background: `hsla(${s.hue},60%,82%,${s.op})`,
            boxShadow: s.sz > 2 ? `0 0 ${s.sz * 2}px hsla(${s.hue},60%,82%,${s.op * 0.5})` : undefined,
            left: `${s.x}%`, top: `${s.y}%`,
          }} />
        ))}

        {/* Gold border */}
        <div style={{ position: 'absolute', inset: 20, borderRadius: 36, border: '1px solid rgba(212,175,100,0.2)', boxShadow: 'inset 0 0 0 1px rgba(212,175,100,0.08)' }} />

        {/* Content — compact layout */}
        <div style={{ position: 'relative', zIndex: 1, padding: '56px 60px 44px', height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 12, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,100,0.5)' }}>
              ─── ✦ CELESTIAL SOUL CARD ✦ ───
            </span>
          </div>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, fontWeight: 700,
              background: `radial-gradient(circle at 35% 35%, hsla(${domGlow},0.4), hsla(${domGlow},0.06))`,
              border: `2px solid hsla(${domGlow},0.45)`,
              color: `hsl(${domGlow})`,
              boxShadow: `0 0 40px hsla(${domGlow},0.25), 0 0 80px hsla(${domGlow},0.1)`,
              marginBottom: 16,
            }}>
              {(profile.display_name || 'S').charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 38, fontWeight: 800, marginBottom: 6, textShadow: `0 0 24px hsla(${domGlow},0.3)` }}>
              {profile.display_name || 'Soul'}
            </div>
          </div>

          {/* ★ HERO SCORE ★ */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              fontSize: 72, fontWeight: 900, lineHeight: 1,
              background: 'linear-gradient(135deg, #d4af64, #f5e6b8, #d4af64)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(212,175,100,0.45))',
              marginBottom: 4,
            }}>
              {soulScore}<span style={{ fontSize: 32, fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ fontSize: 13, letterSpacing: '0.15em', color: 'rgba(212,175,100,0.55)' }}>
              ✦ SOUL SCORE ✦
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
            {profile.mbti && (
              <span style={{
                fontSize: 15, padding: '5px 18px', borderRadius: 999, fontWeight: 700,
                background: 'rgba(180,120,255,0.1)', border: '1px solid rgba(180,120,255,0.3)',
                color: 'rgba(200,160,255,0.9)', textShadow: '0 0 10px rgba(180,120,255,0.25)',
              }}>{profile.mbti}</span>
            )}
            <span style={{
              fontSize: 15, padding: '5px 18px', borderRadius: 999, fontWeight: 600,
              background: `hsla(${domGlow},0.08)`, border: `1px solid hsla(${domGlow},0.25)`,
              color: `hsl(${domGlow})`,
            }}>
              {elEmoji[dom]} {dom.charAt(0).toUpperCase() + dom.slice(1)}
            </span>
          </div>

          {/* Archetype */}
          {archetype && (
            <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 20, fontStyle: 'italic', fontWeight: 600, color: 'rgba(212,175,100,0.85)', textShadow: '0 0 16px rgba(212,175,100,0.25)' }}>
              ── {archetype.title} ──
            </div>
          )}

          {/* Quote card — frosted glass */}
          <div style={{
            padding: '22px 28px', borderRadius: 18, marginBottom: 24, textAlign: 'center',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(212,175,100,0.1)',
            boxShadow: 'inset 0 0 30px rgba(212,175,100,0.02)',
          }}>
            <p style={{ fontSize: 17, fontStyle: 'italic', lineHeight: 1.7, color: 'rgba(232,228,222,0.8)', margin: '0 0 10px' }}>
              "{archetype?.vibe || profile.bio || `A ${dom}-aligned soul, dancing between starlight and shadow.`}"
            </p>
            <p style={{ fontSize: 12, color: `hsla(${domGlow},0.5)`, margin: 0, letterSpacing: '0.1em' }}>
              ∿ {freqMap[dom]}
            </p>
          </div>

          {/* ═══ Glowing Element Bars ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {ELS.map((el) => {
              const c = elColors[el];
              const v = profile[el];
              return (
                <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{elEmoji[el]}</span>
                  <span style={{ fontSize: 12, width: 54, textTransform: 'uppercase', color: 'rgba(200,195,185,0.55)', fontWeight: 700, letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif" }}>
                    {el}
                  </span>
                  <div style={{
                    flex: 1, height: 16, borderRadius: 99, overflow: 'hidden',
                    background: 'rgba(255,255,255,0.04)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                  }}>
                    <div style={{
                      width: `${v}%`, height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${c.from}, ${c.to})`,
                      boxShadow: `0 0 12px hsla(${c.glow},0.45), 0 0 3px hsla(${c.glow},0.25), inset 0 1px 0 rgba(255,255,255,0.15)`,
                    }} />
                  </div>
                  <span style={{
                    fontSize: 15, width: 38, textAlign: 'right', fontFamily: "'Inter', monospace",
                    fontWeight: 700, color: `hsl(${c.glow})`,
                    textShadow: `0 0 8px hsla(${c.glow},0.3)`,
                  }}>
                    {v}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Spacer — pushes footer to bottom */}
          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div style={{
            borderTop: '1px solid rgba(212,175,100,0.08)', paddingTop: 20,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
              <div style={{ fontSize: 11, color: 'rgba(180,170,155,0.6)', letterSpacing: '0.15em', fontFamily: "'Inter', sans-serif" }}>
                SOUL ID: #{profile.soul_id}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(212,175,100,0.55)', letterSpacing: '0.06em' }}>
                ✦ {appUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')} ✦
              </div>
              <div style={{ fontSize: 12, color: 'rgba(200,190,175,0.4)', marginTop: 1 }}>
                Who are you in the Universe? ✨
              </div>
              <div style={{ fontSize: 9, color: 'rgba(160,150,140,0.3)', marginTop: 4, letterSpacing: '0.12em', fontFamily: "'Inter', sans-serif" }}>
                Made with Cosmic Energy at Celestial Oracle
              </div>
            </div>

            {/* QR — compact, rounded */}
            {qrDataUrl && (
              <div style={{
                width: 96, height: 96, borderRadius: 14, overflow: 'hidden',
                background: 'rgba(18,16,36,0.75)',
                border: '1px solid rgba(212,175,100,0.12)',
                boxShadow: '0 0 20px rgba(212,175,100,0.04)',
                padding: 8, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src={qrDataUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.8 }} />
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
