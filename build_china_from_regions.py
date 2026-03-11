#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
把 china_regions.json（你现在这份「省 -> 城市/市辖区/县 -> 区县/街道」的中文结构）
转换为前端四级联动用的 geoHierarchy_cn.json。

输入：
  china_regions.json   （当前结构大致为：
     {
       "北京市": {
         "市辖区": {
           "东城区": [ "东华门街道", ... ],
           "西城区": [ ... ],
           ...
         },
         "县": {
           "密云县": [ ... ],
           "延庆县": [ ... ]
         }
       },
       "河北省": {
         "石家庄市": [ "长安区", "桥西区", ... ],
         ...
       },
       ...
     }
  )

输出：
  src/lib/geoHierarchy_cn.json

目标结构（前端使用）：
[
  {
    "code": "CN",
    "name_en": "China",
    "name_local": "中国",
    "regions": [
      {
        "id": "北京市",
        "name_en": "北京市",
        "name_local": "北京市",
        "cities": [
          {
            "id": "东城区",
            "name_en": "东城区",
            "name_local": "东城区",
            "districts": [
              { "id": "东华门街道", "name_en": "东华门街道", "name_local": "东华门街道", "lat": null, "lng": null },
              ...
            ]
          }
        ]
      },
      ...
    ]
  }
]
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
IN_PATH = ROOT / "china_regions.json"
OUT_PATH = ROOT / "src" / "lib" / "geoHierarchy_cn.json"


def _ensure_extra_regions(country: dict) -> None:
    """如果源数据里没有港澳台，就手工补上一个比较完整的港澳台层级。"""
    existing_names = {r.get("name_local") for r in country.get("regions", [])}

    extra_regions = []

    # 香港特别行政区 —— 18 区
    if "香港特别行政区" not in existing_names and "香港" not in existing_names:
        hk_districts = [
            "中西区",
            "湾仔区",
            "东区",
            "南区",
            "油尖旺区",
            "深水埗区",
            "九龙城区",
            "黄大仙区",
            "观塘区",
            "葵青区",
            "荃湾区",
            "屯门区",
            "元朗区",
            "北区",
            "大埔区",
            "西贡区",
            "沙田区",
            "离岛区",
        ]
        hk_region = {
            "id": "香港特别行政区",
            "name_en": "Hong Kong",
            "name_local": "香港特别行政区",
            "cities": [],
        }
        for name in hk_districts:
            city_node = {
                "id": name,
                "name_en": name,
                "name_local": name,
                "districts": [
                    {
                        "id": name,
                        "name_en": name,
                        "name_local": name,
                        "lat": None,
                        "lng": None,
                    }
                ],
            }
            hk_region["cities"].append(city_node)
        extra_regions.append(hk_region)

    # 澳门特别行政区 —— 7 个堂区
    if "澳门特别行政区" not in existing_names and "澳门" not in existing_names:
        mo_districts = [
            "花地玛堂区",
            "圣安多尼堂区",
            "大堂区",
            "望德堂区",
            "风顺堂区",
            "嘉模堂区",
            "圣方济各堂区",
        ]
        mo_region = {
            "id": "澳门特别行政区",
            "name_en": "Macao",
            "name_local": "澳门特别行政区",
            "cities": [],
        }
        for name in mo_districts:
            city_node = {
                "id": name,
                "name_en": name,
                "name_local": name,
                "districts": [
                    {
                        "id": name,
                        "name_en": name,
                        "name_local": name,
                        "lat": None,
                        "lng": None,
                    }
                ],
            }
            mo_region["cities"].append(city_node)
        extra_regions.append(mo_region)

    # 台湾省 —— 以县市为“城市”，下面挂一个同名区县，保证三级都有
    if "台湾省" not in existing_names and "台湾" not in existing_names:
        tw_cities = [
            "台北市",
            "新北市",
            "桃园市",
            "台中市",
            "台南市",
            "高雄市",
            "基隆市",
            "新竹市",
            "嘉义市",
            "新竹县",
            "苗栗县",
            "彰化县",
            "南投县",
            "云林县",
            "嘉义县",
            "屏东县",
            "宜兰县",
            "花莲县",
            "台东县",
            "澎湖县",
            "金门县",
            "连江县",
        ]
        tw_region = {
            "id": "台湾省",
            "name_en": "Taiwan",
            "name_local": "台湾省",
            "cities": [],
        }
        for name in tw_cities:
            city_node = {
                "id": name,
                "name_en": name,
                "name_local": name,
                "districts": [
                    {
                        "id": name,
                        "name_en": name,
                        "name_local": name,
                        "lat": None,
                        "lng": None,
                    }
                ],
            }
            tw_region["cities"].append(city_node)
        extra_regions.append(tw_region)

    if extra_regions:
        country.setdefault("regions", []).extend(extra_regions)


def build_cn():
    if not IN_PATH.exists():
        raise FileNotFoundError(f"找不到 china_regions.json，请确认路径: {IN_PATH}")

    print(f"读取 {IN_PATH} ...")
    raw = IN_PATH.read_text(encoding="utf-8")
    data = json.loads(raw)

    if not isinstance(data, dict):
        raise ValueError("china_regions.json 顶层应为 { 省名: {...} } 的对象结构。")

    country = {
        "code": "CN",
        "name_en": "China",
        "name_local": "中国",
        "regions": [],
    }

    # 顶层：省 / 直辖市 / 自治区 / 港澳台
    for prov_name, cities_or_types in data.items():
        region = {
            "id": prov_name,
            "name_en": prov_name,
            "name_local": prov_name,
            "cities": [],
        }

        # 直辖市（北京 / 上海 / 天津 / 重庆）：
        # 希望「城市格子 = 直辖市本身」，「区县格子 = 东城区 / 西城区 / …」
        if prov_name in {"北京市", "上海市", "天津市", "重庆市"} and isinstance(cities_or_types, dict):
            city_name = prov_name
            city_node = {
                "id": city_name,
                "name_en": city_name,
                "name_local": city_name,
                "districts": [],
            }
            for second_val in cities_or_types.values():
                # 可能是 {"东城区": [街道...], "西城区": [...]} 或 ["延庆县", ...]
                if isinstance(second_val, dict):
                    for dist_name in second_val.keys():
                        dist_node = {
                            "id": dist_name,
                            "name_en": dist_name,
                            "name_local": dist_name,
                            "lat": None,
                            "lng": None,
                        }
                        city_node["districts"].append(dist_node)
                elif isinstance(second_val, list):
                    for dist_name in second_val:
                        dist_node = {
                            "id": dist_name,
                            "name_en": dist_name,
                            "name_local": dist_name,
                            "lat": None,
                            "lng": None,
                        }
                        city_node["districts"].append(dist_node)
            region["cities"].append(city_node)
            country["regions"].append(region)
            continue

        # 普通省份 / 其它情况：第二层有两种形态
        # 1）value 是 dict：例如 "市辖区": { "东城区": [街道...], "西城区": [...] }
        #    这里我们把下一层 key 当作“城市 / 区县”名，再往下的街道列表当作最小一级。
        # 2）value 是 list：例如 "石家庄市": ["长安区", "桥西区", ...]
        #    这里 city_name = "石家庄市"，list 里的每一项是区县名。
        if not isinstance(cities_or_types, dict):
            # 意外结构，跳过
            continue

        for second_key, second_val in cities_or_types.items():
            # 普通省份：second_key 一般就是“地级市名称”，里面要么是 dict（区县 -> 街道列表），要么是 list（直接列出区县）
            if isinstance(second_val, dict):
                city_name = second_key
                city_node = {
                    "id": city_name,
                    "name_en": city_name,
                    "name_local": city_name,
                    "districts": [],
                }
                for dist_name in second_val.keys():
                    dist_node = {
                        "id": dist_name,
                        "name_en": dist_name,
                        "name_local": dist_name,
                        "lat": None,
                        "lng": None,
                    }
                    city_node["districts"].append(dist_node)
                region["cities"].append(city_node)
            elif isinstance(second_val, list):
                city_name = second_key
                city_node = {
                    "id": city_name,
                    "name_en": city_name,
                    "name_local": city_name,
                    "districts": [],
                }
                for dist_name in second_val:
                    dist_node = {
                        "id": dist_name,
                        "name_en": dist_name,
                        "name_local": dist_name,
                        "lat": None,
                        "lng": None,
                    }
                    city_node["districts"].append(dist_node)
                region["cities"].append(city_node)
            else:
                # 其它意外结构，直接忽略
                continue

        country["regions"].append(region)

    # 补充港澳台
    _ensure_extra_regions(country)

    print(f"写出 {OUT_PATH} ...")
    OUT_PATH.write_text(json.dumps([country], ensure_ascii=False), encoding="utf-8")
    print("完成，中国 geoHierarchy_cn.json 已生成。")


if __name__ == "__main__":
    build_cn()
