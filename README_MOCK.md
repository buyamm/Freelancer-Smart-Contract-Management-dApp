# 🚀 Mock Mode - Test nhanh Freelancer dApp

## Chạy Mock Mode

```bash
npm run dev
```

Truy cập: http://localhost:3000 (tự động redirect sang /mock)

## Tài khoản Mock có sẵn

### 👨‍💼 Clients (Chủ dự án)
- **Client 1**: Có 4 hợp đồng đã tạo
- **Client 2**: Có 2 hợp đồng đã tạo

### 👩‍💻 Freelancers (Người làm việc)  
- **Freelancer 1**: Đang làm 3 hợp đồng
- **Freelancer 2**: Đang làm 1 hợp đồng

### ⚖️ Arbiters (Trọng tài)
- **Arbiter 1**: Có 1 hợp đồng tranh chấp
- **Arbiter 2**: Chưa có tranh chấp

## Test các tính năng

### ✅ Client
- Tạo hợp đồng mới
- Duyệt công việc đã nộp  
- Hủy hợp đồng
- Mở tranh chấp

### ✅ Freelancer
- Xem & nhận công việc có sẵn
- Nộp kết quả (IPFS hash)
- Mở tranh chấp

### ✅ Arbiter
- Xem hợp đồng tranh chấp

## Dữ liệu mẫu

6 hợp đồng với các trạng thái khác nhau:
- 🟡 Đang chờ freelancer
- 🔵 Đang thực hiện  
- 🟠 Đã nộp (chờ duyệt)
- 🟢 Hoàn thành
- 🔴 Tranh chấp

## Lưu ý

- Mock data reset khi refresh trang
- Không cần wallet thật
- Không tốn gas fee
- Chỉ để test UI/UX

Chúc bạn test vui vẻ! 🎉