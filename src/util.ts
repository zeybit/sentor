import { Instant, ZoneId } from '@js-joda/core';
import '@js-joda/timezone';

/** IANA saat diliminin verilen andaki UTC farkı (dakika) */
export function tzOffsetMinutes(tz: string, at: Date = new Date()): number {
  try { return ZoneId.of(tz).rules().offset(Instant.ofEpochMilli(at.getTime())).totalSeconds() / 60; } catch { return 0; }
}
const pad = (n: number) => String(n).padStart(2, '0');
export function fmtLocal(d: Date, tz: string, withTime = true): string {
  const x = new Date(d.getTime() + tzOffsetMinutes(tz, d) * 60000);
  return `${pad(x.getUTCDate())}.${pad(x.getUTCMonth() + 1)}.${x.getUTCFullYear()}${withTime ? ` ${pad(x.getUTCHours())}:${pad(x.getUTCMinutes())}` : ''}`;
}
export function fmtTime(d: Date, tz: string): string {
  const x = new Date(d.getTime() + tzOffsetMinutes(tz, d) * 60000);
  return `${pad(x.getUTCHours())}:${pad(x.getUTCMinutes())}`;
}
