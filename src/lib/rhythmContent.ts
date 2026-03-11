/**
 * 節奏頁：日/周/月運內容索引（依日期計算）
 */

/** 當日「每日一句」索引（0-based，可對應 i18n rhythm.dailyTip0 等） */
export function getDailyTipIndex(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 86400000;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear % 366;
}

/** ISO 週數（1–53） */
export function getWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/** 當週內容索引（0-based） */
export function getWeeklyContentIndex(date: Date): number {
  const w = getWeekOfYear(date);
  return (w - 1) % 52;
}

/** 當月內容索引（0-based） */
export function getMonthlyContentIndex(date: Date): number {
  return date.getMonth();
}
