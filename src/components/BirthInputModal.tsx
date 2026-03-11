import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { CityEntry } from '@/lib/cities';
import { GROUP_OPTIONS_FOR_DISPLAY } from '@/lib/archives';
import GeoCascadePicker, { GeoSelection } from '@/components/GeoCascadePicker';

/** 分組選項：本人 + 與關係頁完全相同的順序與標籤（archives 統一來源） */
const GROUP_OPTIONS: { value: string; label: string }[] = [
  { value: 'self', label: '本人' },
  ...GROUP_OPTIONS_FOR_DISPLAY,
];

export interface BirthInputResult {
  year: number;
  month: number;
  day: number;
  calendarType?: 'solar' | 'lunar';
  city: CityEntry | null;
  useSolarTime: boolean;
  hourIndex: number;
  gender: 'male' | 'female';
  group?: string;
  name?: string;
}

export interface BirthInputInitialValues {
  year: number;
  month: number;
  day: number;
  hourIndex?: number;
  gender?: 'male' | 'female';
  useSolarTime?: boolean;
  city?: CityEntry | null;
}

interface BirthInputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    year: number,
    month: number,
    day: number,
    city?: CityEntry | null,
    useSolarTime?: boolean,
    hourIndex?: number,
    gender?: 'male' | 'female',
    calendarType?: 'solar' | 'lunar',
    group?: string,
    name?: string,
  ) => void;
  /** 打开时预填（如上次保存的出生资料），避免重复输入 */
  initialValues?: BirthInputInitialValues | null;
  /** 若为 true，则锁定年月日为只读（用于占星补充时间/地点时，避免再次修改生日） */
  lockDate?: boolean;
  /** 預填姓名（如從「已存檔案」補充出生資料時帶入） */
  defaultName?: string;
  /** 預填分組（如從「已存檔案」補充出生資料時帶入） */
  defaultGroup?: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const HOUR_OPTIONS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
/** 時辰對應鐘點區間，與關係頁一致 */
const HOUR_RANGES = ['23:00–01:00', '01:00–03:00', '03:00–05:00', '05:00–07:00', '07:00–09:00', '09:00–11:00', '11:00–13:00', '13:00–15:00', '15:00–17:00', '17:00–19:00', '19:00–21:00', '21:00–23:00'];

const BirthInputModal = ({ open, onClose, onSubmit, initialValues, lockDate, defaultName, defaultGroup }: BirthInputModalProps) => {
  const { t } = useTranslation();
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityEntry | null>(null);
  const [geoSelection, setGeoSelection] = useState<GeoSelection | null>(null);
  const [useSolarTime, setUseSolarTime] = useState(false);
  const [hourIndex, setHourIndex] = useState(6);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [group, setGroup] = useState<string>('self');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [name, setName] = useState('');

  useEffect(() => {
    if (open && initialValues) {
      setYear(String(initialValues.year));
      setMonth(String(initialValues.month));
      setDay(String(initialValues.day));
      setHourIndex(initialValues.hourIndex ?? 6);
      setGender(initialValues.gender ?? 'male');
      setUseSolarTime(initialValues.useSolarTime ?? false);
      setSelectedCity(initialValues.city ?? null);
      setGeoSelection(null);
    }
  }, [open, initialValues]);
  useEffect(() => {
    if (!open) return;
    if (defaultName !== undefined) setName(defaultName);
    else setName('');
    if (defaultGroup !== undefined) setGroup(defaultGroup);
    else setGroup('self');
  }, [open, defaultName, defaultGroup]);

  if (!open) return null;

  const isValid = year && month && day;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(
      Number(year),
      Number(month),
      Number(day),
      selectedCity ?? undefined,
      useSolarTime,
      hourIndex,
      gender,
      calendarType,
      group,
      name.trim() || undefined,
    );
    setYear('');
    setMonth('');
    setDay('');
    setSelectedCity(null);
    setGeoSelection(null);
    setUseSolarTime(false);
    setHourIndex(6);
    setGender('male');
    setGroup('self');
    setCalendarType('solar');
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[2vh] pb-6">
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'hsla(var(--background) / 0.8)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      />

      <div
        className="relative glass-card-highlight w-full max-w-sm max-h-[80vh] overflow-y-auto scrollbar-hide animate-fade-in"
        style={{ animationDuration: '0.3s' }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 p-1.5 rounded-full transition-colors hover:bg-secondary/50"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <X size={18} />
        </button>

        <div className="text-center mb-4 mt-2">
          <div className="text-xl mb-1 text-gold-glow">✦</div>
          <h3 className="text-xl font-bold tracking-[0.28em]" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
            {t('oracle.modalTitle')}
          </h3>
          <p className="text-xs text-muted-foreground mt-2">{t('oracle.modalSubtitle')}</p>
          <div className="mt-3 h-px w-16 mx-auto" style={{ background: 'linear-gradient(90deg, transparent, hsla(var(--gold)/0.9), transparent)' }} />
        </div>

        <div className="space-y-4">
          {/* 公歷 / 農曆 切換 */}
          <div className="flex items-center justify-center gap-3 text-xs">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full border transition-all ${
                calendarType === 'solar'
                  ? 'border border-gold-strong text-gold-strong bg-gold-soft'
                  : 'border-transparent text-muted-foreground bg-transparent'
              }`}
              onClick={() => setCalendarType('solar')}
            >
              公历
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full border transition-all ${
                calendarType === 'lunar'
                  ? 'border border-gold-strong text-gold-strong bg-gold-soft'
                  : 'border-transparent text-muted-foreground bg-transparent'
              }`}
              onClick={() => setCalendarType('lunar')}
            >
              农历
            </button>
          </div>

          {lockDate && initialValues ? (
            <div className="rounded-lg bg-white/3 px-3 py-2 text-xs text-muted-foreground border border-dashed border-white/10">
              <div className="font-medium text-body mb-0.5">已使用命主出生日期</div>
              <div className="font-digit">
                {initialValues.year} 年 {initialValues.month} 月 {initialValues.day} 日
              </div>
              <div className="mt-0.5 text-[10px]">
                若要更换命主或重新填写生日，请在占星页面点「更换出生资料 / 切换对象」。
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="input-label">{t('divination.birthYear', { defaultValue: '年份' })}</label>
                <select
                  className="font-digit glass-select birth-form-select"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">—</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">{t('divination.birthMonth', { defaultValue: '月份' })}</label>
                <select
                  className="font-digit glass-select birth-form-select"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="">—</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">{t('divination.birthDay', { defaultValue: '日期' })}</label>
                <select
                  className="font-digit glass-select birth-form-select"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  <option value="">—</option>
                  {days.map((d) => (
                    <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 出生城市：国家、省份、城市、区县 */}
          <div>
            <label className="input-label">出生国家及城市</label>
            <GeoCascadePicker
              value={geoSelection}
              onChange={(sel) => {
                setGeoSelection(sel);
                if (sel) {
                  setSelectedCity({
                    name: sel.fullNameLocal,
                    nameZh: sel.fullNameLocal,
                    country: sel.countryCode,
                    lat: sel.lat ?? 0,
                    lng: sel.lng ?? 0,
                  });
                } else {
                  setSelectedCity(null);
                }
              }}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              先选国家，再选省份、城市、区县（后续将补全全部国家数据）
            </p>
          </div>

          {/* 出生时辰（八字用），带钟点区间 */}
          <div>
            <label className="input-label">{t('divination.birthHour', { defaultValue: '出生时辰' })}</label>
            <select
              className="font-digit glass-select birth-form-select"
              value={hourIndex}
              onChange={(e) => setHourIndex(Number(e.target.value))}
            >
              {HOUR_OPTIONS.map((name, i) => (
                <option key={i} value={i}>{name}时（{HOUR_RANGES[i]}）</option>
              ))}
            </select>
          </div>

          {/* 性别（八字大运顺逆） */}
          <div>
            <label className="input-label">{t('divination.gender', { defaultValue: '性别' })}</label>
            <select
              className="glass-select"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
            >
              <option value="male">{t('divination.male', { defaultValue: '男' })}</option>
              <option value="female">{t('divination.female', { defaultValue: '女' })}</option>
            </select>
          </div>

          {/* 姓名：保存至帳號／存檔時一併儲存，建議填寫 */}
          <div>
            <label className="input-label">{t('oracle.birthNameLabel', { defaultValue: '姓名' })}</label>
            <input
              type="text"
              placeholder={t('oracle.birthNamePlaceholder', { defaultValue: '选填，保存时一并存档（建议填写）' })}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-select w-full"
              maxLength={32}
            />
          </div>

          {/* 分組：與關係頁／已存檔案一致，方便區分愛人、家人、孩子等 */}
            <div>
            <label className="input-label">{t('oracle.groupLabel', { defaultValue: '分組' })}</label>
            <select
              className="glass-select"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {GROUP_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* 真太阳时 */}
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-colors"
            style={{ background: 'hsla(var(--muted) / 0.3)', border: '1px solid hsla(var(--border) / 0.5)' }}
            onClick={() => setUseSolarTime(!useSolarTime)}
          >
            <div>
              <p className="text-sm text-foreground">{t('divination.solarTime')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('divination.solarTimeDesc')}</p>
            </div>
            <div className={`toggle-switch ${useSolarTime ? 'active' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: isValid
                ? 'linear-gradient(135deg, hsla(var(--gold) / 0.3), hsla(var(--accent) / 0.2))'
                : 'hsla(var(--muted) / 0.3)',
              border: `1px solid ${isValid ? 'hsla(var(--gold) / 0.4)' : 'hsla(var(--border) / 0.3)'}`,
              color: isValid ? 'hsl(var(--gold))' : 'hsl(var(--muted-foreground))',
              fontFamily: 'var(--font-serif)',
              boxShadow: isValid ? '0 0 30px hsla(var(--gold) / 0.1)' : 'none',
            }}
          >
            {t('oracle.saveAndReveal', { defaultValue: t('oracle.revealEnergy') })}
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            {t('oracle.saveToAccountHint', { defaultValue: '' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BirthInputModal;
