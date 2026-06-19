import { formatVND, parseVND } from '../core';

interface Props {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
  ariaLabel?: string;
}

/**
 * Ô nhập tiền: bàn phím số (inputMode="numeric"), tự thêm dấu chấm ngăn cách
 * hàng nghìn khi gõ (50000 → 50.000), hậu tố "đ".
 */
export function MoneyInput({ value, onChange, placeholder, autoFocus, id, ariaLabel }: Props) {
  const display = value > 0 ? formatVND(value) : '';
  return (
    <div className="money">
      <input
        id={id}
        className="input num"
        inputMode="numeric"
        pattern="[0-9.]*"
        autoFocus={autoFocus}
        placeholder={placeholder ?? '0'}
        value={display}
        aria-label={ariaLabel}
        onChange={(e) => onChange(parseVND(e.target.value))}
      />
      <span className="money__suffix">đ</span>
    </div>
  );
}
