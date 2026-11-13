/** Normalizes Ethiopian mobile numbers (09…, 07…, 9…, 2519…, +2519…) to "+251 9XX XXX XXX". Returns null when invalid. */
export function formatEthiopianPhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("251")) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  if (!/^[79]\d{8}$/.test(d)) return null;
  return `+251 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}
/** Display helper: formats when possible, otherwise returns the original text. */
export const showPhone = (v: string) => (v ? formatEthiopianPhone(v) ?? v : "");
export const ETH_PHONE_PLACEHOLDER = "+251 9XX XXX XXX";
