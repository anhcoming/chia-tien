/** Khai báo kiểu tối giản cho 'qrcode-generator' (không cần cài @types). */
declare module 'qrcode-generator' {
  interface QRCode {
    addData(data: string, mode?: string): void;
    make(): void;
    createSvgTag(opts?: { cellSize?: number; margin?: number; scalable?: boolean }): string;
    createDataURL(cellSize?: number, margin?: number): string;
    getModuleCount(): number;
    isDark(row: number, col: number): boolean;
  }
  function qrcode(typeNumber: number, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'): QRCode;
  export default qrcode;
}
