import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Star, Layers, BookOpen, Orbit, Shield, Wind, Flower2, Hexagon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import EnergyRadar from '@/components/EnergyRadar';
import BirthInputModal from '@/components/BirthInputModal';
import { calculateElementEnergy, generateInsight } from '@/lib/fiveElements';
import type { ElementEnergy, CelestialProfile } from '@/lib/fiveElements';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oracle-reading`;

const tools = [
  { key: 'bazi', icon: Compass },
  { key: 'ziwei', icon: Star },
  { key: 'qimen', icon: Shield },
  { key: 'liuren', icon: Orbit },
  { key: 'xiaoliuren', icon: Wind },
  { key: 'xuankong', icon: Hexagon },
  { key: 'tarot', icon: Layers },
  { key: 'astrology', icon: Flower2 },
  { key: 'meihua', icon: BookOpen },
] as const;

const AWAKENED_KEY = 'celestial_awakened_tools';

const getAwakened = (): string[] => {
  try { return JSON.parse(localStorage.getItem(AWAKENED_KEY) || '[]'); } catch { return []; }
};

const markAwakened = (tool: string) => {
  const list = getAwakened();
  if (!list.includes(tool)) {
    list.push(tool);
    localStorage.setItem(AWAKENED_KEY, JSON.stringify(list));
  }
};

const OracleReadingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const toolKey = searchParams.get('tool') || 'bazi';

  const [modalOpen, setModalOpen] = useState(false);
  const [energy, setEnergy] = useState<ElementEnergy | null>(null);
  const [profile, setProfile] = useState<CelestialProfile | null>(null);
  const [insight, setInsight] = useState('');
  const [birthData, setBirthData] = useState<{ year: number; month: number; day: number } | null>(null);

  // AI reading state
  const [reading, setReading] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [awakened, setAwakened] = useState<string[]>(getAwakened);

  // Auto-open modal
  useEffect(() => {
    setModalOpen(true);
  }, []);

  const handleBirthSubmit = async (year: number, month: number, day: number) => {
    const p = calculateElementEnergy(year, month, day);
    setEnergy(p.energy);
    setProfile(p);
    setInsight(generateInsight(p, i18n.language, t));
    setBirthData({ year, month, day });

    // Save to profile if logged in
    if (user) {
      await supabase.from('profiles').update({
        birthday: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        wood: p.energy.wood, fire: p.energy.fire, earth: p.energy.earth,
        metal: p.energy.metal, water: p.energy.water,
        dominant_element: p.dominantElement,
      }).eq('id', user.id);
    }

    // Start AI reading
    startAIReading(year, month, day, p);
  };

  const startAIReading = useCallback(async (year: number, month: number, day: number, p: CelestialProfile) => {
    setIsStreaming(true);
    setReading('');

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
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
      let buffer = '';
      let fullText = '';

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
            if (content) {
              fullText += content;
              setReading(fullText);
            }
          } catch { /* partial json, skip */ }
        }
      }

      markAwakened(toolKey);
      setAwakened(getAwakened());
    } catch (e) {
      console.error('Stream error:', e);
      setReading('⚠ Connection error. Please try again.');
    }
    setIsStreaming(false);
  }, [toolKey, i18n.language]);

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
      {energy && (
        <EnergyRadar energy={energy} insight={insight} />
      )}

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

      {/* Re-read button */}
      {energy && !isStreaming && (
        <button
          onClick={() => birthData && startAIReading(birthData.year, birthData.month, birthData.day, profile!)}
          className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, hsla(var(--gold) / 0.15), hsla(var(--accent) / 0.1))',
            border: '1px solid hsla(var(--gold) / 0.25)',
            color: 'hsl(var(--gold))',
            fontFamily: 'var(--font-serif)',
          }}
        >
          ✦ {t('oracle.startReading')} ✦
        </button>
      )}

      {/* Modal */}
      <BirthInputModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleBirthSubmit} />
    </div>
  );
};

export default OracleReadingPage;
