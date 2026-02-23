import { forwardRef } from 'react';

interface ShareCardCanvasProps {
  profile: {
    display_name: string | null;
    soul_id: string;
    mbti: string | null;
    dominant_element: string | null;
    bio: string | null;
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  appUrl: string;
}

const elementColors: Record<string, string> = {
  wood: '120, 60%, 40%',
  fire: '0, 75%, 55%',
  earth: '35, 70%, 50%',
  metal: '210, 20%, 70%',
  water: '210, 80%, 55%',
};

const elementEmoji: Record<string, string> = {
  wood: '🌿', fire: '🔥', earth: '⛰️', metal: '⚔️', water: '🌊',
};

const mbtiArchetypes: Record<string, { title: string; vibe: string }> = {
  INTJ: { title: 'The Architect', vibe: 'A visionary strategist channeling cosmic precision.' },
  INTP: { title: 'The Thinker', vibe: 'A boundless mind exploring infinite corridors of knowledge.' },
  ENTJ: { title: 'The Commander', vibe: 'A born leader whose willpower bends the arc of destiny.' },
  ENTP: { title: 'The Debater', vibe: 'A spark of lightning, igniting new paradigms.' },
  INFJ: { title: 'The Advocate', vibe: 'A rare soul resonating across dimensions of experience.' },
  INFP: { title: 'The Mediator', vibe: 'A dreamer weaving meaning from threads of starlight.' },
  ENFJ: { title: 'The Protagonist', vibe: 'A radiant beacon guiding spirits toward awakening.' },
  ENFP: { title: 'The Campaigner', vibe: 'A free spirit turning moments into cosmic celebration.' },
  ISTJ: { title: 'The Logistician', vibe: 'A pillar of integrity grounding chaos into order.' },
  ISFJ: { title: 'The Defender', vibe: 'A gentle guardian sustaining the fabric of connection.' },
  ESTJ: { title: 'The Executive', vibe: 'Structured brilliance orchestrating harmony from complexity.' },
  ESFJ: { title: 'The Consul', vibe: 'A warm catalyst creating sanctuary wherever community gathers.' },
  ISTP: { title: 'The Virtuoso', vibe: 'An artisan decoding the mechanics of the universe.' },
  ISFP: { title: 'The Adventurer', vibe: 'Painting life with bold strokes of authentic beauty.' },
  ESTP: { title: 'The Entrepreneur', vibe: 'Riding the electric pulse of the present moment.' },
  ESFP: { title: 'The Entertainer', vibe: 'Transforming the ordinary into pure enchantment.' },
};

const vibrationFrequencies: Record<string, string> = {
  wood: '528 Hz — Growth & Renewal',
  fire: '741 Hz — Passion & Transformation',
  earth: '396 Hz — Stability & Wisdom',
  metal: '852 Hz — Clarity & Insight',
  water: '432 Hz — Flow & Intuition',
};

const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

/**
 * Off-screen 1080×1920 (9:16) card template for image export.
 * Rendered with absolute positioning off-screen; captured via html-to-image.
 */
const ShareCardCanvas = forwardRef<HTMLDivElement, ShareCardCanvasProps>(
  ({ profile, appUrl }, ref) => {
    const dom = profile.dominant_element || 'earth';
    const domColor = elementColors[dom] || elementColors.earth;
    const archetype = profile.mbti ? mbtiArchetypes[profile.mbti.toUpperCase()] : null;

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: 1080,
          height: 1920,
          fontFamily: "'Playfair Display', 'Noto Serif SC', serif",
          background: `linear-gradient(170deg, hsl(232 45% 10%) 0%, hsl(260 40% 6%) 40%, hsl(232 55% 4%) 100%)`,
          color: '#e8e4de',
          overflow: 'hidden',
        }}
      >
        {/* Starfield dots */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              borderRadius: '50%',
              background: `hsla(${Math.random() * 60 + 200}, 60%, 80%, ${Math.random() * 0.5 + 0.2})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Glow orbs */}
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: `radial-gradient(circle, hsla(${domColor} / 0.15), transparent 70%)`,
          left: -100, top: -100,
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: `radial-gradient(circle, hsla(${domColor} / 0.1), transparent 70%)`,
          right: -150, bottom: 200,
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '80px 60px 60px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontSize: 14, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'hsla(45, 80%, 65%, 0.7)', marginBottom: 16 }}>
              ✦ Celestial Soul Card ✦
            </div>
          </div>

          {/* Avatar + Name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
            <div style={{
              width: 140, height: 140, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 56, fontWeight: 700,
              background: `radial-gradient(circle at 35% 35%, hsla(${domColor} / 0.5), hsla(${domColor} / 0.1))`,
              border: `3px solid hsla(${domColor} / 0.5)`,
              color: `hsl(${domColor})`,
              boxShadow: `0 0 60px hsla(${domColor} / 0.3)`,
              marginBottom: 24,
            }}>
              {(profile.display_name || 'S').charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
              {profile.display_name || 'Soul'}
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              {profile.mbti && (
                <span style={{
                  fontSize: 16, padding: '6px 18px', borderRadius: 999,
                  background: 'hsla(280, 60%, 60%, 0.15)', border: '1px solid hsla(280, 60%, 60%, 0.3)',
                  color: 'hsl(280, 60%, 70%)',
                }}>{profile.mbti}</span>
              )}
              <span style={{
                fontSize: 16, padding: '6px 18px', borderRadius: 999,
                background: `hsla(${domColor} / 0.12)`, border: `1px solid hsla(${domColor} / 0.25)`,
                color: `hsl(${domColor})`,
              }}>
                {elementEmoji[dom]} {dom.charAt(0).toUpperCase() + dom.slice(1)}
              </span>
            </div>
            {archetype && (
              <div style={{ fontSize: 20, color: 'hsla(45, 80%, 65%, 0.9)', fontStyle: 'italic' }}>
                {archetype.title}
              </div>
            )}
          </div>

          {/* Vibe quote */}
          <div style={{
            padding: '28px 32px', borderRadius: 20, marginBottom: 40, textAlign: 'center',
            background: `linear-gradient(135deg, hsla(${domColor} / 0.08), hsla(45, 80%, 65%, 0.04))`,
            border: `1px solid hsla(${domColor} / 0.12)`,
          }}>
            <p style={{ fontSize: 18, fontStyle: 'italic', lineHeight: 1.7, color: 'hsla(0, 0%, 85%, 0.9)', margin: '0 0 12px' }}>
              "{archetype?.vibe || profile.bio || `A ${dom}-aligned soul, dancing between starlight and shadow.`}"
            </p>
            <p style={{ fontSize: 13, color: `hsla(${domColor} / 0.6)`, margin: 0 }}>
              ∿ {vibrationFrequencies[dom]}
            </p>
          </div>

          {/* Element bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40, flex: 1 }}>
            {elements.map((el) => (
              <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{elementEmoji[el]}</span>
                <span style={{ fontSize: 14, width: 60, textTransform: 'uppercase', color: 'hsla(0,0%,70%,0.7)' }}>
                  {el}
                </span>
                <div style={{
                  flex: 1, height: 14, borderRadius: 99, overflow: 'hidden',
                  background: 'hsla(0, 0%, 100%, 0.06)',
                }}>
                  <div style={{
                    width: `${profile[el]}%`, height: '100%', borderRadius: 99,
                    background: `linear-gradient(90deg, hsl(${elementColors[el]}), hsla(${elementColors[el]} / 0.5))`,
                  }} />
                </div>
                <span style={{ fontSize: 16, width: 40, textAlign: 'right', fontFamily: 'monospace', color: 'hsla(0,0%,70%,0.8)' }}>
                  {profile[el]}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid hsla(45, 80%, 65%, 0.1)', paddingTop: 28,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            <div style={{ fontSize: 13, color: 'hsla(0,0%,60%,0.8)', letterSpacing: '0.15em' }}>
              SOUL ID: #{profile.soul_id}
            </div>
            <div style={{ fontSize: 16, color: 'hsla(45, 80%, 65%, 0.7)', letterSpacing: '0.1em' }}>
              ✦ {appUrl.replace(/^https?:\/\//, '')} ✦
            </div>
            <div style={{ fontSize: 14, color: 'hsla(0,0%,50%,0.6)', marginTop: 4 }}>
              Who are you in the Universe? ✨
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareCardCanvas.displayName = 'ShareCardCanvas';

export default ShareCardCanvas;
