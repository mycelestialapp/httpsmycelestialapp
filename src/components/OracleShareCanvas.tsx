import { forwardRef } from 'react';
import type { OracleCardEntry } from '@/lib/oracleCards';
import type { OracleReading as MasterOracleReading } from '@/lib/oracleMasterReading';

interface OracleShareCanvasProps {
  question?: string;
  cards: OracleCardEntry[];
  reading: MasterOracleReading;
}

const W = 1080;
const H = 1920;

const OracleShareCanvas = forwardRef<HTMLDivElement, OracleShareCanvasProps>(
  ({ question, cards, reading }, ref) => {
    const q = question?.trim();
    const title = q && q.length > 0 ? q : '今日宇宙對你說的一句話';
    const subtitle = q && q.length > 0 ? '你與神諭卡之間的一次認真對話。' : '沒有明說的問題，宇宙也在回應你此刻的狀態。';

    const mirroring = reading.freeTier.mirroring ?? '';
    const soulCore = reading.freeTier.soulCore ?? '';

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          width: W,
          height: H,
          background:
            'radial-gradient(circle at 20% 0%, rgba(255,255,255,0.06) 0, transparent 55%), ' +
            'radial-gradient(circle at 80% 100%, rgba(166,135,255,0.28) 0, transparent 60%), ' +
            'linear-gradient(175deg, #050316 0%, #09071c 40%, #050316 100%)',
          color: '#f8f4ea',
          fontFamily: '"Noto Serif SC", ui-serif, Georgia, "Times New Roman", serif',
          overflow: 'hidden',
        }}
      >
        {/* Outer golden frame */}
        <div
          style={{
            position: 'absolute',
            inset: 36,
            borderRadius: 32,
            border: '1px solid rgba(212,175,100,0.26)',
            boxShadow: '0 0 60px rgba(0,0,0,0.75)',
          }}
        />

        {/* Soft nebula glow */}
        <div
          style={{
            position: 'absolute',
            width: 720,
            height: 720,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,100,0.22), transparent 60%)',
            left: '50%',
            top: '30%',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(38px)',
            opacity: 0.8,
          }}
        />

        {/* Content column */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            padding: '80px 96px 72px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          {/* Top: question */}
          <div style={{ textAlign: 'left', marginBottom: 64 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'rgba(212,175,100,0.8)',
                marginBottom: 16,
              }}
            >
              ✦ ORACLE READING ✦
            </div>
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.4,
                fontWeight: 700,
                maxHeight: 120,
                overflow: 'hidden',
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 16,
                lineHeight: 1.6,
                color: 'rgba(244,239,220,0.82)',
                maxWidth: 720,
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Middle: cards row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
              marginBottom: 56,
            }}
          >
            <div
              style={{
                fontSize: 13,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'rgba(212,175,100,0.82)',
              }}
            >
              抽出的神諭卡
            </div>
            <div
              style={{
                display: 'flex',
                gap: 24,
                alignItems: 'flex-end',
              }}
            >
              {cards.slice(0, 3).map(card => (
                <div
                  key={card.id}
                  style={{
                    width: 260,
                    height: 420,
                    borderRadius: 24,
                    border: '2px solid rgba(212,175,100,0.6)',
                    overflow: 'hidden',
                    background:
                      'linear-gradient(165deg, rgba(40,20,80,0.98) 0%, rgba(12,6,30,0.98) 45%, rgba(60,30,100,0.95) 100%)',
                    boxShadow: '0 26px 60px rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {card.image ? (
                    <>
                      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
                        <img
                          src={card.image}
                          alt={card.nameZh}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            display: 'block',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          padding: '10px 16px 12px',
                          borderTop: '1px solid rgba(212,175,100,0.38)',
                          background: 'rgba(2,2,8,0.7)',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: 'hsl(46,72%,72%)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {card.nameZh}
                        </div>
                        {card.tagline && (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 12,
                              color: 'rgba(248,244,230,0.78)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {card.tagline}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: 'hsl(46,72%,72%)',
                          marginBottom: 12,
                        }}
                      >
                        {card.nameZh}
                      </div>
                      {card.shortHint && (
                        <div
                          style={{
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: 'rgba(244,239,220,0.86)',
                          }}
                        >
                          {card.shortHint}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: master reading */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              padding: '22px 26px',
              borderRadius: 24,
              background: 'rgba(6,6,20,0.82)',
              border: '1px solid rgba(212,175,100,0.36)',
              boxShadow: '0 18px 46px rgba(0,0,0,0.7)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'rgba(212,175,100,0.85)',
                }}
              >
                基本解讀
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(222,217,196,0.78)',
                }}
              >
                鏡像復述 · 靈魂核心啟示
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 28,
                flex: 1,
                minHeight: 0,
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(212,175,100,0.9)',
                  }}
                >
                  鏡像復述
                </div>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: 'rgba(244,239,224,0.9)',
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                  }}
                >
                  {mirroring}
                </div>
              </div>

              <div
                style={{
                  width: 1,
                  background: 'linear-gradient(to bottom, transparent, rgba(212,175,100,0.5), transparent)',
                  opacity: 0.7,
                }}
              />

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(212,175,100,0.9)',
                  }}
                >
                  靈魂核心啟示
                </div>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: 'rgba(244,239,224,0.9)',
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                  }}
                >
                  {soulCore}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                color: 'rgba(198,188,160,0.9)',
                textAlign: 'right',
              }}
            >
              Celestial Insights · 神諭卡解讀
            </div>
          </div>
        </div>
      </div>
    );
  },
);

OracleShareCanvas.displayName = 'OracleShareCanvas';

export default OracleShareCanvas;

