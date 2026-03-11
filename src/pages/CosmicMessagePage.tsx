/**
 * 今日宇宙对你说的一句话 + 你的隐藏星座
 * 界面与策划图一致：深蓝紫渐变、金/红点缀，一模一样的配色与版型
 */
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as domtoimage from 'dom-to-image';
import { toast } from 'sonner';
import { getSunSignFromDate, OPPOSITE_SIGN, SIGN_SYMBOLS, type ZodiacSignKey } from '@/lib/astrologyChart';
import { loadLastBirth, getArchiveBirthDate } from '@/lib/archives';
import type { ArchiveEntry } from '@/lib/archives';

/** 与策划图一模一样的配色：深蓝紫渐变 + 金/红点缀，神秘高级感 */
const COSMIC_THEME = {
  bg: 'linear-gradient(180deg, #080510 0%, #0d0a18 10%, #12102a 25%, #1a1442 45%, #1f1852 60%, #151032 78%, #0a0616 100%)',
  bgOverlay: 'radial-gradient(ellipse 95% 55% at 50% 12%, rgba(99, 42, 150, 0.28) 0%, rgba(55, 28, 95, 0.12) 35%, transparent 65%)',
  title: 'rgba(251, 211, 76, 1)',
  subtitle: 'rgba(226, 232, 240, 0.82)',
  cardBg: 'linear-gradient(165deg, rgba(42, 26, 72, 0.95) 0%, rgba(72, 48, 120, 0.45) 40%, rgba(32, 18, 55, 0.98) 100%)',
  cardBorder: '1px solid rgba(251, 211, 76, 0.4)',
  cardShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,211,76,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
  cardLabel: 'rgba(251, 211, 76, 1)',
  punchLine: 'rgba(254, 243, 199, 1)',
  accentRed: 'rgba(248, 113, 113, 0.5)',
  buttonBorder: 'rgba(251, 211, 76, 0.55)',
  buttonBg: 'linear-gradient(145deg, rgba(251, 211, 76, 0.2) 0%, rgba(251, 211, 76, 0.06) 100%)',
  /** 主 CTA 紅橙漸變（與策劃圖一致） */
  ctaGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)',
  buttonText: 'rgba(254, 243, 199, 1)',
  footnote: 'rgba(148, 163, 184, 0.65)',
};

const CosmicMessagePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const fromArchive = location.state?.fromArchive as ArchiveEntry | undefined;
  const [sunSign, setSunSign] = useState<ZodiacSignKey | null>(null);
  const [hiddenSign, setHiddenSign] = useState<ZodiacSignKey | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let year: number; let month: number; let day: number;
    const fromDate = fromArchive ? getArchiveBirthDate(fromArchive) : null;
    if (fromDate) {
      year = fromDate.year;
      month = fromDate.month;
      day = fromDate.day;
    } else {
      const last = loadLastBirth();
      if (!last) return;
      year = last.year; month = last.month; day = last.day;
    }
    const sign = getSunSignFromDate(year, month, day);
    setSunSign(sign);
    setHiddenSign(OPPOSITE_SIGN[sign]);
  }, [fromArchive]);

  const formatDate = () => {
    const d = new Date();
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const getHiddenSignShortName = (sign: ZodiacSignKey) => {
    const names: Record<ZodiacSignKey, string> = {
      aries: '牡羊', taurus: '金牛', gemini: '雙子', cancer: '巨蟹',
      leo: '獅子', virgo: '處女', libra: '天秤', scorpio: '天蠍',
      sagittarius: '射手', capricorn: '摩羯', aquarius: '水瓶', pisces: '雙魚',
    };
    return names[sign] || t(`oracle.signs.${sign}.archetypeName`, { defaultValue: '' }).replace(/\s*靈魂$|的靈魂$/i, '').replace(/\s+Soul$/i, '');
  };

  if (!hiddenSign) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: COSMIC_THEME.bg }}
      >
        <p className="text-center mb-5 text-sm" style={{ color: COSMIC_THEME.subtitle }}>
          {t('oracle.cosmicMessageNeedBirth', { defaultValue: '請先填寫出生日期，解開今日宇宙的一句話。' })}
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{
            border: COSMIC_THEME.cardBorder,
            color: COSMIC_THEME.title,
            background: COSMIC_THEME.buttonBg,
          }}
        >
          {t('oracle.goToBlueprint', { defaultValue: '前往星圖' })}
        </button>
      </div>
    );
  }

  const punchLine = t(`oracle.cosmicMessage.hiddenPunch.${hiddenSign}`, { defaultValue: '' });
  const displayPunch = punchLine || t('oracle.cosmicMessage.hiddenPunchDefault', { defaultValue: '你越冷靜，心裡那團火越燙。' });

  const getShareCardDataUrl = async (): Promise<string | null> => {
    if (!shareCardRef.current) return null;
    const scale = 2;
    const w = 360 * scale;
    const h = 280 * scale;
    return domtoimage.toPng(shareCardRef.current, {
      width: w,
      height: h,
      style: { background: 'transparent' },
      bgcolor: '#1a1442',
    });
  };

  const handleSaveImage = async () => {
    if (!shareCardRef.current || savingImage) return;
    setSavingImage(true);
    try {
      const dataUrl = await getShareCardDataUrl();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.download = `今日一句_${formatDate().replace(/\s/g, '')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(t('oracle.cosmicMessage.saveSuccess', { defaultValue: '已保存到相冊' }));
    } catch {
      toast.error(t('common.error', { defaultValue: '保存失敗' }));
    } finally {
      setSavingImage(false);
    }
  };

  const handleShare = async () => {
    if (!shareCardRef.current || savingImage) return;
    setSavingImage(true);
    try {
      const dataUrl = await getShareCardDataUrl();
      if (!dataUrl) return;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `今日一句_${formatDate().replace(/\s/g, '')}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t('oracle.cosmicMessage.title', { defaultValue: '今日宇宙對你說的一句話' }),
          text: displayPunch,
        });
        toast.success(t('oracle.cosmicMessage.shareSuccess', { defaultValue: '已分享' }));
      } else {
        const link = document.createElement('a');
        link.download = `今日一句_${formatDate().replace(/\s/g, '')}.png`;
        link.href = dataUrl;
        link.click();
        toast.success(t('oracle.cosmicMessage.saveSuccess', { defaultValue: '已保存，可從相冊分享' }));
      }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') {
        toast.error(t('common.error', { defaultValue: '分享失敗' }));
      }
    } finally {
      setSavingImage(false);
    }
  };

  /** 與首頁一致：依一年中的第幾天輪播今日宇宙提示與這一程 */
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const dayOfYear = Math.min(
    Math.floor((today.getTime() - startOfYear.getTime()) / 86400000) + 1,
    366
  );
  const COSMIC_TIP_COUNT = 1000;
  const JOURNEY_SET_COUNT = 1000;
  const cosmicTipIndex = ((dayOfYear - 1) % COSMIC_TIP_COUNT) + 1;
  const journeySetIndex = ((dayOfYear - 1) % JOURNEY_SET_COUNT) + 1;
  const cosmicTipFallbackIndex = ((cosmicTipIndex - 1) % 7) + 1;
  const journeyFallbackSetIndex = ((journeySetIndex - 1) % 7) + 1;
  const cosmicTipText = t(`oracle.cosmicTip${cosmicTipIndex}`, { defaultValue: t(`oracle.cosmicTip${cosmicTipFallbackIndex}`) });
  const journeyHintText = t(`oracle.seasonThemeHintSet${journeySetIndex}`, { defaultValue: t(`oracle.seasonThemeHintSet${journeyFallbackSetIndex}`) });

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col relative"
      style={{ background: COSMIC_THEME.bg }}
    >
      {/* 与策划图一致的顶部紫+金红光晕 */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: COSMIC_THEME.bgOverlay }} />
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 75% 20%, rgba(248, 113, 113, 0.15) 0%, transparent 55%)',
        }}
      />

      {/* 顶部返回：安全区内边距 */}
      <div
        className="relative flex items-center justify-between px-4 pb-1"
        style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full transition-colors hover:bg-white/5"
          style={{ color: COSMIC_THEME.title }}
          aria-label={t('common.back', { defaultValue: '返回' })}
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center px-6 pt-4 pb-14">
        {/* 今日宇宙对你说的一句话（方案一 + 方案二标题） */}
        <h1
          className="text-center text-xl font-semibold tracking-wide mb-1"
          style={{ color: COSMIC_THEME.title, fontFamily: 'var(--font-serif)' }}
        >
          {t('oracle.cosmicMessage.title', { defaultValue: '今日宇宙對你說的一句話' })}
        </h1>
        <p className="text-center text-[11px] mb-6" style={{ color: COSMIC_THEME.footnote }}>
          {t('oracle.dailyUpdate', { defaultValue: '每日 0 點更新' })}
        </p>

        {/* 板塊一：今日宇宙提示（與首頁同源，按日輪播） */}
        <div
          className="w-full max-w-sm rounded-2xl px-5 py-4 mb-4 text-left"
          style={{
            background: COSMIC_THEME.cardBg,
            border: COSMIC_THEME.cardBorder,
            boxShadow: COSMIC_THEME.cardShadow,
          }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: COSMIC_THEME.title }}>
            {t('oracle.cosmicTipToday', { defaultValue: '今日宇宙提示' })}
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: COSMIC_THEME.subtitle }}>
            {cosmicTipText}
          </p>
        </div>

        {/* 板塊二：這一程（定錨與發芽 + 年份 + 按日輪播內文） */}
        <div
          className="w-full max-w-sm rounded-2xl px-5 py-4 mb-6 text-left"
          style={{
            background: COSMIC_THEME.cardBg,
            border: COSMIC_THEME.cardBorder,
            boxShadow: COSMIC_THEME.cardShadow,
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm font-semibold" style={{ color: COSMIC_THEME.title }}>
              {t('oracle.seasonChapter', { defaultValue: '這一程' })}{' '}
              <span style={{ color: COSMIC_THEME.cardLabel }}>
                {t('oracle.seasonTheme', { defaultValue: '定錨與發芽' })}
              </span>
            </p>
            <span
              className="text-xs px-2.5 py-1 rounded-full shrink-0"
              style={{
                border: `1px solid ${COSMIC_THEME.cardLabel}`,
                color: COSMIC_THEME.cardLabel,
                background: 'rgba(251, 211, 76, 0.1)',
              }}
            >
              {t('oracle.seasonYear', { year: today.getFullYear() })}
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: COSMIC_THEME.subtitle }}>
            {journeyHintText}
          </p>
        </div>

        {/* 你的隐藏星座 + 副标题（方案二文案） */}
        <p
          className="text-center text-sm font-medium tracking-widest uppercase mb-1"
          style={{ color: COSMIC_THEME.cardLabel, letterSpacing: '0.2em' }}
        >
          {t('oracle.cosmicMessage.hiddenSignTitle', { defaultValue: '你的隱藏星座' })}
        </p>
        <p
          className="text-center text-xs mb-8"
          style={{ color: COSMIC_THEME.subtitle }}
        >
          {t('oracle.cosmicMessage.hiddenSignSubtitle', { defaultValue: '太陽之外，你還有另一面。' })}
        </p>

        {/* 中心卡片：暗面星座 · XX + 金句；ref 用於保存/分享圖片 */}
        <div
          ref={shareCardRef}
          className="w-full max-w-sm rounded-2xl px-7 py-7 mb-6 text-center relative overflow-hidden"
          style={{
            background: COSMIC_THEME.cardBg,
            border: COSMIC_THEME.cardBorder,
            boxShadow: COSMIC_THEME.cardShadow,
          }}
        >
          {/* 卡片背景：圓形輪廓 + 隱藏星座符號（低透明度） */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden
          >
            <span
              className="text-[4.5rem] opacity-[0.12] select-none"
              style={{ color: COSMIC_THEME.cardLabel }}
            >
              {SIGN_SYMBOLS[hiddenSign]}
            </span>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden
          >
            <div
              className="w-32 h-32 rounded-full border"
              style={{ borderColor: 'rgba(251, 211, 76, 0.15)' }}
            />
          </div>
          <div className="relative">
          <span
            className="inline-block text-xs font-semibold tracking-[0.22em] uppercase mb-4"
            style={{ color: COSMIC_THEME.cardLabel }}
          >
            {t('oracle.cosmicMessage.cardLabel', { defaultValue: '暗面星座' })} · {getHiddenSignShortName(hiddenSign)}
          </span>
          <p
            className="text-base leading-relaxed font-medium"
            style={{ color: COSMIC_THEME.punchLine, fontFamily: 'var(--font-serif)' }}
          >
            {displayPunch}
          </p>
          <p className="mt-5 text-xs" style={{ color: COSMIC_THEME.footnote }}>
            — {t('oracle.cosmicMessage.fromChart', { defaultValue: '來自你的本命星盤' })} · {formatDate()}
          </p>
          </div>
        </div>

        {/* 回星圖：主 CTA 紅橙漸變（與策劃圖一致） */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full max-w-sm px-10 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all hover:opacity-95 active:scale-[0.98]"
          style={{
            color: '#fff',
            border: 'none',
            background: COSMIC_THEME.ctaGradient,
            fontFamily: 'var(--font-serif)',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
          }}
        >
          {t('oracle.cosmicMessage.backToChart', { defaultValue: '回星圖' })}
        </button>

        {/* 保存 / 分享：想讓人想分享、有質感 */}
        <div className="flex items-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleSaveImage}
            disabled={savingImage}
            className="text-xs font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ color: COSMIC_THEME.footnote, border: `1px solid ${COSMIC_THEME.footnote}` }}
          >
            {savingImage ? t('oracle.cosmicMessage.saving', { defaultValue: '保存中…' }) : t('oracle.cosmicMessage.save', { defaultValue: '保存圖片' })}
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={savingImage}
            className="text-xs font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ color: COSMIC_THEME.cardLabel, border: `1px solid ${COSMIC_THEME.buttonBorder}` }}
          >
            {t('oracle.cosmicMessage.share', { defaultValue: '分享' })}
          </button>
        </div>

        {/* 純西方占星，不混五行 */}
        <p
          className="text-xs text-center"
          style={{ color: COSMIC_THEME.footnote, marginTop: '2rem', marginBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          {t('oracle.cosmicMessage.footnote', { defaultValue: '基於你的本命星盤' })}
        </p>
      </div>
    </div>
  );
};

export default CosmicMessagePage;
