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

const cycleInsights: Record<string, string> = {
  wood: 'Wood feeds Fire — your creative energy ignites transformation.',
  fire: 'Fire enriches Earth — your passion crystallizes into lasting wisdom.',
  earth: 'Earth bears Metal — your stability forges clarity and precision.',
  metal: 'Metal collects Water — your discipline channels deep intuition.',
  water: 'Water nourishes Wood — your flow sparks infinite growth.',
};

const ELS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

function pentagonPoint(cx: number, cy: number, r: number, i: number): [number, number] {
  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function polygonPoints(cx: number, cy: number, r: number): string {
  return ELS.map((_, i) => pentagonPoint(cx, cy, r, i).join(',')).join(' ');
}

const ShareCardCanvas = forwardRef<HTMLDivElement, ShareCardCanvasProps>(
  ({ profile, appUrl, refCode }, ref) => {
    const dom = profile.dominant_element || 'earth';
    const domGlow = elColors[dom]?.glow || elColors.earth.glow;
    const archetype = profile.mbti ? mbtiArchetypes[profile.mbti.toUpperCase()] : null;
    const [qrDataUrl, setQrDataUrl] = useState('');

    const shareUrl = refCode ? `${appUrl}?ref=${refCode}` : appUrl;

    useEffect(() => {
      QRCode.toDataURL(shareUrl, {
        width: 110, margin: 1,
        color: { dark: '#c8b88acc', light: '#00000000' },
        errorCorrectionLevel: 'M',
      }).then(setQrDataUrl).catch(() => {});
    }, [shareUrl]);

    const soulScore = Math.min(99, Math.round(
      (profile.wood + profile.fire + profile.earth + profile.metal + profile.water) / 5 * 0.85 + 12
    ));

    // Seeded stars
    const stars = Array.from({ length: 80 }, (_, i) => {
      const s = (i * 7919 + 104729) % 100000;
      const r = (n: number) => ((s * n) % 1000) / 1000;
      return { sz: r(13) * 2.5 + 0.5, hue: r(23) * 60 + 200, op: r(29) * 0.5 + 0.15, x: r(31) * 100, y: r(37) * 100 };
    });

    // Star dust particles around radar
    const dustParticles = Array.from({ length: 35 }, (_, i) => {
      const s = (i * 6271 + 31337) % 100000;
      const r = (n: number) => ((s * n) % 1000) / 1000;
      const angle = r(11) * Math.PI * 2;
      const dist = r(17) * 180 + 100;
      return {
        x: 540 + Math.cos(angle) * dist,
        y: 680 + Math.sin(angle) * dist,
        sz: r(19) * 3 + 1,
        op: r(23) * 0.5 + 0.2,
        hue: r(29) * 60 + 180,
      };
    });

    const W = 1080;
    const H = 1920;
    const radarCx = 250;
    const radarCy = 250;
    const radarR = 185;

    const dataPoints = ELS.map((el, i) => {
      const v = profile[el] / 100;
      const [x, y] = pentagonPoint(radarCx, radarCy, radarR * v, i);
      return `${x},${y}`;
    }).join(' ');

    // Zodiac wheel symbols for bottom fill
    const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

    return (
      <div ref={ref} style={{
        position: 'fixed', left: -9999, top: 0, width: W, height: H,
        fontFamily: "'Playfair Display', Georgia, serif",
        background: '#080816',
        backgroundImage: 'linear-gradient(170deg, #12122a 0%, #0d0b24 25%, #080816 55%, #050510 100%)',
        color: '#e8e4de', overflow: 'hidden',
      }}>
        {/* Background stars */}
        {stars.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', width: s.sz, height: s.sz, borderRadius: '50%',
            background: `hsla(${s.hue},60%,82%,${s.op})`,
            boxShadow: s.sz > 2 ? `0 0 ${s.sz * 3}px hsla(${s.hue},60%,82%,${s.op * 0.6})` : undefined,
            left: `${s.x}%`, top: `${s.y}%`,
          }} />
        ))}

        {/* Star dust particles around radar zone */}
        {dustParticles.map((p, i) => (
          <div key={`dust-${i}`} style={{
            position: 'absolute', width: p.sz, height: p.sz, borderRadius: '50%',
            background: `hsla(${p.hue},70%,85%,${p.op})`,
            boxShadow: `0 0 ${p.sz * 4}px hsla(${p.hue},70%,85%,${p.op * 0.7})`,
            left: p.x, top: p.y,
          }} />
        ))}

        {/* Nebula orbs — concentrated behind radar */}
        <div style={{ position: 'absolute', width: 650, height: 650, borderRadius: '50%', background: `radial-gradient(circle, hsla(${domGlow}, 0.16), transparent 60%)`, left: '50%', top: '36%', transform: 'translate(-50%, -50%)', filter: 'blur(55px)' }} />
        <div style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, hsla(270,55%,40%,0.12), transparent 60%)', left: '28%', top: '33%', transform: 'translate(-50%, -50%)', filter: 'blur(45px)' }} />
        <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, hsla(220,65%,35%,0.1), transparent 60%)', left: '72%', top: '40%', transform: 'translate(-50%, -50%)', filter: 'blur(50px)' }} />

        {/* ═══ Giant Zodiac Wheel watermark — fills bottom emptiness ═══ */}
        <div style={{
          position: 'absolute', left: '50%', top: '72%', transform: 'translate(-50%, -50%)',
          width: 800, height: 800, borderRadius: '50%',
          border: '1px solid rgba(212,175,100,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Inner ring */}
          <div style={{
            position: 'absolute', width: 600, height: 600, borderRadius: '50%',
            border: '1px solid rgba(212,175,100,0.03)',
          }} />
          {/* Zodiac symbols around the wheel */}
          {zodiacSymbols.map((sym, i) => {
            const angle = (Math.PI * 2 * i) / 12 - Math.PI / 2;
            const r = 350;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            return (
              <div key={`z-${i}`} style={{
                position: 'absolute', fontSize: 32, color: 'rgba(212,175,100,0.04)',
                left: '50%', top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}>{sym}</div>
            );
          })}
        </div>

        {/* Astro watermarks */}
        <div style={{ position: 'absolute', right: 80, top: 250, fontSize: 110, opacity: 0.02, color: '#d4af64', transform: 'rotate(-15deg)', pointerEvents: 'none' }}>♃</div>
        <div style={{ position: 'absolute', left: 50, top: 1100, fontSize: 130, opacity: 0.018, color: '#d4af64', transform: 'rotate(12deg)', pointerEvents: 'none' }}>✡</div>

        {/* Gold border */}
        <div style={{ position: 'absolute', inset: 20, borderRadius: 36, border: '1px solid rgba(212,175,100,0.16)', boxShadow: 'inset 0 0 0 1px rgba(212,175,100,0.05)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '48px 60px 36px', height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,100,0.4)' }}>
              ─── ✦ CELESTIAL SOUL CARD ✦ ───
            </span>
          </div>

          {/* Name + Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 700,
              background: `radial-gradient(circle at 35% 35%, hsla(${domGlow},0.45), hsla(${domGlow},0.08))`,
              border: `2px solid hsla(${domGlow},0.5)`,
              color: `hsl(${domGlow})`,
              boxShadow: `0 0 30px hsla(${domGlow},0.3), 0 0 60px hsla(${domGlow},0.1)`,
              marginBottom: 10,
            }}>
              {(profile.display_name || 'S').charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, textShadow: `0 0 18px hsla(${domGlow},0.3)` }}>
              {profile.display_name || 'Soul'}
            </div>
          </div>

          {/* ★ PENTAGON RADAR — slightly smaller, lower position ★ */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, position: 'relative' }}>
            {/* Compass decoration rings */}
            <div style={{
              position: 'absolute', width: 480, height: 480, borderRadius: '50%',
              border: '1px solid rgba(212,175,100,0.05)',
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              boxShadow: 'inset 0 0 50px rgba(212,175,100,0.015)',
            }} />
            <div style={{
              position: 'absolute', width: 520, height: 520, borderRadius: '50%',
              border: '1px dashed rgba(212,175,100,0.03)',
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            }} />

            <svg width={radarCx * 2} height={radarCy * 2} viewBox={`0 0 ${radarCx * 2} ${radarCy * 2}`} style={{ overflow: 'visible' }}>
              <defs>
                <radialGradient id="radarGem" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor={`hsla(${domGlow},0.55)`} />
                  <stop offset="50%" stopColor={`hsla(${domGlow},0.25)`} />
                  <stop offset="100%" stopColor={`hsla(${domGlow},0.08)`} />
                </radialGradient>
                <filter id="radarGlow2">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="dotGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid pentagons */}
              {[0.33, 0.66, 1].map((scale, si) => (
                <polygon key={si}
                  points={polygonPoints(radarCx, radarCy, radarR * scale)}
                  fill="none" stroke="rgba(212,175,100,0.07)" strokeWidth="1"
                />
              ))}

              {/* Axis lines */}
              {ELS.map((_, i) => {
                const [x, y] = pentagonPoint(radarCx, radarCy, radarR, i);
                return <line key={i} x1={radarCx} y1={radarCy} x2={x} y2={y} stroke="rgba(212,175,100,0.05)" strokeWidth="1" />;
              })}

              {/* Data polygon — gem-like solid fill */}
              <polygon
                points={dataPoints}
                fill="url(#radarGem)"
                stroke={`hsl(${domGlow})`}
                strokeWidth="2.5"
                filter="url(#radarGlow2)"
              />

              {/* Data vertex dots with element-colored glow */}
              {ELS.map((el, i) => {
                const v = profile[el] / 100;
                const [x, y] = pentagonPoint(radarCx, radarCy, radarR * v, i);
                const c = elColors[el];
                return <circle key={el} cx={x} cy={y} r="6" fill={c.from} stroke="rgba(255,255,255,0.4)" strokeWidth="2"
                  filter="url(#dotGlow)" />;
              })}

              {/* Labels — larger, with colored glow */}
              {ELS.map((el, i) => {
                const [x, y] = pentagonPoint(radarCx, radarCy, radarR + 44, i);
                const c = elColors[el];
                return (
                  <g key={`label-${el}`}>
                    <text x={x} y={y - 12} textAnchor="middle" fontSize="20" style={{ filter: `drop-shadow(0 0 6px ${c.hex})` }}>
                      {elEmoji[el]}
                    </text>
                    <text x={x} y={y + 6} textAnchor="middle" fill={c.from} fontSize="13" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.08em"
                      style={{ filter: `drop-shadow(0 0 4px ${c.hex})` }}>
                      {el.toUpperCase()}
                    </text>
                    <text x={x} y={y + 24} textAnchor="middle" fill={`hsl(${c.glow})`} fontSize="16" fontWeight="800" fontFamily="Inter, monospace"
                      style={{ filter: `drop-shadow(0 0 5px hsla(${c.glow},0.5))` }}>
                      {profile[el]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* ★ HERO SCORE — with golden halo, tight to radar ★ */}
          <div style={{ textAlign: 'center', marginBottom: 10, position: 'relative' }}>
            {/* Gold halo behind score */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: 200, height: 100, borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(212,175,100,0.15), transparent 70%)',
              filter: 'blur(15px)',
            }} />
            <div style={{
              fontSize: 84, fontWeight: 900, lineHeight: 1, position: 'relative',
              background: 'linear-gradient(135deg, #c9a84c, #f5e6b8, #d4af64, #f5e6b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 28px rgba(212,175,100,0.55))',
              marginBottom: 4,
            }}>
              {soulScore}<span style={{ fontSize: 36, fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.22em', color: 'rgba(212,175,100,0.5)', position: 'relative' }}>
              ✦ SOUL SCORE ✦
            </div>
          </div>

          {/* Tags — horizontal layout */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 8 }}>
            {profile.mbti && (
              <span style={{
                fontSize: 16, padding: '6px 22px', borderRadius: 999, fontWeight: 700,
                background: 'rgba(180,120,255,0.1)', border: '1px solid rgba(180,120,255,0.35)',
                color: 'rgba(200,160,255,0.95)', textShadow: '0 0 12px rgba(180,120,255,0.3)',
              }}>{profile.mbti}</span>
            )}
            <span style={{
              fontSize: 16, padding: '6px 22px', borderRadius: 999, fontWeight: 700,
              background: `hsla(${domGlow},0.1)`, border: `1px solid hsla(${domGlow},0.3)`,
              color: `hsl(${domGlow})`, textShadow: `0 0 10px hsla(${domGlow},0.25)`,
            }}>
              {elEmoji[dom]} {dom.charAt(0).toUpperCase() + dom.slice(1)}
            </span>
          </div>

          {archetype && (
            <div style={{ textAlign: 'center', marginBottom: 14, fontSize: 20, fontStyle: 'italic', fontWeight: 600, color: 'rgba(212,175,100,0.8)', textShadow: '0 0 14px rgba(212,175,100,0.2)' }}>
              ── {archetype.title} ──
            </div>
          )}

          {/* Soul Insight — frosted glass */}
          <div style={{
            textAlign: 'center', marginBottom: 14, padding: '16px 30px', borderRadius: 16,
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(212,175,100,0.07)',
            boxShadow: 'inset 0 0 30px rgba(212,175,100,0.015)',
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(212,175,100,0.35)', marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
              ✦ SOUL INSIGHT ✦
            </div>
            <p style={{ fontSize: 15, fontStyle: 'italic', lineHeight: 1.65, color: 'rgba(232,228,222,0.72)', margin: 0 }}>
              "{archetype?.vibe || cycleInsights[dom]}"
            </p>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div style={{
            borderTop: '1px solid rgba(212,175,100,0.06)', paddingTop: 16,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(180,170,155,0.5)', letterSpacing: '0.15em', fontFamily: "'Inter', sans-serif" }}>
                SOUL ID: #{profile.soul_id}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(212,175,100,0.45)', letterSpacing: '0.06em' }}>
                ✦ {appUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')} ✦
              </div>
              <div style={{ fontSize: 10, color: 'rgba(200,190,175,0.3)' }}>
                Who are you in the Universe? ✨
              </div>
              <div style={{ fontSize: 8, color: 'rgba(160,150,140,0.22)', marginTop: 2, letterSpacing: '0.12em', fontFamily: "'Inter', sans-serif" }}>
                Made with Cosmic Energy at Celestial Oracle
              </div>
            </div>

            {/* QR — semi-transparent, embedded feel */}
            {qrDataUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 12, overflow: 'hidden',
                  background: 'rgba(12,10,28,0.5)',
                  border: '1px solid rgba(212,175,100,0.08)',
                  padding: 5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={qrDataUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.65 }} />
                </div>
                <span style={{ fontSize: 7, color: 'rgba(200,190,175,0.3)', textAlign: 'center', lineHeight: 1.2, fontFamily: "'Inter', sans-serif" }}>
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
