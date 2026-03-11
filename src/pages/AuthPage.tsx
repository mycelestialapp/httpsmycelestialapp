import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, EyeOff, UserCircle, X, Phone, ArrowRightLeft } from 'lucide-react';

/** Map common Supabase auth error messages to i18n keys */
const mapAuthError = (msg: string, t: (k: string) => string): string => {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials'))
    return t('auth.errorInvalidCredentials');
  if (lower.includes('user already registered') || lower.includes('already been registered'))
    return t('auth.errorEmailTaken');
  if (lower.includes('email not confirmed'))
    return t('auth.errorEmailNotConfirmed');
  if (lower.includes('too many requests') || lower.includes('rate limit'))
    return t('auth.errorRateLimit');
  if (lower.includes('password') && lower.includes('short'))
    return t('auth.passwordTooShort');
  return msg;
};

interface SavedAccount {
  email: string;
  displayName: string;
  lastLogin: number;
}

const ACCOUNTS_KEY = 'celestial_saved_accounts';
const LAST_EMAIL_KEY = 'celestial_last_email';
const LAST_ROUTE_KEY = 'celestial_last_route';

const getSavedAccounts = (): SavedAccount[] => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  } catch { return []; }
};

/** 保存账号（僅保存郵箱與顯示名稱），支持多账号；密碼交給瀏覽器管理器處理 */
const saveAccount = (email: string, displayName: string) => {
  const accounts = getSavedAccounts().filter(a => a.email !== email);
  accounts.unshift({
    email,
    displayName,
    lastLogin: Date.now(),
  });
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts.slice(0, 8)));
};

const removeAccount = (email: string) => {
  const accounts = getSavedAccounts().filter(a => a.email !== email);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

const PasswordInput = ({ value, onChange, placeholder, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className="glass-input pr-10"
        value={value}
        onChange={onChange}
        placeholder={placeholder || '••••••••'}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

const AuthPage = () => {
  const { t } = useTranslation();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  // OAuth 回调后带着 session 回到 /auth，自动跳转首页，避免停在登录页
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem(LAST_EMAIL_KEY) || '');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [twitterLoading, setTwitterLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(getSavedAccounts);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isForgot) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mycelestial.app';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/reset-password`,
      });
      if (error) {
        setError(mapAuthError(error.message, t));
      } else {
        setSuccess(t('auth.resetEmailSent'));
      }
      setLoading(false);
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError(t('auth.passwordMismatch'));
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(mapAuthError(error.message, t));
      } else {
        setSuccess(t('auth.checkEmail'));
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(mapAuthError(error.message, t));
      } else {
        localStorage.setItem(LAST_EMAIL_KEY, email);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
          .single();
        const name = profileData?.display_name || displayName || email.split('@')[0];
        saveAccount(email, name);
        setSavedAccounts(getSavedAccounts());

        // 登入成功後優先回到上次造訪的頁面，若無則進首頁
        const lastRoute = localStorage.getItem(LAST_ROUTE_KEY);
        navigate(lastRoute && lastRoute !== '/auth' ? lastRoute : '/', { replace: true });
      }
    }
    setLoading(false);
  };

  // OAuth 完成后 Supabase 会重定向到此 URL（必须已加入 Supabase Dashboard → URL Configuration → Redirect URLs）
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth` : 'https://mycelestial.app/auth';

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) setError(error.message || t('auth.googleError'));
    } catch {
      setError(t('auth.googleError'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo },
      });
      if (error) setError(error.message || t('auth.appleError'));
    } catch {
      setError(t('auth.appleError'));
    } finally {
      setAppleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setFacebookLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo },
      });
      if (error) setError(error.message || t('auth.socialError'));
    } catch {
      setError(t('auth.socialError'));
    } finally {
      setFacebookLoading(false);
    }
  };

  const handleTwitterSignIn = async () => {
    setTwitterLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: { redirectTo },
      });
      if (error) setError(error.message || t('auth.socialError'));
    } catch {
      setError(t('auth.socialError'));
    } finally {
      setTwitterLoading(false);
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

      {/* 登入入口：已接入的放前，即将推出的单独框起来 */}
      {!isForgot && (
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="auth-entry-cell auth-provider-btn flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-90 shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span className="auth-provider-btn-text text-[10px] leading-tight text-center line-clamp-2 px-0.5">Google</span>
            </button>

            {/* Apple */}
            <button
              onClick={handleAppleSignIn}
              disabled={appleLoading}
              className="auth-entry-cell auth-provider-btn flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {appleLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-90 auth-provider-btn-text shrink-0">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              <span className="auth-provider-btn-text text-[10px] leading-tight text-center line-clamp-2 px-0.5">Apple</span>
            </button>

            {/* Facebook：已接入，Supabase 原生 OAuth */}
            <button
              onClick={handleFacebookSignIn}
              disabled={facebookLoading}
              className="auth-entry-cell auth-provider-btn flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {facebookLoading ? (
                <Loader2 size={20} className="animate-spin shrink-0" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              <span className="auth-provider-btn-text text-[10px] leading-tight text-center line-clamp-2 px-0.5">Facebook</span>
            </button>

            {/* X (Twitter)：已接入，Supabase 原生 OAuth */}
            <button
              onClick={handleTwitterSignIn}
              disabled={twitterLoading}
              className="auth-entry-cell auth-provider-btn flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {twitterLoading ? (
                <Loader2 size={20} className="animate-spin shrink-0" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0 auth-provider-btn-text" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              )}
              <span className="auth-provider-btn-text text-[10px] leading-tight text-center line-clamp-2 px-0.5">X</span>
            </button>
          </div>
        </div>
      )}

      {!isForgot && (
        <div className="flex items-center gap-3 mb-4">
          <span className="flex-1 h-px auth-divider-line" />
          <span className="text-[10px] text-muted-foreground/90 uppercase tracking-widest">{t('auth.or')}</span>
          <span className="flex-1 h-px auth-divider-line" />
        </div>
      )}

      {/* 邮箱密码登入入口 */}
      {!isForgot && (
        <p className="text-xs text-muted-foreground text-center mb-3">
          {t('auth.emailSignInEntry', { defaultValue: '使用邮箱密码登入' })}
        </p>
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
          <>
            <div>
              <label className="input-label">{t('auth.password')}</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {isSignUp && (
              <div>
                <label className="input-label">{t('auth.confirmPassword')}</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required={isSignUp}
                  minLength={6}
                />
              </div>
            )}
          </>
        )}

        {error && (
          <p className="text-xs text-destructive text-center">{error}</p>
        )}

        {success && (
          <div className="text-center space-y-1">
            <p className="text-xs" style={{ color: 'hsl(var(--gold))' }}>{success}</p>
            {isForgot && (
              <p className="text-[10px] text-muted-foreground max-w-[260px] mx-auto">
                若未收到信，請檢查垃圾郵件；若點擊連結無效，請在 Supabase 控制台 → Authentication → URL Configuration → Redirect URLs 中加入本站網址（如 http://localhost:8083/**）。
              </p>
            )}
          </div>
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
                onClick={() => { setIsSignUp(!isSignUp); setConfirmPassword(''); setError(''); setSuccess(''); }}
                className="underline"
                style={{ color: 'hsl(var(--gold))' }}
              >
                {isSignUp ? t('auth.signIn') : t('auth.signUp')}
              </button>
            </>
          )}
        </p>
      </form>

      {/* 切换账号：醒目区块，放在登入表单下方 */}
      {!isSignUp && !isForgot && (
        <div
          className="mt-5 rounded-xl p-4 space-y-3 transition-all hover:opacity-95"
          style={{
            background: 'linear-gradient(135deg, hsla(var(--gold) / 0.12), hsla(var(--gold) / 0.06))',
            border: '1px solid hsla(var(--gold) / 0.4)',
            boxShadow: '0 0 20px hsla(var(--gold) / 0.15), inset 0 1px 0 hsla(var(--gold) / 0.1)',
          }}
        >
          <div className="flex items-center justify-center gap-2.5">
            <ArrowRightLeft size={20} style={{ color: 'hsl(var(--gold))', filter: 'drop-shadow(0 0 6px hsla(var(--gold) / 0.5))' }} />
            <span
              className="text-base font-semibold tracking-wide"
              style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 12px hsla(var(--gold) / 0.35)' }}
            >
              {t('auth.switchAccount', { defaultValue: '切換帳號' })}
            </span>
          </div>
          {savedAccounts.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
                {t('auth.recentAccounts', { defaultValue: '最近帳號' })}
              </p>
              {savedAccounts.map((acc) => (
                <div key={acc.email} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setEmail(acc.email); setPassword(acc.password ?? ''); setError(''); }}
                    className="flex-1 flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: email === acc.email ? 'hsla(var(--gold) / 0.18)' : 'hsla(var(--card) / 0.5)',
                      border: `1px solid ${email === acc.email ? 'hsla(var(--gold) / 0.45)' : 'hsla(var(--gold) / 0.2)'}`,
                    }}
                  >
                    <UserCircle size={18} style={{ color: 'hsl(var(--gold))' }} />
                    <div className="text-left min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{acc.displayName}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{acc.email}</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { removeAccount(acc.email); setSavedAccounts(getSavedAccounts()); }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center text-muted-foreground/90">
              {t('auth.switchAccountHint', { defaultValue: '登入後會保存於此，可在此切換' })}
            </p>
          )}
        </div>
      )}

      {/* 即将推出：放在邮箱登录下方，单独用格子框起来 */}
      {!isForgot && (
        <div className="mt-4">
          <div className="auth-coming-soon-box rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground/90 uppercase tracking-widest text-center pb-3">
              {t('auth.moreWaysComing', { defaultValue: '更多登入方式即將推出' })}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {/* 微信 */}
              <button type="button" disabled className="auth-entry-cell auth-provider-btn auth-provider-btn--disabled flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium cursor-not-allowed">
                <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0" fill="#07C160">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                </svg>
                <span className="auth-provider-btn-text text-[10px] leading-tight text-center opacity-80 line-clamp-2 px-0.5">微信</span>
                <span className="text-[9px] text-muted-foreground/70">{t('auth.comingSoonShort', { defaultValue: '即將推出' })}</span>
              </button>
              {/* 微博 */}
              <button type="button" disabled className="auth-entry-cell auth-coming-soon-btn flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium cursor-not-allowed">
                <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0" fill="#E6162D">
                  <path d="M9.098 18.147c-4.298 0-7.785-1.943-7.785-4.341 0-1.113.675-2.124 1.756-2.94-.27-.096-.784-.313-.784-.313.784-.145 1.064-.966 1.178-1.458.0 0 .392.145.784.193 3.676.482 6.876-1.45 6.876-5.023 0-3.338-2.595-5.7-6.388-5.7-4.01 0-6.682 2.452-6.682 5.6 0 2.356 1.114 4.396 2.836 5.787-.435.772-.675 1.65-.675 2.548 0 2.063 2.02 3.74 4.514 3.74 2.02 0 3.786-.772 4.514-1.94-.09-.048-.18-.096-.27-.145-.675.434-1.498.675-2.356.675zm.27-12.5c.87 0 1.59.724 1.59 1.59 0 .87-.72 1.59-1.59 1.59-.87 0-1.59-.72-1.59-1.59 0-.866.72-1.59 1.59-1.59zm6.682 0c.87 0 1.59.724 1.59 1.59 0 .87-.72 1.59-1.59 1.59-.87 0-1.59-.72-1.59-1.59 0-.866.72-1.59 1.59-1.59zm4.298 3.386c-.386-.048-.77-.096-1.158-.145.435-.386.724-.87.724-1.498 0-1.45-1.59-2.596-3.53-2.596-2.164 0-3.92 1.402-3.92 3.146 0 2.452 1.402 4.514 3.338 5.7 1.402.87 3.146 1.305 5.118 1.305.192 0 .386 0 .578-.048-.048-.386-.192-1.018-.192-1.45 0-1.35.77-2.548 1.35-3.338.193-.29.29-.482.29-.675 0-.29-.193-.482-.482-.578z"/>
                </svg>
                <span className="auth-coming-soon-label text-[10px] leading-tight text-center line-clamp-2 px-0.5">微博</span>
                <span className="text-[9px] text-muted-foreground/70">{t('auth.comingSoonShort', { defaultValue: '即將推出' })}</span>
              </button>
              {/* 小红书、Line、手机号 */}
              {[
                { key: 'xiaohongshu', label: '小红书', icon: <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0" fill="#FE2C55"><path d="M17.712 5.508c.087-.02.176-.03.266-.03.552 0 1 .448 1 1v.09c0 .552-.448 1-1 1-.09 0-.179-.01-.266-.03-.552-.124-1.012.328-.888.88.124.552-.336 1.012-.888.88-.354-.08-.65-.31-.832-.602-.182-.292-.266-.634-.234-.976.032-.342.182-.656.434-.882.252-.226.576-.358.918-.37zm-2.12 2.246c.124.552-.336 1.012-.888.88-.552-.124-1.012.336-.88.888.248 1.102.034 2.246-.598 3.056-.632.81-1.598 1.274-2.644 1.274-1.046 0-2.012-.464-2.644-1.274-.632-.81-.846-1.954-.598-3.056.124-.552-.328-1.012-.88-.888-.552.124-1.012-.336-.88-.888.372-1.654 1.158-3.082 2.246-4.158 1.088-1.076 2.456-1.678 3.924-1.678s2.836.602 3.924 1.678c1.088 1.076 1.874 2.504 2.246 4.158zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/></svg> },
                { key: 'line', label: 'Line', icon: <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0" fill="#00B900"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .63.285.63.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.039 1.085l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg> },
                { key: 'phone', label: t('auth.phoneSignIn', { defaultValue: '手机号' }), icon: <Phone size={20} className="shrink-0 auth-coming-soon-label" strokeWidth={2} /> },
              ].map(({ key, label, icon }) => (
                <button key={key} type="button" disabled className="auth-entry-cell auth-coming-soon-btn flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium cursor-not-allowed">
                  {icon}
                  <span className="auth-coming-soon-label text-[10px] leading-tight text-center line-clamp-2 px-0.5">{label}</span>
                  <span className="text-[9px] text-muted-foreground/70">{t('auth.comingSoonShort', { defaultValue: '即將推出' })}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
