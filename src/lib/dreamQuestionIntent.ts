/**
 * 占夢境類問題意圖分析（D1–D13）
 * 目標：用少量關鍵詞 / 正則，快速給出子類與主題，供解牌模板使用。
 */

export type DreamMainCategory = '梦境';

// 對應你在問句總表裡的夢境子類編碼
export type DreamSubCategoryCode =
  | 'D1_吉凶预兆'
  | 'D2_人物梦'
  | 'D3_动物梦'
  | 'D4_自然现象梦'
  | 'D5_物品梦'
  | 'D6_特殊类型梦'
  | 'D7_身心健康梦'
  | 'D8_文化历史梦'
  | 'D9_场景地点梦'
  | 'D10_颜色梦'
  | 'D11_数字梦'
  | 'D12_职业身份梦'
  | 'D13_动作行为梦';

export type DreamPolarity = '求吉' | '避凶' | '中性';

export type DreamTimeframe = '过去' | '现在' | '近期' | '未来' | '长期' | '未指明';

export type DreamFocus = '自身' | '家人' | '伴侣' | '他人' | '未指明';

export interface DreamQuestionIntent {
  rawText: string;
  mainCategory: DreamMainCategory;
  subCategoryCode: DreamSubCategoryCode;
  subCategoryLabel: string;
  topic?: string; // 如：蛇 / 掉牙 / 结婚 / 房子着火 等
  polarity: DreamPolarity;
  timeframe: DreamTimeframe;
  focus: DreamFocus;
  keywords: string[];
}

const DREAM_HINT_RE = /梦见|梦到|做梦|夢見|夢到|噩梦|惡夢|鬼压床|鬼壓床|梦中|夢中/i;

type DreamSubRule = {
  code: DreamSubCategoryCode;
  label: string;
  patterns: RegExp[];
};

// 子類判斷順序：越具體的越靠前，避免被「吉凶預兆」大類吃掉
const DREAM_SUB_RULES: DreamSubRule[] = [
  {
    code: 'D11_数字梦',
    label: '梦中数字寓意',
    patterns: [/(\d+)|号码|数字|門牌|门牌|手机号|電話號碼|电话号码/i],
  },
  {
    code: 'D10_颜色梦',
    label: '梦中颜色寓意',
    patterns: [/红色|紅色|绿色|綠色|蓝色|藍色|黑色|白色|紫色|金色|银色|銀色|粉色|橙色|灰色|發光|发光|彩色/i],
  },
  {
    code: 'D9_场景地点梦',
    label: '梦中场景地点寓意',
    patterns: [
      /学校|教室|考场|考場|医院|醫院|公司|办公室|辦公室|寺庙|寺廟|教堂|墓地|坟|墳|老家|车站|車站|机场|機場|法院|监狱|監獄|商场|商場|超市|餐厅|餐廳|工地|隧道|地铁|地鐵/i,
    ],
  },
  {
    code: 'D3_动物梦',
    label: '梦中动物寓意',
    patterns: [
      /蛇|狗|猫|貓|老虎|狮子|獅子|鱼|魚|鸟|鳥|乌鸦|烏鴉|喜鹊|喜鵲|鸽子|鴿子|鹰|鷹|蝴蝶|蜘蛛|蜜蜂|蚂蚁|螞蟻|牛|马|馬|猪|豬|狼|兔|龟|龜|鹤|鶴|孔雀|青蛙|老鼠|蝙蝠|恐龙|恐龍/i,
    ],
  },
  {
    code: 'D2_人物梦',
    label: '梦中人物寓意',
    patterns: [
      /父母|爸爸|妈妈|爸媽|爹娘|爷爷|奶奶|外公|外婆|祖父|祖母|长辈|長輩|祖先|祖宗|伴侣|另一半|老公|老婆|丈夫|妻子|男女朋友|男朋友|女朋友|前任|老师|老師|领导|領導|同事|同学|同學|孩子|兒子|女兒|朋友|陌生人|名人|明星|医生|醫生|律师|律師|法官|警察|乞丐|流浪漢|天使|神仙|佛|鬼|幽灵|幽靈|妖怪|惡魔|恶魔/i,
    ],
  },
  {
    code: 'D7_身心健康梦',
    label: '梦境与身心健康',
    patterns: [/生病|病了|有病|癌|肿瘤|腫瘤|发烧|發燒|疼|痛|流血|吐血|呕吐|嘔吐|窒息|呼吸不过来|呼吸困難|头痛|頭痛|心脏|心臟|失眠|多梦|多夢|抑郁|憂鬱|焦虑|焦慮|心理|精神科|精神病/i],
  },
  {
    code: 'D6_特殊类型梦',
    label: '特殊梦境类型',
    patterns: [/反梦|反夢|直梦|直夢|预知梦|預知夢|清明梦|清明夢|托梦|托夢|应梦|應夢|前世|輪迴|轮回|平行世界|鬼压床|鬼壓床|梦游|夢遊/i],
  },
  {
    code: 'D4_自然现象梦',
    label: '梦中自然现象',
    patterns: [/下雨|暴雨|暴风雨|暴風雨|洪水|发大水|發大水|海啸|海嘯|地震|火山|闪电|閃電|打雷|雷电|雷電|彩虹|日食|月食|流星|星星|太阳|太陽|月亮|台风|颱風|龙卷风|龍捲風|刮风|颳風|下雪|冰雹|大风|大風|雾|霧|沙漠|草原|森林|山崩|山体滑坡|山體滑坡/i],
  },
  {
    code: 'D5_物品梦',
    label: '梦中物品寓意',
    patterns: [
      /衣服|鞋|帽子|首饰|首飾|戒指|项链|項鍊|项鍊|手表|手錶|眼镜|眼鏡|金子|黄金|黃金|珠宝|珠寶|钱|錢|钱包|錢包|银行卡|銀行卡|钥匙|鎖|锁|门|門|窗|樓梯|楼梯|电梯|橋|桥|路|車|车|火车|火車|高铁|高鐵|飞机|飛機|船|床|枕頭|被子|镜子|鏡子|手机|手機|电脑|電腦|书|書|信|邮件|郵件|照片|畫|画|药|藥|医院|醫院|厕所|廁所|馬桶|食物|飯|水|酒|棺材/i,
    ],
  },
  {
    code: 'D1_吉凶预兆',
    label: '梦境预兆吉凶',
    patterns: [
      /掉牙|牙齿|牙齒|死亡|去世|死了|丧礼|喪禮|葬礼|葬禮|棺材|尸体|屍體|怀孕|懷孕|生孩子|流产|流產|结婚|結婚|离婚|離婚|考试|考試|升职|升遷|升遷|升官|中奖|中獎|中彩票|失火|火灾|火災|房子着火|房子著火|洪水|災難|灾难|世界末日/i,
    ],
  },
  {
    code: 'D12_职业身份梦',
    label: '梦中职业身份寓意',
    patterns: [/医生|醫生|老师|老師|警察|小偷|明星|乞丐|老板|老闆|官员|官員|军人|軍人|司机|司機|画家|運動員|运动员|科学家|科學家|宇航员|宇航員|古人/i],
  },
  {
    code: 'D13_动作行为梦',
    label: '梦中动作行为寓意',
    patterns: [
      /走路|跑步|爬山|下山|飞|飛|坠落|墜落|掉下去|游泳|潛水|潜水|开车|開車|坐车|坐車|騎車|骑车|跳舞|唱歌|哭|大笑|吵架|打架|杀人|殺人|被殺|被杀|救人|被救|偷东西|偷東西|丢东西|丟東西|找东西|找東西/i,
    ],
  },
  {
    code: 'D8_文化历史梦',
    label: '梦境文化与历史',
    patterns: [/周公解梦|周公解夢|黄粱一梦|黃粱一夢|庄周梦蝶|莊周夢蝶|佛教|道教|梦瑜伽|夢瑜伽|弗洛伊德|榮格|荣格|潜意识|潛意識/i],
  },
];

const POLARITY_RULES: { polarity: DreamPolarity; pattern: RegExp }[] = [
  { polarity: '避凶', pattern: /会不会出事|會不會出事|会不会有事|會不會有事|会不会不好|會不會不好|是不是不吉利|凶不凶|凶吗|凶嗎|坏不坏|壞不壞|有危险|有危險/i },
  { polarity: '求吉', pattern: /是不是好事|算不算好事|吉不吉|吉利不吉利|顺不顺利|順不順利|能不能成功|會不會有好事|会不会有好事/i },
];

const TIMEFRAME_RULES: { timeframe: DreamTimeframe; pattern: RegExp }[] = [
  { timeframe: '过去', pattern: /之前|以前|過去|之前做的梦|以前做的夢/i },
  { timeframe: '近期', pattern: /最近|这段时间|這段時間|这几天|這幾天|这两天|這兩天|这周|這週|这阵子|這陣子|刚刚|剛剛/i },
  { timeframe: '未来', pattern: /以后|以後|将来|將來|以后会不会|以後會不會|以后会怎样|以後會怎樣|未来|未來|会不会发生|會不會發生/i },
  { timeframe: '长期', pattern: /一辈子|一輩子|长期|長期|今后|今後/i },
];

const FOCUS_RULES: { focus: DreamFocus; pattern: RegExp }[] = [
  { focus: '家人', pattern: /我爸|我媽|我妈|父母|家人|孩子|兒子|女兒|老公|老婆|媽媽|爸爸|爷爷|奶奶|爷爺|外公|外婆/i },
  { focus: '伴侣', pattern: /对象|男朋友|女朋友|男友|女友|老公|老婆|另一半|伴侣|伴侶/i },
  { focus: '他人', pattern: /朋友|同事|同学|同學|前任|他|她|對方|对方/i },
];

function detectSubCategory(raw: string): { code: DreamSubCategoryCode; label: string } {
  const text = raw || '';
  for (const rule of DREAM_SUB_RULES) {
    if (rule.patterns.some((re) => re.test(text))) {
      return { code: rule.code, label: rule.label };
    }
  }
  // 兜底：按照「吉凶預兆」處理
  return { code: 'D1_吉凶预兆', label: '梦境预兆吉凶' };
}

function detectPolarity(raw: string): DreamPolarity {
  const text = raw || '';
  for (const rule of POLARITY_RULES) {
    if (rule.pattern.test(text)) return rule.polarity;
  }
  // 常見「会不会…」「好不好」等也可視作求吉避凶，但這裡先給中性，交給占卜結果傾向
  return '中性';
}

function detectTimeframe(raw: string): DreamTimeframe {
  const text = raw || '';
  for (const rule of TIMEFRAME_RULES) {
    if (rule.pattern.test(text)) return rule.timeframe;
  }
  return '未指明';
}

function detectFocus(raw: string): DreamFocus {
  const text = raw || '';
  for (const rule of FOCUS_RULES) {
    if (rule.pattern.test(text)) return rule.focus;
  }
  // 默認視為在問自己
  return '自身';
}

function detectTopic(raw: string): { topic?: string; keywords: string[] } {
  const text = raw || '';
  const keywords: string[] = [];
  let topic: string | undefined;

  const topicMap: { topic: string; pattern: RegExp }[] = [
    { topic: '掉牙', pattern: /掉牙|牙齿|牙齒/ },
    { topic: '死亡', pattern: /死亡|死了|去世|喪禮|丧礼|葬礼|葬禮|棺材|尸体|屍體/ },
    { topic: '怀孕', pattern: /怀孕|懷孕|生孩子|流产|流產/ },
    { topic: '结婚', pattern: /结婚|結婚|婚礼|婚禮|离婚|離婚/ },
    { topic: '考试', pattern: /考试|考試|考场|考場/ },
    { topic: '金钱', pattern: /捡钱|撿錢|丢钱|丟錢|钱包|錢包|中奖|中獎|彩票/ },
    { topic: '房屋着火', pattern: /房子着火|房子著火|失火|火灾|火災/ },
    { topic: '动物-蛇', pattern: /蛇/ },
    { topic: '动物-狗', pattern: /狗/ },
    { topic: '动物-猫', pattern: /猫|貓/ },
    { topic: '动物-鱼', pattern: /鱼|魚/ },
    { topic: '鬼怪', pattern: /鬼|幽灵|幽靈|妖怪|惡魔|恶魔/ },
  ];

  for (const { topic: t, pattern } of topicMap) {
    if (pattern.test(text)) {
      topic = t;
      keywords.push(t);
      break;
    }
  }

  // 補充關鍵字（不一定作為 topic，但方便模板使用）
  const extraKeywordMap: { word: string; pattern: RegExp }[] = [
    { word: '血', pattern: /流血|吐血|血/ },
    { word: '考试', pattern: /考试|考試/ },
    { word: '结婚', pattern: /结婚|結婚|婚礼|婚禮/ },
    { word: '怀孕', pattern: /怀孕|懷孕/ },
    { word: '掉牙', pattern: /掉牙|牙齿|牙齒/ },
  ];

  for (const { word, pattern } of extraKeywordMap) {
    if (pattern.test(text) && !keywords.includes(word)) {
      keywords.push(word);
    }
  }

  return { topic, keywords };
}

export function isDreamQuestion(raw: string): boolean {
  if (!raw) return false;
  return DREAM_HINT_RE.test(raw);
}

/**
 * 主入口：夢境問題意圖分析
 * 使用方式：在解牌 / 解卦前先調用，得到子類 + 主題，再選模板。
 */
export function analyzeDreamQuestion(raw: string): DreamQuestionIntent {
  const text = (raw || '').trim();
  const { code, label } = detectSubCategory(text);
  const polarity = detectPolarity(text);
  const timeframe = detectTimeframe(text);
  const focus = detectFocus(text);
  const { topic, keywords } = detectTopic(text);

  return {
    rawText: text,
    mainCategory: '梦境',
    subCategoryCode: code,
    subCategoryLabel: label,
    topic,
    polarity,
    timeframe,
    focus,
    keywords,
  };
}

