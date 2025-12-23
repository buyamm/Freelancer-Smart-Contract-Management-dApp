# Changelog - Cập nhật hệ thống Freelancer dApp

## Ngày cập nhật: 23/12/2024

### 🎯 Thay đổi chính

#### 1. **Loại bỏ chức năng Trọng tài (Arbiter)**
- Xóa vai trò arbiter khỏi hệ thống
- Không còn phí trọng tài 5%
- Đơn giản hóa quy trình giải quyết tranh chấp

#### 2. **Thêm thông tin liên lạc**
- Client và Freelancer có thể cập nhật thông tin liên lạc:
  - Tên
  - Email
  - Số điện thoại
  - Link chat (Telegram, Discord, etc.)
- Thông tin được lưu trên blockchain
- Có thể xem thông tin liên lạc của đối tác trong job

#### 3. **Quy trình duyệt kết quả mới**

##### **Khi Freelancer nộp kết quả:**
- ✅ **Nộp đúng hạn**: Nhận đủ 100% tiền
- ⚠️ **Nộp muộn**: Bị phạt 10% (penalty)
- ❌ **Không nộp**: Có thể bị client xóa khỏi job

##### **Client có 3 lựa chọn:**

**A. Duyệt ngay (Approve)**
- Freelancer nhận tiền ngay lập tức
- Nếu có penalty, client nhận lại phần penalty

**B. Từ chối (Reject) - Chỉ được phép TRƯỚC deadline**
- Freelancer phải nộp lại kết quả mới
- Client có thể:
  - Gia hạn deadline nếu muốn
  - Hoặc xóa freelancer và tìm người khác

**C. Không làm gì**
- Sau deadline + 3 ngày → **Tự động duyệt**
- Freelancer vẫn nhận được tiền (trừ penalty nếu có)

#### 4. **Chức năng mới cho Client**

##### **Gia hạn deadline (Extend Deadline)**
```solidity
function extendDeadline(uint256 _jobId, uint256 _newDeadline)
```
- Client có thể gia hạn deadline bất cứ lúc nào
- Khi gia hạn, penalty sẽ được reset về 0
- Freelancer có thể yêu cầu client gia hạn qua kênh liên lạc

##### **Xóa Freelancer (Remove Freelancer)**
```solidity
function removeFreelancer(uint256 _jobId)
```
- Client có thể xóa freelancer khỏi job
- Job quay về trạng thái "Funded" (chờ freelancer mới)
- Có thể điều chỉnh deadline mới
- Tiền vẫn được giữ trong contract

##### **Từ chối kết quả (Reject Work)**
```solidity
function rejectWork(uint256 _jobId, string memory _reason)
```
- Chỉ được phép từ chối TRƯỚC deadline
- Freelancer có thể nộp lại kết quả mới
- Penalty được reset về 0

#### 5. **Tự động duyệt (Auto Approve)**
```solidity
function autoApproveWork(uint256 _jobId)
```
- Sau deadline + 3 ngày, bất kỳ ai cũng có thể gọi hàm này
- Freelancer tự động nhận tiền (trừ penalty nếu có)
- Bảo vệ freelancer khỏi client không phản hồi

### 📊 Các trạng thái Job mới

```
0: Pending    - Chưa có ai tạo (không dùng)
1: Funded     - Đã đặt cọc, chờ freelancer
2: InProgress - Freelancer đang làm
3: Submitted  - Đã nộp kết quả, chờ duyệt
4: Completed  - Hoàn thành, đã thanh toán
5: Canceled   - Đã hủy
```

### 🔧 Cấu trúc Contract mới

```solidity
struct ContactInfo {
    string name;
    string email;
    string phone;
    string chatLink;
}

struct Job {
    uint256 id;
    address client;
    address freelancer;
    string title;
    string description;
    uint256 payment;
    uint256 deadline;
    ContractState state;
    string ipfsHash;
    uint256 createdAt;
    uint256 submittedAt;
    uint256 rejectionCount;  // Đếm số lần bị reject
    uint256 penaltyAmount;   // Số tiền phạt
}
```

### 🎨 Cập nhật Frontend

#### **RoleSelector**
- Chỉ còn 2 vai trò: Client và Freelancer
- Layout 2 cột thay vì 3 cột

#### **CreateJobForm**
- Loại bỏ trường chọn arbiter
- Thêm form thông tin liên lạc (tùy chọn)
- Tự động cập nhật contact info khi tạo job

#### **ClientDashboard**
- Hiển thị các job với trạng thái mới
- Nút "Duyệt kết quả" cho job đã submit
- Thống kê không còn arbiter

#### **JobDetailModal** (Cần cập nhật)
- Thêm nút "Reject Work" cho client
- Thêm nút "Extend Deadline" cho client
- Thêm nút "Remove Freelancer" cho client
- Hiển thị thông tin liên lạc của đối tác
- Hiển thị penalty amount nếu có
- Hiển thị countdown tự động duyệt

### 📝 Hướng dẫn sử dụng

#### **Cho Client:**
1. Tạo job và điền thông tin liên lạc (tùy chọn)
2. Chờ freelancer nhận việc
3. Khi freelancer nộp kết quả:
   - **Hài lòng**: Duyệt ngay
   - **Chưa hài lòng** (còn thời gian): Reject và yêu cầu làm lại
   - **Muốn gia hạn**: Extend deadline
   - **Muốn đổi người**: Remove freelancer
4. Nếu không làm gì, sau 3 ngày sẽ tự động duyệt

#### **Cho Freelancer:**
1. Cập nhật thông tin liên lạc
2. Nhận job phù hợp
3. Nộp kết quả ĐÚNG HẠN để tránh bị phạt 10%
4. Nếu bị reject, nộp lại kết quả mới
5. Nếu cần thêm thời gian, liên lạc với client để xin gia hạn

### 🚀 Contract đã deploy

```
Contract Address: 0x0165878A594ca255338adfa4d48449f69242Eb8F
Network: Localhost (Hardhat)
```

### ⚙️ Cấu hình

```javascript
AUTO_APPROVE_DAYS = 3    // Tự động duyệt sau 3 ngày
PENALTY_RATE = 10        // Phạt 10% khi nộp muộn
```

### 🔄 Migration từ phiên bản cũ

1. Deploy contract mới
2. Cập nhật CONTRACT_ADDRESS trong `.env.local`
3. Chạy `npm run dev` để test
4. Các job cũ sẽ không tương thích, cần tạo mới

### 📚 Các file đã thay đổi

- ✅ `contracts/FreelancerContract.sol` - Contract mới
- ✅ `app/config/contract.ts` - ABI mới
- ✅ `app/components/RoleSelector.tsx` - Loại bỏ arbiter
- ✅ `app/components/CreateJobForm.tsx` - Thêm contact info
- ✅ `app/page.tsx` - Loại bỏ arbiter dashboard
- ⏳ `app/components/JobDetailModal.tsx` - Cần cập nhật thêm
- ⏳ `app/components/FreelancerDashboard.tsx` - Cần cập nhật thêm
- ⏳ `app/components/ClientDashboard.tsx` - Cần cập nhật thêm

### 🐛 Known Issues

- JobDetailModal cần được cập nhật để hỗ trợ đầy đủ các chức năng mới
- Cần thêm UI để hiển thị contact info
- Cần thêm countdown timer cho auto-approve
- Cần thêm notification khi bị penalty

### 📞 Liên hệ

Nếu có vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua các kênh hỗ trợ.
