#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
专门为中国生成四级联动所需的 geoHierarchy_cn.json（完全中文、省/市/区县）。

输入：
  c:\\Users\\lichengzhao\\Downloads\\admin_data.py 中的 generate_complete_china_administrative_data()

输出：
  src/lib/geoHierarchy_cn.json

结构：
[
  {
    "code": "CN",
    "name_en": "China",
    "name_local": "中国",
    "regions": [
      {
        "id": "110000",
        "name_en": "北京市",
        "name_local": "北京市",
        "cities": [
          {
            "id": "110100",
            "name_en": "北京市",
            "name_local": "北京市",
            "districts": [
              { "id": "110101", "name_en": "东城区", "name_local": "东城区", "lat": null, "lng": null }
            ]
          }
        ]
      }
    ]
  }
]
"""

import json
from pathlib import Path
from importlib.machinery import SourceFileLoader

ROOT = Path(__file__).resolve().parent
OUT_PATH = ROOT / "src" / "lib" / "geoHierarchy_cn.json"


def build_cn():
    # 从你提供的 admin_data.py 里读取全国省/市/区县结构（全中文）
    admin_path = Path(r"c:\Users\lichengzhao\Downloads\admin_data (1).py")
    if not admin_path.exists():
        raise FileNotFoundError(f"找不到 admin_data.py，请确认路径: {admin_path}")

    print(f"从 {admin_path} 读取中国行政区划数据 ...")
    module = SourceFileLoader("admin_data_local", str(admin_path)).load_module()
    data = module.generate_complete_china_administrative_data()

    country = {
        "code": "CN",
        "name_en": "China",
        "name_local": "中国",
        "regions": [],
    }

    # admin_data: { 省名: { 市名: [区县列表] } }
    for prov_name, cities_dict in data.items():
        prov_code = prov_name  # 这里直接用中文名作为 id
        region = {
            "id": prov_code or prov_name,
            "name_en": prov_name,
            "name_local": prov_name,
            "cities": [],
        }

        for city_name, districts_list in cities_dict.items():
            city_code = city_name
            city_node = {
                "id": city_code or city_name,
                "name_en": city_name,
                "name_local": city_name,
                "districts": [],
            }

            # districts_list: [ 区县名1, 区县名2, ... ]
            for dist_name in districts_list:
                dist_code = dist_name
                dist_node = {
                    "id": dist_code or dist_name,
                    "name_en": dist_name,
                    "name_local": dist_name,
                    "lat": None,
                    "lng": None,
                }
                city_node["districts"].append(dist_node)

            # 如果某些直辖市下面没有 children，就让城市自己充当一个“区县”
            if not city_node["districts"]:
                city_node["districts"].append(
                    {
                        "id": city_node["id"],
                        "name_en": city_name,
                        "name_local": city_name,
                        "lat": None,
                        "lng": None,
                    }
                )

            region["cities"].append(city_node)

        country["regions"].append(region)

    print(f"写出 {OUT_PATH} ...")
    OUT_PATH.write_text(json.dumps([country], ensure_ascii=False), encoding="utf-8")
    print("完成，中国 geoHierarchy_cn.json 已生成。")


if __name__ == "__main__":
    build_cn()

