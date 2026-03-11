/**
 * 符文占卜面板：內嵌 rune.html，灵性解读与塔罗一致走 Supabase 云函数
 * 免费用户仅看免费版讲解，付费用户可获取云端 AI 灵性解读
 * 支持内层返回：在解读结果页点返回先回到符文占卜主界面，再点才回星圆
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOracleAccess } from '@/hooks/useOracleAccess';
import { useAuth } from '@/hooks/useAuth';
import { useReadingBack } from '@/contexts/ReadingBackContext';
import { addReading } from '@/lib/readingHistory';
import type { RuneReadingDetail } from '@/lib/readingHistory';
import { toast } from 'sonner';

const RUNE_PAGE_BASE = '/rune.html';
const RUNES_API_BASE = import.meta.env.VITE_RUNES_API_URL ?? '';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

const RunesPanel = () => {
  const { t } = useTranslation();
  const hasPremiumAccess = useOracleAccess();
  const { session } = useAuth();
  const readingBack = useReadingBack();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasResultView, setHasResultView] = useState(false);
  const hasResultViewRef = useRef(false);
  hasResultViewRef.current = hasResultView;
  const params = new URLSearchParams();
  params.set('premium', hasPremiumAccess ? '1' : '0');
  if (RUNES_API_BASE) {
    params.set('api', RUNES_API_BASE);
  } else if (SUPABASE_URL && SUPABASE_ANON) {
    params.set('api', `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/rune-reading`);
    params.set('key', SUPABASE_ANON);
  }
  const iframeSrc = `${RUNE_PAGE_BASE}?${params.toString()}`;

  useEffect(() => {
    if (!readingBack) return;
    const handler = () => {
      if (!hasResultViewRef.current) return false;
      iframeRef.current?.contentWindow?.postMessage({ type: 'runeBackToMain' }, '*');
      setHasResultView(false);
      return true;
    };
    readingBack.registerHandler(handler);
    return () => readingBack.unregisterHandler();
  }, [readingBack]);

  useEffect(() => {
    if (!hasPremiumAccess || !session?.access_token || !iframeRef.current?.contentWindow) return;
    const iframe = iframeRef.current;
    const onLoad = () => {
      iframe.contentWindow?.postMessage(
        { type: 'setRuneToken', token: session.access_token },
        '*'
      );
    };
    iframe.addEventListener('load', onLoad);
    onLoad();
    return () => iframe.removeEventListener('load', onLoad);
  }, [hasPremiumAccess, session?.access_token]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'runeReadingShown') {
        setHasResultView(true);
        return;
      }
      if (e.data?.type === 'runeReadingHidden') {
        setHasResultView(false);
        return;
      }
      if (e.data?.type !== 'saveRuneReading' || !e.data?.payload) return;
      const p = e.data.payload as {
        question?: string | null;
        spreadType: string;
        spreadLabel?: string;
        runes: { rune_id: number; name: string; reversed: boolean; position?: string }[];
        interpretationSummary?: string;
      };
      const names = p.runes.map((r) => r.name + (r.reversed ? '（逆）' : '')).join('、');
      addReading({
        tool: 'runes',
        question: p.question || null,
        summary: `符文 · ${p.spreadLabel || p.spreadType} · ${names}`,
        detail: {
          spreadType: p.spreadType,
          spreadLabel: p.spreadLabel,
          question: p.question || undefined,
          runes: p.runes,
          interpretationSummary: p.interpretationSummary,
        } as RuneReadingDetail,
      });
      toast.success('已保存到解读记录');
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div className="w-full h-full min-h-0 absolute inset-0" style={{ background: '#0a0d1f' }}>
      <iframe
        ref={iframeRef}
        title={t('oracle.runes', { defaultValue: '符文仪式' })}
        src={iframeSrc}
        className="w-full h-full border-0 rounded-none block"
        style={{ minHeight: '100%' }}
        allow="autoplay"
      />
    </div>
  );
};

export default RunesPanel;
