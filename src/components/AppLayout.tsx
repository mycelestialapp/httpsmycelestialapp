import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Starfield from './Starfield';
import BottomNav from './BottomNav';
import LanguageSwitcher from './LanguageSwitcher';
import Disclaimer from './Disclaimer';

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-3 pb-1" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:scale-110 active:scale-95"
              style={{
                background: 'hsla(var(--card) / 0.5)',
                border: '1px solid hsla(var(--gold) / 0.35)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 0 16px hsla(var(--gold) / 0.15), 0 0 4px hsla(var(--gold) / 0.1)',
              }}
            >
              <ArrowLeft size={17} style={{ color: 'hsl(var(--gold))', filter: 'drop-shadow(0 0 6px hsla(var(--gold) / 0.5))' }} />
            </button>
          )}
          <h1
            className="text-lg font-bold tracking-wide"
            style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 20px hsla(var(--gold) / 0.3)' }}
          >
            ✦ Celestial
          </h1>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 pb-24 min-h-[calc(100vh-60px)]">
        <Outlet />
        <Disclaimer />
      </main>

      <BottomNav />
    </div>
  );
};

export default AppLayout;
