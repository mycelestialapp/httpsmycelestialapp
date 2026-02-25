import { Slider } from '@/components/ui/slider';
import { useTranslation } from 'react-i18next';

interface TimeSliderProps {
  year: number;
  onChange: (year: number) => void;
  min?: number;
  max?: number;
}

const TimeSlider = ({ year, onChange, min = 2020, max = 2030 }: TimeSliderProps) => {
  const { t } = useTranslation();

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.6)', fontFamily: 'var(--font-sans)' }}>
          ✦ {t('oracle.timeSlider', { defaultValue: 'Fortune Timeline' })}
        </span>
        <span className="text-sm font-bold" style={{ color: 'hsl(var(--gold))', fontFamily: 'var(--font-serif)', textShadow: '0 0 10px hsla(var(--gold) / 0.4)' }}>
          {year}
        </span>
      </div>

      <div className="relative">
        <Slider
          value={[year]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={1}
          className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold [&_[role=slider]]:shadow-[0_0_12px_hsla(var(--gold)/0.5)] [&_[data-orientation=horizontal]>[data-orientation=horizontal]]:bg-gold"
        />

        {/* Year markers */}
        <div className="flex justify-between mt-1.5 px-0.5">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(y => (
            <span
              key={y}
              className="text-[8px]"
              style={{
                color: y === year ? 'hsl(var(--gold))' : 'hsla(var(--muted-foreground) / 0.4)',
                fontFamily: 'var(--font-sans)',
                fontWeight: y === year ? 700 : 400,
              }}
            >
              {y % 2 === 0 ? y.toString().slice(-2) : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;
