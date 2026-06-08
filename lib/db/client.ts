import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";

// Não usamos useLiveQuery do Drizzle (enableChangeListener) — a referência
// documentou acúmulo de propriedades no objeto db sob Hermes. A reatividade
// da UI é feita por refetch no foco + dataVersion no store (useAppStore).
export const expoDb = openDatabaseSync("hidroscan.db");

export const db = drizzle(expoDb);

export { useMigrations, migrations };
