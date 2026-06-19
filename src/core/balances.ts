import type { Balance, EventData, MemberId, ResultWarning } from './types';
import { splitExpense } from './split';

export interface BalancesResult {
  balances: Balance[];
  warnings: ResultWarning[];
}

/**
 * Tính số dư ròng của từng thành viên từ danh sách khoản chi.
 *   net = đã trả − phần phải gánh
 * Khi dữ liệu hợp lệ (mọi id tồn tại, mỗi khoản chia đủ tổng) thì Σ net = 0.
 */
export function computeBalances(event: EventData): BalancesResult {
  const paid: Record<MemberId, number> = {};
  const share: Record<MemberId, number> = {};
  for (const m of event.members) {
    paid[m.id] = 0;
    share[m.id] = 0;
  }

  const warnings: ResultWarning[] = [];

  for (const exp of event.expenses) {
    // Cộng số đã trả cho người trả (nếu còn trong nhóm).
    if (exp.payerId in paid) paid[exp.payerId] += exp.amount;

    const { shares, warning } = splitExpense(exp);
    if (warning) warnings.push(warning);

    for (const mid of Object.keys(shares)) {
      // Bỏ qua phần của thành viên đã bị xoá khỏi nhóm.
      if (mid in share) share[mid] += shares[mid];
    }
  }

  const balances: Balance[] = event.members.map((m) => ({
    id: m.id,
    name: m.name,
    paid: paid[m.id],
    share: share[m.id],
    net: paid[m.id] - share[m.id],
  }));

  return { balances, warnings };
}
