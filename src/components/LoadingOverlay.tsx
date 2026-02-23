const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md">
      {/* Spinning rings */}
      <div className="relative w-40 h-40 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin-slow" />
        <div
          className="absolute inset-4 rounded-full border-2 border-transparent border-b-accent animate-spin-slow"
          style={{ animationDirection: "reverse", animationDuration: "2s" }}
        />
        <div
          className="absolute inset-8 rounded-full border border-transparent border-t-primary/50 animate-spin-slow"
          style={{ animationDuration: "4s" }}
        />
        {/* Center glow */}
        <div className="absolute inset-12 rounded-full bg-accent/20 animate-pulse-glow" />
      </div>

      <p className="neon-text-purple text-xl tracking-[0.5em] animate-pulse-glow">
        正在链接星辰...
      </p>
    </div>
  );
};

export default LoadingOverlay;
