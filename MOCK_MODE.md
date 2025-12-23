# Mock Mode - Hướng dẫn sử dụng

## Giới thiệu

Mock Mode cho phép bạn test toàn bộ chức năng của Freelancer dApp mà không cần kết nối với blockchain thật. Điều này giúp bạn:

- ✅ Test nhanh các tính năng mà không cần setup wallet
- ✅ Không tốn gas fee
- ✅ Dễ dàng chuyển đổi giữa các vai trò (Client, Freelancer, Arbiter)
- ✅ Có sẵn dữ liệu mẫu để test

## Cách chạy Mock Mode

1. Đảm bảo bạn đang ở nhánh `mock-data`:
```bash
git checkout mock-data
```

2. Cài đặt dependencies (nếu chưa):
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

4. Mở trình duyệt tại: http://localhost:3000

## Các tài khoản Mock có sẵn

Khi click "Kết nối ví (Mock)", bạn sẽ thấy 6 tài khoản để test:

### Clients (Chủ dự án)
- **Client 1**: `0x1234...7890` - Có 4 hợp đồng đã tạo
- **Client 2**: `0x2345...8901` - Có 2 hợp đồng đã tạo

### Freelancers (Người làm việc)
- **Freelancer 1**: `0x3456...9012` - Đang làm 3 hợp đồng
- **Freelancer 2**: `0x4567...0123` - Đang làm 1 hợp đồng

### Arbiters (Trọng tài)
- **Arbiter 1**: `0x5678...1234` - Có 1 hợp đồng tranh chấp
- **Arbiter 2**: `0x6789...2345` - Chưa có tranh chấp

## Dữ liệu Mock có sẵn

### Hợp đồng mẫu:

1. **Phát triển website React cho startup**
   - Trạng thái: Đang thực hiện
   - Thanh toán: 0.5 ETH
   - Client: Client 1
   - Freelancer: Freelancer 1

2. **Thiết kế logo và branding**
   - Trạng thái: Đã thanh toán (chờ freelancer nhận)
   - Thanh toán: 0.2 ETH
   - Client: Client 1

3. **Viết content marketing cho blog**
   - Trạng thái: Đã nộp (chờ client duyệt)
   - Thanh toán: 0.3 ETH
   - Client: Client 2
   - Freelancer: Freelancer 1

4. **Phát triển mobile app Flutter**
   - Trạng thái: Hoàn thành
   - Thanh toán: 1 ETH
   - Client: Client 1
   - Freelancer: Freelancer 2

5. **Audit smart contract Solidity**
   - Trạng thái: Tranh chấp
   - Thanh toán: 0.8 ETH
   - Client: Client 2
   - Freelancer: Freelancer 1

6. **Tạo video explainer animation**
   - Trạng thái: Đã thanh toán (chờ freelancer nhận)
   - Thanh toán: 0.4 ETH
   - Client: Client 1

## Các chức năng có thể test

### Với vai trò Client:
- ✅ Tạo hợp đồng mới
- ✅ Xem danh sách hợp đồng đã tạo
- ✅ Duyệt công việc đã nộp
- ✅ Hủy hợp đồng
- ✅ Mở tranh chấp

### Với vai trò Freelancer:
- ✅ Xem danh sách công việc có sẵn
- ✅ Nhận công việc
- ✅ Nộp kết quả (với IPFS hash)
- ✅ Xem danh sách công việc đang làm
- ✅ Mở tranh chấp

### Với vai trò Arbiter:
- ✅ Xem danh sách hợp đồng tranh chấp
- ✅ Giải quyết tranh chấp (chưa implement UI)

## Hướng dẫn test từng tính năng

### 1. Test tạo hợp đồng mới (Client)
1. Chọn tài khoản Client 1 hoặc Client 2
2. Click tab "Client"
3. Click "Tạo hợp đồng mới"
4. Điền thông tin:
   - Tiêu đề: "Test Job"
   - Mô tả: "This is a test job"
   - Thanh toán: 0.1
   - Deadline: Chọn ngày trong tương lai
   - Arbiter: Copy địa chỉ của Arbiter 1 hoặc 2
5. Click "Tạo hợp đồng"

### 2. Test nhận việc (Freelancer)
1. Chọn tài khoản Freelancer 1 hoặc 2
2. Click tab "Freelancer"
3. Click "Xem việc có sẵn" trong sidebar
4. Chọn một công việc và click "Nhận việc"
5. Công việc sẽ chuyển sang trạng thái "Đang thực hiện"

### 3. Test nộp kết quả (Freelancer)
1. Với tài khoản Freelancer đang có việc "Đang thực hiện"
2. Click "Nộp kết quả" trên card công việc
3. Nhập IPFS hash (ví dụ: QmTest123...)
4. Công việc chuyển sang trạng thái "Đã nộp"

### 4. Test duyệt công việc (Client)
1. Chọn tài khoản Client có công việc "Đã nộp"
2. Click "Duyệt công việc" trên card
3. Công việc chuyển sang trạng thái "Hoàn thành"

### 5. Test tranh chấp
1. Với Client hoặc Freelancer có công việc "Đang thực hiện" hoặc "Đã nộp"
2. Click "Tranh chấp"
3. Công việc chuyển sang trạng thái "Tranh chấp"
4. Chuyển sang tài khoản Arbiter để xem

## Lưu ý

- Mock data được lưu trong memory, sẽ reset khi refresh trang
- Các thay đổi chỉ tồn tại trong session hiện tại
- Để test lại từ đầu, chỉ cần refresh trang
- Mock mode tự động bật khi `NODE_ENV === 'development'`

## Chuyển về Production Mode

Để chuyển về production mode với blockchain thật:

1. Checkout về nhánh main:
```bash
git checkout main
```

2. Hoặc xóa/comment phần redirect trong `next.config.js`

3. Cấu hình `.env` với thông tin blockchain thật

## Cấu trúc file Mock

- `app/utils/mockData.ts` - Dữ liệu mock và service class
- `app/components/MockWalletConnection.tsx` - Component kết nối ví mock
- `app/page-mock.tsx` - Trang chính cho mock mode
- `app/mock/page.tsx` - Route cho mock mode

## Troubleshooting

### Trang không redirect sang /mock
- Kiểm tra `next.config.js` có phần redirects
- Đảm bảo đang chạy ở development mode
- Restart dev server

### Không thấy dữ liệu
- Refresh trang để reset mock data
- Kiểm tra console có lỗi không

### Thay đổi không được lưu
- Mock data chỉ lưu trong memory
- Refresh trang sẽ reset về dữ liệu ban đầu
- Đây là behavior mong muốn để dễ test

## Mở rộng Mock Data

Để thêm dữ liệu mock mới, edit file `app/utils/mockData.ts`:

```typescript
export const MOCK_JOBS: MockJob[] = [
    // Thêm job mới ở đây
    {
        id: BigInt(7),
        client: MOCK_ADDRESSES.client1,
        // ... các field khác
    }
];
```

Hoặc tạo job mới qua UI bằng form "Tạo hợp đồng mới"!