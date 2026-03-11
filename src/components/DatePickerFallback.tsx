/**
 * 日期选择加载失败时的回退：原生日期输入
 */
import { useState } from "react";
import type { BirthValue } from "@/components/NumerologyBirthWheel";

interface DatePickerFallbackProps {
  initialValue: BirthValue | null;
  onSelect: (v: BirthValue) => void;
  onClose: () => void;
}

export default function DatePickerFallback({ initialValue, onSelect, onClose }: DatePickerFallbackProps) {
  const [raw, setRaw] = useState(() => {
    if (!initialValue) return "";
    const { solarYear, solarMonth, solarDay } = initialValue;
    return `${solarYear}-${String(solarMonth).padStart(2, "0")}-${String(solarDay).padStart(2, "0")}`;
  });

  const handleConfirm = () => {
    if (!raw) return;
    const [y, m, d] = raw.split("-").map(Number);
    if (!y || !m || !d) return;
    onSelect({
      calendarType: "solar",
      solarYear: y,
      solarMonth: m,
      solarDay: d,
    });
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <p className="text-sm text-gray-400 text-center">使用公历选择出生日期</p>
      <input
        type="date"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white [color-scheme:dark]"
      />
      <button
        type="button"
        onClick={handleConfirm}
        className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium"
      >
        完成
      </button>
    </div>
  );
}
