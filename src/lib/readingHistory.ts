/**
 * 統一「問題與答案」存儲：星圖 + 天啟所有占卜方式共用。
 * 存於 localStorage，單一 key，方便在「解讀記錄」頁統一查看與刪除。
 */
import type { OracleReading } from '@/lib/oracleMasterReading';

export const READINGS_KEY = 'celestial_readings';

/** 星圖 + 天啟全部占卜方式 */
export type ReadingTool =
  | 'bazi'
  | 'ziwei'
  | 'qimen'
  | 'liuren'
  | 'xiaoliuren'
  | 'liuyao'
  | 'xuankong'
  | 'meihua'
  | 'astrology'
  | 'tarot'
  | 'oracle'
  | 'lenormand'
  | 'runes'
  | 'numerology';

/** 神諭卡單條記錄的詳情 */
export interface OracleReadingDetail {
  topic: string;
  spread: string;
  cards: { id: string; nameZh: string; tagline: string; image?: string | null }[];
  masterReading?: unknown;
}

/** 塔羅單條記錄的詳情（與神諭卡一致：可帶大師級解讀結構） */
export interface TarotReadingDetail {
  spreadType: string;
  topic?: string;
  cards: { id: string; nameZh: string; upright: boolean }[];
  readingSummary?: string;
  /** 與神諭卡同結構的免費/付費解讀，供 MasterOracleReadingView 展示 */
  masterReading?: OracleReading;
}

/** 雷諾曼單條記錄的詳情 */
export interface LenormandReadingDetail {
  spreadType: string;
  question?: string;
  cards: { id: number; nameZh: string; shortMeaning?: string }[];
  /** 大師級整體解讀（原始 JSON 字串或純文字） */
  masterResult?: string;
}

/** 八字/占星等可後續擴展 */
export interface BaziReadingDetail {
  name?: string;
  year: number;
  month: number;
  day: number;
  readingSummary?: string;
}

/** 六爻占卜記錄詳情 */
export interface LiuyaoReadingDetail {
  question?: string;
  hexagram?: string;
  readingSummary?: string;
}

/** 占星解讀記錄詳情 */
export interface AstrologyReadingDetail {
  sunSign: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  reading?: string;
}

/** 符文解讀記錄詳情 */
export interface RuneReadingDetail {
  spreadType: string;
  spreadLabel?: string;
  question?: string;
  runes: { rune_id: number; name: string; reversed: boolean; position?: string }[];
  interpretationSummary?: string;
}

/** 數字命理解讀記錄詳情 */
export interface NumerologyReadingDetail {
  name: string;
  birthDate: string;
  birthDateLabel?: string;
  hourIndex?: number;
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  maturity: number;
  birthday?: number;
  potential?: number;
  interpersonal?: number;
}

export type ReadingDetail =
  | OracleReadingDetail
  | TarotReadingDetail
  | LenormandReadingDetail
  | BaziReadingDetail
  | LiuyaoReadingDetail
  | AstrologyReadingDetail
  | RuneReadingDetail
  | NumerologyReadingDetail;

export interface ReadingEntry {
  id: string;
  tool: ReadingTool;
  /** 用戶輸入的問題（可為空） */
  question: string | null;
  /** 列表用一句話摘要，如「神諭卡 · 靈魂呼喚」「塔羅 · 三張牌陣」 */
  summary: string;
  detail: ReadingDetail;
  createdAt: string;
}

const MAX_READINGS = 200;
const MIGRATED_KEY = 'celestial_readings_migrated';
const LEGACY_ORACLE_KEY = 'celestial_oracle_history';

/** 一次性：把舊的神諭卡存檔遷移到統一 key */
function migrateFromLegacyIfNeeded(): void {
  try {
    if (localStorage.getItem(MIGRATED_KEY)) return;
    const raw = localStorage.getItem(LEGACY_ORACLE_KEY);
    if (!raw) {
      localStorage.setItem(MIGRATED_KEY, '1');
      return;
    }
    const legacy = JSON.parse(raw) as unknown[];
    if (!Array.isArray(legacy)) {
      localStorage.setItem(MIGRATED_KEY, '1');
      return;
    }
    const existing = getReadingsRaw();
    const migrated: ReadingEntry[] = legacy.map((item: any) => ({
      id: item.id ?? `r-${item.createdAt ?? Date.now()}-m`,
      tool: 'oracle',
      question: item.question ?? null,
      summary:
        item.cards?.length > 0
          ? `神諭卡 · ${item.cards.map((c: any) => c.nameZh).join('、')}`
          : '神諭卡 · 解讀',
      detail: {
        topic: item.topic ?? '',
        spread: item.spread ?? '',
        cards: item.cards ?? [],
        masterReading: item.masterReading ?? undefined,
      },
      createdAt: item.createdAt ?? new Date().toISOString(),
    }));
    const merged = [...migrated, ...existing].slice(0, MAX_READINGS);
    localStorage.setItem(READINGS_KEY, JSON.stringify(merged));
    localStorage.removeItem(LEGACY_ORACLE_KEY);
    localStorage.setItem(MIGRATED_KEY, '1');
  } catch (_) {}
}

function getReadingsRaw(): ReadingEntry[] {
  try {
    const raw = localStorage.getItem(READINGS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as ReadingEntry[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getReadings(): ReadingEntry[] {
  migrateFromLegacyIfNeeded();
  return getReadingsRaw();
}

export function addReading(entry: Omit<ReadingEntry, 'id' | 'createdAt'>): void {
  try {
    const list = getReadings();
    const newEntry: ReadingEntry = {
      ...entry,
      id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newEntry);
    localStorage.setItem(READINGS_KEY, JSON.stringify(list.slice(0, MAX_READINGS)));
  } catch (_) {}
}

export function removeReading(id: string): void {
  try {
    const list = getReadings().filter((e) => e.id !== id);
    localStorage.setItem(READINGS_KEY, JSON.stringify(list));
  } catch (_) {}
}

/** 清除全部解讀記錄（設定頁「清除本地解讀記錄」用，合規） */
export function clearAllReadings(): void {
  try {
    localStorage.setItem(READINGS_KEY, JSON.stringify([]));
  } catch (_) {}
}

export const TOOL_LABELS: Record<ReadingTool, string> = {
  bazi: '八字',
  ziwei: '紫微',
  qimen: '奇門',
  liuren: '大六壬',
  xiaoliuren: '小六壬',
  liuyao: '六爻',
  xuankong: '玄空',
  meihua: '梅花',
  astrology: '占星',
  tarot: '塔羅',
  oracle: '神諭卡',
  lenormand: '雷諾曼',
  runes: '符文',
  numerology: '數字命理',
};
