import { useTranslation } from 'react-i18next';

const Disclaimer = () => {
  const { t } = useTranslation();

  return (
    <footer className="brand-footer">
      <p className="font-semibold text-sm text-foreground/95 mb-1">
        {t('oracle.astrologyNatalTitle', { defaultValue: '本命盤' })}
      </p>
      <p>
        {t('oracle.astrologyDisclaimerTop', {
          defaultValue: '本頁占星解讀僅供娛樂與自我覺察，不構成醫學、法律、投資或人生決策建議，請以理性判斷與現實情況為準。',
        })}
      </p>
    </footer>
  );
};

export default Disclaimer;
