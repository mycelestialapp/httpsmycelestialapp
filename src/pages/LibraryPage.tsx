import { useTranslation } from 'react-i18next';
import { FileText, Video } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';

const LibraryPage = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {t('library.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('library.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'articles', icon: FileText },
          { key: 'videos', icon: Video },
        ].map(({ key, icon: Icon }) => (
          <div key={key} className="glass-card-highlight flex flex-col items-center gap-3 py-8">
            <Icon size={28} style={{ color: 'hsl(var(--gold))' }} />
            <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>{t(`library.${key}`)}</div>
            <div className="text-xs text-muted-foreground">{t('common.comingSoon')}</div>
          </div>
        ))}
      </div>

      <Disclaimer />
    </div>
  );
};

export default LibraryPage;
