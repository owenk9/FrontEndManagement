import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {useAuth} from "../../Auth/AuthContext.jsx";

export default function Home() {
    const { t } = useTranslation();
    const {fetchWithAuth} = useAuth();
    const navigate = useNavigate();
    const BASE_URL = 'http://localhost:9090';

    const [user, setUser] = useState({ fullName: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // Hàm làm mới token
    const refreshToken = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            setError(t('noRefreshToken'));
            setLoading(false);
            navigate('/login');
            return false;
        }

        try {
            const response = await fetchWithAuth(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || t('refreshTokenFailed'));
            }
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken || localStorage.getItem('refreshToken'));
            return true;
        } catch (err) {
            console.error('Refresh token error:', err);
            setError(err.message || t('refreshTokenFailed'));
            setLoading(false);
            navigate('/login');
            return false;
        }
    }, [t, navigate]);

    // Fetch dữ liệu người dùng
    const fetchUser = useCallback(async () => {
        let accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError(t('noToken'));
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetchWithAuth(`${BASE_URL}/user/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        accessToken = localStorage.getItem('accessToken');
                        const retryResponse = await fetchWithAuth(`${BASE_URL}/user/me`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${accessToken}`,
                            },
                        });
                        if (!retryResponse.ok) {
                            throw new Error(t('fetchErrorAfterRefresh'));
                        }
                        const data = await retryResponse.json();
                        setUser(data);
                        setError(null);
                    } else {
                        throw new Error(t('unauthorized'));
                    }
                } else {
                    throw new Error(t('fetchError'));
                }
            }
            const data = await response.json();
            setUser(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            setLoading(false);
            if (err.message.includes('unauthorized')) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [t, navigate, refreshToken]);

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