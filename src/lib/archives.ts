import type { CityEntry } from '@/lib/cities';

export const ARCHIVES_KEY = 'celestial_archives';

/** 阅读页从档案进入时暂存，用于刷新恢复 */
export const READING_ARCHIVE_KEY = 'celestial_reading_archive';
export const READING_FROM_ARCHIVE_FLAG = 'celestial_reading_from_archive';

/** 上次填写的出生资料（时间+地点），用于占星/八字再次进入时自动带出，避免重复输入 */
export const LAST_BIRTH_KEY = 'celestial_last_birth';

export interface LastBirthData {
  year: number;
  month: number;
  day: number;
  /** 儲存時一併保存的姓名（本人可填暱稱，方便辨識） */
  name?: string;
  hourIndex?: number;
  gender?: 'male' | 'female';
  useSolarTime?: boolean;
  city?: { name: string; nameZh?: string; country: string; lat: number; lng: number };
}

export function saveLastBirth(data: LastBirthData): void {
  try {
    localStorage.setItem(LAST_BIRTH_KEY, JSON.stringify(data));
  } catch (_) {}
}

export function loadLastBirth(): LastBirthData | null {
  try {
    const raw = localStorage.getItem(LAST_BIRTH_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as LastBirthData;
    if (typeof d.year !== 'number' || typeof d.month !== 'number' || typeof d.day !== 'number') return null;
    return d;
  } catch {
    return null;
  }
}

/** 存档中的出生数据，用于「查看命盤」 */
export interface ArchiveBirthData {
  year: number;
  month: number;
  day: number;
  hourIndex?: number;
  gender?: 'male' | 'female';
  useSolarTime?: boolean;
  calendarType?: 'solar' | 'lunar';
  city?: { name: string; nameZh?: string; country: string; lat: number; lng: number };
}

/** 存档中保存的当时解读（如数字命理结果），用于在命盘档案中回看 */
export interface SavedReadingItem {
  key: string;
  label: string;
  value: number;
  title: string;
  core: string;
  advice: string;
  oracle?: string;
}

export type SavedReading = {
  type: 'numerology';
  items: SavedReadingItem[];
};

export interface ArchiveEntry {
  id: string;
  name: string;
  group: string;
  createdAt: string;
  birthData?: ArchiveBirthData;
  /** 保存时的解读内容（如数字命理的五数+解读），在档案详情中展示 */
  savedReading?: SavedReading;
}

/** 從檔案條目取得出生年月日（相容舊資料的 solarYear/solarMonth/solarDay） */
export function getArchiveBirthDate(entry: ArchiveEntry): { year: number; month: number; day: number } | null {
  const b = entry.birthData;
  if (!b) return null;
  const raw = b as ArchiveBirthData & { solarYear?: number; solarMonth?: number; solarDay?: number };
  const year = b.year ?? raw.solarYear;
  const month = b.month ?? raw.solarMonth;
  const day = b.day ?? raw.solarDay;
  if (year == null || month == null || day == null) return null;
  return { year, month, day };
}

/** 分組 key 的顯示順序，關係頁與填寫彈窗共用，保證一致（已移除「孩子」） */
export const GROUP_KEYS_ORDER: string[] = [
  'lover', 'family', 'classmate', 'friend',
  'client', 'coworker', 'leader', 'ex', 'affair',
];

/** 分組標籤：統一簡體中文，與填寫彈窗、關係頁一致 */
export const GROUP_LABELS: Record<string, string> = {
  lover: '爱人',
  family: '家人',
  classmate: '同学',
  friend: '朋友',
  client: '客户',
  coworker: '同事',
  leader: '领导',
  ex: '前任',
  affair: '情人',
};

/**
 * 分組選項：填寫彈窗的下拉與關係頁的篩選 Tab 共用此列表，數量與順序必須完全一致。
 * 填寫時 = 本人 + 本列表；關係頁 = 全部 + 本列表。
 */
export const GROUP_OPTIONS_FOR_DISPLAY: { value: string; label: string }[] = [
  ...GROUP_KEYS_ORDER.map((key) => ({ value: key, label: GROUP_LABELS[key] ?? key })),
];

export interface SaveToArchivesOptions {
  /** 保存时的解读内容（如数字命理），会在档案详情中展示 */
  savedReading?: SavedReading;
}

/**
 * 寫入 localStorage 檔案列表（命盤/占卜/閱讀頁共用），含本人與各分組。
 * 若已存在「同姓名+同分組」的條目，則只更新該條目的出生資料與解讀（不重複新增）。
 */
export function saveToArchivesIfNeeded(
  group: string | undefined,
  name: string | undefined,
  birth: {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    hourIndex?: number;
    gender?: 'male' | 'female';
    useSolarTime?: boolean;
    calendarType?: 'solar' | 'lunar';
    city?: CityEntry | null;
  },
  options?: SaveToArchivesOptions,
): void {
  if (!group) return;
  try {
    const list: ArchiveEntry[] = JSON.parse(localStorage.getItem(ARCHIVES_KEY) || '[]');
    const displayName = (name && name.trim()) || (group === 'self' ? '本人' : GROUP_LABELS[group]) || group;
    const { city, ...rest } = birth;
    const birthData: ArchiveEntry['birthData'] = {
      year: birth.solarYear,
      month: birth.solarMonth,
      day: birth.solarDay,
      hourIndex: rest.hourIndex,
      gender: rest.gender,
      useSolarTime: rest.useSolarTime,
      calendarType: rest.calendarType,
      city: city
        ? { name: city.name, nameZh: city.nameZh, country: city.country, lat: city.lat, lng: city.lng }
        : undefined,
    };
    const savedReading = options?.savedReading;
    const existingIdx = list.findIndex(
      (e) => e.group === group && (e.name || '').trim() === displayName.trim()
    );
    if (existingIdx >= 0) {
      list[existingIdx] = {
        ...list[existingIdx],
        name: displayName,
        birthData,
        ...(savedReading ? { savedReading } : {}),
      };
    } else {
      list.push({
        id: Date.now().toString(),
        name: displayName,
        group,
        createdAt: new Date().toISOString(),
        birthData,
        ...(savedReading ? { savedReading } : {}),
      });
    }
    localStorage.setItem(ARCHIVES_KEY, JSON.stringify(list));
  } catch (_) {}
}

/**
 * 為已存在的檔案條目補充或更新出生資料（從「已存檔案」點「補充出生資料」後提交時調用）
 */
export function updateArchiveBirthData(
  archiveId: string,
  birth: {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    hourIndex?: number;
    gender?: 'male' | 'female';
    useSolarTime?: boolean;
    calendarType?: 'solar' | 'lunar';
    city?: { name: string; nameZh?: string; country: string; lat: number; lng: number } | null;
  },
): void {
  try {
    const list: ArchiveEntry[] = JSON.parse(localStorage.getItem(ARCHIVES_KEY) || '[]');
    const idx = list.findIndex((e) => e.id === archiveId);
    if (idx === -1) return;
    const { city, ...rest } = birth;
    list[idx] = {
      ...list[idx],
      birthData: {
        year: birth.solarYear,
        month: birth.solarMonth,
        day: birth.solarDay,
        hourIndex: rest.hourIndex,
        gender: rest.gender,
        useSolarTime: rest.useSolarTime,
        calendarType: rest.calendarType,
        city: city
          ? { name: city.name, nameZh: city.nameZh, country: city.country, lat: city.lat, lng: city.lng }
          : undefined,
      },
    };
    localStorage.setItem(ARCHIVES_KEY, JSON.stringify(list));
  } catch (_) {}
}
