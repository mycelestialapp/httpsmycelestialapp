import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOUR_OPTIONS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const HOUR_RANGES = [
  "23:00–01:00", "01:00–03:00", "03:00–05:00", "05:00–07:00", "07:00–09:00", "09:00–11:00",
  "11:00–13:00", "13:00–15:00", "15:00–17:00", "17:00–19:00", "19:00–21:00", "21:00–23:00",
];

const NumerologyHomeInputCard = () => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hourIndex, setHourIndex] = useState(6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      <GlassCard glowColor="gold" className="p-8 md:p-12">
        <h1 className="font-display text-h1 md:text-display-sm text-gold-light text-center mb-4">
          解锁你的宇宙数字
        </h1>
        <p className="text-center text-body text-gray-400 mb-8">
          输入姓名、出生日期与时辰，开启命理之旅
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-caption font-medium text-gray-300 mb-2 ml-1">
              你的全名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：张明"
              className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition text-white text-body placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-caption font-medium text-gray-300 mb-2 ml-1">
              出生日期
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="font-mono w-full px-3 py-4 bg-black/30 border border-white/10 rounded-xl text-white [color-scheme:dark] text-body focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition"
                aria-label="年"
              >
                <option value="">年</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="font-mono w-full px-3 py-4 bg-black/30 border border-white/10 rounded-xl text-white [color-scheme:dark] text-body focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition"
                aria-label="月"
              >
                <option value="">月</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                ))}
              </select>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="font-mono w-full px-3 py-4 bg-black/30 border border-white/10 rounded-xl text-white [color-scheme:dark] text-body focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition"
                aria-label="日"
              >
                <option value="">日</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-caption font-medium text-gray-300 mb-2 ml-1">
              出生时辰
            </label>
            <select
              value={hourIndex}
              onChange={(e) => setHourIndex(Number(e.target.value))}
              className="font-mono w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white [color-scheme:dark] text-body focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition"
              aria-label="时辰"
            >
              {HOUR_OPTIONS.map((name, i) => (
                <option key={i} value={i}>{name}时（{HOUR_RANGES[i]}）</option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-gold-deep to-gold-light text-cosmic font-bold rounded-xl shadow-lg shadow-gold-deep/20 hover:shadow-gold-light/30 transition-all duration-300"
          >
            揭示我的数字命运
          </motion.button>
        </div>

        <p className="text-center text-caption text-gray-500 mt-6">
          ✦ 已有 <span className="font-mono">128,431</span> 人解锁 ✦
        </p>
      </GlassCard>
    </motion.div>
  );
};

export default NumerologyHomeInputCard;
