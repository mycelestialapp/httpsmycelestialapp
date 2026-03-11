import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CosmicTeaserCard from '@/components/CosmicTeaserCard';
import BirthInputModal from '@/components/BirthInputModal';
import DailyYijiMoonCard from '@/components/DailyYijiMoonCard';
import DailyNumerologyCard from '@/components/DailyNumerologyCard';
import DailyOneCard from '@/components/DailyOneCard';
import CreateCardCTA from '@/components/CreateCardCTA';

import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Flower2, Layers, Moon, LayoutGrid, BookOpen, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { calculateElementEnergy } from '@/lib/fiveElements';
import { getSunSignFromDate, type ZodiacSignKey } from '@/lib/astrologyChart';
import solarlunar from 'solarlunar';
import type { CelestialProfile } from '@/lib/fiveElements';
import { saveToArchivesIfNeeded, saveLastBirth, loadLastBirth, updateArchiveBirthData } from '@/lib/archives';
import { useAuth } from '@/hooks/useAuth';
import { useOpenBirthModalWhenRequested } from '@/hooks/useOpenBirthModal';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

/** 星圖板塊 · 西方主流占卜方式（占星、塔羅、神諭卡、雷諾曼、符文、數字命理） */
const WESTERN_DIVINATION = [
  { key: 'astrology', icon: Flower2 },
  { key: 'tarot', icon: Layers },
  { key: 'oracle', icon: Moon },
  { key: 'lenormand', icon: LayoutGrid },
  { key: 'runes', icon: BookOpen },
  { key: 'numerology', icon: Hash },
] as const;

/** 星圖板塊 · 純西方占星（今日一句、靈魂原型、占卜工具） */
type ForArchiveContext = { id: string; name: string; group: string } | null;

/** 尚未實現的占卜方式：入口顯示「即將推出」，不跳轉（靈擺已解鎖，板塊內容清空待後續上線） */
const COMING_SOON_TOOLS: string[] = [];

const OraclePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const divinationSectionRef = useRef<HTMLElement | null>(null);
  const [forArchive, setForArchive] = useState<ForArchiveContext>(null);
  const [profile, setProfile] = useState<CelestialProfile | null>(null);
  /** 太陽星座（占星星盤 L1）：用於靈魂原型卡與金句 */
  const [sunSign, setSunSign] = useState<ZodiacSignKey | null>(null);
  const [compareSoul, setCompareSoul] = useState<string | null>(null);

  /** 從關係頁「補充出生資料」跳轉時，把檔案 id/name/group 存到 state，避免 navigate replace 後丟失 */
  useEffect(() => {
    const s = location.state as { forArchiveId?: string; forArchiveName?: string; forArchiveGroup?: string; scrollToDivination?: boolean } | null;
    if (s?.forArchiveId) {
      setForArchive({
        id: s.forArchiveId,
        name: s.forArchiveName ?? '',
        group: s.forArchiveGroup ?? 'self',
      });
    }
    if (s?.scrollToDivination && divinationSectionRef.current) {
      requestAnimationFrame(() => {
        divinationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      navigate(location.pathname, { replace: true, state: undefined });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const soul = localStorage.getItem('celestial_compare_soul');
    if (soul) {
      setCompareSoul(soul);
      localStorage.removeItem('celestial_compare_soul');
    }
  }, []);

  /** 進入時：登入則先從帳號讀取生日，否則從 localStorage 恢復 */
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('birthday, birth_chart_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.birthday) {
            const [y, m, d] = data.birthday.split('-').map(Number);
            if (y && m && d) {
              const p = calculateElementEnergy(y, m, d);
              setProfile(p);
              setSunSign(getSunSignFromDate(y, m, d));
              saveLastBirth({
                year: y,
                month: m,
                day: d,
                name: data.birth_chart_name?.trim() || undefined,
              });
            }
            return;
          }
          const last = loadLastBirth();
          if (!last) return;
          const p = calculateElementEnergy(last.year, last.month, last.day);
          setProfile(p);
          setSunSign(getSunSignFromDate(last.year, last.month, last.day));
        })
        .catch(() => {
          const last = loadLastBirth();
          if (!last) return;
          const p = calculateElementEnergy(last.year, last.month, last.day);
          setProfile(p);
          setSunSign(getSunSignFromDate(last.year, last.month, last.day));
        });
    } else {
      const last = loadLastBirth();
      if (!last) return;
      const p = calculateElementEnergy(last.year, last.month, last.day);
      setProfile(p);
      setSunSign(getSunSignFromDate(last.year, last.month, last.day));
    }
  }, [user?.id]);

  useOpenBirthModalWhenRequested(setModalOpen);

  const handleBirthSubmit = async (
    year: number,
    month: number,
    day: number,
    city?: import('@/lib/cities').CityEntry | null,
    useSolarTime?: boolean,
    hourIndex?: number,
    gender?: 'male' | 'female',
    calendarType: 'solar' | 'lunar' = 'solar',
    _group?: string,
    _name?: string,
  ) => {
    const forArchiveId = forArchive?.id ?? (location.state as { forArchiveId?: string } | null)?.forArchiveId;
    if (forArchiveId) {
      let solarYear = year;
      let solarMonth = month;
      let solarDay = day;
      if (calendarType === 'lunar') {
        try {
          const converted = solarlunar.lunar2solar(year, month, day, false);
          solarYear = converted.cYear;
          solarMonth = converted.cMonth;
          solarDay = converted.cDay;
        } catch {
          solarYear = year;
          solarMonth = month;
          solarDay = day;
        }
      }
      updateArchiveBirthData(forArchiveId, {
        solarYear,
        solarMonth,
        solarDay,
        hourIndex: hourIndex ?? 6,
        gender,
        useSolarTime,
        calendarType,
        city: city ?? null,
      });
      toast.success(t('relationships.birthDataAdded', { defaultValue: '已補充出生資料，可查看靈魂原型、今日一句與命盤' }));
      setForArchive(null);
      setModalOpen(false);
      navigate('/relationships', { replace: true, state: {} });
      return;
    }

    let solarYear = year;
    let solarMonth = month;
    let solarDay = day;

    if (calendarType === 'lunar') {
      try {
        const converted = solarlunar.lunar2solar(year, month, day, false);
        solarYear = converted.cYear;
        solarMonth = converted.cMonth;
        solarDay = converted.cDay;
      } catch {
        solarYear = year;
        solarMonth = month;
        solarDay = day;
      }
    }

    const p: CelestialProfile = calculateElementEnergy(solarYear, solarMonth, solarDay);
    setProfile(p);
    /** 靈魂原型嚴格依「出生日期（公曆）」→ 太陽星座，不可改為按今日或其它邏輯 */
    setSunSign(getSunSignFromDate(solarYear, solarMonth, solarDay));

    saveLastBirth({
      year: solarYear,
      month: solarMonth,
      day: solarDay,
      name: _name?.trim() || undefined,
      hourIndex: hourIndex ?? 6,
      gender,
      useSolarTime,
      city: city ? { name: city.name, nameZh: city.nameZh, country: city.country, lat: city.lat, lng: city.lng } : undefined,
    });

    if (user) {
      const { error } = await supabase.from('profiles').update({
        birthday: `${solarYear}-${String(solarMonth).padStart(2, '0')}-${String(solarDay).padStart(2, '0')}`,
        birth_chart_name: _name?.trim() || null,
        wood: p.energy.wood, fire: p.energy.fire, earth: p.energy.earth,
        metal: p.energy.metal, water: p.energy.water,
        dominant_element: p.dominantElement,
      }).eq('id', user.id);
      if (!error) toast.success(t('oracle.savedToAccount', { defaultValue: '已保存至你的帳號' }));
    }

    saveToArchivesIfNeeded(_group, _name, {
      solarYear,
      solarMonth,
      solarDay,
      hourIndex: hourIndex ?? 6,
      gender,
      useSolarTime,
      calendarType,
      city: city ?? null,
    });

    navigate('/oracle/soul');
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition">
      {/* 星圖頁標：與底部 Tab「星圖」對應，強化品牌感 */}
      <motion.header
        className="text-center space-y-0.5 pb-1"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-body-sm font-semibold tracking-[0.35em] uppercase text-heading">
          {t('oracle.starChartPageTitle', { defaultValue: '星圖' })}
        </h1>
        <p className="text-caption tracking-widest text-subtitle">
          {t('oracle.starChartPageSubtitle', { defaultValue: '本命星圖 · 今日一句與靈魂原型' })}
        </p>
      </motion.header>

      {/* Challenge Banner */}
      {compareSoul && (
        <div
          className="rounded-2xl p-3 flex items-center gap-3 animate-in slide-in-from-top-4 duration-500"
          style={{
            background: 'linear-gradient(135deg, hsla(var(--gold) / 0.12), hsla(var(--accent) / 0.08))',
            border: '1px solid hsla(var(--gold) / 0.25)',
          }}
        >
          <span className="text-body-lg">⚔️</span>
          <div className="flex-1 min-w-0">
            <p className="text-caption font-semibold text-heading">
              ⚡ {t('oracle.challengeTitle')}
            </p>
            <p className="text-[10px] text-subtitle truncate">
              {t('oracle.challengeDesc', { soulId: compareSoul.slice(0, 8) })}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="text-accent text-caption px-3 py-1.5 rounded-full font-semibold whitespace-nowrap"
            style={{
              background: 'hsla(var(--gold) / 0.2)',
              border: '1px solid hsla(var(--gold) / 0.3)',
            }}
          >
            {t('oracle.startReading')}
          </button>
        </div>
      )}

      {/* Hero：首屏鉤子 + 裝飾線（一眼抓住） */}
      <motion.div
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-h3 sm:text-h2 font-bold leading-snug px-1 text-crystal font-display">
          {t('oracle.heroHook', { defaultValue: '宇宙在你出生那一刻，已經寫好了你的密碼。' })}
        </h2>
        <p className="text-body-sm text-subtitle max-w-sm mx-auto">
          {t('oracle.heroSub', { defaultValue: '解開它，看見今日一句與靈魂原型。' })}
        </p>
        <div className="flex justify-center gap-1.5 pt-1" aria-hidden>
          <span className="w-1 h-1 rounded-full bg-gold-strong/50" />
          <span className="w-1.5 h-1 rounded-full bg-gold-strong/70" />
          <span className="w-1 h-1 rounded-full bg-gold-strong/50" />
        </div>
      </motion.div>

      {/* 輸入出生日期的入口：始終顯示在 Hero 下方。未填＝大按鈕；已填＝切換星盤 */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
      >
        {!profile ? (
          <>
            <p className="text-[11px] tracking-[0.2em] uppercase text-subtitle text-center">
              {t('oracle.yourArchetype')}
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full py-5 px-6 rounded-2xl text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, hsla(var(--gold) / 0.22), hsla(var(--accent) / 0.12))',
                border: '1px solid hsla(var(--gold) / 0.5)',
                boxShadow: '0 0 32px hsla(var(--gold) / 0.18), inset 0 1px 0 hsla(var(--gold) / 0.15)',
              }}
            >
              <p className="text-body-lg font-semibold tracking-wide text-heading font-display">
                ✦ {t('oracle.ctaReveal', { defaultValue: '解開我的星圖' })} ✦
              </p>
              <p className="text-caption text-subtitle mt-2 max-w-xs mx-auto opacity-90">
                {t('oracle.ctaRevealHint', { defaultValue: '填寫出生日期，約 10 秒。解開後將顯示你的靈魂原型（可截圖）。' })}
              </p>
            </button>
            <p className="text-center text-xs text-subtitle/90 max-w-sm mx-auto">
              {t('oracle.ctaPayoff', { defaultValue: '解開後，專屬於你的靈魂原型與金句將揭曉。' })}
            </p>
          </>
        ) : (
          <>
            {/* 已填寫：三塊同寬同高，統一 80px 高 */}
            <div className="w-full max-w-md mx-auto mt-2 flex flex-col gap-3">
              <CosmicTeaserCard />
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="h-[80px] w-full rounded-2xl text-body-sm font-semibold border border-gold-strong hover:opacity-90 transition-opacity bg-gold-soft text-gold-strong flex items-center justify-center"
              >
                {t('oracle.viewSoulArchetype', { defaultValue: '查看靈魂原型' })}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="h-[80px] w-full rounded-2xl text-body-sm font-semibold border border-gold-strong/60 hover:opacity-90 transition-opacity bg-transparent text-gold-strong flex items-center justify-center"
              >
                {t('oracle.switchChart', { defaultValue: '切換星盤' })}
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* 未填寫時：今日一句入口單獨一區；已填寫時上方已有 CosmicTeaserCard，此處加「查看完整日運」入口 */}
      {!profile && (
        <div className="w-full max-w-md mx-auto mt-2">
          <CosmicTeaserCard />
        </div>
      )}
      {profile && (
        <button
          type="button"
          onClick={() => navigate('/rhythm?tab=daily')}
          className="w-full max-w-md mx-auto mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-body font-medium border border-gold-strong/40 text-gold-strong/90 hover:bg-gold-soft/50 transition-colors"
        >
          {t('oracle.viewFullDaily', { defaultValue: '查看完整日運' })}
          <ChevronRight size={16} />
        </button>
      )}

      {/* 今日宜忌 · 月相（B+D） */}
      <DailyYijiMoonCard />

      {/* 今日数字：幸运数 / 幸运色 / 一句话 */}
      <div className="w-full max-w-md mx-auto">
        <DailyNumerologyCard />
      </div>

      {/* 每日一牌：日期種子固定一張塔羅 + 短解讀 */}
      <div className="w-full max-w-md mx-auto">
        <DailyOneCard />
      </div>

      {/* CTA for new users */}
      <CreateCardCTA />

      {/* 星圖板塊最下面：占卜方式（星盤 · 西方・本命與問事） */}
      <section ref={divinationSectionRef} className="space-y-3">
        <div>
          <h2 className="text-h4 font-bold tracking-[0.2em] text-heading text-center" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('oracle.toolsPageTitle', { defaultValue: '星盤' })}
          </h2>
          <p className="text-body-sm text-subtitle text-center mt-0.5">
            {t('oracle.toolsPageSubtitle', { defaultValue: '西方・本命與問事' })}
          </p>
          <div
            className="w-16 h-px mx-auto mt-2"
            style={{ background: 'linear-gradient(90deg, transparent, hsla(var(--gold) / 0.7), transparent)' }}
          />
        </div>
        <h3 className="text-body-sm font-semibold tracking-widest uppercase text-heading" style={{ fontFamily: 'var(--font-sans)' }}>
          {t('oracle.divinationMethods', { defaultValue: '占卜方式' })}
        </h3>
        <ul className="space-y-2.5">
          {WESTERN_DIVINATION.map(({ key, icon: Icon }) => {
            const isComingSoon = COMING_SOON_TOOLS.includes(key);
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => !isComingSoon && navigate(`/oracle/reading?tool=${key}`)}
                  disabled={isComingSoon}
                  className={`w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all border border-gold-strong/30 ${isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-95 active:scale-[0.99]'}`}
                  style={{
                    background: 'hsla(var(--card) / 0.85)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'hsla(var(--gold) / 0.12)', border: '1px solid hsla(var(--gold) / 0.25)' }}
                  >
                    <Icon size={22} className="text-heading" style={{ filter: 'drop-shadow(0 0 6px hsla(var(--gold) / 0.35))' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-semibold text-heading truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                      {t(`oracle.${key}`)}
                    </p>
                    <p className="text-body-sm text-subtitle mt-0.5 truncate">
                      {isComingSoon ? t('settings.comingSoon', { defaultValue: '即將推出' }) : t(`oracle.${key}Desc`)}
                    </p>
                  </div>
                  {!isComingSoon && <ChevronRight size={18} className="shrink-0 text-heading opacity-80" />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Modal */}
      <BirthInputModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setForArchive(null); }}
        onSubmit={handleBirthSubmit}
        defaultName={forArchive?.name ?? (location.state as { forArchiveName?: string } | null)?.forArchiveName}
        defaultGroup={forArchive?.group ?? (location.state as { forArchiveGroup?: string } | null)?.forArchiveGroup}
      />
    </div>
  );
};

export default OraclePage;
