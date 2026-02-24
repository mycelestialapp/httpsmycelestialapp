import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { DivinationInfo } from "./InputCard";

interface ResultCardProps {
  info: DivinationInfo;
  onReset: () => void;
}

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const ResultCard = ({ info, onReset }: ResultCardProps) => {
  const { t } = useTranslation();

  // All content via i18n keys
  const fortuneKeys = Array.from({ length: 10 }, (_, i) => `divination.fortune${i + 1}`);
  const luckKeys = [
    { key: 'divination.luck.greatLuck', color: 'gold' },
    { key: 'divination.luck.mediumLuck', color: 'gold' },
    { key: 'divination.luck.smallLuck', color: 'gold' },
    { key: 'divination.luck.luck', color: 'gold' },
    { key: 'divination.luck.lateLuck', color: 'purple' },
    { key: 'divination.luck.reverseLuck', color: 'purple' },
  ];
  const yiKeys = Array.from({ length: 14 }, (_, i) => `divination.yi${i + 1}`);
  const jiKeys = Array.from({ length: 12 }, (_, i) => `divination.ji${i + 1}`);
  const elementKeys = ['oracle.metal', 'oracle.wood', 'oracle.water', 'oracle.fire', 'oracle.earth'];
  const starKeys = Array.from({ length: 14 }, (_, i) => `divination.star${i + 1}`);

  const result = useMemo(() => ({
    fortuneKey: fortuneKeys[Math.floor(Math.random() * fortuneKeys.length)],
    luck: luckKeys[Math.floor(Math.random() * luckKeys.length)],
    good: pick(yiKeys, 4),
    bad: pick(jiKeys, 4),
    elementKey: elementKeys[Math.floor(Math.random() * elementKeys.length)],
    starKey: starKeys[Math.floor(Math.random() * starKeys.length)],
    score: Math.floor(Math.random() * 30) + 70,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const birthStr = `${info.year}-${info.month}-${info.day}`;

  return (
    <div className="animate-fade-in flex flex-col items-center gap-5">
      <div className="relative text-center">
        <div className="absolute -inset-10 rounded-full blur-3xl" style={{ background: 'hsla(var(--accent) / 0.05)' }} />
        <div className="relative">
          <div className="text-xs tracking-[0.5em] mb-2" style={{ color: 'hsl(var(--accent))' }}>
            ━━ {t('divination.result').toUpperCase()} ━━
          </div>
          <h2 className="text-3xl font-bold tracking-widest text-gold-glow" style={{ fontFamily: 'var(--font-serif)' }}>
            ◈ {t('divination.heavenlyMessage')} ◈
          </h2>
        </div>
      </div>

      {/* Profile */}
      <div className="glass-card w-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full orb-button flex-shrink-0 flex items-center justify-center text-xl text-gold-glow font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
            {info.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-foreground truncate">{info.name}</p>
            <p className="text-xs text-muted-foreground">{birthStr} {info.hour && `· ${info.hour.split(" ")[0]}`}</p>
            <p className="text-xs text-muted-foreground">
              {info.region && `${info.region} · `}{info.useSolarTime ? t('divination.solarTime') : t('divination.standardTime')}
            </p>
          </div>
        </div>

        <div className="flex justify-center my-4">
          <div className={`luck-badge ${result.luck.color === "gold" ? "luck-gold" : "luck-purple"}`}>
            <span className="text-3xl font-bold tracking-widest" style={{ fontFamily: 'var(--font-serif)' }}>{t(result.luck.key)}</span>
            <span className="text-xs mt-1 opacity-80">{t(result.luck.key + 'Desc')}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="stat-cell">
            <span className="stat-label">{t('divination.fateStar')}</span>
            <span className="stat-value text-gold-glow">{t(result.starKey)}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">{t('divination.fiveElements')}</span>
            <span className="stat-value" style={{ color: 'hsl(var(--accent))' }}>{t(result.elementKey)}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">{t('divination.fortuneScore')}</span>
            <span className="stat-value text-gold-glow">{result.score}</span>
          </div>
        </div>
      </div>

      {/* Fortune */}
      <div className="glass-card w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-primary">✦</span>
          <span className="text-xs tracking-[0.3em] font-bold input-label">{t('divination.heavenlyMessage')}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
        </div>
        <p className="text-foreground leading-relaxed text-center text-sm sm:text-base py-2">
          「{t(result.fortuneKey)}」
        </p>
      </div>

      {/* Yi & Ji */}
      <div className="glass-card w-full">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-primary">▸</span>
              <span className="text-xs tracking-[0.3em] font-bold input-label">{t('divination.suitable')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.good.map((key) => <span key={key} className="yi-tag">{t(key)}</span>)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: 'hsl(var(--accent))' }}>▸</span>
              <span className="text-xs tracking-[0.3em] font-bold" style={{ color: 'hsla(var(--accent) / 0.7)' }}>{t('divination.avoid')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.bad.map((key) => <span key={key} className="ji-tag">{t(key)}</span>)}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="glass-card px-8 py-3 text-sm tracking-widest hover:scale-105 transition-transform cursor-pointer mt-2 mb-4"
        style={{ color: 'hsl(var(--accent))' }}
      >
        ◈ {t('divination.again')} ◈
      </button>
    </div>
  );
};

export default ResultCard;
