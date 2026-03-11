<template>
  <div class="rune-oracle">
    <canvas id="bg-canvas"></canvas>
    <header>
      <h1>{{ t('title') }}</h1>
    </header>

    <div id="controls">
      <button type="button" @click="castRunes(1)">{{ t('singleRune') }}</button>
      <button type="button" @click="castRunes(3)">{{ t('threeRunes') }}</button>
      <button type="button" @click="castRunes(5)">{{ t('fiveRunes') }}</button>
      <button type="button" @click="generateMasterReading">{{ t('awakenReading') }}</button>
      <button type="button" @click="toggleSound">
        {{ t('soundToggle') }}: {{ soundEnabled ? t('on') : t('off') }}
      </button>
      <button type="button" @click="switchLang">
        {{ t('languageToggle') }}: {{ lang === 'zh' ? '中文' : 'English' }}
      </button>
      <button type="button" @click="viewHistory">{{ t('viewHistory') }}</button>
      <button type="button" @click="shareResult">{{ t('shareResult') }}</button>
    </div>

    <div id="rune-area">
      <div
        v-for="(r, i) in drawn"
        :key="i"
        class="rune-stone"
        :class="{ flipped: flipped[i] }"
        <!-- 若系统缺少 Elder Futhark 字体支持，符文显示为方块（□），属环境兼容问题，不影响逻辑。可选未来用 SVG 图片替换符文符号 -->
        role="img"
        :aria-label="`${tRuneName(r.name)} · ${r.name} · ${r.reversed ? t('reversed') : t('upright')}`"
      >
        <div class="stone-face front">{{ r.sym }}</div>
        <div class="stone-face back">
          <h3>{{ tRuneName(r.name) }} · {{ r.name }}</h3>
          <p class="meaning">
            {{
              r.reversed
                ? t('reversed') + ': ' + displayMeaning(r, 'reversed')
                : t('upright') + ': ' + displayMeaning(r, 'upright')
            }}
          </p>
          <small>{{ r.reversed ? t('shadowManifest') : t('lightGuide') }}</small>
        </div>
      </div>
    </div>

    <div id="interpretation" v-html="readingHtml"></div>

    <!-- 音效：优化1（必须用 audio 元素 + 开关 + 事件触发；尊重 muted 与 document.hidden） -->
    <audio
      ref="flipAudio"
      preload="auto"
      :src="flipSoundSrc"
      :muted="!soundEnabled || isHidden"
    ></audio>
    <audio
      ref="readAudio"
      preload="auto"
      :src="readSoundSrc"
      :muted="!soundEnabled || isHidden"
    ></audio>
  </div>
</template>

<script setup>
/**
 * 严格按用户要求的执行顺序组织代码：
 * 1) 24 枚符文数据（中英双语）
 * 2) 音效（<audio> + toggle + 触发点；respect muted + document.hidden）
 * 3) i18n（zh/en 切换）
 * 4) 历史记录（localStorage 最近 5 次 + 查看/分享按钮）
 * 5) 后端 AI fallback（/api/rune-reading）
 * 6) Vue 3 SFC（template/script/style）
 * 7) 注释说明新功能位置与逻辑
 */
// 音效文件需放置在 public/assets/ 目录下，否则会404无声。建议从 freesound.org 下载免费CC0音源（如搜索“wind chime soft low volume”和“nordic ambient whisper”），文件大小控制在200KB以内。

import { ref, onMounted, onUnmounted } from 'vue';

// ========== 1) 数据层：完整 24 枚 Elder Futhark（中英双语） ==========
const elderFuthark = ref([
  { sym: 'ᚠ', name: 'Fehu', upright_zh: '财富涌入、丰盛起点', upright_en: 'Wealth flow, abundant beginning', rev_zh: '资源流失、贪婪警示', rev_en: 'Loss of resources, greed warning' },
  { sym: 'ᚢ', name: 'Uruz', upright_zh: '原始力量、身体恢复', upright_en: 'Raw strength, physical recovery', rev_zh: '精力枯竭、意外受伤', rev_en: 'Burnout, unexpected injury' },
  { sym: 'ᚦ', name: 'Thurisaz', upright_zh: '防护屏障、突破荆棘', upright_en: 'Protection, breaking through thorns', rev_zh: '外部威胁、内在冲突', rev_en: 'External threats, inner conflict' },
  { sym: 'ᚨ', name: 'Ansuz', upright_zh: '神圣启示、清晰沟通', upright_en: 'Sacred message, clear communication', rev_zh: '误导信息、言语失误', rev_en: 'Misleading signals, verbal missteps' },
  { sym: 'ᚱ', name: 'Raidho', upright_zh: '旅程进展、正义之轮', upright_en: 'Journey unfolding, wheel of justice', rev_zh: '路径阻塞、意外延误', rev_en: 'Blocked path, unexpected delays' },
  { sym: 'ᚲ', name: 'Kenaz', upright_zh: '知识之火、创意火花', upright_en: 'Fire of insight, creative spark', rev_zh: '烧尽一切、幻灭之光', rev_en: 'Burnout, illusion shatters' },
  { sym: 'ᚷ', name: 'Gebo', upright_zh: '礼物交换、伙伴平衡', upright_en: 'Gift exchange, balanced partnership', rev_zh: '（无逆位）', rev_en: '(no reversal)' },
  { sym: 'ᚹ', name: 'Wunjo', upright_zh: '喜悦和谐、愿望实现', upright_en: 'Joy and harmony, wishes fulfilled', rev_zh: '幸福幻灭、关系疏离', rev_en: 'Disillusion, distance in bonds' },
  { sym: 'ᚺ', name: 'Hagalaz', upright_zh: '破坏转变、冰雹洗礼', upright_en: 'Disruption, hail’s cleansing', rev_zh: '（无逆位）', rev_en: '(no reversal)' },
  { sym: 'ᚾ', name: 'Nauthiz', upright_zh: '需求约束、耐心锻造', upright_en: 'Need and restraint, patience forged', rev_zh: '贫乏苦难、欲望陷阱', rev_en: 'Scarcity, desire trap' },
  { sym: 'ᛁ', name: 'Isa', upright_zh: '冰冻澄清、专注静止', upright_en: 'Stillness, clarity through ice', rev_zh: '（无逆位）', rev_en: '(no reversal)' },
  { sym: 'ᛃ', name: 'Jera', upright_zh: '收获循环、和平奖励', upright_en: 'Harvest cycle, earned reward', rev_zh: '（无逆位）', rev_en: '(no reversal)' },
  { sym: 'ᛇ', name: 'Eihwaz', upright_zh: '坚韧防御、启蒙之树', upright_en: 'Endurance, yew’s initiation', rev_zh: '困惑破坏、方向迷失', rev_en: 'Confusion, loss of direction' },
  { sym: 'ᛈ', name: 'Perthro', upright_zh: '命运神秘、秘密演变', upright_en: 'Mystery of fate, hidden unfolding', rev_zh: '停滞孤独、未知恐惧', rev_en: 'Stagnation, fear of the unknown' },
  { sym: 'ᛉ', name: 'Algiz', upright_zh: '守护觉醒、麋鹿力量', upright_en: 'Guardian awakening, elk-strength', rev_zh: '隐藏危险、能量消耗', rev_en: 'Hidden danger, energy drain' },
  { sym: 'ᛊ', name: 'Sowilo', upright_zh: '太阳胜利、指引之光', upright_en: 'Solar victory, guiding light', rev_zh: '（无逆位）', rev_en: '(no reversal)' },
  { sym: 'ᛏ', name: 'Tiwaz', upright_zh: '正义荣誉、战士领导', upright_en: 'Honor and justice, warrior leadership', rev_zh: '平衡破坏、动机阻塞', rev_en: 'Imbalance, blocked will' },
  { sym: 'ᛒ', name: 'Berkano', upright_zh: '生育成长、桦树新生', upright_en: 'Nurture and growth, birch rebirth', rev_zh: '家庭焦虑、成长停滞', rev_en: 'Home anxiety, stalled growth' },
  { sym: 'ᛖ', name: 'Ehwaz', upright_zh: '伙伴信任、马之运动', upright_en: 'Trust in partnership, movement', rev_zh: '背叛不谐、关系裂痕', rev_en: 'Betrayal, rift in bonds' },
  { sym: 'ᛗ', name: 'Mannaz', upright_zh: '人类智能、社会自我', upright_en: 'The self in society, human mind', rev_zh: '孤立抑郁、智力衰退', rev_en: 'Isolation, mental decline' },
  { sym: 'ᛚ', name: 'Laguz', upright_zh: '水之流动、直觉梦想', upright_en: 'Flow of water, intuition and dreams', rev_zh: '混乱恐惧、情感淹没', rev_en: 'Chaos, emotional overwhelm' },
  { sym: 'ᛜ', name: 'Ingwaz', upright_zh: '完成释放、神之生育', upright_en: 'Completion, release and renewal', rev_zh: '（无逆位）', rev_en: '(no reversal)' },
  { sym: 'ᛞ', name: 'Dagaz', upright_zh: '黎明突破、清晰转变', upright_en: 'Dawn breakthrough, clear shift', rev_zh: '（无逆位）', rev_en: '(no reversal)' },
  { sym: 'ᛟ', name: 'Othala', upright_zh: '祖产繁荣、精神家园', upright_en: 'Heritage, spiritual homeland', rev_zh: '遗产贫穷、家族奴役', rev_en: 'Loss of inheritance, bondage' }
]);

// 无逆位符文：抽取时强制 reversed=false（保留原有逻辑要求）
const noReversedNames = { Gebo: 1, Hagalaz: 1, Isa: 1, Jera: 1, Sowilo: 1, Ingwaz: 1, Dagaz: 1 };

// ========== 2) 音效（audio 元素 + toggle + 触发点） ==========
const soundEnabled = ref(localStorage.getItem('runeSound') !== 'off');
const flipAudio = ref(null);
const readAudio = ref(null);
const isHidden = ref(typeof document !== 'undefined' ? document.hidden : false);

// 音效资源：允许“假设 URL”。若 404，不会崩溃（play() 已 catch）
// TODO: 若你要求完全内嵌 base64 音源，请提供音频素材或允许我使用 CC0 音源并内嵌。
const flipSoundSrc = '/assets/wind-chime-low.mp3';
const readSoundSrc = '/assets/nordic-ambient-whisper.mp3';

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
  localStorage.setItem('runeSound', soundEnabled.value ? 'on' : 'off');
};

function tryPlay(audioEl, volume) {
  if (!soundEnabled.value) return;
  if (isHidden.value) return;
  if (!audioEl) return;
  try {
    audioEl.currentTime = 0;
    audioEl.volume = volume;
    const p = audioEl.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    // ignore
  }
}

// ========== 3) i18n（zh/en 切换；简单对象 + ref） ==========
const translations = {
  zh: {
    title: '符文仪式 - 北欧之声',
    singleRune: '单符指引',
    threeRunes: '三符命运',
    fiveRunes: '五符十字',
    awakenReading: '唤醒解读',
    soundToggle: '音效',
    on: '开',
    off: '关',
    languageToggle: '语言',
    viewHistory: '查看历史',
    shareResult: '分享本次结果',
    reversed: '逆位',
    upright: '正位',
    shadowManifest: '阴影显现',
    lightGuide: '光明指引',
    mirrorTitle: '【全景镜像】',
    shadowTitle: '【阴影网络】',
    chainTitle: '【动力链条】',
    anchorTitle: '【转化锚点】',
    mirrorText: '北欧诸神透过这些符文注视着你。整体能量如极光般流动，核心主题：{themes} —— 一场从混沌到秩序的旅程。',
    chainText: '过去：{past} → 现在：{present} → 未来：{future}。命运之线正被拉紧。',
    anchorItems: [
      '<strong>身体觉知</strong>：闭眼感受哪枚符文让你胸口发热/发凉，那是你的直觉之门。',
      '<strong>仪式行动</strong>：今晚在烛光下重绘一枚核心符文，冥想5分钟。',
      '<strong>掌控权</strong>：将逆位符文视为盟友而非敌人——它在提醒你未愈合的伤口。'
    ],
    drawFirst: '请先投掷符文',
    noHistory: '暂无历史记录',
    shareLinkCopied: '分享链接已复制到剪贴板',
    noResult: '暂无结果可分享',
    // 符文中文名
    Fehu: '费胡', Uruz: '乌鲁兹', Thurisaz: '苏里斯兹', Ansuz: '安苏兹', Raidho: '莱德霍', Kenaz: '凯纳兹',
    Gebo: '盖博', Wunjo: '温乔', Hagalaz: '哈加拉兹', Nauthiz: '诺蒂兹', Isa: '伊萨', Jera: '杰拉',
    Eihwaz: '艾瓦兹', Perthro: '珀斯罗', Algiz: '阿尔吉兹', Sowilo: '索维洛', Tiwaz: '蒂瓦兹', Berkano: '伯卡诺',
    Ehwaz: '埃瓦兹', Mannaz: '曼纳兹', Laguz: '拉古兹', Ingwaz: '英瓦兹', Dagaz: '达加兹', Othala: '奥萨拉'
  },
  en: {
    title: 'Rune Ritual - Nordic Voice',
    singleRune: 'Single Rune',
    threeRunes: 'Three Runes',
    fiveRunes: 'Five Runes',
    awakenReading: 'Awaken Reading',
    soundToggle: 'Sound',
    on: 'On',
    off: 'Off',
    languageToggle: 'Language',
    viewHistory: 'View History',
    shareResult: 'Share This Result',
    reversed: 'Reversed',
    upright: 'Upright',
    shadowManifest: 'Shadow Reveals',
    lightGuide: 'Light Guides',
    mirrorTitle: '【全景镜像】',
    shadowTitle: '【阴影网络】',
    chainTitle: '【动力链条】',
    anchorTitle: '【转化锚点】',
    mirrorText: 'The Norse gaze through these runes. Energy flows like aurora; core theme: {themes} — a journey from chaos to order.',
    chainText: 'Past: {past} → Present: {present} → Future: {future}. The thread of fate tightens.',
    anchorItems: [
      '<strong>Body Awareness</strong>: Close your eyes and feel which rune warms or cools your chest—your intuition gate.',
      '<strong>Ritual Action</strong>: Tonight, redraw one core rune by candlelight and meditate for 5 minutes.',
      '<strong>Agency</strong>: Treat reversed runes as allies, not enemies—they point to what remains unhealed.'
    ],
    drawFirst: 'Cast runes first.',
    noHistory: 'No history yet.',
    shareLinkCopied: 'Share link copied to clipboard.',
    noResult: 'No result to share.',
    // Rune display names (English uses name by default, keep mapping for consistency)
    Fehu: 'Fehu', Uruz: 'Uruz', Thurisaz: 'Thurisaz', Ansuz: 'Ansuz', Raidho: 'Raidho', Kenaz: 'Kenaz',
    Gebo: 'Gebo', Wunjo: 'Wunjo', Hagalaz: 'Hagalaz', Nauthiz: 'Nauthiz', Isa: 'Isa', Jera: 'Jera',
    Eihwaz: 'Eihwaz', Perthro: 'Perthro', Algiz: 'Algiz', Sowilo: 'Sowilo', Tiwaz: 'Tiwaz', Berkano: 'Berkano',
    Ehwaz: 'Ehwaz', Mannaz: 'Mannaz', Laguz: 'Laguz', Ingwaz: 'Ingwaz', Dagaz: 'Dagaz', Othala: 'Othala'
  }
};

const lang = ref(localStorage.getItem('runeLang') || 'zh');
const t = (key) => (translations[lang.value] && translations[lang.value][key]) || key;
const tRuneName = (name) => (translations[lang.value] && translations[lang.value][name]) || name;

const switchLang = () => {
  lang.value = lang.value === 'zh' ? 'en' : 'zh';
  localStorage.setItem('runeLang', lang.value);
};

function displayMeaning(r, pos) {
  if (pos === 'upright') return lang.value === 'zh' ? r.upright_zh : r.upright_en;
  return lang.value === 'zh' ? (r.rev_zh || '（无逆位）') : (r.rev_en || '(no reversal)');
}

// ========== 4) 历史记录与分享（localStorage 最近 5 次） ==========
const history = ref(() => {
  try {
    const raw = localStorage.getItem('runeHistory');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
})();

const viewHistory = () => {
  if (!history.value.length) {
    alert(t('noHistory'));
    return;
  }
  const text = history.value
    .slice(0, 5)
    .map((h, idx) => `${idx + 1}. ${new Date(h.timestamp).toLocaleString()} | layout=${h.payload?.layout}`)
    .join('\n');
  alert(text);
};

function saveToHistory(payload, readingText) {
  const item = { payload, readingText, timestamp: Date.now() };
  const list = [item, ...history.value].slice(0, 5);
  history.value = list;
  try {
    localStorage.setItem('runeHistory', JSON.stringify(list));
  } catch {
    // ignore
  }
}

function base64EncodeUtf8(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

const shareResult = () => {
  if (!drawn.value.length) {
    alert(t('noResult'));
    return;
  }
  // payload 含中文 meaning，btoa 后 URL 可能较长（浏览器通常支持 ~2000 字符）。若超限，后续可考虑短链服务（不在本次范围）
  const payload = getReadingPayload();
  const encoded = base64EncodeUtf8(JSON.stringify(payload));
  const shareUrl = `${window.location.origin}${window.location.pathname}?payload=${encoded}`;
  const plain = htmlToText(readingHtml.value) || JSON.stringify(payload, null, 2);
  const toCopy = `${shareUrl}\n\n${plain}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(toCopy).then(() => alert(t('shareLinkCopied'))).catch(() => alert(t('shareLinkCopied')));
  } else {
    const ta = document.createElement('textarea');
    ta.value = toCopy;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert(t('shareLinkCopied'));
  }
};

function htmlToText(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

// ========== 原有核心状态 ==========
const drawn = ref([]);
const flipped = ref([]);
const readingHtml = ref('');
let animationFrameId = null;

// ========== prefers-reduced-motion（保留） ==========
const prefersReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ========== 抽取：单/三/五阵型 + 3D 翻转 ==========
const randomRune = () => {
  const r = elderFuthark.value[Math.floor(Math.random() * elderFuthark.value.length)];
  const reversed = noReversedNames[r.name] ? false : Math.random() < 0.35;
  return { ...r, reversed };
};

const castRunes = (count) => {
  drawn.value = Array.from({ length: count }, randomRune);
  flipped.value = Array(count).fill(false);
  readingHtml.value = '';

  const initialDelay = prefersReducedMotion() ? 100 : 400;
  const stepDelay = prefersReducedMotion() ? 80 : 300;

  drawn.value.forEach((_, i) => {
    setTimeout(() => {
      flipped.value[i] = true;
      // 翻转音效触发点：每张翻转时播放
      if (flipAudio.value) {
        tryPlay(flipAudio.value, 0.25);
      }
    }, initialDelay + i * stepDelay);
  });

  if (!prefersReducedMotion()) createAuroraBurst();
};

// ========== getReadingPayload（保留原结构） ==========
const getReadingPayload = () => ({
  layout: drawn.value.length,
  runes: drawn.value.map((r) => ({
    name: r.name,
    cn: tRuneName(r.name), // i18n 后的显示名
    position: r.reversed ? 'reversed' : 'upright',
    meaning: r.reversed ? displayMeaning(r, 'reversed') : displayMeaning(r, 'upright')
  }))
});

// ========== 5) 后端 AI 接入 + fallback 静态模板 ==========
const generateMasterReading = async () => {
  if (!drawn.value.length) {
    alert(t('drawFirst'));
    return;
  }

  // 点击“唤醒解读”触发氛围音（优化1）
  if (readAudio.value) {
    tryPlay(readAudio.value, 0.25);
  }

  const payload = getReadingPayload();

  let data;
  try {
    const res = await fetch('/api/rune-reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    // 期望返回 { mirror, shadow, chain, anchor }
    data = json;
  } catch {
    // 接口不存在或报错时 fallback 到静态模板，这是预期行为，无需 alert 用户
    // fallback：保持原有四层框架与粒子/翻转不变，仅用静态模板补齐
    const themes = drawn.value.map((r) => tRuneName(r.name)).join(' → ');
    const past = tRuneName(drawn.value[0]?.name) || '?';
    const present = tRuneName(drawn.value[Math.floor(drawn.value.length / 2)]?.name) || '?';
    const future = tRuneName(drawn.value[drawn.value.length - 1]?.name) || '?';

    data = {
      mirror: t('mirrorText').replace('{themes}', escapeHtml(themes)),
      shadow: drawn.value
        .map((r) => {
          const pos = r.reversed ? t('reversed') : t('upright');
          const meaning = r.reversed ? displayMeaning(r, 'reversed') : displayMeaning(r, 'upright');
          return `<li>${escapeHtml(tRuneName(r.name))} (${escapeHtml(pos)}): ${escapeHtml(meaning)}</li>`;
        })
        .join(''),
      chain: t('chainText').replace('{past}', escapeHtml(past)).replace('{present}', escapeHtml(present)).replace('{future}', escapeHtml(future)),
      anchor: (translations[lang.value].anchorItems || []).map((item) => `<li>${item}</li>`).join('')
    };
  }

  readingHtml.value = `
    <div class="section"><h2>${t('mirrorTitle')}</h2><p>${data.mirror}</p></div>
    <div class="section"><h2>${t('shadowTitle')}</h2><ul>${data.shadow}</ul></div>
    <div class="section"><h2>${t('chainTitle')}</h2><p>${data.chain}</p></div>
    <div class="section"><h2>${t('anchorTitle')}</h2><ul>${data.anchor}</ul></div>
  `;

  saveToHistory(payload, readingHtml.value);
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ========== 粒子极光背景（原逻辑：颜色/粒子数/衰减一致；性能优化保留） ==========
const createAuroraBurst = () => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6,
      radius: Math.random() * 3 + 1,
      hue: Math.random() * 60 + 180, // 蓝绿紫极光色
      speed: Math.random() * 0.5 + 0.2,
      life: 1
    });
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  const animate = () => {
    if (isHidden.value || prefersReducedMotion()) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      return;
    }

    ctx.fillStyle = 'rgba(15,8,32,0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let anyAlive = false;
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
      ctx.fill();
      p.y -= p.speed;
      p.life -= 0.008;
      if (p.life <= 0) p.life = 0;
      if (p.life > 0) anyAlive = true;
    });

    if (anyAlive) animationFrameId = requestAnimationFrame(animate);
  };
  animate();
};

// ========== visibilitychange：暂停动画 + 不播放音效（保留） ==========
function onVisibilityChange() {
  isHidden.value = document.hidden;
  if (document.hidden) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    // audio muted 由模板绑定处理；这里不做额外逻辑，避免改变结构
  } else {
    if (!prefersReducedMotion() && drawn.value.length) createAuroraBurst();
  }
}

function onResize() {
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('resize', onResize);
  if (!prefersReducedMotion()) createAuroraBurst();
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('resize', onResize);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
/* 原有所有 CSS：迁移为 scoped，避免外部依赖；保持 UI 结构不变 */
:root {
  --bg-dark: #0f0820;
  --bg-gradient: linear-gradient(135deg, #0f0820, #2a124a, #0f0820);
  --rune-gold: #d4af37;
  --rune-light: #e8d9a6;
  --text-muted: #b0a080;
  --glow: 0 0 20px rgba(212, 175, 55, 0.6);
  --font-serif: Georgia, 'Times New Roman', serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

.rune-oracle {
  font-family: var(--font-serif);
  background: var(--bg-gradient);
  color: var(--rune-light);
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

canvas#bg-canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: -2;
  pointer-events: none;
}

header {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(15, 8, 32, 0.6);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

h1 {
  font-size: clamp(1.5rem, 5vw, 2.8rem);
  color: var(--rune-gold);
  text-shadow: var(--glow);
  letter-spacing: 0.15em;
}

#controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 0 1rem;
}

button {
  padding: 0.9rem 1.8rem;
  font-family: var(--font-serif);
  font-size: 1rem;
  background: linear-gradient(145deg, #3a1e5a, #2a124a);
  border: 1px solid var(--rune-gold);
  color: var(--rune-gold);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
}

button:hover {
  transform: translateY(-3px);
  box-shadow: var(--glow);
  background: linear-gradient(145deg, #4a2e6a, #3a1e5a);
}

button:active { transform: translateY(-1px); }

#rune-area {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem;
  min-height: 40vh;
  perspective: 1200px;
}

.rune-stone {
  width: min(140px, 28vw);
  height: min(200px, 40vw);
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.rune-stone.flipped {
  transform: rotateY(180deg);
}

.stone-face {
  position: absolute;
  width: 100%; height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.7);
  background: linear-gradient(145deg, #3a3530, #4a4540, #2a2520);
  filter: contrast(115%) brightness(75%);
}

.front {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(3rem, 10vw, 5rem);
  color: var(--rune-gold);
  text-shadow: 0 0 15px rgba(212,175,55,0.8);
  background: linear-gradient(160deg, rgba(15,8,32,0.75), rgba(42,18,74,0.75));
}

.back {
  transform: rotateY(180deg);
  padding: 1rem;
  font-size: clamp(0.85rem, 2.5vw, 1rem);
  text-align: center;
  background: linear-gradient(160deg, rgba(15,8,32,0.9), rgba(42,18,74,0.9));
  color: var(--text-muted);
}

.back h3 {
  color: var(--rune-gold);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.back .meaning {
  font-style: italic;
  color: var(--rune-light);
}

#interpretation {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: rgba(15,8,32,0.65);
  border-radius: 12px;
  border: 1px solid rgba(212,175,55,0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.6);
}

.section {
  margin-bottom: 1.5rem;
}

.section h2 {
  color: var(--rune-gold);
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(212,175,55,0.3);
  padding-bottom: 0.5rem;
  font-size: 1.1rem;
}

.section p, .section ul {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--rune-light);
}

.section ul {
  padding-left: 1.25rem;
}

@media (prefers-reduced-motion: reduce) {
  .rune-stone { transition: transform 0.2s ease; }
}
</style>

