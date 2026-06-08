// data.js — Hidro Scan: pH science, mock data, recommendations, use case copy

// ──────────────────────────────────────────────────────────────
// pH color spectrum (universal indicator strip approximation)
// ──────────────────────────────────────────────────────────────
const PH_STOPS = [
  { ph: 0,  color: '#C71F2D' },
  { ph: 1,  color: '#E0331D' },
  { ph: 2,  color: '#EC5A1B' },
  { ph: 3,  color: '#F08A1B' },
  { ph: 4,  color: '#F1B72A' },
  { ph: 5,  color: '#D6C736' },
  { ph: 6,  color: '#A6CA47' },
  { ph: 7,  color: '#5DBE6E' },
  { ph: 8,  color: '#2EA38E' },
  { ph: 9,  color: '#2477B0' },
  { ph: 10, color: '#2456B3' },
  { ph: 11, color: '#3A3AAE' },
  { ph: 12, color: '#5331A4' },
  { ph: 13, color: '#5A1F84' },
  { ph: 14, color: '#3F1456' },
];

function hexToRgb(h) {
  const x = h.replace('#', '');
  return [parseInt(x.slice(0,2),16), parseInt(x.slice(2,4),16), parseInt(x.slice(4,6),16)];
}
function rgbToHex([r,g,b]) {
  const c = (n) => Math.round(Math.max(0,Math.min(255,n))).toString(16).padStart(2,'0');
  return '#' + c(r) + c(g) + c(b);
}
function lerp(a, b, t) { return a + (b - a) * t; }

function phToColor(ph) {
  ph = Math.max(0, Math.min(14, ph));
  const i = Math.floor(ph);
  const t = ph - i;
  const a = hexToRgb(PH_STOPS[Math.min(i,13)].color);
  const b = hexToRgb(PH_STOPS[Math.min(i+1,14)].color);
  return rgbToHex([lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t)]);
}

// CSS gradient for full strip
const PH_GRADIENT = `linear-gradient(90deg, ${PH_STOPS.map((s,i)=>`${s.color} ${(i/14)*100}%`).join(', ')})`;

// ──────────────────────────────────────────────────────────────
// Use cases (caso de uso) — alternable via Tweaks
// ──────────────────────────────────────────────────────────────
const USE_CASES = {
  pool: {
    id: 'pool',
    name: 'Piscina & Spa',
    short: 'Piscina',
    sampleLabel: 'Piscina',
    safeRange: [7.2, 7.6],
    okRange:   [7.0, 7.8],
    ideal: 7.4,
    intro: 'Mantenha a piscina cristalina e segura para nadar.',
    samples: [
      { id: 's1', name: 'Piscina principal', sub: 'Quintal · 32m³',  icon: 'pool',   last: 7.42, trend: 0.05, color: '#5DBE6E' },
      { id: 's2', name: 'Spa aquecido',      sub: 'Varanda · 1.8m³',    icon: 'spa',    last: 7.78, trend: 0.21, color: '#2EA38E' },
      { id: 's3', name: 'Piscina infantil',  sub: 'Jardim · 0.6m³',  icon: 'wading', last: 6.92, trend: -0.18, color: '#A6CA47' },
    ],
    tips: {
      low:  { title: 'Adicionar barrilha leve',   body: 'pH abaixo de 7.2 acelera corrosão e irrita olhos. Adicione 80g de bicarbonato de sódio por m³ e re-teste em 6h.' },
      ok:   { title: 'Faixa ideal mantida',        body: 'Continue com a rotina semanal. Cloro livre deve seguir entre 1–3 ppm.' },
      high: { title: 'Reduzir com ácido muriático', body: 'pH acima de 7.6 reduz eficácia do cloro. Adicione 25ml/m³ de redutor de pH e teste em 4h.' },
    },
  },
  aquarium: {
    id: 'aquarium',
    name: 'Aquário',
    short: 'Aquário',
    sampleLabel: 'Aquário',
    safeRange: [6.8, 7.4],
    okRange:   [6.5, 7.8],
    ideal: 7.0,
    intro: 'Monitore o pH para a saúde dos seus peixes e plantas.',
    samples: [
      { id: 'a1', name: 'Plantado 200L', sub: 'Sala · CO² ativo',     icon: 'plant', last: 6.84, trend: -0.06, color: '#A6CA47' },
      { id: 'a2', name: 'Marinho recifal',  sub: 'Escritório · 150L',     icon: 'fish',  last: 8.22, trend: 0.04,  color: '#2477B0' },
      { id: 'a3', name: 'Bettário',      sub: 'Quarto · 5L individual', icon: 'betta', last: 7.05, trend: 0.02,  color: '#5DBE6E' },
    ],
    tips: {
      low:  { title: 'Aumentar dureza KH',  body: 'Adicione 1 colher de bicarbonato dissolvido para 50L. Faça TPA de 10% antes para diluir orgânicos.' },
      ok:   { title: 'pH estável',           body: 'Os habitantes estão confortáveis. Monitore semanalmente e observe coloração e apetite.' },
      high: { title: 'Reduzir com troca parcial', body: 'TPA de 20% com água osmose por 3 dias. Verifique se substrato calcário está elevando dureza.' },
    },
  },
};

// ──────────────────────────────────────────────────────────────
// History — last 30 days per sample
// ──────────────────────────────────────────────────────────────
function genHistory(seed, base, jitter = 0.25) {
  const out = [];
  let v = base;
  for (let i = 29; i >= 0; i--) {
    const noise = (Math.sin(seed + i * 0.7) + Math.cos(seed * 1.3 + i * 0.4)) * 0.5;
    v = base + noise * jitter;
    const d = new Date(); d.setDate(d.getDate() - i);
    out.push({ date: d, ph: Math.round(v * 100) / 100 });
  }
  return out;
}

const HISTORY = {
  s1: genHistory(3.1, 7.4, 0.18),
  s2: genHistory(5.2, 7.65, 0.22),
  s3: genHistory(7.8, 6.95, 0.28),
  a1: genHistory(2.4, 6.85, 0.12),
  a2: genHistory(4.9, 8.2, 0.15),
  a3: genHistory(6.3, 7.05, 0.2),
};

// ──────────────────────────────────────────────────────────────
// pH classification
// ──────────────────────────────────────────────────────────────
function classify(ph, useCase) {
  const [sLo, sHi] = useCase.safeRange;
  const [oLo, oHi] = useCase.okRange;
  if (ph >= sLo && ph <= sHi) return { level: 'ideal', label: 'Ideal',  color: '#5DBE6E' };
  if (ph >= oLo && ph <= oHi) return { level: 'ok',    label: 'Aceitável', color: '#D6C736' };
  if (ph < oLo)              return { level: 'low',   label: 'Ácido',    color: '#E0331D' };
  return                       { level: 'high',  label: 'Básico',   color: '#3A3AAE' };
}

function recommendation(ph, useCase) {
  const c = classify(ph, useCase);
  if (c.level === 'low')   return useCase.tips.low;
  if (c.level === 'high')  return useCase.tips.high;
  return useCase.tips.ok;
}

// ──────────────────────────────────────────────────────────────
// Reminders
// ──────────────────────────────────────────────────────────────
const REMINDERS = [
  { id: 'r1', sampleId: 's1', label: 'Piscina principal',  time: 'Hoje · 18:00',     repeat: 'Diário',   on: true  },
  { id: 'r2', sampleId: 's2', label: 'Spa aquecido',        time: 'Amanhã · 09:00',   repeat: '2x semana', on: true  },
  { id: 'r3', sampleId: 'a1', label: 'Plantado 200L',       time: 'Quinta · 20:30',   repeat: 'Semanal',   on: false },
  { id: 'r4', sampleId: 'a2', label: 'Marinho recifal',        time: 'Hoje · 22:00',     repeat: 'Diário',   on: true  },
];

// ──────────────────────────────────────────────────────────────
// Make globally available to JSX files
// ──────────────────────────────────────────────────────────────
Object.assign(window, {
  PH_STOPS, PH_GRADIENT, phToColor, USE_CASES, HISTORY, REMINDERS,
  classify, recommendation, hexToRgb, rgbToHex,
});
