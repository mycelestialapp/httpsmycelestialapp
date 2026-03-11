import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Globe, Bell, Shield, Info, ChevronRight, KeyRound, Check, Gauge, FileText, Trash2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Switch } from '@/components/ui/switch';
import { getStoredTheme, applyTheme, type ThemeId } from '@/hooks/useTheme';
import { getHideEnergyRadar, setHideEnergyRadar } from '@/lib/energyRadarSetting';
import { getTarotAllowReversed, setTarotAllowReversed } from '@/lib/tarotSettings';
import { clearAllReadings } from '@/lib/readingHistory';

const APP_VERSION = '1.0.0';

/** 每款主題的「主色」用於色環；暖炭=明確橙、赤焰=明確紅，區分明顯 */
const THEMES: { id: ThemeId; labelKey: string; ringColor: string; bgTint: string }[] = [
  { id: 'default', labelKey: 'settings.themeDefault', ringColor: '#d4af37', bgTint: 'rgba(26,35,50,0.6)' },
  { id: 'forest', labelKey: 'settings.themeForest', ringColor: '#8fbc8f', bgTint: 'rgba(13,31,24,0.6)' },
  { id: 'royal', labelKey: 'settings.themeRoyal', ringColor: '#b8b8c8', bgTint: 'rgba(26,21,37,0.6)' },
  { id: 'ember', labelKey: 'settings.themeEmber', ringColor: '#e8a030', bgTint: 'rgba(40,32,24,0.6)' },
  { id: 'crimson', labelKey: 'settings.themeCrimson', ringColor: '#c0392b', bgTint: 'rgba(40,10,10,0.6)' },
  { id: 'blossom', labelKey: 'settings.themeBlossom', ringColor: '#e8a0b8', bgTint: 'rgba(36,15,24,0.6)' },
  { id: 'classic', labelKey: 'settings.themeClassic', ringColor: '#e8e8e8', bgTint: 'rgba(18,18,18,0.8)' },
  { id: 'cosmic', labelKey: 'settings.themeCosmic', ringColor: '#fbd34c', bgTint: 'rgba(26,16,72,0.85)' },
];

const SettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme);
  const [hideEnergyRadar, setHideEnergyRadarState] = useState(getHideEnergyRadar);
  const [tarotAllowReversed, setTarotAllowReversedState] = useState(getTarotAllowReversed);
  const [tarotDisclaimerOpen, setTarotDisclaimerOpen] = useState(false);

  const handleThemeChange = (id: ThemeId) => {
    applyTheme(id);
    setTheme(id);
  };

  const handleEnergyRadarToggle = (checked: boolean) => {
    const nextHide = !checked;
    setHideEnergyRadar(nextHide);
    setHideEnergyRadarState(nextHide);
  };

  const handleTarotReversedToggle = (checked: boolean) => {
    setTarotAllowReversed(checked);
    setTarotAllowReversedState(checked);
  };

  const handleClearReadings = () => {
    if (!window.confirm(t('settings.clearReadingsConfirm', { defaultValue: '確定要清除本機所有解讀記錄嗎？此操作無法復原。' }))) return;
    clearAllReadings();
    toast.success(t('settings.clearReadingsDone', { defaultValue: '已清除本地解讀記錄' }));
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition pb-8">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-[0.2em]" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
          {t('settings.title', { defaultValue: '設置' })}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t('settings.subtitle', { defaultValue: '語言、通知與關於' })}
        </p>
      </div>

      <div className="space-y-2">
        {/* 介面主題：色環區分明顯 + 水晶字體 + 細膩背景 */}
        <div className="theme-selector-card rounded-2xl px-3 py-3 space-y-2">
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="text-foreground font-medium text-sm">{t('settings.theme', { defaultValue: '介面主題' })}</span>
          </div>
          <p className="relative z-10 text-[11px] text-muted-foreground">{t('settings.themeSubtitle', { defaultValue: '切換配色，八款可選' })}</p>
          <div className="relative z-10 grid grid-cols-4 sm:grid-cols-5 gap-1.5">
            {THEMES.map(({ id, labelKey, ringColor, bgTint }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleThemeChange(id)}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 transition-all min-w-0 relative overflow-hidden"
                style={{
                  borderColor: theme === id ? ringColor : 'hsla(var(--border) / 0.5)',
                  background: theme === id
                    ? `linear-gradient(180deg, hsla(var(--gold) / 0.12) 0%, hsla(var(--card) / 0.4) 100%)`
                    : 'hsla(var(--card) / 0.25)',
                  boxShadow: theme === id ? `0 0 14px ${ringColor}40, 0 0 0 1px ${ringColor}30` : '0 1px 4px hsla(0,0%,0%,0.12)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
                  style={{
                    background: bgTint,
                    border: `2.5px solid ${ringColor}`,
                    boxShadow: `0 0 8px ${ringColor}50, inset 0 0 6px hsla(0,0%,100%,0.04)`,
                  }}
                />
                <span className="text-crystal text-[10px] font-semibold truncate w-full text-center leading-tight">{t(labelKey)}</span>
                {theme === id && (
                  <Check size={11} className="shrink-0 absolute top-1 right-1" style={{ color: ringColor, filter: `drop-shadow(0 0 3px ${ringColor})` }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 語言 */}
        <div className="rounded-xl border border-border/60 px-4 py-3 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-foreground font-medium">
            <Globe size={18} className="text-muted-foreground" />
            {t('settings.language', { defaultValue: '語言' })}
          </span>
          <LanguageSwitcher />
        </div>

        {/* 能量地圖（五行）：關閉後工具頁與閱讀頁不再顯示 */}
        <div className="rounded-xl border border-border/60 px-4 py-3 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-foreground font-medium">
            <Gauge size={18} className="text-muted-foreground" />
            {t('settings.showEnergyRadar', { defaultValue: '顯示能量地圖（五行）' })}
          </span>
          <Switch
            checked={!hideEnergyRadar}
            onCheckedChange={handleEnergyRadarToggle}
          />
        </div>

        {/* 塔羅逆位：關閉後抽牌僅出現正位 */}
        <div className="rounded-xl border border-border/60 px-4 py-3 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-foreground font-medium">
            <Layers size={18} className="text-muted-foreground" />
            {t('settings.tarotReversed', { defaultValue: '塔羅逆位' })}
          </span>
          <Switch
            checked={tarotAllowReversed}
            onCheckedChange={handleTarotReversedToggle}
          />
        </div>
        <p className="text-[11px] text-muted-foreground -mt-1 px-1">
          {t('settings.tarotReversedHint', { defaultValue: '開啟時抽牌可能出現逆位；關閉時僅顯示正位。' })}
        </p>

        {/* 塔羅免責聲明：可再次查看 */}
        <button
          type="button"
          onClick={() => setTarotDisclaimerOpen(true)}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 transition-all hover:bg-muted/30 text-left"
        >
          <span className="flex items-center gap-2 text-foreground font-medium">
            <FileText size={18} className="text-muted-foreground" />
            {t('settings.tarotDisclaimer', { defaultValue: '塔羅免責聲明' })}
          </span>
          <ChevronRight size={18} className="text-muted-foreground shrink-0" />
        </button>

        {tarotDisclaimerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true">
            <div className="rounded-xl border border-gold-strong/30 bg-background max-w-md w-full p-4 space-y-3 shadow-xl">
              <p className="text-sm text-subtitle font-medium">{t('settings.tarotDisclaimer', { defaultValue: '塔羅免責聲明' })}</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">
                {t('oracle.tarotDisclaimer', {
                  defaultValue: '塔羅是指引與自我覺察的工具，不是絕對預言。建議聚焦「我能做什麼」，會得到更有幫助的方向～',
                })}
              </p>
              <button
                type="button"
                onClick={() => setTarotDisclaimerOpen(false)}
                className="w-full py-2.5 rounded-lg border border-gold-strong/40 text-gold-strong text-sm font-medium"
              >
                {t('common.close', { defaultValue: '關閉' })}
              </button>
            </div>
          </div>
        )}

        {/* 清除本地解讀記錄（合規） */}
        <button
          type="button"
          onClick={handleClearReadings}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 transition-all hover:bg-muted/30 text-left text-foreground"
        >
          <span className="flex items-center gap-2 font-medium">
            <Trash2 size={18} className="text-muted-foreground" />
            {t('settings.clearReadings', { defaultValue: '清除本地解讀記錄' })}
          </span>
          <ChevronRight size={18} className="text-muted-foreground shrink-0" />
        </button>
        <p className="text-[11px] text-muted-foreground -mt-1 px-1">
          {t('settings.clearReadingsHint', { defaultValue: '僅刪除本機儲存的占卜記錄，不影響帳號資料。' })}
        </p>

        {/* 通知（佔位） */}
        <div className="rounded-xl border border-border/60 px-4 py-3 flex items-center justify-between gap-3 opacity-75">
          <span className="flex items-center gap-2 text-foreground font-medium">
            <Bell size={18} className="text-muted-foreground" />
            {t('settings.notifications', { defaultValue: '通知' })}
          </span>
          <span className="text-xs text-muted-foreground">{t('settings.comingSoon', { defaultValue: '即將推出' })}</span>
        </div>

        {/* 賬號安全：站內跳轉修改密碼 */}
        <button
          type="button"
          onClick={() => navigate('/settings/change-password')}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 transition-all hover:bg-muted/30 text-left"
        >
          <span className="flex items-center gap-2 text-foreground font-medium">
            <KeyRound size={18} className="text-muted-foreground" />
            {t('settings.changePassword', { defaultValue: '修改密碼' })}
          </span>
          <ChevronRight size={18} className="text-muted-foreground shrink-0" />
        </button>

        {/* 隱私與條款 + 免責聲明 */}
        <div className="rounded-2xl border border-border/60 px-4 py-4 space-y-2">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Shield size={18} className="text-muted-foreground" />
            <span>{t('settings.privacy', { defaultValue: '隱私與條款 / 免責聲明' })}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t('settings.disclaimerFull', {
              defaultValue:
                '本平台所提供的星座、命盤、行星、宮位等相關內容，僅供娛樂、文化興趣與自我覺察之用，並不構成任何形式之醫學、心理、法律、財務或投資建議。你根據本服務內容所作出的任何決定與行為（包括但不限於感情選擇、職涯規劃、健康處置與金錢投資），均應由你自行評估並承擔風險與後果。如有重大人生決策、身心困擾或健康疑慮，請優先參考實際情況，並酌情尋求專業人士協助。',
            })}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="text-xs font-medium text-gold-strong hover:underline text-left"
            >
              {t('settings.viewPrivacy', { defaultValue: '查看隱私政策' })}
            </button>
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="text-xs font-medium text-gold-strong hover:underline text-left"
            >
              {t('settings.viewTerms', { defaultValue: '查看用戶條款' })}
            </button>
          </div>
        </div>

        {/* 關於 */}
        <div className="rounded-xl border border-border/60 px-4 py-3 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-foreground font-medium">
            <Info size={18} className="text-muted-foreground" />
            {t('settings.about', { defaultValue: '關於' })}
          </span>
          <span className="text-xs text-muted-foreground">v{APP_VERSION}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="w-full py-2.5 rounded-xl border border-border/60 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
      >
        {t('common.back', { defaultValue: '返回' })}
      </button>
    </div>
  );
};

export default SettingsPage;
