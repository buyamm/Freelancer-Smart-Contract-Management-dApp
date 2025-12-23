# 🚀 Setup Nhanh - Chỉ cần 2 API Keys

## ⚡ Quick Start (5 phút)

### Bước 1: Lấy WalletConnect Project ID (2 phút)
```
1. Truy cập: https://cloud.walletconnect.com/
2. Sign up miễn phí
3. Create New Project
4. Copy Project ID
```

### Bước 2: Lấy Private Key (1 phút)
```
1. Mở MetaMask
2. Click vào account → Account details
3. Export Private Key
4. Nhập password MetaMask
5. Copy private key (bắt đầu bằng 0x...)

⚠️ QUAN TRỌNG: Chỉ dùng testnet wallet có ít ETH!
```

### Bước 3: Tạo file .env.local
```bash
# Copy từ .env.example
cp .env.example .env.local
```

Điền 2 keys vào `.env.local`:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
PRIVATE_KEY=0xyour_private_key_here
```

### Bước 4: Lấy testnet ETH
```
1. Truy cập: https://sepoliafaucet.com/
2. Nhập địa chỉ ví của bạn
3. Claim 0.5 ETH (đủ để deploy + test)
```

### Bước 5: Chạy dApp
```bash
npm install
npm run compile
npm run deploy
npm run dev
```

## 🎯 Kết quả
- ✅ Wallet connection hoạt động
- ✅ Smart contract deployed
- ✅ Tạo/nhận hợp đồng
- ✅ Upload file (mock mode nếu không có Pinata)
- ✅ Thanh toán ETH

## 🔧 Tùy chọn nâng cao

### Thêm IPFS thật (Pinata)
```
1. Truy cập: https://pinata.cloud/
2. Sign up miễn phí (1GB free)
3. API Keys → New Key
4. Copy API Key + Secret
```

Thêm vào `.env.local`:
```env
NEXT_PUBLIC_PINATA_API_KEY=your_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_secret
```

### Thêm Infura (RPC nhanh hơn)
```
1. Truy cập: https://infura.io/
2. Sign up miễn phí
3. Create New Project → Web3 API
4. Copy Project ID
```

Thêm vào `.env.local`:
```env
NEXT_PUBLIC_INFURA_KEY=your_infura_key
```

## 🐛 Troubleshooting

### Lỗi "insufficient funds"
- Cần ETH trong ví để deploy contract
- Lấy từ faucet: https://sepoliafaucet.com/

### Lỗi "invalid project id"
- Check WalletConnect Project ID
- Đảm bảo không có space thừa

### Contract không deploy được
- Check private key format (phải có 0x)
- Check network (phải là Sepolia)
- Check balance ETH

### Frontend không connect được
- Check contract address trong .env.local
- Restart dev server sau khi thay đổi .env