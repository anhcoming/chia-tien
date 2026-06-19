import { useEffect, useMemo, useState } from 'react';
import qrcode from 'qrcode-generator';
import type { BankAccount, Member } from '../../core';
import { buildVietQrString, formatVNDSuffix } from '../../core';
import { BANKS, bankByBin } from '../../data/banks';
import { Avatar } from '../../components/Avatar';
import { Modal } from '../../components/Modal';

interface Props {
  member: Member;
  amount: number;
  defaultInfo: string;
  onClose: () => void;
  onSaveBank: (id: string, bank: BankAccount | null) => void;
}

export function QrModal({ member, amount, defaultInfo, onClose, onSaveBank }: Props) {
  const [bankBin, setBankBin] = useState(member.bank?.bankBin ?? '');
  const [accountNo, setAccountNo] = useState(member.bank?.accountNo ?? '');
  const [accountName, setAccountName] = useState(member.bank?.accountName ?? '');
  const [info, setInfo] = useState(defaultInfo);

  const ready = bankBin !== '' && accountNo.trim() !== '';

  // Ghi nhớ số tài khoản cho thành viên — lần sau khỏi nhập lại.
  useEffect(() => {
    if (ready) {
      onSaveBank(member.id, {
        bankBin,
        accountNo: accountNo.trim(),
        accountName: accountName.trim() || undefined,
      });
    }
  }, [bankBin, accountNo, accountName, ready, member.id, onSaveBank]);

  const svg = useMemo(() => {
    if (!ready) return '';
    const payload = buildVietQrString({
      bankBin,
      accountNo: accountNo.trim(),
      amount,
      addInfo: info,
      accountName: accountName || member.name,
    });
    const qr = qrcode(0, 'M');
    qr.addData(payload);
    qr.make();
    return qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
  }, [ready, bankBin, accountNo, amount, info, accountName, member.name]);

  const bank = bankByBin(bankBin);

  return (
    <Modal title={`Chuyển cho ${member.name}`} onClose={onClose}>
      <div className="qr-head">
        <Avatar name={member.name} size={44} />
        <div className="grow">
          <div style={{ fontWeight: 700 }}>{member.name}</div>
          <div className="muted">
            Số tiền:{' '}
            <b className="num" style={{ color: 'var(--c-primary-strong)' }}>
              {formatVNDSuffix(amount)}
            </b>
          </div>
        </div>
      </div>

      {ready && (
        <>
          <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="muted" style={{ textAlign: 'center' }}>
            Mở app ngân hàng → quét mã để chuyển đúng {formatVNDSuffix(amount)}
            {bank ? ` tới ${bank.name}` : ''}.
          </p>
        </>
      )}

      <div className="field">
        <label className="label" htmlFor="qr-bank">Ngân hàng người nhận</label>
        <select id="qr-bank" className="select" value={bankBin} onChange={(e) => setBankBin(e.target.value)}>
          <option value="">— Chọn ngân hàng —</option>
          {BANKS.map((b) => (
            <option key={b.bin} value={b.bin}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="qr-acc">Số tài khoản</label>
        <input
          id="qr-acc"
          className="input num"
          inputMode="numeric"
          value={accountNo}
          placeholder="Số tài khoản người nhận"
          onChange={(e) => setAccountNo(e.target.value.replace(/\s/g, ''))}
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="qr-name">Tên chủ tài khoản (không bắt buộc)</label>
        <input
          id="qr-name"
          className="input"
          value={accountName}
          placeholder="VD: NGUYEN VAN A"
          onChange={(e) => setAccountName(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="qr-info">Nội dung chuyển khoản</label>
        <input id="qr-info" className="input" value={info} onChange={(e) => setInfo(e.target.value)} />
      </div>

      {!ready && <p className="muted">Nhập ngân hàng và số tài khoản của {member.name} để tạo mã QR.</p>}
    </Modal>
  );
}
