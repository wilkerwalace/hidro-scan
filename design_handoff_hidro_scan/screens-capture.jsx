// screens-capture.jsx — Camera capture flow + Analyzing + Result + Detail

const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

// ──────────────────────────────────────────────────────────────
// Capture flow controller
//   1) pick sample
//   2) viewfinder + take 3 photos (flash)
//   3) analyzing animation w/ spectrum scrubbing
//   4) result
// ──────────────────────────────────────────────────────────────
const MIN_PHOTOS = 3;

function CaptureScreen({ uc, primary, defaultSample, onClose, onSave }) {
  const [stage, setStage] = useStateC('viewfinder'); // viewfinder | analyzing | result
  const [photos, setPhotos] = useStateC([]); // [{ph, color}]
  const [flashOn, setFlashOn] = useStateC(true);
  const [sampleId, setSampleId] = useStateC(defaultSample || uc.samples[0].id);
  const [flashing, setFlashing] = useStateC(false);
  const [animPh, setAnimPh] = useStateC(7);
  const [finalPh, setFinalPh] = useStateC(7);
  const sample = uc.samples.find(s => s.id === sampleId) || uc.samples[0];

  // Simulate that the "real" reading will be near sample.last w/ jitter
  const truePh = useRefC(0);
  useEffectC(() => {
    truePh.current = Math.round((sample.last + (Math.random() - 0.5) * 0.4) * 100) / 100;
  }, [sampleId]);

  function takePhoto() {
    if (photos.length >= 5) return;
    setFlashing(true);
    setTimeout(() => setFlashing(false), 200);
    // simulate per-photo reading w/ jitter
    const reading = truePh.current + (Math.random() - 0.5) * 0.6;
    const ph = Math.round(reading * 100) / 100;
    setPhotos(prev => [...prev, { ph, color: phToColor(ph) }]);
  }

  function startAnalysis() {
    setStage('analyzing');
    // average + animate
    const avg = photos.reduce((a, p) => a + p.ph, 0) / photos.length;
    const ph = Math.round(avg * 100) / 100;
    setFinalPh(ph);

    // scrubbing animation
    const duration = 2200;
    const t0 = performance.now();
    const start = 0;
    function tick() {
      const dt = performance.now() - t0;
      const t = Math.min(1, dt / duration);
      // ease out + settle
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = start + (ph - start) * eased;
      setAnimPh(cur);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => setStage('result'), 350);
      }
    }
    requestAnimationFrame(tick);
  }

  function saveAndClose() {
    const record = {
      id: 'rec-' + Date.now(),
      sampleId,
      ph: finalPh,
      ts: new Date(),
      photos: photos.map(p => p.color),
      confidence: Math.min(0.98, 0.78 + photos.length * 0.04),
    };
    onSave(record);
  }

  if (stage === 'viewfinder') {
    return (
      <ViewfinderStage
        uc={uc} primary={primary}
        sample={sample} sampleId={sampleId} setSampleId={setSampleId}
        photos={photos} onTake={takePhoto}
        flashing={flashing} flashOn={flashOn} setFlashOn={setFlashOn}
        onClose={onClose} onAnalyze={startAnalysis}
      />
    );
  }
  if (stage === 'analyzing') {
    return (
      <AnalyzingStage
        primary={primary} photos={photos}
        animPh={animPh} finalPh={finalPh}
        sample={sample}
      />
    );
  }
  return (
    <ResultStage
      uc={uc} primary={primary}
      ph={finalPh} sample={sample} photos={photos}
      confidence={Math.min(0.98, 0.78 + photos.length * 0.04)}
      onSave={saveAndClose} onRetake={() => { setPhotos([]); setStage('viewfinder'); }}
    />
  );
}

// ──────────────────────────────────────────────────────────────
// Viewfinder stage
// ──────────────────────────────────────────────────────────────
function ViewfinderStage({ uc, primary, sample, sampleId, setSampleId, photos, onTake, flashing, flashOn, setFlashOn, onClose, onAnalyze }) {
  const enough = photos.length >= MIN_PHOTOS;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', color: '#fff', overflow: 'hidden' }}>
      {/* flash overlay */}
      {flashing && (
        <div className="hs-flash" style={{
          position: 'absolute', inset: 0, background: '#fff', zIndex: 50, pointerEvents: 'none',
        }}/>
      )}

      {/* faux viewfinder — gradient + grain */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, #2a2a2a 0%, #0A0A0A 75%)',
      }}>
        {/* simulated tile/surface */}
        <div style={{
          position: 'absolute', inset: '12% 8%',
          borderRadius: 24,
          background: uc.id === 'pool'
            ? 'radial-gradient(ellipse at 30% 20%, rgba(120,200,255,.25), transparent 70%), radial-gradient(ellipse at 70% 80%, rgba(60,140,210,.18), transparent 70%), #143b5c'
            : 'radial-gradient(ellipse at 30% 20%, rgba(120,255,180,.18), transparent 70%), radial-gradient(ellipse at 70% 80%, rgba(80,180,90,.15), transparent 70%), #0e2418',
          filter: 'blur(0.5px)',
          opacity: .8,
        }}>
          {/* grain */}
          <div style={{
            position: 'absolute', inset: 0, opacity: .12, mixBlendMode: 'overlay',
            backgroundImage: 'radial-gradient(circle at 25% 30%, #fff 0.5px, transparent 1px), radial-gradient(circle at 75% 70%, #fff 0.5px, transparent 1px)',
            backgroundSize: '6px 6px, 9px 9px',
          }}/>
        </div>
      </div>

      {/* Mock test strip in center */}
      <div className="hs-strip-float" style={{
        position: 'absolute', left: '50%', top: '46%',
        transform: 'translate(-50%, -50%) rotate(-6deg)',
        width: 80, height: 280, borderRadius: 14,
        background: 'linear-gradient(180deg, #FAFAFA 0%, #F0F0F0 30%, ' +
          phToColor(sample.last - 0.4) + ' 50%, ' +
          phToColor(sample.last) + ' 72%, ' +
          phToColor(sample.last + 0.3) + ' 95%)',
        boxShadow: '0 12px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.08)',
        zIndex: 2,
      }}>
        {/* color zones */}
        <div style={{
          position: 'absolute', left: 8, right: 8, bottom: 10, top: 130,
          display: 'flex', flexDirection: 'column', gap: 3, opacity: .55, mixBlendMode: 'multiply',
        }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ flex: 1, borderRadius: 4, background: 'rgba(0,0,0,.15)' }}/>
          ))}
        </div>
      </div>

      {/* Crosshair / framing guide */}
      <ViewfinderGuide />

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={onClose} style={{
          appearance: 'none', border: 'none', cursor: 'pointer',
          width: 38, height: 38, borderRadius: 12,
          background: 'rgba(255,255,255,.15)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="x" size={18} color="#fff"/>
        </button>

        <div style={{
          padding: '8px 14px', borderRadius: 999,
          background: 'rgba(255,255,255,.15)',
          backdropFilter: 'blur(10px)',
          fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
          maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name={sample.icon} size={14} color="#fff" strokeWidth={1.8}/> {sample.name}
        </div>

        <button onClick={() => setFlashOn(!flashOn)} style={{
          appearance: 'none', border: 'none', cursor: 'pointer',
          width: 38, height: 38, borderRadius: 12,
          background: flashOn ? primary : 'rgba(255,255,255,.15)',
          color: flashOn ? '#0A0A0A' : '#fff',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={flashOn ? 'flash' : 'flashOff'} size={16} color="currentColor"/>
        </button>
      </div>

      {/* Instruction pill */}
      <div style={{
        position: 'absolute', top: 116, left: '50%', transform: 'translateX(-50%)',
        padding: '10px 16px', borderRadius: 16, zIndex: 10,
        background: 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 22,
          background: primary, color: '#0A0A0A',
          fontSize: 11, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{photos.length}/{MIN_PHOTOS}</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            {photos.length < MIN_PHOTOS ? 'Tire mais ' + (MIN_PHOTOS - photos.length) + ' foto' + (MIN_PHOTOS - photos.length > 1 ? 's' : '') : 'Pronto para analisar'}
          </div>
          <div style={{ fontSize: 10, opacity: .65 }}>
            {flashOn ? 'Flash ativo · Alinhe a tira no centro' : 'Sem flash · Cuidado com sombras'}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
      }}>
        {/* Photo strip preview */}
        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: Math.max(MIN_PHOTOS, photos.length) }).map((_, i) => {
            const p = photos[i];
            const isNext = i === photos.length;
            return (
              <div key={i} style={{
                width: 44, height: 56, borderRadius: 8,
                background: p ? p.color : 'rgba(255,255,255,.08)',
                border: isNext ? '1.5px dashed rgba(255,255,255,.45)' : '1.5px solid rgba(255,255,255,.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                boxShadow: p ? '0 4px 12px rgba(0,0,0,.3)' : 'none',
              }}>
                {p && (
                  <div style={{
                    position: 'absolute', bottom: 3, left: 0, right: 0, textAlign: 'center',
                    fontSize: 9, color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,.5)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{p.ph.toFixed(1)}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Shutter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <button onClick={() => {/* gallery */}} style={{
            appearance: 'none', border: 'none', background: 'rgba(255,255,255,.12)', cursor: 'pointer',
            width: 50, height: 50, borderRadius: 14,
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="grid" size={20} color="#fff"/>
          </button>

          <button onClick={onTake} style={{
            appearance: 'none', border: 'none', cursor: 'pointer',
            width: 78, height: 78, borderRadius: 999,
            background: '#fff', padding: 4,
            boxShadow: '0 0 0 4px rgba(255,255,255,.25), 0 8px 24px rgba(0,0,0,.4)',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: 999,
              background: primary,
              boxShadow: 'inset 0 0 0 2px #fff',
            }}/>
          </button>

          <button onClick={enough ? onAnalyze : undefined} disabled={!enough} style={{
            appearance: 'none', border: 'none', cursor: enough ? 'pointer' : 'not-allowed',
            width: 50, height: 50, borderRadius: 14,
            background: enough ? primary : 'rgba(255,255,255,.12)',
            color: enough ? '#0A0A0A' : 'rgba(255,255,255,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="check" size={22} color="currentColor"/>
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewfinderGuide() {
  return (
    <div style={{
      position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%, -50%)',
      width: 220, height: 320, pointerEvents: 'none', zIndex: 3,
    }}>
      {[[0,0],[1,0],[0,1],[1,1]].map(([x,y], k) => (
        <div key={k} style={{
          position: 'absolute',
          [x === 0 ? 'left' : 'right']: -2,
          [y === 0 ? 'top' : 'bottom']: -2,
          width: 28, height: 28,
          borderTop: y === 0 ? '3px solid rgba(255,255,255,.85)' : 'none',
          borderBottom: y === 1 ? '3px solid rgba(255,255,255,.85)' : 'none',
          borderLeft: x === 0 ? '3px solid rgba(255,255,255,.85)' : 'none',
          borderRight: x === 1 ? '3px solid rgba(255,255,255,.85)' : 'none',
          borderRadius: 6,
        }}/>
      ))}
      {/* scan line */}
      <div className="hs-scan" style={{
        position: 'absolute', left: 6, right: 6, height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(118,251,145,.9), transparent)',
        borderRadius: 1,
        boxShadow: '0 0 12px rgba(118,251,145,.7)',
      }}/>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Analyzing stage
// ──────────────────────────────────────────────────────────────
function AnalyzingStage({ primary, photos, animPh, finalPh, sample }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, padding: '70px 22px 40px',
      background: '#FAFAFA',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)' }}>Analisando · {sample.name}</div>
      <h1 style={{
        fontFamily: '"Outfit", sans-serif', fontWeight: 400, fontSize: 30,
        margin: '4px 0 22px', letterSpacing: '-0.02em', lineHeight: 1,
      }}>Lendo o espectro</h1>

      {/* Animated reading orb */}
      <GlassCard primary={primary} style={{ height: 280, marginBottom: 18 }} padding={26}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(0,0,0,.55)', fontSize: 11 }}>
            <Icon name="sparkle" size={12}/>
            <span>Cor detectada</span>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Pulsing color orb */}
            <div className="hs-pulse" style={{
              position: 'absolute', width: 180, height: 180, borderRadius: '50%',
              background: `radial-gradient(circle, ${phToColor(animPh)} 0%, ${phToColor(animPh)}aa 50%, transparent 80%)`,
              filter: 'blur(8px)',
            }}/>
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              background: phToColor(animPh),
              boxShadow: '0 8px 30px rgba(0,0,0,.18), inset 0 2px 8px rgba(255,255,255,.5)',
              position: 'relative', zIndex: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: '"Outfit", sans-serif', fontWeight: 300, fontSize: 36,
                color: '#0A0A0A',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}>{animPh.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>

          <PhSpectrum value={animPh} height={12} showScale animate={false}/>
        </div>
      </GlassCard>

      {/* photo readings list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, color: 'rgba(0,0,0,.55)', margin: '4px 4px 6px' }}>
          Combinando {photos.length} amostras
        </div>
        {photos.map((p, i) => (
          <div key={i} className="hs-fade-in" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 16, background: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,.04)',
            animationDelay: `${i * 0.18}s`,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: p.color,
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)',
            }}/>
            <div style={{ flex: 1, fontSize: 13 }}>Foto {i + 1}</div>
            <div style={{
              fontFamily: '"Outfit", sans-serif', fontVariantNumeric: 'tabular-nums', fontSize: 18,
            }}>{p.ph.toFixed(2).replace('.', ',')}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}/>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(0,0,0,.45)' }}>
        <span className="hs-dot-blink">●</span> Processando...
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Result stage
// ──────────────────────────────────────────────────────────────
function ResultStage({ uc, primary, ph, sample, photos, confidence, onSave, onRetake }) {
  const cls = classify(ph, uc);
  const rec = recommendation(ph, uc);
  const color = phToColor(ph);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: '#FAFAFA' }}>
      <div style={{ padding: '70px 18px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <button onClick={onRetake} style={{
            appearance: 'none', border: '0.5px solid rgba(0,0,0,.1)', background: '#fff',
            width: 38, height: 38, borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="chevL" size={18}/>
          </button>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,.55)' }}>Resultado da leitura</div>
          <div style={{ width: 38 }}/>
        </div>

        {/* Hero result card */}
        <GlassCard primary={primary} style={{ marginBottom: 14 }} padding={24}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(0,0,0,.55)', fontSize: 11, marginBottom: 8 }}>
            <Icon name={sample.icon} size={13} color="#0A0A0A" strokeWidth={1.8}/>
            <span>{sample.name}</span>
            <div style={{ flex: 1 }}/>
            <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 18 }}>
            <div style={{
              width: 92, height: 92, borderRadius: 24,
              background: color,
              boxShadow: '0 10px 30px rgba(0,0,0,.15), inset 0 2px 6px rgba(255,255,255,.4)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div className="hs-wave" style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(180deg, transparent 50%, ${color} 50%)`,
                opacity: .4,
              }}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)', marginBottom: 2 }}>pH detectado</div>
              <div style={{
                fontFamily: '"Outfit", sans-serif', fontWeight: 300, fontSize: 72,
                lineHeight: .9, letterSpacing: '-0.04em',
                fontVariantNumeric: 'tabular-nums',
              }}>{ph.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>

          <PhSpectrum value={ph} height={14} showScale animate/>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 18,
            padding: '10px 14px', borderRadius: 14,
            background: 'rgba(255,255,255,.5)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 8, background: cls.color }}/>
            <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{cls.label}</div>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,.55)' }}>
              Confiança {Math.round(confidence * 100)}%
            </div>
          </div>
        </GlassCard>

        {/* Comparison: target vs measured */}
        <Card padding={16} style={{ marginBottom: 10 }}>
          <CardHeader icon="target" label="Comparativo com a faixa ideal"/>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(0,0,0,.5)' }}>Medido</div>
              <BigStat value={ph.toFixed(2).replace('.', ',')} unit="" size={28}/>
            </div>
            <div style={{
              width: 1, height: 36, background: 'rgba(0,0,0,.1)',
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(0,0,0,.5)' }}>Ideal</div>
              <BigStat value={uc.ideal.toString().replace('.', ',')} unit="" size={28}/>
            </div>
            <div style={{
              width: 1, height: 36, background: 'rgba(0,0,0,.1)',
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(0,0,0,.5)' }}>Δ</div>
              <BigStat
                value={(ph - uc.ideal >= 0 ? '+' : '') + (ph - uc.ideal).toFixed(2).replace('.', ',')}
                unit="" size={28}
                color={Math.abs(ph - uc.ideal) > 0.3 ? '#E0331D' : '#2EA38E'}
              />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <RangeBar low={uc.safeRange[0]} high={uc.safeRange[1]} value={ph} primary={primary}/>
          </div>
        </Card>

        {/* Recommendation */}
        <Card padding={18} style={{ marginBottom: 10 }}>
          <CardHeader icon="sparkle" label="Recomendação"/>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{rec.title}</div>
          <div style={{ fontSize: 13, color: 'rgba(0,0,0,.65)', lineHeight: 1.5 }}>
            {rec.body}
          </div>
        </Card>

        {/* Photos */}
        <Card padding={16} style={{ marginBottom: 18 }}>
          <CardHeader icon="camera" label={photos.length + ' fotos capturadas'}/>
          <div style={{ display: 'flex', gap: 8 }}>
            {photos.map((p, i) => (
              <div key={i} style={{
                flex: 1, height: 56, borderRadius: 10,
                background: p.color,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                padding: 4,
              }}>
                <div style={{
                  background: 'rgba(0,0,0,.55)', color: '#fff',
                  fontSize: 9, padding: '2px 5px', borderRadius: 4,
                  fontVariantNumeric: 'tabular-nums',
                }}>{p.ph.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onRetake} style={{
            appearance: 'none', border: '0.5px solid rgba(0,0,0,.1)', background: '#fff',
            flex: 1, height: 54, borderRadius: 18, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="camera" size={16}/> Refazer
          </button>
          <button onClick={onSave} style={{
            appearance: 'none', border: 'none', cursor: 'pointer',
            flex: 2, height: 54, borderRadius: 18,
            background: '#0A0A0A', color: '#fff', fontFamily: 'inherit',
            fontWeight: 500, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 8px 20px rgba(0,0,0,.25)',
          }}>
            <Icon name="check" size={16} color="#fff"/> Salvar leitura
          </button>
        </div>
      </div>
    </div>
  );
}

function RangeBar({ low, high, value, primary }) {
  const min = Math.min(low - 1.5, value - 0.5);
  const max = Math.max(high + 1.5, value + 0.5);
  const span = max - min;
  const lpct = ((low - min) / span) * 100;
  const hpct = ((high - min) / span) * 100;
  const vpct = ((value - min) / span) * 100;
  const inRange = value >= low && value <= high;

  return (
    <div>
      <div style={{
        position: 'relative', height: 36,
        background: '#F4F4F4', borderRadius: 12, overflow: 'hidden',
      }}>
        {/* safe band */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${lpct}%`, width: `${hpct - lpct}%`,
          background: `linear-gradient(180deg, ${primary}44, ${primary}88)`,
          borderLeft: `1.5px solid ${primary}`,
          borderRight: `1.5px solid ${primary}`,
        }}/>
        {/* value marker */}
        <div style={{
          position: 'absolute', top: -2, bottom: -2,
          left: `calc(${vpct}% - 3px)`, width: 6, borderRadius: 3,
          background: inRange ? '#0A0A0A' : '#E0331D',
          boxShadow: '0 0 0 2px #fff, 0 4px 10px rgba(0,0,0,.2)',
        }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'rgba(0,0,0,.5)' }}>
        <span>{min.toFixed(1)}</span>
        <span style={{ color: primary === '#76FB91' ? '#2EA38E' : primary, fontWeight: 500 }}>
          Faixa ideal {low}–{high}
        </span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Detail screen — opens from history list
// ──────────────────────────────────────────────────────────────
function DetailScreen({ uc, primary, record, onBack }) {
  const sample = uc.samples.find(s => s.id === record.sampleId) || uc.samples[0];
  const cls = classify(record.ph, uc);
  const rec = recommendation(record.ph, uc);
  const photos = record.photos || [phToColor(record.ph)];
  const ts = (typeof record.ts === 'string') ? new Date(record.ts) : record.ts;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: '#FAFAFA' }}>
      <div style={{ padding: '70px 18px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <button onClick={onBack} style={{
            appearance: 'none', border: '0.5px solid rgba(0,0,0,.1)', background: '#fff',
            width: 38, height: 38, borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="chevL" size={18}/>
          </button>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,.55)' }}>Registro</div>
          <button style={{
            appearance: 'none', border: '0.5px solid rgba(0,0,0,.1)', background: '#fff',
            width: 38, height: 38, borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="arrowUR" size={16}/>
          </button>
        </div>

        <GlassCard primary={primary} style={{ marginBottom: 14 }} padding={22}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(0,0,0,.5)', marginBottom: 4 }}>
            <Icon name={sample.icon} size={13} color="#0A0A0A" strokeWidth={1.8}/> <span>{sample.name}</span>
          </div>
          <div style={{
            fontFamily: '"Outfit", sans-serif', fontWeight: 300, fontSize: 84, lineHeight: 1,
            letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginBottom: 8,
          }}>{record.ph.toFixed(2).replace('.', ',')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: 8, background: cls.color }}/>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{cls.label}</div>
            <div style={{ flex: 1 }}/>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,.55)' }}>
              {ts.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <PhSpectrum value={record.ph} height={12} showScale/>
        </GlassCard>

        <Card padding={16} style={{ marginBottom: 10 }}>
          <CardHeader icon="camera" label="Fotos capturadas"/>
          <div style={{ display: 'flex', gap: 8 }}>
            {photos.map((c, i) => (
              <div key={i} style={{
                flex: 1, height: 64, borderRadius: 10,
                background: c,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)',
              }}/>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(0,0,0,.55)' }}>
            Confiança · {Math.round((record.confidence || 0.9) * 100)}%
          </div>
        </Card>

        <Card padding={18}>
          <CardHeader icon="sparkle" label="Próxima ação sugerida"/>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{rec.title}</div>
          <div style={{ fontSize: 13, color: 'rgba(0,0,0,.65)', lineHeight: 1.5 }}>
            {rec.body}
          </div>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, {
  CaptureScreen, DetailScreen, RangeBar,
});
