// screens-main.jsx — Onboarding, Home, Samples, Reminders, Profile, Manual entry

const { useState: useStateM, useEffect: useEffectM, useMemo: useMemoM } = React;

// ──────────────────────────────────────────────────────────────
// Onboarding — 3 slides
// ──────────────────────────────────────────────────────────────
function OnboardingScreen({ onDone, primary, useCase, setUseCase }) {
  const [step, setStep] = useStateM(0);
  const slides = [
    {
      title: 'Meça o pH com sua câmera',
      sub: 'Hidro Scan analisa fotos de tiras de teste e devolve o pH em segundos.',
      visual: 'drop',
    },
    {
      title: 'Tire 3 fotos com flash',
      sub: 'Capturas acumulativas reduzem o erro de iluminação. Vamos te guiar.',
      visual: 'camera',
    },
    {
      title: 'O que você monitora?',
      sub: 'Personalize as faixas seguras e as recomendações.',
      visual: 'pick',
    },
  ];
  const s = slides[step];

  return (
    <div style={{
      position: 'absolute', inset: 0, padding: '70px 24px 40px',
      display: 'flex', flexDirection: 'column',
      background: '#FAFAFA',
    }}>
      {/* progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= step ? '#0A0A0A' : 'rgba(0,0,0,.1)',
            transition: 'background .3s',
          }}/>
        ))}
      </div>

      {/* visual */}
      <div style={{
        height: 280, borderRadius: 28, position: 'relative', overflow: 'hidden',
        marginBottom: 24,
      }}>
        <GlassCard primary={primary} padding={0} style={{ height: '100%' }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {s.visual === 'drop' && (
              <div style={{ textAlign: 'center', color: '#0A0A0A' }}>
                <Logo size={88} primary={primary} />
                <div style={{
                  fontFamily: '"Outfit", sans-serif', fontWeight: 300, fontSize: 32,
                  marginTop: 18, letterSpacing: '-0.02em',
                }}>Hidro Scan</div>
              </div>
            )}
            {s.visual === 'camera' && (
              <div style={{ position: 'relative', width: 180, height: 180 }}>
                {/* mock strip */}
                <div style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translate(-50%,-50%) rotate(-8deg)',
                  width: 60, height: 200, borderRadius: 10,
                  background: 'linear-gradient(180deg, #fff 0%, #fff 60%, ' + phToColor(7) + ' 60%, ' + phToColor(7) + ' 100%)',
                  boxShadow: '0 8px 24px rgba(0,0,0,.15)',
                }}/>
                {/* viewfinder corners */}
                {[[0,0,'tl'],[1,0,'tr'],[0,1,'bl'],[1,1,'br']].map(([x,y,k]) => (
                  <div key={k} style={{
                    position: 'absolute',
                    [x === 0 ? 'left' : 'right']: 0,
                    [y === 0 ? 'top' : 'bottom']: 0,
                    width: 30, height: 30,
                    borderTop: y === 0 ? '2.5px solid #0A0A0A' : 'none',
                    borderBottom: y === 1 ? '2.5px solid #0A0A0A' : 'none',
                    borderLeft: x === 0 ? '2.5px solid #0A0A0A' : 'none',
                    borderRight: x === 1 ? '2.5px solid #0A0A0A' : 'none',
                    borderRadius: 4,
                  }}/>
                ))}
              </div>
            )}
            {s.visual === 'pick' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '78%' }}>
                {Object.values(USE_CASES).map(uc => (
                  <button key={uc.id} onClick={() => setUseCase(uc.id)} style={{
                    appearance: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 18,
                    background: useCase === uc.id ? '#0A0A0A' : 'rgba(255,255,255,.7)',
                    color: useCase === uc.id ? '#fff' : '#0A0A0A',
                    border: 'none',
                    fontFamily: 'inherit',
                    boxShadow: useCase === uc.id ? '0 4px 12px rgba(0,0,0,.2)' : '0 0 0 0.5px rgba(0,0,0,.08)',
                    transition: 'all .2s',
                  }}>
                    <Icon name={uc.samples[0].icon} size={22} color={useCase === uc.id ? '#fff' : '#0A0A0A'} strokeWidth={1.8}/>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{uc.name}</div>
                      <div style={{ fontSize: 11, opacity: .6 }}>Faixa: {uc.safeRange[0]} – {uc.safeRange[1]}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)', marginBottom: 6 }}>
        Passo {step + 1} de {slides.length}
      </div>
      <h1 style={{
        fontFamily: '"Outfit", sans-serif', fontWeight: 400, fontSize: 32,
        margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em',
      }}>{s.title}</h1>
      <p style={{
        margin: '14px 0 0', color: 'rgba(0,0,0,.6)', fontSize: 14, lineHeight: 1.5,
      }}>{s.sub}</p>

      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', gap: 10 }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{
            appearance: 'none', border: '0.5px solid rgba(0,0,0,.1)',
            background: 'transparent', cursor: 'pointer',
            width: 54, height: 54, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="chevL" size={20}/>
          </button>
        )}
        <button onClick={() => step < slides.length - 1 ? setStep(step + 1) : onDone()} style={{
          appearance: 'none', border: 'none', cursor: 'pointer',
          flex: 1, height: 54, borderRadius: 18,
          background: '#0A0A0A', color: '#fff', fontFamily: 'inherit',
          fontWeight: 500, fontSize: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 8px 20px rgba(0,0,0,.25)',
        }}>
          {step < slides.length - 1 ? 'Continuar' : 'Começar a medir'}
          <Icon name="chevR" size={16} color="#fff"/>
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Home / Dashboard
// ──────────────────────────────────────────────────────────────
function HomeScreen({ uc, primary, history, records, onSample, onCapture, onOpenRecord, onNotifications }) {
  const samples = uc.samples;
  const avgPh = useMemoM(() => {
    const all = samples.map(s => s.last);
    return all.reduce((a, b) => a + b, 0) / all.length;
  }, [samples]);

  const lastReading = records[0] || {
    ph: samples[0].last, sampleId: samples[0].id, ts: new Date(), confidence: 0.92,
  };
  const lastSample = samples.find(s => s.id === lastReading.sampleId) || samples[0];
  const cls = classify(lastReading.ph, uc);

  return (
    <div style={{ padding: '70px 18px 110px', background: '#FAFAFA', minHeight: '100%' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <Logo size={36} primary={primary} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onNotifications} style={{
            appearance: 'none', border: '0.5px solid rgba(0,0,0,.08)', background: '#fff',
            width: 38, height: 38, borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <Icon name="bell" size={16}/>
            <div style={{
              position: 'absolute', top: 9, right: 10, width: 6, height: 6,
              background: '#E0331D', borderRadius: 6, boxShadow: '0 0 0 1.5px #fff',
            }}/>
          </button>
          <div style={{
            width: 38, height: 38, borderRadius: 12, overflow: 'hidden',
            background: '#EDEDED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Outfit", sans-serif', fontWeight: 500, fontSize: 14,
          }}>JL</div>
        </div>
      </div>

      <div style={{ color: 'rgba(0,0,0,.5)', fontSize: 11, marginBottom: 4 }}>
        {samples.length} {uc.short.toLowerCase()}{samples.length > 1 ? 's' : ''} monitorando
      </div>
      <h1 style={{
        fontFamily: '"Outfit", sans-serif', fontWeight: 400, fontSize: 38,
        margin: 0, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 22,
      }}>Visão Geral</h1>

      {/* Hero glass card — latest reading */}
      <div style={{ marginBottom: 14, position: 'relative', height: 170 }}>
        {/* stacked offset cards (decorative) */}
        <div style={{
          position: 'absolute', right: -8, top: 10, width: '60%', height: 130,
          opacity: .35,
        }}>
          <GlassCard primary={primary} style={{ height: '100%' }} padding={14}>
            <div style={{ fontSize: 10, color: 'rgba(0,0,0,.5)' }}>ção · ravings</div>
          </GlassCard>
        </div>
        <div style={{
          position: 'absolute', right: -16, top: 18, width: '50%', height: 110,
          opacity: .5,
        }}>
          <GlassCard primary={primary} style={{ height: '100%' }} padding={14}>
            <div style={{ fontSize: 10, color: 'rgba(0,0,0,.5)' }}>ation savings</div>
          </GlassCard>
        </div>
        {/* main */}
        <GlassCard primary={primary} style={{ position: 'absolute', left: 0, top: 0, right: 16, height: 170 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(0,0,0,.7)', fontSize: 12, marginBottom: 14 }}>
            <Icon name="bolt" size={14} color="#0A0A0A"/>
            <span>Última leitura</span>
            <div style={{ flex: 1 }}/>
            <Icon name="arrowUR" size={14} color="rgba(0,0,0,.5)"/>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <div>
              <div style={{
                fontFamily: '"Outfit", sans-serif', fontWeight: 300, fontSize: 56,
                lineHeight: 1, color: '#0A0A0A', letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {lastReading.ph.toFixed(2).replace('.', ',')}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,.55)', marginTop: 4 }}>
                pH · {lastSample.name}
              </div>
            </div>
            <div style={{ flex: 1 }}/>
            <div style={{
              padding: '6px 10px', borderRadius: 999, background: '#0A0A0A',
              color: cls.color, fontSize: 11, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 6, background: cls.color }}/>
              {cls.label}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <PhSpectrum value={lastReading.ph} height={10} showScale={false} animate/>
          </div>
        </GlassCard>
      </div>

      {/* Sample selector chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 4, marginLeft: -18, paddingLeft: 18, paddingRight: 18 }}>
        {samples.map(s => (
          <Pill key={s.id} active={false} onClick={() => onSample(s.id)}>
            <span style={{ marginRight: 6, display: 'inline-flex', verticalAlign: 'middle' }}><Icon name={s.icon} size={14} strokeWidth={1.8}/></span>
            {s.name} · <span style={{ fontVariantNumeric: 'tabular-nums', marginLeft: 4 }}>{s.last.toFixed(2)}</span>
          </Pill>
        ))}
      </div>

      {/* Stat cards 2x */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <Card padding={16}>
          <CardHeader icon="droplet" label="Total leituras"/>
          <BigStat value={records.length || 24} unit="" size={36}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(0,0,0,.5)', marginTop: 14, marginBottom: 6 }}>
            <span>Semana</span>
            <span style={{ color: '#0A0A0A' }}>{Math.max(3, Math.floor((records.length || 12) * 0.4))}</span>
          </div>
          <MiniBar value={0.65} primary={primary}/>
        </Card>
        <Card padding={16}>
          <CardHeader icon="target" label="Em faixa"/>
          <BigStat value={'82,4'} unit="%" size={36}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(0,0,0,.5)', marginTop: 14, marginBottom: 6 }}>
            <span>Meta</span>
            <span style={{ color: '#0A0A0A' }}>90%</span>
          </div>
          <MiniBar value={0.824} primary={primary}/>
        </Card>
      </div>

      {/* pH trend card */}
      <Card padding={16} style={{ marginBottom: 10 }}>
        <CardHeader icon="trend" label="Tendência"/>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 14 }}>
          <BigStat value={avgPh.toFixed(2).replace('.', ',')} unit="" size={38}/>
          <div style={{ flex: 1 }}/>
          <div style={{ fontSize: 10, color: 'rgba(0,0,0,.5)' }}>Média geral</div>
        </div>
        <Sparkline data={(history[samples[0].id] || []).map(h => h.ph)} accent={primary} mode="bars" height={50}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(0,0,0,.45)', marginTop: 6 }}>
          <span>30d atrás</span><span>Hoje</span>
        </div>
      </Card>

      {/* CTA capture */}
      <button onClick={onCapture} style={{
        appearance: 'none', border: 'none', cursor: 'pointer',
        width: '100%', padding: '16px 18px', borderRadius: 22,
        background: '#0A0A0A', color: '#fff', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,.2)',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, background: primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="camera" size={18} color="#0A0A0A"/>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Nova leitura</div>
          <div style={{ fontSize: 11, opacity: .6 }}>Câmera · 3 fotos com flash</div>
        </div>
        <div style={{ flex: 1 }}/>
        <Icon name="chevR" size={18} color="#fff"/>
      </button>

      {/* Recent readings */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 4px 10px' }}>
        <div style={{
          fontFamily: '"Outfit", sans-serif', fontWeight: 400, fontSize: 20,
          letterSpacing: '-0.01em',
        }}>Histórico recente</div>
        <button style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'rgba(0,0,0,.55)' }}>
          Ver tudo
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {records.slice(0, 4).map((r, i) => {
          const sample = samples.find(s => s.id === r.sampleId) || samples[0];
          const c = classify(r.ph, uc);
          return (
            <Card key={r.id || i} padding={14} onClick={() => onOpenRecord(r)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: phToColor(r.ph),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)',
                  fontSize: 18,
                }}><Icon name={sample.icon} size={20} color="#0A0A0A" strokeWidth={1.8}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sample.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)' }}>
                    {formatRelative(r.ts)} · {c.label}
                  </div>
                </div>
                <div style={{
                  fontFamily: '"Outfit", sans-serif', fontWeight: 400, fontSize: 22,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                }}>{r.ph.toFixed(2).replace('.', ',')}</div>
                <Icon name="chevR" size={14} color="rgba(0,0,0,.3)"/>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function formatRelative(d) {
  if (!d) return '';
  const t = (typeof d === 'string') ? new Date(d) : d;
  const diff = (Date.now() - t.getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff/60)} min`;
  if (diff < 86400) return `${Math.floor(diff/3600)} h`;
  if (diff < 86400 * 7) return `${Math.floor(diff/86400)} d`;
  return t.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ──────────────────────────────────────────────────────────────
// Samples screen — list with detail per tank/pool
// ──────────────────────────────────────────────────────────────
function SamplesScreen({ uc, primary, history, onAdd, onOpen }) {
  return (
    <div style={{ padding: '70px 18px 110px', background: '#FAFAFA', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)' }}>Minhas amostras</div>
          <h1 style={{
            fontFamily: '"Outfit", sans-serif', fontWeight: 400, fontSize: 32,
            margin: '2px 0 0', letterSpacing: '-0.02em', lineHeight: 1,
          }}>{uc.name === 'Piscina & Spa' ? 'Piscinas' : 'Aquários'}</h1>
        </div>
        <button onClick={onAdd} style={{
          appearance: 'none', border: 'none', background: '#0A0A0A', cursor: 'pointer',
          width: 42, height: 42, borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="plus" size={18} color="#fff"/>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {uc.samples.map(s => {
          const hist = (history[s.id] || []).map(h => h.ph);
          const c = classify(s.last, uc);
          return (
            <Card key={s.id} padding={18} onClick={() => onOpen(s.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: phToColor(s.last),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)',
                }}><Icon name={s.icon} size={22} color="#0A0A0A" strokeWidth={1.8}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)' }}>{s.sub}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <BigStat value={s.last.toFixed(2).replace('.', ',')} unit="" size={26}/>
                  <div style={{
                    fontSize: 10, color: c.color, fontWeight: 500, marginTop: 2,
                  }}>{c.label}</div>
                </div>
              </div>
              <Sparkline data={hist} accent={primary} mode="bars" height={36}/>
              <div style={{
                marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 10, color: 'rgba(0,0,0,.5)',
              }}>
                <span>30 dias · {hist.length} leituras</span>
                <span style={{ color: s.trend >= 0 ? '#2EA38E' : '#E0331D', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name={s.trend >= 0 ? 'arrowUp' : 'arrowDown'} size={10} color="currentColor" strokeWidth={2.2}/>
                  {Math.abs(s.trend).toFixed(2)} pH
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Reminders screen
// ──────────────────────────────────────────────────────────────
function RemindersScreen({ uc, primary }) {
  const [list, setList] = useStateM(REMINDERS.filter(r => uc.samples.find(s => s.id === r.sampleId)));
  function toggle(id) {
    setList(list.map(r => r.id === id ? { ...r, on: !r.on } : r));
  }

  return (
    <div style={{ padding: '70px 18px 110px', background: '#FAFAFA', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)' }}>Agenda de testes</div>
          <h1 style={{
            fontFamily: '"Outfit", sans-serif', fontWeight: 400, fontSize: 32,
            margin: '2px 0 0', letterSpacing: '-0.02em', lineHeight: 1,
          }}>Lembretes</h1>
        </div>
        <button style={{
          appearance: 'none', border: 'none', background: '#0A0A0A', cursor: 'pointer',
          width: 42, height: 42, borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="plus" size={18} color="#fff"/>
        </button>
      </div>

      {/* This week glass card */}
      <GlassCard primary={primary} style={{ marginBottom: 14 }}>
        <CardHeader icon="calendar" label="Esta semana"/>
        <div style={{ display: 'flex', gap: 4 }}>
          {['S','T','Q','Q','S','S','D'].map((d, i) => {
            const has = i === 0 || i === 2 || i === 4;
            const isToday = i === 1;
            return (
              <div key={i} style={{
                flex: 1, textAlign: 'center', padding: '10px 0',
                borderRadius: 12,
                background: isToday ? '#0A0A0A' : 'transparent',
                color: isToday ? '#fff' : '#0A0A0A',
              }}>
                <div style={{ fontSize: 10, opacity: .6 }}>{d}</div>
                <div style={{
                  fontFamily: '"Outfit", sans-serif', fontWeight: 400, fontSize: 18, marginTop: 2,
                  letterSpacing: '-0.01em',
                }}>{12 + i}</div>
                <div style={{
                  width: 4, height: 4, borderRadius: 4, margin: '4px auto 0',
                  background: has ? (isToday ? primary : '#0A0A0A') : 'transparent',
                }}/>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div style={{ fontSize: 12, color: 'rgba(0,0,0,.55)', margin: '14px 4px 8px' }}>Próximos</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map(r => {
          const s = uc.samples.find(x => x.id === r.sampleId);
          if (!s) return null;
          return (
            <Card key={r.id} padding={14}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: phToColor(s.last),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}><Icon name={s.icon} size={20} color="#0A0A0A" strokeWidth={1.8}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)' }}>
                    {r.time} · {r.repeat}
                  </div>
                </div>
                <button onClick={() => toggle(r.id)} style={{
                  appearance: 'none', border: 'none', cursor: 'pointer',
                  width: 44, height: 26, borderRadius: 13,
                  background: r.on ? primary : '#EDEDED', padding: 2,
                  position: 'relative',
                  transition: 'background .2s',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 11,
                    background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                    marginLeft: r.on ? 18 : 0,
                    transition: 'margin-left .2s',
                  }}/>
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Profile / Settings
// ──────────────────────────────────────────────────────────────
function ProfileScreen({ uc, primary, mode, setMode }) {
  const totalReadings = 247;
  return (
    <div style={{ padding: '70px 18px 110px', background: '#FAFAFA', minHeight: '100%' }}>
      <h1 style={{
        fontFamily: '"Outfit", sans-serif', fontWeight: 400, fontSize: 32,
        margin: '0 0 22px', letterSpacing: '-0.02em', lineHeight: 1,
      }}>Perfil</h1>

      {/* User glass card */}
      <GlassCard primary={primary} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 18, background: '#0A0A0A',
            color: '#fff', fontFamily: '"Outfit", sans-serif', fontWeight: 400, fontSize: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>JL</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>Jordan Lee</div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,.5)' }}>jordan.l@hidroscan.io</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6,
              padding: '3px 8px', borderRadius: 999,
              background: 'rgba(10,10,10,.06)', color: 'rgba(10,10,10,.7)', fontSize: 10, fontWeight: 500,
            }}>
              <Icon name="shield" size={10}/> 100% offline
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, marginTop: 18, justifyContent: 'space-between' }}>
          {[
            { l: 'Leituras', v: totalReadings },
            { l: 'Amostras', v: uc.samples.length },
            { l: 'Sequência', v: '12d' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              <BigStat value={s.v} unit="" size={24}/>
              <div style={{ fontSize: 10, color: 'rgba(0,0,0,.5)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Mode toggle */}
      <Card padding={16} style={{ marginBottom: 10 }}>
        <CardHeader icon="droplet" label="Modo de uso" action={<span/>}/>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.values(USE_CASES).map(u => (
            <button key={u.id} onClick={() => setMode(u.id)} style={{
              appearance: 'none', border: 'none', cursor: 'pointer',
              flex: 1, padding: '12px 8px', borderRadius: 14,
              background: mode === u.id ? '#0A0A0A' : '#F4F4F4',
              color: mode === u.id ? '#fff' : '#0A0A0A',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              fontFamily: 'inherit',
            }}>
              <Icon name={u.samples[0].icon} size={22} color={mode === u.id ? '#fff' : '#0A0A0A'} strokeWidth={1.8}/>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{u.short}</span>
              <span style={{ fontSize: 10, opacity: .6 }}>{u.safeRange[0]}–{u.safeRange[1]}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Settings list */}
      <Card padding={0} style={{ marginBottom: 10 }}>
        {[
          { icon: 'shield', label: 'Calibração da câmera', sub: 'Última: há 3 dias' },
          { icon: 'flask',  label: 'Marca da tira de teste', sub: 'Universal 0–14' },
          { icon: 'bell',   label: 'Notificações',           sub: 'Alertas e lembretes' },
          { icon: 'history',label: 'Exportar histórico',     sub: 'CSV · PDF · gerados no aparelho' },
          { icon: 'shield', label: 'Privacidade dos dados',    sub: 'Tudo armazenado localmente' },
          { icon: 'info',   label: 'Sobre o Hidro Scan',     sub: 'v 1.4.0 · Gratuito e sem conta' },
        ].map((row, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 18px',
            borderBottom: i < arr.length - 1 ? '0.5px solid rgba(0,0,0,.06)' : 'none',
            cursor: 'pointer',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: '#F4F4F4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={row.icon} size={15}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{row.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)' }}>{row.sub}</div>
            </div>
            <Icon name="chevR" size={14} color="rgba(0,0,0,.3)"/>
          </div>
        ))}
      </Card>
    </div>
  );
}

Object.assign(window, {
  OnboardingScreen, HomeScreen, SamplesScreen, RemindersScreen, ProfileScreen,
  formatRelative,
});
