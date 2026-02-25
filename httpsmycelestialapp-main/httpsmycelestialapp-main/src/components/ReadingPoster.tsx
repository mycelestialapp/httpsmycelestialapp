import { forwardRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { ElementEnergy } from '@/lib/fiveElements';

interface ReadingPosterProps {
  energy: ElementEnergy;
  dominantElement: string;
  toolKey: string;
  readingExcerpt: string;
}

const BRAND_URL = 'https://mycelestial.app';

const elEmoji: Record<string, string> = { wood: '🌿', fire: '🔥', earth: '⛰️', metal: '⚔️', water: '🌊' };
const elColors: Record<string, string> = {
  wood: '#34d399', fire: '#f87171', earth: '#fbbf24', metal: '#d1d5db', water: '#60a5fa',
};

const ELS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

function pentaP(cx: number, cy: number, r: number, i: number): [number, number] {
  const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

const ReadingPoster = forwardRef<HTMLDivElement, ReadingPosterProps>(
  ({ energy, dominantElement, toolKey, readingExcerpt }, ref) => {
    const [qrUrl, setQrUrl] = useState('');
    const dom = dominantElement || 'earth';

    useEffect(() => {
      QRCode.toDataURL(BRAND_URL, { width: 120, margin: 1, color: { dark: '#c8b88acc', light: '#00000000' }, errorCorrectionLevel: 'M' })
        .then(setQrUrl).catch(() => {});
    }, []);

    const W = 1080, H = 1920;
    const RC = 300, RR = 240;

    const dataP = ELS.map((el, i) => {
      const [x, y] = pentaP(RC, RC, RR * (energy[el] / 100), i);
      return `${x},${y}`;
    }).join(' ');

    // Take first ~200 chars of reading as excerpt
    const excerpt = readingExcerpt
      .replace(/[#*✦──]/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 200) + '...';

    const stars = Array.from({ length: 60 }, (_, i) => {
      const s = (i * 7919 + 104729) % 100000;
      const r = (n: number) => ((s * n) % 1000) / 1000;
      return { sz: r(13) * 2 + 0.4, op: r(29) * 0.4 + 0.1, x: r(31) * 100, y: r(37) * 100 };
    });

    return (
      <div ref={ref} style={{
        position: 'fixed', left: -9999, top: 0, width: W, height: H,
        fontFamily: "'Playfair Display', Georgia, serif",
        background: 'linear-gradient(170deg, #12123a 0%, #0e0c30 30%, #08081a 60%, #04040f 100%)',
        color: '#e8e4de', overflow: 'hidden',
      }}>
        {stars.map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: s.sz, height: s.sz, borderRadius: '50%', background: `rgba(200,190,170,${s.op})`, left: `${s.x}%`, top: `${s.y}%` }} />
        ))}

        {/* Gold border */}
        <div style={{ position: 'absolute', inset: 20, borderRadius: 32, border: '1px solid rgba(212,175,100,0.15)' }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 60px 40px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.4em', color: 'rgba(212,175,100,0.4)', marginBottom: 16 }}>
              ─── ✦ CELESTIAL ORACLE READING ✦ ───
            </div>
            <div style={{
              fontSize: 42, fontWeight: 900, lineHeight: 1.2,
              background: 'linear-gradient(135deg, #c9a84c, #f5e6b8, #d4af64)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(212,175,100,0.4))',
            }}>
              {toolKey.charAt(0).toUpperCase() + toolKey.slice(1)} Reading
            </div>
            <div style={{ fontSize: 14, color: 'rgba(212,175,100,0.5)', marginTop: 8, letterSpacing: '0.15em' }}>
              {elEmoji[dom]} Dominant: {dom.charAt(0).toUpperCase() + dom.slice(1)}
            </div>
          </div>

          {/* Radar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
            <svg width={RC * 2} height={RC * 2} viewBox={`0 0 ${RC * 2} ${RC * 2}`} style={{ overflow: 'visible' }}>
              <defs>
                <radialGradient id="pg" cx="50%" cy="38%" r="65%">
                  <stop offset="0%" stopColor="rgba(201,168,76,0.5)" />
                  <stop offset="100%" stopColor="rgba(201,168,76,0.05)" />
                </radialGradient>
                <filter id="pgl"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              {[0.33, 0.66, 1].map((s, i) => (
                <polygon key={i} points={ELS.map((_, j) => pentaP(RC, RC, RR * s, j).join(',')).join(' ')} fill="none" stroke="rgba(212,175,100,0.06)" strokeWidth="1" />
              ))}
              <polygon points={dataP} fill="url(#pg)" stroke="#c9a84c" strokeWidth="2" filter="url(#pgl)" />
              {ELS.map((el, i) => {
                const [x, y] = pentaP(RC, RC, RR + 45, i);
                return (
                  <g key={el}>
                    <text x={x} y={y - 10} textAnchor="middle" fontSize="22">{elEmoji[el]}</text>
                    <text x={x} y={y + 12} textAnchor="middle" fill={elColors[el]} fontSize="14" fontWeight="800" fontFamily="Inter, sans-serif">{el.toUpperCase()}</text>
                    <text x={x} y={y + 30} textAnchor="middle" fill={elColors[el]} fontSize="16" fontWeight="800" fontFamily="Inter, monospace">{energy[el]}%</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Element bars */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 30, justifyContent: 'center' }}>
            {ELS.map(el => (
              <div key={el} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 80 }}>
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{ width: `${energy[el]}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${elColors[el]}, ${elColors[el]}88)` }} />
                </div>
                <span style={{ fontSize: 10, color: 'rgba(212,175,100,0.4)', fontFamily: 'Inter, sans-serif' }}>{energy[el]}%</span>
              </div>
            ))}
          </div>

          {/* Reading excerpt */}
          <div style={{
            flex: 1, padding: '24px 32px', borderRadius: 20, marginBottom: 24,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,100,0.08)',
            overflow: 'hidden',
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(212,175,100,0.35)', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>
              ✦ SOUL READING EXCERPT ✦
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(232,228,222,0.6)', fontStyle: 'italic', margin: 0 }}>
              "{excerpt}"
            </p>
          </div>

          {/* Footer with branding */}
          <div style={{
            borderTop: '1px solid rgba(212,175,100,0.08)',
            paddingTop: 16,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(212,175,100,0.7)', letterSpacing: '0.08em' }}>
                MyCelestial.app
              </div>
              <div style={{ fontSize: 12, color: 'rgba(212,175,100,0.35)', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
                ✦ 解读你的灵魂频率 | Decode Your Soul Frequency
              </div>
              <div style={{ fontSize: 9, color: 'rgba(200,190,175,0.2)', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
                {BRAND_URL}
              </div>
            </div>
            {qrUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 8, overflow: 'hidden',
                  background: 'rgba(255,255,255,0.08)', padding: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={qrUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.75 }} />
                </div>
                <span style={{ fontSize: 8, color: 'rgba(200,190,175,0.3)', fontFamily: 'Inter, sans-serif' }}>
                  Scan to read yours
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ReadingPoster.displayName = 'ReadingPoster';
export default ReadingPoster;
