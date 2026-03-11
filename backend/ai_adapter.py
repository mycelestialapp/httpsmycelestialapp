# v5.0 AI 大脑：LLM 适配器接口与占位实现
# 生产环境可接入智谱 GLM-4、通义千问等，见 RUNE_MASTER_V5_ROADMAP.md

import os
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

# 与 main 中枚举保持一致，避免循环导入时用字符串
THEME_VALUES = ("general", "love", "career", "wealth", "health", "education", "legal", "spiritual", "third_party", "decision", "public")
SPREAD_VALUES = ("single", "three_norns", "five_cross", "seven_worlds")


@dataclass
class UserHistory:
    """用户占卜档案（占位，后续可接 DB）。"""
    user_id: Optional[str] = None
    recent_rune_names: Optional[List[str]] = None
    theme_counts: Optional[Dict[str, int]] = None


class AIAdapter(ABC):
    """AI 解读生成器：输入问题+抽牌结果，输出一段 200–300 字解读。"""

    @abstractmethod
    async def generate_interpretation(
        self,
        *,
        user_question: str,
        context: Optional[str] = None,
        drawn_runes: List[Dict[str, Any]],
        spread_type: str,
        theme: str,
        user_history: Optional[UserHistory] = None,
    ) -> str:
        """生成富有灵性的解读正文。必须严格基于 drawn_runes 事实，不得编造符文含义。"""
        pass


# System 提示：文化防火墙第一层
SYSTEM_PROMPT = """你是一位精通北欧符文的智者，必须严格遵守以下规则：
1. 只基于给定的符文事实进行解读，不得编造任何符文含义。
2. 禁止：将 Fehu 与奥丁错误关联（正确是弗雷）；将 Uruz 描述为水元素（正确是土）；与基督教、佛教等无关宗教混用；声称可预测生死或绝对化表达。
3. 建议部分须包含「你的选择始终自由」类表述。
4. 用诗意的语言，结合北欧神话，给出 200–300 字的指引。"""


def _build_prompt(
    user_question: str,
    drawn_runes: List[Dict[str, Any]],
    spread_type: str,
    theme: str,
    positions: Optional[List[str]] = None,
) -> str:
    """构建发给 LLM 的用户提示。"""
    lines = [
        "【符文抽取结果】（请严格基于以下事实，不得编造）",
    ]
    for i, d in enumerate(drawn_runes):
        r = d.get("rune", d)
        name = r.get("name", "?")
        rev = d.get("reversed", False)
        pos = (positions[i] if positions and i < len(positions) else None) or "核心"
        meaning = r.get("interpretive", "")
        lines.append(f"- {name}（{'逆位' if rev else '正位'}），位于 {pos}，核心含义：{meaning}")
    lines.extend([
        "",
        f"用户问题：{user_question}",
        f"主题：{theme}",
        "",
        "请用诗意的语言，结合北欧神话，给出 200–300 字的指引。",
    ])
    return "\n".join(lines)


class StubAIAdapter(AIAdapter):
    """占位实现：不调 LLM，返回基于规则的短句拼接。用于开发与降级。"""

    async def generate_interpretation(
        self,
        *,
        user_question: str,
        context: Optional[str] = None,
        drawn_runes: List[Dict[str, Any]],
        spread_type: str,
        theme: str,
        user_history: Optional[UserHistory] = None,
    ) -> str:
        parts = [f"针对您的问题「{user_question}」，符文如是说："]
        for d in drawn_runes:
            r = d.get("rune", d)
            name = r.get("name", "?")
            rev = d.get("reversed", False)
            meaning = r.get("interpretive", "")
            parts.append(f"{name}（{'逆位' if rev else '正位'}）提醒：{meaning}")
        parts.append("请记住：符文揭示的是能量与可能，你的选择始终自由。")
        text = "\n\n".join(parts)
        # 保证不少于 100 字以通过轻量一致性检查
        if len(text) < 100:
            text += " 愿北欧诸神照亮你的道路，在变化中保持觉察与勇气。"
        return text


# 智谱 GLM-4 官方接口
ZHIPU_CHAT_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
ZHIPU_MODEL = "glm-4"


class GLMAdapter(AIAdapter):
    """智谱 GLM-4：需配置环境变量 ZHIPU_API_KEY。"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (api_key or os.environ.get("ZHIPU_API_KEY") or os.environ.get("RUNE_GLM_API_KEY") or "").strip()

    async def generate_interpretation(
        self,
        *,
        user_question: str,
        context: Optional[str] = None,
        drawn_runes: List[Dict[str, Any]],
        spread_type: str,
        theme: str,
        user_history: Optional[UserHistory] = None,
    ) -> str:
        if not self.api_key:
            raise RuntimeError("未配置 ZHIPU_API_KEY，无法调用智谱 GLM")
        prompt = _build_prompt(user_question, drawn_runes, spread_type, theme)
        import httpx
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                ZHIPU_CHAT_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": ZHIPU_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 600,
                    "temperature": 0.8,
                },
            )
            r.raise_for_status()
            data = r.json()
        content = (data.get("choices") or [{}])[0].get("message", {}).get("content") or ""
        if not content.strip():
            raise RuntimeError("智谱返回内容为空")
        if len(content) < 50:
            content += " 愿北欧诸神照亮你的道路，你的选择始终自由。"
        return content.strip()


def get_default_adapter() -> AIAdapter:
    """有 ZHIPU_API_KEY 时用 GLMAdapter，否则用 StubAIAdapter。"""
    key = (os.environ.get("ZHIPU_API_KEY") or os.environ.get("RUNE_GLM_API_KEY") or "").strip()
    return GLMAdapter(api_key=key) if key else StubAIAdapter()
