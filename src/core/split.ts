import type { Expense, MemberId, ResultWarning } from './types';
import { apportion } from './apportion';

export interface SplitResult {
  /** Mỗi thành viên gánh bao nhiêu cho khoản chi này. Tổng = amount khi dữ liệu hợp lệ. */
  shares: Record<MemberId, number>;
  /** Cảnh báo nếu dữ liệu chưa chuẩn (vd chia chính xác lệch tổng). */
  warning?: ResultWarning;
}

/**
 * Tính phần mỗi người phải gánh cho MỘT khoản chi, theo kiểu chia của nó.
 * Luôn cố giữ tổng các phần đúng bằng `expense.amount`.
 */
export function splitExpense(expense: Expense): SplitResult {
  const { split, amount, id } = expense;
  const shares: Record<MemberId, number> = {};

  switch (split.mode) {
    // --- Chia đều (cho cả nhóm, hoặc loại trừ vài người) -------------------
    case 'equal': {
      const ids = split.participants;
      if (ids.length === 0) {
        return {
          shares,
          warning: { expenseId: id, code: 'no-participants', message: 'Khoản chi chưa chọn ai để chia.' },
        };
      }
      const parts = apportion(amount, ids.map(() => 1));
      ids.forEach((mid, i) => {
        shares[mid] = (shares[mid] ?? 0) + parts[i];
      });
      return { shares };
    }

    // --- Chia theo suất/phần ---------------------------------------------
    case 'shares': {
      const ids = Object.keys(split.shares);
      const weights = ids.map((mid) => split.shares[mid]);
      const totalWeight = weights.reduce((s, x) => s + Math.max(0, x), 0);
      if (ids.length === 0 || totalWeight <= 0) {
        return {
          shares,
          warning: { expenseId: id, code: 'zero-shares', message: 'Khoản chia theo suất chưa có suất hợp lệ.' },
        };
      }
      const parts = apportion(amount, weights);
      ids.forEach((mid, i) => {
        shares[mid] = parts[i];
      });
      return { shares };
    }

    // --- Chia theo số tiền chính xác từng người ---------------------------
    case 'exact': {
      const ids = Object.keys(split.amounts);
      let sum = 0;
      for (const mid of ids) {
        const v = Math.max(0, Math.round(split.amounts[mid]));
        shares[mid] = v;
        sum += v;
      }
      if (sum !== amount) {
        return {
          shares,
          warning: {
            expenseId: id,
            code: 'exact-mismatch',
            message: `Tổng chia chính xác (${sum}) chưa khớp số tiền khoản chi (${amount}).`,
          },
        };
      }
      return { shares };
    }

    // Bắt buộc xử lý đủ mọi kiểu chia — thêm kiểu mới mà quên xử lý sẽ lỗi biên dịch.
    default: {
      const _exhaustive: never = split;
      return _exhaustive;
    }
  }
}
