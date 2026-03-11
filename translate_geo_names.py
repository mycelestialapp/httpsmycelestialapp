#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
批量为世界行政区（国家 / 省州 / 城市 / 区县）增加多语言名称字段的脚本骨架。

输入：
  src/lib/geoHierarchy.json  （你刚才导出的英文版）

输出：
  src/lib/geoHierarchy_multi.json
  在每个节点上增加：
    name_zh, name_ko, name_es, name_hi, name_ar, name_fr

现在 translate_name() 只是占位实现：直接返回英文。
以后你有翻译 API 时，只需要改 translate_name() 这一处，再重新运行脚本即可。
"""

import json
from pathlib import Path
from typing import Dict
import time

ROOT = Path(__file__).resolve().parent
SRC_PATH = ROOT / "src" / "lib" / "geoHierarchy.json"
OUT_PATH = ROOT / "src" / "lib" / "geoHierarchy_multi.json"

TARGET_LANGS = ["zh", "ko", "es", "hi", "ar", "fr"]


def translate_name(text_en: str, target_lang: str) -> str:
    """
    把英文地名翻译成目标语言。
    当前占位实现：直接返回英文。

    将来你可以在这里接入真实的翻译服务，比如：
      - 调用 Google Translate / DeepL API
      - 调用你自己的翻译模型
    """
    # TODO: 在这里接入真实翻译接口
    return text_en


_translate_cache: Dict[str, Dict[str, str]] = {}


def get_translation(text_en: str, lang: str) -> str:
    if not text_en:
        return ""
    key = text_en.strip()
    lang_map = _translate_cache.setdefault(key, {})
    if lang in lang_map:
        return lang_map[lang]
    translated = translate_name(key, lang)
    lang_map[lang] = translated
    # 现在先不做延时，全部在本地处理，速度更快
    return translated


def enrich_node_names(node: dict):
    """
    对单个节点增加 name_zh / name_ko / ... 等字段。
    以原来的 name_en 或 name_local 作为英文基准。
    """
    name_en = node.get("name_en") or node.get("name_local") or ""
    node["name_en"] = name_en

    for lang in TARGET_LANGS:
        field = f"name_{lang}"
        if node.get(field):
            continue
        node[field] = get_translation(name_en, lang)


def process():
    if not SRC_PATH.exists():
        raise FileNotFoundError(f"找不到输入文件: {SRC_PATH}")

    print(f"读取 {SRC_PATH} ...")
    raw = SRC_PATH.read_text(encoding="utf-8")
    data = json.loads(raw)

    # data 是国家数组
    for country in data:
        enrich_node_names(country)
        for region in country.get("regions", []):
            enrich_node_names(region)
            for city in region.get("cities", []):
                enrich_node_names(city)
                for dist in city.get("districts", []):
                    enrich_node_names(dist)

    print(f"写出 {OUT_PATH} ...")
    OUT_PATH.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    print("完成。")


if __name__ == "__main__":
    process()

