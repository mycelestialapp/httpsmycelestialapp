# v5.0 一致性校验（轻量版）：规则 + 黑名单，防止 AI 输出偏离符文事实

import re
from typing import List, Tuple

# 符文正位时禁止出现的负面偏离词（文化防火墙）
RULE_FORBIDDEN_PAIRS: List[Tuple[str, List[str]]] = [
    ("Fehu", ["损失", "破产", "破财", "穷困"]),
    ("Uruz", ["虚弱", "无力", "放弃", "萎靡"]),
    ("Thurisaz", ["和平", "无冲突", "一帆风顺"]),  # 正位多与挑战/防护相关
    ("Ansuz", ["误导", "谎言", "封闭"]),
    ("Raidho", ["停滞", "拖延", "永不动"]),
    ("Kenaz", ["幻灭", "隐瞒", "黑暗"]),
    ("Gebo", ["失去", "孤独", "无回"]),
    ("Wunjo", ["冲突", "悲伤", "破裂"]),
    ("Sowilo", ["阴霾", "挫败", "黑暗"]),
    ("Tiwaz", ["不公", "怯懦", "逃避"]),
    ("Berkanan", ["停滞", "空洞", "枯萎"]),
    ("Mannaz", ["自我怀疑", "依赖他人", "迷失"]),
]

# 绝对禁止：错误神祇、错误元素、绝对化预测等
BLACKLIST_PHRASES: List[str] = [
    "Fehu.*奥丁", "奥丁.*Fehu",  # Fehu 对应弗雷
    "Uruz.*水", "水.*Uruz", "Uruz是水",  # Uruz 为土/火
    "必然", "一定", "绝对会", "注定", "百分百",
]

# 解读长度（字符）
MIN_LENGTH = 100
MAX_LENGTH = 500


def check_length(text: str) -> bool:
    if not text or len(text) < MIN_LENGTH:
        return False
    if len(text) > MAX_LENGTH:
        return False
    return True


def check_blacklist(text: str) -> List[str]:
    """返回命中的黑名单规则（空为通过）。"""
    hits = []
    for phrase in BLACKLIST_PHRASES:
        if re.search(phrase, text):
            hits.append(phrase)
    return hits


def check_rune_contradiction(
    text: str, rune_name: str, reversed: bool
) -> List[str]:
    """若该符文为正位，检查是否出现对应禁止词。"""
    if reversed:
        return []
    hits = []
    for name, forbidden in RULE_FORBIDDEN_PAIRS:
        if name != rune_name:
            continue
        for word in forbidden:
            if word in text:
                hits.append(f"{name}正位禁止:{word}")
    return hits


def light_consistency_check(
    ai_text: str,
    runes_used: List[dict],
) -> Tuple[bool, List[str]]:
    """
    轻量一致性检查。
    runes_used: [{"rune": {"name": "Fehu", ...}, "reversed": False}, ...]
    返回 (通过, 违规说明列表)。
    """
    errors = []

    if not check_length(ai_text):
        errors.append("解读长度需在 100–500 字之间")

    for hit in check_blacklist(ai_text):
        errors.append(f"黑名单: {hit}")

    for item in runes_used:
        r = item.get("rune") or item
        name = r.get("name", "") if isinstance(r, dict) else getattr(r, "name", "")
        rev = item.get("reversed", False)
        for e in check_rune_contradiction(ai_text, name, rev):
            errors.append(e)

    return (len(errors) == 0, errors)
