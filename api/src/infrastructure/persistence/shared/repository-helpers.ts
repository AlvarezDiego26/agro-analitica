export function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toRequiredNumber(value: number | string | null | undefined, fallback = 0): number {
  return toNullableNumber(value) ?? fallback;
}

function clampLimit(limit: number, min: number, max: number): number {
  return Math.max(min, Math.min(limit, max));
}

export function normalizeLookupTerm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

export function sortByFechaAsc<T extends { fecha: string }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => left.fecha.localeCompare(right.fecha));
}
