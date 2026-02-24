import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setValid(true);
    }
    // Also listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValid(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    }
    setLoading(false);
  };

  if (!valid) {
    return (
      <div className="max-w-sm mx-auto pt-16 text-center page-transition">
        <div className="text-3xl mb-4">⚠️</div>
        <p className="text-sm text-muted-foreground">{t('auth.invalidResetLink')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto pt-8 page-transition">
      <div className="text-center mb-8">
        <div className="text-3xl mb-2">🔑</div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {t('auth.resetTitle')}
        </h2>
      </div>

      {success ? (
        <div className="glass-card-highlight p-6 text-center">
          <div className="text-3xl mb-3">✅</div>
          <p className="text-sm" style={{ color: 'hsl(var(--gold))' }}>{t('auth.resetSuccess')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card-highlight space-y-4">
          <div>
            <label className="input-label">{t('auth.newPassword')}</label>
            <input type="password" className="glass-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <div>
            <label className="input-label">{t('auth.confirmPassword')}</label>
            <input type="password" className="glass-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, hsla(var(--gold) / 0.25), hsla(var(--accent) / 0.15))', border: '1px solid hsla(var(--gold) / 0.35)', color: 'hsl(var(--gold))', fontFamily: 'var(--font-serif)' }}>
            {loading ? '...' : t('auth.resetPassword')}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;
