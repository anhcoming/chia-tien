import { useMemo, useState } from 'react';
import type { Expense, Transfer } from '../../core';
import { computeResult, resultToText } from '../../core';
import { useQuickEvent } from '../../store/useQuickEvent';
import { Modal } from '../../components/Modal';
import { MembersCard } from './MembersCard';
import { ExpenseList } from './ExpenseList';
import { ExpenseForm } from './ExpenseForm';
import { ResultView } from './ResultView';
import { QrModal } from './QrModal';

interface Props {
  onExit: () => void;
}

export function QuickApp({ onExit }: Props) {
  const { event, actions } = useQuickEvent();
  const [editing, setEditing] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [qrTransfer, setQrTransfer] = useState<Transfer | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Nguồn sự thật: kết quả luôn được tính lại từ danh sách khoản chi.
  const result = useMemo(() => computeResult(event), [event]);
  const canShowResult = event.members.length > 0 && event.expenses.length > 0;
  const hasMembers = event.members.length > 0;

  const qrMember = qrTransfer ? event.members.find((m) => m.id === qrTransfer.to) ?? null : null;

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (e: Expense) => {
    setEditing(e);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  function handleSubmit(data: Omit<Expense, 'id'>) {
    if (editing) actions.updateExpense(editing.id, data);
    else actions.addExpense(data);
    closeForm();
  }

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }

  async function copyResult() {
    const text = resultToText(event, result);
    try {
      await navigator.clipboard.writeText(text);
      flash('Đã copy kết quả');
    } catch {
      flash('Không copy được — hãy chọn và sao chép thủ công');
    }
  }

  function doReset() {
    actions.reset();
    setConfirmReset(false);
  }

  return (
    <div className="app">
      <header className="appbar">
        <button className="iconbtn" onClick={onExit} aria-label="Quay lại">‹</button>
        <div className="appbar__title">
          <input
            className="title-input"
            value={event.name}
            placeholder="Tên nhóm / sự kiện"
            aria-label="Tên nhóm"
            onChange={(e) => actions.setName(e.target.value)}
          />
          <span>
            {event.members.length} người · {event.expenses.length} khoản
          </span>
        </div>
        <button className="iconbtn" onClick={() => setConfirmReset(true)} aria-label="Làm mới">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </header>

      <div className="content" style={{ paddingBottom: hasMembers ? 96 : undefined }}>
        <MembersCard members={event.members} onAdd={actions.addMember} onRemove={actions.removeMember} />

        <ExpenseList event={event} onEdit={openEdit} onRemove={actions.removeExpense} />

        {canShowResult && (
          <ResultView event={event} result={result} onCopy={copyResult} onShowQr={setQrTransfer} />
        )}
      </div>

      {hasMembers && (
        <div className="dock">
          <button className="btn btn--primary btn--block btn--lg" onClick={openAdd}>
            + Thêm khoản chi
          </button>
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Sửa khoản chi' : 'Thêm khoản chi'} onClose={closeForm}>
          <ExpenseForm
            members={event.members}
            initial={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </Modal>
      )}

      {qrTransfer && qrMember && (
        <QrModal
          member={qrMember}
          amount={qrTransfer.amount}
          defaultInfo={event.name || 'Chia tien nhom'}
          onClose={() => setQrTransfer(null)}
          onSaveBank={actions.setMemberBank}
        />
      )}

      {confirmReset && (
        <Modal title="Làm mới" onClose={() => setConfirmReset(false)}>
          <p className="muted">
            Xoá toàn bộ thành viên và khoản chi để bắt đầu nhóm mới? Thao tác này không thể hoàn tác.
          </p>
          <div className="row">
            <button className="btn btn--ghost grow" onClick={() => setConfirmReset(false)}>
              Huỷ
            </button>
            <button className="btn grow" style={{ background: 'var(--c-danger)', color: '#fff' }} onClick={doReset}>
              Xoá hết
            </button>
          </div>
        </Modal>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
