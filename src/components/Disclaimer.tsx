import { useTranslation } from 'react-i18next';

const Disclaimer = () => {
  const { t } = useTranslation();

  return (
    <footer className="text-center py-4 px-6">
      <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
        {t('common.disclaimer')}
      </p>
    </footer>
  );
};

export default Disclaimer;
