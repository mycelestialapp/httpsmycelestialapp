/**
 * 生命密码三角图：年月日三层，逐层相加归约（国内主流生命密码体系）
 */
import type { LifePathTriangle } from "@/lib/numerology";

interface LifePathTriangleChartProps {
  data: LifePathTriangle;
  className?: string;
}

export default function LifePathTriangleChart({ data, className = "" }: LifePathTriangleChartProps) {
  const [d, m, y] = data.row1;
  const [l, r] = data.row2;
  const [t] = data.row3;

  return (
    <div className={`flex flex-col items-center gap-0 ${className}`}>
      <p className="text-caption text-gray-400 mb-2">生命密码三角图 · 日→月→年</p>
      {/* 第三行：顶点 */}
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-gold/20 border-2 border-gold/50 flex items-center justify-center font-mono text-h4 font-bold text-gold">
          {t}
        </div>
      </div>
      {/* 第二行：两数 */}
      <div className="flex justify-center gap-8 mt-1">
        <div className="w-10 h-10 rounded-lg bg-white/10 border border-gold/30 flex items-center justify-center font-mono text-body font-bold text-gray-200">
          {l}
        </div>
        <div className="w-10 h-10 rounded-lg bg-white/10 border border-gold/30 flex items-center justify-center font-mono text-body font-bold text-gray-200">
          {r}
        </div>
      </div>
      {/* 第一行：日 月 年 */}
      <div className="flex justify-center gap-4 mt-1">
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center font-mono text-body-sm text-gray-400">
          {d}
        </div>
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center font-mono text-body-sm text-gray-400">
          {m}
        </div>
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center font-mono text-body-sm text-gray-400">
          {y}
        </div>
      </div>
      <p className="text-caption text-gray-500 mt-1">日 · 月 · 年（归约）</p>
    </div>
  );
}
