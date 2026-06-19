/* =========================================================================
   CHIA NGUYÊN BẢO TOÀN TỔNG (largest remainder / Hamilton)
   ========================================================================= */

/**
 * Chia số tiền nguyên `total` cho các phần theo `weights`, sao cho:
 *  - mỗi phần là số nguyên đồng,
 *  - TỔNG các phần đúng bằng `total` (không thất thoát 1 đồng),
 *  - công bằng: phần dư được trao cho ai có "phần lẻ" lớn nhất trước
 *    (phương pháp largest remainder / Hamilton).
 *
 * Trả về mảng cùng độ dài & thứ tự với `weights`.
 *
 * Ví dụ:
 *   apportion(10000, [1, 1, 1])  → [3334, 3333, 3333]   (tổng = 10000)
 *   apportion(10000, [2, 1, 1])  → [5000, 2500, 2500]
 *   apportion(100,   [1, 1, 1])  → [34, 33, 33]
 *
 * Ghi chú: giả định total và các weights trong phạm vi số nguyên an toàn của JS
 * (đủ lớn cho mọi hoá đơn VND thực tế).
 */
export function apportion(total: number, weights: number[]): number[] {
  const n = weights.length;
  if (n === 0) return [];

  // Chỉ tính trọng số không âm.
  const w = weights.map((x) => Math.max(0, x));
  const totalWeight = w.reduce((sum, x) => sum + x, 0);

  // Không có trọng số dương → không chia được, trả về toàn 0.
  if (totalWeight <= 0) return weights.map(() => 0);

  const exact = w.map((x) => (total * x) / totalWeight);
  const floors = exact.map((x) => Math.floor(x));
  const distributed = floors.reduce((sum, x) => sum + x, 0);

  // Số đồng lẻ còn phải chia thêm. Luôn nằm trong [0, n) khi total >= 0.
  const remainder = total - distributed;

  // Xếp theo phần thập phân giảm dần; hoà nhau → ưu tiên chỉ số nhỏ (ổn định/deterministic).
  const order = exact
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);

  const result = floors.slice();
  for (let k = 0; k < remainder; k++) {
    result[order[k % n].i] += 1;
  }
  return result;
}
