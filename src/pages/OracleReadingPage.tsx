import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Download, Share2, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { domToPng } from 'modern-screenshot';
import EnergyRadar from '@/components/EnergyRadar';
import BirthInputModal from '@/components/BirthInputModal';
import ReadingPoster from '@/components/ReadingPoster';
import { calculateElementEnergy, generateInsight } from '@/lib/fiveElements';
import type { ElementEnergy, CelestialProfile } from '@/lib/fiveElements';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oracle-reading`;

const toolNames: Record<string, string> = {
  bazi: '八字', ziwei: '紫微', qimen: '奇门', liuren: '六壬',
  xiaoliuren: '小六壬', xuankong: '玄空', tarot: '塔罗', astrology: '星象', meihua: '梅花',
};

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
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const toolKey = searchParams.get('tool') || 'bazi';
  const posterRef = useRef<HTMLDivElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [energy, setEnergy] = useState<ElementEnergy | null>(null);
  const [profile, setProfile] = useState<CelestialProfile | null>(null);
  const [insight, setInsight] = useState('');
  const [birthData, setBirthData] = useState<{ year: number; month: number; day: number } | null>(null);

  const [reading, setReading] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { setModalOpen(true); }, []);

  const handleBirthSubmit = async (year: number, month: number, day: number) => {
    const p = calculateElementEnergy(year, month, day);
    setEnergy(p.energy);
    setProfile(p);
    setInsight(generateInsight(p, i18n.language, t));
    setBirthData({ year, month, day });

    if (user) {
      await supabase.from('profiles').update({
        birthday: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        wood: p.energy.wood, fire: p.energy.fire, earth: p.energy.earth,
        metal: p.energy.metal, water: p.energy.water, dominant_element: p.dominantElement,
      }).eq('id', user.id);
    }
    startAIReading(year, month, day, p);
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

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Failed' }));
        setReading(`⚠ ${err.error || 'AI service error'}`);
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
      if (data?.url) window.open(data.url, '_blank');
    } catch (e) {
      console.error('Payment error:', e);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pt-2 page-transition pb-8">
      {/* Header */}
      <div className="text-center space-y-1">
        <button onClick={() => navigate('/')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← {t('oracle.tools')}
        </button>
        <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 20px hsla(var(--gold) / 0.3)' }}>
          ✦ {t(`oracle.${toolKey}`)} ✦
        </h2>
        <p className="text-xs text-muted-foreground">{t(`oracle.${toolKey}Desc`)}</p>
      </div>

      {/* Energy Radar */}
      {energy && <EnergyRadar energy={energy} insight={insight} />}

      {/* AI Reading */}
      <AnimatePresence>
        {reading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-highlight relative"
            style={{ backdropFilter: 'blur(20px)', background: 'hsla(var(--card) / 0.2)' }}
          >
            {isStreaming && (
              <div className="absolute top-3 right-3">
                <Loader2 size={14} className="animate-spin" style={{ color: 'hsl(var(--gold))' }} />
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: 'hsl(var(--gold))' }}>✦</span>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.6)' }}>
                {t(`oracle.${toolKey}`)} · Soul Reading
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
      </AnimatePresence>

      {/* Action buttons */}
      {energy && !isStreaming && reading && (
        <div className="space-y-2">
          {/* Download HD Poster */}
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

          {/* Share */}
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

          {/* Premium unlock CTA */}
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

      {/* Re-read */}
      {energy && !isStreaming && (
        <button
          onClick={() => birthData && profile && startAIReading(birthData.year, birthData.month, birthData.day, profile)}
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

      {/* Hidden poster for screenshot */}
      {energy && reading && (
        <ReadingPoster
          ref={posterRef}
          energy={energy}
          dominantElement={profile?.dominantElement || 'earth'}
          toolKey={toolKey}
          readingExcerpt={reading}
        />
      )}

      <BirthInputModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleBirthSubmit} />
    </div>
  );
};

export default OracleReadingPage;
