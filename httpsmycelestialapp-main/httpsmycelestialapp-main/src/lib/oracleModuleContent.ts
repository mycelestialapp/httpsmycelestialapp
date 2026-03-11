/**
 * 九大命理模块：每模块不少于 2000 字的深度专业文案
 * 按出生日期做基础计算后注入个性化段落，免费展示前段，精华段（未来三年运势等）用于支付墙
 */

import type { CelestialProfile } from './fiveElements';

const toolKeys = ['bazi', 'ziwei', 'qimen', 'liuren', 'xiaoliuren', 'xuankong', 'tarot', 'astrology', 'meihua'] as const;
export type OracleToolKey = (typeof toolKeys)[number];

function insertProfile(text: string, profile: CelestialProfile | null): string {
  if (!profile) return text;
  return text
    .replace(/\{dominant\}/g, profile.dominantElement)
    .replace(/\{weakest\}/g, profile.weakestElement)
    .replace(/\{balance\}/g, String(profile.balance));
}

/** 各工具免费/付费解读文案（已清空，待重新配置） */
const MODULE_CONTENT: Record<OracleToolKey, { free: string; premium: string }> = {
  bazi:    { free: '', premium: '' },
  ziwei:   { free: '', premium: '' },
  qimen:   { free: '', premium: '' },
  liuren:  { free: '', premium: '' },
  xiaoliuren: { free: '', premium: '' },
  xuankong:  { free: '', premium: '' },
  tarot:   { free: '', premium: '' },
  astrology: { free: '', premium: '' },
  meihua:  { free: '', premium: '' },
};

/** 免费展示字数（约前 900 字），剩余为付费墙 */
const FREE_CHAR_COUNT = 900;

export function getModuleContent(
  toolKey: string,
  profile: CelestialProfile | null
): { free: string; premium: string } {
  const key = toolKeys.includes(toolKey as OracleToolKey) ? (toolKey as OracleToolKey) : 'bazi';
  const raw = MODULE_CONTENT[key];
  const free = insertProfile(raw.free, profile);
  const premium = insertProfile(raw.premium, profile);
  return { free, premium };
}

/** 将 AI 返回的 reading 与静态精华合并：前段为免费，后段「未来三年」类为付费 */
export function getReadingWithPaywall(
  aiReading: string,
  toolKey: string,
  profile: CelestialProfile | null
): { freePart: string; premiumPart: string } {
  const { premium } = getModuleContent(toolKey, profile);
  const freePart = aiReading || '';
  const premiumPart = premium;
  return { freePart, premiumPart };
}

/** 是否已解锁该工具完整版（可从 localStorage 或后端校验） */
export const UNLOCK_KEY_PREFIX = 'celestial_unlock_';
export function isToolUnlocked(toolKey: string): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY_PREFIX + toolKey) === '1';
  } catch {
    return false;
  }
}
export function setToolUnlocked(toolKey: string): void {
  try {
    localStorage.setItem(UNLOCK_KEY_PREFIX + toolKey, '1');
  } catch {}
}
