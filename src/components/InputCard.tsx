import { useState } from "react";

interface InputCardProps {
  name: string;
  setName: (v: string) => void;
  onDivine: () => void;
}

const InputCard = ({ name, setName, onDivine }: InputCardProps) => {
  const [birth, setBirth] = useState("");

  return (
    <div className="animate-fade-in flex flex-col items-center gap-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-black neon-text-gold tracking-widest mb-2">
          赛博占卜
        </h1>
        <p className="text-sm neon-text-purple tracking-[0.3em]">
          ── 窥探命运的数字回廊 ──
        </p>
      </div>

      {/* Glass Card */}
      <div className="glass-card w-full space-y-5">
        <div>
          <label className="block text-xs neon-text-gold mb-2 tracking-widest">
            ◈ 真名
          </label>
          <input
            type="text"
            className="glass-input"
            placeholder="请输入你的姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs neon-text-gold mb-2 tracking-widest">
            ◈ 生辰
          </label>
          <input
            type="date"
            className="glass-input"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
          />
        </div>
      </div>

      {/* Orb Button */}
      <button
        onClick={onDivine}
        disabled={!name.trim()}
        className="orb-button w-32 h-32 sm:w-36 sm:h-36 animate-float disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 rounded-full border border-primary/30 animate-spin-slow" />
        <div className="absolute inset-2 rounded-full border border-accent/20 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "5s" }} />
        <span className="neon-text-gold text-lg font-bold tracking-widest z-10">
          窥探天机
        </span>
      </button>

      <p className="text-xs text-muted-foreground animate-pulse-glow">
        触碰星球，连接星辰
      </p>
    </div>
  );
};

export default InputCard;
