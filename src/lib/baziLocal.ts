/**
 * 本地八字排盘（完整底层逻辑）
 * 历法：立春换年、节气月；真太阳时；纳音；大运起运+性别顺逆；格局与喜忌
 */

import {
  getMonthByJieqi,
  isAfterLichun,
  getDayunStartAgeDays,
  getLichunDate,
} from './baziCalendar';

export interface BaziPillars {
  year: string;
  month: string;
  day: string;
  hour: string;
}

export interface BaziWuxing {
  wood?: number | string;
  fire?: number | string;
  earth?: number | string;
  metal?: number | string;
  water?: number | string;
}

/** 大运一步 */
export interface DayunStep {
  ganzhi: string;
  startAge: number;
}

/** 大运 */
export interface Dayun {
  direction: '顺' | '逆';
  startAge: number;
  startAgeNote?: string; // e.g. "约3岁起运（出生后X日至下一节气）"
  steps: DayunStep[];
}

/** 流年 */
export interface Liunian {
  lastYear: string;
  thisYear: string;
  nextYear: string;
}

/** 格局 */
export type GejuType = '正格' | '专旺' | '从强' | '从弱' | '化气' | '';

export interface BaziApiResult {
  pillars: BaziPillars;
  wuxing?: BaziWuxing;
  dayMaster?: string;
  xiyongshen?: string;
  jishen?: string;
  summary?: string;
  nayin?: string;
  nayinPerPillar?: BaziPillars;
  shishen?: string;
  canggan?: string;
  cangganPerPillar?: BaziPillars;
  shishenPerPillar?: BaziPillars;
  dayun?: Dayun;
  liunian?: Liunian;
  shensha?: string[];
  /** 每柱神煞（年柱、月柱、日柱、时柱各自所带神煞） */
  shenshaPerPillar?: BaziPillars;
  /** 空亡地支二支（由日柱定旬） */
  kongwang?: [string, string];
  /** 每柱是否坐空（该柱地支在空亡内则为「空」，否则为「—」） */
  kongwangPerPillar?: BaziPillars;
  geju?: GejuType;
  monthBranchIndex?: number; // 月支序号 1-12 寅=1
}

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const DIZHI_CANGGAN: Record<string, string> = {
  '子': '癸', '丑': '己癸辛', '寅': '甲丙戊', '卯': '乙', '辰': '戊乙癸', '巳': '丙庚戊',
  '午': '丁己', '未': '己丁乙', '申': '庚壬戊', '酉': '辛', '戌': '戊辛丁', '亥': '壬甲',
};

/** 六十甲子纳音（0=甲子…59=癸亥） */
const NAYIN_TABLE: string[] = [
  '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木', '路旁土', '路旁土', '剑锋金', '剑锋金',
  '山头火', '山头火', '涧下水', '涧下水', '城头土', '城头土', '白蜡金', '白蜡金', '杨柳木', '杨柳木',
  '泉中水', '泉中水', '屋上土', '屋上土', '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
  '沙中金', '沙中金', '山下火', '山下火', '平地木', '平地木', '壁上土', '壁上土', '金箔金', '金箔金',
  '覆灯火', '覆灯火', '天河水', '天河水', '大驿土', '大驿土', '钗钏金', '钗钏金', '桑柘木', '桑柘木',
  '大溪水', '大溪水', '沙中土', '沙中土', '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水',
];

const SHISHEN_MAP: string[][] = [
  ['比肩', '劫财', '偏印', '正印', '偏财', '正财', '七杀', '正官', '食神', '伤官'],
  ['劫财', '比肩', '正印', '偏印', '正财', '偏财', '正官', '七杀', '伤官', '食神'],
  ['食神', '伤官', '比肩', '劫财', '偏印', '正印', '偏财', '正财', '七杀', '正官'],
  ['伤官', '食神', '劫财', '比肩', '正印', '偏印', '正财', '偏财', '正官', '七杀'],
  ['偏财', '正财', '七杀', '正官', '比肩', '劫财', '偏印', '正印', '食神', '伤官'],
  ['正财', '偏财', '正官', '七杀', '劫财', '比肩', '正印', '偏印', '伤官', '食神'],
  ['七杀', '正官', '偏财', '正财', '食神', '伤官', '比肩', '劫财', '偏印', '正印'],
  ['正官', '七杀', '正财', '偏财', '伤官', '食神', '劫财', '比肩', '正印', '偏印'],
  ['偏印', '正印', '七杀', '正官', '比肩', '劫财', '偏财', '正财', '食神', '伤官'],
  ['正印', '偏印', '正官', '七杀', '劫财', '比肩', '正财', '偏财', '伤官', '食神'],
];

/** 六十甲子顺序 甲子0…癸亥59（第 i 个 = 天干 i%10 + 地支 i%12） */
const JIAZI_60: string[] = Array.from({ length: 60 }, (_, i) => TIANGAN[i % 10]! + DIZHI[i % 12]!);
function getGanZhiIndex(gan: string, zhi: string): number {
  const s = gan + zhi;
  const idx = JIAZI_60.indexOf(s);
  return idx >= 0 ? idx : 0;
}

function getNayin(ganzhi: string): string {
  if (ganzhi.length < 2) return '—';
  const idx = getGanZhiIndex(ganzhi[0]!, ganzhi[1]!);
  return NAYIN_TABLE[idx] ?? '—';
}

/** 年柱：立春换年 */
function getYearPillarByLichun(year: number, month: number, day: number): string {
  const y = isAfterLichun(year, month, day) ? year : year - 1;
  const s = TIANGAN[(y - 4) % 10];
  const b = DIZHI[(y - 4) % 12];
  return s + b;
}

/** 月柱：节气月 + 五虎遁（甲己年丙作首，寅月干=丙…） */
function getMonthPillarByJieqi(year: number, month: number, day: number): string {
  const jieqiMonth = getMonthByJieqi(year, month, day); // 1=寅…12=丑
  const yearPillar = getYearPillarByLichun(year, month, day);
  const yearStemIdx = TIANGAN.indexOf(yearPillar[0]!);
  const tigerBase = (yearStemIdx % 5) * 2 + 2; // 寅月天干：甲己->丙(2) 乙庚->戊(4) …
  const s = TIANGAN[(tigerBase + jieqiMonth - 1) % 10];
  const b = DIZHI[jieqiMonth - 1]!; // 寅=0
  return s + b;
}

function getDayPillar(year: number, month: number, day: number): string {
  const base = new Date(year, month - 1, day);
  const ref = new Date(1900, 0, 1);
  const diff = Math.floor((base.getTime() - ref.getTime()) / 86400000);
  const s = TIANGAN[(diff + 10) % 10];
  const b = DIZHI[(diff + 10) % 12];
  return s + b;
}

function getHourPillar(year: number, month: number, day: number, hourIndex: number): string {
  const dayPillar = getDayPillar(year, month, day);
  const dayStemIdx = TIANGAN.indexOf(dayPillar[0]!);
  const hIdx = hourIndex >= 0 && hourIndex <= 11 ? hourIndex : 6;
  const startStemIdx = (dayStemIdx % 5) * 2;
  const s = TIANGAN[(startStemIdx + hIdx) % 10];
  const b = DIZHI[hIdx];
  return s + b;
}

/** 真太阳时：经度差 1 度 ≈ 4 分钟，东经 120 为北京时间基准；返回修正后的时辰序号 0–11 */
function getTrueSolarHourIndex(
  hour: number,
  minute: number,
  longitude: number | undefined,
  useSolarTime: boolean
): number {
  if (!useSolarTime || longitude == null) {
    return getHourIndexFromClock(hour, minute);
  }
  const offsetMin = (longitude - 120) * 4;
  const totalMin = hour * 60 + minute + offsetMin;
  let h = Math.floor(totalMin / 60) % 24;
  if (h < 0) h += 24;
  const m = totalMin % 60;
  return getHourIndexFromClock(h, m);
}

/** 钟表时刻 -> 时辰序号（子=0 丑=1 … 亥=11），子时 23–1 */
function getHourIndexFromClock(hour: number, minute: number): number {
  let h = hour;
  if (minute >= 30) h += 1;
  if (h >= 24) h -= 24;
  if (h < 1) h += 24; // 0 点算前一日亥时末，归入子时
  const idx = Math.floor((h + 1) / 2) % 12;
  return idx;
}

function getDayMaster(year: number, month: number, day: number): string {
  return getDayPillar(year, month, day)[0]!;
}

function getShiShenForStem(dayMasterStem: string, stem: string): string {
  const i = TIANGAN.indexOf(dayMasterStem);
  const j = TIANGAN.indexOf(stem);
  if (i < 0 || j < 0) return '—';
  return SHISHEN_MAP[i]![j]!;
}

function getCanggan(branch: string): string {
  return DIZHI_CANGGAN[branch] ?? '—';
}

const STEM_WUXING: Record<string, string> = {
  '甲': 'wood', '乙': 'wood', '丙': 'fire', '丁': 'fire', '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal', '壬': 'water', '癸': 'water',
};
const BRANCH_WUXING: Record<string, string> = {
  '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood', '辰': 'earth', '巳': 'fire',
  '午': 'fire', '未': 'earth', '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water',
};

/** 五行统计：天干+地支+藏干（加权），月令地支权重 x2 */
function countWuxing(pillars: BaziPillars, monthBranchIndex: number): BaziWuxing {
  const count: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const add = (c: string, w = 1) => {
    const wx = STEM_WUXING[c] || BRANCH_WUXING[c];
    if (wx) count[wx] = (count[wx] || 0) + w;
  };
  const str = pillars.year + pillars.month + pillars.day + pillars.hour;
  str.split('').forEach((c) => add(c));
  [pillars.year[1], pillars.month[1], pillars.day[1], pillars.hour[1]].forEach((b) => {
    if (!b) return;
    const cg = DIZHI_CANGGAN[b];
    if (cg) cg.split('').forEach((c) => add(c, 0.4));
  });
  const monthBranch = DIZHI[monthBranchIndex - 1];
  if (monthBranch) {
    add(monthBranch, 1);
    const cg = DIZHI_CANGGAN[monthBranch];
    if (cg) cg.split('').forEach((c) => add(c, 0.4));
  }
  const total = Object.values(count).reduce((a, b) => a + b, 0) || 1;
  return {
    wood: Math.round((count.wood / total) * 100),
    fire: Math.round((count.fire / total) * 100),
    earth: Math.round((count.earth / total) * 100),
    metal: Math.round((count.metal / total) * 100),
    water: Math.round((count.water / total) * 100),
  };
}

/** 大运顺逆：阳男阴女顺，阴男阳女逆 */
function getDayunDirection(yearStemIndex: number, gender: 'male' | 'female'): '顺' | '逆' {
  const isYangYear = yearStemIndex % 2 === 0;
  if (gender === 'male') return isYangYear ? '顺' : '逆';
  return isYangYear ? '逆' : '顺';
}

/** 起运岁数：到下一（或上一）节气天数，3 日=1 岁，不足 1 岁按 1 岁 */
function getStartAge(
  year: number,
  month: number,
  day: number,
  direction: '顺' | '逆'
): { age: number; note: string } {
  const days = getDayunStartAgeDays(year, month, day, direction);
  const age = Math.max(1, Math.ceil(days / 3));
  const note = `约${age}岁起运（出生后${days}日至${direction === '顺' ? '下一' : '上一'}节气）`;
  return { age, note };
}

function getDayun(
  monthPillar: string,
  yearStemIndex: number,
  gender: 'male' | 'female',
  birthY: number,
  birthM: number,
  birthD: number
): Dayun {
  const direction = getDayunDirection(yearStemIndex, gender);
  const { age: startAge, note } = getStartAge(birthY, birthM, birthD, direction);
  const monthStemIdx = TIANGAN.indexOf(monthPillar[0]!);
  const monthBranchIdx = DIZHI.indexOf(monthPillar[1]!);
  const steps: DayunStep[] = [];
  for (let i = 1; i <= 8; i++) {
    const k = direction === '顺' ? i : -i;
    const s = TIANGAN[(monthStemIdx + k + 10) % 10];
    const b = DIZHI[(monthBranchIdx + k + 12) % 12];
    steps.push({ ganzhi: s + b, startAge: startAge + (i - 1) * 10 });
  }
  return { direction, startAge, startAgeNote: note, steps };
}

function getLiunian(birthYear: number): Liunian {
  const get = (y: number) => getYearPillarByLichun(y, 2, 5);
  return {
    lastYear: get(birthYear - 1),
    thisYear: get(birthYear),
    nextYear: get(birthYear + 1),
  };
}

/** 由日柱干支推空亡地支（旬空） */
function getKongwang(dayPillar: string): [string, string] {
  const idx = getGanZhiIndex(dayPillar[0]!, dayPillar[1]!);
  const xunStart = Math.floor(idx / 10) * 10;
  const k1 = DIZHI[(xunStart + 10) % 12]!;
  const k2 = DIZHI[(xunStart + 11) % 12]!;
  return [k1, k2];
}

/** 每柱是否坐空（地支在空亡内） */
function getKongwangPerPillar(pillars: BaziPillars, kongwang: [string, string]): BaziPillars {
  const [k1, k2] = kongwang;
  const f = (z: string) => (z === k1 || z === k2 ? '空' : '—');
  return {
    year: f(pillars.year[1]!),
    month: f(pillars.month[1]!),
    day: f(pillars.day[1]!),
    hour: f(pillars.hour[1]!),
  };
}

/** 单柱地支所带神煞（日主用于文昌、天乙） */
function getShenshaForBranch(branch: string, dayMaster: string, allBranches: string[]): string[] {
  const list: string[] = [];
  if (['子', '午', '卯', '酉'].includes(branch)) list.push('桃花');
  if (['寅', '申', '巳', '亥'].includes(branch)) list.push('驿马');
  if (['辰', '戌', '丑', '未'].includes(branch)) list.push('华盖');
  const wenchang: Record<string, string> = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯',
  };
  if (branch === (wenchang[dayMaster] || '')) list.push('文昌');
  const tianyi: Record<string, string> = {
    '甲': '丑未', '乙': '子申', '丙': '酉亥', '丁': '酉亥', '戊': '丑未', '己': '子申', '庚': '丑未', '辛': '寅午', '壬': '卯巳', '癸': '卯巳',
  };
  const yi = tianyi[dayMaster] || '';
  if (yi && yi.includes(branch)) list.push('天乙贵人');
  if (['寅', '午', '戌'].includes(branch) && allBranches.filter((b) => ['寅', '午', '戌'].includes(b!)).length >= 2) list.push('将星');
  return list;
}

function getShensha(pillars: BaziPillars, dayMaster: string): string[] {
  const branches = [pillars.year[1], pillars.month[1], pillars.day[1], pillars.hour[1]];
  const set = new Set<string>();
  (['year', 'month', 'day', 'hour'] as const).forEach((key) => {
    getShenshaForBranch(pillars[key][1]!, dayMaster, branches).forEach((s) => set.add(s));
  });
  return Array.from(set);
}

/** 每柱神煞（年月日时各柱分别列出） */
function getShenshaPerPillar(pillars: BaziPillars, dayMaster: string): BaziPillars {
  const branches = [pillars.year[1], pillars.month[1], pillars.day[1], pillars.hour[1]];
  const join = (arr: string[]) => arr.length ? arr.join('、') : '—';
  return {
    year: join(getShenshaForBranch(pillars.year[1]!, dayMaster, branches)),
    month: join(getShenshaForBranch(pillars.month[1]!, dayMaster, branches)),
    day: join(getShenshaForBranch(pillars.day[1]!, dayMaster, branches)),
    hour: join(getShenshaForBranch(pillars.hour[1]!, dayMaster, branches)),
  };
}

/** 简单格局判断 */
function getGeju(
  wuxing: BaziWuxing,
  dayMasterStem: string,
  pillars: BaziPillars
): GejuType {
  const entries = Object.entries(wuxing).filter(([, v]) => typeof v === 'number') as [string, number][];
  entries.sort((a, b) => (b[1] as number) - (a[1] as number));
  const strong = entries[0]?.[1] as number ?? 0;
  const weak = entries[entries.length - 1]?.[1] as number ?? 0;
  const dayWx = STEM_WUXING[dayMasterStem];
  const dayPct = Number(wuxing[dayWx as keyof BaziWuxing]) || 0;
  if (strong >= 75 && entries[0]?.[0] === dayWx) return '专旺';
  if (weak >= 60 && entries[entries.length - 1]?.[0] !== dayWx) return '从强';
  if (dayPct <= 15 && strong >= 50) return '从弱';
  return '正格';
}

/** 喜忌：正格按抑强扶弱；从格/专旺按顺势 */
function getXiyongJishen(
  wuxing: BaziWuxing,
  geju: GejuType,
  dayMaster: string
): { xiyongshen: string; jishen: string } {
  const dayWx = STEM_WUXING[dayMaster];
  const entries = Object.entries(wuxing).filter(([, v]) => typeof v === 'number') as [string, number][];
  entries.sort((a, b) => (b[1] as number) - (a[1] as number));
  const strong = entries[0]?.[0];
  const weak = entries[entries.length - 1]?.[0];
  const wxName: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
  if (geju === '专旺' || geju === '从强') {
    const use = strong ? wxName[strong] : '—';
    return { xiyongshen: use + '（顺势）', jishen: weak ? wxName[weak] : '—' };
  }
  if (geju === '从弱') {
    const use = strong ? wxName[strong] : '—';
    return { xiyongshen: use + '（从势）', jishen: dayWx ? wxName[dayWx] : '—' };
  }
  const xiyong = { wood: '水金', fire: '水金', earth: '木水', metal: '火木', water: '火土' }[strong!] ?? '平衡';
  const jishen = { wood: '土金', fire: '水金', earth: '木水', metal: '木火', water: '火土' }[strong!] ?? '—';
  return { xiyongshen: xiyong, jishen };
}

export interface DivinationInfoForBazi {
  year: string;
  month: string;
  day: string;
  hour: string;
  /** 出生钟点（0-23），用于真太阳时 */
  birthHour?: number;
  birthMinute?: number;
  /** 经度，用于真太阳时（东经为正）；也可用 lng */
  longitude?: number;
  lng?: number;
  /** 是否使用真太阳时 */
  useSolarTime?: boolean;
  /** 性别：大运顺逆 */
  gender?: 'male' | 'female';
  region?: string;
  name?: string;
}

export function computeLocalBazi(info: DivinationInfoForBazi): BaziApiResult {
  const y = Number(info.year);
  const m = Number(info.month);
  const d = Number(info.day);
  const longitude = info.longitude ?? info.lng;
  const useSolar = !!info.useSolarTime && longitude != null;
  const hour = info.birthHour ?? 12;
  const minute = info.birthMinute ?? 0;
  const hourIdx = useSolar
    ? getTrueSolarHourIndex(hour, minute, longitude, true)
    : (() => {
        const h = (info.hour || '12').trim();
        const num = h === '' ? 6 : Math.min(12, Math.max(0, parseInt(h, 10)));
        return num >= 0 && num <= 11 ? num : 6;
      })();
  const gender: 'male' | 'female' = info.gender === 'female' ? 'female' : 'male';

  const year = getYearPillarByLichun(y, m, d);
  const month = getMonthPillarByJieqi(y, m, d);
  const monthBranchIndex = getMonthByJieqi(y, m, d);
  const day = getDayPillar(y, m, d);
  const hourPillar = getHourPillar(y, m, d, hourIdx);

  const pillars: BaziPillars = { year, month, day, hour: hourPillar };
  const dayMaster = getDayMaster(y, m, d);
  const wuxing = countWuxing(pillars, monthBranchIndex);
  const geju = getGeju(wuxing, dayMaster, pillars);
  const { xiyongshen, jishen } = getXiyongJishen(wuxing, geju, dayMaster);
  const entries = Object.entries(wuxing).filter(([, v]) => typeof v === 'number') as [string, number][];
  entries.sort((a, b) => (b[1] as number) - (a[1] as number));
  const strong = entries[0]?.[0] ?? 'earth';
  const weak = entries[entries.length - 1]?.[0] ?? 'water';

  const cangganPerPillar: BaziPillars = {
    year: getCanggan(pillars.year[1]!),
    month: getCanggan(pillars.month[1]!),
    day: getCanggan(pillars.day[1]!),
    hour: getCanggan(pillars.hour[1]!),
  };
  const shishenPerPillar: BaziPillars = {
    year: getShiShenForStem(dayMaster, pillars.year[0]!),
    month: getShiShenForStem(dayMaster, pillars.month[0]!),
    day: getShiShenForStem(dayMaster, pillars.day[0]!),
    hour: getShiShenForStem(dayMaster, pillars.hour[0]!),
  };
  const nayinPerPillar: BaziPillars = {
    year: getNayin(pillars.year),
    month: getNayin(pillars.month),
    day: getNayin(pillars.day),
    hour: getNayin(pillars.hour),
  };

  const yearStemIdx = TIANGAN.indexOf(pillars.year[0]!);
  const dayun = getDayun(month, yearStemIdx, gender, y, m, d);
  const liunian = getLiunian(y);
  const shensha = getShensha(pillars, dayMaster);
  const shenshaPerPillar = getShenshaPerPillar(pillars, dayMaster);
  const kongwang = getKongwang(day);
  const kongwangPerPillar = getKongwangPerPillar(pillars, kongwang);

  const summary = `四柱 ${year} ${month} ${day} ${pillars.hour}，日主${dayMaster}。${geju ? `格局${geju}。` : ''}命盘${strong}旺${weak}弱，宜补${weak}以达平衡。命理结果仅供参考，请勿迷信。`;

  return {
    pillars,
    wuxing,
    dayMaster,
    xiyongshen,
    jishen,
    summary,
    nayin: '依四柱纳音',
    nayinPerPillar,
    shishen: '依日主与四柱',
    canggan: '依地支',
    cangganPerPillar,
    shishenPerPillar,
    dayun,
    liunian,
    shensha,
    shenshaPerPillar,
    kongwang,
    kongwangPerPillar,
    geju,
    monthBranchIndex,
  };
}
