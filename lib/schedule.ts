export type TimeWindow = { start: string; end: string };
export const MINIMUM_NOTICE_HOURS = 24;
export const ALLOWED_DURATIONS = [10, 30, 60] as const;

function toMinutes(value: string) { const [hours, minutes] = value.split(":").map(Number); return hours * 60 + minutes; }
function toTime(value: number) { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }

export function windowsForDate(date: string): TimeWindow[] {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  if (weekday === 0 || weekday === 6) return [{ start: "10:00", end: "13:00" }, { start: "17:00", end: "20:00" }];
  if (weekday === 1 || weekday === 5) return [{ start: "09:00", end: "13:00" }, { start: "18:00", end: "21:00" }];
  return [{ start: "18:00", end: "21:00" }];
}

export function slotsForDate(date: string, duration: number) {
  if (!ALLOWED_DURATIONS.includes(duration as (typeof ALLOWED_DURATIONS)[number])) return [];
  return windowsForDate(date).flatMap(({ start, end }) => { const slots: string[] = []; for (let current = toMinutes(start); current + duration <= toMinutes(end); current += 10) slots.push(toTime(current)); return slots; });
}

export function occupiedKeys(date: string, time: string, duration: number) {
  const start = toMinutes(time);
  return Array.from({ length: duration / 10 }, (_, index) => `${date}|${toTime(start + index * 10)}`);
}

export function appointmentDate(date: string, time: string) {
  return new Date(`${date}T${time}:00+02:00`);
}

export function hasMinimumNotice(date: string, time: string, now = new Date()) {
  return appointmentDate(date, time).getTime() - now.getTime() >= MINIMUM_NOTICE_HOURS * 60 * 60 * 1000;
}
