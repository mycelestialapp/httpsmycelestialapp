import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft size={18} />
        {t('common.back', { defaultValue: '返回' })}
      </button>
      <div className="flex items-center gap-2 mb-4">
        <Shield size={24} className="text-gold-strong" />
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
          {t('settings.viewPrivacy', { defaultValue: '隱私政策' })}
        </h1>
      </div>
      <div className="text-sm text-foreground/90 leading-relaxed space-y-3">
        <p>
          {t('legal.privacyIntro', {
            defaultValue: '我們重視你的隱私。本應用所收集的資料（如帳號、出生日期、占卜記錄）僅用於提供個人化內容與服務，不會出售給第三方。資料存儲於受保護的伺服器，你可隨時在帳戶設定中查看或刪除。',
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('legal.privacyPlaceholder', { defaultValue: '完整隱私政策條文將於正式上線前公佈。如有疑問請聯繫 support@mycelestial.app。' })}
        </p>
      </div>
    </div>
  );
}
