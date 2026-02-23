import { Outlet } from 'react-router-dom';
import Starfield from './Starfield';
import BottomNav from './BottomNav';
import LanguageSwitcher from './LanguageSwitcher';
import Disclaimer from './Disclaimer';

const AppLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-3 pb-1" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
        <h1
          className="text-lg font-bold tracking-wide"
          style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 20px hsla(var(--gold) / 0.3)' }}
        >
          ✦ Celestial
        </h1>
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
