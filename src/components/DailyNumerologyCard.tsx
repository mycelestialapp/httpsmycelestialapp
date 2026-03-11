/**
 * 今日数字 · 当日幸运数 / 幸运色 / 一句话建议
 */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Hash, ChevronRight } from 'lucide-react';
import { getDailyNumerologyNumber, numberInterpretations } from '@/lib/numerology';

const DailyNumerologyCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const today = new Date();
  const num = getDailyNumerologyNumber(today);
  const interp = numberInterpretations[num];

  return (
    <div
      className="rounded-2xl p-4 border overflow-hidden"
      style={{
        background: 'hsla(var(--card) / 0.85)',
        borderColor: 'hsla(var(--gold) / 0.35)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-lg"
            style={{
              background: 'hsla(var(--gold) / 0.15)',
              border: '1px solid hsla(var(--gold) / 0.4)',
              color: 'hsl(var(--gold))',
            }}
          >
            <Hash size={18} className="opacity-80" />
            <span className="ml-0.5">{num}</span>
          </div>
          <div>
            <p className="text-body font-semibold text-foreground">
              {t('numerology.todayNumber', { defaultValue: '今日数字' })} · {num}
            </p>
            <p className="text-body-sm text-muted-foreground">
              {interp?.color ? `${t('numerology.luckyColor', { defaultValue: '幸运色' })} ${interp.color}` : ''}
              {interp?.advice ? ` · ${interp.advice}` : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/numerology')}
          className="shrink-0 p-2 rounded-lg text-gold hover:bg-gold/10 transition-colors"
          aria-label={t('numerology.goNumerology', { defaultValue: '前往数字命理' })}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default DailyNumerologyCard;
