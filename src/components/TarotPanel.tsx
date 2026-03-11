/**
 * 塔羅占卜面板 · 主題＋牌陣 → 洗牌 → 抽牌 → 翻牌即顯示解讀（無需再點）
 * （已按你的要求，弱化動畫與效果，以穩定為主）
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Heart,
  Briefcase,
  Compass,
  Lock,
} from 'lucide-react';
import {
  getRandomDraw,
  type TarotCardEntry,
  type SpreadKind,
} from '@/lib/tarotCards';
import { getTarotAllowReversed } from '@/lib/tarotSettings';
import { isDreamQuestion } from '@/lib/dreamQuestionIntent';
import { buildTarotMasterReading, categoryToTarotTopic, type TarotTopic as TarotMasterTopic } from '@/lib/tarotMasterReading';
import { detectQuestionCategory } from '@/lib/questionClassification';
import type { OracleReading } from '@/lib/oracleMasterReading';
import MasterOracleReadingView, { MasterOracleReadingPaidSection } from '@/components/MasterOracleReadingView';
import { useReadingBack } from '@/contexts/ReadingBackContext';
import { useTarotDrawing } from '@/contexts/TarotDrawingContext';
import { addReading } from '@/lib/readingHistory';
import { toast } from 'sonner';
import { GlassCard } from '@/components/ui/glass-card';
import { PrimaryButton } from '@/components/ui/primary-button';

export type SpreadType = SpreadKind;

/**
 * 占卜主題：對齊主流 App 的細分方向
 * - 愛情 / 婚姻家庭 / 事業工作 / 學業考試 / 財運金錢 / 健康 / 人際社交 / 心靈成長 / 人生方向 / 綜合
 */
export type TarotTopic =
  | 'love'
  | 'marriage'
  | 'career'
  | 'study'
  | 'wealth'
  | 'health'
  | 'relationship'
  | 'spiritual'
  | 'life'
  | 'general';

interface TarotPanelProps {
  date: Date;
  spreadType?: SpreadType;
  className?: string;
  /** 來自聖殿入口的問題（與神諭卡同方式：頂部輸入，此處只讀） */
  externalQuestion?: string;
  /** 來自聖殿入口的「所選大類」（避免題面不含關鍵詞時誤分類） */
  forcedQuickPickCategoryId?: string;
  /** 是否已訂閱，用於大師級解讀「深度轉化區」的顯示 */
  hasPremiumAccess?: boolean;
}

type Step = 'choose' | 'shuffling' | 'draw';

/** 牌面尺寸：放大以便看清，約 2:3 比例 */
const CARD_WIDTH = 128;
const CARD_HEIGHT = 200;

/** 牌正面依花色顯示不同漸層與符號（無圖庫時用符號區分） */
const SUIT_STYLE: Record<string, { bg: string; symbol: string }> = {
  major: { bg: 'linear-gradient(165deg, rgba(80,40,20,0.95) 0%, rgba(20,8,4,0.98) 50%, rgba(60,25,10,0.95) 100%)', symbol: '✦' },
  wands: { bg: 'linear-gradient(165deg, rgba(120,50,10,0.95) 0%, rgba(30,12,4,0.98) 50%, rgba(80,35,5,0.95) 100%)', symbol: '🔥' },
  cups: { bg: 'linear-gradient(165deg, rgba(20,50,90,0.95) 0%, rgba(8,20,40,0.98) 50%, rgba(15,45,80,0.95) 100%)', symbol: '💧' },
  swords: { bg: 'linear-gradient(165deg, rgba(60,70,100,0.95) 0%, rgba(25,28,45,0.98) 50%, rgba(45,55,85,0.95) 100%)', symbol: '⚔' },
  pentacles: { bg: 'linear-gradient(165deg, rgba(90,70,30,0.95) 0%, rgba(35,28,10,0.98) 50%, rgba(70,55,20,0.95) 100%)', symbol: '🪙' },
};

const CARD_BACK_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 20% 15%, rgba(255,240,210,0.25) 0, transparent 55%),' +
    'radial-gradient(circle at 80% 85%, rgba(255,220,170,0.22) 0, transparent 55%),' +
    'linear-gradient(160deg, #0f0505 0%, #1a0d0d 30%, #2a1515 50%, #1a0d0d 70%, #0f0505 100%)',
  border: '2px solid hsla(var(--gold) / 0.52)',
  boxShadow: '0 10px 26px rgba(0,0,0,0.65), inset 0 0 30px hsla(var(--gold)/0.15)',
};

/** 從每張牌的整體建議中，抽取一句「短期行動」作為精簡行動點 */
function extractShortActionFromAdvice(advice?: string): string | null {
  if (!advice) return null;

  // 優先抓取「短期行動：」後面的第一句或片語
  const shortActionMatch = advice.match(/短期行動[:：]\s*([^。\n]+)/);
  if (shortActionMatch && shortActionMatch[1]) {
    return shortActionMatch[1].trim();
  }

  // 其次抓取「建議：」後面的第一句或片語
  const suggestionMatch = advice.match(/建議[:：]\s*([^。\n]+)/);
  if (suggestionMatch && suggestionMatch[1]) {
    return suggestionMatch[1].trim();
  }

  // 都沒有時，退回到前 60 個字作為摘要
  const trimmed = advice.replace(/\s+/g, ' ').trim();
  if (!trimmed) return null;
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
}

/** 牌背：經典塔羅幾何紋樣 */
function CardBack({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-xl flex items-center justify-center overflow-hidden ${className}`}
      style={{
        ...CARD_BACK_STYLE,
        minWidth: CARD_WIDTH,
        minHeight: CARD_HEIGHT,
      }}
      initial={{ scale: 0.95, opacity: 0.9 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="absolute inset-1 rounded-lg border border-gold-strong/25 flex items-center justify-center">
        <div className="w-full h-full opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 6px, hsla(var(--gold)/0.15) 6px, hsla(var(--gold)/0.15) 8px), repeating-linear-gradient(-45deg, transparent, transparent 6px, hsla(var(--gold)/0.12) 6px, hsla(var(--gold)/0.12) 8px)',
        }} />
      </div>
      <div className="relative rounded-full w-12 h-12 flex items-center justify-center border-2 border-gold-strong/40 bg-black/40">
        <Layers size={22} className="text-gold-strong/80" />
      </div>
    </motion.div>
  );
}

function CardFace({
  card,
  upright,
  positionLabel,
  isRevealed,
  onReveal,
  delay = 0, // 保留參數以兼容現有呼叫，但不再用於複雜動畫
  canTap,
}: {
  card: TarotCardEntry;
  upright: boolean;
  positionLabel?: string;
  isRevealed: boolean;
  onReveal?: () => void;
  delay?: number;
  canTap?: boolean;
}) {
  const { t } = useTranslation();
  const orientationLabel = upright
    ? t('tarot.upright', { defaultValue: '正位' })
    : t('tarot.reversed', { defaultValue: '逆位' });

  const suitStyle = SUIT_STYLE[card.suit] ?? SUIT_STYLE.major;

  // 1) 未翻開：只顯示牌背，點一次即可翻開；不做 3D 動畫
  if (!isRevealed) {
    return (
      <div
        className="rounded-xl flex flex-col items-center justify-center gap-1.5 relative overflow-hidden cursor-pointer"
        style={{ ...CARD_BACK_STYLE, minWidth: CARD_WIDTH, minHeight: CARD_HEIGHT, opacity: canTap ? 1 : 0.85 }}
        onClick={canTap && onReveal ? onReveal : undefined}
      >
        <div
          className="absolute inset-1 rounded-lg border border-gold-strong/20 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 4px, hsla(var(--gold)/0.12) 4px, hsla(var(--gold)/0.12) 6px)',
          }}
        />
        <div className="relative rounded-full w-10 h-10 flex items-center justify-center border-2 border-gold-strong/40 bg-black/30">
          <Layers size={18} className="text-gold-strong/80" />
        </div>
        {canTap && (
          <span className="relative text-[9px] text-gold-strong/90 tracking-widest">
            點擊翻牌
          </span>
        )}
      </div>
    );
  }

  // 2) 已翻開：穩定顯示牌面與圖案，文字永遠保持正向
  return (
    <div
      className="relative rounded-xl overflow-hidden border-2 flex flex-col"
      style={{
        background: suitStyle.bg,
        borderColor: 'hsla(var(--gold) / 0.55)',
        boxShadow: '0 10px 32px rgba(0,0,0,0.4)',
        minWidth: CARD_WIDTH,
        minHeight: CARD_HEIGHT,
      }}
    >
      {/* 幾何紋樣讓牌面看起來有「圖案」而不是純色 */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 6px, hsla(var(--gold)/0.12) 6px, hsla(var(--gold)/0.12) 8px),' +
            'repeating-linear-gradient(-45deg, transparent, transparent 6px, hsla(var(--gold)/0.10) 6px, hsla(var(--gold)/0.10) 8px)',
        }}
      />
      <div className="relative p-2.5 text-center border-b border-gold-strong/25 bg-black/25">
        <p
          className="text-sm font-bold text-heading truncate"
          style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}
        >
          {card.nameZh}
        </p>
        <p className="text-sm text-subtitle mt-0.5">
          {positionLabel && `${positionLabel} · `}
          {orientationLabel}
        </p>
      </div>
      <div className="relative flex-1 flex items-center justify-center p-0.5">
        {card.image ? (
          <img
            src={card.image}
            alt={card.nameZh}
            className="w-full h-full object-cover rounded-b-[0.9rem]"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full border border-gold-strong/60 bg-black/35 flex items-center justify-center shadow-inner"
            style={{
              boxShadow: '0 0 24px rgba(0,0,0,0.6), inset 0 0 18px rgba(0,0,0,0.8)',
            }}
          >
            <span className="text-4xl opacity-95" aria-hidden>
              {suitStyle.symbol}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadingBlock({
  card,
  upright,
  positionLabel,
  defaultExpanded = true,
  topic = 'general',
}: {
  card: TarotCardEntry;
  upright: boolean;
  positionLabel?: string;
  defaultExpanded?: boolean;
  topic?: TarotTopic;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const meaning = upright ? card.upright : card.reversed;
  const orientationLabel = upright ? t('tarot.upright', { defaultValue: '正位' }) : t('tarot.reversed', { defaultValue: '逆位' });

  // 依主題挑選對應欄位。重要：感情類（love/marriage/relationship）只顯示愛情維度，絕不顯示事業、財運。
  // - 愛情 / 婚姻 / 人際關係：僅 card.love
  // - 事業 / 學業 / 人生方向：僅 card.career
  // - 財運：僅 card.wealth
  // - 健康：card.health 或 card.advice
  // - 心靈成長：card.advice
  const highlightSection =
    topic !== 'general'
      ? topic === 'love'
        ? card.love
        : topic === 'marriage'
        ? card.love
        : topic === 'relationship'
        ? card.love
        : topic === 'career'
        ? card.career
        : topic === 'study'
        ? card.career
        : topic === 'life'
        ? card.career
        : topic === 'wealth'
        ? card.wealth
        : topic === 'health'
        ? card.health || card.advice || meaning
        : topic === 'spiritual'
        ? card.advice || meaning
        : null
      : null;

  const highlightLabel =
    topic === 'love'
      ? '愛情'
      : topic === 'marriage'
      ? '婚姻家庭'
      : topic === 'career'
      ? '事業'
      : topic === 'study'
      ? '學業 / 考試'
      : topic === 'wealth'
      ? '財運'
      : topic === 'health'
      ? '健康'
      : topic === 'relationship'
      ? '人際關係'
      : topic === 'spiritual'
      ? '心靈成長'
      : topic === 'life'
      ? '人生方向'
      : '重點';

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'hsla(var(--card) / 0.92)',
        borderColor: 'hsla(var(--gold) / 0.4)',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
        style={{
          background: 'hsla(var(--gold) / 0.1)',
          borderBottom: expanded ? '1px solid hsla(var(--gold) / 0.2)' : 'none',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'hsla(var(--gold) / 0.18)',
              border: '1px solid hsla(var(--gold) / 0.35)',
            }}
          >
            <Layers size={20} style={{ color: 'hsl(var(--gold))' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading truncate" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
              {card.nameZh}
            </p>
            <p className="text-sm text-subtitle">
              {positionLabel && `${positionLabel} · `}{orientationLabel}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-subtitle shrink-0" /> : <ChevronDown size={16} className="text-subtitle shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 py-3 space-y-3 text-body">
          {topic !== 'general' && highlightSection && (
            <div className="p-3 rounded-lg border border-gold-strong/30 bg-gold-soft/15">
              <p className="text-sm font-semibold tracking-widest uppercase text-gold-strong mb-1">
                {highlightLabel}
              </p>
              <p className="text-sm leading-relaxed">{highlightSection}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium tracking-widest uppercase text-subtitle mb-1">
              {t('tarot.meaning', { defaultValue: '牌義' })}
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-line">{meaning}</p>
          </div>
          <div>
            <p className="text-sm font-medium tracking-widest uppercase text-subtitle mb-1">
              {t('tarot.keywords', { defaultValue: '關鍵詞' })}
            </p>
            <p className="text-sm text-body">{card.keywords.join(' · ')}</p>
          </div>
          {/* 感情類只顯示愛情，絕不顯示事業、財運；若已在上方「重點」區塊顯示過愛情則不再重複 */}
          {(topic === 'love' || topic === 'marriage' || topic === 'relationship') && card.love && !highlightSection && (
            <div className="pt-1 border-t border-border/50">
              <p className="text-sm"><span className="text-subtitle font-medium">愛情：</span>{card.love}</p>
            </div>
          )}
          {(topic === 'career' || topic === 'study' || topic === 'life') && card.career && (
            <div className="pt-1 border-t border-border/50">
              <p className="text-sm"><span className="text-subtitle font-medium">事業：</span>{card.career}</p>
            </div>
          )}
          {topic === 'wealth' && card.wealth && (
            <div className="pt-1 border-t border-border/50">
              <p className="text-sm"><span className="text-subtitle font-medium">財運：</span>{card.wealth}</p>
            </div>
          )}
          {topic === 'health' && (card.health || card.advice) && (
            <div className="pt-1 border-t border-border/50">
              <p className="text-sm"><span className="text-subtitle font-medium">健康：</span>{card.health || card.advice}</p>
            </div>
          )}
          <p className="text-sm italic border-l-2 border-gold-strong/50 pl-3" style={{ color: 'hsla(var(--gold) / 0.95)' }}>
            {card.advice}
          </p>
        </div>
      )}
    </div>
  );
}

interface SpreadSummaryProps {
  drawn: { card: TarotCardEntry; upright: boolean }[];
  topic: TarotTopic;
  spreadType: SpreadType;
  question: string;
}

function SpreadSummary({ drawn, topic, spreadType, question }: SpreadSummaryProps) {
  const { t } = useTranslation();

  // 夢境類提問已有專門的「鏡像復述 + 靈魂核心啟示」結構，避免再用一般牌陣總結重複/跑題
  if (isDreamQuestion(question)) return null;

  if (!drawn || drawn.length <= 1) return null;

  const q = question.trim();
  const isDecisionAB =
    /\bA\b/i.test(q) ||
    /\bB\b/i.test(q) ||
    q.includes('A還是B') ||
    q.includes('A还是B') ||
    q.includes('選A') ||
    q.includes('选A') ||
    q.includes('選B') ||
    q.includes('选B') ||
    q.includes('A or B') ||
    q.includes('A/B');

  const topicLabel =
    topic === 'love'
      ? '愛情'
      : topic === 'marriage'
      ? '婚姻家庭'
      : topic === 'career'
      ? '事業'
      : topic === 'study'
      ? '學業 / 考試'
      : topic === 'wealth'
      ? '財運'
      : topic === 'health'
      ? '健康'
      : topic === 'relationship'
      ? '人際關係'
      : topic === 'spiritual'
      ? '心靈成長'
      : topic === 'life'
      ? '人生方向'
      : '此刻主題';

  const spreadLabel =
    spreadType === 'three'
      ? t('tarot.threeCardSpread', { defaultValue: '三張牌陣' })
      : spreadType === 'relationship'
      ? t('tarot.relationshipSpread', { defaultValue: '感情關係 5 張' })
      : spreadType === 'horseshoe'
      ? t('tarot.horseshoeSpread', { defaultValue: '七張馬蹄牌陣' })
      : '';

  const positionLabels: string[] =
    spreadType === 'three'
      ? isDecisionAB
        ? [t('tarot.choiceA', { defaultValue: '方案 A' }), t('tarot.choiceB', { defaultValue: '方案 B' }), t('tarot.choiceKey', { defaultValue: '關鍵建議' })]
        : [t('tarot.past', { defaultValue: '過去' }), t('tarot.present', { defaultValue: '當下' }), t('tarot.future', { defaultValue: '未來' })]
      : spreadType === 'relationship'
      ? [t('tarot.rel_you', { defaultValue: '你' }), t('tarot.rel_other', { defaultValue: '對方' }), t('tarot.rel_core', { defaultValue: '關係核心' }), t('tarot.rel_block', { defaultValue: '阻礙' }), t('tarot.rel_advice', { defaultValue: '發展建議' })]
      : spreadType === 'horseshoe'
      ? [t('tarot.horseshoe_past', { defaultValue: '過去' }), t('tarot.horseshoe_present', { defaultValue: '當前' }), t('tarot.horseshoe_future', { defaultValue: '走向' }), t('tarot.horseshoe_advice', { defaultValue: '建議' }), t('tarot.horseshoe_external', { defaultValue: '外在' }), t('tarot.horseshoe_inner', { defaultValue: '內在' }), t('tarot.horseshoe_outcome', { defaultValue: '結果' })]
      : [];

  const getSectionText = (card: TarotCardEntry, upright: boolean): string | null => {
    const meaning = upright ? card.upright : card.reversed;
    if (topic === 'love' || topic === 'marriage' || topic === 'relationship') {
      return card.love || card.advice || meaning;
    }
    if (topic === 'career' || topic === 'study' || topic === 'life') {
      return card.career || card.advice || meaning;
    }
    if (topic === 'wealth') {
      return card.wealth || card.advice || meaning;
    }
    if (topic === 'health') {
      return card.health || card.advice || meaning;
    }
    if (topic === 'spiritual') {
      return card.advice || meaning;
    }
    return card.advice || meaning;
  };

  // 牌陣總結的角色：只做「整體結論」與「行動/抉擇提示」，避免再逐張重複牌義（詳細牌義已在下方「牌面解讀」區塊）
  const getOneLine = (card: TarotCardEntry, upright: boolean): string => {
    const baseText = getSectionText(card, upright);
    return (
      extractShortActionFromAdvice(baseText || card.advice || (upright ? card.upright : card.reversed)) ||
      t('tarot.summaryFallback', { defaultValue: '留意你的節奏與選擇，把重心放回可控的部分。' })
    );
  };

  const displayQuestion = q;
  const isLoveTopic = topic === 'love' || topic === 'marriage' || topic === 'relationship';
  const isCareerLike = topic === 'career' || topic === 'study' || topic === 'wealth' || topic === 'life';

  const closingLine = (() => {
    if (!displayQuestion) return '';
    if (isDecisionAB && spreadType === 'three' && drawn.length >= 3) {
      const a = drawn[0];
      const b = drawn[1];
      const key = drawn[2];
      const aLine = getOneLine(a.card, a.upright);
      const bLine = getOneLine(b.card, b.upright);
      const keyLine = getOneLine(key.card, key.upright);
      const aScore = a.upright ? 1 : 0;
      const bScore = b.upright ? 1 : 0;
      const lean =
        aScore === bScore
          ? t('tarot.choiceLeanNeutral', { defaultValue: '兩邊訊號接近，關鍵在你的優先順序。' })
          : aScore > bScore
          ? t('tarot.choiceLeanA', { defaultValue: '整體更偏向 A，但前提是你能落實「關鍵建議」。' })
          : t('tarot.choiceLeanB', { defaultValue: '整體更偏向 B，但前提是你能落實「關鍵建議」。' });

      return [
        `【${positionLabels[0]}】${a.card.nameZh}：${aLine}`,
        `【${positionLabels[1]}】${b.card.nameZh}：${bLine}`,
        `【${positionLabels[2]}】${key.card.nameZh}：${keyLine}`,
        '',
        lean,
        isCareerLike
          ? t('tarot.choiceChecklistCareer', {
              defaultValue:
                '建議你用三個驗證點做最後一拍：1）哪個選項資訊更透明、可落地；2）三個月內你能交付什麼成果；3）風險爆雷時你是否有緩衝與退路。',
            })
          : t('tarot.choiceChecklistGeneral', {
              defaultValue:
                '建議你用三個驗證點做最後一拍：1）哪個選項更符合你的底線與價值觀；2）哪個能在三個月內看到可驗證的改善；3）遇到阻力時你是否願意為它付出代價。',
            }),
      ].join('\n');
    }
    // 非 A/B：給一段不重複牌義的收束句
    if (isLoveTopic) {
      return t('tarot.summaryCloseLove', {
        defaultValue:
          '這組牌更像是在提醒你：先把自己的需求、底線與溝通方式理清，再談「結果」會更準；當你做對一兩個小動作，關係的空間就會變清晰。',
      });
    }
    return t('tarot.summaryCloseGeneral', {
      defaultValue:
        '這組牌不替你做選擇，但會把「更順的路」與「更卡的點」指出來；把注意力放回你能控制的行動，結果自然會跟著往更好的方向移動。',
    });
  })();

  return (
    <div
      className="rounded-xl border border-gold-strong/40 bg-gold-soft/10 px-4 py-3 space-y-2"
      style={{
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
      }}
    >
      <p className="text-[17px] font-semibold tracking-widest uppercase text-gold-strong">
        {t('tarot.spreadSummary', { defaultValue: '牌陣總結' })}
      </p>
      <p className="text-base text-subtitle">
        {spreadType === 'three' && positionLabels.length >= 3
          ? `整體來看，這組「${spreadLabel}」在【${topicLabel}】上：第一張對應「${positionLabels[0]}」、第二張「${positionLabels[1]}」、第三張「${positionLabels[2]}」，提醒你特別留意以下幾點—`
          : t('tarot.spreadSummaryIntro', {
              defaultValue: '整體來看，這組「{{spread}}」在【{{topic}}】上提醒你特別留意以下幾點：',
              spread: spreadLabel,
              topic: topicLabel,
            })}
      </p>
      {displayQuestion && (
        <p className="text-base text-subtitle/90 italic">
          針對你心中的問題：「{displayQuestion.length > 42 ? `${displayQuestion.slice(0, 40)}…` : displayQuestion}」
        </p>
      )}
      {closingLine && (
        <div className="pt-2 border-t border-gold-strong/20 mt-2">
          <p className="text-base text-body whitespace-pre-line">{closingLine}</p>
        </div>
      )}
    </div>
  );
}

const TOPIC_OPTIONS: { key: TarotTopic; labelKey: string; icon: typeof Heart }[] = [
  { key: 'love', labelKey: 'tarot.topicLove', icon: Heart },
  { key: 'career', labelKey: 'tarot.topicCareer', icon: Briefcase },
  { key: 'general', labelKey: 'tarot.topicGeneral', icon: Compass },
];

/** 二級主題：在不增加牌義欄位的前提下，細分常見提問方向 */
const SUBTOPIC_GROUPS: Record<
  TarotTopic,
  { key: string; label: string }[]
> = {
  love: [
    { key: 'love_overall', label: '感情整體' },
    { key: 'love_single', label: '脫單 / 桃花' },
    { key: 'love_ex', label: '前任 / 復合' },
    { key: 'love_dev', label: '關係走向' },
  ],
  marriage: [
    { key: 'marriage_overall', label: '婚姻走向' },
    { key: 'marriage_conflict', label: '婚姻矛盾' },
    { key: 'marriage_third', label: '第三者問題' },
  ],
  career: [
    { key: 'career_overall', label: '事業整體' },
    { key: 'career_job', label: '求職 / 跳槽' },
    { key: 'career_promo', label: '升職 / 加薪' },
    { key: 'career_startup', label: '創業 / 副業' },
  ],
  study: [
    { key: 'study_exam', label: '考試 / 升學' },
    { key: 'study_efficiency', label: '學習效率' },
    { key: 'study_direction', label: '科系 / 方向' },
  ],
  wealth: [
    { key: 'wealth_overall', label: '整體財運' },
    { key: 'wealth_invest', label: '投資理財' },
    { key: 'wealth_side', label: '偏財 / 機會' },
    { key: 'wealth_debt', label: '債務壓力' },
  ],
  health: [
    { key: 'health_overall', label: '整體健康' },
    { key: 'health_mental', label: '心理壓力' },
    { key: 'health_recovery', label: '恢復與療癒' },
  ],
  relationship: [
    { key: 'rel_family', label: '家庭關係' },
    { key: 'rel_friends', label: '朋友人際' },
    { key: 'rel_work', label: '職場人際' },
  ],
  spiritual: [
    { key: 'spirit_growth', label: '心靈成長' },
    { key: 'spirit_shadow', label: '陰影療癒' },
    { key: 'spirit_mission', label: '人生課題' },
  ],
  life: [
    { key: 'life_direction', label: '人生方向' },
    { key: 'life_choice', label: '選擇抉擇' },
    { key: 'life_timing', label: '時機與走勢' },
  ],
  general: [
    { key: 'general_today', label: '今日運勢' },
    { key: 'general_period', label: '本週 / 本月' },
    { key: 'general_year', label: '一年整體' },
  ],
};

export default function TarotPanel({
  date,
  spreadType: initialSpread = 'daily',
  className = '',
  externalQuestion,
  forcedQuickPickCategoryId,
  hasPremiumAccess = false,
}: TarotPanelProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('choose');
  const [topic, setTopic] = useState<TarotTopic>('general');
  const [subtopic, setSubtopic] = useState<string | null>(null);
  const [spreadType, setSpreadType] = useState<SpreadType>(initialSpread);
  const [question, setQuestion] = useState(externalQuestion ?? '');
  const [drawn, setDrawn] = useState<{ card: TarotCardEntry; upright: boolean }[] | null>(null);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [masterReading, setMasterReading] = useState<OracleReading | null>(null);
  const readingRef = useRef<HTMLDivElement | null>(null);
  const exportContainerRef = useRef<HTMLDivElement | null>(null);
  const hasSavedReadingRef = useRef(false);
  const readingBack = useReadingBack();
  const { setDrawing: setTarotDrawing } = useTarotDrawing();
  const stepRef = useRef(step);
  stepRef.current = step;
  const doResetToChooseRef = useRef<() => void>(() => {});
  doResetToChooseRef.current = () => {
    setStep('choose');
    setDrawn(null);
    setRevealedIndex(-1);
    setMasterReading(null);
    setShowReadingInline(false);
  };

  // 抽牌中隱藏底部導航，營造全屏沉浸感
  useEffect(() => {
    const drawing = step === 'shuffling' || step === 'draw';
    setTarotDrawing(drawing);
    return () => setTarotDrawing(false);
  }, [step, setTarotDrawing]);

  // 内层返回：在解读结果页点返回先回到选牌/占卜主界面
  useEffect(() => {
    if (!readingBack) return;
    const handler = () => {
      if (stepRef.current === 'choose') return false;
      doResetToChooseRef.current();
      return true;
    };
    readingBack.registerHandler(handler);
    return () => readingBack.unregisterHandler();
  }, [readingBack]);

  // 與神諭卡一致：外部問題同步到本地；有上方問題入口時不再重複選主題，解讀會依問題類別自動對應
  useEffect(() => {
    if (externalQuestion === undefined) return;
    setQuestion(externalQuestion);
  }, [externalQuestion]);

  /** 有上方問題入口時一律不顯示「選擇占卜主題」，主題由問題類別自動對應 */
  const hasQuestionEntry = externalQuestion !== undefined;
  const hasQuestionFromAbove = hasQuestionEntry && (externalQuestion ?? '').trim().length > 0;

  /** 顯示用主題：有問題時依問題分類決定（該不該離婚→愛情），牌陣總結才顯示【愛情】與感情收束句 */
  const effectiveDisplayTopic: TarotTopic = useMemo(() => {
    const forced = (forcedQuickPickCategoryId ?? '').trim();
    if (forced) {
      // Quick pick 的來源優先：用戶明確選了大類，就不要被題面關鍵詞誤判帶偏
      if (forced.includes('感情') || forced.includes('婚姻') || forced.includes('恋爱') || forced.includes('戀愛')) return 'love';
      if (forced.includes('事业') || forced.includes('事業') || forced.includes('工作')) return 'career';
      if (forced.includes('财') || forced.includes('財') || forced.includes('投資') || forced.includes('投资')) return 'wealth';
      if (forced.includes('学') || forced.includes('學') || forced.includes('考')) return 'study';
      if (forced.includes('健康') || forced.includes('身体') || forced.includes('身體')) return 'health';
      if (forced.includes('人际') || forced.includes('人際') || forced.includes('关系') || forced.includes('關係')) return 'relationship';
      if (forced.includes('灵') || forced.includes('靈')) return 'spiritual';
      if (forced.includes('出行') || forced.includes('遷居') || forced.includes('迁居') || forced.includes('選擇') || forced.includes('选择') || forced.includes('決策') || forced.includes('决策')) return 'life';
    }
    const q = question?.trim();
    if (!q) return topic;
    const { category } = detectQuestionCategory(q);
    if (category === '其他') return topic;
    return categoryToTarotTopic(category) as TarotTopic;
  }, [forcedQuickPickCategoryId, question, topic]);

  const positionLabels =
    spreadType === 'three'
      ? [
          t('tarot.past', { defaultValue: '過去' }),
          t('tarot.present', { defaultValue: '當下' }),
          t('tarot.future', { defaultValue: '未來' }),
        ]
      : spreadType === 'relationship'
      ? [
          t('tarot.rel_you', { defaultValue: '你 / 當事人' }),
          t('tarot.rel_other', { defaultValue: '對方狀態' }),
          t('tarot.rel_core', { defaultValue: '關係核心' }),
          t('tarot.rel_block', { defaultValue: '阻礙與課題' }),
          t('tarot.rel_advice', { defaultValue: '發展建議' }),
        ]
      : spreadType === 'horseshoe'
      ? [
          t('tarot.horseshoe_past', { defaultValue: '過去根源' }),
          t('tarot.horseshoe_present', { defaultValue: '當前局勢' }),
          t('tarot.horseshoe_future', { defaultValue: '可見走向' }),
          t('tarot.horseshoe_advice', { defaultValue: '行動建議' }),
          t('tarot.horseshoe_external', { defaultValue: '外在影響' }),
          t('tarot.horseshoe_inner', { defaultValue: '內在狀態' }),
          t('tarot.horseshoe_outcome', { defaultValue: '整體結果' }),
        ]
      : [];

  const startShuffle = useCallback(() => {
    hasSavedReadingRef.current = false;
    setDrawn(null);
    setRevealedIndex(-1);
    setMasterReading(null);
    setStep('shuffling');
    // 洗牌結束後完成抽牌，使用者依序點擊翻牌
    setTimeout(() => {
      const result = getRandomDraw(Date.now(), spreadType, {
        allowReversed: getTarotAllowReversed(),
      });
      setDrawn(result);
      setRevealedIndex(-1);
      setStep('draw');
    }, 1800);
  }, [spreadType]);

  const allRevealed = drawn != null && drawn.length > 0 && revealedIndex === drawn.length - 1;

  // 與神諭卡一致：全部翻開後組裝大師級解讀
  useEffect(() => {
    if (!allRevealed || !drawn?.length) return;
    const reading = buildTarotMasterReading(question, drawn, topic as TarotMasterTopic);
    setMasterReading(reading);
  }, [allRevealed, drawn, question, topic]);

  /** 稍微延遲顯示解讀，確保牌已經翻開一小段時間，再出現解讀區塊 */
  const [showReadingInline, setShowReadingInline] = useState(false);
  useEffect(() => {
    if (!allRevealed) {
      setShowReadingInline(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowReadingInline(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [allRevealed]);

  // 解讀出現時自動滾動到解讀區塊，避免看起來「沒有解讀」
  useEffect(() => {
    if (showReadingInline && readingRef.current) {
      readingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showReadingInline]);

  // 寫入統一「問題與答案」存儲（塔羅）：與神諭卡一致，有問題且有大師解讀時才存
  useEffect(() => {
    if (!drawn || !allRevealed || !masterReading || hasSavedReadingRef.current) return;
    const q = question?.trim();
    if (!q) return;
    try {
      const spreadLabel =
        spreadType === 'daily'
          ? t('tarot.daily', { defaultValue: '今日一牌' })
          : spreadType === 'three'
          ? t('tarot.threeCard', { defaultValue: '三張牌陣' })
          : spreadType === 'relationship'
          ? t('tarot.relationship', { defaultValue: '關係牌陣' })
          : spreadType === 'horseshoe'
          ? t('tarot.horseshoe', { defaultValue: '馬蹄鐵' })
          : spreadType;
      const cardNames = drawn.map(({ card }) => card.nameZh).join('、');
      const summary = `塔羅 · ${spreadLabel} · ${cardNames}`;
      addReading({
        tool: 'tarot',
        question: q,
        summary,
        detail: {
          spreadType,
          topic,
          cards: drawn.map(({ card, upright }) => ({
            id: card.id,
            nameZh: card.nameZh,
            upright,
          })),
          masterReading,
        },
      });
      hasSavedReadingRef.current = true;
      toast.success('保存成功 ✅', { duration: 2000 });
    } catch (_) {}
  }, [allRevealed, drawn, question, masterReading, spreadType, topic, t]);

  return (
    <div className={className}>
        {/* ========== 主界面：oracle-chamber 仿你給的 HTML ========== */}
        {step === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* oracle-chamber 主容器 */}
            <div
              className="mx-auto w-full max-w-[1300px] rounded-[60px] px-4 sm:px-8 py-8 border"
              style={{
                background: 'rgba(6, 2, 12, 0.35)',
                backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                borderColor: 'rgba(212, 175, 55, 0.3)',
                boxShadow: '0 40px 80px -20px black',
              }}
            >
              {/* title-domain 標題區 */}
              <div className="text-center mb-8">
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[8px] mb-3"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: 'linear-gradient(180deg, #f9e2b0, #b38f4a)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 0 30px #ffb86b',
                  }}
                >
                  完整塔羅 · 78 張
                </h1>
                <div
                  className="inline-block text-sm sm:text-base tracking-[6px] px-6 py-1 rounded-[40px]"
                  style={{
                    color: '#cbaf7a',
                    borderTop: '1px solid #b6974b',
                    borderBottom: '1px solid #b6974b',
                    background: 'rgba(10,3,18,0.5)',
                  }}
                >
                  大阿卡那 + 四元素小牌
                </div>
              </div>

              {/* control-panel 控制區 */}
              <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
                {/* spread-selector 牌陣選擇器 */}
                <div
                  className="flex flex-wrap justify-center gap-3 px-4 py-2 rounded-[60px]"
                  style={{
                    background: 'rgba(20, 10, 25, 0.6)',
                    border: '1px solid #a9844a',
                  }}
                >
                  {([
                    { type: 'daily' as SpreadType, label: '單張 · 今日指引' },
                    { type: 'three' as SpreadType, label: '三張 · 時間之流' },
                  ] as const).map(({ type, label }) => {
                    const active = spreadType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSpreadType(type)}
                        className="px-5 py-2 rounded-[40px] text-sm sm:text-base font-medium whitespace-nowrap transition-all duration-300"
                        style={{
                          fontFamily: "'Cinzel', serif",
                          background: active ? '#b69042' : 'transparent',
                          color: active ? '#0c0712' : '#d4b68a',
                          boxShadow: active ? '0 0 20px #fabc2f' : 'none',
                          border: active ? '1px solid #ffdd99' : '1px solid transparent',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* draw-btn 抽牌按鈕 */}
                <button
                  type="button"
                  onClick={startShuffle}
                  className="flex items-center gap-2 px-8 py-3 rounded-[60px] text-lg sm:text-xl font-semibold tracking-[2px] transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: 'linear-gradient(145deg, #4a3a22, #2a1e12)',
                    border: '1px solid #dbb45c',
                    color: '#ffdfa7',
                    boxShadow: '0 0 20px #9e7f45',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#5e4b2e';
                    e.currentTarget.style.boxShadow = '0 0 40px #dbb45c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, #4a3a22, #2a1e12)';
                    e.currentTarget.style.boxShadow = '0 0 20px #9e7f45';
                  }}
                >
                  <Sparkles size={22} />
                  抽牌 · 占卜
                </button>
              </div>

              {/* spread-area 牌陣展示區（抽牌前為空占位） */}
              <div
                className="flex flex-wrap justify-center gap-8 mb-10"
                style={{ perspective: '1200px' }}
              >
                {(spreadType === 'daily' ? ['今日指引'] : ['過去', '現在', '未來']).map((label, idx) => (
                  <div
                    key={label}
                    className="flex flex-col items-center w-[200px] min-w-[160px] rounded-[24px] px-3 py-5 transition-all duration-400"
                    style={{
                      background: 'rgba(10, 5, 15, 0.5)',
                      backdropFilter: 'blur(8px)',
                      border: '2px dashed rgba(180, 147, 72, 0.44)',
                      boxShadow: '0 10px 30px -10px black',
                    }}
                  >
                    <span
                      className="text-sm sm:text-base tracking-[2px] uppercase mb-3"
                      style={{ fontFamily: "'Cinzel', serif", color: '#eace9b' }}
                    >
                      {label}
                    </span>
                    {/* 空牌位提示 */}
                    <div
                      className="w-full aspect-[2/3] rounded-[18px] flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(150deg, #2a1e30, #140e20)',
                        border: '1px solid #ad8f51',
                        boxShadow: '0 10px 20px -5px black',
                      }}
                    >
                      <span className="text-2xl" style={{ color: '#ad8f51' }}>?</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* reading-panel 解讀區雙欄 */}
              <div className="flex flex-wrap gap-8">
                {/* spread-interpretation 左欄：牌陣解讀 */}
                <div
                  className="flex-[2] min-w-[280px] rounded-[40px] p-7"
                  style={{
                    background: 'rgba(10, 5, 18, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                  }}
                >
                  <h3
                    className="text-xl sm:text-2xl mb-6 pb-2 flex items-center gap-3"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: '#e7cf9c',
                      borderBottom: '1px solid #b5944b',
                    }}
                  >
                    <span className="text-2xl">🔮</span> 牌陣解讀
                  </h3>
                  <p
                    className="text-lg sm:text-xl leading-relaxed"
                    style={{ color: '#f2e1ba' }}
                  >
                    點擊抽牌，開啟占卜
                  </p>
                </div>

                {/* card-detail-panel 右欄：單牌詳解 */}
                <div
                  className="flex-1 min-w-[240px] rounded-[40px] p-7"
                  style={{
                    background: 'rgba(10, 5, 18, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                  }}
                >
                  <h3
                    className="text-xl sm:text-2xl mb-6 pb-2 flex items-center gap-3"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: '#e7cf9c',
                      borderBottom: '1px solid #b5944b',
                    }}
                  >
                    <span className="text-2xl">⭐</span> 單牌詳解
                  </h3>
                  <p style={{ color: '#d3c7b0' }}>
                    點擊任意牌查看詳細解讀
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step: 洗牌中 */}
        {step === 'shuffling' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 flex flex-col items-center justify-center gap-6"
          >
            <div
              className="rounded-[40px] px-10 py-8 text-center"
              style={{
                background: 'rgba(10, 5, 18, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 20px 60px -10px black',
              }}
            >
              <div className="flex justify-center gap-4 mb-6">
                {Array(spreadType === 'three' ? 3 : 1)
                  .fill(0)
                  .map((_, idx) => (
                    <CardBack key={idx} />
                  ))}
              </div>
              <p
                className="text-lg sm:text-xl tracking-[4px]"
                style={{ color: '#f2e1ba', fontFamily: "'Cinzel', serif" }}
              >
                洗牌中，請專注你的問題…
              </p>
            </div>
          </motion.div>
        )}

        {/* Step: 抽牌結果 —— 完全按照你給的 HTML 結構 */}
        {step === 'draw' && drawn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* oracle-chamber 主容器 */}
            <div
              ref={exportContainerRef as any}
              className="mx-auto w-full max-w-[1300px] rounded-[60px] px-4 sm:px-8 py-8 border"
              style={{
                background: 'rgba(6, 2, 12, 0.35)',
                backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                borderColor: 'rgba(212, 175, 55, 0.3)',
                boxShadow: '0 40px 80px -20px black',
              }}
            >
              {/* title-domain 標題區 */}
              <div className="text-center mb-8">
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[8px] mb-3"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: 'linear-gradient(180deg, #f9e2b0, #b38f4a)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 0 30px #ffb86b',
                  }}
                >
                  完整塔羅 · 78 張
                </h1>
                <div
                  className="inline-block text-sm sm:text-base tracking-[6px] px-6 py-1 rounded-[40px]"
                  style={{
                    color: '#cbaf7a',
                    borderTop: '1px solid #b6974b',
                    borderBottom: '1px solid #b6974b',
                    background: 'rgba(10,3,18,0.5)',
                  }}
                >
                  {spreadType === 'daily' ? '單張 · 今日指引' : '三張 · 時間之流'}
                </div>
              </div>

              {/* spread-area 牌陣展示區（已抽出的牌） */}
              <div
                className="flex flex-wrap justify-center gap-8 mb-10"
                style={{ perspective: '1200px' }}
              >
                {drawn.map((item, i) => {
                  const label = positionLabels[i] || (spreadType === 'daily' ? '今日指引' : '');
                  const isRevealed = i <= revealedIndex;
                  const canTap = i === revealedIndex + 1;

                  return (
                    <div
                      key={`slot-${i}-${item.card.id}`}
                      className="flex flex-col items-center w-[200px] min-w-[160px] rounded-[24px] px-3 py-5 transition-all duration-400"
                      style={{
                        background: 'rgba(10, 5, 15, 0.5)',
                        backdropFilter: 'blur(8px)',
                        border: isRevealed ? '2px solid #ffd966' : '2px dashed rgba(180, 147, 72, 0.44)',
                        boxShadow: isRevealed ? '0 0 40px rgba(250, 188, 47, 0.5)' : '0 10px 30px -10px black',
                      }}
                    >
                      {/* slot-label 位置標籤 */}
                      <span
                        className="text-sm sm:text-base tracking-[2px] uppercase mb-3"
                        style={{ fontFamily: "'Cinzel', serif", color: '#eace9b' }}
                      >
                        {label}
                      </span>

                      {/* slot-card 卡片 */}
                      <div
                        onClick={() => {
                          if (canTap) {
                            setRevealedIndex(i);
                          } else if (isRevealed) {
                            setSelectedCardIndex(i);
                          }
                        }}
                        className={`w-full rounded-[18px] text-center cursor-pointer transition-all duration-300 ${
                          !item.upright && isRevealed ? 'rotate-180' : ''
                        } ${selectedCardIndex === i ? 'scale-[1.03] -translate-y-2' : ''}`}
                        style={{
                          background: isRevealed
                            ? 'linear-gradient(150deg, #2a1e30, #140e20)'
                            : CARD_BACK_STYLE.backgroundImage,
                          border: selectedCardIndex === i ? '2px solid #f5c84e' : '1px solid #ad8f51',
                          boxShadow: selectedCardIndex === i
                            ? '0 20px 40px -5px #fabc2f, 0 0 0 2px #f5c84e inset, 0 0 30px #ffd966'
                            : '0 10px 20px -5px black',
                          padding: '0.8rem 0.3rem',
                          aspectRatio: '2/3',
                        }}
                      >
                        {isRevealed ? (
                          <>
                            <div
                              className="text-3xl sm:text-4xl mb-1"
                              style={{ color: '#eedbba', textShadow: '0 0 20px #ffae6a' }}
                            >
                              {SUIT_STYLE[item.card.suit]?.symbol || '✦'}
                            </div>
                            <div
                              className={`text-sm sm:text-base font-bold leading-tight ${!item.upright ? 'rotate-180' : ''}`}
                              style={{
                                fontFamily: "'Cinzel', serif",
                                background: 'linear-gradient(135deg, #f9efd8, #c8a86e)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                              }}
                            >
                              {item.card.nameZh}
                            </div>
                            <div
                              className={`text-xs mt-1 ${!item.upright ? 'rotate-180' : ''}`}
                              style={{ color: '#cbaf7a' }}
                            >
                              {item.upright ? '正位' : '逆位'}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-xl sm:text-2xl" style={{ color: '#ad8f51' }}>
                              {canTap ? '點擊翻牌' : '?'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* reading-panel 解讀區雙欄 */}
              {showReadingInline && masterReading && (
                <div ref={readingRef} className="flex flex-wrap gap-8">
                  {/* spread-interpretation 左欄：牌陣解讀 (flex: 2) */}
                  <div
                    className="flex-[2] min-w-[280px] rounded-[40px] p-7"
                    style={{
                      background: 'rgba(10, 5, 18, 0.6)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    <h3
                      className="text-xl sm:text-2xl mb-6 pb-2 flex items-center gap-3"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        color: '#e7cf9c',
                        borderBottom: '1px solid #b5944b',
                      }}
                    >
                      <span className="text-2xl">🔮</span> 牌陣解讀
                    </h3>

                    {/* spread-summary 整體摘要 */}
                    <p
                      className="text-lg sm:text-xl leading-relaxed mb-8"
                      style={{ color: '#f2e1ba' }}
                    >
                      {spreadType === 'daily'
                        ? `單張牌揭示今日核心能量：${drawn[0].card.nameZh}${drawn[0].upright ? '正位' : '逆位'}。`
                        : `三張牌揭示時間流：過去（${drawn[0].card.nameZh}），現在（${drawn[1]?.card.nameZh}），未來（${drawn[2]?.card.nameZh}）。`}
                    </p>

                    {/* card-meanings 每張牌含義列表 */}
                    <div className="space-y-6">
                      {drawn.map((item, i) => {
                        const meaning = item.upright
                          ? item.card.upright?.overall || item.card.upright?.love || ''
                          : item.card.reversed?.overall || item.card.reversed?.love || '';
                        return (
                          <div
                            key={`meaning-${i}`}
                            className="pl-4 opacity-0 animate-[slideIn_0.4s_forwards]"
                            style={{
                              borderLeft: '3px solid #f5c84e',
                              animationDelay: `${i * 0.2}s`,
                            }}
                          >
                            <div
                              className="text-lg sm:text-xl mb-1"
                              style={{ fontFamily: "'Cinzel', serif", color: '#ffdfa7' }}
                            >
                              {positionLabels[i] || '今日指引'}
                            </div>
                            <div style={{ color: '#d3c7b0', lineHeight: 1.5 }}>
                              <span style={{ color: '#fad475', fontWeight: 600 }}>
                                {item.card.nameZh}
                              </span>{' '}
                              — {meaning}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* action-card 行動建議卡片 */}
                    <div
                      className="flex items-center gap-4 mt-8 rounded-[30px] px-6 py-4"
                      style={{
                        background: 'rgba(26, 17, 33, 0.8)',
                        border: '2px solid #ad8f51',
                        backdropFilter: 'blur(5px)',
                        boxShadow: '0 0 20px rgba(250, 188, 47, 0.5)',
                      }}
                    >
                      <div
                        className="text-4xl sm:text-5xl font-black min-w-[60px] text-center"
                        style={{
                          fontFamily: "'Cinzel', serif",
                          background: 'linear-gradient(145deg, #f8d98c, #a67c36)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          color: 'transparent',
                          textShadow: '0 0 20px #ffb13c',
                        }}
                      >
                        {drawn[0].card.number !== undefined ? drawn[0].card.number : '0'}
                      </div>
                      <div className="text-base sm:text-lg" style={{ color: '#f2e1ba' }}>
                        <span style={{ color: '#f5c84e', marginRight: 6 }}>✦</span>
                        今日行動 · {drawn[0].upright ? '勇敢前行' : '靜心反省'}
                      </div>
                    </div>
                  </div>

                  {/* card-detail-panel 右欄：單牌詳解 (flex: 1) */}
                  <div
                    className="flex-1 min-w-[240px] rounded-[40px] p-7"
                    style={{
                      background: 'rgba(10, 5, 18, 0.6)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    <h3
                      className="text-xl sm:text-2xl mb-6 pb-2 flex items-center gap-3"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        color: '#e7cf9c',
                        borderBottom: '1px solid #b5944b',
                      }}
                    >
                      <span className="text-2xl">⭐</span> 單牌詳解
                    </h3>

                    {selectedCardIndex !== null && drawn[selectedCardIndex] ? (
                      <div>
                        <div
                          className="text-2xl sm:text-3xl mb-2"
                          style={{
                            fontFamily: "'Cinzel', serif",
                            background: 'linear-gradient(135deg, #fff1d0, #cbae7a)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                          }}
                        >
                          {drawn[selectedCardIndex].card.nameZh}
                        </div>
                        <div
                          className="italic mb-4"
                          style={{ color: '#f5c84e' }}
                        >
                          {drawn[selectedCardIndex].upright ? '正位' : '逆位'}
                        </div>
                        <div style={{ color: '#d3c7b0', lineHeight: 1.5 }}>
                          {(() => {
                            const card = drawn[selectedCardIndex];
                            const meanings = card.upright ? card.card.upright : card.card.reversed;
                            const topicMeaning =
                              effectiveDisplayTopic === 'love'
                                ? meanings?.love
                                : effectiveDisplayTopic === 'career'
                                ? meanings?.career
                                : meanings?.overall;
                            return (
                              topicMeaning ||
                              meanings?.overall ||
                              '此牌象徵著能量的流動與轉化。'
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: '#d3c7b0' }}>
                        點擊上方任意牌查看詳細解讀
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 再抽一次按鈕 */}
              {showReadingInline && (
                <div className="text-center mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('choose');
                      setDrawn(null);
                      setRevealedIndex(-1);
                      setShowReadingInline(false);
                      setSelectedCardIndex(null);
                    }}
                    className="px-10 py-3 rounded-[60px] text-lg font-semibold tracking-[2px] transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      background: 'linear-gradient(145deg, #4a3a22, #2a1e12)',
                      border: '1px solid #dbb45c',
                      color: '#ffdfa7',
                      boxShadow: '0 0 20px #9e7f45',
                    }}
                  >
                    再抽一次
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

    </div>
  );
}
