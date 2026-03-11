/**
 * 从 questionTaxonomy.ts 中所有 QUESTION_TAXONOMY_* 常数字符串里提取「问题」，
 * 支持：表格首列（| 问题 |）、数字列表（1. 问题？）、短横列表（- 问题？）
 * 按關鍵詞歸類到 17 大類，輸出合併後的 questionQuickPick 數據。
 * 運行：node scripts/extractAllTaxonomyQuestions.cjs
 */
const fs = require('fs');
const path = require('path');

const taxonomyPath = path.join(__dirname, '../src/lib/questionTaxonomy.ts');
const raw = fs.readFileSync(taxonomyPath, 'utf8');

// 找出所有 export const QUESTION_TAXONOMY_* = ` ... `;（逐段掃描，支持內容中含換行）
const blocks = [];
const exportPat = /export const (QUESTION_TAXONOMY_\w+) = `/g;
let match;
while ((match = exportPat.exec(raw)) !== null) {
  const name = match[1];
  let start = match.index + match[0].length;
  let end = start;
  let escaped = false;
  for (let i = start; i < raw.length; i++) {
    if (escaped) { escaped = false; continue; }
    if (raw[i] === '\\') { escaped = true; continue; }
    if (raw[i] === '`') { end = i; break; }
  }
  let content = raw.slice(start, end).replace(/\\`/g, '`');
  blocks.push({ name, content });
}
console.log('Found', blocks.length, 'taxonomy constants');

function extractQuestionsFromBlock(content) {
  const questions = new Set();
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    // 表格行：| 问题文字？ | xxx |
    const tableMatch = trimmed.match(/^\|\s*([^|]{5,120}?[？?]?)\s*\|/);
    if (tableMatch) {
      const q = tableMatch[1].trim();
      if (q && q !== '核心问题' && !/^[-–—]+$/.test(q) && !/^问题变体/.test(q) && !/^备注/.test(q)) {
        if (q.length >= 3 && q.length <= 150) questions.add(q);
      }
      continue;
    }
    // 数字列表：1. 问题？  或  1) 问题？
    const numMatch = trimmed.match(/^\d+[.)]\s*(.+)$/);
    if (numMatch) {
      const q = numMatch[1].trim();
      if ((q.includes('？') || q.includes('?')) && q.length >= 4 && q.length <= 180) {
        questions.add(q);
      }
      continue;
    }
    // 短横列表：- 问题？
    const bulletMatch = trimmed.match(/^-\s+(.+)$/);
    if (bulletMatch) {
      const q = bulletMatch[1].trim();
      if ((q.includes('？') || q.includes('?')) && q.length >= 4 && q.length <= 180) {
        questions.add(q);
      }
    }
  }
  return [...questions];
}

// 關鍵詞 → 大類 id（順序影響優先匹配，更具體的放前面）
const categoryRules = [
  { id: '占风水', keywords: ['风水', '阳宅', '阴宅', '祖坟', '煞气', '财位', '修方', '穴位', '龙脉', '朝向', '宅', '墓', '煞', '灶位'] },
  { id: '占梦境', keywords: ['梦', '梦境', '梦见', '夢'] },
  { id: '宠物', keywords: ['宠物', '狗', '猫', '毛孩子', '獸醫', '兽医', '動物', '动物', 'TA ', '牠'] },
  { id: '感情婚姻', keywords: ['感情', '婚姻', '恋爱', '结婚', '出轨', '复合', '表白', '伴侣', '出柜', '同志', 'LGBTQ', '多元关系', '伴侣关系', '亲密', '关系里', '这段关系', '对方', '前任', '脱单', '桃花', '正缘'] },
  { id: '事业工作', keywords: ['工作', '求职', '跳槽', '升职', '创业', '项目', '面试', 'offer', '职场', '同事', '老板', '裁员', '谋职', '升遷'] },
  { id: '财运投资', keywords: ['财运', '投资', '股票', '买房', '债务', '钱', '理财', '合伙', '加薪', '年终奖', '标会', '融资'] },
  { id: '学业考试', keywords: ['考试', '学业', '考研', '毕业', '论文', '留学', '录取', '升学', '复习', '导师'] },
  { id: '身体健康', keywords: ['病', '健康', '手术', '医生', '康复', '身体', '治疗', '药', '住院', '疾病', '痊愈'] },
  { id: '人际关系', keywords: ['人际', '贵人', '小人', '朋友', '同事', '上司', '误会', '和好', '得罪', '道歉'] },
  { id: '出行迁居', keywords: ['出行', '搬家', '移民', '旅行', '签证', '出差', '迁居', '留学', '出国'] },
  { id: '官司法律', keywords: ['官司', '法律', '律师', '诉讼', '纠纷'] },
  { id: '生育子女', keywords: ['怀孕', '孩子', '子女', '生育', '胎儿', '育儿'] },
  { id: '失物寻找', keywords: ['失物', '丢', '找', '寻回'] },
  { id: '选择决策', keywords: ['选哪个', '该不该', '要不要', '选择', '决策', '做这件事', '尝试'] },
  { id: '代人问卜', keywords: ['我姐', '我哥', '我朋友', '我家人', '我儿子', '我女儿', '姐夫', '岳父', '家人', '我太太'] },
  { id: '灵性成长', keywords: ['灵性', '灵魂', '业力', '脉轮', '成长', '课题', '高我', '疗愈', '内在', '自我', '情绪', '接纳', '恐惧', '安全感', '真实'] },
];

function categorize(question) {
  const q = question;
  for (const { id, keywords } of categoryRules) {
    if (keywords.some((k) => q.includes(k))) return id;
  }
  return '其他';
}

const allByCategory = {};
categoryRules.forEach((r) => { allByCategory[r.id] = new Set(); });
allByCategory['其他'] = new Set();

for (const { name, content } of blocks) {
  const questions = extractQuestionsFromBlock(content);
  for (const q of questions) {
    const cat = categorize(q);
    allByCategory[cat].add(q);
  }
}

// 過濾：至少含一個？或？，長度 5–180，排除「某某類」標題
function isRealQuestion(q) {
  if (!q || q.length < 5 || q.length > 180) return false;
  if (!q.includes('？') && !q.includes('?')) return false;
  if (/^[\d\s.、]+$/.test(q)) return false;
  if (/类$|^[\d.]+$/.test(q)) return false;
  if (q === '核心问题' || q === '问题变体') return false;
  return true;
}

const output = {};
const categoryOrder = categoryRules.map((r) => r.id).concat(['其他']);
for (const id of categoryOrder) {
  output[id] = [...allByCategory[id]]
    .filter(isRealQuestion)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

let total = 0;
Object.entries(output).forEach(([id, list]) => {
  total += list.length;
  console.log(id, list.length);
});
console.log('Total questions:', total);

const outPath = path.join(__dirname, 'all-taxonomy-questions-by-category.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log('Written', outPath);

// 生成 questionQuickPick.ts（與現有 17 類順序、label 一致）
const labels = {
  感情婚姻: '感情婚姻',
  事业工作: '事業工作',
  财运投资: '財運投資',
  学业考试: '學業考試',
  身体健康: '身體健康',
  宠物: '寵物',
  人际关系: '人際關係',
  出行迁居: '出行遷居',
  官司法律: '官司法律',
  生育子女: '生育子女',
  失物寻找: '失物尋找',
  选择决策: '選擇決策',
  占梦境: '占夢境',
  占风水: '占風水',
  代人问卜: '代人問卜',
  灵性成长: '靈性成長',
  其他: '其他／綜合',
};
const pickOrder = ['感情婚姻', '事业工作', '财运投资', '学业考试', '身体健康', '宠物', '人际关系', '出行迁居', '官司法律', '生育子女', '失物寻找', '选择决策', '占梦境', '占风水', '代人问卜', '灵性成长', '其他'];

function escapeTs(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
}

const tsLines = [
  '/**',
  ' * 快速選題：來自問題總表（questionTaxonomy）全部常數的提取結果，',
  ' * 已按大類歸類，供「選擇具體問題」入口與塔羅/神諭卡/雷諾曼使用。',
  ' */',
  '',
  'export interface QuickPickCategory {',
  '  id: string;',
  '  label: string;',
  '  labelEn?: string;',
  '  questions: string[];',
  '}',
  '',
  '/** 大類與問題來自總表全部 QUESTION_TAXONOMY_* 常數，已全部放入。 */',
  'export const QUESTION_QUICK_PICK: QuickPickCategory[] = [',
];

for (const id of pickOrder) {
  const list = output[id] || [];
  const label = labels[id] || id;
  tsLines.push('  {');
  tsLines.push(`    id: '${id}',`);
  tsLines.push(`    label: '${label}',`);
  tsLines.push('    questions: [');
  // 每行最多放 3 個問題，避免單行過長
  for (let i = 0; i < list.length; i += 3) {
    const chunk = list.slice(i, i + 3).map((q) => `'${escapeTs(q)}'`).join(', ');
    tsLines.push('      ' + chunk + (i + 3 < list.length ? ',' : ''));
  }
  tsLines.push('    ],');
  tsLines.push('  },');
}
tsLines.push('];');
tsLines.push('');
tsLines.push('/** 用於 UI 的「綜合 / 自由輸入」提示 */');
tsLines.push("export const QUICK_PICK_PLACEHOLDER = '例如：我最害怕失去的是什麼？';");

const tsPath = path.join(__dirname, '../src/lib/questionQuickPick.ts');
fs.writeFileSync(tsPath, tsLines.join('\n'), 'utf8');
console.log('Written', tsPath);
