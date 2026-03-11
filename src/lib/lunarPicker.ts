/**
 * 农历滚轮用：获取某年某月的天数、闰月等
 */
import { getDaysInMonth } from "date-fns";
import solarlunar from "solarlunar";

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const CURRENT_YEAR = new Date().getFullYear();

export function getSolarYears() {
  return Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i).filter((y) => y <= CURRENT_YEAR);
}

export function getSolarMonths() {
  return Array.from({ length: 12 }, (_, i) => i + 1);
}

export function getSolarDaysInMonth(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month - 1, 1));
}

export function getLunarYears() {
  return Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i).filter((y) => y <= CURRENT_YEAR);
}

export function getLunarMonths() {
  return Array.from({ length: 12 }, (_, i) => i + 1);
}

/** 农历日 1-30（农历月 29 或 30 天，前端统一 1-30，转换时由 solarlunar 校验） */
export function getLunarDays() {
  return Array.from({ length: 30 }, (_, i) => i + 1);
}

/**
 * 农历转公历，返回 null 表示无效日期
 */
export function lunarToSolar(
  lYear: number,
  lMonth: number,
  lDay: number,
  isLeapMonth: boolean
): { year: number; month: number; day: number } | null {
  try {
    const api = (typeof solarlunar !== "undefined" && solarlunar) || null;
    if (!api?.lunar2solar) return null;
    const r = api.lunar2solar(lYear, lMonth, lDay, isLeapMonth);
    if (r && r.cYear && r.cMonth != null && r.cDay != null) return { year: r.cYear, month: r.cMonth, day: r.cDay };
  } catch {
    // ignore
  }
  return null;
}

/**
 * 公历转农历（用于回显阴历界面）
 */
export function solarToLunar(
  year: number,
  month: number,
  day: number
): { lYear: number; lMonth: number; lDay: number; isLeap: boolean } | null {
  try {
    const api = (typeof solarlunar !== "undefined" && solarlunar) || null;
    if (!api?.solar2lunar) return null;
    const r = api.solar2lunar(year, month, day);
    if (r && r.lYear != null && r.lMonth != null && r.lDay != null)
      return { lYear: r.lYear, lMonth: r.lMonth, lDay: r.lDay, isLeap: !!r.isLeap };
  } catch {
    // ignore
  }
  return null;
}
