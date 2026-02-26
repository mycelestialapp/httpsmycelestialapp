import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import type { DivinationInfo } from "./InputCard";
import type { BaziApiResult } from "@/lib/baziApi";
import { isToolUnlocked } from "@/lib/oracleModuleContent";
import BaziChartImage from "./BaziChartImage";

interface ResultCardProps {
  info: DivinationInfo;
  baziResult?: BaziApiResult | null;
  baziError?: string | null;
  onReset: () => void;
}

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const ResultCard = ({ info, baziResult, baziError, onReset }: ResultCardProps) => {
  const { t } = useTranslation();
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const hasBazi = baziResult?.pillars && (baziResult.pillars.year || baziResult.pillars.month || baziResult.pillars.day || baziResult.pillars.hour);
  const premiumUnlock = isToolUnlocked('bazi');

  const handleExportChart = async () => {
    if (!exportRef.current || !baziResult) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 3,
        backgroundColor: '#1a0b2e',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `天机命盘_${info.name || '命盘'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // fallback: could toast
    } finally {
      setExporting(false);
    }
  };

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
  const wuxingLabels: Record<string, string> = {
    wood: t('oracle.wood'),
    fire: t('oracle.fire'),
    earth: t('oracle.earth'),
    metal: t('oracle.metal'),
    water: t('oracle.water'),
  };

  return (
    <div className="animate-fade-in flex flex-col items-center gap-5">
      {/* 导出用长图（离屏渲染，供 html2canvas 捕获） */}
      {hasBazi && (
        <div
          ref={exportRef}
          className="absolute left-[-9999px] top-0 w-[375px]"
          style={{ zIndex: -1 }}
          aria-hidden
        >
          <BaziChartImage
            info={info}
            baziResult={baziResult!}
            premium={premiumUnlock}
            showQrCaption
          />
        </div>
      )}

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

        {baziError && (
          <div className="my-3 px-3 py-2 rounded-lg text-sm border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {baziError}
          </div>
        )}

        {hasBazi && (
          <div className="my-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary text-sm">☰</span>
              <span className="text-xs tracking-widest font-bold input-label">{t('divination.baziPillars', { defaultValue: '四柱' })}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['year', 'month', 'day', 'hour'] as const).map((key) => (
                <div key={key} className="stat-cell text-center">
                  <span className="stat-label block text-[10px]">{t(`divination.pillar${key.charAt(0).toUpperCase() + key.slice(1)}`, { defaultValue: key === 'year' ? '年柱' : key === 'month' ? '月柱' : key === 'day' ? '日柱' : '时柱' })}</span>
                  <span className="stat-value text-gold-glow text-sm font-serif">{baziResult!.pillars[key] || '—'}</span>
                </div>
              ))}
            </div>
            {(baziResult!.dayMaster || baziResult!.xiyongshen) && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {baziResult!.dayMaster && (
                  <div className="stat-cell">
                    <span className="stat-label">{t('divination.dayMaster', { defaultValue: '日主' })}</span>
                    <span className="stat-value text-gold-glow text-sm">{baziResult!.dayMaster}</span>
                  </div>
                )}
                {baziResult!.xiyongshen && (
                  <div className="stat-cell">
                    <span className="stat-label">{t('divination.xiyongshen', { defaultValue: '喜用神' })}</span>
                    <span className="stat-value text-sm" style={{ color: 'hsl(var(--accent))' }}>{baziResult!.xiyongshen}</span>
                  </div>
                )}
              </div>
            )}
            {baziResult!.wuxing && Object.keys(baziResult!.wuxing).length > 0 && (
              <div className="mt-2">
                <span className="stat-label block mb-1">{t('divination.fiveElements')}</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(baziResult!.wuxing).map(([k, v]) => (
                    <span key={k} className="yi-tag text-xs">
                      {wuxingLabels[k] || k}: {typeof v === 'number' ? v : String(v)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {baziResult!.summary && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <span className="stat-label block mb-1">{t('divination.baziSummary', { defaultValue: '命理解读' })}</span>
                <p className="text-foreground text-sm leading-relaxed">{baziResult!.summary}</p>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-3 italic">
              {t('divination.baziDisclaimer', { defaultValue: '命理结果仅供参考，请勿迷信。' })}
            </p>
            <button
              type="button"
              onClick={handleExportChart}
              disabled={exporting}
              className="w-full mt-4 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, hsla(var(--gold) / 0.35), hsla(var(--accent) / 0.25))',
                border: '1px solid hsla(var(--gold) / 0.5)',
                color: 'hsl(var(--gold))',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {exporting ? t('divination.exporting', { defaultValue: '生成中…' }) : t('divination.exportChart', { defaultValue: '一键导出高清命盘' })}
            </button>
            {!premiumUnlock && (
              <p className="text-[10px] text-muted-foreground mt-2">
                {t('divination.exportHint', { defaultValue: '解锁深度版可导出含流年详批与财富等级的长图' })}
              </p>
            )}
          </div>
        )}

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
