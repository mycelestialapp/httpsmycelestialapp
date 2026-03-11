/** 設定頁「塔羅逆位」開關：存 localStorage，TarotPanel 抽牌時讀取 */
const TAROT_ALLOW_REVERSED_KEY = 'tarot_allow_reversed';

export function getTarotAllowReversed(): boolean {
  try {
    return localStorage.getItem(TAROT_ALLOW_REVERSED_KEY) !== '0';
  } catch {
    return true;
  }
}

export function setTarotAllowReversed(allow: boolean): void {
  try {
    localStorage.setItem(TAROT_ALLOW_REVERSED_KEY, allow ? '1' : '0');
  } catch (_) {}
}
