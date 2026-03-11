import { useMemo } from "react";

/** 示意圖同款：抽象星座線（金色連線），增加層次與質感 */
const ConstellationOverlay = () => (
  <svg
    className="starfield-constellation"
    viewBox="0 0 400 800"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden
  >
    {/* 抽象星座連線，多組不規則折線；描色由 CSS .starfield-constellation 設定 */}
    <path d="M 40 80 L 95 60 L 160 100 L 130 180 L 70 220" fill="none" stroke="currentColor" strokeWidth="0.6" />
    <path d="M 240 120 L 300 90 L 360 150 L 320 240" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <path d="M 80 320 L 150 280 L 220 340 L 180 420 L 100 400" fill="none" stroke="currentColor" strokeWidth="0.55" />
    <path d="M 260 380 L 330 350 L 370 430 L 340 520" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <path d="M 50 520 L 120 480 L 200 540 L 160 620" fill="none" stroke="currentColor" strokeWidth="0.55" />
    <path d="M 280 580 L 350 550 L 380 640 L 300 700" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <path d="M 180 680 L 250 640 L 310 700" fill="none" stroke="currentColor" strokeWidth="0.5" />
  </svg>
);

const Starfield = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 280 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2.2 + 0.6,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 3}s`,
      isGold: Math.random() < 0.2,
      sparkle: Math.random() < 0.25,
    }));
  }, []);

  return (
    <div className="starfield">
      {/* 星雲層：更強的遠處星塵/霧感 */}
      <div className="starfield-nebula" aria-hidden />
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${star.sparkle ? 'star--sparkle' : ''}`}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background: star.isGold ? 'hsl(var(--gold))' : 'white',
            color: star.isGold ? 'hsl(var(--gold))' : 'rgba(255,255,255,0.9)',
            "--duration": star.duration,
            animationDelay: star.delay,
          } as React.CSSProperties}
        />
      ))}
      <ConstellationOverlay />
    </div>
  );
};

export default Starfield;
