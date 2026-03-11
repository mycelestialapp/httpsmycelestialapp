/**
 * 一次性脚本：1984 农历十月初四 男 东北 → 付费版解读
 * 运行: npx tsx src/scripts/runBaziLong.ts
 */
import { computeLocalBazi } from '../lib/baziLocal';
import { generateBaziReading } from '../lib/baziReading';

const info = {
  year: '1984',
  month: '11',
  day: '26',
  hour: '6',
  longitude: 125,
  useSolarTime: true,
  birthHour: 12,
  birthMinute: 0,
  gender: 'male' as const,
};

const baziResult = computeLocalBazi(info);
const paidText = generateBaziReading(baziResult, { level: 'long', gender: 'male' });
console.log(paidText);
