import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(t('auth.checkEmail'));
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/tribe');
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto pt-8 page-transition">
      <div className="text-center mb-8">
        <div className="text-3xl mb-2">✦</div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle')}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {isSignUp ? t('auth.signUpSubtitle') : t('auth.signInSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card-highlight space-y-4">
        {isSignUp && (
          <div>
            <label className="input-label">{t('auth.displayName')}</label>
            <input
              type="text"
              className="glass-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('auth.displayNamePlaceholder')}
            />
          </div>
        )}

        <div>
          <label className="input-label">{t('auth.email')}</label>
          <input
            type="email"
            className="glass-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            required
          />
        </div>

        <div>
          <label className="input-label">{t('auth.password')}</label>
          <input
            type="password"
            className="glass-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        {error && (
          <p className="text-xs text-destructive text-center">{error}</p>
        )}

        {success && (
          <p className="text-xs text-center" style={{ color: 'hsl(var(--gold))' }}>{success}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, hsla(var(--gold) / 0.25), hsla(var(--accent) / 0.15))',
            border: '1px solid hsla(var(--gold) / 0.35)',
            color: 'hsl(var(--gold))',
            fontFamily: 'var(--font-serif)',
          }}
        >
          {loading ? '...' : isSignUp ? t('auth.signUp') : t('auth.signIn')}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
            className="underline"
            style={{ color: 'hsl(var(--gold))' }}
          >
            {isSignUp ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
