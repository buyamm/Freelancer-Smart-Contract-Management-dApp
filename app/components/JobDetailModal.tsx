'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_STATES } from '../config/contract';
import { formatEther } from 'viem';
import { uploadToIPFS, uploadJSONToIPFS } from '../utils/ipfs';

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

interface JobDetailModalProps {
    job: Job;
    onClose: () => void;
    userRole: 'client' | 'freelancer' | 'arbiter';
    onSuccess?: () => void;
}

type SuccessType = 'accepted' | 'submitted' | 'approved' | 'canceled' | 'disputed' | 'resolved' | null;

export default function JobDetailModal({ job, onClose, userRole, onSuccess }: JobDetailModalProps) {
    const { address } = useAccount();
    const [cancelReason, setCancelReason] = useState('Canceled by client');
    const [clientPercentage, setClientPercentage] = useState(50);
    const [successMessage, setSuccessMessage] = useState<SuccessType>(null);

    // File upload states
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [ipfsHash, setIpfsHash] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const isClient = address?.toLowerCase() === job.client.toLowerCase();
    const isFreelancer = address?.toLowerCase() === job.freelancer.toLowerCase();
    const isArbiter = address?.toLowerCase() === job.arbiter.toLowerCase();

    // Handle success and close
    const handleSuccess = useCallback((type: SuccessType) => {
        setSuccessMessage(type);
        setTimeout(() => {
            onSuccess?.();
            onClose();
        }, 2000);
    }, [onClose, onSuccess]);

    // Accept Job
    const { config: acceptConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'acceptJob',
        args: [job.id],
        enabled: job.state === 1 && !isClient,
    });
    const { write: acceptJob, data: acceptData } = useContractWrite(acceptConfig);
    const { isLoading: isAccepting, isSuccess: acceptSuccess } = useWaitForTransaction({ hash: acceptData?.hash });

    // Submit Work - với watch để re-prepare khi ipfsHash thay đổi
    const canSubmit = job.state === 2 && isFreelancer && ipfsHash.length > 0;
    const { config: submitConfig, refetch: refetchSubmit } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'submitWork',
        args: [job.id, ipfsHash || 'placeholder'],
        enabled: canSubmit,
    });
    const { write: submitWork, data: submitData } = useContractWrite(submitConfig);
    const { isLoading: isSubmitting, isSuccess: submitSuccess } = useWaitForTransaction({ hash: submitData?.hash });

    // Re-prepare khi ipfsHash thay đổi
    useEffect(() => {
        if (ipfsHash && canSubmit) {
            refetchSubmit();
        }
    }, [ipfsHash, canSubmit, refetchSubmit]);

    // Approve Work
    const { config: approveConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'approveWork',
        args: [job.id],
        enabled: job.state === 3 && isClient,
    });
    const { write: approveWork, data: approveData } = useContractWrite(approveConfig);
    const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransaction({ hash: approveData?.hash });

    // Cancel Job
    const canCancel = isClient && (job.state === 1 || job.state === 2);
    const { config: cancelConfig, refetch: refetchCancel } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'cancelJob',
        args: [job.id, cancelReason],
        enabled: canCancel,
    });
    const { write: cancelJob, data: cancelData } = useContractWrite(cancelConfig);
    const { isLoading: isCanceling, isSuccess: cancelSuccess } = useWaitForTransaction({ hash: cancelData?.hash });

    // Re-prepare khi cancelReason thay đổi
    useEffect(() => {
        if (cancelReason && canCancel) {
            refetchCancel();
        }
    }, [cancelReason, canCancel, refetchCancel]);

    // Open Dispute
    const { config: disputeConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'openDispute',
        args: [job.id],
        enabled: (isClient || isFreelancer) && (job.state === 2 || job.state === 3),
    });
    const { write: openDispute, data: disputeData } = useContractWrite(disputeConfig);
    const { isLoading: isDisputing, isSuccess: disputeSuccess } = useWaitForTransaction({ hash: disputeData?.hash });

    // Resolve Dispute
    const canResolve = job.state === 6 && isArbiter;
    const { config: resolveConfig, refetch: refetchResolve } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'resolveDispute',
        args: [job.id, BigInt(clientPercentage)],
        enabled: canResolve,
    });
    const { write: resolveDispute, data: resolveData } = useContractWrite(resolveConfig);
    const { isLoading: isResolving, isSuccess: resolveSuccess } = useWaitForTransaction({ hash: resolveData?.hash });

    // Re-prepare khi clientPercentage thay đổi
    useEffect(() => {
        if (canResolve) {
            refetchResolve();
        }
    }, [clientPercentage, canResolve, refetchResolve]);

    // Watch for success
    useEffect(() => {
        if (acceptSuccess) handleSuccess('accepted');
    }, [acceptSuccess, handleSuccess]);

    useEffect(() => {
        if (submitSuccess) handleSuccess('submitted');
    }, [submitSuccess, handleSuccess]);

    useEffect(() => {
        if (approveSuccess) handleSuccess('approved');
    }, [approveSuccess, handleSuccess]);

    useEffect(() => {
        if (cancelSuccess) handleSuccess('canceled');
    }, [cancelSuccess, handleSuccess]);

    useEffect(() => {
        if (disputeSuccess) handleSuccess('disputed');
    }, [disputeSuccess, handleSuccess]);

    useEffect(() => {
        if (resolveSuccess) handleSuccess('resolved');
    }, [resolveSuccess, handleSuccess]);

    // File upload handler
    const handleFileUpload = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress('Đang chuẩn bị upload...');

        try {
            if (selectedFiles.length === 1) {
                setUploadProgress(`Đang upload ${selectedFiles[0].name}...`);
                const result = await uploadToIPFS(selectedFiles[0]);
                setIpfsHash(result.hash);
                setUploadProgress('✅ Upload thành công!');
            } else {
                setUploadProgress('Đang upload nhiều files...');
                const uploadedFiles = [];

                for (let i = 0; i < selectedFiles.length; i++) {
                    setUploadProgress(`Đang upload ${i + 1}/${selectedFiles.length}: ${selectedFiles[i].name}`);
                    const result = await uploadToIPFS(selectedFiles[i]);
                    uploadedFiles.push({
                        name: selectedFiles[i].name,
                        hash: result.hash,
                        url: result.url,
                    });
                }

                setUploadProgress('Đang tạo metadata...');
                const metadata = {
                    jobId: job.id.toString(),
                    submittedAt: new Date().toISOString(),
                    files: uploadedFiles,
                };
                const metaResult = await uploadJSONToIPFS(metadata);
                setIpfsHash(metaResult.hash);
                setUploadProgress('✅ Upload thành công!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadProgress('❌ Upload thất bại. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatDate = (timestamp: bigint) => {
        return new Date(Number(timestamp) * 1000).toLocaleString('vi-VN');
    };

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

    const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    const isZeroAddress = (addr: string) => addr === '0x0000000000000000000000000000000000000000';

    // Success overlay
    if (successMessage) {
        const messages: Record<string, { icon: string; title: string; desc: string }> = {
            accepted: { icon: '🎉', title: 'Nhận việc thành công!', desc: 'Bạn đã nhận việc này. Hãy hoàn thành đúng deadline!' },
            submitted: { icon: '📤', title: 'Nộp kết quả thành công!', desc: 'Kết quả đã được gửi. Chờ client duyệt.' },
            approved: { icon: '✅', title: 'Duyệt thành công!', desc: 'Tiền đã được chuyển cho freelancer.' },
            canceled: { icon: '❌', title: 'Đã hủy hợp đồng!', desc: 'Tiền đã được hoàn lại.' },
            disputed: { icon: '⚠️', title: 'Đã mở tranh chấp!', desc: 'Arbiter sẽ xem xét và giải quyết.' },
            resolved: { icon: '⚖️', title: 'Đã giải quyết tranh chấp!', desc: 'Tiền đã được phân chia theo quyết định.' },
        };
        const msg = messages[successMessage];

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-8 max-w-md w-full text-center animate-bounce-in">
                    <div className="text-6xl mb-4">{msg.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{msg.title}</h2>
                    <p className="text-gray-600 mb-4">{msg.desc}</p>
                    <div className="animate-pulse text-sm text-gray-500">Đang chuyển hướng...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStateColor(job.state)}`}>
                            {CONTRACT_STATES[job.state as keyof typeof CONTRACT_STATES]}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Mô tả công việc</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Thanh toán</div>
                            <div className="text-lg font-bold text-green-600">{formatEther(job.payment)} ETH</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Deadline</div>
                            <div className="text-lg font-semibold">{formatDate(job.deadline)}</div>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-700">Các bên tham gia</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-600">Client:</span>
                                <span className="font-mono">{shortenAddress(job.client)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-600">Freelancer:</span>
                                <span className="font-mono">
                                    {isZeroAddress(job.freelancer) ? 'Chưa có' : shortenAddress(job.freelancer)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-600">Arbiter:</span>
                                <span className="font-mono">{shortenAddress(job.arbiter)}</span>
                            </div>
                        </div>
                    </div>

                    {/* IPFS Hash if submitted */}
                    {job.ipfsHash && (
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Kết quả công việc (IPFS)</h3>
                            <a
                                href={`https://gateway.pinata.cloud/ipfs/${job.ipfsHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all"
                            >
                                {job.ipfsHash}
                            </a>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-sm text-gray-500 space-y-1">
                        <div>Tạo lúc: {formatDate(job.createdAt)}</div>
                        {job.submittedAt > 0 && <div>Nộp lúc: {formatDate(job.submittedAt)}</div>}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t bg-gray-50 space-y-4">
                    {/* Freelancer: Accept Job */}
                    {job.state === 1 && !isClient && (
                        <button
                            onClick={() => acceptJob?.()}
                            disabled={isAccepting || !acceptJob}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {isAccepting ? '⏳ Đang xử lý...' : '✅ Nhận việc này'}
                        </button>
                    )}

                    {/* Freelancer: Submit Work - File Upload */}
                    {job.state === 2 && isFreelancer && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-700">📤 Nộp kết quả công việc</h4>

                            {/* File Input */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <div className="text-4xl mb-2">📁</div>
                                    <p className="text-gray-600">Click để chọn file hoặc kéo thả vào đây</p>
                                    <p className="text-xs text-gray-400 mt-1">Hỗ trợ nhiều file</p>
                                </label>
                            </div>

                            {/* Selected Files */}
                            {selectedFiles.length > 0 && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800 mb-2">
                                        Đã chọn {selectedFiles.length} file:
                                    </p>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        {selectedFiles.map((file, idx) => (
                                            <li key={idx}>📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Upload Button */}
                            {selectedFiles.length > 0 && !ipfsHash && (
                                <button
                                    onClick={handleFileUpload}
                                    disabled={isUploading}
                                    className="btn-secondary w-full disabled:opacity-50"
                                >
                                    {isUploading ? uploadProgress : '☁️ Upload lên IPFS'}
                                </button>
                            )}

                            {/* Upload Progress */}
                            {uploadProgress && !ipfsHash && (
                                <p className="text-sm text-center text-gray-600">{uploadProgress}</p>
                            )}

                            {/* IPFS Hash Result */}
                            {ipfsHash && (
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-green-800 mb-1">✅ Đã upload thành công!</p>
                                    <p className="text-xs text-green-700 font-mono break-all">{ipfsHash}</p>
                                </div>
                            )}

                            {/* Or Manual Input */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-50 text-gray-500">hoặc nhập IPFS hash</span>
                                </div>
                            </div>

                            <input
                                type="text"
                                value={ipfsHash}
                                onChange={(e) => setIpfsHash(e.target.value)}
                                placeholder="QmXxx... hoặc bafyxxx..."
                                className="input w-full text-sm"
                            />

                            {/* Debug info */}
                            {ipfsHash && (
                                <div className="text-xs text-gray-400">
                                    Hash: {ipfsHash.length} chars | Can submit: {canSubmit ? 'Yes' : 'No'} | Write ready: {submitWork ? 'Yes' : 'No'}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={() => submitWork?.()}
                                disabled={isSubmitting || !submitWork || !ipfsHash}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {isSubmitting ? '⏳ Đang nộp...' : '📤 Nộp kết quả'}
                            </button>
                        </div>
                    )}

                    {/* Client: Approve Work */}
                    {job.state === 3 && isClient && (
                        <button
                            onClick={() => approveWork?.()}
                            disabled={isApproving || !approveWork}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {isApproving ? '⏳ Đang duyệt...' : '✅ Duyệt và thanh toán'}
                        </button>
                    )}

                    {/* Client: Cancel Job */}
                    {isClient && (job.state === 1 || job.state === 2) && (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Lý do hủy (tùy chọn)..."
                                className="input w-full"
                            />
                            <button
                                onClick={() => cancelJob?.()}
                                disabled={isCanceling || !cancelJob}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg w-full hover:bg-red-700 disabled:opacity-50"
                            >
                                {isCanceling ? '⏳ Đang hủy...' : '❌ Hủy hợp đồng'}
                            </button>
                        </div>
                    )}

                    {/* Open Dispute */}
                    {(isClient || isFreelancer) && (job.state === 2 || job.state === 3) && (
                        <button
                            onClick={() => openDispute?.()}
                            disabled={isDisputing || !openDispute}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg w-full hover:bg-yellow-700 disabled:opacity-50"
                        >
                            {isDisputing ? '⏳ Đang xử lý...' : '⚠️ Mở tranh chấp'}
                        </button>
                    )}

                    {/* Arbiter: Resolve Dispute */}
                    {job.state === 6 && isArbiter && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Phân chia cho Client: {clientPercentage}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={clientPercentage}
                                    onChange={(e) => setClientPercentage(Number(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Client: {clientPercentage}%</span>
                                    <span>Freelancer: {100 - clientPercentage}%</span>
                                </div>
                            </div>
                            <button
                                onClick={() => resolveDispute?.()}
                                disabled={isResolving || !resolveDispute}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {isResolving ? '⏳ Đang xử lý...' : '⚖️ Giải quyết tranh chấp'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}