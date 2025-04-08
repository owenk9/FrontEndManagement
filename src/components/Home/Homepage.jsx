import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, AlertCircle, Clock } from 'lucide-react'; // Icon từ lucide-react

export default function Home() {
    const { t } = useTranslation();

    // Dữ liệu mẫu (có thể thay bằng dữ liệu thực từ API)
    const [user] = useState({ fullName: 'Nguyen Van A' }); // Giả định người dùng đăng nhập
    const [stats] = useState({
        totalEquipments: 50,
        borrowingCount: 12,
        maintenanceCount: 5,
    });
    const [notifications] = useState([
        { id: 1, message: 'Laptop Dell - Return due today', type: 'warning', time: '2025-03-24 14:00' },
        { id: 2, message: 'Projector - Maintenance scheduled tomorrow', type: 'info', time: '2025-03-25 09:00' },
    ]);

    return (
        <div className="min-h-screen p-6 ml-64"> {/* ml-64 để tránh đè NavBar */}
            {/* Chào mừng */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {t('welcome')}, {user.fullName}!
                </h1>
                <p className="text-gray-600 mt-2">{t('homeDescription')}</p>
            </div>

            {/* Tổng quan nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">{t('totalEquipments')}</h2>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalEquipments}</p>
                    </div>
                    <BarChart2 className="text-blue-600" size={32} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">{t('borrowingCount')}</h2>
                        <p className="text-3xl font-bold text-gray-900">{stats.borrowingCount}</p>
                    </div>
                    <BarChart2 className="text-green-600" size={32} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">{t('maintenanceCount')}</h2>
                        <p className="text-3xl font-bold text-gray-900">{stats.maintenanceCount}</p>
                    </div>
                    <BarChart2 className="text-yellow-600" size={32} />
                </div>
            </div>

            {/* Thông báo gần đây */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('recentNotifications')}</h2>
                {notifications.length > 0 ? (
                    <ul className="space-y-4">
                        {notifications.map((notification) => (
                            <li key={notification.id} className="flex items-start space-x-3">
                                <AlertCircle
                                    className={notification.type === 'warning' ? 'text-red-500' : 'text-blue-500'}
                                    size={20}
                                />
                                <div>
                                    <p className="text-gray-800">{notification.message}</p>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <Clock size={14} className="mr-1" /> {notification.time}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">{t('noNotifications')}</p>
                )}
            </div>

            {/* Liên kết nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/equipments"
                    className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition text-center"
                >
                    <h3 className="text-lg font-semibold">{t('equipments')}</h3>
                    <p className="text-sm">{t('manageEquipments')}</p>
                </Link>
                <Link
                    to="/borrowing"
                    className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition text-center"
                >
                    <h3 className="text-lg font-semibold">{t('borrowing')}</h3>
                    <p className="text-sm">{t('manageBorrowing')}</p>
                </Link>
                <Link
                    to="/maintenance"
                    className="bg-yellow-600 text-white p-6 rounded-lg shadow-md hover:bg-yellow-700 transition text-center"
                >
                    <h3 className="text-lg font-semibold">{t('maintenance')}</h3>
                    <p className="text-sm">{t('manageMaintenance')}</p>
                </Link>
            </div>
        </div>
    );
}