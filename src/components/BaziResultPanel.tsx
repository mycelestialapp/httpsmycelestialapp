/**
 * 专业八字排盘结果面板 · 超越主流 App 的界面与功能
 * 四柱命盘 · 十神藏干纳音 · 日主喜忌 · 五行能量 · 大运 · 解读 · 导出
 */
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import type { BaziApiResult } from '@/lib/baziLocal';
import { getCharColor } from '@/lib/baziWuxingColors';
import { WUXING_COLORS } from '@/lib/baziWuxingColors';

export interface BaziResultPanelProps {
  birthLabel: string;  // e.g. "2000年1月15日 午时"
  useSolarTime?: boolean;
  baziResult: BaziApiResult;
  reading?: string;
  onExport?: () => void;
  exporting?: boolean;
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

const PILLAR_KEYS = ['year', 'month', 'day', 'hour'] as const;
const PILLAR_LABELS = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' };
const WUXING_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
const WUXING_ICON: Record<string, string> = {
  wood: '🌳',
  fire: '🔥',
  earth: '⛰️',
  metal: '⚔️',
  water: '💧',
};

export default function BaziResultPanel({
  birthLabel,
  useSolarTime,
  baziResult,
  reading,
  onExport,
  exporting,
  exportRef,
}: BaziResultPanelProps) {
  const { t } = useTranslation();
  const p = baziResult.pillars;
  const wuxing = baziResult.wuxing || {};
  const wuxingLabels: Record<string, string> = {
    wood: t('oracle.wood'),
    fire: t('oracle.fire'),
    earth: t('oracle.earth'),
    metal: t('oracle.metal'),
    water: t('oracle.water'),
  };

  const renderVerticalShensha = () => {
    if (!baziResult.shensha || baziResult.shensha.length === 0) return '—';
    return (
      <div className="flex flex-col items-center gap-1 leading-tight">
        {baziResult.shensha.map((name) => (
          <div key={name} className="whitespace-nowrap">
            {name}
          </div>
        ))}
      </div>
    );
  };

  const renderReading = (text?: string) => {
    if (!text) return null;
    const lines = text.split(/\n+/).filter((line) => line.trim().length > 0);
    // 过滤掉总说明性前言（如“八字命盘综合解读”“本解读综合参考了…”）
    const filtered = lines.filter((line) => {
      const t = line.trim();
      if (!t) return false;
      if (t.startsWith('八字命盘综合解读')) return false;
      if (t.startsWith('本解读综合参考了')) return false;
      return true;
    });
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {filtered.map((line, idx) => {
          const t = line.trim();
          const isSectionTitle = /^一、|^二、|^三、|^四、|^五、|^六、|^七、/.test(t);
          const isBlockTitle = /^【[^】]+】\s*$/.test(t);
          if (isSectionTitle || isBlockTitle) {
            return (
              <div
                key={idx}
                className={`pt-1 font-semibold ${isSectionTitle ? 'pt-3' : 'pt-2'} bazi-reading-title`}
                style={{
                  color: '#e6c200',
                  fontFamily: 'var(--font-serif)',
                  textShadow: '0 0 12px rgba(230,194,0,0.35)',
                  WebkitTextFillColor: '#e6c200',
                }}
              >
                {t}
              </div>
            );
          }
          return (
            <p key={idx} className="text-[#d4d4d4]" style={{ fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={exportRef}
      className="bazi-panel w-full max-w-2xl mx-auto space-y-6 p-4 md:p-6 rounded-3xl"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(230,194,0,0.06) 0%, transparent 50%), rgba(13,6,24,0.4)',
        border: '1px solid rgba(230,194,0,0.15)',
      }}
    >
      {/* 顶部：标题 + 生辰 */}
      <div className="text-center space-y-1">
        <h2
          className="text-xl font-bold tracking-[0.35em]"
          style={{ fontFamily: 'var(--font-serif)', color: '#e6c200', textShadow: '0 0 20px rgba(230,194,0,0.3)' }}
        >
          八字命盘
        </h2>
        <p className="text-sm text-muted-foreground">{birthLabel}</p>
        {useSolarTime && (
          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full border border-amber-500/50 text-amber-400/90 bg-amber-500/10">
            真太阳时
          </span>
        )}
      </div>

      {/* 核心：四柱命盘表（对齐主流专业排盘样式） */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0d0618 0%, #120a1f 100%)',
          border: '2px solid #e6c200',
          boxShadow: '0 0 30px rgba(230,194,0,0.15), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        <table className="w-full text-center text-xs md:text-sm border-collapse">
          <thead>
            <tr>
              <th className="w-16 bg-black/20 border-b border-amber-500/30 text-[11px] md:text-xs text-amber-100/90">
                日期
              </th>
              {PILLAR_KEYS.map((key) => (
                <th
                  key={key}
                  className="py-3 bg-black/20 border-b border-amber-500/30"
                  style={{ color: '#f8e7ab', fontFamily: 'var(--font-serif)' }}
                >
                  {PILLAR_LABELS[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 六亲：十神在六亲中的对应（年祖上/月父母兄弟/日自身配偶/时子女） */}
            <tr>
              <td className="py-2 px-2 text-[11px] md:text-xs text-amber-200/90 border-b border-amber-500/20">六亲</td>
              {PILLAR_KEYS.map((key) => (
                <td
                  key={key}
                  className="py-2 border-b border-amber-500/20 text-[11px] md:text-xs"
                  style={{ color: '#f0c6ff' }}
                >
                  {baziResult.shishenPerPillar?.[key] ?? '—'}
                </td>
              ))}
            </tr>
            {/* 天干 */}
            <tr>
              <td className="py-3 px-2 text-[11px] md:text-xs text-amber-200/90 border-b border-amber-500/20">天干</td>
              {PILLAR_KEYS.map((key) => {
                const value = p[key] || '—';
                const stem = value.length >= 2 ? value[0] : value;
                return (
                  <td key={key} className="py-3 border-b border-amber-500/20">
                    <span
                      className="text-xl md:text-2xl font-bold font-serif"
                      style={{ color: getCharColor(stem), textShadow: `0 0 10px ${getCharColor(stem)}55` }}
                    >
                      {stem || '—'}
                    </span>
                  </td>
                );
              })}
            </tr>
            {/* 地支 */}
            <tr>
              <td className="py-3 px-2 text-[11px] md:text-xs text-amber-200/90 border-b border-amber-500/20">地支</td>
              {PILLAR_KEYS.map((key) => {
                const value = p[key] || '—';
                const branch = value.length >= 2 ? value[1] : value;
                return (
                  <td key={key} className="py-3 border-b border-amber-500/20">
                    <span
                      className="text-xl md:text-2xl font-bold font-serif"
                      style={{ color: getCharColor(branch), textShadow: `0 0 10px ${getCharColor(branch)}55` }}
                    >
                      {branch || '—'}
                    </span>
                  </td>
                );
              })}
            </tr>
            {/* 藏干 */}
            <tr>
              <td className="py-2 px-2 text-[11px] md:text-xs text-amber-200/90 border-b border-amber-500/15">藏干</td>
              {PILLAR_KEYS.map((key) => (
                <td key={key} className="py-2 border-b border-amber-500/15 text-[11px] md:text-xs" style={{ color: '#d8d8d8' }}>
                  {baziResult.cangganPerPillar?.[key] ?? '—'}
                </td>
              ))}
            </tr>
            {/* 副星：预留位置，后续接入更细的主/副星规则 */}
            <tr>
              <td className="py-2 px-2 text-[11px] md:text-xs text-amber-200/90 border-b border-amber-500/15">副星</td>
              {PILLAR_KEYS.map((key) => (
                <td key={key} className="py-2 border-b border-amber-500/15 text-[11px] md:text-xs" style={{ color: '#d8d8d8' }}>
                  —
                </td>
              ))}
            </tr>
            {/* 星运：预留位置 */}
            <tr>
              <td className="py-2 px-2 text-[11px] md:text-xs text-amber-200/90 border-b border-amber-500/15">星运</td>
              {PILLAR_KEYS.map((key) => (
                <td key={key} className="py-2 border-b border-amber-500/15 text-[11px] md:text-xs" style={{ color: '#d8d8d8' }}>
                  —
                </td>
              ))}
            </tr>
            {/* 自坐：预留位置 */}
            <tr>
              <td className="py-2 px-2 text-[11px] md:text-xs text-amber-200/90 border-b border-amber-500/15">自坐</td>
              {PILLAR_KEYS.map((key) => (
                <td key={key} className="py-2 border-b border-amber-500/15 text-[11px] md:text-xs" style={{ color: '#d8d8d8' }}>
                  —
                </td>
              ))}
            </tr>
            {/* 空亡：以日柱定旬，该柱地支在旬空内则显示「空」 */}
            <tr>
              <td className="py-2 px-2 text-[11px] md:text-xs text-amber-200/90 border-b border-amber-500/15">空亡</td>
              {PILLAR_KEYS.map((key) => (
                <td key={key} className="py-2 border-b border-amber-500/15 text-[11px] md:text-xs" style={{ color: '#d8d8d8' }}>
                  {baziResult.kongwangPerPillar?.[key] ?? '—'}
                </td>
              ))}
            </tr>
            {/* 纳音 */}
            <tr>
              <td className="py-2 px-2 text-[11px] md:text-xs text-amber-200/90 border-b border-amber-500/15">纳音</td>
              {PILLAR_KEYS.map((key) => (
                <td key={key} className="py-2 border-b border-amber-500/15 text-[11px] md:text-xs" style={{ color: '#e6e6e6' }}>
                  {baziResult.nayinPerPillar?.[key] ?? '—'}
                </td>
              ))}
            </tr>
            {/* 神煞：按柱显示该柱地支所带神煞 */}
            <tr>
              <td className="py-2 px-2 text-[11px] md:text-xs text-amber-200/90 align-top">神煞</td>
              {PILLAR_KEYS.map((key) => (
                <td key={key} className="py-2 text-[11px] md:text-xs align-top" style={{ color: '#f8dba0' }}>
                  {baziResult.shenshaPerPillar?.[key] ? (
                    <div className="flex flex-col items-center gap-0.5 leading-tight">
                      {baziResult.shenshaPerPillar[key].split('、').map((name) => (
                        <span key={name}>{name}</span>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 格局 */}
      {baziResult.geju && (
        <div className="flex justify-center">
          <span
            className="px-4 py-1.5 rounded-lg text-sm font-medium"
            style={{
              border: '1px solid rgba(230,194,0,0.5)',
              color: '#e6c200',
              background: 'rgba(230,194,0,0.1)',
            }}
          >
            格局：{baziResult.geju}
          </span>
        </div>
      )}

      {/* 神煞 */}
      {baziResult.shensha && baziResult.shensha.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {baziResult.shensha.map((name) => (
            <span
              key={name}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                border: '1px solid rgba(230,194,0,0.4)',
                color: '#e6c200',
                background: 'rgba(230,194,0,0.08)',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* 日主 · 喜用神 · 忌神 */}
      <div
        className="rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
        style={{
          background: 'rgba(13,6,24,0.8)',
          border: '1px solid rgba(230,194,0,0.35)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div className="text-center sm:text-left">
          <div className="text-xs opacity-70 mb-0.5">日主</div>
          <span
            className="text-2xl font-bold font-serif"
            style={{ color: getCharColor(baziResult.dayMaster || ''), textShadow: `0 0 14px ${getCharColor(baziResult.dayMaster || '')}50` }}
          >
            {baziResult.dayMaster || '—'}
          </span>
        </div>
        <div className="text-center sm:text-left">
          <div className="text-xs opacity-70 mb-0.5">喜用神</div>
          <span className="text-lg font-semibold" style={{ color: '#00cc99' }}>
            {baziResult.xiyongshen || '—'}
          </span>
        </div>
        <div className="text-center sm:text-left">
          <div className="text-xs opacity-70 mb-0.5">忌神</div>
          <span className="text-lg font-semibold" style={{ color: 'rgba(255,100,100,0.95)' }}>
            {baziResult.jishen || '—'}
          </span>
        </div>
      </div>

      {/* 五行能量 */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(13,6,24,0.8)',
          border: '1px solid rgba(230,194,0,0.25)',
        }}
      >
        <div className="text-xs font-semibold tracking-wider mb-3 opacity-80" style={{ color: '#e6c200' }}>
          五行能量
        </div>
        <div className="space-y-2.5">
          {WUXING_ORDER.map((key) => {
            const val = Number(wuxing[key]) || 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-6 text-center">{WUXING_ICON[key]}</span>
                <span className="w-12 text-xs text-muted-foreground">{wuxingLabels[key]}</span>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, val)}%`,
                      background: `linear-gradient(90deg, ${WUXING_COLORS[key]}, ${WUXING_COLORS[key]}99)`,
                      boxShadow: `0 0 10px ${WUXING_COLORS[key]}40`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-mono" style={{ color: WUXING_COLORS[key] }}>
                  {val}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 大运 */}
      {baziResult.dayun && (
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(13,6,24,0.6)',
            border: '1px solid rgba(230,194,0,0.25)',
          }}
        >
          <div className="text-xs font-semibold tracking-wider mb-2 opacity-80" style={{ color: '#e6c200' }}>
            大运 <span className="opacity-70 font-normal">（{baziResult.dayun.direction}排 · {baziResult.dayun.startAgeNote ?? `约${baziResult.dayun.startAge}岁起运`}）</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {baziResult.dayun.steps.map((step, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg text-sm font-serif"
                style={{
                  border: '1px solid rgba(230,194,0,0.35)',
                  color: '#e6c200',
                  background: 'rgba(230,194,0,0.06)',
                }}
              >
                {step.ganzhi} <span className="opacity-70 text-xs">({step.startAge}岁)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 流年 */}
      {baziResult.liunian && (
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(13,6,24,0.6)',
            border: '1px solid rgba(230,194,0,0.25)',
          }}
        >
          <div className="text-xs font-semibold tracking-wider mb-2 opacity-80" style={{ color: '#e6c200' }}>
            流年
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <div className="text-[10px] opacity-70 mb-0.5">去年</div>
              <span className="font-serif" style={{ color: '#e6c200' }}>{baziResult.liunian.lastYear}</span>
            </div>
            <div>
              <div className="text-[10px] opacity-70 mb-0.5">今年</div>
              <span className="font-serif font-semibold" style={{ color: '#e6c200', textShadow: '0 0 8px rgba(230,194,0,0.4)' }}>
                {baziResult.liunian.thisYear}
              </span>
            </div>
            <div>
              <div className="text-[10px] opacity-70 mb-0.5">明年</div>
              <span className="font-serif" style={{ color: '#e6c200' }}>{baziResult.liunian.nextYear}</span>
            </div>
          </div>
        </div>
      )}

      {/* 命理解读 */}
      {reading && (
        <div
          className="bazi-reading-content rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(230,194,0,0.06) 0%, rgba(13,6,24,0.9) 100%)',
            border: '1px solid rgba(230,194,0,0.2)',
          }}
        >
          <div className="text-xs font-semibold tracking-wider mb-2 opacity-80" style={{ color: '#e6c200' }}>
            命理解读
          </div>
          {(baziResult.xiyongshen || baziResult.jishen) && (() => {
            const xy = (baziResult.xiyongshen || '').trim();
            const yong = xy[0] || '';
            const xi = xy[1] || '';
            const jiRaw = (baziResult.jishen || '').replace(/[^木火土金水]/g, '');
            const validWx = new Set(['木', '火', '土', '金', '水']);
            const jiSet = new Set(
              jiRaw
                .split('')
                .filter((ch) => validWx.has(ch))
            );
            if (yong) jiSet.delete(yong);
            if (xi) jiSet.delete(xi);
            const ji = Array.from(jiSet).join('');
            return (
              <p className="text-xs mb-2" style={{ color: '#f7e3a4' }}>
                用神：{yong || '—'}  喜神：{xi || '—'}  忌神：{ji || '—'}
              </p>
            );
          })()}
          {renderReading(reading)}
        </div>
      )}

      {/* 免责 + 导出 */}
      <p className="text-[10px] text-center text-muted-foreground italic">
        命理结果仅供娱乐与自我反思，不构成医疗或投资建议。
      </p>
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="w-full py-4 rounded-xl font-semibold tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #6a2c8a 0%, #4b0082 50%, #2d1b4e 100%)',
            border: '1px solid rgba(230,194,0,0.4)',
            color: '#fff',
            fontFamily: 'var(--font-serif)',
            boxShadow: '0 4px 20px rgba(106,44,138,0.4)',
          }}
        >
          {exporting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('divination.exporting', { defaultValue: '生成中…' })}</span>
            </>
          ) : (
            <>
              <Download size={20} />
              <span>{t('divination.exportChart', { defaultValue: '一键导出高清命盘' })}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
