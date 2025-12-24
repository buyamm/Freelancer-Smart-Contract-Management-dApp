# Freelancer Smart Contract dApp - Version 2.0

Hệ thống freelancer phi tập trung với **3 tính năng mới**: Ứng tuyển, Lịch sử nộp bài, và Đánh giá.

## 🆕 Tính năng mới (v2.0)

### 1. **Hệ thống ứng tuyển**
- Freelancer ứng tuyển với proposal thay vì nhận trực tiếp
- Client xem danh sách ứng viên và chọn người phù hợp
- Hiển thị rating của freelancer trong danh sách

### 2. **Lịch sử nộp bài** 
- Freelancer nộp nhiều lần, mỗi lần lưu vào IPFS
- Client xem được toàn bộ lịch sử sửa đổi
- Mỗi lần nộp có thể kèm ghi chú

### 3. **Đánh giá freelancer**
- Client đánh giá 1-5 sao sau khi hoàn thành
- Tính điểm trung bình cho freelancer
- Rating hiển thị trong profile và khi ứng tuyển

## 🚀 Cài đặt

```bash
# Clone repository
git clone <repo-url>
cd freelancer-contract

# Cài đặt dependencies
npm install

# Cấu hình environment
cp .env.example .env.local
# Cập nhật các biến môi trường

# Compile smart contract
npx hardhat compile

# Deploy contract (localhost)
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Cập nhật CONTRACT_ADDRESS trong .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=<địa_chỉ_contract>

# Chạy frontend
npm run dev
```

## 📋 Quy trình sử dụng

### Cho Client:
1. **Tạo job** với mô tả chi tiết và đặt cọc ETH
2. **Xem ứng viên** - Freelancer sẽ ứng tuyển với proposal
3. **Chọn freelancer** phù hợp từ danh sách (có rating)
4. **Theo dõi tiến độ** - Xem lịch sử nộp bài của freelancer
5. **Duyệt kết quả** và **đánh giá freelancer** 1-5 sao

### Cho Freelancer:
1. **Cập nhật profile** với thông tin liên lạc
2. **Ứng tuyển job** với proposal thuyết phục
3. **Chờ được chọn** bởi client
4. **Làm việc và nộp kết quả** (có thể nộp nhiều lần)
5. **Nhận thanh toán** và **rating** từ client

## 🎯 Smart Contract

### Các hàm chính:

```solidity
// Ứng tuyển
function applyForJob(uint256 _jobId, string memory _proposal)
function selectFreelancer(uint256 _jobId, address _freelancer)

// Nộp bài
function submitWork(uint256 _jobId, string memory _ipfsHash, string memory _comment)
function getJobSubmissions(uint256 _jobId) returns (Submission[] memory)

// Đánh giá  
function rateFreelancer(uint256 _jobId, uint8 _score, string memory _comment)
function getFreelancerAverageRating(address _freelancer) returns (uint256, uint256)
```

### Cấu trúc dữ liệu:

```solidity
struct Application {
    address freelancer;
    string proposal;
    uint256 appliedAt;
    bool isSelected;
}

struct Submission {
    string ipfsHash;
    uint256 submittedAt;
    string comment;
}

struct Rating {
    uint8 score;        // 1-5 sao
    string comment;
    uint256 ratedAt;
}
```

## 🔧 Cấu hình

- **AUTO_APPROVE_DAYS**: 3 ngày (tự động duyệt)
- **PENALTY_RATE**: 10% (phạt nộp muộn)
- **Network**: Localhost, Sepolia, Mainnet
- **IPFS**: Pinata gateway

## 📱 Components

- **ApplicationsList**: Danh sách ứng viên cho client
- **SubmissionHistory**: Lịch sử nộp bài
- **RatingForm**: Form đánh giá freelancer
- **FreelancerRatingBadge**: Badge hiển thị rating

## 🧪 Testing

```bash
# Test contract
npx hardhat test

# Test frontend
npm run build
npm run dev

# Xem hướng dẫn test chi tiết
cat QUICK_TEST_V2.md
```

## 📚 Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Chi tiết các thay đổi
- [QUICK_TEST_V2.md](./QUICK_TEST_V2.md) - Hướng dẫn test
- [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md) - Hướng dẫn sử dụng

## 🔗 Links

- **Frontend**: http://localhost:3000
- **Hardhat Network**: http://localhost:8545
- **IPFS Gateway**: https://gateway.pinata.cloud/ipfs/

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License - xem [LICENSE](./LICENSE) để biết thêm chi tiết.