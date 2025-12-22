'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import WalletConnection from './components/WalletConnection';
import JobList from './components/JobList';
import CreateJobForm from './components/CreateJobForm';

export default function Home() {
    const { isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<'client' | 'freelancer' | 'arbiter'>('client');

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
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                            <div className="card text-center">
                                <div className="text-2xl mb-2">⚖️</div>
                                <h3 className="font-semibold mb-2">Trọng tài</h3>
                                <p className="text-sm text-gray-600">
                                    Hệ thống trọng tài giải quyết tranh chấp công bằng
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

    return (
        <div>
            <WalletConnection />

            <div className="container mx-auto px-4 py-6">
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 max-w-md">
                    <button
                        onClick={() => setActiveTab('client')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'client'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Client
                    </button>
                    <button
                        onClick={() => setActiveTab('freelancer')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'freelancer'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Freelancer
                    </button>
                    <button
                        onClick={() => setActiveTab('arbiter')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'arbiter'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Arbiter
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <JobList userRole={activeTab} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {activeTab === 'client' && <CreateJobForm />}

                        {activeTab === 'freelancer' && (
                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4">Tìm việc mới</h3>
                                <p className="text-gray-600 mb-4">
                                    Duyệt qua các hợp đồng đang mở để tìm công việc phù hợp
                                </p>
                                <button className="btn-primary w-full">
                                    Xem việc có sẵn
                                </button>
                            </div>
                        )}

                        {activeTab === 'arbiter' && (
                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4">Vai trò Arbiter</h3>
                                <p className="text-gray-600 mb-4">
                                    Bạn được chỉ định làm trọng tài để giải quyết tranh chấp
                                </p>
                                <div className="text-sm text-gray-500">
                                    Phí trọng tài: 5% tổng giá trị hợp đồng
                                </div>
                            </div>
                        )}

                        {/* Stats Card */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Hợp đồng hoàn thành:</span>
                                    <span className="font-medium">0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng thu nhập:</span>
                                    <span className="font-medium">0 ETH</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Đánh giá:</span>
                                    <span className="font-medium">⭐ N/A</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}