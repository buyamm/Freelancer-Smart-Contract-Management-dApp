'use client';

import { useAccount, useNetwork, useBalance } from 'wagmi';
import { formatEther } from 'viem';

export default function NetworkChecker() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const { data: balance } = useBalance({ address });

    if (!isConnected) return null;

    const isLocalNetwork = chain?.id === 31337;
    const hasEnoughBalance = balance && parseFloat(formatEther(balance.value)) > 0.1;

    return (
        <div className="mb-4 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">🔍 Network Status</h3>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Network:</span>
                    <span className={`font-medium ${isLocalNetwork ? 'text-green-600' : 'text-red-600'}`}>
                        {chain?.name || 'Unknown'} (ID: {chain?.id})
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Address:</span>
                    <span className="font-mono text-xs">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Balance:</span>
                    <span className={`font-medium ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                        {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ETH` : 'Loading...'}
                    </span>
                </div>
            </div>

            {!isLocalNetwork && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="text-red-800 text-sm">
                        <strong>⚠️ Wrong Network!</strong>
                        <p className="mt-1">Please switch to <strong>Localhost 8545</strong> network in the wallet connection dropdown.</p>
                        <p className="mt-2">If you don't see "Localhost 8545" option:</p>
                        <ul className="mt-1 ml-4 list-disc text-xs">
                            <li>Make sure Hardhat node is running: <code>npx hardhat node</code></li>
                            <li>Refresh the page</li>
                            <li>Try reconnecting your wallet</li>
                        </ul>
                    </div>
                </div>
            )}

            {isLocalNetwork && !hasEnoughBalance && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-yellow-800 text-sm">
                        <strong>💰 Insufficient Balance!</strong>
                        <p className="mt-1">Import a Hardhat test account:</p>
                        <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs break-all">
                            0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
                        </div>
                        <p className="mt-1 text-xs">This account has 10,000 ETH for testing</p>
                    </div>
                </div>
            )}

            {isLocalNetwork && hasEnoughBalance && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="text-green-800 text-sm">
                        <strong>✅ Ready to go!</strong>
                        <p>Network and balance are correct for testing.</p>
                    </div>
                </div>
            )}
        </div>
    );
}