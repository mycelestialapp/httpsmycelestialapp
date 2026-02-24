import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthPage = () => {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(t('auth.resetEmailSent'));
      }
      setLoading(false);
      return;
    }

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (error) setError(error.message || t('auth.googleError'));
    } catch {
      setError(t('auth.googleError'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const getTitle = () => {
    if (isForgot) return t('auth.forgotTitle');
    return isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle');
  };
  const getSubtitle = () => {
    if (isForgot) return t('auth.forgotSubtitle');
    return isSignUp ? t('auth.signUpSubtitle') : t('auth.signInSubtitle');
  };

  return (
    <div className="max-w-sm mx-auto pt-8 page-transition">
      <div className="text-center mb-8">
        <div className="text-3xl mb-2">✦</div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {getTitle()}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {getSubtitle()}
        </p>
      </div>

      {/* Google Sign-In */}
      {!isForgot && (
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mb-4"
          style={{
            background: 'hsla(var(--muted) / 0.15)',
            border: '1px solid hsla(var(--muted) / 0.3)',
            color: 'hsl(var(--foreground))',
          }}
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {t('auth.googleSignIn')}
        </button>
      )}

      {!isForgot && (
        <div className="flex items-center gap-3 mb-4">
          <span className="flex-1 h-px" style={{ background: 'hsla(var(--muted) / 0.3)' }} />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{t('auth.or')}</span>
          <span className="flex-1 h-px" style={{ background: 'hsla(var(--muted) / 0.3)' }} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card-highlight space-y-4">
        {isSignUp && !isForgot && (
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

        {!isForgot && (
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
        )}

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
          {loading ? '...' : isForgot ? t('auth.sendReset') : isSignUp ? t('auth.signUp') : t('auth.signIn')}
        </button>

        {/* Forgot password link (only on sign-in) */}
        {!isSignUp && !isForgot && (
          <p className="text-xs text-center">
            <button
              type="button"
              onClick={() => { setIsForgot(true); setError(''); setSuccess(''); }}
              className="underline text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('auth.forgotPassword')}
            </button>
          </p>
        )}

        <p className="text-xs text-center text-muted-foreground">
          {isForgot ? (
            <button
              type="button"
              onClick={() => { setIsForgot(false); setError(''); setSuccess(''); }}
              className="underline"
              style={{ color: 'hsl(var(--gold))' }}
            >
              {t('auth.backToSignIn')}
            </button>
          ) : (
            <>
              {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
                className="underline"
                style={{ color: 'hsl(var(--gold))' }}
              >
                {isSignUp ? t('auth.signIn') : t('auth.signUp')}
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
