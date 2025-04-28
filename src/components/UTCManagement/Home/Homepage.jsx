import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Home() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const BASE_URL = 'http://localhost:9090';

    const [user, setUser] = useState({ fullName: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dữ liệu người dùng
    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError(t('noToken'));
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/user/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw new Error(t('unauthorized'));
                }
                throw new Error(t('fetchError'));
            }
            const data = await response.json();
            setUser(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [t, navigate]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Hiển thị loading
    if (loading) {
        return (
            <div className="min-h-screen p-6 ml-64 flex items-center justify-center">
                <p>{t('loading')}</p>
            </div>
        );
    }

    // Hiển thị lỗi
    if (error) {
        return (
            <div className="min-h-screen p-6 ml-64 flex items-center justify-center">
                <p className="text-red-600">{t('error')}: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 ml-64">
            {/* Chào mừng */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {t('welcome')}, {user.fullName || t('user')}!
                </h1>
                <p className="text-gray-600 mt-2">{t('homeDescription')}</p>
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