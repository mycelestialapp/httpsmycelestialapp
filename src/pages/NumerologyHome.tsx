/**
 * Celestial 数字命理 · 空灵之境
 * 首页：姓名 + 出生日期（年/月/日）+ 时辰，提交跳转结果页；底部入口：图书馆、流年。
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOUR_OPTIONS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const HOUR_RANGES = [
  "23:00–01:00", "01:00–03:00", "03:00–05:00", "05:00–07:00", "07:00–09:00", "09:00–11:00",
  "11:00–13:00", "13:00–15:00", "15:00–17:00", "17:00–19:00", "19:00–21:00", "21:00–23:00",
];

export default function NumerologyHome() {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hourIndex, setHourIndex] = useState(6);
  const [lifePathMethod, setLifePathMethod] = useState<"sumDigits" | "fullSum">("sumDigits");
  const navigate = useNavigate();

  const hasDate = year && month && day;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hasDate) return;
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    const utcDate = new Date(Date.UTC(y, m - 1, d));
    navigate("/numerology/result", {
      state: {
        name: name.trim(),
        birthDate: utcDate.toISOString(),
        hourIndex,
        birthDateLabel: `${year}年${month}月${day}日 ${HOUR_OPTIONS[hourIndex]}时`,
        lifePathMethod,
      },
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cosmic">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.15),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.1),_transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FBBF24' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative w-full max-w-xl mx-4">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-2xl" />
        <div className="relative p-8 md:p-10">
          <div className="flex items-center justify-center space-x-1.5 mb-5">
            <span className="text-body-sm font-light text-gold/60">+</span>
            <span className="font-display text-body-sm font-light tracking-widest text-gold-light">
              CELESTIAL
            </span>
          </div>

          <h1 className="text-center mb-3">
            <span className="block font-display text-h1 font-light text-white">
              解锁你的宇宙
            </span>
            <span className="block font-display text-display-md font-bold bg-gradient-to-r from-gold-light via-white to-gold-light bg-clip-text text-transparent mt-1">
              数字
            </span>
          </h1>

          <p className="text-center text-body text-gray-400 mb-6 tracking-wide">
            输入姓名、出生日期与时辰，开启命理之旅
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-caption text-gray-400 mb-1 ml-1">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的全名（支持中文与英文）"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold/30 focus:bg-white/10 transition-all duration-300 text-body-sm"
                required
              />
              <p className="mt-2 text-caption text-gray-500 ml-1 leading-relaxed max-w-full">
                中文姓名会先转成拼音首字母再参与计算（例如「王小明」→ W、X、M），算法与常见生命灵数产品一致。若某个字不在我们的字库中（如生僻字），系统会用该字的编码做替代换算，确保仍能算出结果。
              </p>
            </div>

            <div>
              <label className="block text-caption text-gray-400 mb-1 ml-1">生命路径计算方式</label>
              <select
                value={lifePathMethod}
                onChange={(e) => setLifePathMethod(e.target.value as "sumDigits" | "fullSum")}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/30 text-body-sm [color-scheme:dark]"
              >
                <option value="sumDigits" style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>
                  逐位相加（推荐）· 年+月+日各自各位相加再归约
                </option>
                <option value="fullSum" style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>
                  先加总再归约 · 年月日数值相加后归约
                </option>
              </select>
              <p className="mt-1 text-caption text-gray-500 ml-1">不同流派算法略有差异，可选后对比。</p>
            </div>

            <div>
              <label className="block text-caption text-gray-400 mb-1.5 ml-1">出生日期</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="font-mono w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/30 text-body-sm"
                  required
                  aria-label="年"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" style={{ backgroundColor: "#1a1a2e", color: "#e5e7eb" }}>年</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y} style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>{y}</option>
                  ))}
                </select>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="font-mono w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/30 text-body-sm"
                  required
                  aria-label="月"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" style={{ backgroundColor: "#1a1a2e", color: "#e5e7eb" }}>月</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m} style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="font-mono w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/30 text-body-sm"
                  required
                  aria-label="日"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" style={{ backgroundColor: "#1a1a2e", color: "#e5e7eb" }}>日</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d} style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>{String(d).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-body-sm font-medium text-gray-300 ml-1">出生时辰</label>
              <select
                value={hourIndex}
                onChange={(e) => setHourIndex(Number(e.target.value))}
                className="font-mono w-full min-h-[52px] px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white focus:outline-none focus:border-gold/50 focus:bg-white/15 text-body appearance-none cursor-pointer"
                style={{
                  colorScheme: "dark",
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='rgba(251,191,36,0.9)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                }}
                aria-label="选择出生时辰"
              >
                {HOUR_OPTIONS.map((name, i) => (
                  <option key={i} value={i} style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>
                    {name}时（{HOUR_RANGES[i]}）
                  </option>
                ))}
              </select>
              <p className="text-caption text-gray-500 ml-1">当前：{HOUR_OPTIONS[hourIndex]}时 {HOUR_RANGES[hourIndex]}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!name.trim() || !hasDate}
              className={cn(
                "w-full py-3.5 mt-2 bg-gradient-to-r from-gold-dark to-gold text-cosmic font-semibold text-body rounded-xl shadow-lg shadow-gold/20 transition-all duration-300 relative overflow-hidden group",
                (!name.trim() || !hasDate) && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="relative z-10">揭示我的数字命运</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </motion.button>
          </form>

          <p className="mt-6 text-center text-caption text-gray-400 tracking-[0.2em]">
            ✦ 已有 <span className="font-mono">128,431</span> 人解锁 ✦
          </p>

          {/* 底部导航入口 */}
          <div className="flex justify-center gap-8 mt-6">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/numerology/library")}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 px-6 py-4 hover:bg-white/10 hover:border-gold/30 transition-all min-w-[7rem]"
              title="数字图书馆"
            >
              <span className="text-2xl" aria-hidden>📚</span>
              <span className="text-body-sm text-gray-300">数字图书馆</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/numerology/year")}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 px-6 py-4 hover:bg-white/10 hover:border-gold/30 transition-all min-w-[7rem]"
              title="流年运势"
            >
              <span className="text-2xl" aria-hidden>📅</span>
              <span className="text-body-sm text-gray-300">流年运势</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
