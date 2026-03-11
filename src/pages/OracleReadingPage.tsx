import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Share2, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { domToPng } from 'modern-screenshot';
import * as domtoimage from 'dom-to-image';
import EnergyRadar from '@/components/EnergyRadar';
import { getHideEnergyRadar } from '@/lib/energyRadarSetting';
import BirthInputModal from '@/components/BirthInputModal';
import ReadingPoster from '@/components/ReadingPoster';
import OracleLoadingRitual from '@/components/OracleLoadingRitual';
import TimeSlider from '@/components/TimeSlider';
import BaziResultPanel from '@/components/BaziResultPanel';
import AstrologyChartPanel from '@/components/AstrologyChartPanel';
import TarotPanel from '@/components/TarotPanel';
import OracleCardPanel from '@/components/OracleCardPanel';
import OracleSanctumEntrance from '@/components/OracleSanctumEntrance';
import LenormandPanel from '@/components/LenormandPanel';
import RunesPanel from '@/components/RunesPanel';
import NumerologyPanel from '@/components/NumerologyPanel';
import HeroSection from '@/components/hero/HeroSection';
import { calculateElementEnergy, generateInsight } from '@/lib/fiveElements';
import type { ElementEnergy, CelestialProfile } from '@/lib/fiveElements';
import { computeLocalBazi } from '@/lib/baziLocal';
import { generateBaziReading } from '@/lib/baziReading';
import { getSunSignFromDate, computeSimplePlanets } from '@/lib/astrologyChart';
import type { ZodiacSignKey, SimplePlanetInfo } from '@/lib/astrologyChart';
import solarlunar from 'solarlunar';
import {
  saveToArchivesIfNeeded,
  saveLastBirth,
  loadLastBirth,
  type ArchiveEntry,
  READING_ARCHIVE_KEY,
  READING_FROM_ARCHIVE_FLAG,
} from '@/lib/archives';
import { useAuth } from '@/hooks/useAuth';
import { useOracleAccess } from '@/hooks/useOracleAccess';
import { addReading } from '@/lib/readingHistory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oracle-reading`;

const toolNames: Record<string, string> = {
  bazi: '八字', ziwei: '紫微', qimen: '奇门', liuren: '六壬',
  xiaoliuren: '小六壬', liuyao: '六爻', xuankong: '玄空', tarot: '塔罗', astrology: '星象', meihua: '梅花',
};

/** 占星四元素样式（星盘展示用） */
const AWAKENED_KEY = 'celestial_awakened_tools';
const getAwakened = (): string[] => {
  try { return JSON.parse(localStorage.getItem(AWAKENED_KEY) || '[]'); } catch { return []; }
};
const markAwakened = (tool: string) => {
  const list = getAwakened();
  if (!list.includes(tool)) { list.push(tool); localStorage.setItem(AWAKENED_KEY, JSON.stringify(list)); }
};

const OracleReadingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const hasOracleAccess = useOracleAccess();
  const toolKey = searchParams.get('tool') || 'bazi';
  const fromArchive = location.state?.fromArchive as ArchiveEntry | undefined;
  const [appliedArchive, setAppliedArchive] = useState<ArchiveEntry | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const baziExportRef = useRef<HTMLDivElement>(null);
  const lastSavedAstrologyKeyRef = useRef<string | null>(null);
  const tarotPanelRef = useRef<HTMLDivElement>(null);
  const [tarotQuickPickCategoryId, setTarotQuickPickCategoryId] = useState<string>('');

  const [modalOpen, setModalOpen] = useState(false);
  // 是否锁定出生日期（用于占星行星/宮位点击时，只补充时间與地點）
  const [lockBirthDate, setLockBirthDate] = useState(false);
  const [baziExporting, setBaziExporting] = useState(false);
  const [energy, setEnergy] = useState<ElementEnergy | null>(null);
  const [profile, setProfile] = useState<CelestialProfile | null>(null);
  const [insight, setInsight] = useState('');
  const [birthData, setBirthData] = useState<{
    year: number;
    month: number;
    day: number;
    hourIndex?: number;
    gender?: 'male' | 'female';
    city?: import('@/lib/cities').CityEntry | null;
    useSolarTime?: boolean;
  } | null>(null);

  const [reading, setReading] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [sliderYear, setSliderYear] = useState(new Date().getFullYear());
  const [sliderEnergy, setSliderEnergy] = useState<ElementEnergy | null>(null);
  // 占星：簡化版行星落座（付費版 UI 示意，基於生日+時辰）
  const [astroPlanets, setAstroPlanets] = useState<SimplePlanetInfo[] | null>(null);
  const [oracleQuestion, setOracleQuestion] = useState('');
  /** 雷諾曼：是否已完成 3D 儀式入口（IDLE→SHATTER→MATRIX），完成後才顯示選牌面板；從牌義庫「去抽牌」進入時直接為 true 以跳過 3D 避免大退 */
  const [lenormandRitualDone, setLenormandRitualDone] = useState(() =>
    !!(location.state as { skipLenormandRitual?: boolean } | null)?.skipLenormandRitual
  );

  // 若从关系页「查看命盤」进入，或刷新后从 sessionStorage 恢复，直接填入存档数据并开始解读
  useEffect(() => {
    const storedEntry =
      !fromArchive && sessionStorage.getItem(READING_FROM_ARCHIVE_FLAG) === '1'
        ? (() => {
            try {
              const raw = sessionStorage.getItem(READING_ARCHIVE_KEY);
              return raw ? (JSON.parse(raw) as ArchiveEntry) : null;
            } catch {
              return null;
            }
          })()
        : null;
    const entry = fromArchive ?? storedEntry;

    if (entry?.birthData) {
      const b = entry.birthData;
      const city = b.city
        ? { name: b.city.name, nameZh: b.city.nameZh, country: b.city.country, lat: b.city.lat, lng: b.city.lng }
        : null;
      setAppliedArchive(entry);
      setBirthData({
        year: b.year,
        month: b.month,
        day: b.day,
        hourIndex: b.hourIndex ?? 6,
        gender: b.gender,
        city,
        useSolarTime: b.useSolarTime,
      });
      const p = calculateElementEnergy(b.year, b.month, b.day);
      setEnergy(p.energy);
      setProfile(p);
      setInsight(generateInsight(p, i18n.language, t));
      setModalOpen(false);
      // 神谕卡/塔罗/雷诺曼不跑加载仪式，直接进选牌，避免转圈卡住
      if (toolKey !== 'lenormand' && toolKey !== 'tarot' && toolKey !== 'oracle' && toolKey !== 'numerology') setShowLoading(true);
      if (fromArchive) {
        sessionStorage.setItem(READING_ARCHIVE_KEY, JSON.stringify(fromArchive));
        sessionStorage.setItem(READING_FROM_ARCHIVE_FLAG, '1');
      } else {
        sessionStorage.removeItem(READING_ARCHIVE_KEY);
        sessionStorage.removeItem(READING_FROM_ARCHIVE_FLAG);
      }
      return;
    }
    sessionStorage.removeItem(READING_ARCHIVE_KEY);
    sessionStorage.removeItem(READING_FROM_ARCHIVE_FLAG);
    const last = loadLastBirth();
    if (last && toolKey !== 'astrology') {
      // 占星不自動帶入上次的出生資料，必須在本頁填寫或確認後再顯示星盤
      const city = last.city
        ? { name: last.city.name, nameZh: last.city.nameZh, country: last.city.country, lat: last.city.lat, lng: last.city.lng }
        : undefined;
      setBirthData({
        year: last.year,
        month: last.month,
        day: last.day,
        hourIndex: last.hourIndex ?? 6,
        gender: last.gender,
        city,
        useSolarTime: last.useSolarTime,
      });
      const p = calculateElementEnergy(last.year, last.month, last.day);
      setEnergy(p.energy);
      setProfile(p);
      setInsight(generateInsight(p, i18n.language, t));
      setModalOpen(false);
      if (toolKey !== 'lenormand' && toolKey !== 'tarot' && toolKey !== 'oracle' && toolKey !== 'numerology') setShowLoading(true);
    } else if (toolKey === 'astrology') {
      setLockBirthDate(false);
      setModalOpen(true);
    } else {
      // 塔羅、神諭卡、雷諾曼、數字命理：不強制要求出生資料，可直接進入體驗
      if (toolKey === 'tarot' || toolKey === 'oracle' || toolKey === 'lenormand' || toolKey === 'numerology') {
        setShowLoading(false);
      } else {
        setLockBirthDate(false);
        setModalOpen(true);
      }
    }
  }, []);


  // Recalculate energy when slider year changes
  useEffect(() => {
    if (birthData) {
      const p = calculateElementEnergy(birthData.year, birthData.month, birthData.day);
      // Simulate year-based variation
      const yearDiff = sliderYear - new Date().getFullYear();
      const vary = (v: number, seed: number) => Math.max(5, Math.min(95, v + Math.round(Math.sin(yearDiff * 0.7 + seed) * 12)));
      setSliderEnergy({
        wood: vary(p.energy.wood, 1),
        fire: vary(p.energy.fire, 2),
        earth: vary(p.energy.earth, 3),
        metal: vary(p.energy.metal, 4),
        water: vary(p.energy.water, 5),
      });
    }
  }, [sliderYear, birthData]);

  const handleBirthSubmit = async (
    year: number,
    month: number,
    day: number,
    city?: import('@/lib/cities').CityEntry | null,
    useSolarTime?: boolean,
    hourIndex?: number,
    gender?: 'male' | 'female',
    calendarType: 'solar' | 'lunar' = 'solar',
    group?: string,
    name?: string,
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
      } catch (e) {
        // 如果轉換失敗，退回直接當公曆處理，避免整個流程中斷
        solarYear = year;
        solarMonth = month;
        solarDay = day;
      }
    }

    const p = calculateElementEnergy(solarYear, solarMonth, solarDay);
    setEnergy(p.energy);
    setProfile(p);
    setInsight(generateInsight(p, i18n.language, t));
    setBirthData({ year: solarYear, month: solarMonth, day: solarDay, hourIndex, gender, city, useSolarTime });
    saveLastBirth({
      year: solarYear,
      month: solarMonth,
      day: solarDay,
      name: name?.trim() || undefined,
      hourIndex: hourIndex ?? 6,
      gender,
      useSolarTime,
      city: city ? { name: city.name, nameZh: city.nameZh, country: city.country, lat: city.lat, lng: city.lng } : undefined,
    });

    if (user) {
      const { error } = await supabase.from('profiles').update({
        birthday: `${solarYear}-${String(solarMonth).padStart(2, '0')}-${String(solarDay).padStart(2, '0')}`,
        birth_chart_name: name?.trim() || null,
        wood: p.energy.wood, fire: p.energy.fire, earth: p.energy.earth,
        metal: p.energy.metal, water: p.energy.water, dominant_element: p.dominantElement,
      }).eq('id', user.id);
      if (!error) toast.success(t('oracle.savedToAccount', { defaultValue: '已保存至你的帳號' }));
    }

    saveToArchivesIfNeeded(group, name, {
      solarYear,
      solarMonth,
      solarDay,
      hourIndex: hourIndex ?? 6,
      gender,
      useSolarTime,
      calendarType,
      city: city ?? null,
    });

    // Show loading ritual before AI reading
    setShowLoading(true);
  };

  const startAIReading = useCallback(async (year: number, month: number, day: number, p: CelestialProfile) => {
    setIsStreaming(true);
    setReading('');
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          birthYear: year, birthMonth: month, birthDay: day,
          energy: p.energy, dominantElement: p.dominantElement,
          weakestElement: p.weakestElement, balance: p.balance,
          tool: toolKey, language: i18n.language,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Failed' }));
        setReading(`⚠ ${err.error || 'AI service error'}`);
        setIsStreaming(false);
        return;
      }

      // 统一占卜 AI 返回 JSON { content } 时直接使用
      const contentType = resp.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const data = await resp.json();
        if (data?.content) {
          setReading(data.content);
          markAwakened(toolKey);
        } else {
          setReading('⚠ 解读返回为空');
        }
        setIsStreaming(false);
        return;
      }

      if (!resp.body) {
        setReading('⚠ 无响应内容');
        setIsStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { fullText += content; setReading(fullText); }
          } catch { /* skip */ }
        }
      }
      markAwakened(toolKey);
    } catch (e) {
      console.error('Stream error:', e);
      setReading('⚠ Connection error. Please try again.');
    }
    setIsStreaming(false);
  }, [toolKey, i18n.language]);

  const onLoadingComplete = useCallback(() => {
    setShowLoading(false);
    // 八字、占星、塔羅、神諭卡走本地邏輯，不請求遠端 AI
    if (toolKey === 'bazi' || toolKey === 'astrology' || toolKey === 'tarot' || toolKey === 'oracle') return;
    if (birthData && profile) {
      startAIReading(birthData.year, birthData.month, birthData.day, profile);
    }
  }, [birthData, profile, toolKey, startAIReading]);

  const handleDownloadPoster = async () => {
    if (!posterRef.current || !energy) return;
    setDownloading(true);
    try {
      const dataUrl = await domToPng(posterRef.current, { width: 1080, height: 1920, scale: 2, quality: 1 });
      const link = document.createElement('a');
      link.download = `celestial-${toolKey}-reading.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Poster download error:', e);
    }
    setDownloading(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${toolNames[toolKey] || toolKey} Reading | MyCelestial`,
          text: `✦ Check out my ${toolKey} soul reading on MyCelestial!`,
          url: 'https://mycelestial.app',
        });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText('https://mycelestial.app');
    }
  };

  const handlePaymentUnlock = async () => {
    if (!user) { navigate('/auth'); return; }
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { priceId: 'price_1day_inspiration' },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      console.error('Payment error:', e);
    }
  };

  const displayEnergy = sliderYear !== new Date().getFullYear() && sliderEnergy ? sliderEnergy : energy;

  const infoForBazi = useMemo(() => birthData ? {
    name: '命主',
    year: String(birthData.year),
    month: String(birthData.month).padStart(2, '0'),
    day: String(birthData.day).padStart(2, '0'),
    hour: String(birthData.hourIndex ?? 6),
    longitude: birthData.city?.lng,
    useSolarTime: birthData.useSolarTime ?? false,
    gender: birthData.gender ?? 'male',
    region: '',
  } : null, [birthData]);
  const baziResult = useMemo(() => infoForBazi ? computeLocalBazi(infoForBazi) : null, [infoForBazi]);

  const astrologySunSign = useMemo((): ZodiacSignKey | null => {
    if (toolKey !== 'astrology' || !birthData) return null;
    return getSunSignFromDate(birthData.year, birthData.month, birthData.day);
  }, [toolKey, birthData]);

  // 八字：使用本地规则引擎生成解读文本（此页走付费版·长解读）
  useEffect(() => {
    if (toolKey !== 'bazi' || !baziResult || !birthData) return;
    const gender = birthData.gender ?? 'male';
    const language = i18n.language === 'zh-Hant' ? 'zh-Hant' : 'zh-CN';
    const text = generateBaziReading(baziResult, {
      level: 'long',
      gender,
      language,
    });
    setReading(text);
    setIsStreaming(false);
  }, [toolKey, baziResult, birthData, i18n.language]);

  // 占星：完整詳細解讀 + 簡化行星落座（性格 + 事業 + 情感 + 健康 + 優劣勢 + 成長建議 + 關鍵詞 + 金句）
  useEffect(() => {
    if (toolKey !== 'astrology' || !birthData) return;
    const sunSign = getSunSignFromDate(birthData.year, birthData.month, birthData.day);
    const name = t(`oracle.signs.${sunSign}.archetypeName`);
    const interpretation = t(`oracle.signs.${sunSign}.interpretation`);
    const tagline = t(`oracle.signs.${sunSign}.tagline`);
    const traits = t(`oracle.signs.${sunSign}.traits`);
    const career = t(`oracle.signs.${sunSign}.career`);
    const love = t(`oracle.signs.${sunSign}.love`);
    const health = t(`oracle.signs.${sunSign}.health`);
    const strengths = t(`oracle.signs.${sunSign}.strengths`);
    const weaknesses = t(`oracle.signs.${sunSign}.weaknesses`);
    const growth = t(`oracle.signs.${sunSign}.growth`);
    const keyword = t(`oracle.signs.${sunSign}.keyword`);
    const quote = t(`oracle.signs.${sunSign}.quote`);
    const text = `## ${name}\n\n${interpretation}\n\n*${tagline}*\n\n**${t('oracle.astrologyTraitsLabel', { defaultValue: '本命特質' })}**\n${traits}\n\n---\n\n**${t('oracle.astrologyCareerLabel', { defaultValue: '事業與財富' })}**\n${career}\n\n**${t('oracle.astrologyLoveLabel', { defaultValue: '情感與關係' })}**\n${love}\n\n**${t('oracle.astrologyHealthLabel', { defaultValue: '健康' })}**\n${health}\n\n**${t('oracle.astrologyStrengthsLabel', { defaultValue: '優勢' })}**\n${strengths}\n\n**${t('oracle.astrologyWeaknessesLabel', { defaultValue: '不足' })}**\n${weaknesses}\n\n**${t('oracle.astrologyGrowthLabel', { defaultValue: '成長建議' })}**\n${growth}\n\n---\n\n**${t('oracle.energyKeywords')}**：${keyword}\n\n> ${quote}`;
    setReading(text);
    setIsStreaming(false);

    // 占星以星盤看個人資訊，不依賴「占卜問題」；有出生資料即寫入解讀記錄
    const key = `${birthData.year}-${birthData.month}-${birthData.day}`;
    if (lastSavedAstrologyKeyRef.current !== key) {
      lastSavedAstrologyKeyRef.current = key;
      addReading({
        tool: 'astrology',
        question: '',
        summary: `占星 · ${name} · ${birthData.year}/${birthData.month}/${birthData.day}`,
        detail: {
          sunSign,
          birthYear: birthData.year,
          birthMonth: birthData.month,
          birthDay: birthData.day,
          reading: text,
        },
      });
    }

    // 同時計算簡化版行星落座，供付費版行星/宮位視圖直接使用
    const simple = computeSimplePlanets({
      year: birthData.year,
      month: birthData.month,
      day: birthData.day,
      hourIndex: birthData.hourIndex ?? 6,
    });
    setAstroPlanets(simple);
  }, [toolKey, birthData, t]);

  // 離開雷諾曼時重置儀式狀態，下次進入會再次顯示 3D 入口
  useEffect(() => {
    if (toolKey !== 'lenormand') setLenormandRitualDone(false);
  }, [toolKey]);

  // 從牌義庫「去抽牌」進入時跳過 3D 儀式，直接顯示選牌/抽牌面板，避免重載 3D 導致崩潰或大退
  useEffect(() => {
    if (toolKey === 'lenormand' && (location.state as { skipLenormandRitual?: boolean } | null)?.skipLenormandRitual) {
      setLenormandRitualDone(true);
    }
  }, [toolKey, location.state]);

  const drawWatermarkOnCanvas = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        if (!ctx) { reject(new Error('Canvas 2d')); return; }
        ctx.drawImage(img, 0, 0);
        ctx.font = '10px "Noto Serif SC", serif';
        ctx.fillStyle = 'rgba(224,224,224,0.15)';
        ctx.fillText('Celestial Insights · 版权所有', c.width - 100, c.height - 20);
        resolve(c.toDataURL('image/png', 1.0));
      };
      img.onerror = () => reject(new Error('Image load'));
      img.src = dataUrl;
    });
  };

  const handleExportBazi = async () => {
    if (!baziExportRef.current) return;
    setBaziExporting(true);
    try {
      const el = baziExportRef.current;
      const btn = el.querySelector('button[type="button"]') as HTMLElement | null;
      const prevBtnDisplay = btn?.style.display;
      if (btn) btn.style.display = 'none';
      const scale = Math.min(2, window.devicePixelRatio || 2);
      const w = Math.round((el.offsetWidth || 600) * scale);
      const h = Math.round((el.scrollHeight || el.offsetHeight) * scale);
      const dataUrl = await domtoimage.toPng(el, { width: w, height: h, bgcolor: '#0d0618' });
      if (btn) btn.style.display = prevBtnDisplay ?? '';
      const withWatermark = await drawWatermarkOnCanvas(dataUrl);
      const link = document.createElement('a');
      link.download = `Celestial_Insights_八字命盘_${Date.now()}.png`;
      link.href = withWatermark;
      link.click();
    } catch { /* fallback */ }
    setBaziExporting(false);
  };

  // 雷諾曼：未完成儀式時全屏顯示 3D 入口（黑金騎士牌 → 炸裂 → 矩陣）
  if (toolKey === 'lenormand' && !showLoading && !lenormandRitualDone) {
    return (
      <div className="fixed inset-0 z-50">
        <HeroSection
          onRitualComplete={() => setLenormandRitualDone(true)}
        />
      </div>
    );
  }

  // 符文：全屏內嵌 rune.html，背景與 rune 頁一致，底部留出導航欄
  if (toolKey === 'runes' && !showLoading) {
    return (
      <div
        className="fixed top-0 left-0 right-0 bottom-20 w-full overflow-hidden z-0"
        style={{ paddingTop: 'env(safe-area-inset-top)', background: '#0a0d1f' }}
      >
        <RunesPanel />
      </div>
    );
  }

  // 數字命理：全屏空灵之境（与符文一致占满可视区，底部留出导航）
  if (toolKey === 'numerology' && !showLoading) {
    return (
      <div
        className="fixed top-0 left-0 right-0 bottom-20 z-10 w-full h-full overflow-auto"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <NumerologyPanel />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5 pt-4 page-transition pb-10">
      {/* Header（塔羅時整體字體略大） */}
      <div className="text-center space-y-1">
        <h2
          className={`font-bold ${toolKey === 'tarot' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}
          style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 20px hsla(var(--gold) / 0.3)' }}
        >
          ✦ {t(`oracle.${toolKey}`)} ✦
        </h2>
        <p className="text-sm text-subtitle">
          {t(`oracle.${toolKey}Desc`)}
        </p>
        {toolKey === 'astrology' && birthData && (
          <div className="mt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setLockBirthDate(false);
                setModalOpen(true);
              }}
              className="px-4 py-2 rounded-full border-2 border-dashed text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:border-cyan-400 transition-colors"
            >
              切换星盘
            </button>
            <button
              type="button"
              onClick={() => toast.success('保存成功 ✅', { duration: 2000 })}
              className="px-4 py-2 rounded-full border border-gold-strong/30 text-sm font-medium text-gold-strong/90 hover:text-gold-strong hover:bg-gold-strong/5 transition-colors"
            >
              保存
            </button>
          </div>
        )}
      </div>

      {/* Loading Ritual（不用 AnimatePresence，避免 insertBefore 報錯） */}
      {showLoading && (
        <OracleLoadingRitual toolKey={toolKey} onComplete={onLoadingComplete} />
      )}

      {/* 八字工具：专业排盘面板（四柱/十神/五行/大运/解读/导出） */}
      {toolKey === 'bazi' && birthData && baziResult && infoForBazi && !showLoading ? (
        <BaziResultPanel
          birthLabel={[
            (appliedArchive ?? fromArchive)?.name,
            `${birthData.year}年${birthData.month}月${birthData.day}日 ${['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][Number(infoForBazi.hour) || 6]}时${birthData.gender === 'female' ? ' 女' : ' 男'}`,
          ].filter(Boolean).join(' · ')}
          useSolarTime={!!birthData.useSolarTime}
          baziResult={baziResult}
          reading={reading}
          onExport={handleExportBazi}
          exporting={baziExporting}
          exportRef={baziExportRef}
        />
      ) : toolKey === 'astrology' && birthData && astrologySunSign && !showLoading ? (
        <div>
          <AstrologyChartPanel
            sunSign={astrologySunSign}
            birthYear={birthData.year}
            birthMonth={birthData.month}
            birthDay={birthData.day}
            planets={astroPlanets}
            onRequestBirthTime={() => {
              setLockBirthDate(true);
              setModalOpen(true);
            }}
            hasAccess={hasOracleAccess}
            reading={reading}
          />
        </div>
      ) : toolKey === 'tarot' && !showLoading ? (
        <div ref={tarotPanelRef}>
          <TarotPanel
            date={new Date()}
            spreadType={searchParams.get('spread') === 'three' ? 'three' : 'daily'}
            hasPremiumAccess={hasOracleAccess}
          />
        </div>
      ) : toolKey === 'oracle' && !showLoading ? (
        <>
          <OracleSanctumEntrance
            question={oracleQuestion}
            onQuestionChange={setOracleQuestion}
          />
          <div>
            <OracleCardPanel
              date={new Date()}
              externalQuestion={oracleQuestion}
              hasPremiumAccess={hasOracleAccess}
            />
          </div>
        </>
      ) : toolKey === 'lenormand' && !showLoading ? (
        <>
          <OracleSanctumEntrance
            question={oracleQuestion}
            onQuestionChange={setOracleQuestion}
            hideHistoryButton
          />
          <LenormandPanel
            question={oracleQuestion}
            onQuestionChange={setOracleQuestion}
            hasPremiumAccess={hasOracleAccess}
          />
        </>
      ) : toolKey === 'runes' && !showLoading ? (
        <RunesPanel />
      ) : toolKey !== 'bazi' && toolKey !== 'astrology' && toolKey !== 'tarot' && toolKey !== 'oracle' && toolKey !== 'lenormand' && toolKey !== 'numerology' && displayEnergy && !showLoading && !getHideEnergyRadar() ? (
        <EnergyRadar energy={displayEnergy} insight={insight} />
      ) : null}

      {/* Time Slider（八字、占星、塔羅、神諭卡、雷諾曼均不顯示；僅用於能量雷達等需選年份的工具；關閉能量地圖時一併隱藏） */}
      {toolKey !== 'bazi' && toolKey !== 'astrology' && toolKey !== 'tarot' && toolKey !== 'oracle' && toolKey !== 'lenormand' && toolKey !== 'numerology' && energy && !showLoading && !isStreaming && !getHideEnergyRadar() && (
        <TimeSlider year={sliderYear} onChange={setSliderYear} />
      )}

      {/* AI Reading（八字不展示；占星僅保留星盤/行星/宮位，不展示「占星解讀」區塊；不用 AnimatePresence 避免 insertBefore） */}
      {toolKey !== 'bazi' && toolKey !== 'astrology' && toolKey !== 'oracle' && toolKey !== 'numerology' && reading && !showLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-highlight relative"
            style={{ backdropFilter: 'blur(20px)', background: 'hsla(var(--card) / 0.2)' }}
          >
            {isStreaming && (
              <div className="absolute top-3 right-3">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ background: 'hsl(var(--gold))', boxShadow: '0 0 10px hsl(var(--gold))' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: 'hsl(var(--gold))' }}>✦</span>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.6)' }}>
                {toolKey === 'astrology' ? t('oracle.astrologyReadingTitle', { defaultValue: '占星解讀' }) : `${t(`oracle.${toolKey}`)} · Soul Reading`}
              </span>
              <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, hsla(var(--gold) / 0.3), transparent)' }} />
            </div>
            <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-muted-foreground">
              <ReactMarkdown>{reading}</ReactMarkdown>
            </div>
            {isStreaming && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'hsl(var(--gold))' }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground italic">Channeling cosmic wisdom...</span>
              </div>
            )}
          </motion.div>
        )}

      {/* Action buttons（八字、占星、塔羅均不展示此块；僅能量類工具保留下載／分享） */}
      {toolKey !== 'bazi' && toolKey !== 'astrology' && toolKey !== 'tarot' && toolKey !== 'oracle' && energy && !isStreaming && reading && !showLoading && (
        <div className="space-y-2">
          <button
            onClick={handleDownloadPoster}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, hsla(var(--gold) / 0.2), hsla(var(--gold) / 0.08))',
              border: '1px solid hsla(var(--gold) / 0.35)',
              color: 'hsl(var(--gold))',
              fontFamily: 'var(--font-serif)',
            }}
          >
            <Download size={16} />
            {downloading ? '...' : t('oracle.downloadPoster', { defaultValue: '✦ Save HD Soul Chart ✦' })}
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.01] active:scale-[0.98]"
            style={{
              background: 'hsla(var(--muted) / 0.15)',
              border: '1px solid hsla(var(--muted) / 0.3)',
              color: 'hsl(var(--foreground))',
            }}
          >
            <Share2 size={14} />
            {t('oracle.shareReading', { defaultValue: 'Share Reading' })}
          </button>

          {/* Premium unlock */}
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, hsla(var(--accent) / 0.08), hsla(var(--gold) / 0.05))',
              border: '1px solid hsla(var(--accent) / 0.2)',
            }}
          >
            <Lock size={16} className="mx-auto mb-1.5" style={{ color: 'hsl(var(--accent))' }} />
            <p className="text-xs font-semibold mb-1" style={{ color: 'hsl(var(--accent))' }}>
              {t('oracle.unlockFull', { defaultValue: 'Unlock Full 2000-Word Report + Voice Commentary' })}
            </p>
            <p className="text-[10px] text-muted-foreground mb-2">
              {t('oracle.unlockDesc', { defaultValue: 'Deep analysis across all 9 divination systems' })}
            </p>
            <button
              onClick={handlePaymentUnlock}
              className="px-6 py-2 rounded-full text-xs font-bold tracking-wider transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsla(var(--gold) / 0.6))',
                color: 'hsl(var(--primary-foreground))',
                boxShadow: '0 0 20px hsla(var(--accent) / 0.3)',
              }}
            >
              $1.99 · {t('oracle.unlockNow', { defaultValue: 'Unlock Now' })}
            </button>
          </div>
        </div>
      )}

      {/* Re-read（八字、占星、塔羅均不顯示「查看星圖」；該按鈕僅用於能量類工具） */}
      {toolKey !== 'bazi' && toolKey !== 'astrology' && toolKey !== 'tarot' && toolKey !== 'oracle' && toolKey !== 'numerology' && energy && !isStreaming && !showLoading && (
        <button
          onClick={() => {
            if (birthData && profile) {
              setShowLoading(true);
            }
          }}
          className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, hsla(var(--gold) / 0.15), hsla(var(--accent) / 0.1))',
            border: '1px solid hsla(var(--gold) / 0.25)',
            color: 'hsl(var(--gold))', fontFamily: 'var(--font-serif)',
          }}
        >
          ✦ {t('oracle.startReading')} ✦
        </button>
      )}

      {/* Hidden poster（八字、占星不生成此海报；占星頁僅保留星盤/行星/宮位） */}
      {toolKey !== 'bazi' && toolKey !== 'astrology' && toolKey !== 'oracle' && toolKey !== 'numerology' && energy && reading && (
        <ReadingPoster
          ref={posterRef}
          energy={energy}
          dominantElement={profile?.dominantElement || 'earth'}
          toolKey={toolKey}
          readingExcerpt={reading}
        />
      )}

      <BirthInputModal
        open={modalOpen}
        onClose={() => {
          setLockBirthDate(false);
          setModalOpen(false);
        }}
        onSubmit={handleBirthSubmit}
        initialValues={birthData ? {
          year: birthData.year,
          month: birthData.month,
          day: birthData.day,
          hourIndex: birthData.hourIndex,
          gender: birthData.gender,
          useSolarTime: birthData.useSolarTime,
          city: birthData.city,
        } : undefined}
        lockDate={lockBirthDate}
      />
    </div>
  );
};

export default OracleReadingPage;
