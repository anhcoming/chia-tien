import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Dùng defineConfig từ 'vitest/config' để có thêm trường `test` (typed).
// https://vitejs.dev/config/  |  https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Lõi thuật toán là hàm thuần -> chạy test trong môi trường node, không cần jsdom.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
