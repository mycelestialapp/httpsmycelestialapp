/**
 * 数字命理 · 核心数字结果与字母映射
 * 用于从姓名 + 出生日期计算生命路径数、命运数、灵魂驱动数等
 */

// 核心数字结果
export interface NumerologyNumbers {
  lifePath: number; // 生命路径数
  expression: number; // 命运数（Expression）
  soulUrge: number; // 灵魂驱动数
  personality: number; // 个性数
  maturity: number; // 成熟数（使命数）
  birthday: number; // 生日数：出生日归约
  potential: number; // 潜能数：生命路径 + 灵魂驱动 归约
  interpersonal: number; // 人际数：命运数 + 个性数 归约
  isMasterLifePath: boolean;
  isMasterExpression: boolean;
}

// 字母-数字映射表（毕达哥拉斯/ Pythagorean）
export const letterMap: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
  // 支持中文拼音首字母？暂不处理，假设输入英文名
};

// 元音字母集合（用于灵魂驱动数 Soul Urge）
export const vowels = new Set<string>(["A", "E", "I", "O", "U"]);

// ---------------------------------------------------------------------------
// 计算逻辑
// ---------------------------------------------------------------------------

/** 将数字各位相加（一次） */
const sumDigits = (num: number): number => {
  return num
    .toString()
    .split("")
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
};

/** 归约到个位数或大师数 11/22/33 */
const reduceToMasterOrSingle = (num: number): { value: number; isMaster: boolean } => {
  if (!Number.isFinite(num) || num <= 0) {
    return { value: 1, isMaster: false };
  }
  if ([11, 22, 33].includes(num)) {
    return { value: num, isMaster: true };
  }
  if (num < 10) {
    return { value: num, isMaster: false };
  }
  return reduceToMasterOrSingle(sumDigits(num));
};

/** 常用汉字 → 拼音首字母（A-Z），用于中文名换算；未收录字用编码生成一字母以保持稳定 */
const PINYIN_INITIAL: Record<string, string> = {
  王: "W", 李: "L", 张: "Z", 刘: "L", 陈: "C", 杨: "Y", 黄: "H", 赵: "Z", 周: "Z", 吴: "W",
  徐: "X", 孙: "S", 马: "M", 朱: "Z", 胡: "H", 郭: "G", 何: "H", 高: "G", 林: "L", 罗: "L",
  郑: "Z", 梁: "L", 谢: "X", 宋: "S", 唐: "T", 许: "X", 韩: "H", 冯: "F", 邓: "D", 曹: "C",
  彭: "P", 曾: "Z", 肖: "X", 田: "T", 董: "D", 袁: "Y", 潘: "P", 于: "Y", 蒋: "J", 蔡: "C",
  余: "Y", 杜: "D", 叶: "Y", 程: "C", 苏: "S", 魏: "W", 吕: "L", 丁: "D", 任: "R", 沈: "S",
  姚: "Y", 卢: "L", 姜: "J", 崔: "C", 钟: "Z", 谭: "T", 陆: "L", 汪: "W", 范: "F", 金: "J",
  小: "X", 明: "M", 伟: "W", 芳: "F", 静: "J", 丽: "L", 强: "Q", 磊: "L", 军: "J", 洋: "Y",
  勇: "Y", 艳: "Y", 杰: "J", 娟: "J", 涛: "T", 敏: "M", 超: "C", 秀: "X", 霞: "X", 平: "P",
  刚: "G", 华: "H", 英: "Y", 慧: "H", 飞: "F", 鑫: "X", 波: "B", 斌: "B", 辉: "H", 娜: "N",
  琳: "L", 宇: "Y", 婷: "T", 龙: "L", 红: "H", 建: "J", 云: "Y", 峰: "F", 玲: "L", 燕: "Y",
};

/**
 * 将姓名转为用于计算的字母串：英文名去非字母后大写；中文名按拼音首字母表+未收录字编码生成字母。
 * 用于与主流「拼音首字母」法对齐；未收录字用 (charCode % 26)+65 生成一字母。
 */
export function nameToLetters(name: string): string {
  const t = (name || "").trim();
  if (!t) return "";
  const enOnly = t.replace(/[^A-Za-z]/g, "");
  if (enOnly.length > 0) return enOnly.toUpperCase();
  let out = "";
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (PINYIN_INITIAL[c]) out += PINYIN_INITIAL[c];
    else out += String.fromCharCode(65 + (t.charCodeAt(i) % 26));
  }
  return out;
}

/** 是否为「主要按中文名换算」（无英文字母或字母很少） */
export function isNameLikelyChinese(name: string): boolean {
  const t = (name || "").trim();
  if (!t.length) return false;
  const enCount = (t.match(/[A-Za-z]/g) || []).length;
  return enCount < t.length / 2;
}

/** 非英文姓名（如中文）时：先尝试拼音首字母转字母再算；若无可算字母则用字符编码归约回退 */
const fallbackNumberFromName = (name: string): number => {
  if (!name || !name.trim()) return 1;
  const letters = nameToLetters(name);
  if (letters.length > 0) {
    let sum = 0;
    for (const ch of letters) {
      sum += letterMap[ch] ?? 0;
    }
    const { value } = reduceToMasterOrSingle(sum);
    return value;
  }
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  const { value } = reduceToMasterOrSingle(sum);
  return value;
};

/** 生命路径数计算方式：主流多为「年月日分别各位相加再归约」；另可选「年月日先加总再归约」 */
export type LifePathMethod = 'sumDigits' | 'fullSum';

/** 计算生命路径数（基于出生日期；可选算法） */
export const calculateLifePath = (
  date: Date,
  method: LifePathMethod = 'sumDigits'
): { value: number; isMaster: boolean } => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (method === 'fullSum') {
    return reduceToMasterOrSingle(year + month + day);
  }
  const sum = sumDigits(year) + sumDigits(month) + sumDigits(day);
  return reduceToMasterOrSingle(sum);
};

/** 取姓名对应的字母串（英文名去非字母；中文名用拼音首字母） */
function getLettersForName(name: string): string {
  const en = name.toUpperCase().replace(/[^A-Z]/g, "");
  if (en.length > 0) return en;
  return nameToLetters(name);
}

/** 计算命运数（基于姓名全名；中文名按拼音首字母表+未收录字编码换算） */
export const calculateExpression = (name: string): { value: number; isMaster: boolean } => {
  const cleaned = getLettersForName(name);
  if (cleaned.length === 0) {
    const fallback = fallbackNumberFromName(name);
    return { value: fallback, isMaster: [11, 22, 33].includes(fallback) };
  }
  let sum = 0;
  for (const ch of cleaned) {
    sum += letterMap[ch] ?? 0;
  }
  return reduceToMasterOrSingle(sum);
};

/** 计算灵魂驱动数（姓名中的元音；中文名用拼音首字母后按元音取） */
export const calculateSoulUrge = (name: string): { value: number; isMaster: boolean } => {
  const cleaned = getLettersForName(name);
  if (cleaned.length === 0) {
    const fallback = fallbackNumberFromName(name.trim() || "无");
    return { value: fallback, isMaster: [11, 22, 33].includes(fallback) };
  }
  let sum = 0;
  for (const ch of cleaned) {
    if (vowels.has(ch)) {
      sum += letterMap[ch] ?? 0;
    }
  }
  const res = reduceToMasterOrSingle(sum);
  if (res.value === 0) {
    const fallback = fallbackNumberFromName(name.trim() || "无");
    return { value: fallback, isMaster: [11, 22, 33].includes(fallback) };
  }
  return res;
};

/** 计算个性数（姓名中的辅音；中文名用拼音首字母后按辅音取） */
export const calculatePersonality = (name: string): { value: number; isMaster: boolean } => {
  const cleaned = getLettersForName(name);
  if (cleaned.length === 0) {
    const fallback = fallbackNumberFromName(name.trim() || "无");
    return { value: (fallback % 9) || 9, isMaster: false };
  }
  let sum = 0;
  for (const ch of cleaned) {
    if (!vowels.has(ch)) {
      sum += letterMap[ch] ?? 0;
    }
  }
  const res = reduceToMasterOrSingle(sum);
  if (res.value === 0) {
    const fallback = fallbackNumberFromName(name.trim() || "无");
    return { value: (fallback % 9) || 9, isMaster: false };
  }
  return res;
};

/** 计算成熟数/使命数 = 生命路径 + 命运数（归约） */
export const calculateMaturity = (
  lifePath: number,
  expression: number
): { value: number; isMaster: boolean } => {
  return reduceToMasterOrSingle(lifePath + expression);
};

/** 生日数：出生日归约到个位或大师数（主流单独展示） */
export const calculateBirthday = (birthDate: Date): number => {
  const day = birthDate.getDate();
  return reduceToMasterOrSingle(day).value;
};

/** 潜能数 = 生命路径 + 灵魂驱动 归约（天赋与内在潜能） */
export const calculatePotential = (lifePath: number, soulUrge: number): number =>
  reduceToMasterOrSingle(lifePath + soulUrge).value;

/** 人际数 = 命运数 + 个性数 归约（对外关系与社交倾向） */
export const calculateInterpersonal = (expression: number, personality: number): number =>
  reduceToMasterOrSingle(expression + personality).value;

/** 流年数：基于出生月日 + 目标年份，归约到个位或大师数 */
export const calculatePersonalYear = (
  birthDate: Date,
  targetYear: number = new Date().getFullYear()
): number => {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const sum = targetYear + month + day;
  return reduceToMasterOrSingle(sum).value;
};

/** 个人月数：流年数 + 目标月份，归约 */
export function calculatePersonalMonth(
  birthDate: Date,
  targetYear: number,
  targetMonth: number
): number {
  const yearNum = calculatePersonalYear(birthDate, targetYear);
  return reduceToMasterOrSingle(yearNum + targetMonth).value;
}

/** 个人日数：流年数 + 目标月 + 目标日，归约 */
export function calculatePersonalDay(
  birthDate: Date,
  targetYear: number,
  targetMonth: number,
  targetDay: number
): number {
  const yearNum = calculatePersonalYear(birthDate, targetYear);
  return reduceToMasterOrSingle(yearNum + targetMonth + targetDay).value;
}

/** 流年数计算过程（用于页面展示：公式 + 化简步骤） */
export const getPersonalYearSteps = (
  birthDate: Date,
  targetYear: number
): { formula: string; steps: string; result: number } => {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const sum = targetYear + month + day;
  const result = reduceToMasterOrSingle(sum).value;
  const parts: string[] = [];
  let n = sum;
  while (n >= 10 && ![11, 22, 33].includes(n)) {
    const next = sumDigits(n);
    const expr = String(n).split("").join("+");
    parts.push(`${expr} = ${next}`);
    n = next;
  }
  const steps = parts.length ? `${sum} → ${parts.join(" → ")}` : "";
  return {
    formula: `${targetYear} + ${month} + ${day} = ${sum}`,
    steps,
    result,
  };
};

/** 两人生命路径数配对简述（1–9 及 11/22/33 取根后 1–9 对照） */
export function getNumerologyCompatibility(lifePathA: number, lifePathB: number): string {
  const root = (n: number) => (n <= 9 ? n : n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : (n % 9) || 9);
  const a = root(lifePathA);
  const b = root(lifePathB);
  if (a === b) return "同频共振，易共鸣也需注意各自空间，避免过度依赖。";
  const pair = [a, b].sort((x, y) => x - y).join("-");
  const map: Record<string, string> = {
    "1-2": "1 引领、2 配合，互补型；需尊重 2 的敏感与节奏。",
    "1-3": "创意与表达结合，适合共同创造；注意 1 的独断与 3 的散漫。",
    "1-4": "1 开拓、4 稳固，可成事；需在变动与规则间取得平衡。",
    "1-5": "都爱自由与变化，易共鸣；需落实计划避免空转。",
    "1-6": "1 独立、6 顾家，互补；6 的付出需被看见。",
    "1-7": "理性与独立结合，适合深度交流；避免过于疏离。",
    "1-8": "目标感强，可共事；注意权力与主导权的分配。",
    "1-9": "1 专注、9 包容，可互相学习；9 需不被 1 忽视。",
    "2-3": "感性搭配创意，和谐；适合合作与情感表达。",
    "2-4": "2 灵活、4 稳定，需在节奏上磨合。",
    "2-5": "都重感受与变化，易相处；需共同落实细节。",
    "2-6": "都重关系与责任，契合度高；注意过度付出。",
    "2-7": "2 需要陪伴、7 需要独处，需沟通空间需求。",
    "2-8": "2 柔和、8 强势，可互补；8 需给予 2 安全感。",
    "2-9": "都具包容与理想主义，易共鸣。",
    "3-4": "3 发散、4 收敛，需在计划与随性间平衡。",
    "3-5": "都爱表达与自由，相处轻松；需共同面对现实。",
    "3-6": "3 活泼、6 负责，可互补；6 需接受 3 的活泼。",
    "3-7": "3 外放、7 内敛，可深度与广度兼具。",
    "3-8": "都有表现欲与目标感；注意主导权。",
    "3-9": "都具理想与包容，适合共同愿景。",
    "4-5": "4 求稳、5 求变，需互相尊重节奏。",
    "4-6": "都重责任与家庭，契合；适合长期关系。",
    "4-7": "都偏理性与结构，可深度合作。",
    "4-8": "都重事业与成果，目标一致；注意控制欲。",
    "4-9": "4 务实、9 理想，可互相补足。",
    "5-6": "5 好动、6 顾家，需在自由与责任间平衡。",
    "5-7": "都爱探索与深度，易有共鸣。",
    "5-8": "都爱变化与成就；需落实与专注。",
    "5-9": "都具开放与包容，相处自在。",
    "6-7": "6 重情、7 重理，可互补；需沟通表达方式。",
    "6-8": "6 付出、8 掌控，需平衡付出与尊重。",
    "6-9": "都重关怀与理想，契合度高。",
    "7-8": "都重成就与深度；7 内敛、8 外显。",
    "7-9": "7 理性、9 包容，可互相学习。",
    "8-9": "8 务实、9 理想，可共同成就大目标。",
  };
  return map[pair] ?? "数字能量不同，相处重在沟通与尊重差异。";
}

/** 今日数字：当日年月日各位相加归约，用于「今日幸运数/色/一句话」 */
export function getDailyNumerologyNumber(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const sum = sumDigits(y) + sumDigits(m) + sumDigits(d);
  return reduceToMasterOrSingle(sum).value;
}

// ---------------------------------------------------------------------------
// 高峰数（Pinnacle）、挑战数、业力数（西方体系 · 大师级）
// ---------------------------------------------------------------------------

export interface PinnaclePeriod {
  index: number;
  number: number;
  ageStart: number;
  ageEnd: number;
  label: string;
  masterNote: string;
}

/** 四大高峰数（Pinnacle）：人生四阶段的主题数，西方主流体系 */
export function getPinnaclePeriods(birthDate: Date): PinnaclePeriod[] {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();
  const yReduced = sumDigits(year);
  const m = reduceToMasterOrSingle(month).value;
  const d = reduceToMasterOrSingle(day).value;
  const y = reduceToMasterOrSingle(yReduced).value;

  const first = reduceToMasterOrSingle(m + d).value;
  const second = reduceToMasterOrSingle(d + y).value;
  const third = reduceToMasterOrSingle(first + second).value;
  const fourth = reduceToMasterOrSingle(m + y).value;

  const baseAge = 36;
  const periodYears = 9;
  return [
    { index: 1, number: first, ageStart: 0, ageEnd: baseAge - 1, label: "第一高峰", masterNote: pinnacleMasterNotes[first] ?? `此阶段主「奠基」：天赋初显，宜扎根、试错、确立方向。数 ${first} 的能量将贯穿这段岁月。` },
    { index: 2, number: second, ageStart: baseAge, ageEnd: baseAge + periodYears - 1, label: "第二高峰", masterNote: pinnacleMasterNotes[second] ?? `此阶段主「拓展」：承上启下，宜深耕、建关系、扩大影响。数 ${second} 的能量主导这九年。` },
    { index: 3, number: third, ageStart: baseAge + periodYears, ageEnd: baseAge + periodYears * 2 - 1, label: "第三高峰", masterNote: pinnacleMasterNotes[third] ?? `此阶段主「收成」：前半生积累在此兑现，宜整合、传承、收尾。数 ${third} 的能量在此显化。` },
    { index: 4, number: fourth, ageStart: baseAge + periodYears * 2, ageEnd: 120, label: "第四高峰", masterNote: pinnacleMasterNotes[fourth] ?? `此阶段主「智慧」：阅历化为从容，宜传道、放手、活出本质。数 ${fourth} 的能量伴随晚年。` },
  ];
}

const pinnacleMasterNotes: Record<number, string> = {
  1: "第一高峰遇 1：此阶段主题是「独立与开创」。你被推上舞台中央，宜率先行动、承担责任；忌等待与依赖。大师言：先迈步的人，才有资格说路。",
  2: "第一高峰遇 2：此阶段主题是「合作与敏感」。关系与平衡是功课，宜倾听、斡旋、建立信任；忌独断与对抗。大师言：桥要两端落地，中间才走得人。",
  3: "第一高峰遇 3：此阶段主题是「表达与创造」。才华外显，宜输出、连接、让气氛流动；忌散漫无果。大师言：三角撑起一面，选一句说进人心里。",
  4: "第一高峰遇 4：此阶段主题是「秩序与建设」。打地基的年纪，宜规划、执行、稳扎稳打；忌浮躁与失控。大师言：四角落地，才撑得起后来的天。",
  5: "第一高峰遇 5：此阶段主题是「变动与自由」。变化多端，宜适应、尝试、保持弹性；忌以自由之名逃避责任。大师言：动中有根，才不是漂泊。",
  6: "第一高峰遇 6：此阶段主题是「责任与归属」。家与关系为重，宜付出、平衡、划清边界；忌无底线牺牲。大师言：先问「我还在吗」，再给。",
  7: "第一高峰遇 7：此阶段主题是「内省与真理」。独行中的光，宜学习、静思、厘清；忌与世隔绝。大师言：在「没有答案」里待一会儿，智慧自现。",
  8: "第一高峰遇 8：此阶段主题是「成就与资源」。驾驭力显现，宜整合、决策、敢放手；忌唯利是图。大师言：权为托举，不为压制。",
  9: "第一高峰遇 9：此阶段主题是「完成与放手」。收官与包容，宜收尾、交还、接受局限；忌救世主情结。大师言：该放手时说「到这里」，不带遗憾。",
};

/** 挑战数：出生月与日的绝对差归约，主一生需反复面对的课题 */
export function getChallengeNumber(birthDate: Date): { value: number; masterNote: string } {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const diff = Math.abs(month - day) || 1;
  const value = reduceToMasterOrSingle(diff).value;
  const notes: Record<number, string> = {
    1: "挑战数 1：一生课题在「独立与协作」之间——既要敢为先，也要学会把灯交给别人。大师言：独行不孤，才是真 1。",
    2: "挑战数 2：一生课题在「平衡与边界」——敏感是天赋，过度迁就则是耗竭。大师言：两端都落地，中间才有桥。",
    3: "挑战数 3：一生课题在「表达与收敛」——才华外显易散，须择一深耕留代表作。大师言：火花聚成火把，才能照路。",
    4: "挑战数 4：一生课题在「秩序与弹性」——稳中须留一扇窗，根深而枝可动。大师言：控制不是建设，接纳变数才是。",
    5: "挑战数 5：一生课题在「流动与锚定」——变中守定，厘清「变了之后什么必须留下」。大师言：自由不是逃责之名。",
    6: "挑战数 6：一生课题在「付出与自保」——有边界的爱才能长久。大师言：庙门可开，也有权关门守夜。",
    7: "挑战数 7：一生课题在「独行与联结」——智慧须可被理解、可传递。大师言：敢在黑暗中点灯，也敢把灯交给路人。",
    8: "挑战数 8：一生课题在「成就与因果」——结果与过程、利益与人心并重。大师言：短视损信，权为托举。",
    9: "挑战数 9：一生课题在「圆满与局限」——接受己与人的局限，该交还时交还。大师言：爱到可以放手，才是博爱。",
  };
  return { value, masterNote: notes[value] ?? `挑战数 ${value}：此数对应的人生课题将反复出现，宜在对应领域有意识修行。` };
}

/** 业力/缺数：出生日期归约后缺哪些 1-9（此生可补的功课）；若计算链中出现 13/14/16/19 为业力数 */
export function getKarmicNumbers(birthDate: Date, lifePath: number): { missing: number[]; karmicDebt: number[]; masterNote: string } {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();
  const yDigits = year.toString().split("").map(Number);
  const allReduced = new Set<number>();
  [month, day].forEach((n) => allReduced.add(reduceToMasterOrSingle(n).value));
  yDigits.forEach((n) => allReduced.add(reduceToMasterOrSingle(n).value));
  allReduced.add(reduceToMasterOrSingle(lifePath).value);
  const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !allReduced.has(n));
  const karmicDebt: number[] = [];
  [month, day, month + day, sumDigits(year)].forEach((n) => {
    if ([13, 14, 16, 19].includes(n)) karmicDebt.push(n);
  });
  const masterNote =
    karmicDebt.length > 0
      ? `命盘出现业力数 ${karmicDebt.join("、")}：西方体系称「前世未竟功课」，此生宜在对应领域有意识修通——直面即化解。大师言：业力是未完成的算式，补全它，数字就归位。`
      : missing.length > 0
        ? `命盘缺数 ${missing.join("、")}：此生可在此类能量上多补课——缺则求，补则衡。大师言：缺数不是缺陷，是功课清单。`
        : "命盘数字分布均衡，无显著业力或缺数；顺势修行即可。";
  return { missing, karmicDebt, masterNote };
}

// ---------------------------------------------------------------------------
// 九宫格连线（12 条性格线 · 事业/感情/思维等）大师解读
// 宫位 1-9 对应格位： 1 2 3 / 4 5 6 / 7 8 9
// ---------------------------------------------------------------------------

export const NINE_GRID_LINES: { id: string; name: string; cells: number[]; masterNote: string }[] = [
  { id: "row1", name: "思维·创意线", cells: [1, 2, 3], masterNote: "1-2-3 连线：思维敏捷、创意外显，擅表达与沟通。大师言：三角撑起一面，选一句说进人心里，才不枉此线。" },
  { id: "row2", name: "执行·行动线", cells: [4, 5, 6], masterNote: "4-5-6 连线：行动力与责任感并具，能落实也能应变。大师言：中间这一行是「从想到做」的桥梁，踏稳即通。" },
  { id: "row3", name: "智慧·灵性线", cells: [7, 8, 9], masterNote: "7-8-9 连线：偏内省与成就，智慧与格局在此。大师言：下三格是根，根深则枝可触天。" },
  { id: "col1", name: "务实·身体线", cells: [1, 4, 7], masterNote: "1-4-7 连线：务实、落地、能独当一面。大师言：左线为骨，撑住肉身与行动。" },
  { id: "col2", name: "情感·平衡线", cells: [2, 5, 8], masterNote: "2-5-8 连线：情感与资源平衡，善协调与驾驭。大师言：中线为脉，情与利皆从此过。" },
  { id: "col3", name: "精神·理想线", cells: [3, 6, 9], masterNote: "3-6-9 连线：精神与理想色彩浓，重表达也重归宿。大师言：右线为魂，理想不落空才不枉。" },
  { id: "diag1", name: "决心线", cells: [1, 5, 9], masterNote: "1-5-9 对角线：从开创到完成，一气贯通。大师言：此线主决心与完整，起头与收尾皆在你。" },
  { id: "diag2", name: "灵性线", cells: [3, 5, 7], masterNote: "3-5-7 对角线：表达、变动、内省交汇。大师言：此线主灵性觉醒，三角合一即通透。" },
  { id: "sub1", name: "情感·家庭线", cells: [4, 2, 6], masterNote: "4-2-6 斜念：稳定、平衡、责任。大师言：家与关系之线，稳中求进。" },
  { id: "sub2", name: "事业·成就线", cells: [8, 5, 2], masterNote: "8-5-2 斜念：资源、变动、合作。大师言：事业成于人与势的合拍。" },
  { id: "sub3", name: "内在驱动线", cells: [7, 5, 3], masterNote: "7-5-3 斜念：内省、流动、表达。大师言：内在驱动外显为创造。" },
  { id: "sub4", name: "传承线", cells: [1, 6, 8], masterNote: "1-6-8 斜念：开创、责任、成就。大师言：从个人到家族到传承，此线贯之。" },
];

function rootForLine(n: number): number {
  if (n <= 9) return n;
  if (n === 11) return 2;
  if (n === 22) return 4;
  if (n === 33) return 6;
  return n % 9 || 9;
}

/** 衍生数（生日/潜能/人际/使命）大师点睛·一句概括 */
export const DERIVED_NUMBER_LABELS: Record<string, string> = {
  birthday: "生日数",
  potential: "潜能数",
  interpersonal: "人际数",
  maturity: "使命数",
};

export function getDerivedNumberMasterNote(type: "birthday" | "potential" | "interpersonal" | "maturity", value: number): string {
  const interp = numberInterpretations[value as keyof typeof numberInterpretations];
  const notes: Record<string, string> = {
    birthday: `生日数 ${value}：出生日归约，主「天赋底色」与日常倾向。${interp?.masterNote ?? ""}`,
    potential: `潜能数 ${value}（生命路径+灵魂驱动）：内在潜能与可开发的天赋。${interp?.masterNote ?? ""}`,
    interpersonal: `人际数 ${value}（命运数+个性数）：对外关系与社交风格。${interp?.masterNote ?? ""}`,
    maturity: `使命数 ${value}（生命路径+命运数）：成熟期与人生使命方向。${interp?.masterNote ?? ""}`,
  };
  return notes[type] ?? "";
}

/** 根据用户五数（+ 生日/潜能/人际）判断激活的连线，返回带大师解读的列表 */
export function getActiveGridLines(nums: NumerologyNumbers): { id: string; name: string; cells: number[]; masterNote: string; count: number }[] {
  const set = new Set([
    rootForLine(nums.lifePath),
    rootForLine(nums.expression),
    rootForLine(nums.soulUrge),
    rootForLine(nums.personality),
    rootForLine(nums.maturity),
    rootForLine(nums.birthday),
    rootForLine(nums.potential),
    rootForLine(nums.interpersonal),
  ]);
  return NINE_GRID_LINES.map((line) => {
    const count = line.cells.filter((c) => set.has(c)).length;
    return { ...line, count };
  }).filter((l) => l.count >= 2).sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------------------
// 生命密码三角图（国内常见）：年月日三层，逐层相加归约
// ---------------------------------------------------------------------------

export interface LifePathTriangle {
  row1: [number, number, number]; // 日、月、年（归约）
  row2: [number, number]; // 日+月、月+年 归约
  row3: [number]; // 顶点
  masterNote: string;
}

export function getLifePathTriangle(birthDate: Date): LifePathTriangle {
  const day = reduceToMasterOrSingle(birthDate.getDate()).value;
  const month = reduceToMasterOrSingle(birthDate.getMonth() + 1).value;
  const yearReduced = birthDate.getFullYear();
  const year = reduceToMasterOrSingle(sumDigits(yearReduced)).value;

  const left = reduceToMasterOrSingle(day + month).value;
  const right = reduceToMasterOrSingle(month + year).value;
  const top = reduceToMasterOrSingle(left + right).value;

  const masterNote =
    top >= 7
      ? "三角顶点数偏大（7-9 或大师数）：命带「收尾与格局」之气，后半生更显；早年宜积淀，不争一时。大师言：顶在上，根在下，先扎根再触天。"
      : top <= 3
        ? "三角顶点数偏小（1-3）：命带「开创与表达」之气，早年即显；宜早动、早发声，忌拖延。大师言：三角从下往上长，起点即决定走向。"
        : "三角顶点居中（4-6）：命带「平衡与执行」之气，一生稳中求进；宜在秩序与弹性之间取中。大师言：中道不是平庸，是可持续。";

  return {
    row1: [day, month, year],
    row2: [left, right],
    row3: [top],
    masterNote,
  };
}

/** 主函数：根据姓名与出生日期计算所有核心数字；可选生命路径算法 */
export const calculateAllNumbers = (
  name: string,
  birthDate: Date,
  lifePathMethod: LifePathMethod = 'sumDigits'
): NumerologyNumbers => {
  const lifePathRes = calculateLifePath(birthDate, lifePathMethod);
  const expressionRes = calculateExpression(name);
  const soulUrgeRes = calculateSoulUrge(name);
  const personalityRes = calculatePersonality(name);
  const maturityRes = calculateMaturity(lifePathRes.value, expressionRes.value);

  return {
    lifePath: lifePathRes.value,
    expression: expressionRes.value,
    soulUrge: soulUrgeRes.value,
    personality: personalityRes.value,
    maturity: maturityRes.value,
    birthday: calculateBirthday(birthDate),
    potential: calculatePotential(lifePathRes.value, soulUrgeRes.value),
    interpersonal: calculateInterpersonal(expressionRes.value, personalityRes.value),
    isMasterLifePath: lifePathRes.isMaster,
    isMasterExpression: expressionRes.isMaster,
  };
};

// ---------------------------------------------------------------------------
// 数字解读文案（用于展示生命路径/命运数等）
// ---------------------------------------------------------------------------

export interface NumberInterpretation {
  number: number;
  title: string;
  core: string;
  challenge: string;
  career: string;
  love: string;
  advice: string;
  color: string;
  symbol: string;
  keywords: string[];
  /** 大师级扩展：有则展示完整九宫板块 */
  lifeStage?: string;
  innerChallenge?: string;
  outerOpportunity?: string;
  relationshipHint?: string;
  careerCreation?: string;
  spiritualGuidance?: string;
  warning?: string;
  dailyMantra?: string;
  /** 神谕版：整段神谕正文，优先展示；有则首屏展示，报告体折叠 */
  oracle?: string;
  /** 大师点睛：一语道破此数本质，首屏或摘要展示 */
  masterNote?: string;
}

export const numberInterpretations: Record<number, NumberInterpretation> = {
  1: {
    number: 1,
    title: "生命路径数 1 · 开创者",
    masterNote: "此数乃万物之始。命带先发之气，贵在「起念即动」；一生之要，不在称王，而在开一扇别人也能通过的门。",
    core: "数 1 为阳性能量之始，主独立、开创与领导。命带此数者意志坚定、不喜依附，能率先将念头化为行动；弱在易孤、易执。修行在：保持主导而不独占，在光芒最亮时学会把灯交出去一刻。",
    challenge: "心法：从「唯我独尊」到「引领共进」。信人、纳谏、关键处放权——固执不是力量，能托举他人才是。",
    career: "宜决策端与开拓型：创业、统管、创意总监、竞技；忌长期屈居执行末节、无话语权之局。",
    love: "要自主也要归属。选能懂你进取心、不压你锋芒的伴侣；在关系里学「适度依赖」与倾听，独而不孤。",
    advice: "今日可起一新事、下一决断；大事当前，先问一人再定——独断非威，纳言方久。",
    color: "gold",
    symbol: "太阳",
    keywords: ["独立", "领导", "开创", "自信"],
    oracle: `你是第一道光落下时，唯一站立的那个身影。

别人在等指令，你在等黎明。

数字1的能量不是「做老大」，而是「先迈出那一步」——在无人敢走的路上，留下第一个脚印。世界不会为孤独者鼓掌，但会记住第一个点灯的人。

你的课题从来不是证明自己有多强，而是学会在光芒最亮时，把灯交给别人握一会儿。

若1的能量失衡，你会活成一座孤岛：四周是海，脚下是王座，却没有人能上岸。真正的开创，是开一扇别人也能通过的门。

今日，可以试：做一件「只有你能起头」的小事，然后主动邀请一个人一起完成。

愿你在独行的路上，始终记得：太阳之所以是太阳，是因为它照见的，从来不止自己。`,
  },
  2: {
    number: 2,
    title: "生命路径数 2 · 协调者",
    masterNote: "此数为阴阳之桥。命带镜心，照见他人却常忘照己；一生之要，不在成全所有人，而在成双时仍认得镜中那张脸是自己。",
    core: "数 2 属阴，主合作、平衡与敏感。命带此数者善倾听、能斡旋、对关系与氛围极敏；弱在过度迁就、把他人置于己上。修行在：建立稳固的自我价值，和谐里不丢立场。",
    challenge: "心法：从「以他人为中心」到「关系中的对等」。会说「不」、能独立决断——讨好换来的不是爱，是耗竭。",
    career: "宜需要共情与双赢的领域：咨询、外交、人资、合伙、客户关系；忌长期单打独斗或纯对抗型环境。",
    love: "要联结也要边界。选能回馈、能尊重你界限的人；付出与接受须对等，单向牺牲终会塌。",
    advice: "今日宜合作、协商、陪伴；若有要事待决，先与一人共议再定，不必独扛。",
    color: "violet",
    symbol: "月亮",
    keywords: ["合作", "敏感", "平衡", "外交"],
    oracle: `你站在两股力量之间，像月亮的某一面——永远朝向光，也永远背着光。

数字2的能量是「镜」：你照见别人的情绪，却常常忘了照见自己。你不是没有立场，你的立场就是让双方都看见对方。

这一年，会有人来倚靠你，也会有人误以为你不需要倚靠。你的课题不是变得更硬，而是学会在柔软的同时，说出「我也需要」。

若2的能量失衡，你会活成一根绷紧的弦：别人的音都从你身上发出，却没有一个音属于你。真正的平衡，是两端都落地，中间才有桥。

今日，可以试：在答应别人之前，先问自己一句——若我拒绝，我会失去什么？若我答应，我会失去什么？

愿你在成双的世界里，依然认得镜中那张脸，是你自己。`,
  },
  3: {
    number: 3,
    title: "生命路径数 3 · 表达者",
    masterNote: "此数为三角之数，三点成面。命带才华外显、语动人心；一生之要，不在说得更多，而在有一句话只有你能说——且你说了。",
    core: "数 3 主创造与表达，才华外显、善沟通、能感染。命带此数者乐观、多才；弱在易散、难久聚一志。修行在：将天赋收束为可交付的果实，在开放与专注之间取中。",
    challenge: "心法：从「多才流于表面」到「择一深耕、留一代表作」。创意须落地为可衡量的产出，畏难与贪多皆为大忌。",
    career: "宜创意与传播：写作、演艺、设计、营销、教育、内容；须设阶段成果以固专注，否则火花散尽无火把。",
    love: "要被看见、被欣赏、被陪伴。善用语言与仪式经营关系；选能回应你情感、共成长的人，并主动说出关键一句。",
    advice: "今日利创作、社交、表达；务必留一段独处或复盘，有出有入才不虚。",
    color: "yellow",
    symbol: "三角",
    keywords: ["创造", "表达", "乐观", "社交"],
    oracle: `你是那个把话说出来的人——在别人沉默时，在场面冷掉时，在需要有人笑的时候。

数字3的能量是「三角」：三个点才能撑起一个面。你擅长连接，擅长表达，擅长让气氛流动。但三角的第四面是空的——那是你留给自己的沉默。

这一年，会有很多声音经过你。你的课题不是说得更多，而是选一句，把它说进 someone 的心里。散落的火花很美，但只有聚成火把，才能照路。

若3的能量失衡，你会活成一场永不落幕的演出：掌声在，你却听不见自己的呼吸。真正的表达，是有一句话，只有你能说，且你说了。

今日，可以试：写下一句你从未对任何人说过的话，不一定要交给谁，但一定要写下来。

愿你的语言，既有光，也有影——那样才立体。`,
  },
  4: {
    number: 4,
    title: "生命路径数 4 · 建造者",
    masterNote: "此数为四方之基。命带秩序与承重之力；一生之要，不在把门越修越厚，而在根深之时，仍留一扇窗让风进来。",
    core: "数 4 为秩序与根基之数，主稳定、结构与执行。命带此数者务实、有条理、善拆解目标为步骤；弱在畏变、易执。修行在：可靠而不僵，在秩序中留出弹性，以建设代控制。",
    challenge: "心法：从「一切须在掌控」到「秩序里容变数」。关键节点能接纳计划外，过度执框架反失转机。",
    career: "宜体系与交付：工程、财务、项目、建筑、运营；忌无规则、频换向之局。担任搭体系、保交付之角最宜。",
    love: "以行动与承诺示爱，要安全感与可预期。稳中须有沟通与一点浪漫，莫让伴侣只感到「可靠」而少「被看见」。",
    advice: "今日按计划推进要事，为突发留一成弹性；遇变先评估再动，不硬扛也不弃守。",
    color: "emerald",
    symbol: "方石",
    keywords: ["稳定", "秩序", "务实", "可靠"],
    oracle: `四角落地，才能撑起一方天地。你是那个在别人还在讨论「要不要」的时候，已经画出图纸的人。

数字4的能量是「地基」：别人看见的是楼，你看见的是承重墙。秩序与规则不是束缚，是你给 chaos 画的边界——没有边界，就没有安全。

这一年，会有人嫌你太稳、太慢、太较真。你的课题不是变「灵活」到失去自己，而是在稳固之中，留一扇窗——让风偶尔吹进来。

若4的能量失衡，你会活成一座堡垒：门越来越厚，窗越来越少，最后连你自己都忘了外面还有天空。真正的稳固，是根扎得深，枝仍可动。

今日，可以试：选一件你习惯「按规矩来」的小事，故意换一种方式做一次。感受一下，秩序松动一点时，你还在不在。

愿你的方石，既承重，也透气。`,
  },
  5: {
    number: 5,
    title: "生命路径数 5 · 流动者",
    masterNote: "此数为五方之风。命带变动与自由，贵在「动中有根」；一生之要，不在逃向下一站，而在每一次离开时都记得——为何离开。",
    core: "数 5 主变动、自由与适应。命带此数者好奇、善变通、能应万变；弱在难久锚一志、易散。修行在：拥抱变化而建内在锚点，辨明「健康流动」与「逃避漂泊」。",
    challenge: "心法：变中守定。厘清「变了之后，什么必须留下」——核心关系、健康习惯、一门可持续的专长；自由不是逃责之名。",
    career: "宜弹性与跨界：传媒、销售、自由业、牵线整合、涉外；须将经验沉淀为可迁移之力，忌久困重复无变之局。",
    love: "要空间也要新鲜。与伴侣共试新体验、新场景以维联结；同时约定底线与承诺，流动不伤稳定。",
    advice: "今日可纳计划外之变，另定一两件「必成」小事，动中留一点可控。",
    color: "turquoise",
    symbol: "五角",
    keywords: ["自由", "变化", "冒险", "适应"],
    lifeStage:
      "这一年，你进入「探索季」。过去三到四年积累的经验、关系、认知，开始松动、重组。你会发现曾经确定的事情变得模糊，而从未想过的人事物突然出现在视野里。这是正常的。就像河流拐弯时，水面总会泛起漩涡。",
    innerChallenge:
      "你可能感受到一种隐隐的躁动：想离开、想改变、想尝试点什么。这是5的能量在敲门。但它带来的课题是：如何在变化中保持定力，而不被变化吞噬？真正的挑战不是「要不要变」，而是「变了之后，什么该留下」。",
    outerOpportunity:
      "今年容易出现以下机缘：突然的旅行邀约、跨领域合作机会、学习新技能的冲动、认识背景迥异的朋友。如果你遇到这些，可以试着抓住——但不必立刻做重大承诺。5的能量适合「试水温」，而不是「跳进去」。",
    relationshipHint:
      "关系中，如果单身，你容易被有趣但不按常理出牌的人吸引。可以约会、可以聊天，但别急着定义关系。如果已有伴侣，你们可能会经历一段「平淡期」——这不是坏事，可以一起做一件从未做过的事：比如去没去过的街区、学完全陌生的技能。新鲜的场景会唤醒新鲜的对话。",
    careerCreation:
      "事业上，今年适合扮演「连接者」的角色。你可能不是最深度的专家，但你擅长把不同的人、资源、信息串起来。可以尝试：牵线一次合作、组织一场跨界交流、用一周时间接触一个全新的领域。哪怕只是读一本书、听一场讲座，都算数。",
    spiritualGuidance:
      "数字5对应北欧符文Raidho，它的名字是「旅程」，也是「律动」。古人相信，万物都有自己的节奏——潮汐涨落、四季轮替、星辰运行。当你感到迷失时，可以问自己：我此刻是逆着生命的潮水在游，还是顺流而行？",
    warning:
      "如果5的能量失衡，你可能会经历这些：不断开始却难以坚持、用「自由」的名义逃避责任、在多个选择间犹豫不决。如果你发现自己有这些倾向，可以试着做一个小练习：每天选一件事，无论多小，坚持做满30天。",
    dailyMantra: "今天，可以对自己说：『我允许变化发生，也允许自己停留。』",
    oracle: `你站在五个方向的中央，风从四方来，第五阵风从你心口吹出。

你以为你在选择，其实是路在选你。

这一年，你会遇见一个很久以前拒绝你的人，或者一个你曾转身离去的地方——不是为了让你回头，而是让你看见，你的脚印早已在身后连成了符文。

当5的能量流过你，它带来的是「脱离」的渴望：脱离旧我，脱离承诺，脱离那些曾保护你也囚禁你的墙。

但你要小心，有一种自由，只是另一种形式的逃亡。

真正的流动者，并非无根的浮萍。他们如河，有河道却永是新水；他们如鸟，有归巢却日日远翔。

你的任务不是寻找新的枷锁，而是在每一次离开时，都记得你为何离开。

若你感到迷失，那是因为你忘了：方向不是地图给的，是你迈出下一步时，脚底升起的风。

古老的符文Raidho说：「骑行之乐，在于人与马的合一。」

你不是骑手，也不是马，你就是那奔驰本身。

当你意识到这一点，你将不再问「我要去哪里」，因为每一步都是家。

但若5的能量失衡，你会陷入永恒的躁动——不断启程，从未抵达；不断承诺，从未兑现。

这时，你需要做一个最古老的练习：每日同一时辰，同一地点，同一姿势，静立七息。

让动的根，扎在静的土里。

今日，你可以试：站在任何一个门口，先不跨入，问自己——此刻，我是想逃进去，还是想迎进去？

愿你在五条路的中央，找到那个从来不是选择的选择。`,
  },
  6: {
    number: 6,
    title: "生命路径数 6 · 守护者",
    masterNote: "此数为六芒星——天三角与地三角相合。命带责任与托举之力；一生之要，不在给得更多，而在给出之前先问：我还在吗？我还能给吗？",
    core: "数 6 主责任、和谐与归属。命带此数者重家、善付出、能托人；弱在易过付、耗竭。修行在：付出与自保之间划清边界，先稳己再托人。",
    challenge: "心法：从「无条件给」到「有边界的爱」。应人事前先估余力，会说「不」——庙门可开，也有权关门守夜。",
    career: "宜关怀与协调：护理、教育、设计、社区、客户与关系维护；职责边界须清，不揽非己之责。",
    love: "要归属与相互扶持，善经营长期关系。确保己之情感与体力亦被满足，单方付出终难久。",
    advice: "今日宜顾人、顾家、顾关系；另留一段只给自己的时间，充能再给。",
    color: "indigo",
    symbol: "六芒星",
    keywords: ["责任", "家庭", "和谐", "付出"],
    oracle: `六芒星是两枚三角的相遇：一个向上指天，一个向下指地。你是那个同时看见「他们需要什么」和「我能给什么」的人。

数字6的能量是「家」——不是房子，是有人等你回来的那种感觉。你擅长付出，擅长托住别人，擅长在破碎处缝补。但家需要不止一根柱子。

这一年，会有人习惯你的好，却很少问你累不累。你的课题不是给得更多，而是在给出之前，先问自己：我还在吗？我还能给吗？

若6的能量失衡，你会活成一座没有门的庙：人人都来祈福，却没有人留下陪你守夜。真正的守护，是你在，门才在——你也有权关门休息。

今日，可以试：对一个人说「今天我想先照顾自己」，然后真的留出一段时间，只给自己。

愿你的六芒星，既照见他人，也照见自己。`,
  },
  7: {
    number: 7,
    title: "生命路径数 7 · 探寻者",
    masterNote: "此数为通往深处的阶梯。命带独行之光；一生之要，不在找到终极真理，而在学会在「没有答案」里待一会儿——最深的智慧，往往在放下「必须想通」那一刻出现。",
    core: "数 7 主内省、真理与深度。命带此数者好学、喜静、善在静默中厘清；弱在易疑、易疏离。修行在：独立思辨而不失联结，将洞察落成可沟通的结论。",
    challenge: "心法：从「独善其身」到「可被理解的智慧」。关键处主动与人分享思考与结论，内敛过甚反失协作与反馈。",
    career: "宜深度与专精：研究、哲学、神秘学、技术、顾问；须有独处节奏，并定期与可信者交流以校准。",
    love: "要精神共鸣与共同成长，也要独处空间。选能尊重你内省、不强行拉入喧嚣的人；关键感受须主动说出，免误。",
    advice: "今日利学习、复盘、静思；重要判断先成要点，再与一人共验盲区。",
    color: "silver",
    symbol: "七芒星",
    keywords: ["智慧", "内省", "真理", "独处"],
    oracle: `七是通往深处的阶梯。别人在表面热闹，你在追问：然后呢？背后呢？真相呢？

数字7的能量是「独行中的光」——你不需要人群来确认自己的存在，你需要在寂静中听见自己的回音。这一年，会有答案浮现，但多半是在你停止追问、只是静默的时候。

你的课题不是找到终极真理，而是学会在「没有答案」里待一会儿。最深的智慧，往往出现在你放下「必须想通」的那一刻。

若7的能量失衡，你会活成一座孤岛上的灯塔：光很强，却照不见脚下的岸。真正的探寻，是敢在黑暗中点灯，也敢把灯交给路过的人。

今日，可以试：选一个你一直在想的问题，不再追问答案，只是带着它静坐七分钟。看看，问题会不会自己变轻一点。

愿你的七芒星，既指向深渊，也指向归途。`,
  },
  8: {
    number: 8,
    title: "生命路径数 8 · 成就者",
    masterNote: "此数为倒悬的无限——给出去，收回来；建起来，传下去。命带驾驭之力；一生之要，不在控制更多，而在关键处敢放手，让该流的流、该留的留。",
    core: "数 8 主成就、资源与魄力。命带此数者善整合、能决断、目标感强；弱在重果轻过程、易失人心。修行在：成就与因果并重，权为托举不为压制。",
    challenge: "心法：从「以结果论英雄」到「结果与过程、利益与人心并重」。关键决策须纳他人感受与长期口碑，短视损信。",
    career: "宜整合与决策：管理、金融、法律、创业、高管；冲业绩时须同步建可持续的团队与客户关系。",
    love: "以行动与实力示爱，要尊重与对等。主动表达情感与认可，莫让伴侣只感到「被用」而非「被爱」。",
    advice: "今日宜推要项、谈判；拍板前留一刻倾听身边人，果决与人心兼得。",
    color: "amber",
    symbol: "无限",
    keywords: ["成就", "权力", "资源", "魄力"],
    oracle: `8 是倒过来的无限符号：你在循环里——给出去，收回来；建起来，传下去。成就不是终点，是下一圈的起点。

数字8的能量是「驾驭」：你擅长看清资源、规则与人心，擅长在复杂中做决定。但真正的权力，不是控制更多，而是敢在关键处放手——让该流走的流走，该留下的留下。

这一年，会有人敬你，也会有人怕你。你的课题不是变得更强，而是让身边的人感到：在你面前，他们可以不必假装强大。

若8的能量失衡，你会活成一座永远在扩建的城堡：地盘越来越大，却越来越空。真正的无限，是循环——有进有出，有上有下。

今日，可以试：主动让出一件你「本可以掌控」的事，交给别人决定。看看，世界会不会依然运转。

愿你的无限，既有上升的弧，也有回归的弧。`,
  },
  9: {
    number: 9,
    title: "生命路径数 9 · 博爱者",
    masterNote: "此数为单数之尽，再前即归一。命带完成与放手之力；一生之要，不在让一切圆满，而在该收时能说「到这里，我放手了」——不带愧疚，也不带遗憾。",
    core: "数 9 主完成、包容与收尾。命带此数者胸怀大、善收官；弱在易背「应该」、救世主情结。修行在：大爱有界，完成该完成的，然后坦然交还。",
    challenge: "心法：从「我要让一切圆满」到「接受己与人的局限」。区分「可为之努力」与「须交还命运」之事，不过度介入他人课题。",
    career: "宜视野与使命：公益、医疗、艺术、国际、灵性教育；奉献须配可持续的自顾节奏。",
    love: "爱得深而包容，要灵魂契合。不为关系过度牺牲己身，接受伴侣有其独立课题与节奏。",
    advice: "今日宜总结、告别、收尾一事；主动为下一程腾出心与时间。",
    color: "coral",
    symbol: "圆满",
    keywords: ["博爱", "完成", "传承", "理想"],
    oracle: `九是单数的尽头，再往前，就回到一。你是那个看见「大局」的人——不是因为你站得高，而是因为你愿意把目光从自己身上移开。

数字9的能量是「完成与放手」：你擅长收尾，擅长传承，擅长在别人还在纠结时说「可以了」。但圆满不是把所有人都照顾好，而是接受：有些事，只能做到这里。

这一年，会有一段关系、一个项目或一个阶段，需要你画上句号。你的课题不是做得更多，而是学会说「到这里，我放手了」——不带愧疚，也不带遗憾。

若9的能量失衡，你会活成永远在补洞的救火员：火永远扑不灭，因为你不肯离开现场。真正的博爱，是爱到可以放手——让故事有自己的结局。

今日，可以试：选一件已经结束却仍占据你心思的事，在心里正式说一句「再见」，然后不再回头。

愿你的圆满，既有包容，也有边界。`,
  },
  11: {
    number: 11,
    title: "大师数 11 · 灵性启迪者",
    masterNote: "十一为双柱并立——一通于天，一扎于地。命带桥梁之能；一生之要，不在更通灵，而在把通到的灵，种进土里，让人因你而看见自己心中的光。",
    core: "大师数 11 属高振动，主直觉、灵感与桥梁。命带此数者敏感、易接超越日常之讯；弱在易停于想、不落地。使命在：将灵性感知落成对人有益的表达与行动。",
    challenge: "心法：从「停于灵感」到「灵感与行动并进」。信直觉，更要以最小可执行一步验证——否则灵感只是梦。",
    career: "宜直觉与跨界：灵性/心灵、艺术、心理与疗愈、创新与愿景；须在灵感与执行间建固定节奏，有想更须有果。",
    love: "要灵魂共鸣与深度联结。理想与现实须平衡；选能懂你敏感与志向的人，将感受化为可沟通之言。",
    advice: "今日可信直觉、记灵感；重大决定前，用一条最小行动先验，再铺开。",
    color: "cyan",
    symbol: "火炬",
    keywords: ["灵性", "直觉", "启迪", "灵感"],
    oracle: `11 是两道光柱并立：一根通向天，一根扎进地。你是那个在别人只看见「有或没有」的时候，看见「还有另一种可能」的人。

大师数11的能量是「桥梁」——你站在可见与不可见之间，把灵感译成语言，把直觉译成行动。这一年，会有电光火石般的领悟出现，但你要学会在「被击中」之后，再迈一步——否则灵感只是梦。

你的课题不是变得更通灵，而是把通到的灵，种进土里。真正的启迪，是有人因为你的存在，也看见了自己心里的光。

若11的能量失衡，你会活成永远在等「下一个启示」的人：天上的门开了一扇又一扇，脚下的路却从未延伸。真正的火炬，是既能照见远方，也能照亮脚下的下一步。

今日，可以试：把今天最强烈的一个直觉，用一句话写下来，然后做一件小事去「验证」它——哪怕只是发一条信息、走一条新路。

愿你的双柱，既顶天，也立地。`,
  },
  22: {
    number: 22,
    title: "大师数 22 · 建造者",
    masterNote: "廿二为双倍根基。别人在造梦，你在造承重墙。命带大师建造之能；一生之要，不在想得更大，而在把大的想，变成别人能走上去的台阶——从第一块砖开始。",
    core: "大师数 22 为「大师建造者」，兼具愿景与落地。命带此数者善拆大目标为体系、善用资源与人脉；弱在易焦虑或迟迟不开工。使命在：将大想化为他人可参与、可受益的实体与制度。",
    challenge: "心法：从「只画蓝图」到「先砌第一块砖」。接受不完美起步，用最小可执行步骤验方向——一步到位是拖延的借口。",
    career: "宜规模与体系：大项目、建筑与规划、组织与战略落地；须设阶段里程碑，在愿景与当下行动间建清晰路径。",
    love: "以行动与共同目标示爱，要能并肩、共愿景的伴侣。成就再大也须留高质量相处，莫让关系被事务吞没。",
    advice: "今日只定一事：明天可完成的最小一步。写下，并去做；大梦靠小步累积。",
    color: "royalblue",
    symbol: "基石",
    keywords: ["建造", "愿景", "落地", "大师"],
    oracle: `22 是双倍的根基：别人在造梦，你在造承重墙。大师数22的能量不是「想得很大」，而是「把大的想，变成别人能走上去的台阶」。

你是那个看见整张蓝图的人——但你知道，蓝图的实现，从第一块砖开始。这一年，会有一个宏大的念头或机会出现。你的课题不是立刻起飞，而是问：若只能先做一步，那一步是什么？

若22的能量失衡，你会活成永远在画图纸的人：方案改了一版又一版，工地却从未开工。真正的建造者，是敢在不确定中砌下第一块砖——然后一块一块，把愿景砌成实墙。

今日，可以试：把你心里那个「大计划」写下来，然后在下面只写一行——「明天我能做的最小一步是_____」。填上，并去做。

愿你的基石，既托住梦想，也托住每一个当下。`,
  },
  33: {
    number: 33,
    title: "大师数 33 · 导师",
    masterNote: "三十三为三重三：教导、疗愈、服务合一。命带传递之光；一生之要，不在给得更多，而在确保自己灯盏里始终有油——既敢点灯，也敢说「今晚我想熄灯休息」。",
    core: "大师数 33 为「大师导师」，主教导、疗愈与服务。命带此数者善倾听、能托举、在场即支持；弱在易过付、耗竭。使命在：滋养他人而己身可持续，传递不断流。",
    challenge: "心法：从「无限给予」到「有容乃大」。自我照顾入日程，付出前先确认己身状态——耗竭则无法持续服务。",
    career: "宜关怀与传递：疗愈、教育、慈善、心灵与生命教育；须设休息与复盘节奏，使命不等于无底线付出。",
    love: "深度包容与无条件的爱；须被理解与支持，非单方被索取。与伴侣明边界，共营可持续关系。",
    advice: "今日可关怀、可支持；务必留一段不被打扰的休息或独处，先盈己再传。",
    color: "rose",
    symbol: "莲花",
    keywords: ["导师", "疗愈", "慈悲", "服务"],
    oracle: `33 是三重三：教导、疗愈、服务，合而为一。你是那个别人在迷茫时会想起的人——不是因为你什么都知道，而是因为你愿意在场。

大师数33的能量是「传递」：你接收到的光，不是为了囤积，而是为了在恰当的时机，递给需要的人。但传递的前提，是你自己还在发光。这一年，会有人不断向你靠拢。你的课题不是给得更多，而是确保自己的灯盏里，始终有油。

若33的能量失衡，你会活成一座被掏空的圣殿：人人来祈福，你却忘了自己也需要被供奉。真正的导师，是既敢点灯，也敢说「今晚我想熄灯休息」。

今日，可以试：对一个人说出你平时只会对自己说的那句安慰——然后，把同一句话，说给自己听一遍。

愿你的莲花，既开在他人池中，也开在你自己的根上。`,
  },
};
