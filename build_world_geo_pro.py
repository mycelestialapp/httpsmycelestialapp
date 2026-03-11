#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
构建 world_geo_pro.db（SQLite）的脚本

作用：
- 使用公开数据源生成一个统一的世界行政区层级数据库：
  Country(level 1) -> State/Region(level 2) -> City/County(level 3) -> District/ZIP(level 4)

注意：
- 需要网络连接。
- 只作为前端联动选择器的数据底座，不保证 100% 完整，但结构是统一的。
"""

import sqlite3
import requests
import json
import csv
import io
import time
from typing import Any, Dict, List, Optional

DB_PATH = "world_geo_pro.db"

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "world-geo-pro-builder/1.0"})


def fetch_text_with_backups(urls: List[str], timeout: int = 30) -> str:
  """依次尝试多个 URL，返回文本内容；失败则抛异常。"""
  last_err: Optional[Exception] = None
  for url in urls:
    try:
      print(f"[fetch] {url}")
      resp = SESSION.get(url, timeout=timeout)
      resp.raise_for_status()
      resp.encoding = resp.apparent_encoding or "utf-8"
      return resp.text
    except Exception as e:
      print(f"  -> failed: {e}")
      last_err = e
      time.sleep(1)
  raise RuntimeError(f"All mirrors failed for {urls[0]}: {last_err}")


def fetch_json_with_backups(urls: List[str], timeout: int = 30) -> Any:
  txt = fetch_text_with_backups(urls, timeout)
  return json.loads(txt)


def fetch_csv_with_backups(urls: List[str], timeout: int = 30) -> List[Dict[str, str]]:
  txt = fetch_text_with_backups(urls, timeout)
  f = io.StringIO(txt)
  rdr = csv.DictReader(f)
  return list(rdr)


def init_db(path: str = DB_PATH) -> sqlite3.Connection:
  conn = sqlite3.connect(path)
  conn.execute("PRAGMA journal_mode=WAL;")
  conn.execute("PRAGMA synchronous=NORMAL;")
  cur = conn.cursor()
  cur.execute(
    """
    CREATE TABLE IF NOT EXISTS geo (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER REFERENCES geo(id),
      name_en   TEXT,
      name_local TEXT,
      level     INTEGER NOT NULL,   -- 1=国家, 2=省/州, 3=市/县, 4=区县/ZIP
      iso_code  TEXT,
      latitude  REAL,
      longitude REAL
    );
    """
  )
  cur.execute("CREATE INDEX IF NOT EXISTS idx_geo_parent ON geo(parent_id);")
  cur.execute("CREATE INDEX IF NOT EXISTS idx_geo_iso ON geo(iso_code);")
  conn.commit()
  return conn


def insert_place(
  cur: sqlite3.Cursor,
  parent_id: Optional[int],
  name_en: Optional[str],
  name_local: str,
  level: int,
  iso_code: Optional[str],
  lat: Optional[float] = None,
  lng: Optional[float] = None,
) -> int:
  cur.execute(
    """
    INSERT INTO geo (parent_id, name_en, name_local, level, iso_code, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
    (parent_id, name_en, name_local, level, iso_code, lat, lng),
  )
  return cur.lastrowid


# ------------------- 中国（modood） --------------------

def load_china(cur: sqlite3.Cursor) -> int:
  """
  简化版：中国这一步只插入一个国家节点，不再从 modood 下钻，
  以避免当前网络环境下 JSON 解析错误阻塞整个脚本。
  详细的中国省市区，前端我们已经有单独的 CHINA_DISTRICTS 维护。
  """
  print("==> China (CN) – simplified insert only ...")
  country_id = insert_place(cur, None, "China", "中国", 1, "CN")
  print("    China node inserted (no hierarchy).")
  return country_id


# ------------------ dr5hn 通用世界数据 -----------------

DR5HN = "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries+states+cities.json"


def load_world(cur: sqlite3.Cursor) -> Dict[str, Dict[str, Any]]:
  print("==> World countries/states/cities from dr5hn (combined JSON) ...")
  data = fetch_json_with_backups(
    [DR5HN, "https://ghproxy.com/" + DR5HN]
  )

  # data 结构：每个元素包含国家 + states + cities
  country_index: Dict[str, Dict[str, Any]] = {}

  for c in data:
    iso2 = c["iso2"]
    name = c["name"]
    lat = c.get("latitude")
    lng = c.get("longitude")
    cid = insert_place(
      cur,
      None,
      name,
      name,
      1,
      iso2,
      float(lat) if lat not in (None, "") else None,
      float(lng) if lng not in (None, "") else None,
    )
    country_index[iso2] = {"id": cid, "states": {}}

    # states
    for s in c.get("states", []):
      state_code = s.get("state_code")
      s_name = s.get("name")
      s_lat = s.get("latitude")
      s_lng = s.get("longitude")
      sid = insert_place(
        cur,
        cid,
        s_name,
        s_name,
        2,
        f"{iso2}-{state_code}" if state_code else None,
        float(s_lat) if s_lat not in (None, "") else None,
        float(s_lng) if s_lng not in (None, "") else None,
      )
      country_index[iso2]["states"][state_code] = sid

      # cities
      for city in s.get("cities", []):
        city_name = city.get("name")
        c_lat = city.get("latitude")
        c_lng = city.get("longitude")
        insert_place(
          cur,
          sid,
          city_name,
          city_name,
          3,
          None,
          float(c_lat) if c_lat not in (None, "") else None,
          float(c_lng) if c_lng not in (None, "") else None,
        )

  print("    World base data done.")
  return country_index


# ------------------ 美国：县 + ZIP ---------------------

def load_us_extra(cur: sqlite3.Cursor, index: Dict[str, Dict[str, Any]]) -> None:
  print("==> US Counties + ZIP ...")
  us = index.get("US")
  if not us:
    print("    US not found in base data, skip.")
    return

  state_code_to_id = us["states"]

  counties_rows = fetch_csv_with_backups(
    [
      "https://raw.githubusercontent.com/kjhealy/fips-codes/master/state_and_county_fips_master.csv",
      "https://ghproxy.com/https://raw.githubusercontent.com/kjhealy/fips-codes/master/state_and_county_fips_master.csv",
    ]
  )

  county_fips_to_id: Dict[str, int] = {}
  for row in counties_rows:
    state_abbr = row.get("state")
    county_name = row.get("county_name")
    statefp = row.get("statefp")
    countyfp = row.get("countyfp")
    if not state_abbr or not county_name or county_name.upper() == "STATEWIDE":
      continue
    state_id = state_code_to_id.get(state_abbr)
    if not state_id:
      continue
    fips = (statefp or "") + (countyfp or "")
    iso = f"US-{fips}" if fips else None
    cid = insert_place(cur, state_id, county_name, county_name, 3, iso)
    if fips:
      county_fips_to_id[fips] = cid

  zip_rows = fetch_csv_with_backups(
    [
      "https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/uszips.csv",
      "https://ghproxy.com/https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/uszips.csv",
    ]
  )

  for row in zip_rows:
    zip_code = row.get("zip")
    county_fips = row.get("county_fips")
    lat = row.get("lat")
    lng = row.get("lng")
    if not zip_code or not county_fips:
      continue
    parent = county_fips_to_id.get(county_fips)
    if not parent:
      continue
    name = f"ZIP {zip_code}"
    iso = f"US-{zip_code}"
    insert_place(
      cur,
      parent,
      name,
      name,
      4,
      iso,
      float(lat) if lat not in (None, "") else None,
      float(lng) if lng not in (None, "") else None,
    )

  print("    US extra done.")


def main() -> None:
  conn = init_db(DB_PATH)
  cur = conn.cursor()

  # 世界基础（包括 US/CN 在内）
  world_index = load_world(cur)

  # 用 modood 覆盖中国细节
  load_china(cur)

  # 美国县 + ZIP
  load_us_extra(cur, world_index)

  conn.commit()
  conn.close()
  print(f"\nDone. SQLite database written to: {DB_PATH}")


if __name__ == "__main__":
  main()

