# Hướng dẫn test nhanh - Fix lỗi "insufficient funds"

## 🚨 Lỗi thường gặp: "insufficient funds for gas"
**Nguyên nhân**: MetaMask chưa kết nối đúng Hardhat network hoặc tài khoản không có ETH

## ✅ Giải pháp từng bước:

### 1. Setup một lần (nếu chưa làm)
```bash
npm run setup  # Compile contract + generate ABI
```

### 2. Chạy Hardhat node
```bash
npx hardhat node
```

### 3. Xem danh sách tài khoản test
```bash
npm run accounts
```

### 4. Chạy frontend (terminal mới)
```bash
npm run dev
```

### 5. Deploy contract (terminal mới)
```bash
npm run deploy:local
```

### 6. Kết nối với dApp
1. **Mở http://localhost:3000**
2. **Click "Connect Wallet"** 
3. **Chọn MetaMask**
4. **Chọn network "Localhost 8545"** (sẽ xuất hiện trong dropdown)
5. **Nếu chưa có tài khoản, import tài khoản test:**

**Import tài khoản test vào MetaMask:**
- Mở MetaMask → Account menu → Import Account
- Paste private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Account này có 10,000 ETH để test

### 7. Test tạo hợp đồng
- **Kiểm tra Network Checker** (hiện trong form - phải là màu xanh)
- Tiêu đề: "Test Job"
- Mô tả: "Test description"  
- Payment: 0.1 ETH
- Deadline: Chọn thời gian tương lai
- Arbiter: Click "Dùng mẫu"

## 🔍 Debug
- **Network Checker** sẽ hiển thị:
  - ✅ Network: Localhost 8545 (ID: 31337) - màu xanh
  - ✅ Balance: > 0.1 ETH - màu xanh
- **Debug info** ở cuối form (development mode)

## ⚠️ Lưu ý quan trọng
- **Localhost network chỉ xuất hiện khi Hardhat node đang chạy**
- **Phải chạy `npm run dev` để thấy localhost trong RainbowKit**
- Mỗi lần restart Hardhat node, cần deploy lại contract
- Đảm bảo cả 3 terminal đang chạy: Hardhat node + Frontend + Deploy