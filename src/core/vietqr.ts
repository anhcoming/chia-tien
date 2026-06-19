/* =========================================================================
   VIETQR — tạo chuỗi mã QR chuyển khoản chuẩn NAPAS / EMVCo.
   App ngân hàng quét mã sẽ tự điền: ngân hàng + số tài khoản + số tiền + nội dung.
   Hàm thuần, có kiểm thử (CRC + cấu trúc). Đây là phần "khoe" kỹ thuật của tính năng.
   ========================================================================= */

/**
 * CRC-16/CCITT-FALSE — poly 0x1021, init 0xFFFF, không reflect, không xor-out.
 * Đúng biến thể CRC mà chuẩn EMVCo/VietQR dùng cho trường 63.
 * (Giá trị kiểm tra chuẩn: crc của "123456789" = 0x29B1.)
 */
export function crc16ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Bỏ dấu tiếng Việt → ASCII (VietQR yêu cầu tên & nội dung không dấu). */
export function asciiFold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/** Một trường EMVCo: id (2) + độ dài (2) + giá trị. */
function tlv(id: string, value: string): string {
  return id + value.length.toString().padStart(2, '0') + value;
}

export interface VietQrInput {
  /** Mã BIN ngân hàng (6 số) theo NAPAS, vd 970436 = Vietcombank. */
  bankBin: string;
  /** Số tài khoản người nhận. */
  accountNo: string;
  /** Số tiền (đồng). > 0 → mã động (tự điền số tiền). */
  amount?: number;
  /** Nội dung chuyển khoản. */
  addInfo?: string;
  /** Tên người nhận (để hiển thị trên app ngân hàng). */
  accountName?: string;
}

/**
 * Sinh chuỗi VietQR (chuẩn NAPAS/EMVCo). Trả về chuỗi text để render thành mã QR.
 * Cấu trúc: 00 format · 01 tĩnh/động · 38 thông tin thụ hưởng (GUID A000000727,
 * BIN + số TK, dịch vụ QRIBFTTA) · 53 VND · 54 số tiền · 58 VN · 59 tên · 62 nội dung · 63 CRC.
 */
export function buildVietQrString(input: VietQrInput): string {
  const { bankBin, accountNo, amount, addInfo, accountName } = input;

  const beneficiary = tlv('00', bankBin) + tlv('01', accountNo);
  const merchantAccount = tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA');

  let s = '';
  s += tlv('00', '01'); // Payload format indicator
  s += tlv('01', amount && amount > 0 ? '12' : '11'); // 12 = động (có tiền), 11 = tĩnh
  s += tlv('38', merchantAccount); // Thông tin thụ hưởng (NAPAS)
  s += tlv('53', '704'); // Tiền tệ: VND
  if (amount && amount > 0) s += tlv('54', String(Math.round(amount)));
  s += tlv('58', 'VN'); // Quốc gia
  if (accountName) s += tlv('59', asciiFold(accountName).toUpperCase().slice(0, 25));
  if (addInfo) s += tlv('62', tlv('08', asciiFold(addInfo).slice(0, 50)));

  s += '6304'; // id + len của trường CRC; CRC tính trên toàn bộ chuỗi tới đây
  return s + crc16ccitt(s);
}
