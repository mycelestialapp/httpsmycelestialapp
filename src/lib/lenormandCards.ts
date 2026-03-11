/**
 * 雷諾曼 36 張牌資料與抽牌
 */
export interface LenormandCardEntry {
  id: number;
  nameZh: string;
  symbol: string;
  shortMeaning?: string;
}

/** 每張牌的簡短牌義（免費版講解用） */
export const LENORMAND_SHORT_MEANINGS: Record<number, string> = {
  1: '消息、变动、快速', 2: '幸运、小确幸', 3: '旅行、远行、传播', 4: '家庭、安全感、根基',
  5: '健康、成长、生命', 6: '困惑、模糊、需澄清', 7: '诱惑、曲折、智慧', 8: '结束、转化、放下',
  9: '礼物、美好、收获', 10: '决断、切割、收获', 11: '重复、争执、节奏', 12: '沟通、消息、焦虑',
  13: '纯真、新开始、单纯', 14: '谋略、工作、谨慎', 15: '权威、力量、保护', 16: '希望、灵感、指引',
  17: '转变、迁移、提升', 18: '忠诚、朋友、陪伴', 19: '孤独、机构、距离', 20: '社交、公开、聚会',
  21: '阻碍、挑战、稳固', 22: '选择、方向、旅程', 23: '耗损、担忧、细节', 24: '情感、爱、情绪',
  25: '承诺、契约、循环', 26: '秘密、学习、未知', 27: '消息、文书、沟通', 28: '男性、阳性能量',
  29: '女性、阴性能量', 30: '宁静、成熟、智慧', 31: '成功、活力、明朗', 32: '直觉、梦境、周期',
  33: '解决、关键、答案', 34: '财富、丰盛、流动', 35: '稳定、事业、坚持', 36: '业力、责任、承担',
};

const LENORMAND_36: LenormandCardEntry[] = [
  { id: 1, nameZh: '騎士', symbol: '🐴' }, { id: 2, nameZh: '三葉草', symbol: '🍀' }, { id: 3, nameZh: '船', symbol: '⛵' },
  { id: 4, nameZh: '房子', symbol: '🏠' }, { id: 5, nameZh: '樹', symbol: '🌳' }, { id: 6, nameZh: '雲', symbol: '☁️' },
  { id: 7, nameZh: '蛇', symbol: '🐍' }, { id: 8, nameZh: '棺材', symbol: '⚰️' }, { id: 9, nameZh: '花束', symbol: '💐' },
  { id: 10, nameZh: '鐮刀', symbol: '🔪' }, { id: 11, nameZh: '鞭子', symbol: '🪢' }, { id: 12, nameZh: '鳥', symbol: '🐦' },
  { id: 13, nameZh: '孩子', symbol: '👶' }, { id: 14, nameZh: '狐狸', symbol: '🦊' }, { id: 15, nameZh: '熊', symbol: '🐻' },
  { id: 16, nameZh: '星星', symbol: '⭐' }, { id: 17, nameZh: '鸛', symbol: '🦩' }, { id: 18, nameZh: '狗', symbol: '🐕' },
  { id: 19, nameZh: '塔', symbol: '🗼' }, { id: 20, nameZh: '花園', symbol: '🏡' }, { id: 21, nameZh: '山', symbol: '⛰️' },
  { id: 22, nameZh: '路', symbol: '🛤️' }, { id: 23, nameZh: '老鼠', symbol: '🐭' }, { id: 24, nameZh: '心', symbol: '❤️' },
  { id: 25, nameZh: '戒指', symbol: '💍' }, { id: 26, nameZh: '書', symbol: '📖' }, { id: 27, nameZh: '信', symbol: '✉️' },
  { id: 28, nameZh: '男人', symbol: '👨' }, { id: 29, nameZh: '女人', symbol: '👩' }, { id: 30, nameZh: '百合', symbol: '🌸' },
  { id: 31, nameZh: '太陽', symbol: '☀️' }, { id: 32, nameZh: '月亮', symbol: '🌙' }, { id: 33, nameZh: '鑰匙', symbol: '🔑' },
  { id: 34, nameZh: '魚', symbol: '🐟' }, { id: 35, nameZh: '錨', symbol: '⚓' }, { id: 36, nameZh: '十字', symbol: '✝️' },
];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getLenormandDraw(seed: number, count: number): LenormandCardEntry[] {
  const shuffled = seededShuffle(LENORMAND_36, seed);
  return shuffled.slice(0, Math.min(count, 36)).map((c) => ({
    ...c,
    shortMeaning: LENORMAND_SHORT_MEANINGS[c.id],
  }));
}

export function getLenormandCardById(id: number): LenormandCardEntry | undefined {
  return LENORMAND_36.find((c) => c.id === id);
}
