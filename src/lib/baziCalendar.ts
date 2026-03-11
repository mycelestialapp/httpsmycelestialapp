/**
 * 八字历法：节气（节）用于月柱与起运
 * 寅月=立春~惊蛰前，卯月=惊蛰~清明前… 子月=大雪~小寒前，丑月=小寒~立春前
 */

/** 12节（节气中的“节”，月界）：立春、惊蛰、清明、立夏、芒种、小暑、立秋、白露、寒露、立冬、大雪、小寒 */
const JIEQI_NAMES = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];

/** 约 2000–2030 年各节气的公历日期（月, 日），年际略有浮动，此处用近似 */
function getJieqiApproxDay(year: number, index: number): { month: number; day: number } {
  const base: [number, number][] = [
    [2, 4],   // 立春 0  -> 寅月始
    [3, 6],   // 惊蛰 1  -> 卯月始
    [4, 5],   // 清明 2  -> 辰月始
    [5, 6],   // 立夏 3  -> 巳月始
    [6, 6],   // 芒种 4  -> 午月始
    [7, 7],   // 小暑 5  -> 未月始
    [8, 8],   // 立秋 6  -> 申月始
    [9, 8],   // 白露 7  -> 酉月始
    [10, 8],  // 寒露 8  -> 戌月始
    [11, 8],  // 立冬 9  -> 亥月始
    [12, 7],  // 大雪 10 -> 子月始
    [1, 6],   // 小寒 11 -> 丑月始
  ];
  const [m, d] = base[index]!;
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (index === 0 && leap) return { month: 2, day: 3 }; // 闰年立春多在前一日
  return { month: m, day: d };
}

/** 某日所在节气月序号 1–12（1=寅月…12=丑月） */
export function getMonthByJieqi(year: number, month: number, day: number): number {
  const d = new Date(year, month - 1, day).getTime();
  for (let i = 0; i < 12; i++) {
    const next = (i + 1) % 12;
    const jq = getJieqiApproxDay(year, next);
    const jqYear = next === 0 ? year + 1 : year;
    const jqDate = new Date(jqYear, jq.month - 1, jq.day);
    if (d < jqDate.getTime()) return i + 1; // 1=寅…12=丑
  }
  return 1;
}

/** 立春日期（用于年柱换年） */
export function getLichunDate(year: number): Date {
  const { month, day } = getJieqiApproxDay(year, 0);
  return new Date(year, month - 1, day);
}

/** 是否在立春之后（含立春当日为新年） */
export function isAfterLichun(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day).getTime();
  const lc = getLichunDate(year).getTime();
  return d >= lc;
}

/** 下一节气的 Date（用于顺排大运起运） */
export function getNextJieqiDate(year: number, month: number, day: number): Date {
  const d = new Date(year, month - 1, day).getTime();
  for (let i = 0; i < 12; i++) {
    const j = (i + 1) % 12;
    const jq = getJieqiApproxDay(year, j);
    let jqYear = year;
    if (j === 0) jqYear = year + 1; // 下一年的立春
    const jqDate = new Date(jqYear, jq.month - 1, jq.day);
    if (d < jqDate.getTime()) return jqDate;
  }
  return new Date(year + 1, 0, 6); // 次年小寒
}

/** 上一节气的 Date（用于逆排大运起运） */
export function getPrevJieqiDate(year: number, month: number, day: number): Date {
  const d = new Date(year, month - 1, day).getTime();
  for (let i = 12; i >= 0; i--) {
    const j = i % 12;
    const jq = getJieqiApproxDay(year, j);
    let jqYear = year;
    if (j === 11) jqYear = year - 1; // 上一年小寒
    const jqDate = new Date(jqYear, jq.month - 1, jq.day);
    if (d >= jqDate.getTime()) return jqDate;
  }
  return new Date(year - 1, 11, 7); // 上年大雪
}

/** 从出生日到下一（或上一）节气的天数；3 日 = 1 岁，1 日 = 4 个月 */
export function getDayunStartAgeDays(
  year: number,
  month: number,
  day: number,
  direction: '顺' | '逆'
): number {
  const birth = new Date(year, month - 1, day);
  const target = direction === '顺' ? getNextJieqiDate(year, month, day) : getPrevJieqiDate(year, month, day);
  const diff = Math.round((target.getTime() - birth.getTime()) / 86400000);
  return Math.max(0, Math.abs(diff));
}

export { JIEQI_NAMES };
