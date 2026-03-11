/**
 * 為 zh-Hant.json / en.json 的 oracle 區塊新增 cosmicTip8–1000 與 Set8–1000 佔位文案（複用 1–7）
 * 執行：node scripts/add-oracle-1000.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES = ['zh-Hant.json', 'en.json'];
const LOCALE_DIR = path.join(__dirname, '../src/i18n/locales');

function addOracle1000(localePath) {
  const raw = fs.readFileSync(localePath, 'utf8');
  const data = JSON.parse(raw);
  if (!data.oracle) {
    console.warn('No oracle in', localePath);
    return;
  }
  const o = data.oracle;

  const cosmicBases = [o.cosmicTip1, o.cosmicTip2, o.cosmicTip3, o.cosmicTip4, o.cosmicTip5, o.cosmicTip6, o.cosmicTip7];
  const themeBases = [o.seasonThemeHintSet1, o.seasonThemeHintSet2, o.seasonThemeHintSet3, o.seasonThemeHintSet4, o.seasonThemeHintSet5, o.seasonThemeHintSet6, o.seasonThemeHintSet7];
  const workBases = [o.workHintSet1, o.workHintSet2, o.workHintSet3, o.workHintSet4, o.workHintSet5, o.workHintSet6, o.workHintSet7];
  const loveBases = [o.loveHintSet1, o.loveHintSet2, o.loveHintSet3, o.loveHintSet4, o.loveHintSet5, o.loveHintSet6, o.loveHintSet7];
  const selfBases = [o.selfHintSet1, o.selfHintSet2, o.selfHintSet3, o.selfHintSet4, o.selfHintSet5, o.selfHintSet6, o.selfHintSet7];

  for (let k = 8; k <= 1000; k++) {
    const b = (k - 1) % 7;
    o[`cosmicTip${k}`] = cosmicBases[b];
    o[`seasonThemeHintSet${k}`] = themeBases[b];
    o[`workHintSet${k}`] = workBases[b];
    o[`loveHintSet${k}`] = loveBases[b];
    o[`selfHintSet${k}`] = selfBases[b];
  }

  fs.writeFileSync(localePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('OK', localePath);
}

LOCALES.forEach((name) => {
  const p = path.join(LOCALE_DIR, name);
  if (fs.existsSync(p)) addOracle1000(p);
});
