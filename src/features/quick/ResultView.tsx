import type { EventData, GroupResult, Transfer } from '../../core';
import { formatVNDSuffix } from '../../core';
import { Avatar } from '../../components/Avatar';

interface Props {
  event: EventData;
  result: GroupResult;
  onCopy: () => void;
  onShowQr: (t: Transfer) => void;
}

export function ResultView({ event, result, onCopy, onShowQr }: Props) {
  const nameOf = (id: string) => event.members.find((m) => m.id === id)?.name ?? '(đã xoá)';

  return (
    <section className="card card--pad">
      {/* Banner tổng quan */}
      <div className="result-hero">
        <div className="result-hero__total num">{formatVNDSuffix(result.totalSpent)}</div>
        <div className="result-hero__sub">
          Tổng chi · {event.members.length} người · TB {formatVNDSuffix(result.averagePerMember)}/người
        </div>
      </div>

      {/* Phần nổi bật nhất: ai chuyển ai — bấm vào để hiện mã QR */}
      <div className="section-title">Ai chuyển ai · bấm để lấy QR</div>
      {result.transfers.length === 0 ? (
        <p className="muted">Đã cân bằng — không ai phải chuyển ai.</p>
      ) : (
        <div>
          {result.transfers.map((t, i) => (
            <button
              className="transfer"
              key={i}
              onClick={() => onShowQr(t)}
              aria-label={`Tạo mã QR chuyển cho ${nameOf(t.to)}`}
            >
              <div className="transfer__pair">
                <Avatar name={nameOf(t.from)} size={28} />
                <span className="transfer__name">{nameOf(t.from)}</span>
                <span className="transfer__arrow">→</span>
                <Avatar name={nameOf(t.to)} size={28} />
                <span className="transfer__name">{nameOf(t.to)}</span>
              </div>
              <div className="transfer__amt num">{formatVNDSuffix(t.amount)}</div>
              <span className="transfer__qr" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h8v8H3V3zm2 2v4h4V5H5z" />
                  <path d="M13 3h8v8h-8V3zm2 2v4h4V5h-4z" />
                  <path d="M3 13h8v8H3v-8zm2 2v4h4v-4H5z" />
                  <path d="M14 14h2v2h-2zm4 0h3v2h-3zm-4 3h2v4h-2zm3 1h4v3h-2v-1h-2z" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="warn" style={{ marginTop: 'var(--sp-4)' }}>
          {result.warnings.map((w, i) => (
            <div key={i}>⚠ {w.message}</div>
          ))}
        </div>
      )}

      {/* Chi tiết số dư từng người */}
      <details style={{ marginTop: 'var(--sp-4)' }}>
        <summary className="section-title" style={{ cursor: 'pointer', marginBottom: 0 }}>
          Chi tiết từng người
        </summary>
        <div style={{ marginTop: 'var(--sp-2)' }}>
          {result.balances.map((b) => (
            <div className="person" key={b.id}>
              <Avatar name={b.name} size={36} />
              <div className="grow">
                <div className="person__name">{b.name}</div>
                <div className="person__meta num">
                  trả {formatVNDSuffix(b.paid)} · phần {formatVNDSuffix(b.share)}
                </div>
              </div>
              <span className={'tag ' + (b.net > 0 ? 'tag--pos' : b.net < 0 ? 'tag--neg' : 'tag--zero')}>
                {b.net === 0 ? 'đủ' : (b.net > 0 ? '+' : '') + formatVNDSuffix(b.net)}
              </span>
            </div>
          ))}
        </div>
      </details>

      <button
        className="btn btn--primary btn--block btn--lg"
        style={{ marginTop: 'var(--sp-4)' }}
        onClick={onCopy}
      >
        📋 Copy kết quả để gửi nhóm
      </button>
    </section>
  );
}
