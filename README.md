# Chia Tiền — ứng dụng chia tiền nhóm cho người Việt

Web app tính tiền nhóm: thêm thành viên → nhập các khoản chi → app tự tính **ai chuyển ai bao nhiêu**, tối giản số lần chuyển khoản, rồi xuất ra text để dán thẳng vào nhóm chat.

> **Nguyên tắc:** Không đăng nhập · Mở ra dùng ngay · Lưu trên máy (mở lại vẫn còn) · Tiếng Việt · Mobile-first.

Dự án làm portfolio: phần "khoe" chính là **lõi thuật toán** (`src/core/`) — hàm thuần, có kiểm thử đầy đủ, tính tiền bằng số nguyên (không sai số), và thuật toán tối giản nợ.

---

## Hai chế độ

| | Trạng thái | Mô tả |
|---|---|---|
| **① Tính nhanh** | ✅ Hoàn chỉnh, chạy thật | Một người nhập hộ cả nhóm. Toàn bộ chạy offline, lưu `localStorage`. |
| **② Phòng nhóm** | 🚧 Dựng sau | Tạo phòng có mã riêng, mọi người cùng vào nhập khoản chi của mình, đồng bộ nhiều thiết bị (dự kiến Firebase). |

Option 2 sẽ tái dùng **nguyên vẹn** lõi thuật toán của Option 1 — chỉ thay lớp lưu trữ `localStorage` bằng backend đồng bộ.

---

## Chạy thử

```bash
npm install
npm run dev        # mở http://localhost:5173
```

Lệnh khác:

```bash
npm test           # chạy unit test cho lõi thuật toán (Vitest)
npm run build      # build production (tsc kiểm kiểu + vite build)
npm run preview    # xem thử bản build
```

---

## Stack

- **React 18 + TypeScript** — TS biên dịch bỏ hết lúc build nên **không tốn runtime**, nhưng bắt lỗi sớm cho data model + thuật toán.
- **Vite** — dev server nhanh, build gọn.
- **CSS Modules + biến CSS** — không dùng thư viện UI/CSS-in-JS → bundle nhỏ, tải nhanh. Font hệ thống (0 byte tải về). Tự hỗ trợ sáng/tối.
- **Vitest** — test lõi thuật toán.
- **localStorage** — lưu cục bộ, không cần mạng.

Phụ thuộc runtime tối giản: `react`, `react-dom`, và `qrcode-generator` (vẽ mã QR — nhẹ, không phụ thuộc).

---

## Cấu trúc thư mục

```
.
├── index.html
├── vite.config.ts          # cấu hình Vite + Vitest
├── tsconfig.json
└── src/
    ├── main.tsx            # điểm vào React
    ├── App.tsx            # điều hướng 3 màn: chọn chế độ / tính nhanh / phòng nhóm
    ├── index.css          # design tokens + hệ thống UI (biến CSS, nút, thẻ, chip…)
    │
    ├── core/              # ★ LÕI THUẬT TOÁN — hàm thuần, không phụ thuộc UI, có test
    │   ├── types.ts       #   mô hình dữ liệu (Member, Expense, Split, EventData…)
    │   ├── money.ts       #   định dạng & đọc tiền VND (số nguyên đồng)
    │   ├── apportion.ts   #   chia nguyên bảo toàn tổng (largest remainder)
    │   ├── split.ts       #   tính phần mỗi người cho 1 khoản chi (4 kiểu chia)
    │   ├── balances.ts    #   số dư ròng từng người (đã trả − phải gánh)
    │   ├── settle.ts      #   greedy tối giản số lần chuyển khoản
    │   ├── result.ts      #   computeResult() — gộp tất cả
    │   ├── format.ts      #   xuất text để dán nhóm chat
    │   ├── vietqr.ts      #   sinh chuỗi VietQR (NAPAS/EMVCo) + CRC16
    │   ├── index.ts       #   API công khai của lõi
    │   └── __tests__/     #   apportion / split / settle / integration
    │
    ├── store/             # lưu trữ + trạng thái
    │   ├── storage.ts     #   bọc localStorage (có version)
    │   └── useQuickEvent.ts #  hook reducer quản lý nhóm + tự lưu
    ├── data/banks.ts      # danh sách ngân hàng VN + mã BIN (cho VietQR)
    │
    ├── components/        # UI dùng chung: MoneyInput, Modal
    ├── features/
    │   ├── mode-select/   # màn hình đầu: chọn chế độ
    │   ├── quick/         # Option 1: MembersCard, ExpenseForm, ExpenseList, ResultView
    │   └── room/          # Option 2: placeholder
    └── utils/id.ts
```

---

## Lõi thuật toán

### 1. Số dư ròng (net balance)

Với mỗi thành viên:

```
net = (tổng đã trả) − (tổng phần phải gánh)
```

- `net > 0`: **dư** — đã trả nhiều hơn phần mình → người khác phải trả lại.
- `net < 0`: **thiếu** — phải trả thêm.

Khi dữ liệu hợp lệ, **tổng tất cả `net` luôn = 0** (đã có test kiểm chứng). Kết quả "ai nợ ai" **không bao giờ được lưu cứng** — luôn tính lại từ danh sách khoản chi (*single source of truth*).

### 2. Tối giản số lần chuyển khoản (debt simplification)

Thay vì để mọi người chuyển chéo lằng nhằng, app gom lại còn **ít lệnh chuyển nhất có thể** bằng thuật toán **greedy**:

> Mỗi bước, ghép **người thiếu nhiều nhất** với **người dư nhiều nhất**, chuyển đúng `min(thiếu, dư)`, rồi lặp lại tới khi mọi người về 0.

Greedy cho ra **tối đa `n − 1` giao dịch** với nhóm `n` người.

**Vì sao không tối ưu tuyệt đối?** Tìm số giao dịch ít nhất *tuyệt đối* là bài toán **NP-hard** — nó quy về **subset-sum / phân hoạch tập** (muốn gộp tối đa các nhóm con có tổng bằng 0 để triệt nợ chéo). Với quy mô nhóm bạn bè (vài → vài chục người), greedy gần như luôn cho kết quả tối ưu trên dữ liệu thực, lại chạy nhanh (`O(n²)`) và dễ giải thích. Đây là **đánh đổi có chủ đích** giữa độ tối ưu lý thuyết và tốc độ + sự đơn giản.

### 3. Tiền là số nguyên — không sai số

Mọi số tiền biểu diễn bằng **số nguyên đồng (VND)**, tuyệt đối không dùng số thực (tránh `0.1 + 0.2 !== 0.3`). Khi chia lẻ (vd 10.000đ cho 3 người), `apportion()` dùng phương pháp **largest remainder (Hamilton)**: chia phần nguyên trước, rồi trao từng đồng lẻ còn lại cho người có phần thập phân lớn nhất — đảm bảo **tổng các phần đúng bằng số tiền gốc**, không thất thoát hay dư 1 đồng.

```
apportion(10000, [1,1,1]) → [3334, 3333, 3333]   (tổng = 10000)
```

### Bốn kiểu chia một khoản

| Kiểu | Ý nghĩa |
|---|---|
| **Chia đều cả nhóm** (mặc định) | Chia đều cho mọi thành viên. |
| **Chia đều, loại trừ vài người** | Chỉ chia cho những người được chọn (món có người không ăn). |
| **Chính xác từng người** | Mỗi người một số tiền cố định (tổng phải khớp khoản chi). |
| **Theo suất/phần** | Ai ăn nhiều tính nhiều suất; chia theo tỉ lệ suất. |

---

## Mô hình dữ liệu

```
EventData (Nhóm/Sự kiện)
├── members:  Member[]      // { id, name }
└── expenses: Expense[]
        ├── payerId         // ai trả
        ├── amount          // số tiền (số nguyên đồng)
        ├── description     // nội dung
        └── split           // chia cho ai + kiểu chia
              ├── { mode: 'equal',  participants: id[] }
              ├── { mode: 'exact',  amounts: { id: số tiền } }
              └── { mode: 'shares', shares:  { id: số suất } }
```

Kết quả (`GroupResult`) gồm: tổng chi, trung bình mỗi người, bảng số dư từng người, và danh sách chuyển khoản đã tối giản — tất cả **tính từ `expenses`**.

---

## Hướng phát triển

- ✅ **Tạo QR chuyển khoản (VietQR) — đã làm:** ở phần kết quả, bấm vào dòng "ai chuyển ai" để hiện mã VietQR đúng số tiền + số tài khoản người nhận; app ngân hàng quét là chuyển ngay. Số tài khoản được nhớ theo từng thành viên.
- **Phòng nhóm đồng bộ nhiều thiết bị** (Option 2) — Firebase Realtime DB / Firestore.
- **Xuất Excel / PDF** bảng chia tiền.
- **Quét hoá đơn** tự nhận số tiền (OCR).
- **Đa tiền tệ** cho nhóm đi du lịch nước ngoài.
- Nhiều nhóm/sự kiện lưu song song, lịch sử các lần chia.

---

## Ghi chú kỹ thuật đáng chú ý

- Lõi `src/core/` là **hàm thuần**, không import React/DOM/localStorage → test dễ, tái dùng được cho Option 2.
- `computeResult()` được gọi qua `useMemo` mỗi khi dữ liệu đổi → UI luôn phản ánh đúng, không có trạng thái kết quả "lệch pha".
- Lưu `localStorage` có **đánh version** để nâng cấp schema về sau mà không vỡ dữ liệu cũ.
- Ô nhập tiền dùng `inputMode="numeric"` (bàn phím số) và tự thêm dấu phân cách hàng nghìn khi gõ.
