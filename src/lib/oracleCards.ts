/**
 * 神諭卡牌組（Oracle Cards）
 *
 * 參考主流神諭卡（如 Work Your Light、Moonology、Starseed 等），
 * 採用「單面牌義」結構（不做正逆位），每張牌聚焦一個主題 + 行動建議。
 *
 * 注意：為避免一次生成過長文案，僅內建一小部分示例牌；
 * 你可以後續按同樣結構持續擴充牌庫。
 */

export type OracleTopic = 'general' | 'love' | 'career' | 'self';

export interface OracleCardEntry {
  id: string;
  /** 牌面圖片（可選），如 /oracle/custom/xxx.jpg */
  image?: string;
  /** 中文名稱，如「靈魂呼喚」「放下掌控」 */
  nameZh: string;
  /** 一句主題關鍵詞，適合當作卡面副標 */
  tagline: string;
  /** 1～2 行精簡提示，適合在卡面列表或海報上展示 */
  shortHint: string;
  /** 詳細訊息（不分正逆位），包含畫面感 + 心理層 + 宇宙視角 */
  message: string;
  /** 行動建議：聚焦 1～3 個可執行的具體行動 */
  action: string;
  /**
   * 適用主題標籤：用於在不同主題（愛情 / 事業 / 自我）下排序與加權。
   * 不限制只能填一個。
   */
  bestFor: OracleTopic[];
  /** 四元素：用於大師解讀相位分析（相生/相克、衝突與流動） */
  element?: 'Fire' | 'Water' | 'Air' | 'Earth';
  /** 位階 1–22：用於能量流向描述 */
  rank?: number;
}

const ORACLE_CARDS: OracleCardEntry[] = [
  {
    id: 'oracle_soul_calling',
    image: '/oracle/custom/oracle_soul_calling.jpg',
    nameZh: '靈魂呼喚',
    tagline: '你比現在走得更遠',
    shortHint: '現在的生活不錯，但不是終點。',
    message:
      '你或許已經走到一個「還可以」的階段：工作穩定、關係也不差，日常沒有明顯的大問題——可是，靈魂深處總有個微弱卻持續的聲音在問：「就這樣了嗎？」\n\n這張牌出現時，提醒你留意那些你一再壓下去的渴望：想做卻總覺得「以後再說」的學習、創作、轉換跑道、搬家、旅行……它們不是隨機的念頭，而是靈魂在用最溫柔的方式提醒你：你的人生腳本，還有下一幕。\n\n你不需要立刻推翻現狀或做出劇烈改變，但需要誠實承認：現階段的安穩，只是旅程中的一個中繼站，而不是終點站。',
    action:
      '短期行動：\n- 在接下來 7 天內，給自己一個不被干擾的 30 分鐘，寫下三件你「如果不考慮現實，最想去做」的事。\n- 從這三件裡選一件，拆成一個可以在 24 小時內完成的極小步驟（例如：搜尋一門課、列出三個可能的城市、問一位在該領域的人一個問題）。\n- 實際做完這個步驟，然後觀察你的身體與情緒反應——如果是輕鬆的、帶點興奮的，那就是靈魂在說「對，就是這個方向」。',
    bestFor: ['general', 'career', 'self'],
    element: 'Fire',
    rank: 1,
  },
  {
    id: 'oracle_surrender_control',
    image: '/oracle/custom/oracle_surrender_control.jpg',
    nameZh: '放下掌控',
    tagline: '把方向盤交回宇宙',
    shortHint: '你已經做得夠多，現在該學會放手。',
    message:
      '你習慣把一切都抓在手裡：行程、專案、關係、甚至別人的情緒。控制，曾經讓你有安全感，也讓你避開了不少風險——但走到這一刻，它開始變成一種沉重的負擔。\n\n這張牌出現時，宇宙在溫柔地問你：「如果有一件事，你願意先不控制，會是哪一件？」真正的臣服不是什麼都不做，而是在盡力之後，允許部分結果超出你的安排；給未知一點空間，給生命一點自發調整的餘地。\n\n當你把每一個細節都捏得太緊，奇蹟就沒有入口。適度鬆手，反而能讓事情自然流向最合適的位置。',
    action:
      '短期行動：\n- 寫下一件你最近特別焦慮、反覆想要「控制結果」的事，誠實列出你已經做過的努力。\n- 問自己：在這件事上，「我能再多做什麼？」與「有哪些是我無法控制的？」把後者圈起來，提醒自己暫時不再耗能在那裡。\n- 接下來一週，每當腦中又開始上演最壞劇本時，深呼吸三次，對自己說：「我已經做得夠多。剩下的，交給時間與宇宙。」然後把注意力轉回當下可以做到的一件小事上。',
    bestFor: ['general', 'love', 'self'],
    element: 'Water',
    rank: 2,
  },
  {
    id: 'oracle_heart_boundary',
    image: '/oracle/custom/oracle_heart_boundary.jpg',
    nameZh: '心之界線',
    tagline: '說「不」也是一種愛',
    shortHint: '你的溫柔需要一個清晰的邊界。',
    message:
      '你是願意付出的那一型：只要對方開口，你總會想辦法撐起局面。這種特質很美，也讓很多人因此得到了照顧與安穩——但同時，你也可能因此習慣了「先照顧別人、最後才輪到自己」。\n\n這張牌出現時，提醒你檢查最近是否有這樣的情況：明明已經很累了，卻不好意思拒絕；明明不認同，卻選擇沉默；明明不想再扛，卻總是說「沒關係，我來」。長期下來，你的身體與情緒會用各種方式抗議：疲憊、易怒、失眠、甚至對曾經熱愛的事物失去興趣。\n\n真正健康的愛，不是無條件給到枯竭，而是「在尊重自己的前提下，選擇性地給」。當你為自己的心設下一道溫柔而堅定的界線，你會發現，留下來的人，是那些也願意尊重你的人。',
    action:
      '短期行動：\n- 回想最近一週，有沒有哪一次你其實想說「不」，卻硬著頭皮答應了？把那個情境寫下來。\n- 想像如果時間倒回去，你可以怎麼用更溫和但清晰的方式回應（例如：「這次我可能沒辦法幫到這麼多，但我可以……」）。\n- 接下來 3 天內，當下一次類似情況出現時，練習把這句話真的說出口。你不需要一次就做到完美，只要比上次更接近自己一點就好。',
    bestFor: ['love', 'self', 'general'],
    element: 'Water',
    rank: 3,
  },
  {
    id: 'oracle_divine_timing',
    image: '/oracle/custom/oracle_divine_timing.jpg',
    nameZh: '神聖時機',
    tagline: '不是不來，是還沒到',
    shortHint: '宇宙正在排隊把事情排好。',
    message:
      '你已經努力很久，卻總覺得成果「慢了一點」：關係卡在不進不退、工作遲遲沒有突破、想要的改變像在遠方打圈。理智知道需要耐心，可心裡還是難免浮躁：是不是我哪裡做錯了？是不是宇宙忘了我？\n\n這張牌出現時，並不是要你被動等待，而是提醒你：有些事的展開，需要多幾個人、多幾個因素、多幾個看不見的齒輪到位。你做的每一步，其實都在默默增加「當事情準備好時」的成功機率。\n\n神聖時機並不是什麼都不用做，而是在盡了人事之後，接受一個事實：不是所有的結果都會在你想要的時間點到來，但多半會在「真正適合你承接的時候」出現。',
    action:
      '短期行動：\n- 選一件你目前最焦急的事，列出你「已經做到的三件事」與「接下來一週還可以做的一件小事」。\n- 做完那件小事之後，給自己一個具體的「不再多想」儀式：關掉畫面、合上筆記本、散步五分鐘，讓身體知道「我先暫時放下了」。\n- 若你習慣每天檢查結果（看訊息、刷數據、算進度），試著把頻率從「每天」改成「每兩～三天一次」，為神聖時機留一點空間。',
    bestFor: ['general', 'career', 'love'],
    element: 'Air',
    rank: 4,
  },
  { id: 'oracle_inner_wisdom', image: '/oracle/custom/oracle_inner_wisdom.jpg', nameZh: '內在智慧', tagline: '答案早已在你之內', shortHint: '靜下來，聽聽內心的聲音。', message: '你一直在向外尋求認可與答案，但真正的智慧從未離開過你。這張牌邀請你暫時關掉外界的雜音，回到自己的內在。當你願意相信直覺，你會發現很多選擇其實早有答案。', action: '短期行動：今天留 10 分鐘獨處，不滑手機、不做事，只問自己一個問題：「如果內心早已知道，它會怎麼說？」把浮現的第一個念頭記下來。', bestFor: ['self', 'general'], element: 'Air', rank: 5 },
  { id: 'oracle_courage', image: '/oracle/custom/oracle_courage.jpg', nameZh: '勇氣', tagline: '你比你想像中更敢', shortHint: '那一步沒有那麼可怕。', message: '你卡住的往往不是能力，而是對「萬一失敗」的恐懼。這張牌在說：宇宙看見你的退縮，也看見你心底其實已經準備好了。跨出那一小步，比完美更重要。', action: '短期行動：選一件你拖延已久的事，拆成「最小可執行的一步」，在 24 小時內完成這一步，不評判結果。', bestFor: ['career', 'self', 'general'], element: 'Fire', rank: 6 },
  { id: 'oracle_forgiveness', image: '/oracle/custom/oracle_forgiveness.jpg', nameZh: '原諒與釋放', tagline: '放過別人，是放過自己', shortHint: '背了太久的包袱，可以放下了。', message: '緊抓著過去的傷害，不會改變已經發生的事，只會繼續消耗你。這張牌不要求你立刻原諒誰，而是邀請你承認：你值得從那份重量裡解脫。釋放，是給自己的禮物。', action: '短期行動：寫下一句「我允許自己不再為＿＿＿耗費能量」，不必給任何人看，寫完後撕掉或收起來，象徵性地放下。', bestFor: ['love', 'self', 'general'], element: 'Water', rank: 7 },
  { id: 'oracle_voice_of_intuition', image: '/oracle/custom/oracle_voice_of_intuition.jpg', nameZh: '直覺之聲', tagline: '你的身體比大腦更早知道', shortHint: '相信那股說不出來的感覺。', message: '理性會列出利弊，但直覺往往先一步知道答案。這張牌提醒你：當你「說不上來卻就是覺得不對」時，那就是直覺在說話。學會區分「頭腦的擔憂」與「身體的知道」。', action: '短期行動：下次要做一個小決定時，先閉眼感受身體——胸口是緊還是鬆？肚子是沉還是輕？用身體的反應當作一個參考訊號。', bestFor: ['self', 'general', 'love'], element: 'Water', rank: 8 },
  { id: 'oracle_abundance', image: '/oracle/custom/oracle_abundance.jpg', nameZh: '豐盛', tagline: '你值得擁有足夠', shortHint: '匱乏感是幻象，豐盛是選擇。', message: '宇宙的本質是流動與給予。當你總覺得「不夠」，往往是在用過去的經驗限制當下。這張牌邀請你換一種眼光：不是先擁有才感恩，而是先感恩，才更容易看見已經存在的豐盛。', action: '短期行動：連續 3 天，每天寫下 3 件「我已經擁有」的人事物（不一定是物質），大聲或默念一句「謝謝」。', bestFor: ['career', 'general', 'self'], element: 'Fire', rank: 9 },
  { id: 'oracle_new_beginnings', image: '/oracle/custom/oracle_new_beginnings.jpg', nameZh: '新開始', tagline: '每一刻都可以是起點', shortHint: '舊章節結束，新的一頁正在打開。', message: '你不需要等到「完美時機」才開始。這張牌在說：新的循環已經在敲門，可能是新的習慣、新的關係、新的方向。關鍵不是你準備好了沒，而是你願不願意先跨出第一步。', action: '短期行動：選一件你一直想「等準備好再做」的事，定一個「只做 5 分鐘」的版本，今天就執行這 5 分鐘。', bestFor: ['career', 'general', 'love'], element: 'Fire', rank: 10 },
  { id: 'oracle_stillness', image: '/oracle/custom/oracle_stillness.jpg', nameZh: '靜心', tagline: '在靜止中，答案會浮現', shortHint: '先停下來，再往前走。', message: '你一直在動，很少真正停下來。這張牌提醒你：很多答案與靈感，只會在靜默中出現。不是要你從此不做事，而是每天給自己一段「什麼都不必產出」的時間，讓心沉澱。', action: '短期行動：接下來一週，每天至少 5 分鐘關掉所有螢幕與音訊，只是坐著或躺著，不追求「想通什麼」，只讓思緒自然流過。', bestFor: ['self', 'general'], element: 'Water', rank: 11 },
  { id: 'oracle_gratitude', image: '/oracle/custom/oracle_gratitude.jpg', nameZh: '感恩', tagline: '感謝，是最高頻的祈禱', shortHint: '把注意力放在已有之上。', message: '感恩不是心靈雞湯，而是一種注意力訓練。當你習慣看見「已經擁有的」，大腦會慢慢從「缺什麼」轉向「有什麼」。這張牌邀請你在日常中多停一秒，對小事也說謝謝。', action: '短期行動：睡前寫下一件今天發生、你願意感謝的事（可以很小：一杯熱茶、一句問候），連續 7 天。', bestFor: ['general', 'self', 'love'], element: 'Earth', rank: 12 },
  { id: 'oracle_self_acceptance', image: '/oracle/custom/oracle_self_acceptance.jpg', nameZh: '自我接納', tagline: '你不需要完美才值得被愛', shortHint: '包括被自己愛。', message: '你對自己比對別人還苛刻。這張牌在說：接納不是「擺爛」，而是承認「此時此刻的我就這樣」，然後從這裡出發。你值得自己的溫柔，而不是永遠在等「變好以後」才肯對自己好。', action: '短期行動：對著鏡子（或閉眼想像自己），說一句「我接納此時此刻的自己」，哪怕只信 10%，也先說出口。', bestFor: ['self', 'love', 'general'], element: 'Earth', rank: 13 },
  { id: 'oracle_healing_light', image: '/oracle/custom/oracle_healing_light.jpg', nameZh: '療癒之光', tagline: '光正在照進你願意敞開的地方', shortHint: '允許自己被療癒。', message: '療癒不需要等「傷口完全不痛」才開始。這張牌象徵一道溫柔的光，照進你願意敞開的那一塊。可能是身體的疲憊、情緒的舊傷、或某段關係的結。你只需要願意「被照到」。', action: '短期行動：選一個你覺得「卡住」的部位或情緒，閉眼想像一道溫暖的金色或白色光輕輕籠罩那裡，呼吸 3～5 次，不強求改變，只允許光存在。', bestFor: ['self', 'general'], element: 'Fire', rank: 14 },
  { id: 'oracle_trust', image: '/oracle/custom/oracle_trust.jpg', nameZh: '信任', tagline: '宇宙有更大的時間表', shortHint: '你負責盡力，其餘交給流動。', message: '你已經很努力了，但結果不在你完全掌控之中。這張牌邀請你在「盡人事」之後，練習信任：信任過程、信任時機、信任自己會在那個當下做出當時能做的選擇。信任不是偷懶，是放下過度的掌控。', action: '短期行動：選一件你已經盡力卻仍焦慮的事，寫下一句「我已經做了我能做的，其餘我選擇信任」，貼在看得見的地方 3 天。', bestFor: ['general', 'love', 'career'], element: 'Earth', rank: 15 },
  { id: 'oracle_letting_go', image: '/oracle/custom/oracle_letting_go.jpg', nameZh: '放手', tagline: '握緊的拳頭接不住新禮物', shortHint: '鬆手，才有空間接收。', message: '你心裡還抓著某個人、某個結果或某個舊版本的自己。這張牌不要求你立刻「放下」，而是提醒：只有當你願意鬆開一點，新的可能才有空間進來。放手不是否定過去，是給未來留白。', action: '短期行動：選一個你「捨不得放」的念頭或關係狀態，對自己說「我允許自己慢慢鬆開」，不強求一天做到，只承認「我在練習」。', bestFor: ['love', 'self', 'general'], element: 'Water', rank: 16 },
  { id: 'oracle_creativity', image: '/oracle/custom/oracle_creativity.jpg', nameZh: '創造力', tagline: '你天生就會創造', shortHint: '不必等靈感，先動筆或動手。', message: '創造力不是少數人的天賦，而是每個人與生俱來的能力。這張牌邀請你別再等「有感覺才做」——往往是先做，感覺才會跟上。畫一筆、寫一句、哼一段，都是創造。', action: '短期行動：今天做一件「沒有實用目的」的創造：亂塗、寫三行字、隨意哼歌 1 分鐘，不評判好壞，只享受過程。', bestFor: ['career', 'self', 'general'], element: 'Fire', rank: 17 },
  { id: 'oracle_truth', image: '/oracle/custom/oracle_truth.jpg', nameZh: '真相', tagline: '誠實地面對，才能真正自由', shortHint: '你心裡知道的那個答案。', message: '你或許一直在迴避某個真相——關於自己、關於某段關係或某個選擇。這張牌在說：只有當你願意直視它，才有機會穿越它。真相不會因為你不看就消失，但面對之後，你才能拿回主動權。', action: '短期行動：在私密的地方寫下「我一直在逃避的是＿＿＿」，不必給任何人看。寫完後問自己：如果接納這個真相，下一步我可以做什麼？', bestFor: ['self', 'love', 'general'], element: 'Air', rank: 18 },
  { id: 'oracle_balance', image: '/oracle/custom/oracle_balance.jpg', nameZh: '平衡', tagline: '在兩端之間，找到你的中道', shortHint: '不是五五開，是你當下的最佳比例。', message: '你最近可能偏向某一端：太拼或太懶、太付出或太封閉。這張牌邀請你檢視：工作與休息、給予與接收、理性與直覺之間，你現在最需要調的是哪一塊？平衡是動態的，不是固定 50/50。', action: '短期行動：選一個你明顯失衡的面向（例如休息太少），定一個「最小可行」的平衡動作，例如每天多睡 30 分鐘或少接一個額外請求，執行一週。', bestFor: ['general', 'career', 'self'], element: 'Earth', rank: 19 },
  { id: 'oracle_transformation', image: '/oracle/custom/oracle_transformation.jpg', nameZh: '蛻變', tagline: '你正在變成下一個版本', shortHint: '過程中的不適，是成長的訊號。', message: '你覺得卡住或不舒服，可能是因為你正在蛻變——舊的殼還沒完全脫落，新的自己還沒完全成形。這張牌提醒你：這段過渡期是正常的，不必強求立刻「變好」，允許自己處在「正在變」的狀態。', action: '短期行動：寫下一句「我正在從＿＿＿蛻變成＿＿＿」，承認現階段的過渡身份，不逼自己馬上到終點。', bestFor: ['self', 'general', 'career'], element: 'Fire', rank: 20 },
  { id: 'oracle_guidance', image: '/oracle/custom/oracle_guidance.jpg', nameZh: '指引', tagline: '你沒有走錯路', shortHint: '下一步的提示已經在身邊。', message: '你覺得迷路時，往往是因為只看腳下。這張牌在說：指引一直都在——可能是一本書的一句話、朋友無心的一句話、或夢裡的一個畫面。放鬆一點，注意這幾天重複出現的訊息。', action: '短期行動：接下來 3 天，留意「重複出現」的人事物或關鍵字，記下來，看看是否在暗示某個方向。', bestFor: ['general', 'career', 'self'], element: 'Air', rank: 21 },
  { id: 'oracle_protection', image: '/oracle/custom/oracle_protection.jpg', nameZh: '保護', tagline: '你值得被保護，包括被自己', shortHint: '設下界線，不是自私。', message: '你可能習慣照顧別人，卻很少為自己設下防護。這張牌提醒你：保護自己的能量與情緒，不是自私，而是讓你能持續給出的前提。允許自己說不、遠離消耗你的人事物，是自愛。', action: '短期行動：選一個你覺得「被消耗」的情境或關係，定一個具體的界線（例如某類話題不談、某個時段不接訊息），用溫和但堅定的方式執行。', bestFor: ['self', 'love', 'general'], element: 'Earth', rank: 22 },
  { id: 'oracle_cleansing', image: '/oracle/custom/oracle_cleansing.jpg', nameZh: '淨化', tagline: '清掉舊能量，才有空間納新', shortHint: '身體與空間都需要定期清理。', message: '你累積了太多舊的思緒、舊的習慣或舊的環境雜物。這張牌邀請你做一些具體的「淨化」：整理一個抽屜、刪掉不再需要的檔案、或做一個象徵性的儀式（如薰香、泡澡），讓自己感覺「清空一點」。', action: '短期行動：今天清理一個小範圍——一個包包、一個桌面角落、或手機裡 10 張不需要的照片，完成後感受一下心理空間是否稍微鬆一點。', bestFor: ['self', 'general'], element: 'Air', rank: 1 },
  { id: 'oracle_dream_message', image: '/oracle/custom/oracle_dream_message.jpg', nameZh: '夢境訊息', tagline: '夢在跟你說話', shortHint: '醒來後，記下第一個印象。', message: '你的潛意識常在夢裡給提示，但醒來就忘了。這張牌邀請你開始記夢——不必解得很深，只要在醒來那一刻把第一個畫面、情緒或關鍵字寫下來，過一陣子回頭看，往往會發現重複的主題。', action: '短期行動：在床邊放紙筆或手機，接下來 3 天醒來後立刻記下夢的任一片段或感覺，不評判，只記錄。', bestFor: ['self', 'general'], element: 'Water', rank: 2 },
  { id: 'oracle_soulmate', image: '/oracle/custom/oracle_soulmate.jpg', nameZh: '靈魂伴侶', tagline: '對的連結會讓你更像自己', shortHint: '不一定是愛情，可能是任何深刻連結。', message: '靈魂伴侶不限定於伴侶，可能是朋友、家人、導師或某段時期的自己。這張牌在說：那種「在一起就覺得被理解、被看見」的連結是存在的。你既可能正在遇見，也可能正在成為別人的這種存在。', action: '短期行動：想一個讓你感到「被接住」的人，寫一句感謝（可以傳給對方，也可以只寫給自己）。若暫時沒有，對自己說「我願意在未來遇見這樣的連結」。', bestFor: ['love', 'general', 'self'], element: 'Water', rank: 3 },
  { id: 'oracle_harvest', image: '/oracle/custom/oracle_harvest.jpg', nameZh: '豐饒', tagline: '你種下的，正在成熟', shortHint: '收成的時候快到了。', message: '你過去付出的努力，可能還沒顯化成你期待的形式，但能量已經在累積。這張牌提醒你：豐饒不一定來得轟烈，有時是悄悄到位。留意小確幸、小進展，它們往往是更大收成的預告。', action: '短期行動：列出 3 件「我過去一年種下的」（可能是學習、關係、習慣），不評判結果，只承認「我在耕耘」。', bestFor: ['career', 'general', 'love'], element: 'Earth', rank: 4 },
  { id: 'oracle_patience', image: '/oracle/custom/oracle_patience.jpg', nameZh: '耐心', tagline: '最好的結果需要時間', shortHint: '不是不做，是邊做邊等。', message: '你急著要答案、要結果，但有些事就是需要醞釀。這張牌不叫你躺平，而是邀請你在「持續行動」的同時，接納「時間」這個變數。耐心不是被動，是帶著信任的主動等待。', action: '短期行動：選一件你正在等結果的事，對自己說「我允許這件事按照它需要的時間展開」，然後把注意力拉回今天可做的一件小事。', bestFor: ['general', 'career', 'love'], element: 'Earth', rank: 5 },
  { id: 'oracle_awakening', image: '/oracle/custom/oracle_awakening.jpg', nameZh: '覺醒', tagline: '你正在睜開眼睛', shortHint: '舊的劇本已經不夠用了。', message: '你開始對以前的信念、關係或生活方式產生懷疑，這不是壞事，是覺醒的徵兆。這張牌在說：你正在從「自動駕駛」切換到「有意識地活」。過程可能伴隨不安，但那是因為你在長大。', action: '短期行動：寫下一句「我曾經相信＿＿＿，現在我開始懷疑／重新思考＿＿＿」，不逼自己立刻有答案，只承認「我在醒來」。', bestFor: ['self', 'general'], element: 'Fire', rank: 6 },
  { id: 'oracle_surrender', image: '/oracle/custom/oracle_surrender.jpg', nameZh: '臣服', tagline: '不是放棄，是交託', shortHint: '盡力之後，交給更大的力量。', message: '臣服不是認輸，而是承認「有些事不在我控制範圍內」。這張牌邀請你在拚盡全力之後，練習交託——不是不做了，而是把結果交給時間、命運或你相信的更高力量，讓自己從焦慮中鬆一口氣。', action: '短期行動：選一件你已經盡力卻仍緊抓的事，做一個小儀式：寫在紙上後摺起來或撕掉，象徵「我交託」，然後去做一件讓自己放鬆的事。', bestFor: ['general', 'self', 'love'], element: 'Water', rank: 7 },
  { id: 'oracle_inner_child', image: '/oracle/custom/oracle_inner_child.jpg', nameZh: '內在小孩', tagline: '那個需要被愛的小孩還在', shortHint: '他需要的是你的接納。', message: '你心裡住著一個曾經受傷、渴望被愛的小孩。這張牌邀請你別再忽略他——用成年的你，回頭給當年的自己一句安慰、一個想像中的擁抱。療癒內在小孩，不是變幼稚，是讓自己更完整。', action: '短期行動：閉眼想像小時候的自己（或某個年齡段的自己），對他說一句你當時需要聽的話，例如「你已經很好了」「不是你的錯」。', bestFor: ['self', 'love', 'general'], element: 'Water', rank: 8 },
  { id: 'oracle_boundaries', image: '/oracle/custom/oracle_boundaries.jpg', nameZh: '界限', tagline: '有界線，才有真正的親密', shortHint: '說不，是為了讓說是更有意義。', message: '你怕設界線會傷人，結果往往傷了自己。這張牌在說：清晰的界線反而讓關係更健康——對方知道你的底線，你也才能長久地給。界限不是牆，是門：你決定誰可以進來、什麼時候開。', action: '短期行動：選一個你經常妥協的場合，事先想好一句溫和但堅定的「不」或「我只能到這裡」，下次類似情況時練習說出口。', bestFor: ['love', 'self', 'general'], element: 'Air', rank: 9 },
  { id: 'oracle_inspiration', image: '/oracle/custom/oracle_inspiration.jpg', nameZh: '靈感', tagline: '靈感喜歡準備好的頭腦', shortHint: '先動起來，靈感會跟上。', message: '你等靈感來才行動，結果常常等不到。這張牌提醒你：靈感往往在「已經在動」的過程中出現。先做一點、寫一點、試一點，創造一個讓靈感可以降落的場域。', action: '短期行動：選一個你想有靈感的領域，今天先做 15 分鐘的「亂做」——亂寫、亂畫、亂想，不追求成品，只開一個頭。', bestFor: ['career', 'self', 'general'], element: 'Air', rank: 10 },
  { id: 'oracle_past_release', image: '/oracle/custom/oracle_past_release.jpg', nameZh: '過去釋放', tagline: '把過去留在過去', shortHint: '你不需要背著舊故事走一輩子。', message: '某段過去還在佔用你現在的情緒與能量。這張牌邀請你承認「那已經過去了」——不是否認發生過，而是選擇不再讓它主導當下。你可以在心裡做一個小小的告別儀式。', action: '短期行動：選一個你反覆想起的過去事件，寫下一句「我承認＿＿＿發生了，我選擇從今天起＿＿＿」，把紙收起來或撕掉，象徵放下。', bestFor: ['self', 'love', 'general'], element: 'Earth', rank: 11 },
  { id: 'oracle_presence', image: '/oracle/custom/oracle_presence.jpg', nameZh: '當下', tagline: '唯一真實的，只有此刻', shortHint: '回來，回到呼吸，回到身體。', message: '你的心可能常跑到過去或未來，很少真正停在「現在」。這張牌邀請你練習臨在：用 5 個感官注意當下——聽見什麼、摸到什麼、聞到什麼？當你回到此刻，焦慮往往會減輕。', action: '短期行動：設定 3 次「當下提醒」（例如每次喝水時），在那幾秒只專注於水的溫度、口感，不滑手機、不想別的事。', bestFor: ['self', 'general'], element: 'Earth', rank: 12 },
  { id: 'oracle_future_hope', image: '/oracle/custom/oracle_future_hope.jpg', nameZh: '未來希望', tagline: '光在隧道的那一頭', shortHint: '保持希望，不是天真，是選擇。', message: '你或許對未來感到茫然或悲觀。這張牌不否認現實的難，但邀請你保留一點「希望」——不是盲目樂觀，而是相信：只要還在走，就有機會遇到轉機。希望是一種選擇，也是一種力量。', action: '短期行動：寫下一句「我相信未來可能＿＿＿」（填一個你願意相信的小小可能性），貼在看得見的地方，讀 3 天。', bestFor: ['general', 'career', 'self'], element: 'Air', rank: 13 },
  { id: 'oracle_self_compassion', image: '/oracle/custom/oracle_self_compassion.jpg', nameZh: '自我慈悲', tagline: '像對待好友一樣對待自己', shortHint: '你值得同樣的溫柔。', message: '你對別人可以很寬容，對自己卻很苛刻。這張牌邀請你換位：如果最好的朋友犯了跟你一樣的錯，你會怎麼跟他說話？把那句話，轉過來對自己說。自我慈悲不是放縱，是允許自己也是人。', action: '短期行動：下次你又要責怪自己時，先停一下，問「如果是我最好的朋友，我會怎麼跟他說？」然後用那句話對自己說一遍。', bestFor: ['self', 'general'], element: 'Earth', rank: 14 },
  { id: 'oracle_action', image: '/oracle/custom/oracle_action.jpg', nameZh: '行動力', tagline: '動起來，比想完美更重要', shortHint: '先做 1%，再迭代。', message: '你卡在規劃、擔憂或等待「準備好」。這張牌在說：行動會帶來反饋，反饋會帶來下一步。不必等完美方案，先做一個最小版本，在做的過程中調整。完成比完美更重要。', action: '短期行動：選一件你拖延的事，定一個「爛版本」——最簡陋但可執行的版本，今天完成這個爛版本，不評判品質。', bestFor: ['career', 'general', 'self'], element: 'Fire', rank: 15 },
  { id: 'oracle_rest', image: '/oracle/custom/oracle_rest.jpg', nameZh: '休息', tagline: '休息是生產力的一部分', shortHint: '你不需要證明自己值得休息。', message: '你一直衝，很少真正休息。這張牌提醒你：休息不是偷懶，是讓系統恢復的必要條件。你不需要「做完所有事」才允許自己停——你本來就值得休息，不需要用產出來換。', action: '短期行動：今天或明天，刻意安排一段「完全不產出」的時間（至少 30 分鐘），不工作、不進修，只做讓身體或心放鬆的事。', bestFor: ['self', 'career', 'general'], element: 'Earth', rank: 16 },
  { id: 'oracle_receiving', image: '/oracle/custom/oracle_receiving.jpg', nameZh: '接受幫助', tagline: '允許別人給你', shortHint: '接受，也是一種給予。', message: '你習慣當給予者，卻不太會接受。這張牌邀請你練習「接受」——接受別人的好意、幫助或讚美，不急着還、不覺得虧欠。當你允許自己被給予，關係會更平衡，你也不會那麼累。', action: '短期行動：下次有人稱讚你或要幫你時，先不說「沒有啦」或「不用」，只說「謝謝」，停 3 秒，讓那份給予被接住。', bestFor: ['love', 'self', 'general'], element: 'Water', rank: 17 },
  { id: 'oracle_shadow', image: '/oracle/custom/oracle_shadow.jpg', nameZh: '陰影整合', tagline: '你看不見的那一面，也是你', shortHint: '接納陰影，才能更完整。', message: '你壓抑的、不願承認的那部分自己，心理學叫陰影。這張牌不要求你立刻「解決」它，而是邀請你承認：那也是你的一部分。當你願意看見而不批判，它的力量就會減弱，甚至轉成資源。', action: '短期行動：選一個你對自己的「不滿意」或「不敢承認」的面向，寫下來「我＿＿＿」（例如「我有時會嫉妒」），不加批判，只承認「這也是我」。', bestFor: ['self', 'general'], element: 'Earth', rank: 18 },
  { id: 'oracle_soul_mission', image: '/oracle/custom/oracle_soul_mission.jpg', nameZh: '靈魂使命', tagline: '你來這世上，不只是為了生存', shortHint: '那個讓你眼睛發亮的事。', message: '你心裡可能有一個「想做卻不敢認真想」的方向。這張牌在說：使命不一定是偉大的頭銜，而是那件讓你覺得「活著有意義」的事。它可能很小、很個人，但對你來說是真實的。', action: '短期行動：寫下「如果不必考慮現實，我最想花時間做的是＿＿＿」，不評判可不可行，只讓答案浮現。', bestFor: ['career', 'self', 'general'], element: 'Fire', rank: 19 },
  { id: 'oracle_flow', image: '/oracle/custom/oracle_flow.jpg', nameZh: '流動', tagline: '像水一樣，繞過障礙', shortHint: '不硬碰，先找路。', message: '你卡在某個點上，一直想用同一種方式突破。這張牌提醒你：水會繞路，但最終還是到海。有時候不是要更用力，而是要換一個角度、換一種做法，讓能量重新流動。', action: '短期行動：選一件你「硬碰」的事，問自己「如果換一種方式，可以怎麼做？」列 3 個完全不同的做法，選一個試試。', bestFor: ['career', 'general', 'self'], element: 'Water', rank: 20 },
  { id: 'oracle_silence', image: '/oracle/custom/oracle_silence.jpg', nameZh: '靜默的力量', tagline: '不說話，也是一種表達', shortHint: '在沉默中，真相會浮現。', message: '你習慣用言語填滿空間，或急著解釋。這張牌邀請你練習「有意識的沉默」——在該停頓的地方停頓，在不需要回答的時候不回答。靜默能讓你看清更多，也讓別人更有空間。', action: '短期行動：今天在一次對話中，刻意多停 3 秒再回應，不急着填滿沉默，感受那幾秒帶來的不同。', bestFor: ['self', 'general', 'love'], element: 'Earth', rank: 21 },
  { id: 'oracle_wholeness', image: '/oracle/custom/oracle_wholeness.jpg', nameZh: '完整', tagline: '你已經是完整的', shortHint: '不需要再補一塊才值得被愛。', message: '你總覺得自己「還缺什麼」才夠好。這張牌在說：你的完整不是拼圖完成的那一天，而是此時此刻——包含你的優點與缺點、光明與陰影。你不需要變完美才值得被愛，包括被自己愛。', action: '短期行動：對著鏡子（或閉眼）說「我已經是完整的」，哪怕只信一點點，也先說出口，重複 3 次。', bestFor: ['self', 'love', 'general'], element: 'Earth', rank: 22 },
];

/** 回傳全部神諭卡（淺拷貝） */
export function getAllOracleCards(): OracleCardEntry[] {
  return [...ORACLE_CARDS];
}

/** 依日期給「今日一張神諭卡」——同一天結果固定，以增強儀式感 */
export function getDailyOracleCard(date: Date): OracleCardEntry {
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const idx = seededIndex(seed, ORACLE_CARDS.length);
  return ORACLE_CARDS[idx];
}

/** 依任意種子與張數，抽出不重複的神諭卡 */
export function getRandomOracleDraw(
  seed: number,
  count: number,
  preferredTopic?: OracleTopic,
): OracleCardEntry[] {
  const cards = [...ORACLE_CARDS];

  // 若有主題偏好，優先將標記 bestFor 的卡片排前
  if (preferredTopic && cards.length > 0) {
    cards.sort((a, b) => {
      const aHit = a.bestFor.includes(preferredTopic) ? 1 : 0;
      const bHit = b.bestFor.includes(preferredTopic) ? 1 : 0;
      return bHit - aHit;
    });
  }

  const used = new Set<number>();
  const result: OracleCardEntry[] = [];
  const maxCount = Math.min(count, cards.length);

  for (let i = 0; i < maxCount; i++) {
    let idx = seededIndex(seed + i * 7919, cards.length);
    let guard = 0;
    while (used.has(idx) && guard < cards.length + 5) {
      idx = (idx + 1) % cards.length;
      guard++;
    }
    used.add(idx);
    result.push(cards[idx]);
  }

  return result;
}

/** 簡易種子 → index 函式（與塔羅共用思路，確保分布均勻） */
function seededIndex(seed: number, max: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  const frac = x - Math.floor(x);
  return Math.floor(frac * max) % max;
}

