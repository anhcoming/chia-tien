import { describe, it, expect } from 'vitest';
import { apportion } from '../apportion';

describe('apportion — chia nguyên bảo toàn tổng', () => {
  it('chia đều 10.000 cho 3 → [3334, 3333, 3333], tổng đúng', () => {
    const parts = apportion(10000, [1, 1, 1]);
    expect(parts).toEqual([3334, 3333, 3333]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(10000);
  });

  it('chia theo trọng số [2,1,1] của 10.000 → [5000, 2500, 2500]', () => {
    expect(apportion(10000, [2, 1, 1])).toEqual([5000, 2500, 2500]);
  });

  it('100 cho 3 → [34, 33, 33]', () => {
    const parts = apportion(100, [1, 1, 1]);
    expect(parts).toEqual([34, 33, 33]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100);
  });

  it('một phần nhận trọn', () => {
    expect(apportion(7777, [1])).toEqual([7777]);
  });

  it('mảng rỗng → []', () => {
    expect(apportion(1000, [])).toEqual([]);
  });

  it('tổng trọng số = 0 → tất cả 0', () => {
    expect(apportion(1000, [0, 0])).toEqual([0, 0]);
  });

  it('trọng số âm bị coi như 0', () => {
    expect(apportion(1000, [-5, 1])).toEqual([0, 1000]);
  });

  it('tính chất: luôn bảo toàn tổng & mỗi phần nguyên (500 ca ngẫu nhiên)', () => {
    for (let t = 0; t < 500; t++) {
      const total = Math.floor(Math.random() * 1_000_000);
      const k = 1 + Math.floor(Math.random() * 8);
      const weights = Array.from({ length: k }, () => 1 + Math.floor(Math.random() * 10));
      const parts = apportion(total, weights);
      expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
      for (const p of parts) expect(Number.isInteger(p)).toBe(true);
    }
  });
});
