import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

const ACCOUNTS_KEY = 'celestial_saved_accounts';

const PwdInput = ({ value, onChange, placeholder, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...rest}
        type={show ? 'text' : 'password'}
        className="glass-input w-full pr-10"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

const ChangePasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (!user?.email) {
      setError(t('auth.errorInvalidCredentials'));
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (signInError) {
      setError(t('auth.errorInvalidCredentials'));
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY) || '[]';
      const accounts: Array<{ email: string; password?: string; [k: string]: unknown }> = JSON.parse(raw);
      const updated = accounts.map((a) => (a.email === user.email ? { ...a, password: newPassword } : a));
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
    } catch (_) {}
    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate('/settings'), 2000);
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="max-w-md mx-auto pt-6 px-4 pb-8 page-transition">
      <h1 className="text-xl font-bold tracking-wide text-center mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
        {t('settings.changePassword', { defaultValue: '修改密碼' })}
      </h1>
      <p className="text-xs text-muted-foreground text-center mb-6">
        {t('settings.changePasswordHint', { defaultValue: '請輸入當前密碼以驗證身份，再設定新密碼' })}
      </p>
      {success ? (
        <div className="glass-card-highlight p-6 text-center">
          <p className="text-sm" style={{ color: 'hsl(var(--gold))' }}>{t('auth.resetSuccess', { defaultValue: '密碼已更新' })}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card-highlight space-y-4">
          <div>
            <label className="input-label">{t('settings.currentPassword', { defaultValue: '當前密碼' })}</label>
            <PwdInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <div>
            <label className="input-label">{t('auth.newPassword', { defaultValue: '新密碼' })}</label>
            <PwdInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
          </div>
          <div>
            <label className="input-label">{t('auth.confirmPassword')}</label>
            <PwdInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
          </div>
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, hsla(var(--gold) / 0.25), hsla(var(--accent) / 0.15))', border: '1px solid hsla(var(--gold) / 0.35)', color: 'hsl(var(--gold))' }}
          >
            {loading ? '...' : t('profile.saveName', { defaultValue: '保存' })}
          </button>
        </form>
      )}
    </div>
  );
};

export default ChangePasswordPage;
