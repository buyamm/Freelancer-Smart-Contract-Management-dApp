'use client';

import { useAccount } from 'wagmi';

export default function ArbiterDashboard() {
    const { address } = useAccount();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">⚖️ Dashboard Arbiter</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Địa chỉ của bạn:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </code>
                </div>
            </div>

            <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-4xl mb-4">🚧</div>
                <p className="text-yellow-800 font-medium">Chức năng Arbiter đang được phát triển</p>
                <p className="text-sm text-yellow-600 mt-2">
                    Tính năng giải quyết tranh chấp sẽ sớm được cập nhật
                </p>
            </div>

            <div className="card bg-purple-50 border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-900">⚖️ Vai trò Arbiter</h3>
                <p className="text-purple-800 mb-4 text-sm">
                    Arbiter là trọng tài được tin tưởng để giải quyết tranh chấp giữa client và freelancer.
                </p>
                <ul className="text-sm text-purple-700 space-y-2">
                    <li>• Xem xét kỹ bằng chứng từ cả hai bên</li>
                    <li>• Quyết định công bằng và khách quan</li>
                    <li>• Quyết định của arbiter là cuối cùng</li>
                </ul>
            </div>
        </div>
    );
}
