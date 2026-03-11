/**
 * 今日宜忌 · 月相（B+D）卡片
 * 依據當日月相與月亮星座顯示：今日適合、今日宜、今日忌。
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon } from 'lucide-react';
import { getDailyYijiMoon } from '@/lib/dailyYijiMoon';

const DailyYijiMoonCard = () => {
  const { t } = useTranslation();
  const content = useMemo(() => getDailyYijiMoon(new Date()), []);

  return (
    <div
      className="rounded-2xl p-4 space-y-4 border overflow-hidden"
      style={{
        background: 'hsla(var(--card) / 0.85)',
        borderColor: 'hsla(var(--gold) / 0.35)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      }}
    >
      {/* 月相 · 月在天蝎 */}
      <div className="flex items-center gap-2">
        <div
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'hsla(var(--gold) / 0.12)',
            border: '1px solid hsla(var(--gold) / 0.3)',
          }}
        >
          <Moon size={18} className="text-gold-strong" style={{ color: 'hsl(var(--gold))' }} />
        </div>
        <div>
          <p className="text-body font-semibold tracking-wide text-heading" style={{ color: 'hsl(var(--gold))', fontFamily: 'var(--font-serif)' }}>
            {content.phaseName} · 月在{content.moonSignName}
          </p>
          <p className="text-body-sm text-subtitle tracking-wider">
            {t('oracle.yijiByMoon', { defaultValue: '依當日月相與月亮星座' })}
          </p>
        </div>
      </div>

      {/* 今日適合 */}
      <div className="space-y-1">
        <p className="text-body-sm font-medium tracking-widest uppercase text-subtitle">
          {t('oracle.todaySuitable', { defaultValue: '今日適合' })}
        </p>
        <p className="text-body leading-relaxed text-body">
          {content.suitable}
        </p>
      </div>

      {/* 今日幸運色 */}
      <div className="flex items-center gap-3">
        <p className="text-body-sm font-medium tracking-widest uppercase text-subtitle shrink-0">
          {t('oracle.luckyColor', { defaultValue: '今日幸運色' })}
        </p>
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="shrink-0 w-6 h-6 rounded-full border border-white/20"
            style={{ backgroundColor: content.luckyColor.hex }}
            aria-hidden
          />
          <span className="text-body font-medium text-body truncate">
            {content.luckyColor.name}
          </span>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* 今日宜 / 今日忌 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <p className="text-body-sm font-medium tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.9)' }}>
            {t('oracle.todayYi', { defaultValue: '今日宜' })}
          </p>
          <ul className="space-y-0.5">
            {content.yi.map((item, i) => (
              <li key={i} className="text-body-sm text-body flex items-center gap-1.5">
                <span className="text-gold-strong/80">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-1.5">
          <p className="text-body-sm font-medium tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.9)' }}>
            {t('oracle.todayJi', { defaultValue: '今日忌' })}
          </p>
          <ul className="space-y-0.5">
            {content.ji.map((item, i) => (
              <li key={i} className="text-body-sm text-body flex items-center gap-1.5">
                <span className="opacity-70">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DailyYijiMoonCard;
