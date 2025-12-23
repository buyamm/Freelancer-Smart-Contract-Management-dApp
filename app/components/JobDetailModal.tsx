'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_STATES } from '../config/contract';
import { formatEther } from 'viem';
import { uploadToIPFS, uploadJSONToIPFS } from '../utils/ipfs';
import ContactInfoDisplay from './ContactInfoDisplay';

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

interface JobDetailModalProps {
    job: Job;
    onClose: () => void;
    userRole: 'client' | 'freelancer';
    onSuccess?: () => void;
}

type SuccessType = 'accepted' | 'submitted' | 'approved' | 'canceled' | 'rejected' | 'extended' | 'removed' | 'autoApproved' | null;

export default function JobDetailModal({ job, onClose, userRole, onSuccess }: JobDetailModalProps) {
    const { address } = useAccount();
    const [cancelReason, setCancelReason] = useState('Canceled by client');
    const [successMessage, setSuccessMessage] = useState<SuccessType>(null);

    // File upload states
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [ipfsHash, setIpfsHash] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const isClient = address?.toLowerCase() === job.client.toLowerCase();
    const isFreelancer = address?.toLowerCase() === job.freelancer.toLowerCase();

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

    // Reject Work (Client từ chối kết quả)
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const canReject = isClient && job.state === 3 && Date.now() / 1000 <= Number(job.deadline);
    const { config: rejectConfig, refetch: refetchReject } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'rejectWork',
        args: [job.id, rejectReason || 'Cần làm lại'],
        enabled: canReject && rejectReason.length > 0,
    });
    const { write: rejectWork, data: rejectData } = useContractWrite(rejectConfig);
    const { isLoading: isRejecting, isSuccess: rejectSuccess } = useWaitForTransaction({ hash: rejectData?.hash });

    useEffect(() => {
        if (rejectReason && canReject) {
            refetchReject();
        }
    }, [rejectReason, canReject, refetchReject]);

    // Extend Deadline (Client gia hạn deadline)
    const [newDeadline, setNewDeadline] = useState('');
    const [showExtendForm, setShowExtendForm] = useState(false);
    const newDeadlineTimestamp = newDeadline ? Math.floor(new Date(newDeadline).getTime() / 1000) : 0;
    const canExtend = isClient && (job.state === 2 || job.state === 3) && newDeadlineTimestamp > Number(job.deadline);
    const { config: extendConfig, refetch: refetchExtend } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'extendDeadline',
        args: [job.id, BigInt(newDeadlineTimestamp)],
        enabled: canExtend,
    });
    const { write: extendDeadline, data: extendData } = useContractWrite(extendConfig);
    const { isLoading: isExtending, isSuccess: extendSuccess } = useWaitForTransaction({ hash: extendData?.hash });

    useEffect(() => {
        if (newDeadlineTimestamp && canExtend) {
            refetchExtend();
        }
    }, [newDeadlineTimestamp, canExtend, refetchExtend]);

    // Remove Freelancer (Client xóa freelancer)
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const canRemove = isClient && (job.state === 2 || job.state === 3);
    const { config: removeConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'removeFreelancer',
        args: [job.id],
        enabled: canRemove,
    });
    const { write: removeFreelancer, data: removeData } = useContractWrite(removeConfig);
    const { isLoading: isRemoving, isSuccess: removeSuccess } = useWaitForTransaction({ hash: removeData?.hash });

    // Auto Approve (Tự động duyệt sau 3 ngày)
    const autoApproveTime = Number(job.deadline) + (3 * 24 * 60 * 60); // deadline + 3 days
    const canAutoApprove = job.state === 3 && Date.now() / 1000 > autoApproveTime;
    const { config: autoApproveConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'autoApproveWork',
        args: [job.id],
        enabled: canAutoApprove,
    });
    const { write: autoApprove, data: autoApproveData } = useContractWrite(autoApproveConfig);
    const { isLoading: isAutoApproving, isSuccess: autoApproveSuccess } = useWaitForTransaction({ hash: autoApproveData?.hash });

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
        if (rejectSuccess) handleSuccess('rejected');
    }, [rejectSuccess, handleSuccess]);

    useEffect(() => {
        if (extendSuccess) handleSuccess('extended');
    }, [extendSuccess, handleSuccess]);

    useEffect(() => {
        if (removeSuccess) handleSuccess('removed');
    }, [removeSuccess, handleSuccess]);

    useEffect(() => {
        if (autoApproveSuccess) handleSuccess('autoApproved');
    }, [autoApproveSuccess, handleSuccess]);

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
            rejected: { icon: '🔄', title: 'Đã từ chối kết quả!', desc: 'Freelancer sẽ phải nộp lại kết quả mới.' },
            extended: { icon: '⏰', title: 'Đã gia hạn deadline!', desc: 'Deadline mới đã được cập nhật. Penalty đã reset về 0.' },
            removed: { icon: '🗑️', title: 'Đã xóa freelancer!', desc: 'Job đã quay về trạng thái Funded. Bạn có thể tìm freelancer mới.' },
            autoApproved: { icon: '✅', title: 'Đã tự động duyệt!', desc: 'Tiền đã được chuyển cho freelancer.' },
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
                            {job.penaltyAmount > 0 && (
                                <div className="text-xs text-red-600 mt-1">
                                    Penalty: -{formatEther(job.penaltyAmount)} ETH (10%)
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Deadline</div>
                            <div className="text-lg font-semibold">{formatDate(job.deadline)}</div>
                            {job.state === 3 && job.submittedAt > job.deadline && (
                                <div className="text-xs text-red-600 mt-1">
                                    ⚠️ Nộp muộn
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Penalty Warning */}
                    {job.penaltyAmount > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <span className="text-2xl mr-3">⚠️</span>
                                <div>
                                    <h4 className="font-semibold text-red-900 mb-1">Nộp muộn - Bị phạt 10%</h4>
                                    <p className="text-sm text-red-700">
                                        Freelancer nộp kết quả sau deadline nên bị phạt {formatEther(job.penaltyAmount)} ETH.
                                        {isFreelancer && ' Bạn sẽ chỉ nhận được ' + formatEther(job.payment - job.penaltyAmount) + ' ETH.'}
                                        {isClient && ' Bạn sẽ nhận lại ' + formatEther(job.penaltyAmount) + ' ETH khi duyệt.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                        </div>
                    </div>

                    {/* Contact Information */}
                    {isClient && !isZeroAddress(job.freelancer) && (
                        <ContactInfoDisplay
                            address={job.freelancer}
                            label="Thông tin liên lạc Freelancer"
                        />
                    )}

                    {isFreelancer && (
                        <ContactInfoDisplay
                            address={job.client}
                            label="Thông tin liên lạc Client"
                        />
                    )}

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
                        {job.rejectionCount > 0 && (
                            <div className="text-orange-600 font-medium">
                                ⚠️ Đã bị từ chối: {job.rejectionCount.toString()} lần
                            </div>
                        )}
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
                        <div className="space-y-3">
                            <button
                                onClick={() => approveWork?.()}
                                disabled={isApproving || !approveWork}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {isApproving ? '⏳ Đang duyệt...' : '✅ Duyệt và thanh toán'}
                            </button>

                            {/* Auto Approve Info */}
                            {!canAutoApprove && (
                                <div className="text-xs text-gray-500 text-center">
                                    💡 Nếu không duyệt, sau {Math.ceil((autoApproveTime - Date.now() / 1000) / 86400)} ngày sẽ tự động duyệt
                                </div>
                            )}
                        </div>
                    )}

                    {/* Client: Reject Work (chỉ trước deadline) */}
                    {job.state === 3 && isClient && canReject && (
                        <div className="space-y-3">
                            {!showRejectForm ? (
                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    className="bg-orange-600 text-white px-4 py-2 rounded-lg w-full hover:bg-orange-700"
                                >
                                    ❌ Từ chối kết quả
                                </button>
                            ) : (
                                <div className="space-y-3 bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <h4 className="font-semibold text-orange-900">Từ chối kết quả</h4>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Lý do từ chối (bắt buộc)..."
                                        className="input w-full"
                                        rows={3}
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => rejectWork?.()}
                                            disabled={isRejecting || !rejectWork || !rejectReason}
                                            className="btn-primary flex-1 disabled:opacity-50"
                                        >
                                            {isRejecting ? '⏳ Đang xử lý...' : 'Xác nhận từ chối'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowRejectForm(false);
                                                setRejectReason('');
                                            }}
                                            className="btn-secondary"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Anyone: Auto Approve (sau 3 ngày) */}
                    {job.state === 3 && canAutoApprove && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2">⏰ Đã quá thời hạn phản hồi</h4>
                            <p className="text-sm text-blue-700 mb-3">
                                Client đã không phản hồi sau 3 ngày. Bất kỳ ai cũng có thể kích hoạt tự động duyệt.
                            </p>
                            <button
                                onClick={() => autoApprove?.()}
                                disabled={isAutoApproving || !autoApprove}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {isAutoApproving ? '⏳ Đang xử lý...' : '✅ Tự động duyệt ngay'}
                            </button>
                        </div>
                    )}

                    {/* Client: Extend Deadline */}
                    {isClient && (job.state === 2 || job.state === 3) && (
                        <div className="space-y-3">
                            {!showExtendForm ? (
                                <button
                                    onClick={() => setShowExtendForm(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700"
                                >
                                    ⏰ Gia hạn deadline
                                </button>
                            ) : (
                                <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-900">Gia hạn deadline</h4>
                                    <input
                                        type="datetime-local"
                                        value={newDeadline}
                                        onChange={(e) => setNewDeadline(e.target.value)}
                                        min={new Date(Number(job.deadline) * 1000).toISOString().slice(0, 16)}
                                        className="input w-full"
                                    />
                                    <p className="text-xs text-blue-700">
                                        💡 Penalty sẽ được reset về 0 khi gia hạn
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => extendDeadline?.()}
                                            disabled={isExtending || !extendDeadline || !newDeadline}
                                            className="btn-primary flex-1 disabled:opacity-50"
                                        >
                                            {isExtending ? '⏳ Đang xử lý...' : 'Xác nhận gia hạn'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowExtendForm(false);
                                                setNewDeadline('');
                                            }}
                                            className="btn-secondary"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Client: Remove Freelancer */}
                    {isClient && (job.state === 2 || job.state === 3) && (
                        <div className="space-y-3">
                            {!showRemoveConfirm ? (
                                <button
                                    onClick={() => setShowRemoveConfirm(true)}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg w-full hover:bg-red-700"
                                >
                                    🗑️ Xóa freelancer
                                </button>
                            ) : (
                                <div className="space-y-3 bg-red-50 p-4 rounded-lg border border-red-200">
                                    <h4 className="font-semibold text-red-900">⚠️ Xác nhận xóa freelancer</h4>
                                    <p className="text-sm text-red-700">
                                        Job sẽ quay về trạng thái "Funded" và bạn có thể tìm freelancer mới.
                                        Tiền vẫn được giữ trong contract.
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => removeFreelancer?.()}
                                            disabled={isRemoving || !removeFreelancer}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg flex-1 hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {isRemoving ? '⏳ Đang xử lý...' : 'Xác nhận xóa'}
                                        </button>
                                        <button
                                            onClick={() => setShowRemoveConfirm(false)}
                                            className="btn-secondary"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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
                </div>
            </div>
        </div>
    );
}