import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const SUPPORT_EMAIL = 'support@mycelestial.app';

const Disclaimer = () => {
  const { t } = useTranslation();

  return (
    <footer className="brand-footer mt-8 space-y-4">
      {/* 客服支持 */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-semibold" style={{ color: 'hsla(var(--gold) / 0.8)' }}>
          {t('footer.support', { defaultValue: '客服支持' })}
        </span>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Mail size={12} />
          {SUPPORT_EMAIL}
        </a>
      </div>

      {/* 政策链接 */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
        <Link to="/terms" className="underline hover:text-foreground" style={{ color: 'hsla(var(--gold) / 0.7)' }}>
          {t('legal.terms', { defaultValue: '服务条款' })}
        </Link>
        <Link to="/privacy" className="underline hover:text-foreground" style={{ color: 'hsla(var(--gold) / 0.7)' }}>
          {t('legal.privacy', { defaultValue: '隐私政策' })}
        </Link>
        <Link to="/refund" className="underline hover:text-foreground" style={{ color: 'hsla(var(--gold) / 0.7)' }}>
          {t('legal.refund', { defaultValue: '退款政策' })}
        </Link>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">{t('common.disclaimer')}</p>
      <p className="brand-sig text-center">✦ Made with Cosmic Energy ✦</p>
    </footer>
  );
};

export default Disclaimer;
