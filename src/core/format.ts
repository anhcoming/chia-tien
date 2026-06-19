import type { EventData, GroupResult } from './types';
import { formatVNDSuffix } from './money';

/**
 * Tạo đoạn text gọn để dán vào nhóm chat (Zalo / Messenger...).
 * Đặt phần "ai chuyển ai" lên trước vì đó là thứ mọi người cần nhất.
 */
export function resultToText(event: EventData, result: GroupResult): string {
  const nameOf = (id: string) => event.members.find((m) => m.id === id)?.name ?? '(đã xoá)';

  const lines: string[] = [];
  lines.push(`CHIA TIỀN — ${event.name || 'Nhóm'}`);
  lines.push(
    `Tổng ${formatVNDSuffix(result.totalSpent)} · ${event.members.length} người · TB ${formatVNDSuffix(
      result.averagePerMember,
    )}/người`,
  );
  lines.push('');

  if (result.transfers.length === 0) {
    lines.push('Đã cân bằng — không ai phải chuyển ai.');
  } else {
    lines.push('CẦN CHUYỂN:');
    for (const t of result.transfers) {
      lines.push(`• ${nameOf(t.from)} chuyển ${nameOf(t.to)}: ${formatVNDSuffix(t.amount)}`);
    }
  }

  lines.push('');
  lines.push('CHI TIẾT:');
  for (const b of result.balances) {
    const tag =
      b.net > 0 ? `dư ${formatVNDSuffix(b.net)}` : b.net < 0 ? `thiếu ${formatVNDSuffix(-b.net)}` : 'đủ';
    lines.push(`• ${b.name}: trả ${formatVNDSuffix(b.paid)}, phần ${formatVNDSuffix(b.share)} → ${tag}`);
  }

  return lines.join('\n');
}
