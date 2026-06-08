import { eq, desc, asc, inArray, and, gte, sql } from "drizzle-orm";
import { db } from "./client";
import { samples, readings, reminders, appConfig, type Sample, type Reading, type Reminder } from "./schema";
import { USE_CASES, type UseCaseId } from "../ph/spectrum";

const DAY_MS = 86_400_000;

export async function getSamples(useCase: UseCaseId): Promise<Sample[]> {
  // Ordem determinística (SQLite não garante ordem sem ORDER BY).
  return db
    .select()
    .from(samples)
    .where(eq(samples.useCase, useCase))
    .orderBy(asc(samples.createdAt), asc(samples.id));
}

export type CreateSampleInput = {
  name: string;
  sub: string;
  useCase: UseCaseId;
  icon: string;
  color: string;
};

// Cria um "Local de Amostra" (piscina/aquário monitorado).
export async function createSample(input: CreateSampleInput): Promise<string> {
  const id = `loc-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  await db.insert(samples).values({
    id,
    name: input.name,
    sub: input.sub,
    useCase: input.useCase,
    icon: input.icon,
    color: input.color,
    createdAt: Date.now(),
  });
  return id;
}

export async function getRecentReadings(useCase: UseCaseId, limit = 8): Promise<Reading[]> {
  const ss = await getSamples(useCase);
  const ids = ss.map((s) => s.id);
  if (!ids.length) return [];
  return db
    .select()
    .from(readings)
    .where(inArray(readings.sampleId, ids))
    .orderBy(desc(readings.ts))
    .limit(limit);
}

// Últimas n leituras de uma amostra (ordem cronológica para o sparkline).
export async function getSparkline(sampleId: string, n = 30): Promise<number[]> {
  const rows = await db
    .select({ ph: readings.ph })
    .from(readings)
    .where(eq(readings.sampleId, sampleId))
    .orderBy(desc(readings.ts))
    .limit(n);
  return rows.map((r) => r.ph).reverse();
}

export type SampleLatest = { sample: Sample; latest: Reading | null };

export type Overview = {
  total: number;
  weekTotal: number;
  percentInRange: number;
  avgPh: number;
  sparkline: number[];
  latest: Reading | null;
  samplesLatest: SampleLatest[];
};

// Estatísticas derivadas para a Visão Geral (agregações no SQL).
export async function getOverview(useCase: UseCaseId): Promise<Overview> {
  const uc = USE_CASES[useCase];
  const ss = await getSamples(useCase);
  const ids = ss.map((s) => s.id);

  if (!ids.length) {
    return { total: 0, weekTotal: 0, percentInRange: 0, avgPh: uc.ideal, sparkline: [], latest: null, samplesLatest: [] };
  }

  const [sLo, sHi] = uc.safeRange;

  // Totais e % em faixa agregados no SQL (sem trazer todas as leituras).
  const agg = await db
    .select({
      total: sql<number>`count(*)`,
      inRange: sql<number>`coalesce(sum(case when ${readings.ph} >= ${sLo} and ${readings.ph} <= ${sHi} then 1 else 0 end), 0)`,
    })
    .from(readings)
    .where(inArray(readings.sampleId, ids));
  const total = agg[0]?.total ?? 0;
  const inRange = agg[0]?.inRange ?? 0;
  const percentInRange = total ? (inRange / total) * 100 : 0;

  const weekAgo = Date.now() - 7 * DAY_MS;
  const wk = await db
    .select({ c: sql<number>`count(*)` })
    .from(readings)
    .where(and(inArray(readings.sampleId, ids), gte(readings.ts, weekAgo)));
  const weekTotal = wk[0]?.c ?? 0;

  // Última leitura geral (hero "Última leitura").
  const latestRows = await db
    .select()
    .from(readings)
    .where(inArray(readings.sampleId, ids))
    .orderBy(desc(readings.ts))
    .limit(1);
  const latest = latestRows[0] ?? null;

  // Última leitura por amostra; média geral só das amostras COM leitura.
  const samplesLatest: SampleLatest[] = [];
  const lastPhs: number[] = [];
  for (const s of ss) {
    const r = await db
      .select()
      .from(readings)
      .where(eq(readings.sampleId, s.id))
      .orderBy(desc(readings.ts))
      .limit(1);
    const lr = r[0] ?? null;
    samplesLatest.push({ sample: s, latest: lr });
    if (lr) lastPhs.push(lr.ph);
  }
  const avgPh = lastPhs.length ? lastPhs.reduce((a, b) => a + b, 0) / lastPhs.length : uc.ideal;

  // Sparkline da "Tendência": média diária de TODAS as amostras nos últimos 30 dias
  // (casa com avgPh = média geral, em vez do histórico de uma única amostra).
  const since = Date.now() - 30 * DAY_MS;
  const daily = await db
    .select({
      day: sql<number>`${readings.ts} / ${DAY_MS}`,
      avgPh: sql<number>`avg(${readings.ph})`,
    })
    .from(readings)
    .where(and(inArray(readings.sampleId, ids), gte(readings.ts, since)))
    .groupBy(sql`${readings.ts} / ${DAY_MS}`)
    .orderBy(sql`${readings.ts} / ${DAY_MS}`);
  const sparkline = daily.map((d) => Math.round(d.avgPh * 100) / 100);

  return { total, weekTotal, percentInRange, avgPh, sparkline, latest, samplesLatest };
}

export type SampleCard = {
  sample: Sample;
  last: number;
  trend: number;
  sparkline: number[];
  count: number;
};

// Cards da tela Amostras (sem carregar todo o histórico em memória).
export async function getSampleCards(useCase: UseCaseId): Promise<SampleCard[]> {
  const ss = await getSamples(useCase);
  const out: SampleCard[] = [];
  for (const s of ss) {
    const recentDesc = await db
      .select({ ph: readings.ph })
      .from(readings)
      .where(eq(readings.sampleId, s.id))
      .orderBy(desc(readings.ts))
      .limit(30);
    const phsDesc = recentDesc.map((r) => r.ph);
    const last = phsDesc[0] ?? 7;
    const prev = phsDesc[1] ?? last;

    const cnt = await db
      .select({ c: sql<number>`count(*)` })
      .from(readings)
      .where(eq(readings.sampleId, s.id));

    out.push({
      sample: s,
      last,
      trend: Math.round((last - prev) * 100) / 100,
      sparkline: [...phsDesc].reverse(),
      count: cnt[0]?.c ?? 0,
    });
  }
  return out;
}

export type ReadingDetail = { reading: Reading; sample: Sample | null };

export async function getReadingWithSample(id: string): Promise<ReadingDetail | null> {
  const rs = await db.select().from(readings).where(eq(readings.id, id)).limit(1);
  const reading = rs[0];
  if (!reading) return null;
  const ss = await db.select().from(samples).where(eq(samples.id, reading.sampleId)).limit(1);
  return { reading, sample: ss[0] ?? null };
}

export type SaveReadingInput = {
  sampleId: string;
  ph: number;
  confidence: number;
  photos: string[];
  stripModelId?: string;
  pads?: string[];
};

export async function saveReading(input: SaveReadingInput): Promise<string> {
  const id = `rec-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  await db.insert(readings).values({
    id,
    sampleId: input.sampleId,
    ph: input.ph,
    ts: Date.now(),
    confidence: input.confidence,
    photosJson: JSON.stringify(input.photos),
    stripModelId: input.stripModelId ?? null,
    padsJson: JSON.stringify(input.pads ?? input.photos),
  });
  return id;
}

export type ProfileStats = { totalReadings: number; samplesCount: number; streak: number };

export async function getProfileStats(useCase: UseCaseId): Promise<ProfileStats> {
  const ss = await getSamples(useCase);
  const ids = ss.map((s) => s.id);
  if (!ids.length) return { totalReadings: 0, samplesCount: 0, streak: 0 };

  const cnt = await db
    .select({ c: sql<number>`count(*)` })
    .from(readings)
    .where(inArray(readings.sampleId, ids));
  const totalReadings = cnt[0]?.c ?? 0;

  // Dias distintos com leitura (para o streak), agregados no SQL.
  const dayRows = await db
    .select({ day: sql<number>`${readings.ts} / ${DAY_MS}` })
    .from(readings)
    .where(inArray(readings.sampleId, ids))
    .groupBy(sql`${readings.ts} / ${DAY_MS}`);
  const days = new Set(dayRows.map((d) => d.day));

  let streak = 0;
  let d = Math.floor(Date.now() / DAY_MS);
  while (days.has(d)) {
    streak++;
    d--;
  }
  return { totalReadings, samplesCount: ss.length, streak };
}

export async function getReminders(useCase: UseCaseId): Promise<Reminder[]> {
  const ss = await getSamples(useCase);
  const ids = ss.map((s) => s.id);
  if (!ids.length) return [];
  return db
    .select()
    .from(reminders)
    .where(inArray(reminders.sampleId, ids))
    .orderBy(asc(reminders.hour), asc(reminders.minute), asc(reminders.createdAt));
}

export type CreateReminderInput = {
  sampleId: string;
  label: string;
  hour: number;
  minute: number;
  repeat: string;
  enabled: boolean;
  notifIds: string[];
};

export async function createReminder(input: CreateReminderInput): Promise<string> {
  const id = `rem-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  await db.insert(reminders).values({
    id,
    sampleId: input.sampleId,
    label: input.label,
    hour: input.hour,
    minute: input.minute,
    repeat: input.repeat,
    enabled: input.enabled ? 1 : 0,
    notifIds: JSON.stringify(input.notifIds),
    createdAt: Date.now(),
  });
  return id;
}

export async function updateReminder(
  id: string,
  patch: { enabled?: boolean; notifIds?: string[] }
): Promise<void> {
  const set: Partial<{ enabled: number; notifIds: string }> = {};
  if (patch.enabled !== undefined) set.enabled = patch.enabled ? 1 : 0;
  if (patch.notifIds !== undefined) set.notifIds = JSON.stringify(patch.notifIds);
  if (Object.keys(set).length === 0) return;
  await db.update(reminders).set(set).where(eq(reminders.id, id));
}

export async function deleteReminder(id: string): Promise<void> {
  await db.delete(reminders).where(eq(reminders.id, id));
}

// Apaga TODOS os dados locais (locais, leituras, lembretes e configurações).
export async function clearAllData(): Promise<void> {
  await db.delete(readings);
  await db.delete(reminders);
  await db.delete(samples);
  await db.delete(appConfig);
}
