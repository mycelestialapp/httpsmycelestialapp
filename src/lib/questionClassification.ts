/**
 * 占卜问题分类：基于「全网最详细占卜问题分类大全」的 13 大类，
 * 用于将用户问题归入领域，以便解读时「牌意 + 实际情况」给出贴题指引。
 * 分类匹配依赖 questionCategoryKeywords（关键词库），新增问法只需在词库中加词，无需改本文件。
 */

import {
  type QuestionCategory,
  CATEGORY_KEYWORDS,
} from './questionCategoryKeywords';
import { getTopicGuidance } from './questionGuidanceTopics';

export type { QuestionCategory };

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  感情婚姻: '感情婚姻',
  事业工作: '事业工作',
  财运投资: '财运投资',
  学业考试: '学业考试',
  宠物: '宠物',
  身体健康: '身体健康',
  人际关系: '人际关系',
  出行迁居: '出行迁居',
  官司法律: '官司法律',
  生育子女: '生育子女',
  失物寻找: '失物寻找',
  选择决策: '选择决策',
  代人问卜: '代人问卜',
  灵性成长: '灵性成长',
  占风水: '占风水',
  其他: '此事',
};

/**
 * 根据问题文本检测所属分类（13 大类之一）
 * 匹配规则：按 CATEGORY_KEYWORDS 顺序，若问题包含该分类任一关键词即命中；新增问法只需在 questionCategoryKeywords 中加词。
 */
export function detectQuestionCategory(question: string): {
  category: QuestionCategory;
  label: string;
} {
  const q = (question || '').trim();
  if (!q) {
    return { category: '其他', label: CATEGORY_LABELS.其他 };
  }
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => q.includes(kw))) {
      return { category, label: CATEGORY_LABELS[category] };
    }
  }
  return { category: '其他', label: CATEGORY_LABELS.其他 };
}

/**
 * 各分类的「牌意 + 实际情况」结合指引（免费版雷諾曼用）
 * 同一副牌的牌意不变，此句按问题类型把方向收束到该领域。
 */
export const CATEGORY_GUIDANCE: Record<QuestionCategory, string> = {
  感情婚姻:
    '就感情與關係而言，牌面提示你關注內心的真實取捨、關係中的轉變空間，以及溝通與消息——可據此把握時機與對方心意。',
  事业工作:
    '就事業與工作而言，牌面提示你關注決斷與行動、環境中的轉機與提升，以及溝通與資訊——宜主動爭取、留意機會。',
  财运投资:
    '就財運與投資而言，牌面提示你關注取捨與收割、變動中的機會與風險，以及訊息與時機——宜理性評估、見好可收。',
  学业考试:
    '就學業與考試而言，牌面提示你關注複習上的取捨與專注、狀態的轉變與提升，以及訊息與臨場——宜穩住節奏、發揮所學。',
  宠物:
    '就寵物而言，牌面提示你關注牠的狀態、行為訊號與需求，以及你與牠之間的互動與照護——可從情緒、健康與環境三方面對照你心中所問。',
  身体健康:
    '就身體與健康而言，牌面提示你關注作息或治療上的取捨、康復過程的轉變與階段，以及訊息與醫囑——宜配合調理、耐心以對。',
  人际关系:
    '就人際與緣分而言，牌面提示你關注親疏取捨、關係中的轉變與提升空間，以及溝通與是非——宜真誠為本、辨明貴人與小人。',
  出行迁居:
    '就出行與遷居而言，牌面提示你關注出發時機與路線安排，以及交通工具／車況本身的安全與狀態；若直覺覺得哪裡不穩，寧可先檢查維修、調整計畫，也不要勉強上路。',
  官司法律:
    '就官司與是非而言，牌面提示你關注證據與策略上的取捨、局勢的轉變與調解空間，以及溝通與時機——宜理性應對、必要時尋專業。',
  生育子女:
    '就生育與子女而言，牌面提示你關注身心與時機的取捨、階段的轉變與準備，以及消息與緣分——宜放鬆心態、順其自然。',
  失物寻找:
    '就失物與尋找而言，牌面提示你關注方向與取捨、變動中的線索與可能，以及訊息與時機——可從常放處與近期動線再留意。',
  选择决策:
    '就選擇與決策而言，牌面提示你關注取捨與決斷、選項背後的轉變與得失，以及直覺與訊息——宜靜心後再定，選定即前行。',
  代人问卜:
    '就你所問的對方之事而言，牌面提示你關注其處境中的取捨、轉變與可能，以及溝通與訊息——可作參考，仍以當事人為準。',
  灵性成长:
    '就靈性與成長而言，牌面提示你關注內在的取捨與課題、階段的轉化與提升，以及直覺與訊息——可作內省與方向之參。',
  占风水:
    '就風水與環境而言，牌面提示你關注方位與擺設的取捨、與當下需求的對應，以及時機與化解——可從招財、化煞、旺運等目的對照你心中所問，必要時配合專業勘察。',
  其他:
    '以上牌意可對照你心中所問，從決斷、轉變與訊息三個維度感受與你當下情境的連結。',
};

/**
 * 依問題與分類回傳對應指引：先查主題表（questionGuidanceTopics），
 * 有命中則用該主題指引，否則用大類預設。新增具體問法時只需在主題表加一筆，無需改此處。
 */
export function getCategoryGuidance(question: string, category: QuestionCategory): string {
  const topicGuidance = getTopicGuidance(question || '', category);
  if (topicGuidance) return topicGuidance;
  return CATEGORY_GUIDANCE[category];
}
