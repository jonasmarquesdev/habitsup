import dayjs from "@/lib/dayjs";

/**
 * Utilitários para garantir consistência no tratamento de datas
 * Todas as datas são normalizadas para UTC para evitar problemas de timezone
 */

export function normalizeDate(date: Date | string): Date {
  return dayjs(date).utc().startOf('day').toDate();
}

export function formatDateForComparison(date: Date | string): string {
  return dayjs(date).utc().format('YYYY-MM-DD');
}

export function isDateInPast(date: Date | string): boolean {
  return dayjs(date).utc().startOf('day').isBefore(dayjs().utc().startOf('day'));
}

export function getCurrentDayUTC(): Date {
  return dayjs().utc().startOf('day').toDate();
}

export function formatDateDisplay(date: Date | string): string {
  return dayjs(date).utc().format('DD/MM');
}

export function formatDayOfWeek(date: Date | string): string {
  return dayjs(date).utc().locale('pt-br').format('dddd').toLowerCase();
}
