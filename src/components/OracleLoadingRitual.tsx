import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface OracleLoadingRitualProps {
  toolKey: string;
  onComplete: () => void;
}

const loadingSteps: Record<string, string[]> = {
  bazi: ['调取八字命理星盘...', '同步天干地支排列...', '读取四柱能量场...'],
  ziwei: ['启动紫微斗数天盘...', '定位主星副星位置...', '解析十二宫位能量...'],
  qimen: ['构建奇门遁甲九宫...', '排列三奇六仪...', '读取时空能量矩阵...'],
  liuren: ['启动大六壬神课...', '推算天地人三传...', '解析贵神吉凶...'],
  xiaoliuren: ['起卦小六壬...', '推演大安留连...', '断定吉凶方位...'],
  liuyao: ['起卦六爻...', '排卦世应...', '解析爻象吉凶...'],
  xuankong: ['构建玄空飞星盘...', '排列九宫飞星...', '解析山向能量...'],
  tarot: ['Shuffling the Major Arcana...', 'Drawing the Celtic Cross...', 'Reading archetypal energies...'],
  oracle: ['Opening the oracle deck...', 'Aligning with your question...', 'Drawing soul guidance...'],
  lenormand: ['Laying the Lenormand tableau...', 'Connecting symbols to your path...', 'Reading the story...'],
  astrology: ['Mapping natal chart positions...', 'Calculating planetary transits...', 'Reading stellar alignments...'],
  meihua: ['起卦梅花易数...', '推算体用关系...', '解析卦象吉凶...'],
};


const OracleLoadingRitual = ({ toolKey, onComplete }: OracleLoadingRitualProps) => {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  // 神谕卡/塔罗/雷诺曼等西方占卜用西方步骤；未知 key 用中性步骤，不落回八字避免东方术数与西方体系冲突
  const steps = loadingSteps[toolKey] || loadingSteps.tarot;

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => onCompleteRef.current(), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-16 gap-8"
    >
      {/* 3D Golden Compass */}
      <div className="relative w-32 h-32">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid hsl(var(--gold))',
            boxShadow: '0 0 30px hsla(var(--gold) / 0.3), inset 0 0 20px hsla(var(--gold) / 0.1)',
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{
            border: '1px solid hsla(var(--gold) / 0.5)',
            boxShadow: '0 0 15px hsla(var(--gold) / 0.15)',
          }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
        />
        {/* Inner ring */}
        <motion.div
          className="absolute inset-6 rounded-full"
          style={{
            border: '1px solid hsla(var(--gold) / 0.3)',
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        />

        {/* Compass needles */}
        {[0, 45, 90, 135].map((deg) => (
          <motion.div
            key={deg}
            className="absolute top-1/2 left-1/2 origin-center"
            style={{
              width: 1,
              height: 40,
              background: `linear-gradient(to bottom, hsl(var(--gold)), transparent)`,
              transform: `translate(-50%, -100%) rotate(${deg}deg)`,
              transformOrigin: 'bottom center',
            }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, delay: deg * 0.01 }}
          />
        ))}

        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'hsl(var(--gold))',
            boxShadow: '0 0 20px hsl(var(--gold)), 0 0 40px hsla(var(--gold) / 0.5)',
          }}
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />

        {/* Cardinal markers */}
        {['N', 'E', 'S', 'W'].map((dir, i) => {
          const angle = (i * 90 - 90) * (Math.PI / 180);
          const r = 60;
          return (
            <span
              key={dir}
              className="absolute text-[10px] font-bold"
              style={{
                color: 'hsl(var(--gold))',
                left: `calc(50% + ${Math.cos(angle) * r}px)`,
                top: `calc(50% + ${Math.sin(angle) * r}px)`,
                transform: 'translate(-50%, -50%)',
                textShadow: '0 0 8px hsla(var(--gold) / 0.5)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {dir}
            </span>
          );
        })}
      </div>

      {/* Loading steps text（不用 AnimatePresence 避免 insertBefore） */}
      <div className="text-center space-y-3">
        <p
          key={stepIndex}
          className="text-sm"
          style={{ color: 'hsl(var(--gold))', fontFamily: 'var(--font-serif)', textShadow: '0 0 12px hsla(var(--gold) / 0.4)' }}
        >
          {steps[stepIndex]}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: i <= stepIndex ? 'hsl(var(--gold))' : 'hsla(var(--gold) / 0.2)',
                boxShadow: i <= stepIndex ? '0 0 8px hsl(var(--gold))' : 'none',
              }}
              animate={i === stepIndex ? { scale: [1, 1.4, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default OracleLoadingRitual;
