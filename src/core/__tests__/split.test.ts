import { describe, it, expect } from 'vitest';
import { splitExpense } from '../split';
import type { Expense } from '../types';

const base = { id: 'e1', payerId: 'A', description: 'x' } as const;
const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

describe('splitExpense — 4 kiểu chia', () => {
  it('chia đều cả nhóm', () => {
    const e: Expense = { ...base, amount: 90000, split: { mode: 'equal', participants: ['A', 'B', 'C'] } };
    expect(splitExpense(e).shares).toEqual({ A: 30000, B: 30000, C: 30000 });
  });

  it('chia đều loại trừ vài người (chỉ B, C)', () => {
    const e: Expense = { ...base, amount: 100000, split: { mode: 'equal', participants: ['B', 'C'] } };
    const { shares } = splitExpense(e);
    expect(shares).toEqual({ B: 50000, C: 50000 });
    expect(shares.A).toBeUndefined();
  });

  it('chia đều có phần dư vẫn bảo toàn tổng', () => {
    const e: Expense = { ...base, amount: 100000, split: { mode: 'equal', participants: ['A', 'B', 'C'] } };
    expect(sum(splitExpense(e).shares)).toBe(100000);
  });

  it('chia theo suất (A 2, B 1, C 1) của 120.000', () => {
    const e: Expense = { ...base, amount: 120000, split: { mode: 'shares', shares: { A: 2, B: 1, C: 1 } } };
    expect(splitExpense(e).shares).toEqual({ A: 60000, B: 30000, C: 30000 });
  });

  it('chia chính xác khớp tổng → không cảnh báo', () => {
    const e: Expense = { ...base, amount: 100000, split: { mode: 'exact', amounts: { A: 40000, B: 60000 } } };
    const { shares, warning } = splitExpense(e);
    expect(shares).toEqual({ A: 40000, B: 60000 });
    expect(warning).toBeUndefined();
  });

  it('chia chính xác lệch tổng → cảnh báo exact-mismatch', () => {
    const e: Expense = { ...base, amount: 100000, split: { mode: 'exact', amounts: { A: 40000, B: 50000 } } };
    expect(splitExpense(e).warning?.code).toBe('exact-mismatch');
  });

  it('chia đều không có người → cảnh báo no-participants', () => {
    const e: Expense = { ...base, amount: 100000, split: { mode: 'equal', participants: [] } };
    expect(splitExpense(e).warning?.code).toBe('no-participants');
  });

  it('chia theo suất tổng suất = 0 → cảnh báo zero-shares', () => {
    const e: Expense = { ...base, amount: 100000, split: { mode: 'shares', shares: { A: 0, B: 0 } } };
    expect(splitExpense(e).warning?.code).toBe('zero-shares');
  });
});
