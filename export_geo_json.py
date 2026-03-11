import sqlite3
import json

DB_PATH = "world_geo_pro.db"
OUT_PATH = "geoHierarchy.json"

# 先导出你关心的这些国家；后面可以再往里加
TARGET_COUNTRIES = ["CN", "US", "JP", "GB", "DE", "FR", "RU", "IN", "TH", "SA", "BR", "KR", "VN", "ID"]


def export_geo():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    geo = []

    for iso2 in TARGET_COUNTRIES:
        # level=1: 国家
        cur.execute(
            "SELECT id, name_local, name_en FROM geo WHERE level=1 AND iso_code = ?",
            (iso2,),
        )
        row = cur.fetchone()
        if not row:
            continue
        country_id, name_local, name_en = row
        country = {
            "code": iso2,
            "name_en": name_en or iso2,
            "name_local": name_local or iso2,
            "regions": [],
        }

        # level=2: 省 / 州
        cur.execute(
            "SELECT id, name_local, name_en, iso_code FROM geo WHERE level=2 AND parent_id = ?",
            (country_id,),
        )
        regions = cur.fetchall()
        for rid, r_local, r_en, r_iso in regions:
            region = {
                "id": r_iso or f"{iso2}-{rid}",
                "name_en": r_en or r_local or "",
                "name_local": r_local or r_en or "",
                "cities": [],
            }

            # level=3: 市 / 郡 / 县级市
            cur.execute(
                "SELECT id, name_local, name_en, iso_code FROM geo WHERE level=3 AND parent_id = ?",
                (rid,),
            )
            cities = cur.fetchall()
            for cid, c_local, c_en, c_iso in cities:
                city = {
                    "id": c_iso or f"{region['id']}-{cid}",
                    "name_en": c_en or c_local or "",
                    "name_local": c_local or c_en or "",
                    "districts": [],
                }

                # level=4: 区 / 县（有就用，没有就让城市自己当一层）
                cur.execute(
                    "SELECT id, name_local, name_en, iso_code, latitude, longitude FROM geo WHERE level=4 AND parent_id = ?",
                    (cid,),
                )
                districts = cur.fetchall()
                for did, d_local, d_en, d_iso, lat, lng in districts:
                    district = {
                        "id": d_iso or f"{city['id']}-{did}",
                        "name_en": d_en or d_local or "",
                        "name_local": d_local or d_en or "",
                        "lat": lat,
                        "lng": lng,
                    }
                    city["districts"].append(district)

                # 如果没有 level=4，就用城市本身当一个“区县”
                if not city["districts"]:
                    city["districts"].append(
                        {
                            "id": city["id"],
                            "name_en": city["name_en"],
                            "name_local": city["name_local"],
                            "lat": None,
                            "lng": None,
                        }
                    )

                region["cities"].append(city)

            country["regions"].append(region)

        geo.append(country)

    conn.close()

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(geo, f, ensure_ascii=False)

    print(f"导出完成: {OUT_PATH}")


if __name__ == "__main__":
    export_geo()

