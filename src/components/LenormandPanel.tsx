/**
 * 雷諾曼板塊：深淵黑 + 燙金 + 星雲紫。
 * 使用 CSS 變數：--color-void, --color-gold-leaf, --color-nebula, --glow-intensity
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Sparkles, Download, Image } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import { getLenormandDraw, type LenormandCardEntry } from '@/lib/lenormandCards';
import SelectedCardOverlay from './SelectedCardOverlay';
import { fetchLenormandMasterSynthesis, buildFreeReadingExplanation, LENORMAND_SPREAD_LAYOUTS, type LenormandSpreadType } from '@/lib/lenormandMasterReading';
import { useReadingBack } from '@/contexts/ReadingBackContext';
import { addReading } from '@/lib/readingHistory';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Step = 'choose' | 'shuffling' | 'reveal';
type SpreadType = 'three' | 'five' | 'nine' | 'grand-tableau';

const CARD_SIZE = 88;
const STYLE = {
  void: 'var(--color-void, #030305)',
  gold: 'var(--color-gold-leaf, #D4AF37)',
  nebula: 'var(--color-nebula, #1A1A2E)',
  glow: 'var(--glow-intensity, 0 0 15px rgba(212, 175, 55, 0.4))',
};

interface LenormandPanelProps {
  question?: string;
  onQuestionChange?: (value: string) => void;
  className?: string;
  /** 是否為訂閱/付費用戶：true 時直接顯示完整解讀與下載，false 時解鎖按鈕跳轉訂閱頁 */
  hasPremiumAccess?: boolean;
}

export default function LenormandPanel({
  question = '',
  onQuestionChange,
  className = '',
  hasPremiumAccess = false,
}: LenormandPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [step, setStep] = useState<Step>('choose');
  const [spread, setSpread] = useState<SpreadType>('three');
  const [drawn, setDrawn] = useState<LenormandCardEntry[] | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overlayId, setOverlayId] = useState<number | null>(null);
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterError, setMasterError] = useState<string | null>(null);
  const [masterResult, setMasterResult] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  /** 流沙漸顯：先 Flow，1.5s 後再 Synthesis */
  const [revealFlow, setRevealFlow] = useState(false);
  const [revealSynthesis, setRevealSynthesis] = useState(false);
  /** Synthesis 中提到牌名時，對應牌面金色脈衝 */
  const [pulseCardIds, setPulseCardIds] = useState<Set<number>>(new Set());
  /** 付費鎖：僅訂閱用戶或解鎖後可看「能量瓶頸」及之後的內容 */
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const synthesisRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readingCardRef = useRef<HTMLDivElement>(null);
  const [hdImageDownloading, setHdImageDownloading] = useState(false);
  const readingBack = useReadingBack();
  const stepRef = useRef(step);
  stepRef.current = step;
  /** 付費用戶才顯示完整 AI 解讀；免費僅顯示基本牌義 */
  const canSeeFullContent = hasPremiumAccess;
  /** 大桌布局：9×4 或 8×4+4（Piquet） */
  const [tableauLayout, setTableauLayout] = useState<'9x4' | '8x4+4'>('9x4');
  /** 大桌是否顯示宮位名稱 */
  const [showTableauHouses, setShowTableauHouses] = useState(true);
  /** 大桌指示牌 Sig：男士(28)/女士(29)，落宮代表問卜者；高亮顯示 */
  const [sigCardId, setSigCardId] = useState<number | null>(null);

  const count = spread === 'three' ? 3 : spread === 'five' ? 5 : spread === 'nine' ? 9 : 36;

  const handleShuffle = useCallback(() => {
    setStep('shuffling');
    setDrawn(null);
    setActiveId(null);
    setOverlayId(null);
    setMasterLoading(false);
    setMasterError(null);
    setMasterResult(null);
    setHasSaved(false);
    setRevealFlow(false);
    setRevealSynthesis(false);
    setPulseCardIds(new Set());
    setHasUnlocked(false);
    if (synthesisRevealTimerRef.current) clearTimeout(synthesisRevealTimerRef.current);
    if (pulseClearTimerRef.current) clearTimeout(pulseClearTimerRef.current);
    setTimeout(() => {
      const cards = getLenormandDraw(Date.now(), count);
      setDrawn(cards);
      setActiveId(cards[0]?.id ?? null);
      setStep('reveal');
    }, 1400);
  }, [count]);

  const handleReset = useCallback(() => {
    setHasSaved(false);
    setStep('choose');
    setDrawn(null);
    setActiveId(null);
    setOverlayId(null);
    setMasterLoading(false);
    setMasterError(null);
    setMasterResult(null);
    setRevealFlow(false);
    setRevealSynthesis(false);
    setPulseCardIds(new Set());
    setHasUnlocked(false);
  }, []);

  // 内层返回：在解读结果页点返回先回到选牌/占卜主界面
  useEffect(() => {
    if (!readingBack) return;
    const handler = () => {
      if (stepRef.current === 'choose') return false;
      handleReset();
      return true;
    };
    readingBack.registerHandler(handler);
    return () => readingBack.unregisterHandler();
  }, [readingBack, handleReset]);

  // 流沙漸顯：有結果後先出 Flow，1.5s 後出 Synthesis
  useEffect(() => {
    if (!masterResult || masterLoading || masterError) return;
    const raw = masterResult.trim();
    const stripped = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    try {
      const parsed = JSON.parse(stripped) as { flow?: string; synthesis?: string; anchor?: string };
      if (parsed?.flow) {
        setRevealFlow(true);
        synthesisRevealTimerRef.current = setTimeout(() => setRevealSynthesis(true), 1500);
      } else {
        setRevealFlow(true);
        setRevealSynthesis(true);
      }
    } catch {
      setRevealFlow(true);
      setRevealSynthesis(true);
    }
    return () => {
      if (synthesisRevealTimerRef.current) clearTimeout(synthesisRevealTimerRef.current);
    };
  }, [masterResult, masterLoading, masterError]);

  // Synthesis 顯示時：掃描牌名，觸發對應牌面脈衝
  useEffect(() => {
    if (!revealSynthesis || !drawn?.length) return;
    const raw = masterResult?.trim() ?? '';
    const stripped = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    let synthesis = '';
    try {
      const parsed = JSON.parse(stripped) as { synthesis?: string };
      synthesis = parsed?.synthesis ?? '';
    } catch {
      synthesis = stripped;
    }
    const mentioned = new Set<number>();
    drawn.forEach((c) => {
      if (synthesis.includes(c.nameZh)) mentioned.add(c.id);
    });
    setPulseCardIds(mentioned);
    pulseClearTimerRef.current = setTimeout(() => setPulseCardIds(new Set()), 2200);
    return () => {
      if (pulseClearTimerRef.current) clearTimeout(pulseClearTimerRef.current);
    };
  }, [revealSynthesis, drawn, masterResult]);

  /** 保存高清圖片：使用 modern-screenshot 導出解讀卡片為高清 PNG */
  const handleSaveHdImage = useCallback(async () => {
    const el = readingCardRef.current;
    if (!el || hdImageDownloading) return;
    setHdImageDownloading(true);
    try {
      const dataUrl = await domToPng(el, {
        scale: 3,
        backgroundColor: '#030305',
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `雷諾曼解讀_${new Date().toISOString().slice(0, 10)}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(t('oracle.saveHdImageSuccess', { defaultValue: '已保存高清圖片' }), { duration: 2000 });
    } catch {
      toast.error(t('oracle.saveHdImageError', { defaultValue: '保存圖片失敗' }));
    } finally {
      setHdImageDownloading(false);
    }
  }, [hdImageDownloading, t]);

  // 手動保存：僅在用戶點擊「保存」時寫入解讀記錄
  const handleSave = useCallback(() => {
    if (!drawn?.length || hasSaved) return;
    setHasSaved(true);
    const spreadLabel = spread === 'three' ? '三張' : spread === 'five' ? '五張' : spread === 'nine' ? '九宮' : '大桌';
    addReading({
      tool: 'lenormand',
      question: question.trim() || null,
      summary: `雷諾曼 · ${spreadLabel} · ${drawn.map((c) => c.nameZh).join('→')}`,
      detail: {
        spreadType: spread,
        question: question.trim() || undefined,
        cards: drawn.map((c) => ({ id: c.id, nameZh: c.nameZh, shortMeaning: c.shortMeaning })),
        masterResult: masterResult ?? undefined,
      },
    });
    toast.success('保存成功 ✅', { duration: 2000 });
  }, [drawn, spread, question, masterResult, hasSaved]);

  // 大桌：自動設定指示牌 Sig 為牌陣中首張男士(28)或女士(29)
  useEffect(() => {
    if (spread !== 'grand-tableau' || !drawn?.length) return;
    const sig = drawn.find((c) => c.id === 28 || c.id === 29);
    setSigCardId(sig?.id ?? null);
  }, [spread, drawn]);

  // 僅付費用戶：牌陣完成後請求雲端 AI 大師解讀；免費用戶不調用
  useEffect(() => {
    if (!hasPremiumAccess || step !== 'reveal' || !drawn || drawn.length === 0) return;
    const spreadType: LenormandSpreadType =
      spread === 'three' ? 'TRIAD' : spread === 'five' ? 'CROSS' : spread === 'nine' ? 'SQUARE' : 'GRAND_TABLEAU';

    setMasterLoading(true);
    setMasterError(null);
    setMasterResult(null);

    fetchLenormandMasterSynthesis(drawn, spreadType, question, session?.access_token)
      .then((res) => {
        if (res) setMasterResult(res);
      })
      .catch((e) => {
        console.error('lenormand master synthesis error', e);
        setMasterError('AI 解讀暫時不可用，稍後再試。');
      })
      .finally(() => setMasterLoading(false));
  }, [hasPremiumAccess, step, drawn, spread, question, session?.access_token]);

  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(180deg, ${STYLE.void} 0%, ${STYLE.nebula} 50%, ${STYLE.void} 100%)`,
        border: `1px solid ${STYLE.gold}40`,
        boxShadow: `${STYLE.glow}, 0 20px 50px rgba(0,0,0,0.5)`,
      }}
    >
      <div className="px-4 py-5 space-y-6">
        {/* 標題區 */}
        <div className="text-center space-y-1">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 border"
            style={{ borderColor: `${STYLE.gold}60`, color: STYLE.gold }}
          >
            <LayoutGrid size={14} />
            <span className="text-sm font-semibold tracking-[0.2em] uppercase">
              {t('oracle.lenormand', { defaultValue: '雷諾曼' })}
            </span>
          </div>
          <p className="text-sm text-white/70 max-w-sm mx-auto">
            {t('oracle.lenormandDesc', { defaultValue: '36 張 · 故事解讀' })}
          </p>
        </div>

        {step === 'choose' && (
          <>
            {/* 問題（選填） */}
            {onQuestionChange && (
              <div className="space-y-2">
                <label className="block text-sm uppercase tracking-wider" style={{ color: `${STYLE.gold}cc` }}>
                  {t('oracle.sanctumQuestionLabel', { defaultValue: '用一句話描述此刻最困擾你的事' })}
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => onQuestionChange(e.target.value)}
                  placeholder={t('oracle.sanctumQuestionPlaceholder', { defaultValue: '例如：接下來三個月會怎樣？' })}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm bg-black/30 outline-none placeholder:text-white/40"
                  style={{
                    borderColor: `${STYLE.gold}50`,
                    color: '#f4f0ea',
                  }}
                  maxLength={120}
                />
              </div>
            )}

            {/* 牌陣選擇 */}
            <div className="text-center space-y-3">
              <p className="text-sm uppercase tracking-wider" style={{ color: `${STYLE.gold}99` }}>
                {t('readingHistory.cards', { defaultValue: '牌陣' })}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {(['three', 'five', 'nine', 'grand-tableau'] as SpreadType[]).map((type) => {
                  const isActive = spread === type;
                  const label =
                    type === 'three'
                      ? t('oracle.lenormandSpread3', { defaultValue: '3 張' })
                      : type === 'five'
                        ? t('oracle.lenormandSpread5', { defaultValue: '5 張' })
                        : type === 'nine'
                          ? t('oracle.lenormandSpread9', { defaultValue: '9 張' })
                          : t('oracle.lenormandSpreadTableau', { defaultValue: '大桌' });
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSpread(type)}
                      className="min-w-[80px] py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all"
                      style={{
                        borderColor: isActive ? STYLE.gold : `${STYLE.gold}30`,
                        background: isActive ? `${STYLE.gold}18` : 'transparent',
                        color: isActive ? STYLE.gold : 'rgba(244,240,234,0.85)',
                        boxShadow: isActive ? STYLE.glow : 'none',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/oracle/lenormand-library')}
              className="w-full py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium border transition-all hover:opacity-90"
              style={{ borderColor: `${STYLE.gold}30`, color: 'rgba(244,240,234,0.8)' }}
            >
              <LayoutGrid size={14} />
              {t('oracle.lenormandLibrary', { defaultValue: '牌義庫' })}
            </button>

            <button
              type="button"
              onClick={handleShuffle}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-base font-semibold border-2 transition-all hover:opacity-95 active:scale-[0.98]"
              style={{
                borderColor: `${STYLE.gold}70`,
                background: `linear-gradient(135deg, ${STYLE.gold}22, ${STYLE.gold}08)`,
                color: STYLE.gold,
                fontFamily: 'var(--font-serif)',
                boxShadow: STYLE.glow,
              }}
            >
              <Sparkles size={18} />
              {t('oracle.lenormandShuffle', { defaultValue: '洗牌並抽牌' })}
            </button>
          </>
        )}

        {step === 'shuffling' && (
          <div className="py-12 flex flex-col items-center gap-4">
            <div
              className="rounded-xl border-2 flex items-center justify-center"
              style={{
                width: CARD_SIZE * 2,
                height: CARD_SIZE * 1.4,
                borderColor: `${STYLE.gold}50`,
                background: `${STYLE.nebula}ee`,
                boxShadow: STYLE.glow,
              }}
            >
              <LayoutGrid size={36} style={{ color: `${STYLE.gold}99` }} />
            </div>
            <p className="text-sm tracking-wider" style={{ color: `${STYLE.gold}aa` }}>
              {t('oracle.lenormandShuffling', { defaultValue: '洗牌中…' })}
            </p>
          </div>
        )}

        {step === 'reveal' && drawn && drawn.length > 0 && (
          <div className="space-y-5">
            <div ref={readingCardRef} className="space-y-5 px-3 py-4 rounded-xl" style={{ background: 'rgba(3,3,8,0.6)' }}>
            <p className="text-center text-sm uppercase tracking-wider" style={{ color: `${STYLE.gold}99` }}>
              {t('oracle.lenormandDrawn', { defaultValue: '抽出的牌' })}
            </p>
            {spread === 'grand-tableau' ? (
              <>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTableauLayout((l) => (l === '9x4' ? '8x4+4' : '9x4'))}
                    className="px-2.5 py-1.5 rounded text-sm font-medium border transition-colors"
                    style={{ borderColor: `${STYLE.gold}50`, color: STYLE.gold }}
                  >
                    {tableauLayout === '9x4' ? '9×4' : '8×4+4'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTableauHouses((h) => !h)}
                    className="px-2.5 py-1.5 rounded text-sm font-medium border transition-colors"
                    style={{ borderColor: `${STYLE.gold}50`, color: STYLE.gold }}
                  >
                    {showTableauHouses ? '隐藏宫位' : '显示宫位'}
                  </button>
                  {sigCardId != null && (
                    <span className="px-2.5 py-1.5 text-sm text-muted-foreground" title="指示牌 (Sig)">
                      Sig 已高亮
                    </span>
                  )}
                </div>
                {tableauLayout === '8x4+4' ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-8 gap-1 max-w-full overflow-x-auto">
                      {drawn.slice(0, 32).map((card, i) => {
                        const house = LENORMAND_SPREAD_LAYOUTS.GRAND_TABLEAU[i];
                        const isSig = card.id === sigCardId;
                        return (
                          <div
                            key={`tableau-${i}`}
                            onClick={() => { setActiveId(card.id); setOverlayId(card.id); }}
                            className={`rounded border overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer relative min-w-0 ${pulseCardIds.has(card.id) ? 'lenormand-card-pulse' : ''} ${isSig ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-black' : ''}`}
                            style={{
                              borderColor: isSig ? '#4ade80' : activeId === card.id ? STYLE.gold : `${STYLE.gold}50`,
                              background: `linear-gradient(165deg, ${STYLE.nebula} 0%, ${STYLE.void} 100%)`,
                              boxShadow: isSig ? '0 0 10px rgba(74, 222, 128, 0.6)' : '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                            title={`宮位 ${i + 1} · ${house?.label ?? ''} · ${card.nameZh}${isSig ? ' (Sig)' : ''}`}
                          >
                            <span className="absolute top-0.5 left-0.5 text-[8px] font-semibold px-0.5 rounded bg-black/60 text-white/80">{i + 1}</span>
                            <span className="card-icon-sm text-sm mt-2.5 block" aria-hidden>{card.symbol}</span>
                            <span className="text-[9px] font-medium mt-0.5 px-0.5 truncate w-full" style={{ color: STYLE.gold }}>{card.nameZh}</span>
                            {showTableauHouses && <span className="text-[8px] text-muted-foreground px-0.5 truncate w-full max-w-full" title={house?.label}>{house?.label ?? ''}</span>}
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-4 gap-1 max-w-full justify-center">
                      {drawn.slice(32, 36).map((card, i) => {
                        const pos = 32 + i;
                        const house = LENORMAND_SPREAD_LAYOUTS.GRAND_TABLEAU[pos];
                        const isSig = card.id === sigCardId;
                        return (
                          <div
                            key={`tableau-${pos}`}
                            onClick={() => { setActiveId(card.id); setOverlayId(card.id); }}
                            className={`rounded border overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer relative min-w-0 ${isSig ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-black' : ''}`}
                            style={{
                              borderColor: isSig ? '#4ade80' : activeId === card.id ? STYLE.gold : `${STYLE.gold}50`,
                              background: `linear-gradient(165deg, ${STYLE.nebula} 0%, ${STYLE.void} 100%)`,
                              boxShadow: isSig ? '0 0 10px rgba(74, 222, 128, 0.6)' : '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                            title={`宮位 ${pos + 1} · ${house?.label ?? ''} · ${card.nameZh}${isSig ? ' (Sig)' : ''}`}
                          >
                            <span className="absolute top-0.5 left-0.5 text-[8px] font-semibold px-0.5 rounded bg-black/60 text-white/80">{pos + 1}</span>
                            <span className="card-icon-sm text-sm mt-2.5 block" aria-hidden>{card.symbol}</span>
                            <span className="text-[9px] font-medium mt-0.5 px-0.5 truncate w-full" style={{ color: STYLE.gold }}>{card.nameZh}</span>
                            {showTableauHouses && <span className="text-[8px] text-muted-foreground px-0.5 truncate w-full" title={house?.label}>{house?.label ?? ''}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-9 gap-1 max-w-full overflow-x-auto">
                    {drawn.map((card, i) => {
                      const house = LENORMAND_SPREAD_LAYOUTS.GRAND_TABLEAU[i];
                      const isSig = card.id === sigCardId;
                      return (
                        <div
                          key={`tableau-${i}`}
                          onClick={() => { setActiveId(card.id); setOverlayId(card.id); }}
                          className={`rounded border overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer relative min-w-0 ${pulseCardIds.has(card.id) ? 'lenormand-card-pulse' : ''} ${isSig ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-black' : ''}`}
                          style={{
                            borderColor: isSig ? '#4ade80' : activeId === card.id ? STYLE.gold : `${STYLE.gold}50`,
                            background: `linear-gradient(165deg, ${STYLE.nebula} 0%, ${STYLE.void} 100%)`,
                            boxShadow: isSig ? '0 0 10px rgba(74, 222, 128, 0.6)' : '0 2px 8px rgba(0,0,0,0.3)',
                          }}
                          title={`宮位 ${i + 1} · ${house?.label ?? ''} · ${card.nameZh}${isSig ? ' (Sig)' : ''}`}
                        >
                          <span className="absolute top-0.5 left-0.5 text-[8px] font-semibold px-0.5 rounded bg-black/60 text-white/80">{i + 1}</span>
                          <span className="card-icon-sm text-sm mt-2.5 block" aria-hidden>{card.symbol}</span>
                          <span className="text-[9px] font-medium mt-0.5 px-0.5 truncate w-full" style={{ color: STYLE.gold }}>{card.nameZh}</span>
                          {showTableauHouses && <span className="text-[8px] text-muted-foreground px-0.5 truncate w-full max-w-full" title={house?.label}>{house?.label ?? ''}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
            <div
              className="flex flex-wrap justify-center gap-3"
              style={{ gap: spread === 'nine' ? 8 : 12 }}
            >
              {drawn.map((card, i) => (
                <div
                  key={`${card.id}-${i}`}
                  onClick={() => {
                    setActiveId(card.id);
                    setOverlayId(card.id);
                  }}
                  className={`rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer relative ${pulseCardIds.has(card.id) ? 'lenormand-card-pulse' : ''}`}
                  style={{
                    width: spread === 'nine' ? 72 : CARD_SIZE,
                    minHeight: spread === 'nine' ? 110 : 130,
                    borderColor: activeId === card.id ? STYLE.gold : `${STYLE.gold}60`,
                    background: `linear-gradient(165deg, ${STYLE.nebula} 0%, ${STYLE.void} 100%)`,
                    boxShadow: `0 8px 24px rgba(0,0,0,0.4), ${STYLE.glow}`,
                  }}
                >
                  <span className="absolute top-1 left-1 text-sm font-semibold px-1 rounded-full bg-black/55 text-white/70">
                    {String(card.id).padStart(2, '0')}
                  </span>
                  <span className="card-icon mt-2 block" aria-hidden>
                    {card.symbol}
                  </span>
                  <span
                    className="text-sm font-semibold mt-1 px-1 truncate w-full"
                    style={{ color: STYLE.gold }}
                  >
                    {card.nameZh}
                  </span>
                  <span
                    className="text-sm mt-0.5 px-1.5 leading-tight line-clamp-2"
                    style={{ color: 'rgba(244,240,234,0.8)' }}
                  >
                    {card.shortMeaning}
                  </span>
                </div>
              ))}
            </div>
            )}

            {/* 故事解讀區（大桌時僅提示，其餘牌陣為牌序故事） */}
            <div
              className="rounded-xl border px-4 py-3.5"
              style={{
                borderColor: `${STYLE.gold}45`,
                background: `${STYLE.void}dd`,
                boxShadow: `inset 0 0 30px ${STYLE.nebula}80`,
              }}
            >
              <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: STYLE.gold }}>
                {t('oracle.lenormandStory', { defaultValue: '故事解讀' })}
              </p>
              {spread === 'grand-tableau' ? (
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,240,234,0.92)' }}>
                  {t('oracle.lenormandTableauHint', { defaultValue: '大桌共 36 宮位，上方為宮位與牌面對應；整體解讀見下方大師級解讀。' })}
                </p>
              ) : (
                <>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(244,240,234,0.92)' }}>
                    {drawn.map((c) => c.nameZh).join(' → ')}：{drawn.map((c) => c.shortMeaning).join('；')}
                  </p>
                  <p className="text-sm mt-2 opacity-80" style={{ color: 'rgba(244,240,234,0.7)' }}>
                    {t('oracle.lenormandStoryHint', { defaultValue: '雷諾曼擅長用牌序講故事，相鄰的牌會互相修飾意義。' })}
                  </p>
                </>
              )}
            </div>

            {/* 大師級整體判詞：付費用戶連雲端 AI；免費僅顯示解鎖引導 */}
            <div
              className="rounded-xl border px-4 py-3.5 space-y-3"
              style={{
                borderColor: `${STYLE.gold}60`,
                background: 'rgba(3,3,8,0.96)',
                boxShadow: `0 14px 32px rgba(0,0,0,0.6)`,
              }}
            >
              <p className="text-[15px] font-semibold uppercase tracking-wider" style={{ color: STYLE.gold }}>
                大師級整體解讀
              </p>

              {!hasPremiumAccess && drawn && drawn.length > 0 && (() => {
                const spreadType: LenormandSpreadType =
                  spread === 'three' ? 'TRIAD' : spread === 'five' ? 'CROSS' : spread === 'nine' ? 'SQUARE' : 'GRAND_TABLEAU';
                const freeText = buildFreeReadingExplanation(drawn, spreadType, question);
                return (
                  <div className="space-y-4">
                    <div className="rounded-lg px-4 py-3.5 text-left" style={{ background: 'rgba(212,175,55,0.08)', borderLeft: `3px solid ${STYLE.gold}` }}>
                      <p className="text-[15px] uppercase tracking-wider mb-2" style={{ color: `${STYLE.gold}cc` }}>
                        {t('oracle.lenormandFreeReading', { defaultValue: '免費版講解' })}
                      </p>
                      <p className="text-[17px] leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(244,240,234,0.92)' }}>
                        {freeText}
                      </p>
                    </div>
                    <p className="text-[14px] text-center" style={{ color: 'rgba(244,240,234,0.7)' }}>
                      {t('oracle.lenormandFreeHint', { defaultValue: '訂閱後解鎖雲端 AI 詳細解讀（Flow / Synthesis / Anchor）。' })}
                    </p>
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl text-sm font-medium border transition-all hover:opacity-90"
                      style={{ borderColor: STYLE.gold, color: STYLE.gold }}
                      onClick={() => navigate('/subscribe', { state: { from: 'lenormand-unlock' } })}
                    >
                      {t('oracle.lenormandUnlock', { defaultValue: '訂閱解鎖 AI 解讀' })}
                    </button>
                  </div>
                );
              })()}

              {hasPremiumAccess && masterLoading && (
                <p className="text-sm" style={{ color: 'rgba(244,240,234,0.8)' }}>
                  正在連接大師頻道，生成你的整體判詞…
                </p>
              )}

              {hasPremiumAccess && masterError && (
                <p className="text-sm" style={{ color: '#fca5a5' }}>
                  {masterError}
                </p>
              )}

              {hasPremiumAccess && masterResult && !masterLoading && !masterError && (() => {
                const raw = masterResult.trim();
                const stripped = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
                let mirror = '';
                let shadow = '';
                let zen = '';
                try {
                  const parsed = JSON.parse(stripped) as { flow?: string; synthesis?: string; anchor?: string };
                  mirror = parsed?.flow ?? '';
                  shadow = parsed?.synthesis ?? '';
                  zen = parsed?.anchor ?? '';
                } catch {
                  return (
                    <div className="space-y-3 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(244,240,234,0.9)' }}>
                      {stripped}
                    </div>
                  );
                }
                const hasLockedContent = shadow.length > 0 || zen.length > 0;

                return (
                  <div className="space-y-8 text-sm leading-relaxed">
                    {/* 免費展示：鏡像與現狀 */}
                    {mirror && revealFlow && (
                      <section className="free-zone sand-flux-reveal">
                        <h4 className="text-gold opacity-50 text-sm tracking-widest">[ 镜像 ]</h4>
                        <p className="text-gold whitespace-pre-wrap mt-1">{mirror}</p>
                      </section>
                    )}

                    {/* 鎖定區：僅付費/訂閱後可見；未付費點解鎖跳轉訂閱頁 */}
                    {hasLockedContent && revealSynthesis && (
                      <div className="relative min-h-[120px]">
                        <div className={!canSeeFullContent ? 'locked-content rounded-lg px-3 py-3' : 'revealed-content rounded-lg px-3 py-3'}>
                          {shadow && (
                            <section>
                              <h4 className="text-gold opacity-50 text-sm tracking-widest">[ 阴影瓶颈 ]</h4>
                              <p className="text-gold whitespace-pre-wrap mt-1">{shadow}</p>
                            </section>
                          )}
                          {zen && (
                            <section className="mt-8">
                              <h4 className="text-gold font-bold">[ 转化锚点 ]</h4>
                              <p className="whitespace-pre-wrap mt-1" style={{ color: 'rgba(212,175,55,0.95)' }}>{zen}</p>
                            </section>
                          )}
                        </div>

                        {/* 支付誘導蓋層：未訂閱時點擊跳轉訂閱頁，付費後才能看到完整解讀 */}
                        {!canSeeFullContent && (
                          <div className="lenormand-unlock-overlay absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg">
                            <button
                              type="button"
                              className="master-seal-button"
                              onClick={() => navigate('/subscribe', { state: { from: 'lenormand-unlock' } })}
                            >
                              开启深度觉察 · ¥19.9
                            </button>
                            <p className="text-gold/40 text-sm mt-4 tracking-[0.3em]">
                              完成能量交换，获取本周转化指引
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 rounded-xl text-sm font-medium border transition-all hover:opacity-90"
              style={{
                borderColor: `${STYLE.gold}50`,
                color: STYLE.gold,
              }}
            >
              {t('oracle.lenormandAgain', { defaultValue: '再抽一次' })}
            </button>

            {/* 保存、保存高清圖片、下載解讀、前往星圖 */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleSave}
                disabled={!drawn?.length || hasSaved}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ borderColor: `${STYLE.gold}50`, color: STYLE.gold }}
              >
                {hasSaved ? '已保存' : '保存'}
              </button>
              <button
                type="button"
                onClick={handleSaveHdImage}
                disabled={!drawn?.length || hdImageDownloading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 hover:opacity-90"
                style={{ borderColor: `${STYLE.gold}40`, color: STYLE.gold }}
              >
                <Image size={14} />
                {t('oracle.saveHdImage', { defaultValue: '保存高清图片' })}
              </button>
              {masterResult && (
                <button
                  type="button"
                  onClick={() => {
                    const raw = masterResult.trim();
                    const stripped = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
                    let text = `雷諾曼 · ${drawn?.map((c) => c.nameZh).join(' → ') ?? ''}\n\n`;
                    try {
                      const parsed = JSON.parse(stripped) as { flow?: string; synthesis?: string; anchor?: string };
                      if (parsed.flow) text += `【能量流向】\n${parsed.flow}\n\n`;
                      if (parsed.synthesis) text += `【綜合判詞】\n${parsed.synthesis}\n\n`;
                      if (parsed.anchor) text += `【行動落點】\n${parsed.anchor}`;
                      else text += stripped;
                    } catch {
                      text += stripped;
                    }
                    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `雷諾曼解讀_${new Date().toISOString().slice(0, 10)}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all hover:opacity-90"
                  style={{ borderColor: `${STYLE.gold}40`, color: STYLE.gold }}
                >
                  <Download size={14} />
                  {t('oracle.downloadReading', { defaultValue: '下載解讀' })}
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/oracle/lenormand-library')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all hover:opacity-90"
                style={{ borderColor: 'rgba(212,175,55,0.35)', color: 'rgba(244,240,234,0.85)' }}
                title={t('oracle.lenormandLibraryHint', { defaultValue: '36 張牌義總覽，鏡像 / 現實 / 陰影 / 微禪' })}
              >
                <LayoutGrid size={14} />
                {t('oracle.lenormandLibrary', { defaultValue: '牌義庫' })}
              </button>
              <button
                type="button"
                onClick={() => navigate('/oracle')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all hover:opacity-90"
                style={{ borderColor: 'rgba(212,175,55,0.35)', color: 'rgba(244,240,234,0.85)' }}
                title={t('oracle.viewStarChartHint', { defaultValue: '星圖：本命星圖、今日一句、靈魂原型與占卜工具入口' })}
              >
                ♦ {t('oracle.viewStarChart', { defaultValue: '前往星圖' })}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 單牌升起與環境遮罩：點擊牌面時彈出全屏大師級解讀 */}
      {overlayId != null && drawn && (
        <SelectedCardOverlay
          card={drawn.find((c) => c.id === overlayId) ?? drawn[0]}
          onClose={() => setOverlayId(null)}
        />
      )}
    </div>
  );
}
