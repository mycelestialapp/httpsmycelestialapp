/**
 * 占星本命盤 · 多視圖排盤（星盤圖 / 行星位置 / 宮位）
 * 可點擊切換不同顯示，對齊主流占卜 App
 */
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { LayoutGrid, List, Layers, Lock, Download } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import AstrologyChartWheel from './AstrologyChartWheel';
import type { ZodiacSignKey, SimplePlanetInfo } from '@/lib/astrologyChart';

const SIGN_SYMBOLS: Record<ZodiacSignKey, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

/** 水晶質感：青藍色 + 雙層光暈，宮位/小標題/行星名統一 */
const CRYSTAL_CLASS = 'text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] drop-shadow-[0_0_28px_rgba(56,189,248,0.22)]';
/** 卡片標題：與太陽框完全一致 — 字級、字重、字色統一（所有行星/宮位標題欄共用） */
const CARD_TITLE_FONT = 'font-semibold text-base tracking-tight leading-snug';
const CARD_TITLE_CRYSTAL = `${CARD_TITLE_FONT} ${CRYSTAL_CLASS}`;
const SECTION_TITLE_CRYSTAL = `font-semibold text-sm sm:text-base tracking-wide text-center leading-snug ${CRYSTAL_CLASS}`;

/** 統一樣式：行星/宮位卡片容器 — 與行星框一致，統一寬高比與邊框 */
const CARD_CLASS = 'w-full rounded-xl border-2 border-cyan-400/40 bg-gradient-to-b from-white/[0.07] to-white/[0.02] text-left overflow-hidden min-w-0';
/** 卡片標題行：與行星框同高、同內邊距 */
const CARD_HEADER_CLASS = 'flex items-center justify-between gap-3 px-4 py-4 min-h-[3.25rem] border-b border-cyan-400/20 bg-white/[0.03]';
/** 卡片內容區：與行星框統一內邊距，字級適配框寬 */
const CARD_BODY_CLASS = 'px-4 py-4 space-y-3 text-sm leading-[1.55] text-subtitle';
/** 區塊標題 ① ② ③ - 與宮位/行星標題統一水晶色 */
const SECTION_TITLE_CLASS = SECTION_TITLE_CRYSTAL;
/** 訂閱可見小標籤（未訂閱時顯示，訂閱用戶直接看到完整解讀） */
const BADGE_PAID_CLASS = 'inline-flex items-center gap-1 rounded-full bg-white/10 text-white/80 px-2 py-0.5 text-sm font-medium border border-white/20';
/** 卡片主標題（行星名/宮位名）- 與土星等行星名統一水晶色 */
const CARD_TITLE_LEFT = CARD_TITLE_CRYSTAL;

/** 行星英文名 → i18n 鍵（含太陽與三顆外行星，宮位視圖顯示用） */
const PLANET_NAME_TO_I18N: Record<string, string> = {
  Sun: 'planetSun',
  Moon: 'planetMoon', Mercury: 'planetMercury', Venus: 'planetVenus',
  Mars: 'planetMars', Jupiter: 'planetJupiter', Saturn: 'planetSaturn',
  Uranus: 'planetUranus', Neptune: 'planetNeptune', Pluto: 'planetPluto',
};
const PLANET_KEYS: { key: string; i18nKey: string; hintKey: string }[] = [
  { key: 'moon', i18nKey: 'planetMoon', hintKey: 'planetMoonNeedHint' },
  { key: 'mercury', i18nKey: 'planetMercury', hintKey: 'planetMercuryNeedHint' },
  { key: 'venus', i18nKey: 'planetVenus', hintKey: 'planetVenusNeedHint' },
  { key: 'mars', i18nKey: 'planetMars', hintKey: 'planetMarsNeedHint' },
  { key: 'jupiter', i18nKey: 'planetJupiter', hintKey: 'planetJupiterNeedHint' },
  { key: 'saturn', i18nKey: 'planetSaturn', hintKey: 'planetSaturnNeedHint' },
  { key: 'uranus', i18nKey: 'planetUranus', hintKey: 'planetUranusNeedHint' },
  { key: 'neptune', i18nKey: 'planetNeptune', hintKey: 'planetNeptuneNeedHint' },
  { key: 'pluto', i18nKey: 'planetPluto', hintKey: 'planetPlutoNeedHint' },
];

interface AstrologyChartPanelProps {
  sunSign: ZodiacSignKey;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  className?: string;
  /** 若已計算出命主行星落座（付費版），則直接展示星座+宮位，不再顯示「補充資料」提示 */
  planets?: SimplePlanetInfo[] | null;
  /** 點擊「需出生時間與地點」時觸發，用於打開填寫資料彈窗補充時間與地點 */
  onRequestBirthTime?: () => void;
  /** 是否為訂閱用戶：true 時直接顯示完整解讀並允許下載，false 時僅顯示「訂閱可見」不展示內容 */
  hasAccess?: boolean;
  /** 星盤圖下的占星解讀正文（僅在「星盤圖」標籤下顯示，行星/宮位標籤下不顯示） */
  reading?: string;
}

type ChartView = 'wheel' | 'planets' | 'houses';

/** 未訂閱時卡片內文：啥也不顯示，只保留標題欄的「訂閱可見」 */
const LOCKED_BODY_CLASS = 'px-4 py-6 text-center text-sm text-subtitle/70';

export default function AstrologyChartPanel({
  sunSign,
  birthYear,
  birthMonth,
  birthDay,
  className = '',
  planets,
  onRequestBirthTime,
  hasAccess = false,
  reading,
}: AstrologyChartPanelProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<ChartView>('wheel');
  const hasFullPlanets = Array.isArray(planets) && planets.length > 0;
  const planetsRef = useRef<HTMLDivElement>(null);
  const housesRef = useRef<HTMLDivElement>(null);
  const [planetsDownloading, setPlanetsDownloading] = useState(false);
  const [housesDownloading, setHousesDownloading] = useState(false);

  /** 超高清下載：用 modern-screenshot 的 scale 真正放大渲染，避免黑屏/糊圖 */
  const HD_SCALE = 4;
  const EXPORT_BG = '#0f0e14';
  const handleDownloadSection = async (
    ref: React.RefObject<HTMLDivElement | null>,
    filename: string,
    setLoading: (v: boolean) => void,
  ) => {
    const el = ref.current;
    if (!el) return;
    setLoading(true);
    try {
      const dataUrl = await domToPng(el, {
        scale: HD_SCALE,
        backgroundColor: EXPORT_BG,
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `${filename}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  // 太陽星座：核心自我與生命力（依出生日期即有，無需出生時間）
  const renderSunDetail = (sign: ZodiacSignKey) => {
    const bold = 'font-medium text-white/90';
    if (sign === 'aquarius') {
      return (
        <div className={CARD_BODY_CLASS}>
          <p className={SECTION_TITLE_CLASS}>① 核心自我 & 生命力</p>
          <p><span className={bold}>現實情況：</span>你的太陽在水瓶座，代表你認同的是「理性、進步、不隨大流」的自我。你習慣用抽離的視角看事情，重視公平與共識，不喜歡被傳統或人情綁架；在團體裡你常是那個提出新想法、打破慣例的人，你的存在感來自「有獨立見解」而不是討好誰。</p>
          <p><span className={bold}>容易走偏：</span>（1）過度強調「我和別人不一樣」，反而變成為了不同而不同，或把冷漠當成獨立。（2）想法很多、願景很大，但落實到日常執行和人情維護時容易沒耐心，結果理想只停在嘴上。（3）需要同類與社群，卻又不願先付出親近，容易給人「很難交心」的印象。</p>
          <p><span className={bold}>具體指向（請照做）：</span></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>選 1～2 件你真心認同的「進步」或「共好」的事（環保、教育、科技、社群、人權等），用具體行動參與——例如固定時間做志工、寫文章、參與討論、捐一小筆錢；讓你的太陽有落地的出口，而不只是想法。</li>
            <li>在重要關係裡，刻意練習「先給一點溫度」：例如主動問一句對方最近如何、記住對方說過的小事並在下次提起；獨立不等於不連結，你的理性可以保留，但關係需要一點主動的靠近。</li>
            <li>每季度檢視一次：我最近有沒有「為了不同而不同」？有沒有哪個想法我說了很久卻從沒邁出第一步？挑一件，寫下「最小可執行的一步」並在兩週內完成，讓太陽水瓶的創新力變成真實的改變。</li>
          </ul>
        </div>
      );
    }
    // 其他星座可依需擴充，先給統一標題與簡述
    const signName = t(`oracle.signs.${sign}.archetypeName`);
    return (
      <div className={CARD_BODY_CLASS}>
        <p className={SECTION_TITLE_CLASS}>① 核心自我 & 生命力</p>
        <p><span className={bold}>現實情況：</span>太陽代表你如何表達自我、追求認同與活力。落在{signName}的你，會用該星座的特質來展現核心身份與人生方向。</p>
        <p><span className={bold}>具體指向：</span>多把精力放在能讓你「做自己」的領域，並在重要關係與事業選擇中保持與自我價值觀一致。</p>
      </div>
    );
  };

  // 付費版：行星與宮位強指向、詳細解讀（有免責前提下可寫得更具體）
  const renderPlanetDetail = (planetName: string, info: SimplePlanetInfo) => {
    const bold = 'font-medium text-body';
    if (planetName === 'Moon' && info.house === 8) {
      return (
        <div className={CARD_BODY_CLASS}>
          <p className={SECTION_TITLE_CLASS}>① 深層安全感 & 錢／親密／生死課題</p>
          <p><span className={bold}>現實情況：</span>比起表面浪漫，你更怕錢沒算清、話沒說清、人不可靠。一旦有「共同財務、深度關係、秘密」，你會非常敏感，卻又不習慣說出來。你真正需要的是「可依靠的現實安全感」——穩定收入、可掌控的賬目、可靠的深度關係，而不是只靠感覺。</p>
          <p><span className={bold}>容易走偏：</span>（1）情緒習慣自己嚥下去，看上去穩住其實心裡一直記著，對方踩線了你會記很久。（2）對背叛或不守信極度敏感，一旦踩線很難再完全信任，卻又不願事先把底線講清楚。（3）需要安全感卻不好意思講，只能透過「對方有沒有一起扛事」來猜，猜錯就冷掉。</p>
          <p><span className={bold}>具體指向（請照做）：</span></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>所有「一起出錢或一起賺錢」的事，先寫規則再做：誰出多少、怎麼分、最壞情況怎麼收場；哪怕是一起租屋、合夥、結婚前財產，都白紙黑字或至少一條訊息確認。</li>
            <li>當你對某人「不安心」超過一週，強制自己用一句話講出來，例如：「我對我們現在的財務／承諾有點沒底，希望能一起算清楚。」不要等對方猜。</li>
            <li>每週一次「情緒記賬」：在手機或本子裡寫下最近讓你堵心的 3 件事，不一定要解決，目的是讓情緒從身體裡出來，避免全部壓在第八宮。</li>
          </ul>
        </div>
      );
    }
    if (planetName === 'Mercury' && info.house === 9) {
      return (
        <div className={CARD_BODY_CLASS}>
          <p className={SECTION_TITLE_CLASS}>① 思維模式 & 學習／遠行／信念</p>
          <p><span className={bold}>現實情況：</span>你的大腦最適合做「長線規劃師」：學什麼專業、拿什麼證、去哪個城市／國家發展，你會不自覺地算 3～10 年後的收益。第九宮代表「高度與視野」，你的優勢是把知識和遠方變成可執行的路線圖，而不是空談。</p>
          <p><span className={bold}>容易走偏：</span>（1）太強調「有用」和「回報」，對沒立刻收益的新知識、新地方不耐煩，錯過真正拉高人生天花板的機會。（2）觀點一旦形成就不輕易更新，容易變成「我早就看透了」的封閉思維。（3）把進修和旅行一直往後推，結果永遠在「等有時間」。</p>
          <p><span className={bold}>具體指向（請照做）：</span></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>立刻寫一份「未來 3～5 年成長路線圖」：列出每年要學的課程或證書、要去的城市或國家、要見的世面；每年年初把學習預算和時間預留出來，當成固定開支。</li>
            <li>每遇到一個全新領域（例如新行業、新技術、新國家），先給自己 3 小時的試讀／試學／試體驗，再決定要不要放棄；不要用「沒用」一句話擋掉。</li>
            <li>每年至少一次「換視角」：遠途旅行、交換、短期進修或線上國際項目，讓第九宮真正打開；回來後寫下三條「我原來沒想到的」，強迫自己更新世界觀。</li>
          </ul>
        </div>
      );
    }
    if (planetName === 'Venus' && info.house === 10) {
      return (
        <div className={CARD_BODY_CLASS}>
          <p className={SECTION_TITLE_CLASS}>① 事業魅力 & 公眾形象</p>
          <p><span className={bold}>現實情況：</span>別人眼中的你（事業場合）：冷靜、有品味、有一套自己的標準。你適合做「既講專業又講審美與風格」的工作：品牌、內容、設計、諮詢、教育、高端服務等。金星在十宮代表「事業與形象綁在一起」，你的質感就是你的競爭力。</p>
          <p><span className={bold}>容易走偏：</span>（1）對環境要求高，一旦覺得公司／團隊太土、太短視就失去興趣，卻又不主動離開或提出改變，結果卡在半吊子狀態。（2）不太會「撒嬌賣乖」，上級和合作方只看到你的理性，感受不到你的熱情與需要，機會容易給更會表現的人。（3）明明有實力，卻習慣觀望，讓機會從身邊滑過去。</p>
          <p><span className={bold}>具體指向（請照做）：</span></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>寫一句「個人品牌宣言」，例如：「我做的是 ×× 領域裡最穩、最誠實、最有質感的方案。」所有公開資料（簡歷、個人頁、名片、社交簡介）統一使用這句，讓人一眼知道你是誰。</li>
            <li>每季度至少爭取一次「正式曝光」：發表作品、做分享、上台報告、拍一條短視頻；目的是讓別人看到你的標準和審美，而不是只在背後評估別人。</li>
            <li>在選擇合作和崗位時，優先選「允許你保留獨立性＋給你一定自由度」的環境；若現狀不允許，至少每半年主動談一次「我希望能多一點 ××」，不要默默忍到冷掉。</li>
          </ul>
        </div>
      );
    }
    if (planetName === 'Mars' && info.house === 11) {
      return (
        <div className={CARD_BODY_CLASS}>
          <p className={SECTION_TITLE_CLASS}>① 行動力 & 團隊／社群／願景</p>
          <p><span className={bold}>現實情況：</span>你最容易燃起來的場景，是和一群人、為一個你認可的理想／項目／社群目標一起行動。你適合做「帶方向感的行動派」：能提出願景，也能帶頭拆任務、跟進執行，而不是一個人默默幹活或只當旁觀者。</p>
          <p><span className={bold}>容易走偏：</span>（1）對團隊理想期待過高，一旦覺得「這些人沒追求」就突然冷掉、抽離，留下半途而廢的專案。（2）提點子很強，但如果沒人馬上跟上，你就失去耐心、不繼續推進，結果很多想法只停在嘴上。（3）在團隊裡沒有給自己明確角色，容易變成「什麼都管一點」或「只提意見不做事」的人。</p>
          <p><span className={bold}>具體指向（請照做）：</span></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>嚴選 1～2 個你真心認同的項目或社群，長期深度參與；不要一次進很多群、到處打醬油，你的火星需要「一個主戰場」才能持續燃燒。</li>
            <li>在團隊裡給自己一個清晰角色並寫下來，例如：「負責路線規劃＋執行跟進的人」——明確負責制定時間線、拆任務、催進度，讓你的火星變成真正的執行力。</li>
            <li>當你對團隊失望時，先做兩件事再決定走不走：第一，明確提一個你認為可行的改動方案（具體到「誰在什麼時間前做什麼」）；第二，給對方一個具體期限（例如兩週）看有沒有改變。若兩次都沒響應，再考慮離開，避免每個地方都只留下「開頭激情」。</li>
          </ul>
        </div>
      );
    }
    if (planetName === 'Jupiter' && info.house === 12) {
      return (
        <div className={CARD_BODY_CLASS}>
          <p className={SECTION_TITLE_CLASS}>① 隱性好運 & 潛意識修復力</p>
          <p><span className={bold}>現實情況：</span>外表看起來你很現實、很能扛，但真正救你的，往往是你安靜下來、自我整理的能力。木星在十二宮代表：你在「獨處、睡前、旅途中的發呆」裡，會慢慢把事情想明白；關鍵時刻也容易出現「不顯山不露水的貴人」——一句話、一個機會，幫你穩住局面。</p>
          <p><span className={bold}>容易走偏：</span>（1）不習慣示弱和求助，很多情緒都壓在心裡，只在身體和夢裡反彈——睡不好、重複的夢、小毛病反覆。（2）累到極限時才突然什麼都不想做，而不是提前給自己「緩衝區」。（3）把所有「看不見的壓力」都塞進第十二宮，從不主動清理，結果潛意識變成壓力堆放場而不是後盾。</p>
          <p><span className={bold}>具體指向（請照做）：</span></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>每週固定一段「絕對屬於自己的時間」（例如週日晚上 8～10 點）：不回消息、不談工作、不陪任何人，只做能讓你安靜下來的事（寫字、散步、發呆、聽歌都可以）。</li>
            <li>當連續兩週睡不好、或反覆做怪夢、或身體反覆出小毛病，把它視為「第十二宮報警」：主動砍掉 20% 不必要的任務和應酬，優先恢復作息和睡眠；不要再用「撐過去就好」來硬扛。</li>
            <li>若有條件，可選一門結構化的身心練習（如正念、冥想、瑜伽、太極），每週 2～3 次、每次 10～15 分鐘即可；目的是給潛意識一個「安全的泄壓閥」，而不是追求玄學效果。</li>
          </ul>
        </div>
      );
    }
    if (planetName === 'Saturn' && info.house === 1) {
      return (
        <div className={CARD_BODY_CLASS}>
          <p className={SECTION_TITLE_CLASS}>① 自我、外貌、第一印象</p>
          <p><span className={bold}>現實情況：</span>帶著土星的第一宮：你在人前要做到的，是讓別人一眼看到你是「穩重、可靠、有分寸」的人，而不是「冷酷、難相處」的人。你的優勢是責任感和邊界感，但若過度壓抑，就會變成距離感和僵硬。</p>
          <p><span className={bold}>容易走偏：</span>（1）怕出錯就說話保守、表情嚴肅，別人不敢靠近，你也容易錯過需要「破冰」的機會。（2）把所有責任往身上攬，長期下來緊繃、怕犯錯，連小事都自我要求過高。（3）在新環境裡「等別人先來認識自己」，結果一直被當成「那個很嚴肅的人」。</p>
          <p><span className={bold}>具體指向（請照做）：</span></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>每次進入新環境（新公司、新圈子、新活動），先準備一句「輕鬆的自我介紹」——例如帶一句自嘲或小幽默，打破那層「土星式嚴肅感」；可以事先練幾遍，到場直接說。</li>
            <li>給自己定下「允許 10% 不完美」的標準：例如允許自己有一次遲到、一次說錯話、一次方案沒做到滿分；刻意在小事上練習「不那麼緊繃」，避免第一宮土星變成自我苛責。</li>
            <li>任何新開始（新工作、新項目、新合作），都當成「馬拉松」而不是「百米賽」：給自己至少 3 個月的適應期，不要第一天就要求自己滿分；有節奏地調節，比一上來就繃到極限更符合土星一宮的長線特質。</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  const renderHouseDetail = (house: number) => {
    const bold = 'font-medium text-body';
    switch (house) {
      case 1:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 自我與身份 — 你如何定義自己</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>第一宮代表「你給別人的第一張名片」。帶著土星的你，要在人前做到的是：讓別人一眼看到你是穩重、可靠、有分寸的人，而不是冷酷、難相處的人；你的優勢是責任感和邊界感，但若表現過度就會變成距離感和僵硬。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）怕出錯就說話保守、表情嚴肅，別人不敢靠近，你也容易錯過需要破冰的機會。（2）把所有責任往身上攬，長期下來緊繃、怕犯錯，連小事都自我要求過高。（3）在新環境裡等別人先來認識自己，結果一直被當成「那個很嚴肅的人」。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每次進入新環境（新公司、新圈子、新活動），先準備一句「輕鬆的自我介紹」——帶一點自嘲或小幽默，打破土星式嚴肅感；可事先練幾遍，到場直接說。</li>
                <li>給自己定下「允許 10% 不完美」的標準：允許自己有一次遲到、一次說錯話、一次方案沒滿分；刻意在小事上練習不那麼緊繃。</li>
                <li>任何新開始都當成馬拉松而不是百米賽：給自己至少 3 個月適應期，有節奏地調節，不要第一天就要求自己滿分。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 外貌與氣質 — 你如何被看見</p>
              <p className="mb-1"><span className={bold}>你的外在特質：</span>第一宮也掌管外貌與氣場。你容易給人「有分寸、不輕浮」的印象，適合用乾淨、有質感的穿著與儀態強化「可靠」；過度隨意或過度張揚都會削弱別人對你的信任感。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）覺得「外表不重要」就完全不經營，結果重要場合氣場弱、存在感低。（2）用「嚴肅」當保護色，不敢流露真實情緒，別人覺得難親近。（3）和他人比較長相或打扮，要麼自卑要麼過度武裝。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>定一個「第一印象清單」：重要場合前檢查三項（衣著是否得體、表情是否放鬆、開場白是否準備好），習慣成自然。</li>
                <li>每週至少一次「放鬆表情」練習：對鏡子或自拍笑一下、說一句話，讓自己習慣被看見時不只有嚴肅一種模式。</li>
                <li>把「外貌」定義為「你願意讓別人看到的那一面」：不追求完美，只求一致、乾淨、符合場合，其餘精力留給實力。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 第一印象與破冰 — 如何打開局面</p>
              <p className="mb-1"><span className={bold}>你的破冰風格：</span>你不擅長即興熱絡，但擅長「有準備的開場」。事先想好一句自我介紹、一個小話題或一個問題，比當場硬聊更符合你的節奏；對方會感受到你的認真而非敷衍。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）等別人先開口，結果雙方都覺得尷尬。（2）一開口就談正事，跳過寒暄，讓人覺得有距離。（3）在新圈子裡待很久仍被當「外人」，因為很少主動分享自己。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每次參加新場合前，準備「一句關於自己的話」和「一個想問對方的問題」，寫在手機裡，到場直接用。</li>
                <li>破冰時先給一點個人資訊（例如「我最近在忙 ××」），再問對方，讓對話有來有往。</li>
                <li>若你常被說「很難聊」，不是你不會說話，而是沒給對方「可接的話」；練習每次說完自己的觀點後加一句「你呢？」或「你怎麼看？」</li>
              </ul>
            </div>
          </div>
        );
      case 2:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 金錢與收入 — 你與錢的關係</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>第二宮掌管「你擁有的」與「你認為自己值多少」。你在錢這件事上要記住：錢很重要，但只是一種工具，不是你「值不值」的全部；你的命盤主戰場不在「一輩子被錢綁死」，但第二宮的基礎——穩定收入與清晰的自我定價——仍要自己經營。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）一緊張就只盯著收入數字，看不到自己能力、經驗、人脈、作品這些真正的資產。（2）拿金錢完全等同自我價值：賺少了就覺得自己失敗，賺多了又怕失去，無法平靜。（3）收入結構單一，把安全感全押在一份工作或一個來源上，一旦變動就焦慮。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每年做一次「資產盤點」：寫下本年新增的技能、證書、人脈、作品、專案，而不只是存款數字；讓自己看到「我今年增值了什麼」。</li>
                <li>收入結構盡量做到「一份穩定＋一份有成長性」：例如主業保底＋副業／投資／技能變現；避免把安全感押在單一來源上。</li>
                <li>當你開始用「賺多少」來評判自己時，強制問自己一句：我有哪些能力是市場會長期買單的？把答案寫下來，定期更新；讓第二宮為「能力定價」服務，而不是被數字綁架。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 價值觀與自我定價 — 你認為自己值多少</p>
              <p className="mb-1"><span className={bold}>你的價值觀：</span>第二宮也關乎「你願意為什麼付錢、為什麼收錢」。你容易把「便宜」和「划算」混為一談，或反過來用高價標籤證明自己；真正的定價來自：你能解決什麼問題、市場願意為此付多少。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）不敢開價，怕被拒絕就自動降價，結果累又賺不多。（2）用消費填補焦慮，買完又後悔，第二宮變成「漏財」。（3）把「省錢」當成唯一美德，該投資自己的學習、健康、形象都不捨得。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>寫下一句「我的時間／專業值多少」：例如「我的一小時值 ×× 元」或「我的方案至少值 ××」，在報價時拿出來看，不要臨場亂降。</li>
                <li>每季度做一次「開支檢視」：哪些是投資（學習、健康、工具），哪些是消耗（衝動消費、重複訂閱），把消耗砍 20%。</li>
                <li>當你想「再便宜一點就好」時，先問：對方會不會因此更尊重我、更長期合作？若不會，就守住底價。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 資源與資產 — 你手上有什麼牌</p>
              <p className="mb-1"><span className={bold}>你的資源觀：</span>第二宮的「資源」不只有存款，還包括技能、人脈、作品、口碑。你容易忽略「無形資產」，只算銀行數字；把能力與關係也寫進「資產表」，才會看到真正的籌碼。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）有資源卻不敢用，怕用完就沒了，結果一直閒置。（2）把資源都押在一個項目或一個人身上，沒有備案。（3）不習慣「用資源換資源」，只會單向付出或單向索取。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>列一張「我的資源清單」：技能、證書、人脈、作品、時間、健康、口碑，每項寫一個「可以怎麼用」；每半年更新一次。</li>
                <li>至少保留一個「備選方案」：若主要收入或主要合作斷了，下一步是什麼？寫下來，心裡有底。</li>
                <li>練習「等價交換」：請人幫忙時，先想自己能提供什麼（時間、專業、介紹）；接受幫助時，也主動說「之後你有需要我可以 ××」。</li>
              </ul>
            </div>
          </div>
        );
      case 3:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 日常溝通 — 說清楚、寫清楚、減少誤會</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>第三宮掌管日常溝通與資訊流。你的命盤主戰場不在「嘴皮子」和碎片化應酬，你更適合把腦力留給第九宮的長線學習與第十宮的事業；但第三宮的基礎——說清楚、寫清楚、減少誤會——仍要守住，否則會反過來消耗你。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）重要的事只口頭講、沒記錄，事後大家各講各的版本，責任扯不清。（2）以為對方「應該懂」，不重複、不確認，結果執行時才發現理解不同。（3）被碎片資訊和群聊佔據太多時間，真正重要的學習和規劃反而沒精力。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>所有涉及錢、時間、交付的約定，習慣「一句話總結＋文字再確認」：發一條訊息或郵件寫明「我們剛說好的是 ××，請確認」，避免事後各說各話。</li>
                <li>重要事項用「誰在什麼時間前做什麼」的格式寫下來，雙方各留一份；開會或通話後 24 小時內補一封摘要。</li>
                <li>每天或每週留出固定時段處理「重要但不緊急」的學習與規劃，把第三宮的碎片時間壓縮在可控範圍內，讓腦力留給第九、第十宮。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 手足與鄰里 — 你與身邊人的相處</p>
              <p className="mb-1"><span className={bold}>你的相處模式：</span>第三宮也掌管兄弟姐妹、鄰里、身邊常接觸的人。你容易把「親近」和「沒界限」混在一起，要麼過度客氣不表達真實想法，要麼一不滿就評價對方「你總是……」「你就是……」。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）跟家人或手足溝通時習慣用評價式語言，容易引發無意義爭吵。（2）對身邊人期待高，一點不合就失望，反而對陌生人更客氣。（3）很少主動聯絡，等對方來找，關係慢慢變淡。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>跟家人或手足溝通時，盡量用「我看到的是……」「我擔心的是……」來開頭，而不是「你總是……」「你就是……」；描述事實比評價人更能減少衝突。</li>
                <li>每季度主動聯絡 1～2 個你重視的「身邊人」（手足、老同學、鄰居），不談正事也行，就問候近況；關係需要定期加溫。</li>
                <li>對身邊人也設定邊界：什麼可以直說、什麼需要先鋪墊，寫下來提醒自己，避免一爆就傷人。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 短途與資訊流 — 你如何吸收與輸出</p>
              <p className="mb-1"><span className={bold}>你的資訊習慣：</span>第三宮還管短途移動、閱讀、學習方式與資訊來源。你適合「有主題的輸入」——帶著問題去查、去學，而不是無目的刷；輸出時也盡量「一次說清一個重點」，避免碎片化表達。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）什麼都看一點，沒有系統，過一陣就忘。（2）短途出差或旅行當成負擔，不願安排，結果視野卡在固定範圍。（3）在群組裡潛水或只發連結，很少貢獻自己的觀點，存在感低。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每週定一個「學習主題」：只圍繞一個關鍵字或一本書、一門課，集中輸入，週末寫三條筆記或心得，讓資訊沉澱。</li>
                <li>每季度至少一次短途（不同城市、不同場合）：不為玩，為「換環境看事情」；回來後寫一條「我原來沒想到的」。</li>
                <li>在常待的群組裡，每週至少主動發一次有內容的觀點或整理，而不是只轉發；讓第三宮從「接收」變成「接收＋輸出」。</li>
              </ul>
            </div>
          </div>
        );
      case 4:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 家庭與根源 — 你從哪裡來、要回哪裡去</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>你真正需要的家，不是熱鬧，而是「在我這裡可以徹底卸下防備」的感覺。第四宮是內在安全感的根，會直接影響你在外打拼時的底氣；若家庭責任長期失衡或沒有「我的地盤」，第八宮月亮的不安全感也會被放大。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）覺得自己「應該扛住一切」，很少直接說：我累了，我也需要被照顧。（2）家裡涉及錢、照顧、家務的分工從不攤開講，用「我都不說，你應該懂」來考驗別人，結果自己悶出怨氣。（3）住哪裡都像過客，沒有布置一個專屬空間，身體和心都找不到「可以關機」的基地。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>無論住哪兒，都給自己布置一個「誰也不能隨便動」的專屬角落（一張書桌、一個沙發位、一面牆都可以），告訴自己：這裡是我的安全區，進這裡就可以關掉對外模式。</li>
                <li>家裡涉及錢、照顧、家務的分工，找一個大家情緒平穩的時間攤開講，寫下來誰負責什麼、多久輪換一次；不要靠默契，默契最容易變成「誰忍不下去誰做」。</li>
                <li>當你連續一週都覺得「家裡的事只有我在扛」時，強制自己說出一句具體需求，例如：「這週末我需要半天完全屬於自己，不被打擾。」先從一句話開始，讓家人知道你的邊界。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 內心安全 — 你的底氣從哪來</p>
              <p className="mb-1"><span className={bold}>你的安全感來源：</span>第四宮的「安全」不是物質堆出來的，而是「有人可以依靠、有地方可以退回」。你容易把安全感建立在「不失控」上——錢要夠、事要穩、人要在；一旦有一項崩了，整個人就晃。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）不願示弱，怕一說「我需要」就失去主導權。（2）把原生家庭的模式無意識複製到現在的家，重複不喜歡的相處方式。（3）很少主動經營「回家」的儀式感，家變成只是睡覺的地方。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每週至少一次「主動表達需要」：不一定是大事，可以是「今天想早點回家」「想一起吃飯」；讓身邊人知道你的節奏。</li>
                <li>寫下「我從原生家庭帶來的三件好事」和「三件我不想再重複的事」；在做重大家庭決定時拿出來看，避免自動駕駛。</li>
                <li>給「家」定一個小儀式：例如週末早餐、每晚某時段不碰手機，讓第四宮有「可預期」的安穩感。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 我的地盤 — 你在哪裡可以關機</p>
              <p className="mb-1"><span className={bold}>你的地盤觀：</span>第四宮也關乎「物理與心理的歸屬」。沒有「我的地盤」的人，容易在哪都像客人，不敢放鬆、不敢做主；哪怕只是一個角落，有「這裡是我的」的意識，就能緩解第八宮的深度不安。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）合租或與家人同住時，完全讓出空間主導權，結果沒有真正休息的地方。（2）把「地盤」等同「買房」，買不起就覺得沒有家。（3）在地盤裡堆滿雜物或工作，沒有「純休息」的區塊。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>明確劃出一塊「誰也不能隨便動」的區域，並跟同住的人說清楚；哪怕是一張桌子、一個抽屜，也要有主權。</li>
                <li>在這塊地盤裡只做「恢復」的事：休息、愛好、發呆，不處理工作與爭執；讓身體記住「進這裡 = 關機」。</li>
                <li>若目前沒有固定住所，至少有一個「隨身包」或「固定儀式」（例如某個咖啡角、某條路）當成「移動的地盤」，讓心有錨點。</li>
              </ul>
            </div>
          </div>
        );
      case 5:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 戀愛情況 — 你會遇到的人 & 容易走的路</p>
              <p className="mb-1"><span className={bold}>你的戀愛模式：</span>你不喜歡曖昧遊戲，更傾向「像朋友＋像戰友」的關係：聊得來、價值觀對得上比浪漫更重要。你外表冷靜理性，其實對感情要求很高——既要靠譜又要有成長空間，所以不會隨便開始，也不會為一時寂寞湊合；你適合的是「一起規劃生活／一起做項目」型感情。</p>
              <p className="mb-1"><span className={bold}>很可能出現的問題：</span>（1）起步慢、進入慢，別人曖昧半個月了你還在觀察，容易錯過窗口。（2）太看長遠忽略當下互動，一邊嫌對方不夠成熟一邊又不願花時間磨合。（3）不滿意時先冷下來、拉開距離，而不是把問題攤開講，結果對方不知道你在意什麼。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>選人時強制問自己三句：這個人有沒有穩定做事的能力？我願不願意讓他／她走進我的工作、計劃和家人？如果一起扛壓力，我信不信得過？若有一項答案讓你猶豫，先攤開聊清楚再往前。</li>
                <li>當你已經在意一個人時，不要只表現得像「朋友」：至少說一句明確立場，例如「我不是只想隨便聊聊天，我是認真的在看能不能走長期。」讓對方知道你的底線和期待。</li>
                <li>當你開始猶豫「要不要繼續」時，先把你的擔心說一遍（例如「我需要我們在未來規劃上比較一致」），給對方一次回應的機會；若對方迴避，再決定離開，避免後悔「沒說清楚就走了」。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 創造力／愛好 — 你的天賦用在哪兒最值</p>
              <p className="mb-1"><span className={bold}>你的創作風格：</span>你不適合「三分鐘熱度」的創作，而是越做越專業、越做越系統的東西；能沉澱成作品、作品能反過來幫你賺錢或建立影響力的方向，都適合你。你的創作不是為了博一時流量，而是為了讓別人看到——你是一個值得長期合作、值得投資的人。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）覺得自己「不夠好」就不敢公開作品，一直停在草稿和想法。（2）把時間都給工作和責任，創作排在最後，心裡又隱隱覺得人生少了點什麼。（3）沒有給創作設「死線」，結果永遠在「等有時間」。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>在寫作／設計／內容／諮詢／教學／手作／產品裡選一個你真正不排斥、可以長期磨的方向，當成「第二職業」來養；每週至少留出固定時段（例如週六上午）給創作，不許被其他事擠掉。</li>
                <li>給自己一個清晰目標並寫下來：例如「三年內做出一套自己的欄目／課程／作品集／賬號，可以對外收費或展示」；每年檢視一次進度，勾掉已完成的里程碑。</li>
                <li>當你覺得「還不夠好」不敢發時，先設一個「最小可發布版本」：例如先發給 3 個信任的人看，再根據反饋迭代；不要等「完美」才見人，完美會讓你永遠不發。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 子女／下一代 — 你對孩子的態度</p>
              <p className="mb-1"><span className={bold}>你的子女觀：</span>你不會輕易決定要不要小孩，一旦決定要的不是「生一個來熱鬧」，而是希望孩子真的能被好好養、好好教育。你對「父母這個角色」有責任感，寧願少但要精；你適合的角色是幫孩子規劃方向、打基礎的人，而不是每天陪玩但沒有原則的人。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）對自己要求太高，沒準備好就一直拖，準備好了又給自己太大壓力怕教不好。（2）容易用「標準」去要求孩子，卻忘了先讓關係變得安全、親近。（3）把原生家庭裡不喜歡的模式無意識複製給下一代，事後才後悔。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>從現在起可以準備兩件事：先和自己原生家庭整理界限——寫下「哪些習慣我要延續、哪些堅決不要複製給下一代」，讓自己在做父母前先想清楚要傳遞什麼。</li>
                <li>在工作與生活裡練習「講道理之前先講感受」：例如先說「我擔心的是……」「我現在的感受是……」，再說「所以我希望……」；這會直接決定以後你和孩子的相處氛圍。</li>
                <li>若已有小孩，給自己一個明確角色並寫下來，例如「負責制定規則與長期規劃的人」，讓另一半或家人配合；避免什麼都管又什麼都沒原則，孩子無所適從。</li>
              </ul>
            </div>
          </div>
        );
      case 6:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 工作與日常 — 你如何分配時間與精力</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>第六宮掌管工作節奏與日常習慣。你要守住的底線是：身體和作息是你打第八、第十、第十一宮「大仗」的底盤，不能隨便透支；你更像是「為更大目標而工作」的人，而不是為工作本身活著，但若第六宮崩掉，其他宮位都會受牽連。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）任務來什麼做什麼，沒有優先級，時間被細碎事項吃完，重要的事永遠排不到前面。（2）把「忙」當成藉口，不願取捨，結果什麼都做一點、什麼都不夠好。（3）把「休息」當成奢侈而不是剛需，長期下來判斷力和情緒都受影響。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每天早上花 3 分鐘寫下「今天三件最重要的事」，其餘事情一律排在這三件之後；若臨時插進來的事太多，就砍掉第三件，不要讓清單無限拉長。</li>
                <li>每週日晚上做「下一週優先級」：只列三件必須完成的事，其餘寫進「可做可不做」；週五檢視，沒做完的挪到下週或砍掉。</li>
                <li>當你連續兩週都覺得「時間永遠不夠」時，強制砍掉 20% 非必要任務與會議；第六宮的秩序來自取捨，不是來自做更多。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 健康與作息 — 你的身體是底盤</p>
              <p className="mb-1"><span className={bold}>你的健康觀：</span>第六宮也掌管身體與作息。忙起來就亂吃亂睡、等身體真的亮紅燈才停，恢復期會越來越長；把睡眠、飲食、輕運動當成「開關機」一樣固定執行，其他宮位才有燃料。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）用咖啡和熬夜撐，短期有效，長期免疫力與情緒一起崩。（2）運動和體檢一直「等有時間」，結果從沒開始。（3）小毛病忍著不說、不查，拖成大病才處理。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>給自己定三條「死規矩」並寫下來：例如最晚幾點睡覺、每週至少兩次輕運動（具體到星期幾）、每年一次體檢；像開關機一樣準點執行，不討價還價。</li>
                <li>當連續兩週睡不飽或身體開始小毛病不斷，視為第六宮報警：主動砍掉 20% 非必要任務與應酬，優先恢復作息；不要用「撐過這陣子就好」來硬扛。</li>
                <li>每季度檢視一次：睡眠、飲食、運動三項各打幾分？哪一項最差就優先補哪一項，不要三項一起擺爛。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 習慣與節奏 — 讓日常可預期</p>
              <p className="mb-1"><span className={bold}>你的節奏感：</span>第六宮喜歡「可重複、可預期」的節奏。沒有固定節奏的人容易隨波逐流，重要的事永遠被擠掉；哪怕只是「每天早上同一時間起床」「每週某天不排會」，都能讓第六宮穩下來。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）覺得「固定節奏」很無聊，總想打破，結果反而沒有穩定產出。（2）把日程排到滿，沒有留白，一有變動就全亂。（3）休息時也在刷手機、想工作，沒有真正的「關機」時段。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>定一個「每週固定不變」的時段：例如週六上午不排事、或每週三晚上不加班；讓身體和腦子有可預期的恢復時間。</li>
                <li>每天留 15～30 分鐘「緩衝區」：不排具體任務，用來處理突發或純休息；沒有緩衝的日程一碰就崩。</li>
                <li>睡前 1 小時不處理工作、不開電腦；用手機也只做「不燒腦」的事，讓第六宮在一天結束時真正關機。</li>
              </ul>
            </div>
          </div>
        );
      case 7:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 伴侶與婚姻 — 你選誰、怎麼選</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>第七宮代表「一對一關係」：伴侶、婚姻。你選人的關鍵標準是：能不能一起扛現實、一起規劃，而不只是一起開心；你更看重「能不能一起做事」而不是「只有感覺」，這點與第十、十一宮的配置一致。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）剛開始被個性或感覺吸引，後來發現對錢、家、工作的看法差太多，只能用冷淡或退出收場。（2）進入關係前不談「底線和分工」，等問題爆發才發現對方完全不是能一起扛事的人。（3）不滿意時先冷下來、拉開距離，而不是把問題攤開講，結果對方不知道你在意什麼。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>進入正式伴侶關係前，強制自己回答三句：他／她面對壓力時是逃避還是一起想辦法？對錢、家、工作三件事，看法跟你差多遠？你能不能放心把重要任務或秘密交給對方？若有一項答案讓你猶豫，先攤開聊清楚再往前。</li>
                <li>當你開始猶豫「要不要繼續這段關係」時，不要直接冷掉或斷聯：先把你的擔心和底線說一遍（例如「我需要我們在財務上透明」），給對方一次回應的機會；若對方迴避或敷衍，再決定離開，避免後悔「沒說清楚就走了」。</li>
                <li>每季度和伴侶做一次「對齊」：對錢、家、工作、未來規劃各聊 15 分鐘，不指責只核對；避免各做各的到最後才發現分歧太大。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 合作與合夥 — 你與搭檔的規則</p>
              <p className="mb-1"><span className={bold}>你的合作觀：</span>第七宮也管事業與生活中的「一對一搭檔」：合夥人、長期合作方、對接窗口。你適合「規則清晰」的合作：誰負責什麼、怎麼分利、什麼情況下可以退出，寫清楚再開始，比「先做做看」省心一百倍。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）對合作關係「先做做看」，不簽清楚退出機制和分工，結果拆夥時扯皮。（2）不好意思談錢、談分工，用「信任」代替合同，最後信任崩了什麼都沒了。（3）選搭檔只看能力不看價值觀，做到一半才發現根本合不來。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>對任何正式合作（合夥、簽約、長期項目），簽之前就把退出機制和分工寫進合同或至少寫進備忘錄：誰負責什麼、什麼情況下可以退出、退出時如何結算；不要用「先做做看」代替規則。</li>
                <li>合作一開始就談「最壞情況」：若其中一方想退出、或做不下去，怎麼收尾？先講清楚，比事後翻臉好。</li>
                <li>每季度和搭檔做一次「進度與感受」對齊：不只聊事，也聊「你覺得我們合作順嗎、有什麼想調整的」；小問題早說早改。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 一對一關係的底線 — 什麼不能忍</p>
              <p className="mb-1"><span className={bold}>你的底線觀：</span>第七宮的「關係」要長久，必須雙方都清楚對方的底線。你不說，對方會猜；猜錯就踩線，踩線就傷。把「我在意什麼、什麼情況下我會離開」講清楚，不是不信任，是給關係劃出安全區。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）以為「真愛就該懂我」，不講底線，結果對方一再踩線你還忍。（2）底線說得太晚，對方已經習慣了某種模式，改不動。（3）把「底線」當成威脅，一不滿就「再這樣我就走」，關係變成博弈。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>寫下你的「關係底線」三條：什麼行為或情況會讓你無法接受？找一個平靜的時機跟對方說，不帶指責，只說「這是我的邊界」。</li>
                <li>當對方踩線時，第一次就說出來：「這件事對我來說很重要，希望我們可以……」不要忍到第三次才爆發。</li>
                <li>若你常說「再這樣我就走」卻從沒走，對方會不再當真；要麼少說、要麼說了就執行，否則底線會失效。</li>
              </ul>
            </div>
          </div>
        );
      case 8:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 共同資源與金錢 — 你與他人的錢怎麼算</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>第八宮掌管「共同承擔的錢、深度信任、秘密與轉化」。你對錢、忠誠、背叛極其敏感，需要的是「可依靠的現實安全感」——穩定賬目、清晰規則、可靠的深度關係；但你又不習慣說出來，習慣自己消化，所以容易在關係裡「表面沒事、心裡記很久」。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）所有涉及「一起花的錢」都不寫規則，靠猜和默契，結果一點風吹草動就觸發不安全感。（2）不好意思談錢，怕傷感情，結果錢的事一直懸在那裡變成心結。（3）共同賬戶或合夥收支從不核對，等出問題才發現雙方認知差很多。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>所有涉及「共同承擔」的錢（共同賬戶、合夥、借貸、投資、家庭開支），先講規則再開始做：誰出多少、怎麼分、最壞情況怎麼收場；哪怕是一條訊息確認，也能大幅降低你的不安。</li>
                <li>每季度和伴侶或合夥人做一次「錢的對齊」：收支、負債、大筆計劃各聊清楚，不指責只核對；避免「你以為我懂、我以為你懂」。</li>
                <li>借錢或被借錢前，寫下一條「還款方式與期限」的訊息雙方留存；不寫的借貸最容易傷關係。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 深度信任與背叛 — 你的底線與修復</p>
              <p className="mb-1"><span className={bold}>你的信任觀：</span>第八宮關乎「能把多少交給對方」——秘密、脆弱、金錢、生死。你一旦信任就會很深，一旦被踩線就很難復原；所以進入深度關係前，先把「什麼算背叛、什麼可以原諒」想清楚，必要時和對方攤開講。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）在關係裡嘴上說「隨便」「沒事」，心裡卻記很久，最後一次性爆發或直接斷聯。（2）當不安全感反覆出現時，不主動說，而是用冷戰、疏遠來試探對方，結果關係越試越傷。（3）被背叛後既不原諒也不離開，卡在怨恨裡多年。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>當你因為不安全感反覆想同一件事超過三天，強制自己選一個信任的人，哪怕只說一句：「我這件事挺不踏實的，想跟你說一下。」先讓情緒有出口，再談要不要行動。</li>
                <li>若你曾被背叛，寫下「我現在能接受什麼、不能接受什麼」；在新關係裡，在適當時機用「我的邊界是……」的方式說出來，而不是等對方踩了再爆。</li>
                <li>若選擇原諒，就訂一個「修復期」與具體行為（例如對方要做什麼、你如何驗證），不要無限期的「再觀察」；觀察太久會變成折磨。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 轉化與情緒 — 不讓第八宮變成垃圾場</p>
              <p className="mb-1"><span className={bold}>你的情緒習慣：</span>第八宮也管「壓下去的情緒、秘密、創傷」。若從不清理，這裡會變成堆放場，最後用身體毛病、重複的夢、關係爆雷的方式反彈；每週給情緒一個出口，不一定要解決，但要「見光」。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）把所有不滿都吞下去，表面和氣、內心記賬。（2）只靠工作或忙碌逃避情緒，從不獨處面對。（3）把第八宮當成「不能說的」禁區，連自己都不願想，結果越壓越重。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每週一次「情緒記賬」：在手機或本子裡寫下最近讓你堵心的 3 件事（不一定要解決），目的是讓情緒從身體裡出來，避免全部壓在第八宮，變成身體或關係的暗傷。</li>
                <li>若你有「不能跟任何人說」的事，至少用寫的方式對自己說；寫完可以刪掉，但寫的過程就是泄壓。</li>
                <li>當身體反覆出小毛病、或重複做類似的夢，視為第八宮在提醒：最近有什麼情緒或關係沒處理？主動找一個出口（談話、書寫、運動、諮詢）。</li>
              </ul>
            </div>
          </div>
        );
      case 9:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 遠行與高等教育 — 你的視野從哪來</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>你的大腦最適合做「長線規劃師」：學什麼專業、拿什麼證、去哪個城市／國家發展，你會不自覺地算 3～10 年後的收益。第九宮代表「高度與視野」，你的優勢是把知識和遠方變成可執行的路線圖，而不是空談。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）太強調「有用」和「回報」，對沒立刻收益的新知識、新地方不耐煩，錯過真正拉高人生天花板的機會。（2）把進修和旅行一直往後推，結果永遠在「等有時間」。（3）只學「跟工作直接相關」的，不碰跨領域，視野越來越窄。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>立刻寫一份「未來 3～5 年成長路線圖」：列出每年要學的課程或證書、要去的城市或國家、要見的世面；每年年初把學習預算和時間預留出來，當成固定開支。</li>
                <li>每遇到一個全新領域（例如新行業、新技術、新國家），先給自己 3 小時的試讀／試學／試體驗，再決定要不要放棄；不要用「沒用」一句話擋掉。</li>
                <li>每年至少一次「換視角」：遠途旅行、交換、短期進修或線上國際項目，讓第九宮真正打開；回來後寫下三條「我原來沒想到的」，強迫自己更新世界觀。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 哲學與信念 — 你信什麼、為什麼活</p>
              <p className="mb-1"><span className={bold}>你的信念觀：</span>第九宮也管「人生觀、價值觀、你信的那套道理」。你容易用「實用」代替「意義」——只做有用的事，不問為什麼；長期下來會覺得空轉。偶爾停下來問「我信什麼、我要成為什麼樣的人」，能給第九宮補氧。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）觀點一旦形成就不輕易更新，容易變成「我早就看透了」的封閉思維。（2）不屑「雞湯」和「大道理」，結果沒有任何精神支點，遇事容易崩。（3）把信念和宗教綁在一起，要麼全信要麼全不信，沒有中間地帶。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每年問自己一次：我現在信什麼？我做的這些事，跟我的信念一致嗎？寫三條，不給別人看，只給自己對齊。</li>
                <li>讀一本「跟工作無關」的書或上一門「純興趣」的課；第九宮需要「無用之用」來保持彈性。</li>
                <li>若你常說「我早就看透了」，強制自己找一個相反觀點的論述讀一讀；不是要你改信，是要你保持「還有別的可能」的開放。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 視野與天花板 — 你允許自己看到多遠</p>
              <p className="mb-1"><span className={bold}>你的天花板觀：</span>第九宮決定「你覺得人生可以多高、多遠」。若你一直待在舒適圈、只跟同溫層交流，天花板會越來越低；主動接觸不同背景的人、不同的地方與觀念，才能把天花板撐高。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）覺得「想那麼遠沒用」，只顧眼前，結果機會來時接不住。（2）只跟同業、同齡、同城的人交流，資訊和想法越來越同質。（3）把「視野」等同「出國」，沒出國就覺得自己沒視野，其實閱讀、對話、換環境都可以。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每季度至少一次「跨圈對話」：跟一個不同行業、不同年齡或不同背景的人深聊一小時，問「你怎麼看 ××」「你為什麼做 ××」；不為人脈，為視野。</li>
                <li>訂一個「五年後的自己」的畫面：在哪、做什麼、跟誰在一起？寫下來，每年修正；有畫面才有路線圖。</li>
                <li>若你從沒離開過所在城市，先從「週末去一個沒去過的區／鎮」開始；第九宮的打開可以從小範圍的「不一樣」開始。</li>
              </ul>
            </div>
          </div>
        );
      case 10:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 事業與名望 — 你在外界的位置</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>第十宮代表事業、名望與公眾形象。你該爭取的定位是「專業＋好看＋有風格」，讓人一看到你的名字就聯想到一種質感；你適合做「既講專業又講審美」的工作：品牌、內容、設計、諮詢、教育、高端服務等，你的質感就是你的競爭力。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）不滿意環境就悄悄拉開距離，卻又不主動離開或提出改變，結果卡在半吊子狀態。（2）明明有實力，卻習慣觀望，讓機會給更會表現的人；上級和合作方只看到你的理性，感受不到你的熱情與需要。（3）沒有把「個人品牌」說清楚，簡歷和社交頁面都泛泛而談，別人記不住你是誰。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>寫一句「個人品牌宣言」，例如：「我做的是 ×× 領域裡最穩、最不忽悠、最有質感的方案。」簡歷、個人頁、名片、社交簡介統一使用，讓人一眼知道你是誰。</li>
                <li>每季度至少爭取一次「正式曝光」：發表作品、做分享、上台報告、拍一條短視頻；目的是讓別人看到你的標準和審美，而不是只在背後評估別人。</li>
                <li>在選擇合作和崗位時，優先選「允許你保留獨立性＋給你一定自由度」的環境；若現狀不允許，至少每半年主動談一次「我希望能多一點 ××」，不要默默忍到冷掉。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 公眾形象與權威 — 別人怎麼看你</p>
              <p className="mb-1"><span className={bold}>你的形象觀：</span>第十宮也管「別人眼中的你」——在職場、在圈子裡、在公開場合。你容易低調過頭，覺得「做好就行不用說」；但在資源有限的世界裡，被看見才能被選擇。適度經營形象不是虛榮，是讓你的實力被正確識別。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）討厭「自我推銷」，結果能力強卻沒人知道。（2）把「權威」想成擺架子，不敢爭取該有的話語權和職位。（3）在不同場合形象分裂——私下一個樣、公開另一個樣，讓人不知道哪個才是真的你。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>定一個「對外統一說法」：別人問你「你做什麼的」時，用一句話回答，並帶出你的差異點；練到自然為止。</li>
                <li>在重要場合（會議、活動、面試）前，先想「我希望對方記住我什麼」；帶著目標去，而不是只是「露個臉」。</li>
                <li>若你已經有實力卻總被忽略，主動爭取一次「主講／主責」的機會；第十宮需要你站到前面，而不是永遠在幕後。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 責任與長期 — 你願意扛多少</p>
              <p className="mb-1"><span className={bold}>你的責任觀：</span>第十宮還管「你在社會結構裡承擔的責任」——職位、頭銜、別人對你的期待。你容易要麼扛太多（什麼都答應），要麼扛太少（怕失敗就不接）；找到「能承擔且願意承擔」的邊界，第十宮才不會變成負擔。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）接了不該接的責任，結果做不好又自責。（2）怕被說「愛出風頭」就不爭取該得的位子。（3）把「成功」定義得太窄（只有升職、只有賺錢），其他成就都覺得不算數。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每半年問自己：我現在扛的責任，哪些是我主動要的、哪些是別人塞的？把「別人塞的」列出來，選一兩件試著卸掉或重新談判。</li>
                <li>若你有機會升職或接更大項目，先想「我願意為此付出什麼、放棄什麼」；願意再接，不要只因為「機會難得」就接。</li>
                <li>給「成功」寫三條你自己的定義（不只有錢和職位）；每年對照一下，你離自己的定義是近了還是遠了。</li>
              </ul>
            </div>
          </div>
        );
      case 11:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 團體與朋友 — 你在哪裡被點燃</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>你最容易燃起來的地方，是和一群人、為一個理想或項目一起衝。第十一宮代表「圈子、朋友、長期願景」，你的行動力要放在「集體目標」裡才有持續力；一個人單幹容易半途冷掉，有團隊和願景才能把你點燃。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）對團隊期待過高，一旦覺得「這群人沒追求」就撤，不願意在不完美的系統裡慢慢優化，結果每個圈子都只留下「開頭激情」。（2）選錯圈子：進了很多群卻沒有一個是真心認同的，時間被碎片化，火星找不到主戰場。（3）在團體裡沒有給自己明確角色，容易變成「什麼都管一點」或「只提意見不做事」的人。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>選擇 1～2 個你真心認同理念的團隊或社群（行業社群、學習小組、創作團隊、公益項目都可以），長期深度參與；不要到處打醬油，你的火星需要「一個主戰場」。</li>
                <li>在團隊裡給自己一個明確角色並寫下來，例如「負責時間線與執行跟進的人」：誰在什麼時間前交付什麼、你來催進度、記關鍵節點；讓你的火星變成真正推動集體前進的力量。</li>
                <li>當你覺得「這群人不行」時，不要立刻退出：先提出一個你認為可行的改動方案（具體到「誰做什麼、何時完成」），給大家一個期限（例如兩週）；若兩次都沒人響應，再考慮換圈子，避免養成「到哪都半途而廢」的習慣。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 願景與理想 — 你為什麼而做</p>
              <p className="mb-1"><span className={bold}>你的願景觀：</span>第十一宮也管「你相信的更大畫面」——你想改變什麼、你想和誰一起做什麼。沒有願景的團體容易變成純社交或純利益，你待不住；有願景但沒行動的團體你也會冷掉。所以要找「既有理念又肯動手」的圈子。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）提點子很強，但如果沒人馬上跟上，你就失去耐心、不繼續推進，結果很多想法只停在嘴上。（2）把「理想」想得太遠大，身邊沒有可落地的第一步，一直空轉。（3）在團體裡只消費不貢獻，等別人推動，自己只當觀眾。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>寫下你的「團體願景」一句話：我希望和什麼樣的人、一起做成什麼事？用這句話去篩選和評估你加入的圈子。</li>
                <li>每個你參與的團體，至少認領一件「沒人做但我可以做」的事；從小事開始，讓自己從旁觀者變成推動者。</li>
                <li>若你的點子沒人響應，先自己做一個最小版本（一頁說明、一個草稿、一次小聚）；有東西再找人，比空口找人容易。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 圈子與貴人 — 誰會拉你一把</p>
              <p className="mb-1"><span className={bold}>你的圈子觀：</span>第十一宮還管「人脈、貴人、你常混的圈子」。你不是那種到處攀關係的人，但你在對的圈子裡會自然被看見；關鍵是選對圈子、待得夠久、有實質貢獻。錯的圈子待再久也只是消耗。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）不屑「經營人脈」，結果需要幫忙時沒人可找。（2）只跟同溫層混，圈子越來越窄，貴人不會從天而降。（3）在圈子裡只索取不付出，久了就被邊緣化。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每季度問自己：我現在最常混的 2～3 個圈子，它們能帶給我什麼、我又能貢獻什麼？若只有單向消耗，考慮減碼或換圈。</li>
                <li>在圈子裡主動做「連接者」：介紹對的人認識、分享有價值的資訊、在別人需要時幫一把；貴人往往是你先幫過的人。</li>
                <li>若你總覺得「沒人幫我」，先想「我最近幫過誰」；第十一宮的資源是互惠的，先給再得，比只求再給自然。</li>
              </ul>
            </div>
          </div>
        );
      case 12:
        return (
          <div className={`${CARD_BODY_CLASS} space-y-4`}>
            <div>
              <p className={`${SECTION_TITLE_CLASS} mb-1`}>① 潛意識與獨處 — 你如何恢復與整理</p>
              <p className="mb-1"><span className={bold}>現實情況：</span>第十二宮代表潛意識、獨處與「看不見的保護力」。你隱藏的優勢是：在別人看不到的地方，用紀律和責任感為自己「悄悄墊底」；真正救你的，往往是你安靜下來、自我整理的能力。關鍵時刻也容易出現「不顯山不露水的貴人」——一句話、一個機會，幫你穩住局面。</p>
              <p className="mb-1"><span className={bold}>容易走偏：</span>（1）不習慣示弱和求助，很多情緒都壓在心裡，只在身體和夢裡反彈——睡不好、重複的夢、小毛病反覆。（2）累到極限才突然什麼都不想做，而不是提前給自己緩衝區。（3）把所有「看不見的壓力」都塞進第十二宮，從不主動清理，潛意識變成壓力堆放場而不是後盾。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>每週固定一段「絕對屬於自己的時間」（例如週日晚上 8～10 點）：不回消息、不談工作、不陪任何人，只做能讓你安靜下來的事。</li>
                <li>當連續兩週睡不好、或反覆做怪夢、或身體反覆出小毛病，視為「第十二宮報警」：主動砍掉 20% 不必要的任務和應酬，優先恢復作息和睡眠。</li>
                <li>若有條件，可選一門結構化的身心練習（正念、冥想、瑜伽、太極等），每週 2～3 次、每次 10～15 分鐘；目的是給潛意識一個安全的泄壓閥。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>② 隱退與修復 — 你何時需要關機</p>
              <p className="mb-1"><span className={bold}>你的修復觀：</span>第十二宮也管「隱退、休息、從世界抽離一下」。你不是那種可以一直衝的人，需要定期「關機」——不一定是睡覺，可以是獨處、發呆、不說話。若長期不給自己這段時間，會用生病或情緒崩潰的方式強制你停。</p>
              <p className="mb-1"><span className={bold}>容易踩的坑：</span>（1）把「休息」當成偷懶，不敢停，結果效率越來越低。（2）休息時也在刷手機、想工作，沒有真正關機。（3）用熬夜和酒精當「放鬆」，結果身體和睡眠更差。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>定一個「每週最小隱退時長」：例如每週至少 3 小時完全屬於自己、不處理任何外界需求；寫進日程，當成必須完成的項目。</li>
                <li>當你覺得「撐不住了」時，先停 24 小時再決定要不要放棄；很多時候是第十二宮在喊需要休息，不是真的不行。</li>
                <li>區分「真休息」和「逃避」：真休息是為了恢復後再出發，逃避是不想面對一直拖；若你發現自己在逃避，先處理一件事再休息。</li>
              </ul>
            </div>
            <div>
              <p className={SECTION_TITLE_CLASS}>③ 靈性與邊界 — 你與「看不見的」的關係</p>
              <p className="mb-1"><span className={bold}>你的邊界觀：</span>第十二宮還管「靈性、直覺、與超越個人的連結」。不一定指宗教，可以是藝術、自然、助人、或某種信念。若你完全活在「只有可見的、可算的」裡，會容易虛；留一點空間給「說不清但存在」的東西，第十二宮才不會變成空洞。</p>
              <p className="mb-1"><span className={bold}>容易的矛盾點：</span>（1）把「靈性」想成玄學或迷信，完全不碰，結果沒有精神錨點。（2）過度依賴占卜、塔羅、外求，不願為自己的選擇負責。（3）把第十二宮當成「不能說的秘密」，連自己都不願面對內心的模糊地帶。</p>
              <p className="mb-1"><span className={bold}>具體指向（請照做）：</span></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>找一種「不為功利」的活動：可以是散步、寫日記、聽音樂、幫助陌生人；每週留一點時間給它，讓第十二宮有出口。</li>
                <li>當你直覺「不對勁」時，不要立刻壓下去；先停下來問自己「我在怕什麼、我在要什麼」，把模糊的感覺寫下來，不一定要解決。</li>
                <li>若你信某種更大的存在（宗教、宇宙、因果都行），用你的方式與之連結；若不信，至少保留「有些事情超出個人控制」的謙卑，不把所有壓力都扛在自己身上。</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const tabs: { key: ChartView; labelKey: string; icon: typeof LayoutGrid }[] = [
    { key: 'wheel', labelKey: 'oracle.chartViewWheel', icon: LayoutGrid },
    { key: 'planets', labelKey: 'oracle.chartViewPlanets', icon: List },
    { key: 'houses', labelKey: 'oracle.chartViewHouses', icon: Layers },
  ];

  return (
    <div className={`rounded-2xl overflow-hidden ${className}`} style={{ background: 'hsla(var(--card) / 0.25)', border: '2px solid hsla(var(--gold) / 0.5)' }}>
      {/* 視圖切換 */}
      <div className="flex border-b border-white/10 px-3">
        {tabs.map(({ key, labelKey, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-base font-medium transition-colors border-b-2 ${
              view === key
                ? 'border-gold-strong text-gold-strong'
                : 'border-transparent text-subtitle hover:text-body'
            }`}
          >
            <Icon size={18} />
            {t(labelKey, { defaultValue: key === 'wheel' ? '星盤圖' : key === 'planets' ? '行星' : '宮位' })}
          </button>
        ))}
      </div>

      <div className="p-4 min-h-[260px]">
        {view === 'wheel' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <AstrologyChartWheel sunSign={sunSign} size={300} className="shrink-0" />
              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                <p className="text-sm font-semibold text-heading" style={{ fontFamily: 'var(--font-serif)' }}>
                  ☉ {t('oracle.sunPositionLabel', { defaultValue: '太陽' })} · {t(`oracle.signs.${sunSign}.archetypeName`)}
                </p>
                <p className="text-sm text-subtitle">
                  {birthYear} {t('oracle.year')} {birthMonth}/{birthDay} · {t('oracle.tropicalZodiac', { defaultValue: '熱帶黃道' })}
                </p>
                <p className="text-sm text-subtitle/90">
                  {t('oracle.astrologyChartHint', { defaultValue: '依出生日期得太陽星座；輸入精確時間與地點可解讀上升、月亮與宮位。' })}
                </p>
              </div>
            </div>
            {reading && (
              <div className="rounded-xl border border-cyan-400/30 bg-white/[0.04] p-4 mt-4">
                <p className="text-center text-lg sm:text-xl font-bold tracking-wide text-cyan-300 mb-4">
                  {t('oracle.astrologyReadingTitle', { defaultValue: '占星解讀' })}
                </p>
                <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-muted-foreground">
                  <ReactMarkdown>{reading}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'planets' && (
          <div className="space-y-4">
            <div ref={planetsRef} className="space-y-4 rounded-xl p-4" style={{ backgroundColor: EXPORT_BG }}>
            {/* 太陽：與行星框統一尺寸與標題欄 */}
            <div className={CARD_CLASS}>
              <div className={CARD_HEADER_CLASS}>
                <span className={`${CARD_TITLE_LEFT} flex-1 min-w-0 text-center sm:text-left`}>
                  ☉ {t('oracle.planetSun', { defaultValue: '太陽' })} · {SIGN_SYMBOLS[sunSign]} {t(`oracle.signs.${sunSign}.archetypeName`)}
                </span>
                {!hasAccess && (
                  <span className={BADGE_PAID_CLASS} title={t('oracle.subscriptionVisible', { defaultValue: '订阅可见' })}>
                    <Lock size={10} />
                    {t('oracle.subscriptionVisible', { defaultValue: '订阅可见' })}
                  </span>
                )}
              </div>
              {hasAccess ? renderSunDetail(sunSign) : (
                <div className={LOCKED_BODY_CLASS} aria-hidden>&nbsp;</div>
              )}
            </div>
            {hasFullPlanets
              ? PLANET_KEYS.filter((p) => p.key !== 'uranus' && p.key !== 'neptune' && p.key !== 'pluto').map((p) => {
                  const planetName =
                    p.key === 'moon' ? 'Moon'
                    : p.key === 'mercury' ? 'Mercury'
                    : p.key === 'venus' ? 'Venus'
                    : p.key === 'mars' ? 'Mars'
                    : p.key === 'jupiter' ? 'Jupiter'
                    : 'Saturn';
                  const info = planets?.find((pl) => pl.name === planetName);
                  if (!info) return null;
                  const signLabel = t(`oracle.signs.${info.sign}.archetypeName`);
                  const houseLabel = t(`oracle.house${info.house}`, { defaultValue: `第${info.house}宮` });
                  return (
                    <div key={p.key} className={CARD_CLASS}>
                      <div className={CARD_HEADER_CLASS}>
                        <span className={`${CARD_TITLE_LEFT} flex-1 min-w-0 break-words`}>
                          {t(`oracle.${p.i18nKey}`, { defaultValue: p.key })} · {SIGN_SYMBOLS[info.sign]} {signLabel} · {houseLabel}
                        </span>
                        {!hasAccess && (
                          <span className={`${BADGE_PAID_CLASS} shrink-0`} title={t('oracle.subscriptionVisible', { defaultValue: '订阅可见' })}>
                            <Lock size={10} />
                            {t('oracle.subscriptionVisible', { defaultValue: '订阅可见' })}
                          </span>
                        )}
                      </div>
                      {hasAccess ? (renderPlanetDetail(planetName, info) ?? renderHouseDetail(info.house)) : (
                        <div className={LOCKED_BODY_CLASS} aria-hidden>&nbsp;</div>
                      )}
                    </div>
                  );
                })
              : (
                <>
                  {PLANET_KEYS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => onRequestBirthTime?.()}
                      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5 px-3 rounded-lg bg-white/5 text-subtitle text-left transition-colors hover:bg-white/10 active:bg-white/15 focus:outline-none focus:ring-2 focus:ring-gold-strong/30"
                      aria-label={t('oracle.tapToAddBirthTime', { defaultValue: '點擊補充出生時間與地點' })}
                    >
                      <span className={CARD_TITLE_LEFT}>{t(`oracle.${p.i18nKey}`, { defaultValue: p.key })}</span>
                      <span className="text-sm text-subtitle/90 sm:text-right">{t(`oracle.${p.hintKey}`, { defaultValue: '需出生時間與地點' })}</span>
                    </button>
                  ))}
                  <p className="text-sm text-subtitle/90 pt-2">
                    {onRequestBirthTime
                      ? t('oracle.planetsHintTap', { defaultValue: '點擊上方行星可補充出生時間與地點，解讀月亮、上升及落宮。' })
                      : t('oracle.planetsHint', { defaultValue: '輸入精確出生時間與地點，可計算月亮、上升及所有行星落座與落宮。' })}
                  </p>
                </>
              )}
            <p className="pt-2 text-sm text-subtitle/80 leading-snug">
              {t('oracle.astrologyDisclaimerPlanets', {
                defaultValue: '以上行星解讀為占星語言的比喻與啟發，不保證任何結果，也不能替代專業諮詢。你根據本內容所作出的任何選擇與後果，需由你自行負責。',
              })}
            </p>
            </div>
            {hasAccess && (
              <button
                type="button"
                onClick={() => handleDownloadSection(planetsRef, '行星解讀', setPlanetsDownloading)}
                disabled={planetsDownloading}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 border border-cyan-400/50 bg-cyan-500/10 text-cyan-300"
              >
                <Download size={16} />
                {planetsDownloading ? t('oracle.downloading', { defaultValue: '生成中…' }) : t('oracle.downloadHDPlanets', { defaultValue: '下載行星解讀（超高清）' })}
              </button>
            )}
          </div>
        )}

        {view === 'houses' && (
          <div className="space-y-4">
            <div ref={housesRef} className="space-y-4 rounded-xl p-4" style={{ backgroundColor: EXPORT_BG }}>
            {(() => {
              const housePlanets: Record<number, string[]> = {};
              if (hasFullPlanets && planets) {
                planets.forEach((p) => {
                  if (!housePlanets[p.house]) housePlanets[p.house] = [];
                  housePlanets[p.house].push(p.name);
                });
              }
              return (
                <>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                    const hp = housePlanets[h];
                    const planetLabel = hasFullPlanets
                      ? (hp && hp.length > 0
                        ? hp.map((name) => t(`oracle.${PLANET_NAME_TO_I18N[name] || name}`, { defaultValue: name })).join('、')
                        : '—')
                      : '—';
                    return (
                      <div key={h} className={CARD_CLASS}>
                        <div className={`${CARD_HEADER_CLASS} relative pr-20`}>
                          <span className={`${CARD_TITLE_LEFT} flex-1 min-w-0`}>
                            {t(`oracle.house${h}`, { defaultValue: `第${h}宮` })}
                            <span className={`ml-1 ${CRYSTAL_CLASS} ${CARD_TITLE_FONT}`}>
                              · {t(`oracle.house${h}Meaning`, {
                                defaultValue:
                                  h === 1 ? '自我、外貌' : h === 2 ? '財帛、價值' : h === 7 ? '伴侶、合作' : h === 10 ? '事業、名望' : '—',
                              })}
                              <span className="inline-block whitespace-nowrap">{' · 行星：'}<span className={hp && hp.length > 0 ? CRYSTAL_CLASS : 'text-cyan-300/50'}>{planetLabel}</span></span>
                            </span>
                          </span>
                          {!hasAccess && (
                            <span className={`${BADGE_PAID_CLASS} absolute right-3 bottom-3 shrink-0`} title={t('oracle.subscriptionVisible', { defaultValue: '订阅可见' })}>
                              <Lock size={10} />
                              {t('oracle.subscriptionVisible', { defaultValue: '订阅可见' })}
                            </span>
                          )}
                        </div>
                        {hasAccess ? renderHouseDetail(h) : (
                          <div className={LOCKED_BODY_CLASS} aria-hidden>&nbsp;</div>
                        )}
                      </div>
                    );
                  })}
                  {!hasFullPlanets && (
                    <p className="text-sm text-subtitle/90 pt-3">
                      {onRequestBirthTime
                        ? t('oracle.housesHintTap', { defaultValue: '點擊宮位可補充出生時間與地點，解讀行星落宮。' })
                        : t('oracle.housesHint', { defaultValue: '宮位由上升星座與出生地決定。輸入精確時間與地點可計算各行星落宮。' })}
                    </p>
                  )}
                </>
              );
            })()}
            <p className="pt-2 text-sm text-subtitle/80 leading-snug">
              {t('oracle.astrologyDisclaimerHouses', {
                defaultValue: '宮位解讀只用於幫助你思考與自我整理，不具有預測與保證效果，重大決策仍請結合自身判斷、家人建議與專業意見。',
              })}
            </p>
            </div>
            {hasAccess && (
              <button
                type="button"
                onClick={() => handleDownloadSection(housesRef, '宮位解讀', setHousesDownloading)}
                disabled={housesDownloading}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 border border-cyan-400/50 bg-cyan-500/10 text-cyan-300"
              >
                <Download size={16} />
                {housesDownloading ? t('oracle.downloading', { defaultValue: '生成中…' }) : t('oracle.downloadHDHouses', { defaultValue: '下載宮位解讀（超高清）' })}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
