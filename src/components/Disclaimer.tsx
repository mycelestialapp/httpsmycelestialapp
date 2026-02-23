import { useTranslation } from 'react-i18next';

const Disclaimer = () => {
  const { t } = useTranslation();

  return (
    <footer className="brand-footer">
      <p>{t('common.disclaimer')}</p>
      <p className="brand-sig">✦ Made with Cosmic Energy ✦</p>
    </footer>
  );
};

export default Disclaimer;
