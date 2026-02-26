import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-md mx-auto space-y-6 py-6 page-transition">
      <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
        {t('legal.termsTitle', { defaultValue: '服务条款' })}
      </h1>
      <div className="prose prose-sm prose-invert max-w-none text-muted-foreground space-y-4">
        <p>{t('legal.termsIntro', { defaultValue: '欢迎使用 MyCelestial（我的天体应用程序）。使用本服务即表示您同意以下条款。' })}</p>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.termsService', { defaultValue: '一、服务内容' })}</h2>
          <p>{t('legal.termsServiceDesc', { defaultValue: '本平台提供基于传统命理与占卜文化的个性化命理分析报告，包括但不限于八字、紫微、奇门、六壬、塔罗、星象、梅花等模块。内容仅供娱乐与文化学习，不构成任何医疗、法律或投资建议。' })}</p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.termsUser', { defaultValue: '二、用户义务' })}</h2>
          <p>{t('legal.termsUserDesc', { defaultValue: '您应保证所填写的出生信息真实、合法，并不得利用本服务从事违法违规活动。我们保留因违规而暂停或终止您账户的权利。' })}</p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.termsIP', { defaultValue: '三、知识产权' })}</h2>
          <p>{t('legal.termsIPDesc', { defaultValue: '本网站所有文案、算法、界面设计及品牌归 MyCelestial 所有，未经授权不得复制、传播或用于商业用途。' })}</p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-foreground mt-4">{t('legal.termsLimit', { defaultValue: '四、责任限制' })}</h2>
          <p>{t('legal.termsLimitDesc', { defaultValue: '本服务按「现状」提供，我们不对分析结果的准确性、完整性做任何保证。您基于报告所做的任何决定与后果由您自行承担。' })}</p>
        </section>
        <p className="text-xs mt-6">
          <Link to="/" className="underline" style={{ color: 'hsl(var(--gold))' }}>← {t('common.backHome', { defaultValue: '返回首页' })}</Link>
          {' · '}
          <Link to="/privacy" className="underline" style={{ color: 'hsl(var(--gold))' }}>{t('legal.privacy', { defaultValue: '隐私政策' })}</Link>
          {' · '}
          <Link to="/refund" className="underline" style={{ color: 'hsl(var(--gold))' }}>{t('legal.refund', { defaultValue: '退款政策' })}</Link>
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
