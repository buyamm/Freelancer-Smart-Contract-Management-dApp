'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletConnection from './components/WalletConnection';
import RoleSelector, { UserRole, getRoleFromStorage } from './components/RoleSelector';
import ClientDashboard from './components/ClientDashboard';
import FreelancerDashboard from './components/FreelancerDashboard';

export default function Home() {
    const { isConnected, address } = useAccount();
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [mounted, setMounted] = useState(false);

    // Load role từ localStorage khi component mount
    useEffect(() => {
        setMounted(true);
        if (address) {
            const savedRole = getRoleFromStorage(address);
            setUserRole(savedRole);
        }
    }, [address]);

    // Reset role khi disconnect
    useEffect(() => {
        if (!isConnected) {
            setUserRole(null);
        }
    }, [isConnected]);

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div>
                <WalletConnection />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Freelancer Smart Contract dApp
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Nền tảng quản lý hợp đồng freelancer an toàn và minh bạch trên blockchain
                        </p>
                        <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                            <div className="card text-center">
                                <div className="text-2xl mb-2">🔒</div>
                                <h3 className="font-semibold mb-2">An toàn</h3>
                                <p className="text-sm text-gray-600">
                                    Smart contract bảo vệ tiền của bạn cho đến khi công việc hoàn thành
                                </p>
                            </div>
                            <div className="card text-center">
                                <div className="text-2xl mb-2">📁</div>
                                <h3 className="font-semibold mb-2">IPFS Storage</h3>
                                <p className="text-sm text-gray-600">
                                    Lưu trữ kết quả công việc phi tập trung trên IPFS
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-600">
                            Kết nối ví để bắt đầu sử dụng dApp
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Nếu chưa chọn role, hiển thị RoleSelector
    if (!userRole) {
        return (
            <div>
                <WalletConnection />
                <div className="container mx-auto px-4 py-8">
                    <RoleSelector onRoleSelect={setUserRole} currentRole={userRole} />
                </div>
            </div>
        );
    }

    // Hiển thị Dashboard theo role
    return (
        <div>
            <WalletConnection />

            {/* Role Badge */}
            <div className="bg-gray-100 border-b">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Vai trò:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${userRole === 'client' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                            }`}>
                            {userRole === 'client' && '💼 Client'}
                            {userRole === 'freelancer' && '👨‍💻 Freelancer'}
                        </span>
                    </div>
                    <button
                        onClick={() => setUserRole(null)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Đổi vai trò
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {userRole === 'client' && <ClientDashboard />}
                {userRole === 'freelancer' && <FreelancerDashboard />}
            </div>
        </div>
    );
}