# v5.0 融合裁决者：规则解读 + AI 解读 按比例混合，并做一致性校验

from typing import List, Dict, Any, Optional
from consistency import light_consistency_check
from ai_adapter import AIAdapter, StubAIAdapter, UserHistory

# 风格与规则占比：traditional=规则为主, balanced=均衡, spiritual=AI 为主
FUSION_RATIOS = {
    "traditional": 0.9,   # 90% 规则
    "balanced": 0.6,       # 60% 规则
    "spiritual": 0.3,      # 30% 规则
}


def merge_texts(
    rule_text: str,
    ai_text: str,
    rule_ratio: float,
) -> str:
    """
    简单融合：按比例取规则摘要 + AI 正文。
    rule_ratio=0.7 表示 70% 权重给规则侧（这里用「规则摘要 + AI 扩写」实现）。
    """
    if rule_ratio >= 0.95:
        return rule_text
    if rule_ratio <= 0.05:
        return ai_text
    # 折中：先一段规则核心句，再 AI 扩写
    rule_brief = rule_text[:200] + "……" if len(rule_text) > 200 else rule_text
    return f"{rule_brief}\n\n{ai_text}"


class FusionArbiter:
    """规则脑 + AI 脑 → 融合裁决。"""

    def __init__(
        self,
        rule_oracle: Any,  # RuneOracle 实例，来自 main
        ai_adapter: Optional[AIAdapter] = None,
    ):
        self.rule_oracle = rule_oracle
        self.ai_adapter = ai_adapter or StubAIAdapter()

    async def generate_final_interpretation(
        self,
        *,
        question: str,
        theme: str,
        spread_type: str,
        position_results: List[Dict[str, Any]],
        rule_overall_advice: str,
        context: Optional[str] = None,
        style: str = "balanced",
        user_history: Optional[UserHistory] = None,
    ) -> tuple[str, bool]:
        """
        返回 (融合后的解读正文, 是否通过一致性检查)。
        若未通过，则降级为纯规则解读。
        """
        drawn_runes = [p["rune"] for p in position_results]
        runes_for_check = [
            {"rune": d["rune"], "reversed": d["reversed"]}
            for d in drawn_runes
        ]
        positions = [p.get("position") for p in position_results]

        try:
            ai_text = await self.ai_adapter.generate_interpretation(
                user_question=question,
                context=context,
                drawn_runes=drawn_runes,
                spread_type=spread_type,
                theme=theme,
                user_history=user_history,
            )
        except Exception:
            return rule_overall_advice, False

        passed, errors = light_consistency_check(ai_text, runes_for_check)
        if not passed:
            return rule_overall_advice, False

        ratio = FUSION_RATIOS.get(style, 0.6)
        final = merge_texts(rule_overall_advice, ai_text, ratio)
        return final, True
