// components.jsx — Hidro Scan shared UI primitives
// Visual DNA: Outfit, white cards with rounded corners, glassmorphism green
// gradient cards with animated drift, mini progress bars w/ black/green accents.

const { useEffect, useRef, useState, useMemo } = React;

// ──────────────────────────────────────────────────────────────
// Tiny icon set — strokeWidth-consistent line icons
// ──────────────────────────────────────────────────────────────
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.6 }) {
  const p = { stroke: color, fill: 'none', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const map = {
    bell: <><path {...p} d="M6 8a6 6 0 1112 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z"/><path {...p} d="M10 18a2 2 0 004 0"/></>,
    settings: <><circle cx="12" cy="12" r="3" {...p}/><path {...p} d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.8a7 7 0 00-2-1.2L14 3h-4l-.6 2.5a7 7 0 00-2 1.2l-2.3-.8-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.8a7 7 0 002 1.2L10 21h4l.6-2.5a7 7 0 002-1.2l2.3.8 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></>,
    home: <><path {...p} d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-3v-7H8v7H5a2 2 0 01-2-2z"/></>,
    drop: <><path {...p} d="M12 3s-6 7-6 11a6 6 0 1012 0c0-4-6-11-6-11z"/></>,
    bolt: <><path {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></>,
    plus: <><path {...p} d="M12 5v14M5 12h14"/></>,
    chevR: <><path {...p} d="M9 6l6 6-6 6"/></>,
    chevL: <><path {...p} d="M15 6l-6 6 6 6"/></>,
    arrowUR: <><path {...p} d="M7 17L17 7M9 7h8v8"/></>,
    camera: <><path {...p} d="M3 7h3l2-2h8l2 2h3v12H3z"/><circle cx="12" cy="13" r="4" {...p}/></>,
    flash: <><path {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></>,
    flashOff: <><path {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/><path {...p} d="M3 3l18 18"/></>,
    clock: <><circle cx="12" cy="12" r="9" {...p}/><path {...p} d="M12 7v5l3 2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" {...p}/><path {...p} d="M8 3v4M16 3v4M3 11h18"/></>,
    user: <><circle cx="12" cy="8" r="4" {...p}/><path {...p} d="M4 21a8 8 0 0116 0"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.4" {...p}/><rect x="14" y="3" width="7" height="7" rx="1.4" {...p}/><rect x="3" y="14" width="7" height="7" rx="1.4" {...p}/><rect x="14" y="14" width="7" height="7" rx="1.4" {...p}/></>,
    chart: <><path {...p} d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-7"/></>,
    flask: <><path {...p} d="M9 3v6L4 19a2 2 0 002 2h12a2 2 0 002-2L15 9V3"/><path {...p} d="M9 3h6"/></>,
    droplet: <><path {...p} d="M12 3s-7 8-7 13a7 7 0 1014 0c0-5-7-13-7-13z"/></>,
    check: <><path {...p} d="M5 12l5 5L20 7"/></>,
    x: <><path {...p} d="M6 6l12 12M18 6L6 18"/></>,
    target: <><circle cx="12" cy="12" r="9" {...p}/><circle cx="12" cy="12" r="5" {...p}/><circle cx="12" cy="12" r="1" {...p}/></>,
    info: <><circle cx="12" cy="12" r="9" {...p}/><path {...p} d="M12 8v.5M12 11v5"/></>,
    sparkle: <><path {...p} d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8z"/></>,
    history: <><path {...p} d="M3 12a9 9 0 109-9c-3 0-5.5 1.5-7 3.5"/><path {...p} d="M3 4v4h4M12 8v4l3 2"/></>,
    trend: <><path {...p} d="M3 17l6-6 4 4 8-8"/><path {...p} d="M14 7h7v7"/></>,
    expand: <><path {...p} d="M4 10V4h6M14 4h6v6M4 14v6h6M14 20h6v-6"/></>,
    shield: <><path {...p} d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/></>,
    pool: <><rect x="3" y="8" width="18" height="12" rx="2" {...p}/><path {...p} d="M3 12c2-1 4-1 6 0s4 1 6 0 4-1 6 0"/><path {...p} d="M3 16c2-1 4-1 6 0s4 1 6 0 4-1 6 0"/></>,
    spa: <><path {...p} d="M4 11h16M5 11v6a3 3 0 003 3h8a3 3 0 003-3v-6"/><path {...p} d="M9 4c1 1.5 1 3 0 4M13 4c1 1.5 1 3 0 4"/></>,
    wading: <><circle cx="12" cy="13" r="7" {...p}/><path {...p} d="M7 13c2-1 3-1 5 0s3 1 5 0"/></>,
    plant: <><path {...p} d="M12 21V11"/><path {...p} d="M12 11C12 6 8 4 4 4c0 4 2 8 8 8M12 11c0-5 4-7 8-7 0 4-2 8-8 7"/></>,
    fish: <><path {...p} d="M17 8c-4 0-9 1.5-11 4 2 2.5 7 4 11 4l3-4z"/><circle cx="13" cy="11" r=".8" fill={color} stroke="none"/><path {...p} d="M6 12L3 9M6 12l-3 3"/></>,
    betta: <><path {...p} d="M14 8c-3 0-6 1.5-8 4 2 2.5 5 4 8 4l2-4z"/><path {...p} d="M16 8l4-3v14l-4-3"/><circle cx="11" cy="11" r=".8" fill={color} stroke="none"/></>,
    arrowUp: <><path {...p} d="M12 19V5M5 12l7-7 7 7"/></>,
    arrowDown: <><path {...p} d="M12 5v14M5 12l7 7 7-7"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
      {map[name] || null}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// GlassCard — green gradient w/ animated drift + radial pulse
// ──────────────────────────────────────────────────────────────
function GlassCard({ children, primary = '#76FB91', style = {}, intensity = 1, padding = 22 }) {
  return (
    <div style={{
      position: 'relative', borderRadius: 24, overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 8px 24px rgba(0,0,0,.05)',
      isolation: 'isolate',
      transform: 'translateZ(0)',
      WebkitMaskImage: '-webkit-radial-gradient(white, black)',
      ...style,
    }}>
      {/* Layer 1: drifting blurred orbs (clipped) */}
      <div className="hs-glass-orbs" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        opacity: intensity, borderRadius: 24, overflow: 'hidden',
      }}>
        <div className="hs-orb hs-orb-a" style={{ background: primary }} />
        <div className="hs-orb hs-orb-b" style={{ background: primary }} />
        <div className="hs-orb hs-orb-c" style={{ background: primary }} />
      </div>
      {/* Layer 2: glass frost overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,.55) 100%)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        pointerEvents: 'none',
      }} />
      {/* Layer 3: subtle border highlight */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.7), inset 0 1px 0 rgba(255,255,255,.9)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', padding, zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// White card (standard)
// ──────────────────────────────────────────────────────────────
function Card({ children, style = {}, padding = 20, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 22, padding,
      boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 1px 0 rgba(255,255,255,.5) inset',
      border: '0.5px solid rgba(0,0,0,.04)',
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}>{children}</div>
  );
}

// ──────────────────────────────────────────────────────────────
// MiniProgressBar — black filled segment + small green tick +
// hatched remainder (signature element from inspiration)
// ──────────────────────────────────────────────────────────────
function MiniBar({ value = 0.5, height = 6, primary = '#76FB91', animate = false }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div style={{
      position: 'relative', height, borderRadius: height, overflow: 'hidden',
      background: '#EDEDED',
    }}>
      {/* hatched remainder */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.45,
        background: `repeating-linear-gradient(90deg, transparent 0 2px, #C8C8C8 2px 3px)`,
      }} />
      {/* black fill */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: `${pct * 100}%`, background: '#0A0A0A',
        borderRadius: height,
        transition: animate ? 'width .6s cubic-bezier(.4,1.2,.4,1)' : 'none',
      }} />
      {/* green accent tick */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: `calc(${pct * 100}% - 2px)`,
        width: 4, background: primary, borderRadius: 2,
        boxShadow: `0 0 0 1px ${primary}`,
        transition: animate ? 'left .6s cubic-bezier(.4,1.2,.4,1)' : 'none',
      }} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// pH Spectrum Bar — full universal-indicator gradient w/ marker
// ──────────────────────────────────────────────────────────────
function PhSpectrum({ value = 7, height = 14, showScale = true, animate = false }) {
  const pct = (Math.max(0, Math.min(14, value)) / 14) * 100;
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        height, borderRadius: height / 2, background: PH_GRADIENT,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)', position: 'relative', overflow: 'hidden',
      }}>
        {/* subtle wave shimmer */}
        <div className="hs-shimmer" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.35) 50%, transparent 100%)',
          mixBlendMode: 'overlay',
        }} />
      </div>
      {/* marker */}
      <div style={{
        position: 'absolute', top: -4, bottom: -4,
        left: `calc(${pct}% - 2px)`, width: 4,
        background: '#0A0A0A', borderRadius: 2,
        boxShadow: '0 0 0 2px #fff, 0 2px 6px rgba(0,0,0,.25)',
        transition: animate ? 'left .8s cubic-bezier(.4,1.2,.4,1)' : 'none',
      }} />
      {showScale && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 6,
          color: 'rgba(0,0,0,.4)', fontSize: 9, letterSpacing: '.05em',
        }}>
          {[0, 3.5, 7, 10.5, 14].map(n => <span key={n}>{n}</span>)}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Logo — Hidro Scan: water drop w/ inner ring
// ──────────────────────────────────────────────────────────────
function Logo({ size = 36, primary = '#76FB91' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${primary} 0%, #C8FFD6 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 2px 6px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.6)',
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
        <path d="M12 3s-7 8-7 13a7 7 0 1014 0c0-5-7-13-7-13z"
              fill="#0A0A0A" />
        <circle cx="9.5" cy="14" r="1.6" fill="rgba(255,255,255,.5)"/>
      </svg>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pill button
// ──────────────────────────────────────────────────────────────
function Pill({ children, active, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', border: 'none', cursor: 'pointer',
      background: active ? '#0A0A0A' : 'rgba(255,255,255,.7)',
      color: active ? '#fff' : '#0A0A0A',
      padding: '8px 16px', borderRadius: 999, fontSize: 13,
      fontFamily: 'inherit', fontWeight: 500,
      boxShadow: active ? '0 2px 6px rgba(0,0,0,.15)' : '0 0 0 0.5px rgba(0,0,0,.08)',
      transition: 'all .2s ease', whiteSpace: 'nowrap',
      ...style,
    }}>{children}</button>
  );
}

// ──────────────────────────────────────────────────────────────
// BottomNav — 5 slots, center is FAB (camera)
// ──────────────────────────────────────────────────────────────
function BottomNav({ current, onNav, primary = '#76FB91' }) {
  const items = [
    { id: 'home',      icon: 'grid' },
    { id: 'samples',   icon: 'droplet' },
    { id: 'capture',   icon: 'camera', fab: true },
    { id: 'reminders', icon: 'calendar' },
    { id: 'profile',   icon: 'user' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 20, left: 12, right: 12, zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(255,255,255,.85)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      borderRadius: 28, padding: '8px 14px',
      boxShadow: '0 8px 28px rgba(0,0,0,.08), 0 0 0 0.5px rgba(0,0,0,.05)',
    }}>
      {items.map(it => {
        const active = current === it.id;
        if (it.fab) {
          return (
            <button key={it.id} onClick={() => onNav(it.id)} style={{
              appearance: 'none', border: 'none',
              width: 52, height: 52, borderRadius: 18, cursor: 'pointer',
              background: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', position: 'relative', marginTop: -28,
              boxShadow: `0 8px 18px rgba(10,10,10,.35), inset 0 0 0 2px ${primary}33`,
            }}>
              <Icon name="camera" size={22} color="#fff" />
              <div style={{
                position: 'absolute', inset: -4, borderRadius: 22,
                background: `radial-gradient(circle, ${primary}55 0%, transparent 70%)`,
                pointerEvents: 'none', zIndex: -1,
              }} />
            </button>
          );
        }
        return (
          <button key={it.id} onClick={() => onNav(it.id)} style={{
            appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
            width: 44, height: 44, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: active ? '#0A0A0A' : 'rgba(10,10,10,.35)',
            position: 'relative',
          }}>
            <Icon name={it.icon} size={22} color="currentColor" strokeWidth={active ? 2 : 1.6}/>
            {active && (
              <div style={{
                position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 4,
                background: primary,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Header — small icon + label + title
// ──────────────────────────────────────────────────────────────
function CardHeader({ icon, label, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(10,10,10,.55)', fontSize: 12, minWidth: 0, flex: '1 1 auto' }}>
        {icon && (
          <span style={{
            display: 'inline-flex', width: 22, height: 22, borderRadius: 7,
            background: 'rgba(10,10,10,.06)', flexShrink: 0,
            alignItems: 'center', justifyContent: 'center', color: '#0A0A0A',
          }}>
            <Icon name={icon} size={13} strokeWidth={1.8}/>
          </span>
        )}
        <span style={{ whiteSpace: 'nowrap', minWidth: 0 }}>{label}</span>
      </div>
      <span style={{ flexShrink: 0, display: 'inline-flex' }}>
        {action || <Icon name="arrowUR" size={14} color="rgba(0,0,0,.4)" />}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Big stat number with superscript unit
// ──────────────────────────────────────────────────────────────
function BigStat({ value, unit = '%', size = 48, color = '#0A0A0A' }) {
  return (
    <div style={{
      fontFamily: '"Outfit", sans-serif', fontWeight: 300, fontSize: size,
      lineHeight: 1, color, letterSpacing: '-0.02em', display: 'inline-flex', alignItems: 'flex-start',
    }}>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <sup style={{ fontSize: size * 0.32, marginTop: 2, marginLeft: 2, fontWeight: 400 }}>{unit}</sup>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sparkline — simple SVG line + bars
// ──────────────────────────────────────────────────────────────
function Sparkline({ data, height = 56, color = '#0A0A0A', accent = '#76FB91', mode = 'bars' }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data) + 0.2;
  const min = Math.min(...data) - 0.2;
  const range = Math.max(0.1, max - min);
  if (mode === 'line') {
    const w = 100;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth={1.2}/>
      </svg>
    );
  }
  // bars mode
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height, width: '100%' }}>
      {data.map((v, i) => {
        const h = ((v - min) / range) * (height - 4) + 4;
        const isLast = i === data.length - 1;
        const isAcc = i === data.length - 2 || i === data.length - 3;
        return (
          <div key={i} style={{
            flex: 1, minWidth: 1,
            height: h, borderRadius: 1,
            background: isLast ? accent : (isAcc ? '#0A0A0A' : 'rgba(10,10,10,.18)'),
          }}/>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Arc gauge — for Synced Records-style display
// ──────────────────────────────────────────────────────────────
function ArcGauge({ value = 0.7, primary = '#76FB91', size = 130 }) {
  const r = size * 0.42;
  const cx = size / 2, cy = size * 0.55;
  const start = Math.PI; // 180deg
  const end = 0;
  const a = start - (start - end) * value;
  const x = cx + Math.cos(a) * r;
  const y = cy + Math.sin(a) * r;
  const largeArc = value > 0.5 ? 1 : 0;
  const sx = cx + Math.cos(start) * r;
  const sy = cy + Math.sin(start) * r;
  return (
    <svg width={size} height={size * 0.66} viewBox={`0 0 ${size} ${size * 0.66}`}>
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${cx + Math.cos(end)*r} ${cy + Math.sin(end)*r}`}
            fill="none" stroke="#EDEDED" strokeWidth={6} strokeLinecap="round"/>
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y}`}
            fill="none" stroke="#0A0A0A" strokeWidth={6} strokeLinecap="round"/>
      <circle cx={x} cy={y} r={5} fill={primary} stroke="#fff" strokeWidth={1.5}/>
    </svg>
  );
}

// Export to window
Object.assign(window, {
  Icon, GlassCard, Card, MiniBar, PhSpectrum, Logo, Pill, BottomNav,
  CardHeader, BigStat, Sparkline, ArcGauge, WaterWaves,
});

// ──────────────────────────────────────────────────────────────
// WaterWaves — ambient animated wave layers at the bottom of the
// viewport. Three SVG paths at different speeds, opacity-stacked,
// tinted by the average pH color.
// ──────────────────────────────────────────────────────────────
function WaterWaves({ color = '#76FB91', height = 200, opacity = 1 }) {
  // Path: 4 sine cycles 0→2400 viewBox, period 600 — seamless when
  // translateX shifts by exactly one period (-25% of 200% width = -50%).
  const wavePath = (yMid, amp) =>
    `M0,${yMid} `
    + [0,1,2,3].map(i => {
        const x1 = i * 600 + 150,  y1 = yMid - amp;
        const x2 = i * 600 + 300,  y2 = yMid;
        const x3 = i * 600 + 450,  y3 = yMid + amp;
        const x4 = i * 600 + 600,  y4 = yMid;
        return `Q ${x1},${y1} ${x2},${y2} Q ${x3},${y3} ${x4},${y4}`;
      }).join(' ')
    + ` L 2400,200 L 0,200 Z`;

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      {/* subtle radial fade to blend top edge */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, transparent 0%, ${color}10 60%, ${color}25 100%)`,
        opacity,
      }}/>
      <svg className="hs-wv hs-wv-back" viewBox="0 0 2400 200" preserveAspectRatio="none"
           style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', height: '100%' }}>
        <path d={wavePath(120, 22)} fill={color} fillOpacity={0.16 * opacity}/>
      </svg>
      <svg className="hs-wv hs-wv-mid" viewBox="0 0 2400 200" preserveAspectRatio="none"
           style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', height: '100%' }}>
        <path d={wavePath(140, 18)} fill={color} fillOpacity={0.22 * opacity}/>
      </svg>
      <svg className="hs-wv hs-wv-front" viewBox="0 0 2400 200" preserveAspectRatio="none"
           style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', height: '100%' }}>
        <path d={wavePath(160, 14)} fill={color} fillOpacity={0.32 * opacity}/>
      </svg>
      {/* tiny bubbles drifting up */}
      <div className="hs-bubbles" style={{ position: 'absolute', inset: 0 }}>
        {[0,1,2,3,4].map(i => (
          <span key={i} className={`hs-bubble hs-b${i}`} style={{ background: color }}/>
        ))}
      </div>
    </div>
  );
}
