import { useMemo } from "react";

interface ResultCardProps {
  name: string;
  onReset: () => void;
}

const fortunes = [
  "万物皆有裂缝，那是光照进来的地方。",
  "你所等待之物，正在以你意想不到的方式靠近。",
  "命运的齿轮已经转动，顺流而行便是上策。",
  "黑暗中孕育着光明，低谷后必有高峰。",
  "看似偶然的相遇，实则是宇宙精心的安排。",
  "放下执念，方能得到真正想要的。",
  "风暴过后，彩虹会比以往更加绚烂。",
  "你的能量场正在与星辰共振，好事将至。",
  "过去已成定数，未来由你书写。",
  "内心的声音比任何占卜都要准确。",
];

const jixiong = ["大吉", "中吉", "小吉", "吉", "末吉"];
const yi = ["出行", "签约", "告白", "学习", "冥想", "社交", "投资", "创作", "运动", "搬迁"];
const ji = ["争吵", "熬夜", "冲动消费", "远行", "赌博", "借贷", "搬迁", "手术", "诉讼", "开业"];

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const ResultCard = ({ name, onReset }: ResultCardProps) => {
  const result = useMemo(() => ({
    fortune: fortunes[Math.floor(Math.random() * fortunes.length)],
    luck: jixiong[Math.floor(Math.random() * jixiong.length)],
    good: pick(yi, 3),
    bad: pick(ji, 3),
  }), []);

  return (
    <div className="animate-fade-in flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold neon-text-gold tracking-widest">
        ◈ 天机解语 ◈
      </h2>

      <div className="glass-card w-full text-center space-y-6">
        {/* Name & Luck */}
        <div>
          <p className="text-muted-foreground text-sm mb-1">问卦者</p>
          <p className="text-xl font-bold text-foreground">{name}</p>
        </div>

        <div className="flex justify-center">
          <span className="inline-block px-6 py-2 rounded-full text-2xl font-black neon-text-gold neon-border">
            {result.luck}
          </span>
        </div>

        {/* Fortune text */}
        <div className="border-t border-b border-border/30 py-4">
          <p className="text-foreground text-lg leading-relaxed italic">
            「{result.fortune}」
          </p>
        </div>

        {/* Yi & Ji */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="neon-text-gold font-bold mb-2 tracking-widest">▸ 宜</p>
            {result.good.map((item) => (
              <p key={item} className="text-foreground/80 py-0.5">{item}</p>
            ))}
          </div>
          <div>
            <p className="neon-text-purple font-bold mb-2 tracking-widest">▸ 忌</p>
            {result.bad.map((item) => (
              <p key={item} className="text-foreground/80 py-0.5">{item}</p>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="glass-card px-8 py-3 text-sm neon-text-purple tracking-widest hover:scale-105 transition-transform cursor-pointer"
      >
        再算一卦
      </button>
    </div>
  );
};

export default ResultCard;
