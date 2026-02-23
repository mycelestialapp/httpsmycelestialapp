import { useTranslation } from 'react-i18next';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';

const EnergyRadar = () => {
  const { t } = useTranslation();

  const data = useMemo(() => [
    { element: t('oracle.wood'), value: Math.floor(Math.random() * 40) + 60 },
    { element: t('oracle.fire'), value: Math.floor(Math.random() * 40) + 60 },
    { element: t('oracle.earth'), value: Math.floor(Math.random() * 40) + 60 },
    { element: t('oracle.metal'), value: Math.floor(Math.random() * 40) + 60 },
    { element: t('oracle.water'), value: Math.floor(Math.random() * 40) + 60 },
  ], [t]);

  return (
    <div className="glass-card-highlight">
      <h3 className="text-center text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: 'hsla(var(--gold) / 0.7)', fontFamily: 'var(--font-sans)' }}>
        {t('oracle.energyRadar')}
      </h3>
      <div className="w-full" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="hsla(43, 72%, 52%, 0.12)" />
            <PolarAngleAxis
              dataKey="element"
              tick={{ fill: 'hsla(43, 72%, 52%, 0.7)', fontSize: 12, fontFamily: 'var(--font-serif)' }}
            />
            <Radar
              dataKey="value"
              stroke="hsla(43, 72%, 52%, 0.8)"
              fill="hsla(43, 72%, 52%, 0.15)"
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyRadar;
