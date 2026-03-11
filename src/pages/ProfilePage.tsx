import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Crown, Settings, HelpCircle, LogOut, ChevronRight, Mail, Calendar, ArrowRightLeft, Pencil, Check, X, Camera, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl, getDisplayInitials } from '@/lib/avatar';
import { toast } from 'sonner';

type ProfileRow = {
  display_name: string | null;
  birthday: string | null;
  birth_chart_name: string | null;
  star_dust?: number;
  avatar_url?: string | null;
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingBirthday, setEditingBirthday] = useState(false);
  const [editBirthdayY, setEditBirthdayY] = useState(new Date().getFullYear());
  const [editBirthdayM, setEditBirthdayM] = useState(1);
  const [editBirthdayD, setEditBirthdayD] = useState(1);
  const [birthdaySaving, setBirthdaySaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name, birthday, birth_chart_name, star_dust')
      .eq('id', user.id)
      .single()
      .then(async ({ data, error }) => {
        let resolved = data ?? null;
        const metaName = (user.user_metadata?.display_name as string) || null;
        if ((!resolved || !resolved.display_name) && metaName) {
          await supabase.from('profiles').upsert(
            { id: user.id, display_name: metaName },
            { onConflict: 'id' }
          );
          resolved = { ...(resolved || {}), display_name: metaName } as ProfileRow;
        }
        setProfile((prev) => ({ ...(resolved || {}), avatar_url: prev?.avatar_url ?? (resolved as ProfileRow)?.avatar_url } as ProfileRow));
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));

    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.avatar_url) setProfile((p) => (p ? { ...p, avatar_url: data.avatar_url } : { display_name: null, birthday: null, birth_chart_name: null, avatar_url: data.avatar_url }));
      })
      .catch(() => {});
  }, [user, navigate, authLoading]);

  if (authLoading) {
    return (
      <div className="max-w-md mx-auto pt-12 flex flex-col items-center gap-3 text-muted-foreground">
        <div className="w-8 h-8 rounded-full border-2 border-gold-strong border-t-transparent animate-spin" />
        <p className="text-sm">{t('common.loading', { defaultValue: '載入中…' })}</p>
      </div>
    );
  }
  if (!user) return null;

  const displayName = profile?.display_name || user.email?.split('@')[0] || t('profile.guest', { defaultValue: '用戶' });

  const startEditName = () => {
    setEditNameValue(profile?.display_name ?? user?.email?.split('@')[0] ?? '');
    setEditingName(true);
    setNameSaveSuccess(false);
  };

  const saveName = async () => {
    if (!user) return;
    const name = editNameValue.trim();
    setNameSaving(true);
    const { error } = await supabase.from('profiles').update({ display_name: name || null }).eq('id', user.id);
    setNameSaving(false);
    if (!error) {
      setProfile((p) => (p ? { ...p, display_name: name || null } : { display_name: name || null, birthday: null, birth_chart_name: null }));
      setEditingName(false);
      setNameSaveSuccess(true);
      setTimeout(() => setNameSaveSuccess(false), 2000);
    }
  };

  const cancelEditName = () => {
    setEditingName(false);
    setEditNameValue('');
  };

  const startEditBirthday = () => {
    if (profile?.birthday) {
      const [y, m, d] = profile.birthday.split('-').map(Number);
      setEditBirthdayY(y);
      setEditBirthdayM(m);
      setEditBirthdayD(d);
    } else {
      const now = new Date();
      setEditBirthdayY(now.getFullYear());
      setEditBirthdayM(now.getMonth() + 1);
      setEditBirthdayD(now.getDate());
    }
    setEditingBirthday(true);
  };

  const saveBirthday = async () => {
    if (!user) return;
    const y = editBirthdayY;
    const m = Math.max(1, Math.min(12, editBirthdayM));
    const maxDay = new Date(y, m, 0).getDate();
    const d = Math.max(1, Math.min(maxDay, editBirthdayD));
    const birthday = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    setBirthdaySaving(true);
    const { error } = await supabase.from('profiles').update({ birthday }).eq('id', user.id);
    setBirthdaySaving(false);
    if (!error) {
      setProfile((p) => (p ? { ...p, birthday } : { display_name: null, birthday, birth_chart_name: null }));
      setEditingBirthday(false);
      toast.success(t('profile.birthdaySaved', { defaultValue: '生日已更新' }));
    } else {
      toast.error(t('profile.birthdaySaveFailed', { defaultValue: '保存失敗，請重試' }));
    }
  };

  const cancelEditBirthday = () => setEditingBirthday(false);

  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 60 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(editBirthdayY, editBirthdayM, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const avatarUrl = getAvatarUrl(profile?.avatar_url, user);
  const initials = getDisplayInitials(profile?.display_name ?? user?.email?.split('@')[0], user?.email ?? null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.avatarInvalid', { defaultValue: '請選擇圖片檔案' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('profile.avatarTooBig', { defaultValue: '圖片請勿超過 2MB' }));
      return;
    }
    setAvatarUploading(true);
    e.target.value = '';
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      setProfile((p) => (p ? { ...p, avatar_url: urlData.publicUrl } : { display_name: null, birthday: null, avatar_url: urlData.publicUrl }));
      toast.success(t('profile.avatarSaved', { defaultValue: '頭像已更新' }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Bucket not found') || msg.includes('avatar')) {
        toast.error(t('profile.avatarSetupHint', { defaultValue: '頭像功能尚未配置，請見說明文檔' }));
      } else {
        toast.error(msg);
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition pb-8">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-[0.2em]" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
          {t('profile.title', { defaultValue: '賬戶中心' })}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t('profile.subtitle', { defaultValue: '管理你的資料與訂閱' })}
        </p>
        <p className="text-xs text-muted-foreground/80">
          {t('profile.subtitleHint', { defaultValue: '下方可查看出生資料姓名；點「我的檔案」查看已存命盤' })}
        </p>
      </div>

      {/* 頭像與暱稱 */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className="relative">
            <Avatar className="w-16 h-16 rounded-full border-2" style={{ borderColor: 'hsla(var(--gold) / 0.4)' }}>
              <AvatarImage src={avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="text-xl font-semibold rounded-full" style={{ background: 'hsla(var(--gold) / 0.2)', color: 'hsl(var(--gold))' }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
              style={{ background: 'hsl(var(--gold))', color: 'hsl(var(--background))' }}
              title={t('profile.changeAvatar', { defaultValue: '更換頭像' })}
              aria-label={t('profile.changeAvatar', { defaultValue: '更換頭像' })}
            >
              {avatarUploading ? <span className="text-xs">...</span> : <Camera size={14} />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center w-20">
            {t('profile.avatarHint', { defaultValue: '若無法上傳，請見後台配置說明' })}
          </p>
        </div>
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="h-5 w-24 rounded bg-muted animate-pulse" />
          ) : (
            <>
              {editingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    placeholder={t('auth.displayNamePlaceholder', { defaultValue: '請輸入你的名字' })}
                    className="glass-input w-full text-sm py-1.5 px-2"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveName}
                      disabled={nameSaving}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: 'hsla(var(--gold) / 0.2)', color: 'hsl(var(--gold))', border: '1px solid hsla(var(--gold) / 0.4)' }}
                    >
                      {nameSaving ? '...' : <><Check size={12} /> {t('profile.saveName', { defaultValue: '保存' })}</>}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditName}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border"
                    >
                      <X size={12} /> {t('profile.cancel', { defaultValue: '取消' })}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground truncate">{displayName}</p>
                  <button
                    type="button"
                    onClick={startEditName}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    title={t('profile.editName', { defaultValue: '修改姓名' })}
                    aria-label={t('profile.editName', { defaultValue: '修改姓名' })}
                  >
                    <Pencil size={14} />
                  </button>
                  {nameSaveSuccess && (
                    <span className="text-xs" style={{ color: 'hsl(var(--gold))' }}>{t('profile.nameSaved', { defaultValue: '姓名已更新' })}</span>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                <Mail size={12} /> {user.email}
              </p>
              <div className="mt-2 pt-2 border-t border-border/60 space-y-1">
                <p className="text-xs font-medium text-foreground/90">{t('profile.myBirthData', { defaultValue: '已保存的出生資料' })}</p>
                {!editingBirthday ? (
                  <div className="flex items-center justify-between gap-2">
                    {profile?.birthday ? (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} /> {profile.birthday}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t('profile.noBirthday', { defaultValue: '生日：未填寫' })}</p>
                    )}
                    <button
                      type="button"
                      onClick={startEditBirthday}
                      className="shrink-0 p-1 rounded-md hover:bg-muted/50 transition-colors"
                      title={t('profile.editBirthday', { defaultValue: '編輯生日' })}
                    >
                      <Pencil size={12} className="text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={editBirthdayY}
                      onChange={(e) => setEditBirthdayY(Number(e.target.value))}
                      className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">{t('profile.year', { defaultValue: '年' })}</span>
                    <select
                      value={editBirthdayM}
                      onChange={(e) => setEditBirthdayM(Number(e.target.value))}
                      className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs"
                    >
                      {months.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">{t('profile.month', { defaultValue: '月' })}</span>
                    <select
                      value={editBirthdayD}
                      onChange={(e) => setEditBirthdayD(Number(e.target.value))}
                      className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs"
                    >
                      {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">{t('profile.day', { defaultValue: '日' })}</span>
                    <button
                      type="button"
                      onClick={saveBirthday}
                      disabled={birthdaySaving}
                      className="px-2 py-1 rounded-lg text-xs font-medium bg-gold-soft text-gold-strong border border-gold-strong/50 disabled:opacity-50"
                    >
                      {birthdaySaving ? t('common.saving', { defaultValue: '保存中…' }) : t('profile.saveBirthday', { defaultValue: '保存' })}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditBirthday}
                      className="px-2 py-1 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:bg-muted/50"
                    >
                      {t('common.cancel', { defaultValue: '取消' })}
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <UserCircle size={12} /> {t('profile.savedBirthName', { defaultValue: '出生資料姓名' })}：{(profile?.birth_chart_name?.trim()) ? profile.birth_chart_name : t('profile.noBirthName', { defaultValue: '未填寫（請在星圖填寫資料並保存）' })}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 功能入口 */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate('/relationships')}
          className="w-full flex flex-col items-stretch gap-0.5 rounded-xl border border-border/60 px-4 py-3 transition-all hover:bg-muted/30 text-left"
        >
          <span className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-foreground font-medium">
              <Heart size={18} className="text-muted-foreground" />
              {t('profile.myArchives', { defaultValue: '我的檔案' })}
            </span>
            <ChevronRight size={18} className="text-muted-foreground shrink-0" />
          </span>
          <span className="text-xs text-muted-foreground pl-7">{t('profile.myArchivesHint', { defaultValue: '家人、朋友的已存命盤與關係說明' })}</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/subscribe')}
          className="w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all hover:bg-gold-soft border-gold-strong/50"
        >
          <span className="flex items-center gap-2 text-foreground font-medium">
            <Crown size={18} style={{ color: 'hsl(var(--gold))' }} />
            {t('profile.subscribe', { defaultValue: '訂閱管理' })}
          </span>
          <ChevronRight size={18} className="text-muted-foreground shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 transition-all hover:bg-muted/30"
        >
          <span className="flex items-center gap-2 text-foreground font-medium">
            <Settings size={18} className="text-muted-foreground" />
            {t('profile.settings', { defaultValue: '設置' })}
          </span>
          <ChevronRight size={18} className="text-muted-foreground shrink-0" />
        </button>

        <a
          href="mailto:support@mycelestial.app"
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 transition-all hover:bg-muted/30 no-underline text-foreground"
        >
          <span className="flex items-center gap-2 font-medium">
            <HelpCircle size={18} className="text-muted-foreground" />
            {t('profile.help', { defaultValue: '幫助與反饋' })}
          </span>
          <ChevronRight size={18} className="text-muted-foreground shrink-0" />
        </a>

        {/* 切换账号：退出当前账号并前往登录页，使用其他账号登录 */}
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate('/auth', { replace: true });
          }}
          className="w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all hover:bg-gold-soft border-gold-strong/50"
        >
          <span className="flex items-center gap-2 font-medium text-foreground">
            <ArrowRightLeft size={18} style={{ color: 'hsl(var(--gold))' }} />
            {t('auth.switchAccount', { defaultValue: '切換帳號' })}
          </span>
          <ChevronRight size={18} className="text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* 退出登錄 */}
      <button
        type="button"
        onClick={async () => { await signOut(); navigate('/auth', { replace: true }); }}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/40 px-4 py-3 text-destructive font-medium transition-all hover:bg-destructive/10"
      >
        <LogOut size={18} />
        {t('auth.logout', { defaultValue: '退出登錄' })}
      </button>
    </div>
  );
};

export default ProfilePage;
