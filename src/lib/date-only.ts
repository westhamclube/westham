/**
 * Datas "só dia" vindas do Postgres (tipo `date`) ou strings `YYYY-MM-DD`.
 * `new Date('2001-05-27')` em JS vira UTC meia-noite e pode aparecer um dia
 * antes no fuso local (ex.: Brasil). Use estes helpers para dia/mês/ano de calendário.
 */

const ISO_DATE_START = /^(\d{4})-(\d{2})-(\d{2})/;

export type CalendarYmd = { y: number; m: number; d: number };

export function parseCalendarYmd(value: string | null | undefined): CalendarYmd | null {
  if (value == null || value === '') return null;
  const m = String(value).trim().match(ISO_DATE_START);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (!y || month < 1 || month > 12 || d < 1 || d > 31) return null;
  return { y, m: month, d };
}

/** dd/mm/aaaa */
export function formatDateOnlyPtBrFull(value: string | null | undefined): string {
  const p = parseCalendarYmd(value);
  if (!p) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(p.d)}/${pad(p.m)}/${p.y}`;
}

/** dd/mm (aniversário no ano corrente, só exibição) */
export function formatDateOnlyPtBrDayMonth(value: string | null | undefined): string {
  const p = parseCalendarYmd(value);
  if (!p) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(p.d)}/${pad(p.m)}`;
}
