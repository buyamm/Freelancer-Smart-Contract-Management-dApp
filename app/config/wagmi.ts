import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { sepolia, polygon, polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [sepolia, polygon, polygonMumbai],
    [
        infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_KEY || 'mock_infura_key' }),
        publicProvider(),
    ]
);

const { connectors } = getDefaultWallets({
    appName: 'Freelancer Smart Contract dApp',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'mock_project_id_for_development',
    chains,
});

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

export { wagmiConfig, chains };