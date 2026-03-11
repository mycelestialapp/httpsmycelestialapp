/**
 * 数字命理 · 结果页
 * 展示生命路径、命运数、灵魂驱动、个性数、成熟数及解读；支持生成分享图。
 */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  type NumerologyNumbers,
  calculateAllNumbers,
  numberInterpretations,
  type NumberInterpretation,
  getPinnaclePeriods,
  getChallengeNumber,
  getKarmicNumbers,
  getActiveGridLines,
  getLifePathTriangle,
} from "@/lib/numerology";
import { saveToArchivesIfNeeded, GROUP_OPTIONS_FOR_DISPLAY, type SavedReading } from "@/lib/archives";
import { addReading, type NumerologyReadingDetail } from "@/lib/readingHistory";
import { useOracleAccess } from "@/hooks/useOracleAccess";
import NumerologyNineGrid from "@/components/NumerologyNineGrid";
import LifePathTriangleChart from "@/components/LifePathTriangleChart";

type NumberKey = "lifePath" | "expression" | "soulUrge" | "personality" | "maturity" | "birthday" | "potential" | "interpersonal";

/** 保存到命盘档案时的分组选项：本人 + 爱人/家人等 */
const SAVE_ARCHIVE_GROUPS = [
  { value: "self", label: "本人" },
  ...GROUP_OPTIONS_FOR_DISPLAY.map((o) => ({ value: o.value, label: o.label })),
];

export default function NumerologyResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, birthDate, birthDateLabel, hourIndex: stateHourIndex, lifePathMethod } = (location.state as {
    name?: string;
    birthDate?: string;
    birthDateLabel?: string;
    hourIndex?: number;
    lifePathMethod?: "sumDigits" | "fullSum";
  }) || {};

  const [numbers, setNumbers] = useState<NumerologyNumbers | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<NumberKey>("lifePath");
  const shareRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSaveArchive, setShowSaveArchive] = useState(false);
  const [saveArchiveGroup, setSaveArchiveGroup] = useState<string>("self");
  const [saveArchiveDone, setSaveArchiveDone] = useState(false);

  const hasOracleAccess = useOracleAccess();
  const addedToHistoryRef = useRef(false);
  useEffect(() => {
    if (!name || !birthDate) {
      navigate("/numerology", { replace: true });
      return;
    }
    const nums = calculateAllNumbers(name, new Date(birthDate), lifePathMethod ?? "sumDigits");
    setNumbers(nums);
    const state = location.state as { fromReadingHistory?: boolean } | undefined;
    if (!state?.fromReadingHistory && !addedToHistoryRef.current) {
      addedToHistoryRef.current = true;
      const detail: NumerologyReadingDetail = {
        name,
        birthDate,
        birthDateLabel: birthDateLabel ?? undefined,
        hourIndex: stateHourIndex,
        lifePath: nums.lifePath,
        expression: nums.expression,
        soulUrge: nums.soulUrge,
        personality: nums.personality,
        maturity: nums.maturity,
        birthday: nums.birthday,
        potential: nums.potential,
        interpersonal: nums.interpersonal,
      };
      addReading({
        tool: "numerology",
        question: null,
        summary: `數字命理 · ${name} 生命路徑${nums.lifePath}`,
        detail,
      });
    }
  }, [name, birthDate, birthDateLabel, stateHourIndex, lifePathMethod, navigate, location.state]);

  if (!numbers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic">
        <div className="text-gold animate-pulse">计算你的宇宙数字中...</div>
      </div>
    );
  }

  const currentNumberValue = numbers[selectedNumber] as number;
  const currentInterpretation: NumberInterpretation | undefined =
    numberInterpretations[currentNumberValue];

  const numberCards: { key: NumberKey; label: string; value: number }[] = [
    { key: "lifePath", label: "生命路径", value: numbers.lifePath },
    { key: "expression", label: "命运数", value: numbers.expression },
    { key: "soulUrge", label: "灵魂驱动", value: numbers.soulUrge },
    { key: "personality", label: "个性数", value: numbers.personality },
    { key: "maturity", label: "使命数", value: numbers.maturity },
    { key: "birthday", label: "生日数", value: numbers.birthday },
    { key: "potential", label: "潜能数", value: numbers.potential },
    { key: "interpersonal", label: "人际数", value: numbers.interpersonal },
  ];

  const birthDateDisplay =
    birthDateLabel ||
    (birthDate
      ? new Date(birthDate).toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "");

  const handleGenerateImage = async () => {
    if (!shareRef.current) return;
    setGenerating(true);
    setPreviewUrl(null);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(shareRef.current, {
        scale: 2,
        backgroundColor: "#0C0A1A",
        allowTaint: false,
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error("分享图生成失败", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToArchive = () => {
    if (!birthDate || !name?.trim()) return;
    const d = new Date(birthDate);
    const hourIndex = stateHourIndex ?? 6;
    const savedReading: SavedReading = {
      type: "numerology",
      items: numberCards.map((card) => {
        const interp = numberInterpretations[card.value];
        return {
          key: card.key,
          label: card.label,
          value: card.value,
          title: interp?.title ?? "",
          core: interp?.core ?? "",
          advice: interp?.advice ?? "",
          oracle: interp?.oracle,
        };
      }),
    };
    saveToArchivesIfNeeded(saveArchiveGroup, name.trim(), {
      solarYear: d.getUTCFullYear(),
      solarMonth: d.getUTCMonth() + 1,
      solarDay: d.getUTCDate(),
      hourIndex,
    }, { savedReading });
    setSaveArchiveDone(true);
    setShowSaveArchive(false);
  };

  return (
    <div className="min-h-screen bg-cosmic py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate("/numerology")}
            className="text-body-sm text-gray-400 hover:text-gold transition-colors"
          >
            ← 返回
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() =>
                navigate("/numerology/year", { state: { name, birthDate } })
              }
              className="px-4 py-2 rounded-xl font-medium bg-white/10 text-gold border border-white/20 hover:bg-white/20 transition-colors text-body-sm"
            >
              📅 流年运势
            </button>
            {hasOracleAccess ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowSaveArchive(true)}
                  className="px-4 py-2 rounded-xl font-medium text-body-sm border border-gold/50 text-gold hover:bg-gold/10 transition-colors"
                >
                  📁 保存到命盘档案
                </button>
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={generating}
                  className={cn(
                    "px-4 py-2 rounded-xl font-medium text-body-sm transition-opacity",
                    "bg-gold text-cosmic hover:bg-gold-light disabled:opacity-50"
                  )}
                >
                  {generating ? "生成中…" : "📸 生成分享图"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/subscribe", { state: { from: "numerology" } })}
                className="px-4 py-2 rounded-xl font-medium text-body-sm bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 transition-colors"
              >
                解锁保存与分享 → 订阅
              </button>
            )}
          </div>
          {saveArchiveDone && (
            <p className="text-body-sm text-gold mt-2">
              已保存到命盘档案，可到「关系说明书」页查看。
            </p>
          )}
        </div>

        {/* 截图专用区域：移出视口，仅用于 html2canvas 捕获 */}
        <div
          ref={shareRef}
          className="absolute left-[-9999px] top-0 w-[800px] overflow-hidden rounded-3xl p-8 bg-cosmic text-white"
        >
          <div className="text-center mb-4">
            <span className="font-display text-h3 text-gold font-light">+ CELESTIAL</span>
          </div>
          <h2 className="font-display text-h2 text-center text-gold mb-6">
            数字命理报告
          </h2>
          <div className="flex justify-between mb-8 text-white">
            <div>
              <p className="text-caption text-gray-400">姓名</p>
              <p className="text-h4">{name || "—"}</p>
            </div>
            <div>
              <p className="text-caption text-gray-400">出生日期</p>
              <p className="text-h4 font-mono">{birthDateDisplay || "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {numberCards.slice(0, 5).map((card) => (
              <div
                key={card.key}
                className="text-center p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="font-mono text-h3 font-bold text-gold">
                  {card.value}
                </div>
                <div className="text-caption text-gray-400 mt-1">{card.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3 mb-4">
            {numberCards.slice(0, 5).map((card) => {
              const interp = numberInterpretations[card.value];
              return (
                <div
                  key={card.key}
                  className="rounded-xl bg-white/5 border border-white/10 p-3"
                >
                  <div className="text-body-sm font-medium text-gold mb-1">
                    {card.label} {card.value}
                    {interp ? ` · ${interp.title.split("·")[1]?.trim() || interp.title}` : ""}
                  </div>
                  {interp ? (
                    <>
                      {hasOracleAccess && interp.masterNote && (
                        <p className="text-gold/90 text-body-sm italic mb-2 border-l-2 border-gold/40 pl-2">
                          「{interp.masterNote}」
                        </p>
                      )}
                      <p className="text-white text-body-sm leading-relaxed mb-1">
                        {interp.core}
                      </p>
                      <p className="text-gold/80 italic text-body-sm">
                        ✦ {interp.advice}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400 text-body-sm">解读数据建设中…</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center text-caption text-gray-500 mt-6">
            Celestial 数字命理 · 探索你的宇宙数字
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <NumerologyNineGrid
              lifePath={numbers.lifePath}
              expression={numbers.expression}
              soulUrge={numbers.soulUrge}
              personality={numbers.personality}
              maturity={numbers.maturity}
              birthday={numbers.birthday}
              potential={numbers.potential}
              interpersonal={numbers.interpersonal}
            />
            {numberCards.map((card) => {
              const isSelected = selectedNumber === card.key;
              const isMaster = [11, 22, 33].includes(card.value);
              return (
                <motion.div
                  key={card.key}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedNumber(card.key)}
                  className={cn(
                    "p-6 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border",
                    isSelected
                      ? "bg-gold/10 border-gold/50 shadow-lg shadow-gold/10"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="text-body-sm text-gray-400 mb-1">{card.label}</div>
                  <div className="flex items-end justify-between">
                    <span className="font-mono text-display-sm font-bold text-gold-light">
                      {card.value}
                    </span>
                    {isMaster && (
                      <span className="text-caption px-2 py-1 bg-gold/20 rounded-full text-gold">
                        大师数
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            <motion.div
              key={selectedNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-h3 text-gold">
                  {numberCards.find((c) => c.key === selectedNumber)?.label}
                </h2>
                <div className="font-mono text-display-lg font-bold bg-gradient-to-r from-gold-light to-white bg-clip-text text-transparent">
                  {currentNumberValue}
                </div>
              </div>

              {currentInterpretation ? (
                <div className="space-y-6 text-gray-300">
                  {hasOracleAccess && currentInterpretation.masterNote && (
                    <p className="text-gold/90 text-body italic border-l-2 border-gold/40 pl-4 py-1">
                      「{currentInterpretation.masterNote}」
                    </p>
                  )}
                  {hasOracleAccess && currentInterpretation.oracle ? (
                    <>
                      <div className="whitespace-pre-line text-body-lg leading-relaxed text-gray-100 font-serif tracking-wide">
                        {currentInterpretation.oracle}
                      </div>
                      <details className="group border-t border-white/10 pt-6">
                        <summary className="cursor-pointer list-none text-gold hover:text-gold-light transition-colors font-medium text-body-sm">
                          <span className="inline-flex items-center gap-2">
                            展开详细解读（实用建议）
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                          </span>
                        </summary>
                        <div className="mt-6 space-y-6">
                          <div>
                            <h3 className="text-lg font-display text-gold/80 mb-2">核心</h3>
                            <p className="leading-relaxed">{currentInterpretation.core}</p>
                          </div>
                          <div>
                            <h3 className="text-lg font-display text-gold/80 mb-2">人生课题</h3>
                            <p>{currentInterpretation.challenge}</p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-lg font-display text-gold/80 mb-2">职业方向</h3>
                              <p>{currentInterpretation.career}</p>
                            </div>
                            <div>
                              <h3 className="text-lg font-display text-gold/80 mb-2">爱情指南</h3>
                              <p>{currentInterpretation.love}</p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-white/10">
                            <p className="italic text-gold/60">✨ {currentInterpretation.advice}</p>
                          </div>
                          {(currentInterpretation.lifeStage ?? currentInterpretation.innerChallenge) && (
                            <>
                              {currentInterpretation.lifeStage && (
                                <div>
                                  <h3 className="text-lg font-display text-gold/80 mb-2">生命阶段</h3>
                                  <p className="leading-relaxed">{currentInterpretation.lifeStage}</p>
                                </div>
                              )}
                              {currentInterpretation.innerChallenge && (
                                <div>
                                  <h3 className="text-lg font-display text-gold/80 mb-2">内在课题</h3>
                                  <p className="leading-relaxed">{currentInterpretation.innerChallenge}</p>
                                </div>
                              )}
                              {currentInterpretation.outerOpportunity && (
                                <div>
                                  <h3 className="text-lg font-display text-gold/80 mb-2">外在机遇</h3>
                                  <p className="leading-relaxed">{currentInterpretation.outerOpportunity}</p>
                                </div>
                              )}
                              {currentInterpretation.relationshipHint && (
                                <div>
                                  <h3 className="text-lg font-display text-gold/80 mb-2">关系提示</h3>
                                  <p className="leading-relaxed">{currentInterpretation.relationshipHint}</p>
                                </div>
                              )}
                              {currentInterpretation.careerCreation && (
                                <div>
                                  <h3 className="text-lg font-display text-gold/80 mb-2">事业创造</h3>
                                  <p className="leading-relaxed">{currentInterpretation.careerCreation}</p>
                                </div>
                              )}
                              {currentInterpretation.spiritualGuidance && (
                                <div>
                                  <h3 className="text-lg font-display text-gold/80 mb-2">灵性指引</h3>
                                  <p className="leading-relaxed">{currentInterpretation.spiritualGuidance}</p>
                                </div>
                              )}
                              {currentInterpretation.warning && (
                                <div>
                                  <h3 className="text-lg font-display text-gold/80 mb-2">警示提醒</h3>
                                  <p className="leading-relaxed">{currentInterpretation.warning}</p>
                                </div>
                              )}
                              {currentInterpretation.dailyMantra && (
                                <div className="pt-4 border-t border-white/10">
                                  <p className="italic text-gold/60">✦ {currentInterpretation.dailyMantra}</p>
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pt-2">
                            <span>幸运色：{currentInterpretation.color}</span>
                            <span>象征：{currentInterpretation.symbol}</span>
                            {currentInterpretation.keywords?.length > 0 && (
                              <span>关键词：{currentInterpretation.keywords.join(" · ")}</span>
                            )}
                          </div>
                        </div>
                      </details>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-xl font-display text-gold/80 mb-2">核心特质</h3>
                        <p className="leading-relaxed">{currentInterpretation.core}</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-display text-gold/80 mb-2">人生课题</h3>
                        <p>{currentInterpretation.challenge}</p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-display text-gold/80 mb-2">职业方向</h3>
                          <p>{currentInterpretation.career}</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-display text-gold/80 mb-2">爱情指南</h3>
                          <p>{currentInterpretation.love}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <p className="italic text-gold/60">✨ {currentInterpretation.advice}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span>幸运色：{currentInterpretation.color}</span>
                        <span>象征：{currentInterpretation.symbol}</span>
                        {currentInterpretation.keywords?.length > 0 && (
                          <span>关键词：{currentInterpretation.keywords.join(" · ")}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">解读数据建设中...</p>
              )}
            </motion.div>
          </div>
        </div>

        {/* 大师进阶：高峰数、挑战数、业力、九宫格连线、三角图（订阅可见） */}
        {hasOracleAccess && birthDate && (
          <div className="mt-12 space-y-10">
            <h2 className="font-display text-h2 text-gold border-b border-gold/30 pb-3">大师进阶解读</h2>

            {/* 四大高峰数（Pinnacle） */}
            {(() => {
              const pinnacles = getPinnaclePeriods(new Date(birthDate));
              return (
                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
                  <h3 className="font-display text-h4 text-gold mb-4">四大高峰数（Pinnacle）</h3>
                  <p className="text-body-sm text-gray-400 mb-6">人生四阶段的主题数，西方主流体系</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pinnacles.map((p) => (
                      <div key={p.index} className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-caption text-gray-400">{p.label}</span>
                          <span className="font-mono text-h4 font-bold text-gold">{p.number}</span>
                        </div>
                        <p className="text-caption text-gray-500 mb-1">{p.ageStart}～{p.ageEnd} 岁</p>
                        <p className="text-body-sm text-gray-300 leading-relaxed">{p.masterNote}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* 挑战数 */}
            {(() => {
              const challenge = getChallengeNumber(new Date(birthDate));
              return (
                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
                  <h3 className="font-display text-h4 text-gold mb-2">挑战数</h3>
                  <p className="text-body-sm text-gray-400 mb-4">一生需反复面对的课题（出生月日差归约）</p>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-mono text-display-sm font-bold text-gold">{challenge.value}</span>
                    <p className="text-body text-gray-300 flex-1">{challenge.masterNote}</p>
                  </div>
                </section>
              );
            })()}

            {/* 业力/缺数 */}
            {(() => {
              const karmic = getKarmicNumbers(new Date(birthDate), numbers.lifePath);
              return (
                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
                  <h3 className="font-display text-h4 text-gold mb-2">业力与缺数</h3>
                  <p className="text-body-sm text-gray-400 mb-4">命盘中的功课清单</p>
                  <p className="text-body text-gray-300 leading-relaxed">{karmic.masterNote}</p>
                </section>
              );
            })()}

            {/* 九宫格连线解读 */}
            {(() => {
              const lines = getActiveGridLines(numbers);
              if (lines.length === 0) return null;
              return (
                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
                  <h3 className="font-display text-h4 text-gold mb-2">九宫格连线解读</h3>
                  <p className="text-body-sm text-gray-400 mb-6">你的核心数激活的性格线（≥2 数成线）</p>
                  <ul className="space-y-4">
                    {lines.map((line) => (
                      <li key={line.id} className="rounded-xl bg-white/5 border border-gold/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display text-body font-medium text-gold">{line.name}</span>
                          <span className="text-caption text-gray-500">覆盖 {line.cells.join("-")} · {line.count} 数</span>
                        </div>
                        <p className="text-body-sm text-gray-300 leading-relaxed">{line.masterNote}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })()}

            {/* 生命密码三角图 */}
            {(() => {
              const triangle = getLifePathTriangle(new Date(birthDate));
              return (
                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
                  <h3 className="font-display text-h4 text-gold mb-4">生命密码三角图</h3>
                  <p className="text-body-sm text-gray-400 mb-6">国内主流体系 · 年月日三层归约</p>
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <LifePathTriangleChart data={triangle} />
                    <div className="flex-1">
                      <p className="text-body text-gray-300 leading-relaxed italic border-l-2 border-gold/40 pl-4">{triangle.masterNote}</p>
                    </div>
                  </div>
                </section>
              );
            })()}
          </div>
        )}

        {/* 免费用户：解锁 CTA */}
        {!hasOracleAccess && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 rounded-2xl border border-gold/30 bg-gold/5 p-6 md:p-8 text-center"
          >
            <p className="text-body text-gray-300 mb-2">
              解锁大师点睛、神谕、四大高峰数、挑战数、业力与九宫格连线、生命三角图，以及保存到命盘与生成分享图
            </p>
            <button
              type="button"
              onClick={() => navigate("/subscribe", { state: { from: "numerology" } })}
              className="px-6 py-3 rounded-xl font-medium bg-gold text-cosmic hover:bg-gold-light transition-colors"
            >
              前往订阅 →
            </button>
          </motion.div>
        )}
      </div>

      {/* 分享图预览弹层 */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          role="dialog"
          aria-modal="true"
          aria-label="分享图预览"
        >
          <div className="bg-cosmic/95 backdrop-blur-lg rounded-2xl p-6 max-w-lg w-full border border-white/10">
            <img
              src={previewUrl}
              alt="数字命理分享图"
              className="w-full rounded-xl mb-4 border border-white/10"
            />
            <div className="flex gap-3">
              <a
                href={previewUrl}
                download={`celestial-${name || "命理"}.png`}
                className="flex-1 py-2.5 bg-gold text-cosmic text-center rounded-xl font-medium hover:bg-gold-light transition-colors text-body-sm"
              >
                保存图片
              </a>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors text-body-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 保存到命盘档案：选择分组 */}
      {showSaveArchive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-label="保存到命盘档案"
        >
          <div className="bg-cosmic border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-display text-h4 text-gold mb-2">保存到命盘档案</h3>
            <p className="text-body-sm text-muted-foreground mb-4">
              选择要归入的分组，保存后可在「关系说明书」页的命盘档案中查看。
            </p>
            <select
              value={saveArchiveGroup}
              onChange={(e) => setSaveArchiveGroup(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white text-body-sm focus:outline-none focus:border-gold/50 mb-4"
              style={{ colorScheme: "dark" }}
            >
              {SAVE_ARCHIVE_GROUPS.map((g) => (
                <option key={g.value} value={g.value} style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>
                  {g.label}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveToArchive}
                className="flex-1 py-2.5 bg-gold text-cosmic rounded-xl font-medium text-body-sm hover:bg-gold-light transition-colors"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setShowSaveArchive(false)}
                className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium text-body-sm hover:bg-white/20 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
