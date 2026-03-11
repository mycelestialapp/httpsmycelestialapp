# v5.0 缓存键：相同问题 + 相同抽牌结果可复用解读
# 一级缓存（前端）与二级缓存（Redis）均可用此键

from typing import List, Dict, Any, Optional


def _rune_spec(drawn: Dict[str, Any], position: Optional[str]) -> str:
    r = drawn.get("rune") or drawn
    rid = r.get("id") if isinstance(r, dict) else getattr(r, "id", "")
    rev = drawn.get("reversed", False) if "reversed" in drawn else False
    pos = position or ""
    return f"{rid}:{'R' if rev else 'U'}:{pos}"


def reading_cache_key(
    question: str,
    drawn_runes: List[Dict[str, Any]],
    positions: Optional[List[str]] = None,
    theme: Optional[str] = None,
    spread_type: Optional[str] = None,
) -> str:
    """生成解读缓存键。相同输入 → 相同键，便于一级/二级缓存复用。"""
    import hashlib
    parts = [
        question.strip().lower(),
        theme or "",
        spread_type or "",
    ]
    for i, d in enumerate(drawn_runes):
        pos = (positions[i] if positions and i < len(positions) else None) or ""
        parts.append(_rune_spec(d, pos))
    raw = "|".join(parts)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:32]
