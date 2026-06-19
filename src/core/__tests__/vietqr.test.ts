import { describe, it, expect } from 'vitest';
import { buildVietQrString, crc16ccitt, asciiFold } from '../vietqr';

describe('VietQR', () => {
  it('CRC-16/CCITT-FALSE: chuỗi kiểm tra "123456789" = 29B1', () => {
    expect(crc16ccitt('123456789')).toBe('29B1');
  });

  it('asciiFold bỏ dấu tiếng Việt', () => {
    expect(asciiFold('Nguyễn Văn Đức')).toBe('Nguyen Van Duc');
  });

  it('payload đúng cấu trúc EMVCo + CRC khớp khi tính lại', () => {
    const s = buildVietQrString({
      bankBin: '970436',
      accountNo: '0123456789',
      amount: 120000,
      addInfo: 'An tra Binh',
      accountName: 'Nguyen Van A',
    });
    expect(s.startsWith('000201')).toBe(true);
    expect(s).toContain('010212'); // có tiền → mã động
    expect(s).toContain('0010A000000727'); // GUID NAPAS
    expect(s).toContain('0208QRIBFTTA'); // dịch vụ chuyển tới tài khoản
    expect(s).toContain('5303704'); // VND
    expect(s).toContain('5406120000'); // số tiền 120.000
    expect(s).toContain('5802VN');

    const body = s.slice(0, -4);
    expect(body.endsWith('6304')).toBe(true);
    expect(s.slice(-4)).toBe(crc16ccitt(body)); // 4 ký tự CRC cuối khớp
  });

  it('không có số tiền → mã tĩnh (01 = 11)', () => {
    const s = buildVietQrString({ bankBin: '970418', accountNo: '111' });
    expect(s).toContain('010211');
    expect(s).not.toContain('5303704' + '54'); // không có trường 54
  });
});
