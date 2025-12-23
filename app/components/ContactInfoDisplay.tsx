'use client';

import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

interface ContactInfo {
    name: string;
    email: string;
    phone: string;
    chatLink: string;
}

interface ContactInfoDisplayProps {
    address: string;
    label: string;
}

export default function ContactInfoDisplay({ address, label }: ContactInfoDisplayProps) {
    const { data: contactInfo } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getContactInfo',
        args: [address as `0x${string}`],
        enabled: !!address && address !== '0x0000000000000000000000000000000000000000',
    }) as { data: ContactInfo | undefined };

    if (!contactInfo || (!contactInfo.name && !contactInfo.email && !contactInfo.phone && !contactInfo.chatLink)) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">📞 {label}</h4>
                <p className="text-sm text-gray-500">Chưa cập nhật thông tin liên lạc</p>
            </div>
        );
    }

    return (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">📞 {label}</h4>
            <div className="space-y-2 text-sm">
                {contactInfo.name && (
                    <div className="flex items-start">
                        <span className="text-gray-600 w-20">👤 Tên:</span>
                        <span className="font-medium text-gray-900">{contactInfo.name}</span>
                    </div>
                )}
                {contactInfo.email && (
                    <div className="flex items-start">
                        <span className="text-gray-600 w-20">📧 Email:</span>
                        <a
                            href={`mailto:${contactInfo.email}`}
                            className="font-medium text-blue-600 hover:underline"
                        >
                            {contactInfo.email}
                        </a>
                    </div>
                )}
                {contactInfo.phone && (
                    <div className="flex items-start">
                        <span className="text-gray-600 w-20">📱 Phone:</span>
                        <a
                            href={`tel:${contactInfo.phone}`}
                            className="font-medium text-blue-600 hover:underline"
                        >
                            {contactInfo.phone}
                        </a>
                    </div>
                )}
                {contactInfo.chatLink && (
                    <div className="flex items-start">
                        <span className="text-gray-600 w-20">💬 Chat:</span>
                        <a
                            href={contactInfo.chatLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline break-all"
                        >
                            {contactInfo.chatLink}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
