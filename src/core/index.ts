/* =========================================================================
   API CÔNG KHAI CỦA LÕI THUẬT TOÁN
   Tất cả hàm ở đây là HÀM THUẦN (pure) — không phụ thuộc React/DOM/localStorage,
   nên dễ kiểm thử và có thể tái dùng nguyên vẹn cho Option 2 (Phòng nhóm).
   ========================================================================= */

export type {
  MemberId,
  ExpenseId,
  Member,
  BankAccount,
  SplitMode,
  Split,
  Expense,
  EventData,
  Balance,
  Transfer,
  ResultWarning,
  GroupResult,
} from './types';

export { formatVND, formatVNDSuffix, parseVND } from './money';
export { apportion } from './apportion';

export { splitExpense } from './split';
export type { SplitResult } from './split';

export { computeBalances } from './balances';
export type { BalancesResult } from './balances';

export { simplifyDebts } from './settle';
export { computeResult } from './result';
export { resultToText } from './format';

export { buildVietQrString, crc16ccitt, asciiFold } from './vietqr';
export type { VietQrInput } from './vietqr';
