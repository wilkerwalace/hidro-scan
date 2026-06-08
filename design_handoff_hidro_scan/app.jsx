// app.jsx — Hidro Scan root. Routing, state, tweaks, adaptive primary color.

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

// Generate mock records mixing all samples for both use cases
function genMockRecords(uc) {
  const out = [];
  uc.samples.forEach((s, idx) => {
    const h = HISTORY[s.id] || [];
    h.slice(-6).forEach((entry, i) => {
      out.push({
        id: `mock-${s.id}-${i}`,
        sampleId: s.id,
        ph: entry.ph,
        ts: entry.date,
        photos: [phToColor(entry.ph), phToColor(entry.ph + 0.1), phToColor(entry.ph - 0.05)],
        confidence: 0.86 + Math.random() * 0.1,
      });
    });
  });
  return out.sort((a, b) => new Date(b.ts) - new Date(a.ts));
}

// Compute adaptive primary color based on average pH across all samples
function adaptiveColor(samples) {
  const avg = samples.reduce((a, s) => a + s.last, 0) / samples.length;
  // pull toward more saturated version
  const base = phToColor(avg);
  // slightly desaturate / brighten
  const [r, g, b] = hexToRgb(base);
  const mix = (c) => Math.round(c + (255 - c) * 0.18);
  return rgbToHex([mix(r), mix(g), mix(b)]);
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "useCase": "pool",
  "colorMode": "fixed",
  "showTutorial": false
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateA(t.showTutorial ? 'onboarding' : 'home');
  const [openRecord, setOpenRecord] = useStateA(null);
  const [records, setRecords] = useStateA([]); // user-added records
  const [useCaseId, setUseCaseId] = useStateA(t.useCase);

  // sync from tweaks
  useEffectA(() => { setUseCaseId(t.useCase); }, [t.useCase]);

  const uc = USE_CASES[useCaseId] || USE_CASES.pool;

  // Seed mock history per use case
  useEffectA(() => {
    setRecords(genMockRecords(uc));
  }, [useCaseId]);

  const primary = useMemoA(() => {
    if (t.colorMode === 'adaptive') return adaptiveColor(uc.samples);
    if (t.colorMode === 'alt')      return '#FFD66B'; // warm alt
    return '#76FB91';
  }, [t.colorMode, useCaseId]);

  // Water wave color always reflects the actual average pH (independent of primary)
  const avgPhColor = useMemoA(() => {
    const avg = uc.samples.reduce((a, s) => a + s.last, 0) / uc.samples.length;
    return phToColor(avg);
  }, [useCaseId]);

  function handleSave(record) {
    setRecords(prev => [record, ...prev]);
    setRoute('home');
  }

  function openDetail(r) {
    setOpenRecord(r);
    setRoute('detail');
  }

  // Bottom nav active
  const navId = ({ home: 'home', samples: 'samples', reminders: 'reminders', profile: 'profile' })[route];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      fontFamily: '"Outfit", sans-serif',
      background: '#FAFAFA',
      color: '#0A0A0A',
    }}>
      {/* CSS vars expose primary */}
      <style>{`:root { --hs-primary: ${primary}; }`}</style>

      {/* Routes */}
      {route === 'onboarding' && (
        <OnboardingScreen
          primary={primary}
          useCase={useCaseId}
          setUseCase={(id) => { setUseCaseId(id); setTweak('useCase', id); }}
          onDone={() => { setRoute('home'); setTweak('showTutorial', false); }}
        />
      )}

      {route === 'home' && (
        <HomeScreen
          uc={uc} primary={primary} history={HISTORY} records={records}
          onSample={() => setRoute('samples')}
          onCapture={() => setRoute('capture')}
          onOpenRecord={openDetail}
          onNotifications={() => setRoute('reminders')}
        />
      )}

      {route === 'samples' && (
        <SamplesScreen
          uc={uc} primary={primary} history={HISTORY}
          onAdd={() => setRoute('capture')}
          onOpen={() => setRoute('capture')}
        />
      )}

      {route === 'capture' && (
        <CaptureScreen
          uc={uc} primary={primary} defaultSample={uc.samples[0].id}
          onClose={() => setRoute('home')}
          onSave={handleSave}
        />
      )}

      {route === 'reminders' && (
        <RemindersScreen uc={uc} primary={primary} />
      )}

      {route === 'profile' && (
        <ProfileScreen
          uc={uc} primary={primary} mode={useCaseId}
          setMode={(id) => { setUseCaseId(id); setTweak('useCase', id); }}
        />
      )}

      {route === 'detail' && openRecord && (
        <DetailScreen
          uc={uc} primary={primary} record={openRecord}
          onBack={() => setRoute('home')}
        />
      )}

      {/* Ambient water waves (behind BottomNav, color tinted by avg pH) */}
      {['home','samples','reminders','profile'].includes(route) && (
        <WaterWaves color={avgPhColor} height={180} opacity={route === 'home' ? 1 : 0.6}/>
      )}

      {/* Bottom nav — visible on main screens */}
      {['home','samples','reminders','profile'].includes(route) && (
        <BottomNav
          current={navId}
          primary={primary}
          onNav={(id) => {
            if (id === 'capture') setRoute('capture');
            else setRoute(id);
          }}
        />
      )}

      {/* Tweaks panel */}
      <TweaksPanel>
        <TweakSection label="Configurações"/>
        <TweakSelect label="Caso de uso" value={useCaseId}
          options={[
            { value: 'pool',     label: 'Piscina & Spa' },
            { value: 'aquarium', label: 'Aquário' },
          ]}
          onChange={(v) => { setUseCaseId(v); setTweak('useCase', v); }} />
        <TweakSection label="Cor primária"/>
        <TweakRadio label="Modo" value={t.colorMode}
          options={[
            { value: 'fixed',    label: 'Verde' },
            { value: 'adaptive', label: 'pH adapt.' },
            { value: 'alt',      label: 'Quente' },
          ]}
          onChange={(v) => setTweak('colorMode', v)} />
        <div style={{
          display: 'flex', gap: 6, marginTop: 4, padding: '8px 10px', borderRadius: 10,
          background: 'rgba(0,0,0,.04)',
        }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: primary }}/>
          <div style={{ fontSize: 11, lineHeight: '22px', color: 'rgba(0,0,0,.6)' }}>
            {primary}
          </div>
        </div>
        <TweakSection label="Fluxo"/>
        <TweakButton label="Limpar histórico" onClick={() => setRecords(genMockRecords(uc))}/>
        <TweakButton label="Rever introdução"  onClick={() => setRoute('onboarding')}/>
      </TweaksPanel>
    </div>
  );
}

// Expose
window.App = App;
