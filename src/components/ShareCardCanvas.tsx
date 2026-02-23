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

    const stars = Array.from({ length: 80 }, (_, i) => {
      const s = (i * 7919 + 104729) % 100000;
      const r = (n: number) => ((s * n) % 1000) / 1000;
      return { sz: r(13) * 2.5 + 0.5, hue: r(23) * 60 + 200, op: r(29) * 0.5 + 0.15, x: r(31) * 100, y: r(37) * 100 };
    });

    const dust = Array.from({ length: 30 }, (_, i) => {
      const s = (i * 6271 + 31337) % 100000;
      const r = (n: number) => ((s * n) % 1000) / 1000;
      const a = r(11) * Math.PI * 2;
      const d = r(17) * 200 + 120;
      return { x: 540 + Math.cos(a) * d, y: 820 + Math.sin(a) * d, sz: r(19) * 3 + 1, op: r(23) * 0.45 + 0.15, hue: r(29) * 60 + 180 };
    });

    const W = 1080, H = 1920;
    // Radar: 1.2x scale → R=222
    const RC = 270, RR = 222;
    const dataP = ELS.map((el, i) => {
      const [x, y] = pentaP(RC, RC, RR * (profile[el] / 100), i);
      return `${x},${y}`;
    }).join(' ');

    const zodiac = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

    // Sacred geometry hexagram points
    const hexR = 420;
    const hex1 = Array.from({length: 3}, (_, i) => {
      const a = (Math.PI * 2 * i) / 3 - Math.PI / 2;
      return `${540 + hexR * Math.cos(a)},${800 + hexR * Math.sin(a)}`;
    }).join(' ');
    const hex2 = Array.from({length: 3}, (_, i) => {
      const a = (Math.PI * 2 * i) / 3 + Math.PI / 6;
      return `${540 + hexR * Math.cos(a)},${800 + hexR * Math.sin(a)}`;
    }).join(' ');

    return (
      <div ref={ref} style={{
        position: 'fixed', left: -9999, top: 0, width: W, height: H,
        fontFamily: "'Playfair Display', Georgia, serif",
        background: '#070714',
        backgroundImage: 'linear-gradient(170deg, #10102a 0%, #0c0a22 25%, #070714 55%, #04040e 100%)',
        color: '#e8e4de', overflow: 'hidden',
      }}>
        {/* Stars */}
        {stars.map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: s.sz, height: s.sz, borderRadius: '50%', background: `hsla(${s.hue},60%,82%,${s.op})`, boxShadow: s.sz > 2 ? `0 0 ${s.sz * 3}px hsla(${s.hue},60%,82%,${s.op * 0.6})` : undefined, left: `${s.x}%`, top: `${s.y}%` }} />
        ))}
        {/* Dust around radar */}
        {dust.map((p, i) => (
          <div key={`d${i}`} style={{ position: 'absolute', width: p.sz, height: p.sz, borderRadius: '50%', background: `hsla(${p.hue},70%,85%,${p.op})`, boxShadow: `0 0 ${p.sz * 4}px hsla(${p.hue},70%,85%,${p.op * 0.7})`, left: p.x, top: p.y }} />
        ))}

        {/* Nebulae — behind radar center (~42% from top = 800px) */}
        <div style={{ position: 'absolute', width: 750, height: 750, borderRadius: '50%', background: `radial-gradient(circle, hsla(${dg},0.18), transparent 55%)`, left: '50%', top: 800, transform: 'translate(-50%, -50%)', filter: 'blur(55px)' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, hsla(270,55%,40%,0.13), transparent 55%)', left: '25%', top: 750, transform: 'translate(-50%, -50%)', filter: 'blur(45px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, hsla(220,65%,35%,0.1), transparent 55%)', left: '75%', top: 850, transform: 'translate(-50%, -50%)', filter: 'blur(50px)' }} />

        {/* ═══ Sacred Geometry hexagram watermark — 80% screen width ═══ */}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <polygon points={hex1} fill="none" stroke="rgba(212,175,100,0.035)" strokeWidth="1.5" />
          <polygon points={hex2} fill="none" stroke="rgba(212,175,100,0.035)" strokeWidth="1.5" />
          <circle cx="540" cy="800" r={hexR} fill="none" stroke="rgba(212,175,100,0.025)" strokeWidth="1" />
          <circle cx="540" cy="800" r={hexR * 0.7} fill="none" stroke="rgba(212,175,100,0.02)" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="540" cy="800" r={hexR * 1.15} fill="none" stroke="rgba(212,175,100,0.015)" strokeWidth="1" />
        </svg>

        {/* Zodiac wheel watermark — lower area fill */}
        <div style={{ position: 'absolute', left: '50%', top: 1400, transform: 'translate(-50%, -50%)', width: 700, height: 700, borderRadius: '50%', border: '1px solid rgba(212,175,100,0.03)' }}>
          {zodiac.map((s, i) => {
            const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
            return <div key={i} style={{ position: 'absolute', fontSize: 28, color: 'rgba(212,175,100,0.035)', left: '50%', top: '50%', transform: `translate(calc(-50% + ${Math.cos(a) * 300}px), calc(-50% + ${Math.sin(a) * 300}px))` }}>{s}</div>;
          })}
        </div>

        {/* Gold border */}
        <div style={{ position: 'absolute', inset: 20, borderRadius: 36, border: '1px solid rgba(212,175,100,0.15)', boxShadow: 'inset 0 0 0 1px rgba(212,175,100,0.04)' }} />

        {/* ═══ CONTENT — shifted down 15% (paddingTop ~336px) ═══ */}
        <div style={{ position: 'relative', zIndex: 1, padding: '0 60px 50px', height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* Top spacer — 15% shift */}
          <div style={{ height: 200 }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,100,0.38)' }}>
              ─── ✦ CELESTIAL SOUL CARD ✦ ───
            </span>
          </div>

          {/* Avatar + Name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
            <div style={{
              width: 82, height: 82, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, fontWeight: 700,
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

          {/* ★ RADAR — 1.2x scaled ★ */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0, position: 'relative' }}>
            <svg width={RC * 2} height={RC * 2} viewBox={`0 0 ${RC * 2} ${RC * 2}`} style={{ overflow: 'visible' }}>
              <defs>
                <radialGradient id="gem" cx="50%" cy="38%" r="65%">
                  <stop offset="0%" stopColor={`hsla(${dg},0.6)`} />
                  <stop offset="40%" stopColor={`hsla(${dg},0.3)`} />
                  <stop offset="100%" stopColor={`hsla(${dg},0.06)`} />
                </radialGradient>
                <filter id="glo">
                  <feGaussianBlur stdDeviation="10" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="dg">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
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
                return <circle key={el} cx={x} cy={y} r="7" fill={c.from} stroke="rgba(255,255,255,0.45)" strokeWidth="2" filter="url(#dg)" />;
              })}

              {ELS.map((el, i) => {
                const [x, y] = pentaP(RC, RC, RR + 50, i);
                const c = elColors[el];
                return (
                  <g key={`l${el}`}>
                    <text x={x} y={y - 14} textAnchor="middle" fontSize="24" style={{ filter: `drop-shadow(0 0 8px ${c.hex})` }}>{elEmoji[el]}</text>
                    <text x={x} y={y + 6} textAnchor="middle" fill={c.from} fontSize="15" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.08em" style={{ filter: `drop-shadow(0 0 5px ${c.hex})` }}>{el.toUpperCase()}</text>
                    <text x={x} y={y + 26} textAnchor="middle" fill={`hsl(${c.glow})`} fontSize="18" fontWeight="800" fontFamily="Inter, monospace" style={{ filter: `drop-shadow(0 0 6px hsla(${c.glow},0.5))` }}>{profile[el]}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* ★ SCORE — tight to radar, 1.3x scaled ★ */}
          <div style={{ textAlign: 'center', marginTop: -8, marginBottom: 8, position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 260, height: 130, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(212,175,100,0.18), transparent 65%)', filter: 'blur(18px)' }} />
            <div style={{
              fontSize: 110, fontWeight: 900, lineHeight: 1, position: 'relative',
              background: 'linear-gradient(135deg, #c9a84c, #f5e6b8, #d4af64, #f5e6b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(212,175,100,0.6))',
            }}>
              {score}<span style={{ fontSize: 46, fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ fontSize: 14, letterSpacing: '0.25em', color: 'rgba(212,175,100,0.5)', position: 'relative', marginTop: 4 }}>
              ✦ SOUL SCORE ✦
            </div>
          </div>

          {/* Tags — 1.3x, horizontal */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
            {profile.mbti && (
              <span style={{
                fontSize: 20, padding: '7px 28px', borderRadius: 999, fontWeight: 700,
                background: 'rgba(180,120,255,0.12)', border: '1px solid rgba(180,120,255,0.4)',
                color: 'rgba(200,160,255,0.95)', textShadow: '0 0 14px rgba(180,120,255,0.35)',
              }}>{profile.mbti}</span>
            )}
            <span style={{
              fontSize: 20, padding: '7px 28px', borderRadius: 999, fontWeight: 700,
              background: `hsla(${dg},0.12)`, border: `1px solid hsla(${dg},0.35)`,
              color: `hsl(${dg})`, textShadow: `0 0 12px hsla(${dg},0.3)`,
            }}>
              {elEmoji[dom]} {dom.charAt(0).toUpperCase() + dom.slice(1)}
            </span>
          </div>

          {arch && (
            <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 22, fontStyle: 'italic', fontWeight: 600, color: 'rgba(212,175,100,0.8)', textShadow: '0 0 14px rgba(212,175,100,0.2)' }}>
              ── {arch.title} ──
            </div>
          )}

          {/* Soul Insight */}
          <div style={{
            textAlign: 'center', marginBottom: 12, padding: '14px 28px', borderRadius: 16,
            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(212,175,100,0.06)',
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(212,175,100,0.32)', marginBottom: 5, fontFamily: "'Inter', sans-serif" }}>✦ SOUL INSIGHT ✦</div>
            <p style={{ fontSize: 15, fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(232,228,222,0.68)', margin: 0 }}>
              "{arch?.vibe || cycleInsights[dom]}"
            </p>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer — raised from edge (paddingBottom 50px above) */}
          <div style={{
            borderTop: '1px solid rgba(212,175,100,0.06)', paddingTop: 18,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
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
