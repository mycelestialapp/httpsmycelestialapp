import type { BaziApiResult } from './baziLocal';

export type BaziReadingLevel = 'short' | 'long';

export interface BaziReadingOptions {
  level?: BaziReadingLevel;
  language?: 'zh-CN' | 'zh-Hant' | 'en';
  gender?: 'male' | 'female';
}

const WX_LABEL: Record<string, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

/** 天干→五行（用于大运流年与喜忌对比） */
const GAN_WX: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
  '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};
const ZHI_WX: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};
function getGanzhiWuxing(ganzhi: string): string {
  if (!ganzhi || ganzhi.length < 2) return '';
  const g = GAN_WX[ganzhi[0]!] || '';
  const z = ZHI_WX[ganzhi[1]!] || '';
  return g && z ? (g === z ? g : g + z) : g || z;
}

/** 命局层次（付费版用）：据格局与财官印粗判 */
function getMingjuLevel(b: BaziApiResult): string {
  const geju = b.geju || '正格';
  const shishen = [b.shishenPerPillar?.year, b.shishenPerPillar?.month, b.shishenPerPillar?.day, b.shishenPerPillar?.hour].join('');
  const hasCai = /偏财|正财/.test(shishen);
  const hasGuan = /正官|七杀/.test(shishen);
  const hasYin = /正印|偏印/.test(shishen);
  if (geju === '专旺' || geju === '从强') return '命局成格，层次较高，一生机遇不少，宜顺势而为、把握关键节点。';
  if (hasCai && hasGuan && hasYin) return '命局财官印俱全，层次中上，一生可得名利之机，宜稳中求进、注重人脉与口碑。';
  if (hasCai || hasGuan) return '命局有财或官星支撑，层次中等偏上，踏实经营、选对行业与团队，可期小康以上。';
  return '命局以专长与心性见长，层次平稳，宜以专业立身、长期积累，亦可安享平淡之福。';
}

function describeFiveElements(
  wuxing: BaziApiResult['wuxing'],
  detailed: boolean,
  b?: BaziApiResult
): string {
  const w = wuxing || {};
  const parts: string[] = [];
  (['wood', 'fire', 'earth', 'metal', 'water'] as const).forEach((k) => {
    const v = Number(w[k]) || 0;
    parts.push(`${WX_LABEL[k]}行约${v}%`);
  });
  const maxEntry = Object.entries(w).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const minEntry = Object.entries(w).sort((a, b) => Number(a[1]) - Number(b[1]))[0];
  const strong = maxEntry ? WX_LABEL[maxEntry[0] as keyof typeof WX_LABEL] : '未知';
  const weak = minEntry ? WX_LABEL[minEntry[0] as keyof typeof WX_LABEL] : '未知';
  if (!detailed) {
    return `命局五行分布大致为：${parts.join('，')}。整体来看，以${strong}气势较旺，而${weak}相对偏弱，形成“有偏有长”的五行格局。`;
  }
  const fav = b?.xiyongshen?.replace(/[^木火土金水]/g, '') || '';
  const ji = b?.jishen?.replace(/[^木火土金水]/g, '') || '';
  let guide = `喜用神取用与日常调理，皆可围绕「补${weak}、顺${strong}」展开。从命盘看，与「${fav || '喜用五行'}」相关的人事、行业、颜色与方位多能助缘，而在「${ji || '忌神五行'}」所主的方向上则不宜过度用力或重注；流年、流月若带喜用五行，往往较利推进重要事项。`;
  const level = b ? getMingjuLevel(b) : '';
  return `命局五行分布大致为：${parts.join('，')}。整体来看，以${strong}气势较旺，而${weak}相对偏弱，形成“有偏有长”的五行格局。${level ? '\n' + level + '\n' : ''}${guide}`;
}

/** 日主对应外形气质（古籍常见描述，用于结合命盘） */
const DAY_MASTER_APPEARANCE: Record<string, string> = {
  '甲': '身形偏高大或挺拔，气质偏正气、有担当', '乙': '身形偏修长或柔韧，气质偏温和、善协调',
  '丙': '面色偏红润或明朗，气质偏热情、外显', '丁': '相貌偏清秀、眼神有神，气质偏细腻、有礼',
  '戊': '体态偏敦厚或稳重，气质偏可靠、包容', '己': '相貌偏柔和、肤质细腻，气质偏内敛、务实',
  '庚': '轮廓偏分明、气质偏刚毅、有原则', '辛': '相貌偏秀气、皮肤偏白，气质偏清高、重细节',
  '壬': '气质偏洒脱、不拘小节，身形多灵活', '癸': '气质偏清润、眼神柔和，多显年轻感',
};

function describeCore(b: BaziApiResult, gender: 'male' | 'female', detailed: boolean): string {
  const dayMaster = b.dayMaster || '日主';
  const geju = b.geju || '正格';
  const shensha = b.shensha && b.shensha.length > 0 ? b.shensha.join('、') : '常人之命';
  const xiyong = b.xiyongshen || '中和为贵';
  const ji = b.jishen || '偏颇之气';
  const genderText = gender === 'male' ? '偏阳' : '偏阴';
  const shi = b.shishenPerPillar;
  const yearS = shi?.year || ''; const monthS = shi?.month || ''; const dayS = shi?.day || ''; const hourS = shi?.hour || '';
  const personality = `以日主「${dayMaster}」论命，命格归入「${geju}」，先天带${genderText}之气。性格上：年柱${yearS ? `「${yearS}」` : ''}主早年根性与家风，月柱${monthS ? `「${monthS}」` : ''}主青年期心态与同辈缘，日柱${dayS ? `「${dayS}」` : ''}主本人心性与配偶宫，时柱${hourS ? `「${hourS}」` : ''}主晚年与子女缘、外在表现。此命${yearS ? `早年多受${yearS}影响，` : ''}${dayS ? `为人处事带${dayS}之象（${dayS === '食神' ? '温和、有口福与才艺倾向' : dayS === '伤官' ? '聪慧、有表现欲' : dayS === '正印' || dayS === '偏印' ? '重学习与思考' : dayS === '劫财' || dayS === '比肩' ? '重义气、有主见' : dayS === '正财' || dayS === '偏财' ? '务实、有理财意识' : dayS === '正官' || dayS === '七杀' ? '有责任感、有时压力感' : '心性鲜明'}），` : ''}顺境时能发挥所长，压力下有一定韧性，但需防情绪起伏过大或过于执著。`;
  const appearance = `外形与模样方面，${DAY_MASTER_APPEARANCE[dayMaster] || '气质与日主五行相应'}。命盘神煞「${shensha}」会从气质与际遇中体现：桃花多显人缘与审美，驿马多显好动或奔波，文昌多利学习与表达，天乙贵人主遇事有助，华盖主清高与钻研之性。喜忌方面以「${xiyong}」为顺势之气宜多发挥，「${ji}」宜有所节制。`;
  const shortText = personality + '\n\n' + appearance;
  if (!detailed) {
    return `\n一、命局与为人：性格、外形、模样\n${shortText}`;
  }
  const extra = `从命盘看，顺势而为时多发挥「${xiyong}」所代表的特质（如对应五行的行业、颜色、方位、合作对象），在喜用大运与流年主动求变、投资、进修、拓展人脉，往往更顺。命理上「${ji}」当令的大运或流年，则不宜大额投资、盲目扩张或与人硬碰，也少在忌神五行对应的方位久居或长期从事克战明显的行业，以守成为上。\n\n日主与格局决定了命主先天的行为模式与审美倾向：有的人天生更擅长与人协作、有的人更适合独当一面，有的人偏理性务实、有的人偏感性创意，这些都可以从四柱十神的分布里看出端倪。性格没有绝对好坏，关键在于是否放在合适的环境与节奏里发挥；与喜用五行相合的人事、环境往往更容易让人感到顺心，而与忌神五行过重的人事、环境则容易引发消耗感。了解自己的命局，有助于在人生选择上更知进退、少做逆势之举。`;
  return `\n一、命局与为人：性格、外形、模样\n${shortText}\n\n${extra}`;
}

/** 神煞在命理中的含义（结合该柱宫位简要解释） */
const SHENSHA_MEANING: Record<string, string> = {
  '桃花': '主异性缘、审美与人际魅力，该柱遇之则在该柱所主的人事与年龄段易有体现',
  '驿马': '主变动、出行、迁居，该柱遇之则与该柱代表的阶段或六亲相关的动象较多',
  '华盖': '主清高、玄学艺术缘，该柱遇之则在该柱所主领域有钻研或孤高倾向',
  '文昌': '主文书、考试、策划之利，该柱遇之则利于该柱所主时期的学习与表达',
  '天乙贵人': '主遇难呈祥、贵人相助，该柱遇之则在该柱所主人事中易得他人助力',
  '将星': '主领导力与魄力，该柱遇之则在该柱所主领域有担当与号召力',
};

function describeShenshaShishen(b: BaziApiResult): string {
  const pillars = b.pillars;
  const shi = b.shishenPerPillar;
  const shenPer = b.shenshaPerPillar;
  const kongwang = b.kongwang;
  const kwPer = b.kongwangPerPillar;
  const dayMaster = b.dayMaster || '';

  let block = '\n二、神煞十神的解读\n';
  block += '四柱在命理中各有宫位含义：年柱主祖上、父母、早年根基（约1～16岁意象）；月柱主父母、兄弟、青年运势（约17～32岁意象）；日柱主自身、配偶与中年；时柱主子女、晚辈、晚年与外在表现。十神代表命局中各种人事关系的类型与心性倾向，神煞则是古人归纳的星宿与地支组合，多主缘分、变动、才华、贵人等。以下结合您本命盘逐柱说明。\n\n';

  const pillarLabels = [{ key: 'year' as const, name: '年柱', meaning: '祖上、父母、早年' }, { key: 'month' as const, name: '月柱', meaning: '父母、兄弟、青年' }, { key: 'day' as const, name: '日柱', meaning: '自身、配偶' }, { key: 'hour' as const, name: '时柱', meaning: '子女、晚年、外在' }];
  pillarLabels.forEach(({ key, name, meaning }) => {
    const ganZhi = pillars?.[key] || '—';
    const liuQin = shi?.[key] || '—';
    const shenStr = shenPer?.[key] || '—';
    const isEmpty = kwPer?.[key] === '空';
    block += `【${name}】干支「${ganZhi}」，六亲十神为「${liuQin}」，主${meaning}。`;
    if (shenStr && shenStr !== '—') {
      const arr = shenStr.split('、');
      block += `神煞：${shenStr}。${arr.map((s) => SHENSHA_MEANING[s] || `${s}在该柱主${meaning}中有所体现`).join(' ')}。`;
    } else block += '该柱无特别神煞，以十神与五行论。';
    if (isEmpty) block += `此柱地支落空亡，命理上该宫位易有“虚象”或晚应，宜实不宜虚。`;
    block += '\n';
  });

  block += '\n【辅星、星运与自坐空】\n';
  const shenList = b.shensha || [];
  if (shenList.length) block += `本盘辅星（神煞）有：${shenList.join('、')}。辅星随大运流年引动而发挥作用，喜用大运时多显吉利一面，忌神运时需留意其负面（如桃花防烂桃花、驿马防盲目变动）。神煞是命理中的辅助符号，不单独定吉凶，需与十神、五行、大运流年一起看：同一颗神煞在不同大运、不同流年里，因干支喜忌不同，表现会有所不同。`;
  const kwStr = kongwang ? `本命以日柱定旬，空亡地支为「${kongwang[0]}」「${kongwang[1]}」。` : '';
  const dayEmpty = kwPer?.day === '空';
  const hourEmpty = kwPer?.hour === '空';
  if (kwStr) block += kwStr;
  if (dayEmpty) block += '日柱自坐空，命理上主自身或配偶宫易有虚象、晚成或宜务实经营，不宜过早下结论，多给时间与空间。';
  if (hourEmpty) block += '时柱自坐空，命理上主子女或晚年缘份宜顺其自然、少强求，子女教育上多陪伴与因材施教即可。';
  if (!dayEmpty && !hourEmpty && kongwang) block += '日柱时柱未落空亡，自坐较稳。';
  block += '星运指大运流年对命局与神煞的引动，吉凶需结合每步大运与流年干支、喜忌同参。读盘时既要看单柱神煞与十神，也要看四柱之间的生克制化、以及大运流年对哪一柱的引动更强，如此才能把握不同人生阶段的侧重点。';

  return block;
}

function describeLifePath(b: BaziApiResult, detailed: boolean): string {
  const title = '\n三、运程节奏：几段人生、几道坎\n';
  if (!b.dayun) {
    const shortText = '从大运走势看，一生起伏有度，少年时多为基础累积之期，中年以后机会渐增，晚年若能顺势而为，多有回甘之象。整体格局并非一味高亢，而是在波折与机缘之间来回摆动，恰好促成心性成熟。';
    if (!detailed) return title + shortText;
    return title + shortText + '\n\n（详批需准确出生时辰以排定大运，可据此逐运、逐流年看事业、财运、感情、健康的吉凶倾向与顺势守成。）';
  }
  const dir = b.dayun.direction;
  const startNote = b.dayun.startAgeNote || `约${b.dayun.startAge}岁左右起运`;
  const first = b.dayun.steps[0];
  const last = b.dayun.steps[b.dayun.steps.length - 1];
  const liu = b.liunian;
  const xiyongStr = b.xiyongshen?.replace(/[^木火土金水]/g, '') || '';
  const shortText = `命局大运自「${first?.ganzhi || '起运干支'}」始，采取「${dir}行大运」的方式运行，${startNote}，其后一运约十年一换，直至「${last?.ganzhi || '后期大运'}」收尾。一生大体呈现出“前运多为铺垫，中后运更见开花结果”的节奏：早年多在环境与家庭框架中历练，中年以后个人主观能动性增强，若顺应自身喜用之气，往往能在事业财运或心灵成长上各有突破。${liu ? `结合流年，当前岁运大致处在「${liu.thisYear}」之年，前后一年分别为「${liu.lastYear}」「${liu.nextYear}」。` : ''}在这样的时间波动中，命主需要学会把握节奏，在高点时不过分张扬，在低潮时不轻言放弃，如此方能走出属于自己的生命曲线。`;
  if (!detailed) return title + shortText;

  let longBlock = '\n【十年大运逐运简析】\n';
  const steps = b.dayun.steps || [];
  steps.forEach((step) => {
    const ageStart = step.startAge;
    const ageEnd = step.startAge + 10;
    const wx = getGanzhiWuxing(step.ganzhi);
    const isFav = xiyongStr && wx && xiyongStr.includes(wx[0]!);
    if (ageStart < 14) {
      longBlock += `· ${step.ganzhi}大运（约${ageStart}～${ageEnd}岁）${isFav ? '：与命局喜用相合，利成长与根基。' : '：宜稳中养性。'}此阶段以学业与性格养成为主：${isFav ? '利读书、兴趣培养与习惯建立，可打好基础；家庭与学校环境对该运影响较大，长辈的言传身教会留下长期印记。' : '学业宜循序渐进，注意作息与健康；此运重在打底，不必急于求成。'}健康方面注意饮食、睡眠与体质，换运前后一年留意身体与情绪波动。童年与少年期的大运多主根基与心性养成，不主财官，故不在此阶段论创业、婚恋、置业。\n`;
    } else if (ageStart < 24) {
      longBlock += `· ${step.ganzhi}大运（约${ageStart}～${ageEnd}岁）${isFav ? '：与命局喜用相合，属机遇期。' : '：宜稳中求进。'}学业上${isFav ? '利升学、考研、考证、出国进修，可把握该运完成关键学历或资格；该十年是很多人完成高等教育与职业资格的关键期。' : '以完成学业与必备证书为主，多历练；扎实走好每一步比追逐风口更重要。'}初入社会者可多试错、实习与定位方向；感情多为同辈与学业阶段缘分，命理上婚恋与利生育多标在24～44岁区间，此运以积累与选择为主。健康注意作息与体检，换运前后一年留意身体与心态波动。\n`;
    } else if (ageStart < 44) {
      const eduHint = ageStart < 34 ? (isFav ? '利升学、考研、考证，可把握该运完成关键学历或资格；若尚未完成学业或想转行，此运是很好的窗口。' : '学业宜稳扎稳打，以实用与职业发展为导向。') : (isFav ? '若再进修、考证、读研读博，此运易成；中年进修多为锦上添花或转型之需。' : '进修以实用与兴趣为主，不必强求学历形式。');
      longBlock += `· ${step.ganzhi}大运（约${ageStart}～${ageEnd}岁）${isFav ? '：与命局喜用相合，属机遇期。' : '：宜稳中求进，勿冒进。'}事业上${isFav ? '可主动争取晋升、跳槽、创业或副业试水；此运中贵人缘与机会往往较多，关键在能否识别并把握。' : '以守成为主，巩固专业与客户；把现有阵地守牢、口碑做好，比盲目扩张更稳妥。'}财运${isFav ? '可适度投资、置业，但忌杠杆过高；流年再遇喜用时较利签约、开业、置业。' : '宜储蓄、减债，避免担保与高风险理财；忌神运中保守即进取。'}学历上${eduHint}感情上${isFav ? '利谈婚论嫁、修复关系；此运是命理上常标的婚恋与利生育区间。' : '宜多沟通、少争执；稳定比激情更重要。'}健康方面注意作息与体检，换运前后一年尤其留意身体与心态波动。\n`;
    } else {
      longBlock += `· ${step.ganzhi}大运（约${ageStart}～${ageEnd}岁）宜稳中求进，勿冒进。事业上以守成为主，巩固专业与客户，可传帮带、交班或逐步收束战线。财运宜储蓄、减债，避免担保与高风险理财，以保本与现金流为主。进修可选压力较小的方式，以实用与兴趣为主。感情上宜多沟通、少争执；子女与家庭关系在此运中往往占更大比重。健康方面注意作息与体检，换运前后一年尤其留意身体与心态波动；此年龄段从命盘看宜把健康摆在更优先位置。\n`;
    }
  });
  longBlock += '\n【近三年流年】\n';
  if (liu) {
    const lastWx = getGanzhiWuxing(liu.lastYear);
    const thisWx = getGanzhiWuxing(liu.thisYear);
    const nextWx = getGanzhiWuxing(liu.nextYear);
    const fav = (s: string) => s && xiyongStr && xiyongStr.includes(s[0]!);
    longBlock += `· ${liu.lastYear}年（去年）：${fav(lastWx) ? '整体尚可，可总结得失、巩固人脉；若去年有未竟之事，可在今年顺势收尾或延续。' : '以守成为主，避免大额支出与口舌；去年的选择会影响到今年的起点。'}\n`;
    longBlock += `· ${liu.thisYear}年（今年）：${fav(thisWx) ? '流年与喜用相扶时，可把握机会推进事业与财务计划；重要决策可在上半年铺垫、下半年落实。今年是承上启下之年，既可为明年做准备，也可在今年内完成一些关键节点。' : '流年压力相对明显时，宜稳健经营、注意健康与人际，不宜为他人担保或冲动投资；把节奏放慢、把身体与关系照顾好，即是本年的收获。'}\n`;
    longBlock += `· ${liu.nextYear}年（明年）：${fav(nextWx) ? '利开拓、进修、婚恋与置业，可提前规划；明年若为喜用流年，则今年宜做好铺垫与资源储备。' : '宜蓄力、学习与沉淀，少做结构性大变动；明年以稳为主，则今年不宜过度透支。'}\n`;
  }
  longBlock += '\n换运当年及前后一年常有环境或心态转折，从命盘看可提前一两年做职业与财务规划，遇喜用运则进取，遇忌神运则守成、养身、修心。大运管十年大势，流年管当年吉凶，二者结合看方能把握节奏：大运好而流年差时多为小波折，大运差而流年好时多为短暂机会，大运流年皆喜时最利推进重大事项。';
  return title + shortText + longBlock;
}

const WX_INDUSTRY: Record<string, string> = {
  '木': '文化、教育、出版、设计、林业、医药、服装、木制品',
  '火': '能源、电力、互联网、传媒、餐饮、照明、化工、演艺',
  '土': '房地产、建筑、农业、咨询、人力资源、仓储、陶瓷',
  '金': '金融、法律、机械、汽车、金属、军警、管理、审计',
  '水': '物流、贸易、旅游、水产、服务、咨询、饮品、冷链',
};

function describeCareerAndWealth(b: BaziApiResult, gender: 'male' | 'female', detailed: boolean): string {
  const dayMaster = b.dayMaster || '';
  const shishenColumns = [b.shishenPerPillar?.year, b.shishenPerPillar?.month, b.shishenPerPillar?.day, b.shishenPerPillar?.hour]
    .filter(Boolean)
    .join('、');
  const hasCai = shishenColumns.match(/偏财|正财/) != null;
  const hasGuan = shishenColumns.match(/正官|七杀/) != null;
  const caiText = hasCai
    ? '命局中财星不虚，预示一生当中有不少接触资源与财富的机会，适合通过实际事务、项目经营、资源整合来累积物质基础。'
    : '原局财星着墨不多，更适宜把重心放在专业能力与长期价值之上，以稳健的方式让财富自然随之而来。';
  const guanText =
    gender === 'male'
      ? hasGuan
        ? '官杀之星不弱，适合在制度性组织中扛事、担责，若能学会柔中带刚，往往有机会在团队或机构中取得话语权。'
        : '官星偏弱，则更宜走专才路线，通过专业技术或个人品牌立足，而不必强求行政管理职位。'
      : hasGuan
      ? '对于女性命主而言，官杀星既主权威也主伴侣形象，命局有官杀者，说明身边不乏具责任感、事业心较强的男性角色，同时也提示自己在亲密关系中需平衡顺从与自我坚持。'
      : '官杀偏弱，则一方面在职场中不必过度执着“头衔”，另一方面在感情上也适合选择能包容自我节奏、相处自然的对象。';
  const shortText = `从十神组合来看，以「${dayMaster}」为日主，命局中各柱十神分布为：${shishenColumns || '平和中正'}。${caiText}${guanText}整体事业走向上，宜在自身擅长的领域深耕，不论是走管理、专业还是创意路线，只要能围绕命局所喜五行与十神发挥，皆有成就可期。财运方面，更适合“以长期稳定积累”为主轴：避免情绪化投资或一时冲动的大额冒险，重视现金流与风险管理，方能让钱为你所用，而不被钱牵着走。`;
  if (!detailed) return `\n四、事业与财路：适合做什么、怎么赚\n${shortText}`;

  const fav = b.xiyongshen?.replace(/[^木火土金水]/g, '') || '';
  const industries = fav ? [...new Set(fav.split('').map((c) => WX_INDUSTRY[c] || '').filter(Boolean))].join('；') : '与命局喜用五行相符的行业';
  let longBlock = '\n【行业与节奏】\n';
  longBlock += `适合领域方面，从命盘喜用看，与喜用五行相关的行业较能助缘，例如：${industries}。可结合自身兴趣与资源，在以上方向择一深耕，或做“主业+副业”搭配；不必追求面面俱到，在一个方向上做到足够专业，往往比四处涉猎更容易出成果。行业选择只是起点，同一行业里也有管理、技术、销售、创意等不同路线，命盘中有官杀者较易在制度性组织中发挥，有食伤者较易在创意与表达类工作中找到成就感，有财星者较易在资源整合与经营类事务中得心应手。\n\n大运节奏上，前文「十年大运」已标出机遇期与守成期：机遇期（喜用大运）较利主动争取晋升、跳槽、创业、置业与适度投资；守成期（忌神或平运）则较宜稳岗、减债、储蓄、进修，避免担保与高风险投资。同一人在不同大运里的策略应不同——机遇期可多试错、多拓展，守成期则把既有成果巩固好、把风险降下来。\n\n投资与理财以长期稳健为主，不宜高杠杆、短线博弈；可配置一定比例与喜用五行相关的资产或行业（如喜火可关注能源、科技，喜土可关注地产、基建等），但需分散风险、不把鸡蛋放一篮。命理上忌神当令的流年不宜大额投入或为人担保。流年、流月带喜用五行时较利推进签约、开业、跳槽、置业；流年冲克日柱或忌神当令时则不宜做重大职业与财务决策，可延后或分步进行。事业与财运是长期曲线，不必计较一城一池，顺势而为、节奏得当即可。`;
  return `\n四、事业与财路：适合做什么、怎么赚\n${shortText}${longBlock}`;
}

function describeEmotionAndFamily(b: BaziApiResult, gender: 'male' | 'female', detailed: boolean): string {
  const shensha = b.shensha || [];
  const hasTaohua = shensha.includes('桃花');
  const hasTianyi = shensha.includes('天乙贵人');
  const hasWenchang = shensha.includes('文昌');
  const loveText = hasTaohua
    ? '命带桃花，说明在人际互动与情感世界中自带吸引力，容易在社交场景、工作合作或兴趣圈子中遇到让自己心动的人。'
    : '命局桃花不显，则感情多偏内敛稳定型，更在意长期陪伴与精神共鸣，而非表面热闹。';
  const guirenText = hasTianyi
    ? '天乙贵人星出现，使得命主在重要关头往往不乏贵人搭手，无论事业、情感还是家庭议题中，关键时刻常有转圜与支援。'
    : '虽贵人星不算突出，但通过自身真诚与担当，同样能在长期互动中创造互相成就的人际关系。';
  const studyText = hasWenchang
    ? '文昌星临命，学习悟性与表达能力多不俗，适合持续进修、跨界学习与知识型、策划型工作。'
    : '文昌之气平和，则更宜在实践中学习，通过做中学、错中悟，逐渐形成一套适合自己的经验体系。';
  const partnerKey = gender === 'male' ? '财星' : '官星';
  const shortText = `情感方面，${loveText}在择偶标准上，宜兼顾现实条件与内在价值，不必被一时的激情或外在评价左右。就婚姻而言，八字中的${partnerKey}配置提示：适合选择在价值观、生活节奏与成长方向上大体一致的伴侣，如此方能在长期相处中相互滋养，而非消耗。家庭关系上，与原生家庭、父母长辈之间多有牵扯，既是责任也是滋养，理想状态是在照顾家庭的同时，也不过度牺牲自我。\n${guirenText}${studyText}`;
  if (!detailed) return `\n五、感情与家庭：要什么样的伴、怎么相处\n${shortText}`;

  const dayBranch = b.pillars?.day?.[1] || '';
  const dayBranchDesc: Record<string, string> = {
    '子': '多聪明、灵活，有时情绪化', '丑': '踏实、顾家，略固执', '寅': '有魄力、上进', '卯': '温和、重情', '辰': '务实、有责任心',
    '巳': '聪慧、善表达', '午': '热情、外向', '未': '温和、顾家', '申': '理性、有条理', '酉': '重细节、有品味',
    '戌': '忠诚、稳重', '亥': '包容、善思考',
  };
  const partnerDesc = dayBranch ? `配偶宫（日支）为「${dayBranch}」，多主配偶${dayBranchDesc[dayBranch] || '与日主互补、相处需磨合'}。` : '';
  const xiyongStr = b.xiyongshen?.replace(/[^木火土金水]/g, '') || '';
  let favAges = '';
  if (b.dayun?.steps?.length && xiyongStr) {
    const favSteps = b.dayun.steps.filter((s) => s.startAge >= 24 && s.startAge < 44 && getGanzhiWuxing(s.ganzhi) && xiyongStr.includes(getGanzhiWuxing(s.ganzhi)[0]!));
    if (favSteps.length) favAges = favSteps.map((s) => `约${s.startAge}～${s.startAge + 10}岁`).join('、');
  }
  if (!favAges) favAges = '约24～34岁、约34～44岁';
  let longBlock = '\n【感情与六亲】\n';
  longBlock += `配偶与婚姻方面，${partnerDesc}择偶上命理多主选价值观、生活习惯与成长节奏相近者，避免仅因外表或一时激情而结合；长期相处中，性格互补固然好，但若价值观冲突过大，往往难以持久。婚恋、领证、摆酒等从命盘看，喜用大运时段较利稳定良缘，如${favAges}；在这些年份中若遇合适对象，顺势推进关系往往更稳。桃花与时机上，${hasTaohua ? '命带桃花，异性缘不弱；正缘出现时顺势把握较佳，忌神或冲克流年则不宜闪婚或为情破财；桃花主缘分多，但不主一定美满，仍需自己甄别与经营。' : '感情多靠日久生情与共同目标维系，喜用流年较利推进表白、订婚、结婚；缘分来的可能稍晚或稍淡，但一旦建立往往更稳。'}\n\n六亲方面，年柱看父母与早年家境，月柱看兄弟同辈与父母助力；与长辈相处尽孝而不盲从，既有责任也有边界。若有子女则时柱主子女缘，以身作则、多陪伴为佳；子女的个性与缘分在命盘中有一定体现，可结合后文「风水与子女」段同参。流年不冲日支且带喜用五行时，较利办喜事、置业、添丁；流年冲克日支或忌神当令时，则不宜做重大感情决定（如离婚、大额共同投资），可延后或充分沟通后再定。感情与家庭是人生的重要支点，命盘能反映缘分与节奏，但具体经营仍在自己。`;
  return `\n五、感情与家庭：要什么样的伴、怎么相处\n${shortText}${longBlock}`;
}

const WX_ORGANS: Record<string, string> = {
  '木': '肝胆、筋骨、眼目、神经系统',
  '火': '心小肠、血脉、舌、睡眠与神志',
  '土': '脾胃、肌肉、皮肤、消化系统',
  '金': '肺大肠、呼吸、皮肤、咽喉',
  '水': '肾膀胱、泌尿、生殖、腰膝',
};
const WX_SEASON: Record<string, string> = {
  '木': '春季（农历正二月）', '火': '夏季（四五月）', '土': '四季末（三六九腊月）', '金': '秋季（七八月）', '水': '冬季（十冬月）',
};

function describeHealthAndStudy(b: BaziApiResult, detailed: boolean): string {
  const w = b.wuxing || {};
  const weakEntry = Object.entries(w).sort((a, b) => Number(a[1]) - Number(b[1]))[0];
  const weakWx = weakEntry ? WX_LABEL[weakEntry[0] as keyof typeof WX_LABEL] : '某一';
  const shortText = `从五行角度看，命局中${weakWx}之气相对偏弱，宜在日常生活中有意识地补足相关象征领域：例如通过饮食起居、情绪调适与运动方式来平衡五行。整体健康运势并非一味多病或长寿，而是更强调“顺应体质，早做预防”，在关键的大运流年节点留意体检与作息调整，往往可以化重为轻。学业与自我提升方面，不论年龄高低，此命格都适合“终身学习”的路径：在每一个十年运程中，为自己设定一个需要深耕的主题领域，让知识积累与生命经验形成正反馈。`;
  if (!detailed) return `\n六、身体与节奏：别把自己当机器\n${shortText}`;

  const organs = WX_ORGANS[weakWx] || '相应脏腑';
  const season = WX_SEASON[weakWx] || '对应时节';
  let longBlock = '\n【健康与学业】\n';
  longBlock += `命局${weakWx}偏弱，从五行对应脏腑看，宜重点养护${organs}。${season}前后尤其注意情绪与作息，避免过劳、熬夜与暴饮暴食；五行有旺衰节律，在对应时节加强养护往往事半功倍。饮食上可适当增加补${weakWx}之象的食物（如木主酸、绿色，火主苦、红色，土主甘、黄色，金主辛、白色，水主咸、黑色），以营养均衡为本，不必刻意偏食。运动以缓和有氧与拉伸为佳，贵在坚持而非强度；忌神当令的流年不宜进行极限运动或非必要手术，可择期。每年至少一次体检，换运当年及本命年可加强；早发现、早干预比事后补救更重要。\n\n学业与考试方面，命局有文昌或印星者较利考试与进修；重要考试、考证、升学从命盘看，流年带喜用五行或印星当令之时较利报名与应考，忌神流年则以复习巩固为主，不必强求在压力最大的流年硬冲。学业是终身之事，不同大运有不同侧重点：少年运重基础，青年运重资格与学历，中年运重实用与兴趣，晚年运重修身养性。喜用大运与流年较利安排手术、备孕、远行；流年冲克日柱或忌神当令时则不宜做大手术或重大生活变动，可择期或遵医嘱。身体是根本，节奏放对、顺应体质，才能长期可持续。`;
  return `\n六、身体与节奏：别把自己当机器\n${shortText}${longBlock}`;
}

const WX_COLOR: Record<string, string> = {
  '木': '绿、青、翠', '火': '红、紫、橙', '土': '黄、棕、米', '金': '白、金、银', '水': '黑、蓝、灰',
};
const WX_DIR: Record<string, string> = {
  '木': '东、东南', '火': '南', '土': '中央、四隅', '金': '西、西北', '水': '北',
};

/** 时柱十神→子女缘与性格倾向（付费版·子女详情） */
const HOUR_SHISHEN_ZINV: Record<string, string> = {
  '比肩': '子女独立、有主见，易与命主观念碰撞，宜多尊重其选择',
  '劫财': '子女好动、重义气，宜引导理财与分寸感',
  '食神': '子女温和、有口福与才艺缘，利学业与创意，宜多鼓励表达',
  '伤官': '子女聪明、有才华，略显叛逆，宜以理服人、少压制',
  '偏财': '子女大方、善交际，对物质有概念，宜从小树立正确价值观',
  '正财': '子女踏实、有规矩，利学业与稳定发展，宜给予清晰目标',
  '七杀': '子女好强、有魄力，宜多陪伴、建立信任，避免硬碰',
  '正官': '子女懂事、有责任感，利学业与仕途，宜以身作则',
  '偏印': '子女敏感、善思考，宜多关心情绪与兴趣发展',
  '正印': '子女稳重、好学，利读书与贵人缘，宜营造安静学习环境',
};

function describeFengshuiAndName(b: BaziApiResult): string {
  const xiyong = b.xiyongshen || '';
  const fav = xiyong.replace(/[^木火土金水]/g, '') || '';
  const favChars = [...new Set(fav.split(''))];
  const colorList = favChars.map((c) => WX_COLOR[c] || '').filter(Boolean).join('、') || '与喜用五行相应之色';
  const dirList = favChars.map((c) => WX_DIR[c] || '').filter(Boolean).join('、') || '喜用方位';
  let block = `\n七、风水与子女：顺命局所喜\n此命以「${xiyong}」为喜用，日常可多借其象征属性助运；风水与起居的调整不必求大求全，从身边小处做起即可。\n\n【风水与起居】\n`;
  block += `颜色上，从命盘喜用看可多使用${colorList}系（衣着、家居、办公小物、手机壳等），不必全屋刷墙，点缀即可；颜色对情绪与气场有潜移默化的影响，喜用色往往让人更安心、更有状态。方位上，办公桌、床头、常坐位可优先考虑${dirList}；出差、旅行、置业也可选喜用方位城市或片区；方位是命理中常用来“借气”的维度，不必迷信，但可作为参考。材质与摆设可适当增加喜用五行对应的材质（木：木质、绿植；火：灯光、暖色布艺；土：陶瓷、石材；金：金属、白色家具；水：鱼缸、深色摆件），不宜过度堆砌，以免杂乱。作息与习惯上，喜火者可多晒太阳、早睡早起，喜水者多饮水、近水活动，喜木者多户外与绿植，喜金者规律与整洁，喜土者规律饮食与稳定作息；这些与中医养生的“顺应四时”有相通之处，本质是让生活节奏与体质相合。\n\n【子女】\n`;
  const hourPillar = b.pillars?.hour || '';
  const hourShishen = b.shishenPerPillar?.hour || '';
  const hourBranch = hourPillar[1] || '';
  const zinvDesc = hourShishen ? (HOUR_SHISHEN_ZINV[hourShishen] || `时柱十神为「${hourShishen}」，子女缘与性格可结合大运流年看，多陪伴、因材施教为佳。`) : '时柱为子女宫，可结合大运流年看添丁与子女发展，营造稳定家庭环境为佳。';
  block += `· 子女宫（时柱）为「${hourPillar || '—'}」${hourShishen ? `，十神为「${hourShishen}」。${zinvDesc}` : `，主子女、晚年与外在表现。${zinvDesc}`}\n`;
  const xiyongStr = b.xiyongshen?.replace(/[^木火土金水]/g, '') || '';
  const favSteps = b.dayun?.steps?.filter((s) => {
    const sa = s.startAge;
    return sa >= 24 && sa < 44 && getGanzhiWuxing(s.ganzhi) && xiyongStr.includes(getGanzhiWuxing(s.ganzhi)[0]!);
  }) || [];
  const favAges = favSteps.length ? favSteps.map((s) => `约${s.startAge}～${s.startAge + 10}岁`).join('、') : '约24～34岁、约34～44岁';
  block += `· 利生育与添丁：喜用大运与流年更利备孕、添丁，如${favAges}；忌神或冲克时柱的流年宜谨慎，可择期或遵医嘱。子女的多少与缘分在命盘中有一定体现，但现代人更多是主动规划，结合大运流年可作参考，不必强求。\n`;
  block += `· 与子女相处：时柱旺相、无严重冲克者，子女缘较顺；以身作则、多陪伴与沟通，根据子女性格（如上十神倾向）因材施教，避免一味施压或放任。子女的命盘自有其轨迹，父母能给予的是环境、陪伴与价值观，具体人生路仍由他们自己走。`;
  return block;
}

function buildBaseReading(b: BaziApiResult, level: BaziReadingLevel, gender: 'male' | 'female'): string {
  const detailed = level === 'long';
  const intro = describeFiveElements(b.wuxing, detailed, detailed ? b : undefined);
  const baseSections = [
    describeCore(b, gender, detailed),
    describeShenshaShishen(b),
    describeLifePath(b, detailed),
    describeCareerAndWealth(b, gender, detailed),
    describeEmotionAndFamily(b, gender, detailed),
    describeHealthAndStudy(b, detailed),
  ];
  const paidSections = [...baseSections, describeFengshuiAndName(b)];

  const sections = detailed ? paidSections : baseSections;
  return intro + sections.join('');
}

export function generateBaziReading(bazi: BaziApiResult, options: BaziReadingOptions = {}): string {
  const level = options.level || 'short';
  const gender = options.gender || 'male';
  const lang = options.language || 'zh-CN';
  if (lang === 'en') {
    // 简化：暂时仅提供中文版本
    return buildBaseReading(bazi, level, gender);
  }
  return buildBaseReading(bazi, level, gender);
}

