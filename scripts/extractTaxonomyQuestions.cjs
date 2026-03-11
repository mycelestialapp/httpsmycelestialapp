/**
 * 从 questionTaxonomy.ts 的 QUESTION_TAXONOMY_MARKDOWN 中提取所有「核心问题」，
 * 按 13 大类分组，供合并到 questionQuickPick。
 * 运行：node scripts/extractTaxonomyQuestions.cjs
 */
const fs = require('fs');
const path = require('path');

const taxonomyPath = path.join(__dirname, '../src/lib/questionTaxonomy.ts');
const raw = fs.readFileSync(taxonomyPath, 'utf8');

// 取第一个反引号字符串（QUESTION_TAXONOMY_MARKDOWN）
const start = raw.indexOf('= `') + 3;
let end = start;
for (let i = start; i < raw.length; i++) {
  if (raw[i] === '`' && raw[i - 1] !== '\\') {
    end = i;
    break;
  }
}
const md = raw.slice(start, end);

const categoryHeaders = [
  '### 一、感情婚姻类',
  '### 二、事业工作类',
  '### 三、财运投资类',
  '### 四、学业考试类',
  '### 五、身体健康类',
  '### 六、人际关系类',
  '### 七、出行迁居类',
  '### 八、官司法律类',
  '### 九、生育子女类',
  '### 十、失物寻找类',
  '### 十一、选择决策类',
  '### 十二、代人问卜类',
  '### 十三、灵性成长类',
];

const categoryIds = [
  '感情婚姻',
  '事业工作',
  '财运投资',
  '学业考试',
  '身体健康',
  '人际关系',
  '出行迁居',
  '官司法律',
  '生育子女',
  '失物寻找',
  '选择决策',
  '代人问卜',
  '灵性成长',
];

const result = {};
categoryIds.forEach((id) => { result[id] = []; });

const stopMarker = '## 📌 占卜问题的基本原则';
const mdUntilStop = md.includes(stopMarker) ? md.slice(0, md.indexOf(stopMarker)) : md;

for (let i = 0; i < categoryHeaders.length; i++) {
  const header = categoryHeaders[i];
  const id = categoryIds[i];
  const startIdx = mdUntilStop.indexOf(header);
  if (startIdx === -1) continue;
  const nextHeader = categoryHeaders[i + 1];
  const endIdx = nextHeader ? mdUntilStop.indexOf(nextHeader, startIdx) : mdUntilStop.length;
  const block = mdUntilStop.slice(startIdx, endIdx);

  const rowRe = /^\|\s*([^|]+?)\s*\|\s*[^|]*/gm;
  let match;
  const seen = new Set();
  while ((match = rowRe.exec(block)) !== null) {
    const cell = match[1].trim();
    if (!cell || cell === '核心问题' || /^-+$/.test(cell)) continue;
    if (seen.has(cell)) continue;
    seen.add(cell);
    result[id].push(cell);
  }
}

let total = 0;
Object.entries(result).forEach(([id, list]) => {
  total += list.length;
  console.log(id, list.length);
});
console.log('Total core questions:', total);
fs.writeFileSync(
  path.join(__dirname, 'taxonomy-questions-by-category.json'),
  JSON.stringify(result, null, 2),
  'utf8'
);
console.log('Written taxonomy-questions-by-category.json');
