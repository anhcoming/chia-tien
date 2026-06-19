import type { EventData } from '../core';

/* =========================================================================
   LƯU TRỮ CỤC BỘ (localStorage) — có đánh version để dễ nâng cấp schema sau.
   Bọc trong try/catch để app vẫn chạy khi storage bị chặn (vd chế độ riêng tư).
   ========================================================================= */

const KEY = 'chia-tien:quick';
const VERSION = 1;

interface Persisted {
  version: number;
  event: EventData;
}

export function loadQuickEvent(): EventData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Persisted;
    if (!data || data.version !== VERSION || !data.event) return null;
    return data.event;
  } catch {
    return null;
  }
}

export function saveQuickEvent(event: EventData): void {
  try {
    const payload: Persisted = { version: VERSION, event };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Hết quota / bị chặn → bỏ qua, dữ liệu vẫn còn trong phiên làm việc.
  }
}

export function clearQuickEvent(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
