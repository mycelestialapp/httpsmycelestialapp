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


class DrawnRuneInput(BaseModel):
    """前端传入的已抽符文（与 rune.html 一致）。"""
    rune_id: int
    reversed: bool
    position: Optional[str] = None


class ReadingRequestV5(ReadingRequest):
    """v5 神经符号引擎：可选融合风格、可选前端传入抽牌结果。"""
    style: Optional[str] = "balanced"  # traditional | balanced | spiritual
    drawn_runes: Optional[List[DrawnRuneInput]] = None  # 若提供则使用此次抽牌，否则后端随机抽

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

# ========== 符文数据（24 符完整，与 rune.html 顺序一致）==========
from runes_data import RUNES_24, get_rune_by_id

RUNES_SAMPLE = RUNES_24

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

    def perform_reading(
        self,
        question: str,
        theme: Optional[ThemeType] = None,
        spread_type: Optional[SpreadType] = None,
        context: Optional[str] = None,
        drawn_runes: Optional[List[Any]] = None,
    ) -> ReadingResponse:
        spread_map = {
            SpreadType.SINGLE: ["当下"],
            SpreadType.THREE_NORNS: ["乌尔德之井", "薇儿丹蒂之织", "诗蔻蒂之剪"],
            SpreadType.FIVE_CROSS: ["中心", "上方", "下方", "左方", "右方"],
            SpreadType.SEVEN_WORLDS: ["阿斯加德", "华纳海姆", "亚尔夫海姆", "中庭", "约顿海姆", "海姆冥界", "尼福尔海姆"],
        }
        spread = spread_type or SpreadType.THREE_NORNS
        positions = spread_map[spread]
        if drawn_runes and len(drawn_runes) == len(positions):
            drawn = []
            for item in drawn_runes:
                rune_id = item.rune_id if hasattr(item, "rune_id") else item["rune_id"]
                rev = item.reversed if hasattr(item, "reversed") else item["reversed"]
                rune = get_rune_by_id(rune_id)
                if not rune:
                    drawn = self.draw(len(positions), theme)
                    break
                drawn.append({"rune": rune, "reversed": rev})
            if len(drawn) != len(positions):
                drawn = self.draw(len(positions), theme)
        else:
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

# ========== v5 解读缓存（内存，TTL 1 小时）==========
import time

_v5_cache: Dict[str, tuple] = {}  # key -> (timestamp_ts, ReadingResponse dict)
_V5_CACHE_TTL = 3600


def _v5_cache_key(question: str, theme: str, spread_type: str, style: str, runes_spec: List[tuple]) -> str:
    """runes_spec: [(rune_id, reversed), ...]"""
    import hashlib
    raw = "|".join([question.strip(), theme or "", spread_type or "", style or ""] + [f"{a},{b}" for a, b in runes_spec])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:32]


# ========== FastAPI 应用 ==========

app = FastAPI(title="符文大师 · 神谕引擎 API", description="连接北欧诸神的古老智慧，探寻你生命的答案", version="5.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
oracle = RuneOracle()

# v5 融合裁决（有 ZHIPU_API_KEY 时使用智谱 GLM，否则用 Stub 规则扩写）
try:
    from fusion_arbiter import FusionArbiter
    from ai_adapter import get_default_adapter
    _fusion_arbiter = FusionArbiter(rule_oracle=oracle, ai_adapter=get_default_adapter())
    _v5_available = True
except Exception:
    _fusion_arbiter = None
    _v5_available = False


@app.get("/")
async def root():
    return {"message": "符文大师 · 神谕引擎 API", "version": "5.0.0", "docs": "/docs", "v5": _v5_available}

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


@app.post("/api/v5/reading", response_model=ReadingResponse)
async def create_reading_v5(request: ReadingRequestV5):
    """v5 神经符号神谕：规则脑 + AI 脑融合解读。style: traditional | balanced | spiritual；可传 drawn_runes 使用前端抽牌结果。"""
    if not _v5_available:
        raise HTTPException(status_code=501, detail="v5 模块未加载，请检查 fusion_arbiter/ai_adapter")
    try:
        theme_str = (request.theme or ThemeType.GENERAL).value
        spread_str = (request.spread_type or SpreadType.THREE_NORNS).value
        style = ((request.style or "balanced").lower() if request.style else "balanced")
        if style not in ("traditional", "balanced", "spiritual"):
            style = "balanced"
        if request.drawn_runes and len(request.drawn_runes) > 0:
            runes_spec = [(r.rune_id, r.reversed) for r in request.drawn_runes]
            ckey = _v5_cache_key(request.question, theme_str, spread_str, style, runes_spec)
            if ckey in _v5_cache:
                ts, data = _v5_cache[ckey]
                if data and time.time() - ts < _V5_CACHE_TTL:
                    d = data.copy()
                    if isinstance(d.get("timestamp"), str):
                        d["timestamp"] = datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00"))
                    return ReadingResponse(**d)
        resp = oracle.perform_reading(
            question=request.question,
            theme=request.theme,
            spread_type=request.spread_type,
            context=request.context,
            drawn_runes=request.drawn_runes if request.drawn_runes else None,
        )
        position_results = [
            {
                "position": r.position,
                "rune": {
                    "rune": {"id": r.id, "name": r.name, "symbol": r.symbol, "interpretive": r.interpretive},
                    "reversed": r.reversed,
                },
            }
            for r in resp.runes
        ]
        theme_str = (request.theme or ThemeType.GENERAL).value
        spread_str = (request.spread_type or SpreadType.THREE_NORNS).value
        style = (request.style or "balanced").lower()
        if style not in ("traditional", "balanced", "spiritual"):
            style = "balanced"
        final_advice, _passed = await _fusion_arbiter.generate_final_interpretation(
            question=request.question,
            theme=theme_str,
            spread_type=spread_str,
            position_results=position_results,
            rule_overall_advice=resp.overall_advice,
            context=request.context,
            style=style,
        )
        final_resp = ReadingResponse(
            id=resp.id,
            question=resp.question,
            theme=resp.theme,
            spread_type=resp.spread_type,
            runes=resp.runes,
            interpretations=resp.interpretations,
            overall_advice=final_advice,
            ethical_note=resp.ethical_note,
            timestamp=resp.timestamp,
        )
        runes_spec = [(r.id, r.reversed) for r in final_resp.runes]
        ckey = _v5_cache_key(request.question, theme_str, spread_str, style, runes_spec)
        _v5_cache[ckey] = (time.time(), final_resp.model_dump(mode="json"))
        return final_resp
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
