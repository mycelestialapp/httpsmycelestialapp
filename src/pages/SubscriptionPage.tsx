import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles, Crown, Zap, Check, Download, Loader2, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PLANS = [
  {
    key: 'daily',
    price: '$1.99',
    period: 'day',
    icon: Sun,
    priceId: 'price_1T4DflJl2234Nccsivm3ykKG',
    mode: 'payment' as const,
    features: ['unlimitedReadings24h', 'allDivinations', 'noAds'],
    popular: false,
  },
  {
    key: 'monthly',
    price: '$9.99',
    period: 'month',
    icon: Crown,
    priceId: 'price_1T4DfmJl2234Nccs1mViRM1U',
    mode: 'subscription' as const,
    features: ['unlimitedMatching', 'premiumAltarLamps', 'priorityReading', 'noAds'],
    popular: true,
  },
  {
    key: 'annual',
    price: '$69.00',
    period: 'year',
    icon: Sparkles,
    priceId: 'price_1T4DfnJl2234Nccss3VNVfLX',
    mode: 'subscription' as const,
    features: ['allMonthly', 'annualReport', 'exclusiveBadge', 'earlyAccess'],
    popular: false,
  },
] as const;

const TOPUPS = [
  { dust: 50, price: '$1.99', pkg: 'dust_50' },
  { dust: 150, price: '$4.99', pkg: 'dust_150' },
  { dust: 500, price: '$14.99', pkg: 'dust_500' },
] as const;

const SubscriptionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  const handleSubscribe = async () => {
    const plan = PLANS.find(p => p.key === selectedPlan);
    if (!plan) return;
    if (!user) {
      toast({ title: t('auth.signInTitle'), description: t('subscription.loginRequired') });
      navigate('/auth');
      return;
    }
    setLoadingPkg(plan.key);
    try {
      const fnName = plan.mode === 'subscription' ? 'create-checkout' : 'create-payment';
      const body = plan.mode === 'subscription'
        ? { priceId: plan.priceId }
        : { package: `plan_${plan.key}`, priceId: plan.priceId };
      const { data, error } = await supabase.functions.invoke(fnName, { body });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      toast({ title: 'Payment error', description: err.message || 'Something went wrong' });
    } finally {
      setLoadingPkg(null);
    }
  };

  const handleTopUp = async (pkg: string) => {
    if (!user) {
      toast({ title: t('auth.signInTitle') });
      navigate('/auth');
      return;
    }
    setLoadingPkg(pkg);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', { body: { package: pkg } });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      toast({ title: 'Payment error', description: err.message || 'Something went wrong' });
    } finally {
      setLoadingPkg(null);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto"
          style={{ background: 'radial-gradient(circle, hsla(var(--gold) / 0.3), hsla(var(--gold) / 0.05))', boxShadow: '0 0 40px hsla(var(--gold) / 0.2)' }}>
          <Star size={28} style={{ color: 'hsl(var(--gold))' }} fill="hsl(var(--gold))" />
        </motion.div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {t('subscription.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('subscription.subtitle')}</p>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {PLANS.map(({ key, price, period, icon: Icon, features, popular }, i) => (
          <motion.button key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedPlan(key)} className="w-full text-left relative overflow-hidden">
            {popular && (
              <div className="absolute top-0 right-0 text-[9px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-bl-xl"
                style={{ background: 'hsl(var(--gold))', color: 'hsl(var(--primary-foreground))' }}>
                {t('subscription.popular')}
              </div>
            )}
            <div className="glass-card-highlight p-5 transition-all"
              style={{
                borderColor: selectedPlan === key ? 'hsla(var(--gold) / 0.6)' : undefined,
                boxShadow: selectedPlan === key ? '0 0 30px hsla(var(--gold) / 0.15)' : undefined,
              }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsla(var(--gold) / 0.1)', border: '1px solid hsla(var(--gold) / 0.2)' }}>
                  <Icon size={22} style={{ color: 'hsl(var(--gold))' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
                    {t(`subscription.plan.${key}.name`)}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold" style={{ color: 'hsl(var(--gold))' }}>{price}</span>
                    <span className="text-xs text-muted-foreground">/ {t(`subscription.${period}`)}</span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check size={12} style={{ color: 'hsl(var(--gold))' }} />
                        {t(`subscription.feature.${f}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Subscribe CTA */}
      <button onClick={handleSubscribe} disabled={!selectedPlan || !!loadingPkg}
        className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60"
        style={{
          background: selectedPlan ? 'linear-gradient(135deg, hsl(var(--gold)), hsla(var(--gold) / 0.7))' : 'hsla(var(--muted) / 0.4)',
          color: selectedPlan ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
          boxShadow: selectedPlan ? '0 0 30px hsla(var(--gold) / 0.2)' : 'none',
        }}>
        {loadingPkg && PLANS.some(p => p.key === loadingPkg) ? (
          <Loader2 size={16} className="animate-spin inline mr-2" />
        ) : null}
        {selectedPlan ? t('subscription.subscribe') : t('subscription.choosePlan')}
      </button>

      {/* Star Dust Top-up */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} style={{ color: 'hsl(var(--gold))' }} />
          <h3 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.6)' }}>
            {t('subscription.topup.title')}
          </h3>
          <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, hsla(var(--gold) / 0.3), transparent)' }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TOPUPS.map(({ dust, price, pkg }) => (
            <button key={dust} onClick={() => handleTopUp(pkg)} disabled={loadingPkg === pkg}
              className="glass-card flex flex-col items-center gap-2 py-4 transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60">
              {loadingPkg === pkg ? (
                <Loader2 size={18} className="animate-spin" style={{ color: 'hsl(var(--gold))' }} />
              ) : (
                <div className="flex items-center gap-1">
                  <Star size={14} style={{ color: 'hsl(var(--gold))' }} fill="hsl(var(--gold))" />
                  <span className="text-base font-bold text-foreground">{dust}</span>
                </div>
              )}
              <span className="text-xs font-medium" style={{ color: 'hsl(var(--gold))' }}>{price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Annual report preview */}
      <div className="glass-card flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(var(--accent) / 0.1)' }}>
          <Download size={18} style={{ color: 'hsl(var(--accent))' }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>{t('subscription.annualReport')}</div>
          <div className="text-xs text-muted-foreground">{t('subscription.annualReportDesc')}</div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'hsla(var(--accent) / 0.12)', color: 'hsl(var(--accent))' }}>PRO</span>
      </div>
    </div>
  );
};

export default SubscriptionPage;
