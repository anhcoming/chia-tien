import { describe, it, expect } from 'vitest';
import { simplifyDebts } from '../settle';
import type { Balance } from '../types';

function bal(arr: Array<[string, number]>): Balance[] {
  return arr.map(([id, net]) => ({ id, name: id, paid: 0, share: 0, net }));
}

/** Áp dụng các lệnh chuyển và kiểm tra mọi người về 0; trả về danh sách chuyển. */
function check(balances: Balance[]) {
  const transfers = simplifyDebts(balances);
  for (const t of transfers) expect(t.amount).toBeGreaterThan(0);

  const net: Record<string, number> = {};
  for (const b of balances) net[b.id] = b.net;
  for (const t of transfers) {
    net[t.from] += t.amount;
    net[t.to] -= t.amount;
  }
  for (const id of Object.keys(net)) expect(net[id]).toBe(0);
  return transfers;
}

describe('simplifyDebts — greedy tối giản chuyển khoản', () => {
  it('A trả hộ, B & C mỗi người thiếu 100k', () => {
    expect(check(bal([['A', 200000], ['B', -100000], ['C', -100000]]))).toHaveLength(2);
  });

  it('đã cân bằng → không chuyển', () => {
    expect(simplifyDebts(bal([['A', 0], ['B', 0]]))).toHaveLength(0);
  });

  it('ghép người thiếu nhiều nhất với dư nhiều nhất', () => {
    const transfers = check(bal([['A', 50000], ['B', 70000], ['C', -120000]]));
    expect(transfers).toHaveLength(2);
    expect(transfers.filter((t) => t.from === 'C')).toHaveLength(2);
  });

  it('số giao dịch ≤ n−1 và mọi người về 0 (200 ca ngẫu nhiên, tổng = 0)', () => {
    for (let t = 0; t < 200; t++) {
      const n = 2 + Math.floor(Math.random() * 8);
      const nets: number[] = [];
      let acc = 0;
      for (let i = 0; i < n - 1; i++) {
        const v = Math.floor(Math.random() * 200000) - 100000;
        nets.push(v);
        acc += v;
      }
      nets.push(-acc); // đảm bảo tổng = 0
      const balances = bal(nets.map((v, i): [string, number] => [`P${i}`, v]));
      const transfers = check(balances);
      const nonZero = balances.filter((b) => b.net !== 0).length;
      expect(transfers.length).toBeLessThanOrEqual(Math.max(0, nonZero - 1));
    }
  });
});
