/**
 * 星圖首頁「今日一句」誘點卡：與下方兩按鈕同高同寬
 * 點擊進入 /oracle/cosmic
 */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

/** 三塊統一高度（與 OraclePage 兩按鈕一致） */
export const ORACLE_ENTRY_HEIGHT = 80;

const CosmicTeaserCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goldBorder = '1px solid hsla(var(--gold) / 0.45)';
  const goldText = 'hsl(var(--gold))';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-2xl flex items-center"
      style={{
        height: ORACLE_ENTRY_HEIGHT,
        background: 'hsla(var(--card) / 0.6)',
        border: goldBorder,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <button
        type="button"
        onClick={() => navigate('/oracle/cosmic')}
        className="w-full h-full text-left px-4 flex items-center gap-3 hover:opacity-95 active:scale-[0.99] transition-all rounded-2xl"
      >
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'hsla(var(--gold) / 0.12)',
            border: goldBorder,
          }}
        >
          <Sparkles size={20} style={{ color: goldText }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold tracking-wide truncate" style={{ fontFamily: 'var(--font-serif)', color: goldText }}>
            {t('oracle.teaserTitle', { defaultValue: '今日宇宙對你說了一句話' })}
          </p>
          <p className="text-[11px] text-subtitle truncate mt-0.5">
            {t('oracle.teaserSubtitle', { defaultValue: '只有你能解鎖 · 每日更新' })}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0" style={{ color: goldText }}>
          <span className="text-xs font-medium">{t('oracle.teaserCta', { defaultValue: '解鎖' })}</span>
          <ChevronRight size={16} />
        </div>
      </button>
    </motion.div>
  );
};

export default CosmicTeaserCard;
