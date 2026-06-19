/** Danh sách ngân hàng VN phổ biến + mã BIN (NAPAS) để sinh VietQR. */
export interface Bank {
  bin: string;
  code: string;
  name: string;
}

export const BANKS: Bank[] = [
  { bin: '970436', code: 'VCB', name: 'Vietcombank' },
  { bin: '970407', code: 'TCB', name: 'Techcombank' },
  { bin: '970418', code: 'BIDV', name: 'BIDV' },
  { bin: '970415', code: 'CTG', name: 'VietinBank' },
  { bin: '970405', code: 'AGR', name: 'Agribank' },
  { bin: '970422', code: 'MB', name: 'MB Bank' },
  { bin: '970416', code: 'ACB', name: 'ACB' },
  { bin: '970432', code: 'VPB', name: 'VPBank' },
  { bin: '970423', code: 'TPB', name: 'TPBank' },
  { bin: '970403', code: 'STB', name: 'Sacombank' },
  { bin: '970441', code: 'VIB', name: 'VIB' },
  { bin: '970443', code: 'SHB', name: 'SHB' },
  { bin: '970437', code: 'HDB', name: 'HDBank' },
  { bin: '970448', code: 'OCB', name: 'OCB' },
  { bin: '970426', code: 'MSB', name: 'MSB' },
  { bin: '970440', code: 'SEAB', name: 'SeABank' },
  { bin: '970431', code: 'EIB', name: 'Eximbank' },
  { bin: '970449', code: 'LPB', name: 'LPBank' },
  { bin: '970429', code: 'SCB', name: 'SCB' },
  { bin: '970427', code: 'VAB', name: 'VietABank' },
  { bin: '970428', code: 'NAB', name: 'Nam A Bank' },
  { bin: '970409', code: 'BAB', name: 'Bac A Bank' },
  { bin: '970412', code: 'PVCB', name: 'PVcomBank' },
  { bin: '970425', code: 'ABB', name: 'ABBANK' },
  { bin: '970454', code: 'BVB', name: 'BVBank (Bản Việt)' },
  { bin: '970400', code: 'SGB', name: 'Saigonbank' },
  { bin: '970452', code: 'KLB', name: 'KienLongBank' },
  { bin: '970438', code: 'BVB2', name: 'BaoViet Bank' },
  { bin: '970430', code: 'PGB', name: 'PGBank' },
  { bin: '970406', code: 'DAB', name: 'DongA Bank' },
];

export const bankByBin = (bin: string): Bank | undefined => BANKS.find((b) => b.bin === bin);
