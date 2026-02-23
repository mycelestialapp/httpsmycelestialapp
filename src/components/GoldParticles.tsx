import { motion } from 'framer-motion';

interface GoldParticlesProps {
  active: boolean;
  count?: number;
}

const GoldParticles = ({ active, count = 20 }: GoldParticlesProps) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 4,
            height: 2 + Math.random() * 4,
            background: `hsl(${40 + Math.random() * 10} ${60 + Math.random() * 20}% ${50 + Math.random() * 20}%)`,
            left: `${10 + Math.random() * 80}%`,
            bottom: '10%',
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0.6, 0],
            y: -(100 + Math.random() * 200),
            x: (Math.random() - 0.5) * 60,
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: Math.random() * 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

export default GoldParticles;
