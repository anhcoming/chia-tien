import type { EventData, GroupResult } from './types';
import { computeBalances } from './balances';
import { simplifyDebts } from './settle';

/**
 * Tính TOÀN BỘ kết quả của một nhóm/sự kiện từ danh sách khoản chi.
 * Đây là "nguồn sự thật": không lưu cứng kết quả, luôn tính lại từ expenses.
 */
export function computeResult(event: EventData): GroupResult {
  const { balances, warnings } = computeBalances(event);

  const totalSpent = event.expenses.reduce((sum, e) => sum + e.amount, 0);
  const memberCount = event.members.length;
  const averagePerMember = memberCount > 0 ? Math.round(totalSpent / memberCount) : 0;

  // Sắp xếp số dư: dư nhiều → thiếu nhiều (cho dễ đọc bảng kết quả).
  const sortedBalances = [...balances].sort((a, b) => b.net - a.net);

  const transfers = simplifyDebts(balances);

  return { totalSpent, averagePerMember, balances: sortedBalances, transfers, warnings };
}
