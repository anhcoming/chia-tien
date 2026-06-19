/* =========================================================================
   MÔ HÌNH DỮ LIỆU
   Nhóm/Sự kiện (EventData) → nhiều Thành viên (Member) + nhiều Khoản chi (Expense).
   Kết quả "ai nợ ai" KHÔNG lưu cứng — luôn được tính lại từ danh sách khoản chi
   (single source of truth).
   Mọi số tiền là SỐ NGUYÊN đồng (VND), không dùng phần lẻ thập phân.
   ========================================================================= */

export type MemberId = string;
export type ExpenseId = string;

/** Tài khoản ngân hàng của thành viên — tùy chọn, dùng để sinh mã VietQR. */
export interface BankAccount {
  /** Mã BIN ngân hàng (6 số) theo NAPAS, vd 970436 = Vietcombank. */
  bankBin: string;
  accountNo: string;
  accountName?: string;
}

export interface Member {
  id: MemberId;
  name: string;
  /** Tài khoản nhận tiền (tùy chọn). */
  bank?: BankAccount;
}

/** Kiểu chia một khoản chi. */
export type SplitMode = 'equal' | 'exact' | 'shares';

/**
 * Cách một khoản chi được chia cho thành viên:
 * - equal:  chia đều cho `participants`. Cả nhóm = mọi người; loại trừ vài người = bỏ khỏi danh sách.
 * - exact:  mỗi người một số tiền cố định. Tổng nên bằng `amount`.
 * - shares: mỗi người một số suất (>= 0). Chia theo tỉ lệ suất, phần dư được phân bổ để bảo toàn tổng.
 */
export type Split =
  | { mode: 'equal'; participants: MemberId[] }
  | { mode: 'exact'; amounts: Record<MemberId, number> }
  | { mode: 'shares'; shares: Record<MemberId, number> };

export interface Expense {
  id: ExpenseId;
  /** Ai đã trả khoản này. */
  payerId: MemberId;
  /** Số tiền — đơn vị đồng, số nguyên. */
  amount: number;
  /** Nội dung: "Ăn trưa", "Taxi"... */
  description: string;
  /** Chia cho ai + theo kiểu nào. */
  split: Split;
}

/** Một nhóm/sự kiện. Đây là nguồn sự thật duy nhất. */
export interface EventData {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: number;
  updatedAt: number;
}

/** Số dư ròng của một thành viên. */
export interface Balance {
  id: MemberId;
  name: string;
  /** Tổng đã trả. */
  paid: number;
  /** Tổng phần phải gánh. */
  share: number;
  /** paid − share. Dương = được nhận lại (dư). Âm = phải trả thêm (thiếu). */
  net: number;
}

/** Một lệnh chuyển tiền trong phương án quyết toán. */
export interface Transfer {
  from: MemberId;
  to: MemberId;
  amount: number;
}

/** Cảnh báo dữ liệu khi tính toán. */
export interface ResultWarning {
  expenseId: ExpenseId;
  code: 'exact-mismatch' | 'no-participants' | 'zero-shares';
  message: string;
}

/** Kết quả tính cho cả nhóm. */
export interface GroupResult {
  /** Tổng chi cả nhóm. */
  totalSpent: number;
  /** Trung bình mỗi người = tổng chi / số thành viên (làm tròn). */
  averagePerMember: number;
  /** Số dư từng người, sắp xếp dư nhiều → thiếu nhiều. */
  balances: Balance[];
  /** Danh sách "ai chuyển ai bao nhiêu" đã tối giản số giao dịch. */
  transfers: Transfer[];
  /** Cảnh báo (nếu có), vd chia chính xác lệch tổng. */
  warnings: ResultWarning[];
}
