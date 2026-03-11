import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Sun, CalendarDays, CalendarRange } from 'lucide-react';
import { getDailyTipIndex, getWeekOfYear, getWeeklyContentIndex, getMonthlyContentIndex } from '@/lib/rhythmContent';

const CURRENT_YEAR = new Date().getFullYear();
/** 方案 A：只顯示到當前年，未到的年份不展示 */
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

type RhythmTab = 'daily' | 'weekly' | 'monthly';

const RhythmPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = ((searchParams.get('tab') as RhythmTab) || 'daily');
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

  const today = useMemo(() => new Date(), []);
  const dailyTipIdx = useMemo(() => getDailyTipIndex(today), [today]);
  const weekNum = useMemo(() => getWeekOfYear(today), [today]);
  const weeklyIdx = useMemo(() => getWeeklyContentIndex(today), [today]);
  const monthlyIdx = useMemo(() => getMonthlyContentIndex(today), [today]);

  const setTabAndUrl = (v: RhythmTab) => setSearchParams({ tab: v }, { replace: true });

  /** 年度主題按年份取不同套文案（5 套輪替：selectedYear % 5 → 1～5） */
  const yearVariant = ((selectedYear % 5) + 5) % 5 || 5;
  const themeCard = {
    keyword: t(`rhythm.yearKeyword${yearVariant}`, { defaultValue: t('rhythm.yearKeyword', '整頓基礎 · Build Foundations') }),
    summary: t(`rhythm.yearSummary${yearVariant}`, { defaultValue: t('rhythm.yearSummary', '這一年宇宙在推著你調整節奏、整理結構。') }),
    work: t(`rhythm.yearWork${yearVariant}`, { defaultValue: t('rhythm.yearWork', '不急著往上爬，優先做「打牢地基」的事。') }),
    love: t(`rhythm.yearLove${yearVariant}`, { defaultValue: t('rhythm.yearLove', '不宜閃婚快合，更重視日常相處是否舒服。') }),
    self: t(`rhythm.yearSelf${yearVariant}`, { defaultValue: t('rhythm.yearSelf', '學會體面地說「不」，對無效消耗喊停。') }),
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition pb-8">
      <div className="text-center space-y-1">
        <h1
          className="text-xl font-bold tracking-[0.2em]"
          style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}
        >
          {t('rhythm.title', { defaultValue: '節奏' })}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t('rhythm.subtitle', { defaultValue: '日運 · 周運 · 月運與年度主題' })}
        </p>
      </div>

      {/* 日 / 周 / 月 Tab */}
      <div className="flex gap-2 rounded-xl p-1 border border-border/50 bg-muted/30">
        {[
          { key: 'daily' as const, label: t('rhythm.tabDaily', { defaultValue: '日運' }), icon: Sun },
          { key: 'weekly' as const, label: t('rhythm.tabWeekly', { defaultValue: '周運' }), icon: CalendarDays },
          { key: 'monthly' as const, label: t('rhythm.tabMonthly', { defaultValue: '月運' }), icon: CalendarRange },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTabAndUrl(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-gold-soft text-gold-strong border border-gold-strong/50' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* 日運：今日一句 + cosmicTip */}
      {tab === 'daily' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-highlight space-y-4"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            {t('rhythm.dailyTitle', { defaultValue: '今日運勢' })}
          </span>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {t(`oracle.cosmicTip${dailyTipIdx}`, { defaultValue: t('oracle.cosmicTip1') })}
          </p>
        </motion.div>
      )}

      {/* 周運 */}
      {tab === 'weekly' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-highlight space-y-4"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            {t('rhythm.weeklyTitle', { defaultValue: '本週主題' })} · {today.getFullYear()} {t('rhythm.week', { defaultValue: '第' })} {weekNum} {t('rhythm.weekUnit', { defaultValue: '周' })}
          </span>
          <p className="text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
            {t(`rhythm.weeklyKeyword${weeklyIdx}`, { defaultValue: t('rhythm.weeklyKeyword', '穩步前行 · 少即是多') })}
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {t(`rhythm.weeklySummary${weeklyIdx}`, { defaultValue: t('rhythm.weeklySummary', '本週適合把精力放在已開始的事上，不貪多；人際上多傾聽，少下結論。') })}
          </p>
        </motion.div>
      )}

      {/* 月運 */}
      {tab === 'monthly' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-highlight space-y-4"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            {t('rhythm.monthlyTitle', { defaultValue: '本月重點' })} · {today.getFullYear()} {monthlyIdx} {t('rhythm.monthUnit', { defaultValue: '月' })}
          </span>
          <p className="text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
            {t(`rhythm.monthlyKeyword${monthlyIdx}`, { defaultValue: t('rhythm.monthlyKeyword', '定錨與發芽') })}
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {t(`rhythm.monthlySummary${monthlyIdx}`, { defaultValue: t('rhythm.monthlySummary', '本月宇宙在推你整理節奏、打好地基。工作宜補齊基礎，感情宜看清相處節奏，自己宜建立邊界。') })}
          </p>
        </motion.div>
      )}

      {/* Year timeline + 年度主題（與原邏輯一致） */}
      <div className="space-y-2">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">{t('rhythm.timeAxis', { defaultValue: '時間軸' })}</p>
        <div className="flex gap-2 overflow-x-auto pb-2 min-w-0">
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`shrink-0 px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                selectedYear === y
                  ? 'border-gold-strong text-gold-strong bg-gold-soft'
                  : 'border-border/60 text-muted-foreground hover:border-gold-strong/50'
              }`}
            >
              <Calendar size={14} />
              <span className="text-sm font-semibold">{y}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={selectedYear}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-highlight space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            {selectedYear} {t('rhythm.yearTheme', { defaultValue: '年度主題' })}
          </span>
          <button className="text-xs text-gold-strong flex items-center gap-0.5" onClick={() => {}}>
            {t('rhythm.saveShareCard', { defaultValue: '保存分享卡' })} <ChevronRight size={12} />
          </button>
        </div>
        <p className="text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
          {themeCard.keyword}
        </p>
        <p className="text-sm text-foreground/90 leading-relaxed">{themeCard.summary}</p>
        <div className="grid grid-cols-1 gap-3 pt-2">
          <div className="rounded-lg border border-border/50 px-3 py-2">
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">{t('rhythm.work', { defaultValue: '工作' })}</p>
            <p className="text-sm text-foreground/90">{themeCard.work}</p>
          </div>
          <div className="rounded-lg border border-border/50 px-3 py-2">
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">{t('rhythm.love', { defaultValue: '感情' })}</p>
            <p className="text-sm text-foreground/90">{themeCard.love}</p>
          </div>
          <div className="rounded-lg border border-border/50 px-3 py-2">
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">{t('rhythm.self', { defaultValue: '自己' })}</p>
            <p className="text-sm text-foreground/90">{themeCard.self}</p>
          </div>
        </div>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">{t('rhythm.daYun', { defaultValue: '大運' })}</p>
        <p className="text-sm text-muted-foreground">
          {t('rhythm.daYunPlaceholder', { defaultValue: '完整十年大運時間軸與階段主題將在訂閱版中開放，敬請期待。' })}
        </p>
      </div>
    </div>
  );
};

export default RhythmPage;
