// lib/notifications.ts — Notificações push DESATIVADAS por enquanto.
//
// Não importamos `expo-notifications` (evita depender do módulo nativo, que exige
// recompilar o dev client). Os lembretes ficam salvos localmente; o disparo de
// notificação será reativado depois — basta restaurar o uso de expo-notifications
// nestas funções, mantendo a mesma API.

export type Repeat = "daily" | "twice_week" | "weekly";

export const NOTIFICATIONS_ENABLED = false;

export async function notificationsAvailable(): Promise<boolean> {
  return false;
}

// Sem push por enquanto: tratamos como "ok" para o lembrete ficar salvo/ativo.
export async function ensureNotificationPermission(): Promise<boolean> {
  return true;
}

export async function scheduleReminder(_opts: {
  hour: number;
  minute: number;
  repeat: Repeat;
  title: string;
  body: string;
}): Promise<string[]> {
  return [];
}

export async function cancelNotifications(_ids: string[]): Promise<void> {
  // no-op enquanto o push está desativado
}

export function repeatLabel(repeat: string): string {
  if (repeat === "daily") return "Diário";
  if (repeat === "twice_week") return "2x semana";
  if (repeat === "weekly") return "Semanal";
  return repeat;
}
