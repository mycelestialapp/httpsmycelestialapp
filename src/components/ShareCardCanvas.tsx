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

const elColors: Record<string, { from: string; to: string; glow: string; hex: string }> = {
  wood:  { from: '#34d399', to: '#059669', glow: '152, 70%, 55%', hex: '#34d399' },
  fire:  { from: '#f87171', to: '#dc2626', glow: '4, 85%, 60%', hex: '#f87171' },
  earth: { from: '#fbbf24', to: '#d97706', glow: '42, 85%, 58%', hex: '#fbbf24' },
  metal: { from: '#d1d5db', to: '#9ca3af', glow: '220, 20%, 80%', hex: '#d1d5db' },
  water: { from: '#60a5fa', to: '#2563eb', glow: '217, 85%, 60%', hex: '#60a5fa' },
};

const elEmoji: Record<string, string> = { wood: '🌿', fire: '🔥', earth: '⛰️', metal: '⚔️', water: '🌊' };

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

const cycleInsights: Record<string, string> = {
  wood: 'Wood feeds Fire — your creative energy ignites transformation.',
  fire: 'Fire enriches Earth — your passion crystallizes into lasting wisdom.',
  earth: 'Earth bears Metal — your stability forges clarity and precision.',
  metal: 'Metal collects Water — your discipline channels deep intuition.',
  water: 'Water nourishes Wood — your flow sparks infinite growth.',
};

const ELS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

function pentaP(cx: number, cy: number, r: number, i: number): [number, number] {
  const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
function polyStr(cx: number, cy: number, r: number) {
  return ELS.map((_, i) => pentaP(cx, cy, r, i).join(',')).join(' ');
}

const W = 1080, H = 1920;

const ShareCardCanvas = forwardRef<HTMLDivElement, ShareCardCanvasProps>(
  ({ profile, appUrl, refCode }, ref) => {
    const dom = profile.dominant_element || 'earth';
    const dg = elColors[dom]?.glow || elColors.earth.glow;
    const arch = profile.mbti ? mbtiArchetypes[profile.mbti.toUpperCase()] : null;
    const [qrUrl, setQrUrl] = useState('');
    const shareUrl = refCode ? `${appUrl}?ref=${refCode}` : appUrl;

    useEffect(() => {
      QRCode.toDataURL(shareUrl, { width: 100, margin: 1, color: { dark: '#c8b88acc', light: '#00000000' }, errorCorrectionLevel: 'M' })
        .then(setQrUrl).catch(() => {});
    }, [shareUrl]);

    const score = Math.min(99, Math.round(
      (profile.wood + profile.fire + profile.earth + profile.metal + profile.water) / 5 * 0.85 + 12
    ));

    const stars = Array.from({ length: 90 }, (_, i) => {
      const s = (i * 7919 + 104729) % 100000;
      const r = (n: number) => ((s * n) % 1000) / 1000;
      return { sz: r(13) * 2.8 + 0.4, hue: r(23) * 60 + 200, op: r(29) * 0.5 + 0.15, x: r(31) * 100, y: r(37) * 100 };
    });

    // Radar: 1.5x = R~330, viewBox center 380
    const RC = 380, RR = 330;
    const dataP = ELS.map((el, i) => {
      const [x, y] = pentaP(RC, RC, RR * (profile[el] / 100), i);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div ref={ref} style={{
        position: 'fixed', left: -9999, top: 0, width: W, height: H,
        fontFamily: "'Playfair Display', Georgia, serif",
        background: '#08081a',
        backgroundImage: 'radial-gradient(ellipse at 50% 40%, hsla(270,40%,18%,0.5) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, hsla(220,50%,15%,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, hsla(250,45%,16%,0.35) 0%, transparent 50%), linear-gradient(170deg, #12123a 0%, #0e0c30 30%, #08081a 60%, #04040f 100%)',
        color: '#e8e4de', overflow: 'hidden',
      }}>
        {/* Stars — spread across entire canvas */}
        {stars.map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: s.sz, height: s.sz, borderRadius: '50%', background: `hsla(${s.hue},60%,82%,${s.op})`, boxShadow: s.sz > 2 ? `0 0 ${s.sz * 3}px hsla(${s.hue},60%,82%,${s.op * 0.6})` : undefined, left: `${s.x}%`, top: `${s.y}%` }} />
        ))}

        {/* ═══ GLOWING RINGS — expanding visual tension ═══ */}
        {/* Ring 1: 60% diameter = 648px */}
        <div style={{ position: 'absolute', width: 648, height: 648, borderRadius: '50%', left: '50%', top: '45%', transform: 'translate(-50%, -50%)', border: '1.5px solid rgba(212,175,100,0.06)', boxShadow: '0 0 40px rgba(212,175,100,0.03), inset 0 0 40px rgba(212,175,100,0.02)' }} />
        {/* Ring 2: 120% diameter = 1296px */}
        <div style={{ position: 'absolute', width: 1296, height: 1296, borderRadius: '50%', left: '50%', top: '45%', transform: 'translate(-50%, -50%)', border: '1px solid rgba(212,175,100,0.03)', boxShadow: '0 0 60px rgba(212,175,100,0.015), inset 0 0 60px rgba(212,175,100,0.01)' }} />
        {/* Ring 3: medium accent */}
        <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', left: '50%', top: '45%', transform: 'translate(-50%, -50%)', border: '1px dashed rgba(212,175,100,0.025)' }} />

        {/* Nebula — full-screen coverage */}
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: `radial-gradient(circle, hsla(${dg},0.2), transparent 55%)`, left: '50%', top: '42%', transform: 'translate(-50%, -50%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, hsla(270,50%,42%,0.16), transparent 55%)', left: '15%', top: '25%', transform: 'translate(-50%, -50%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, hsla(220,60%,38%,0.14), transparent 55%)', left: '85%', top: '60%', transform: 'translate(-50%, -50%)', filter: 'blur(55px)' }} />
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, hsla(260,45%,30%,0.1), transparent 50%)', left: '50%', top: '80%', transform: 'translate(-50%, -50%)', filter: 'blur(65px)' }} />

        {/* Sacred geometry hexagram */}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[0, 1].map(t => {
            const pts = Array.from({length: 3}, (_, i) => {
              const a = (Math.PI * 2 * i) / 3 - Math.PI / 2 + t * Math.PI / 3;
              return `${540 + 440 * Math.cos(a)},${820 + 440 * Math.sin(a)}`;
            }).join(' ');
            return <polygon key={t} points={pts} fill="none" stroke="rgba(212,175,100,0.03)" strokeWidth="1.5" />;
          })}
        </svg>

        {/* Gold border */}
        <div style={{ position: 'absolute', inset: 18, borderRadius: 36, border: '1px solid rgba(212,175,100,0.14)' }} />

        {/* ═══ THREE-ZONE LAYOUT ═══ */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* ══════ TOP ZONE — 10% from top ══════ */}
          <div style={{ padding: '48px 60px 0', textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,100,0.4)' }}>
                ─── ✦ CELESTIAL SOUL CARD ✦ ───
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 78, height: 78, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 700,
                background: `radial-gradient(circle at 35% 35%, hsla(${dg},0.5), hsla(${dg},0.1))`,
                border: `2px solid hsla(${dg},0.55)`,
                color: `hsl(${dg})`,
                boxShadow: `0 0 30px hsla(${dg},0.35), 0 0 60px hsla(${dg},0.12)`,
                marginBottom: 8,
              }}>
                {(profile.display_name || 'S').charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, textShadow: `0 0 18px hsla(${dg},0.3)` }}>
                {profile.display_name || 'Soul'}
              </div>
            </div>
          </div>

          {/* ══════ CENTER ZONE — radar fills 80% width ══════ */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
            {/* Radar */}
            <svg width={RC * 2} height={RC * 2} viewBox={`0 0 ${RC * 2} ${RC * 2}`} style={{ overflow: 'visible', maxWidth: '86%' }}>
              <defs>
                <radialGradient id="gem" cx="50%" cy="38%" r="65%">
                  <stop offset="0%" stopColor={`hsla(${dg},0.65)`} />
                  <stop offset="35%" stopColor={`hsla(${dg},0.35)`} />
                  <stop offset="100%" stopColor={`hsla(${dg},0.06)`} />
                </radialGradient>
                <filter id="glo"><feGaussianBlur stdDeviation="12" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                <filter id="dg"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>

              {[0.33, 0.66, 1].map((s, i) => (
                <polygon key={i} points={polyStr(RC, RC, RR * s)} fill="none" stroke="rgba(212,175,100,0.06)" strokeWidth="1" />
              ))}
              {ELS.map((_, i) => {
                const [x, y] = pentaP(RC, RC, RR, i);
                return <line key={i} x1={RC} y1={RC} x2={x} y2={y} stroke="rgba(212,175,100,0.04)" strokeWidth="1" />;
              })}

              <polygon points={dataP} fill="url(#gem)" stroke={`hsl(${dg})`} strokeWidth="2.5" filter="url(#glo)" />

              {ELS.map((el, i) => {
                const v = profile[el] / 100;
                const [x, y] = pentaP(RC, RC, RR * v, i);
                const c = elColors[el];
                return <circle key={el} cx={x} cy={y} r="8" fill={c.from} stroke="rgba(255,255,255,0.5)" strokeWidth="2" filter="url(#dg)" />;
              })}

              {ELS.map((el, i) => {
                const [x, y] = pentaP(RC, RC, RR + 55, i);
                const c = elColors[el];
                return (
                  <g key={`l${el}`}>
                    <text x={x} y={y - 16} textAnchor="middle" fontSize="28" style={{ filter: `drop-shadow(0 0 10px ${c.hex})` }}>{elEmoji[el]}</text>
                    <text x={x} y={y + 6} textAnchor="middle" fill={c.from} fontSize="16" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.08em" style={{ filter: `drop-shadow(0 0 6px ${c.hex})` }}>{el.toUpperCase()}</text>
                    <text x={x} y={y + 28} textAnchor="middle" fill={`hsl(${c.glow})`} fontSize="20" fontWeight="800" fontFamily="Inter, monospace" style={{ filter: `drop-shadow(0 0 7px hsla(${c.glow},0.5))` }}>{profile[el]}</text>
                  </g>
                );
              })}
            </svg>

            {/* Score — pulled down from radar with breathing room */}
            <div style={{ textAlign: 'center', marginTop: 36, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 150, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(212,175,100,0.2), transparent 65%)', filter: 'blur(20px)' }} />
              <div style={{
                fontSize: 128, fontWeight: 900, lineHeight: 1, position: 'relative',
                background: 'linear-gradient(135deg, #c9a84c, #f5e6b8, #d4af64, #f5e6b8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 35px rgba(212,175,100,0.6))',
              }}>
                {score}<span style={{ fontSize: 52, fontWeight: 600 }}>/100</span>
              </div>
              <div style={{ fontSize: 14, letterSpacing: '0.25em', color: 'rgba(212,175,100,0.5)', position: 'relative', marginTop: 6 }}>
                ✦ SOUL SCORE ✦
              </div>
            </div>

            {/* Tags — heavy, wide pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 20 }}>
              {profile.mbti && (
                <span style={{
                  fontSize: 22, padding: '10px 36px', borderRadius: 999, fontWeight: 800,
                  background: 'rgba(180,120,255,0.14)', border: '2px solid rgba(180,120,255,0.4)',
                  color: 'rgba(200,160,255,0.95)', textShadow: '0 0 16px rgba(180,120,255,0.4)',
                  letterSpacing: '0.05em',
                }}>{profile.mbti}</span>
              )}
              <span style={{
                fontSize: 22, padding: '10px 36px', borderRadius: 999, fontWeight: 800,
                background: `hsla(${dg},0.14)`, border: `2px solid hsla(${dg},0.4)`,
                color: `hsl(${dg})`, textShadow: `0 0 14px hsla(${dg},0.35)`,
                letterSpacing: '0.05em',
              }}>
                {elEmoji[dom]} {dom.charAt(0).toUpperCase() + dom.slice(1)}
              </span>
            </div>

            {arch && (
              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 22, fontStyle: 'italic', fontWeight: 600, color: 'rgba(212,175,100,0.8)', textShadow: '0 0 14px rgba(212,175,100,0.2)' }}>
                ── {arch.title} ──
              </div>
            )}

            {/* Soul Insight */}
            <div style={{
              textAlign: 'center', marginTop: 18, padding: '14px 32px', borderRadius: 16, maxWidth: 860,
              background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(212,175,100,0.06)',
            }}>
              <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(212,175,100,0.3)', marginBottom: 5, fontFamily: "'Inter', sans-serif" }}>✦ SOUL INSIGHT ✦</div>
              <p style={{ fontSize: 15, fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(232,228,222,0.65)', margin: 0 }}>
                "{arch?.vibe || cycleInsights[dom]}"
              </p>
            </div>
          </div>

          {/* ══════ BOTTOM ZONE — 5% from bottom edge ══════ */}
          <div style={{
            padding: '0 60px 40px',
            borderTop: '1px solid rgba(212,175,100,0.06)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            paddingTop: 16,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(180,170,155,0.5)', letterSpacing: '0.15em', fontFamily: "'Inter', sans-serif" }}>SOUL ID: #{profile.soul_id}</div>
              <div style={{ fontSize: 12, color: 'rgba(212,175,100,0.42)', letterSpacing: '0.06em' }}>✦ {appUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')} ✦</div>
              <div style={{ fontSize: 10, color: 'rgba(200,190,175,0.28)' }}>Who are you in the Universe? ✨</div>
              <div style={{ fontSize: 8, color: 'rgba(160,150,140,0.2)', marginTop: 2, letterSpacing: '0.12em', fontFamily: "'Inter', sans-serif" }}>Made with Cosmic Energy at Celestial Oracle</div>
            </div>
            {qrUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{
                  width: 68, height: 68, borderRadius: 4, overflow: 'hidden',
                  background: 'rgba(255,255,255,0.08)',
                  padding: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={qrUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: 7, color: 'rgba(200,190,175,0.28)', textAlign: 'center', lineHeight: 1.2, fontFamily: "'Inter', sans-serif" }}>
                  Scan to discover<br />your energy path
                </span>
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
