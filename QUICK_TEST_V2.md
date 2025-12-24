# Test nhanh các tính năng mới - Version 2.0

## 🚀 Deploy Contract mới

```bash
# 1. Compile contract
npx hardhat compile

# 2. Deploy lên localhost
npx hardhat run scripts/deploy.js --network localhost

# 3. Copy địa chỉ contract và cập nhật .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# 4. Chạy frontend
npm run dev
```

## 🧪 Test Cases

### 1. Test Hệ thống ứng tuyển

**Bước 1: Client tạo job**
- Kết nối ví làm Client
- Tạo job mới với title "Test Job Application"
- Đặt cọc 0.1 ETH

**Bước 2: Freelancer ứng tuyển**
- Kết nối ví khác làm Freelancer
- Vào "Việc đang tuyển"
- Click "Xem chi tiết" job vừa tạo
- Viết proposal: "Tôi có kinh nghiệm 5 năm..."
- Click "Gửi ứng tuyển"

**Bước 3: Client chọn freelancer**
- Quay lại ví Client
- Vào job vừa tạo
- Thấy "👥 Danh sách ứng viên (1)"
- Click chọn freelancer
- Click "✅ Chọn freelancer này"

**Kết quả mong đợi:**
- Job chuyển từ "Funded" → "InProgress"
- Freelancer nhận được job

### 2. Test Lịch sử nộp bài

**Bước 1: Freelancer nộp lần 1**
- Ở ví Freelancer
- Vào job đang làm
- Upload file hoặc nhập IPFS hash
- Ghi chú: "Bản nháp đầu tiên"
- Click "📤 Nộp kết quả"

**Bước 2: Client từ chối**
- Ở ví Client  
- Vào job đã submit
- Click "❌ Từ chối kết quả"
- Lý do: "Cần thêm tính năng X"

**Bước 3: Freelancer nộp lần 2**
- Ở ví Freelancer
- Nộp lại với IPFS hash khác
- Ghi chú: "Đã thêm tính năng X"

**Kết quả mong đợi:**
- Thấy "📜 Lịch sử nộp bài (2 lần)"
- Lần mới nhất có label "🆕 Mới nhất"
- Client thấy được cả 2 lần nộp

### 3. Test Đánh giá Freelancer

**Bước 1: Client duyệt kết quả**
- Ở ví Client
- Click "✅ Duyệt và thanh toán"
- Job chuyển sang "Completed"

**Bước 2: Client đánh giá**
- Thấy form "⭐ Đánh giá Freelancer"
- Chọn 5 sao
- Nhận xét: "Làm việc rất tốt!"
- Click "📝 Gửi đánh giá"

**Bước 3: Kiểm tra rating**
- Ở ví Freelancer
- Vào Dashboard thấy rating badge
- Ở danh sách ứng viên job khác thấy "⭐ 5.0 (1 đánh giá)"

**Kết quả mong đợi:**
- Freelancer có rating 5.0/5
- Rating hiển thị ở profile và khi ứng tuyển

## 🔍 Kiểm tra UI Components

### ApplicationsList
- [ ] Hiển thị danh sách ứng viên
- [ ] Hiển thị proposal của từng người
- [ ] Hiển thị rating (nếu có)
- [ ] Chọn được freelancer

### SubmissionHistory  
- [ ] Hiển thị tất cả lần nộp
- [ ] Lần mới nhất có highlight
- [ ] Hiển thị comment/ghi chú
- [ ] Link IPFS hoạt động

### RatingForm
- [ ] Chọn được 1-5 sao
- [ ] Nhập được comment
- [ ] Gửi đánh giá thành công
- [ ] Hiển thị đánh giá đã có

### FreelancerRatingBadge
- [ ] Hiển thị rating trung bình
- [ ] Hiển thị số lượng đánh giá
- [ ] Hiển thị "Chưa có đánh giá" nếu mới

## 🐛 Test Edge Cases

### 1. Nhiều freelancer ứng tuyển
- Tạo 3-4 ví freelancer khác nhau
- Tất cả ứng tuyển cùng 1 job
- Client thấy được danh sách đầy đủ
- Chọn 1 người, những người khác không được chọn

### 2. Nộp bài nhiều lần
- Freelancer nộp 5-6 lần
- Mỗi lần có comment khác nhau
- Client thấy được lịch sử đầy đủ
- Lần cuối cùng được highlight

### 3. Rating tích lũy
- Freelancer làm 3-4 job khác nhau
- Nhận rating khác nhau: 3, 4, 5, 4 sao
- Rating trung bình = (3+4+5+4)/4 = 4.0
- Hiển thị "⭐ 4.0 (4 đánh giá)"

## ⚠️ Lưu ý

- Contract mới không tương thích với dữ liệu cũ
- Cần deploy contract mới và cập nhật địa chỉ
- Test trên localhost trước khi deploy mainnet
- Backup dữ liệu quan trọng trước khi migrate

## 📞 Báo lỗi

Nếu gặp lỗi, ghi lại:
1. Bước nào gây lỗi
2. Thông báo lỗi (nếu có)
3. Console log
4. Screenshot UI