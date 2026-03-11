import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Heart, Calendar, BookOpen } from 'lucide-react';

const tabs = [
  { key: 'blueprint', path: '/', icon: LayoutDashboard },
  { key: 'tools', path: '/tools', icon: Sparkles },
  { key: 'relationships', path: '/relationships', icon: Heart },
  { key: 'rhythm', path: '/rhythm', icon: Calendar },
  { key: 'library', path: '/library', icon: BookOpen },
] as const;

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;
  const isActive = (path: string) => {
    // 首頁（星圖）：在首頁或任一 oracle 閱讀頁（占星/八字）時都高亮，從星圓點進占星後底下仍顯示星圖
    if (path === '/') return pathname === '/' || pathname.startsWith('/oracle/');
    // 天啟：僅在工具列表頁 /tools 高亮
    if (path === '/tools') return pathname === '/tools';
    return pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      {tabs.map(({ key, path, icon: Icon }) => (
        <button
          key={key}
          onClick={() => navigate(path)}
          className={`bottom-nav-item ${isActive(path) ? 'active' : ''}`}
        >
          <Icon size={20} strokeWidth={1.8} />
          <span>{t(`nav.${key}`)}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
