/**
 * 数字命理九宫格：1–9 宫位，高亮用户核心数（生命路径、命运数等）对应的数字
 */
import { useMemo } from "react";

function rootForGrid(n: number): number {
  if (n <= 9) return n;
  if (n === 11) return 2;
  if (n === 22) return 4;
  if (n === 33) return 6;
  return n % 9 || 9;
}

interface NumerologyNineGridProps {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  maturity: number;
  /** 可选：生日数、潜能数、人际数，用于连线与高亮 */
  birthday?: number;
  potential?: number;
  interpersonal?: number;
  className?: string;
}

export default function NumerologyNineGrid({
  lifePath,
  expression,
  soulUrge,
  personality,
  maturity,
  birthday,
  potential,
  interpersonal,
  className = "",
}: NumerologyNineGridProps) {
  const highlighted = useMemo(() => {
    const set = new Set<number>([
      rootForGrid(lifePath),
      rootForGrid(expression),
      rootForGrid(soulUrge),
      rootForGrid(personality),
      rootForGrid(maturity),
      ...(birthday != null ? [rootForGrid(birthday)] : []),
      ...(potential != null ? [rootForGrid(potential)] : []),
      ...(interpersonal != null ? [rootForGrid(interpersonal)] : []),
    ]);
    return set;
  }, [lifePath, expression, soulUrge, personality, maturity, birthday, potential, interpersonal]);

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-body-sm text-gray-400 text-center">九宫格 · 你的核心数分布</p>
      <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div
            key={n}
            className={`aspect-square rounded-xl flex items-center justify-center font-mono text-h4 font-bold transition-colors ${
              highlighted.has(n)
                ? "bg-gold/20 border border-gold/50 text-gold"
                : "bg-white/5 border border-white/10 text-gray-500"
            }`}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
