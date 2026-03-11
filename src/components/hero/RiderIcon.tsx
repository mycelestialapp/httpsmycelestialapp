/**
 * 雷諾曼「騎士」牌標誌：精細 SVG 路徑，馬與騎手輪廓。
 */
interface RiderIconProps {
  className?: string;
}

export default function RiderIcon({ className = '' }: RiderIconProps) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* 馬：身體與後腿 */}
      <path
        d="M25 130 Q25 100 35 85 Q45 72 55 75 L75 72 Q95 70 95 88 L92 105 Q90 118 78 125 L55 128 Q38 132 28 130 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 馬：前腿與胸 */}
      <path
        d="M55 75 L62 95 L60 118 L55 128 M75 72 L82 90 L85 112 L78 125"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 馬頭與頸 */}
      <path
        d="M95 88 Q108 82 112 92 Q115 100 108 108 L98 105"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 馬耳 */}
      <path d="M110 96 L112 88 M108 98 L110 90" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* 騎士：頭盔/頭 */}
      <ellipse cx="72" cy="58" rx="9" ry="11" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* 騎士：上身與手臂 */}
      <path
        d="M72 70 L72 95 M72 78 L58 92 M72 78 L86 92"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 騎士：持旗/杖 */}
      <path
        d="M86 92 L102 72 L106 76 L90 96"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 馬蹄 */}
      <path d="M55 128 L52 135 M60 128 L58 134 M78 125 L76 132 M85 112 L88 118" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
