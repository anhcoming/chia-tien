import styles from './ModeSelect.module.css';

interface Props {
  onPick: (screen: 'quick' | 'room') => void;
}

export function ModeSelect({ onPick }: Props) {
  return (
    <div className="app">
      <div className="content" style={{ justifyContent: 'center' }}>
        <div className={styles.hero}>
          <div className={styles.logo}>₫</div>
          <h1 className={styles.title}>Chia Tiền</h1>
          <p className={styles.subtitle}>Tính tiền nhóm trong 30 giây — không cần đăng nhập.</p>
        </div>

        <div className="stack">
          <button className={`card ${styles.option}`} onClick={() => onPick('quick')}>
            <div className={`${styles.icon} ${styles.iconQuick}`}>⚡</div>
            <div className={styles.body}>
              <div className={styles.optitle}>Tính nhanh</div>
              <div className={styles.desc}>Một người nhập hộ cả nhóm. Mở ra dùng ngay, lưu trên máy.</div>
            </div>
            <div className={styles.chev}>›</div>
          </button>

          <button className={`card ${styles.option}`} onClick={() => onPick('room')}>
            <div className={`${styles.icon} ${styles.iconRoom}`}>👥</div>
            <div className={styles.body}>
              <div className={styles.optitle}>
                Phòng nhóm <span className="badge">Sắp có</span>
              </div>
              <div className={styles.desc}>Tạo phòng chung, mỗi người tự nhập khoản chi của mình.</div>
            </div>
            <div className={styles.chev}>›</div>
          </button>
        </div>

        <div className={styles.pills}>
          <span className={styles.pill}>Không đăng nhập</span>
          <span className={styles.pill}>Lưu trên máy</span>
          <span className={styles.pill}>Miễn phí</span>
        </div>
      </div>
    </div>
  );
}
