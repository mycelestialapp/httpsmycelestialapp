/**
 * 解讀記錄頁：統一展示神諭卡、塔羅等所有占卜的「問題與答案」存檔。
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Trash2, Filter } from 'lucide-react';
import {
  getReadings,
  removeReading,
  TOOL_LABELS,
  type ReadingEntry,
  type ReadingTool,
  type OracleReadingDetail,
  type TarotReadingDetail,
  type LenormandReadingDetail,
  type AstrologyReadingDetail,
  type RuneReadingDetail,
  type NumerologyReadingDetail,
} from '@/lib/readingHistory';
import type { OracleReading } from '@/lib/oracleMasterReading';
import MasterOracleReadingView from '@/components/MasterOracleReadingView';
import { useOracleAccess } from '@/hooks/useOracleAccess';

/** 西方占卜（第一排） */
const WESTERN_TOOLS: { value: ReadingTool; labelKey: string }[] = [
  { value: 'astrology', labelKey: 'readingHistory.astrology' },
  { value: 'tarot', labelKey: 'readingHistory.tarot' },
  { value: 'oracle', labelKey: 'readingHistory.oracle' },
  { value: 'lenormand', labelKey: 'readingHistory.lenormand' },
  { value: 'runes', labelKey: 'readingHistory.runes' },
  { value: 'numerology', labelKey: 'readingHistory.numerology' },
];
/** 東方占卜（第二排） */
const EASTERN_TOOLS: { value: ReadingTool; labelKey: string }[] = [
  { value: 'bazi', labelKey: 'readingHistory.bazi' },
  { value: 'ziwei', labelKey: 'readingHistory.ziwei' },
  { value: 'qimen', labelKey: 'readingHistory.qimen' },
  { value: 'liuren', labelKey: 'readingHistory.liuren' },
  { value: 'xiaoliuren', labelKey: 'readingHistory.xiaoliuren' },
  { value: 'liuyao', labelKey: 'readingHistory.liuyao' },
  { value: 'xuankong', labelKey: 'readingHistory.xuankong' },
  { value: 'meihua', labelKey: 'readingHistory.meihua' },
];

const ReadingHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasOracleAccess = useOracleAccess();
  const [readings, setReadings] = useState<ReadingEntry[]>([]);
  const [toolFilter, setToolFilter] = useState<ReadingTool | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(() => {
    setReadings(getReadings());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    toolFilter == null ? readings : readings.filter((r) => r.tool === toolFilter);

  const handleDelete = (id: string) => {
    if (!window.confirm(t('readingHistory.confirmDelete', { defaultValue: '確定刪除這條解讀記錄？' }))) return;
    removeReading(id);
    setReadings(getReadings());
    if (expandedId === id) setExpandedId(null);
  };

  /** 顯示為 年/月/日 時:分，便於與「占卜問題」對應 */
  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${y}年${m}月${day}日 ${h}:${min}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pt-2 page-transition pb-8">
      <div className="text-center space-y-1">
        <h1
          className="text-xl font-bold tracking-[0.2em]"
          style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}
        >
          {t('readingHistory.title', { defaultValue: '解讀記錄' })}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t('readingHistory.subtitle', { defaultValue: '神諭卡、塔羅等問題與答案統一存檔，方便日後回看' })}
        </p>
      </div>

      {/* 占卜工具篩選：兩排，第一排西方、第二排東方，無橫向滾動條 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">西方</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {WESTERN_TOOLS.map(({ value, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => setToolFilter((prev) => (prev === value ? null : value))}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                toolFilter === value
                  ? 'border-gold-strong text-gold-strong bg-gold-soft'
                  : 'border-border/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(labelKey, { defaultValue: TOOL_LABELS[value] })}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">東方</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EASTERN_TOOLS.map(({ value, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => setToolFilter((prev) => (prev === value ? null : value))}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                toolFilter === value
                  ? 'border-gold-strong text-gold-strong bg-gold-soft'
                  : 'border-border/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(labelKey, { defaultValue: TOOL_LABELS[value] })}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
          {readings.length === 0
            ? t('readingHistory.empty', { defaultValue: '尚無解讀記錄。在神諭卡或塔羅完成抽牌與解讀後，會自動存檔於此。' })
            : t('readingHistory.emptyFilter', { defaultValue: '此篩選下暫無記錄。' })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const isOracle = entry.tool === 'oracle';
            const isTarot = entry.tool === 'tarot';
            const detail = entry.detail;

            return (
              <motion.div
                key={entry.id}
                layout
                className="rounded-xl border border-border/60 bg-card/50 overflow-hidden"
              >
                {/* 列表：占卜類型、年月日時、問題摘要；點開顯示詳細問題與解讀 */}
                <div className="flex items-start gap-2 px-4 py-3">
                  <span className="text-xs font-medium text-gold-strong shrink-0 w-16">
                    {TOOL_LABELS[entry.tool]}
                  </span>
                  <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
                    {formatDateTime(entry.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedId((id) => (id === entry.id ? null : entry.id))}
                    className="flex-1 min-w-0 text-left flex items-center gap-2"
                  >
                    <span className="text-sm font-medium text-foreground truncate">
                      {entry.question?.trim() || t('readingHistory.noQuestion', { defaultValue: '（未填寫問題）' })}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    title={t('readingHistory.delete', { defaultValue: '刪除' })}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-border/50 px-4 py-3 space-y-4"
                  >
                    {/* 一、問題 */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        {t('readingHistory.question', { defaultValue: '問題' })}
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {entry.question?.trim() || t('readingHistory.noQuestion', { defaultValue: '（未填寫問題）' })}
                      </p>
                    </div>

                    {/* 二、抽的卡片 */}
                    {isOracle && (detail as OracleReadingDetail).cards?.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                          {t('readingHistory.cards', { defaultValue: '牌面' })}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {(detail as OracleReadingDetail).cards.map((c) => (
                            <div
                              key={c.id}
                              className="rounded-xl border border-gold-strong/40 overflow-hidden bg-black/20 flex flex-col items-center max-w-[140px]"
                            >
                              {c.image ? (
                                <img
                                  src={c.image}
                                  alt={c.nameZh}
                                  className="w-full aspect-[2/3] object-cover"
                                />
                              ) : null}
                              <div className="px-2 py-1.5 w-full text-center">
                                <span className="text-sm font-medium text-gold-strong">{c.nameZh}</span>
                                {c.tagline && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-pre-wrap break-words">{c.tagline}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 三、完整解讀（鏡像復述 + 靈魂核心 + 付費層，不截斷） */}
                    {isOracle && (detail as OracleReadingDetail).masterReading && (
                      <div className="pt-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                          {t('readingHistory.fullInterpretation', { defaultValue: '完整解讀' })}
                        </p>
                        <p className="text-[11px] text-muted-foreground mb-2">
                          {t('readingHistory.fullInterpretationHint', { defaultValue: '以下為本次神諭卡存檔的完整文字解讀，含鏡像復述與靈魂核心啟示。' })}
                        </p>
                        <MasterOracleReadingView
                          reading={(detail as OracleReadingDetail).masterReading as OracleReading}
                          isUnlocked={hasOracleAccess}
                          onUnlock={() => {}}
                          archiveView
                        />
                      </div>
                    )}
                    {/* 神諭卡舊記錄無大師解讀時：至少顯示牌面提示語作為文字解讀 */}
                    {isOracle && !(detail as OracleReadingDetail).masterReading && (detail as OracleReadingDetail).cards?.length > 0 && (
                      <div className="rounded-xl border border-gold-strong/40 px-3.5 py-3 space-y-2 bg-black/25">
                        <p className="text-[11px] font-medium tracking-widest uppercase text-gold-strong">
                          {t('readingHistory.cardInterpretation', { defaultValue: '牌面解讀' })}
                        </p>
                        <div className="space-y-2 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                          {(detail as OracleReadingDetail).cards.map((c, i) => (
                            <p key={c.id}>
                              <span className="text-gold-strong font-medium">{c.nameZh}</span>
                              {c.tagline ? `：${c.tagline}` : ''}
                            </p>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground pt-1">
                          {t('readingHistory.legacyNoMaster', { defaultValue: '此記錄為較早存檔，無大師級解讀；僅顯示牌面提示語。' })}
                        </p>
                      </div>
                    )}

                    {isTarot && (detail as TarotReadingDetail).cards?.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                          {t('readingHistory.cards', { defaultValue: '牌面' })}
                        </p>
                        <ul className="space-y-1 text-sm text-foreground">
                          {(detail as TarotReadingDetail).cards.map((c, i) => (
                            <li key={`${c.id}-${i}`}>
                              {c.nameZh}
                              {!c.upright && (
                                <span className="text-muted-foreground ml-1">
                                  （{t('readingHistory.reversed', { defaultValue: '逆位' })}）
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 塔羅完整解讀（與神諭卡同結構，依訂閱顯示免費/付費層） */}
                    {isTarot && (detail as TarotReadingDetail).masterReading && (
                      <div className="pt-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                          {t('readingHistory.fullInterpretation', { defaultValue: '完整解讀' })}
                        </p>
                        <MasterOracleReadingView
                          reading={(detail as TarotReadingDetail).masterReading as OracleReading}
                          isUnlocked={hasOracleAccess}
                          onUnlock={() => {}}
                          archiveView
                        />
                      </div>
                    )}

                    {entry.tool === 'astrology' && detail && (
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                          {t('readingHistory.astrologyChart', { defaultValue: '星盤' })}
                        </p>
                        <p className="text-sm text-foreground">
                          {(detail as AstrologyReadingDetail).sunSign ?? '—'}
                          {' · '}
                          {(detail as AstrologyReadingDetail).birthYear ?? '—'}/
                          {(detail as AstrologyReadingDetail).birthMonth ?? '—'}/
                          {(detail as AstrologyReadingDetail).birthDay ?? '—'}
                        </p>
                        {(detail as AstrologyReadingDetail).reading && (
                          <>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                              {t('readingHistory.detailedInterpretation', { defaultValue: '詳細解讀' })}
                            </p>
                            <div className="rounded-xl border border-border/60 bg-card/30 px-3 py-2 text-sm text-foreground whitespace-pre-wrap">
                              {(detail as AstrologyReadingDetail).reading}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {entry.tool === 'runes' && (() => {
                      const d = detail as RuneReadingDetail;
                      return (
                        <div className="space-y-3">
                          {d.runes?.length > 0 && (
                            <>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('readingHistory.cards', { defaultValue: '牌面' })}</p>
                              <p className="text-sm text-foreground">
                                {d.runes.map((r) => `${r.name}${r.reversed ? '（逆位）' : ''}${r.position ? ' · ' + r.position : ''}`).join(' → ')}
                              </p>
                            </>
                          )}
                          {d.interpretationSummary && (
                            <>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('readingHistory.fullInterpretation', { defaultValue: '完整解讀' })}</p>
                              <div className="rounded-xl border border-border/60 bg-card/30 px-3 py-2 text-sm text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                                {d.interpretationSummary}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {entry.tool === 'lenormand' && (() => {
                      const d = detail as LenormandReadingDetail;
                      const raw = (d.masterResult ?? '').trim();
                      const stripped = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
                      let flow = ''; let synthesis = ''; let anchor = '';
                      try {
                        const parsed = JSON.parse(stripped) as { flow?: string; synthesis?: string; anchor?: string };
                        flow = parsed.flow ?? ''; synthesis = parsed.synthesis ?? ''; anchor = parsed.anchor ?? '';
                      } catch { /* use raw */ }
                      const hasFullContent = !!(flow || synthesis || anchor || stripped);
                      return (
                        <div className="space-y-3">
                          {d.cards?.length > 0 && (
                            <>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('readingHistory.cards', { defaultValue: '牌面' })}</p>
                              <p className="text-sm text-foreground">{d.cards.map((c) => c.nameZh).join(' → ')}</p>
                            </>
                          )}
                          {hasFullContent && (
                            <>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('readingHistory.fullInterpretation', { defaultValue: '完整解讀' })}</p>
                              <div className="rounded-xl border border-border/60 bg-card/30 px-3 py-2 text-sm text-foreground whitespace-pre-wrap space-y-2">
                                {flow && <><span className="text-muted-foreground">【能量流向】</span><br />{flow}</>}
                                {synthesis && <><br /><span className="text-muted-foreground">【綜合判詞】</span><br />{synthesis}</>}
                                {anchor && <><br /><span className="text-muted-foreground">【行動落點】</span><br />{anchor}</>}
                                {!flow && !synthesis && !anchor && stripped}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {entry.tool === 'bazi' && (
                      <p className="text-sm text-muted-foreground">
                        {t('readingHistory.baziPlaceholder', { defaultValue: '八字解讀記錄詳情（待擴展）' })}
                      </p>
                    )}
                    {entry.tool === 'liuyao' && (
                      <p className="text-sm text-muted-foreground">
                        {t('readingHistory.liuyaoPlaceholder', { defaultValue: '六爻解讀記錄詳情（待擴展）' })}
                      </p>
                    )}
                    {entry.tool === 'numerology' && (() => {
                      const d = detail as NumerologyReadingDetail;
                      return (
                        <div className="space-y-3">
                          <p className="text-body-sm text-foreground">
                            {d.name} · {d.birthDateLabel ?? new Date(d.birthDate).toLocaleDateString('zh-CN')}
                          </p>
                          <p className="text-body-sm text-muted-foreground">
                            生命路徑 {d.lifePath} · 命運數 {d.expression} · 靈魂驅動 {d.soulUrge} · 個性數 {d.personality} · 成熟數 {d.maturity}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              navigate('/numerology/result', {
                                state: {
                                  name: d.name,
                                  birthDate: d.birthDate,
                                  birthDateLabel: d.birthDateLabel,
                                  hourIndex: d.hourIndex,
                                  fromReadingHistory: true,
                                },
                              })
                            }
                            className="text-body-sm font-medium text-gold hover:underline flex items-center gap-1"
                          >
                            查看完整結果 <ChevronRight size={14} />
                          </button>
                        </div>
                      );
                    })()}
                    {['ziwei', 'qimen', 'liuren', 'xiaoliuren', 'xuankong', 'meihua'].includes(entry.tool) && (
                      <p className="text-sm text-muted-foreground">
                        {t('readingHistory.genericPlaceholder', { defaultValue: '解讀記錄詳情（待擴展）' })}
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs text-gold-strong flex items-center gap-1"
        >
          <ChevronRight size={12} className="rotate-180" />
          {t('readingHistory.back', { defaultValue: '返回' })}
        </button>
      </div>
    </div>
  );
};

export default ReadingHistoryPage;
