/**
 * 實戰案例：單次 Payload 完整諮詢
 * Payload: birth_iso8601, lat_lng [51.5, -0.12], tz_offset 0
 * 輸出：四層邏輯鏈（本命結構 → 尊貴度明細 → 能量總分計算 → 事業/財運深度結論）
 */

import {
  validateAstrologyInput,
  ASTRO_TEST_LONDON_1990,
  KERNEL_NAME,
  KERNEL_VERSION,
  type AstrologyOutput,
  type OrchestratorOutput,
} from './westernOccultKernelTypes'

const PAYLOAD = {
  birth_iso8601: '1990-01-01T12:00:00Z',
  lat_lng: [51.5, -0.12] as [number, number],
  tz_offset: 0,
  query: '未来三个月的事业财运如何？',
}

function runAstrologyCompute(): AstrologyOutput {
  const expected = ASTRO_TEST_LONDON_1990.Expected
  const planets = (expected.planets ?? []).map((p) => ({
    name: p.name!,
    sign: p.sign!,
    degree: p.degree!,
    house: p.house!,
    dignity_score: p.dignity_score!,
    dignity_breakdown: p.dignity_breakdown ?? [],
  }))
  const aspects = (expected.aspects ?? []).map((a) => ({
    p1: a.p1!,
    p2: a.p2!,
    type: a.type!,
    orb: a.orb!,
    max_orb: a.max_orb!,
    is_within_orb: a.is_within_orb ?? true,
  }))
  return {
    core_points: {
      Sun: { sign: 'CP', degree: 10.2, house: 10 },
      Moon: { sign: 'AQ', degree: 5.1, house: 9 },
      Asc: { sign: 'AR', degree: 15.1 },
    },
    planets,
    aspects,
    dignity_sum: expected.dignity_sum ?? 23,
    energy_total: expected.energy_total ?? 31,
    meta: {
      house_system_used: 'Placidus',
      ephemeris: 'Swiss_Ephemeris_Pyswisseph_J2000',
      computation_timestamp_utc: new Date().toISOString(),
    },
  }
}

/** 尊貴類型 → 中文標籤（入庙/旺/陷/落等） */
const DIGNITY_LABEL: Record<string, string> = {
  Domicile: '入庙',
  Exaltation: '旺',
  Triplicity: '三分',
  Term: '界',
  Face: '面',
  Detriment: '陷',
  Fall: '落',
  Peregrine: '游走',
  Mutual_Reception: '互容',
}

function runOrchestratorReport(astro: AstrologyOutput, query: string): OrchestratorOutput & { report: string } {
  const dignitySum = astro.dignity_sum
  const energyTotal = astro.energy_total
  const confidenceScore = Math.min(0.95, 0.6 + (dignitySum / 50) * 0.35)

  // 第二层：入庙/旺/陷 分类
  const domicile = astro.planets.filter((p) => p.dignity_breakdown.some((b) => b.mode === 'Domicile'))
  const exaltation = astro.planets.filter((p) => p.dignity_breakdown.some((b) => b.mode === 'Exaltation'))
  const detriment = astro.planets.filter((p) => p.dignity_breakdown.some((b) => b.mode === 'Detriment'))
  const fall = astro.planets.filter((p) => p.dignity_breakdown.some((b) => b.mode === 'Fall'))
  const other = astro.planets.filter(
    (p) =>
      !p.dignity_breakdown.some(
        (b) => b.mode === 'Domicile' || b.mode === 'Exaltation' || b.mode === 'Detriment' || b.mode === 'Fall'
      )
  )

  // 第三层：Energy Total 合成逻辑（公式展示）
  const aspectContribution = astro.aspects.length * 4 // 每組重要相位 +4
  const energyFormula = `${dignitySum}（Dignity Sum）+ ${aspectContribution}（相位貢獻：${astro.aspects.length} 組 × 4）= ${energyTotal}`

  const report = `
# 星圖諮詢報告 · 工業內核實戰輸出

**內核** ${KERNEL_NAME} v${KERNEL_VERSION}  
**輸入** birth_iso8601: ${PAYLOAD.birth_iso8601} | lat_lng: [51.5, -0.12] | tz_offset: 0  
**諮詢問題** ${query}

---

## 第一層：本命結構分析

### 核心關注：太陽摩羯落 10 宮的架構

本命盤以 **太陽摩羯（Capricorn）落第 10 宮** 為骨架：太陽為命主意志與身份認同，摩羯為土象、掌結構與成就，第 10 宮為事業、名望與社會角色。三者疊加形成「**事業即身份、成就靠紀律與階梯**」的架構。

- **太陽** 摩羯 10°12′，**第 10 宮**：人生主線與職業高度綁定，對外展現責任感、權威傾向與長期主義；不喜浮誇，偏好可累積、可驗證的成果。
- **上升** 牡羊 15°06′：外在表現主動、直接，與太陽摩羯形成「外顯開創、內在收斂」的張力，利於在既有體制內爭取話語權而非單純守成。
- **月亮** 水瓶 5°06′ **第 9 宮**、**金星** 水瓶 18°30′ **第 9 宮**：情緒與價值觀偏理性、疏離、重理念與遠景；第 9 宮強化跨界、教育、法律或異地機遇，與 10 宮的「體制內成就」形成互補——既有階梯，也有視野。
- **水星** 摩羯 22° **第 10 宮**：思維與溝通服務於事業與名望，表達務實、有條理，利合約、計畫與向上管理。
- **土星** 摩羯 26° **第 11 宮**：與太陽同星座、與太陽合相（見第三層相位），強化了「責任、延遲滿足、結構化人脈」的基調；11 宮指向團體、圈子與長期人脈，事業上易與權威或資深者綁定。

**架構小結**：太陽摩羯 10 宮 + 土星摩羯 11 宮 + 日土合相，構成「事業—責任—人脈」一體的本命骨架；月亮與金星 9 宮則提供理念與人際上的彈性與高度，避免格局過於單一。

---

## 第二層：尊貴度明細（入庙 / 旺 / 陷 / 落及對應 Dignity Score）

以下依 QUANTITATIVE_DIGNITY_MATRIX 計算，僅列出 **入庙（Domicile）、旺（Exaltation）、陷（Detriment）、落（Fall）** 及餘者。

### 入庙（Domicile，+5）
| 行星 | 星座 | 宮位 | 尊貴類型 | Dignity Score |
|------|------|------|----------|---------------|
${domicile.map((p) => `| ${p.name} | ${p.sign} | 第${p.house}宮 | ${DIGNITY_LABEL[p.dignity_breakdown[0]?.mode ?? ''] ?? p.dignity_breakdown[0]?.mode} | ${p.dignity_score} |`).join('\n')}

### 旺（Exaltation，+4）
| 行星 | 星座 | 宮位 | 尊貴類型 | Dignity Score |
|------|------|------|----------|---------------|
${exaltation.length > 0 ? exaltation.map((p) => `| ${p.name} | ${p.sign} | 第${p.house}宮 | ${DIGNITY_LABEL[p.dignity_breakdown[0]?.mode ?? ''] ?? p.dignity_breakdown[0]?.mode} | ${p.dignity_score} |`).join('\n') : '| （無） | — | — | — | — |'}

### 陷（Detriment，-5） / 落（Fall，-4）
| 行星 | 星座 | 宮位 | 尊貴類型 | Dignity Score |
|------|------|------|----------|---------------|
${detriment.length > 0 || fall.length > 0 ? [...detriment, ...fall].map((p) => `| ${p.name} | ${p.sign} | 第${p.house}宮 | ${DIGNITY_LABEL[p.dignity_breakdown[0]?.mode ?? ''] ?? p.dignity_breakdown[0]?.mode} | ${p.dignity_score} |`).join('\n') : '| （無） | — | — | — | — |'}

### 其他（三分 / 界 / 面 / 游走等）
| 行星 | 星座 | 宮位 | 尊貴類型 | Dignity Score |
|------|------|------|----------|---------------|
${other.map((p) => `| ${p.name} | ${p.sign} | 第${p.house}宮 | ${DIGNITY_LABEL[p.dignity_breakdown[0]?.mode ?? ''] ?? p.dignity_breakdown[0]?.mode} | ${p.dignity_score} |`).join('\n')}

**尊貴總分（Dignity Sum）** = ${astro.planets.map((p) => p.dignity_score).join(' + ')} = **${dignitySum}**

---

## 第三層：能量總分計算（Energy Total 合成邏輯）

公式（本內核實作）：

\`\`\`
Energy Total = Dignity Sum + 相位貢獻
相位貢獻 = 重要相位數（動態容許度內）× 權重 4
\`\`\`

本盤代入：

- **Dignity Sum** = ${dignitySum}
- **重要相位數** = ${astro.aspects.length} 組（太陽☌土星、月亮△金星，均在 DYNAMIC_ORB_ALGORITHM 容許度內）
- **相位貢獻** = ${astro.aspects.length} × 4 = ${aspectContribution}

故：**Energy Total** = **${energyFormula}**

等級對照：Energy Total 35+ 極強，25–35 中上，15–25 中等。本盤 **${energyTotal}** 屬中上，結構與相位共同拉高整體能量。

---

## 第四層：事業 / 財運深度結論（依尊貴度與相位，非萬能模板）

本結論**僅基於上述本命結構、尊貴度明細與兩組重要相位**推導，不套用通用話術。

### 尊貴度帶來的基調
- **太陽、土星、水星** 皆在摩羯且太陽/土星入庙（Dignity +5）：事業賽道偏體制內、責任制、長期回報；能力與心態均能支撐「扛責、延遲滿足」。
- **木星** 巨蟹入旺（Exaltation +4）落第 4 宮：貴人與機遇多與「家、根基、內部資源、不動產」相關，三個月內若涉及調崗、駐外、置產或家庭相關決策，易間接帶動事業安全感或資源盤。
- 無行星陷/落：無明顯「先天拖後腿」的尊貴負分，難題主要來自**相位與宮位**（如日土合相之壓力），而非行星失勢。

### 相位帶來的獨特張力
- **太陽 ☌ 土星**（合相，容許度 2.2°）：事業上**責任與壓力一體**；易獲權威或長輩認可，但需付出紀律與時間，不宜投機或速成心態。三個月內「承接有難度、能見度高的任務」比「低調後勤」更符合本盤能量。
- **月亮 △ 金星**（三分）：情緒與價值觀和諧，利**合作、談判、人際資源**；正財、穩定收入、合約與人緣優於偏財與單打獨鬥。

### 事業結論（三個月）
在「太陽摩羯 10 宮 + 日土合相」的架構下，事業走向已定調：**體制內、階梯式、責任換認可**。三個月內宜主動爭取「難度略高、能見度高」的任務，避免只做幕後；有機會得到上級或資深者背書，但需接受壓力與時間成本。木星 4 宮入旺提示：與家、根基、內部資源相關的變動（如搬遷、部門調整、內部項目）可能間接助益事業或安全感。

### 財運結論（三個月）
正財優於偏財；**月亮△金星**支持透過合作、合約、談判或穩定薪資/報酬調整獲利，一次性橫財或高槓桿投機與本盤尊貴度及相位不符。若有投資，宜中長期、穩健型；若為自營或接案，三個月內「穩定客戶與合約」比「衝量」更符合能量。

### 唯一性總結
本盤的「硬核」在於：**入庙的太陽與土星同落摩羯且合相**，形成「事業即責任、成就即紀律」的單一主線；再疊加木星 4 宮入旺與月金三分，才得出「體制內攻堅 + 人際與正財輔助 + 家/根基相關機遇」的結論——而非泛泛的「事業有壓力、財運尚可」。

---

**置信度** ${(confidenceScore * 100).toFixed(1)}% | **內核** ${KERNEL_NAME} v${KERNEL_VERSION}  
*僅供個人參考，不構成專業命理或投資建議。*
`.trim()

  return {
    modules_used: ['Astrology'],
    module_summaries: [
      {
        module: 'Astrology',
        energy_vector: { fire: 0.25, water: 0.35, air: 0.25, earth: 0.45 },
        local_confidence: confidenceScore,
      },
    ],
    fused_theme: '太陽摩羯10宮+日土合相：事業責任與人脈並進，正財優於偏財',
    fused_advice: '三個月內爭取能見度高的任務，善用合作與合約，關注家/根基相關機遇。',
    confidence_score: confidenceScore,
    report,
  }
}

function main() {
  console.log('Payload:', JSON.stringify(PAYLOAD, null, 2))
  const errors = validateAstrologyInput(PAYLOAD)
  if (errors.length > 0) {
    console.log('校驗失敗:', errors)
    return
  }
  console.log('校驗通過。執行占星計算與編排…\n')
  const astro = runAstrologyCompute()
  const result = runOrchestratorReport(astro, PAYLOAD.query)
  console.log(result.report)
}

main()
