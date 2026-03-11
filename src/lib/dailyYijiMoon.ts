/**
 * 今日宜忌 · 月相（B+D）
 * 依據：當日公曆對應的月相（朔望月 ~29.53 天）與月亮所在星座（約 2.5 天/星座）。
 * 月相用簡化朔望週期推算；月亮星座用恆星月 ~27.32 天 + 參考曆元推算。
 * 內容為西占常見詮釋：月相主節奏（開創/豐滿/收斂/釋放），月落星座主情緒與人際傾向。
 */

import type { ZodiacSignKey } from './astrologyChart';

/** 月相類型 */
export type MoonPhaseType = 'new' | 'waxing' | 'full' | 'waning';

const LUNAR_CYCLE_DAYS = 29.530588;
const SIDEREAL_MONTH_DAYS = 27.321661;
/** 參考曆元：2020-01-24 新月（近似） */
const REF_NEW_MOON_JD = 2458850.0;
/** 參考：2000-01-01 00:00 UTC 月亮約在摩羯 0°（黃經 270°） */
const REF_JD = 2451545.0;
const REF_MOON_LONGITUDE = 270;

function dateToJulianDay(d: Date): number {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const a = Math.floor((14 - m) / 12);
  const jy = y + 4800 - a;
  const jm = m + 12 * a - 3;
  let jd =
    day +
    Math.floor((153 * jm + 2) / 5) +
    365 * jy +
    Math.floor(jy / 4) -
    Math.floor(jy / 100) +
    Math.floor(jy / 400) -
    32045;
  return jd + (d.getHours() - 12) / 24 + d.getMinutes() / 1440 + d.getSeconds() / 86400;
}

/** 當日月齡（0～29.53） */
function getMoonAge(jd: number): number {
  const age = (jd - REF_NEW_MOON_JD) % LUNAR_CYCLE_DAYS;
  return age < 0 ? age + LUNAR_CYCLE_DAYS : age;
}

/** 依日期取得月相類型與中文名 */
export function getMoonPhase(date: Date): { type: MoonPhaseType; name: string } {
  const jd = dateToJulianDay(date);
  const age = getMoonAge(jd);
  const t = age / LUNAR_CYCLE_DAYS;
  if (t < 0.0625 || t >= 0.9375) return { type: 'new', name: '新月' };
  if (t < 0.375) return { type: 'waxing', name: '上弦月' };
  if (t < 0.625) return { type: 'full', name: '滿月' };
  return { type: 'waning', name: '下弦月' };
}

/** 黃道 12 宮順序（從牡羊起） */
const ZODIAC_ORDER: ZodiacSignKey[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

/** 依日期取得月亮所在星座 */
export function getMoonSign(date: Date): ZodiacSignKey {
  const jd = dateToJulianDay(date);
  const daysSinceRef = jd - REF_JD;
  const longitude = (REF_MOON_LONGITUDE + (daysSinceRef * 360) / SIDEREAL_MONTH_DAYS) % 360;
  const normalized = longitude < 0 ? longitude + 360 : longitude;
  const index = Math.floor(normalized / 30) % 12;
  return ZODIAC_ORDER[index];
}

/** 月亮星座中文名（與 astrologyChart 一致） */
export const MOON_SIGN_NAMES: Record<ZodiacSignKey, string> = {
  aries: '牡羊', taurus: '金牛', gemini: '雙子', cancer: '巨蟹', leo: '獅子', virgo: '處女',
  libra: '天秤', scorpio: '天蠍', sagittarius: '射手', capricorn: '摩羯', aquarius: '水瓶', pisces: '雙魚',
};

/** 今日幸運色（西占常見：星座對應色） */
const LUCKY_COLOR_BY_SIGN: Record<ZodiacSignKey, { name: string; hex: string }> = {
  aries: { name: '紅色', hex: '#c41e3a' },
  taurus: { name: '苔綠', hex: '#4a7c59' },
  gemini: { name: '檸檬黃', hex: '#f4d03f' },
  cancer: { name: '銀白', hex: '#c0c0c0' },
  leo: { name: '金色', hex: '#d4af37' },
  virgo: { name: '墨綠', hex: '#2d5a27' },
  libra: { name: '粉玫瑰', hex: '#e8b4b8' },
  scorpio: { name: '深紅', hex: '#722f37' },
  sagittarius: { name: '靛紫', hex: '#4b0082' },
  capricorn: { name: '棕褐', hex: '#6f4e37' },
  aquarius: { name: '電光藍', hex: '#00bfff' },
  pisces: { name: '海青', hex: '#2e8b57' },
};

/** 單日內容：今日適合 / 今日宜 / 今日忌 / 今日幸運色 */
export interface DailyYijiContent {
  phaseName: string;
  moonSignName: string;
  moonSignKey: ZodiacSignKey;
  /** 今日適合（一句） */
  suitable: string;
  /** 今日宜 */
  yi: string[];
  /** 今日忌 */
  ji: string[];
  /** 今日幸運色（名稱 + 色碼，供 UI 顯示色塊） */
  luckyColor: { name: string; hex: string };
}

/** 依月亮星座的「今日適合」一句（西占常見：月落該星座的情緒與人際傾向） */
const SUITABLE_BY_SIGN: Record<ZodiacSignKey, string> = {
  aries: '把話說清楚、先動再想，適合開創與表態。',
  taurus: '穩步推進、享受當下，適合理財與感官放鬆。',
  gemini: '溝通、學習、短途走動，適合表達與蒐集資訊。',
  cancer: '傾聽情緒、照顧他人，適合居家與修復關係。',
  leo: '展現創意與自信，適合約會、表演與被看見。',
  virgo: '整理、規劃、精進細節，適合健康與工作收尾。',
  libra: '協調關係、尋求共識，適合合作與美與平衡。',
  scorpio: '深度對話、面對真相，適合釋放舊怨與轉化。',
  sagittarius: '擴展視野、冒險與學習，適合遠行或哲思。',
  capricorn: '務實規劃、扛起責任，適合事業與長期目標。',
  aquarius: '跳出框架、連結同好，適合社群與創新點子。',
  pisces: '直覺與慈悲，適合獨處、藝術與靈性沉澱。',
};

/** 今日宜（依月亮星座，西占常見建議） */
const YI_BY_SIGN: Record<ZodiacSignKey, string[]> = {
  aries: ['獨處反思', '整理思緒', '傾聽內心'],
  taurus: ['簽約置產', '品嚐美食', '穩定作息'],
  gemini: ['開會溝通', '閱讀寫作', '短途出行'],
  cancer: ['陪伴家人', '打掃整理', '表達關心'],
  leo: ['約會告白', '展現才華', '適度放鬆'],
  virgo: ['健康檢查', '列清單', '完成待辦'],
  libra: ['合作洽談', '打扮自己', '平衡取捨'],
  scorpio: ['深談修復', '放下執念', '理財規劃'],
  sagittarius: ['學習進修', '旅行計畫', '分享觀點'],
  capricorn: ['訂定目標', '向上溝通', '儲蓄理財'],
  aquarius: ['社群聚會', '嘗試新事物', '保持客觀'],
  pisces: ['冥想靜心', '藝術創作', '少做重大決定'],
};

/** 今日忌（依月亮星座） */
const JI_BY_SIGN: Record<ZodiacSignKey, string[]> = {
  aries: ['衝動簽約', '與人爭執', '過度承諾'],
  taurus: ['揮霍消費', '固執己見', '拖延重大決定'],
  gemini: ['散播八卦', '同時多線開工', '輕諾寡信'],
  cancer: ['壓抑情緒', '過度討好', '翻舊帳'],
  leo: ['炫耀自大', '忽視他人感受', '衝動消費'],
  virgo: ['吹毛求疵', '過度焦慮', '熬夜硬撐'],
  libra: ['優柔寡斷', '為和諧而委屈', '拖延表態'],
  scorpio: ['報復心態', '窺探隱私', '大額投資'],
  sagittarius: ['好高騖遠', '說教他人', '不守承諾'],
  capricorn: ['冷漠疏離', '只工作不休息', '過度控制'],
  aquarius: ['疏離冷漠', '為反而反', '忽略身邊人'],
  pisces: ['逃避現實', '過度犧牲', '借錢給人'],
};

/**
 * 取得當日「今日宜忌 · 月相」完整內容。
 * 依據：當日公曆的月相（朔望週期）與月亮星座（恆星月推算）。
 */
export function getDailyYijiMoon(date: Date = new Date()): DailyYijiContent {
  const phase = getMoonPhase(date);
  const sign = getMoonSign(date);
  return {
    phaseName: phase.name,
    moonSignName: MOON_SIGN_NAMES[sign],
    moonSignKey: sign,
    suitable: SUITABLE_BY_SIGN[sign],
    yi: YI_BY_SIGN[sign],
    ji: JI_BY_SIGN[sign],
    luckyColor: LUCKY_COLOR_BY_SIGN[sign],
  };
}
