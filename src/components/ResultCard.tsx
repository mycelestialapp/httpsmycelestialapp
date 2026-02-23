import { useMemo } from "react";
import type { DivinationInfo } from "./InputCard";

interface ResultCardProps {
  info: DivinationInfo;
  onReset: () => void;
}

const fortunes = [
  "万物皆有裂缝，那是光照进来的地方。你正站在裂缝之上，拥抱即将涌入的光芒。",
  "你所等待之物，正在以你意想不到的方式靠近。耐心是通往答案的桥梁。",
  "命运的齿轮已经转动，顺流而行便是上策。逆水行舟只会消耗你的能量。",
  "黑暗中孕育着光明，低谷后必有高峰。此刻的沉默，是为了下一刻的惊雷。",
  "看似偶然的相遇，实则是宇宙精心的安排。留意身边每一个微小的信号。",
  "放下执念，方能得到真正想要的。松开紧握的手，才能接住新的礼物。",
  "风暴过后，彩虹会比以往更加绚烂。你即将穿越的风暴，是通往彩虹的必经之路。",
  "你的能量场正在与星辰共振，好事将至。保持当下的频率，不要被杂念干扰。",
  "过去已成定数，未来由你书写。每一个当下的选择，都在重塑你的命运之书。",
  "内心的声音比任何占卜都要准确。静下来，你已经知道答案。",
];

const jixiong = [
  { text: "大吉", color: "gold", desc: "诸事顺遂，万象更新" },
  { text: "中吉", color: "gold", desc: "稳中有进，前景光明" },
  { text: "小吉", color: "gold", desc: "谨慎行事，自有福报" },
  { text: "吉", color: "gold", desc: "平稳安泰，心想事成" },
  { text: "末吉", color: "purple", desc: "先难后易，终有转机" },
  { text: "凶转吉", color: "purple", desc: "逢凶化吉，否极泰来" },
];

const yi = ["出行", "签约", "告白", "学习", "冥想", "社交", "投资", "创作", "运动", "搬迁", "祈福", "会友", "读书", "规划"];
const ji = ["争吵", "熬夜", "冲动消费", "远行", "赌博", "借贷", "手术", "诉讼", "开业", "动土", "酗酒", "妄言"];

const elements = ["金", "木", "水", "火", "土"];
const constellations = ["紫微", "天机", "太阳", "武曲", "天同", "廉贞", "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军"];

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const ResultCard = ({ info, onReset }: ResultCardProps) => {
  const result = useMemo(() => ({
    fortune: fortunes[Math.floor(Math.random() * fortunes.length)],
    luck: jixiong[Math.floor(Math.random() * jixiong.length)],
    good: pick(yi, 4),
    bad: pick(ji, 4),
    element: elements[Math.floor(Math.random() * elements.length)],
    star: constellations[Math.floor(Math.random() * constellations.length)],
    score: Math.floor(Math.random() * 30) + 70,
  }), []);

  const birthStr = `${info.year}年${info.month}月${info.day}日`;

  return (
    <div className="animate-fade-in flex flex-col items-center gap-5">
      {/* Header */}
      <div className="relative text-center">
        <div className="absolute -inset-10 rounded-full bg-accent/5 blur-3xl" />
        <div className="relative">
          <div className="text-xs neon-text-purple tracking-[0.5em] mb-2">
            ━━ DIVINATION RESULT ━━
          </div>
          <h2 className="text-3xl font-black neon-text-gold tracking-widest">
            ◈ 天机解语 ◈
          </h2>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-card w-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full orb-button flex-shrink-0 flex items-center justify-center text-xl neon-text-gold font-black">
            {info.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-foreground truncate">{info.name}</p>
            <p className="text-xs text-muted-foreground">{birthStr} {info.hour && `· ${info.hour.split(" ")[0]}`}</p>
            <p className="text-xs text-muted-foreground">
              {info.region && `${info.region} · `}{info.useSolarTime ? "真太阳时" : "标准时"}
            </p>
          </div>
        </div>

        {/* Luck Badge */}
        <div className="flex justify-center my-4">
          <div className={`luck-badge ${result.luck.color === "gold" ? "luck-gold" : "luck-purple"}`}>
            <span className="text-3xl font-black tracking-widest">{result.luck.text}</span>
            <span className="text-xs mt-1 opacity-80">{result.luck.desc}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="stat-cell">
            <span className="stat-label">命主星</span>
            <span className="stat-value neon-text-gold">{result.star}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">五行属</span>
            <span className="stat-value neon-text-purple">{result.element}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">运势值</span>
            <span className="stat-value neon-text-gold">{result.score}</span>
          </div>
        </div>
      </div>

      {/* Fortune Text */}
      <div className="glass-card w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-primary">✦</span>
          <span className="text-xs neon-text-gold tracking-[0.3em] font-bold">天机谕示</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
        </div>
        <p className="text-foreground leading-relaxed text-center text-sm sm:text-base py-2">
          「{result.fortune}」
        </p>
      </div>

      {/* Yi & Ji */}
      <div className="glass-card w-full">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-primary">▸</span>
              <span className="text-xs neon-text-gold tracking-[0.3em] font-bold">今日宜</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.good.map((item) => (
                <span key={item} className="yi-tag">{item}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-accent">▸</span>
              <span className="text-xs neon-text-purple tracking-[0.3em] font-bold">今日忌</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.bad.map((item) => (
                <span key={item} className="ji-tag">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="glass-card px-8 py-3 text-sm neon-text-purple tracking-widest hover:scale-105 transition-transform cursor-pointer mt-2 mb-4"
      >
        ◈ 再算一卦 ◈
      </button>
    </div>
  );
};

export default ResultCard;
