export function formatCents(cents: number): string {
  const abs = Math.abs(cents);
  return (abs / 100).toFixed(2).replace(".", ",");
}
