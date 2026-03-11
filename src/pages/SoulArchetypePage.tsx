/**
 * 星圖二級：靈魂原型（填寫出生日期後才可進入，僅顯示靈魂原型一卡）
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Copy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { calculateElementEnergy } from '@/lib/fiveElements';
import { getSunSignFromDate, getSignElement, SIGN_SYMBOLS, OPPOSITE_SIGN } from '@/lib/astrologyChart';
import type { ZodiacSignKey } from '@/lib/astrologyChart';
import type { CelestialProfile } from '@/lib/fiveElements';
import { loadLastBirth, getArchiveBirthDate } from '@/lib/archives';
import type { ArchiveEntry } from '@/lib/archives';

const ELEMENT_STYLE: Record<string, { border: string; bg: string; symbol: string }> = {
  fire: { border: 'hsla(25, 85%, 55%, 0.6)', bg: 'linear-gradient(160deg, hsla(25, 70%, 45%, 0.12), hsla(47, 90%, 70%, 0.06))', symbol: '🔥' },
  water: { border: 'hsla(195, 70%, 50%, 0.55)', bg: 'linear-gradient(160deg, hsla(195, 60%, 45%, 0.1), hsla(205, 70%, 62%, 0.06))', symbol: '💧' },
  air: { border: 'hsla(200, 50%, 65%, 0.55)', bg: 'linear-gradient(160deg, hsla(200, 40%, 55%, 0.1), hsla(220, 30%, 45%, 0.06))', symbol: '🌬' },
  earth: { border: 'hsla(38, 45%, 48%, 0.55)', bg: 'linear-gradient(160deg, hsla(38, 40%, 40%, 0.12), hsla(47, 35%, 35%, 0.06))', symbol: '◉' },
  wood: { border: 'hsla(145, 45%, 45%, 0.55)', bg: 'linear-gradient(160deg, hsla(145, 40%, 35%, 0.1), hsla(160, 30%, 25%, 0.06))', symbol: '🌿' },
  metal: { border: 'hsla(210, 15%, 55%, 0.5)', bg: 'linear-gradient(160deg, hsla(210, 12%, 40%, 0.1), hsla(220, 15%, 25%, 0.06))', symbol: '◇' },
};

const SoulArchetypePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const viewHidden = searchParams.get('view') === 'hidden';
  const fromArchive = location.state?.fromArchive as ArchiveEntry | undefined;
  const [profile, setProfile] = useState<CelestialProfile | null>(null);
  const [sunSign, setSunSign] = useState<ZodiacSignKey | null>(null);
  const [birthDate, setBirthDate] = useState<{ year: number; month: number; day: number } | null>(null);

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
    setBirthDate({ year, month, day });
    const p = calculateElementEnergy(year, month, day);
    setProfile(p);
    setSunSign(getSunSignFromDate(year, month, day));
  }, [fromArchive]);

  /** 實際展示的星座：從今日宇宙進來的「查看完整解讀」= 暗面星座；否則 = 太陽星座 */
  const displaySign: ZodiacSignKey | null = sunSign
    ? (viewHidden ? OPPOSITE_SIGN[sunSign] : sunSign)
    : null;

  const getPowerLine = () => {
    if (displaySign) return t(`oracle.signs.${displaySign}.power`, { defaultValue: '' });
    if (!profile?.dominantElement) return '';
    const map: Record<string, string> = {
      fire: t('oracle.archetypePowerFire'),
      water: t('oracle.archetypePowerWater'),
      wood: t('oracle.archetypePowerWood'),
      metal: t('oracle.archetypePowerMetal'),
      earth: t('oracle.archetypePowerEarth'),
    };
    return map[profile.dominantElement] ?? '';
  };

  const handleCopyPowerLine = () => {
    const text = getPowerLine();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => toast.success(t('oracle.copiedQuote', { defaultValue: '金句已複製' })));
  };

  if (!profile || !sunSign) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        <p className="text-subtitle text-sm text-center mb-4">
          {t('oracle.soulPageNeedBirth', { defaultValue: '請先填寫出生日期，解開你的靈魂原型。' })}
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gold-strong text-gold-strong hover:bg-gold-soft transition-colors"
        >
          {t('oracle.goToBlueprint', { defaultValue: '前往星圖' })}
        </button>
      </div>
    );
  }

  const el = getSignElement(displaySign!);
  const style = ELEMENT_STYLE[el] || ELEMENT_STYLE.earth;
  const archetypeName = t(`oracle.signs.${displaySign}.archetypeName`);
  const keyword = t(`oracle.signs.${displaySign}.keyword`);
  const tagline = t(`oracle.signs.${displaySign}.tagline`);
  const interpretation = t(`oracle.signs.${displaySign}.interpretation`);
  const traits = t(`oracle.signs.${displaySign}.traits`);

  /** Chapter titles: distinct color, larger font (ZH + EN) */
  const isChapterTitle = (line: string) => {
    const t = line.trim();
    return /^第[一二三四五六七八九十百]+章/.test(t) || /^終極總結/.test(t) ||
      /^Chapter\s+(One|Two|Three|Four|\d+)/i.test(t) || /^Ultimate\s+Summary/i.test(t);
  };
  /** Sub-titles: single line ending with : or key labels (ZH + EN) */
  const isSubTitle = (line: string) => {
    const t = line.trim();
    if (t.length > 120) return false;
    if (/^[\d]+\.\s*.*【/.test(t) || /^【/.test(t)) return true;
    if (/[：:]\s*$/.test(t) || /）：\s*$/.test(t)) return true;
    const zhKeys = /^(經歷|靈魂狀態|靈魂震盪|黑化全景|靈魂特質|最終形態|結局經歷|心理|狀態|行為)：/;
    const enKeys = /^(Experience|Soul state|Soul shock|Dark panorama|Soul trait|Final form|Outcome|Psychology|State|Behavior|Birth process|Original motif|Core pain|Encounter):\s*/i;
    return zhKeys.test(t) || enKeys.test(t);
  };

  const renderSoulContent = (content: string) => {
    const blocks = content.split(/\n\n+/);
    return (
      <div className="space-y-3">
        {blocks.map((block, i) => {
          const trimmed = block.trim();
          if (!trimmed) return null;
          const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
          if (!lines.length) return null;
          const firstLine = lines[0];
          if (isChapterTitle(trimmed)) {
            return (
              <p key={i} className="text-lg font-semibold text-amber-300 leading-relaxed">
                {trimmed}
              </p>
            );
          }
          if (isSubTitle(firstLine) && firstLine.length <= 120) {
            if (lines.length === 1) {
              return (
                <p key={i} className="text-base font-semibold text-body leading-relaxed">
                  {firstLine}
                </p>
              );
            }
            return (
              <div key={i} className="space-y-1">
                <p className="text-base font-semibold text-body leading-relaxed">
                  {firstLine}
                </p>
                <p className="text-sm text-body leading-relaxed whitespace-pre-line">
                  {lines.slice(1).join('\n')}
                </p>
              </div>
            );
          }
          return (
            <p key={i} className="text-sm text-body leading-relaxed whitespace-pre-line">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pb-8">
      <button
        type="button"
        onClick={() => navigate(viewHidden ? '/oracle/cosmic' : '/')}
        className="flex items-center gap-2 text-sm text-subtitle hover:text-body mb-4 transition-colors"
        aria-label={t('common.back', { defaultValue: '返回' })}
      >
        <ArrowLeft size={18} />
        {viewHidden ? t('oracle.backToCosmic', { defaultValue: '返回今日宇宙' }) : t('oracle.backToBlueprint', { defaultValue: '返回星圖' })}
      </button>

      <motion.div
        className="rounded-2xl overflow-hidden relative border border-white/20"
        style={{
          background: style.bg,
          borderColor: style.border,
          boxShadow: '0 4px 24px hsla(0,0%,0%,0.08)',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-subtitle">
            {viewHidden ? t('oracle.hiddenSignFullReading', { defaultValue: '暗面星座完整解讀' }) : t('oracle.yourArchetype')}
          </p>
          {birthDate && !viewHidden && (
            <p className="text-xs text-subtitle">
              {t('oracle.soulArchetypeBirthHint', {
                defaultValue: '根據出生日期 {{date}}',
                date: `${birthDate.year}-${String(birthDate.month).padStart(2, '0')}-${String(birthDate.day).padStart(2, '0')}`,
              })}
            </p>
          )}
          {viewHidden && (
            <p className="text-xs text-subtitle">
              {t('oracle.hiddenSignFromSun', { defaultValue: '根據你的本命太陽星座所對應的暗面' })}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl leading-none opacity-90" aria-hidden>
              {SIGN_SYMBOLS[displaySign!]}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gold-glow" style={{ fontFamily: 'var(--font-serif)' }}>
              {archetypeName}
            </h2>
          </div>
          <p className="text-sm text-subtitle">
            {t('oracle.energyKeywords')} · {keyword}
          </p>
          <p className="text-base font-medium text-body leading-relaxed">
            {tagline}
          </p>
          {interpretation && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-body mb-2">
                {t('oracle.archetypeSummary', { defaultValue: '本命簡述' })}
              </p>
              <p className="text-sm text-body leading-relaxed">
                {interpretation}
              </p>
            </div>
          )}
          {traits && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-body mb-2">
                {t('oracle.astrologyTraitsLabel')}
              </p>
              <p className="text-sm text-body leading-relaxed opacity-95">
                {traits}
              </p>
            </div>
          )}
          {/* 完整故事：歷史 → 靈魂演變（第三章）→ 性格與內心（第四章），不展示「現代特質」 */}
          {[
            { key: 'soulHistory', titleKey: 'soulSectionHistory' },
            { key: 'soulEvolution', titleKey: 'soulSectionEvolution' },
            { key: 'soulPersonality', titleKey: 'soulSectionPersonality' },
          ].map(({ key, titleKey }) => {
            const text = t(`oracle.signs.${displaySign}.${key}`, { defaultValue: '' });
            if (!text) return null;
            return (
              <div key={key} className="pt-4 border-t border-white/10">
                <p className="text-base font-semibold text-body tracking-wide mb-2">
                  {t(`oracle.${titleKey}`)}
                </p>
                {renderSoulContent(text)}
              </div>
            );
          })}
          <div className="pt-4 flex items-start gap-3 border-t border-white/10">
            <p
              className="flex-1 text-base italic pl-4 border-l-2 text-body leading-relaxed"
              style={{ borderColor: style.border }}
            >
              {getPowerLine()}
            </p>
            <button
              type="button"
              onClick={handleCopyPowerLine}
              className="shrink-0 p-2 rounded-lg text-subtitle hover:text-body hover:bg-muted/50 transition-colors"
              aria-label={t('oracle.copyQuote')}
            >
              <Copy size={18} />
            </button>
          </div>
          <p className="text-xs text-subtitle/90 italic">
            {t('oracle.giftLine')}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SoulArchetypePage;
