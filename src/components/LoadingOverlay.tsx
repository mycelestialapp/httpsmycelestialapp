const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl">
      {/* Bagua outer ring */}
      <div className="relative w-48 h-48 mb-10">
        {/* Outer ring with bagua symbols */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-spin-slow flex items-center justify-center">
          {["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"].map((symbol, i) => (
            <span
              key={i}
              className="absolute text-primary/60 text-lg"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-90px) rotate(-${i * 45}deg)`,
              }}
            >
              {symbol}
            </span>
          ))}
        </div>

        {/* Middle ring */}
        <div
          className="absolute inset-6 rounded-full border border-accent/30 animate-spin-slow"
          style={{ animationDirection: "reverse", animationDuration: "2s" }}
        />

        {/* Inner ring */}
        <div
          className="absolute inset-12 rounded-full border border-primary/20 animate-spin-slow"
          style={{ animationDuration: "4s" }}
        />

        {/* Center orb */}
        <div className="absolute inset-16 rounded-full bg-gradient-to-br from-accent/30 to-primary/20 animate-pulse-glow flex items-center justify-center">
          <span className="neon-text-gold text-2xl">卜</span>
        </div>

        {/* Glowing particles */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary animate-spin-slow"
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: `0 -${60 + i * 15}px`,
              animationDuration: `${2 + i}s`,
              animationDelay: `${i * 0.3}s`,
              boxShadow: "0 0 8px hsl(var(--neon-gold))",
            }}
          />
        ))}
      </div>

      <p className="neon-text-purple text-lg tracking-[0.5em] animate-pulse-glow mb-3">
        正在链接星辰...
      </p>
      <p className="text-xs text-muted-foreground tracking-widest">
        解析天象 · 推演命盘 · 窥探天机
      </p>
    </div>
  );
};

export default LoadingOverlay;
