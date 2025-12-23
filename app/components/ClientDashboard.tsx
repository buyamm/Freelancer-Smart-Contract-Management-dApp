'use client';

import { useState, useCallback } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_STATES } from '../config/contract';
import { formatEther } from 'viem';
import CreateJobForm from './CreateJobForm';
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

export default function ClientDashboard() {
    const { address } = useAccount();
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const { data: jobIds, refetch: refetchJobs } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getClientJobs',
        args: [address as `0x${string}`],
        enabled: !!address,
    });

    // Handle success - refresh data
    const handleSuccess = useCallback(() => {
        refetchJobs();
        setRefreshKey(prev => prev + 1);
        setSelectedJob(null);
    }, [refetchJobs]);

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

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">💼 Dashboard Client</h2>
                    <span className="text-sm text-gray-500">
                        {jobIds ? `${(jobIds as bigint[]).length} hợp đồng` : '0 hợp đồng'}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        title="Đang chờ"
                        value={jobIds ? (jobIds as bigint[]).length : 0}
                        icon="⏳"
                        color="blue"
                    />
                    <StatCard title="Hoàn thành" value={0} icon="✅" color="green" />
                    <StatCard title="Tranh chấp" value={0} icon="⚠️" color="red" />
                </div>

                {/* Job List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">📋 Hợp đồng của bạn</h3>

                    {!jobIds || (jobIds as bigint[]).length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="text-gray-600">Bạn chưa tạo hợp đồng nào</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Tạo hợp đồng mới để bắt đầu thuê freelancer
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {(jobIds as bigint[]).map((jobId) => (
                                <ClientJobCard
                                    key={jobId.toString()}
                                    jobId={jobId}
                                    onViewDetail={setSelectedJob}
                                    getStateColor={getStateColor}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <CreateJobForm />

                <div className="card bg-blue-50 border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-900">💡 Hướng dẫn Client</h3>
                    <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                        <li>Tạo hợp đồng với mô tả chi tiết</li>
                        <li>Đặt cọc ETH vào smart contract</li>
                        <li>Chờ freelancer nhận việc</li>
                        <li>Duyệt kết quả khi hoàn thành</li>
                        <li>Tiền tự động chuyển cho freelancer</li>
                    </ol>
                </div>
            </div>

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    userRole="client"
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
    const bgColors: Record<string, string> = {
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        red: 'bg-red-50',
    };

    return (
        <div className={`${bgColors[color]} p-4 rounded-lg`}>
            <div className="flex items-center justify-between">
                <span className="text-2xl">{icon}</span>
                <span className="text-2xl font-bold">{value}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">{title}</div>
        </div>
    );
}

function ClientJobCard({
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

    const formatDeadline = (timestamp: bigint) => {
        return new Date(Number(timestamp) * 1000).toLocaleDateString('vi-VN');
    };

    const needsAction = job.state === 3; // Submitted - cần duyệt

    return (
        <div className={`card hover:shadow-lg transition-shadow ${needsAction ? 'border-l-4 border-l-orange-500' : ''}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    {needsAction && (
                        <span className="text-xs text-orange-600 font-medium">⚡ Cần duyệt kết quả</span>
                    )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(job.state)}`}>
                    {CONTRACT_STATES[job.state as keyof typeof CONTRACT_STATES]}
                </span>
            </div>

            <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>

            <div className="flex justify-between items-center text-sm">
                <div>
                    <span className="text-gray-500">Thanh toán:</span>
                    <span className="ml-2 font-medium text-green-600">{formatEther(job.payment)} ETH</span>
                </div>
                <div>
                    <span className="text-gray-500">Deadline:</span>
                    <span className="ml-2">{formatDeadline(job.deadline)}</span>
                </div>
            </div>

            <div className="mt-4">
                <button onClick={() => onViewDetail(job)} className="btn-primary text-sm w-full">
                    {needsAction ? '✅ Duyệt kết quả' : 'Xem chi tiết'}
                </button>
            </div>
        </div>
    );
}