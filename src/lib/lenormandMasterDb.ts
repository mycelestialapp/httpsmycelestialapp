/**
 * 雷諾曼大師解讀用：每張牌的鏡像/現實/陰影/禪意短句（可後續擴充）
 */
export interface LenormandMasterEntry {
  mirror?: string;
  reality?: string;
  shadow?: string;
  zen?: string;
}

const PLACEHOLDER = { mirror: '', reality: '', shadow: '', zen: '' };

export const LENORMAND_MASTER_DB: Record<string, LenormandMasterEntry> = Object.fromEntries(
  Array.from({ length: 36 }, (_, i) => [String(i + 1), PLACEHOLDER])
);
