import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Compass, Star, BookOpen, Orbit, Shield, Wind, Hexagon, ChevronRight, Binary } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EnergyRadar from '@/components/EnergyRadar';
import { getHideEnergyRadar } from '@/lib/energyRadarSetting';
import BirthInputModal from '@/components/BirthInputModal';
import { calculateElementEnergy, generateInsight } from '@/lib/fiveElements';
import solarlunar from 'solarlunar';
import type { ElementEnergy, CelestialProfile } from '@/lib/fiveElements';
import { saveToArchivesIfNeeded, saveLastBirth, READING_ARCHIVE_KEY, READING_FROM_ARCHIVE_FLAG } from '@/lib/archives';
import { useAuth } from '@/hooks/useAuth';
import { useOpenBirthModalWhenRequested } from '@/hooks/useOpenBirthModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/** 天啟：僅東方占卜（八字、紫微、奇門、六壬、小六壬、六爻、玄空、梅花），不含西方占星/塔羅 */
const tools = [
  { key: 'bazi', icon: Compass },
  { key: 'ziwei', icon: Star },
  { key: 'qimen', icon: Shield },
  { key: 'liuren', icon: Orbit },
  { key: 'xiaoliuren', icon: Wind },
  { key: 'liuyao', icon: Binary },
  { key: 'xuankong', icon: Hexagon },
  { key: 'meihua', icon: BookOpen },
] as const;

const AWAKENED_KEY = 'celestial_awakened_tools';
const getAwakened = (): string[] => {
  try { return JSON.parse(localStorage.getItem(AWAKENED_KEY) || '[]'); } catch { return []; }
};

const ToolsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [energy, setEnergy] = useState<ElementEnergy | null>(null);
  const [insight, setInsight] = useState('');
  const [awakened] = useState<string[]>(getAwakened);
  const [tappedTool, setTappedTool] = useState<string | null>(null);

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
    setEnergy(p.energy);
    setInsight(generateInsight(p, i18n.language, t));
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
  };

  const handleToolTap = (key: string) => {
    setTappedTool(key);
    setTimeout(() => {
      sessionStorage.removeItem(READING_ARCHIVE_KEY);
      sessionStorage.removeItem(READING_FROM_ARCHIVE_FLAG);
      navigate(`/oracle/reading?tool=${key}`);
    }, 700);
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pt-2 page-transition pb-8">
      {/* 標題區：星盤 + 副標 + 金色分隔線（與示意圖一致） */}
      <header className="space-y-2">
        <h1
          className="text-xl sm:text-2xl font-bold tracking-[0.2em] text-heading text-center"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {t('oracle.toolsPageTitle', { defaultValue: '星盤' })}
        </h1>
        <p className="text-body-sm text-subtitle text-center">
          {t('oracle.toolsPageSubtitle', { defaultValue: '西方・本命與問事' })}
        </p>
        <div
          className="w-16 h-px mx-auto"
          style={{ background: 'linear-gradient(90deg, transparent, hsla(var(--gold) / 0.7), transparent)' }}
        />
      </header>

      {/* 占卜方式：垂直列表，每項左圖標 + 名稱與說明 + 右箭頭 */}
      <section>
        <h2 className="text-body-sm font-semibold tracking-widest uppercase mb-3 text-heading" style={{ fontFamily: 'var(--font-sans)' }}>
          {t('oracle.divinationMethods', { defaultValue: '占卜方式' })}
        </h2>
        <ul className="space-y-2.5">
          {tools.map(({ key, icon: Icon }, index) => {
            const isTapped = tappedTool === key;
            const isAwakened = awakened.includes(key);
            return (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: isTapped ? 0 : 1, y: 0, scale: isTapped ? 0.98 : 1 }}
                transition={{ delay: index * 0.03, duration: isTapped ? 0.3 : 0.35 }}
              >
                <button
                  type="button"
                  onClick={() => handleToolTap(key)}
                  className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all hover:opacity-95 active:scale-[0.99] border border-gold-strong/30"
                  style={{
                    background: 'hsla(var(--card) / 0.85)',
                    boxShadow: isAwakened ? '0 0 20px hsla(var(--gold) / 0.12)' : '0 2px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'hsla(var(--gold) / 0.12)', border: '1px solid hsla(var(--gold) / 0.25)' }}
                  >
                    <Icon size={20} className="text-heading" style={{ filter: 'drop-shadow(0 0 6px hsla(var(--gold) / 0.35))' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-semibold text-heading truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                      {t(`oracle.${key}`)}
                    </p>
                    <p className="text-body-sm text-subtitle mt-0.5 truncate">
                      {t(`oracle.${key}Desc`)}
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-heading opacity-80" />
                </button>
              </motion.li>
            );
          })}
        </ul>
      </section>

      {/* 生命能量扇區：保留在列表下方，可選填後查看；設置中可關閉 */}
      {!getHideEnergyRadar() && (
        <EnergyRadar energy={energy} insight={insight} onRequestReading={() => setModalOpen(true)} />
      )}

      <AnimatePresence>
        {tappedTool && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 32 }).map((_, i) => {
              const angle = (Math.PI * 2 * i) / 32;
              const dist = 100 + Math.random() * 120;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 2 + Math.random() * 3,
                    height: 2 + Math.random() * 3,
                    background: 'hsl(var(--gold))',
                    boxShadow: '0 0 8px hsl(var(--gold)), 0 0 16px hsla(var(--gold) / 0.5)',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              );
            })}
            <motion.div
              className="w-32 h-32 rounded-full"
              style={{ background: 'radial-gradient(circle, hsla(var(--gold) / 0.5), transparent)' }}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BirthInputModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleBirthSubmit} />
    </div>
  );
};

export default ToolsPage;
