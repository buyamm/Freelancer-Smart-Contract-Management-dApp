import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { sepolia, polygon, localhost } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';

// Thêm localhost chain cho development
const localhostChain = {
    ...localhost,
    id: 31337,
    name: 'Localhost 8545',
    network: 'localhost',
    rpcUrls: {
        default: {
            http: ['http://127.0.0.1:8545'],
        },
        public: {
            http: ['http://127.0.0.1:8545'],
        },
    },
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [localhostChain, sepolia, polygon],
    [
        // Chỉ dùng Infura nếu có API key, không thì fallback về public
        ...(process.env.NEXT_PUBLIC_INFURA_KEY
            ? [infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_KEY }) as any]
            : []
        ),
        publicProvider() as any,
    ]
);

const { connectors } = getDefaultWallets({
    appName: 'Freelancer Smart Contract dApp',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
    chains,
});

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

export { wagmiConfig, chains };