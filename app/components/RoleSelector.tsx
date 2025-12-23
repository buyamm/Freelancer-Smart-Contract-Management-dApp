'use client';

import { useAccount } from 'wagmi';

export type UserRole = 'client' | 'freelancer' | null;

interface RoleSelectorProps {
    onRoleSelect: (role: UserRole) => void;
    currentRole: UserRole;
}

// Lưu role vào localStorage theo address
const ROLE_STORAGE_KEY = 'freelancer_dapp_roles';

export function getRoleFromStorage(address: string): UserRole {
    if (typeof window === 'undefined') return null;
    const roles = JSON.parse(localStorage.getItem(ROLE_STORAGE_KEY) || '{}');
    return roles[address.toLowerCase()] || null;
}

export function saveRoleToStorage(address: string, role: UserRole) {
    if (typeof window === 'undefined') return;
    const roles = JSON.parse(localStorage.getItem(ROLE_STORAGE_KEY) || '{}');
    roles[address.toLowerCase()] = role;
    localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(roles));
}

export default function RoleSelector({ onRoleSelect, currentRole }: RoleSelectorProps) {
    const { address } = useAccount();

    const roles = [
        {
            id: 'client' as const,
            title: 'Client',
            icon: '💼',
            description: 'Tôi muốn thuê freelancer làm việc',
            features: [
                'Đăng công việc và đặt cọc ETH',
                'Chọn freelancer phù hợp',
                'Duyệt và thanh toán kết quả',
                'Liên lạc trực tiếp với freelancer',
            ],
            color: 'blue',
        },
        {
            id: 'freelancer' as const,
            title: 'Freelancer',
            icon: '👨‍💻',
            description: 'Tôi muốn nhận việc và kiếm tiền',
            features: [
                'Xem và nhận công việc phù hợp',
                'Nộp kết quả qua IPFS',
                'Nhận thanh toán tự động',
                'Liên lạc trực tiếp với client',
            ],
            color: 'green',
        },
    ];

    const handleSelectRole = (role: UserRole) => {
        if (address && role) {
            saveRoleToStorage(address, role);
        }
        onRoleSelect(role);
    };

    const getColorClasses = (color: string, isSelected: boolean) => {
        const colors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
            blue: {
                bg: isSelected ? 'bg-blue-50' : 'bg-white',
                border: isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200',
                text: 'text-blue-600',
                hover: 'hover:border-blue-300',
            },
            green: {
                bg: isSelected ? 'bg-green-50' : 'bg-white',
                border: isSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200',
                text: 'text-green-600',
                hover: 'hover:border-green-300',
            },
            purple: {
                bg: isSelected ? 'bg-purple-50' : 'bg-white',
                border: isSelected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200',
                text: 'text-purple-600',
                hover: 'hover:border-purple-300',
            },
        };
        return colors[color];
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn vai trò của bạn</h2>
                <p className="text-gray-600">
                    Mỗi địa chỉ ví chỉ có thể đăng ký một vai trò. Chọn vai trò phù hợp với bạn.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">{roles.map((role) => {
                const isSelected = currentRole === role.id;
                const colors = getColorClasses(role.color, isSelected);

                return (
                    <div
                        key={role.id}
                        onClick={() => handleSelectRole(role.id)}
                        className={`
                                ${colors.bg} ${colors.border} ${colors.hover}
                                border-2 rounded-xl p-6 cursor-pointer transition-all
                                transform hover:scale-105 hover:shadow-lg
                            `}
                    >
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-3">{role.icon}</div>
                            <h3 className={`text-xl font-bold ${colors.text}`}>{role.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{role.description}</p>
                        </div>

                        <ul className="space-y-2 text-sm">
                            {role.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start">
                                    <span className={`mr-2 ${colors.text}`}>✓</span>
                                    <span className="text-gray-700">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {isSelected && (
                            <div className={`mt-4 text-center ${colors.text} font-semibold`}>
                                ✅ Đã chọn
                            </div>
                        )}
                    </div>
                );
            })}
            </div>

            {currentRole && (
                <div className="mt-8 text-center">
                    <button
                        onClick={() => handleSelectRole(null)}
                        className="text-gray-500 hover:text-gray-700 text-sm underline"
                    >
                        Đổi vai trò khác
                    </button>
                </div>
            )}
        </div>
    );
}