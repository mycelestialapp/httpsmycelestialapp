/**
 * 数字详情页：单个数字的完整解读（复用 numberInterpretations）
 */
import { useParams, Link, useNavigate } from "react-router-dom";
import { numberInterpretations } from "@/lib/numerology";
import { useOracleAccess } from "@/hooks/useOracleAccess";

export default function NumerologyNumberDetailPage() {
  const { number: numParam } = useParams<{ number: string }>();
  const navigate = useNavigate();
  const hasOracleAccess = useOracleAccess();
  const num = numParam ? parseInt(numParam, 10) : NaN;
  const interp = Number.isNaN(num) ? undefined : numberInterpretations[num];

  if (!interp) {
    return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">数字不存在</p>
          <Link to="/numerology/library" className="text-gold hover:underline text-body-sm">
            返回图书馆
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/numerology/library"
          className="inline-block mb-8 text-body-sm text-gray-400 hover:text-gold transition-colors"
        >
          ← 返回图书馆
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-h1 text-gold">{interp.title}</h1>
            <div className="font-mono text-display-lg font-bold bg-gradient-to-r from-gold-light to-white bg-clip-text text-transparent">
              {num}
            </div>
          </div>

          <div className="space-y-6 text-gray-300">
            {interp.masterNote && (
              <div className="rounded-xl bg-gold/10 border border-gold/30 p-5">
                <p className="text-caption font-semibold text-gold/90 uppercase tracking-wider mb-2">大师点睛</p>
                <p className="font-display text-body-lg leading-relaxed text-white italic">「{interp.masterNote}」</p>
              </div>
            )}
            <div>
              <h2 className="font-display text-h4 text-gold/80 mb-2">核心特质</h2>
              <p className="text-body leading-relaxed">{interp.core}</p>
            </div>
            <div>
              <h2 className="font-display text-h4 text-gold/80 mb-2">人生课题</h2>
              <p className="text-body">{interp.challenge}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-display text-h4 text-gold/80 mb-2">职业方向</h2>
                <p className="text-body">{interp.career}</p>
              </div>
              <div>
                <h2 className="font-display text-h4 text-gold/80 mb-2">爱情指南</h2>
                <p className="text-body">{interp.love}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-body italic text-gold/60">✨ {interp.advice}</p>
            </div>

            {/* 神谕版：订阅可见 */}
            {hasOracleAccess && interp.oracle && (
              <div className="rounded-xl bg-gold/5 border border-gold/20 p-5 space-y-2">
                <h2 className="font-display text-h4 text-gold">神谕</h2>
                <p className="text-body leading-relaxed text-gray-100 whitespace-pre-line">{interp.oracle}</p>
              </div>
            )}

            {/* 人生阶段 / 内在课题 / 外在机遇（订阅可见） */}
            {hasOracleAccess && (interp.lifeStage ?? interp.innerChallenge ?? interp.outerOpportunity) && (
              <div className="space-y-4 pt-2 border-t border-white/10">
                {interp.lifeStage && (
                  <div>
                    <h2 className="font-display text-h4 text-gold/80 mb-2">人生阶段</h2>
                    <p className="text-body leading-relaxed">{interp.lifeStage}</p>
                  </div>
                )}
                {interp.innerChallenge && (
                  <div>
                    <h2 className="font-display text-h4 text-gold/80 mb-2">内在课题</h2>
                    <p className="text-body leading-relaxed">{interp.innerChallenge}</p>
                  </div>
                )}
                {interp.outerOpportunity && (
                  <div>
                    <h2 className="font-display text-h4 text-gold/80 mb-2">外在机遇</h2>
                    <p className="text-body leading-relaxed">{interp.outerOpportunity}</p>
                  </div>
                )}
              </div>
            )}

            {/* 关系提示 / 灵性指引 / 创作与事业延伸（订阅可见） */}
            {hasOracleAccess && (interp.relationshipHint ?? interp.spiritualGuidance ?? interp.careerCreation) && (
              <div className="grid md:grid-cols-1 gap-4 pt-2 border-t border-white/10">
                {interp.relationshipHint && (
                  <div>
                    <h2 className="font-display text-h4 text-gold/80 mb-2">关系提示</h2>
                    <p className="text-body leading-relaxed">{interp.relationshipHint}</p>
                  </div>
                )}
                {interp.spiritualGuidance && (
                  <div>
                    <h2 className="font-display text-h4 text-gold/80 mb-2">灵性指引</h2>
                    <p className="text-body leading-relaxed">{interp.spiritualGuidance}</p>
                  </div>
                )}
                {interp.careerCreation && (
                  <div>
                    <h2 className="font-display text-h4 text-gold/80 mb-2">事业与创作</h2>
                    <p className="text-body leading-relaxed">{interp.careerCreation}</p>
                  </div>
                )}
              </div>
            )}

            {/* 注意 / 每日心法（订阅可见） */}
            {hasOracleAccess && (interp.warning ?? interp.dailyMantra) && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                {interp.warning && (
                  <p className="text-body-sm text-amber-200/90">⚠ {interp.warning}</p>
                )}
                {interp.dailyMantra && (
                  <p className="text-body-sm italic text-gold/80">「{interp.dailyMantra}」</p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-4 text-body-sm text-gray-400 pt-4 border-t border-white/10">
              <span>幸运色：{interp.color}</span>
              <span>象征：{interp.symbol}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {(interp.keywords ?? []).map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1 bg-white/5 rounded-full text-caption text-gold"
                >
                  #{kw}
                </span>
              ))}
            </div>

            {!hasOracleAccess && (
              <div className="mt-8 rounded-xl border border-gold/30 bg-gold/5 p-4 text-center">
                <p className="text-body-sm text-gray-400 mb-3">解锁大师点睛、神谕与延伸解读</p>
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
        </div>
      </div>
    </div>
  );
}
