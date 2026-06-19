interface Props {
  onExit: () => void;
}

/**
 * Option 2 — Phòng nhóm (đồng bộ nhiều thiết bị) sẽ dựng trên nền Option 1.
 * Lõi thuật toán (computeResult, simplifyDebts...) tái dùng nguyên vẹn; chỉ cần
 * thay lớp lưu trữ localStorage bằng backend đồng bộ (dự kiến Firebase).
 */
export function RoomPlaceholder({ onExit }: Props) {
  return (
    <div className="app">
      <header className="appbar">
        <button className="iconbtn" onClick={onExit} aria-label="Quay lại">
          ‹
        </button>
        <div className="appbar__title">Phòng nhóm</div>
      </header>

      <div className="content">
        <div className="card card--pad stack">
          <div style={{ fontSize: 40 }}>🚧</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Đang phát triển</h2>
          <p className="muted">
            “Phòng nhóm” cho phép tạo một phòng có mã riêng để mọi người cùng vào, tự điền tên và nhập
            khoản chi của mình, xem kết quả chung — đồng bộ thời gian thực giữa nhiều thiết bị.
          </p>
          <p className="muted">
            Phần này dựng trên đúng lõi thuật toán của “Tính nhanh”, chỉ thay lưu trữ trên máy bằng máy
            chủ đồng bộ (dự kiến Firebase). Trong lúc đó, “Tính nhanh” đã chạy đầy đủ.
          </p>
          <button className="btn btn--primary btn--block" onClick={onExit}>
            Dùng “Tính nhanh”
          </button>
        </div>
      </div>
    </div>
  );
}
