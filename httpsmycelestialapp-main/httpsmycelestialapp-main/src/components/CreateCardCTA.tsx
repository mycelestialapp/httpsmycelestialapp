import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * A prominent CTA shown to unauthenticated / new users,
 * guiding them to create their own Soul Card.
 */
const CreateCardCTA = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only show to unauthenticated users
  if (user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="glass-card p-5 text-center space-y-3"
    >
      <Sparkles size={28} style={{ color: 'hsl(var(--gold))', margin: '0 auto' }} />
      <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))' }}>
        {t('cta.createCardTitle')}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t('cta.createCardDesc')}
      </p>
      <button
        onClick={() => navigate('/auth')}
        className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97] hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, hsla(var(--gold) / 0.25), hsla(var(--accent) / 0.2))',
          border: '1px solid hsla(var(--gold) / 0.4)',
          color: 'hsl(var(--gold))',
        }}
      >
        ✦ {t('cta.createCardButton')}
      </button>
    </motion.div>
  );
};

export default CreateCardCTA;
