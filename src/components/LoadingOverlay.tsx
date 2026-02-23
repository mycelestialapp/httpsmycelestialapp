import { useTranslation } from "react-i18next";

const LoadingOverlay = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'hsla(var(--background) / 0.95)', backdropFilter: 'blur(20px)' }}>
      <div className="relative w-48 h-48 mb-10">
        <div className="absolute inset-0 rounded-full animate-spin-slow flex items-center justify-center" style={{ border: '2px solid hsla(var(--gold) / 0.3)' }}>
          {["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"].map((symbol, i) => (
            <span
              key={i}
              className="absolute text-lg"
              style={{
                color: 'hsla(var(--gold) / 0.5)',
                transform: `rotate(${i * 45}deg) translateY(-90px) rotate(-${i * 45}deg)`,
              }}
            >
              {symbol}
            </span>
          ))}
        </div>

        <div
          className="absolute inset-6 rounded-full animate-spin-slow"
          style={{ border: '1px solid hsla(var(--accent) / 0.25)', animationDirection: 'reverse', animationDuration: '2s' }}
        />
        <div
          className="absolute inset-12 rounded-full animate-spin-slow"
          style={{ border: '1px solid hsla(var(--gold) / 0.15)', animationDuration: '4s' }}
        />

        <div className="absolute inset-16 rounded-full animate-pulse-glow flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, hsla(var(--accent) / 0.25), hsla(var(--gold) / 0.15))' }}>
          <span className="text-gold-glow text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>卜</span>
        </div>

        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-spin-slow"
            style={{
              top: '50%', left: '50%',
              background: 'hsl(var(--gold))',
              transformOrigin: `0 -${60 + i * 15}px`,
              animationDuration: `${2 + i}s`,
              animationDelay: `${i * 0.3}s`,
              boxShadow: '0 0 8px hsl(var(--gold))',
            }}
          />
        ))}
      </div>

      <p className="text-lg tracking-[0.5em] animate-pulse-glow mb-3" style={{ color: 'hsl(var(--accent))' }}>
        {t('divination.loading')}
      </p>
      <p className="text-xs text-muted-foreground tracking-widest">
        解析天象 · 推演命盘 · 窥探天机
      </p>
    </div>
  );
};

export default LoadingOverlay;
