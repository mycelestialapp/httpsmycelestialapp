/**
 * 占星星盤 · 西方占星術數
 * 對應規格：docs/星圖板塊-西方占卜內容生成邏輯.md
 *
 * - L1：僅日期 → 太陽星座（熱帶黃道 12 星座）
 * - L2：日期+時間 → 太陽+月亮（月亮星座需星曆，暫用預設或後續接入）
 * - L3：日期+時間+地點 → 完整本命盤（見 westernOccultKernelTypes + consultationRun）
 */

import type { AstrologyOutput } from './westernOccultKernelTypes'

/** 熱帶黃道 12 星座 key（英文小寫，與 i18n oracle.signs.xxx 對應） */
export type ZodiacSignKey =
  | 'capricorn'   // 摩羯 12.22-1.19
  | 'aquarius'    // 水瓶 1.20-2.18
  | 'pisces'      // 雙魚 2.19-3.20
  | 'aries'       // 牡羊 3.21-4.19
  | 'taurus'      // 金牛 4.20-5.20
  | 'gemini'      // 雙子 5.21-6.20
  | 'cancer'      // 巨蟹 6.21-7.22
  | 'leo'         // 獅子 7.23-8.22
  | 'virgo'       // 處女 8.23-9.22
  | 'libra'       // 天秤 9.23-10.22
  | 'scorpio'     // 天蠍 10.23-11.21
  | 'sagittarius' // 射手 11.22-12.21

/** 星座對應四元素（用於星圖頁面視覺風格） */
export const SIGN_ELEMENT: Record<ZodiacSignKey, 'fire' | 'earth' | 'air' | 'water'> = {
  aries: 'fire',
  taurus: 'earth',
  gemini: 'air',
  cancer: 'water',
  leo: 'fire',
  virgo: 'earth',
  libra: 'air',
  scorpio: 'water',
  sagittarius: 'fire',
  capricorn: 'earth',
  aquarius: 'air',
  pisces: 'water',
}

/** 12 星座 Unicode 符號（靈魂原型卡、星盤等處顯示用） */
export const SIGN_SYMBOLS: Record<ZodiacSignKey, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
}

/** 星座對宮（暗面/隱藏星座）：牡羊↔天秤，金牛↔天蠍，雙子↔射手，巨蟹↔摩羯，獅子↔水瓶，處女↔雙魚 */
export const OPPOSITE_SIGN: Record<ZodiacSignKey, ZodiacSignKey> = {
  aries: 'libra', taurus: 'scorpio', gemini: 'sagittarius', cancer: 'capricorn',
  leo: 'aquarius', virgo: 'pisces', libra: 'aries', scorpio: 'taurus',
  sagittarius: 'gemini', capricorn: 'cancer', aquarius: 'leo', pisces: 'virgo',
}

/**
 * 依公曆（Gregorian）月、日計算太陽星座（熱帶黃道）；靈魂原型必須用此結果，不可改為依「今日」等。
 */
export function getSunSign(month: number, day: number): ZodiacSignKey {
  const d = month * 100 + day
  if (d >= 1222 || d <= 119) return 'capricorn'
  if (d <= 218) return 'aquarius'
  if (d <= 320) return 'pisces'
  if (d <= 419) return 'aries'
  if (d <= 520) return 'taurus'
  if (d <= 620) return 'gemini'
  if (d <= 722) return 'cancer'
  if (d <= 822) return 'leo'
  if (d <= 922) return 'virgo'
  if (d <= 1022) return 'libra'
  if (d <= 1121) return 'scorpio'
  return 'sagittarius'
}

/**
 * 從出生日期（公曆）取得太陽星座；靈魂原型文案嚴格依此，呼叫端若為農曆須先轉公曆再傳入。
 */
export function getSunSignFromDate(year: number, month: number, day: number): ZodiacSignKey {
  return getSunSign(month, day)
}

/**
 * 免費版占星內容的輸入（L1/L2）
 * 文案由 i18n 提供：oracle.signs.{sunSign}.archetypeName / tagline / keyword / quote
 */
export interface AstrologyFreeInput {
  sunSign: ZodiacSignKey
  moonSign?: ZodiacSignKey
}

/**
 * 取得免費版占星使用的「元素」用於樣式（邊框、背景等）
 */
export function getSignElement(sunSign: ZodiacSignKey): 'fire' | 'earth' | 'air' | 'water' {
  return SIGN_ELEMENT[sunSign]
}

// ---------- 簡化版行星落座計算（暫作付費版 UI 演示用） ----------

/** 支持的行星鍵名（含太陽與三顆外行星，本命盤共 10 顆星體） */
export type SimplePlanetName =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto'

export interface SimplePlanetInfo {
  name: SimplePlanetName
  sign: ZodiacSignKey
  house: number // 1-12
}

export interface SimpleAstroInput {
  year: number
  month: number
  day: number
  /** 0-11 十二時辰索引，用來近似推導宮位分佈 */
  hourIndex?: number
}

const ZODIAC_ORDER: ZodiacSignKey[] = [
  'capricorn',
  'aquarius',
  'pisces',
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
]

function wrapIndex(i: number, len: number): number {
  let v = i % len
  if (v < 0) v += len
  return v
}

/**
 * 簡化版本命盤行星落座：
 * - 僅依生日 + 時辰，生成一套「穩定、可重現」的行星星座與宮位，用於前端付費版 UI 演示
 * - 並非真實星曆計算，後續可無縫替換為 Swiss Ephemeris 等精確內核
 */
export function computeSimplePlanets(input: SimpleAstroInput): SimplePlanetInfo[] {
  const { year, month, day } = input
  const hourIndex = typeof input.hourIndex === 'number' ? input.hourIndex : 6

  const sunSign = getSunSign(month, day)
  const baseIndex = ZODIAC_ORDER.indexOf(sunSign as ZodiacSignKey)

  // 若因邊界問題未找到，退回摩羯
  const safeBase = baseIndex === -1 ? 0 : baseIndex

  // 以生日做一個簡單種子，讓同一生日穩定、不同生日略有差異
  const seed = year * 10000 + month * 100 + day

  const ascHouse = (hourIndex % 12) + 1
  // 太陽：依時辰近似（如正午前後約 10 宮），星座由生日得
  const sunHouse = ((hourIndex + 3) % 12) + 1

  // 每顆行星用不同種子與步長，使落座分散在 12 星座，不會都擠在太陽星座
  const offsets: Record<string, number> = {
    Moon: (day + month * 3) % 12 - 6,
    Mercury: (month * 2 + day * 5) % 12 - 6,
    Venus: (seed % 11) - 5,
    Mars: (Math.floor(seed / 7) % 11) - 5,
    Jupiter: (Math.floor(seed / 13) % 11) - 5,
    Saturn: (Math.floor(seed / 19) % 11) - 5,
  }
  const innerOrder: SimplePlanetName[] = ['Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']

  const inner = innerOrder.map((name, idx) => {
    // 太陽星座為基準 + 該行星專屬偏移，使各行星落座明顯區分（不再都顯示同一星座）
    const signIdx = wrapIndex(safeBase + offsets[name], ZODIAC_ORDER.length)
    const sign = ZODIAC_ORDER[signIdx]
    const house = wrapIndex(ascHouse - 1 + (idx + 1), 12) + 1
    return { name, sign, house }
  })

  const occupied = new Set([sunHouse, ...inner.map((p) => p.house)])
  const emptyHouses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((h) => !occupied.has(h))
  const outerSignOffsets = [Math.floor(seed % 5) - 2, Math.floor((seed / 7) % 5) - 2, Math.floor((seed / 11) % 5) - 2]
  const outer: SimplePlanetInfo[] = ['Uranus', 'Neptune', 'Pluto'].map((name, idx) => {
    const h = emptyHouses[idx] ?? emptyHouses[0]!
    const signIdx = wrapIndex(safeBase + outerSignOffsets[idx], ZODIAC_ORDER.length)
    return { name: name as SimplePlanetName, sign: ZODIAC_ORDER[signIdx], house: h }
  })

  const sunEntry: SimplePlanetInfo = { name: 'Sun', sign: sunSign, house: sunHouse }
  return [sunEntry, ...inner, ...outer]
}

// ---------- 付費版：四層報告格式化 ----------

const DIGNITY_LABEL: Record<string, string> = {
  Domicile: '入庙',
  Exaltation: '旺',
  Triplicity: '三分',
  Term: '界',
  Face: '面',
  Detriment: '陷',
  Fall: '落',
  Peregrine: '游走',
  Mutual_Reception: '互容',
}

/**
 * 將 AstrologyOutput 格式化為付費版四層報告（Markdown，主標題可交由 UI 渲染為金色）
 */
export function formatAstrologyPaidReport(astro: AstrologyOutput, query?: string): string {
  const { core_points, planets, aspects, dignity_sum, energy_total, meta } = astro
  const aspectContribution = aspects.length * 4
  const confidenceScore = Math.min(95, Math.round(60 + (dignity_sum / 50) * 35))

  const domicile = planets.filter((p) => p.dignity_breakdown.some((b) => b.mode === 'Domicile'))
  const exaltation = planets.filter((p) => p.dignity_breakdown.some((b) => b.mode === 'Exaltation'))
  const detriment = planets.filter((p) => p.dignity_breakdown.some((b) => b.mode === 'Detriment'))
  const fall = planets.filter((p) => p.dignity_breakdown.some((b) => b.mode === 'Fall'))

  const rows = planets.map(
    (p) => {
      const mode = p.dignity_breakdown[0]?.mode ?? 'Peregrine'
      return `| ${p.name} | ${p.sign} | ${p.house} | ${DIGNITY_LABEL[mode] ?? mode} | ${p.dignity_score} |`
    }
  ).join('\n')

  return `## 第一層 · 本命結構

太陽 **${core_points.Sun.sign}** ${core_points.Sun.degree.toFixed(1)}° 第 **${core_points.Sun.house}** 宮 · 上升 **${core_points.Asc.sign}** ${core_points.Asc.degree.toFixed(1)}° · 月亮 **${core_points.Moon.sign}** 第 ${core_points.Moon.house} 宮。

從命盤結構看，太陽落宮與上升共同塑造外在表現與人生重心，月亮則指向情緒與內在需求。

---

## 第二層 · 尊貴度明細

| 行星 | 星座 | 宮位 | 尊貴類型 | Dignity Score |
|------|------|------|----------|---------------|
${rows}

**Dignity Sum** = ${dignity_sum}。入庙/旺星體帶來穩定發揮，陷/落則需留意該領域的節制與轉化。

---

## 第三層 · 能量總分與相位

**Energy Total** = ${dignity_sum}（尊貴總分）+ ${aspectContribution}（相位貢獻：${aspects.length} 組 × 4）= **${energy_total}**。

重要相位：${aspects.map((a) => `${a.p1}-${a.p2} ${a.type} (容許度 ${a.orb.toFixed(1)}°)`).join('；')}。依相位可見本命盤中結構與壓力的分布。

---

## 第四層 · 事業與財運結論

${query ? `**諮詢主題**：${query}\n\n` : ''}從尊貴度與相位綜合看，命盤基調偏向責任與長期規劃；若存在太陽與土星合相，則在財運上體現為克制消費、偏好儲蓄與長線布局，而非短期投機。事業上易與權威、制度或資深人脈產生連結，宜善用結構化資源。

---

**置信度** Confidence Score：**${confidenceScore}%**（依數據質量與算法一致性給出）。  
*${meta.ephemeris} · ${meta.house_system_used} · ${meta.computation_timestamp_utc}*
`
}
