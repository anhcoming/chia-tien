import type { EventData, Expense, SplitMode } from '../../core';
import { formatVNDSuffix } from '../../core';
import { Avatar } from '../../components/Avatar';
import { guessExpenseIcon } from '../../utils/category';

interface Props {
  event: EventData;
  onEdit: (e: Expense) => void;
  onRemove: (id: string) => void;
}

const modeLabel: Record<SplitMode, string> = {
  equal: 'Chia đều',
  shares: 'Theo suất',
  exact: 'Chính xác',
};

function countPeople(e: Expense): number {
  if (e.split.mode === 'equal') return e.split.participants.length;
  if (e.split.mode === 'shares') return Object.keys(e.split.shares).length;
  return Object.keys(e.split.amounts).length;
}

export function ExpenseList({ event, onEdit, onRemove }: Props) {
  const nameOf = (id: string) => event.members.find((m) => m.id === id)?.name ?? '(đã xoá)';
  const canAdd = event.members.length > 0;

  return (
    <section className="card card--pad">
      <div className="section-title">Khoản chi ({event.expenses.length})</div>

      {event.expenses.length === 0 ? (
        <div className="empty">
          <div className="empty__icon">🧾</div>
          {canAdd ? 'Chưa có khoản chi nào.' : 'Thêm thành viên trước đã nhé.'}
        </div>
      ) : (
        <div className="stack">
          {event.expenses.map((e) => (
            <div className="expense" key={e.id}>
              <button className="expense__main" onClick={() => onEdit(e)}>
                <span className="expense__icon">{guessExpenseIcon(e.description)}</span>
                <div className="grow">
                  <div className="expense__desc">{e.description || 'Khoản chi'}</div>
                  <div className="expense__meta">
                    <Avatar name={nameOf(e.payerId)} size={18} />
                    {nameOf(e.payerId)} trả · {modeLabel[e.split.mode]} · {countPeople(e)} người
                  </div>
                </div>
                <div className="expense__amt num">{formatVNDSuffix(e.amount)}</div>
              </button>
              <button className="expense__del" onClick={() => onRemove(e.id)} aria-label="Xoá khoản chi">
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
