/**
 * Màu avatar ổn định theo tên: cùng tên luôn ra cùng màu.
 * Dùng HSL pastel nền sáng + chữ đậm cùng tông — đọc rõ trên cả nền sáng lẫn tối.
 */
export function nameColor(seed: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return { bg: `hsl(${hue} 72% 86%)`, fg: `hsl(${hue} 60% 30%)` };
}
