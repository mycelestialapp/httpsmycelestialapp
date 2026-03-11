import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { domToPng } from 'modern-screenshot';
import { Sparkles, Heart, Briefcase, Compass, Share2 } from 'lucide-react';
import {
  getRandomOracleDraw,
  getDailyOracleCard,
  type OracleCardEntry,
  type OracleTopic,
} from '@/lib/oracleCards';
import {
  generateMasterReading,
  type DrawnCardInput,
  type OracleReading as MasterOracleReading,
} from '@/lib/oracleMasterReading';
import { useReadingBack } from '@/contexts/ReadingBackContext';
import { addReading } from '@/lib/readingHistory';
import { toast } from 'sonner';
import MasterOracleReadingView from './MasterOracleReadingView';
import OracleShareCanvas from './OracleShareCanvas';

type Step = 'choose' | 'shuffling' | 'draw';
type OracleSpread = 'single' | 'three';

interface OracleCardPanelProps {
  date: Date;
  className?: string;
  /** 來自聖殿入口的一句話問題；若提供，將同步到本地問題框 */
  externalQuestion?: string;
  /** 是否已訂閱/付費，用於決定大師級解讀的「深度轉化區」是否顯示完整內容 */
  hasPremiumAccess?: boolean;
}

const CARD_WIDTH = 160;
const CARD_HEIGHT = 250;
const ORACLE_POSITION_LABELS_THREE = ['當下主題', '內在阻力', '宇宙給你的方向'];

const CARD_BACK_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 20% 15%, rgba(180,170,255,0.25) 0, transparent 55%),' +
    'radial-gradient(circle at 80% 85%, rgba(255,220,210,0.25) 0, transparent 55%),' +
    'linear-gradient(160deg, #0a0514 0%, #130b26 35%, #24134a 65%, #0a0514 100%)',
  border: '2px solid hsla(var(--gold) / 0.5)',
  boxShadow: '0 10px 26px rgba(0,0,0,0.65), inset 0 0 30px hsla(var(--gold)/0.18)',
};

function CardBack() {
  return (
    <div
      className="rounded-xl flex items-center justify-center overflow-hidden relative"
      style={{
        ...CARD_BACK_STYLE,
        minWidth: CARD_WIDTH,
        minHeight: CARD_HEIGHT,
      }}
    >
      <div className="absolute inset-1 rounded-lg border border-gold-strong/30 flex items-center justify-center">
        <div
          className="w-full h-full opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 6px, hsla(var(--gold)/0.16) 6px, hsla(var(--gold)/0.16) 8px),' +
              'repeating-linear-gradient(-45deg, transparent, transparent 6px, hsla(var(--accent)/0.14) 6px, hsla(var(--accent)/0.14) 8px)',
          }}
        />
      </div>
      <div className="relative rounded-full w-11 h-11 flex items-center justify-center border-2 border-gold-strong/50 bg-black/35">
        <Sparkles size={20} className="text-gold-strong/85" />
      </div>
    </div>
  );
}

const TOPIC_OPTIONS: { key: OracleTopic; labelKey: string; icon: typeof Heart; defaultLabel?: string }[] = [
  { key: 'love', labelKey: 'tarot.topicLove', icon: Heart, defaultLabel: '測愛情' },
  { key: 'career', labelKey: 'tarot.topicCareer', icon: Briefcase, defaultLabel: '測事業' },
  { key: 'self', labelKey: 'oracle.selfTopic', icon: Sparkles, defaultLabel: '自我與靈魂' },
  { key: 'general', labelKey: 'tarot.topicGeneral', icon: Compass, defaultLabel: '綜合' },
];

export default function OracleCardPanel({ date, className = '', externalQuestion, hasPremiumAccess = false }: OracleCardPanelProps) {
  const { t } = useTranslation();
  type EntryMode = 'idle' | 'daily' | 'question';
  const [entryMode, setEntryMode] = useState<EntryMode>('idle');
  const [step, setStep] = useState<Step>('choose');
  const [topic, setTopic] = useState<OracleTopic>('general');
  const [spread, setSpread] = useState<OracleSpread>('single');
  const [question, setQuestion] = useState(externalQuestion ?? '');
  const [drawn, setDrawn] = useState<OracleCardEntry[] | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [masterReading, setMasterReading] = useState<MasterOracleReading | null>(null);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [unlockingPremium, setUnlockingPremium] = useState(false);
  const hasSavedRef = useRef(false);
  const hasTriggeredMasterRef = useRef(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const shareCanvasRef = useRef<HTMLDivElement | null>(null);

  // 外部問題更新時，同步到本地輸入框；若使用者在此頁修改，仍以本地為準
  useEffect(() => {
    if (step !== 'choose') return;
    if (externalQuestion === undefined) return;
    if (externalQuestion === question) return;
    setQuestion(externalQuestion);
  }, [externalQuestion, question, step]);

  const startShuffle = useCallback(() => {
    setEntryMode('question');
    setDrawn(null);
    setRevealedIndices([]);
    setStep('shuffling');
    setMasterReading(null);
    setUnlockingPremium(false);
    setLoadingMaster(false);
    hasSavedRef.current = false;
    hasTriggeredMasterRef.current = false;
    setTimeout(() => {
      const count = spread === 'single' ? 1 : 3;
      const result = getRandomOracleDraw(Date.now(), count, topic);
      setDrawn(result);
      setRevealedIndices([]);
      setStep('draw');
    }, 1600);
  }, [spread, topic]);

  const openDailyOneCard = useCallback(() => {
    setEntryMode('daily');
    const dailyCard = getDailyOracleCard(date);
    setDrawn([dailyCard]);
    setRevealedIndices([0]);
    setStep('draw');
  }, [date]);

  const backToEntryChoice = useCallback(() => {
    setEntryMode('idle');
    setStep('choose');
    setDrawn(null);
    setRevealedIndices([]);
    setMasterReading(null);
    hasSavedRef.current = false;
    hasTriggeredMasterRef.current = false;
  }, []);

  const readingBack = useReadingBack();
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    if (!readingBack) return;
    const handler = () => {
      if (stepRef.current === 'choose') return false;
      backToEntryChoice();
      return true;
    };
    readingBack.registerHandler(handler);
    return () => readingBack.unregisterHandler();
  }, [readingBack, backToEntryChoice]);

  const handleShareReading = useCallback(async () => {
    if (!drawn || !masterReading || !shareCanvasRef.current) return;
    setShareLoading(true);
    try {
      const dataUrl = await domToPng(shareCanvasRef.current, {
        width: 1080,
        height: 1920,
        scale: 1,
        backgroundColor: '#050316',
        style: {
          position: 'static',
          left: '0',
          top: '0',
        },
      });
      const link = document.createElement('a');
      link.download = `oracle-reading-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2200);
    } catch (err) {
      console.error('Failed to export oracle reading image', err);
    } finally {
      setShareLoading(false);
    }
  }, [drawn, masterReading]);

  const allRevealed =
    drawn != null &&
    drawn.length > 0 &&
    revealedIndices.length >= drawn.length;

  // 寫入統一「問題與答案」存儲（神諭卡）：全部翻牌即存檔，大師解讀可選（有則帶上，無則僅存牌面）
  useEffect(() => {
    if (!drawn || !allRevealed) return;
    if (hasSavedRef.current) return;
    try {
      if (typeof window === 'undefined') return;
      const q = (question && question.trim()) || '';
      const summary =
        drawn.length > 0
          ? `神諭卡 · ${drawn.map(c => c.nameZh).join('、')}`
          : '神諭卡 · 解讀';
      addReading({
        tool: 'oracle',
        question: q || null,
        summary,
        detail: {
          topic,
          spread,
          cards: drawn.map(card => ({
            id: card.id,
            nameZh: card.nameZh,
            tagline: card.tagline,
            image: card.image ?? null,
          })),
          masterReading: masterReading ?? undefined,
        },
      });
      hasSavedRef.current = true;
      toast.success('保存成功 ✅', { duration: 2000 });
    } catch {
      // ignore
    }
  }, [allRevealed, drawn, masterReading, question, spread, topic]);

  const topicLabel =
    topic === 'love'
      ? t('tarot.topicLove')
      : topic === 'career'
      ? t('tarot.topicCareer')
      : topic === 'self'
      ? t('oracle.selfTopic', { defaultValue: '自我與靈魂' })
      : t('tarot.topicGeneral');

  const buildDrawnInputs = (): DrawnCardInput[] => {
    if (!drawn) return [];
    return drawn.map((card, index) => {
      let position = '此刻的能量';
      if (spread === 'three') {
        if (index === 0) position = '當下主題';
        else if (index === 1) position = '內在阻力';
        else position = '宇宙給你的方向';
      }
      return {
        name: card.nameZh,
        position,
        imageUrl: card.image ?? '',
        element: card.element,
        rank: card.rank,
      };
    });
  };

  // 全部翻牌後自動觸發大師解讀一次（僅提問抽牌流程），確保存檔時帶上完整文字解讀
  useEffect(() => {
    if (entryMode !== 'question') return;
    if (!allRevealed || !drawn || masterReading || loadingMaster) return;
    if (hasTriggeredMasterRef.current) return;
    hasTriggeredMasterRef.current = true;
    (async () => {
      setLoadingMaster(true);
      try {
        const cardsInput = buildDrawnInputs();
        const fallbackQuestion = `關於「${topicLabel}」此刻你最需要看見的訊息是什麼？`;
        const q = (question && question.trim()) || fallbackQuestion;
        const reading = await generateMasterReading(q, cardsInput);
        setMasterReading(reading);
      } catch (err) {
        console.error('Failed to generate master oracle reading', err);
      } finally {
        setLoadingMaster(false);
      }
    })();
  }, [entryMode, allRevealed, drawn, masterReading, loadingMaster, question, spread, topic, topicLabel]);

  const handleGenerateMasterReading = async () => {
    if (!drawn || loadingMaster) return;
    setLoadingMaster(true);
    try {
      const cardsInput = buildDrawnInputs();
      const fallbackQuestion =
        `關於「${topicLabel}」此刻你最需要看見的訊息是什麼？`;
      const q = (question && question.trim()) || fallbackQuestion;
      const reading = await generateMasterReading(q, cardsInput);
      setMasterReading(reading);
    } catch (error) {
      console.error('Failed to generate master oracle reading', error);
    } finally {
      setLoadingMaster(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
        {step === 'choose' && (
          <div className="space-y-6">
            {entryMode === 'idle' ? (
              <>
                <div className="text-center">
                  <h3 className="text-body font-semibold tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.95)' }}>
                    {t('oracle.entryTitle', { defaultValue: '如何開始' })}
                  </h3>
                  <p className="text-body-sm text-subtitle mt-1">
                    {t('oracle.entryHint', { defaultValue: '今日一卡：每日固定一張指引；提問抽牌：針對你的問題抽牌解讀' })}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={openDailyOneCard}
                    className="flex flex-col items-center gap-3 py-6 px-4 rounded-xl border-2 transition-all hover:opacity-95 active:scale-[0.98]"
                    style={{
                      borderColor: 'hsla(var(--gold) / 0.5)',
                      background: 'linear-gradient(160deg, hsla(var(--gold) / 0.12), transparent)',
                      color: 'hsl(var(--gold))',
                    }}
                  >
                    <Sparkles size={28} className="opacity-90" />
                    <span className="text-body font-semibold">{t('oracle.dailyOneCard', { defaultValue: '今日一卡' })}</span>
                    <span className="text-body-sm text-subtitle leading-snug">{t('oracle.dailyOneCardDesc', { defaultValue: '同一天同一張指引，儀式感' })}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryMode('question')}
                    className="flex flex-col items-center gap-3 py-6 px-4 rounded-xl border-2 transition-all hover:opacity-95 active:scale-[0.98]"
                    style={{
                      borderColor: 'hsla(var(--accent) / 0.5)',
                      background: 'linear-gradient(160deg, hsla(var(--accent) / 0.12), transparent)',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    <Compass size={28} className="opacity-90" />
                    <span className="text-body font-semibold">{t('oracle.questionDraw', { defaultValue: '提問抽牌' })}</span>
                    <span className="text-body-sm text-subtitle leading-snug">{t('oracle.questionDrawDesc', { defaultValue: '選主題與牌陣，獲完整解讀' })}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h3 className="text-body font-semibold tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.95)' }}>
                    {t('oracle.oracleChooseTopic', { defaultValue: '選擇神諭卡主題' })}
                  </h3>
                  <p className="text-body-sm text-subtitle mt-0.5">
                    {t('oracle.oracleChooseTopicHint', { defaultValue: '先選你最在意的一個面向，再抽卡聽宇宙怎麼說' })}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TOPIC_OPTIONS.map(({ key, labelKey, icon: Icon, defaultLabel }) => {
                    const isActive = topic === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTopic(key)}
                          className="relative flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl text-body font-medium border-2 transition-all"
                        style={{
                          borderColor: isActive ? 'hsl(var(--gold))' : 'hsla(var(--gold) / 0.25)',
                          background: isActive ? 'hsla(var(--gold) / 0.18)' : 'transparent',
                          color: isActive ? 'hsl(var(--gold))' : 'hsl(var(--foreground))',
                        }}
                      >
                        <Icon size={20} strokeWidth={2} />
                        <span>{t(labelKey, { defaultValue: defaultLabel })}</span>
                        {isActive && (
                          <span className="absolute top-1 right-2 text-body-sm text-gold-strong">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="text-center space-y-2 pt-1">
                  <h3 className="text-body-sm font-semibold tracking-widest uppercase text-subtitle">
                    {t('oracle.oracleChooseSpread', { defaultValue: '選擇抽卡方式' })}
                  </h3>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {(['single', 'three'] as OracleSpread[]).map(type => {
                      const isActive = spread === type;
                      const label =
                        type === 'single'
                          ? t('oracle.oracleSingle', { defaultValue: '今日一張指引卡' })
                          : t('oracle.oracleThree', { defaultValue: '三張牌陣' });
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSpread(type)}
                          className="flex-1 min-w-[120px] py-3 px-4 rounded-xl text-body font-medium border-2 transition-all relative"
                          style={{
                            borderColor: isActive ? 'hsl(var(--gold))' : 'hsla(var(--gold) / 0.3)',
                            background: isActive ? 'hsla(var(--gold) / 0.2)' : 'transparent',
                            color: isActive ? 'hsl(var(--gold))' : 'hsl(var(--foreground))',
                            boxShadow: isActive ? '0 0 0 1px hsla(var(--gold) / 0.4)' : 'none',
                          }}
                        >
                          {isActive && (
                            <span className="absolute top-1 right-2 text-body-sm text-gold-strong">✓</span>
                          )}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-body-sm text-gold-strong/90">
                    {spread === 'single'
                      ? t('oracle.oracleSelectedSingleHint', { defaultValue: '適合每日整體能量、小問題、給自己一個當下提醒。' })
                      : t('oracle.oracleSelectedThreeHint', { defaultValue: '當下主題／內在阻力／宇宙方向，可隨意點任一張先翻開。' })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startShuffle}
                  className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-base font-semibold transition-all hover:opacity-95 active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, hsla(var(--gold) / 0.25), hsla(var(--accent) / 0.2))',
                    border: '2px solid hsla(var(--gold) / 0.5)',
                    color: 'hsl(var(--gold))',
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  <Sparkles size={18} />
                  {t('oracle.oracleShuffleAndDraw', { defaultValue: '洗牌並抽卡' })}
                </button>
              </>
            )}
          </div>
        )}

        {step === 'shuffling' && (
          <div className="py-10 flex flex-col items-center justify-center gap-5">
            <div className="flex gap-2">
              {Array(spread === 'three' ? 3 : 1)
                .fill(0)
                .map((_, idx) => (
                  <CardBack key={idx} />
                ))}
            </div>
            <p className="text-sm text-subtitle tracking-wider">
              {t('oracle.oracleShufflingHint', { defaultValue: '洗牌中，請在心裡清楚地重複你的問題…' })}
            </p>
          </div>
        )}

        {step === 'draw' && drawn && (
          <div className="space-y-6">
            {entryMode === 'daily' ? (
              <div className="rounded-xl p-5 space-y-5" style={{ background: 'linear-gradient(165deg, hsla(var(--gold)/0.08), hsla(var(--card)/0.98))' }}>
                <p className="text-center text-body-sm tracking-widest uppercase text-subtitle">
                  {t('oracle.dailyOneCardTitle', { defaultValue: '今日一卡' })}
                </p>
                <div className="flex justify-center">
                  {drawn[0] && (() => {
                    const card = drawn[0];
                    return (
                      <div
                        className="relative rounded-xl overflow-hidden border-2 flex flex-col"
                        style={{
                          background: 'linear-gradient(165deg, rgba(40,20,80,0.98) 0%, rgba(12,6,30,0.98) 45%, rgba(60,30,100,0.95) 100%)',
                          borderColor: 'hsla(var(--gold) / 0.6)',
                          boxShadow: '0 10px 32px rgba(0,0,0,0.4)',
                          minWidth: CARD_WIDTH,
                          minHeight: CARD_HEIGHT,
                        }}
                      >
                        {card.image ? (
                          <>
                            <div className="relative flex-1 min-h-0 flex items-stretch">
                              <img src={card.image} alt={card.nameZh} className="w-full object-cover object-center" />
                            </div>
                            <div className="relative p-2 text-center border-t border-gold-strong/30 bg-black/35">
                              <p className="text-body-sm font-bold truncate" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>{card.nameZh}</p>
                              <p className="text-body-sm text-subtitle mt-0.5 truncate">{card.tagline}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="relative p-3 text-center border-b border-gold-strong/30 bg-black/35">
                              <p className="text-body font-bold truncate" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>{card.nameZh}</p>
                              <p className="text-body-sm text-subtitle mt-0.5">{card.tagline}</p>
                            </div>
                            <div className="relative flex-1 flex items-center justify-center p-3">
                              <p className="text-body-sm text-subtitle text-center leading-snug line-clamp-4">{card.shortHint}</p>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
                {drawn[0]?.message && (
                  <div className="rounded-lg p-4 text-left" style={{ background: 'hsla(var(--card)/0.6)' }}>
                    <p className="text-body text-subtitle leading-relaxed whitespace-pre-wrap">{drawn[0].message}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={backToEntryChoice}
                  className="w-full py-3 rounded-xl text-body font-medium border border-gold-strong/40 hover:bg-gold-strong/10 transition-colors"
                  style={{ color: 'hsl(var(--gold))' }}
                >
                  {t('oracle.goDeeper', { defaultValue: '想更深入？問一個問題，抽牌獲取完整解讀' })}
                </button>
              </div>
            ) : (
              <>
              <div className="space-y-2 rounded-xl p-4" style={{ background: 'hsla(var(--card) / 0.98)' }}>
              <div className="text-center space-y-1">
                <p className="text-body-sm text-subtitle tracking-wider">
                  {t('oracle.oracleDrawHeader', {
                    defaultValue: '本次為「{{topic}}」抽出的神諭卡，下方是宇宙給你的訊息。',
                    topic: topicLabel,
                  })}
                </p>
                {spread === 'three' && (
                  <p className="text-body-sm text-subtitle mt-1">
                    {t('oracle.energyFlowHint', { defaultValue: '我們看的是三張牌之間的能量流動，而不只是三張獨立牌義。' })}
                  </p>
                )}
                {!allRevealed && drawn.length > 1 && (
                  <p className="text-body-sm text-subtitle mt-1">
                    {t('tarot.tapNext', { defaultValue: '請隨意點擊任一張牌背翻開，每一張都蘊含一個面向' })}
                  </p>
                )}
              </div>
              <div className="flex gap-5 justify-center items-end flex-wrap">
                {drawn.map((card, i) => {
                  const isRevealed = revealedIndices.includes(i);
                  const canTap = !isRevealed;
                  const positionKey = spread === 'three' ? (['oracle.position1', 'oracle.position2', 'oracle.position3'] as const)[i] : null;
                  const positionLabel = positionKey ? t(positionKey, { defaultValue: ORACLE_POSITION_LABELS_THREE[i] }) : null;
                  return (
                    <div key={`${card.id}-${i}`} className="flex flex-col items-center gap-2">
                      {positionLabel && <span className="text-body-sm tracking-wider uppercase text-subtitle">{positionLabel}</span>}
                      <button
                        type="button"
                        disabled={!canTap}
                        onClick={() =>
                          setRevealedIndices(prev =>
                            prev.includes(i) ? prev : [...prev, i],
                          )
                        }
                        className="rounded-xl overflow-hidden"
                        style={{ cursor: canTap ? 'pointer' : 'default' }}
                      >
                        {isRevealed ? (
                          <div
                            className="relative rounded-xl overflow-hidden border-2 flex flex-col"
                            style={{
                              background:
                                'linear-gradient(165deg, rgba(40,20,80,0.98) 0%, rgba(12,6,30,0.98) 45%, rgba(60,30,100,0.95) 100%)',
                              borderColor: 'hsla(var(--gold) / 0.6)',
                              boxShadow: '0 10px 32px rgba(0,0,0,0.4)',
                              minWidth: CARD_WIDTH,
                              minHeight: CARD_HEIGHT,
                            }}
                          >
                            {card.image ? (
                              <>
                                <div className="relative flex-1 min-h-0 flex items-stretch">
                                  <img
                                    src={card.image}
                                    alt={card.nameZh}
                                    className="w-full object-cover object-center"
                                  />
                                </div>
                                <div className="relative p-2 text-center border-t border-gold-strong/30 bg-black/35">
                                  <p
                                    className="text-body-sm font-bold text-heading truncate"
                                    style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}
                                  >
                                    {card.nameZh}
                                  </p>
                                  <p className="text-body-sm text-subtitle mt-0.5 truncate">
                                    {card.tagline}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="relative p-3 text-center border-b border-gold-strong/30 bg-black/35">
                                  <p
                                    className="text-body font-bold text-heading truncate"
                                    style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}
                                  >
                                    {card.nameZh}
                                  </p>
                                  <p className="text-body-sm text-subtitle mt-0.5">
                                    {card.tagline}
                                  </p>
                                </div>
                                <div className="relative flex-1 flex items-center justify-center p-3">
                                  <p className="text-body-sm text-subtitle text-center leading-snug line-clamp-4">
                                    {card.shortHint}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div
                            className="rounded-xl flex items-center justify-center"
                            style={{
                              ...CARD_BACK_STYLE,
                              minWidth: CARD_WIDTH,
                              minHeight: CARD_HEIGHT,
                              opacity: canTap ? 1 : 0.85,
                            }}
                          >
                            <div className="relative rounded-full w-10 h-10 flex items-center justify-center border-2 border-gold-strong/40 bg-black/30">
                              <Sparkles size={18} className="text-gold-strong/80" />
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {allRevealed && (
                <div className="mt-3 space-y-3">
                  {question.trim() && (
                    <p className="text-body-sm text-subtitle/90 italic text-center">
                      {t('oracle.oracleQuestionEcho', { defaultValue: '你心中的問題：' })}{' '}
                      「{question.length > 48 ? `${question.slice(0, 46)}…` : question}」
                    </p>
                  )}
                  <div className="space-y-3">
                    {drawn.map((card, index) => (
                      <div
                        key={`${card.id}-reading`}
                        className="rounded-xl border px-4 py-3 space-y-2"
                        style={{
                          background: 'hsla(var(--card) / 0.95)',
                          borderColor: 'hsla(var(--gold) / 0.4)',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {card.image && (
                            <img
                              src={card.image}
                              alt={card.nameZh}
                              className="w-14 h-20 object-cover rounded-lg flex-shrink-0 border border-gold-strong/30"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-body font-semibold text-heading truncate"
                              style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}
                            >
                              {spread === 'three'
                                ? `${index + 1}. ${card.nameZh}`
                                : card.nameZh}
                            </p>
                            <p className="text-body-sm text-subtitle mt-0.5">
                              {card.tagline}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-body-sm font-medium tracking-widest uppercase text-subtitle">
                            {t('oracle.oracleMessage', { defaultValue: '宇宙給你的訊息' })}
                          </p>
                          <p className="text-sm leading-relaxed text-body whitespace-pre-line">
                            {card.message}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-body-sm font-medium tracking-widest uppercase text-subtitle">
                            {t('oracle.oracleAction', { defaultValue: '可以立刻採取的小行動' })}
                          </p>
                          <p className="text-sm leading-relaxed text-body whitespace-pre-line">
                            {card.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 大師級解讀入口與展示區（先在神諭卡內測試效果） */}
                  <div className="pt-3 space-y-2">
                    <p className="text-body-sm text-subtitle text-center">
                      想要更聚焦陰影與轉化方向，可以試試一段「大師級解讀」。
                    </p>
                    <button
                      type="button"
                      onClick={handleGenerateMasterReading}
                      disabled={loadingMaster}
                      className="w-full py-2.5 rounded-xl text-body font-semibold tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background:
                          'linear-gradient(135deg, hsla(var(--gold) / 0.22), hsla(var(--accent) / 0.22))',
                        border: '1px solid hsla(var(--gold) / 0.45)',
                        color: 'hsl(var(--gold))',
                        fontFamily: 'var(--font-serif)',
                      }}
                    >
                      <Sparkles size={16} />
                      {loadingMaster
                        ? '正在連接大師級解讀…'
                        : '生成大師級解讀（示意版）'}
                    </button>
                    {masterReading && (
                      <MasterOracleReadingView
                        reading={masterReading}
                        isUnlocked={hasPremiumAccess}
                        unlocking={unlockingPremium}
                        onUnlock={async () => {
                          if (hasPremiumAccess) return;
                          setUnlockingPremium(true);
                          // 未付費用戶點擊解鎖：可導向訂閱頁；此處保留示意延遲後關閉
                          setTimeout(() => {
                            setUnlockingPremium(false);
                          }, 600);
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
              </>
            )}

            {allRevealed && entryMode === 'question' && (
              <div className="space-y-3">
                {masterReading && (
                  <button
                    type="button"
                    onClick={handleShareReading}
                    disabled={shareLoading}
                    className="w-full py-2.5 rounded-xl text-body font-medium flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-[0.98] border border-gold-strong/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ color: 'hsl(var(--gold))' }}
                  >
                    <Share2 size={16} />
                    {shareCopied
                      ? t('oracle.shareCopied', { defaultValue: '已保存高清圖片' })
                      : shareLoading
                      ? t('oracle.saveImage', { defaultValue: '生成圖片中…' })
                      : t('oracle.shareReading', { defaultValue: '分享本次解讀' })}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setStep('choose');
                    setEntryMode('question');
                    setDrawn(null);
                    setRevealedIndices([]);
                  }}
                  className="w-full py-3 rounded-xl text-body font-semibold tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, hsla(var(--gold) / 0.18), hsla(var(--accent) / 0.18))',
                    border: '1px solid hsla(var(--gold) / 0.35)',
                    color: 'hsl(var(--gold))',
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  {t('oracle.oracleDrawAgain', { defaultValue: '再抽一次神諭卡' })}
                </button>
              </div>
            )}
          </div>
        )}
      {masterReading && drawn && (
        <OracleShareCanvas
          ref={shareCanvasRef}
          question={question}
          cards={drawn}
          reading={masterReading}
        />
      )}
    </div>
  );
}

