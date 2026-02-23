import { useTranslation } from 'react-i18next';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect, useRef } from 'react';
import type { ElementEnergy } from '@/lib/fiveElements';

interface EnergyRadarProps {
  energy?: ElementEnergy | null;
  insight?: string;
  onRequestReading?: () => void;
}

const EnergyRadar = ({ energy, insight, onRequestReading }: EnergyRadarProps) => {
  const { t } = useTranslation();
  const [animatedEnergy, setAnimatedEnergy] = useState<ElementEnergy | null>(null);
  const [glowing, setGlowing] = useState(false);
  const prevEnergy = useRef<ElementEnergy | null>(null);

  // Default random values when no profile
  const defaultEnergy: ElementEnergy = {
    wood: 55, fire: 55, earth: 55, metal: 55, water: 55,
  };

  const targetEnergy = energy || defaultEnergy;

  // Animate values when energy changes
  useEffect(() => {
    if (energy && energy !== prevEnergy.current) {
      setGlowing(true);
      prevEnergy.current = energy;

      // Animate from 0 to target
      const steps = 30;
      const duration = 1200;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        setAnimatedEnergy({
          wood: Math.round(energy.wood * eased),
          fire: Math.round(energy.fire * eased),
          earth: Math.round(energy.earth * eased),
          metal: Math.round(energy.metal * eased),
          water: Math.round(energy.water * eased),
        });

        if (step >= steps) {
          clearInterval(timer);
          setTimeout(() => setGlowing(false), 800);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [energy]);

  const currentEnergy = animatedEnergy || (energy ? energy : defaultEnergy);

  const data = [
    { element: t('oracle.wood'), value: currentEnergy.wood, fullMark: 100 },
    { element: t('oracle.fire'), value: currentEnergy.fire, fullMark: 100 },
    { element: t('oracle.earth'), value: currentEnergy.earth, fullMark: 100 },
    { element: t('oracle.metal'), value: currentEnergy.metal, fullMark: 100 },
    { element: t('oracle.water'), value: currentEnergy.water, fullMark: 100 },
  ];

  return (
    <div
      className={`glass-card-highlight transition-all duration-700 ${glowing ? 'radar-glow-active' : ''}`}
    >
      <h3
        className="text-center text-sm font-semibold tracking-widest uppercase mb-1"
        style={{ color: 'hsla(var(--gold) / 0.7)', fontFamily: 'var(--font-sans)' }}
      >
        {t('oracle.energyRadar')}
      </h3>

      {!energy && (
        <p className="text-center text-xs text-muted-foreground mb-2">
          {t('oracle.radarHint')}
        </p>
      )}

      <div className="w-full" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="hsla(43, 72%, 52%, 0.1)" />
            <PolarAngleAxis
              dataKey="element"
              tick={{ fill: 'hsla(43, 72%, 52%, 0.7)', fontSize: 12, fontFamily: 'var(--font-serif)' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="value"
              stroke={glowing ? 'hsla(43, 85%, 60%, 1)' : 'hsla(43, 72%, 52%, 0.8)'}
              fill={glowing ? 'hsla(43, 85%, 60%, 0.25)' : 'hsla(43, 72%, 52%, 0.12)'}
              strokeWidth={glowing ? 2.5 : 1.5}
              animationDuration={800}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Celestial Insight */}
      {insight && (
        <div className="mt-3 px-2 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: 'hsl(var(--gold))' }}>✦</span>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.6)', fontFamily: 'var(--font-sans)' }}>
              {t('oracle.insightTitle')}
            </span>
            <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, hsla(var(--gold) / 0.3), transparent)' }} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "{insight}"
          </p>
        </div>
      )}

      {/* CTA button when no reading yet */}
      {!energy && onRequestReading && (
        <button
          onClick={onRequestReading}
          className="mt-4 w-full py-3 rounded-xl text-sm font-semibold tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, hsla(var(--gold) / 0.15), hsla(var(--accent) / 0.1))',
            border: '1px solid hsla(var(--gold) / 0.25)',
            color: 'hsl(var(--gold))',
            fontFamily: 'var(--font-serif)',
          }}
        >
          ✦ {t('oracle.startReading')} ✦
        </button>
      )}
    </div>
  );
};

export default EnergyRadar;
