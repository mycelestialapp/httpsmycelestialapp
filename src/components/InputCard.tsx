import { useState } from "react";
import { useTranslation } from "react-i18next";

interface InputCardProps {
  name: string;
  setName: (v: string) => void;
  onDivine: (info: DivinationInfo) => void;
}

export interface DivinationInfo {
  name: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  region: string;
  useSolarTime: boolean;
}

const years = Array.from({ length: 100 }, (_, i) => `${2025 - i}`);
const months = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
const hours = [
  "子时 (23:00-01:00)", "丑时 (01:00-03:00)", "寅时 (03:00-05:00)",
  "卯时 (05:00-07:00)", "辰时 (07:00-09:00)", "巳时 (09:00-11:00)",
  "午时 (11:00-13:00)", "未时 (13:00-15:00)", "申时 (15:00-17:00)",
  "酉时 (17:00-19:00)", "戌时 (19:00-21:00)", "亥时 (21:00-23:00)",
  "不确定",
];

const regions = [
  "北京", "上海", "广州", "深圳", "成都", "重庆", "杭州", "武汉",
  "南京", "西安", "长沙", "天津", "苏州", "郑州", "东莞", "青岛",
  "昆明", "大连", "沈阳", "哈尔滨", "福州", "济南", "合肥", "贵阳",
  "南宁", "兰州", "太原", "石家庄", "乌鲁木齐", "拉萨", "呼和浩特",
  "海口", "银川", "西宁", "台北", "香港", "澳门", "海外",
];

const InputCard = ({ name, setName, onDivine }: InputCardProps) => {
  const { t } = useTranslation();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [region, setRegion] = useState("");
  const [useSolarTime, setUseSolarTime] = useState(false);

  const isValid = name.trim() && year && month && day;

  const handleSubmit = () => {
    if (!isValid) return;
    onDivine({ name, year, month, day, hour, region, useSolarTime });
  };

  return (
    <div className="animate-fade-in flex flex-col items-center gap-6">
      {/* Header */}
      <div className="relative text-center">
        <div className="absolute -inset-8 rounded-full blur-3xl" style={{ background: 'hsla(var(--accent) / 0.05)' }} />
        <div className="relative">
          <div className="text-xs tracking-[0.5em] mb-3" style={{ color: 'hsl(var(--accent))' }}>
            ━━ CELESTIAL INSIGHTS ━━
          </div>
          <h1 className="text-4xl font-bold tracking-widest mb-3 text-gold-glow" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('oracle.bazi')}
          </h1>
          <p className="text-xs text-muted-foreground tracking-[0.2em]">{t('oracle.baziDesc')}</p>
        </div>
      </div>

      {/* Main Glass Card */}
      <div className="glass-card w-full space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-primary text-lg">☰</span>
          <span className="text-xs tracking-[0.3em] font-bold input-label">{t('divination.name')}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
        </div>

        <div>
          <input
            type="text"
            className="glass-input"
            placeholder={t('divination.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className="flex items-center gap-2 mt-5 mb-1">
          <span className="text-primary text-lg">☷</span>
          <span className="text-xs tracking-[0.3em] font-bold input-label">生辰八字</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="input-label">{t('divination.birthYear')}</label>
            <select className="glass-select" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">—</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">{t('divination.birthMonth')}</label>
            <select className="glass-select" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">—</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">{t('divination.birthDay')}</label>
            <select className="glass-select" value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">—</option>
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="input-label">{t('divination.birthHour')}</label>
          <select className="glass-select" value={hour} onChange={(e) => setHour(e.target.value)}>
            <option value="">—</option>
            {hours.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 mt-5 mb-1">
          <span className="text-primary text-lg">☵</span>
          <span className="text-xs tracking-[0.3em] font-bold input-label">{t('divination.region')}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
        </div>

        <div>
          <select className="glass-select" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">—</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div
          className="flex items-center justify-between glass-toggle-row cursor-pointer"
          onClick={() => setUseSolarTime(!useSolarTime)}
        >
          <div>
            <p className="text-sm text-foreground">{t('divination.solarTime')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">根据出生地经度修正时辰</p>
          </div>
          <div className={`toggle-switch ${useSolarTime ? "active" : ""}`}>
            <div className="toggle-knob" />
          </div>
        </div>
      </div>

      {/* Orb Button */}
      <div className="flex flex-col items-center gap-3 mt-2">
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="orb-button w-28 h-28 sm:w-32 sm:h-32 animate-float disabled:opacity-30 disabled:cursor-not-allowed disabled:animate-none"
        >
          <div className="absolute inset-0 rounded-full border animate-spin-slow" style={{ borderColor: 'hsla(var(--gold) / 0.3)' }} />
          <div className="absolute inset-2 rounded-full border animate-spin-slow" style={{ borderColor: 'hsla(var(--accent) / 0.2)', animationDirection: 'reverse', animationDuration: '5s' }} />
          <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ background: 'linear-gradient(135deg, hsla(var(--accent) / 0.1), hsla(var(--gold) / 0.1))' }} />
          <span className="text-gold-glow text-base sm:text-lg font-bold tracking-widest z-10" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('divination.divine')}
          </span>
        </button>
        <p className="text-xs text-muted-foreground animate-pulse-glow">
          ✦ {t('divination.loading')} ✦
        </p>
      </div>
    </div>
  );
};

export default InputCard;
