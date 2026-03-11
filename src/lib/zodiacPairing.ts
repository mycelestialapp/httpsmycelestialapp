/**
 * 星座配對與合盤 · 12×12 匹配度 + 一句話解讀
 * 用於關係頁「星座配對」與「雙人合盤輕量版」
 */
import type { ZodiacSignKey } from '@/lib/astrologyChart';
import { SIGN_ELEMENT, OPPOSITE_SIGN, getSunSignFromDate } from '@/lib/astrologyChart';

export type { ZodiacSignKey };

export const ZODIAC_SIGNS: ZodiacSignKey[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const COMPATIBLE_ELEMENTS: [string, string][] = [
  ['fire', 'air'],
  ['earth', 'water'],
];

function getElement(s: ZodiacSignKey): string {
  return SIGN_ELEMENT[s];
}

/** 兩星座的匹配分數 0～100；同元素最高，對宮較低 */
export function getPairingScore(sign1: ZodiacSignKey, sign2: ZodiacSignKey): number {
  if (sign1 === sign2) return 98;
  const e1 = getElement(sign1);
  const e2 = getElement(sign2);
  if (e1 === e2) return 85;
  if (OPPOSITE_SIGN[sign1] === sign2) return 58;
  const pair = [e1, e2].sort().join(',');
  if (COMPATIBLE_ELEMENTS.some(([a, b]) => pair === [a, b].sort().join(','))) return 75;
  return 65;
}

/** i18n 訊息 key：pairing.aries.taurus（固定小寫，A 字母序在前）；若無則用 pairing.elementSame 等後備 */
export function getPairingMessageKey(sign1: ZodiacSignKey, sign2: ZodiacSignKey): string {
  const [a, b] = [sign1, sign2].sort();
  return `pairing.${a}.${b}`;
}

/** 後備通用 key（同元素 / 相容 / 對宮 / 其他），供 i18n 未覆蓋時使用 */
export function getPairingFallbackKey(sign1: ZodiacSignKey, sign2: ZodiacSignKey): string {
  if (sign1 === sign2) return 'pairing.elementSame';
  const e1 = getElement(sign1);
  const e2 = getElement(sign2);
  if (e1 === e2) return 'pairing.elementSame';
  if (OPPOSITE_SIGN[sign1] === sign2) return 'pairing.elementOpposite';
  const pair = [e1, e2].sort().join(',');
  if (COMPATIBLE_ELEMENTS.some(([a, b]) => pair === [a, b].sort().join(','))) return 'pairing.elementCompatible';
  return 'pairing.elementOther';
}

/** 從兩人生日取太陽星座並回傳配對分數與訊息 key */
export function getSynastryFromBirthdays(
  y1: number, m1: number, d1: number,
  y2: number, m2: number, d2: number
): { sign1: ZodiacSignKey; sign2: ZodiacSignKey; score: number; messageKey: string } {
  const sign1 = getSunSignFromDate(y1, m1, d1);
  const sign2 = getSunSignFromDate(y2, m2, d2);
  return {
    sign1,
    sign2,
    score: getPairingScore(sign1, sign2),
    messageKey: getPairingMessageKey(sign1, sign2),
  };
}
