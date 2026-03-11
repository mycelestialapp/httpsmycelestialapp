/**
 * 每日一牌：日期種子固定一張塔羅 + 短解讀（占位，可後續接真實抽牌邏輯）
 */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layers, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DailyOneCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goldBorder = '1px solid hsla(var(--gold) / 0.45)';
  const goldText = 'hsl(var(--gold))';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl overflow-hidden border"
      style={{
        background: 'hsla(var(--card) / 0.85)',
        borderColor: 'hsla(var(--gold) / 0.35)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      }}
    >
      <button
        type="button"
        onClick={() => navigate('/oracle/reading?tool=tarot')}
        className="w-full text-left p-4 flex items-center gap-3 hover:opacity-95 active:scale-[0.99] transition-all rounded-2xl"
      >
        <div
          className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: 'hsla(var(--gold) / 0.12)',
            border: goldBorder,
          }}
        >
          <Layers size={22} style={{ color: goldText }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body font-semibold tracking-wide" style={{ fontFamily: 'var(--font-serif)', color: goldText }}>
            {t('oracle.dailyOneCard', { defaultValue: '每日一牌' })}
          </p>
          <p className="text-body-sm text-subtitle mt-0.5">
            {t('oracle.dailyOneCardHint', { defaultValue: '今日塔羅 · 點擊進入抽牌' })}
          </p>
        </div>
        <div className="flex items-center shrink-0" style={{ color: goldText }}>
          <ChevronRight size={18} />
        </div>
      </button>
    </motion.div>
  );
};

export default DailyOneCard;
