/**
 * 圣殿入口：首页黑金骑士 → 点击后平滑淡出放大，36 宫矩阵由中心向四周铺开。
 * 状态控制：isExplored = false 为首页入口，true 为矩阵视图。
 */
import { useCallback, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import BackgroundFluid from './BackgroundFluid';
import { BlackGoldRiderPortal } from './BlackGoldRiderPortal';
import { LenormandCard } from './LenormandCard';

interface HeroSectionProps {
  onStartRitual?: () => void;
  /** 進入矩陣視圖時回調，用於切換到選牌/解讀界面 */
  onRitualComplete?: () => void;
}

const CARD_COUNT = 36;
const CARD_W = 70;
const CARD_H = 100;
const GAP = 10;
// 点击「离开圣殿」后，整体淡出时长
const LEAVE_FADE_MS = 500;

export default function HeroSection({ onStartRitual, onRitualComplete }: HeroSectionProps) {
  const [isExplored, setIsExplored] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const hasCalledComplete = useRef(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExplore = useCallback(() => {
    if (isExplored) return;
    setIsExplored(true);
    onStartRitual?.();
  }, [isExplored, onStartRitual]);

  const handleLeave = useCallback(() => {
    if (isLeaving) return;
    setIsLeaving(true);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      leaveTimerRef.current = null;
      if (!hasCalledComplete.current && onRitualComplete) {
        hasCalledComplete.current = true;
        onRitualComplete();
      }
    }, LEAVE_FADE_MS);
  }, [isLeaving, onRitualComplete]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  return (
    <div
      className="hero-sanctum"
      style={{
        width: '100vw',
        height: '100vh',
        background: '#030305',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 1.5s, opacity 0.5s ease',
        opacity: isLeaving ? 0 : 1,
      }}
    >
      <style>{`
        .hero-sanctum { font-family: 'Baskerville', 'Georgia', serif; }
        .master-text { color: #D4AF37; letter-spacing: 0.3em; text-shadow: 0 0 10px rgba(212, 175, 55, 0.5); }
        .lenormand-card {
          width: 70px; height: 100px;
          background: #0a0a0a;
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          transition: all 0.4s ease;
        }
        .lenormand-card:hover {
          border-color: #D4AF37;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
          transform: translateY(-5px);
        }
        @keyframes cardSpreadIn {
          from { opacity: 0; transform: scale(0.4); }
          to { opacity: 1; transform: scale(1); }
        }
        .matrix-card-wrap {
          opacity: 0;
          animation: cardSpreadIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* 首页入口：点击后平滑淡出并放大 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isExplored ? 0 : 1,
          transform: isExplored ? 'scale(1.5)' : 'scale(1)',
          pointerEvents: isExplored ? 'none' : 'auto',
          transition: 'opacity 1s ease, transform 1s ease',
        }}
        onClick={handleExplore}
      >
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={['#030305']} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#D4AF37" />
          <pointLight position={[-10, -10, -10]} color="#ffffff" intensity={0.5} />

          <BackgroundFluid />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <BlackGoldRiderPortal onStart={handleExplore} />
          </Float>
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      {/* 36 宫矩阵：入场由中心铺开，常驻，用户主动点击按钮后淡出离场 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          opacity: isExplored ? 1 : 0,
          transform: isExplored ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 1s ease 0.25s, transform 1s ease 0.25s',
          pointerEvents: isExplored ? 'auto' : 'none',
        }}
      >
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(6, ${CARD_W}px)`,
              gap: GAP,
            }}
          >
            {Array.from({ length: CARD_COUNT }, (_, i) => (
              <div
                key={i}
                className="matrix-card-wrap"
                style={{
                  animationDelay: `${i * 32}ms`,
                }}
              >
                <LenormandCard index={i + 1} />
              </div>
            ))}
          </div>

          {/* 离场按钮：由用户确认后再切到解读页 */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleLeave}
              className="px-4 py-2 rounded-full text-xs font-medium tracking-[0.2em] uppercase"
              style={{
                border: '1px solid rgba(212, 175, 55, 0.7)',
                background:
                  'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.35), transparent 60%), rgba(5,5,8,0.95)',
                color: '#D4AF37',
                boxShadow: '0 0 18px rgba(212,175,55,0.35)',
                letterSpacing: '0.25em',
              }}
            >
              我已经看清今晚的讯息
            </button>
          </div>
        </div>
      </div>

      {/* 顶层文案：首页时显眼，进入矩阵后淡出以突出 36 宫 */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: isExplored ? 0 : 1,
          transition: 'opacity 0.8s ease',
        }}
      >
        <h1 className="master-text text-xl font-bold animate-pulse">TOUCH THE VOID</h1>
      </div>
    </div>
  );
}
