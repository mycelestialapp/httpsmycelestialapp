import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Users, Flame, BookOpen } from 'lucide-react';

const tabs = [
  { key: 'oracle', path: '/', icon: Sparkles },
  { key: 'tribe', path: '/tribe', icon: Users },
  { key: 'altar', path: '/altar', icon: Flame },
  { key: 'library', path: '/library', icon: BookOpen },
] as const;

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/oracle');
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      {tabs.map(({ key, path, icon: Icon }) => (
        <button
          key={key}
          onClick={() => navigate(path)}
          className={`bottom-nav-item ${isActive(path) ? 'active' : ''}`}
        >
          <Icon size={22} strokeWidth={1.8} />
          <span>{t(`nav.${key}`)}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
