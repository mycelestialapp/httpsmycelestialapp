/**
 * 占星本命盘 · 12 宫轮盘（热带黄道）
 * 主流占卜 App 风格：宫位环 + 太阳落点 + 星座字样
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ZodiacSignKey } from '@/lib/astrologyChart';

const ZODIAC_ORDER: ZodiacSignKey[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const SIGN_SYMBOLS: Record<ZodiacSignKey, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

/** 星座短名（輪盤標籤用，可被 i18n 覆蓋） */
const SIGN_LABELS: Record<ZodiacSignKey, string> = {
  aries: '白羊', taurus: '金牛', gemini: '雙子', cancer: '巨蟹', leo: '獅子', virgo: '處女',
  libra: '天秤', scorpio: '天蠍', sagittarius: '射手', capricorn: '摩羯', aquarius: '水瓶', pisces: '雙魚',
};

interface AstrologyChartWheelProps {
  sunSign: ZodiacSignKey;
  size?: number;
  className?: string;
}

export default function AstrologyChartWheel({ sunSign, size = 320, className = '' }: AstrologyChartWheelProps) {
  const { t } = useTranslation();
  const sunIndex = useMemo(() => ZODIAC_ORDER.indexOf(sunSign), [sunSign]);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 4;
  const rInner = rOuter * 0.48;
  const rLabel = (rOuter + rInner) / 2;
  const symbolSize = Math.max(10, rOuter * 0.11);
  const nameSize = Math.max(9, rOuter * 0.095);

  const segments = useMemo(() => {
    return ZODIAC_ORDER.map((sign, i) => {
      const startDeg = 90 - i * 30;
      const endDeg = startDeg - 30;
      const rad = (d: number) => (d * Math.PI) / 180;
      const x1 = cx + rOuter * Math.cos(rad(startDeg));
      const y1 = cy - rOuter * Math.sin(rad(startDeg));
      const x2 = cx + rOuter * Math.cos(rad(endDeg));
      const y2 = cy - rOuter * Math.sin(rad(endDeg));
      const x3 = cx + rInner * Math.cos(rad(endDeg));
      const y3 = cy - rInner * Math.sin(rad(endDeg));
      const x4 = cx + rInner * Math.cos(rad(startDeg));
      const y4 = cy - rInner * Math.sin(rad(startDeg));
      const path = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 0 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 1 ${x4} ${y4} Z`;
      const labelAngle = 90 - i * 30 - 15;
      const lr = rLabel;
      const lx = cx + lr * Math.cos(rad(labelAngle));
      const ly = cy - lr * Math.sin(rad(labelAngle));
      return { sign, path, lx, ly, isSun: sign === sunSign };
    });
  }, [sunSign, cx, cy, rOuter, rInner, rLabel]);

  const sunPos = useMemo(() => {
    const midDeg = 90 - sunIndex * 30 - 15;
    const rad = (d: number) => (d * Math.PI) / 180;
    const rSun = (rInner + rOuter) / 2;
    return {
      x: cx + rSun * Math.cos(rad(midDeg)),
      y: cy - rSun * Math.sin(rad(midDeg)),
    };
  }, [sunIndex, cx, cy, rInner, rOuter]);

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <linearGradient id="wheel-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsla(var(--card), 0.4)" />
            <stop offset="100%" stopColor="hsla(var(--card), 0.15)" />
          </linearGradient>
          <filter id="sun-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* 外圈 */}
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="hsla(var(--gold) / 0.35)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="hsla(var(--gold) / 0.2)" strokeWidth="1" />
        {/* 12 宫扇形 */}
        {segments.map(({ sign, path, lx, ly, isSun }) => {
          const label = t(`oracle.signs.${sign}.shortName`, { defaultValue: SIGN_LABELS[sign] });
          return (
            <g key={sign}>
              <path
                d={path}
                fill={isSun ? 'hsla(var(--gold) / 0.18)' : 'hsla(0,0%,100%,0.03)'}
                stroke={isSun ? 'hsla(var(--gold) / 0.6)' : 'hsla(0,0%,100%,0.06)'}
                strokeWidth={isSun ? 1.5 : 0.5}
              />
              <text
                x={lx}
                y={ly - nameSize * 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSun ? 'hsl(var(--gold))' : 'hsla(0,0%,100%,0.55)'}
                fontSize={symbolSize}
                fontWeight={isSun ? 700 : 500}
              >
                {SIGN_SYMBOLS[sign]}
              </text>
              <text
                x={lx}
                y={ly + nameSize * 0.85}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSun ? 'hsla(var(--gold) / 0.95)' : 'hsla(0,0%,100%,0.45)'}
                fontSize={nameSize}
                fontWeight={isSun ? 600 : 400}
              >
                {label}
              </text>
            </g>
          );
        })}
        {/* 太阳符号 */}
        <g filter="url(#sun-glow)">
          <circle cx={sunPos.x} cy={sunPos.y} r={size * 0.044} fill="hsla(var(--gold) / 0.25)" stroke="hsl(var(--gold))" strokeWidth="1.5" />
          <text x={sunPos.x} y={sunPos.y} textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--gold))" fontSize={size * 0.044} fontWeight="700">
            ☉
          </text>
        </g>
      </svg>
    </div>
  );
}
