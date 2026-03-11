/**
 * Western Occult Logic Kernel v12.0 — TypeScript 型別與占星核心邏輯
 * 對應規格：docs/WESTERN_OCCULT_LOGIC_KERNEL_SPEC.md
 *
 * 內容包含：
 * - 型別定義（INPUT/OUTPUT_SCHEMA）
 * - QUANTITATIVE_DIGNITY_MATRIX / DYNAMIC_ORB_ALGORITHM 及計算函數
 * - 倫敦 1990 出生點之 AstroTestVector mock 數據
 * - validate 錯誤時前端應如何依 KernelValidationError 提示用戶（經緯度 / 精確出生分鐘）
 */

// ========== 頂層與全域 ==========

export const KERNEL_NAME = 'Western_Occult_Universal_Protocol_v12_Industrial' as const
export const KERNEL_VERSION = '12.0' as const

export type SupportedLocale =
  | 'en'
  | 'zh-Hant'
  | 'zh-Hans'
  | 'ja'
  | 'ko'
  | 'es'
  | 'fr'
  | 'ar'

export interface KernelGlobal {
  Locale_Supported: readonly SupportedLocale[]
  Determinism: 'Seeded_RNG'
  Units: {
    Angles: 'Degrees_0_360'
    Time: 'UTC_ISO8601'
    TZ_Offset: 'Seconds'
  }
}

// ========== 1. 占星 Astrology ==========

export interface AstrologyInput {
  /** ISO8601 出生時間，如 1990-01-01T12:00:00Z，須含時、分（精確出生分鐘） */
  birth_iso8601: string
  /** [緯度, 經度]，如倫敦 [51.5074, -0.1278] */
  lat_lng: [number, number]
  /** 時區偏移（秒），如 UTC+8 = 28800 */
  tz_offset: number
  /** 可選，預設 Placidus */
  house_system?: 'Placidus' | 'Whole_Sign' | 'Regiomontanus'
}

// ---------- 尊貴度評分矩陣（核心計算公式） ----------

export const QUANTITATIVE_DIGNITY_MATRIX: Readonly<Record<string, number>> = {
  Domicile: 5,
  Exaltation: 4,
  Triplicity: 3,
  Term: 2,
  Face: 1,
  Detriment: -5,
  Fall: -4,
  Peregrine: -2,
  Mutual_Reception: 4,
} as const

/** 依尊貴明細加總得到單一行星尊貴分數 */
export function computeDignityScore(breakdown: { mode: string; value: number }[]): number {
  return breakdown.reduce((sum, item) => sum + item.value, 0)
}

/** 依矩陣取得單一模式的數值（供上游組裝 breakdown 用） */
export function getDignityValue(mode: keyof typeof QUANTITATIVE_DIGNITY_MATRIX): number {
  return QUANTITATIVE_DIGNITY_MATRIX[mode] ?? 0
}

// ---------- 動態容許度算法（相位權重） ----------

export const DYNAMIC_ORB_BASE: Readonly<Record<string, number>> = {
  Conj: 10,
  Oppo: 10,
  Trine: 8,
  Square: 8,
  Sextile: 6,
} as const

export const DYNAMIC_ORB_WEIGHTS: Readonly<Record<string, number>> = {
  Sun: 1.5,
  Moon: 1.5,
  Personal: 1.0,
  Jupiter_Saturn: 0.8,
  Outer: 0.5,
} as const

/**
 * 動態容許度公式：Actual_Orb = Base_Orb * (P1_Weight + P2_Weight) / 2
 * @param aspectType 相位類型
 * @param p1Weight 行星1權重（可從 DYNAMIC_ORB_WEIGHTS 取）
 * @param p2Weight 行星2權重
 * @returns 該相位允許的最大容許度（度）
 */
export function computeMaxOrb(
  aspectType: keyof typeof DYNAMIC_ORB_BASE,
  p1Weight: number,
  p2Weight: number
): number {
  const base = DYNAMIC_ORB_BASE[aspectType] ?? 8
  return (base * (p1Weight + p2Weight)) / 2
}

export type DignityMode = keyof typeof QUANTITATIVE_DIGNITY_MATRIX

export interface DignityBreakdownItem {
  mode: DignityMode
  value: number
}

export interface CorePoint {
  sign: string
  degree: number
  house?: number
}

export interface AstrologyPlanetOutput {
  name: string
  sign: string
  degree: number
  house: number
  dignity_score: number
  dignity_breakdown: DignityBreakdownItem[]
}

export type AspectType = 'Conj' | 'Oppo' | 'Trine' | 'Square' | 'Sextile'

export interface AstrologyAspect {
  p1: string
  p2: string
  type: AspectType
  orb: number
  max_orb: number
  is_within_orb: boolean
}

export interface AstrologyOutput {
  core_points: {
    Sun: CorePoint
    Moon: CorePoint
    Asc: Omit<CorePoint, 'house'>
    [key: string]: CorePoint | Omit<CorePoint, 'house'>
  }
  planets: AstrologyPlanetOutput[]
  aspects: AstrologyAspect[]
  dignity_sum: number
  /** 能量總分：尊貴總分 + 相位貢獻（可為 dignity_sum + 加權相位數等） */
  energy_total: number
  meta: {
    house_system_used: string
    ephemeris: string
    computation_timestamp_utc: string
  }
}

// ========== 2. 雷諾曼 Lenormand ==========

export interface LenormandCardInput {
  card: string
  house: string
  position: { row: number; col: number }
}

export interface LenormandInput {
  layout: string
  cards: LenormandCardInput[]
  significator?: string
}

export interface LenormandSpatialMetric {
  card: string
  distance: number
  distance_bucket: 'near' | 'medium' | 'far'
  knighting_links: string[]
  mirrored_positions: Array<{ row: number; col: number }>
}

export interface LenormandOutput {
  spatial: {
    reference: string
    metrics: LenormandSpatialMetric[]
  }
  syntactic_interpretation: {
    core_phrase: string
    evidence: string[]
    confidence: number
  }
  meta: {
    layout: string
    card_count: number
  }
}

// ========== 3. 塔羅 Tarot ==========

export interface TarotInput {
  question?: string
  spread_type: string
  seed_override?: string
}

export interface TarotSlotOutput {
  id: string
  card_id: string
  upright: boolean
  element: string
  position_weight: number
  element_interaction_weight: number
  slot_score: number
}

export interface TarotOutput {
  seed_used: string
  spread_type: string
  slots: TarotSlotOutput[]
  overall_theme: string
  confidence: number
}

// ========== 4. 數字命理 Numerology ==========

export interface NumerologyInput {
  birth_date: string
  full_name: string
}

export interface NumerologyPillarValue {
  value: number
  is_master: boolean
  karmic_debts?: number[]
}

export interface NumerologyOutput {
  life_path: NumerologyPillarValue
  expression: Omit<NumerologyPillarValue, 'karmic_debts'>
  soul_urge: Omit<NumerologyPillarValue, 'karmic_debts'>
  personality: Omit<NumerologyPillarValue, 'karmic_debts'>
}

// ========== 5. Orchestrator 融合 ==========

export type OrchestratorModuleName = 'Astrology' | 'Tarot' | 'Lenormand' | 'Numerology'

export interface EnergyVector {
  fire: number
  water: number
  air: number
  earth: number
}

export interface ModuleSummary {
  module: OrchestratorModuleName
  energy_vector: EnergyVector
  local_confidence: number
}

export interface OrchestratorOutput {
  modules_used: string[]
  module_summaries: ModuleSummary[]
  fused_theme: string
  fused_advice: string
  confidence_score: number
}

// ========== 校驗錯誤 ==========

export interface KernelValidationError {
  code: 'MISSING_FIELD' | 'INVALID_TYPE' | 'OUT_OF_RANGE'
  field: string
  message?: string
}

/**
 * 編排邏輯：當 validate 返回 errors 時，前端應根據此對照表提示用戶補充內容。
 * 用法：用 getValidationUserMessages(errors) 得到可顯示的文案陣列。
 */
export const VALIDATION_ERROR_USER_MESSAGES: Readonly<
  Record<string, Partial<Record<SupportedLocale, string>>>
> = {
  birth_iso8601: {
    'zh-Hant': '請補充精確出生時間（至少到分鐘），例如 1990-01-01 12:30',
    'zh-Hans': '请补充精确出生时间（至少到分钟），例如 1990-01-01 12:30',
    en: 'Please provide precise birth time (at least to the minute), e.g. 1990-01-01 12:30',
  },
  lat_lng: {
    'zh-Hant': '請補充出生地經緯度（或選擇城市），以計算上升星座與宮位',
    'zh-Hans': '请补充出生地经纬度（或选择城市），以计算上升星座与宫位',
    en: 'Please provide birth place coordinates (or select city) for rising sign and houses',
  },
  tz_offset: {
    'zh-Hant': '請補充出生地時區，以正確換算星盤時間',
    'zh-Hans': '请补充出生地时区，以正确换算星盘时间',
    en: 'Please provide birth place timezone for correct chart time',
  },
  input: {
    'zh-Hant': '輸入格式不正確，請檢查後重試',
    'zh-Hans': '输入格式不正确，请检查后重试',
    en: 'Invalid input format, please check and try again',
  },
} as const

export type ValidationMessageLocale = SupportedLocale | 'en'

/**
 * 將 KernelValidationError[] 轉為給用戶看的提示文案（依 field 與 locale）。
 * 前端在 validate 返回非空時調用此函數，並將返回的字符串陣列展示給用戶。
 */
export function getValidationUserMessages(
  errors: KernelValidationError[],
  locale: ValidationMessageLocale = 'zh-Hant'
): string[] {
  const seen = new Set<string>()
  return errors.map((e) => {
    const key = e.field in VALIDATION_ERROR_USER_MESSAGES ? e.field : 'input'
    const msgMap = VALIDATION_ERROR_USER_MESSAGES[key]
    const msg = msgMap?.[locale] ?? msgMap?.en ?? e.message ?? `Missing or invalid: ${e.field}`
    return seen.has(msg) ? '' : (seen.add(msg), msg)
  }).filter(Boolean)
}

// ========== Test Vectors（含倫敦 1990 mock） ==========

export interface AstroTestVector {
  In: AstrologyInput
  Expected: {
    core_points?: Partial<AstrologyOutput['core_points']>
    planets?: Array<Partial<AstrologyPlanetOutput>>
    aspects?: Array<Partial<AstrologyAspect>>
    dignity_sum?: number
    energy_total?: number
  }
}

/** 倫敦 1990 出生點：用於單元測試與 mock 的完整 AstroTestVector 示例數據 */
export const ASTRO_TEST_LONDON_1990: AstroTestVector = {
  In: {
    birth_iso8601: '1990-01-01T12:00:00Z',
    lat_lng: [51.5074, -0.1278],
    tz_offset: 0,
    house_system: 'Placidus',
  },
  Expected: {
    core_points: {
      Sun: { sign: 'CP', degree: 10.2, house: 10 },
      Moon: { sign: 'AQ', degree: 5.1, house: 9 },
      Asc: { sign: 'AR', degree: 15.1 },
    },
    planets: [
      { name: 'Sun', sign: 'CP', degree: 10.2, house: 10, dignity_score: 5, dignity_breakdown: [{ mode: 'Domicile', value: 5 }] },
      { name: 'Moon', sign: 'AQ', degree: 5.1, house: 9, dignity_score: 3, dignity_breakdown: [{ mode: 'Triplicity', value: 3 }] },
      { name: 'Mercury', sign: 'CP', degree: 22.0, house: 10, dignity_score: 2, dignity_breakdown: [{ mode: 'Term', value: 2 }] },
      { name: 'Venus', sign: 'AQ', degree: 18.5, house: 9, dignity_score: 3, dignity_breakdown: [{ mode: 'Triplicity', value: 3 }] },
      { name: 'Mars', sign: 'SG', degree: 8.0, house: 8, dignity_score: 1, dignity_breakdown: [{ mode: 'Face', value: 1 }] },
      { name: 'Jupiter', sign: 'CN', degree: 14.2, house: 4, dignity_score: 4, dignity_breakdown: [{ mode: 'Exaltation', value: 4 }] },
      { name: 'Saturn', sign: 'CP', degree: 26.0, house: 11, dignity_score: 5, dignity_breakdown: [{ mode: 'Domicile', value: 5 }] },
    ],
    aspects: [
      { p1: 'Sun', p2: 'Saturn', type: 'Conj', orb: 2.2, max_orb: 10, is_within_orb: true },
      { p1: 'Moon', p2: 'Venus', type: 'Trine', orb: 1.5, max_orb: 8, is_within_orb: true },
    ],
    dignity_sum: 23,
    energy_total: 31,
  },
}

export interface LenormandTestVector {
  In: LenormandInput
  Expected: {
    syntactic_interpretation: Pick<
      LenormandOutput['syntactic_interpretation'],
      'core_phrase' | 'confidence'
    >
  }
}

export interface TestVectors {
  ASTRO_V1: AstroTestVector
  ASTRO_TEST_LONDON_1990: AstroTestVector
  LENORMAND_V1: LenormandTestVector
}

export const TEST_VECTORS: TestVectors = {
  ASTRO_V1: {
    In: {
      birth_iso8601: '1990-01-01T12:00:00Z',
      lat_lng: [51.5, -0.12],
      tz_offset: 0,
    },
    Expected: {
      core_points: {
        Sun: { sign: 'CP', degree: 10.2 },
        Asc: { sign: 'AR', degree: 15.1 },
      },
      dignity_sum: 12,
      energy_total: 12,
    },
  },
  ASTRO_TEST_LONDON_1990,
  LENORMAND_V1: {
    In: {
      layout: 'Grand_Tableau_36',
      cards: [
        { card: 'Heart', house: 'H25_Ring', position: { row: 3, col: 5 } },
        { card: 'Scythe', house: 'H24_Heart', position: { row: 2, col: 6 } },
      ],
    },
    Expected: {
      syntactic_interpretation: {
        core_phrase: 'Danger_to_Marriage',
        confidence: 0.85,
      },
    },
  },
}

// ========== 輸入校驗（規格：缺項需提示補充） ==========

/** 檢查是否為完整 ISO8601 日期時間（含 T 與時分），若僅日期則需提示精確出生分鐘 */
function hasPreciseBirthTime(iso: string): boolean {
  if (!iso || typeof iso !== 'string') return false
  const trimmed = iso.trim()
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) return false
  return true
}

/**
 * 校驗占星模塊輸入；缺項時回傳錯誤列表，通過則回傳空陣列。
 * 前端收到錯誤後應使用 getValidationUserMessages(errors, locale) 取得對應「經緯度」「精確出生分鐘」等提示。
 */
export function validateAstrologyInput(input: unknown): KernelValidationError[] {
  const errs: KernelValidationError[] = []
  if (!input || typeof input !== 'object') {
    errs.push({ code: 'INVALID_TYPE', field: 'input', message: 'Input must be an object' })
    return errs
  }
  const o = input as Record<string, unknown>

  if (typeof o.birth_iso8601 !== 'string' || !o.birth_iso8601.trim()) {
    errs.push({ code: 'MISSING_FIELD', field: 'birth_iso8601' })
  } else if (!hasPreciseBirthTime(o.birth_iso8601)) {
    errs.push({
      code: 'MISSING_FIELD',
      field: 'birth_iso8601',
      message: 'Need precise birth time (hour and minute), e.g. YYYY-MM-DDTHH:MM',
    })
  }

  if (!Array.isArray(o.lat_lng) || o.lat_lng.length !== 2) {
    errs.push({ code: 'MISSING_FIELD', field: 'lat_lng', message: 'Must be [latitude, longitude]' })
  } else if (
    typeof o.lat_lng[0] !== 'number' ||
    typeof o.lat_lng[1] !== 'number' ||
    Number.isNaN(o.lat_lng[0]) ||
    Number.isNaN(o.lat_lng[1])
  ) {
    errs.push({ code: 'INVALID_TYPE', field: 'lat_lng', message: 'lat_lng must be [number, number]' })
  }

  if (typeof o.tz_offset !== 'number') {
    errs.push({ code: 'MISSING_FIELD', field: 'tz_offset' })
  }

  return errs
}

export function validateLenormandInput(input: unknown): KernelValidationError[] {
  const errs: KernelValidationError[] = []
  if (!input || typeof input !== 'object') {
    errs.push({ code: 'INVALID_TYPE', field: 'input', message: 'Input must be an object' })
    return errs
  }
  const o = input as Record<string, unknown>
  if (typeof o.layout !== 'string' || !o.layout) {
    errs.push({ code: 'MISSING_FIELD', field: 'layout' })
  }
  if (!Array.isArray(o.cards)) {
    errs.push({ code: 'MISSING_FIELD', field: 'cards', message: 'Must be array of card objects' })
  }
  return errs
}

export function validateTarotInput(input: unknown): KernelValidationError[] {
  const errs: KernelValidationError[] = []
  if (!input || typeof input !== 'object') {
    errs.push({ code: 'INVALID_TYPE', field: 'input', message: 'Input must be an object' })
    return errs
  }
  const o = input as Record<string, unknown>
  if (typeof o.spread_type !== 'string' || !o.spread_type) {
    errs.push({ code: 'MISSING_FIELD', field: 'spread_type' })
  }
  return errs
}

export function validateNumerologyInput(input: unknown): KernelValidationError[] {
  const errs: KernelValidationError[] = []
  if (!input || typeof input !== 'object') {
    errs.push({ code: 'INVALID_TYPE', field: 'input', message: 'Input must be an object' })
    return errs
  }
  const o = input as Record<string, unknown>
  if (typeof o.birth_date !== 'string' || !o.birth_date) {
    errs.push({ code: 'MISSING_FIELD', field: 'birth_date' })
  }
  if (typeof o.full_name !== 'string' || !o.full_name) {
    errs.push({ code: 'MISSING_FIELD', field: 'full_name' })
  }
  return errs
}
