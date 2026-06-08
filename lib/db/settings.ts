import { db } from "./client";
import { appConfig } from "./schema";

// Persistência de configurações simples (kv) na tabela app_config.
export async function loadSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(appConfig);
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function saveSetting(key: string, value: string): Promise<void> {
  await db
    .insert(appConfig)
    .values({ key, value })
    .onConflictDoUpdate({ target: appConfig.key, set: { value } });
}
