# Hướng dẫn sử dụng Freelancer dApp (Phiên bản mới)

## 🎯 Tính năng chính

### ✨ Điểm mới so với phiên bản cũ:
1. **Không còn trọng tài** - Đơn giản hóa quy trình
2. **Thông tin liên lạc** - Client và Freelancer có thể liên lạc trực tiếp
3. **Từ chối và nộp lại** - Client có thể yêu cầu freelancer làm lại
4. **Gia hạn deadline** - Linh hoạt hơn trong quản lý thời gian
5. **Phạt nộp muộn** - 10% penalty khi freelancer nộp muộn
6. **Tự động duyệt** - Sau 3 ngày không phản hồi, tự động thanh toán

---

## 👔 Hướng dẫn cho CLIENT

### Bước 1: Cập nhật thông tin liên lạc
1. Kết nối ví MetaMask
2. Chọn vai trò "Client"
3. Click "📞 Cập nhật thông tin liên lạc"
4. Điền thông tin (tùy chọn):
   - Tên
   - Email
   - Số điện thoại
   - Link chat (Telegram, Discord, etc.)

### Bước 2: Tạo công việc
1. Click "+ Tạo hợp đồng mới"
2. Điền thông tin:
   - Tiêu đề công việc
   - Mô tả chi tiết
   - Số tiền thanh toán (ETH)
   - Deadline
3. (Tùy chọn) Điền thông tin liên lạc nếu chưa cập nhật
4. Click "Tạo hợp đồng"
5. Xác nhận transaction trong MetaMask

### Bước 3: Chờ freelancer nhận việc
- Job sẽ hiển thị trạng thái "Funded"
- Freelancer có thể xem và nhận việc

### Bước 4: Khi freelancer nộp kết quả

#### Option A: Hài lòng với kết quả
1. Click "Xem chi tiết" job
2. Xem kết quả trên IPFS
3. Click "✅ Duyệt kết quả"
4. Tiền tự động chuyển cho freelancer

#### Option B: Chưa hài lòng (còn thời gian)
1. Click "❌ Từ chối kết quả"
2. Nhập lý do từ chối
3. Freelancer sẽ phải nộp lại
4. Có thể gia hạn deadline nếu cần

#### Option C: Muốn gia hạn deadline
1. Click "⏰ Gia hạn deadline"
2. Chọn deadline mới
3. Penalty (nếu có) sẽ được reset về 0

#### Option D: Muốn đổi freelancer
1. Click "🗑️ Xóa freelancer"
2. Xác nhận
3. Job quay về trạng thái "Funded"
4. Có thể điều chỉnh deadline mới

#### Option E: Không làm gì
- Sau **deadline + 3 ngày**, hệ thống tự động duyệt
- Freelancer vẫn nhận được tiền (trừ penalty nếu có)

### Lưu ý quan trọng:
- ⚠️ Chỉ có thể từ chối kết quả TRƯỚC deadline
- ⚠️ Sau deadline, không thể từ chối nữa
- ⚠️ Nếu freelancer nộp muộn, bạn sẽ nhận lại 10% penalty

---

## 👨‍💻 Hướng dẫn cho FREELANCER

### Bước 1: Cập nhật thông tin liên lạc
1. Kết nối ví MetaMask
2. Chọn vai trò "Freelancer"
3. Click "📞 Cập nhật thông tin liên lạc"
4. Điền đầy đủ thông tin để client dễ liên lạc

### Bước 2: Tìm và nhận việc
1. Xem tab "Việc đang tuyển"
2. Đọc kỹ mô tả công việc
3. Xem thông tin liên lạc của client
4. Click "Nhận việc" nếu phù hợp
5. Xác nhận transaction

### Bước 3: Làm việc
1. Hoàn thành công việc theo yêu cầu
2. **Chú ý deadline** - Nộp muộn sẽ bị phạt 10%
3. Nếu cần thêm thời gian, liên lạc với client để xin gia hạn

### Bước 4: Nộp kết quả
1. Upload file kết quả lên IPFS
2. Copy IPFS hash
3. Click "Nộp kết quả"
4. Paste IPFS hash
5. Xác nhận transaction

### Bước 5: Chờ client duyệt

#### Trường hợp 1: Client duyệt ngay
- ✅ Nhận tiền ngay lập tức
- Nếu nộp đúng hạn: Nhận 100%
- Nếu nộp muộn: Nhận 90% (bị phạt 10%)

#### Trường hợp 2: Client từ chối (trước deadline)
- ❌ Phải làm lại theo yêu cầu
- Có thể yêu cầu client gia hạn deadline
- Nộp lại kết quả mới

#### Trường hợp 3: Client không phản hồi
- ⏰ Sau deadline + 3 ngày, tự động duyệt
- Nhận tiền tự động (trừ penalty nếu có)

### Lưu ý quan trọng:
- ⚠️ **NỘP ĐÚNG HẠN** để tránh bị phạt 10%
- ⚠️ Nếu cần thêm thời gian, liên lạc với client TRƯỚC deadline
- ⚠️ Client có thể xóa bạn khỏi job nếu không hài lòng
- ✅ Làm việc chất lượng để tránh bị từ chối

---

## 💰 Cơ chế thanh toán

### Nộp đúng hạn:
```
Freelancer nhận: 100% payment
Client trả: 100% payment
```

### Nộp muộn:
```
Freelancer nhận: 90% payment (bị phạt 10%)
Client nhận lại: 10% payment (penalty)
```

### Ví dụ:
- Job payment: 1 ETH
- Freelancer nộp muộn
- Freelancer nhận: 0.9 ETH
- Client nhận lại: 0.1 ETH

---

## 🔄 Quy trình làm việc

```
1. Client tạo job + đặt cọc ETH
   ↓
2. Freelancer nhận việc
   ↓
3. Freelancer làm việc
   ↓
4. Freelancer nộp kết quả
   ↓
5a. Client duyệt → Thanh toán ngay
   hoặc
5b. Client từ chối → Freelancer làm lại (quay lại bước 3)
   hoặc
5c. Client không làm gì → Tự động duyệt sau 3 ngày
```

---

## 📞 Liên lạc giữa Client và Freelancer

### Khi nào cần liên lạc:
- Freelancer cần làm rõ yêu cầu
- Freelancer cần xin gia hạn deadline
- Client muốn thay đổi yêu cầu
- Client muốn kiểm tra tiến độ
- Giải quyết vấn đề khi bị từ chối

### Cách liên lạc:
1. Xem thông tin liên lạc trong job detail
2. Sử dụng email, phone, hoặc chat link
3. Thảo luận trực tiếp bên ngoài blockchain

---

## ⚠️ Lưu ý chung

### Cho Client:
- Viết mô tả công việc rõ ràng, chi tiết
- Đặt deadline hợp lý
- Phản hồi kịp thời khi freelancer nộp kết quả
- Chỉ từ chối khi thực sự cần thiết
- Gia hạn deadline nếu freelancer yêu cầu hợp lý

### Cho Freelancer:
- Đọc kỹ yêu cầu trước khi nhận việc
- Liên lạc với client nếu có thắc mắc
- Nộp kết quả ĐÚNG HẠN
- Làm việc chất lượng để tránh bị từ chối
- Yêu cầu gia hạn TRƯỚC deadline nếu cần

### Bảo mật:
- Không chia sẻ private key
- Kiểm tra địa chỉ contract trước khi giao dịch
- Backup thông tin quan trọng
- Sử dụng IPFS để lưu trữ kết quả

---

## 🆘 Xử lý sự cố

### Client không duyệt kết quả:
- Đợi deadline + 3 ngày
- Hệ thống tự động duyệt
- Bạn vẫn nhận được tiền

### Freelancer không nộp kết quả:
- Sau deadline, có thể cancel job
- Nhận lại tiền đã đặt cọc

### Bị từ chối nhiều lần:
- Liên lạc với client để hiểu rõ yêu cầu
- Yêu cầu gia hạn deadline nếu cần
- Làm lại theo đúng yêu cầu

### Cần thêm thời gian:
- Liên lạc với client NGAY
- Yêu cầu gia hạn deadline
- Client có thể gia hạn bất cứ lúc nào

---

## 🎓 Tips & Best Practices

### Cho Client:
1. ✅ Cập nhật thông tin liên lạc đầy đủ
2. ✅ Viết mô tả công việc chi tiết
3. ✅ Đặt deadline hợp lý (không quá gấp)
4. ✅ Phản hồi nhanh khi freelancer nộp kết quả
5. ✅ Gia hạn deadline nếu freelancer yêu cầu hợp lý

### Cho Freelancer:
1. ✅ Cập nhật thông tin liên lạc để client dễ liên hệ
2. ✅ Chỉ nhận việc phù hợp với kỹ năng
3. ✅ Liên lạc với client nếu có thắc mắc
4. ✅ Nộp kết quả TRƯỚC deadline
5. ✅ Làm việc chất lượng để tránh bị từ chối

---

## 📊 Thống kê và theo dõi

### Client Dashboard:
- Số job đang chờ (Pending)
- Số job đang làm (InProgress)
- Số job hoàn thành (Completed)
- Tổng số tiền đã chi

### Freelancer Dashboard:
- Số job đang làm
- Số job hoàn thành
- Tổng thu nhập
- Deadline sắp tới

---

## 🚀 Bắt đầu ngay

1. Kết nối ví MetaMask
2. Chọn vai trò (Client hoặc Freelancer)
3. Cập nhật thông tin liên lạc
4. Bắt đầu tạo/nhận việc!

**Chúc bạn làm việc hiệu quả! 🎉**
