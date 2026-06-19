/* =========================================================================
   TIỆN ÍCH TIỀN TỆ
   Toàn bộ app biểu diễn tiền bằng SỐ NGUYÊN đồng (VND) — tuyệt đối không dùng
   số thực để tránh sai số dấu phẩy động (vd 0.1 + 0.2 !== 0.3).
   ========================================================================= */

/** Định dạng số nguyên đồng → "50.000" (dấu chấm ngăn cách hàng nghìn kiểu VN). */
export function formatVND(amount: number): string {
  const n = Math.round(amount);
  const sign = n < 0 ? '-' : '';
  const digits = Math.abs(n).toString();

  // Tự nhóm 3 chữ số bằng '.', không phụ thuộc Intl để kết quả ổn định mọi môi trường.
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += '.';
    out += digits[i];
  }
  return sign + out;
}

/** Như formatVND nhưng thêm hậu tố "đ": "50.000đ". */
export function formatVNDSuffix(amount: number): string {
  return formatVND(amount) + 'đ';
}

/** Bỏ mọi ký tự không phải chữ số → số nguyên đồng. "50.000" | "50,000 đ" → 50000. */
export function parseVND(input: string): number {
  const digits = input.replace(/\D/g, '');
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isSafeInteger(n) ? n : Number.MAX_SAFE_INTEGER;
}
