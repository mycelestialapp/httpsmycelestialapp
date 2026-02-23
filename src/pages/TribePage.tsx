import { useTranslation } from 'react-i18next';
import { Users, Heart, MessageCircle } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';

const features = [
  { key: 'mbti', icon: Users },
  { key: 'social', icon: MessageCircle },
  { key: 'love', icon: Heart },
] as const;

const TribePage = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {t('tribe.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('tribe.subtitle')}</p>
      </div>

      <div className="space-y-3">
        {features.map(({ key, icon: Icon }) => (
          <div key={key} className="glass-card flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsla(var(--gold) / 0.1)' }}>
              <Icon size={18} style={{ color: 'hsl(var(--gold))' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>{t(`tribe.${key}`)}</div>
              <div className="text-xs text-muted-foreground">{t('common.comingSoon')}</div>
            </div>
          </div>
        ))}
      </div>

      <Disclaimer />
    </div>
  );
};

export default TribePage;
