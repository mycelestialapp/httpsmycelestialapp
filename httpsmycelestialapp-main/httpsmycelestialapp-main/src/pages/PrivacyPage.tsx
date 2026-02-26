import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-md mx-auto space-y-6 py-6 page-transition">
      <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
        {t('legal.privacyTitle', { defaultValue: '隐私政策' })}
      </h1>
      <div className="prose prose-sm prose-invert max-w-none text-muted-foreground space-y-4">
        <p>{t('legal.privacyIntro', { defaultValue: 'MyCelestial 重视您的隐私。本政策说明我们如何收集、使用与保护您的个人信息。' })}</p>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.privacyCollect', { defaultValue: '一、我们收集的信息' })}</h2>
          <p>{t('legal.privacyCollectDesc', { defaultValue: '为提供个性化命理分析，我们可能收集：您主动填写的出生日期、注册邮箱；设备与访问日志（如 IP、浏览器类型）；支付相关信息由 Stripe 等支付服务商处理，我们仅接收支付结果与订单标识。' })}</p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.privacyUse', { defaultValue: '二、信息用途' })}</h2>
          <p>{t('legal.privacyUseDesc', { defaultValue: '我们使用上述信息以：生成您的命理报告、改进产品与算法、处理支付与客服、遵守法律义务。我们不会将您的个人数据出售给第三方。' })}</p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.privacySecurity', { defaultValue: '三、安全与存储' })}</h2>
          <p>{t('legal.privacySecurityDesc', { defaultValue: '数据通过 HTTPS 传输，敏感信息存储于受控环境。我们采用行业通用措施降低泄露风险，但无法保证绝对安全。' })}</p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.privacyRights', { defaultValue: '四、您的权利' })}</h2>
          <p>{t('legal.privacyRightsDesc', { defaultValue: '您有权查询、更正或删除我们持有的您的个人数据；如需协助请通过底部客服邮箱联系我们。' })}</p>
        </section>
        <p className="text-xs mt-6">
          <Link to="/" className="underline" style={{ color: 'hsl(var(--gold))' }}>← {t('common.backHome', { defaultValue: '返回首页' })}</Link>
          {' · '}
          <Link to="/terms" className="underline" style={{ color: 'hsl(var(--gold))' }}>{t('legal.terms', { defaultValue: '服务条款' })}</Link>
          {' · '}
          <Link to="/refund" className="underline" style={{ color: 'hsl(var(--gold))' }}>{t('legal.refund', { defaultValue: '退款政策' })}</Link>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
