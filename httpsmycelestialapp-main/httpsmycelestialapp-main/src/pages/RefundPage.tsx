import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const RefundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-md mx-auto space-y-6 py-6 page-transition">
      <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
        {t('legal.refundTitle', { defaultValue: '退款政策' })}
      </h1>
      <div className="prose prose-sm prose-invert max-w-none text-muted-foreground space-y-4">
        <p>{t('legal.refundIntro', { defaultValue: '感谢您选择 MyCelestial 的付费服务。请在下单前仔细阅读本政策。' })}</p>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.refundDigital', { defaultValue: '一、数字内容产品' })}</h2>
          <p>{t('legal.refundDigitalDesc', { defaultValue: '本平台提供的「深度完整版」命理分析报告、解锁内容等均为数字内容产品。一经购买并成功交付（即您已可查看或下载相应内容），该次交易即视为完成。' })}</p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.refundNoRefund', { defaultValue: '二、概不退款' })}</h2>
          <p className="font-medium" style={{ color: 'hsl(var(--gold))' }}>
            {t('legal.refundNoRefundHighlight', { defaultValue: '由于是数字内容产品，一旦购买并解锁，概不退款。' })}
          </p>
          <p>{t('legal.refundNoRefundReason', { defaultValue: '您支付的费用用于即时生成并展示个性化报告，服务在支付成功后即已提供，因此我们无法接受「已阅后退款」或「不满意退款」等申请。请您在支付前确认需要该服务。' })}</p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.refundException', { defaultValue: '三、例外情况' })}</h2>
          <p>{t('legal.refundExceptionDesc', { defaultValue: '若因我方技术故障导致您支付成功却未收到应得内容，请于 7 日内凭订单或支付凭证联系客服，我们将在核实后补发内容或作例外退款处理。' })}</p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.refundContact', { defaultValue: '四、客服支持' })}</h2>
          <p>{t('legal.refundContactDesc', { defaultValue: '如有任何疑问，请通过网站底部「客服支持」提供的邮箱与我们联系。' })}</p>
        </section>
        <p className="text-xs mt-6">
          <Link to="/" className="underline" style={{ color: 'hsl(var(--gold))' }}>← {t('common.backHome', { defaultValue: '返回首页' })}</Link>
          {' · '}
          <Link to="/terms" className="underline" style={{ color: 'hsl(var(--gold))' }}>{t('legal.terms', { defaultValue: '服务条款' })}</Link>
          {' · '}
          <Link to="/privacy" className="underline" style={{ color: 'hsl(var(--gold))' }}>{t('legal.privacy', { defaultValue: '隐私政策' })}</Link>
        </p>
      </div>
    </div>
  );
};

export default RefundPage;
