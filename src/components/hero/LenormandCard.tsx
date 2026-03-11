import { useState } from 'react';
import type { CSSProperties } from 'react';
import { getLenormandCardById } from '@/lib/lenormandCards';

interface LenormandCardProps {
  index: number;
  onFlipChange?: (flipped: boolean) => void;
  /** 熄灯退场时强制展示牌背，不受点击控制 */
  forceBackFace?: boolean;
}

const cardWrapperStyle = (isFlipped: boolean): CSSProperties => ({
  position: isFlipped ? 'fixed' : 'relative',
  top: isFlipped ? '50%' : 'auto',
  left: isFlipped ? '50%' : 'auto',
  transform: isFlipped ? 'translate(-50%, -50%) scale(2.5)' : 'none',
  zIndex: isFlipped ? 200 : 1,
  transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
  perspective: '1000px',
});

const cardInnerStyle = (isFlipped: boolean): CSSProperties => ({
  width: '70px',
  height: '100px',
  transformStyle: 'preserve-3d',
  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
  position: 'relative',
});

const faceBaseStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  textAlign: 'center',
};

export function LenormandCard({ index, onFlipChange, forceBackFace }: LenormandCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const card = getLenormandCardById(index);
  const effectiveFlipped = forceBackFace || isFlipped;

  return (
    <div
      style={cardWrapperStyle(effectiveFlipped)}
      onClick={() =>
        setIsFlipped((v) => {
          const next = !v;
          onFlipChange?.(next);
          return next;
        })
      }
    >
      <div style={cardInnerStyle(effectiveFlipped)}>
        {/* 正面：符号 + 名称 */}
        <div className="lenormand-card" style={faceBaseStyle}>
          {card ? (
            <>
              <span className="text-xl mt-1" aria-hidden>
                {card.symbol}
              </span>
              <span className="text-[10px] px-1 text-[#D4AF37]/90 truncate max-w-full">
                {card.nameZh}
              </span>
            </>
          ) : (
            <span className="text-sm text-[#D4AF37]/70">{index}</span>
          )}
        </div>

        {/* 反面：编号 + 简短含义，180° 翻转 */}
        <div
          className="lenormand-card"
          style={{
            ...faceBaseStyle,
            transform: 'rotateY(180deg)',
            padding: '6px',
            fontSize: '10px',
            lineHeight: 1.4,
          }}
        >
          {card ? (
            <>
              <span className="text-[11px] font-semibold text-[#D4AF37] mb-1">
                {index.toString().padStart(2, '0')} · {card.nameEn}
              </span>
              <span className="text-[10px] text-[#f5e7c2]">
                {card.shortMeaning}
              </span>
            </>
          ) : (
            <span className="text-sm text-[#D4AF37]/70">{index}</span>
          )}
        </div>
      </div>
    </div>
  );
}
