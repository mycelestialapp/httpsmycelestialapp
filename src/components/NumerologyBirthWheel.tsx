/**
 * 数字命理 · 出生日期滚轮选择
 * 新历 / 阴历 双界面，三列滚轮
 */
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import DateWheelColumn from "@/components/DateWheelPicker";
import {
  getSolarYears,
  getSolarMonths,
  getSolarDaysInMonth,
  getLunarYears,
  getLunarMonths,
  getLunarDays,
  lunarToSolar,
  solarToLunar,
} from "@/lib/lunarPicker";

export type CalendarType = "solar" | "lunar";

export interface BirthValue {
  calendarType: CalendarType;
  /** 公历 y/m/d，用于提交与存储 */
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  /** 阴历时才有：农历 y/m/d、是否闰月 */
  lunarYear?: number;
  lunarMonth?: number;
  lunarDay?: number;
  isLeapMonth?: boolean;
}

interface NumerologyBirthWheelProps {
  value: BirthValue | null;
  onChange: (v: BirthValue | null) => void;
  onConfirm?: () => void;
  className?: string;
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const currentDay = new Date().getDate();

const defaultSolar: BirthValue = {
  calendarType: "solar",
  solarYear: currentYear,
  solarMonth: currentMonth,
  solarDay: Math.min(currentDay, 28),
};

function NumerologyBirthWheel({ value, onChange, onConfirm, className }: NumerologyBirthWheelProps) {
  const [tab, setTab] = useState<CalendarType>(value?.calendarType ?? "solar");

  const solarY = value?.solarYear ?? currentYear;
  const solarM = value?.solarMonth ?? currentMonth;
  const solarD = value?.solarDay ?? Math.min(currentDay, 28);

  const lunarInfo = useMemo(() => solarToLunar(solarY, solarM, solarD), [solarY, solarM, solarD]);
  const lunarY = value?.lunarYear ?? lunarInfo?.lYear ?? currentYear;
  const lunarM = value?.lunarMonth ?? lunarInfo?.lMonth ?? 1;
  const lunarD = value?.lunarDay ?? lunarInfo?.lDay ?? 1;
  const isLeap = value?.isLeapMonth ?? lunarInfo?.isLeap ?? false;

  useEffect(() => {
    setTab(value?.calendarType ?? "solar");
  }, [value?.calendarType]);

  const solarYears = useMemo(() => getSolarYears(), []);
  const solarMonths = useMemo(() => getSolarMonths(), []);
  const solarDays = useMemo(
    () => getSolarDaysInMonth(solarY, solarM),
    [solarY, solarM]
  );

  const lunarYears = useMemo(() => getLunarYears(), []);
  const lunarMonths = useMemo(() => getLunarMonths(), []);
  const lunarDays = useMemo(() => getLunarDays(), []);

  const solarYearOptions = useMemo(
    () => solarYears.map((y) => ({ value: y, label: `${y}年` })),
    [solarYears]
  );
  const solarMonthOptions = useMemo(
    () => solarMonths.map((m) => ({ value: m, label: `${m}月` })),
    [solarMonths]
  );
  const solarDayOptions = useMemo(
    () =>
      Array.from({ length: solarDays }, (_, i) => i + 1).map((d) => ({
        value: d,
        label: `${d}日`,
      })),
    [solarDays]
  );

  const lunarYearOptions = useMemo(
    () => lunarYears.map((y) => ({ value: y, label: `${y}年` })),
    [lunarYears]
  );
  const lunarMonthOptions = useMemo(
    () => lunarMonths.map((m) => ({ value: m, label: `${m}月` })),
    [lunarMonths]
  );
  const lunarDayOptions = useMemo(
    () => lunarDays.map((d) => ({ value: d, label: `${d}日` })),
    [lunarDays]
  );

  const clampSolarDay = (y: number, m: number, d: number) =>
    Math.min(d, getSolarDaysInMonth(y, m));

  const handleSolarChange = (year: number, month: number, day: number) => {
    const clampedDay = clampSolarDay(year, month, day);
    onChange({
      calendarType: "solar",
      solarYear: year,
      solarMonth: month,
      solarDay: clampedDay,
    });
  };

  const handleLunarChange = (year: number, month: number, day: number, leap: boolean) => {
    const converted = lunarToSolar(year, month, day, leap);
    if (!converted) return;
    onChange({
      calendarType: "lunar",
      solarYear: converted.year,
      solarMonth: converted.month,
      solarDay: converted.day,
      lunarYear: year,
      lunarMonth: month,
      lunarDay: day,
      isLeapMonth: leap,
    });
  };

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5 overflow-hidden", className)}>
      {/* 新历 / 阴历 切换 */}
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setTab("solar")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            tab === "solar"
              ? "text-amber-300 bg-amber-500/10 border-b-2 border-amber-400"
              : "text-gray-400 hover:text-gray-300"
          )}
        >
          新历
        </button>
        <button
          type="button"
          onClick={() => setTab("lunar")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            tab === "lunar"
              ? "text-amber-300 bg-amber-500/10 border-b-2 border-amber-400"
              : "text-gray-400 hover:text-gray-300"
          )}
        >
          阴历
        </button>
      </div>

      {tab === "solar" && (
        <div className="flex w-full" style={{ minHeight: 44 * 5 }}>
          <DateWheelColumn
            aria-label="年"
            options={solarYearOptions}
            value={solarY}
            onChange={(v) => handleSolarChange(v as number, solarM, solarD)}
          />
          <DateWheelColumn
            aria-label="月"
            options={solarMonthOptions}
            value={solarM}
            onChange={(v) =>
              handleSolarChange(solarY, v as number, Math.min(solarD, getSolarDaysInMonth(solarY, v as number)))
            }
          />
          <DateWheelColumn
            aria-label="日"
            options={solarDayOptions}
            value={Math.min(solarD, solarDays)}
            onChange={(v) => handleSolarChange(solarY, solarM, v as number)}
          />
        </div>
      )}

      {tab === "lunar" && (
        <>
          <div className="flex w-full" style={{ minHeight: 44 * 5 }}>
            <DateWheelColumn
              aria-label="农历年"
              options={lunarYearOptions}
              value={lunarY}
              onChange={(v) => handleLunarChange(v as number, lunarM, lunarD, isLeap)}
            />
            <DateWheelColumn
              aria-label="农历月"
              options={lunarMonthOptions}
              value={lunarM}
              onChange={(v) => handleLunarChange(lunarY, v as number, lunarD, isLeap)}
            />
            <DateWheelColumn
              aria-label="农历日"
              options={lunarDayOptions}
              value={lunarD}
              onChange={(v) => handleLunarChange(lunarY, lunarM, v as number, isLeap)}
            />
          </div>
          {/* 闰月 */}
          <div className="flex items-center justify-center gap-2 py-3 border-t border-white/10">
            <span className="text-sm text-gray-400">闰月</span>
            <button
              type="button"
              role="switch"
              aria-checked={isLeap}
              onClick={() => handleLunarChange(lunarY, lunarM, lunarD, !isLeap)}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 rounded-full border transition-colors",
                isLeap ? "border-amber-400/50 bg-amber-500/20" : "border-white/20 bg-white/5"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-6 w-6 rounded-full bg-amber-400 shadow transition-transform mt-0.5",
                  isLeap ? "translate-x-6 ml-0.5" : "translate-x-1"
                )}
              />
            </button>
            <span className="text-sm text-gray-400">{isLeap ? "是" : "否"}</span>
          </div>
        </>
      )}

      {onConfirm && (
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              if (!value && tab === "solar") {
                onChange({
                  calendarType: "solar",
                  solarYear: solarY,
                  solarMonth: solarM,
                  solarDay: Math.min(solarD, getSolarDaysInMonth(solarY, solarM)),
                });
              } else if (!value && tab === "lunar") {
                const converted = lunarToSolar(lunarY, lunarM, lunarD, isLeap);
                if (converted)
                  onChange({
                    calendarType: "lunar",
                    ...converted,
                    lunarYear: lunarY,
                    lunarMonth: lunarM,
                    lunarDay: lunarD,
                    isLeapMonth: isLeap,
                  });
              }
              onConfirm();
            }}
            className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-colors"
          >
            完成
          </button>
        </div>
      )}
    </div>
  );
}

export default NumerologyBirthWheel;
