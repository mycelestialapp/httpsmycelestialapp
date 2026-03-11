/**
 * 塔羅大師級解讀：與神諭卡同結構（免費層 + 付費層），供 MasterOracleReadingView 共用。
 */
import type { OracleReading, DrawnCardInput } from '@/lib/oracleMasterReading';
import type { TarotCardEntry } from '@/lib/tarotCards';
import {
  detectQuestionCategory,
  getCategoryGuidance,
  type QuestionCategory,
} from '@/lib/questionClassification';
import {
  analyzeDreamQuestion,
  isDreamQuestion,
  type DreamQuestionIntent,
} from '@/lib/dreamQuestionIntent';

export type TarotTopic =
  | 'love' | 'marriage' | 'career' | 'study' | 'wealth' | 'health'
  | 'relationship' | 'spiritual' | 'life' | 'general';

/** 依主題取單一維度牌意：感情類只回傳 card.love，絕不摻入事業/財運。 */
function getTopicSection(card: TarotCardEntry, topic: TarotTopic, upright: boolean): string {
  const meaning = upright ? card.upright : card.reversed;
  if (topic === 'love' || topic === 'marriage' || topic === 'relationship') return card.love || card.advice || meaning;
  if (topic === 'career' || topic === 'study' || topic === 'life') return card.career || card.advice || meaning;
  if (topic === 'wealth') return card.wealth || card.advice || meaning;
  if (topic === 'health') return card.health || card.advice || meaning;
  if (topic === 'spiritual') return card.advice || meaning;
  return card.advice || meaning;
}

/** 問題分類 → 解讀維度：確保「問什麼就從哪個維度取牌意」；供塔羅面板依問題顯示【愛情】等主題 */
export function categoryToTarotTopic(category: QuestionCategory): TarotTopic {
  switch (category) {
    case '感情婚姻':
      return 'love';
    case '事业工作':
      return 'career';
    case '财运投资':
      return 'wealth';
    case '学业考试':
      return 'study';
    case '身体健康':
      return 'health';
    case '人际关系':
      return 'relationship';
    case '灵性成长':
      return 'spiritual';
    case '占风水':
      return 'life';
    case '宠物':
      return 'general';
    case '出行迁居':
    case '官司法律':
    case '生育子女':
    case '失物寻找':
    case '选择决策':
    case '代人问卜':
      return 'life';
    default:
      return 'general';
  }
}

function buildDreamHint(intent: DreamQuestionIntent): string {
  const scope = intent.topic ? `${intent.subCategoryLabel} · ${intent.topic}` : intent.subCategoryLabel;

  switch (intent.subCategoryCode) {
    case 'D3_动物梦':
      if (intent.topic === '动物-蛇') {
        return `在傳統解夢裡，「蛇」既可能對應財氣與機緣，也可能象徵壓力與未知；牌面更像是在補充：關鍵不在蛇本身，而在你近期面對「誘惑 / 壓力 / 變化」時的態度。`;
      }
      return `這更像是一個關於「${scope}」的訊號：動物往往承載本能與直覺，牌面提示你，先看懂自己這陣子對人事物的本能反應，是在防衛、依賴，還是真心喜歡。`;
    case 'D1_吉凶预兆':
      if (intent.topic === '掉牙') {
        return `「夢見掉牙」在民間常被解讀為對親人、面子或自身狀態的焦慮；這組牌給出的重點不是「會不會有壞事」，而是：你是否正準備告別某種舊角色，進入新的階段。`;
      }
      if (intent.topic === '死亡') {
        return `夢中出現死亡，多半對應「一個階段的結束與新階段的開始」；牌面更像是在協助你平穩過渡，而非單純凶兆。`;
      }
      if (intent.topic === '怀孕') {
        return `關於「懷孕 / 生子」的夢，既可能是對真實生育的在意，也可能象徵一個新計畫或新身份；牌面在幫你看的是，這個「新開始」目前的成熟度與時機。`;
      }
      if (intent.topic === '结婚') {
        return `「夢見結婚 / 婚禮」常與承諾、責任與關係定位有關；牌面提示你，先弄清楚自己真正願意長期承擔的是什麼。`;
      }
      return `這更像是一個關於「${scope}」的吉凶提示：與其只追問會不會出事，不如先看清，這個夢把你哪一塊擔心或期待放大了。`;
    case 'D9_场景地点梦':
      return `場景本身（${scope}）往往對應你最近最在意的生活領域；牌面提示你，從「那個地方對你意味著什麼」入手，比死背解夢更貼近實況。`;
    case 'D11_数字梦':
      return `數字夢多半在強調節奏、次數或「你特別在意的那個數字」；這組牌提醒你，與其迷信號碼，不如留意當下真正需要被調整的是哪個步驟。`;
    default:
      return `這是一個關於「${scope}」的夢，牌面更關心的不是它吉不吉，而是：這個畫面勾起了你哪些情緒與記憶，提示你哪個方向需要被看見與調整。`;
  }
}

function buildDreamMicroAction(
  drawn: { card: TarotCardEntry; upright: boolean }[],
  intent: DreamQuestionIntent,
): string {
  const firstName = drawn[0]?.card.nameZh ?? '這組牌';

  if (intent.topic === '掉牙') {
    return `${firstName} 建議你先從「減少焦慮」入手：本週找一個安靜時段，寫下三件你最怕失去的東西，再寫下萬一真的失去，各自可以怎麼因應，讓自己知道「不是全無退路」。`;
  }
  if (intent.topic === '动物-蛇') {
    return `${firstName} 鼓勵你面對而不是逃避：挑一件你最近一直拖延、不想碰但又很重要的事，今天只做最小一步（打個電話、查一個資訊），讓這條「蛇」從威脅變成可被掌控的力量。`;
  }
  if (intent.subCategoryCode === 'D3_动物梦') {
    return `${firstName} 邀請你觀察自己的本能反應：這幾天留意當你對人或事件出現「第一反應」時，是想靠近、退開，還是攻擊，並嘗試在其中多加一秒鐘的停頓再決定行動。`;
  }
  if (intent.subCategoryCode === 'D6_特殊类型梦') {
    return `${firstName} 建議你把這類特別的夢記錄下來：本週至少連續三天，用 3 分鐘寫下入睡前的心情、夢的大致內容與醒來的感受，你會更看清哪些情節在重複出現。`;
  }

  return `${firstName} 建議你不要急著「求籤解夢」：先為這個夢寫一小段日記——場景、人物、你當時的感受，以及醒來後最在意的那一句話；寫完再回頭看這組牌的建議，你會更知道該把心力放在哪裡。`;
}

/** 從塔羅抽牌結果組裝成與神諭卡一致的 OracleReading 結構 */
export function buildTarotMasterReading(
  question: string,
  drawn: { card: TarotCardEntry; upright: boolean }[],
  topic: TarotTopic,
): OracleReading {
  const now = Date.now();
  const cards: DrawnCardInput[] = drawn.map((d, i) => ({
    name: d.card.nameZh,
    position: i === 0 ? '當下' : i === 1 ? '過程' : '結果',
    imageUrl: d.card.image,
  }));

  const q = question?.trim() || '此刻我最需要看見的訊息是什麼？';
  const isDream = isDreamQuestion(q);
  const dreamIntent: DreamQuestionIntent | undefined = isDream ? analyzeDreamQuestion(q) : undefined;
  const { category } = detectQuestionCategory(q);
  const guidance = getCategoryGuidance(q, category);
  const guidanceLine = guidance ? `\n\n${guidance}` : '';
  /** 有具體問題時依問題類別取牌意維度。感情類只用愛情牌意，絕不摻入事業、財運。 */
  const effectiveTopic: TarotTopic =
    q && category !== '其他' ? categoryToTarotTopic(category) : topic;
  const first = drawn[0];
  const firstMeaning = first ? getTopicSection(first.card, effectiveTopic, first.upright) : '';
  const firstShort = firstMeaning.slice(0, 120) + (firstMeaning.length > 120 ? '…' : '');

  const combinedAdvice = drawn
    .map(({ card, upright }) => (upright ? card.advice : card.reversed).slice(0, 80))
    .join(' ');
  const dynamicsText =
    drawn.length > 1
      ? `${drawn.map(d => d.card.nameZh).join('、')} 這組牌在說：過去與當下的選擇會牽動接下來的發展，請留意你內心的真實渴望，而非表面選項。`
      : `${first?.card.nameZh ?? '這張牌'} 想提醒你：真正卡住你的，往往不是外在條件，而是你對「失控」的擔憂。`;

  const isVehicleQuestion =
    category === '出行迁居' &&
    /专车|順風車|顺风车|打车|搭车|坐车|开车|開車|汽車|汽车|車子|车子|车辆|車輛|车況|車況|车坏|車壞|坏了|壞了|坏掉|壞掉|出问题|出問題|故障|维修|維修|检修|檢修|修车|修車|保养|保養|抛锚|拋錨|打不着火|打不著火|无法启动|無法啟動|发动不了|發動不了|发动机|發動機|刹车|剎車|电瓶|電瓶|胎压|胎壓|机油|機油|异响|異響|抖动|抖動|仪表灯|儀表燈|警示灯|警示燈/i.test(
      q,
    );

  const soulCoreText = (() => {
    if (!dreamIntent) {
      const shortQ = q.length > 48 ? q.slice(0, 46) + '…' : q;
      const bridge = shortQ
        ? `針對你心中的問題「${shortQ}」，牌面從主題上給你的核心啟示如下：\n\n`
        : '';
      // 完整牌義已在「牌面解讀」展示，此處只放主題指引，避免與牌面解讀重複
      return bridge + (guidanceLine.trim() || '牌面邀請你靜下來，聽一聽內心最真實的聲音。');
    }

    const scope =
      dreamIntent.topic != null
        ? `${dreamIntent.subCategoryLabel} · ${dreamIntent.topic}`
        : dreamIntent.subCategoryLabel;

    const intro = `這是一個關於「${scope}」的夢，你問的是：「${q.length > 50 ? q.slice(0, 48) + '…' : q}」。`;
    const mirror =
      firstShort ||
      '這組牌映照的是：你最近內在的狀態，與夢裡的情緒與畫面正好相互呼應。';
    const hint = buildDreamHint(dreamIntent);

    // 夢境問題時，以夢境說明為主，仍可保留原本的大類指引作為補充
    return `${intro}\n\n${mirror}\n\n${hint}${guidanceLine}`;
  })();

  const microActionText = (() => {
    if (dreamIntent) {
      return buildDreamMicroAction(drawn, dreamIntent);
    }

    if (isVehicleQuestion) {
      return '本週替自己做一個「把不確定變成確定」的小動作：安排一次車況檢查（或至少讀一次故障碼/看一次仪表警示灯），把你最擔心的 1–2 個異常點（聲音、抖動、煞車、電瓶）寫下來再決定是否繼續使用。';
    }

    return `本週請為自己保留一個時段，只做一件讓身體真正放鬆的小事。${
      drawn[0]?.card.advice?.slice(0, 60) ?? ''
    }…`;
  })();

  const cardMeaningText = drawn
    .map(({ card, upright }) => {
      const orientation = upright ? '正位' : '逆位';
      const meaning = getTopicSection(card, effectiveTopic, upright) || (upright ? card.upright : card.reversed);
      return `【${card.nameZh} · ${orientation}】\n${meaning}`;
    })
    .join('\n\n');

  return {
    id: `tarot-${now}`,
    timestamp: now,
    userQuestion: q,
    cards,
    freeTier: {
      mirroring: `你正在問的是：「${q.length > 50 ? q.slice(0, 48) + '…' : q}」`,
      soulCore: soulCoreText,
      cardMeaning: cardMeaningText,
    },
    premiumTier: {
      shadowWork: combinedAdvice.slice(0, 200) || '這組牌邀請你察覺自己慣性迴避的部分，接納陰影才有真正的轉化。',
      dynamics: dynamicsText,
      microAction: microActionText,
      finalQuestion: '如果今天你不再需要用表現來證明自己的價值，你最想先為自己取消哪一件勉強的約定？',
    },
  };
}
