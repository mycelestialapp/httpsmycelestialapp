import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Sparkles, Check, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { setToolUnlocked } from '@/lib/oracleModuleContent';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const dustAmount = parseInt(searchParams.get('dust') || '0');
  const sessionId = searchParams.get('session_id');
  const unlockTool = searchParams.get('unlock') || '';

  useEffect(() => {
    if (!sessionId || !user) return;

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId },
        });
        if (error || !data?.success) {
          setStatus('error');
          return;
        }
        setStatus('success');
        if (unlockTool) {
          setToolUnlocked(unlockTool);
          toast({ title: '✨ 完整报告已解锁', description: '您可返回阅读页查看全书天机。' });
        } else if (data.dust) {
          toast({ title: `✨ +${data.dust} Star Dust credited!`, description: 'Your cosmic energy has been replenished.' });
        }
      } catch {
        setStatus('error');
      }
    };

    verify();
  }, [sessionId, user, unlockTool]);

  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 page-transition">
      {status === 'verifying' && (
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
          <Sparkles size={48} style={{ color: 'hsl(var(--gold))' }} />
        </motion.div>
      )}
      {status === 'success' && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="space-y-4">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, hsla(var(--gold) / 0.3), hsla(var(--gold) / 0.05))', boxShadow: '0 0 60px hsla(var(--gold) / 0.3)' }}>
            <Check size={36} style={{ color: 'hsl(var(--gold))' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
            {unlockTool ? '支付成功！' : 'Payment Successful!'}
          </h1>
          {unlockTool ? (
            <>
              <p className="text-sm text-muted-foreground">完整报告已解锁，可查看未来三年运势与开运建议。</p>
              <button onClick={() => navigate(`/oracle/reading?tool=${unlockTool}`)} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mx-auto"
                style={{ background: 'linear-gradient(135deg, hsl(var(--gold)), hsla(var(--gold) / 0.7))', color: 'hsl(var(--primary-foreground))' }}>
                <BookOpen size={18} /> 查看完整报告
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2">
                <Star size={18} style={{ color: 'hsl(var(--gold))' }} fill="hsl(var(--gold))" />
                <span className="text-xl font-bold text-foreground">+{dustAmount} Star Dust</span>
              </div>
              <p className="text-sm text-muted-foreground">Your cosmic energy has been replenished.</p>
            </>
          )}
          <button onClick={() => navigate('/')} className="mt-2 px-6 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {unlockTool ? '返回首页' : 'Return to Oracle'}
          </button>
        </motion.div>
      )}
      {status === 'error' && (
        <div className="space-y-4">
          <p className="text-destructive font-semibold">Payment verification failed</p>
          <button onClick={() => navigate('/subscribe')} className="text-sm underline text-muted-foreground">Back to subscriptions</button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
