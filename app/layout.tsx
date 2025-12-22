'use client';

import './globals.css';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, chains } from './config/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body>
                <WagmiConfig config={wagmiConfig}>
                    <QueryClientProvider client={queryClient}>
                        <RainbowKitProvider chains={chains}>
                            <div className="min-h-screen bg-gray-50">
                                {children}
                            </div>
                        </RainbowKitProvider>
                    </QueryClientProvider>
                </WagmiConfig>
            </body>
        </html>
    );
}