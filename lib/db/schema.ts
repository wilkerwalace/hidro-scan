import { sqliteTable, text, real, integer, index } from "drizzle-orm/sqlite-core";

// ============================================================
// CONFIGURAÇÃO DO APP (kv simples: useCase, colorMode, onboarded)
// ============================================================
export const appConfig = sqliteTable("app_config", {
  key: text().primaryKey(),
  value: text().notNull(),
});

// ============================================================
// AMOSTRAS (piscinas / aquários monitorados)
// ============================================================
export const samples = sqliteTable(
  "samples",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    sub: text().notNull().default(""),
    useCase: text("use_case").notNull(), // 'pool' | 'aquarium'
    icon: text().notNull(),
    color: text().notNull().default("#5DBE6E"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("idx_samples_usecase").on(t.useCase)]
);

// ============================================================
// LEITURAS (registros de pH)
// ============================================================
export const readings = sqliteTable(
  "readings",
  {
    id: text().primaryKey(),
    sampleId: text("sample_id").notNull(),
    ph: real().notNull(),
    ts: integer().notNull(), // unix ms
    confidence: real().notNull().default(0.9),
    photosJson: text("photos_json").notNull().default("[]"), // cores das fotos
    stripModelId: text("strip_model_id"), // modelo de tira usado na leitura
    padsJson: text("pads_json").notNull().default("[]"), // cores dos N campos lidos
  },
  (t) => [
    index("idx_readings_sample").on(t.sampleId),
    index("idx_readings_ts").on(t.ts),
  ]
);

// ============================================================
// LEMBRETES (agenda de testes)
// ============================================================
export const reminders = sqliteTable("reminders", {
  id: text().primaryKey(),
  sampleId: text("sample_id").notNull(),
  label: text().notNull(),
  time: text().notNull().default(""), // legado (não usado)
  repeat: text().notNull().default(""), // 'daily' | 'twice_week' | 'weekly'
  enabled: integer().notNull().default(1), // 0 | 1
  hour: integer().notNull().default(8),
  minute: integer().notNull().default(0),
  notifIds: text("notif_ids").notNull().default("[]"), // ids das notificações agendadas
  createdAt: integer("created_at").notNull().default(0),
});

export type AppConfigRow = typeof appConfig.$inferSelect;
export type Sample = typeof samples.$inferSelect;
export type SampleInsert = typeof samples.$inferInsert;
export type Reading = typeof readings.$inferSelect;
export type ReadingInsert = typeof readings.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type ReminderInsert = typeof reminders.$inferInsert;
