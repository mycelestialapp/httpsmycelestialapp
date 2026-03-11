# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
import uuid
from datetime import datetime
import random

# ========== 类型定义 ==========

class ThemeType(str, Enum):
    GENERAL = "general"
    LOVE = "love"
    CAREER = "career"
    WEALTH = "wealth"
    HEALTH = "health"
    EDUCATION = "education"
    LEGAL = "legal"
    SPIRITUAL = "spiritual"
    THIRD_PARTY = "third_party"
    DECISION = "decision"
    PUBLIC = "public"

class SpreadType(str, Enum):
    SINGLE = "single"
    THREE_NORNS = "three_norns"
    FIVE_CROSS = "five_cross"
    SEVEN_WORLDS = "seven_worlds"

class RunePoemSource(str, Enum):
    NORWEGIAN = "norwegian"
    ICELANDIC = "icelandic"
    ANGLO_SAXON = "anglo_saxon"

# 请求/响应模型
class ReadingRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)
    context: Optional[str] = None
    theme: Optional[ThemeType] = None
    spread_type: Optional[SpreadType] = None
    include_blank: bool = True
    is_third_party: bool = False

class RuneResponse(BaseModel):
    id: int
    name: str
    symbol: str
    interpretive: str
    reversed: bool
    position: Optional[str] = None

class ReadingResponse(BaseModel):
    id: str
    question: str
    theme: ThemeType
    spread_type: SpreadType
    runes: List[RuneResponse]
    interpretations: List[str]
    overall_advice: str
    ethical_note: Optional[str] = None
    timestamp: datetime

# ========== 符文数据（简化版）==========

RUNES_SAMPLE = [
    {"id": 0, "name": "Fehu", "symbol": "ᚠ", "interpretive": "财富、丰盛、流动。象征流动的财富与生命力。", "reversible": True, "theme_weights": {"general": 0.5, "love": 0.7, "career": 0.8, "wealth": 0.9, "spiritual": 0.6}},
    {"id": 1, "name": "Uruz", "symbol": "ᚢ", "interpretive": "力量、耐力、健康、野性。原始的生命力。", "reversible": True, "theme_weights": {"general": 0.5, "love": 0.6, "career": 0.7, "health": 0.9, "spiritual": 0.5}},
    {"id": 2, "name": "Thurisaz", "symbol": "ᚦ", "interpretive": "挑战、保护、雷击、混沌之力。打破旧结构的钥匙。", "reversible": True, "theme_weights": {"general": 0.5, "career": 0.6, "legal": 0.8, "spiritual": 0.7}},
    {"id": 3, "name": "Ansuz", "symbol": "ᚨ", "interpretive": "智慧、言语、沟通、神启。来自神明的信息与教导。", "reversible": True, "theme_weights": {"general": 0.5, "love": 0.7, "career": 0.7, "education": 0.9, "spiritual": 0.8}},
    {"id": 4, "name": "Raidho", "symbol": "ᚱ", "interpretive": "旅程、变化、节奏、宇宙秩序。生命之路与正确节奏。", "reversible": True, "theme_weights": {"general": 0.5, "career": 0.7, "spiritual": 0.7, "decision": 0.8}},
]

# ========== 核心解读引擎 ==========

class RuneOracle:
    def __init__(self, include_blank=True):
        self.runes = RUNES_SAMPLE
        self.include_blank = include_blank

    def draw(self, count: int, theme: Optional[ThemeType] = None) -> List[Dict[str, Any]]:
        """抽取符文"""
        result = []
        for _ in range(count):
            rune = random.choice(self.runes).copy()
            reversed = False
            if rune.get("reversible", False):
                rev_prob = 0.5
                if theme and rune.get("theme_weights"):
                    weight = rune["theme_weights"].get(theme.value, 0.5)
                    rev_prob = 0.7 - (weight * 0.4)
                reversed = random.random() < rev_prob
            result.append({"rune": rune, "reversed": reversed})
        return result

    def interpret_single(self, drawn: Dict[str, Any], position: Optional[str] = None, theme: Optional[ThemeType] = None) -> str:
        """单符文解读"""
        rune = drawn["rune"]
        reversed = drawn["reversed"]
        orientation = "逆位" if reversed else "正位"
        pos_text = f"\n📍 位置：{position}" if position else ""
        return f"""【{rune['name']} {rune['symbol']} {orientation}】{pos_text}
核心含义：{rune['interpretive']}
💫 指引：{self._generate_advice(rune, reversed, theme)}"""

    def _generate_advice(self, rune: Dict, reversed: bool, theme: Optional[ThemeType]) -> str:
        base_advice = {"Fehu": "让能量流动起来，把握新机会", "Uruz": "相信你的力量，直面挑战", "Thurisaz": "清除障碍，设立边界", "Ansuz": "倾听智慧，勇于沟通", "Raidho": "找到节奏，稳步前行"}.get(rune["name"], "保持觉察，信任直觉")
        if reversed:
            return f"⚠️ 逆位提醒：{base_advice}，但需注意节奏"
        return f"✨ {base_advice}"

    def interpret_combination(self, drawn_runes: List[Dict]) -> Dict:
        if len(drawn_runes) < 2:
            return {"type": "neutral", "description": "单符文无需组合解读", "advice": "专注当下"}
        return {"type": "synergy", "description": "符文能量和谐，形成协同场", "advice": "顺势而为"}

    def generate_overall_advice(self, position_results: List, combination: Dict, question: str) -> str:
        advice = f"针对您的问题：「{question}」\n\n"
        for p in position_results:
            rune = p["rune"]["rune"]
            rev = p["rune"]["reversed"]
            advice += f"• {p['position']}：{rune['name']} {'逆位' if rev else '正位'}\n"
        advice += f"\n✨ 核心指引：{self._generate_advice(position_results[0]['rune']['rune'], position_results[0]['rune']['reversed'], None)}"
        if combination:
            advice += f"\n\n能量场分析：{combination['description']}\n{combination['advice']}"
        advice += "\n\n🌙 请记住：符文揭示的是能量与可能，而非注定。"
        return advice

    def perform_reading(self, question: str, theme: Optional[ThemeType] = None, spread_type: Optional[SpreadType] = None, context: Optional[str] = None) -> ReadingResponse:
        spread_map = {
            SpreadType.SINGLE: ["当下"],
            SpreadType.THREE_NORNS: ["乌尔德之井", "薇儿丹蒂之织", "诗蔻蒂之剪"],
            SpreadType.FIVE_CROSS: ["中心", "上方", "下方", "左方", "右方"],
            SpreadType.SEVEN_WORLDS: ["阿斯加德", "华纳海姆", "亚尔夫海姆", "中庭", "约顿海姆", "海姆冥界", "尼福尔海姆"],
        }
        spread = spread_type or SpreadType.THREE_NORNS
        positions = spread_map[spread]
        drawn = self.draw(len(positions), theme)
        position_results = []
        interpretations = []
        for i, pos in enumerate(positions):
            result = {"position": pos, "rune": drawn[i]}
            position_results.append(result)
            interpretations.append(self.interpret_single(drawn[i], pos, theme))
        combination = self.interpret_combination([d["rune"] for d in drawn])
        overall = self.generate_overall_advice(position_results, combination, question)
        theme_resolved = theme or ThemeType.GENERAL
        ethical_note = None
        if theme_resolved == ThemeType.HEALTH and ("生死" in question or "癌症" in question or "手术" in question):
            ethical_note = "⚠️ 涉及重大健康问题，请务必咨询专业医生。符文仅作心灵支持。"
        if "自杀" in question or "自伤" in question:
            ethical_note = "⚠️ 如您或他人有自伤风险，请立即联系专业心理援助。"
        return ReadingResponse(
            id=str(uuid.uuid4()),
            question=question,
            theme=theme_resolved,
            spread_type=spread,
            runes=[
                RuneResponse(
                    id=d["rune"]["id"],
                    name=d["rune"]["name"],
                    symbol=d["rune"]["symbol"],
                    interpretive=d["rune"]["interpretive"],
                    reversed=d["reversed"],
                    position=positions[i] if i < len(positions) else None,
                )
                for i, d in enumerate(drawn)
            ],
            interpretations=interpretations,
            overall_advice=overall,
            ethical_note=ethical_note,
            timestamp=datetime.now(),
        )

# ========== FastAPI 应用 ==========

app = FastAPI(title="符文大师 · 神谕引擎 API", description="连接北欧诸神的古老智慧，探寻你生命的答案", version="4.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
oracle = RuneOracle()

@app.get("/")
async def root():
    return {"message": "符文大师 · 神谕引擎 API", "version": "4.0.0", "docs": "/docs"}

@app.post("/api/reading", response_model=ReadingResponse)
async def create_reading(request: ReadingRequest):
    try:
        return oracle.perform_reading(
            question=request.question,
            theme=request.theme,
            spread_type=request.spread_type,
            context=request.context,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/runes")
async def get_runes():
    return [{"id": r["id"], "name": r["name"], "symbol": r["symbol"]} for r in RUNES_SAMPLE]

@app.get("/api/runes/{rune_id}")
async def get_rune_detail(rune_id: int):
    rune = next((r for r in RUNES_SAMPLE if r["id"] == rune_id), None)
    if not rune:
        raise HTTPException(status_code=404, detail="符文不存在")
    return rune

@app.get("/api/questions")
async def get_common_questions():
    return [
        {"text": "我该不该主动表白？", "theme": "love"},
        {"text": "这段感情会有结果吗？", "theme": "love"},
        {"text": "我该不该跳槽？", "theme": "career"},
        {"text": "这次晋升我能成功吗？", "theme": "career"},
        {"text": "这笔投资能赚钱吗？", "theme": "wealth"},
        {"text": "如何改善财务状况？", "theme": "wealth"},
        {"text": "最近为什么总是做噩梦？", "theme": "spiritual"},
        {"text": "两个追求者，选谁？", "theme": "decision"},
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
