export type DatePreset = 'all' | 'today' | '7d' | '30d' | '90d' | '6m' | '12m' | 'ytd' | 'custom';
export const HISTORY_RENDER_BATCH = 120;

export function formatDateTime(ts: number) {
  const d = new Date(ts);
  const italyTz = 'Europe/Rome';
  const dateParts = new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: italyTz
  }).formatToParts(d);
  const day = dateParts.find((part) => part.type === 'day')?.value ?? '';
  const monthRaw = dateParts.find((part) => part.type === 'month')?.value ?? '';
  const year = dateParts.find((part) => part.type === 'year')?.value ?? '';
  const formattedMonth = monthRaw ? monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1) : '';
  const formattedDate = `${day} ${formattedMonth} ${year}`.trim();
  const time = d.toLocaleTimeString('it-IT', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: italyTz
  });
  return { formattedDate, formattedTime: time };
}

export function formatDateTimeLabel(ts: number) {
  const value = formatDateTime(ts);
  return `${value.formattedDate}, ${value.formattedTime}`;
}

export function toLocalDateKey(ts: number) {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function subtractCalendarMonthsClamped(baseDate: Date, months: number): Date {
  const day = baseDate.getDate();
  const targetMonthStart = new Date(baseDate.getFullYear(), baseDate.getMonth() - months, 1);
  const targetYear = targetMonthStart.getFullYear();
  const targetMonth = targetMonthStart.getMonth();
  const maxDayInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  return new Date(targetYear, targetMonth, Math.min(day, maxDayInTargetMonth));
}

export function getPresetRange(preset: DatePreset): { from: string; to: string } | null {
  if (preset === 'all' || preset === 'custom') return null;
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  if (preset === 'today') return { from: toInputDate(start), to: toInputDate(end) };
  if (preset === '7d') start.setDate(start.getDate() - 6);
  if (preset === '30d') start.setDate(start.getDate() - 29);
  if (preset === '90d') start.setDate(start.getDate() - 89);
  if (preset === '6m') {
    const exact = subtractCalendarMonthsClamped(end, 6);
    start.setFullYear(exact.getFullYear(), exact.getMonth(), exact.getDate());
  }
  if (preset === '12m') {
    const exact = subtractCalendarMonthsClamped(end, 12);
    start.setFullYear(exact.getFullYear(), exact.getMonth(), exact.getDate());
  }
  if (preset === 'ytd') start.setMonth(0, 1);
  return { from: toInputDate(start), to: toInputDate(end) };
}
