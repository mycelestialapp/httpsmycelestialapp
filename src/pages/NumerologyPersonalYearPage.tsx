/**
 * 流年运势：基于出生月日 + 当前年（或选择年）计算流年数并展示解读
 */
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  calculatePersonalYear,
  calculatePersonalMonth,
  calculatePersonalDay,
  calculateAllNumbers,
  getPersonalYearSteps,
  numberInterpretations,
} from "@/lib/numerology";
import { useOracleAccess } from "@/hooks/useOracleAccess";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: 71 },
  (_, i) => currentYear - 50 + i
);
const BIRTH_YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOUR_OPTIONS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const HOUR_RANGES = [
  "23:00–01:00", "01:00–03:00", "03:00–05:00", "05:00–07:00", "07:00–09:00", "09:00–11:00",
  "11:00–13:00", "13:00–15:00", "15:00–17:00", "17:00–19:00", "19:00–21:00", "21:00–23:00",
];

export default function NumerologyPersonalYearPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasOracleAccess = useOracleAccess();
  const state = (location.state as { birthDate?: string; name?: string }) || {};
  const [birthDate, setBirthDate] = useState<Date | null>(() => {
    const raw = state.birthDate;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isFinite(d.getTime()) ? d : null;
  });
  const [manualYear, setManualYear] = useState("");
  const [manualMonth, setManualMonth] = useState("");
  const [manualDay, setManualDay] = useState("");
  const [manualHourIndex, setManualHourIndex] = useState(6);
  const [year, setYear] = useState(currentYear);

  const name = state.name ?? "";
  const personalYearNum = birthDate ? calculatePersonalYear(birthDate, year) : null;
  const interp = personalYearNum != null ? numberInterpretations[personalYearNum] : null;
  const coreNumbers =
    birthDate && name.trim()
      ? calculateAllNumbers(name.trim(), birthDate)
      : null;

  return (
    <div className="min-h-screen bg-cosmic py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/numerology"
          className="inline-block mb-8 text-body-sm text-gray-400 hover:text-gold transition-colors"
        >
          ← 返回数字命理首页
        </Link>

        <h1 className="font-display text-h1 md:text-display-sm text-center text-gold mb-4">
          流年运势
        </h1>
        <p className="text-center text-body text-gray-400 mb-12">计算你每一年的能量主题</p>

        {!birthDate ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md mx-auto">
            <label className="block text-body-sm text-gray-300 mb-2">选择出生日期</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <select
                value={manualYear}
                onChange={(e) => setManualYear(e.target.value)}
                className="font-mono w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white [color-scheme:dark] text-body"
                aria-label="年"
              >
                <option value="">年</option>
                {BIRTH_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={manualMonth}
                onChange={(e) => setManualMonth(e.target.value)}
                className="font-mono w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white [color-scheme:dark] text-body"
                aria-label="月"
              >
                <option value="">月</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                ))}
              </select>
              <select
                value={manualDay}
                onChange={(e) => setManualDay(e.target.value)}
                className="font-mono w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white [color-scheme:dark] text-body"
                aria-label="日"
              >
                <option value="">日</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
            <label className="block text-body-sm text-gray-300 mb-2">出生时辰</label>
            <select
              value={manualHourIndex}
              onChange={(e) => setManualHourIndex(Number(e.target.value))}
              className="font-mono w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white [color-scheme:dark] mb-4 text-body"
              aria-label="时辰"
            >
              {HOUR_OPTIONS.map((name, i) => (
                <option key={i} value={i}>{name}时（{HOUR_RANGES[i]}）</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const y = Number(manualYear);
                const m = Number(manualMonth);
                const d = Number(manualDay);
                setBirthDate(new Date(Date.UTC(y, m - 1, d)));
              }}
              disabled={!manualYear || !manualMonth || !manualDay}
              className="w-full py-3 bg-gold-dark text-cosmic font-semibold rounded-xl disabled:opacity-50 text-body"
            >
              开始计算
            </button>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div>
                <p className="text-gray-400 mb-2">你的出生日期</p>
                <p className="text-h4 text-white font-mono">
                  {birthDate.toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label className="text-body-sm text-gray-400">选择年份</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="font-mono bg-cosmic-light border border-white/20 rounded-lg px-4 py-2.5 text-white text-body min-w-[120px] [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-gold/50"
                  aria-label="选择要查看的年份"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y} 年
                    </option>
                  ))}
                </select>
                <span className="font-mono text-gold font-medium text-body">
                  当前：{year} 年
                </span>
              </div>
            </div>

            {personalYearNum != null ? (
              interp ? (
                <motion.div
                  key={`${personalYearNum}-${year}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center pb-2 border-b border-white/10 space-y-2">
                    <p className="text-gold/90 text-body-sm">
                      【{year} 年】流年数 {personalYearNum} · 切换年份可查看不同流年数的解读
                    </p>
                    {(() => {
                      const now = new Date();
                      const isCurrentYear = year === now.getFullYear();
                      if (!isCurrentYear) return null;
                      const monthNum = calculatePersonalMonth(birthDate, year, now.getMonth() + 1);
                      const dayNum = calculatePersonalDay(birthDate, year, now.getMonth() + 1, now.getDate());
                      return (
                        <p className="text-body-sm text-gray-400">
                          本月数 {monthNum} · 今日数 {dayNum}
                          <span className="text-caption text-gray-500 ml-1">（仅当前年）</span>
                        </p>
                      );
                    })()}
                    <details className="text-left text-gray-400 text-caption open:bg-white/5 open:rounded-lg open:px-3 open:py-2">
                      <summary className="cursor-pointer hover:text-gold/80">
                        流年数怎么算？为什么有些年份解读相同？
                      </summary>
                      <div className="mt-2 space-y-1">
                        <p className="text-body-sm">
                          公式：<strong className="text-gray-300">所选年份 + 出生月 + 出生日</strong>，得到和后再将各位数字相加，直至得到 1～9 或 11、22、33。
                        </p>
                        <p className="font-mono text-gold/90 break-all text-body-sm">
                          {(() => {
                            const { formula, steps } = getPersonalYearSteps(birthDate, year);
                            return steps ? `${formula} → ${steps}` : formula;
                          })()}
                        </p>
                        <p className="text-body-sm">
                          不同年份若化简后得到<strong className="text-gold/80">同一数字</strong>，解读就相同；换年份后数字变了，解读才会变。
                        </p>
                      </div>
                    </details>
                  </div>
                  {coreNumbers && (
                    <div className="grid grid-cols-5 gap-2 mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-center">
                        <div className="font-mono text-h3 font-bold text-gold">
                          {coreNumbers.lifePath}
                        </div>
                        <div className="text-caption text-gray-400">生命路径</div>
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-h3 font-bold text-gold">
                          {coreNumbers.expression}
                        </div>
                        <div className="text-caption text-gray-400">命运数</div>
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-h3 font-bold text-gold">
                          {coreNumbers.soulUrge}
                        </div>
                        <div className="text-caption text-gray-400">灵魂驱动</div>
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-h3 font-bold text-gold">
                          {coreNumbers.personality}
                        </div>
                        <div className="text-caption text-gray-400">个性数</div>
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-h3 font-bold text-gold">
                          {coreNumbers.maturity}
                        </div>
                        <div className="text-caption text-gray-400">成熟数</div>
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <div
                      className="font-mono text-display-lg font-bold text-gold tabular-nums"
                      aria-label={`流年数 ${personalYearNum}`}
                    >
                      {personalYearNum}
                    </div>
                    <p className="font-display text-h3 text-gold mt-2">
                      {year} 年流年数
                    </p>
                    <p className="text-body-sm text-gray-500 mt-1">流年数 = {personalYearNum}</p>
                  </div>

                  {(hasOracleAccess && interp.oracle) ? (
                    <>
                      <div className="whitespace-pre-line text-body md:text-body-lg leading-relaxed text-gray-100 font-serif tracking-wide">
                        {interp.oracle}
                      </div>
                      <details className="group border border-gold/30 rounded-xl border-t border-white/10 pt-6 mt-6 bg-white/5">
                        <summary className="cursor-pointer list-none py-4 px-4 text-gold hover:text-gold-light hover:bg-white/5 transition-colors font-medium rounded-xl text-body-sm">
                          <span className="inline-flex items-center gap-2">
                            展开详细解读（实用建议）
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                          </span>
                        </summary>
                        <div className="mt-6 space-y-4 text-gray-300 px-2 pb-4">
                          <p className="text-gold/80 text-body-sm mb-4">
                            {year} 年 · 流年数 {personalYearNum} 的实用建议
                          </p>
                          {hasOracleAccess && interp.masterNote && (
                            <div className="rounded-lg bg-gold/10 border border-gold/20 p-4 mb-4">
                              <p className="text-caption font-semibold text-gold/90 uppercase tracking-wider mb-1">大师点睛</p>
                              <p className="text-body italic text-white">「{interp.masterNote}」</p>
                            </div>
                          )}
                          <div>
                            <h2 className="font-display text-h4 text-gold/80 mb-2">年度核心</h2>
                            <p className="text-body leading-relaxed">{interp.core}</p>
                          </div>
                          <div>
                            <h2 className="font-display text-h4 text-gold/80 mb-2">年度课题</h2>
                            <p className="text-body">{interp.challenge}</p>
                          </div>
                          <div className="pt-4 border-t border-white/10">
                            <p className="text-body italic text-gold/60">✨ {interp.advice}</p>
                          </div>
                          {hasOracleAccess && interp.lifeStage && (
                            <div>
                              <h2 className="font-display text-h4 text-gold/80 mb-2">生命阶段</h2>
                              <p className="text-body leading-relaxed">{interp.lifeStage}</p>
                            </div>
                          )}
                          {hasOracleAccess && interp.outerOpportunity && (
                            <div>
                              <h2 className="font-display text-h4 text-gold/80 mb-2">外在机遇</h2>
                              <p className="text-body leading-relaxed">{interp.outerOpportunity}</p>
                            </div>
                          )}
                          {hasOracleAccess && interp.warning && (
                            <div>
                              <h2 className="font-display text-h4 text-gold/80 mb-2">警示提醒</h2>
                              <p className="text-body leading-relaxed">{interp.warning}</p>
                            </div>
                          )}
                          {hasOracleAccess && interp.dailyMantra && (
                            <p className="text-body italic text-gold/60">✦ {interp.dailyMantra}</p>
                          )}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {(interp.keywords ?? []).map((kw) => (
                              <span
                                key={kw}
                                className="px-3 py-1 bg-white/5 rounded-full text-caption text-gold"
                              >
                                #{kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </details>
                    </>
                  ) : (
                    <>
                      {hasOracleAccess && interp.masterNote && (
                        <p className="text-gold/80 text-body-sm italic border-l-2 border-gold/40 pl-3 mb-4">「{interp.masterNote}」</p>
                      )}
                      <div>
                        <h2 className="font-display text-h4 text-gold/80 mb-2">年度核心特质</h2>
                        <p className="text-body text-gray-300">{interp.core}</p>
                      </div>
                      <div>
                        <h2 className="font-display text-h4 text-gold/80 mb-2">年度课题</h2>
                        <p className="text-body text-gray-300">{interp.challenge}</p>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-body italic text-gold/60">✨ {interp.advice}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(interp.keywords ?? []).map((kw) => (
                          <span
                            key={kw}
                            className="px-3 py-1 bg-white/5 rounded-full text-caption text-gold"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400">该流年数的解读暂未收录</p>
                </div>
              )
            ) : null}

            {!hasOracleAccess && personalYearNum != null && (
              <div className="mt-8 rounded-xl border border-gold/30 bg-gold/5 p-4 text-center">
                <p className="text-body-sm text-gray-400 mb-3">解锁流年神谕、大师点睛与完整解读</p>
                <button
                  type="button"
                  onClick={() => navigate("/subscribe", { state: { from: "numerology" } })}
                  className="px-4 py-2 rounded-lg font-medium bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 transition-colors text-body-sm"
                >
                  前往订阅 →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
