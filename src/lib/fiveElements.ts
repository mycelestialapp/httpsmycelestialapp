// Simplified Five-Element energy calculation based on birth date
// Uses Heavenly Stems (天干) and Earthly Branches (地支) mapping

const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Each stem maps to an element with a weight
const stemElements: Record<string, { element: string; weight: number }> = {
  '甲': { element: 'wood', weight: 30 },
  '乙': { element: 'wood', weight: 25 },
  '丙': { element: 'fire', weight: 30 },
  '丁': { element: 'fire', weight: 25 },
  '戊': { element: 'earth', weight: 30 },
  '己': { element: 'earth', weight: 25 },
  '庚': { element: 'metal', weight: 30 },
  '辛': { element: 'metal', weight: 25 },
  '壬': { element: 'water', weight: 30 },
  '癸': { element: 'water', weight: 25 },
};

// Each branch maps to an element
const branchElements: Record<string, { element: string; weight: number }> = {
  '子': { element: 'water', weight: 20 },
  '丑': { element: 'earth', weight: 15 },
  '寅': { element: 'wood', weight: 20 },
  '卯': { element: 'wood', weight: 15 },
  '辰': { element: 'earth', weight: 20 },
  '巳': { element: 'fire', weight: 15 },
  '午': { element: 'fire', weight: 20 },
  '未': { element: 'earth', weight: 15 },
  '申': { element: 'metal', weight: 20 },
  '酉': { element: 'metal', weight: 15 },
  '戌': { element: 'earth', weight: 20 },
  '亥': { element: 'water', weight: 15 },
};

export interface ElementEnergy {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface CelestialProfile {
  energy: ElementEnergy;
  dominantElement: string;
  weakestElement: string;
  balance: number; // 0-100, 100 = perfectly balanced
}

function getYearStem(year: number): string {
  return heavenlyStems[(year - 4) % 10];
}

function getYearBranch(year: number): string {
  return earthlyBranches[(year - 4) % 12];
}

function getMonthStem(year: number, month: number): string {
  const yearStemIdx = (year - 4) % 10;
  const baseIdx = (yearStemIdx % 5) * 2;
  return heavenlyStems[(baseIdx + month - 1) % 10];
}

function getMonthBranch(month: number): string {
  return earthlyBranches[(month + 1) % 12];
}

function getDayStem(year: number, month: number, day: number): string {
  // Simplified day stem calculation
  const base = new Date(year, month - 1, day);
  const ref = new Date(1900, 0, 1);
  const diff = Math.floor((base.getTime() - ref.getTime()) / 86400000);
  return heavenlyStems[(diff + 10) % 10];
}

function getDayBranch(year: number, month: number, day: number): string {
  const base = new Date(year, month - 1, day);
  const ref = new Date(1900, 0, 1);
  const diff = Math.floor((base.getTime() - ref.getTime()) / 86400000);
  return earthlyBranches[(diff + 10) % 12];
}

export function calculateElementEnergy(year: number, month: number, day: number): CelestialProfile {
  const energy: ElementEnergy = { wood: 30, fire: 30, earth: 30, metal: 30, water: 30 };

  // Gather all pillars
  const pillars = [
    stemElements[getYearStem(year)],
    branchElements[getYearBranch(year)],
    stemElements[getMonthStem(year, month)],
    branchElements[getMonthBranch(month)],
    stemElements[getDayStem(year, month, day)],
    branchElements[getDayBranch(year, month, day)],
  ];

  // Accumulate weights
  for (const p of pillars) {
    if (p) {
      energy[p.element as keyof ElementEnergy] += p.weight;
    }
  }

  // Normalize to 0-100 range
  const max = Math.max(...Object.values(energy));
  const min = Math.min(...Object.values(energy));
  for (const key of Object.keys(energy) as (keyof ElementEnergy)[]) {
    energy[key] = Math.round((energy[key] / max) * 100);
  }

  // Find dominant and weakest
  const entries = Object.entries(energy) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const dominantElement = entries[0][0];
  const weakestElement = entries[entries.length - 1][0];

  // Balance score: how evenly distributed (100 = all equal)
  const avg = entries.reduce((s, e) => s + e[1], 0) / 5;
  const variance = entries.reduce((s, e) => s + Math.pow(e[1] - avg, 2), 0) / 5;
  const balance = Math.max(0, Math.round(100 - Math.sqrt(variance) * 2));

  return { energy, dominantElement, weakestElement, balance };
}

// Generate insight text based on profile
export function generateInsight(profile: CelestialProfile, lang: string): string {
  const { dominantElement, weakestElement, balance } = profile;

  const elementNames: Record<string, Record<string, string>> = {
    en: { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
    fr: { wood: 'Bois', fire: 'Feu', earth: 'Terre', metal: 'Métal', water: 'Eau' },
    'zh-Hant': { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
  };

  const names = elementNames[lang] || elementNames.en;
  const dom = names[dominantElement];
  const weak = names[weakestElement];

  if (lang === 'zh-Hant') {
    if (balance > 75) return `你的五行能量高度和諧。${dom}為主導元素，賦予你獨特的力量。保持內心平靜，順應宇宙節奏。`;
    if (balance > 50) return `${dom}能量強勢主導你的命盤，${weak}略顯不足。建議通過冥想和自然接觸來增強${weak}能量，達到更好的平衡。`;
    return `你的能量分佈呈現明顯的${dom}傾向，${weak}能量需要特別關注。宇宙建議你在日常生活中多融入${weak}元素的活動。`;
  }

  if (lang === 'fr') {
    if (balance > 75) return `Votre énergie élémentaire est remarquablement harmonieuse. ${dom} domine, vous conférant une force unique. Maintenez votre sérénité intérieure.`;
    if (balance > 50) return `${dom} domine votre profil énergétique, tandis que ${weak} nécessite attention. La méditation peut aider à rétablir l'équilibre cosmique.`;
    return `Votre profil montre une forte tendance ${dom} avec ${weak} en déficit. L'univers recommande d'intégrer des activités liées à ${weak} dans votre quotidien.`;
  }

  // English default
  if (balance > 75) return `Your elemental energy is remarkably harmonious. ${dom} leads your celestial profile, granting you a unique inner strength. Stay centered and flow with the cosmic rhythm.`;
  if (balance > 50) return `${dom} energy dominates your celestial blueprint, while ${weak} seeks nourishment. Consider meditation and nature to strengthen your ${weak} connection for greater balance.`;
  return `Your energy profile reveals a strong ${dom} tendency with ${weak} requiring special attention. The cosmos suggests integrating ${weak}-aligned activities into your daily rituals for equilibrium.`;
}
