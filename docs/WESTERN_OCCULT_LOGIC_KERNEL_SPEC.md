# Western Occult Logic Kernel v12.0 規格說明

本文件定義 **Western_Occult_Universal_Protocol_v12_Industrial** 內核的標準 JSON 協議，用於驅動「星圖 / 西方占卜」相關所有後端計算與前端內容生成。

- **目標**：做到「可計算、可測試、可重現」的工業級占卜引擎，而不是僅僅文字模板。
- **範圍**：占星（Astrology）、雷諾曼（Lenormand）、塔羅（Tarot）、數字命理（Numerology）、融合編排（Orchestrator）。
- **約束**：所有調用必須遵守 `INPUT_SCHEMA`，所有輸出必須遵守 `OUTPUT_SCHEMA`，牌類占卜必須記錄 RNG `seed`，最終結論由 Orchestrator 按權重融合並給出 `Confidence_Score`。

---

## 一、內核頂層結構（標準 JSON 協議）

> 此段 JSON 是**規格示例**，不是實際運行結果。實作時應嚴格遵守 key 名與結構，允許擴展但不建議隨意修改既有字段。

```json
{
  "KERNEL_NAME": "Western_Occult_Universal_Protocol_v12_Industrial",
  "VERSION": "12.0",

  "GLOBAL": {
    "Locale_Supported": ["en", "zh-Hant", "zh-Hans", "ja", "ko", "es", "fr", "ar"],
    "Determinism": "Seeded_RNG",
    "Units": {
      "Angles": "Degrees_0_360",
      "Time": "UTC_ISO8601",
      "TZ_Offset": "Seconds"
    }
  },

  "ENGINE_CORE": {
    "1_ASTROLOGY_COMPUTATION_CHAIN": {
      "SYSTEM_CONFIG": {
        "Ephemeris": "Swiss_Ephemeris_Pyswisseph_J2000",
        "Time_System": "UTC_TT",
        "Zodiac": "Tropical",
        "House_Algorithms": ["Placidus", "Whole_Sign", "Regiomontanus"],
        "Default_House_System": "Placidus"
      },

      "INPUT_SCHEMA": {
        "birth_iso8601": "string (YYYY-MM-DDTHH:MM:SSZ)",
        "lat_lng": {
          "type": "tuple",
          "items": ["float (latitude)", "float (longitude)"]
        },
        "tz_offset": "integer (seconds, e.g. 28800 for UTC+8)",
        "house_system": "optional string, default = SYSTEM_CONFIG.Default_House_System"
      },

      "OUTPUT_SCHEMA": {
        "core_points": {
          "Sun": {
            "sign": "string (e.g. 'CP')",
            "degree": "float (0.0-30.0)",
            "house": "integer (1-12)"
          },
          "Moon": {
            "sign": "string",
            "degree": "float",
            "house": "integer"
          },
          "Asc": {
            "sign": "string",
            "degree": "float"
          }
        },
        "planets": [
          {
            "name": "string (e.g. 'Mars')",
            "sign": "string",
            "degree": "float (0.0-30.0)",
            "house": "integer (1-12)",
            "dignity_score": "integer",
            "dignity_breakdown": [
              {
                "mode": "string (Domicile|Exaltation|Triplicity|Term|Face|Detriment|Fall|Peregrine|Mutual_Reception)",
                "value": "integer"
              }
            ]
          }
        ],
        "aspects": [
          {
            "p1": "string (Planet_1_Name)",
            "p2": "string (Planet_2_Name)",
            "type": "string (Conj|Oppo|Trine|Square|Sextile)",
            "orb": "float (actual orb in degrees)",
            "max_orb": "float (allowed orb for this pair)",
            "is_within_orb": "boolean"
          }
        ],
        "dignity_sum": "integer (sum over all planets)",
        "meta": {
          "house_system_used": "string",
          "ephemeris": "string",
          "computation_timestamp_utc": "string (ISO8601)"
        }
      },

      "QUANTITATIVE_DIGNITY_MATRIX": {
        "Domicile": 5,
        "Exaltation": 4,
        "Triplicity": 3,
        "Term": 2,
        "Face": 1,
        "Detriment": -5,
        "Fall": -4,
        "Peregrine": -2,
        "Mutual_Reception": 4
      },

      "DYNAMIC_ORB_ALGORITHM": {
        "Formula": "Actual_Orb = Base_Orb * (P1_Weight + P2_Weight) / 2",
        "Base_Orbs": {
          "Conj": 10,
          "Oppo": 10,
          "Trine": 8,
          "Square": 8,
          "Sextile": 6
        },
        "Weights": {
          "Sun": 1.5,
          "Moon": 1.5,
          "Personal": 1.0,
          "Jupiter_Saturn": 0.8,
          "Outer": 0.5
        }
      }
    },

    "2_LENORMAND_GRAND_TABLEAU_ENGINE": {
      "GRID_MATRIX": "8x4 + 4 (Standard 36-Card Layout)",

      "INPUT_SCHEMA": {
        "layout": "string, e.g. 'Grand_Tableau_36'",
        "cards": [
          {
            "card": "string (e.g. 'Heart')",
            "house": "string (e.g. 'H25_Ring')",
            "position": {
              "row": "integer (1-based)",
              "col": "integer (1-based)"
            }
          }
        ],
        "significator": "optional string (e.g. 'Man' or 'Woman')"
      },

      "HOUSE_SYSTEM_36": {
        "H1_Rider": "Speed/News",
        "H2_Clover": "Luck",
        "H3_Ship": "Distance",
        "H10_Scythe": "Danger",
        "H24_Heart": "Emotions",
        "H25_Ring": "Contracts",
        "H36_Cross": "Destiny_Burden"
      },

      "SPATIAL_ALGORITHMS": {
        "Distance_Rule": "Man/Woman Card as Origin (0,0). Euclidean Distance to Target_Card.",
        "Knighting": "L-Shape Move [2,1] or [1,2] for Hidden Context.",
        "Mirroring": "Card position reflected across X/Y axis.",
        "Diagonals": "Future/Past trajectory lines."
      },

      "COMBINATORY_SYNTAX": {
        "Formula": "Noun(Card_A) + Adjective(Card_B) + Context(House_N)",
        "Example": "Heart(24) in House_Ring(25) = Committed_Love_at_Peak"
      },

      "OUTPUT_SCHEMA": {
        "spatial": {
          "reference": "string (e.g. 'Significator' or 'Center')",
          "metrics": [
            {
              "card": "string",
              "distance": "float",
              "distance_bucket": "string (near|medium|far)",
              "knighting_links": ["string (card names)"],
              "mirrored_positions": [
                { "row": "integer", "col": "integer" }
              ]
            }
          ]
        },
        "syntactic_interpretation": {
          "core_phrase": "string (e.g. 'Danger_to_Marriage')",
          "evidence": ["string (explanatory bullet)"],
          "confidence": "float (0.0-1.0)"
        },
        "meta": {
          "layout": "string",
          "card_count": "integer"
        }
      }
    },

    "3_TAROT_DYNAMICS_&_RNG": {
      "RNG_PROTOCOL": {
        "Algorithm": "HMAC_DRBG",
        "Seed": "User_Input_Hash + System_Entropy",
        "Seed_Log_Policy": "Store seed and timestamp for traceability"
      },

      "DECK_DEFINITION": {
        "deck_id": "RiderWaite_Standard_78",
        "cards": [
          {
            "id": "string (e.g. 'MAJOR_00_FOOL')",
            "name": "string",
            "suit": "string (Major|Wands|Cups|Swords|Pentacles)",
            "rank": "string or integer",
            "element": "string (Fire|Water|Air|Earth|Spirit)",
            "supports_reversal": "boolean"
          }
        ]
      },

      "SPREAD_DEFINITIONS": {
        "Three_Card": {
          "slots": [
            { "id": "past", "position_weight": 0.3 },
            { "id": "present", "position_weight": 0.4 },
            { "id": "future", "position_weight": 0.3 }
          ]
        }
      },

      "ELEMENT_WEIGHT_MATRIX": {
        "Fire_Fire": 1.5,
        "Fire_Air": 1.2,
        "Water_Earth": 1.2,
        "Fire_Water": -0.8,
        "Air_Earth": -0.5,
        "Neutral": 1.0
      },

      "DYNAMIC_SPREAD_INTERPRETATION": {
        "Weight_A": "Position_Significance (Past/Present/Future)",
        "Weight_B": "Elemental_Dignity_Interaction"
      },

      "INPUT_SCHEMA": {
        "question": "optional string (user question in natural language)",
        "spread_type": "string (e.g. 'Three_Card')",
        "seed_override": "optional string (if provided, overrides RNG internal seed)"
      },

      "OUTPUT_SCHEMA": {
        "seed_used": "string",
        "spread_type": "string",
        "slots": [
          {
            "id": "string (e.g. 'present')",
            "card_id": "string",
            "upright": "boolean",
            "element": "string",
            "position_weight": "float",
            "element_interaction_weight": "float",
            "slot_score": "float"
          }
        ],
        "overall_theme": "string",
        "confidence": "float (0.0-1.0)"
      }
    },

    "4_NUMEROLOGY_PILLARS": {
      "FORMULA": {
        "Life_Path": "Reduce(YYYY) + Reduce(MM) + Reduce(DD)",
        "Expression": "Reduce(Full_Name_Letters_Pythagorean)",
        "Soul_Urge": "Reduce(Vowels_Only)",
        "Personality": "Reduce(Consonants_Only)",
        "Master_Number_Check": "If Sum in [11, 22, 33] -> Do_Not_Reduce",
        "Karmic_Debt": "Identify 13, 14, 16, 19 during intermediate steps"
      },

      "INPUT_SCHEMA": {
        "birth_date": "string (YYYY-MM-DD)",
        "full_name": "string (UTF-8, mapped to Pythagorean numbers)"
      },

      "OUTPUT_SCHEMA": {
        "life_path": {
          "value": "integer",
          "is_master": "boolean",
          "karmic_debts": ["integer"]
        },
        "expression": {
          "value": "integer",
          "is_master": "boolean"
        },
        "soul_urge": {
          "value": "integer",
          "is_master": "boolean"
        },
        "personality": {
          "value": "integer",
          "is_master": "boolean"
        }
      }
    },

    "5_ORCHESTRATOR_FUSION_LOGIC": {
      "PRIORITY_LEVELS": {
        "P1_Transits": 0.5,
        "P2_Tarot_Lenormand": 0.3,
        "P3_Numerology": 0.2
      },

      "CONFLICT_RESOLUTION": {
        "Rule": "If P1.Energy != P2.Energy -> Output 'Internal vs External Friction'",
        "Confidence_Score": "Sum(Consistency_of_Modules) / Total_Modules"
      },

      "OUTPUT_SCHEMA": {
        "modules_used": ["string"],
        "module_summaries": [
          {
            "module": "string (Astrology|Tarot|Lenormand|Numerology)",
            "energy_vector": {
              "fire": "float",
              "water": "float",
              "air": "float",
              "earth": "float"
            },
            "local_confidence": "float"
          }
        ],
        "fused_theme": "string",
        "fused_advice": "string",
        "confidence_score": "float (0.0-1.0)"
      }
    }
  },

  "TEST_VECTORS": {
    "ASTRO_V1": {
      "In": {
        "birth_iso8601": "1990-01-01T12:00:00Z",
        "lat_lng": [51.5, -0.12],
        "tz_offset": 0
      },
      "Expected": {
        "core_points": {
          "Sun": { "sign": "CP", "degree": 10.2 },
          "Asc": { "sign": "AR", "degree": 15.1 }
        },
        "dignity_sum": 12
      }
    },

    "LENORMAND_V1": {
      "In": {
        "layout": "Grand_Tableau_36",
        "cards": [
          { "card": "Heart", "house": "H25_Ring", "position": { "row": 3, "col": 5 } },
          { "card": "Scythe", "house": "H24_Heart", "position": { "row": 2, "col": 6 } }
        ]
      },
      "Expected": {
        "syntactic_interpretation": {
          "core_phrase": "Danger_to_Marriage",
          "confidence": 0.85
        }
      }
    }
  }
}
```

---

## 二、實作注意事項（工程層面）

1. **嚴格輸入校驗（Input Validation）**  
   - 所有入口（API / 前端調用 / 內部服務）都必須在進入內核前，檢查是否滿足對應 `INPUT_SCHEMA`。  
   - 缺少必填字段時，返回**結構化錯誤**（例如 `error.code = 'MISSING_FIELD'`，`error.field = 'birth_iso8601'`），不要默默降級。

2. **量化輸出與可溯源（Explainability）**  
   - 占星：必須在輸出中包含 `dignity_breakdown` 與 `dignity_sum`，方便事後比對/調整權重。  
   - 雷諾曼：必須輸出 `spatial.metrics` 與 `syntactic_interpretation.evidence`，確保每條結論都有「位置 + 組合」證據。

3. **RNG 記錄（Seed Logging）**  
   - 所有牌類（塔羅、雷諾曼若設計為隨機抽牌）必須：
     - 生成可重現的 `seed`（可來自用戶輸入 + 系統熵）。  
     - 在後端安全日誌中記錄 `seed` + 請求時間（不可寫回前端）。  
   - 這樣既能在出問題時追溯，又不洩露給用戶。

4. **Orchestrator 融合（Weighted Fusion）**  
   - 前端看到的「最終文案」應來自 `5_ORCHESTRATOR_FUSION_LOGIC.OUTPUT_SCHEMA`。  
   - 具體實作可以：
     - 先把各模塊輸出映射到同一個 `energy_vector`（火/水/風/土等）。  
     - 再按 `PRIORITY_LEVELS` 做加權，得到最終 `fused_theme` 與 `confidence_score`。

5. **自動測試與回歸（Using TEST_VECTORS）**  
   - 為內核建立單元測試，對每個 `TEST_VECTORS.*` 做：
     - 按 `In` 調用對應模塊。  
     - 檢查關鍵字段是否與 `Expected` 一致（允許浮點有微小誤差）。  
   - 這是防止日後調整權重/演算法時「盤突然全變」的安全網。

---

## 三、用法總結（給開發者）

- 前端 / API 只需要知道：  
  1. 傳入資料時要符合 `INPUT_SCHEMA`。  
  2. 從內核讀取資料時，按 `OUTPUT_SCHEMA` 解構。  
  3. 預設情況下，顯示 Orchestrator 的 `fused_theme / fused_advice / confidence_score`。  
- 內核的實現細節（星曆、宮位計算、牌組定義、數字命理映射）都應**封裝在這份協議之下**，避免散落在多個檔案。

未來若要擴展（如：加 Runes、Oracle & Pendulum 等），建議沿用本文件的結構：  
**每個模塊都必須明確 `INPUT_SCHEMA` + `OUTPUT_SCHEMA` + 關鍵公式，並附最少 1 組 `TEST_VECTOR`。**

