'use client';

import { useState, useCallback } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_STATES } from '../config/contract';
import { formatEther } from 'viem';
import JobDetailModal from './JobDetailModal';

interface Job {
    id: bigint;
    client: string;
    freelancer: string;
    arbiter: string;
    title: string;
    description: string;
    payment: bigint;
    deadline: bigint;
    state: number;
    ipfsHash: string;
    createdAt: bigint;
    submittedAt: bigint;
}

export default function FreelancerDashboard() {
    const { address } = useAccount();
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [activeTab, setActiveTab] = useState<'available' | 'myJobs'>('available');
    const [refreshKey, setRefreshKey] = useState(0);

    const { data: myJobIds, refetch: refetchMyJobs } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getFreelancerJobs',
        args: [address as `0x${string}`],
        enabled: !!address,
    });

    const { data: jobCounter, refetch: refetchJobCounter } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'jobCounter',
    });

    // Handle success - refresh data and switch tab
    const handleSuccess = useCallback(() => {
        // Refresh all data
        refetchMyJobs();
        refetchJobCounter();
        setRefreshKey(prev => prev + 1);

        // Switch to "My Jobs" tab
        setActiveTab('myJobs');
        setSelectedJob(null);
    }, [refetchMyJobs, refetchJobCounter]);

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

    // Tạo array các job IDs để fetch available jobs
    const allJobIds = jobCounter ? Array.from({ length: Number(jobCounter) }, (_, i) => BigInt(i + 1)) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">👨‍💻 Dashboard Freelancer</h2>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard title="Việc có sẵn" value={Number(jobCounter) || 0} icon="🔍" color="blue" />
                <StatCard title="Đang làm" value={myJobIds ? (myJobIds as bigint[]).length : 0} icon="⚡" color="purple" />
                <StatCard title="Hoàn thành" value={0} icon="✅" color="green" />
                <StatCard title="Thu nhập" value="0 ETH" icon="💰" color="yellow" isText />
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
                <button
                    onClick={() => setActiveTab('available')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'available'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    🔍 Việc đang tuyển
                </button>
                <button
                    onClick={() => setActiveTab('myJobs')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'myJobs'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    💼 Việc của tôi ({myJobIds ? (myJobIds as bigint[]).length : 0})
                </button>
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {activeTab === 'available' ? (
                        <AvailableJobsList
                            jobIds={allJobIds}
                            currentAddress={address || ''}
                            onViewDetail={setSelectedJob}
                            getStateColor={getStateColor}
                        />
                    ) : (
                        <MyJobsList
                            jobIds={(myJobIds as bigint[]) || []}
                            onViewDetail={setSelectedJob}
                            getStateColor={getStateColor}
                        />
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="card bg-green-50 border-green-200">
                        <h3 className="text-lg font-semibold mb-4 text-green-900">💡 Hướng dẫn Freelancer</h3>
                        <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                            <li>Duyệt việc đang tuyển phù hợp</li>
                            <li>Click "Nhận việc" để bắt đầu</li>
                            <li>Hoàn thành công việc đúng deadline</li>
                            <li>Upload kết quả lên IPFS</li>
                            <li>Nộp IPFS hash để nhận thanh toán</li>
                        </ol>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">📊 Thống kê</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tỷ lệ hoàn thành:</span>
                                <span className="font-medium">N/A</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Đánh giá:</span>
                                <span className="font-medium">⭐ N/A</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tổng thu nhập:</span>
                                <span className="font-medium text-green-600">0 ETH</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    userRole="freelancer"
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}

function StatCard({ title, value, icon, color, isText = false }: {
    title: string;
    value: number | string;
    icon: string;
    color: string;
    isText?: boolean;
}) {
    const bgColors: Record<string, string> = {
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        purple: 'bg-purple-50',
        yellow: 'bg-yellow-50',
    };

    return (
        <div className={`${bgColors[color]} p-4 rounded-lg`}>
            <div className="flex items-center justify-between">
                <span className="text-2xl">{icon}</span>
                <span className={`${isText ? 'text-lg' : 'text-2xl'} font-bold`}>{value}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">{title}</div>
        </div>
    );
}

function AvailableJobsList({
    jobIds,
    currentAddress,
    onViewDetail,
    getStateColor,
}: {
    jobIds: bigint[];
    currentAddress: string;
    onViewDetail: (job: Job) => void;
    getStateColor: (state: number) => string;
}) {
    if (jobIds.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-600">Chưa có việc nào được đăng</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">🔍 Việc đang tuyển</h3>
                <span className="text-xs text-gray-500">
                    Đang kiểm tra {jobIds.length} việc...
                </span>
            </div>
            <div className="grid gap-4">
                {jobIds.map((jobId) => (
                    <AvailableJobCard
                        key={jobId.toString()}
                        jobId={jobId}
                        currentAddress={currentAddress}
                        onViewDetail={onViewDetail}
                    />
                ))}
            </div>

            {/* Debug info */}
            <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded">
                💡 Lưu ý: Việc do chính bạn tạo (khi là Client) sẽ không hiển thị ở đây.
                <br />
                Địa chỉ của bạn: {currentAddress?.slice(0, 10)}...
            </div>
        </div>
    );
}

function AvailableJobCard({
    jobId,
    currentAddress,
    onViewDetail,
}: {
    jobId: bigint;
    currentAddress: string;
    onViewDetail: (job: Job) => void;
}) {
    const { data: job, isLoading } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getJob',
        args: [jobId],
    }) as { data: Job | undefined; isLoading: boolean };

    // Loading state
    if (isLoading) {
        return <div className="card animate-pulse h-24 bg-gray-100"></div>;
    }

    // Không có data
    if (!job) {
        return null;
    }

    // Job không ở trạng thái Funded (state = 1)
    if (job.state !== 1) {
        return null;
    }

    // Job của chính mình - hiển thị thông báo thay vì ẩn hoàn toàn
    const isOwnJob = job.client.toLowerCase() === currentAddress.toLowerCase();

    if (isOwnJob) {
        return (
            <div className="card bg-gray-50 border-dashed border-2 border-gray-300 opacity-60">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-500">{job.title}</h3>
                        <p className="text-sm text-gray-400">Việc này do bạn tạo (khi là Client)</p>
                    </div>
                    <span className="text-lg font-bold text-gray-400">{formatEther(job.payment)} ETH</span>
                </div>
            </div>
        );
    }

    const formatDeadline = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Đã hết hạn', color: 'text-red-600' };
        if (diffDays === 0) return { text: 'Hôm nay', color: 'text-orange-600' };
        if (diffDays === 1) return { text: 'Ngày mai', color: 'text-yellow-600' };
        if (diffDays <= 7) return { text: `${diffDays} ngày`, color: 'text-blue-600' };
        return { text: `${diffDays} ngày`, color: 'text-green-600' };
    };

    const deadline = formatDeadline(job.deadline);

    return (
        <div className="card hover:shadow-lg transition-all border-l-4 border-l-green-500">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">
                        Client: {job.client.slice(0, 6)}...{job.client.slice(-4)}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{formatEther(job.payment)} ETH</div>
                    <div className={`text-sm ${deadline.color}`}>⏰ {deadline.text}</div>
                </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

            <button onClick={() => onViewDetail(job)} className="btn-primary w-full">
                Xem chi tiết & Nhận việc →
            </button>
        </div>
    );
}

function MyJobsList({
    jobIds,
    onViewDetail,
    getStateColor,
}: {
    jobIds: bigint[];
    onViewDetail: (job: Job) => void;
    getStateColor: (state: number) => string;
}) {
    if (jobIds.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">💼</div>
                <p className="text-gray-600">Bạn chưa nhận việc nào</p>
                <p className="text-sm text-gray-500 mt-2">Xem việc đang tuyển để bắt đầu</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">💼 Việc của tôi</h3>
            <div className="grid gap-4">
                {jobIds.map((jobId) => (
                    <MyJobCard
                        key={jobId.toString()}
                        jobId={jobId}
                        onViewDetail={onViewDetail}
                        getStateColor={getStateColor}
                    />
                ))}
            </div>
        </div>
    );
}

function MyJobCard({
    jobId,
    onViewDetail,
    getStateColor,
}: {
    jobId: bigint;
    onViewDetail: (job: Job) => void;
    getStateColor: (state: number) => string;
}) {
    const { data: job } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getJob',
        args: [jobId],
    }) as { data: Job | undefined };

    if (!job) return <div className="card animate-pulse h-32 bg-gray-200"></div>;

    const needsAction = job.state === 2; // InProgress - cần nộp kết quả

    return (
        <div className={`card hover:shadow-lg transition-shadow ${needsAction ? 'border-l-4 border-l-purple-500' : ''}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    {needsAction && (
                        <span className="text-xs text-purple-600 font-medium">⚡ Cần nộp kết quả</span>
                    )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(job.state)}`}>
                    {CONTRACT_STATES[job.state as keyof typeof CONTRACT_STATES]}
                </span>
            </div>

            <div className="flex justify-between items-center text-sm mb-4">
                <div>
                    <span className="text-gray-500">Thanh toán:</span>
                    <span className="ml-2 font-medium text-green-600">{formatEther(job.payment)} ETH</span>
                </div>
            </div>

            <button onClick={() => onViewDetail(job)} className="btn-primary text-sm w-full">
                {needsAction ? '📤 Nộp kết quả' : 'Xem chi tiết'}
            </button>
        </div>
    );
}