'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_STATES } from '../config/contract';
import { formatEther } from 'viem';
import JobDetailModal from './JobDetailModal';
import UpdateContactInfo from './UpdateContactInfo';
import FreelancerRatingBadge from './FreelancerRatingBadge';

interface Job {
    id: bigint;
    client: string;
    freelancer: string;
    title: string;
    description: string;
    payment: bigint;
    deadline: bigint;
    state: number;
    ipfsHash: string;
    createdAt: bigint;
    submittedAt: bigint;
    rejectionCount: bigint;
    penaltyAmount: bigint;
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
        watch: true,
    });

    const { data: jobCounter, refetch: refetchJobCounter } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'jobCounter',
        watch: true,
    });

    const handleSuccess = useCallback(() => {
        refetchMyJobs();
        refetchJobCounter();
        setRefreshKey(prev => prev + 1);
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

    const myJobIdsList = (myJobIds as bigint[]) || [];
    const allJobIds = jobCounter ? Array.from({ length: Number(jobCounter) }, (_, i) => BigInt(i + 1)) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">👨‍💻 Dashboard Freelancer</h2>
                {address && <FreelancerRatingBadge address={address} />}
            </div>

            {/* Stats */}
            <FreelancerStats
                jobIds={myJobIdsList}
                totalAvailable={Number(jobCounter) || 0}
                refreshKey={refreshKey}
            />

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
                    💼 Việc của tôi ({myJobIdsList.length})
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
                            refreshKey={refreshKey}
                        />
                    ) : (
                        <MyJobsList
                            jobIds={myJobIdsList}
                            onViewDetail={setSelectedJob}
                            getStateColor={getStateColor}
                            refreshKey={refreshKey}
                        />
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <UpdateContactInfo />

                    <div className="card bg-green-50 border-green-200">
                        <h3 className="text-lg font-semibold mb-4 text-green-900">💡 Hướng dẫn Freelancer</h3>
                        <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                            <li>Cập nhật thông tin liên lạc</li>
                            <li>Duyệt việc đang tuyển phù hợp</li>
                            <li>Click "Nhận việc" để bắt đầu</li>
                            <li>Hoàn thành công việc ĐÚNG deadline</li>
                            <li>Upload kết quả lên IPFS</li>
                            <li>Nộp muộn sẽ bị phạt 10%</li>
                        </ol>
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

// Component tính stats
function FreelancerStats({ jobIds, totalAvailable, refreshKey }: { jobIds: bigint[]; totalAvailable: number; refreshKey: number }) {
    const [stats, setStats] = useState({ inProgress: 0, completed: 0, earnings: BigInt(0) });
    const [loadedJobs, setLoadedJobs] = useState<Map<string, Job>>(new Map());

    useEffect(() => {
        setLoadedJobs(new Map());
    }, [jobIds.length, refreshKey]);

    useEffect(() => {
        if (loadedJobs.size === jobIds.length && jobIds.length > 0) {
            let inProgress = 0, completed = 0, earnings = BigInt(0);
            const isZeroAddress = (addr: string) => addr === '0x0000000000000000000000000000000000000000';

            loadedJobs.forEach((job) => {
                // Bỏ qua job nếu freelancer đã bị xóa
                if (isZeroAddress(job.freelancer)) return;

                if (job.state === 2 || job.state === 3) inProgress++;
                else if (job.state === 4) {
                    completed++;
                    earnings += job.payment;
                }
            });

            setStats({ inProgress, completed, earnings });
        } else if (jobIds.length === 0) {
            setStats({ inProgress: 0, completed: 0, earnings: BigInt(0) });
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
                <StatCard title="Việc có sẵn" value={totalAvailable} icon="🔍" color="blue" />
                <StatCard title="Đang làm" value={stats.inProgress} icon="⚡" color="purple" />
                <StatCard title="Hoàn thành" value={stats.completed} icon="✅" color="green" />
                <StatCard
                    title="Thu nhập"
                    value={`${Number(formatEther(stats.earnings)).toFixed(3)} ETH`}
                    icon="💰"
                    color="yellow"
                    isText
                />
            </div>

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

function AvailableJobsList({
    jobIds,
    currentAddress,
    onViewDetail,
    refreshKey,
}: {
    jobIds: bigint[];
    currentAddress: string;
    onViewDetail: (job: Job) => void;
    refreshKey: number;
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
            <h3 className="text-lg font-semibold">🔍 Việc đang tuyển</h3>
            <div className="grid gap-4">
                {jobIds.map((jobId) => (
                    <AvailableJobCard
                        key={`available-${jobId.toString()}-${refreshKey}`}
                        jobId={jobId}
                        currentAddress={currentAddress}
                        onViewDetail={onViewDetail}
                    />
                ))}
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
        watch: true,
    }) as { data: Job | undefined; isLoading: boolean };

    if (isLoading) return null;
    if (!job) return null;
    if (job.state !== 1) return null;

    const isOwnJob = job.client.toLowerCase() === currentAddress.toLowerCase();
    if (isOwnJob) return null;

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
    refreshKey,
}: {
    jobIds: bigint[];
    onViewDetail: (job: Job) => void;
    getStateColor: (state: number) => string;
    refreshKey: number;
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
                        key={`myjob-${jobId.toString()}-${refreshKey}`}
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
        watch: true,
    }) as { data: Job | undefined };

    if (!job) return <div className="card animate-pulse h-32 bg-gray-200"></div>;

    // Không hiển thị nếu freelancer đã bị xóa (zero address)
    const isZeroAddress = (addr: string) => addr === '0x0000000000000000000000000000000000000000';
    if (isZeroAddress(job.freelancer)) {
        return null; // Không hiển thị job này
    }

    const needsAction = job.state === 2;
    const isCompleted = job.state === 4;

    return (
        <div className={`card hover:shadow-lg transition-shadow ${needsAction ? 'border-l-4 border-l-purple-500' :
            isCompleted ? 'border-l-4 border-l-green-500' : ''
            }`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    {needsAction && (
                        <span className="text-xs text-purple-600 font-medium">⚡ Cần nộp kết quả</span>
                    )}
                    {isCompleted && (
                        <span className="text-xs text-green-600 font-medium">✅ Đã hoàn thành - Đã nhận {formatEther(job.payment)} ETH</span>
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