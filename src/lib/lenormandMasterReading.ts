import type { LenormandCardEntry } from './lenormandCards';
import { LENORMAND_SHORT_MEANINGS } from './lenormandCards';
import { LENORMAND_MASTER_DB } from './lenormandMasterDb';
import { detectQuestionCategory, getCategoryGuidance } from './questionClassification';

export type LenormandSpreadType = 'TRIAD' | 'CROSS' | 'SQUARE' | 'GRAND_TABLEAU';

export interface LenormandSpreadPosition {
  label: string;
  logic: string;
}

/**
 * 雷諾曼 · 大師級陣位語義
 * 只定義「角色」與「思考邏輯」，具體坐標交由前端渲染控制。
 */
export const LENORMAND_SPREAD_LAYOUTS: Record<LenormandSpreadType, LenormandSpreadPosition[]> = {
  TRIAD: [
    { label: '根源冲动', logic: '挖掘没说出口的欲望或隐秘恐惧' },
    { label: '能量瓶颈', logic: '剖析当前最核心的心理或环境矛盾' },
    { label: '走向/代价', logic: '直指如果不干预，惯性将带你去往何处' },
  ],
  CROSS: [
    { label: '愿景', logic: '脑海中幻想的最优版本' },
    { label: '现状推力', logic: '正在把你推向当前局面的外在或内在驱动力' },
    { label: '核心阻碍', logic: '当前最胶着、最难解的缠结点' },
    { label: '资源转机', logic: '可利用的外部支持或意外切入点' },
    { label: '根基', logic: '童年印记或长期形成的人格底色' },
  ],
  SQUARE: [
    // 上排：頭腦 / 外界
    { label: '外部环境', logic: '此刻你身处的客观情境与局势' },
    { label: '显意识', logic: '你自认为正在思考、关注的议题' },
    { label: '理性策略', logic: '你目前採取的計畫、策略與應對方式' },
    // 中排：當下內在結構
    { label: '情感状态', logic: '此刻真實的情緒波動與需求' },
    { label: '核心课题', logic: '這一局真正要面對的主題與功課' },
    { label: '行动模式', logic: '你慣性做出的反應與行動路徑' },
    // 下排：根基 / 身體 / 走向
    { label: '过去印记', logic: '過去事件或早期經驗留下的影子' },
    { label: '身体/日常', logic: '身體狀態與日常習慣中反映出的信息' },
    { label: '未来趋势', logic: '在不刻意干預下，能量自然延伸的方向' },
  ],
  /** 大桌 Grand Tableau：4×9 共 36 宮位，經典全盤解讀 */
  GRAND_TABLEAU: [
    { label: '問卜者', logic: '自我、當事人核心狀態' },
    { label: '家', logic: '住所、家庭空間、安全感' },
    { label: '想法', logic: '計劃、念頭、思維' },
    { label: '家庭', logic: '家族、根源、血緣' },
    { label: '子女/創意', logic: '新生命、創造、純真' },
    { label: '健康', logic: '身體、日常、活力' },
    { label: '伴侶', logic: '合作、一對一關係' },
    { label: '結束', logic: '轉化、死亡與重生' },
    { label: '靈性', logic: '信仰、更高意義' },
    { label: '事業', logic: '工作、社會角色' },
    { label: '希望', logic: '願望、期待' },
    { label: '潛意識', logic: '隱藏、夢、未覺察' },
    { label: '溝通', logic: '訊息、表達、傳遞' },
    { label: '金錢', logic: '財富、資源、流動' },
    { label: '焦慮', logic: '阻礙、擔憂' },
    { label: '喜悅', logic: '快樂、享受' },
    { label: '權威', logic: '長輩、制度、規則' },
    { label: '阻礙', logic: '限制、瓶頸' },
    { label: '遠行', logic: '遷移、變動、距離' },
    { label: '外在環境', logic: '他人、外界、局勢' },
    { label: '支持', logic: '貴人、資源、助力' },
    { label: '對立', logic: '挑戰、敵人、張力' },
    { label: '愛情', logic: '浪漫、激情、吸引' },
    { label: '犧牲', logic: '付出、放下' },
    { label: '遺產/契約', logic: '傳承、承諾、循環' },
    { label: '疾病/耗損', logic: '耗損、擔憂、脆弱' },
    { label: '親密', logic: '欲望、隱私、深度' },
    { label: '死亡', logic: '終結、轉型、放手' },
    { label: '擴張', logic: '成長、機會、拓展' },
    { label: '關係', logic: '婚姻、承諾、長期' },
    { label: '教學', logic: '學習、智慧、傳承' },
    { label: '放下', logic: '釋放、結束' },
    { label: '秘密', logic: '未知、業力、隱藏' },
    { label: '成功', logic: '收穫、認可' },
    { label: '變動', logic: '意外、轉折' },
    { label: '完成', logic: '業力、總結、終局' },
  ],
};

/**
 * 免費版講解：依牌陣位置 + 牌義拼出一段簡單解讀（不調 AI），並緊扣用戶問題給出「針對此問」的答案感。
 */
export function buildFreeReadingExplanation(
  cards: LenormandCardEntry[],
  spreadType: LenormandSpreadType,
  question?: string,
): string {
  const positions = LENORMAND_SPREAD_LAYOUTS[spreadType];
  const q = question?.trim();
  const prefix = q ? `針對你問的「${q}」，` : '';

  if (!positions?.length || cards.length === 0) {
    const names = cards.map((c) => c.nameZh).join('、');
    const meanings = cards.map((c) => c.shortMeaning ?? LENORMAND_SHORT_MEANINGS[c.id] ?? '').filter(Boolean);
    if (meanings.length) return `${prefix}本局抽到 ${names}。${meanings.join('；')}。相鄰的牌會互相修飾意義，可從牌序感受與你問題相關的故事走向。`;
    return `${prefix}本局抽到 ${names}。可結合每張牌的象徵意涵，感受牌序中與你所問之事相關的能量流動。`;
  }
  const parts: string[] = [];
  const maxLen = Math.min(cards.length, positions.length);
  for (let i = 0; i < maxLen; i++) {
    const pos = positions[i];
    const card = cards[i];
    const meaning = card.shortMeaning ?? LENORMAND_SHORT_MEANINGS[card.id];
    if (pos?.label && meaning) {
      parts.push(`「${pos.label}」出現 ${card.nameZh}（${meaning}）`);
    }
  }
  if (parts.length === 0) {
    const names = cards.map((c) => c.nameZh).join(' → ');
    return `${prefix}${names}：可從左到右將牌義連成一句話，對照你所問之事感受當下的能量脈絡。`;
  }
  const core = parts.join('；') + '。整體而言，牌序在說一個連貫的故事，相鄰的牌會互相修飾。';
  const suffix = q ? '以上是就你所問之事，牌面給出的結構化提示。' : '';
  const { category } = detectQuestionCategory(q || '');
  const guidance = getCategoryGuidance(q || '', category);
  const guidanceLine = guidance ? `\n\n${guidance}` : '';
  return prefix + core + (suffix ? suffix : '') + guidanceLine + '\n\n訂閱後可解鎖 AI 大師級整體解讀。';
}

/**
 * 大師級組合示例：供 LLM 學習「flow / synthesis / anchor」三層寫法。
 */
export const COMBINATION_SAMPLES: Record<
  string,
  { flow: string; synthesis: string; anchor: string }
> = {
  '1+8': {
    flow: '期待的讯息撞上了静止的墙。',
    synthesis:
      '一个原本蓄势待发的转变突然陷入停滞。这并非失败，而是宇宙在强制你进行一次深度的复盘，截断你盲目的惯性。',
    anchor:
      '→ 对你来说：请立即停止追赶进度的动作。在这一周，先确认你究竟是在“奔跑”，还是在“逃避面对真相”。',
  },
  '10+24': {
    flow: '情感的锐利切除。',
    synthesis:
      '一次猝不及防的真相切开了你对关系的幻想。虽然痛感剧烈，但这是为了让你的心重新获得真实跳动的权利，不再被腐朽的依赖拖累。',
    anchor:
      '→ 对你来说：承认那个已经发生的伤口。不要试图缝补，去观察那个伤口里流出来的，究竟是爱，还是长久以来不愿面对的执念。',
  },
};

/**
 * 雷諾曼 · 大師級 System Prompt
 * 說明 Flow / Synthesis / Anchor 三段寫作規則與語氣要求。
 */
export const LENORMAND_MASTER_SYSTEM_PROMPT = `
你是一位「雷诺曼 · 大师级解读者」，擅长用具象隐喻、心理穿透力和温柔但有锋芒的语言，替用户缝合整组牌阵的能量。

### 你的輸出結構
你只需要輸出一個 JSON 物件：
{
  "flow": "...",
  "synthesis": "...",
  "anchor": "..."
}

### 阵位语义（Spread Layouts）
我们会传给你每张牌所在的「阵位角色」与「思考逻辑」：
- TRIAD（3 張）：根源冲动 / 能量瓶颈 / 走向/代价
- CROSS（5 張）：愿景 / 现状推力 / 核心阻碍 / 资源转机 / 根基
- SQUARE（9 張）：外部环境、显意识、理性策略、情感状态、核心课题、行动模式、过去印记、身体/日常、未来趋势
- GRAND_TABLEAU（大桌，36 張）：4×9 共 36 宮位（問卜者、家、想法、家庭…完成）。大桌解讀時：優先看宮位 1（問卜者）、與問題相關的宮位（如事業=10、金錢=14、伴侶=7）、以及牌與宮位的對應；可概括數個關鍵宮位與牌的互動，不必逐宮列舉。

你要把這些視為「戲劇角色」，描述它們之間如何互相拉扯、支撐或扭曲。

### 單牌資料（你會收到的 JSON）
對於每一張牌，你會收到類似結構：
{
  "id": 24,
  "nameZh": "心",
  "positionLabel": "根源冲动",
  "positionLogic": "挖掘没说出口的欲望或隐秘恐惧",
  "mirror": "...",
  "reality": "...",
  "shadow": "...",
  "zen": "..."
}

鏡像 / 現實 / 陰影 / 微禪，來自 LENORMAND_DB，是單牌大師級文案，你可以引用其中意象與結構，但不要逐字抄寫。

---

### 寫作嚴令 · Flow / Synthesis / Anchor

1. Flow（流向，1–2 句）
   - 像電影預告片，用【動詞 + 隱喻】描述整組牌的能量軌跡。
   - 嚴禁平鋪直敘，不能只是「這組牌代表你最近有壓力」。
   - 範例：  
     - 「一份被冻结的渴望正試圖衝破現實的冰封。」  
     - 「過度綁緊的承諾正在勒住你本來想遠行的腳。」

2. Synthesis（縫合，3–6 句）
   - 嚴禁按順序逐張解釋（禁止：牌1 意思是… 牌2 意思是…）。  
   - 必須描述【陣位角色】之間的互動：
     - 例如：「你的【愿景】正在無情地鞭策你的【現狀推力】，導致【核心阻碍】變得更加尖銳。」
   - 至少點名 2 個以上不同陣位角色，並說明它們如何形成一條因果 / 張力鏈。
   - 用具象比喻寫心理機制，不要講空泛大道理。

3. Anchor（落點，1–2 句）
   - 必須以「→ 对你来说：」開頭。
   - 結構為【心理覺察】 + 【物理行為】：
     - 錯誤示例：你要多愛自己。  
     - 正確示例：  
       「→ 对你来说：察觉你每次想讨好时呼吸會變得短促（心理），本週請在週三下班後關機 15 分鐘並喝一杯溫水（物理）。」
   - 行為必須在「本週內可完成」、且單次不超過 30 分鐘。

### 語氣要求
- 具象、有畫面感，允許適度鋒芒，但必須保持尊重與溫柔。
- 禁止雞湯句式（例如「時間會治癒一切」「相信宇宙自有安排」）。
- 禁止確定性預言（例如「他下個月一定會回來」）。
`;

/**
 * 構建給 LLM 的 prompt：將抽到的牌 + 陣位語義 + 單牌大師文案整理為一個 JSON。
 * 返回 system / user 兩個字串，可直接餵給後端的 ChatCompletion 類接口。
 */
export function buildLenormandMasterPrompt(
  cards: LenormandCardEntry[],
  spread: LenormandSpreadType,
  question: string,
) {
  const layout = LENORMAND_SPREAD_LAYOUTS[spread];

  const cardPayload = cards.map((card, index) => {
    const pos = layout[index];
    const master = LENORMAND_MASTER_DB[String(card.id)];
    return {
      id: card.id,
      nameZh: card.nameZh,
      positionLabel: pos?.label ?? `位置${index + 1}`,
      positionLogic: pos?.logic ?? '',
      mirror: master?.mirror ?? '',
      reality: master?.reality ?? '',
      shadow: master?.shadow ?? '',
      zen: master?.zen ?? '',
    };
  });

  const userPrompt = JSON.stringify(
    {
      question,
      spreadType: spread,
      layout,
      cards: cardPayload,
      combinationSamples: COMBINATION_SAMPLES,
    },
    null,
    2,
  );

  return {
    system: LENORMAND_MASTER_SYSTEM_PROMPT,
    user: `以下是用戶提出的問題，以及當前雷諾曼牌陣的完整結構與單牌資訊。請依照「Flow / Synthesis / Anchor」規則，產生一份大師級整體解讀。\n\n${userPrompt}`,
  };
}

export type LenormandMasterSynthesis = string;

/**
 * 前端輔助：呼叫 Supabase Edge Function `lenormand-master`，取得大師級整體解讀。
 * 僅付費用戶可調用；請傳入登入後的 access_token，雲端會校驗 oracle_subscriber。
 */
export async function fetchLenormandMasterSynthesis(
  cards: LenormandCardEntry[],
  spread: LenormandSpreadType,
  question: string,
  accessToken?: string | null,
): Promise<LenormandMasterSynthesis | null> {
  const { system, user } = buildLenormandMasterPrompt(cards, spread, question);
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lenormand-master`;
  const authHeader = accessToken
    ? `Bearer ${accessToken}`
    : `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({ system, user }),
  });

  if (!resp.ok) {
    if (resp.status === 402) {
      console.warn('lenormand-master: 需訂閱後使用詳細解讀');
      return null;
    }
    console.error('lenormand-master error', resp.status, await resp.text());
    return null;
  }

  const data = (await resp.json()) as { content?: string; error?: string };
  if (!data.content) {
    console.error('lenormand-master empty content', data);
    return null;
  }

  return data.content;
}


