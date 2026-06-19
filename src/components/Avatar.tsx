import { nameColor } from '../utils/color';

interface Props {
  name: string;
  size?: number;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  // Tên người Việt: chữ cuối thường là tên gọi → lấy chữ cái đầu của nó.
  return parts[parts.length - 1][0].toUpperCase();
}

export function Avatar({ name, size = 36 }: Props) {
  const { bg, fg } = nameColor(name || '?');
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.42) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
