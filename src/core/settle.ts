import type { Balance, Transfer } from './types';

/**
 * TỐI THIỂU HOÁ SỐ LẦN CHUYỂN KHOẢN (debt simplification).
 *
 * Thuật toán greedy: mỗi bước ghép NGƯỜI THIẾU NHIỀU NHẤT với NGƯỜI DƯ NHIỀU NHẤT,
 * chuyển đúng min(thiếu, dư), rồi lặp lại tới khi mọi người về 0.
 *
 * Vì sao greedy thay vì tối ưu tuyệt đối?
 *   Tìm SỐ giao dịch ít nhất TUYỆT ĐỐI là bài toán NP-hard — quy về subset-sum /
 *   phân hoạch tập (muốn gộp tối đa các nhóm con có tổng = 0 để triệt nợ chéo).
 *   Với nhóm bạn bè (vài → vài chục người), greedy cho tối đa n−1 giao dịch, gần như
 *   luôn tối ưu trên dữ liệu thực, chạy nhanh và dễ giải thích. Đây là đánh đổi có
 *   chủ đích giữa độ tối ưu lý thuyết và tốc độ + sự đơn giản.
 *
 * Độ phức tạp: O(n²) — mỗi bước quét tìm cực trị, tối đa n−1 bước.
 * Làm việc trên số nguyên đồng nên không có sai số; kết thúc đúng khi tất cả = 0.
 */
export function simplifyDebts(balances: Balance[]): Transfer[] {
  // Bản sao chỉ giữ id + số dư để biến đổi tại chỗ; bỏ người đã cân bằng.
  const bal = balances.map((b) => ({ id: b.id, net: b.net })).filter((b) => b.net !== 0);

  const transfers: Transfer[] = [];

  // Trần lặp phòng lỗi (mỗi bước triệt tiêu ít nhất 1 người ≠ 0).
  let guard = bal.length * 2 + 2;

  while (guard-- > 0) {
    // Người dư nhiều nhất (net lớn nhất > 0) và thiếu nhiều nhất (net nhỏ nhất < 0).
    let maxCredit = -1;
    let maxDebt = -1;
    for (let k = 0; k < bal.length; k++) {
      if (bal[k].net > 0 && (maxCredit === -1 || bal[k].net > bal[maxCredit].net)) maxCredit = k;
      if (bal[k].net < 0 && (maxDebt === -1 || bal[k].net < bal[maxDebt].net)) maxDebt = k;
    }

    // Hết cặp để quyết toán → xong.
    if (maxCredit === -1 || maxDebt === -1) break;

    const pay = Math.min(bal[maxCredit].net, -bal[maxDebt].net);
    transfers.push({ from: bal[maxDebt].id, to: bal[maxCredit].id, amount: pay });

    bal[maxCredit].net -= pay;
    bal[maxDebt].net += pay;
  }

  return transfers;
}
