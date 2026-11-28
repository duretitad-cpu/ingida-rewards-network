export function safeWebUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    if (!url.hostname.includes(".") || /^(localhost|127\.|0\.)/i.test(url.hostname)) return "";
    return url.href;
  } catch { return ""; }
}

const INVITE_ORIGINS = ["https://www.ingida.com", "https://ingida.com", "https://ingida-rewards-network.lovable.app", "https://id-preview--613ac329-e5a6-4211-be56-5ad25a52cf78.lovable.app"];
export function safeInviteRedirect(raw: string): string {
  try {
    const url = new URL(raw);
    if (INVITE_ORIGINS.includes(url.origin) && !url.username && !url.password) return `${url.origin}/operators`;
  } catch { /* Use the approved default. */ }
  return "https://www.ingida.com/operators";
}