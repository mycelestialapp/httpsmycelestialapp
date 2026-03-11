/**
 * 主題切換：四款可選（星際 / 森林 / 皇室 / 暖炭），持久化到 localStorage。
 */
export const THEME_STORAGE_KEY = 'celestial_theme';

export type ThemeId = 'default' | 'forest' | 'royal' | 'ember' | 'crimson' | 'blossom' | 'classic' | 'cosmic';

const THEME_IDS: ThemeId[] = ['default', 'forest', 'royal', 'ember', 'crimson', 'blossom', 'classic', 'cosmic'];

export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'default';
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  if (raw && THEME_IDS.includes(raw as ThemeId)) return raw as ThemeId;
  return 'default';
}

export function applyTheme(theme: ThemeId): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'default') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function useThemeInit(): void {
  if (typeof window === 'undefined') return;
  applyTheme(getStoredTheme());
}
