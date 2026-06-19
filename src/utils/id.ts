/** Sinh id ngẫu nhiên đủ dùng cục bộ (không cần mạnh về mật mã). */
export function uid(prefix = ''): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  const base =
    g.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix + base;
}
