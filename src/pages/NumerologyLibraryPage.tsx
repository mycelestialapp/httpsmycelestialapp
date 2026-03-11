/**
 * 数字图书馆：展示 1-9、11、22、33 的百科入口
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { numberInterpretations } from "@/lib/numerology";

export default function NumerologyLibraryPage() {
  const numbers = Object.keys(numberInterpretations)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-cosmic py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/numerology"
          className="inline-block mb-8 text-body-sm text-gray-400 hover:text-gold transition-colors"
        >
          ← 返回数字命理首页
        </Link>
        <h1 className="font-display text-h1 md:text-display-sm text-center text-gold mb-4">
          数字图书馆
        </h1>
        <p className="text-center text-body text-gray-400 mb-12">探索每个数字背后的宇宙奥秘</p>

        {numbers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">暂无数字解读数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {numbers.map((num) => {
            const interp = numberInterpretations[num];
            if (!interp) return null;
            return (
              <motion.div
                key={num}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition-all"
              >
                <div className="font-mono text-display-md font-bold text-gold mb-2">
                  {num}
                </div>
                <div className="font-display text-h4 text-gray-400 mb-1 line-clamp-1">{interp.title}</div>
                {interp.masterNote && (
                  <p className="text-gold/80 text-body-sm italic line-clamp-2 mb-1">「{interp.masterNote}」</p>
                )}
                <p className="text-gray-300 text-body-sm line-clamp-3">{interp.core}</p>
                <Link
                  to={`/numerology/library/${num}`}
                  className="mt-4 inline-block text-gold hover:underline text-body-sm"
                >
                  查看详情 →
                </Link>
              </motion.div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
