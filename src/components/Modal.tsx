import { useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from './Modal.module.css';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Bottom-sheet trên mobile, hộp thoại giữa trên màn rộng. Đóng bằng Esc hoặc bấm nền. */
export function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          <button className="iconbtn" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
