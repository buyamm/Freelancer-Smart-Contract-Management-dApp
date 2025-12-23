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

export default function ArbiterDashboard() {
    const { address } = useAccount();
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const { data: jobIds, refetch: refetchJobs } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getArbiterJobs',
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

    // Đếm số tranh chấp cần giải quyết
    const disputedJobs = jobIds ? (jobIds as bigint[]).filter(() => true) : []; // Sẽ filter sau khi có data

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">⚖️ Dashboard Arbiter</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Địa chỉ của bạn:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </code>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        title="Được chỉ định"
                        value={jobIds ? (jobIds as bigint[]).length : 0}
                        icon="📋"
                        color="purple"
                    />
                    <StatCard title="Cần giải quyết" value={0} icon="⚠️" color="red" />
                    <StatCard title="Đã giải quyết" value={0} icon="✅" color="green" />
                </div>

                {/* Pending Disputes */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600">🚨 Tranh chấp cần giải quyết</h3>

                    {!jobIds || (jobIds as bigint[]).length === 0 ? (
                        <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-4xl mb-4">✅</div>
                            <p className="text-green-700 font-medium">Không có tranh chấp nào cần giải quyết</p>
                            <p className="text-sm text-green-600 mt-2">
                                Bạn sẽ được thông báo khi có tranh chấp mới
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {(jobIds as bigint[]).map((jobId) => (
                                <ArbiterJobCard
                                    key={jobId.toString()}
                                    jobId={jobId}
                                    onViewDetail={setSelectedJob}
                                    getStateColor={getStateColor}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* All Assigned Jobs */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">📋 Tất cả hợp đồng được chỉ định</h3>

                    {!jobIds || (jobIds as bigint[]).length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <div className="text-4xl mb-4">📭</div>
                            <p className="text-gray-600">Chưa có hợp đồng nào chỉ định bạn làm arbiter</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Chia sẻ địa chỉ ví của bạn để được chọn làm arbiter
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {(jobIds as bigint[]).map((jobId) => (
                                <ArbiterJobCard
                                    key={jobId.toString()}
                                    jobId={jobId}
                                    onViewDetail={setSelectedJob}
                                    getStateColor={getStateColor}
                                    showAll
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <div className="card bg-purple-50 border-purple-200">
                    <h3 className="text-lg font-semibold mb-4 text-purple-900">⚖️ Vai trò Arbiter</h3>
                    <p className="text-purple-800 mb-4 text-sm">
                        Bạn là trọng tài được tin tưởng để giải quyết tranh chấp giữa client và freelancer.
                    </p>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-purple-700">
                            <span>Phí trọng tài:</span>
                            <span className="font-bold">5%</span>
                        </div>
                        <div className="p-3 bg-purple-100 rounded text-xs text-purple-700">
                            💡 Khi giải quyết tranh chấp, bạn quyết định phân chia tiền giữa client và freelancer.
                            Phí 5% sẽ được trừ trước khi phân chia.
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">📊 Thống kê Arbiter</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tổng case:</span>
                            <span className="font-medium">{jobIds ? (jobIds as bigint[]).length : 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Đã giải quyết:</span>
                            <span className="font-medium">0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tổng phí nhận:</span>
                            <span className="font-medium text-green-600">0 ETH</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Đánh giá:</span>
                            <span className="font-medium">⭐ N/A</span>
                        </div>
                    </div>
                </div>

                <div className="card bg-yellow-50 border-yellow-200">
                    <h3 className="text-lg font-semibold mb-4 text-yellow-900">⚠️ Lưu ý quan trọng</h3>
                    <ul className="text-sm text-yellow-800 space-y-2">
                        <li>• Xem xét kỹ bằng chứng từ cả hai bên</li>
                        <li>• Quyết định công bằng và khách quan</li>
                        <li>• Quyết định của bạn là cuối cùng</li>
                        <li>• Uy tín ảnh hưởng đến việc được chọn</li>
                    </ul>
                </div>
            </div>

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    userRole="arbiter"
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
    const bgColors: Record<string, string> = {
        purple: 'bg-purple-50',
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

function ArbiterJobCard({
    jobId,
    onViewDetail,
    getStateColor,
    showAll = false,
}: {
    jobId: bigint;
    onViewDetail: (job: Job) => void;
    getStateColor: (state: number) => string;
    showAll?: boolean;
}) {
    const { data: job } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getJob',
        args: [jobId],
    }) as { data: Job | undefined };

    if (!job) return <div className="card animate-pulse h-32 bg-gray-200"></div>;

    // Nếu không phải showAll, chỉ hiện disputed jobs
    if (!showAll && job.state !== 6) return null;

    const isDisputed = job.state === 6;

    return (
        <div className={`card hover:shadow-lg transition-shadow ${isDisputed ? 'border-l-4 border-l-red-500 bg-red-50' : ''}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    {isDisputed && (
                        <span className="text-xs text-red-600 font-medium">🚨 CẦN GIẢI QUYẾT NGAY</span>
                    )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(job.state)}`}>
                    {CONTRACT_STATES[job.state as keyof typeof CONTRACT_STATES]}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                    <span className="text-gray-500">Client:</span>
                    <span className="ml-1 font-mono text-xs">{job.client.slice(0, 8)}...</span>
                </div>
                <div>
                    <span className="text-gray-500">Freelancer:</span>
                    <span className="ml-1 font-mono text-xs">{job.freelancer.slice(0, 8)}...</span>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm mb-4">
                <div>
                    <span className="text-gray-500">Giá trị:</span>
                    <span className="ml-2 font-medium text-green-600">{formatEther(job.payment)} ETH</span>
                </div>
                <div>
                    <span className="text-gray-500">Phí của bạn:</span>
                    <span className="ml-2 font-medium text-purple-600">
                        {(Number(formatEther(job.payment)) * 0.05).toFixed(4)} ETH
                    </span>
                </div>
            </div>

            <button
                onClick={() => onViewDetail(job)}
                className={`w-full text-sm px-4 py-2 rounded-lg ${isDisputed
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'btn-primary'
                    }`}
            >
                {isDisputed ? '⚖️ Giải quyết tranh chấp' : 'Xem chi tiết'}
            </button>
        </div>
    );
}