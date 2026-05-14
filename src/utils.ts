export function normalizeUserInput(value: string): number {
  const numeric = Number(value.replace(/[^0-9]/g, ""));
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.min(numeric, 10000000);
}
