import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronLeft } from 'lucide-react';

export default function TermsPage() {
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
        <FileText size={24} className="text-gold-strong" />
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
          {t('settings.viewTerms', { defaultValue: '用戶條款' })}
        </h1>
      </div>
      <div className="text-sm text-foreground/90 leading-relaxed space-y-3">
        <p>
          {t('legal.termsIntro', {
            defaultValue: '使用本服務即表示你同意遵守相關使用條款。本平台內容僅供娛樂與自我覺察，不構成專業建議。請勿將占卜或命盤結果用於醫療、法律或投資決策。',
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('legal.termsPlaceholder', { defaultValue: '完整用戶條款將於正式上線前公佈。如有疑問請聯繫 support@mycelestial.app。' })}
        </p>
      </div>
    </div>
  );
}
