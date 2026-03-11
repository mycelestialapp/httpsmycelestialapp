/** 四元素：用於相位分析（相生/相克、衝突與流動） */
export type OracleElement = 'Fire' | 'Water' | 'Air' | 'Earth';

export interface DrawnCardInput {
  /** 牌名（建議使用中文牌名） */
  name: string;
  /** 在牌陣中的位置，例如：當下、阻力、方向等 */
  position: string;
  /** 之後若有卡面圖片，可補上 URL；目前可留空字串 */
  imageUrl?: string;
  /** 元素（由 oracleCards 提供），用於相位分析 */
  element?: OracleElement;
  /** 位階 1–22，用於能量流向描述 */
  rank?: number;
}

export interface OracleReading {
  id: string;
  timestamp: number;
  userQuestion: string;
  cards: DrawnCardInput[];

  // 免費層：建立信任
  freeTier: {
    mirroring: string; // 鏡像復述
    soulCore: string; // 靈魂層的初步啟示
    /** 塔羅用：每張牌的完整牌義（牌名·正/逆位 + 對應維度牌意），與鏡像、靈魂核心同區顯示 */
    cardMeaning?: string;
  };

  // 付費層：深度轉化
  premiumTier: {
    shadowWork: string; // 陰影察覺
    dynamics: string; // 多牌聯動邏輯
    microAction: string; // 本週微習慣
    finalQuestion: string; // 靈魂提問
  };
}

/** 大師級解讀協議：頂級神諭卡宗師，極具畫面感、心理穿透力、溫柔但有鋒芒 */
export const MASTER_SYSTEM_PROMPT = `# Role: 頂級神諭卡宗師 (Grand Oracle Master)
# Writing Style: 極具畫面感、心理穿透力、溫柔但有鋒芒。禁止廢話，禁止模稜兩可。

## 執行準則 (The Master Code):

1. **意象鏡像 (Mirroring) - 建立共情：**
   - 必須使用【物理感官】詞彙（如：深海的呼吸聲、手機的跳動、關上的門）。
   - 核心任務：復述用戶沒說出口的「匱乏感」。不要說「你很難過」，要說「你像是在等一個已經撤走的站台」。

2. **相位縫合 (Synthesis) - 邏輯昇華：**
   - 嚴禁單張牌解釋。必須描述【能量的流動】。
   - 邏輯公式：[牌1的根源] 經過 [牌2的陰影] 的扭曲，導致了 [牌3] 無法抵達的現狀。
   - 示例：不要只說死神代表結束，要說「死神的剪斷被月亮的海水泡軟了，導致傷口無法結痂」。

3. **陰影工作 (Shadow Work) - 核心價值（付費區）：**
   - 必須指出用戶的【自我欺騙】。
   - 心理深度：揭露用戶如何利用「深情」或「堅持」來逃避【面對空白】。
   - 語氣：手術刀般的精準。指出「你的痛苦其實是你用來勒索對方愧疚感的籌碼」這一類的盲點。

4. **微禪行動 (Micro-Zen Action) - 物理化錨點：**
   - 時間：僅限【本週】。
   - 動作：必須包含一個【具體的物理交互】（如：盯著最遠的燈火、刪掉一個特定的字符、摸一下冰塊）。
   - 目標：透過微小的物理切斷，引發巨大的心理轉場。

## 禁忌 (Absolute No-Gos):
- 禁止給出人生大道理（如「時間會治癒一切」）。
- 禁止使用確定性的未來預測（如「他下月會回來」）。
- 禁止使用命令式語氣，必須使用「邀請式」或「覺察式」語言。

請以 JSON 回傳，格式：{ "mirroring": "...", "reading": { "soul": "...", "shadow": "...", "relationship": "..." }, "transformation": { "action": "...", "soul_question": "..." } }`;

interface MasterOracleLLMOutput {
  mirroring?: string;
  reading?: {
    soul?: string;
    shadow?: string;
    relationship?: string;
  };
  transformation?: {
    action?: string;
    soul_question?: string;
  };
}

function buildDevFallback(
  question: string,
  drawnCards: DrawnCardInput[],
): OracleReading {
  const now = Date.now();

  const firstCardName = drawnCards[0]?.name ?? '這組牌';
  const cardNames = drawnCards.map((c) => c.name).join('、');
  const isMultiCard = drawnCards.length > 1;

  // 免費層：多段完整文案，避免存檔後在解讀記錄裡只看到「一句話」
  const mirroring = question.trim()
    ? `你帶著「${question.slice(0, 40)}${question.length > 40 ? '…' : ''}」這樣的困惑來到這裡。我聽見的不只是一個問題，而是你正在尋找一種「不再硬撐」的活法——希望在關係與工作裡，都能多一點呼吸空間與被理解。那種卡在「該做」與「想做」之間的緊繃，很多時候比事情本身更耗人。`
    : `此刻你沒有用言語說出一個具體問題，但宇宙依然在回應你。你正在尋找一種「不再硬撐」的活法，希望在關係與工作裡，都能多一點呼吸感與被理解。那種卡在「該做」與「想做」之間的緊繃，很多時候比事情本身更耗人。`;

  const coreContent = isMultiCard
    ? `這組牌（${cardNames}）在說的是能量的流動，而不是三張孤立的答案。第一張牌點出你當下的主題或表面上的選擇；第二張牌往往是你不太想面對的阻力或擔憂；第三張牌則像宇宙遞給你的一盞燈：真正卡住你的，常常不是外在條件，而是對「失控」的恐懼。當你願意先照顧自己的節奏，而不是勉強自己迎合所有期待，腳下的路會比較容易照清。`
    : `${firstCardName} 像是一盞提在霧中的燈：它不會一下子照亮整條路，但足以照清你腳下的下一步。這張牌在提醒你：真正卡住你的，並不只是眼前的條件，而是你對「失控」的擔憂。當你願意先照顧自己的節奏，而不是勉強自己迎合所有期待，外在局勢反而比較有機會跟著調整。`;
  const shortQ = question.trim().slice(0, 46);
  const soulCore = shortQ
    ? `針對你心中的問題「${shortQ}${question.trim().length > 46 ? '…' : ''}」，牌面給出的核心啟示如下：\n\n${coreContent}`
    : coreContent;

  return {
    id: `${now}`,
    timestamp: now,
    userQuestion: question,
    cards: drawnCards,
    freeTier: {
      mirroring,
      soulCore,
    },
    premiumTier: {
      shadowWork:
        '你慣性用「再撐一下」「我應該可以」來壓過身體與情緒的真實訊號，久而久之，很難分辨自己是真心願意，還是只是不好意思拒絕。陰影整合不是在批判你，而是邀請你看見：那份「不敢停下來」的背後，往往藏著「怕被認為不夠好」的恐懼。',
      dynamics: isMultiCard
        ? '第一張牌在說你的表面選擇，第二張牌是你不想面對的擔憂，第三張牌則像宇宙的提醒：真正卡住你的，其實不是現實條件，而是你對「失控」的恐懼。三張牌之間的張力，正是你內在拉扯的寫照。'
        : `${firstCardName} 想提醒你：真正卡住你的，並不只是眼前的條件，而是你對「失控」的擔憂。當你願意先照顧自己的節奏，而不是勉強自己迎合所有期待，外在局勢反而比較有機會跟著調整。`,
      microAction:
        '本週，請替自己保留一個晚間的「禁止加班 / 禁止社交」時段，只做讓身體真正放鬆的一件小事，例如散步、泡澡、或者早一點關掉螢幕入睡。一個小小的、具體的切斷，往往能帶來比想像中更大的心理轉場。',
      finalQuestion:
        '如果今天你不再需要用表現來證明自己的價值，你最想先為自己取消哪一件勉強的約定？這個問題不需要立刻回答，只要讓它在心裡多待一會兒。',
    },
  };
}

/** 自癒：缺層時使用的提示文案，不報錯、不崩潰 */
const FOG_MESSAGE =
  '這一部分的訊息正處於迷霧中，請深呼吸 5 秒，重新感應。';

function normalizeLLMOutput(data: MasterOracleLLMOutput): OracleReading['freeTier'] & OracleReading['premiumTier'] {
  const r = data.reading ?? {};
  const t = data.transformation ?? {};
  return {
    mirroring: data.mirroring?.trim() || FOG_MESSAGE,
    soulCore: r.soul?.trim() || FOG_MESSAGE,
    shadowWork: r.shadow?.trim() || FOG_MESSAGE,
    dynamics: r.relationship?.trim() || FOG_MESSAGE,
    microAction: t.action?.trim() || FOG_MESSAGE,
    finalQuestion: t.soul_question?.trim() || FOG_MESSAGE,
  };
}

export async function generateMasterReading(
  question: string,
  drawnCards: DrawnCardInput[],
): Promise<OracleReading> {
  const trimmedQuestion = question.trim() || '此刻我最需要看見的靈魂訊息是什麼？';
  const now = Date.now();

  // 1. 預處理：提取牌的【元素】與【位階】
  const cardElements = drawnCards.map((c) => c.element ?? 'Earth');
  const cardRanks = drawnCards.map((c) => c.rank ?? 0);
  const cardNames = drawnCards.map((c) => c.name).join('、');

  // 2. 構造「相位上下文」：告訴 AI 牌陣間的張力
  const phaseContext =
    cardElements.some(Boolean) || cardRanks.some((r) => r > 0)
      ? `
相位分析：
- 元素組合：${cardElements.join(' + ')}
- 能量流向：${cardRanks.length >= 2 ? `從位階 ${cardRanks[0]} 到位階 ${cardRanks[cardRanks.length - 1]}` : '單牌'}
- 時間約束：所有行動建議必須限定在【本週內】。`
      : '\n時間約束：所有行動建議必須限定在【本週內】。';

  const userPrompt = `問題：${trimmedQuestion}\n抽牌：${cardNames}\n${phaseContext}`;

  const endpoint = import.meta.env.VITE_MASTER_ORACLE_URL as
    | string
    | undefined;

  if (!endpoint) {
    return buildDevFallback(trimmedQuestion, drawnCards);
  }

  const doRequest = async (): Promise<MasterOracleLLMOutput | null> => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: MASTER_SYSTEM_PROMPT,
          userPrompt,
          cards: drawnCards,
          format: 'JSON',
        }),
      });
      if (!response.ok) return null;
      const raw = await response.json();
      return raw as MasterOracleLLMOutput;
    } catch {
      return null;
    }
  };

  let data = await doRequest();
  if (!data) {
    return buildDevFallback(trimmedQuestion, drawnCards);
  }

  const normalized = normalizeLLMOutput(data);
  const hasMissing =
    normalized.mirroring === FOG_MESSAGE ||
    normalized.soulCore === FOG_MESSAGE ||
    normalized.shadowWork === FOG_MESSAGE ||
    normalized.dynamics === FOG_MESSAGE ||
    normalized.microAction === FOG_MESSAGE ||
    normalized.finalQuestion === FOG_MESSAGE;

  if (hasMissing) {
    const retry = await doRequest();
    if (retry) {
      const retryNorm = normalizeLLMOutput(retry);
      return {
        id: crypto.randomUUID?.() ?? `${now}`,
        timestamp: now,
        userQuestion: trimmedQuestion,
        cards: drawnCards,
        freeTier: { mirroring: retryNorm.mirroring, soulCore: retryNorm.soulCore },
        premiumTier: {
          shadowWork: retryNorm.shadowWork,
          dynamics: retryNorm.dynamics,
          microAction: retryNorm.microAction,
          finalQuestion: retryNorm.finalQuestion,
        },
      };
    }
  }

  return {
    id: crypto.randomUUID?.() ?? `${now}`,
    timestamp: now,
    userQuestion: trimmedQuestion,
    cards: drawnCards,
    freeTier: { mirroring: normalized.mirroring, soulCore: normalized.soulCore },
    premiumTier: {
      shadowWork: normalized.shadowWork,
      dynamics: normalized.dynamics,
      microAction: normalized.microAction,
      finalQuestion: normalized.finalQuestion,
    },
  };
}

