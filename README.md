# Freelancer Smart Contract Management dApp

Nền tảng quản lý hợp đồng freelancer an toàn và minh bạch trên blockchain với tích hợp IPFS.

## ✨ Tính năng chính

### 🔹 Web3 / Wallet Integration
- Kết nối MetaMask / WalletConnect
- Tự động nhận địa chỉ ví người dùng
- Hỗ trợ Ethereum testnet (Sepolia) và Polygon
- Xác thực vai trò theo ví (Client/Freelancer/Arbiter)

### 🔹 Quản lý hợp đồng
- Tạo hợp đồng với thanh toán ETH
- Theo dõi trạng thái hợp đồng realtime
- Xem danh sách hợp đồng theo vai trò
- Chi tiết hợp đồng với thông tin đầy đủ

### 🔹 IPFS Storage
- Upload kết quả công việc lên IPFS (Pinata)
- Smart contract chỉ lưu IPFS hash
- Client xem và tải kết quả từ IPFS
- Lưu trữ phi tập trung an toàn

### 🔹 Bảo vệ & An toàn
- Re-entrancy protection
- Kiểm tra deadline tự động
- Validation đầy đủ cho mọi thao tác
- Smart contract được audit

### 🔹 Hệ thống tranh chấp
- Client/Freelancer có thể mở tranh chấp
- Arbiter giải quyết tranh chấp
- Phân chia tiền theo phần trăm
- Phí arbiter 5%

## 🏗️ Kiến trúc

```
[Frontend - Next.js + React]
         |
         | Web3.js / Ethers.js
         |
[Smart Contract - Solidity]
         |
         | Store IPFS Hash
         |
      [IPFS - Pinata]
```

## 🚀 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd freelancer-smart-contract-dapp
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment
```bash
cp .env.example .env.local
```

Điền thông tin vào `.env.local`:
- `NEXT_PUBLIC_INFURA_KEY`: API key từ Infura
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Project ID từ WalletConnect
- `NEXT_PUBLIC_PINATA_API_KEY`: API key từ Pinata
- `NEXT_PUBLIC_PINATA_SECRET_KEY`: Secret key từ Pinata
- `PRIVATE_KEY`: Private key để deploy contract

### 4. Compile và deploy smart contract
```bash
# Compile contract
npm run compile

# Deploy to Sepolia testnet
npm run deploy
```

### 5. Cập nhật contract address
Sau khi deploy, cập nhật `NEXT_PUBLIC_CONTRACT_ADDRESS` trong `.env.local`

### 6. Chạy ứng dụng
```bash
npm run dev
```

Truy cập http://localhost:3000

## 📋 Trạng thái hợp đồng

- **Pending**: Hợp đồng mới tạo, chưa có freelancer
- **Funded**: Đã có tiền, chờ freelancer nhận
- **InProgress**: Freelancer đang thực hiện
- **Submitted**: Freelancer đã nộp kết quả
- **Completed**: Client đã duyệt và thanh toán
- **Canceled**: Hợp đồng bị hủy
- **Disputed**: Đang trong tranh chấp

## 🔧 Smart Contract Functions

### Client Functions
- `createJob()`: Tạo hợp đồng mới
- `approveWork()`: Duyệt công việc
- `cancelJob()`: Hủy hợp đồng
- `openDispute()`: Mở tranh chấp

### Freelancer Functions
- `acceptJob()`: Nhận việc
- `submitWork()`: Nộp kết quả
- `openDispute()`: Mở tranh chấp

### Arbiter Functions
- `resolveDispute()`: Giải quyết tranh chấp

## 🛡️ Bảo mật

- Sử dụng OpenZeppelin contracts
- ReentrancyGuard protection
- Proper access control
- Input validation
- Deadline checking

## 🌐 Networks hỗ trợ

- Ethereum Sepolia Testnet
- Polygon Mainnet
- Polygon Mumbai Testnet

## 📝 License

MIT License