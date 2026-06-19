import { describe, it, expect } from 'vitest';
import { computeResult } from '../result';
import { resultToText } from '../format';
import type { EventData, Expense, Member } from '../types';

const A: Member = { id: 'A', name: 'An' };
const B: Member = { id: 'B', name: 'Bình' };
const C: Member = { id: 'C', name: 'Châu' };

function makeEvent(members: Member[], expenses: Expense[], name = 'Test'): EventData {
  return { id: 'ev', name, members, expenses, createdAt: 0, updatedAt: 0 };
}

describe('computeResult — tích hợp toàn nhóm', () => {
  it('An trả 300k bữa ăn chia đều 3 → B, C mỗi người chuyển An 100k', () => {
    const e: Expense = {
      id: 'e1',
      payerId: 'A',
      amount: 300000,
      description: 'Ăn tối',
      split: { mode: 'equal', participants: ['A', 'B', 'C'] },
    };
    const r = computeResult(makeEvent([A, B, C], [e]));
    expect(r.totalSpent).toBe(300000);
    expect(r.averagePerMember).toBe(100000);
    expect(r.transfers).toHaveLength(2);
    for (const t of r.transfers) {
      expect(t.to).toBe('A');
      expect(t.amount).toBe(100000);
    }
  });

  it('nhiều khoản, nhiều kiểu chia: Σ net = 0, không cảnh báo, quyết toán đúng', () => {
    const expenses: Expense[] = [
      { id: 'e1', payerId: 'A', amount: 300000, description: 'Ăn', split: { mode: 'equal', participants: ['A', 'B', 'C'] } },
      { id: 'e2', payerId: 'B', amount: 90000, description: 'Cafe', split: { mode: 'equal', participants: ['A', 'B', 'C'] } },
      { id: 'e3', payerId: 'C', amount: 120000, description: 'Taxi', split: { mode: 'shares', shares: { A: 1, B: 1, C: 2 } } },
    ];
    const r = computeResult(makeEvent([A, B, C], expenses));
    expect(r.balances.reduce((s, b) => s + b.net, 0)).toBe(0);
    expect(r.warnings).toHaveLength(0);

    const net: Record<string, number> = {};
    for (const b of r.balances) net[b.id] = b.net;
    for (const t of r.transfers) {
      net[t.from] += t.amount;
      net[t.to] -= t.amount;
    }
    for (const id of Object.keys(net)) expect(net[id]).toBe(0);
  });

  it('mọi người tự trả đúng phần mình → không ai chuyển ai', () => {
    const expenses: Expense[] = [
      { id: 'e1', payerId: 'A', amount: 100000, description: 'x', split: { mode: 'exact', amounts: { A: 100000 } } },
      { id: 'e2', payerId: 'B', amount: 50000, description: 'y', split: { mode: 'exact', amounts: { B: 50000 } } },
    ];
    expect(computeResult(makeEvent([A, B], expenses)).transfers).toHaveLength(0);
  });

  it('loại trừ người không ăn: món 100k chỉ B, C chia', () => {
    const e: Expense = {
      id: 'e1',
      payerId: 'A',
      amount: 100000,
      description: 'Món A không ăn',
      split: { mode: 'equal', participants: ['B', 'C'] },
    };
    const r = computeResult(makeEvent([A, B, C], [e]));
    const byId = Object.fromEntries(r.balances.map((b) => [b.id, b]));
    expect(byId.A.share).toBe(0);
    expect(byId.B.share).toBe(50000);
    expect(byId.C.share).toBe(50000);
    // A đã trả 100k, không gánh gì → cả B và C chuyển về A
    expect(r.transfers.every((t) => t.to === 'A')).toBe(true);
  });

  it('resultToText có phần "CẦN CHUYỂN" và định dạng tiền VN', () => {
    const e: Expense = {
      id: 'e1',
      payerId: 'A',
      amount: 300000,
      description: 'Ăn',
      split: { mode: 'equal', participants: ['A', 'B', 'C'] },
    };
    const ev = makeEvent([A, B, C], [e], 'Đi ăn');
    const text = resultToText(ev, computeResult(ev));
    expect(text).toContain('CẦN CHUYỂN');
    expect(text).toContain('An');
    expect(text).toContain('100.000đ');
  });
});
