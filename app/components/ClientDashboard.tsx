'use client';

import { useState, useCallback, useEffect } from 'react';
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
        watch: true,
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

    const jobIdsList = (jobIds as bigint[]) || [];

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">💼 Dashboard Client</h2>
                    <span className="text-sm text-gray-500">
                        {jobIdsList.length} hợp đồng
                    </span>
                </div>

                {/* Stats - Calculated from jobs */}
                <ClientStats jobIds={jobIdsList} refreshKey={refreshKey} />

                {/* Job List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">📋 Hợp đồng của bạn</h3>

                    {jobIdsList.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="text-gray-600">Bạn chưa tạo hợp đồng nào</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Tạo hợp đồng mới để bắt đầu thuê freelancer
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {jobIdsList.map((jobId) => (
                                <ClientJobCard
                                    key={`job-${jobId.toString()}-${refreshKey}`}
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

// Component tính stats từ jobs
function ClientStats({ jobIds, refreshKey }: { jobIds: bigint[]; refreshKey: number }) {
    const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, totalSpent: BigInt(0) });
    const [loadedJobs, setLoadedJobs] = useState<Map<string, Job>>(new Map());

    // Reset khi jobIds thay đổi
    useEffect(() => {
        setLoadedJobs(new Map());
    }, [jobIds.length, refreshKey]);

    // Tính stats khi có đủ jobs
    useEffect(() => {
        if (loadedJobs.size === jobIds.length && jobIds.length > 0) {
            let pending = 0, inProgress = 0, completed = 0, totalSpent = BigInt(0);

            loadedJobs.forEach((job) => {
                if (job.state === 1) pending++;
                else if (job.state === 2 || job.state === 3) inProgress++;
                else if (job.state === 4) {
                    completed++;
                    totalSpent += job.payment;
                }
            });

            setStats({ pending, inProgress, completed, totalSpent });
        }
    }, [loadedJobs, jobIds.length]);

    const handleJobLoaded = useCallback((jobId: string, job: Job) => {
        setLoadedJobs(prev => {
            const newMap = new Map(prev);
            newMap.set(jobId, job);
            return newMap;
        });
    }, []);

    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <StatCard title="Đang chờ" value={stats.pending} icon="⏳" color="blue" />
                <StatCard title="Đang làm" value={stats.inProgress} icon="⚡" color="purple" />
                <StatCard title="Hoàn thành" value={stats.completed} icon="✅" color="green" />
                <StatCard
                    title="Đã chi"
                    value={`${Number(formatEther(stats.totalSpent)).toFixed(3)} ETH`}
                    icon="💸"
                    color="yellow"
                    isText
                />
            </div>

            {/* Hidden job fetchers */}
            <div className="hidden">
                {jobIds.map((jobId) => (
                    <JobStatsFetcher
                        key={`stats-${jobId.toString()}-${refreshKey}`}
                        jobId={jobId}
                        onJobLoaded={handleJobLoaded}
                    />
                ))}
            </div>
        </>
    );
}

function JobStatsFetcher({ jobId, onJobLoaded }: { jobId: bigint; onJobLoaded: (id: string, job: Job) => void }) {
    const { data: job } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getJob',
        args: [jobId],
        watch: true,
    }) as { data: Job | undefined };

    useEffect(() => {
        if (job) {
            onJobLoaded(jobId.toString(), job);
        }
    }, [job, jobId, onJobLoaded]);

    return null;
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
        watch: true,
    }) as { data: Job | undefined };

    if (!job) return <div className="card animate-pulse h-32 bg-gray-200"></div>;

    const formatDeadline = (timestamp: bigint) => {
        return new Date(Number(timestamp) * 1000).toLocaleDateString('vi-VN');
    };

    const needsAction = job.state === 3;
    const isCompleted = job.state === 4;

    return (
        <div className={`card hover:shadow-lg transition-shadow ${needsAction ? 'border-l-4 border-l-orange-500' :
                isCompleted ? 'border-l-4 border-l-green-500' : ''
            }`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    {needsAction && (
                        <span className="text-xs text-orange-600 font-medium">⚡ Cần duyệt kết quả</span>
                    )}
                    {isCompleted && (
                        <span className="text-xs text-green-600 font-medium">✅ Đã hoàn thành - Đã thanh toán {formatEther(job.payment)} ETH</span>
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