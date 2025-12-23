'use client';

import { useState } from 'react';
import MockWalletConnection from './components/MockWalletConnection';
import { mockService, CONTRACT_STATES } from './utils/mockData';
import { formatEther } from 'viem';

export default function MockHome() {
    const [currentAddress, setCurrentAddress] = useState('');
    const [activeTab, setActiveTab] = useState<'client' | 'freelancer' | 'arbiter'>('client');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedJob, setSelectedJob] = useState<bigint | null>(null);

    const isConnected = currentAddress !== '';

    const handleConnect = (address: string) => {
        setCurrentAddress(address);
        if (address) {
            mockService.setCurrentUser(address);
        }
    };

    if (!isConnected) {
        return (
            <div>
                <MockWalletConnection
                    onConnect={handleConnect}
                    isConnected={isConnected}
                    currentAddress={currentAddress}
                />
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
                            Kết nối ví để bắt đầu sử dụng dApp (Mock Mode)
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const jobs = mockService.getJobsByRole(activeTab);
    const stats = mockService.getUserStats(activeTab);

    return (
        <div>
            <MockWalletConnection
                onConnect={handleConnect}
                isConnected={isConnected}
                currentAddress={currentAddress}
            />

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
                        <JobList
                            jobs={jobs}
                            userRole={activeTab}
                            onSelectJob={setSelectedJob}
                            currentAddress={currentAddress}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {activeTab === 'client' && !showCreateForm && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="btn-primary w-full"
                            >
                                + Tạo hợp đồng mới
                            </button>
                        )}

                        {activeTab === 'client' && showCreateForm && (
                            <CreateJobForm onClose={() => setShowCreateForm(false)} />
                        )}

                        {activeTab === 'freelancer' && (
                            <AvailableJobsCard />
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
                                    <span className="font-medium">{stats.completedJobs}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng {activeTab === 'client' ? 'chi phí' : 'thu nhập'}:</span>
                                    <span className="font-medium">{formatEther(stats.totalEarnings)} ETH</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Đánh giá:</span>
                                    <span className="font-medium">
                                        {stats.rating > 0 ? `⭐ ${stats.rating}/5` : '⭐ N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Job List Component
function JobList({ jobs, userRole, onSelectJob, currentAddress }: any) {
    if (jobs.length === 0) {
        return (
            <div className="text-center py-8 card">
                <p className="text-gray-600">
                    {userRole === 'client' && 'Bạn chưa tạo hợp đồng nào'}
                    {userRole === 'freelancer' && 'Bạn chưa nhận hợp đồng nào'}
                    {userRole === 'arbiter' && 'Chưa có hợp đồng tranh chấp nào'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">
                {userRole === 'client' && 'Hợp đồng đã tạo'}
                {userRole === 'freelancer' && 'Hợp đồng đang thực hiện'}
                {userRole === 'arbiter' && 'Hợp đồng tranh chấp'}
            </h2>

            <div className="grid gap-4">
                {jobs.map((job: any) => (
                    <JobCard key={job.id.toString()} job={job} userRole={userRole} />
                ))}
            </div>
        </div>
    );
}

// Job Card Component
function JobCard({ job, userRole }: any) {
    const getStateColor = (state: number) => {
        const colors: Record<number, string> = {
            0: 'bg-yellow-100 text-yellow-800',
            1: 'bg-blue-100 text-blue-800',
            2: 'bg-purple-100 text-purple-800',
            3: 'bg-orange-100 text-orange-800',
            4: 'bg-green-100 text-green-800',
            5: 'bg-red-100 text-red-800',
            6: 'bg-red-100 text-red-800',
        };
        return colors[state] || 'bg-gray-100 text-gray-800';
    };

    const formatDeadline = (timestamp: bigint) => {
        return new Date(Number(timestamp) * 1000).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleAction = (action: string) => {
        switch (action) {
            case 'approve':
                if (mockService.approveWork(job.id)) {
                    alert('✅ Đã duyệt công việc thành công!');
                    window.location.reload();
                }
                break;
            case 'submit':
                const ipfsHash = prompt('Nhập IPFS hash của kết quả công việc:');
                if (ipfsHash && mockService.submitWork(job.id, ipfsHash)) {
                    alert('✅ Đã nộp kết quả thành công!');
                    window.location.reload();
                }
                break;
            case 'cancel':
                if (confirm('Bạn có chắc muốn hủy hợp đồng này?')) {
                    if (mockService.cancelJob(job.id)) {
                        alert('✅ Đã hủy hợp đồng thành công!');
                        window.location.reload();
                    }
                }
                break;
            case 'dispute':
                if (confirm('Bạn có chắc muốn mở tranh chấp?')) {
                    if (mockService.openDispute(job.id)) {
                        alert('⚠️ Đã mở tranh chấp. Trọng tài sẽ xem xét.');
                        window.location.reload();
                    }
                }
                break;
        }
    };

    return (
        <div className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(job.state)}`}>
                    {CONTRACT_STATES[job.state as keyof typeof CONTRACT_STATES]}
                </span>
            </div>

            <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                    <span className="text-gray-500">Thanh toán:</span>
                    <span className="ml-2 font-medium">{formatEther(job.payment)} ETH</span>
                </div>
                <div>
                    <span className="text-gray-500">Deadline:</span>
                    <span className="ml-2">{formatDeadline(job.deadline)}</span>
                </div>
                {job.freelancer !== '0x0000000000000000000000000000000000000000' && (
                    <div className="col-span-2">
                        <span className="text-gray-500">Freelancer:</span>
                        <span className="ml-2 font-mono text-xs">
                            {`${job.freelancer.slice(0, 6)}...${job.freelancer.slice(-4)}`}
                        </span>
                    </div>
                )}
                {job.ipfsHash && (
                    <div className="col-span-2">
                        <span className="text-gray-500">IPFS:</span>
                        <a
                            href={`https://ipfs.io/ipfs/${job.ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:underline text-xs font-mono"
                        >
                            {job.ipfsHash.slice(0, 20)}...
                        </a>
                    </div>
                )}
            </div>

            <div className="flex space-x-2">
                {userRole === 'client' && job.state === 3 && (
                    <>
                        <button
                            onClick={() => handleAction('approve')}
                            className="btn-primary text-sm flex-1"
                        >
                            ✓ Duyệt công việc
                        </button>
                        <button
                            onClick={() => handleAction('dispute')}
                            className="btn-secondary text-sm"
                        >
                            Tranh chấp
                        </button>
                    </>
                )}
                {userRole === 'freelancer' && job.state === 2 && (
                    <button
                        onClick={() => handleAction('submit')}
                        className="btn-primary text-sm flex-1"
                    >
                        📤 Nộp kết quả
                    </button>
                )}
                {userRole === 'client' && (job.state === 1 || job.state === 2) && (
                    <button
                        onClick={() => handleAction('cancel')}
                        className="btn-secondary text-sm"
                    >
                        Hủy hợp đồng
                    </button>
                )}
            </div>
        </div>
    );
}

// Create Job Form Component
function CreateJobForm({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        payment: '',
        deadline: '',
        arbiter: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            mockService.createJob(formData);
            alert('✅ Hợp đồng đã được tạo thành công!');
            onClose();
            window.location.reload();
        } catch (error) {
            alert('❌ Có lỗi xảy ra khi tạo hợp đồng');
        }
    };

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Tạo hợp đồng mới</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu đề công việc *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="input"
                        placeholder="Ví dụ: Phát triển website React"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả công việc *
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="input"
                        placeholder="Mô tả chi tiết về công việc cần thực hiện..."
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thanh toán (ETH) *
                        </label>
                        <input
                            type="number"
                            value={formData.payment}
                            onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                            step="0.001"
                            min="0"
                            className="input"
                            placeholder="0.1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deadline *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="input"
                            min={new Date().toISOString().slice(0, 16)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ Arbiter *
                    </label>
                    <input
                        type="text"
                        value={formData.arbiter}
                        onChange={(e) => setFormData({ ...formData, arbiter: e.target.value })}
                        className="input"
                        placeholder="0x..."
                        pattern="^0x[a-fA-F0-9]{40}$"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Địa chỉ ví của người trọng tài để giải quyết tranh chấp
                    </p>
                </div>

                <div className="flex space-x-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                        Tạo hợp đồng
                    </button>
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}

// Available Jobs Card for Freelancers
function AvailableJobsCard() {
    const [showJobs, setShowJobs] = useState(false);
    const availableJobs = mockService.getAvailableJobs();

    const handleAcceptJob = (jobId: bigint) => {
        if (confirm('Bạn có chắc muốn nhận công việc này?')) {
            if (mockService.acceptJob(jobId)) {
                alert('✅ Đã nhận công việc thành công!');
                window.location.reload();
            }
        }
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Tìm việc mới</h3>
            <p className="text-gray-600 mb-4">
                Có {availableJobs.length} công việc đang chờ freelancer
            </p>
            <button
                onClick={() => setShowJobs(!showJobs)}
                className="btn-primary w-full"
            >
                {showJobs ? 'Ẩn danh sách' : 'Xem việc có sẵn'}
            </button>

            {showJobs && (
                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                    {availableJobs.map((job) => (
                        <div key={job.id.toString()} className="border rounded-lg p-3">
                            <h4 className="font-medium text-sm mb-1">{job.title}</h4>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{job.description}</p>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-primary-600">
                                    {formatEther(job.payment)} ETH
                                </span>
                                <button
                                    onClick={() => handleAcceptJob(job.id)}
                                    className="bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
                                >
                                    Nhận việc
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}