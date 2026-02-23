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

const cycleInsights: Record<string, string> = {
  wood: 'Wood feeds Fire — your creative energy ignites transformation.',
  fire: 'Fire enriches Earth — your passion crystallizes into lasting wisdom.',
  earth: 'Earth bears Metal — your stability forges clarity and precision.',
  metal: 'Metal collects Water — your discipline channels deep intuition.',
  water: 'Water nourishes Wood — your flow sparks infinite growth.',
};

const ELS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

// Pentagon radar: generate SVG points for a regular pentagon
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
        width: 120, margin: 1,
        color: { dark: '#c8b88acc', light: '#00000000' },
        errorCorrectionLevel: 'M',
      }).then(setQrDataUrl).catch(() => {});
    }, [shareUrl]);

    const soulScore = Math.min(99, Math.round(
      (profile.wood + profile.fire + profile.earth + profile.metal + profile.water) / 5 * 0.85 + 12
    ));

    const stars = Array.from({ length: 70 }, (_, i) => {
      const s = (i * 7919 + 104729) % 100000;
      const r = (n: number) => ((s * n) % 1000) / 1000;
      return { sz: r(13) * 2.5 + 0.5, hue: r(23) * 60 + 200, op: r(29) * 0.5 + 0.15, x: r(31) * 100, y: r(37) * 100 };
    });

    const W = 1080;
    const H = 1920;
    const radarCx = 280;
    const radarCy = 280;
    const radarR = 220;

    const vals = ELS.map(el => profile[el]);
    const dataPoints = ELS.map((_, i) => {
      const v = vals[i] / 100;
      const [x, y] = pentagonPoint(radarCx, radarCy, radarR * v, i);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div ref={ref} style={{
        position: 'fixed', left: -9999, top: 0, width: W, height: H,
        fontFamily: "'Playfair Display', Georgia, serif",
        background: '#0a0a18',
        backgroundImage: 'linear-gradient(170deg, #151530 0%, #0f0d28 30%, #0a0a18 65%, #060612 100%)',
        color: '#e8e4de', overflow: 'hidden',
      }}>
        {/* Stars */}
        {stars.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', width: s.sz, height: s.sz, borderRadius: '50%',
            background: `hsla(${s.hue},60%,82%,${s.op})`,
            boxShadow: s.sz > 2 ? `0 0 ${s.sz * 2}px hsla(${s.hue},60%,82%,${s.op * 0.5})` : undefined,
            left: `${s.x}%`, top: `${s.y}%`,
          }} />
        ))}

        {/* Nebula orbs behind radar */}
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, hsla(${domGlow}, 0.12), transparent 65%)`, left: '50%', top: '38%', transform: 'translate(-50%, -50%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, hsla(270,55%,40%,0.1), transparent 65%)', left: '30%', top: '32%', transform: 'translate(-50%, -50%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, hsla(220,60%,35%,0.08), transparent 65%)', left: '70%', top: '45%', transform: 'translate(-50%, -50%)', filter: 'blur(55px)' }} />

        {/* Astro watermarks */}
        <div style={{ position: 'absolute', right: 70, top: 280, fontSize: 130, opacity: 0.025, color: '#d4af64', transform: 'rotate(-15deg)', pointerEvents: 'none' }}>♃</div>
        <div style={{ position: 'absolute', left: 40, bottom: 350, fontSize: 150, opacity: 0.02, color: '#d4af64', transform: 'rotate(12deg)', pointerEvents: 'none' }}>♒</div>
        <div style={{ position: 'absolute', right: 90, bottom: 200, fontSize: 120, opacity: 0.02, color: '#d4af64', transform: 'rotate(-8deg)', pointerEvents: 'none' }}>✡</div>

        {/* Gold border */}
        <div style={{ position: 'absolute', inset: 20, borderRadius: 36, border: '1px solid rgba(212,175,100,0.18)', boxShadow: 'inset 0 0 0 1px rgba(212,175,100,0.06)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '50px 60px 40px', height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* Header with Soul ID */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,100,0.45)' }}>
              ─── ✦ CELESTIAL SOUL CARD ✦ ───
            </span>
          </div>

          {/* Name + Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, fontWeight: 700,
              background: `radial-gradient(circle at 35% 35%, hsla(${domGlow},0.4), hsla(${domGlow},0.06))`,
              border: `2px solid hsla(${domGlow},0.45)`,
              color: `hsl(${domGlow})`,
              boxShadow: `0 0 35px hsla(${domGlow},0.25), 0 0 70px hsla(${domGlow},0.08)`,
              marginBottom: 12,
            }}>
              {(profile.display_name || 'S').charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, textShadow: `0 0 20px hsla(${domGlow},0.3)` }}>
              {profile.display_name || 'Soul'}
            </div>
          </div>

          {/* ★ PENTAGON RADAR CHART ★ — centered hero */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, position: 'relative' }}>
            {/* Compass ring decoration behind radar */}
            <div style={{
              position: 'absolute', width: 540, height: 540, borderRadius: '50%',
              border: '1px solid rgba(212,175,100,0.06)',
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              boxShadow: 'inset 0 0 60px rgba(212,175,100,0.02)',
            }} />
            <div style={{
              position: 'absolute', width: 600, height: 600, borderRadius: '50%',
              border: '1px dashed rgba(212,175,100,0.04)',
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            }} />

            <svg width={radarCx * 2} height={radarCy * 2} viewBox={`0 0 ${radarCx * 2} ${radarCy * 2}`} style={{ overflow: 'visible' }}>
              <defs>
                <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={`hsla(${domGlow},0.35)`} />
                  <stop offset="100%" stopColor={`hsla(${domGlow},0.08)`} />
                </radialGradient>
                <filter id="radarGlow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="outerGlow">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines — 3 concentric pentagons */}
              {[0.33, 0.66, 1].map((scale, si) => (
                <polygon key={si}
                  points={polygonPoints(radarCx, radarCy, radarR * scale)}
                  fill="none" stroke="rgba(212,175,100,0.08)" strokeWidth="1"
                />
              ))}

              {/* Axis lines */}
              {ELS.map((_, i) => {
                const [x, y] = pentagonPoint(radarCx, radarCy, radarR, i);
                return <line key={i} x1={radarCx} y1={radarCy} x2={x} y2={y} stroke="rgba(212,175,100,0.06)" strokeWidth="1" />;
              })}

              {/* Data polygon */}
              <polygon
                points={dataPoints}
                fill="url(#radarFill)"
                stroke={`hsl(${domGlow})`}
                strokeWidth="2.5"
                filter="url(#radarGlow)"
                opacity="0.9"
              />

              {/* Data dots */}
              {ELS.map((el, i) => {
                const v = profile[el] / 100;
                const [x, y] = pentagonPoint(radarCx, radarCy, radarR * v, i);
                const c = elColors[el];
                return <circle key={el} cx={x} cy={y} r="5" fill={c.from} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
                  style={{ filter: `drop-shadow(0 0 6px ${c.from})` }} />;
              })}

              {/* Labels at vertices */}
              {ELS.map((el, i) => {
                const [x, y] = pentagonPoint(radarCx, radarCy, radarR + 38, i);
                const c = elColors[el];
                return (
                  <g key={`label-${el}`}>
                    <text x={x} y={y - 10} textAnchor="middle" fill={c.from} fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif" style={{ textTransform: 'uppercase' as const }}>
                      {elEmoji[el]}
                    </text>
                    <text x={x} y={y + 6} textAnchor="middle" fill="rgba(200,195,185,0.6)" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif" letterSpacing="0.05em">
                      {el.toUpperCase()}
                    </text>
                    <text x={x} y={y + 22} textAnchor="middle" fill={`hsl(${c.glow})`} fontSize="14" fontWeight="800" fontFamily="Inter, monospace">
                      {profile[el]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* ★ HERO SCORE ★ */}
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{
              fontSize: 80, fontWeight: 900, lineHeight: 1,
              background: 'linear-gradient(135deg, #d4af64, #f5e6b8, #d4af64)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 24px rgba(212,175,100,0.5))',
              marginBottom: 4,
            }}>
              {soulScore}<span style={{ fontSize: 34, fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ fontSize: 12, letterSpacing: '0.2em', color: 'rgba(212,175,100,0.5)' }}>
              ✦ SOUL SCORE ✦
            </div>
          </div>

          {/* Tags + Archetype */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
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
          {archetype && (
            <div style={{ textAlign: 'center', marginBottom: 14, fontSize: 19, fontStyle: 'italic', fontWeight: 600, color: 'rgba(212,175,100,0.8)', textShadow: '0 0 14px rgba(212,175,100,0.2)' }}>
              ── {archetype.title} ──
            </div>
          )}

          {/* Soul Insight */}
          <div style={{
            textAlign: 'center', marginBottom: 16, padding: '16px 28px', borderRadius: 16,
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(212,175,100,0.08)',
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(212,175,100,0.4)', marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
              ✦ SOUL INSIGHT ✦
            </div>
            <p style={{ fontSize: 15, fontStyle: 'italic', lineHeight: 1.65, color: 'rgba(232,228,222,0.75)', margin: 0 }}>
              "{archetype?.vibe || cycleInsights[dom]}"
            </p>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div style={{
            borderTop: '1px solid rgba(212,175,100,0.07)', paddingTop: 18,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(180,170,155,0.55)', letterSpacing: '0.15em', fontFamily: "'Inter', sans-serif" }}>
                SOUL ID: #{profile.soul_id}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(212,175,100,0.5)', letterSpacing: '0.06em' }}>
                ✦ {appUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')} ✦
              </div>
              <div style={{ fontSize: 11, color: 'rgba(200,190,175,0.35)', marginTop: 1 }}>
                Who are you in the Universe? ✨
              </div>
              <div style={{ fontSize: 8, color: 'rgba(160,150,140,0.25)', marginTop: 3, letterSpacing: '0.12em', fontFamily: "'Inter', sans-serif" }}>
                Made with Cosmic Energy at Celestial Oracle
              </div>
            </div>

            {/* QR — small, elegant */}
            {qrDataUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 12, overflow: 'hidden',
                  background: 'rgba(18,16,36,0.7)',
                  border: '1px solid rgba(212,175,100,0.1)',
                  boxShadow: '0 0 16px rgba(212,175,100,0.03)',
                  padding: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={qrDataUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.75 }} />
                </div>
                <span style={{ fontSize: 8, color: 'rgba(200,190,175,0.35)', textAlign: 'center', lineHeight: 1.2, fontFamily: "'Inter', sans-serif" }}>
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
