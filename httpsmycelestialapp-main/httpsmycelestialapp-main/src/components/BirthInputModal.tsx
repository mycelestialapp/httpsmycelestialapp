import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface BirthInputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (year: number, month: number, day: number) => void;
}

const years = Array.from({ length: 100 }, (_, i) => 2025 - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const BirthInputModal = ({ open, onClose, onSubmit }: BirthInputModalProps) => {
  const { t } = useTranslation();
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  if (!open) return null;

  const isValid = year && month && day;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(Number(year), Number(month), Number(day));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'hsla(var(--background) / 0.8)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card-highlight w-full max-w-sm animate-fade-in" style={{ animationDuration: '0.3s' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full transition-colors hover:bg-secondary/50"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-2xl mb-2">✦</div>
          <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
            {t('oracle.modalTitle')}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{t('oracle.modalSubtitle')}</p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="input-label">{t('divination.birthYear')}</label>
              <select className="glass-select" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">—</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">{t('divination.birthMonth')}</label>
              <select className="glass-select" value={month} onChange={(e) => setMonth(e.target.value)}>
                <option value="">—</option>
                {months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">{t('divination.birthDay')}</label>
              <select className="glass-select" value={day} onChange={(e) => setDay(e.target.value)}>
                <option value="">—</option>
                {days.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: isValid
                ? 'linear-gradient(135deg, hsla(var(--gold) / 0.3), hsla(var(--accent) / 0.2))'
                : 'hsla(var(--muted) / 0.3)',
              border: `1px solid ${isValid ? 'hsla(var(--gold) / 0.4)' : 'hsla(var(--border) / 0.3)'}`,
              color: isValid ? 'hsl(var(--gold))' : 'hsl(var(--muted-foreground))',
              fontFamily: 'var(--font-serif)',
              boxShadow: isValid ? '0 0 30px hsla(var(--gold) / 0.1)' : 'none',
            }}
          >
            {t('oracle.revealEnergy')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthInputModal;
