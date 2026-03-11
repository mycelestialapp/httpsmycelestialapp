import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { QUESTION_QUICK_PICK } from '@/lib/questionQuickPick';
import { GlassCard } from '@/components/ui/glass-card';
import { SectionTitle } from '@/components/ui/section-title';
import { PrimaryButton } from '@/components/ui/primary-button';

const TAROT_DISCLAIMER_KEY = 'tarot_disclaimer_seen';

interface OracleSanctumEntranceProps {
  question: string;
  onQuestionChange: (value: string) => void;
  /** 為雷諾曼等工具隱藏「解讀記錄」按鈕，避免與面板內「保存」混淆並防止誤點跳轉 */
  hideHistoryButton?: boolean;
  /** 塔羅小板塊：主流程改為「先選分類、再選問題」，推薦問題置頂，自由輸入收起到「或自己輸入」 */
  variant?: 'default' | 'tarot';
  /** 點擊「開始閱讀」時由父層捲動到抽牌區 */
  onStartReading?: () => void;
  /** 塔羅：回傳目前選中的大類（避免題面不含關鍵詞時誤分類） */
  onTarotCategoryChange?: (categoryId: string) => void;
}

export default function OracleSanctumEntrance({
  question,
  onQuestionChange,
  hideHistoryButton = false,
  variant = 'default',
  onStartReading,
  onTarotCategoryChange,
}: OracleSanctumEntranceProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [local, setLocal] = useState(() => question);
  const [showQuickPick, setShowQuickPick] = useState(variant === 'tarot');
  const [quickPickCategoryIndex, setQuickPickCategoryIndex] = useState(0);
  const [showTarotFreeInput, setShowTarotFreeInput] = useState(false);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(TAROT_DISCLAIMER_KEY) === '1',
  );

  // 僅當父組件傳入的 question 與當前 local 不同時才同步，且避免在用戶輸入過程中用舊的 question 覆蓋（父組件 re-render 可能滯後導致 question 仍是舊值）
  const prevQuestionRef = useRef(question);
  useEffect(() => {
    if (question === prevQuestionRef.current) return;
    prevQuestionRef.current = question;
    setLocal(question);
  }, [question]);

  const handleChange = (value: string) => {
    setLocal(value);
    onQuestionChange(value);
  };

  const handlePickQuestion = (q: string) => {
    handleChange(q);
    if (currentCategory?.id) onTarotCategoryChange?.(currentCategory.id);
    setShowQuickPick(false);
  };

  const currentCategory = QUESTION_QUICK_PICK[quickPickCategoryIndex];

  /** 塔羅小板塊：先選分類、再選問題，主流程置頂；依報告加入免責與即時引導 */
  if (variant === 'tarot') {
    return (
      <section className="space-y-6 pt-4 pb-10 max-w-5xl mx-auto">
        <div className="text-center px-3">
          <SectionTitle
            eyebrow={t('oracle.tarotFlowEyebrow', { defaultValue: 'Tarot · Immersive Guidance' })}
            title={t('oracle.tarotFlowTitle', { defaultValue: '塔羅 · 先選方向，再選問題' })}
            subtitle={t('oracle.tarotFlowSub', { defaultValue: '選中的問題會直接帶入解讀，答案更貼題。' })}
            className="mx-auto max-w-[38rem]"
          />
        </div>

        {/* 免責／定位：可關閉，關閉後存 localStorage 不再顯示 */}
        {!disclaimerDismissed && (
          <GlassCard density="compact" tone="surface1" className="relative pr-10 text-center">
            <p className="text-sm sm:text-base text-[color:var(--ui-text-muted)] leading-relaxed">
              {t('oracle.tarotDisclaimer', {
                defaultValue: '塔羅是指引與自我覺察的工具，不是絕對預言。建議聚焦「我能做什麼」，會得到更有幫助的方向～',
              })}
            </p>
            <button
              type="button"
              aria-label={t('common.close', { defaultValue: '關閉' })}
              onClick={() => {
                setDisclaimerDismissed(true);
                try {
                  localStorage.setItem(TAROT_DISCLAIMER_KEY, '1');
                } catch (_) {}
              }}
              className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-gold-strong/10 transition-colors"
            >
              <X size={18} />
            </button>
          </GlassCard>
        )}

        {/* Step 1: 選擇問題方向（完整顯示所有分類，可滾動） */}
        <div className="space-y-2.5">
          <p className="text-base sm:text-lg font-semibold text-[color:var(--ui-text-muted)] px-1">
            {t('oracle.tarotStep1', { defaultValue: '1. 選擇問題方向' })}
          </p>
          <GlassCard density="compact" tone="surface1" className="min-h-[88px]">
            <div className="flex flex-wrap gap-2.5 justify-center">
              {QUESTION_QUICK_PICK.map((cat, i) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setQuickPickCategoryIndex(i);
                    onTarotCategoryChange?.(cat.id);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                    quickPickCategoryIndex === i
                      ? 'bg-gold-strong/20 text-gold-strong border border-gold-strong/55 shadow-[0_10px_22px_rgba(0,0,0,0.22)]'
                      : 'bg-muted/30 text-muted-foreground border border-white/10 hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Step 2: 選擇你的問題（完整顯示，可滾動） */}
        <div className="space-y-2.5">
          <p className="text-base sm:text-lg font-semibold text-[color:var(--ui-text-muted)] px-1">
            {t('oracle.tarotStep2', { defaultValue: '2. 選擇你的問題（點擊即填入）' })}
          </p>
          {currentCategory?.id === '感情婚姻' && (
            <GlassCard density="compact" tone="surface1" className="py-3">
              <p className="text-sm sm:text-base text-[color:var(--ui-text-muted)] leading-relaxed">
              {t('oracle.loveCategoryHint', {
                defaultValue: '塔羅最擅長給行動建議，而不是 yes/no 答案或精準時間預測。建議把問題聚焦在「我能做什麼」，會得到更有幫助的指引。',
              })}
              </p>
            </GlassCard>
          )}
          {currentCategory?.id === '事业工作' && (
            <GlassCard density="compact" tone="surface1" className="py-3">
              <p className="text-sm sm:text-base text-[color:var(--ui-text-muted)] leading-relaxed">
              {t('oracle.careerCategoryHint', {
                defaultValue: '牌面更擅長給行動與取捨的建議，而不是單純成敗預測。建議聚焦「我該如何調整、可以做什麼」。',
              })}
              </p>
            </GlassCard>
          )}
          <GlassCard density="compact" tone="surface1" className="min-h-[220px]">
            <ul className="space-y-2 sm:space-y-2.5 pr-1">
              {currentCategory?.questions.map((q, j) => (
                <li key={j}>
                  <button
                    type="button"
                    onClick={() => handlePickQuestion(q)}
                    className={`w-full text-left text-base sm:text-lg py-3 px-3.5 sm:py-3.5 sm:px-4 rounded-xl transition-colors border ${
                      local === q
                        ? 'bg-gold-strong/18 text-gold-strong border-gold-strong/55 shadow-[0_10px_22px_rgba(0,0,0,0.22)]'
                        : 'text-foreground/90 hover:text-foreground hover:bg-gold-strong/10 border-white/5 hover:border-gold-strong/20'
                    }`}
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        {/* 當前已選問題回顯 + 開始閱讀大按鈕 */}
        {local && (
          <div className="space-y-3 pt-1">
            <GlassCard density="compact" tone="surface1" className="py-4">
              <p className="text-sm text-[color:var(--ui-text-weak)] mb-1">
                {t('oracle.tarotCurrentQuestion', { defaultValue: '當前問題' })}
              </p>
              <p className="text-base sm:text-lg text-foreground leading-relaxed">{local}</p>
            </GlassCard>
            {onStartReading && (
              <PrimaryButton onClick={onStartReading} style={{ fontFamily: 'var(--font-serif)' }}>
                {t('oracle.startTarotReading', { defaultValue: '開始閱讀' })}
              </PrimaryButton>
            )}
          </div>
        )}

        {/* 或自己輸入（收起到摺疊） */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowTarotFreeInput((v) => !v)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-base sm:text-lg font-semibold text-[color:var(--ui-text-muted)] hover:text-foreground bg-white/5 hover:bg-white/8 border border-white/10 hover:border-[color:var(--ui-border-soft)] transition-all shadow-[0_10px_22px_rgba(0,0,0,0.18)]"
          >
            {t('oracle.tarotOrType', { defaultValue: '或自己輸入問題' })}
            {showTarotFreeInput ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <AnimatePresence>
            {showTarotFreeInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <GlassCard density="compact" tone="surface1" hoverEffect={false} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={local}
                    onChange={e => handleChange(e.target.value)}
                    placeholder={t('oracle.tarotQuestionPlaceholder', {
                      defaultValue: '例如：我該如何改善目前的感情溝通？',
                    })}
                    className="w-full bg-transparent border-none outline-none text-base sm:text-lg text-foreground placeholder:text-muted-foreground/60 min-w-0"
                    maxLength={120}
                  />
                  <button
                    type="button"
                    onClick={() => toast.info(t('oracle.optimizeQuestionComing', { defaultValue: '問題優化功能即將上線～' }))}
                    className="shrink-0 px-4 py-2.5 rounded-xl text-base font-semibold border border-gold-strong/40 text-gold-strong/90 hover:bg-gold-strong/10 transition-colors"
                  >
                    {t('oracle.optimizeQuestion', { defaultValue: '優化問題' })}
                  </button>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!hideHistoryButton && (
          <button
            type="button"
            onClick={() => navigate('/readings')}
            className="w-full py-2.5 rounded-lg text-[15px] font-medium flex items-center justify-center gap-2 text-gold-strong/90 hover:text-gold-strong hover:bg-gold-strong/5 border border-gold-strong/30 hover:border-gold-strong/50 transition-colors"
          >
            <BookOpen size={16} />
            {t('oracle.sanctumReadingHistory', { defaultValue: '解读记录' })}
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-5 pt-2 pb-4">
      <div className="text-center space-y-2">
        <p className="text-[14px] tracking-[0.35em] uppercase text-subtitle">
          {t('oracle.sanctumTitle', { defaultValue: '聖殿入口' })}
        </p>
        <h2
          className="text-xl sm:text-2xl font-bold leading-snug px-2 text-crystal"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {t('oracle.sanctumHero', {
            defaultValue: '請在此刻安靜地，走進你自己的聖殿。',
          })}
        </h2>
        <p className="text-sm text-subtitle max-w-sm mx-auto">
          {t('oracle.sanctumSub', {
            defaultValue:
              '這不是一個網站，而是一處供你暫時卸下鎧甲、只與自己對話的空間。',
          })}
        </p>
      </div>

      {/* 能量球 · 數字祭壇核心 */}
      <div className="flex justify-center">
        <motion.button
          type="button"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-gold-strong/50 overflow-hidden focus:outline-none"
          style={{
            background:
              'radial-gradient(circle at 20% 0%, rgba(255,255,255,0.16) 0, transparent 55%), ' +
              'radial-gradient(circle at 80% 100%, rgba(195,160,255,0.22) 0, transparent 60%), ' +
              'radial-gradient(circle at 50% 50%, rgba(80,40,120,0.9) 0, rgba(10,5,20,0.98) 60%)',
            boxShadow:
              '0 0 40px rgba(140,120,255,0.45), 0 0 80px rgba(255,220,200,0.18)',
          }}
          animate={{
            rotate: hovered ? 5 : 0,
            scale: hovered ? 1.02 : 1,
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 16 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'conic-gradient(from 0deg, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.18), transparent, rgba(255,255,255,0.1))',
              mixBlendMode: 'screen',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-[18%] rounded-full border border-gold-strong/30 bg-black/30 backdrop-blur-md" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1.5">
            <Sparkles className="w-6 h-6 text-gold-strong" />
            <p className="text-sm tracking-[0.22em] uppercase text-gold-strong">
              {t('oracle.sanctumOrbLabel', { defaultValue: 'FOCUS' })}
            </p>
          </div>
        </motion.button>
      </div>

      {/* 鼠標懸停提示語 */}
      <div className="text-center text-[14px] text-subtitle space-y-1 min-h-[2.5rem]">
        {!hovered ? (
          <p>
            {t('oracle.sanctumHintIdle', {
              defaultValue: '將視線輕輕停留在這顆光球上，讓外界的噪音慢慢退場。',
            })}
          </p>
        ) : (
          <>
            <p>
              {t('oracle.sanctumHint1', {
                defaultValue: '深呼吸三次。',
              })}
            </p>
            <p>
              {t('oracle.sanctumHint2', {
                defaultValue: '在心裡，為今天的自己說一句：我準備好聽見真相了。',
              })}
            </p>
            <p>
              {t('oracle.sanctumHint3', {
                defaultValue: '然後，將你的困惑，凝聚成一句話。',
              })}
            </p>
          </>
        )}
      </div>

      {/* 問題輸入區：標籤與輸入框分離，存儲說明合併為一句，入口單一且不搶主流程 */}
      <div className="space-y-3">
        <label className="block text-[14px] font-medium tracking-widest uppercase text-subtitle">
          {t('oracle.sanctumQuestionLabel', {
            defaultValue: '用一句話描述此刻最困擾你的事',
          })}
        </label>
        <div
          className="rounded-xl border px-3 py-2.5 min-h-[44px] flex items-center"
          style={{
            borderColor: 'hsla(var(--gold) / 0.35)',
            background: 'hsla(var(--card) / 0.5)',
          }}
        >
          <input
            type="text"
            value={local}
            onChange={e => handleChange(e.target.value)}
            placeholder={t('oracle.sanctumQuestionPlaceholder', {
              defaultValue: '例如：我最害怕失去的是什麼？',
            })}
            className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
            maxLength={120}
          />
        </div>
        <p className="text-[14px] text-subtitle leading-relaxed">
          {t('oracle.sanctumQuestionHint', {
            defaultValue: '不需要說得完美，只要足夠誠實。',
          })}
        </p>

        {/* 快速選題：從分類中選一句填入，方便占卜工具識別並給出貼題解讀 */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowQuickPick((v) => !v)}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[14px] font-medium text-subtitle hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border transition-colors"
          >
            {t('oracle.quickPickLabel', { defaultValue: '從參考問題選' })}
            {showQuickPick ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {showQuickPick && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-xl border p-3 space-y-3"
                  style={{
                    borderColor: 'hsla(var(--gold) / 0.2)',
                    background: 'hsla(var(--card) / 0.6)',
                  }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {QUESTION_QUICK_PICK.map((cat, i) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setQuickPickCategoryIndex(i)}
                        className={`px-2.5 py-1.5 rounded-md text-[14px] font-medium transition-colors ${
                          quickPickCategoryIndex === i
                            ? 'bg-gold-strong/20 text-gold-strong border border-gold-strong/40'
                            : 'bg-muted/50 text-subtitle border border-transparent hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  {currentCategory?.id === '感情婚姻' && (
                    <p className="text-[12px] sm:text-[13px] text-subtitle/85 leading-relaxed px-2 py-1.5 rounded-md bg-gold-strong/5 border border-gold-strong/10">
                      {t('oracle.loveCategoryHint', {
                        defaultValue: '塔羅最擅長給行動建議，而不是 yes/no 答案或精準時間預測。建議把問題聚焦在「我能做什麼」，會得到更有幫助的指引。',
                      })}
                    </p>
                  )}
                  <ul className="min-h-[120px] max-h-[50vh] overflow-y-auto space-y-1 pr-1">
                    {currentCategory?.questions.map((q, j) => (
                      <li key={j}>
                        <button
                          type="button"
                          onClick={() => handlePickQuestion(q)}
                          className="w-full text-left text-sm py-2 px-2.5 rounded-lg text-foreground/90 hover:text-foreground hover:bg-gold-strong/10 border border-transparent hover:border-gold-strong/20 transition-colors"
                        >
                          {q}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!hideHistoryButton && (
          <button
            type="button"
            onClick={() => navigate('/readings')}
            className="w-full py-2 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2 text-gold-strong hover:text-gold-strong hover:bg-gold-strong/5 border border-gold-strong/30 hover:border-gold-strong/50 transition-colors"
          >
            <BookOpen size={15} />
            {t('oracle.sanctumReadingHistory', { defaultValue: '解读记录' })}
          </button>
        )}
      </div>
    </section>
  );
}

