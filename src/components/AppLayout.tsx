import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getAvatarUrl, getDisplayInitials } from '@/lib/avatar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { saveLastBirth } from '@/lib/archives';
import Starfield from './Starfield';
import BottomNav from './BottomNav';
import LanguageSwitcher from './LanguageSwitcher';
import Disclaimer from './Disclaimer';
import { useReadingBack } from '@/contexts/ReadingBackContext';
import { TarotDrawingContext } from '@/contexts/TarotDrawingContext';

/** 无需登录即可访问的路径，其余均需登录。首页 + 今日宇宙 + 灵魂原型 可免登入，避免刷新被踢回登录 */
const PUBLIC_PATHS = ['/', '/auth', '/reset-password', '/oracle/cosmic', '/oracle/soul', '/oracle/reading', '/oracle/lenormand-library', '/oracle/pairing', '/readings', '/privacy', '/terms', '/numerology', '/numerology/result', '/numerology/library', '/numerology/year'];

/** 全屏沉浸页：不显示顶栏、底栏与星场，由页面自绘背景 */
const IMMERSIVE_FULLSCREEN_PATHS = ['/oracle/cosmic'];

/** 各路径的默认返回目标（无应用内上一页时使用） */
const getBackFallback = (pathname: string): string => {
  if (pathname.startsWith('/oracle/reading') || pathname.startsWith('/oracle/bazi')) return '/';
  if (pathname === '/oracle/numerology/result' || pathname === '/numerology/result') return '/numerology';
  if (pathname === '/numerology') return '/';
  if (pathname === '/numerology/library' || pathname === '/numerology/year') return '/numerology';
  if (pathname.startsWith('/numerology/library/')) return '/numerology/library';
  if (pathname === '/oracle/lenormand-library') return '/oracle/reading?tool=lenormand';
  if (pathname === '/oracle/pairing') return '/relationships';
  if (pathname === '/settings/change-password') return '/settings';
  if (pathname === '/tools') return '/';
  return '/';
};

const AppLayout = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const profile = useProfile(user?.id);
  const location = useLocation();
  const navigate = useNavigate();
  const readingBack = useReadingBack();
  const isHome = location.pathname === '/';
  const [tarotDrawing, setTarotDrawing] = useState(false);
  /** 记录应用内上一页，避免 navigate(-1) 退到站外或空白 */
  const prevPathRef = useRef<string | null>(null);
  const currentPathRef = useRef(location.pathname);

  useEffect(() => {
    const next = location.pathname;
    if (currentPathRef.current !== next) {
      prevPathRef.current = currentPathRef.current;
      currentPathRef.current = next;
    }
  }, [location.pathname]);

  /** 登入後從帳號同步生日到本地，任意頁面進入都能直接看到已保存的出生資料 */
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('birthday')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.birthday) return;
        const parts = data.birthday.split('-').map(Number);
        if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
          saveLastBirth({ year: parts[0], month: parts[1], day: parts[2] });
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const handleBack = () => {
    const prev = prevPathRef.current;
    const current = location.pathname;
    const isReadingPage = current.startsWith('/oracle/reading') || current.startsWith('/oracle/bazi');
    if (isReadingPage && readingBack?.tryInnerBack()) {
      return;
    }
    if (isReadingPage) {
      const fallback = getBackFallback(current);
      if (prev != null && prev !== current && prev.startsWith('/')) {
        navigate(prev);
      } else {
        navigate(fallback);
      }
      return;
    }
    if (prev != null && prev !== current && prev.startsWith('/')) {
      navigate(prev);
    } else {
      navigate(getBackFallback(current));
    }
  };
  const headerAvatarUrl = getAvatarUrl(profile?.avatar_url ?? null, user);
  const headerInitials = getDisplayInitials(profile?.display_name ?? user?.user_metadata?.display_name, user?.email ?? null);

  // 登录为主流：未登录访问任何内容页时重定向到登录
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + '/')
  );
  useEffect(() => {
    if (loading || user) return;
    if (isPublicPath) return;
    navigate('/auth', { replace: true });
  }, [loading, user, location.pathname, navigate, isPublicPath]);

  // 不再用全屏转圈阻塞：直接渲染内容，认证在后台完成
  // 未登录且非公开页：只做重定向，不显示转圈
  if (!loading && !user && !isPublicPath) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030305', color: '#D4AF37' }}>
        <p className="text-sm">{t('auth.redirectToLogin', { defaultValue: '請先登錄…' })}</p>
      </div>
    );
  }

  const isImmersive = IMMERSIVE_FULLSCREEN_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));

  if (isImmersive) {
    return (
      <div className="relative min-h-screen overflow-x-hidden overflow-y-auto">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto">
      <Starfield />

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-3 pb-1" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2">
          {!isHome && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:scale-110 active:scale-95"
              style={{
                background: 'hsla(var(--card) / 0.5)',
                border: '1px solid rgba(255, 215, 0, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.35), 0 0 8px rgba(255, 215, 0, 0.2), 0 0 40px rgba(255, 215, 0, 0.12)',
              }}
            >
              <ArrowLeft size={17} style={{ color: '#FFD700', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))' }} />
            </button>
          )}
          <h1
            className="text-lg font-bold tracking-wide"
            style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 20px hsla(var(--gold) / 0.3)' }}
          >
            ✦ Celestial
          </h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {user ? (
            <>
              <button
                onClick={() => navigate('/subscribe')}
                className="header-icon-btn flex items-center gap-1.5 min-h-[44px] px-2.5 sm:px-3 py-2 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'hsla(var(--card) / 0.5)',
                  border: '1px solid hsla(var(--gold) / 0.4)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: 'hsl(var(--gold))',
                }}
                title={t('nav.subscribe', { defaultValue: '訂閱' })}
                aria-label={t('nav.subscribe', { defaultValue: '訂閱' })}
              >
                <Crown size={18} className="shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">
                  {t('nav.subscribe', { defaultValue: '訂閱' })}
                </span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="header-icon-btn flex items-center gap-1.5 min-h-[44px] pl-1.5 pr-2.5 sm:pr-3 py-1.5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'hsla(var(--card) / 0.5)',
                  border: '1px solid hsla(var(--gold) / 0.3)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: 'hsl(var(--gold))',
                }}
                title={t('profile.title', { defaultValue: '賬戶' })}
                aria-label={t('profile.title', { defaultValue: '賬戶' })}
              >
                <Avatar className="w-8 h-8 rounded-full shrink-0 border border-gold-strong/40">
                  <AvatarImage src={headerAvatarUrl ?? undefined} alt="" />
                  <AvatarFallback className="text-xs font-semibold" style={{ background: 'hsla(var(--gold) / 0.2)', color: 'hsl(var(--gold))' }}>
                    {headerInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium whitespace-nowrap">
                  {t('profile.title', { defaultValue: '賬戶' })}
                </span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="header-icon-btn flex items-center gap-1.5 min-h-[44px] px-2.5 sm:px-3 py-2 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'hsla(var(--card) / 0.5)',
                border: '1px solid hsla(var(--gold) / 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: 'hsl(var(--gold))',
              }}
              title={t('auth.signInTitle', { defaultValue: '登錄' })}
              aria-label={t('auth.signInTitle', { defaultValue: '登錄' })}
            >
              <UserCircle size={18} className="shrink-0" />
              <span className="text-xs font-medium whitespace-nowrap">
                {t('auth.signInTitle', { defaultValue: '登錄' })}
              </span>
            </button>
          )}
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 pb-24 min-h-[calc(100vh-60px)]">
        <TarotDrawingContext.Provider value={{ setDrawing: setTarotDrawing }}>
          <Outlet />
        </TarotDrawingContext.Provider>
        <Disclaimer />
      </main>

      {!tarotDrawing && <BottomNav />}
    </div>
  );
};

export default AppLayout;
