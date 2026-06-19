import { useMemo, useState } from 'react';
import type { Expense, Member, Split, SplitMode } from '../../core';
import { formatVNDSuffix } from '../../core';
import { MoneyInput } from '../../components/MoneyInput';

interface Props {
  members: Member[];
  initial?: Expense;
  onSubmit: (data: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

const MODES: Array<{ key: SplitMode; label: string }> = [
  { key: 'equal', label: 'Chia đều' },
  { key: 'shares', label: 'Theo suất' },
  { key: 'exact', label: 'Chính xác' },
];

export function ExpenseForm({ members, initial, onSubmit, onCancel }: Props) {
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial?.amount ?? 0);
  const [payerId, setPayerId] = useState(initial?.payerId ?? members[0]?.id ?? '');
  // Mặc định "chia đều cả nhóm" cho khoản chi mới.
  const [mode, setMode] = useState<SplitMode>(initial?.split.mode ?? 'equal');

  const [participants, setParticipants] = useState<Set<string>>(() =>
    initial?.split.mode === 'equal'
      ? new Set(initial.split.participants)
      : new Set(members.map((m) => m.id)),
  );
  const [shares, setShares] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    members.forEach((m) => (base[m.id] = 1));
    if (initial?.split.mode === 'shares') Object.assign(base, initial.split.shares);
    return base;
  });
  const [exact, setExact] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    members.forEach((m) => (base[m.id] = 0));
    if (initial?.split.mode === 'exact') Object.assign(base, initial.split.amounts);
    return base;
  });

  const sharesTotal = useMemo(
    () => members.reduce((s, m) => s + Math.max(0, shares[m.id] ?? 0), 0),
    [shares, members],
  );
  const exactTotal = useMemo(
    () => members.reduce((s, m) => s + Math.max(0, exact[m.id] ?? 0), 0),
    [exact, members],
  );
  const exactDiff = amount - exactTotal;

  const valid =
    amount > 0 &&
    !!payerId &&
    (mode === 'equal' ? participants.size > 0 : mode === 'shares' ? sharesTotal > 0 : exactDiff === 0);

  const toggleParticipant = (id: string) =>
    setParticipants((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const bumpShare = (id: string, d: number) =>
    setShares((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + d) }));

  function buildSplit(): Split {
    if (mode === 'equal') {
      return { mode: 'equal', participants: members.filter((m) => participants.has(m.id)).map((m) => m.id) };
    }
    if (mode === 'shares') {
      const out: Record<string, number> = {};
      members.forEach((m) => {
        if ((shares[m.id] ?? 0) > 0) out[m.id] = shares[m.id];
      });
      return { mode: 'shares', shares: out };
    }
    const out: Record<string, number> = {};
    members.forEach((m) => {
      if ((exact[m.id] ?? 0) > 0) out[m.id] = exact[m.id];
    });
    return { mode: 'exact', amounts: out };
  }

  function submit() {
    if (!valid) return;
    onSubmit({ description: description.trim() || 'Khoản chi', amount, payerId, split: buildSplit() });
  }

  return (
    <>
      <div className="field">
        <label className="label" htmlFor="exp-desc">Nội dung</label>
        <input
          id="exp-desc"
          className="input"
          value={description}
          placeholder="Ăn trưa, taxi, cà phê…"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="exp-amount">Số tiền</label>
        <MoneyInput id="exp-amount" value={amount} onChange={setAmount} autoFocus={!initial} ariaLabel="Số tiền" />
      </div>

      <div className="field">
        <label className="label" htmlFor="exp-payer">Ai trả?</label>
        <select id="exp-payer" className="select" value={payerId} onChange={(e) => setPayerId(e.target.value)}>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="label">Chia thế nào?</span>
        <div className="seg" style={{ gridTemplateColumns: `repeat(${MODES.length}, 1fr)` }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className="seg__opt"
              data-active={mode === m.key}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'equal' && (
        <div className="field">
          <div className="row between">
            <span className="label">Chia cho ({participants.size})</span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setParticipants(new Set(members.map((m) => m.id)))}
            >
              Chọn tất cả
            </button>
          </div>
          <div className="stack">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                className="pick"
                data-on={participants.has(m.id)}
                onClick={() => toggleParticipant(m.id)}
              >
                <span className="pick__box">{participants.has(m.id) ? '✓' : ''}</span>
                <span className="grow">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'shares' && (
        <div className="field">
          <span className="label">Số suất mỗi người (ăn nhiều → nhiều suất)</span>
          <div className="stack">
            {members.map((m) => (
              <div key={m.id} className="split-row">
                <span className="grow">{m.name}</span>
                <div className="stepper">
                  <button type="button" onClick={() => bumpShare(m.id, -1)} aria-label="Giảm">−</button>
                  <span className="stepper__val num">{shares[m.id] ?? 0}</span>
                  <button type="button" onClick={() => bumpShare(m.id, 1)} aria-label="Tăng">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'exact' && (
        <div className="field">
          <div className="row between">
            <span className="label">Số tiền từng người</span>
            <span className={exactDiff === 0 ? 'pos' : 'neg'} style={{ fontSize: '0.82rem' }}>
              {exactDiff === 0
                ? '✓ Khớp'
                : exactDiff > 0
                  ? `Còn ${formatVNDSuffix(exactDiff)}`
                  : `Dư ${formatVNDSuffix(-exactDiff)}`}
            </span>
          </div>
          <div className="stack">
            {members.map((m) => (
              <div key={m.id} className="split-row">
                <span className="grow">{m.name}</span>
                <div style={{ width: 150 }}>
                  <MoneyInput
                    value={exact[m.id] ?? 0}
                    onChange={(v) => setExact((p) => ({ ...p, [m.id]: v }))}
                    ariaLabel={`Số tiền của ${m.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="row" style={{ marginTop: 'var(--sp-2)' }}>
        <button type="button" className="btn btn--ghost grow" onClick={onCancel}>Huỷ</button>
        <button type="button" className="btn btn--primary grow" disabled={!valid} onClick={submit}>
          {initial ? 'Lưu' : 'Thêm khoản chi'}
        </button>
      </div>
    </>
  );
}
