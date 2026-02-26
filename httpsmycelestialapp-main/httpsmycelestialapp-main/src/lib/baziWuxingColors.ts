/**
 * 干支五行分色（用于命盘长图发光效果）
 * 木-青 #00ffcc, 火-红 #ff4d4d, 土-黄 #ffcc33, 金-白 #f0f0f0, 水-蓝 #3399ff
 */

export const WUXING_COLORS: Record<string, string> = {
  wood: '#00ffcc',
  fire: '#ff4d4d',
  earth: '#ffcc33',
  metal: '#f0f0f0',
  water: '#3399ff',
};

const TIANGAN_WUXING: Record<string, string> = {
  '甲': 'wood', '乙': 'wood', '丙': 'fire', '丁': 'fire', '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal', '壬': 'water', '癸': 'water',
};

const DIZHI_WUXING: Record<string, string> = {
  '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood', '辰': 'earth', '巳': 'fire',
  '午': 'fire', '未': 'earth', '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water',
};

export function getCharWuxing(char: string): string | null {
  if (TIANGAN_WUXING[char]) return TIANGAN_WUXING[char];
  if (DIZHI_WUXING[char]) return DIZHI_WUXING[char];
  return null;
}

export function getCharColor(char: string): string {
  const wuxing = getCharWuxing(char);
  return wuxing ? WUXING_COLORS[wuxing] : '#e8e0d0';
}
